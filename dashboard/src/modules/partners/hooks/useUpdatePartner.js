import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { useOnePartner, usePartners } from "../../hooks/usePartners";
import getImageUrl from "../../../utils/getImageUrl";

const emptyLangState = {
  en: "",
  ar: "",
  tr: "",
};

const useUpdatePartner = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const previewUrlRef = useRef(null);

  const { partner, isLoading, error } = useOnePartner(id);

  const { updatePartner, isUpdating } = usePartners();

  const [title, setTitle] = useState({
    ...emptyLangState,
  });

  const [brief, setBrief] = useState({
    ...emptyLangState,
  });

  const [testimonial, setTestimonial] = useState({
    ...emptyLangState,
  });

  const [order, setOrder] = useState(0);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [removeImg, setRemoveImg] = useState(false);

  const revokeTemporaryPreview = () => {
    if (!previewUrlRef.current) return;

    URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
  };

  useEffect(() => {
    if (!partner) return;

    revokeTemporaryPreview();

    setTitle({
      en: partner?.title?.en || "",
      ar: partner?.title?.ar || "",
      tr: partner?.title?.tr || "",
    });

    setBrief({
      en: partner?.brief?.en || "",
      ar: partner?.brief?.ar || "",
      tr: partner?.brief?.tr || "",
    });

    setTestimonial({
      en: partner?.testimonial?.en || "",
      ar: partner?.testimonial?.ar || "",
      tr: partner?.testimonial?.tr || "",
    });

    setOrder(Number(partner?.order ?? 0));

    setImageFile(null);

    setImagePreview(partner?.imageUrl ? getImageUrl(partner.imageUrl) : null);

    setRemoveImg(false);
  }, [partner]);

  useEffect(() => {
    return () => {
      revokeTemporaryPreview();
    };
  }, []);

  const onImageChange = (selectedAvatar) => {
    const file = selectedAvatar?.[0]?.file || null;

    revokeTemporaryPreview();

    if (file) {
      const temporaryUrl = URL.createObjectURL(file);

      previewUrlRef.current = temporaryUrl;

      setImageFile(file);
      setImagePreview(temporaryUrl);
      setRemoveImg(false);

      return;
    }

    // المستخدم ضغط زر حذف الصورة
    setImageFile(null);
    setImagePreview(null);
    setRemoveImg(true);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      formData.append("title", JSON.stringify(title));
      formData.append("brief", JSON.stringify(brief));

      formData.append("testimonial", JSON.stringify(testimonial));

      formData.append("order", String(Number(order) || 0));

      if (imageFile instanceof File) {
        formData.append("img", imageFile);
      } else if (removeImg) {
        formData.append("removeImg", "true");
      }

      await updatePartner({
        id,
        data: formData,
      }).unwrap();

      toast.success("Partner updated successfully");

      setTimeout(() => {
        navigate("/all-partners");
      }, 1200);
    } catch (err) {
      console.error(err);

      toast.error(err?.data?.message || "Failed to update partner");
    }
  };

  return {
    error,
    isPageLoading: isLoading,
    isUpdating,

    title,
    setTitle,

    brief,
    setBrief,

    testimonial,
    setTestimonial,

    order,
    setOrder,

    imageFile,
    imagePreview,
    onImageChange,

    handleSave,
  };
};

export default useUpdatePartner;
