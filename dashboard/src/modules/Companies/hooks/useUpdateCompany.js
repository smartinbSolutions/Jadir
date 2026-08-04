import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { useCompanies, useOneCompany } from "../../hooks/useCompanies";
import getImageUrl from "../../../utils/getImageUrl";

const emptyLangState = {
  en: "",
  ar: "",
  tr: "",
};

const useUpdateCompany = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const previewUrlRef = useRef(null);

  const { company, isLoading, error } = useOneCompany(id);

  const { updateCompany, isUpdating } = useCompanies();

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
  const [removeLogo, setRemoveLogo] = useState(false);

  const revokeLocalPreview = () => {
    if (!previewUrlRef.current) return;

    URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
  };

  useEffect(() => {
    if (!company) return;

    revokeLocalPreview();

    setName({
      en: company?.name?.en || "",
      ar: company?.name?.ar || "",
      tr: company?.name?.tr || "",
    });

    setBrief({
      en: company?.brief?.en || "",
      ar: company?.brief?.ar || "",
      tr: company?.brief?.tr || "",
    });

    setTestimonial({
      en: company?.testimonial?.en || "",
      ar: company?.testimonial?.ar || "",
      tr: company?.testimonial?.tr || "",
    });

    setOrder(Number(company?.order ?? 0));

    setLogoFile(null);

    setLogoPreview(company?.imageUrl ? getImageUrl(company.imageUrl) : null);

    setRemoveLogo(false);
  }, [company]);

  useEffect(() => {
    return () => {
      revokeLocalPreview();
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

    revokeLocalPreview();

    if (file) {
      const temporaryUrl = URL.createObjectURL(file);

      previewUrlRef.current = temporaryUrl;

      setLogoFile(file);
      setLogoPreview(temporaryUrl);
      setRemoveLogo(false);

      return;
    }

    // المستخدم ضغط زر حذف الشعار
    setLogoFile(null);
    setLogoPreview(null);
    setRemoveLogo(true);
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
      } else if (removeLogo) {
        formData.append("removeLogo", "true");
      }

      await updateCompany({
        id,
        data: formData,
      }).unwrap();

      toast.success("Company updated successfully");

      setTimeout(() => {
        navigate("/all-companies");
      }, 1200);
    } catch (err) {
      console.error(err);

      toast.error(err?.data?.message || "Failed to update company");
    }
  };

  return {
    error,
    isPageLoading: isLoading,
    isUpdating,

    name,
    brief,
    testimonial,

    order,
    setOrder,

    logoFile,
    logoPreview,
    onLogoChange,

    handleLangChange,
    handleSave,
  };
};

export default useUpdateCompany;
