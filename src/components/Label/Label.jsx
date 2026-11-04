import "./Label.css";

function Label({ children, className = "" }) {
  return <span className={`label ${className}`.trim()}>{children}</span>;
}

export default Label;
