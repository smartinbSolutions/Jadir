import { Container, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import AddButton from "@/components/Global/AddButton";
import { useCompanies } from "../../hooks/useCompanies";
import LoadingCard from "../../../components/Global/LoadingCard";
import ErrorMessageCard from "../../../components/Global/ErrorMessageCard";
import getImageUrl from "../../../utils/getImageUrl";

const AllCompanies = () => {
  const navigate = useNavigate();

  const {
    companies = [],
    isLoading,
    error,
    deleteCompany,
    isDeleting,
  } = useCompanies({
    limit: 100,
  });

  const handleDelete = async (id) => {
    try {
      await deleteCompany(id).unwrap();

      toast.success("Company deleted successfully");
    } catch (err) {
      console.error(err);

      toast.error(err?.data?.message || "Failed to delete company");
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
                Trusted Companies
              </span>

              <h2 className="mt-4 text-2xl font-semibold">
                Manage trusted company logos and multilingual content
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
                Keep company names, logos, ordering, and descriptions aligned
                across English, Arabic, and Turkish.
              </p>
            </div>
          </div>
        </div>

        <div className="card card-grid min-w-full rounded-3xl border border-gray-200 shadow-sm">
          <div className="card-header flex-wrap py-5">
            <div>
              <h3 className="card-title">Company List</h3>

              <p className="mt-1 text-sm text-gray-500">
                Showing {companies.length} company entries
              </p>
            </div>

            <AddButton
              label="New Company"
              onClick={() => navigate("/add-company")}
            />
          </div>

          <div className="card-body">
            <div className="scrollable-x-auto">
              <table className="table table-auto table-border" id="grid_table">
                <thead>
                  <tr>
                    <th className="min-w-[90px]">Logo</th>

                    <th className="min-w-[220px]">Name</th>

                    <th className="min-w-[100px]">Order</th>

                    <th className="w-[120px]">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {companies.map((company) => {
                    const companyName =
                      company?.name?.en ||
                      company?.name?.ar ||
                      company?.name?.tr ||
                      "-";

                    const logoUrl = getImageUrl(company?.imageUrl);

                    return (
                      <tr key={company?._id}>
                        <td>
                          {logoUrl ? (
                            <img
                              src={logoUrl}
                              alt={companyName}
                              className="h-[70px] w-[70px] rounded border object-contain"
                            />
                          ) : (
                            <span className="text-sm text-gray-400">
                              No logo
                            </span>
                          )}
                        </td>

                        <td>
                          <div>
                            <span className="text-sm font-medium text-gray-800">
                              {companyName}
                            </span>
                          </div>
                        </td>

                        <td>{company?.order ?? 0}</td>

                        <td>
                          <div className="flex gap-3">
                            <Tooltip title="Edit" placement="top">
                              <button
                                type="button"
                                className="cursor-pointer"
                                onClick={() =>
                                  navigate(`/update-company/${company._id}`)
                                }
                              >
                                <i className="ki-filled ki-notepad-edit text-xl" />
                              </button>
                            </Tooltip>

                            <Tooltip title="Delete" placement="top">
                              <button
                                type="button"
                                className="cursor-pointer text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                                onClick={() => handleDelete(company._id)}
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

                  {!companies.length ? (
                    <tr>
                      <td
                        colSpan={4}
                        className="py-6 text-center text-gray-500"
                      >
                        No companies found
                      </td>
                    </tr>
                  ) : null}
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

export default AllCompanies;
