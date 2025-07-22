import Button from "../Button/Button";
import "./EmptyArea.css";

function EmptyArea({ text, buttonLabel, onButtonClick }) {
  return (
    <div className="empty-area">
      <div className="empty-area__text">{text}</div>
      {buttonLabel && <Button label={buttonLabel} onClick={onButtonClick} />}
    </div>
  );
}

export default EmptyArea;
