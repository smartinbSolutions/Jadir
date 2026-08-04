import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useOurServices } from "../../hooks/useOurServices";
import { useProjects } from "../../hooks/useProjects";
import { useEffect } from "react";

const emptyLangState = {
  en: "",
  ar: "",
  tr: "",
};

const createEmptyTestimonial = () => ({
  clientName: { ...emptyLangState },
  clientRole: { ...emptyLangState },
  quote: { ...emptyLangState },
});

const useCreateOurService = () => {
  const navigate = useNavigate();
  const { postOurService, isPosting, services } = useOurServices({
    limit: 100,
  });
  const { projects } = useProjects({ limit: 100 });

  const [title, setTitle] = useState({ ...emptyLangState });
  const [description, setDescription] = useState({ ...emptyLangState });
  const [features, setFeatures] = useState({
    en: [],
    ar: [],
    tr: [],
  });
  const [steps, setSteps] = useState({
    en: [],
    ar: [],
    tr: [],
  });
  const [targetingSectors, setTargetingSectors] = useState({
    en: [],
    ar: [],
    tr: [],
  });
  const [testimonials, setTestimonials] = useState([]);
  const [order, setOrder] = useState(0);
  const [relatedProjects, setRelatedProjects] = useState([]);
  const [relatedServices, setRelatedServices] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const handleTitleChange = (lang, value) => {
    setTitle((prev) => ({ ...prev, [lang]: value }));
  };

  const handleDescriptionChange = (lang, value) => {
    setDescription((prev) => ({ ...prev, [lang]: value }));
  };

  const handleFeaturesChange = (lang, value) => {
    setFeatures((prev) => ({ ...prev, [lang]: value }));
  };

  const handleStepsChange = (lang, value) => {
    setSteps((prev) => ({ ...prev, [lang]: value }));
  };

  const handleTargetingSectorsChange = (lang, value) => {
    setTargetingSectors((prev) => ({ ...prev, [lang]: value }));
  };

  const addTestimonial = () => {
    setTestimonials((prev) => [...prev, createEmptyTestimonial()]);
  };

  const removeTestimonial = (index) => {
    setTestimonials((prev) =>
      prev.filter((_, itemIndex) => itemIndex !== index),
    );
  };

  const handleTestimonialFieldChange = (index, field, lang, value) => {
    setTestimonials((prev) =>
      prev.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: { ...item[field], [lang]: value },
            }
          : item,
      ),
    );
  };

  const onImageChange = (selectedAvatar) => {
    const file = selectedAvatar?.[0]?.file;

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    } else {
      setImageFile(null);
      setImagePreview(null);
    }
  };

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleSave = async () => {
    try {
      const formData = new FormData();
      formData.append("title", JSON.stringify(title));
      formData.append("description", JSON.stringify(description));
      formData.append("features", JSON.stringify(features));
      formData.append("steps", JSON.stringify(steps));
      formData.append("targetingSectors", JSON.stringify(targetingSectors));
      formData.append("testimonials", JSON.stringify(testimonials));
      formData.append(
        "relatedProjects",
        JSON.stringify(relatedProjects.map((item) => item._id || item.id)),
      );
      formData.append(
        "relatedServices",
        JSON.stringify(relatedServices.map((item) => item._id || item.id)),
      );
      formData.append("order", String(order || 0));

      if (imageFile) {
        formData.append("bannerImage", imageFile);
      }

      await postOurService(formData).unwrap();

      toast.success("Service created successfully");

      setTimeout(() => {
        navigate("/all-our-services");
      }, 1200);
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to create service");
    }
  };

  return {
    title,
    description,
    features,
    steps,
    targetingSectors,
    testimonials,
    addTestimonial,
    removeTestimonial,
    order,
    setOrder,
    relatedProjects,
    setRelatedProjects,
    relatedServices,
    setRelatedServices,
    projectOptions: projects,
    serviceOptions: services,
    imagePreview,
    onImageChange,
    handleTitleChange,
    handleDescriptionChange,
    handleFeaturesChange,
    handleStepsChange,
    handleTargetingSectorsChange,
    handleTestimonialFieldChange,
    handleSave,
    isLoading: isPosting,
  };
};

export default useCreateOurService;
