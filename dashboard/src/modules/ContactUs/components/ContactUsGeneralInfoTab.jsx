import { useEffect, useMemo, useState } from "react";

const LANGS = ["en", "ar" , "tr"];

const createBranch = () => ({
  name: { en: "", ar: "", tr: "" },
  address: { en: "", ar: "", tr: "" },
  mapLink: "",
  phones: [],
  whatsapp: "",
  order: 0,
});

const getPrimaryValue = (items = [], fallback = "Not added yet") =>
  items[0] || fallback;

const getExtraCountLabel = (items = [], noun = "items") => {
  if (!items.length || items.length === 1) return "";

  return `+${items.length - 1} ${noun}`;
};

const getPrimaryLocalizedValue = (value = {}) =>
  value.en || value.ar || value.tr || "Not added yet";

const SummaryPill = ({ icon, label, value, hint, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className="rounded-2xl border border-gray-200 bg-white px-4 py-4 text-left transition hover:border-primary/40 hover:shadow-sm"
  >
    <div className="flex items-start justify-between gap-3">
      <div>
        <div className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
          <i className={icon}></i>
          <span>{label}</span>
        </div>
        <div className="text-sm font-medium text-gray-900 break-all">
          {value}
        </div>
      </div>
      {hint ? (
        <span className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600">
          {hint}
        </span>
      ) : null}
    </div>
  </button>
);

const LocalizedTextareaCard = ({
  title,
  description,
  values,
  onChange,
  minHeight = "min-h-[110px]",
}) => (
  <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
    <div className="mb-4">
      <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
      {description ? (
        <p className="mt-1 text-sm text-gray-500">{description}</p>
      ) : null}
    </div>

    <div className="grid gap-4 xl:grid-cols-3">
      {LANGS.map((lang) => (
        <div key={lang} className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
            {lang}
          </label>
          <textarea
            className={`input w-full ${minHeight} tracking-[1px] leading-[20px]`}
            value={values?.[lang] || ""}
            onChange={(e) => onChange(lang, e.target.value)}
            placeholder={`Enter ${title.toLowerCase()} in ${lang.toUpperCase()}`}
          />
        </div>
      ))}
    </div>
  </div>
);

const ContactListModal = ({
  isOpen,
  title,
  description,
  itemLabel,
  items,
  setItems,
  onClose,
}) => {
  const [draftItems, setDraftItems] = useState(items || []);

  useEffect(() => {
    if (isOpen) {
      setDraftItems(items || []);
    }
  }, [isOpen, items]);

  if (!isOpen) return null;

  const updateItem = (index, value) => {
    setDraftItems((prev) =>
      prev.map((item, currentIndex) => (currentIndex === index ? value : item)),
    );
  };

  const addItem = () => {
    setDraftItems((prev) => [...prev, ""]);
  };

  const removeItem = (index) => {
    setDraftItems((prev) =>
      prev.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  const handleSave = () => {
    setItems(draftItems.map((item) => item.trim()).filter(Boolean));
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 py-6">
      <div className="w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-5">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
            <p className="mt-1 text-sm text-gray-500">{description}</p>
          </div>
          <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
            <i className="ki-outline ki-cross"></i>
          </button>
        </div>

        <div className="max-h-[60vh] space-y-4 overflow-y-auto px-6 py-5">
          {!draftItems.length ? (
            <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500">
              No {itemLabel.toLowerCase()} added yet.
            </div>
          ) : null}

          {draftItems.map((item, index) => (
            <div
              key={`${title}-${index}`}
              className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-gray-50 p-3"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-xs font-semibold text-gray-500">
                {index + 1}
              </div>
              <input
                type="text"
                className="input flex-1"
                value={item}
                onChange={(e) => updateItem(index, e.target.value)}
                placeholder={`Enter ${itemLabel.toLowerCase()}`}
              />
              <button
                type="button"
                className="btn btn-sm btn-danger btn-outline"
                onClick={() => removeItem(index)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 px-6 py-5">
          <button
            type="button"
            className="btn btn-light-primary"
            onClick={addItem}
          >
            Add {itemLabel}
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={handleSave}
            >
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const BranchCard = ({
  branch,
  index,
  updateBranch,
  updateBranchLang,
  onRemove,
}) => {
  const [isPhonesModalOpen, setIsPhonesModalOpen] = useState(false);

  return (
    <>
      <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
        <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <i className="ki-outline ki-geolocation text-lg"></i>
              </div>
              <div>
                <h4 className="text-base font-semibold text-gray-900">
                  {getPrimaryLocalizedValue(branch.name)}
                </h4>
                <p className="mt-1 text-sm text-gray-500">
                  Branch {index + 1} •
                </p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
              Order {branch.order ?? 0}
            </span>
            <button
              type="button"
              className="btn btn-sm btn-danger btn-outline"
              onClick={onRemove}
            >
              Remove Branch
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-5">
            <LocalizedTextareaCard
              title="Branch Name"
              description="Give each branch a clear localized name."
              values={branch.name}
              onChange={(lang, value) =>
                updateBranchLang(index, "name", lang, value)
              }
              minHeight="min-h-[88px]"
            />

            <LocalizedTextareaCard
              title="Branch Address"
              description="Store each branch address in all supported languages."
              values={branch.address}
              onChange={(lang, value) =>
                updateBranchLang(index, "address", lang, value)
              }
              minHeight="min-h-[130px]"
            />
          </div>

          <div className="space-y-4">
            <SummaryPill
              icon="ki-outline ki-phone"
              label="Phones"
              value={getPrimaryValue(branch.phones)}
              hint={getExtraCountLabel(branch.phones, "phones")}
              onClick={() => setIsPhonesModalOpen(true)}
            />

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                Map Link
              </label>
              <input
                type="text"
                className="input"
                value={branch.mapLink || ""}
                onChange={(e) => updateBranch(index, "mapLink", e.target.value)}
                placeholder="Google Maps or branch map URL"
              />
            </div>

            <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
              <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                WhatsApp
              </label>
              <input
                type="text"
                className="input"
                value={branch.whatsapp || ""}
                onChange={(e) =>
                  updateBranch(index, "whatsapp", e.target.value)
                }
                placeholder="Branch WhatsApp number"
              />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                  Display Order
                </label>
                <input
                  type="number"
                  className="input"
                  value={branch.order ?? 0}
                  onChange={(e) =>
                    updateBranch(index, "order", Number(e.target.value))
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <ContactListModal
        isOpen={isPhonesModalOpen}
        title={`Branch ${index + 1} Phones`}
        description="Manage the phone numbers for this branch."
        itemLabel="Phone"
        items={branch.phones || []}
        setItems={(value) => updateBranch(index, "phones", value)}
        onClose={() => setIsPhonesModalOpen(false)}
      />
    </>
  );
};

const ContactUsGeneralInfoTab = ({
  emails,
  setEmails,
  phones,
  setPhones,
  mapLink,
  setMapLink,
  whatsapp,
  setWhatsapp,
  address,
  onAddressChange,
  branches,
  setBranches,
}) => {
  const [activeModal, setActiveModal] = useState(null);

  const updateBranch = (index, key, value) => {
    setBranches((prev) =>
      prev.map((branch, currentIndex) =>
        currentIndex === index ? { ...branch, [key]: value } : branch,
      ),
    );
  };

  const updateBranchLang = (index, key, lang, value) => {
    setBranches((prev) =>
      prev.map((branch, currentIndex) =>
        currentIndex === index
          ? {
              ...branch,
              [key]: {
                ...(branch[key] || {}),
                [lang]: value,
              },
            }
          : branch,
      ),
    );
  };

  const addBranch = () => {
    setBranches((prev) => [...prev, createBranch()]);
  };

  const removeBranch = (index) => {
    setBranches((prev) =>
      prev.filter((_, currentIndex) => currentIndex !== index),
    );
  };

  return (
    <>
      <div className="space-y-6">
        <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Primary Contact Channels
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Update the main contact methods that appear across the
                    platform.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <SummaryPill
                  icon="ki-outline ki-sms"
                  label="Emails"
                  value={getPrimaryValue(emails)}
                  hint={getExtraCountLabel(emails, "emails")}
                  onClick={() => setActiveModal("emails")}
                />

                <SummaryPill
                  icon="ki-outline ki-phone"
                  label="Phones"
                  value={getPrimaryValue(phones)}
                  hint={getExtraCountLabel(phones, "phones")}
                  onClick={() => setActiveModal("phones")}
                />
              </div>

              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                    Main Map Link
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={mapLink}
                    onChange={(e) => setMapLink(e.target.value)}
                    placeholder="Google Maps or custom map URL"
                  />
                </div>

                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                    Main WhatsApp
                  </label>
                  <input
                    type="text"
                    className="input"
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="WhatsApp number"
                  />
                </div>
              </div>
            </div>

            <LocalizedTextareaCard
              title="Main Address"
              description="Maintain the primary office address in English and Arabic."
              values={address}
              onChange={onAddressChange}
              minHeight="min-h-[130px]"
            />
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900">
                Page Snapshot
              </h3>
              <div className="mt-4 space-y-4">
                <div className="rounded-2xl bg-gray-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                    Primary Email
                  </div>
                  <div className="mt-2 text-sm font-medium text-gray-900 break-all">
                    {getPrimaryValue(emails)}
                  </div>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                    Primary Phone
                  </div>
                  <div className="mt-2 text-sm font-medium text-gray-900">
                    {getPrimaryValue(phones)}
                  </div>
                </div>
                <div className="rounded-2xl bg-gray-50 p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                    Main Address Preview
                  </div>
                  <div className="mt-2 text-sm font-medium text-gray-900 whitespace-pre-wrap">
                    {getPrimaryLocalizedValue(address)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 border-b border-gray-100 pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Branches</h3>
              <p className="mt-1 text-sm text-gray-500">
                Organize branch-level addresses, WhatsApp numbers, and phone
                lists in reusable cards.
              </p>
            </div>

            <button
              type="button"
              className="btn btn-primary"
              onClick={addBranch}
            >
              <i className="ki-outline ki-plus mr-1"></i>
              Add Branch
            </button>
          </div>

          <div className="mt-6 space-y-5">
            {!branches.length ? (
              <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 px-6 py-12 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
                  <i className="ki-outline ki-geolocation text-2xl"></i>
                </div>
                <h4 className="mt-4 text-base font-semibold text-gray-900">
                  No branches yet
                </h4>
                <p className="mt-2 text-sm text-gray-500">
                  Add your first branch to manage localized names, addresses,
                  and direct contacts.
                </p>
              </div>
            ) : null}

            {branches.map((branch, index) => (
              <BranchCard
                key={branch?._id || `branch-${index}`}
                branch={branch}
                index={index}
                updateBranch={updateBranch}
                updateBranchLang={updateBranchLang}
                onRemove={() => removeBranch(index)}
              />
            ))}
          </div>
        </div>
      </div>

      <ContactListModal
        isOpen={activeModal === "emails"}
        title="Manage Emails"
        description="Add the email addresses used for the contact page and dashboard."
        itemLabel="Email"
        items={emails}
        setItems={setEmails}
        onClose={() => setActiveModal(null)}
      />

      <ContactListModal
        isOpen={activeModal === "phones"}
        title="Manage Phones"
        description="Add the public phone numbers shown for the main contact information."
        itemLabel="Phone"
        items={phones}
        setItems={setPhones}
        onClose={() => setActiveModal(null)}
      />
    </>
  );
};

export default ContactUsGeneralInfoTab;
