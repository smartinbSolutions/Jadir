import useUpdateCategoryForm from "../hooks/useUpdateCategoryForm";

const UpdateCategoryModal = ({ isOpen, onClose, initialCategory }) => {
  const { category, errors, isLoading, handleChange, handleSave } =
    useUpdateCategoryForm(initialCategory, onClose);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-[600px]">
        <div className="flex justify-between items-center border-b pb-3">
          <h3 className="text-lg font-semibold">Update Blog Category</h3>
          <button className="btn btn-xs btn-icon btn-light" onClick={onClose}>
            <i className="ki-outline ki-cross"></i>
          </button>
        </div>

        <div className="modal-body mt-4">
          {["ar", "en", "tr"].map((lang) => (
            <div className="input-group mb-3" key={lang}>
              <span className="btn btn-input w-[33%]">
                Name ({lang.toUpperCase()})
              </span>
              <input
                className={`input w-full border rounded p-2 ${
                  errors[lang] ? "border-red-500" : "border-gray-300"
                }`}
                placeholder={`Enter name in ${lang.toUpperCase()}`}
                type="text"
                value={category.name[lang]}
                onChange={(e) => handleChange(lang, e.target.value)}
              />
            </div>
          ))}
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            className="btn btn-secondary"
            onClick={onClose}
            disabled={isLoading}
          >
            Cancel
          </button>
          <button
            className="btn btn-primary"
            onClick={handleSave}
            disabled={isLoading}
          >
            {isLoading ? "Updating..." : "Update"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateCategoryModal;
