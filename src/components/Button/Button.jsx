import "./Button.css";

function Button({
  label,
  icon,
  onClick,
  style,
  className = "",
  fullWidth = false,
  ...props
}) {
  return (
    <button
      className={`custom-btn${
        fullWidth ? " full-width" : ""
      } ${className}`.trim()}
      onClick={onClick}
      style={style}
      {...props}
    >
      {icon && <span className="btn-icon">{icon}</span>}
      {label && <span className="btn-label">{label}</span>}
    </button>
  );
}

export default Button;
