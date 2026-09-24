import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { deleteAccomodation } from "../../store/Accomodation/Accomodation-action";
import toast from "react-hot-toast";

const MyAccomodation = ({ accomodation }) => {
  const dispatch = useDispatch();
  const [deletingId, setDeletingId] = useState(null);

  const handleDelete = async (id, name) => {
    const isConfirmed = window.confirm(
      `Are you sure you want to delete this accommodation?`
    );

    if (!isConfirmed) return;

    try {
      setDeletingId(id);
      await dispatch(deleteAccomodation(id));
      toast.success("Accommodation deleted successfully");
    } catch (error) {
      toast.error(
        error.response?.data?.message || error.message || "Failed to delete accommodation"
      );
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="main-container">
      {accomodation.map((accomodation) => (
        <div className="myaccomodation-container row" key={accomodation._id}>
          <div className="myaccomodation-image-container col-lg-3 col-md-3">
            <img
              className="myaccomodation-img"
              src={
                accomodation.images && accomodation.images.length > 0
                  ? accomodation.images[0].url
                  : ""
              }
              alt={accomodation.propertyName}
            />
          </div>
          <div className="myaccomodation-information col-lg-9 col-md-9">
            <div className="myaccomodation-header-row">
              <h6 className="myaccomodation-hotel-name">
                {accomodation.propertyName}
              </h6>
              <button
                className="delete-accomodation-btn"
                onClick={() => handleDelete(accomodation._id, accomodation.propertyName)}
                disabled={deletingId === accomodation._id}
                title="Delete Accommodation"
              >
                <span className="material-symbols-outlined delete-icon">
                  delete
                </span>
                {deletingId === accomodation._id ? "Deleting..." : "Delete"}
              </button>
            </div>
            <div className="stay-information">
              <span className="info">
                <span className="material-symbols-outlined icon">
                  calendar_month
                </span>
                Check In Time: {accomodation.checkInTime}
              </span>
              <span className="material-symbols-outlined icon">
                arrow_forward
              </span>
              <span className="info">
                <span className="material-symbols-outlined icon">
                  calendar_month
                </span>
                Check Out Time: {accomodation.checkOutTime}
              </span>
            </div>
            <p className="myaccomodation-city">
              City :{accomodation.address?.city}
            </p>
            <p className="myaccomodation-guest">
              Max no of guest : {accomodation.maximumGuest}
            </p>
            <h5 className="myaccomodation-price">
              <span className="material-symbols-outlined">payments</span> Total
              Price :&#8377; {accomodation.price}
            </h5>
          </div>
        </div>
      ))}
    </div>
  );
};

export default MyAccomodation;
