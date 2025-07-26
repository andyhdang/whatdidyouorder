import React from "react";
import CloseIcon from "../../assets/icons/CloseIcon";
import "./Modal.css";

const Modal = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose} aria-label="Close">
          <CloseIcon size={24} />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
