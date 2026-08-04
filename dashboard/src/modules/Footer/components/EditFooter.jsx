import { Container } from "@mui/material";
import { ToastContainer } from "react-toastify";
import FooterLangForm from "./FooterLangForm";
import FooterGeneralInfoTab from "./FooterGeneralInfoTab";
import useFooterForm from "../hooks/useFooterForm";
import LoadingCard from "../../../components/Global/LoadingCard";
import ErrorMessageCard from "../../../components/Global/ErrorMessageCard";
import Tabs from "../../../components/Global/Tabs";

const FOOTER_LANGUAGES = ["en", "ar", "tr"];

const EditFooter = () => {
  const {
    isLoading,
    error,
    isUpdating,

    description,
    handleDescriptionChange,

    address,
    handleAddressChange,

    facebook,
    setFacebook,
    instagram,
    setInstagram,
    xTwitter,
    setXTwitter,
    linkedin,
    setLinkedin,

    phone,
    setPhone,
    email,
    setEmail,

    workingStartTime,
    setWorkingStartTime,

    workingEndTime,
    setWorkingEndTime,

    workingSchedule,
    setWorkingSchedule,

    links,
    addLink,
    removeLink,
    updateLinkField,

    handleSave,
  } = useFooterForm();

  if (isLoading) {
    return <LoadingCard />;
  }

  if (error) {
    return <ErrorMessageCard />;
  }

  const tabConfig = [
    {
      key: "footer_general",
      label: "General Info",
      icon: "ki-outline ki-user-square",
      content: (
        <FooterGeneralInfoTab
          facebook={facebook}
          setFacebook={setFacebook}
          instagram={instagram}
          setInstagram={setInstagram}
          xTwitter={xTwitter}
          setXTwitter={setXTwitter}
          linkedin={linkedin}
          setLinkedin={setLinkedin}
          phone={phone}
          setPhone={setPhone}
          email={email}
          setEmail={setEmail}
          workingStartTime={workingStartTime}
          setWorkingStartTime={setWorkingStartTime}
          workingEndTime={workingEndTime}
          setWorkingEndTime={setWorkingEndTime}
          workingSchedule={workingSchedule}
          setWorkingSchedule={setWorkingSchedule}
          links={links}
          addLink={addLink}
          removeLink={removeLink}
          updateLinkField={updateLinkField}
        />
      ),
    },

    ...FOOTER_LANGUAGES.map((language) => ({
      key: `footer_${language}`,
      label: `Footer ${language.toUpperCase()}`,
      icon: "ki-outline ki-clipboard",
      content: (
        <FooterLangForm
          language={language}
          descriptionValue={description?.[language] || ""}
          onDescriptionChange={handleDescriptionChange}
          address={address?.[language] || ""}
          onAddressChange={handleAddressChange}
        />
      ),
    })),
  ];

  return (
    <Container>
      <Tabs tabs={tabConfig} />

      <div className="sticky bottom-4 z-20 mt-6 flex justify-end">
        <div className="rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isUpdating}
          >
            {isUpdating ? "Saving..." : "Save Footer"}
          </button>
        </div>
      </div>

      <ToastContainer pauseOnHover />
    </Container>
  );
};

export default EditFooter;
