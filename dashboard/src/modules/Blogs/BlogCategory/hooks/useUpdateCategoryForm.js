import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useCategories } from "../../../hooks/useCategories";

const useUpdateCategoryForm = (initialCategory, onClose) => {
  const { updateCategory, isUpdating, refetch } = useCategories();

  const [category, setCategory] = useState({
    _id: "",
    name: {
      ar: "",
      en: "",
      tr: "",  
    },
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialCategory) {
      setCategory({
        _id: initialCategory._id || "",
        name: {
          ar: initialCategory?.name?.ar || "",
          en: initialCategory?.name?.en || "",
          tr: initialCategory?.name?.tr || "",
        },
      });
    }
  }, [initialCategory]);

  const handleChange = (lang, value) => {
    setCategory((prev) => ({
      ...prev,
      name: {
        ...prev.name,
        [lang]: value,
      },
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!category.name.ar.trim()) newErrors.ar = "Required";
    if (!category.name.en.trim()) newErrors.en = "Required";
    if (!category.name.tr.trim()) newErrors.tr = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      await updateCategory({
        id: category._id,
        data: {
          name: { ...category.name },
        },
      }).unwrap();

      refetch();
      toast.success("Category updated successfully");

      if (onClose) onClose();
    } catch (err) {
      console.error("Error updating category:", err);
      toast.error(err?.data?.message || "Error updating category!");
    }
  };

  return {
    category,
    setCategory,
    errors,
    isLoading: isUpdating,
    handleChange,
    handleSave,
  };
};

export default useUpdateCategoryForm;
