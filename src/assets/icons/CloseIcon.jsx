import React from "react";

const CloseIcon = ({ size = 24, color = "#1f1f1f", style = {}, ...props }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 -960 960 960"
    fill={color}
    style={style}
    {...props}
  >
    <path d="m256-200-56-56 224-224-224-224 56-56 224 224 224-224 56 56-224 224 224 224-56 56-224-224-224 224Z" />
  </svg>
);

export default CloseIcon;
