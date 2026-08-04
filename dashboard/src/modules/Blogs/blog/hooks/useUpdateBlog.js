import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { useBlogs, useOneBlog } from "../../../hooks/useBlogs";
import getImageUrl from "../../../../utils/getImageUrl";

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

const buildTagsByLanguage = (tags = []) => ({
  en: tags.map((tag) => tag?.en || "").filter(Boolean),

  ar: tags.map((tag) => tag?.ar || "").filter(Boolean),

  tr: tags.map((tag) => tag?.tr || "").filter(Boolean),
});

const buildMultilingualTags = (tagsEN = [], tagsAR = [], tagsTR = []) => {
  const maxLength = Math.max(tagsEN.length, tagsAR.length, tagsTR.length);

  return Array.from({ length: maxLength }, (_, index) => ({
    en: tagsEN[index] || "",
    ar: tagsAR[index] || "",
    tr: tagsTR[index] || "",
  })).filter((tag) => tag.en || tag.ar || tag.tr);
};

const getLocalizedAuthorName = (authorName, language) => {
  // يدعم مؤقتًا البيانات القديمة التي كان فيها الاسم String
  if (typeof authorName === "string") {
    return authorName;
  }

  return authorName?.[language] || "";
};

const useUpdateBlog = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const coverPreviewUrlRef = useRef(null);

  const { blog, isLoading, error } = useOneBlog(id);

  const { updateBlog, isUpdating } = useBlogs();

  const [category, setCategory] = useState("");
  const [published, setPublished] = useState(false);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [removeCoverImage, setRemoveCoverImage] = useState(false);
  const [removeThumbnailImage, setRemoveThumbnailImage] = useState(false);
  const [tagsEN, setTagsEN] = useState([]);
  const [tagsAR, setTagsAR] = useState([]);
  const [tagsTR, setTagsTR] = useState([]);

  const [coverImage, setCoverImage] = useState(null);
  const [coverPreview, setCoverPreview] = useState(null);

  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreviews, setThumbnailPreviews] = useState([]);

  const [blogData, setBlogData] = useState(createEmptyBlogData);

  const revokeCoverPreview = () => {
    if (!coverPreviewUrlRef.current) return;

    URL.revokeObjectURL(coverPreviewUrlRef.current);

    coverPreviewUrlRef.current = null;
  };

  useEffect(() => {
    if (!blog) return;

    revokeCoverPreview();

    const tagsByLanguage = buildTagsByLanguage(blog?.tags || []);

    setCategory(blog?.category?._id || blog?.category || "");

    setPublished(Boolean(blog?.published));
    setRemoveCoverImage(false);
    setRemoveThumbnailImage(false);
    setRelatedPosts(Array.isArray(blog?.relatedPosts) ? blog.relatedPosts : []);

    setTagsEN(tagsByLanguage.en);
    setTagsAR(tagsByLanguage.ar);
    setTagsTR(tagsByLanguage.tr);

    setCoverImage(null);

    setCoverPreview(blog?.imageUrl ? getImageUrl(blog.imageUrl) : null);

    setThumbnailFile(null);

    setThumbnailPreviews(
      blog?.thumbnailImageUrl ? [getImageUrl(blog.thumbnailImageUrl)] : [],
    );

    setBlogData({
      en: {
        title: blog?.title?.en || "",
        excerpt: blog?.excerpt?.en || "",

        authorName: getLocalizedAuthorName(blog?.author?.name, "en"),

        authorRole: blog?.author?.role?.en || "",

        content: blog?.content?.en || "",
      },

      ar: {
        title: blog?.title?.ar || "",
        excerpt: blog?.excerpt?.ar || "",

        authorName: getLocalizedAuthorName(blog?.author?.name, "ar"),

        authorRole: blog?.author?.role?.ar || "",

        content: blog?.content?.ar || "",
      },

      tr: {
        title: blog?.title?.tr || "",
        excerpt: blog?.excerpt?.tr || "",

        authorName: getLocalizedAuthorName(blog?.author?.name, "tr"),

        authorRole: blog?.author?.role?.tr || "",

        content: blog?.content?.tr || "",
      },
    });
  }, [blog]);

  useEffect(() => {
    return () => {
      revokeCoverPreview();
    };
  }, []);

  const handleLangChange = (lang, data) => {
    setBlogData((prev) => ({
      ...prev,

      [lang]: {
        ...prev[lang],
        ...data,
      },
    }));
  };

  const handleCoverChange = (selectedAvatar) => {
    const file = selectedAvatar?.[0]?.file;

    revokeCoverPreview();

    if (file) {
      const temporaryUrl = URL.createObjectURL(file);

      coverPreviewUrlRef.current = temporaryUrl;

      setCoverImage(file);
      setCoverPreview(temporaryUrl);
      setRemoveCoverImage(false);

      return;
    }

    // المستخدم ضغط زر الحذف
    setCoverImage(null);
    setCoverPreview(null);
    setRemoveCoverImage(true);
  };

  const handleThumbnailsChange = (event) => {
    const files = Array.from(event?.target?.files || []);
    const firstFile = files[0] || null;

    if (firstFile) {
      setThumbnailFile(firstFile);
      setThumbnailPreviews([firstFile]);
      setRemoveThumbnailImage(false);

      return;
    }

    // المستخدم ضغط زر الحذف
    setThumbnailFile(null);
    setThumbnailPreviews([]);
    setRemoveThumbnailImage(true);
  };

  const handleSubmit = async () => {
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
        .filter((postId) => postId && String(postId) !== String(id));

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
      } else if (removeCoverImage) {
        formData.append("removeImage", "true");
      }

      if (thumbnailFile instanceof File) {
        formData.append("thumbnailImage", thumbnailFile);
      } else if (removeThumbnailImage) {
        formData.append("removeThumbnailImage", "true");
      }

      await updateBlog({
        id,
        data: formData,
      }).unwrap();

      toast.success("Blog updated successfully");

      setTimeout(() => {
        navigate("/all-blogs");
      }, 1200);
    } catch (err) {
      console.error(err);

      toast.error(err?.data?.message || "Failed to update blog");
    }
  };

  return {
    id,

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

    coverImage,
    coverPreview,
    handleCoverChange,

    thumbnailFile,
    thumbnailPreviews,
    handleThumbnailsChange,

    handleSubmit,

    isPageLoading: isLoading,
    isUpdating,
    error,
  };
};

export default useUpdateBlog;
