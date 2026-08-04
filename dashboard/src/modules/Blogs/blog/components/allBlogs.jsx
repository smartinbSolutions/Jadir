import { useState } from "react";
import { useNavigate } from "react-router";
import { Container } from "@/components/container";
import { Tooltip } from "@mui/material";
import { toast, ToastContainer } from "react-toastify";
import LoadingCard from "../../../../components/Global/LoadingCard";
import AddButton from "../../../../components/Global/AddButton";
import Pagination from "../../../../components/Global/Pagination";
import PageSizeSelector from "../../../../components/Global/PageSizeSelector";
import ErrorMessageCard from "../../../../components/Global/ErrorMessageCard";
import GlobalDeleteModal from "../../../../components/Global/GlobalDeleteModal";
import { useBlogs } from "../../../hooks/useBlogs";
import getImageUrl from "../../../../utils/getImageUrl";

const AllEmployees = () => {
  const navigate = useNavigate();

  const [perPage, setPerPage] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const [searchQuery, setSearchQuery] = useState("");
  const [query, setQuery] = useState("");

  const [showDelete, setShowDelete] = useState(false);
  const [selectedId, setSelectedId] = useState(null);

  const {
    blogs = [],
    pagination,
    isLoading,
    error,
    refetch,
    updateBlog,
    deleteBlog,
    isDeleting,
  } = useBlogs({
    page: currentPage,
    limit: perPage,
    keyword: query,
  });

  const handleDelete = async () => {
    if (!selectedId || isDeleting) return;

    try {
      await deleteBlog(selectedId).unwrap();

      toast.success("Blog deleted successfully");

      setShowDelete(false);
      setSelectedId(null);
    } catch (err) {
      console.error(err);

      toast.error(err?.data?.message || "Failed to delete blog");
    }
  };

  const handleCloseDeleteModal = () => {
    if (isDeleting) return;

    setShowDelete(false);
    setSelectedId(null);
  };

  const handleSwitchPublish = async (id, currentPublished) => {
    try {
      await updateBlog({
        id,
        data: {
          published: !currentPublished,
        },
      }).unwrap();

      toast.success(
        `Blog ${!currentPublished ? "published" : "unpublished"} successfully`,
      );
    } catch (err) {
      console.error(err);

      toast.error(err?.data?.message || "Failed to update publishing status");
    }
  };

  const handleSearch = () => {
    setQuery(searchQuery.trim());
    setCurrentPage(1);
  };

  const onEnterHit = (event) => {
    if (event.key === "Enter") {
      handleSearch();
    }
  };

  if (isLoading) {
    return <LoadingCard />;
  }

  if (error) {
    return <ErrorMessageCard />;
  }

  return (
    <Container>
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl">
          <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
            <div>
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
                Blog Management
              </span>

              <h2 className="mt-4 text-2xl font-semibold">
                Manage articles, publishing state, and editorial coverage
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
                Browse posts faster, filter the list, and move from draft to
                published content without working through a plain table.
              </p>
            </div>
          </div>
        </div>

        {/* Search and actions */}
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid items-end gap-4 lg:grid-cols-[minmax(0,1fr)_auto]">
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Search Blogs
              </label>

              <div className="relative">
                <i className="ki-outline ki-magnifier absolute left-3 top-1/2 -translate-y-1/2 text-md text-gray-500" />

                <input
                  className="input h-[42px] w-full pl-10"
                  type="text"
                  placeholder="Search by title or keyword and press Enter"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  onKeyDown={onEnterHit}
                />
              </div>
            </div>

            <div className="flex h-[42px] items-stretch gap-3">
              <button
                type="button"
                className="btn btn-light-primary h-[42px] min-h-0"
                onClick={refetch}
              >
                <i className="ki-outline ki-arrows-circle mr-1" />
                Refresh
              </button>

              <div className="h-[42px] [&_button]:h-[42px] [&_button]:min-h-0">
                <AddButton
                  label="New Blog"
                  onClick={() => navigate("/add-blog")}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Blogs table */}
        <div className="card card-grid min-w-full rounded-3xl border border-gray-200 shadow-sm">
          <div className="card-header flex-wrap py-5">
            <div>
              <h3 className="card-title">Blogs</h3>

              <p className="mt-1 text-sm text-gray-500">
                Showing {blogs.length} posts on this page
              </p>
            </div>
          </div>

          <div className="card-body">
            <div className="scrollable-x-auto">
              <table className="table table-auto table-border" id="blogs_table">
                <thead>
                  <tr>
                    <th className="min-w-[110px]">Image</th>
                    <th className="min-w-[240px]">Title</th>
                    <th className="min-w-[150px]">Category</th>
                    <th className="min-w-[220px]">Tags</th>
                    <th className="min-w-[150px]">Status</th>
                    <th className="min-w-[200px]">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {blogs.length > 0 ? (
                    blogs.map((blog) => {
                      const title =
                        blog?.title?.en ||
                        blog?.title?.ar ||
                        blog?.title?.tr ||
                        "No Title";

                      const authorName =
                        typeof blog?.author?.name === "string"
                          ? blog.author.name
                          : blog?.author?.name?.en ||
                            blog?.author?.name?.ar ||
                            blog?.author?.name?.tr ||
                            "No author";

                      const authorRole =
                        blog?.author?.role?.en ||
                        blog?.author?.role?.ar ||
                        blog?.author?.role?.tr ||
                        "";

                      const categoryName =
                        blog?.category?.name?.en ||
                        blog?.category?.name?.ar ||
                        blog?.category?.name?.tr ||
                        blog?.category?.toString() ||
                        "-";

                      const blogImagePath =
                        blog?.thumbnailImageUrl || blog?.imageUrl || "";

                      const blogImageUrl = blogImagePath
                        ? getImageUrl(blogImagePath)
                        : "";

                      return (
                        <tr key={blog?._id}>
                          <td>
                            <div className="relative h-[64px] w-[84px]">
                              {blogImageUrl ? (
                                <img
                                  src={blogImageUrl}
                                  alt={title}
                                  className="h-[64px] w-[84px] rounded-lg border border-gray-200 object-cover"
                                  loading="lazy"
                                  onError={(event) => {
                                    event.currentTarget.style.display = "none";

                                    event.currentTarget.nextElementSibling?.classList.remove(
                                      "hidden",
                                    );
                                  }}
                                />
                              ) : null}

                              <div
                                className={`h-[64px] w-[84px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-2 text-center text-xs text-gray-400 ${
                                  blogImageUrl ? "hidden" : "flex"
                                }`}
                              >
                                No image
                              </div>
                            </div>
                          </td>
                          <td>
                            <div className="space-y-1">
                              <span className="text-sm font-medium text-gray-800">
                                {title}
                              </span>

                              <div className="text-xs text-gray-500">
                                {authorName}
                                {authorRole ? ` • ${authorRole}` : ""}
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="badge badge-outline">
                              {categoryName}
                            </span>
                          </td>

                          <td>
                            {blog?.tags?.length ? (
                              <div className="flex flex-wrap gap-1">
                                {blog.tags.slice(0, 3).map((tag, index) => (
                                  <span
                                    key={
                                      tag?._id || `${blog?._id}-tag-${index}`
                                    }
                                    className="rounded bg-gray-200 px-2 py-1 text-xs text-gray-700"
                                  >
                                    {tag?.en || tag?.ar || tag?.tr || "-"}
                                  </span>
                                ))}

                                {blog.tags.length > 3 ? (
                                  <span className="rounded bg-gray-100 px-2 py-1 text-xs text-gray-600">
                                    +{blog.tags.length - 3} more
                                  </span>
                                ) : null}
                              </div>
                            ) : (
                              <span className="text-sm text-gray-400">
                                No tags
                              </span>
                            )}
                          </td>

                          <td>
                            {blog?.published ? (
                              <span className="badge badge-outline badge-primary">
                                Published
                              </span>
                            ) : (
                              <span className="badge badge-outline badge-warning">
                                Draft
                              </span>
                            )}
                          </td>

                          <td>
                            <div className="flex items-center gap-3">
                              <Tooltip title="Edit" placement="top">
                                <button
                                  type="button"
                                  className="cursor-pointer"
                                  onClick={() =>
                                    navigate(`/update-blog/${blog?._id}`)
                                  }
                                >
                                  <i className="ki-filled ki-notepad-edit text-xl" />
                                </button>
                              </Tooltip>

                              <Tooltip
                                title={
                                  blog?.published ? "Unpublish" : "Publish"
                                }
                                placement="top"
                              >
                                <button
                                  type="button"
                                  className="cursor-pointer"
                                  onClick={() =>
                                    handleSwitchPublish(
                                      blog?._id,
                                      blog?.published,
                                    )
                                  }
                                >
                                  {blog?.published ? (
                                    <i className="ki-duotone ki-cross-circle text-xl text-danger" />
                                  ) : (
                                    <i className="ki-filled ki-check-squared text-xl text-success" />
                                  )}
                                </button>
                              </Tooltip>

                              <Tooltip title="Delete" placement="top">
                                <button
                                  type="button"
                                  className="cursor-pointer text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                                  onClick={() => {
                                    setSelectedId(blog?._id);
                                    setShowDelete(true);
                                  }}
                                  disabled={isDeleting}
                                >
                                  <i className="ki-filled ki-trash text-xl" />
                                </button>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-6 text-center text-gray-500"
                      >
                        No records
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card-footer flex flex-col justify-center gap-3 text-2sm font-medium text-gray-600 md:flex-row md:justify-between">
            <PageSizeSelector
              perPage={perPage}
              setPerPage={(value) => {
                setPerPage(value);
                setCurrentPage(1);
              }}
            />

            <Pagination
              currentPage={currentPage}
              totalPages={pagination?.totalPages || 1}
              setCurrentPage={setCurrentPage}
            />
          </div>
        </div>
      </div>

      <GlobalDeleteModal
        isOpen={showDelete}
        onClose={handleCloseDeleteModal}
        onDelete={handleDelete}
        butText={isDeleting ? "Deleting..." : "Delete"}
      />

      <ToastContainer />
    </Container>
  );
};

export default AllEmployees;
