import React from "react";
import "./UrlPreview.css";
import previewImg from "../../assets/images/Url preview.png";

function UrlPreview({ url, title }) {
  return (
    <a
      className="url-preview"
      href={url}
      target="_blank"
      rel="noopener noreferrer"
    >
      <img
        src={previewImg}
        alt="URL preview thumbnail"
        className="url-preview-img"
      />
      <div className="url-preview-info">
        <div className="url-preview-title">{title || url}</div>
        <div className="url-preview-url">{url}</div>
      </div>
    </a>
  );
}

export default UrlPreview;
