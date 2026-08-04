import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useStatistics } from "../../hooks/useStatistics";

const emptyLangState = {
  en: "",
  ar: "",
  tr: "",
};

const useCreateStatistic = () => {
  const navigate = useNavigate();
  const { postStatistic, isPosting } = useStatistics();

  const [title, setTitle] = useState({ ...emptyLangState });
  const [suffix, setSuffix] = useState({ ...emptyLangState });
  const [description, setDescription] = useState({ ...emptyLangState });
  const [value, setValue] = useState("");
  const [order, setOrder] = useState(0);

  const handleLangChange = (group, lang, valueText) => {
    if (group === "title") {
      setTitle((prev) => ({ ...prev, [lang]: valueText }));
    }
    if (group === "suffix") {
      setSuffix((prev) => ({ ...prev, [lang]: valueText }));
    }
    if (group === "description") {
      setDescription((prev) => ({ ...prev, [lang]: valueText }));
    }
  };

  const handleSave = async () => {
    try {
      const payload = {
        title,
        suffix,
        description,
        value,
        order,
      };

      await postStatistic(payload).unwrap();

      toast.success("Statistic created successfully");

      setTimeout(() => {
        navigate("/all-statistics");
      }, 1200);
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to create statistic");
    }
  };

  return {
    title,
    suffix,
    description,
    value,
    setValue,
    order,
    setOrder,
    handleLangChange,
    handleSave,
    isLoading: isPosting,
  };
};

export default useCreateStatistic;
