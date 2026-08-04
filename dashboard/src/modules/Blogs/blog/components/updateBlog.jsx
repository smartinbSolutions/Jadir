import { Container } from "@mui/material";
import { ToastContainer } from "react-toastify";
import Tabs from "../../../../components/Global/Tabs";
import LoadingCard from "../../../../components/Global/LoadingCard";
import ErrorMessageCard from "../../../../components/Global/ErrorMessageCard";
import BlogLangForm from "./BlogLangForm";
import GeneralInfoTab from "./GeneralInfoTab";
import useUpdateBlog from "../hooks/useUpdateBlog";

const BLOG_LANGUAGES = ["en", "ar", "tr"];

const UpdateBlog = () => {
  const {
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

    coverPreview,
    handleCoverChange,

    thumbnailPreviews,
    handleThumbnailsChange,

    handleSubmit,

    isPageLoading,
    isUpdating,
    error,
  } = useUpdateBlog();

  if (isPageLoading) {
    return <LoadingCard />;
  }

  if (error) {
    return <ErrorMessageCard />;
  }

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
          currentBlogId={id}
          tagsEN={tagsEN}
          setTagsEN={setTagsEN}
          tagsAR={tagsAR}
          setTagsAR={setTagsAR}
          tagsTR={tagsTR}
          setTagsTR={setTagsTR}
          coverPreview={coverPreview}
          onCoverChange={handleCoverChange}
          thumbnailPreviews={thumbnailPreviews}
          onThumbnailsChange={handleThumbnailsChange}
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
              onClick={handleSubmit}
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Update Blog"}
            </button>
          </div>
        </div>
      </div>

      <ToastContainer pauseOnHover />
    </Container>
  );
};

export default UpdateBlog;
