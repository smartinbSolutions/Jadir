import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Tooltip } from "@mui/material";
import { ToastContainer, toast } from "react-toastify";
import ViewMessageModal from "./ViewMessageModal";
import { useMessages } from "../../hooks/useMessages";
import LoadingCard from "../../../components/Global/LoadingCard";
import ErrorMessageCard from "../../../components/Global/ErrorMessageCard";

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

const AllMessages = () => {
  const navigate = useNavigate();

  const {
    messages = [],
    isLoading,
    isFetching,
    error,
    deleteMessage,
    isDeleting,
    refetch,
  } = useMessages({
    limit: 100,
  });

  const [selectedMessage, setSelectedMessage] = useState(null);

  const [openViewModal, setOpenViewModal] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  const handleView = (messageItem) => {
    setSelectedMessage(messageItem);
    setOpenViewModal(true);
  };

  const handleCloseViewModal = () => {
    setOpenViewModal(false);
    setSelectedMessage(null);
  };

  const handleReply = (messageItem) => {
    if (!messageItem?._id) return;

    navigate(`/reply-message/${messageItem._id}`);
  };

  const handleDelete = async (id) => {
    if (!id || isDeleting) return;

    try {
      await deleteMessage(id).unwrap();

      toast.success("Message deleted successfully");
    } catch (err) {
      console.error(err);

      toast.error(err?.data?.message || "Failed to delete message");
    }
  };

  if (isLoading) {
    return <LoadingCard />;
  }

  if (error) {
    return <ErrorMessageCard />;
  }

  const normalizedSearchTerm = searchTerm.trim().toLowerCase();

  const filteredMessages = messages.filter((messageItem) => {
    const matchesStatus =
      statusFilter === "all" ||
      (statusFilter === "replied" && messageItem?.isReplied) ||
      (statusFilter === "new" && !messageItem?.isReplied);

    const haystack = [
      messageItem?.name,
      messageItem?.email,
      messageItem?.phone,
      messageItem?.subject,
      messageItem?.requestType,
      messageItem?.message,
      messageItem?.attachment?.originalName,

      messageItem?.service?.title?.en,
      messageItem?.service?.title?.ar,
      messageItem?.service?.title?.tr,
    ]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();

    const matchesSearch =
      !normalizedSearchTerm || haystack.includes(normalizedSearchTerm);

    return matchesStatus && matchesSearch;
  });

  return (
    <Container>
      <div className="space-y-6">
        <div className="overflow-hidden rounded-[28px] border border-slate-200 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl">
          <div className="grid gap-6 px-6 py-7 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
            <div>
              <span className="inline-flex rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200">
                Inbox Management
              </span>

              <h2 className="mt-4 text-2xl font-semibold">
                Review and respond to incoming requests faster
              </h2>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-200">
                Search, filter, and triage messages from one place instead of
                scanning a raw table.
              </p>
            </div>
          </div>
        </div>

        {/* Search and filters */}
        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="grid items-end gap-4 lg:grid-cols-[minmax(0,1fr)_220px_auto]">
            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Search Inbox
              </label>

              <div className="relative">
                <i className="ki-outline ki-magnifier absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />

                <input
                  type="text"
                  className="input h-[42px] w-full pl-10"
                  value={searchTerm}
                  onChange={(event) => setSearchTerm(event.target.value)}
                  placeholder="Search by name, email, subject, service, or attachment"
                />
              </div>
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Status
              </label>

              <select
                className="input h-[42px] w-full"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value)}
              >
                <option value="all">All messages</option>

                <option value="new">New</option>

                <option value="replied">Replied</option>
              </select>
            </div>
            <div className="flex items-end lg:pb-4">
              <button
                type="button"
                className="btn btn-primary h-[42px] min-h-0 w-full whitespace-nowrap lg:w-auto"
                onClick={() => refetch()}
                disabled={isFetching}
              >
                <i
                  className={`ki-outline ki-arrows-circle mr-1 ${
                    isFetching ? "animate-spin" : ""
                  }`}
                />

                {isFetching ? "Refreshing..." : "Refresh Inbox"}
              </button>
            </div>
          </div>
        </div>

        {/* Messages table */}
        <div className="card card-grid min-w-full rounded-3xl border border-gray-200 shadow-sm">
          <div className="card-header flex-wrap py-5">
            <div>
              <h3 className="card-title">Messages</h3>

              <p className="mt-1 text-sm text-gray-500">
                Showing {filteredMessages.length} of {messages.length} messages
              </p>
            </div>
          </div>

          <div className="card-body">
            <div className="scrollable-x-auto">
              <table className="table table-auto table-border" id="grid_table">
                <thead>
                  <tr>
                    <th className="min-w-[180px]">Name</th>

                    <th className="min-w-[220px]">Email</th>

                    <th className="min-w-[180px]">Request</th>

                    <th className="min-w-[180px]">Attachment</th>

                    <th className="min-w-[140px]">Status</th>

                    <th className="w-[160px]">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredMessages.length ? (
                    filteredMessages.map((messageItem) => {
                      const requestType =
                        REQUEST_TYPE_LABELS[messageItem?.requestType] ||
                        messageItem?.requestType ||
                        "-";

                      const serviceName =
                        messageItem?.service?.title?.en ||
                        messageItem?.service?.title?.ar ||
                        messageItem?.service?.title?.tr ||
                        messageItem?.subject ||
                        "No linked service";

                      return (
                        <tr key={messageItem?._id}>
                          <td>
                            <div className="space-y-1">
                              <span className="text-sm font-medium text-gray-800">
                                {messageItem?.name || "-"}
                              </span>

                              <div className="text-xs text-gray-500">
                                {messageItem?.phone || "No phone provided"}
                              </div>
                            </div>
                          </td>

                          <td>
                            <span className="text-sm text-gray-700">
                              {messageItem?.email || "-"}
                            </span>
                          </td>

                          <td>
                            <div className="space-y-1">
                              <div className="text-sm text-gray-800">
                                {requestType}
                              </div>

                              <div className="text-xs text-gray-500">
                                {serviceName}
                              </div>
                            </div>
                          </td>

                          <td>
                            {messageItem?.attachment?.originalName ? (
                              <span className="inline-block max-w-[180px] truncate rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                                {messageItem.attachment.originalName}
                              </span>
                            ) : (
                              <span className="text-sm text-gray-400">
                                No attachment
                              </span>
                            )}
                          </td>

                          <td>
                            <span
                              className={`badge ${
                                messageItem?.isReplied
                                  ? "badge-success"
                                  : "badge-warning"
                              }`}
                            >
                              {messageItem?.isReplied ? "Replied" : "New"}
                            </span>
                          </td>

                          <td>
                            <div className="flex items-center gap-3">
                              <Tooltip title="View" placement="top">
                                <button
                                  type="button"
                                  className="cursor-pointer"
                                  onClick={() => handleView(messageItem)}
                                >
                                  <i className="ki-filled ki-eye text-xl" />
                                </button>
                              </Tooltip>

                              <Tooltip
                                title={
                                  messageItem?.isReplied
                                    ? "Edit Reply"
                                    : "Reply"
                                }
                                placement="top"
                              >
                                <button
                                  type="button"
                                  className="cursor-pointer text-blue-500"
                                  onClick={() => handleReply(messageItem)}
                                >
                                  <i className="ki-filled ki-message-text-2 text-xl" />
                                </button>
                              </Tooltip>

                              <Tooltip title="Delete" placement="top">
                                <button
                                  type="button"
                                  className="cursor-pointer text-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                                  onClick={() => handleDelete(messageItem?._id)}
                                  disabled={isDeleting}
                                >
                                  <i className="ki-filled ki-trash text-xl" />
                                </button>
                              </Tooltip>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="py-6 text-center text-gray-500"
                      >
                        No messages found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <ViewMessageModal
        isOpen={openViewModal}
        onClose={handleCloseViewModal}
        messageItem={selectedMessage}
      />

      <ToastContainer />
    </Container>
  );
};

export default AllMessages;
