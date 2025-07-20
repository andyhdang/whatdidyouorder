import "./Card.css";

function Card({ heading, children, button, className }) {
  return (
    <div className={className || "custom-card"}>
      {heading && <h3 className="card-heading">{heading}</h3>}
      <div className="card-body">{children}</div>
      {button && <div className="card-action">{button}</div>}
    </div>
  );
}

export default Card;
