import { Container } from "@mui/material";
import { ToastContainer } from "react-toastify";
import CompanyLangForm from "./CompanyLangForm";
import CompanyGeneralInfoTab from "./CompanyGeneralInfoTab";
import useCreateCompany from "../hooks/useCreateCompany";
import Tabs from "../../../components/Global/Tabs";

const AddCompany = () => {
  const {
    name,
    brief,
    testimonial,
    order,
    setOrder,
    logoPreview,
    onLogoChange,
    handleLangChange,
    handleSave,
    isLoading,
  } = useCreateCompany();

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
        <Tabs tabs={tabConfig} />

        <div className="sticky bottom-4 z-20 mt-6 flex justify-end">
          <div className="rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur">
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Create Company"}
            </button>
          </div>
        </div>
      </div>

      <ToastContainer pauseOnHover />
    </Container>
  );
};

export default AddCompany;
