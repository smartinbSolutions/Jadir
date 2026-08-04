import { Container } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Tabs from "../../../components/Global/Tabs";
import ErrorMessageCard from "../../../components/Global/ErrorMessageCard";
import getImageUrl from "../../../utils/getImageUrl";
import LoadingCard from "../../../components/Global/LoadingCard";
import {
  useOneTestimonial,
  useTestimonials,
} from "../../hooks/useTestimonials";
import { useTestimonialEditorState } from "../hooks/useTestimonialEditor";
import TestimonialGeneralInfoTab from "./TestimonialGeneralInfoTab";
import TestimonialLangForm from "./TestimonialLangForm";

const UpdateTestimonial = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { testimonial, isLoading, error } = useOneTestimonial(id);
  const initialImage = testimonial?.imageUrl
    ? getImageUrl(testimonial.imageUrl)
    : "";
  const { updateTestimonial, isUpdating } = useTestimonials();

  const {
    name,
    setName,
    role,
    company,
    content,
    rating,
    setRating,
    isFeatured,
    setIsFeatured,
    order,
    setOrder,
    imagePreview,
    onImageChange,
    handleLangChange,
    toFormData,
  } = useTestimonialEditorState({testimonial, initialImage});

  const handleSave = async () => {
    try {
      await updateTestimonial({ id, data: toFormData() }).unwrap();
      toast.success("Testimonial updated successfully");
      setTimeout(() => navigate("/all-testimonials"), 1200);
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to update testimonial");
    }
  };

  if (isLoading) return <LoadingCard />;
  if (error) return <ErrorMessageCard />;

  const tabConfig = [
    {
      key: "testimonial_general",
      label: "General Info",
      icon: "ki-outline ki-user-square",
      content: (
        <TestimonialGeneralInfoTab
          name={name}
          setName={setName}
          rating={rating}
          setRating={setRating}
          isFeatured={isFeatured}
          setIsFeatured={setIsFeatured}
          order={order}
          setOrder={setOrder}
          imagePreview={imagePreview}
          onImageChange={onImageChange}
        />
      ),
    },
    ...["en", "ar", "tr"].map((lang) => ({
      key: `testimonial_${lang}`,
      label: `Testimonial ${lang.toUpperCase()}`,
      icon: "ki-outline ki-clipboard",
      content: (
        <TestimonialLangForm
          language={lang}
          nameValue={name[lang]}
          roleValue={role[lang]}
          companyValue={company[lang]}
          contentValue={content[lang]}
          onLangChange={handleLangChange}
        />
      ),
    })),
  ];

  return (
    <Container>
      <Tabs tabs={tabConfig} />
      <div className="mt-6">
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={isUpdating}
        >
          {isUpdating ? "Updating..." : "Update Testimonial"}
        </button>
      </div>
      <ToastContainer pauseOnHover />
    </Container>
  );
};

export default UpdateTestimonial;
