import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { useOneStatistic, useStatistics } from "../../hooks/useStatistics";

const emptyLangState = {
  en: "",
  ar: "",
  tr: "",
};

const useUpdateStatistic = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const { statistic, isLoading, error } = useOneStatistic(id);
  const { updateStatistic, isUpdating } = useStatistics();

  const [title, setTitle] = useState({ ...emptyLangState });
  const [suffix, setSuffix] = useState({ ...emptyLangState });
  const [description, setDescription] = useState({ ...emptyLangState });
  const [value, setValue] = useState("");
  const [order, setOrder] = useState(0);

  useEffect(() => {
    if (!statistic) return;

    setTitle({
      en: statistic?.title?.en || "",
      ar: statistic?.title?.ar || "",
      tr: statistic?.title?.tr || "",
    });

    setSuffix({
      en: statistic?.suffix?.en || "",
      ar: statistic?.suffix?.ar || "",
      tr: statistic?.suffix?.tr || "",
    });

    setDescription({
      en: statistic?.description?.en || "",
      ar: statistic?.description?.ar || "", 
      tr: statistic?.description?.tr || ""
    });

    setValue(statistic?.value || "");
    setOrder(statistic?.order || 0);
  }, [statistic]);

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

      await updateStatistic({
        id,
        data: payload,
      }).unwrap();

      toast.success("Statistic updated successfully");

      setTimeout(() => {
        navigate("/all-statistics");
      }, 1200);
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to update statistic");
    }
  };

  return {
    error,
    isPageLoading: isLoading,
    isUpdating,
    title,
    suffix,
    description,
    value,
    setValue,
    order,
    setOrder,
    handleLangChange,
    handleSave,
  };
};

export default useUpdateStatistic;
