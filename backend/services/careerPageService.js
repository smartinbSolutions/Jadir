const asyncHandler = require("express-async-handler");
const fs = require("fs");
const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const ApiError = require("../utils/apiError");
const buildSlug = require("../utils/buildSlug");
const CareerModel = require("../models/careerPageModel");
const CareerTemplateModel = require("../models/careerTemplateModel");
const CareerApplicationFormModel = require("../models/careerApplicationFormModel");
const CareerApplicationSubmissionModel = require("../models/careerApplicationSubmissionModel");
const {
  uploadSingleImage,
  uploadAnyFile,
} = require("../middlewares/uploadingImage");
const safeParseJSON = require("../utils/safeParseJson");

exports.uploadCareerImage = uploadSingleImage("image");
exports.uploadApplicationFiles = uploadAnyFile();

exports.resizeCareerImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  const filename = `career-${uuidv4()}-${Date.now()}.webp`;
  await fs.promises.mkdir("uploads/careers", { recursive: true });

  await sharp(req.file.buffer)
    .toFormat("webp")
    .webp({ quality: 75 })
    .toFile(`uploads/careers/${filename}`);

  req.body.image = filename;
  next();
});

const parseCareerBody = (body) => {
  delete body.applicationForm;

  if (body.title !== undefined) {
    body.title = safeParseJSON(body.title, "title");
  }

  if (body.position !== undefined) {
    body.position = safeParseJSON(body.position, "position");
  }

  if (body.location !== undefined) {
    body.location = safeParseJSON(body.location, "location");
  }

  if (body.description !== undefined) {
    body.description = safeParseJSON(body.description, "description");
  }

  if (body.endDate === "") {
    body.endDate = null;
  }

  if (body.status && !["draft", "published"].includes(body.status)) {
    delete body.status;
  }

  return body;
};

const createUniqueCareerSlug = async (source, excludeId) => {
  const baseSlug = buildSlug(source) || `career-${Date.now()}`;
  let slug = baseSlug;
  let counter = 2;

  while (
    await CareerModel.exists({
      slug,
      ...(excludeId ? { _id: { $ne: excludeId } } : {}),
    })
  ) {
    slug = `${baseSlug}-${counter}`;
    counter += 1;
  }

  return slug;
};

const ensureCareerSlugs = async (careers) =>
  Promise.all(
    careers.map(async (career) => {
      if (career.slug) return career;

      career.slug = await createUniqueCareerSlug(career.title, career._id);
      await career.save();
      return career;
    }),
  );

const fieldTypesWithOptions = ["radio", "checkbox", "select"];

const normalizeMultilingualValue = (value = {}) => {
  if (typeof value === "string") {
    return { en: value, ar: value, tr: value };
  }

  return {
    en: String(value?.en || "").trim(),
    ar: String(value?.ar || "").trim(),
    tr: String(value?.tr || "").trim(),
  };
};

const getFirstLocalizedValue = (value = {}) => {
  if (typeof value === "string") return value;
  return value?.en || value?.ar || value?.tr || "";
};

const normalizeFieldName = (label = "", fallback = "") => {
  const normalized = String(label)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

  return normalized || fallback;
};

const normalizeApplicationForm = (payload) => {
  if (payload === undefined) return null;

  const parsed =
    typeof payload === "string"
      ? safeParseJSON(payload, "applicationForm")
      : payload;

  const fields = Array.isArray(parsed?.fields) ? parsed.fields : [];

  return {
    fields: fields
      .map((field, index) => {
        const type = field?.type || "text";
        const label = normalizeMultilingualValue(field?.label);
        const placeholder = normalizeMultilingualValue(field?.placeholder);
        const fallbackLabel = getFirstLocalizedValue(label);
        const name = normalizeFieldName(
          field?.name || fallbackLabel,
          `field_${index + 1}`,
        );

        if (!fallbackLabel) return null;

        return {
          _id: field?._id,
          label,
          name,
          type,
          placeholder,
          required: Boolean(field?.required),
          order: Number.isFinite(Number(field?.order))
            ? Number(field.order)
            : index,
          options: fieldTypesWithOptions.includes(type)
            ? (field?.options || [])
                .map((option) => ({
                  label: normalizeMultilingualValue(option?.label),
                  value: String(
                    option?.value ||
                      getFirstLocalizedValue(
                        normalizeMultilingualValue(option?.label),
                      ),
                  ).trim(),
                }))
                .filter(
                  (option) =>
                    getFirstLocalizedValue(option.label) && option.value,
                )
            : [],
        };
      })
      .filter(Boolean)
      .sort((a, b) => a.order - b.order),
  };
};

const upsertApplicationForm = async (careerId, payload) => {
  const applicationForm = normalizeApplicationForm(payload);

  if (!applicationForm) return null;

  return CareerApplicationFormModel.findOneAndUpdate(
    { career: careerId },
    { ...applicationForm, career: careerId },
    { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true },
  );
};

const attachApplicationForms = async (careers) => {
  const ids = careers.map((career) => career._id);
  const forms = await CareerApplicationFormModel.find({
    career: { $in: ids },
  }).lean();
  const formByCareer = new Map(
    forms.map((form) => [String(form.career), form]),
  );

  return careers.map((career) => {
    const plainCareer = career.toObject ? career.toObject() : career;
    return {
      ...plainCareer,
      applicationForm: formByCareer.get(String(plainCareer._id)) || null,
    };
  });
};

const getCareerWithForm = async (careerIdOrSlug) => {
  const query = mongoose.Types.ObjectId.isValid(careerIdOrSlug)
    ? { _id: careerIdOrSlug }
    : { slug: careerIdOrSlug };

  const career = await CareerModel.findOne(query);

  if (!career) return null;

  const applicationForm = await CareerApplicationFormModel.findOne({
    career: career._id,
  }).lean();

  return {
    ...career.toObject(),
    applicationForm,
  };
};

const parseApplicationFilters = (filters) => {
  if (!filters) return [];

  const parsed =
    typeof filters === "string" ? safeParseJSON(filters, "filters") : filters;

  if (!Array.isArray(parsed)) return [];

  return parsed.filter((filter) => filter?.field && filter?.type);
};

const isEmptyFilterValue = (value) =>
  value === undefined ||
  value === null ||
  value === "" ||
  (Array.isArray(value) && value.length === 0);

const normalizeAnswerValue = (value) => {
  if (Array.isArray(value)) return value.map((item) => String(item));
  if (value === undefined || value === null) return "";
  return String(value);
};

const answerMatchesFilter = (answer, filter) => {
  if (!answer) return false;

  if (filter.type === "file") {
    if (filter.hasFile === "missing" || filter.hasFile === false) {
      return !answer.files?.length;
    }

    return Boolean(answer.files?.length);
  }

  if (
    isEmptyFilterValue(filter.value) &&
    isEmptyFilterValue(filter.min) &&
    isEmptyFilterValue(filter.max) &&
    isEmptyFilterValue(filter.from) &&
    isEmptyFilterValue(filter.to)
  ) {
    return true;
  }

  if (["number"].includes(filter.type)) {
    const numberValue = Number(answer.value);
    if (!Number.isFinite(numberValue)) return false;

    if (!isEmptyFilterValue(filter.min) && numberValue < Number(filter.min)) {
      return false;
    }

    if (!isEmptyFilterValue(filter.max) && numberValue > Number(filter.max)) {
      return false;
    }

    return true;
  }

  if (["date"].includes(filter.type)) {
    const answerDate = answer.value ? new Date(answer.value).getTime() : NaN;
    if (!Number.isFinite(answerDate)) return false;

    if (
      !isEmptyFilterValue(filter.from) &&
      answerDate < new Date(filter.from).getTime()
    ) {
      return false;
    }

    if (
      !isEmptyFilterValue(filter.to) &&
      answerDate > new Date(filter.to).getTime()
    ) {
      return false;
    }

    return true;
  }

  const answerValue = normalizeAnswerValue(answer.value);

  if (["radio", "select"].includes(filter.type)) {
    return answerValue === String(filter.value);
  }

  if (filter.type === "checkbox") {
    const selectedValues = Array.isArray(answerValue)
      ? answerValue
      : [answerValue];
    const filterValues = Array.isArray(filter.value)
      ? filter.value
      : [filter.value];

    return filterValues.every((value) =>
      selectedValues.includes(String(value)),
    );
  }

  return String(answerValue)
    .toLowerCase()
    .includes(String(filter.value).toLowerCase());
};

const applicationMatchesFilters = (application, filters) =>
  filters.every((filter) => {
    const answer = application.answers?.find(
      (item) => String(item.field) === String(filter.field),
    );

    return answerMatchesFilter(answer, filter);
  });

const getFilteredApplications = async ({
  careerId,
  status,
  filters,
  page = 1,
  limit = 20,
  paginate = true,
}) => {
  const query = {};

  if (careerId) query.career = careerId;
  if (status) query.status = status;

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;
  const parsedFilters = parseApplicationFilters(filters);

  if (parsedFilters.length || !paginate) {
    const applications = await CareerApplicationSubmissionModel.find(query)
      .populate("career", "title location endDate")
      .sort({ createdAt: -1 });
    const filteredApplications = parsedFilters.length
      ? applications.filter((application) =>
          applicationMatchesFilters(application, parsedFilters),
        )
      : applications;

    return {
      applications: paginate
        ? filteredApplications.slice(skip, skip + limitNum)
        : filteredApplications,
      total: filteredApplications.length,
      pageNum,
      limitNum,
    };
  }

  const [applications, total] = await Promise.all([
    CareerApplicationSubmissionModel.find(query)
      .populate("career", "title location endDate")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum),
    CareerApplicationSubmissionModel.countDocuments(query),
  ]);

  return { applications, total, pageNum, limitNum };
};

const escapeXmlValue = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const getLocalizedValue = (value = {}) => {
  if (typeof value === "string") return value;
  return value?.en || value?.ar || value?.tr || "";
};

const getPublicFileUrl = (req, filePath = "") => {
  if (!filePath) return "";

  const baseUrl =
    process.env.PUBLIC_BASE_URL || `${req.protocol}://${req.get("host")}`;
  return `${baseUrl.replace(/\/$/, "")}/${String(filePath).replace(/^\/+/, "")}`;
};

const buildApplicationsExcel = (applications, req) => {
  const answerColumns = [];
  const answerColumnMap = new Map();

  applications.forEach((application) => {
    application.answers?.forEach((answer) => {
      const key = String(answer.field);
      if (!answerColumnMap.has(key)) {
        const label = getLocalizedValue(answer.label) || key;
        answerColumnMap.set(key, label);
        answerColumns.push({ key, label });
      }
    });
  });

  const headers = [
    "Application ID",
    "Career",
    "Status",
    "Submitted At",
    ...answerColumns.map((column) => column.label),
  ];

  const rows = applications.map((application) => {
    const answersByField = new Map(
      (application.answers || []).map((answer) => [
        String(answer.field),
        answer,
      ]),
    );

    return [
      application._id,
      getLocalizedValue(application.career?.title),
      application.status,
      application.createdAt ? application.createdAt.toISOString() : "",
      ...answerColumns.map((column) => {
        const answer = answersByField.get(column.key);
        if (!answer) return "";
        if (answer.type === "file") {
          return (answer.files || [])
            .map((file) => getPublicFileUrl(req, file.path))
            .join("\n");
        }
        return Array.isArray(answer.value)
          ? answer.value.join(", ")
          : answer.value;
      }),
    ];
  });

  const worksheetRows = [headers, ...rows]
    .map(
      (row) =>
        `<Row>${row
          .map(
            (cell) =>
              `<Cell><Data ss:Type="String">${escapeXmlValue(cell)}</Data></Cell>`,
          )
          .join("")}</Row>`,
    )
    .join("");

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Worksheet ss:Name="Applications">
  <Table>${worksheetRows}</Table>
 </Worksheet>
</Workbook>`;
};

exports.getCareers = asyncHandler(async (req, res) => {
  const { keyword, page = 1, limit = 10, sort = "-createdAt" } = req.query;
  const query = {};

  if (keyword?.trim()) {
    const safeKeyword = keyword.trim();
    query.$or = [
      { "title.ar": { $regex: safeKeyword, $options: "i" } },
      { "title.en": { $regex: safeKeyword, $options: "i" } },
      { "title.tr": { $regex: safeKeyword, $options: "i" } },
      { "position.ar": { $regex: safeKeyword, $options: "i" } },
      { "position.en": { $regex: safeKeyword, $options: "i" } },
      { "position.tr": { $regex: safeKeyword, $options: "i" } },
      { "location.ar": { $regex: safeKeyword, $options: "i" } },
      { "location.en": { $regex: safeKeyword, $options: "i" } },
      { "location.tr": { $regex: safeKeyword, $options: "i" } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [careers, total] = await Promise.all([
    CareerModel.find(query).sort(sort).skip(skip).limit(limitNum),
    CareerModel.countDocuments(query),
  ]);
  const careersWithForms = await attachApplicationForms(
    await ensureCareerSlugs(careers),
  );

  res.status(200).json({
    status: true,
    data: careersWithForms,
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      itemsPerPage: limitNum,
    },
  });
});

exports.getPublicCareers = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const careers = await CareerModel.find({
    status: "published",
    $or: [{ endDate: null }, { endDate: { $gte: today } }],
  }).sort({ endDate: 1, createdAt: -1 });
  const careersWithForms = await attachApplicationForms(
    await ensureCareerSlugs(careers),
  );

  res.status(200).json({
    status: true,
    data: careersWithForms,
  });
});

exports.getOneCareer = asyncHandler(async (req, res, next) => {
  const career = await getCareerWithForm(req.params.id);

  if (!career) {
    return next(new ApiError("Career job not found", 404));
  }

  res.status(200).json({
    status: true,
    data: career,
  });
});

exports.getCareerStatistics = asyncHandler(async (req, res) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const [
    totalCareers,
    publishedCareers,
    draftCareers,
    openCareers,
    expiredCareers,
    totalApplications,
    applicationStatuses,
  ] = await Promise.all([
    CareerModel.countDocuments(),
    CareerModel.countDocuments({ status: "published" }),
    CareerModel.countDocuments({ status: "draft" }),
    CareerModel.countDocuments({
      status: "published",
      $or: [{ endDate: null }, { endDate: { $gte: today } }],
    }),
    CareerModel.countDocuments({
      status: "published",
      endDate: { $ne: null, $lt: today },
    }),
    CareerApplicationSubmissionModel.countDocuments(),
    CareerApplicationSubmissionModel.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  const applicationsByStatus = applicationStatuses.reduce((acc, item) => {
    acc[item._id] = item.count;
    return acc;
  }, {});

  res.status(200).json({
    status: true,
    data: {
      totalCareers,
      publishedCareers,
      draftCareers,
      openCareers,
      expiredCareers,
      totalApplications,
      applicationsByStatus,
    },
  });
});

exports.createCareer = asyncHandler(async (req, res) => {
  const applicationFormPayload = req.body.applicationForm;
  const careerData = parseCareerBody(req.body);
  careerData.slug = await createUniqueCareerSlug(careerData.title);
  const career = await CareerModel.create(careerData);
  const applicationForm = await upsertApplicationForm(
    career._id,
    applicationFormPayload,
  );

  res.status(201).json({
    status: true,
    message: "Career job created successfully",
    data: { ...career.toObject(), applicationForm },
  });
});

exports.updateCareer = asyncHandler(async (req, res, next) => {
  const applicationFormPayload = req.body.applicationForm;
  const careerData = parseCareerBody(req.body);
  if (careerData.title) {
    careerData.slug = await createUniqueCareerSlug(
      careerData.title,
      req.params.id,
    );
  }
  const career = await CareerModel.findByIdAndUpdate(
    req.params.id,
    careerData,
    { new: true, runValidators: true },
  );

  if (!career) {
    return next(new ApiError("Career job not found", 404));
  }

  const applicationForm = await upsertApplicationForm(
    career._id,
    applicationFormPayload,
  );

  res.status(200).json({
    status: true,
    message: "Career job updated successfully",
    data: { ...career.toObject(), applicationForm },
  });
});

exports.deleteCareer = asyncHandler(async (req, res, next) => {
  const career = await CareerModel.findByIdAndDelete(req.params.id);

  if (!career) {
    return next(new ApiError("Career job not found", 404));
  }

  res.status(200).json({
    status: true,
    message: "Career job deleted successfully",
  });
});

exports.getCareerTemplates = asyncHandler(async (req, res) => {
  const templates = await CareerTemplateModel.find().sort({ createdAt: -1 });

  res.status(200).json({
    status: true,
    data: templates,
  });
});

exports.createCareerTemplate = asyncHandler(async (req, res) => {
  const payload = req.body || {};
  const applicationForm = normalizeApplicationForm(payload.applicationForm) || {
    fields: [],
  };

  const template = await CareerTemplateModel.create({
    name: payload.name,
    title: payload.title ? safeParseJSON(payload.title, "title") : {},
    position: payload.position
      ? safeParseJSON(payload.position, "position")
      : {},
    location: payload.location
      ? safeParseJSON(payload.location, "location")
      : {},
    description: payload.description
      ? safeParseJSON(payload.description, "description")
      : {},
    applicationLink: payload.applicationLink || "",
    status: ["draft", "published"].includes(payload.status)
      ? payload.status
      : "published",
    applicationForm,
  });

  res.status(201).json({
    status: true,
    message: "Career template saved successfully",
    data: template,
  });
});

exports.getCareerApplicationForm = asyncHandler(async (req, res, next) => {
  const career = await CareerModel.findById(req.params.id);

  if (!career) {
    return next(new ApiError("Career job not found", 404));
  }

  const applicationForm = await CareerApplicationFormModel.findOne({
    career: req.params.id,
  });

  res.status(200).json({
    status: true,
    data: applicationForm || { career: req.params.id, fields: [] },
  });
});

exports.updateCareerApplicationForm = asyncHandler(async (req, res, next) => {
  const career = await CareerModel.findById(req.params.id);

  if (!career) {
    return next(new ApiError("Career job not found", 404));
  }

  const applicationForm = await upsertApplicationForm(req.params.id, req.body);

  res.status(200).json({
    status: true,
    message: "Application form updated successfully",
    data: applicationForm,
  });
});

exports.submitCareerApplication = asyncHandler(async (req, res, next) => {
  const [career, applicationForm] = await Promise.all([
    CareerModel.findById(req.params.id),
    CareerApplicationFormModel.findOne({ career: req.params.id }),
  ]);

  if (!career) {
    return next(new ApiError("Career job not found", 404));
  }

  if (career.status !== "published") {
    return next(
      new ApiError("This career job is not open for applications", 400),
    );
  }

  if (!applicationForm) {
    return next(new ApiError("Application form not found", 404));
  }

  const payload = req.body.answers
    ? safeParseJSON(req.body.answers, "answers")
    : req.body;
  const uploadedFiles = req.files || [];
  const filesByField = uploadedFiles.reduce((map, file) => {
    const fieldId = file.fieldname.replace(/^field_/, "");
    map[fieldId] = map[fieldId] || [];
    map[fieldId].push(file);
    return map;
  }, {});

  await fs.promises.mkdir("uploads/career-applications", { recursive: true });

  const answers = [];

  for (const field of applicationForm.fields) {
    const value = payload?.[field._id] ?? payload?.[field.name] ?? "";
    const files =
      filesByField[String(field._id)] || filesByField[field.name] || [];

    if (field.required) {
      const hasValue = Array.isArray(value)
        ? value.length > 0
        : String(value).trim();
      if (field.type === "file" ? !files.length : !hasValue) {
        return next(
          new ApiError(
            `${getFirstLocalizedValue(field.label) || field.name} is required`,
            400,
          ),
        );
      }
    }

    const storedFiles = [];
    for (const file of files) {
      const ext = file.originalname.includes(".")
        ? file.originalname.substring(file.originalname.lastIndexOf("."))
        : "";
      const filename = `application-${uuidv4()}-${Date.now()}${ext}`;
      const path = `uploads/career-applications/${filename}`;
      await fs.promises.writeFile(path, file.buffer);
      storedFiles.push({
        originalName: file.originalname,
        filename,
        path: `career-applications/${filename}`,
        mimetype: file.mimetype,
        size: file.size,
      });
    }

    answers.push({
      field: field._id,
      label: field.label,
      type: field.type,
      value: field.type === "file" ? "" : value,
      files: storedFiles,
    });
  }

  const submission = await CareerApplicationSubmissionModel.create({
    career: career._id,
    form: applicationForm._id,
    answers,
  });

  res.status(201).json({
    status: true,
    message: "Application submitted successfully",
    data: submission,
  });
});

exports.getCareerApplications = asyncHandler(async (req, res) => {
  const { careerId, page = 1, limit = 20, status, filters } = req.query;
  const { applications, total, pageNum, limitNum } =
    await getFilteredApplications({
      careerId,
      page,
      limit,
      status,
      filters,
    });

  res.status(200).json({
    status: true,
    data: applications,
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      itemsPerPage: limitNum,
    },
  });
});

exports.exportCareerApplications = asyncHandler(async (req, res) => {
  const { careerId, status, filters } = req.query;
  const { applications } = await getFilteredApplications({
    careerId,
    status,
    filters,
    paginate: false,
  });
  const workbook = buildApplicationsExcel(applications, req);

  res.setHeader("Content-Type", "application/vnd.ms-excel; charset=utf-8");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="career-applications-${careerId || "all"}.xls"`,
  );
  res.status(200).send(workbook);
});

exports.getCareerApplication = asyncHandler(async (req, res, next) => {
  const application = await CareerApplicationSubmissionModel.findById(
    req.params.applicationId,
  ).populate("career", "title location endDate");

  if (!application) {
    return next(new ApiError("Application not found", 404));
  }

  res.status(200).json({
    status: true,
    data: application,
  });
});

exports.updateCareerApplicationStatus = asyncHandler(async (req, res, next) => {
  const application = await CareerApplicationSubmissionModel.findByIdAndUpdate(
    req.params.applicationId,
    { status: req.body.status },
    { new: true, runValidators: true },
  );

  if (!application) {
    return next(new ApiError("Application not found", 404));
  }

  res.status(200).json({
    status: true,
    message: "Application status updated successfully",
    data: application,
  });
});
