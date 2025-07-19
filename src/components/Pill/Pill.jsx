import "./Pill.css";

function Pill({ label, selected = false, onClick }) {
  return (
    <button
      className={`pill${selected ? " selected" : ""}`}
      onClick={onClick}
      type="button"
    >
      {label}
    </button>
  );
}

export default Pill;
