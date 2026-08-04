const asyncHandler = require("express-async-handler");
const footerModel = require("../../models/Home/FooterModel");

const DAY_ORDER = {
  sunday: 1,
  monday: 2,
  tuesday: 3,
  wednesday: 4,
  thursday: 5,
  friday: 6,
  saturday: 7,
};

const normalizeLangField = (value = {}) => ({
  en: value?.en || "",
  ar: value?.ar || "",
  tr: value?.tr || "",
});

const normalizeBoolean = (value) => {
  return value === true || value === "true";
};

const normalizeTime = (value) => {
  return typeof value === "string" ? value.trim() : "";
};

const parseWorkingSchedule = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === "string") {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  return null;
};

const normalizeWorkingSchedule = (schedule = []) => {
  if (!Array.isArray(schedule)) {
    return [];
  }

  return schedule
    .map((item, index) => {
      const key = String(item?.key || "")
        .trim()
        .toLowerCase();

      return {
        key,
        day: normalizeLangField(item?.day),
        isClosed: normalizeBoolean(item?.isClosed),
        order: DAY_ORDER[key] || Number(item?.order ?? index + 1),
      };
    })
    .filter((item) => item.key || item.day.en || item.day.ar || item.day.tr)
    .sort((a, b) => a.order - b.order);
};

const extractLegacyTimes = (footer = {}) => {
  const schedule = Array.isArray(footer?.workingSchedule)
    ? footer.workingSchedule
    : [];

  const legacyOpenDay = schedule.find(
    (item) =>
      !normalizeBoolean(item?.isClosed) &&
      (normalizeTime(item?.startTime) || normalizeTime(item?.endTime)),
  );

  let startTime = normalizeTime(footer?.workingStartTime);
  let endTime = normalizeTime(footer?.workingEndTime);

  if (!startTime) {
    startTime = normalizeTime(legacyOpenDay?.startTime);
  }

  if (!endTime) {
    endTime = normalizeTime(legacyOpenDay?.endTime);
  }

  if ((!startTime || !endTime) && footer?.workingHours) {
    const parts = String(footer.workingHours)
      .split(/\s*-\s*/)
      .map((item) => item.trim());

    if (!startTime) {
      startTime = parts[0] || "";
    }

    if (!endTime) {
      endTime = parts[1] || "";
    }
  }

  return {
    startTime,
    endTime,
  };
};

const serializeFooter = (footer) => {
  if (!footer) return null;

  const data =
    typeof footer.toObject === "function" ? footer.toObject() : { ...footer };

  const legacyTimes = extractLegacyTimes(data);

  return {
    ...data,

    workingStartTime:
      normalizeTime(data?.workingStartTime) || legacyTimes.startTime,

    workingEndTime: normalizeTime(data?.workingEndTime) || legacyTimes.endTime,

    // لا نعيد startTime وendTime داخل كل يوم.
    workingSchedule: normalizeWorkingSchedule(data?.workingSchedule),
  };
};

exports.getFooter = asyncHandler(async (req, res) => {
  const footer = await footerModel.findOne();

  res.status(200).json({
    status: true,
    message: footer ? "Footer fetched successfully" : "Footer not found",
    data: serializeFooter(footer),
  });
});

exports.updateFooter = asyncHandler(async (req, res) => {
  const existingFooter = await footerModel.findOne().lean();

  const payload = {
    ...req.body,
  };

  const parsedSchedule = parseWorkingSchedule(payload.workingSchedule);

  const fallbackTimes = extractLegacyTimes({
    ...(existingFooter || {}),
    workingSchedule: parsedSchedule || existingFooter?.workingSchedule || [],
  });

  if (parsedSchedule) {
    payload.workingSchedule = normalizeWorkingSchedule(parsedSchedule);
  } else {
    delete payload.workingSchedule;
  }

  if (payload.workingStartTime !== undefined || parsedSchedule) {
    payload.workingStartTime =
      normalizeTime(payload.workingStartTime) || fallbackTimes.startTime || "";
  }

  if (payload.workingEndTime !== undefined || parsedSchedule) {
    payload.workingEndTime =
      normalizeTime(payload.workingEndTime) || fallbackTimes.endTime || "";
  }

  const effectiveSchedule =
    payload.workingSchedule ||
    normalizeWorkingSchedule(existingFooter?.workingSchedule || []);

  const hasOpenDays = effectiveSchedule.some((day) => !day.isClosed);

  const effectiveStartTime =
    payload.workingStartTime !== undefined
      ? payload.workingStartTime
      : normalizeTime(existingFooter?.workingStartTime) ||
        fallbackTimes.startTime;

  const effectiveEndTime =
    payload.workingEndTime !== undefined
      ? payload.workingEndTime
      : normalizeTime(existingFooter?.workingEndTime) || fallbackTimes.endTime;

  if (hasOpenDays && (!effectiveStartTime || !effectiveEndTime)) {
    return res.status(400).json({
      status: false,
      message:
        "Working start time and end time are required when there are open days",
    });
  }

  const footer = await footerModel.findOneAndUpdate({}, payload, {
    new: true,
    runValidators: true,
    upsert: true,
    setDefaultsOnInsert: true,
  });

  res.status(200).json({
    status: true,
    message: "Footer saved successfully",
    data: serializeFooter(footer),
  });
});
