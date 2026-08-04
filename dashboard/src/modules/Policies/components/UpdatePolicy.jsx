import { Container } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import Tabs from "../../../components/Global/Tabs";
import ErrorMessageCard from "../../../components/Global/ErrorMessageCard";
import LoadingCard from "../../../components/Global/LoadingCard";
import { useOnePolicy, usePolicies } from "../../hooks/usePolicies";
import { usePolicyEditorState } from "../hooks/usePolicyEditor";
import PolicyGeneralInfoTab from "./PolicyGeneralInfoTab";
import PolicyLangForm from "./PolicyLangForm";

const UpdatePolicy = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { policy, isLoading, error } = useOnePolicy(id);
  const { updatePolicy, isUpdating } = usePolicies();
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
  } = usePolicyEditorState(policy);

  const handleSave = async () => {
    try {
      await updatePolicy({ id, data: payload }).unwrap();
      toast.success("Policy updated successfully");
      setTimeout(() => navigate("/all-policies"), 1200);
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to update policy");
    }
  };

  if (isLoading) return <LoadingCard />;
  if (error) return <ErrorMessageCard />;

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
          disabled={isUpdating}
        >
          {isUpdating ? "Updating..." : "Update Policy"}
        </button>
      </div>
      <ToastContainer pauseOnHover />
    </Container>
  );
};

export default UpdatePolicy;
