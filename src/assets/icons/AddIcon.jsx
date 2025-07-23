import React from "react";

function AddIcon({ width = 24, height = 24, style = {}, ...props }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      viewBox="0 -960 960 960"
      fill="currentColor"
      style={style}
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <path d="M440-440H200v-80h240v-240h80v240h240v80H520v240h-80v-240Z" />
    </svg>
  );
}

export default AddIcon;
