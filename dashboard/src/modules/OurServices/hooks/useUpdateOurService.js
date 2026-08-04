import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { useOneOurService, useOurServices } from "../../hooks/useOurServices";
import { useProjects } from "../../hooks/useProjects";
import getImageUrl from "../../../utils/getImageUrl";

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

const useUpdateOurService = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const previewUrlRef = useRef(null);

  const { service, isLoading, error } = useOneOurService(id);

  const {
    updateOurService,
    isUpdating,
    services = [],
  } = useOurServices({
    limit: 100,
  });

  const { projects = [] } = useProjects({
    limit: 100,
  });

  const [title, setTitle] = useState({ ...emptyLangState });

  const [description, setDescription] = useState({
    ...emptyLangState,
  });

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
  const [removeBannerImage, setRemoveBannerImage] = useState(false);

  const revokeTemporaryPreview = () => {
    if (!previewUrlRef.current) return;

    URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
  };

  useEffect(() => {
    if (!service) return;

    revokeTemporaryPreview();

    setTitle({
      en: service?.title?.en || "",
      ar: service?.title?.ar || "",
      tr: service?.title?.tr || "",
    });

    setDescription({
      en: service?.description?.en || "",
      ar: service?.description?.ar || "",
      tr: service?.description?.tr || "",
    });

    setFeatures({
      en: service?.features?.en || [],
      ar: service?.features?.ar || [],
      tr: service?.features?.tr || [],
    });

    setSteps({
      en: service?.steps?.en || [],
      ar: service?.steps?.ar || [],
      tr: service?.steps?.tr || [],
    });

    setTargetingSectors({
      en: service?.targetingSectors?.en || [],
      ar: service?.targetingSectors?.ar || [],
      tr: service?.targetingSectors?.tr || [],
    });

    const serviceTestimonials = Array.isArray(service?.testimonials)
      ? service.testimonials
      : service?.testimonial
        ? [service.testimonial]
        : [];

    setTestimonials(
      serviceTestimonials.map((item) => ({
        clientName: {
          en: item?.clientName?.en || "",
          ar: item?.clientName?.ar || "",
          tr: item?.clientName?.tr || "",
        },

        clientRole: {
          en: item?.clientRole?.en || "",
          ar: item?.clientRole?.ar || "",
          tr: item?.clientRole?.tr || "",
        },

        quote: {
          en: item?.quote?.en || "",
          ar: item?.quote?.ar || "",
          tr: item?.quote?.tr || "",
        },
      })),
    );

    setOrder(service?.order ?? 0);

    setRelatedProjects(
      Array.isArray(service?.relatedProjects) ? service.relatedProjects : [],
    );

    setRelatedServices(
      Array.isArray(service?.relatedServices)
        ? service.relatedServices.filter(
            (item) => String(item?._id || item?.id) !== String(service?._id),
          )
        : [],
    );

    setImageFile(null);

    setImagePreview(
      service?.bannerImageUrl ? getImageUrl(service.bannerImageUrl) : null,
    );

    setRemoveBannerImage(false);
  }, [service]);

  useEffect(() => {
    return () => {
      revokeTemporaryPreview();
    };
  }, []);

  const handleTitleChange = (lang, value) => {
    setTitle((prev) => ({
      ...prev,
      [lang]: value,
    }));
  };

  const handleDescriptionChange = (lang, value) => {
    setDescription((prev) => ({
      ...prev,
      [lang]: value,
    }));
  };

  const handleFeaturesChange = (lang, value) => {
    setFeatures((prev) => ({
      ...prev,
      [lang]: value,
    }));
  };

  const handleStepsChange = (lang, value) => {
    setSteps((prev) => ({
      ...prev,
      [lang]: value,
    }));
  };

  const handleTargetingSectorsChange = (lang, value) => {
    setTargetingSectors((prev) => ({
      ...prev,
      [lang]: value,
    }));
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

              [field]: {
                ...item[field],
                [lang]: value,
              },
            }
          : item,
      ),
    );
  };

  const onImageChange = (selectedAvatar) => {
    const file = selectedAvatar?.[0]?.file;

    revokeTemporaryPreview();

    if (file) {
      const temporaryUrl = URL.createObjectURL(file);

      previewUrlRef.current = temporaryUrl;

      setImageFile(file);
      setImagePreview(temporaryUrl);
      setRemoveBannerImage(false);

      return;
    }

    // المستخدم ضغط زر حذف الصورة
    setImageFile(null);
    setImagePreview(null);
    setRemoveBannerImage(true);
  };

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
        JSON.stringify(
          relatedProjects.map((item) => item?._id || item?.id).filter(Boolean),
        ),
      );

      formData.append(
        "relatedServices",
        JSON.stringify(
          relatedServices
            .map((item) => item?._id || item?.id)
            .filter(
              (serviceId) => serviceId && String(serviceId) !== String(id),
            ),
        ),
      );

      formData.append("order", String(order ?? 0));

      if (imageFile instanceof File) {
        formData.append("bannerImage", imageFile);
      } else if (removeBannerImage) {
        formData.append("removeBannerImage", "true");
      }

      await updateOurService({
        id,
        data: formData,
      }).unwrap();

      toast.success("Service updated successfully");

      setTimeout(() => {
        navigate("/all-our-services");
      }, 1200);
    } catch (err) {
      console.error(err);

      toast.error(err?.data?.message || "Failed to update service");
    }
  };

  return {
    error,
    isPageLoading: isLoading,
    isUpdating,

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

    serviceOptions: services.filter((item) => String(item?._id) !== String(id)),

    imageFile,
    imagePreview,
    onImageChange,

    handleTitleChange,
    handleDescriptionChange,
    handleFeaturesChange,
    handleStepsChange,
    handleTargetingSectorsChange,
    handleTestimonialFieldChange,

    handleSave,
  };
};

export default useUpdateOurService;
