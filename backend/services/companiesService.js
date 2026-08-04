const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const companiesModel = require("../models/Companies");
const { uploadMixOfImages } = require("../middlewares/uploadingImage");
const sharp = require("sharp");
const { v4: uuidv4 } = require("uuid");
const buildSlug = require("../utils/buildSlug");
const safeParseJSON = require("../utils/safeParseJson");
const fs = require("fs");
const path = require("path");

const COMPANIES_UPLOAD_DIRECTORY = path.resolve(
  process.cwd(),
  "uploads",
  "companies",
);

const deleteCompanyLogoFile = async (filename) => {
  if (!filename || typeof filename !== "string") return;

  const safeFilename = path.basename(filename);
  const filePath = path.join(COMPANIES_UPLOAD_DIRECTORY, safeFilename);

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(`Failed to delete company logo: ${filePath}`, error);
    }
  }
};

const escapeRegex = (value = "") => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

exports.uploadCompaniesImages = uploadMixOfImages([
  {
    name: "logo",
    maxCount: 1,
  },
]);

exports.resizeCompaniesImages = asyncHandler(async (req, res, next) => {
  const hasLogo = Boolean(req.files?.logo?.[0]);

  if (!hasLogo) {
    return next();
  }

  fs.mkdirSync(COMPANIES_UPLOAD_DIRECTORY, {
    recursive: true,
  });

  const logoFilename = `company-logo-${uuidv4()}-${Date.now()}.webp`;

  await sharp(req.files.logo[0].buffer)
    .toFormat("webp")
    .webp({
      quality: 70,
    })
    .toFile(path.join(COMPANIES_UPLOAD_DIRECTORY, logoFilename));

  req.body.logo = logoFilename;

  next();
});

const parseCompanyBody = (body) => {
  if (body.name !== undefined) {
    body.name = safeParseJSON(body.name, "name");
  }

  if (body.brief !== undefined) {
    body.brief = safeParseJSON(body.brief, "brief");
  }

  if (body.testimonial !== undefined) {
    body.testimonial = safeParseJSON(body.testimonial, "testimonial");
  }

  if (body.order !== undefined) {
    body.order = Number(body.order) || 0;
  }

  if (body.name) {
    body.slug = buildSlug(body.name);
  }
};

const buildCompanySearchQuery = (keyword) => {
  if (!keyword?.trim()) {
    return {};
  }

  const keywordRegex = {
    $regex: escapeRegex(keyword.trim()),
    $options: "i",
  };

  return {
    $or: [
      { "name.en": keywordRegex },
      { "name.ar": keywordRegex },
      { "name.tr": keywordRegex },

      { "brief.en": keywordRegex },
      { "brief.ar": keywordRegex },
      { "brief.tr": keywordRegex },

      { "testimonial.en": keywordRegex },
      { "testimonial.ar": keywordRegex },
      { "testimonial.tr": keywordRegex },
    ],
  };
};

exports.createCompany = asyncHandler(async (req, res, next) => {
  parseCompanyBody(req.body);

  const existingCompany = await companiesModel.findOne({
    slug: req.body.slug,
  });

  if (existingCompany) {
    // الصورة تم إنشاؤها قبل الوصول إلى Controller
    await deleteCompanyLogoFile(req.body.logo);

    return next(new ApiError("Company name already exists", 400));
  }

  const newCompany = await companiesModel.create(req.body);

  res.status(201).json({
    status: true,
    message: "Company created successfully",
    data: newCompany,
  });
});

exports.getCompanies = asyncHandler(async (req, res) => {
  const { keyword, page = 1, limit = 10, sort = "order createdAt" } = req.query;

  const query = buildCompanySearchQuery(keyword);

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);

  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);

  const skip = (pageNum - 1) * limitNum;

  const [companies, total] = await Promise.all([
    companiesModel.find(query).sort(sort).skip(skip).limit(limitNum),

    companiesModel.countDocuments(query),
  ]);

  res.status(200).json({
    status: true,

    message: companies.length
      ? "Companies fetched successfully"
      : "No matching results",

    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      itemsPerPage: limitNum,
    },

    data: companies,
  });
});

exports.getPublicCompanies = asyncHandler(async (req, res) => {
  const { keyword, page = 1, limit } = req.query;

  const query = buildCompanySearchQuery(keyword);

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);

  const limitNum = limit ? Math.max(parseInt(limit, 10) || 1, 1) : null;

  const skip = limitNum ? (pageNum - 1) * limitNum : 0;

  let companiesQuery = companiesModel.find(query).sort({
    order: 1,
    createdAt: -1,
  });

  if (limitNum) {
    companiesQuery = companiesQuery.skip(skip).limit(limitNum);
  }

  const companies = await companiesQuery;

  const response = {
    status: true,
    data: companies,
  };

  if (limitNum) {
    const total = await companiesModel.countDocuments(query);

    response.pagination = {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      itemsPerPage: limitNum,
    };
  }

  res.status(200).json(response);
});

exports.getCompanyBySlug = asyncHandler(async (req, res, next) => {
  const company = await companiesModel.findOne({
    slug: req.params.slug,
  });

  if (!company) {
    return next(
      new ApiError(`No company found for slug ${req.params.slug}`, 404),
    );
  }

  res.status(200).json({
    status: true,
    data: company,
  });
});

exports.getOneCompany = asyncHandler(async (req, res, next) => {
  const company = await companiesModel.findById(req.params.id);

  if (!company) {
    return next(
      new ApiError(`No company found for this id ${req.params.id}`, 404),
    );
  }

  res.status(200).json({
    status: true,
    data: company,
  });
});

exports.updateCompany = asyncHandler(async (req, res, next) => {
  const existingCompany = await companiesModel.findById(req.params.id);

  if (!existingCompany) {
    // في حال تم رفع شعار جديد قبل اكتشاف عدم وجود الشركة
    await deleteCompanyLogoFile(req.body.logo);

    return next(
      new ApiError(`No company found for this id ${req.params.id}`, 404),
    );
  }

  const removeLogo =
    req.body.removeLogo === true || req.body.removeLogo === "true";

  // حقل تحكم، لا يتم تخزينه في MongoDB
  delete req.body.removeLogo;

  parseCompanyBody(req.body);

  if (req.body.slug) {
    const duplicateCompany = await companiesModel.findOne({
      slug: req.body.slug,

      _id: {
        $ne: req.params.id,
      },
    });

    if (duplicateCompany) {
      // حذف الشعار الجديد فقط، وليس شعار الشركة القديم
      await deleteCompanyLogoFile(req.body.logo);

      return next(new ApiError("Company name already exists", 400));
    }
  }

  // الشعار الجديد يأخذ الأولوية على الحذف
  if (removeLogo && !req.body.logo) {
    req.body.logo = "";
  }

  const updatedCompany = await companiesModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedCompany) {
    await deleteCompanyLogoFile(req.body.logo);

    return next(
      new ApiError(`No company found for this id ${req.params.id}`, 404),
    );
  }

  // حذف الشعار القديم عند الحذف أو الاستبدال
  if (existingCompany.logo && existingCompany.logo !== updatedCompany.logo) {
    await deleteCompanyLogoFile(existingCompany.logo);
  }

  res.status(200).json({
    status: true,
    message: "Company updated successfully",
    data: updatedCompany,
  });
});

exports.deleteCompany = asyncHandler(async (req, res, next) => {
  const deletedCompany = await companiesModel.findByIdAndDelete(req.params.id);

  if (!deletedCompany) {
    return next(
      new ApiError(`No company found for this id ${req.params.id}`, 404),
    );
  }

  await deleteCompanyLogoFile(deletedCompany.logo);

  res.status(200).json({
    status: true,
    message: "Company deleted successfully",
  });
});
