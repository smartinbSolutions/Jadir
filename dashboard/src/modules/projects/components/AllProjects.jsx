import { Container, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { useProjects } from "../../hooks/useProjects";
import LoadingCard from "../../../components/Global/LoadingCard";
import ErrorMessageCard from "../../../components/Global/ErrorMessageCard";
import AddButton from "../../../components/Global/AddButton";
import getImageUrl from "../../../utils/getImageUrl";

const AllProjects = () => {
  const navigate = useNavigate();

  const {
    projects = [],
    isLoading,
    error,
    deleteProject,
    isDeleting,
  } = useProjects({
    limit: 100,
  });

  const handleDelete = async (id) => {
    try {
      await deleteProject(id).unwrap();

      toast.success("Project deleted successfully");
    } catch (err) {
      console.error(err);

      toast.error(err?.data?.message || "Failed to delete project");
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
      <div className="grid">
        <div className="card card-grid min-w-full">
          <div className="card-header flex-wrap py-5">
            <h3 className="card-title">Projects</h3>

            <div className="flex gap-6">
              <AddButton
                label="New Project"
                onClick={() => navigate("/add-project")}
              />
            </div>
          </div>

          <div className="card-body">
            <div className="scrollable-x-auto">
              <table className="table table-auto table-border" id="grid_table">
                <thead>
                  <tr>
                    <th className="min-w-[90px]">Image</th>
                    <th className="min-w-[220px]">Title</th>
                    <th className="min-w-[180px]">Project Link</th>
                    <th className="min-w-[100px]">Order</th>
                    <th className="w-[120px]">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {projects.map((project) => {
                    const title =
                      project?.title?.en ||
                      project?.title?.ar ||
                      project?.title?.tr ||
                      "-";

                    const projectImageUrl = project?.imageUrl
                      ? getImageUrl(project.imageUrl)
                      : "";

                    return (
                      <tr key={project?._id}>
                        <td>
                          <div className="relative h-[70px] w-[70px]">
                            {projectImageUrl ? (
                              <img
                                src={projectImageUrl}
                                alt={title || "Project"}
                                className="h-[70px] w-[70px] rounded-lg border border-gray-200 object-contain"
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
                              className={`h-[70px] w-[70px] items-center justify-center rounded-lg border border-gray-200 bg-gray-50 px-2 text-center text-xs text-gray-400 ${
                                projectImageUrl ? "hidden" : "flex"
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
                          {project?.projectLink ? (
                            <a
                              href={project.projectLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="line-clamp-1 text-sm text-blue-600 underline hover:text-blue-800"
                            >
                              Open URL
                            </a>
                          ) : (
                            <span className="text-sm text-gray-400">
                              No URL
                            </span>
                          )}
                        </td>

                        <td>
                          <span className="text-sm text-gray-700">
                            {project?.order ?? 0}
                          </span>
                        </td>

                        <td>
                          <div className="flex gap-3">
                            <Tooltip title="Edit" placement="top">
                              <button
                                type="button"
                                className="cursor-pointer"
                                onClick={() =>
                                  navigate(`/update-project/${project?._id}`)
                                }
                              >
                                <i className="ki-filled ki-notepad-edit text-xl" />
                              </button>
                            </Tooltip>

                            <Tooltip title="Delete" placement="top">
                              <button
                                type="button"
                                className="cursor-pointer text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={() => handleDelete(project?._id)}
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

                  {!projects.length && (
                    <tr>
                      <td
                        colSpan={5}
                        className="py-6 text-center text-gray-500"
                      >
                        No projects found
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

export default AllProjects;
