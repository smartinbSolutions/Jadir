const mongoose = require("mongoose");
const multilingualSchema = require("./multilingualModel");

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: multilingualSchema,
    },

    content: {
      type: multilingualSchema,
    },

    slug: {
      type: String,
      unique: true,
      index: true,
    },

    image: {
      type: String,
      default: "",
    },

    thumbnailImage: {
      type: String,
      default: "",
    },

    excerpt: {
      type: multilingualSchema,
    },

    author: {
      name: {
        type: multilingualSchema,
      },

      role: {
        type: multilingualSchema,
      },
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "category",
    },

    published: {
      type: Boolean,
      default: false,
      index: true,
    },

    tags: {
      type: [multilingualSchema],
      default: [],
    },

    relatedPosts: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "blogs",
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

blogSchema.virtual("imageUrl").get(function () {
  if (!this.image) return "";

  return `/uploads/blogs/${this.image}`;
});

blogSchema.virtual("thumbnailImageUrl").get(function () {
  if (!this.thumbnailImage) return "";

  return `/uploads/blogs/${this.thumbnailImage}`;
});

blogSchema.set("toJSON", {
  virtuals: true,
});

blogSchema.set("toObject", {
  virtuals: true,
});

module.exports = mongoose.model("blogs", blogSchema);
