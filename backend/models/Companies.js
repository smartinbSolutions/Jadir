const mongoose = require("mongoose");
const multilingualSchema = require("./multilingualModel");

const companiesSchema = new mongoose.Schema(
  {
    name: {
      type: multilingualSchema,
    },

    logo: {
      type: String,
      default: "",
    },

    brief: {
      type: multilingualSchema,
    },

    testimonial: {
      type: multilingualSchema,
    },

    slug: {
      type: String,
      default: "",
      index: true,
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

companiesSchema.virtual("imageUrl").get(function () {
  if (!this.logo) return "";

  return `/uploads/companies/${this.logo}`;
});

companiesSchema.set("toJSON", {
  virtuals: true,
});

companiesSchema.set("toObject", {
  virtuals: true,
});

module.exports = mongoose.model("companies", companiesSchema);
