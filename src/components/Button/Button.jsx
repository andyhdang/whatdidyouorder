import "./Button.css";

function Button({ label, icon, onClick, type = "button", ...props }) {
  return (
    <button className="custom-btn" type={type} onClick={onClick} {...props}>
      {icon && <span className="btn-icon">{icon}</span>}
      <span className="btn-label">{label}</span>
    </button>
  );
}

export default Button;
