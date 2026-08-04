const asyncHandler = require("express-async-handler");
const fs = require("fs");
const ApiError = require("../../utils/apiError");
const OurServiceModel = require("../../models/Service/ourServicesModel");
const { uploadSingleImage } = require("../../middlewares/uploadingImage");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const safeParseJSON = require("../../utils/safeParseJson");
const buildSlug = require("../../utils/buildSlug");
const path = require("path");

const SERVICES_UPLOAD_DIRECTORY = path.resolve(
  process.cwd(),
  "uploads",
  "ourServices",
);

const deleteServiceBannerFile = async (filename) => {
  if (!filename || typeof filename !== "string") return;

  const safeFilename = path.basename(filename);
  const filePath = path.join(SERVICES_UPLOAD_DIRECTORY, safeFilename);

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(`Failed to delete service banner: ${filePath}`, error);
    }
  }
};

const parseLocalizedArray = (value, fieldName) => {
  const parsed = safeParseJSON(value, fieldName);

  if (parsed === undefined || parsed === null) return undefined;

  const ensureArray = (items) =>
    Array.isArray(items)
      ? items.map((item) => `${item ?? ""}`.trim()).filter(Boolean)
      : [];

  return {
    ar: ensureArray(parsed?.ar),
    en: ensureArray(parsed?.en),
    tr: ensureArray(parsed?.tr),
  };
};

const parseIdArray = (value, fieldName) => {
  const parsed = safeParseJSON(value, fieldName);

  if (parsed === undefined || parsed === null) return undefined;
  if (!Array.isArray(parsed)) {
    throw new ApiError(`Invalid JSON format for ${fieldName}`, 400);
  }

  return parsed.filter(Boolean);
};

const parseTestimonials = (value, fieldName) => {
  const parsed = safeParseJSON(value, fieldName);

  if (parsed === undefined || parsed === null) {
    return undefined;
  }

  const rawItems = Array.isArray(parsed)
    ? parsed
    : typeof parsed === "object"
      ? [parsed]
      : [];

  return rawItems
    .map((item) => ({
      clientName: {
        ar: item?.clientName?.ar || "",
        en: item?.clientName?.en || "",
        tr: item?.clientName?.tr || "",
      },

      clientRole: {
        ar: item?.clientRole?.ar || "",
        en: item?.clientRole?.en || "",
        tr: item?.clientRole?.tr || "",
      },

      quote: {
        ar: item?.quote?.ar || "",
        en: item?.quote?.en || "",
        tr: item?.quote?.tr || "",
      },
    }))
    .filter((item) => {
      const hasQuote = item.quote.en || item.quote.ar || item.quote.tr;

      const hasName =
        item.clientName.en || item.clientName.ar || item.clientName.tr;

      const hasRole =
        item.clientRole.en || item.clientRole.ar || item.clientRole.tr;

      return Boolean(hasQuote || hasName || hasRole);
    });
};

const servicePopulate = [
  {
    path: "relatedProjects",
    select: "title slug image brief challenge solution result",
  },
  { path: "relatedServices", select: "title slug bannerImage description" },
];

exports.uploadServiceBannerImage = uploadSingleImage("bannerImage");
exports.resizeServiceBannerImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  const filename = `service-${uuidv4()}-${Date.now()}.webp`;
  fs.mkdirSync("uploads/ourServices", { recursive: true });

  await sharp(req.file.buffer)
    .toFormat("webp")
    .webp({ quality: 70 })
    .toFile(`uploads/ourServices/${filename}`);

  req.body.bannerImage = filename;
  next();
});

const normalizeServicePayload = (body) => {
  if (body.title !== undefined) {
    body.title = safeParseJSON(body.title, "title");
    body.slug = buildSlug(body.title);
  }

  if (body.description !== undefined) {
    body.description = safeParseJSON(body.description, "description");
  }

  if (body.features !== undefined) {
    body.features = parseLocalizedArray(body.features, "features");
  }

  if (body.steps !== undefined) {
    body.steps = parseLocalizedArray(body.steps, "steps");
  }

  if (body.targetingSectors !== undefined) {
    body.targetingSectors = parseLocalizedArray(
      body.targetingSectors,
      "targetingSectors",
    );
  }

  if (body.testimonials !== undefined) {
    body.testimonials = parseTestimonials(body.testimonials, "testimonials");
  } else if (body.testimonial !== undefined) {
    body.testimonials = parseTestimonials(body.testimonial, "testimonial");
    delete body.testimonial;
  }

  if (body.relatedProjects !== undefined) {
    body.relatedProjects = parseIdArray(
      body.relatedProjects,
      "relatedProjects",
    );
  }

  if (body.relatedServices !== undefined) {
    body.relatedServices = parseIdArray(
      body.relatedServices,
      "relatedServices",
    );
  }

  if (body.order !== undefined) {
    body.order = Number(body.order) || 0;
  }
};

// Admin list
exports.getOurServices = asyncHandler(async (req, res) => {
  const { keyword, page = 1, limit = 10, sort = "order createdAt" } = req.query;

  const query = {};

  if (keyword && keyword.trim() !== "") {
    const safeKeyword = keyword.trim();

    query.$or = [
      { "title.ar": { $regex: safeKeyword, $options: "i" } },
      { "title.en": { $regex: safeKeyword, $options: "i" } },
      { "title.tr": { $regex: safeKeyword, $options: "i" } },
      { "description.ar": { $regex: safeKeyword, $options: "i" } },
      { "description.en": { $regex: safeKeyword, $options: "i" } },
      { "description.tr": { $regex: safeKeyword, $options: "i" } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [services, total] = await Promise.all([
    OurServiceModel.find(query)
      .populate(servicePopulate)
      .sort(sort)
      .skip(skip)
      .limit(limitNum),
    OurServiceModel.countDocuments(query),
  ]);

  const totalPages = Math.ceil(total / limitNum);

  res.status(200).json({
    status: true,
    message:
      services.length > 0
        ? "Services fetched successfully"
        : "No matching results",
    pagination: {
      totalItems: total,
      totalPages,
      currentPage: pageNum,
      itemsPerPage: limitNum,
      hasNextPage: pageNum < totalPages,
      hasPreviousPage: pageNum > 1,
    },
    data: services,
  });
});

// Public list
exports.getPublicOurServices = asyncHandler(async (req, res) => {
  const services = await OurServiceModel.find({})
    .populate(servicePopulate)
    .sort({
      order: 1,
      createdAt: -1,
    });

  res.status(200).json({
    status: true,
    data: services,
  });
});

exports.createOurService = asyncHandler(async (req, res) => {
  normalizeServicePayload(req.body);
  const service = await OurServiceModel.create(req.body);

  res.status(201).json({
    status: true,
    message: "Service created successfully",
    data: service,
  });
});

exports.getOneOurService = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const service = await OurServiceModel.findById(id).populate(servicePopulate);

  if (!service) {
    return next(new ApiError(`No Service found for this id: ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    data: service,
  });
});

exports.updateOurService = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const existingService = await OurServiceModel.findById(id);

  if (!existingService) {
    return next(new ApiError(`No Service found for this id: ${id}`, 404));
  }

  const removeBannerImage =
    req.body.removeBannerImage === true ||
    req.body.removeBannerImage === "true";

  // حقل تحكم وليس جزءاً من الموديل
  delete req.body.removeBannerImage;

  normalizeServicePayload(req.body);

  // الصورة الجديدة تأخذ الأولوية على طلب الحذف
  if (removeBannerImage && !req.body.bannerImage) {
    req.body.bannerImage = "";
  }

  const updatedService = await OurServiceModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  }).populate(servicePopulate);

  // حذف الصورة القديمة عند الحذف أو الاستبدال
  if (
    existingService.bannerImage &&
    existingService.bannerImage !== updatedService.bannerImage
  ) {
    await deleteServiceBannerFile(existingService.bannerImage);
  }

  res.status(200).json({
    status: true,
    message: "Service updated successfully",
    data: updatedService,
  });
});

exports.deleteOurService = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const deletedService = await OurServiceModel.findByIdAndDelete(id);

  if (!deletedService) {
    return next(new ApiError(`No Service found for this id: ${id}`, 404));
  }

  await deleteServiceBannerFile(deletedService.bannerImage);

  res.status(200).json({
    status: true,
    message: "Service deleted successfully",
  });
});
