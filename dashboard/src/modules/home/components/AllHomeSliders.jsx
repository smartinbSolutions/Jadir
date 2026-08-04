import React from "react";
import { Container, Tooltip } from "@mui/material";
import { useNavigate } from "react-router-dom";
import LoadingCard from "@/components/Global/LoadingCard";
import ErrorMessageCard from "@/components/Global/ErrorMessageCard";
import AddButton from "@/components/Global/AddButton";
import { ToastContainer, toast } from "react-toastify";
import { useHomeSliders } from "../../hooks/useHomeSliders";
import getImageUrl from "../../../utils/getImageUrl";

const AllHomeSliders = () => {
  const navigate = useNavigate();

  const { sliders, isLoading, error, deleteHomeSlider, isDeleting } =
    useHomeSliders({
      limit: 100,
    });

  const handleDelete = async (id) => {
    try {
      await deleteHomeSlider(id).unwrap();
      toast.success("Slider deleted successfully");
    } catch (err) {
      console.error(err);
      toast.error(err?.data?.message || "Failed to delete slider");
    }
  };

  if (isLoading) return <LoadingCard />;
  if (error) return <ErrorMessageCard />;

  return (
    <Container>
      <div className="grid">
        <div className="card card-grid min-w-full">
          <div className="card-header py-5 flex-wrap">
            <h3 className="card-title">Home Sliders</h3>

            <div className="flex gap-4 items-center">
              <AddButton
                label="New Slider"
                onClick={() => navigate("/add-home-slider")}
              />
            </div>
          </div>

          <div className="card-body">
            <div className="scrollable-x-auto">
              <table className="table table-auto table-border" id="grid_table">
                <thead>
                  <tr>
                    <th className="min-w-[100px]">Image</th>
                    <th className="min-w-[100px]">Order</th>
                    <th className="w-[120px]">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {sliders?.map((slider) => (
                    <tr key={slider._id}>
                      <td>
                        {slider?.img ? (
                          <img
                            src={getImageUrl(slider.imageUrl)}
                            alt="slider"
                            className="w-[80px] h-[50px] rounded object-cover border"
                          />
                        ) : (
                          <span className="text-gray-400 text-sm">
                            No image
                          </span>
                        )}
                      </td>

                      <td>{slider?.order ?? 0}</td>

                      <td>
                        <div className="flex gap-3">
                          <Tooltip title="Edit" placement="top">
                            <button
                              className="cursor-pointer"
                              onClick={() =>
                                navigate(`/update-home-slider/${slider._id}`)
                              }
                            >
                              <i className="ki-filled ki-notepad-edit text-xl" />
                            </button>
                          </Tooltip>

                          <Tooltip title="Delete" placement="top">
                            <button
                              className="cursor-pointer text-red-500"
                              onClick={() => handleDelete(slider._id)}
                              disabled={isDeleting}
                            >
                              <i className="ki-filled ki-trash text-xl" />
                            </button>
                          </Tooltip>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {!sliders?.length && (
                    <tr>
                      <td
                        colSpan={3}
                        className="text-center py-6 text-gray-500"
                      >
                        No sliders found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer />
    </Container>
  );
};

export default AllHomeSliders;
