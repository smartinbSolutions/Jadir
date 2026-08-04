import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useBlogs } from "../../../hooks/useBlogs";

const createEmptyBlogData = () => ({
  en: {
    title: "",
    excerpt: "",
    authorName: "",
    authorRole: "",
    content: "",
  },

  ar: {
    title: "",
    excerpt: "",
    authorName: "",
    authorRole: "",
    content: "",
  },

  tr: {
    title: "",
    excerpt: "",
    authorName: "",
    authorRole: "",
    content: "",
  },
});

const buildMultilingualTags = (tagsEN = [], tagsAR = [], tagsTR = []) => {
  const maxLength = Math.max(tagsEN.length, tagsAR.length, tagsTR.length);

  return Array.from({ length: maxLength }, (_, index) => ({
    en: tagsEN[index] || "",
    ar: tagsAR[index] || "",
    tr: tagsTR[index] || "",
  })).filter((tag) => tag.en || tag.ar || tag.tr);
};

export const useCreateBlog = () => {
  const navigate = useNavigate();

  const { postBlog, isPosting, error } = useBlogs();

  const [blogData, setBlogData] = useState(createEmptyBlogData);

  const [category, setCategory] = useState("");
  const [published, setPublished] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState([]);

  const [tagsEN, setTagsEN] = useState([]);
  const [tagsAR, setTagsAR] = useState([]);
  const [tagsTR, setTagsTR] = useState([]);

  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreviews, setThumbnailPreviews] = useState([]);

  const resetForm = () => {
    setBlogData(createEmptyBlogData());

    setCategory("");
    setPublished(false);
    setRelatedPosts([]);

    setTagsEN([]);
    setTagsAR([]);
    setTagsTR([]);

    setCoverImage(null);
    setCoverPreview(null);

    setThumbnailFile(null);
    setThumbnailPreviews([]);
  };

  const handleLangChange = (lang, data) => {
    setBlogData((prev) => ({
      ...prev,

      [lang]: {
        ...prev[lang],
        ...data,
      },
    }));
  };

  const onCoverChange = (selectedAvatar) => {
    const file = selectedAvatar?.[0]?.file;

    if (file) {
      setCoverImage(file);

      setCoverPreview(URL.createObjectURL(file));

      return;
    }

    setCoverImage(null);
    setCoverPreview(null);
  };

  const onThumbnailsChange = (event) => {
    const files = Array.from(event?.target?.files || []);

    const firstFile = files[0] || null;

    setThumbnailFile(firstFile);

    setThumbnailPreviews(firstFile ? [firstFile] : []);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      const title = {
        en: blogData.en?.title || "",
        ar: blogData.ar?.title || "",
        tr: blogData.tr?.title || "",
      };

      const content = {
        en: blogData.en?.content || "",
        ar: blogData.ar?.content || "",
        tr: blogData.tr?.content || "",
      };

      const excerpt = {
        en: blogData.en?.excerpt || "",
        ar: blogData.ar?.excerpt || "",
        tr: blogData.tr?.excerpt || "",
      };

      const author = {
        name: {
          en: blogData.en?.authorName || "",
          ar: blogData.ar?.authorName || "",
          tr: blogData.tr?.authorName || "",
        },

        role: {
          en: blogData.en?.authorRole || "",
          ar: blogData.ar?.authorRole || "",
          tr: blogData.tr?.authorRole || "",
        },
      };

      const tags = buildMultilingualTags(tagsEN, tagsAR, tagsTR);

      const relatedPostIds = relatedPosts
        .map((post) =>
          typeof post === "string" ? post : post?._id || post?.id,
        )
        .filter(Boolean);

      formData.append("title", JSON.stringify(title));

      formData.append("content", JSON.stringify(content));

      formData.append("excerpt", JSON.stringify(excerpt));

      formData.append("author", JSON.stringify(author));

      formData.append("tags", JSON.stringify(tags));

      formData.append("relatedPosts", JSON.stringify(relatedPostIds));

      if (category) {
        formData.append("category", category);
      }

      formData.append("published", published ? "true" : "false");

      if (coverImage instanceof File) {
        formData.append("image", coverImage);
      }

      if (thumbnailFile instanceof File) {
        formData.append("thumbnailImage", thumbnailFile);
      }

      await postBlog(formData).unwrap();

      toast.success("Blog added successfully");

      resetForm();

      setTimeout(() => {
        navigate("/all-blogs");
      }, 1200);
    } catch (err) {
      console.error(err);

      toast.error(err?.data?.message || "Failed to create blog");
    }
  };

  return {
    blogData,
    handleLangChange,

    category,
    setCategory,

    published,
    setPublished,

    relatedPosts,
    setRelatedPosts,

    tagsEN,
    setTagsEN,

    tagsAR,
    setTagsAR,

    tagsTR,
    setTagsTR,

    coverPreview,
    onCoverChange,

    thumbnailPreviews,
    onThumbnailsChange,

    handleSave,
    resetForm,

    isLoading: isPosting,
    error,
  };
};
