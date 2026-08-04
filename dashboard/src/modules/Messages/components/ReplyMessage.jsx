import { Container } from "@mui/material";
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import LoadingCard from "../../../components/Global/LoadingCard";
import ErrorMessageCard from "../../../components/Global/ErrorMessageCard";
import { TextEditor } from "../../../components/TextEditor";
import useReplyMessage from "../hooks/useReplyMessage";

const REQUEST_TYPE_LABELS = {
  inquiry: "Inquiry",
  "consult-inquiry": "Consultation Inquiry",
  "service-request": "Service Request",
  partnership: "Partnership",
  media: "Media",
  support: "Support",
  complaint: "Complaint",
  "investment-inquiry": "Service Request",
};

const ReplyMessage = () => {
  const navigate = useNavigate();

  const {
    messageItem,
    reply,
    setReply,
    error,
    fetchError,
    isPageLoading,
    isLoading,
    handleSave,
  } = useReplyMessage();

  if (isPageLoading) {
    return <LoadingCard />;
  }

  if (fetchError || !messageItem) {
    return <ErrorMessageCard />;
  }

  const requestType =
    REQUEST_TYPE_LABELS[messageItem?.requestType] ||
    messageItem?.requestType ||
    "-";

  const serviceName =
    messageItem?.service?.title?.en ||
    messageItem?.service?.title?.ar ||
    messageItem?.service?.title?.tr ||
    "No linked service";

  return (
    <Container>
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 px-6 py-7 text-white shadow-xl lg:px-8">
          <button
            type="button"
            className="btn btn-sm btn-light mb-5"
            onClick={() => navigate("/all-messages")}
          >
            <i className="ki-outline ki-arrow-left mr-1" />
            Back to Messages
          </button>

          <span className="block text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
            Message Reply
          </span>

          <h2 className="mt-3 text-2xl font-semibold">
            Reply to {messageItem?.name || "Message"}
          </h2>

          <p className="mt-2 text-sm text-slate-200">
            Review the original request and prepare a formatted response.
          </p>
        </div>

        <div className="grid items-start gap-6 xl:grid-cols-[0.8fr_1.2fr]">
          {/* Original message */}
          <div className="h-fit rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Original Message
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Sender and request details.
              </p>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                  Sender
                </span>

                <p className="mt-1 text-sm font-medium text-gray-900">
                  {messageItem?.name || "-"}
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                    Email
                  </span>

                  <p className="mt-1 break-all text-sm text-gray-700">
                    {messageItem?.email || "-"}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                    Phone
                  </span>

                  <p className="mt-1 text-sm text-gray-700">
                    {messageItem?.phone || "-"}
                  </p>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                  Request Type
                </span>

                <p className="mt-1 text-sm text-gray-700">{requestType}</p>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                  Service
                </span>

                <p className="mt-1 text-sm text-gray-700">{serviceName}</p>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                  Subject
                </span>

                <p className="mt-1 text-sm text-gray-700">
                  {messageItem?.subject || "-"}
                </p>
              </div>

              <div>
                <span className="text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
                  Message
                </span>

                <div className="mt-2 max-h-[360px] overflow-y-auto whitespace-pre-wrap rounded-2xl border border-gray-200 bg-gray-50 p-4 text-sm leading-6 text-gray-700">
                  {messageItem?.message || "-"}
                </div>
              </div>
            </div>
          </div>

          {/* Reply editor */}
          <div className="h-fit rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="border-b border-gray-100 pb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Your Reply
              </h3>

              <p className="mt-1 text-sm text-gray-500">
                Write and format the response before sending it.
              </p>
            </div>

            <div className="mt-5">
              <TextEditor
                value={reply}
                onChange={(value) => {
                  setReply(value);
                }}
                placeholder="Write your reply here..."
                enableFontSize
                enableColor
                enableBackground
                enableDirection
                enableImage={false}
                className={`w-full bg-white text-black ${
                  error ? "border-red-500" : ""
                }`}
              />

              {error ? (
                <p className="mt-3 text-sm text-red-500">{error}</p>
              ) : null}
            </div>

            <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-gray-100 pt-5">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate("/all-messages")}
                disabled={isLoading}
              >
                Cancel
              </button>

              <button
                type="button"
                className="btn btn-primary"
                onClick={handleSave}
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reply"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer pauseOnHover />
    </Container>
  );
};

export default ReplyMessage;
