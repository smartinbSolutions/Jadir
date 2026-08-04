import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useProjects } from "../../hooks/useProjects";

const emptyLangState = {
  en: "",
  ar: "",
  tr: "",
};

const useCreateProject = () => {
  const navigate = useNavigate();
  const previewUrlRef = useRef(null);

  const { postProject, isPosting } = useProjects();

  const [title, setTitle] = useState({ ...emptyLangState });
  const [brief, setBrief] = useState({ ...emptyLangState });
  const [challenge, setChallenge] = useState({
    ...emptyLangState,
  });
  const [solution, setSolution] = useState({
    ...emptyLangState,
  });
  const [result, setResult] = useState({ ...emptyLangState });

  const [projectLink, setProjectLink] = useState("");
  const [order, setOrder] = useState(0);

  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  const revokeTemporaryPreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      if (previewUrlRef.current) {
        URL.revokeObjectURL(previewUrlRef.current);
        previewUrlRef.current = null;
      }
    };
  }, []);

  const handleTitleChange = (lang, value) => {
    setTitle((prev) => ({
      ...prev,
      [lang]: value,
    }));
  };

  const handleBriefChange = (lang, value) => {
    setBrief((prev) => ({
      ...prev,
      [lang]: value,
    }));
  };

  const handleChallengeChange = (lang, value) => {
    setChallenge((prev) => ({
      ...prev,
      [lang]: value,
    }));
  };

  const handleSolutionChange = (lang, value) => {
    setSolution((prev) => ({
      ...prev,
      [lang]: value,
    }));
  };

  const handleResultChange = (lang, value) => {
    setResult((prev) => ({
      ...prev,
      [lang]: value,
    }));
  };

  const onImageChange = (selectedAvatar) => {
    const file = selectedAvatar?.[0]?.file;

    revokeTemporaryPreview();

    if (file) {
      const temporaryUrl = URL.createObjectURL(file);

      previewUrlRef.current = temporaryUrl;

      setImageFile(file);
      setImagePreview(temporaryUrl);

      return;
    }

    setImageFile(null);
    setImagePreview(null);
  };

  const handleSave = async () => {
    try {
      const formData = new FormData();

      formData.append("title", JSON.stringify(title));
      formData.append("brief", JSON.stringify(brief));
      formData.append("challenge", JSON.stringify(challenge));
      formData.append("solution", JSON.stringify(solution));
      formData.append("result", JSON.stringify(result));
      formData.append("projectLink", projectLink || "");
      formData.append("order", String(order ?? 0));

      if (imageFile) {
        formData.append("image", imageFile);
      }

      await postProject(formData).unwrap();

      toast.success("Project created successfully");

      setTimeout(() => {
        navigate("/all-projects");
      }, 1200);
    } catch (err) {
      console.error(err);

      toast.error(err?.data?.message || "Failed to create project");
    }
  };

  return {
    title,
    brief,
    challenge,
    solution,
    result,

    projectLink,
    setProjectLink,

    order,
    setOrder,

    imageFile,
    imagePreview,
    onImageChange,

    handleTitleChange,
    handleBriefChange,
    handleChallengeChange,
    handleSolutionChange,
    handleResultChange,

    handleSave,
    isLoading: isPosting,
  };
};

export default useCreateProject;
