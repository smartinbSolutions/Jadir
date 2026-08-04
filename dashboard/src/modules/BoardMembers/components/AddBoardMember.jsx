import { Container } from "@mui/material";
import { ToastContainer } from "react-toastify";
import BoardMemberLangForm from "./BoardMemberLangForm";
import BoardMemberGeneralTab from "./BoardMemberGeneralTab";
import useCreateBoardMember from "../hooks/useCreateBoardMember";
import Tabs from "../../../components/Global/Tabs";

const AddBoardMember = () => {
  const {
    name,
    position,
    description,

    imgPreview,

    order,
    setOrder,

    isBoardMember,
    setIsBoardMember,

    handleNameChange,
    handlePositionChange,
    handleDescriptionChange,
    handleImageChange,

    handleSave,
    isLoading,
  } = useCreateBoardMember();

  const tabConfig = [
    {
      key: "tab_info",
      label: "General Info",
      icon: "ki-outline ki-user-square",
      content: (
        <BoardMemberGeneralTab
          order={order}
          setOrder={setOrder}
          onImageChange={handleImageChange}
          imgPreview={imgPreview}
          currentImg=""
          isBoardMember={isBoardMember}
          setIsBoardMember={setIsBoardMember}
        />
      ),
    },
    ...["en", "ar" , "tr"].map((lang) => ({
      key: `board_member_${lang}`,
      label: `Board Member ${lang.toUpperCase()}`,
      icon: "ki-outline ki-clipboard",
      content: (
        <BoardMemberLangForm
          language={lang}
          nameValue={name[lang]}
          positionValue={position[lang]}
          descriptionValue={description[lang]}
          onNameChange={handleNameChange}
          onPositionChange={handlePositionChange}
          onDescriptionChange={handleDescriptionChange}
        />
      ),
    })),
  ];

  return (
    <Container>
      <div className="space-y-6">
        <Tabs tabs={tabConfig} />

        <div className="sticky bottom-4 z-20 mt-6 flex justify-end">
          <div className="rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur">
            <button
              className="btn btn-primary"
              onClick={handleSave}
              disabled={isLoading}
            >
              {isLoading ? "Submitting..." : "Create Board Member"}
            </button>
          </div>
        </div>
      </div>

      <ToastContainer pauseOnHover />
    </Container>
  );
};

export default AddBoardMember;
