const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const boardMemberModel = require("../models/boardMemberModel");
const { uploadSingleImage } = require("../middlewares/uploadingImage");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const { default: slugify } = require("slugify");
const fs = require("fs");
const path = require("path");

const BOARD_MEMBERS_UPLOAD_DIRECTORY = path.resolve(
  process.cwd(),
  "uploads",
  "boardMember",
);

const deleteBoardMemberImageFile = async (filename) => {
  if (!filename || typeof filename !== "string") return;

  const safeFilename = path.basename(filename);
  const filePath = path.join(BOARD_MEMBERS_UPLOAD_DIRECTORY, safeFilename);

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(`Failed to delete board member image: ${filePath}`, error);
    }
  }
};

const safeParseJSON = (value, fieldName) => {
  if (value === undefined || value === null) return value;
  if (typeof value !== "string") return value;

  try {
    return JSON.parse(value);
  } catch (error) {
    throw new ApiError(`Invalid JSON format for ${fieldName}`, 400);
  }
};

const buildSlug = (name = {}) => {
  const base = name?.en || name?.ar || name?.tr || "";
  return slugify(base, { lower: true, strict: true, trim: true });
};

exports.uploadBoardMemberImage = uploadSingleImage("image");

exports.resizeBoardMemberImages = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  fs.mkdirSync(BOARD_MEMBERS_UPLOAD_DIRECTORY, {
    recursive: true,
  });

  const filename = `board-member-${uuidv4()}-${Date.now()}.webp`;

  await sharp(req.file.buffer)
    .toFormat("webp")
    .webp({ quality: 70 })
    .toFile(path.join(BOARD_MEMBERS_UPLOAD_DIRECTORY, filename));

  req.body.image = filename;

  next();
});

// Admin list
exports.getBoardMembers = asyncHandler(async (req, res) => {
  const {
    keyword,
    page = 1,
    limit = 10,
    sort = "order createdAt",
    isFounder,
  } = req.query;

  const query = {};

  if (isFounder !== undefined) {
    query.isFounder = isFounder === "true";
  }

  if (keyword && keyword.trim() !== "") {
    const safeKeyword = keyword.trim();

    query.$or = [
      { "name.ar": { $regex: safeKeyword, $options: "i" } },
      { "name.en": { $regex: safeKeyword, $options: "i" } },
      { "name.tr": { $regex: safeKeyword, $options: "i" } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [members, total] = await Promise.all([
    boardMemberModel.find(query).sort(sort).skip(skip).limit(limitNum),
    boardMemberModel.countDocuments(query),
  ]);

  res.status(200).json({
    status: true,
    message:
      members.length > 0
        ? "Board members fetched successfully"
        : "No matching results",
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      itemsPerPage: limitNum,
    },
    data: members,
  });
});

// Public list
exports.getPublicBoardMembers = asyncHandler(async (req, res) => {
  const { isFounder } = req.query;

  const query = {};

  if (isFounder !== undefined) {
    query.isFounder = isFounder === "true";
  }

  const members = await boardMemberModel
    .find(query)
    .sort({ order: 1, createdAt: -1 });

  res.status(200).json({
    status: true,
    data: members,
  });
});

exports.createBoardMember = asyncHandler(async (req, res) => {
  req.body.name = safeParseJSON(req.body.name, "name");
  req.body.position = safeParseJSON(req.body.position, "position");
  req.body.bio = safeParseJSON(req.body.bio, "bio");

  if (req.body.isFounder !== undefined) {
    req.body.isFounder =
      req.body.isFounder === true || req.body.isFounder === "true";
  }

  if (req.body.order !== undefined) {
    req.body.order = Number(req.body.order);
  }

  req.body.slug = buildSlug(req.body.name);

  const member = await boardMemberModel.create(req.body);

  res.status(201).json({
    status: true,
    message: "Board member created successfully",
    data: member,
  });
});

exports.getOneBoardMember = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const member = await boardMemberModel.findById(id);

  if (!member) {
    return next(new ApiError(`No Board Member found for this id: ${id}`, 404));
  }

  res.status(200).json({
    status: true,
    data: member,
  });
});

exports.getBoardMemberBySlug = asyncHandler(async (req, res, next) => {
  const { slug } = req.params;

  const member = await boardMemberModel.findOne({
    slug,
  });

  if (!member) {
    return next(
      new ApiError(`No active Board Member found for slug: ${slug}`, 404),
    );
  }

  res.status(200).json({
    status: true,
    data: member,
  });
});

exports.updateBoardMember = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const existingMember = await boardMemberModel.findById(id);

  if (!existingMember) {
    return next(new ApiError(`No Board Member found for this id: ${id}`, 404));
  }

  const removeImage =
    req.body.removeImage === true || req.body.removeImage === "true";

  // حقل تحكم فقط
  delete req.body.removeImage;

  if (req.body.name !== undefined) {
    req.body.name = safeParseJSON(req.body.name, "name");
  }

  if (req.body.position !== undefined) {
    req.body.position = safeParseJSON(req.body.position, "position");
  }

  if (req.body.bio !== undefined) {
    req.body.bio = safeParseJSON(req.body.bio, "bio");
  }

  if (req.body.isFounder !== undefined) {
    req.body.isFounder =
      req.body.isFounder === true || req.body.isFounder === "true";
  }

  if (req.body.order !== undefined) {
    req.body.order = Number(req.body.order) || 0;
  }

  if (req.body.name) {
    req.body.slug = buildSlug(req.body.name);
  }

  // الصورة الجديدة تأخذ الأولوية
  if (removeImage && !req.body.image) {
    req.body.image = "";
  }

  const updatedMember = await boardMemberModel.findByIdAndUpdate(id, req.body, {
    new: true,
    runValidators: true,
  });

  if (existingMember.image && existingMember.image !== updatedMember.image) {
    await deleteBoardMemberImageFile(existingMember.image);
  }

  res.status(200).json({
    status: true,
    message: "Board member updated successfully",
    data: updatedMember,
  });
});

exports.deleteBoardMember = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const deletedMember = await boardMemberModel.findByIdAndDelete(id);

  if (!deletedMember) {
    return next(new ApiError(`No Board Member found for this id: ${id}`, 404));
  }

  await deleteBoardMemberImageFile(deletedMember.image);

  res.status(200).json({
    status: true,
    message: "Board member deleted successfully",
  });
});
