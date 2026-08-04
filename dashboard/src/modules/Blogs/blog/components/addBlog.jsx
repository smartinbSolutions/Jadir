import { Container } from "@mui/material";
import { ToastContainer } from "react-toastify";
import Tabs from "../../../../components/Global/Tabs";
import BlogLangForm from "./BlogLangForm";
import GeneralInfoTab from "./GeneralInfoTab";
import { useCreateBlog } from "../hooks/useCreateBlog";

const BLOG_LANGUAGES = ["en", "ar", "tr"];

const AddBlog = () => {
  const {
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
    isLoading,
    error,
  } = useCreateBlog();

  const tabConfig = [
    {
      key: "tab_info",
      label: "General Info",
      icon: "ki-outline ki-user-square",
      content: (
        <GeneralInfoTab
          category={category}
          setCategory={setCategory}
          published={published}
          setPublished={setPublished}
          relatedPosts={relatedPosts}
          setRelatedPosts={setRelatedPosts}
          tagsEN={tagsEN}
          setTagsEN={setTagsEN}
          tagsAR={tagsAR}
          setTagsAR={setTagsAR}
          tagsTR={tagsTR}
          setTagsTR={setTagsTR}
          coverPreview={coverPreview}
          onCoverChange={onCoverChange}
          thumbnailPreviews={thumbnailPreviews}
          onThumbnailsChange={onThumbnailsChange}
        />
      ),
    },

    ...BLOG_LANGUAGES.map((language) => ({
      key: `blog_${language}`,
      label: `Blog ${language.toUpperCase()}`,
      icon: "ki-outline ki-clipboard",
      content: (
        <BlogLangForm
          language={language}
          value={blogData?.[language]}
          onChange={handleLangChange}
        />
      ),
    })),
  ];

  return (
    <Container>
      <div className="space-y-6">
        <Tabs tabs={tabConfig} />

        <div className="sticky bottom-4 z-20 mt-6 flex justify-end">
          <div className="rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur">
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Create Blog"}
            </button>
          </div>
        </div>

        {error ? (
          <p className="mt-2 text-red-500">
            {error?.data?.message ||
              "Failed to create blog. Check console for details."}
          </p>
        ) : null}
      </div>

      <ToastContainer pauseOnHover />
    </Container>
  );
};

export default AddBlog;
