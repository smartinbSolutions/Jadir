import { useEffect, useRef, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { useOneProject, useProjects } from "../../hooks/useProjects";
import getImageUrl from "../../../utils/getImageUrl";

const emptyLangState = {
  en: "",
  ar: "",
  tr: "",
};

const useUpdateProject = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const previewUrlRef = useRef(null);

  const { project, isLoading, error } = useOneProject(id);
  const { updateProject, isUpdating } = useProjects();

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

  const [removeImage, setRemoveImage] = useState(false);

  const revokeTemporaryPreview = () => {
    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }
  };

  useEffect(() => {
    if (!project) return;

    if (previewUrlRef.current) {
      URL.revokeObjectURL(previewUrlRef.current);
      previewUrlRef.current = null;
    }

    setTitle({
      en: project?.title?.en || "",
      ar: project?.title?.ar || "",
      tr: project?.title?.tr || "",
    });

    setBrief({
      en: project?.brief?.en || "",
      ar: project?.brief?.ar || "",
      tr: project?.brief?.tr || "",
    });

    setChallenge({
      en: project?.challenge?.en || "",
      ar: project?.challenge?.ar || "",
      tr: project?.challenge?.tr || "",
    });

    setSolution({
      en: project?.solution?.en || "",
      ar: project?.solution?.ar || "",
      tr: project?.solution?.tr || "",
    });

    setResult({
      en: project?.result?.en || "",
      ar: project?.result?.ar || "",
      tr: project?.result?.tr || "",
    });

    setProjectLink(project?.projectLink || "");
    setOrder(project?.order ?? 0);

    setImagePreview(project?.imageUrl ? getImageUrl(project.imageUrl) : null);

    setImageFile(null);
    setRemoveImage(false);
  }, [project]);

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
      setRemoveImage(false);

      return;
    }

    // المستخدم ضغط زر حذف الصورة
    setImageFile(null);
    setImagePreview(null);
    setRemoveImage(true);
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

      if (imageFile instanceof File) {
        formData.append("image", imageFile);
      } else if (removeImage) {
        formData.append("removeImage", "true");
      }

      await updateProject({
        id,
        data: formData,
      }).unwrap();

      toast.success("Project updated successfully");

      setTimeout(() => {
        navigate("/all-projects");
      }, 1200);
    } catch (err) {
      console.error(err);

      toast.error(err?.data?.message || "Failed to update project");
    }
  };

  return {
    error,
    isPageLoading: isLoading,
    isUpdating,

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
  };
};

export default useUpdateProject;
