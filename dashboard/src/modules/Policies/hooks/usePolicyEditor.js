import { useEffect, useState } from "react";

const emptyLangState = {
  en: "",
  ar: "",
  tr: ""
};

export const usePolicyEditorState = (policy) => {
  const [title, setTitle] = useState({ ...emptyLangState });
  const [summary, setSummary] = useState({ ...emptyLangState });
  const [content, setContent] = useState({ ...emptyLangState });
  const [policyType, setPolicyType] = useState("policy");
  const [order, setOrder] = useState(0);

  useEffect(() => {
    if (!policy) return;

    setTitle({
      en: policy?.title?.en || "",
      ar: policy?.title?.ar || "",
      tr: policy?.title?.tr || "",
    });
    setSummary({
      en: policy?.summary?.en || "",
      ar: policy?.summary?.ar || "",
      tr: policy?.summary?.tr || "",
    });
    setContent({
      en: policy?.content?.en || "",
      ar: policy?.content?.ar || "",
      tr: policy?.content?.tr || "",
    });
    setPolicyType(policy?.policyType || "policy");
    setOrder(policy?.order ?? 0);
  }, [policy]);

  const handleLangChange = (group, lang, value) => {
    if (group === "title") {
      setTitle((prev) => ({ ...prev, [lang]: value }));
    }
    if (group === "summary") {
      setSummary((prev) => ({ ...prev, [lang]: value }));
    }
    if (group === "content") {
      setContent((prev) => ({ ...prev, [lang]: value }));
    }
  };

  return {
    title,
    summary,
    content,
    policyType,
    setPolicyType,
    order,
    setOrder,
    handleLangChange,
    payload: {
      title,
      summary,
      content,
      policyType,
      order,
    },
  };
};
