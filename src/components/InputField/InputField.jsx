import "./InputField.css";

function InputField({
  label,
  description,
  placeholder,
  value,
  onChange,
  type = "text",
  name,
  onEnter,
  error,
}) {
  const handleKeyDown = (e) => {
    if (e.key === "Enter" && typeof onEnter === "function") {
      onEnter(e);
    }
  };
  return (
    <div className={`input-field${error ? " error" : ""}`}>
      <label htmlFor={name} className="input-label">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className={`input-box${error ? " input-error" : ""}`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {description && <div className="input-description">{description}</div>}
      {error && (
        <div className="input-error-message" id={`${name}-error`}>
          {error}
        </div>
      )}
    </div>
  );
}

export default InputField;
