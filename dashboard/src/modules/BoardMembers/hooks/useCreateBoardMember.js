import { useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useBoardMembers } from "../../hooks/useBoardMembers";
import { useEffect } from "react";

const emptyLangState = {
  en: "",
  ar: "",
  tr: "",
};

const useCreateBoardMember = () => {
  const navigate = useNavigate();
  const { postBoardMember, isPosting } = useBoardMembers();

  const [name, setName] = useState({ ...emptyLangState });
  const [position, setPosition] = useState({ ...emptyLangState });
  const [description, setDescription] = useState({ ...emptyLangState });

  const [img, setImg] = useState(null);
  const [imgPreview, setImgPreview] = useState("");
  const [order, setOrder] = useState(0);

  const [isBoardMember, setIsBoardMember] = useState(true);

  const handleNameChange = (lang, value) => {
    setName((prev) => ({ ...prev, [lang]: value }));
  };

  const handlePositionChange = (lang, value) => {
    setPosition((prev) => ({ ...prev, [lang]: value }));
  };

  const handleDescriptionChange = (lang, value) => {
    setDescription((prev) => ({ ...prev, [lang]: value }));
  };

  const handleImageChange = (selectedAvatar) => {
    const file = selectedAvatar?.[0]?.file;

    if (imgPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imgPreview);
    }

    if (file) {
      setImg(file);
      setImgPreview(URL.createObjectURL(file));
    } else {
      setImg(null);
      setImgPreview("");
    }
  };
  useEffect(() => {
    return () => {
      if (imgPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imgPreview);
      }
    };
  }, [imgPreview]);

  const resetForm = () => {
    if (imgPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imgPreview);
    }
    setName({ ...emptyLangState });
    setPosition({ ...emptyLangState });
    setDescription({ ...emptyLangState });
    setImg(null);
    setImgPreview("");
    setOrder(0);
    setIsBoardMember(true);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      formData.append("name", JSON.stringify(name));
      formData.append("position", JSON.stringify(position));
      formData.append("bio", JSON.stringify(description));
      formData.append("order", order);
      formData.append("isFounder", isBoardMember);

      if (img) {
        formData.append("image", img);
      }

      await postBoardMember(formData).unwrap();

      toast.success("Board member created successfully");
      resetForm();

      setTimeout(() => {
        navigate("/all-board-members");
      }, 1200);
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to create board member");
    }
  };

  return {
    name,
    position,
    description,

    img,
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
    isLoading: isPosting,
  };
};

export default useCreateBoardMember;
