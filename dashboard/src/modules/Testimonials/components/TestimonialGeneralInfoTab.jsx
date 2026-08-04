import { CrudAvatarUpload } from "../../../partials/crud/CrudAvatarUpload";

const TestimonialGeneralInfoTab = ({
  name,
  setName,
  rating,
  setRating,
  isFeatured,
  setIsFeatured,
  order,
  setOrder,
  imagePreview,
  onImageChange,
}) => {
  console.log(imagePreview);
  
  return (
    <div className="flex flex-col lg:flex-row gap-4">
      <div className="flex-1 card">
        <div className="card-header">
          <h3 className="card-title">General Info</h3>
        </div>

        <div className="card-table scrollable-x-auto pb-3">
          <table className="table-auto w-full text-sm text-gray-600">
            <tbody>
              <tr>
                <td className="p-2 pt-4">
                  <div className="input-group">
                    <span className="btn btn-input w-[20%]">Rating</span>
                    <input
                      type="number"
                      className="input"
                      min="1"
                      max="5"
                      value={rating}
                      onChange={(e) => setRating(Number(e.target.value))}
                    />
                  </div>
                </td>
              </tr>

              <tr>
                <td className="p-2 pt-4">
                  <div className="input-group">
                    <span className="btn btn-input w-[20%]">Featured</span>
                    <select
                      className="input"
                      value={isFeatured ? "true" : "false"}
                      onChange={(e) => setIsFeatured(e.target.value === "true")}
                    >
                      <option value="false">No</option>
                      <option value="true">Yes</option>
                    </select>
                  </div>
                </td>
              </tr>

              <tr>
                <td className="p-2 pt-4">
                  <div className="input-group">
                    <span className="btn btn-input w-[20%]">Order</span>
                    <input
                      type="number"
                      className="input"
                      value={order}
                      onChange={(e) => setOrder(Number(e.target.value))}
                    />
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div className="lg:w-[35%] self-start">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Image</h3>
          </div>

          <div className="p-6">
            <CrudAvatarUpload
              onChange={onImageChange}
              value={imagePreview}
              initialImageURL={
                typeof imagePreview === "string" ? imagePreview : ""
              }
              adviceMessage="Testimonial image | Max 1MB"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default TestimonialGeneralInfoTab;
