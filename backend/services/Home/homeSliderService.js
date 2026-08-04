const asyncHandler = require("express-async-handler");
const ApiError = require("../../utils/apiError");
const HomeSliderModel = require("../../models/Home/homeSlider");
const { uploadSingleImage } = require("../../middlewares/uploadingImage");
const { v4: uuidv4 } = require("uuid");
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const SLIDER_UPLOAD_DIRECTORY = path.resolve(
  process.cwd(),
  "uploads",
  "homeSlider",
);

const deleteSliderImageFile = async (filename) => {
  if (!filename || typeof filename !== "string") return;

  const safeFilename = path.basename(filename);
  const filePath = path.join(SLIDER_UPLOAD_DIRECTORY, safeFilename);

  try {
    await fs.promises.unlink(filePath);
  } catch (error) {
    if (error.code !== "ENOENT") {
      console.error(`Failed to delete slider image: ${filePath}`, error);
    }
  }
};

exports.uploadSliderImages = uploadSingleImage("img");

exports.resizeSliderImages = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  fs.mkdirSync(SLIDER_UPLOAD_DIRECTORY, {
    recursive: true,
  });

  const filename = `slider-${uuidv4()}-${Date.now()}.webp`;

  await sharp(req.file.buffer)
    .toFormat("webp")
    .webp({ quality: 70 })
    .toFile(path.join(SLIDER_UPLOAD_DIRECTORY, filename));

  req.body.img = filename;

  next();
});

const normalizeSliderPayload = (body) => {
  delete body.title;
  delete body.description;
  delete body.removeImg;

  if (body.order !== undefined) {
    body.order = Number(body.order) || 0;
  }
};

exports.getSliders = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, sort = "order createdAt" } = req.query;

  const pageNum = Math.max(parseInt(page, 10) || 1, 1);

  const limitNum = Math.max(parseInt(limit, 10) || 10, 1);

  const skip = (pageNum - 1) * limitNum;

  const [data, total] = await Promise.all([
    HomeSliderModel.find({}).sort(sort).skip(skip).limit(limitNum),

    HomeSliderModel.countDocuments({}),
  ]);

  res.status(200).json({
    status: true,
    data,

    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      itemsPerPage: limitNum,
    },
  });
});

exports.getPublicSliders = asyncHandler(async (req, res) => {
  const sliders = await HomeSliderModel.find({}).sort({
    order: 1,
    createdAt: -1,
  });

  res.status(200).json({
    status: true,
    data: sliders,
  });
});

exports.getOneSlider = asyncHandler(async (req, res, next) => {
  const slider = await HomeSliderModel.findById(req.params.id);

  if (!slider) {
    return next(
      new ApiError(`No Slider found for this id: ${req.params.id}`, 404),
    );
  }

  res.status(200).json({
    status: true,
    data: slider,
  });
});

exports.createSlider = asyncHandler(async (req, res) => {
  normalizeSliderPayload(req.body);

  const slider = await HomeSliderModel.create(req.body);

  res.status(201).json({
    status: true,
    message: "Slider created successfully",
    data: slider,
  });
});

exports.updateSlider = asyncHandler(async (req, res, next) => {
  const existingSlider = await HomeSliderModel.findById(req.params.id);

  if (!existingSlider) {
    // حذف الصورة الجديدة إذا تم رفعها لمعرّف غير موجود
    await deleteSliderImageFile(req.body.img);

    return next(
      new ApiError(`No Slider found for this id: ${req.params.id}`, 404),
    );
  }

  const removeImg =
    req.body.removeImg === true || req.body.removeImg === "true";

  normalizeSliderPayload(req.body);

  // الصورة الجديدة تأخذ الأولوية
  if (removeImg && !req.body.img) {
    req.body.img = "";
  }

  const updatedSlider = await HomeSliderModel.findByIdAndUpdate(
    req.params.id,
    req.body,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!updatedSlider) {
    await deleteSliderImageFile(req.body.img);

    return next(
      new ApiError(`No Slider found for this id: ${req.params.id}`, 404),
    );
  }

  // حذف الصورة القديمة عند الحذف أو الاستبدال
  if (existingSlider.img && existingSlider.img !== updatedSlider.img) {
    await deleteSliderImageFile(existingSlider.img);
  }

  res.status(200).json({
    status: true,
    message: "Slider updated successfully",
    data: updatedSlider,
  });
});

exports.deleteSlider = asyncHandler(async (req, res, next) => {
  const deletedSlider = await HomeSliderModel.findByIdAndDelete(req.params.id);

  if (!deletedSlider) {
    return next(
      new ApiError(`No Slider found for this id: ${req.params.id}`, 404),
    );
  }

  await deleteSliderImageFile(deletedSlider.img);

  res.status(200).json({
    status: true,
    message: "Slider deleted successfully",
  });
});

exports.updateSliderBulk = asyncHandler(async (req, res) => {
  const slides = req.body;

  if (!Array.isArray(slides)) {
    return res.status(400).json({
      status: false,
      message: "Request body must be an array",
    });
  }

  const existingSliders = await HomeSliderModel.find({});

  const existingSliderMap = new Map(
    existingSliders.map((slider) => [String(slider._id), slider]),
  );

  const incomingIds = slides
    .map((slide) => slide?._id)
    .filter(Boolean)
    .map(String);

  const incomingIdSet = new Set(incomingIds);

  const slidersToDelete = existingSliders.filter(
    (slider) => !incomingIdSet.has(String(slider._id)),
  );

  const deletedIds = slidersToDelete.map((slider) => slider._id);

  const possibleImagesToDelete = slidersToDelete
    .map((slider) => slider.img)
    .filter(Boolean);

  if (deletedIds.length) {
    await HomeSliderModel.deleteMany({
      _id: {
        $in: deletedIds,
      },
    });
  }

  await Promise.all(
    slides.map(async (slide) => {
      const order = Number(slide?.order) || 0;

      if (slide?._id) {
        const existingSlider = existingSliderMap.get(String(slide._id));

        const payload = {
          order,
        };

        /*
         * إذا لم يرسل img نحافظ على الصورة الحالية.
         * إذا أرسل img="" فهذا يعني تفريغ الصورة.
         */
        if (slide.img !== undefined) {
          payload.img = slide.img || "";
        } else if (existingSlider) {
          payload.img = existingSlider.img || "";
        }

        const updatedSlider = await HomeSliderModel.findByIdAndUpdate(
          slide._id,
          payload,
          {
            new: true,
            runValidators: true,
          },
        );

        if (
          existingSlider?.img &&
          updatedSlider &&
          existingSlider.img !== updatedSlider.img
        ) {
          possibleImagesToDelete.push(existingSlider.img);
        }

        return updatedSlider;
      }

      return HomeSliderModel.create({
        img: slide?.img || "",
        order,
      });
    }),
  );

  const updated = await HomeSliderModel.find({}).sort({
    order: 1,
    createdAt: -1,
  });

  /*
   * لا نحذف ملفاً إذا بقي مستخدماً في Slider آخر.
   */
  const usedImages = new Set(
    updated.map((slider) => slider.img).filter(Boolean),
  );

  const uniqueImagesToDelete = [...new Set(possibleImagesToDelete)].filter(
    (filename) => !usedImages.has(filename),
  );

  await Promise.all(uniqueImagesToDelete.map(deleteSliderImageFile));

  res.status(200).json({
    status: true,
    message: "Slider updated successfully",
    data: updated,
  });
});
