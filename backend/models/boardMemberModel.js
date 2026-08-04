const mongoose = require("mongoose");
const multilingualSchema = require("./multilingualModel");

const boardMemberSchema = new mongoose.Schema(
  {
    name: {
      type: multilingualSchema,
    },
    bio: {
      type: multilingualSchema,
    },
    position: {
      type: multilingualSchema,
    },
    image: {
      type: String,
      default: "",
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    isFounder: {
      type: Boolean,
      default: false,
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

boardMemberSchema.virtual("imageUrl").get(function () {
  if (!this.image) return "";

  return `/uploads/boardMember/${this.image}`;
});

boardMemberSchema.set("toJSON", {
  virtuals: true,
});

boardMemberSchema.set("toObject", {
  virtuals: true,
});

module.exports = mongoose.model("boardMember", boardMemberSchema);
