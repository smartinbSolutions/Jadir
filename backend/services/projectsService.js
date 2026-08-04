const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const ProjectsModel = require("../models/projectModel");
const { uploadSingleImage } = require("../middlewares/uploadingImage");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const safeParseJSON = require("../utils/safeParseJson");
const fs = require("fs");
const buildSlug = require("../utils/buildSlug");
const path = require("path");

const PROJECTS_UPLOAD_DIRECTORY = path.resolve(
  process.cwd(),
  "uploads",
  "projects",
);

const deleteProjectImageFile = async (filename) => {
  if (!filename || typeof filename !== "string") return;

  const safeFilename = path.basename(filename);
  const filePath = path.join(PROJECTS_UPLOAD_DIRECTORY, safeFilename);

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(`Failed to delete project image: ${filePath}`, error);
    }
  }
};

exports.uploadProjectImage = uploadSingleImage("image");

exports.resizeProjectImage = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  const filename = `project-${uuidv4()}-${Date.now()}.webp`;

  fs.mkdirSync("uploads/projects", {
    recursive: true,
  });

  await sharp(req.file.buffer)
    .toFormat("webp")
    .webp({ quality: 70 })
    .toFile(`uploads/projects/${filename}`);

  req.body.image = filename;

  next();
});

exports.getProjects = asyncHandler(async (req, res) => {
  const { keyword, page = 1, limit = 10, sort = "order createdAt" } = req.query;

  const query = {};

  if (keyword?.trim()) {
    const safeKeyword = keyword.trim();

    query.$or = [
      { "title.ar": { $regex: safeKeyword, $options: "i" } },
      { "title.en": { $regex: safeKeyword, $options: "i" } },
      { "title.tr": { $regex: safeKeyword, $options: "i" } },

      { "brief.ar": { $regex: safeKeyword, $options: "i" } },
      { "brief.en": { $regex: safeKeyword, $options: "i" } },
      { "brief.tr": { $regex: safeKeyword, $options: "i" } },

      { "challenge.ar": { $regex: safeKeyword, $options: "i" } },
      { "challenge.en": { $regex: safeKeyword, $options: "i" } },
      { "challenge.tr": { $regex: safeKeyword, $options: "i" } },

      { "solution.ar": { $regex: safeKeyword, $options: "i" } },
      { "solution.en": { $regex: safeKeyword, $options: "i" } },
      { "solution.tr": { $regex: safeKeyword, $options: "i" } },

      { "result.ar": { $regex: safeKeyword, $options: "i" } },
      { "result.en": { $regex: safeKeyword, $options: "i" } },
      { "result.tr": { $regex: safeKeyword, $options: "i" } },

      { projectLink: { $regex: safeKeyword, $options: "i" } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = parseInt(limit, 10);
  const skip = (pageNum - 1) * limitNum;

  const [projects, total] = await Promise.all([
    ProjectsModel.find(query).sort(sort).skip(skip).limit(limitNum),
    ProjectsModel.countDocuments(query),
  ]);

  res.status(200).json({
    status: true,
    message:
      projects.length > 0
        ? "Projects fetched successfully"
        : "No matching results",
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      itemsPerPage: limitNum,
    },
    data: projects,
  });
});

exports.getPublicProjects = asyncHandler(async (req, res) => {
  const { keyword, page = 1, limit } = req.query;
  const query = {};

  if (keyword?.trim()) {
    const safeKeyword = keyword.trim();

    query.$or = [
      { "title.ar": { $regex: safeKeyword, $options: "i" } },
      { "title.en": { $regex: safeKeyword, $options: "i" } },
      { "brief.ar": { $regex: safeKeyword, $options: "i" } },
      { "brief.en": { $regex: safeKeyword, $options: "i" } },
      { "challenge.ar": { $regex: safeKeyword, $options: "i" } },
      { "challenge.en": { $regex: safeKeyword, $options: "i" } },
      { "solution.ar": { $regex: safeKeyword, $options: "i" } },
      { "solution.en": { $regex: safeKeyword, $options: "i" } },
      { "result.ar": { $regex: safeKeyword, $options: "i" } },
      { "result.en": { $regex: safeKeyword, $options: "i" } },
    ];
  }

  const pageNum = parseInt(page, 10);
  const limitNum = limit ? parseInt(limit, 10) : null;
  const skip = limitNum ? (pageNum - 1) * limitNum : 0;

  let projectsQuery = ProjectsModel.find(query).sort({
    order: 1,
    createdAt: -1,
  });

  if (limitNum) {
    projectsQuery = projectsQuery.skip(skip).limit(limitNum);
  }

  const projects = await projectsQuery;
  const response = { status: true, data: projects };

  if (limitNum) {
    const total = await ProjectsModel.countDocuments(query);
    response.pagination = {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      itemsPerPage: limitNum,
    };
  }

  res.status(200).json(response);
});

exports.getProjectBySlug = asyncHandler(async (req, res, next) => {
  const project = await ProjectsModel.findOne({
    slug: req.params.slug,
  });

  if (!project) {
    return next(
      new ApiError(`No Project found for slug ${req.params.slug}`, 404),
    );
  }

  res.status(200).json({
    status: true,
    data: project,
  });
});

exports.createProject = asyncHandler(async (req, res) => {
  req.body.title = safeParseJSON(req.body.title, "title");
  req.body.brief = safeParseJSON(req.body.brief, "brief");
  req.body.challenge = safeParseJSON(req.body.challenge, "challenge");
  req.body.solution = safeParseJSON(req.body.solution, "solution");
  req.body.result = safeParseJSON(req.body.result, "result");
  req.body.slug = buildSlug(req.body.title);

  if (req.body.order !== undefined) {
    req.body.order = Number(req.body.order) || 0;
  }

  const project = await ProjectsModel.create(req.body);

  res.status(201).json({
    status: true,
    message: "Project created successfully",
    data: project,
  });
});

exports.getOneProject = asyncHandler(async (req, res, next) => {
  const project = await ProjectsModel.findById(req.params.id);

  if (!project) {
    return next(
      new ApiError(`No Project found for this id ${req.params.id}`, 404),
    );
  }

  res.status(200).json({
    status: true,
    data: project,
  });
});

exports.updateProject = asyncHandler(async (req, res, next) => {
  const existingProject = await ProjectsModel.findById(req.params.id);

  if (!existingProject) {
    return next(
      new ApiError(`No Project found for this id: ${req.params.id}`, 404),
    );
  }

  const removeImage =
    req.body.removeImage === true || req.body.removeImage === "true";

  // حقل تحكم فقط، لا يجب تخزينه داخل المشروع
  delete req.body.removeImage;

  if (req.body.title !== undefined) {
    req.body.title = safeParseJSON(req.body.title, "title");
    req.body.slug = buildSlug(req.body.title);
  }

  if (req.body.brief !== undefined) {
    req.body.brief = safeParseJSON(req.body.brief, "brief");
  }

  if (req.body.challenge !== undefined) {
    req.body.challenge = safeParseJSON(req.body.challenge, "challenge");
  }

  if (req.body.solution !== undefined) {
    req.body.solution = safeParseJSON(req.body.solution, "solution");
  }

  if (req.body.result !== undefined) {
    req.body.result = safeParseJSON(req.body.result, "result");
  }

  if (req.body.order !== undefined) {
    req.body.order = Number(req.body.order) || 0;
  }

  // الصورة الجديدة تأخذ الأولوية على طلب الحذف
  if (removeImage && !req.body.image) {
    req.body.image = "";
  }

  const updatedProject = await ProjectsModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (existingProject.image && existingProject.image !== updatedProject.image) {
    await deleteProjectImageFile(existingProject.image);
  }

  res.status(200).json({
    status: true,
    message: "Project updated successfully",
    data: updatedProject,
  });
});

exports.deleteProject = asyncHandler(async (req, res, next) => {
  const deletedProject = await ProjectsModel.findByIdAndDelete(req.params.id);

  if (!deletedProject) {
    return next(
      new ApiError(`No Project found for this id ${req.params.id}`, 404),
    );
  }

  await deleteProjectImageFile(deletedProject.image);

  res.status(200).json({
    status: true,
    message: "Project deleted successfully",
  });
});
