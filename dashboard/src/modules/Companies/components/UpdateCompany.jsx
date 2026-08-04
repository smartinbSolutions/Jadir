import { Container } from "@mui/material";
import { ToastContainer } from "react-toastify";
import CompanyLangForm from "./CompanyLangForm";
import CompanyGeneralInfoTab from "./CompanyGeneralInfoTab";
import LoadingCard from "../../../components/Global/LoadingCard";
import ErrorMessageCard from "../../../components/Global/ErrorMessageCard";
import useUpdateCompany from "../hooks/useUpdateCompany";
import Tabs from "../../../components/Global/Tabs";

const UpdateCompany = () => {
  const {
    error,
    isPageLoading,
    isUpdating,
    name,
    brief,
    testimonial,
    order,
    setOrder,
    logoPreview,
    onLogoChange,
    handleLangChange,
    handleSave,
  } = useUpdateCompany();

  if (isPageLoading) return <LoadingCard />;
  if (error) return <ErrorMessageCard />;

  const tabConfig = [
    {
      key: "company_general",
      label: "General Info",
      icon: "ki-outline ki-user-square",
      content: (
        <CompanyGeneralInfoTab
          order={order}
          setOrder={setOrder}
          logoPreview={logoPreview}
          onLogoChange={onLogoChange}
        />
      ),
    },
    ...["en", "ar" , "tr"].map((lang) => ({
      key: `company_${lang}`,
      label: `Company ${lang.toUpperCase()}`,
      icon: "ki-outline ki-clipboard",
      content: (
        <CompanyLangForm
          language={lang}
          nameValue={name[lang]}
          briefValue={brief[lang]}
          testimonialValue={testimonial[lang]}
          onLangChange={handleLangChange}
        />
      ),
    })),
  ];

  return (
    <Container>
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl">
          <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
            <div>
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
                Update Company
              </span>
              <h2 className="mt-4 text-2xl font-semibold">
                Update the trusted company entry without leaving the same
                structured workflow
              </h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
                Keep logo, display order, and multilingual copy aligned from a
                single workspace.
              </p>
            </div>
          </div>
        </div>

        <Tabs tabs={tabConfig} />

        <div className="sticky bottom-4 z-20 mt-6 flex justify-end">
          <div className="rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur">
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isUpdating}
            >
              {isUpdating ? "Updating..." : "Update Company"}
            </button>
          </div>
        </div>
      </div>

      <ToastContainer pauseOnHover />
    </Container>
  );
};

export default UpdateCompany;
