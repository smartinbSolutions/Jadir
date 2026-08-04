import { CrudAvatarUpload } from "../../../partials/crud/CrudAvatarUpload";

const PartnerFormCard = ({
  title,
  setTitle,
  brief,
  setBrief,
  testimonial,
  setTestimonial,
  order,
  setOrder,
  imagePreview,
  onImageChange,
}) => {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-5">
              <h3 className="text-lg font-semibold text-gray-900">
                Partner Info
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Add the partner title, short brief, ordering, and visibility.
              </p>
            </div>

            <div className="space-y-4">
              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {["en", "ar", "tr"].map((lang) => (
                    <div key={lang}>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                        Title ({lang})
                      </label>
                      <input
                        type="text"
                        className="input"
                        placeholder={`Enter title in ${lang.toUpperCase()}`}
                        value={title[lang] || ""}
                        onChange={(e) =>
                          setTitle((prev) => ({
                            ...prev,
                            [lang]: e.target.value,
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {["en", "ar", "tr"].map((lang) => (
                    <div key={lang}>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                        Brief ({lang})
                      </label>
                      <textarea
                        className="input min-h-[120px] w-full p-3 tracking-[1px] leading-[20px]"
                        placeholder={`Enter brief in ${lang.toUpperCase()}`}
                        value={brief[lang] || ""}
                        onChange={(e) =>
                          setBrief((prev) => ({
                            ...prev,
                            [lang]: e.target.value,
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                <div className="grid gap-4 md:grid-cols-2">
                  {["en", "ar", "tr"].map((lang) => (
                    <div key={lang}>
                      <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                        Testimonial ({lang})
                      </label>
                      <textarea
                        className="input min-h-[120px] w-full p-3 tracking-[1px] leading-[20px]"
                        placeholder={`Enter testimonial in ${lang.toUpperCase()}`}
                        value={testimonial[lang] || ""}
                        onChange={(e) =>
                          setTestimonial((prev) => ({
                            ...prev,
                            [lang]: e.target.value,
                          }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <label className="mb-2 block text-xs font-semibold uppercase tracking-[0.18em] text-gray-400">
                    Order
                  </label>
                  <input
                    type="number"
                    className="input"
                    value={order}
                    onChange={(e) => setOrder(Number(e.target.value))}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-3xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                Partner Image
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                Upload the partner logo or visual used in the partner section.
              </p>
            </div>

            <div className="p-2">
              <CrudAvatarUpload
                onChange={onImageChange}
                value={imagePreview}
                initialImageURL={
                  typeof imagePreview === "string" ? `${imagePreview}` : ""
                }
                adviceMessage="Partner Logo | Max 1MB"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PartnerFormCard;
