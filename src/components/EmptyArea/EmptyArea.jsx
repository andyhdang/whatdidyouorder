import "./EmptyArea.css";

function EmptyArea({ text, onButtonClick }) {
  const clickable = typeof onButtonClick === "function";
  return (
    <div
      className={"empty-area" + (clickable ? " clickable" : "")}
      onClick={clickable ? onButtonClick : undefined}
      tabIndex={clickable ? 0 : undefined}
      role={clickable ? "button" : undefined}
      onKeyDown={
        clickable
          ? (e) => {
              if (e.key === "Enter" || e.key === " ") onButtonClick();
            }
          : undefined
      }
      style={clickable ? { cursor: "pointer" } : undefined}
    >
      <div className="empty-area__text">{text}</div>
    </div>
  );
}

export default EmptyArea;
