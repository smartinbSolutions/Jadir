const mongoose = require("mongoose");
const multilingualSchema = require("../multilingualModel");

const footerLinks = new mongoose.Schema(
  {
    title: String,
    link: String,
  },
  { _id: false },
);

const workingScheduleDay = new mongoose.Schema(
  {
    key: {
      type: String,
      default: "",
    },

    day: {
      type: multilingualSchema,
    },

    isClosed: {
      type: Boolean,
      default: false,
    },

    order: {
      type: Number,
      default: 0,
    },

    /*
     * حقول مؤقتة للتوافق مع البيانات القديمة.
     * لن يتم إرسالها أو حفظها من لوحة التحكم الجديدة.
     */
    startTime: {
      type: String,
      default: undefined,
    },

    endTime: {
      type: String,
      default: undefined,
    },
  },
  { _id: false },
);

const footerSchema = new mongoose.Schema(
  {
    description: {
      type: multilingualSchema,
    },

    address: {
      type: multilingualSchema,
    },

    links: {
      type: [footerLinks],
      default: [],
    },

    facebook: {
      type: String,
      default: "",
    },

    instagram: {
      type: String,
      default: "",
    },

    xTwitter: {
      type: String,
      default: "",
    },

    linkedin: {
      type: String,
      default: "",
    },

    phone: {
      type: String,
      default: "",
    },

    email: {
      type: String,
      default: "",
    },

    /*
     * وقت موحّد لجميع أيام الدوام.
     */
    workingStartTime: {
      type: String,
      default: "",
    },

    workingEndTime: {
      type: String,
      default: "",
    },

    workingSchedule: {
      type: [workingScheduleDay],
      default: [],
    },

    // حقول قديمة للتوافق فقط.
    workDays: {
      type: String,
      default: "",
    },

    workingHours: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

module.exports = mongoose.model("footer", footerSchema);
