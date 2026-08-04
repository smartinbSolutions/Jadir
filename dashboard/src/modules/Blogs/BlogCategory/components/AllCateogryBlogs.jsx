import { useState } from "react";
import { Container, Tooltip } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import LoadingCard from "@/components/Global/LoadingCard";
import ErrorMessageCard from "@/components/Global/ErrorMessageCard";
import AddButton from "@/components/Global/AddButton";
import GlobalDeleteModal from "@/components/Global/GlobalDeleteModal";
import AddCategoryModal from "./AddCategoryModal";
import UpdateCategoryModal from "./UpdateCategoryModal";
import { useCategories } from "../../../hooks/useCategories";

const AllCategoryBlogs = () => {
  const {
    categories = [],
    isLoading,
    error,
    deleteCategory,
    isDeleting,
  } = useCategories({
    limit: 100,
  });

  const [openAddCategory, setOpenAddCategory] = useState(false);

  const [openUpdateCategory, setOpenUpdateCategory] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState(null);

  const [openDeleteCategory, setOpenDeleteCategory] = useState(false);

  const [categoryToDelete, setCategoryToDelete] = useState(null);

  const handleEditClick = (category) => {
    setSelectedCategory(category);
    setOpenUpdateCategory(true);
  };

  const handleCloseUpdateModal = () => {
    setOpenUpdateCategory(false);
    setSelectedCategory(null);
  };

  const handleDeleteClick = (category) => {
    setCategoryToDelete(category);
    setOpenDeleteCategory(true);
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) return;

    setOpenDeleteCategory(false);
    setCategoryToDelete(null);
  };

  const handleDelete = async () => {
    const categoryId = categoryToDelete?._id;

    if (!categoryId || isDeleting) return;

    try {
      await deleteCategory(categoryId).unwrap();

      toast.success("Category deleted successfully");

      setOpenDeleteCategory(false);
      setCategoryToDelete(null);
    } catch (err) {
      console.error(err);

      toast.error(err?.data?.message || "Failed to delete category");
    }
  };

  if (isLoading) {
    return <LoadingCard />;
  }

  if (error) {
    return <ErrorMessageCard />;
  }

  const localizedCategoriesCount = categories.filter(
    (category) =>
      category?.name?.en || category?.name?.ar || category?.name?.tr,
  ).length;

  return (
    <Container>
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl">
          <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
            <div>
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
                Blog Categories
              </span>

              <h2 className="mt-4 text-2xl font-semibold">
                Organize blog content into clear editorial groups
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
                Manage the categories used across the blog listing and article
                workflow.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-300">
                  Total Categories
                </div>

                <div className="mt-2 text-2xl font-semibold">
                  {categories.length}
                </div>
              </div>

              <div className="rounded-2xl bg-white/10 p-4 backdrop-blur-sm">
                <div className="text-xs uppercase tracking-[0.18em] text-slate-300">
                  Named
                </div>

                <div className="mt-2 text-2xl font-semibold">
                  {localizedCategoriesCount}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex justify-end">
            <AddButton
              label="New Category"
              onClick={() => setOpenAddCategory(true)}
            />
          </div>
        </div>

        <div className="card card-grid min-w-full rounded-3xl border border-gray-200 shadow-sm">
          <div className="card-header flex-wrap py-5">
            <div>
              <h3 className="card-title">Categories</h3>

              <p className="mt-1 text-sm text-gray-500">
                Showing {categories.length} available categories
              </p>
            </div>
          </div>

          <div className="card-body">
            {categories.length ? (
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {categories.map((category) => {
                  const categoryName =
                    category?.name?.en ||
                    category?.name?.ar ||
                    category?.name?.tr ||
                    "Unnamed category";

                  return (
                    <div
                      key={category?._id}
                      className="rounded-3xl border border-gray-200 bg-gray-50 p-5 shadow-sm"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <h4 className="truncate text-base font-semibold text-gray-900">
                            {categoryName}
                          </h4>

                          <div className="mt-3 flex flex-wrap gap-2">
                            {category?.name?.en ? (
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600">
                                EN
                              </span>
                            ) : null}

                            {category?.name?.ar ? (
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600">
                                AR
                              </span>
                            ) : null}

                            {category?.name?.tr ? (
                              <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-gray-600">
                                TR
                              </span>
                            ) : null}
                          </div>
                        </div>

                        <div className="flex shrink-0 items-center gap-3">
                          <Tooltip title="Edit" placement="top">
                            <button
                              type="button"
                              className="cursor-pointer"
                              onClick={() => handleEditClick(category)}
                            >
                              <i className="ki-filled ki-notepad-edit text-xl" />
                            </button>
                          </Tooltip>

                          <Tooltip title="Delete" placement="top">
                            <button
                              type="button"
                              className="cursor-pointer text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                              onClick={() => handleDeleteClick(category)}
                              disabled={isDeleting}
                            >
                              <i className="ki-filled ki-trash text-xl" />
                            </button>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
                <h4 className="text-base font-semibold text-gray-900">
                  No categories found
                </h4>

                <p className="mt-2 text-sm text-gray-500">
                  Add your first category to organize blog posts.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AddCategoryModal
        isOpen={openAddCategory}
        onClose={() => setOpenAddCategory(false)}
      />

      <UpdateCategoryModal
        isOpen={openUpdateCategory}
        onClose={handleCloseUpdateModal}
        initialCategory={selectedCategory}
      />

      <GlobalDeleteModal
        isOpen={openDeleteCategory}
        onClose={handleCloseDeleteModal}
        onDelete={handleDelete}
        butText={isDeleting ? "Deleting..." : "Delete"}
      />

      <ToastContainer />
    </Container>
  );
};

export default AllCategoryBlogs;
