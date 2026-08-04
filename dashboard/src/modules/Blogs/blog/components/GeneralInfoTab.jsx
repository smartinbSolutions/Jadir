import { useEffect, useState } from "react";
import { Alert } from "@/components";
import { CrudAvatarUpload } from "../../../../partials/crud/CrudAvatarUpload";
import { useCategories } from "../../../hooks/useCategories";
import { useBlogs } from "../../../hooks/useBlogs";
import MultiSelect from "../../../../components/MultiSelect";

const GeneralInfoTab = ({
  category,
  setCategory,
  published,
  setPublished,

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

  relatedPosts,
  setRelatedPosts,

  currentBlogId,
}) => {
  const {
    categories = [],
    isLoading,
    error,
  } = useCategories({
    limit: 100,
  });

  const { blogs: allBlogs = [], isLoading: isBlogsLoading } = useBlogs({
    limit: 200,
  });

  const normalizedRelatedPosts = (relatedPosts || [])
    .map((item) => {
      if (typeof item === "string") {
        return allBlogs.find((blog) => blog?._id === item) || null;
      }

      return item;
    })
    .filter(Boolean);

  const [tagsInput, setTagsInput] = useState({
    en: (tagsEN || []).join(", "),
    ar: (tagsAR || []).join(", "),
    tr: (tagsTR || []).join(", "),
  });

  useEffect(() => {
    setTagsInput({
      en: (tagsEN || []).join(", "),
      ar: (tagsAR || []).join(", "),
      tr: (tagsTR || []).join(", "),
    });
  }, [tagsEN, tagsAR, tagsTR]);

  const handleTagsBlur = (lang) => {
    const tagsArray = (tagsInput[lang] || "")
      .split(",")
      .map((tag) => tag.trim())
      .filter(Boolean);

    if (lang === "en") {
      setTagsEN(tagsArray);
    }

    if (lang === "ar") {
      setTagsAR(tagsArray);
    }

    if (lang === "tr") {
      setTagsTR(tagsArray);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid items-start gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        {/* Left column */}
        <div className="self-start space-y-6">
          {/* Publishing setup */}
          <div className="h-fit rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-gray-900">
                Publishing Setup
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Assign the post to a category and control its publishing state.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Blog Category
                </label>

                <select
                  name="category"
                  value={category || ""}
                  onChange={(event) => setCategory(event.target.value)}
                  className="input"
                  disabled={isLoading || Boolean(error)}
                >
                  <option value="">Select Category</option>

                  {categories.map((categoryItem) => (
                    <option key={categoryItem?._id} value={categoryItem?._id}>
                      {categoryItem?.name?.en ||
                        categoryItem?.name?.ar ||
                        categoryItem?.name?.tr ||
                        "Unnamed category"}
                    </option>
                  ))}
                </select>

                {error ? (
                  <Alert variant="danger" className="mt-3">
                    Failed to load categories
                  </Alert>
                ) : null}
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Published
                </label>

                <select
                  className="input"
                  value={published ? "true" : "false"}
                  onChange={(event) =>
                    setPublished(event.target.value === "true")
                  }
                >
                  <option value="false">Draft</option>
                  <option value="true">Published</option>
                </select>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="h-fit rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-gray-900">Tags</h3>

              <p className="mt-1 text-sm text-gray-500">
                Add comma-separated tags for each language to improve
                organization and discovery.
              </p>
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              {["en", "ar", "tr"].map((lang) => (
                <div
                  key={lang}
                  className="rounded-2xl border border-gray-200 bg-gray-50 p-4"
                >
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                    Tags ({lang.toUpperCase()})
                  </label>

                  <input
                    type="text"
                    name={`tags-${lang}`}
                    className="input"
                    dir={lang === "ar" ? "rtl" : "ltr"}
                    placeholder={`Comma-separated (${lang.toUpperCase()})`}
                    value={tagsInput[lang] || ""}
                    onChange={(event) =>
                      setTagsInput((prev) => ({
                        ...prev,
                        [lang]: event.target.value,
                      }))
                    }
                    onBlur={() => handleTagsBlur(lang)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter") {
                        event.preventDefault();
                        event.currentTarget.blur();
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Related posts */}
          <div className="h-fit rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-gray-900">
                Related Posts
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Connect supporting or follow-up posts so readers can navigate
                across related content.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Select Related Posts
              </label>

              <div className="w-full">
                <MultiSelect
                  options={allBlogs.filter(
                    (item) => item?._id && item._id !== currentBlogId,
                  )}
                  selected={normalizedRelatedPosts}
                  onChange={setRelatedPosts}
                  placeholder={
                    isBlogsLoading ? "Loading blogs..." : "Select related posts"
                  }
                />
              </div>
            </div>
          </div>
        </div>

        {/* Images column */}
        <div className="self-start space-y-6">
          {/* Cover image */}
          <div className="h-fit rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Cover Image
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Main visual for the blog page and article header.
              </p>
            </div>

            <div className="p-2">
              <CrudAvatarUpload
                onChange={onCoverChange}
                value={coverPreview}
                initialImageURL={
                  typeof coverPreview === "string" ? coverPreview : ""
                }
                adviceMessage="Cover Image | Max 1MB | Aspect Ratio 16:9"
              />
            </div>
          </div>

          {/* Thumbnail image */}
          <div className="h-fit rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Thumbnail Image
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Compact visual used in listings and cards.
              </p>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  onThumbnailsChange({
                    target: {
                      files: file ? [file] : [],
                    },
                  });

                  event.target.value = "";
                }}
                className="mb-4 block w-full text-sm text-gray-600"
              />

              {thumbnailPreviews?.length > 0 ? (
                <ul className="space-y-2">
                  {thumbnailPreviews.map((file, index) => (
                    <li
                      key={file?.name || `${file}-${index}`}
                      className="flex items-center justify-between gap-3 rounded-xl bg-white p-3"
                    >
                      <span className="min-w-0 flex-1 truncate text-sm text-gray-700">
                        {file?.name || "Current thumbnail"}
                      </span>

                      <button
                        type="button"
                        onClick={() =>
                          onThumbnailsChange({
                            target: {
                              files: [],
                            },
                          })
                        }
                        className="shrink-0 font-bold text-red-500 hover:text-red-700"
                        aria-label="Remove thumbnail"
                      >
                        ×
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-gray-500">
                  No thumbnail selected yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GeneralInfoTab;
