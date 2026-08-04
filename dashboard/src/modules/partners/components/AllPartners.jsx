import { Container, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import AddButton from "@/components/Global/AddButton";
import { usePartners } from "../../hooks/usePartners";
import LoadingCard from "../../../components/Global/LoadingCard";
import ErrorMessageCard from "../../../components/Global/ErrorMessageCard";
import getImageUrl from "../../../utils/getImageUrl";

const AllPartners = () => {
  const navigate = useNavigate();

  const { partners, isLoading, error, deletePartner, isDeleting } = usePartners(
    { limit: 100 },
  );

  const handleDelete = async (id) => {
    try {
      await deletePartner(id).unwrap();
      toast.success("Partner deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to delete partner");
    }
  };

  if (isLoading) return <LoadingCard />;
  if (error) return <ErrorMessageCard />;

  return (
    <Container>
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl">
          <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
            <div>
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
                Partners Management
              </span>

              <h2 className="mt-4 text-2xl font-semibold">
                Keep partner and client logos organized and presentation-ready
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
                Maintain partner entries, control display order, and keep
                supporting brief text consistent.
              </p>
            </div>
          </div>
        </div>

        <div className="card card-grid min-w-full rounded-3xl border border-gray-200 shadow-sm">
          <div className="card-header py-5 flex-wrap">
            <div>
              <h3 className="card-title">Partners List</h3>

              <p className="mt-1 text-sm text-gray-500">
                Showing {partners.length} partner records
              </p>
            </div>

            <AddButton
              label="New Partner"
              onClick={() => navigate("/add-partner")}
            />
          </div>

          <div className="card-body">
            <div className="scrollable-x-auto">
              <table className="table table-auto table-border" id="grid_table">
                <thead>
                  <tr>
                    <th className="min-w-[100px]">Image</th>
                    <th className="min-w-[220px]">Title</th>
                    <th className="min-w-[120px]">Order</th>
                    <th className="w-[120px]">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {partners?.map((partner) => (
                    <tr key={partner._id}>
                      <td>
                        {partner?.img ? (
                          <img
                            src={getImageUrl(partner.imageUrl)}
                            alt={
                              partner?.title?.en ||
                              partner?.title?.ar ||
                              partner?.title?.tr ||
                              "partner"
                            }
                            className="w-[70px] h-[70px] rounded-xl object-contain border"
                          />
                        ) : (
                          <span className="text-gray-400 text-sm">
                            No image
                          </span>
                        )}
                      </td>

                      <td>
                        <span className="text-sm font-medium text-gray-800">
                          {partner?.title?.en ||
                            partner?.title?.ar ||
                            partner?.title?.tr ||
                            "-"}
                        </span>
                      </td>

                      <td>{partner?.order ?? 0}</td>

                      <td>
                        <div className="flex gap-3">
                          <Tooltip title="Edit" placement="top">
                            <button
                              className="cursor-pointer"
                              onClick={() =>
                                navigate(`/update-partner/${partner._id}`)
                              }
                            >
                              <i className="ki-filled ki-notepad-edit text-xl" />
                            </button>
                          </Tooltip>

                          <Tooltip title="Delete" placement="top">
                            <button
                              className="cursor-pointer text-red-500"
                              onClick={() => handleDelete(partner._id)}
                              disabled={isDeleting}
                            >
                              <i className="ki-filled ki-trash text-xl" />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!partners?.length && (
                    <tr>
                      <td
                        colSpan={4}
                        className="text-center py-6 text-gray-500"
                      >
                        No partners found
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

export default AllPartners;
