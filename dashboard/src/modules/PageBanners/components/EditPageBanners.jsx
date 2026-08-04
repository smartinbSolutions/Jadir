import { Container } from "@mui/material";
import { useEffect, useMemo, useRef, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import ErrorMessageCard from "../../../components/Global/ErrorMessageCard";
import LoadingCard from "../../../components/Global/LoadingCard";
import getImageUrl from "../../../utils/getImageUrl";
import { usePageBanners } from "../../hooks/usePageBanners";

const MAX_FILE_SIZE = 2 * 1024 * 1024;

const PAGE_FIELDS = [
  {
    key: "about",
    label: "About",
  },
  {
    key: "services",
    label: "Services",
  },
  {
    key: "projects",
    label: "Projects",
  },
  {
    key: "blogs",
    label: "Blogs",
  },
  {
    key: "careers",
    label: "Careers",
  },
  {
    key: "search",
    label: "Search",
  },
  {
    key: "contact",
    label: "Contact",
  },
  {
    key: "policies",
    label: "Policies",
  },
];

const createEmptyDrafts = () =>
  PAGE_FIELDS.reduce((result, field) => {
    result[field.key] = {
      existing: "",
      preview: "",
      file: null,
    };

    return result;
  }, {});

const PageBannerCard = ({ field, draft, onFileChange }) => {
  const handleInputChange = (event) => {
    const file = event.target.files?.[0];

    onFileChange(field.key, file);

    // Allow selecting the same file again.
    event.target.value = "";
  };

  return (
    <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex-1">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
            Website Page
          </div>

          <h3 className="text-lg font-semibold text-gray-900">{field.label}</h3>

          <p className="mt-2 text-sm text-gray-500">
            Upload one banner image for the {field.label.toLowerCase()} page.
            The file must be an image and no larger than 2MB.
          </p>

          <div className="mt-5">
            <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
              Banner Image
            </label>

            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="input"
              onChange={handleInputChange}
            />
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs text-gray-500">
            <span className="rounded-full bg-gray-100 px-3 py-1">
              One image only
            </span>

            <span className="rounded-full bg-gray-100 px-3 py-1">Max 2MB</span>

            <span className="rounded-full bg-gray-100 px-3 py-1">
              Recommended 2:1 ratio
            </span>
          </div>
        </div>

        <div className="w-full max-w-[320px]">
          <div className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
            Preview
          </div>

          <div className="aspect-[2/1] overflow-hidden rounded-2xl border border-gray-200 bg-gray-50">
            {draft?.preview ? (
              <img
                src={draft.preview}
                alt={`${field.label} banner`}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center px-4 text-center text-sm text-gray-400">
                No banner selected yet
              </div>
            )}
          </div>

          <div className="mt-3 break-all text-xs text-gray-500">
            {draft?.file
              ? `New file: ${draft.file.name}`
              : draft?.existing
                ? "Current saved banner"
                : "Using website fallback"}
          </div>
        </div>
      </div>
    </div>
  );
};

const EditPageBanners = () => {
  const { pageBanners, isLoading, error, updatePageBanners, isUpdating } =
    usePageBanners();

  const [drafts, setDrafts] = useState(createEmptyDrafts);

  const blobUrlsRef = useRef({});

  const revokeBlobUrl = (pageKey) => {
    const blobUrl = blobUrlsRef.current[pageKey];

    if (blobUrl) {
      URL.revokeObjectURL(blobUrl);
      delete blobUrlsRef.current[pageKey];
    }
  };

  useEffect(() => {
    if (!pageBanners) return;

    Object.values(blobUrlsRef.current).forEach((blobUrl) => {
      URL.revokeObjectURL(blobUrl);
    });

    blobUrlsRef.current = {};

    const nextDrafts = createEmptyDrafts();

    PAGE_FIELDS.forEach(({ key }) => {
      const existing = pageBanners?.[key] || "";

      const imagePath =
        pageBanners?.imageUrls?.[key] ||
        (existing ? `/uploads/${existing.replace(/^\/+/, "")}` : "");

      nextDrafts[key] = {
        existing,
        preview: imagePath ? getImageUrl(imagePath) : "",
        file: null,
      };
    });

    setDrafts(nextDrafts);
  }, [pageBanners]);

  useEffect(() => {
    return () => {
      Object.values(blobUrlsRef.current).forEach((blobUrl) => {
        URL.revokeObjectURL(blobUrl);
      });

      blobUrlsRef.current = {};
    };
  }, []);

  const changedPages = useMemo(
    () => PAGE_FIELDS.filter(({ key }) => Boolean(drafts?.[key]?.file)),
    [drafts],
  );

  const handleFileChange = (pageKey, file) => {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");

      return;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast.error("Image size must be 2MB or smaller");

      return;
    }

    revokeBlobUrl(pageKey);

    const temporaryUrl = URL.createObjectURL(file);

    blobUrlsRef.current[pageKey] = temporaryUrl;

    setDrafts((prev) => ({
      ...prev,

      [pageKey]: {
        ...prev[pageKey],
        file,
        preview: temporaryUrl,
      },
    }));
  };

  const handleSave = async () => {
    if (!changedPages.length) {
      toast.info("Choose at least one banner image before saving");

      return;
    }

    try {
      const formData = new FormData();

      changedPages.forEach(({ key }) => {
        const file = drafts?.[key]?.file;

        if (file instanceof File) {
          formData.append(key, file);
        }
      });

      await updatePageBanners(formData).unwrap();

      toast.success("Page banners saved successfully");
    } catch (err) {
      console.error(err);

      toast.error(err?.data?.message || "Failed to save page banners");
    }
  };

  if (isLoading) {
    return <LoadingCard />;
  }

  if (error) {
    return <ErrorMessageCard />;
  }

  return (
    <Container>
      <div className="space-y-6">
        <div className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-gray-900">Page Banners</h2>

          <p className="mt-2 text-sm text-gray-500">
            Manage the hero banner images used by the main website pages.
          </p>
        </div>

        <div className="space-y-6">
          {PAGE_FIELDS.map((field) => (
            <PageBannerCard
              key={field.key}
              field={field}
              draft={drafts[field.key]}
              onFileChange={handleFileChange}
            />
          ))}
        </div>
      </div>

      <div className="sticky bottom-4 z-20 mt-6 flex justify-end">
        <div className="rounded-2xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur">
          <button
            type="button"
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isUpdating || !changedPages.length}
          >
            {isUpdating
              ? "Saving..."
              : `Save ${changedPages.length || ""} Page Banner${
                  changedPages.length === 1 ? "" : "s"
                }`}
          </button>
        </div>
      </div>

      <ToastContainer pauseOnHover />
    </Container>
  );
};

export default EditPageBanners;
