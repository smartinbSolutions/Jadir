const mongoose = require("mongoose");
const multilingualSchema = require("../multilingualModel");

const multilingualArraySchema = new mongoose.Schema(
  {
    ar: { type: [String], default: [] },
    en: { type: [String], default: [] },
    tr: { type: [String], default: [] },
  },
  { _id: false },
);

const testimonialSchema = new mongoose.Schema(
  {
    clientName: { type: multilingualSchema },
    clientRole: { type: multilingualSchema },
    quote: { type: multilingualSchema },
  },
  { _id: false },
);

const serviceSchema = new mongoose.Schema(
  {
    title: { type: multilingualSchema },
    bannerImage: { type: String, default: "" },
    description: { type: multilingualSchema },
    features: { type: multilingualArraySchema },
    steps: { type: multilingualArraySchema },
    targetingSectors: { type: multilingualArraySchema },
    relatedProjects: [
      { type: mongoose.Schema.Types.ObjectId, ref: "projects" },
    ],
    testimonials: { type: [testimonialSchema], default: [] },
    relatedServices: [{ type: mongoose.Schema.Types.ObjectId, ref: "service" }],
    slug: { type: String, unique: true, index: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

serviceSchema.virtual("bannerImageUrl").get(function () {
  if (!this.bannerImage) return "";

  return `/uploads/ourServices/${this.bannerImage}`;
});

serviceSchema.set("toJSON", {
  virtuals: true,
});

serviceSchema.set("toObject", {
  virtuals: true,
});

module.exports = mongoose.model("service", serviceSchema);
