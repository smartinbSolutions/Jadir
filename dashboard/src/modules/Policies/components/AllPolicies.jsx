import { Container, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import AddButton from "../../../components/Global/AddButton";
import ErrorMessageCard from "../../../components/Global/ErrorMessageCard";
import LoadingCard from "../../../components/Global/LoadingCard";
import { usePolicies } from "../../hooks/usePolicies";

const AllPolicies = () => {
  const navigate = useNavigate();
  const { policies, isLoading, error, deletePolicy, isDeleting } = usePolicies({
    limit: 100,
  });

  const handleDelete = async (id) => {
    try {
      await deletePolicy(id).unwrap();
      toast.success("Policy deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to delete policy");
    }
  };

  if (isLoading) return <LoadingCard />;
  if (error) return <ErrorMessageCard />;

  return (
    <Container>
      <div className="grid">
        <div className="card card-grid min-w-full">
          <div className="card-header py-5 flex-wrap">
            <h3 className="card-title">Policies</h3>
            <div className="flex gap-6">
              <AddButton
                label="New Policy"
                onClick={() => navigate("/add-policy")}
              />
            </div>
          </div>

          <div className="card-body">
            <div className="scrollable-x-auto">
              <table className="table table-auto table-border">
                <thead>
                  <tr>
                    <th className="min-w-[220px]">Title</th>
                    <th className="min-w-[120px]">Type</th>
                    <th className="min-w-[100px]">Order</th>
                    <th className="min-w-[100px]">Status</th>
                    <th className="w-[120px]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {policies.map((policy) => (
                    <tr key={policy._id}>
                      <td>
                        {policy?.title?.en ||
                          policy?.title?.ar ||
                          policy?.title?.tr ||
                          "-"}
                      </td>
                      <td className="capitalize">
                        {policy?.policyType || "-"}
                      </td>
                      <td>{policy?.order ?? 0}</td>
                      <td>
                        <span className={`badge ${"badge-success"}`}>
                          {"Active"}
                        </span>
                      </td>
                      <td>
                        <div className="flex gap-3">
                          <Tooltip title="Edit" placement="top">
                            <button
                              className="cursor-pointer"
                              onClick={() =>
                                navigate(`/update-policy/${policy._id}`)
                              }
                            >
                              <i className="ki-filled ki-notepad-edit text-xl" />
                            </button>
                          </Tooltip>
                          <Tooltip title="Delete" placement="top">
                            <button
                              className="cursor-pointer text-red-500"
                              onClick={() => handleDelete(policy._id)}
                              disabled={isDeleting}
                            >
                              <i className="ki-filled ki-trash text-xl" />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!policies.length && (
                    <tr>
                      <td
                        colSpan={5}
                        className="text-center py-6 text-gray-500"
                      >
                        No policies found
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

export default AllPolicies;
