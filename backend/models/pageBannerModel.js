const mongoose = require("mongoose");

const PAGE_KEYS = [
  "about",
  "services",
  "projects",
  "blogs",
  "careers",
  "search",
  "contact",
  "policies",
];

const pageBannerSchema = new mongoose.Schema(
  {
    about: {
      type: String,
      default: "",
    },

    services: {
      type: String,
      default: "",
    },

    projects: {
      type: String,
      default: "",
    },

    blogs: {
      type: String,
      default: "",
    },

    careers: {
      type: String,
      default: "",
    },

    search: {
      type: String,
      default: "",
    },

    contact: {
      type: String,
      default: "",
    },

    policies: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

pageBannerSchema.virtual("imageUrls").get(function () {
  return PAGE_KEYS.reduce((result, pageKey) => {
    const storedPath = this[pageKey];

    result[pageKey] = storedPath ? `/uploads/${storedPath}` : "";

    return result;
  }, {});
});

pageBannerSchema.set("toJSON", {
  virtuals: true,
});

pageBannerSchema.set("toObject", {
  virtuals: true,
});

module.exports = mongoose.model("pageBanner", pageBannerSchema);
