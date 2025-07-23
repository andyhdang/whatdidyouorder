import React from "react";
import AddIcon from "../../assets/icons/AddIcon";
import MinusIcon from "../../assets/icons/MinusIcon";
import "./Stepper.css";

function Stepper({
  value,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  disabled = false,
  ...props
}) {
  const handleDecrement = () => {
    if (!disabled && value > min) {
      onChange(value - step);
    }
  };
  const handleIncrement = () => {
    if (!disabled && value < max) {
      onChange(value + step);
    }
  };
  return (
    <div className="stepper" {...props}>
      <button
        type="button"
        className="stepper-btn"
        onClick={handleDecrement}
        disabled={disabled || value <= min}
        aria-label="Decrease"
      >
        <MinusIcon width={20} height={20} />
      </button>
      <input
        className="stepper-input"
        type="number"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => {
          let val = parseInt(e.target.value, 10);
          if (isNaN(val)) val = min;
          val = Math.max(min, Math.min(max, val));
          onChange(val);
        }}
        disabled={disabled}
        aria-label="Quantity"
      />
      <button
        type="button"
        className="stepper-btn"
        onClick={handleIncrement}
        disabled={disabled || value >= max}
        aria-label="Increase"
      >
        <AddIcon width={20} height={20} />
      </button>
    </div>
  );
}

export default Stepper;
