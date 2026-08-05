const fs = require("fs");
const path = require("path");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const messagesModel = require("../models/MessagesModel");
const sendEmail = require("../utils/sendEmail");
const { uploadSingleFile } = require("../middlewares/uploadingImage");

const REQUEST_TYPE_LABELS = {
  inquiry: "Inquiry",
  "consult-inquiry": "Inquiry",
  "service-request": "Service Request",
  partnership: "Partnership",
  media: "Media",
  support: "Support",
  complaint: "Complaint",
  "investment-inquiry": "Service Request",
};

const sendEmailInBackground = (emailOptions) => {
  setImmediate(async () => {
    try {
      await sendEmail(emailOptions);
    } catch (error) {
      console.error("Contact notification email failed:", {
        message: error.message,
        code: error.code,
      });
    }
  });
};

const normalizeRequestType = (value = "") => {
  if (value === "consult-inquiry") return "inquiry";
  if (value === "investment-inquiry") return "service-request";
  return value || "inquiry";
};

exports.uploadMessageAttachment = uploadSingleFile("attachment");

exports.persistMessageAttachment = asyncHandler(async (req, res, next) => {
  if (!req.file) return next();

  const uploadDir = path.join(__dirname, "..", "uploads", "messages");
  fs.mkdirSync(uploadDir, { recursive: true });

  const sanitizedOriginalName = (req.file.originalname || "attachment").replace(
    /[^a-zA-Z0-9._-]/g,
    "-",
  );
  const filename = `message-${Date.now()}-${sanitizedOriginalName}`;
  const absolutePath = path.join(uploadDir, filename);

  fs.writeFileSync(absolutePath, req.file.buffer);

  req.body.attachment = {
    filename,
    originalName: req.file.originalname,
    mimetype: req.file.mimetype,
    size: req.file.size,
    path: `uploads/messages/${filename}`,
    url: `/messages/${filename}`,
  };

  next();
});

exports.getMessages = asyncHandler(async (req, res) => {
  const {
    keyword,
    page = 1,
    limit = 10,
    sort = "-createdAt",
    isReplied,
    status,
  } = req.query;

  const currentPage = parseInt(page, 10) || 1;
  const perPage = parseInt(limit, 10) || 10;
  const skip = (currentPage - 1) * perPage;

  const query = {};

  if (isReplied !== undefined) {
    query.isReplied = isReplied === "true";
  }

  if (status) {
    query.status = status;
  }

  if (keyword?.trim()) {
    const safeKeyword = keyword.trim();

    query.$or = [
      { name: { $regex: safeKeyword, $options: "i" } },
      { email: { $regex: safeKeyword, $options: "i" } },
      { phone: { $regex: safeKeyword, $options: "i" } },
      { subject: { $regex: safeKeyword, $options: "i" } },
      { requestType: { $regex: safeKeyword, $options: "i" } },
      { message: { $regex: safeKeyword, $options: "i" } },
      { reply: { $regex: safeKeyword, $options: "i" } },
      { "attachment.originalName": { $regex: safeKeyword, $options: "i" } },
    ];
  }

  const [messages, total] = await Promise.all([
    messagesModel
      .find(query)
      .populate("service", "title slug")
      .sort(sort)
      .skip(skip)
      .limit(perPage),
    messagesModel.countDocuments(query),
  ]);

  res.status(200).json({
    status: true,
    message:
      messages.length > 0
        ? "Messages fetched successfully"
        : "No matching results",
    pagination: {
      totalItems: total,
      totalPages: Math.ceil(total / perPage),
      currentPage,
      itemsPerPage: perPage,
    },
    data: messages,
  });
});

exports.createMessage = asyncHandler(async (req, res) => {
  req.body.requestType = normalizeRequestType(req.body.requestType);

  if (req.body.service === "") {
    req.body.service = null;
  }

  const createdMessage = await messagesModel.create(req.body);

  const populatedMessage = await createdMessage.populate(
    "service",
    "title slug",
  );

  const attachments = createdMessage?.attachment?.path
    ? [
        {
          filename:
            createdMessage.attachment.originalName ||
            createdMessage.attachment.filename,

          path: path.join(__dirname, "..", createdMessage.attachment.path),

          contentType: createdMessage.attachment.mimetype,
        },
      ]
    : [];

  const emailOptions = {
    to: "contact@jadirconsult.com",
    replyTo: createdMessage.email,
    subject: "New Contact Form Message",

    html: `
      <h3>New Message Received</h3>

      <p>
        <strong>Name:</strong>
        ${createdMessage.name}
      </p>

      <p>
        <strong>Email:</strong>
        ${createdMessage.email}
      </p>

      <p>
        <strong>Phone:</strong>
        ${createdMessage.phone || "N/A"}
      </p>

      <p>
        <strong>Request Type:</strong>
        ${
          REQUEST_TYPE_LABELS[createdMessage.requestType] ||
          createdMessage.requestType
        }
      </p>

      <p>
        <strong>Requested Service:</strong>
        ${
          populatedMessage?.service?.title?.en ||
          populatedMessage?.service?.title?.ar ||
          "N/A"
        }
      </p>

      <p>
        <strong>Subject:</strong>
        ${createdMessage.subject || "N/A"}
      </p>

      <p>
        <strong>Message:</strong><br />
        ${createdMessage.message}
      </p>

      <p>
        <strong>Attachment:</strong>
        ${createdMessage?.attachment?.originalName || "N/A"}
      </p>
    `,

    attachments,
  };

  sendEmailInBackground(emailOptions);

  return res.status(201).json({
    status: true,
    message: "Message sent successfully",
    data: populatedMessage,
  });
});

exports.getOneMessage = asyncHandler(async (req, res, next) => {
  const message = await messagesModel
    .findById(req.params.id)
    .populate("service", "title slug");

  if (!message) {
    return next(
      new ApiError(`No message found for this id ${req.params.id}`, 404),
    );
  }

  res.status(200).json({
    status: true,
    data: message,
  });
});

exports.replyToMessage = asyncHandler(async (req, res, next) => {
  const { reply } = req.body;

  if (!reply || reply.trim() === "") {
    return next(new ApiError("Reply is required", 400));
  }

  const message = await messagesModel.findById(req.params.id);

  if (!message) {
    return next(new ApiError("Message not found", 404));
  }

  message.reply = reply.trim();
  message.isReplied = true;
  message.repliedAt = new Date();
  message.status = "replied";

  await message.save();

  await sendEmail({
    to: message.email,
    subject: "Reply to your message",
    html: `
      <p>Hello ${message.name || ""},</p>
      <p>${reply}</p>
    `,
  });

  res.status(200).json({
    status: true,
    message: "Reply sent successfully",
    data: message,
  });
});

exports.deleteMessage = asyncHandler(async (req, res, next) => {
  const message = await messagesModel.findByIdAndDelete(req.params.id);

  if (!message) {
    return next(
      new ApiError(`No message found for this id ${req.params.id}`, 404),
    );
  }

  res.status(200).json({
    status: true,
    message: "Message deleted successfully",
  });
});
