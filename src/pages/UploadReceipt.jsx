import React, { useRef, useState, useEffect } from "react";
import "./UploadReceipt.css";

const UploadReceipt = ({ onNext }) => {
  const fileInputRef = useRef(null);
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:300/")
      .then((response) => response.text())
      .then((data) => setMessage(data))
      .catch((error) => console.error("Error fetching from backend:", error));
  }, []);

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current.click();
  };

  const handleNext = () => {
    if (file && onNext) {
      onNext(file);
    }
  };

  return (
    <div className="upload-receipt-container">
      <h2>Upload Receipt</h2>
      <h1>React talking to Backend</h1>
      <p>{message}</p>
      <p>Please upload a photo or PDF of your receipt to get started.</p>
      <input
        type="file"
        accept="image/*,application/pdf"
        ref={fileInputRef}
        style={{ display: "none" }}
        onChange={handleFileChange}
      />
      <button className="upload-btn" onClick={handleUploadClick}>
        Choose File
      </button>
      {file && (
        <div className="file-preview">
          <p>Selected: {file.name}</p>
          {previewUrl && file.type.startsWith("image/") && (
            <img
              src={previewUrl}
              alt="Receipt preview"
              className="receipt-preview-img"
            />
          )}
        </div>
      )}
      <button className="next-btn" onClick={handleNext} disabled={!file}>
        Next
      </button>
    </div>
  );
};

export default UploadReceipt;
