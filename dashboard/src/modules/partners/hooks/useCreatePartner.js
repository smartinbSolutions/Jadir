import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { usePartners } from "../../hooks/usePartners";

const emptyLangState = {
  en: "",
  ar: "",
  tr: "",
};

const useCreatePartner = () => {
  const navigate = useNavigate();
  const { postPartner, isPosting } = usePartners();

  const [title, setTitle] = useState({ ...emptyLangState });
  const [brief, setBrief] = useState({ ...emptyLangState });
  const [testimonial, setTestimonial] = useState({ ...emptyLangState });
  const [order, setOrder] = useState(0);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const onImageChange = (selectedAvatar) => {
    const file = selectedAvatar?.[0]?.file;

    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  const resetForm = () => {
    setTitle({ ...emptyLangState });
    setBrief({ ...emptyLangState });
    setTestimonial({ ...emptyLangState });
    setOrder(0);
    setImageFile(null);
    setImagePreview(null);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      formData.append("title", JSON.stringify(title));
      formData.append("brief", JSON.stringify(brief));
      formData.append("testimonial", JSON.stringify(testimonial));
      formData.append("order", String(order || 0));

      if (imageFile) {
        formData.append("img", imageFile);
      }

      await postPartner(formData).unwrap();

      toast.success("Partner created successfully");
      resetForm();

      setTimeout(() => {
        navigate("/all-partners");
      }, 1200);
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to create partner");
    }
  };

  return {
    title,
    setTitle,
    brief,
    setBrief,
    testimonial,
    setTestimonial,

    order,
    setOrder,

    imagePreview,
    onImageChange,

    handleSave,
    isLoading: isPosting,
  };
};

export default useCreatePartner;
