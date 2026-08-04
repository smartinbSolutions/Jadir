import { Container, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useOurServices } from "../../hooks/useOurServices";
import LoadingCard from "../../../components/Global/LoadingCard";
import ErrorMessageCard from "../../../components/Global/ErrorMessageCard";
import AddButton from "../../../components/Global/AddButton";
import getImageUrl from "../../../utils/getImageUrl";

const getPlainText = (html = "") => {
  if (!html) return "";

  const documentContent = new DOMParser().parseFromString(html, "text/html");

  return documentContent.body.textContent?.trim() || "";
};

const getLocalizedValue = (value = {}) =>
  value?.en || value?.ar || value?.tr || "";

const AllOurServices = () => {
  const navigate = useNavigate();

  const {
    services = [],
    isLoading,
    error,
    deleteOurService,
    isDeleting,
  } = useOurServices({
    limit: 100,
  });

  const handleDelete = async (id) => {
    try {
      await deleteOurService(id).unwrap();

      toast.success("Service deleted successfully");
    } catch (err) {
      console.error(err);

      toast.error(err?.data?.message || "Failed to delete service");
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
                Service Catalog
              </span>

              <h2 className="mt-4 text-2xl font-semibold">
                Manage core service pages with the same polished overview as
                board members
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
                Review service visibility, linked projects, and localized copy
                from a cleaner, more consistent admin surface.
              </p>
            </div>
          </div>
        </div>

        <div className="card card-grid min-w-full rounded-3xl border border-gray-200 shadow-sm">
          <div className="card-header flex-wrap py-5">
            <div>
              <h3 className="card-title">Services List</h3>

              <p className="mt-1 text-sm text-gray-500">
                Showing {services.length} service pages
              </p>
            </div>

            <AddButton
              label="New Service"
              onClick={() => navigate("/add-our-service")}
            />
          </div>

          <div className="card-body">
            <div className="scrollable-x-auto">
              <table className="table table-auto table-border" id="grid_table">
                <thead>
                  <tr>
                    <th className="min-w-[110px]">Banner</th>
                    <th className="min-w-[220px]">Title</th>
                    <th className="min-w-[120px]">Projects</th>
                    <th className="min-w-[260px]">Description</th>
                    <th className="min-w-[100px]">Order</th>
                    <th className="min-w-[100px]">Status</th>
                    <th className="w-[120px]">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {services.map((service) => {
                    const title = getLocalizedValue(service?.title) || "-";

                    const descriptionHtml = getLocalizedValue(
                      service?.description,
                    );

                    const description = getPlainText(descriptionHtml) || "-";

                    const bannerUrl = service?.bannerImageUrl
                      ? getImageUrl(service.bannerImageUrl)
                      : "";

                    return (
                      <tr key={service?._id}>
                        <td>
                          <div className="relative h-[60px] w-[80px]">
                            {bannerUrl ? (
                              <img
                                src={bannerUrl}
                                alt={title || "Service"}
                                className="h-[60px] w-[80px] rounded-lg border border-gray-200 object-cover"
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
                              className={`h-[60px] w-[80px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-2 text-center text-xs text-gray-400 ${
                                bannerUrl ? "hidden" : "flex"
                              }`}
                            >
                              No image
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="text-sm font-medium text-gray-800">
                            {title}
                          </span>
                        </td>

                        <td>
                          <span className="text-sm text-gray-700">
                            {service?.relatedProjects?.length || 0}
                          </span>
                        </td>

                        <td>
                          <span
                            className="line-clamp-2 text-sm leading-6 text-gray-700"
                            title={description}
                          >
                            {description}
                          </span>
                        </td>

                        <td>
                          <span className="text-sm text-gray-700">
                            {service?.order ?? 0}
                          </span>
                        </td>

                        <td>
                          <span className="badge badge-success">Active</span>
                        </td>

                        <td>
                          <div className="flex gap-3">
                            <Tooltip title="Edit" placement="top">
                              <button
                                type="button"
                                className="cursor-pointer"
                                onClick={() =>
                                  navigate(
                                    `/update-our-service/${service?._id}`,
                                  )
                                }
                              >
                                <i className="ki-filled ki-notepad-edit text-xl" />
                              </button>
                            </Tooltip>

                            <Tooltip title="Delete" placement="top">
                              <button
                                type="button"
                                className="cursor-pointer text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={() => handleDelete(service?._id)}
                                disabled={isDeleting}
                              >
                                <i className="ki-filled ki-trash text-xl" />
                              </button>
                            </Tooltip>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {!services.length && (
                    <tr>
                      <td
                        colSpan={7}
                        className="py-6 text-center text-gray-500"
                      >
                        No services found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </Container>
  );
};

export default AllOurServices;
