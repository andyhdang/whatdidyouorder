import "./Button.css";

function Button({
  label,
  icon,
  trailingIcon,
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
      {trailingIcon && (
        <span className="btn-icon" style={{ marginLeft: "0.1em" }}>
          {trailingIcon}
        </span>
      )}
    </button>
  );
}

export default Button;
