import React from "react";
import "./Snackbar.css";
import CloseIcon from "../../assets/icons/CloseIcon";

function Snackbar({
  open,
  message = "",
  onClose,
  duration = 3000,
  type = "info",
}) {
  React.useEffect(() => {
    if (open && duration > 0) {
      const timer = setTimeout(() => {
        onClose && onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [open, duration, onClose]);

  return (
    <div
      className={`snackbar${open ? " show" : ""} snackbar--${type}`}
      role="status"
      aria-live="polite"
    >
      <span>{message}</span>
      {onClose && (
        <button
          className="snackbar__close"
          onClick={onClose}
          aria-label="Close notification"
        >
          <CloseIcon size={18} />
        </button>
      )}
    </div>
  );
}

export default Snackbar;
