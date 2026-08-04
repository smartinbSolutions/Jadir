import { Container, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useStatistics } from "../../hooks/useStatistics";
import LoadingCard from "../../../components/Global/LoadingCard";
import ErrorMessageCard from "../../../components/Global/ErrorMessageCard";
import AddButton from "../../../components/Global/AddButton";

const AllStatistics = () => {
  const navigate = useNavigate();
  const { statistics, isLoading, error, deleteStatistic, isDeleting } =
    useStatistics({ limit: 100 });

  const handleDelete = async (id) => {
    try {
      await deleteStatistic(id).unwrap();
      toast.success("Statistic deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to delete statistic");
    }
  };

  if (isLoading) return <LoadingCard />;
  if (error) return <ErrorMessageCard />;

  return (
    <Container>
      <div className="grid">
        <div className="card card-grid min-w-full">
          <div className="card-header py-5 flex-wrap">
            <h3 className="card-title">Statistics</h3>
            <div className="flex gap-6">
              <AddButton
                label="New Statistic"
                onClick={() => navigate("/add-statistic")}
              />
            </div>
          </div>
          <div className="card-body">
            <div className="scrollable-x-auto">
              <table className="table table-auto table-border" id="grid_table">
                <thead>
                  <tr>
                    <th className="min-w-[220px]">Title</th>
                    <th className="min-w-[120px]">Value</th>
                    <th className="min-w-[120px]">Suffix</th>
                    <th className="min-w-[260px]">Description</th>
                    <th className="min-w-[100px]">Order</th>
                    <th className="min-w-[100px]">Status</th>
                    <th className="w-[120px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {statistics?.map((item) => (
                    <tr key={item._id}>
                      <td>
                        <span className="text-sm font-medium text-gray-800">
                          {item?.title?.en ||
                            item?.title?.ar ||
                            item?.title?.tr ||
                            "-"}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-gray-700">
                          {item?.value || "-"}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-gray-700">
                          {item?.suffix?.en ||
                            item?.suffix?.ar ||
                            item?.suffix?.tr ||
                            "-"}
                        </span>
                      </td>
                      <td>
                        <span className="text-sm text-gray-700 line-clamp-2">
                          {item?.description?.en ||
                            item?.description?.ar ||
                            item?.description?.tr ||
                            "-"}
                        </span>
                      </td>
                      <td>{item?.order ?? 0}</td>
                      <td>
                        <span
                          className={`badge ${
                            "badge-success"
                          }`}
                        >
                          {"Active"}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-3">
                          <Tooltip title="Edit" placement="top">
                            <button
                              className="cursor-pointer"
                              onClick={() =>
                                navigate(`/update-statistic/${item._id}`)
                              }
                            >
                              <i className="ki-filled ki-notepad-edit text-xl" />
                            </button>
                          </Tooltip>
                          <Tooltip title="Delete" placement="top">
                            <button
                              className="cursor-pointer text-red-500"
                              onClick={() => handleDelete(item._id)}
                              disabled={isDeleting}
                            >
                              <i className="ki-filled ki-trash text-xl" />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {!statistics?.length && (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-6 text-gray-500"
                      >
                        No statistics found
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

export default AllStatistics;
