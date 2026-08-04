import { Container } from "@mui/material";
import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";

import Tabs from "../../../components/Global/Tabs";
import ErrorMessageCard from "../../../components/Global/ErrorMessageCard";
import LoadingCard from "../../../components/Global/LoadingCard";
import getImageUrl from "../../../utils/getImageUrl";

import {
  useCareers,
  useCareerTemplates,
  useOneCareer,
} from "../../hooks/useCareers";

import { useCareerEditorState } from "../hooks/useCareerEditor";
import CareerGeneralInfoTab from "./CareerGeneralInfoTab";
import CareerApplicationFormTab from "./CareerApplicationFormTab";
import CareerLangForm from "./CareerLangForm";
import CareerTemplateModal from "./CareerTemplateModal";

const UpdateCareer = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { career, isLoading, error } = useOneCareer(id);

  const { updateCareer, isUpdating, createTemplate, isCreatingTemplate } =
    useCareers();

  const { templates } = useCareerTemplates();

  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);

  const initialImage = career?.imageUrl
    ? getImageUrl(career.imageUrl)
    : career?.image
      ? getImageUrl(`/uploads/careers/${career.image}`)
      : "";

  const {
    title,
    position,
    location,
    description,
    applicationLink,
    setApplicationLink,
    endDate,
    setEndDate,
    status,
    setStatus,
    imagePreview,
    onImageChange,
    handleLangChange,
    applicationFields,
    setApplicationFields,
    toFormData,
    toTemplatePayload,
    applyTemplate,
  } = useCareerEditorState(career, initialImage);

  const handleSave = async (nextStatus = status) => {
    try {
      setStatus(nextStatus);

      const data = toFormData();

      data.set("status", nextStatus);

      await updateCareer({
        id,
        data,
      }).unwrap();

      toast.success("Career job updated successfully");

      setTimeout(() => {
        navigate("/careers");
      }, 1200);
    } catch (err) {
      console.error(err);

      toast.error(err?.data?.message || "Failed to update career job");
    }
  };

  const handleSaveTemplate = async (name) => {
    try {
      await createTemplate(toTemplatePayload(name)).unwrap();

      toast.success("Career template saved successfully");

      setIsTemplateModalOpen(false);
    } catch (err) {
      console.error(err);

      toast.error(err?.data?.message || "Failed to save template");
    }
  };

  const handleApplyTemplate = (event) => {
    const template = templates.find((item) => item._id === event.target.value);

    if (!template) return;

    applyTemplate(template);

    event.target.value = "";

    toast.success("Template applied");
  };

  if (isLoading) {
    return <LoadingCard />;
  }

  if (error) {
    return <ErrorMessageCard />;
  }

  const tabConfig = [
    {
      key: "career_general",
      label: "General Info",
      icon: "ki-outline ki-briefcase",
      content: (
        <CareerGeneralInfoTab
          applicationLink={applicationLink}
          setApplicationLink={setApplicationLink}
          endDate={endDate}
          setEndDate={setEndDate}
          status={status}
          setStatus={setStatus}
          imagePreview={imagePreview}
          onImageChange={onImageChange}
        />
      ),
    },
    {
      key: "career_application_form",
      label: "Application Form",
      icon: "ki-outline ki-questionnaire-tablet",
      content: (
        <CareerApplicationFormTab
          fields={applicationFields}
          setFields={setApplicationFields}
        />
      ),
    },
    ...["en", "ar", "tr"].map((lang) => ({
      key: `career_${lang}`,
      label: `Career ${lang.toUpperCase()}`,
      icon: "ki-outline ki-clipboard",
      content: (
        <CareerLangForm
          language={lang}
          titleValue={title[lang]}
          positionValue={position[lang]}
          locationValue={location[lang]}
          descriptionValue={description[lang]}
          onLangChange={handleLangChange}
        />
      ),
    })),
  ];

  return (
    <Container>
      <div className="card mb-5">
        <div className="card-body flex flex-wrap items-center gap-3">
          <select
            className="select max-w-[320px]"
            onChange={handleApplyTemplate}
          >
            <option value="">Apply a saved template</option>

            {templates.map((template) => (
              <option key={template._id} value={template._id}>
                {template.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            className="btn btn-light"
            onClick={() => setIsTemplateModalOpen(true)}
            disabled={isCreatingTemplate}
          >
            {isCreatingTemplate ? "Saving Template..." : "Save as Template"}
          </button>
        </div>
      </div>

      <Tabs tabs={tabConfig} />

      <div className="mt-6 flex gap-3">
        <button
          className="btn btn-primary"
          onClick={() => handleSave("published")}
          disabled={isUpdating}
        >
          {isUpdating ? "Updating..." : "Publish Career Job"}
        </button>

        <button
          className="btn btn-light"
          onClick={() => handleSave("draft")}
          disabled={isUpdating}
        >
          Save Draft
        </button>
      </div>

      <CareerTemplateModal
        isOpen={isTemplateModalOpen}
        isSaving={isCreatingTemplate}
        onClose={() => setIsTemplateModalOpen(false)}
        onSave={handleSaveTemplate}
      />

      <ToastContainer pauseOnHover />
    </Container>
  );
};

export default UpdateCareer;
