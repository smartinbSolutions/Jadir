import { useState } from "react";
import { toast } from "react-toastify";
import { useCategories } from "../../../hooks/useCategories";

const useAddBlogCategory = (onClose) => {
  const { postCategory, isPosting, refetch } = useCategories();

  const [category, setCategory] = useState({
    name: {
      en: "",
      ar: "",
      tr: "",
    },
  });

  const [errors, setErrors] = useState({});

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

    if (!category.name.en.trim()) newErrors.en = "Required";
    if (!category.name.ar.trim()) newErrors.ar = "Required";
    if (!category.name.tr.trim()) newErrors.tr = "Required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;

    try {
      const payload = {
        name: { ...category.name },
      };

      await postCategory(payload).unwrap();

      refetch();
      toast.success("Category created successfully");
      setCategory({
        name: {
          en: "",
          ar: "",
          tr: "",
        },
      });

      if (onClose) onClose();
    } catch (err) {
      console.error("Error creating category:", err);
      toast.error(err?.data?.message || "Error creating category!");
    }
  };

  return {
    category,
    setCategory,
    errors,
    isLoading: isPosting,
    handleChange,
    handleSave,
  };
};

export default useAddBlogCategory;
