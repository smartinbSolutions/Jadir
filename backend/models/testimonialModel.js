const mongoose = require("mongoose");
const multilingualSchema = require("./multilingualModel");

const testimonialSchema = new mongoose.Schema(
  {
    name: { type: multilingualSchema },
    role: { type: multilingualSchema },
    company: { type: multilingualSchema },
    content: { type: multilingualSchema },

    image: {
      type: String,
      default: "",
    },

    rating: {
      type: Number,
      default: 5,
      min: 1,
      max: 5,
    },

    isFeatured: {
      type: Boolean,
      default: false,
    },

    order: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true },
);

testimonialSchema.virtual("imageUrl").get(function () {
  if (!this.image) return "";

  return `/uploads/testimonials/${this.image}`;
});

testimonialSchema.set("toJSON", {
  virtuals: true,
});

testimonialSchema.set("toObject", {
  virtuals: true,
});

module.exports = mongoose.model("testimonial", testimonialSchema);
