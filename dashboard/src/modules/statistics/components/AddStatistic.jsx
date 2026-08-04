import { Container } from "@mui/material";
import { ToastContainer } from "react-toastify";
import StatisticLangForm from "./StatisticLangForm";
import StatisticGeneralInfoTab from "./StatisticGeneralInfoTab";
import Tabs from "../../../components/Global/Tabs";
import useCreateStatistic from "../hooks/useCreateStatistics";

const AddStatistic = () => {
  const {
    title,
    suffix,
    description,
    value,
    setValue,
    order,
    setOrder,
    handleLangChange,
    handleSave,
    isLoading,
  } = useCreateStatistic();

  const tabConfig = [
    {
      key: "statistic_general",
      label: "General Info",
      icon: "ki-outline ki-user-square",
      content: (
        <StatisticGeneralInfoTab
          value={value}
          setValue={setValue}
          order={order}
          setOrder={setOrder}
        />
      ),
    },
    ...["en", "ar" , "tr"].map((lang) => ({
      key: `statistic_${lang}`,
      label: `Statistic ${lang.toUpperCase()}`,
      icon: "ki-outline ki-clipboard",
      content: (
        <StatisticLangForm
          language={lang}
          titleValue={title[lang]}
          suffixValue={suffix[lang]}
          descriptionValue={description[lang]}
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
          disabled={isLoading}
        >
          {isLoading ? "Submitting..." : "Create Statistic"}
        </button>
      </div>
      <ToastContainer pauseOnHover />
    </Container>
  );
};

export default AddStatistic;
