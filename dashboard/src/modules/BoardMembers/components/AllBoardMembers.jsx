import { Container, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import AddButton from "@/components/Global/AddButton";
import { useBoardMembers } from "../../hooks/useBoardMembers";
import LoadingCard from "../../../components/Global/LoadingCard";
import ErrorMessageCard from "../../../components/Global/ErrorMessageCard";
import getImageUrl from "../../../utils/getImageUrl";

const AllBoardMembers = () => {
  const navigate = useNavigate();

  const { boardMembers, isLoading, error, deleteBoardMember, isDeleting } =
    useBoardMembers({
      limit: 100,
    });

  const handleDelete = async (id) => {
    try {
      await deleteBoardMember(id).unwrap();
      toast.success("Board member deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to delete board member");
    }
  };

  if (isLoading) return <LoadingCard />;
  if (error) return <ErrorMessageCard />;
  const foundersCount = boardMembers.filter(
    (member) => member?.isFounder,
  ).length;

  return (
    <Container>
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl">
          <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
            <div>
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
                Team Management
              </span>
              <h2 className="mt-4 text-2xl font-semibold">
                Manage the team members shown across the About section
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
                Review team entries, keep profile information consistent, and
                quickly update the public team lineup.
              </p>
            </div>
          </div>
        </div>

        <div className="card card-grid min-w-full rounded-3xl border border-gray-200 shadow-sm">
          <div className="card-header py-5 flex-wrap">
            <div>
              <h3 className="card-title">Team List</h3>
              <p className="mt-1 text-sm text-gray-500">
                Showing {boardMembers.length} team profiles
              </p>
            </div>

            <AddButton
              label="New Team Member"
              onClick={() => navigate("/add-board-member")}
            />
          </div>

          <div className="card-body">
            <div className="scrollable-x-auto">
              <table className="table table-auto table-border" id="grid_table">
                <thead>
                  <tr>
                    <th className="min-w-[100px]">Image</th>
                    <th className="min-w-[220px]">Name</th>
                    <th className="min-w-[280px]">Description</th>
                    <th className="min-w-[120px]">Order</th>
                    <th className="w-[120px]">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {boardMembers?.map((member) => (
                    <tr key={member?._id}>
                      <td>
                        {member?.imageUrl ? (
                          <img
                            src={getImageUrl(member.imageUrl)}
                            alt={
                              member?.name?.en ||
                              member?.name?.ar ||
                              member?.name?.tr ||
                              "Team member"
                            }
                            className="h-14 w-14 rounded-xl border border-gray-200 object-cover"
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
                          className={`h-14 w-14 items-center justify-center rounded-xl border border-gray-200 bg-gray-50 text-xs text-gray-400 ${
                            member?.imageUrl ? "hidden" : "flex"
                          }`}
                        >
                          No Img
                        </div>
                      </td>

                      <td>
                        <div className="space-y-1">
                          <span className="text-sm font-medium text-gray-800">
                            {member?.name?.en || member?.name?.ar || "-"}
                          </span>
                          {member?.isFounder ? (
                            <div>
                              <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                                Founder
                              </span>
                            </div>
                          ) : null}
                        </div>
                      </td>

                      <td>
                        <span className="text-sm text-gray-700 line-clamp-2">
                          {member?.bio?.en || member?.bio?.ar || "-"}
                        </span>
                      </td>

                      <td>{member?.order ?? 0}</td>

                      <td>
                        <div className="flex gap-3">
                          <Tooltip title="Edit" placement="top">
                            <button
                              className="cursor-pointer"
                              onClick={() =>
                                navigate(`/update-board-member/${member?._id}`)
                              }
                            >
                              <i className="ki-filled ki-notepad-edit text-xl" />
                            </button>
                          </Tooltip>

                          <Tooltip title="Delete" placement="top">
                            <button
                              className="cursor-pointer text-red-500"
                              onClick={() => handleDelete(member?._id)}
                              disabled={isDeleting}
                            >
                              <i className="ki-filled ki-trash text-xl" />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!boardMembers?.length && (
                    <tr>
                      <td
                        colSpan={7}
                        className="text-center py-6 text-gray-500"
                      >
                        No team members found
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

export default AllBoardMembers;
