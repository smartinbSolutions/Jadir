import { Container } from "@mui/material";
import { useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Tabs from "../../../components/Global/Tabs";
import { usePolicies } from "../../hooks/usePolicies";
import { usePolicyEditorState } from "../hooks/usePolicyEditor";
import PolicyGeneralInfoTab from "./PolicyGeneralInfoTab";
import PolicyLangForm from "./PolicyLangForm";

const AddPolicy = () => {
  const navigate = useNavigate();
  const { postPolicy, isPosting } = usePolicies();
  const {
    title,
    summary,
    content,
    policyType,
    setPolicyType,
    order,
    setOrder,
    handleLangChange,
    payload,
  } = usePolicyEditorState();

  const handleSave = async () => {
    try {
      await postPolicy(payload).unwrap();
      toast.success("Policy created successfully");
      setTimeout(() => navigate("/all-policies"), 1200);
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to create policy");
    }
  };

  const tabConfig = [
    {
      key: "policy_general",
      label: "General Info",
      icon: "ki-outline ki-user-square",
      content: (
        <PolicyGeneralInfoTab
          policyType={policyType}
          setPolicyType={setPolicyType}
          order={order}
          setOrder={setOrder}
        />
      ),
    },
    ...["en", "ar", "tr"].map((lang) => ({
      key: `policy_${lang}`,
      label: `Policy ${lang.toUpperCase()}`,
      icon: "ki-outline ki-clipboard",
      content: (
        <PolicyLangForm
          language={lang}
          titleValue={title[lang]}
          summaryValue={summary[lang]}
          contentValue={content[lang]}
          onLangChange={handleLangChange}
        />
      ),
    })),
  ];

  return (
    <Container>
      <Tabs tabs={tabConfig} />
      <div className="mt-6">
        <button
          className="btn btn-primary"
          onClick={handleSave}
          disabled={isPosting}
        >
          {isPosting ? "Submitting..." : "Create Policy"}
        </button>
      </div>
      <ToastContainer pauseOnHover />
    </Container>
  );
};

export default AddPolicy;
