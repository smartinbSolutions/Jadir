const mongoose = require("mongoose");
const multilingualSchema = require("../multilingualModel");

const partnerSchema = new mongoose.Schema(
  {
    title: { type: multilingualSchema },
    brief: { type: multilingualSchema },
    testimonial: { type: multilingualSchema },
    img: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

partnerSchema.virtual("imageUrl").get(function () {
  if (!this.img) return "";

  return `/uploads/partners/${this.img}`;
});

partnerSchema.set("toJSON", { virtuals: true });
partnerSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("partners", partnerSchema);
