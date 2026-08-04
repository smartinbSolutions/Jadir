const mongoose = require("mongoose");
const multilingualSchema = require("./multilingualModel");

const projectsSchema = new mongoose.Schema(
  {
    title: { type: multilingualSchema },
    slug: { type: String, unique: true, index: true },
    brief: { type: multilingualSchema },
    challenge: { type: multilingualSchema },
    solution: { type: multilingualSchema },
    result: { type: multilingualSchema },
    image: { type: String, default: "" },
    projectLink: { type: String, default: "" },
    order: { type: Number, default: 0 },
  },
  { timestamps: true },
);

projectsSchema.virtual("imageUrl").get(function () {
  if (!this.image) return "";

  return `/uploads/projects/${this.image}`;
});

projectsSchema.set("toJSON", {
  virtuals: true,
});

projectsSchema.set("toObject", {
  virtuals: true,
});


module.exports = mongoose.model("projects", projectsSchema);
