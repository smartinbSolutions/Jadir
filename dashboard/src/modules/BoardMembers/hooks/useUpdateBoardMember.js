import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import {
  useBoardMembers,
  useOneBoardMember,
} from "../../hooks/useBoardMembers";
import getImageUrl from "../../../utils/getImageUrl";

const emptyLangState = {
  en: "",
  ar: "",
  tr: "",
};

const useUpdateBoardMember = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const previewUrlRef = useRef(null);

  const { boardMember, isLoading, error } = useOneBoardMember(id);

  const { updateBoardMember, isUpdating } = useBoardMembers();

  const [name, setName] = useState({ ...emptyLangState });
  const [position, setPosition] = useState({
    ...emptyLangState,
  });
  const [description, setDescription] = useState({
    ...emptyLangState,
  });

  const [img, setImg] = useState(null);
  const [imgPreview, setImgPreview] = useState("");
  const [currentImg, setCurrentImg] = useState("");
  const [removeImage, setRemoveImage] = useState(false);

  const [order, setOrder] = useState(0);

  const revokeTemporaryPreview = () => {
    if (!previewUrlRef.current) return;

    URL.revokeObjectURL(previewUrlRef.current);
    previewUrlRef.current = null;
  };

  useEffect(() => {
    if (!boardMember) return;

    revokeTemporaryPreview();

    setName({
      en: boardMember?.name?.en || "",
      ar: boardMember?.name?.ar || "",
      tr: boardMember?.name?.tr || "",
    });

    setPosition({
      en: boardMember?.position?.en || "",
      ar: boardMember?.position?.ar || "",
      tr: boardMember?.position?.tr || "",
    });

    setDescription({
      en: boardMember?.bio?.en || "",
      ar: boardMember?.bio?.ar || "",
      tr: boardMember?.bio?.tr || "",
    });

    setCurrentImg(
      boardMember?.imageUrl ? getImageUrl(boardMember.imageUrl) : "",
    );

    setImg(null);
    setImgPreview("");
    setRemoveImage(false);

    setOrder(boardMember?.order ?? 0);
  }, [boardMember]);

  useEffect(() => {
    return () => {
      revokeTemporaryPreview();
    };
  }, []);

  const handleNameChange = (lang, value) => {
    setName((prev) => ({
      ...prev,
      [lang]: value,
    }));
  };

  const handlePositionChange = (lang, value) => {
    setPosition((prev) => ({
      ...prev,
      [lang]: value,
    }));
  };

  const handleDescriptionChange = (lang, value) => {
    setDescription((prev) => ({
      ...prev,
      [lang]: value,
    }));
  };

  const handleImageChange = (selectedAvatar) => {
    const file = selectedAvatar?.[0]?.file;

    revokeTemporaryPreview();

    if (file) {
      const temporaryUrl = URL.createObjectURL(file);

      previewUrlRef.current = temporaryUrl;

      setImg(file);
      setImgPreview(temporaryUrl);
      setCurrentImg("");
      setRemoveImage(false);

      return;
    }

    // المستخدم ضغط زر حذف الصورة
    setImg(null);
    setImgPreview("");
    setCurrentImg("");
    setRemoveImage(true);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      formData.append("name", JSON.stringify(name));
      formData.append("position", JSON.stringify(position));
      formData.append("bio", JSON.stringify(description));
      formData.append("order", String(order ?? 0));

      if (img instanceof File) {
        formData.append("image", img);
      } else if (removeImage) {
        formData.append("removeImage", "true");
      }

      await updateBoardMember({
        id,
        data: formData,
      }).unwrap();

      toast.success("Board member updated successfully");

      setTimeout(() => {
        navigate("/all-board-members");
      }, 1200);
    } catch (err) {
      console.error(err);

      toast.error(err?.data?.message || "Failed to update board member");
    }
  };

  return {
    error,
    isPageLoading: isLoading,
    isUpdating,

    name,
    position,
    description,

    img,
    imgPreview,
    currentImg,

    order,
    setOrder,

    handleNameChange,
    handlePositionChange,
    handleDescriptionChange,
    handleImageChange,

    handleSave,
  };
};

export default useUpdateBoardMember;
