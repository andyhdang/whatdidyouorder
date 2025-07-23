import React from "react";

function MinusIcon({ width = 24, height = 24, style = {}, ...props }) {
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
      <path d="M200-440v-80h560v80H200Z" />
    </svg>
  );
}

export default MinusIcon;
