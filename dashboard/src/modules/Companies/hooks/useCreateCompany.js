import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useCompanies } from "../../hooks/useCompanies";

const emptyLangState = {
  en: "",
  ar: "",
  tr: "",
};

const useCreateCompany = () => {
  const navigate = useNavigate();

  const previewUrlRef = useRef(null);

  const { postCompany, isPosting } = useCompanies();

  const [name, setName] = useState({
    ...emptyLangState,
  });

  const [brief, setBrief] = useState({
    ...emptyLangState,
  });

  const [testimonial, setTestimonial] = useState({
    ...emptyLangState,
  });

  const [order, setOrder] = useState(0);

  const [logoFile, setLogoFile] = useState(null);

  const [logoPreview, setLogoPreview] = useState(null);

  const revokeLogoPreview = () => {
    if (!previewUrlRef.current) return;

    URL.revokeObjectURL(previewUrlRef.current);

    previewUrlRef.current = null;
  };

  useEffect(() => {
    return () => {
      revokeLogoPreview();
    };
  }, []);

  const handleLangChange = (group, lang, value) => {
    if (group === "name") {
      setName((prev) => ({
        ...prev,
        [lang]: value,
      }));

      return;
    }

    if (group === "brief") {
      setBrief((prev) => ({
        ...prev,
        [lang]: value,
      }));

      return;
    }

    if (group === "testimonial") {
      setTestimonial((prev) => ({
        ...prev,
        [lang]: value,
      }));
    }
  };

  const onLogoChange = (selectedAvatar) => {
    const file = selectedAvatar?.[0]?.file || null;

    revokeLogoPreview();

    if (file) {
      const temporaryUrl = URL.createObjectURL(file);

      previewUrlRef.current = temporaryUrl;

      setLogoFile(file);
      setLogoPreview(temporaryUrl);

      return;
    }

    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      formData.append("name", JSON.stringify(name));

      formData.append("brief", JSON.stringify(brief));

      formData.append("testimonial", JSON.stringify(testimonial));

      formData.append("order", String(Number(order) || 0));

      if (logoFile instanceof File) {
        formData.append("logo", logoFile);
      }

      await postCompany(formData).unwrap();

      toast.success("Company created successfully");

      setTimeout(() => {
        navigate("/all-companies");
      }, 1200);
    } catch (err) {
      console.error(err);

      toast.error(err?.data?.message || "Failed to create company");
    }
  };

  return {
    name,
    brief,
    testimonial,

    order,
    setOrder,

    logoPreview,
    onLogoChange,

    handleLangChange,
    handleSave,

    isLoading: isPosting,
  };
};

export default useCreateCompany;
