import "./InputField.css";

function InputField({
  label,
  placeholder,
  value,
  onChange,
  type = "text",
  name,
}) {
  return (
    <div className="input-field">
      <label htmlFor={name} className="input-label">
        {label}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        className="input-box"
        placeholder={placeholder}
        value={value}
        onChange={onChange}
      />
    </div>
  );
}

export default InputField;
