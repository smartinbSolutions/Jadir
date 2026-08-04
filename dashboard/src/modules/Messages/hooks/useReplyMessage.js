import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { useNavigate, useParams } from "react-router-dom";
import { useMessages, useOneMessage } from "../../hooks/useMessages";

const getPlainText = (html = "") =>
  html
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

const useReplyMessage = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const {
    messageItem,
    isLoading: isPageLoading,
    error: fetchError,
  } = useOneMessage(id);

  const { postMessageReply, isReplying } = useMessages();

  const [reply, setReply] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    setReply(messageItem?.reply || "");
    setError("");
  }, [messageItem]);

  const validate = () => {
    const plainReply = getPlainText(reply);

    if (!plainReply) {
      setError("Reply is required");
      return false;
    }

    setError("");
    return true;
  };

  const handleSave = async () => {
    if (!id) {
      toast.error("Message not found");
      return;
    }

    if (!validate()) return;

    try {
      await postMessageReply({
        id,
        data: {
          reply: reply.trim(),
        },
      }).unwrap();

      toast.success("Reply sent successfully");

      setTimeout(() => {
        navigate("/all-messages");
      }, 1000);
    } catch (err) {
      console.error(err);

      toast.error(err?.data?.message || "Failed to send reply");
    }
  };

  return {
    id,
    messageItem,

    reply,
    setReply,

    error,
    fetchError,

    isPageLoading,
    isLoading: isReplying,

    handleSave,
  };
};

export default useReplyMessage;
