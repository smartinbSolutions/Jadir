import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { useHomeSliders, useOneHomeSlider } from "../../hooks/useHomeSliders";
import getImageUrl from "../../../utils/getImageUrl";

export const useUpdateHomeSlider = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const previewUrlRef = useRef(null);

  const { slider, isLoading, error } = useOneHomeSlider(id);

  const { updateHomeSlider, isUpdating } = useHomeSliders();

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
    if (!slider) return;

    revokeTemporaryPreview();

    setOrder(Number(slider?.order ?? 0));

    const imagePath =
      slider?.imageUrl ||
      (slider?.img ? `/uploads/homeSlider/${slider.img}` : "");

    setImageFile(null);

    setImagePreview(imagePath ? getImageUrl(imagePath) : null);

    setRemoveImg(false);
  }, [slider]);

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

      formData.append("order", String(Number(order) || 0));

      if (imageFile instanceof File) {
        formData.append("img", imageFile);
      } else if (removeImg) {
        formData.append("removeImg", "true");
      }

      await updateHomeSlider({
        id,
        data: formData,
      }).unwrap();

      toast.success("Slider updated successfully");

      setTimeout(() => {
        navigate("/all-home-sliders");
      }, 1200);
    } catch (err) {
      console.error(err);

      toast.error(err?.data?.message || "Failed to update slider");
    }
  };

  return {
    id,
    slider,
    error,

    isPageLoading: isLoading,
    isUpdating,

    order,
    setOrder,

    imageFile,
    imagePreview,
    onImageChange,

    handleSave,
  };
};

export default useUpdateHomeSlider;
