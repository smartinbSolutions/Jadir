const mongoose = require("mongoose");

const homeSliderSchema = new mongoose.Schema(
  {
    img: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

homeSliderSchema.virtual("imageUrl").get(function () {
  if (!this.img) return "";

  return `/uploads/homeSlider/${this.img}`;
});

homeSliderSchema.set("toJSON", { virtuals: true });
homeSliderSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("homeSlider", homeSliderSchema);
