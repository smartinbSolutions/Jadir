const asyncHandler = require("express-async-handler");
const ApiError = require("../../utils/apiError");
const partnersModel = require("../../models/Home/partnersModel");
const { uploadSingleImage } = require("../../middlewares/uploadingImage");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const safeParseJSON = require("../../utils/safeParseJson");
const fs = require("fs");
const path = require("path");

const PARTNERS_UPLOAD_DIRECTORY = path.resolve(
  process.cwd(),
  "uploads",
  "partners",
);

const deletePartnerImageFile = async (filename) => {
  if (!filename || typeof filename !== "string") return;

  const safeFilename = path.basename(filename);

  const filePath = path.join(PARTNERS_UPLOAD_DIRECTORY, safeFilename);

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(`Failed to delete partner image: ${filePath}`, error);
    }
  }
};

const escapeRegex = (value = "") => {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

const parsePartnerBody = (body) => {
  if (body.order !== undefined) {
    body.order = Number(body.order) || 0;
  }

  if (body.title !== undefined) {
    body.title = safeParseJSON(body.title, "title");
  }

  if (body.brief !== undefined) {
    body.brief = safeParseJSON(body.brief, "brief");
  }

  if (body.testimonial !== undefined) {
    body.testimonial = safeParseJSON(body.testimonial, "testimonial");
  }
};

exports.uploadPartnerImage = uploadSingleImage("img");

exports.resizePartnerImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  fs.mkdirSync(PARTNERS_UPLOAD_DIRECTORY, {
    recursive: true,
  });

  const filename = `partner-${uuidv4()}-${Date.now()}.webp`;

  await sharp(req.file.buffer)
    .toFormat("webp")
    .webp({ quality: 70 })
    .toFile(path.join(PARTNERS_UPLOAD_DIRECTORY, filename));

  req.body.img = filename;

  next();
});

// Admin list
exports.getPartners = asyncHandler(async (req, res) => {
  const { keyword, page = 1, limit = 10, sort = "order createdAt" } = req.query;

  const query = {};

  if (keyword?.trim()) {
    const keywordRegex = {
      $regex: escapeRegex(keyword.trim()),
      $options: "i",
    };

    query.$or = [
      { "title.ar": keywordRegex },
      { "title.en": keywordRegex },
      { "title.tr": keywordRegex },

      { "brief.ar": keywordRegex },
      { "brief.en": keywordRegex },
      { "brief.tr": keywordRegex },

      { "testimonial.ar": keywordRegex },
      { "testimonial.en": keywordRegex },
      { "testimonial.tr": keywordRegex },
    ];
  }

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);

  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);

  const skip = (pageNum - 1) * limitNum;

  const [partners, total] = await Promise.all([
    partnersModel.find(query).sort(sort).skip(skip).limit(limitNum),

    partnersModel.countDocuments(query),
  ]);

  res.status(200).json({
    status: true,

    message: partners.length
      ? "Partners fetched successfully"
      : "No matching results",

    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      itemsPerPage: limitNum,
    },

    data: partners,
  });
});

// Public list
exports.getPublicPartners = asyncHandler(async (req, res) => {
  const partners = await partnersModel.find({}).sort({
    order: 1,
    createdAt: -1,
  });

  res.status(200).json({
    status: true,
    data: partners,
  });
});

exports.createPartner = asyncHandler(async (req, res) => {
  parsePartnerBody(req.body);

  const partner = await partnersModel.create(req.body);

  res.status(201).json({
    status: true,
    message: "Partner created successfully",
    data: partner,
  });
});

exports.getOnePartner = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const partner = await partnersModel.findById(id);

  if (!partner) {
    return next(new ApiError(`No Partner found for this id: ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    data: partner,
  });
});

exports.updatePartner = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    await deletePartnerImageFile(req.body.img);

    return next(new ApiError("No ID provided", 400));
  }

  const existingPartner = await partnersModel.findById(id);

  if (!existingPartner) {
    // حذف الصورة الجديدة التي تم إنشاؤها قبل الوصول للخدمة
    await deletePartnerImageFile(req.body.img);

    return next(new ApiError(`No Partner found for this id: ${id}`, 404));
  }

  const removeImg =
    req.body.removeImg === true || req.body.removeImg === "true";

  // حقل تحكم لا يتم تخزينه
  delete req.body.removeImg;

  parsePartnerBody(req.body);

  // الصورة الجديدة تأخذ الأولوية
  if (removeImg && !req.body.img) {
    req.body.img = "";
  }

  const updatedPartner = await partnersModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (!updatedPartner) {
    await deletePartnerImageFile(req.body.img);

    return next(new ApiError(`No Partner found for this id: ${id}`, 404));
  }

  // حذف الصورة القديمة في حالة الحذف أو الاستبدال
  if (existingPartner.img && existingPartner.img !== updatedPartner.img) {
    await deletePartnerImageFile(existingPartner.img);
  }

  res.status(200).json({
    status: true,
    message: "Partner updated successfully",
    data: updatedPartner,
  });
});

exports.deletePartner = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const deletedPartner = await partnersModel.findByIdAndDelete(id);

  if (!deletedPartner) {
    return next(new ApiError(`No Partner found for this id: ${id}`, 404));
  }

  await deletePartnerImageFile(deletedPartner.img);

  res.status(200).json({
    status: true,
    message: "Partner deleted successfully",
  });
});
