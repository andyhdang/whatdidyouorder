import React, { useRef, useState } from "react";
import "./UploadReceipt.css";

const MAX_IMAGE_BYTES = 7 * 1024 * 1024;

const UploadReceipt = ({ onNext }) => {
  const cameraInputRef = useRef(null);
  const uploadInputRef = useRef(null);
  const [jsonInput, setJsonInput] = useState("");
  const [imagePreview, setImagePreview] = useState("");
  const [selectedImageName, setSelectedImageName] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedItems, setExtractedItems] = useState([]);

  const parseErrorMessage = async (response) => {
    try {
      const errorPayload = await response.json();
      if (typeof errorPayload?.error === "string" && errorPayload.error.trim()) {
        return errorPayload.error.trim();
      }
    } catch {
      return "Failed to extract receipt items.";
    }
    return "Failed to extract receipt items.";
  };

  const readFileAsDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result !== "string") {
          reject(new Error("Failed to read image file."));
          return;
        }
        resolve(reader.result);
      };
      reader.onerror = () => reject(new Error("Failed to read image file."));
      reader.readAsDataURL(file);
    });

  const normalizeApiItems = (items) => {
    if (!Array.isArray(items)) return [];

    return items.flatMap((item) => {
      if (!item || typeof item !== "object") return [];
      const name = typeof item.name === "string" ? item.name.trim() : "";
      const quantity = Math.max(
        1,
        Number.parseInt(String(item.quantity ?? 1), 10) || 1
      );
      const unitPrice = Number.parseFloat(String(item.unitPrice));
      if (!name || !Number.isFinite(unitPrice) || unitPrice < 0) return [];
      return Array.from({ length: quantity }, () => ({
        name,
        price: unitPrice.toFixed(2),
      }));
    });
  };

  const toNumber = (value) => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = Number.parseFloat(value.replace(/[^0-9.-]/g, ""));
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  };

  const normalizeItem = (item) => {
    if (!item || typeof item !== "object") return [];

    const quantity = Math.max(
      1,
      Number.parseInt(String(item.quantity ?? item.qty ?? item.count ?? 1), 10) ||
        1
    );
    const name =
      item.name ||
      item.item ||
      item.title ||
      item.description ||
      item.productName;
    const unitPrice = toNumber(
      item.unitPrice ??
        item.unit_price ??
        item.price ??
        item.amount ??
        item.cost
    );
    const totalPrice = toNumber(item.totalPrice ?? item.total_price ?? item.total);
    const resolvedPrice =
      unitPrice !== null
        ? unitPrice
        : totalPrice !== null
          ? totalPrice / quantity
          : null;

    if (!name || resolvedPrice === null) return [];
    return Array.from({ length: quantity }, () => ({
      name: String(name).trim(),
      price: resolvedPrice.toFixed(2),
    }));
  };

  const getItemsArray = (parsed) => {
    if (Array.isArray(parsed)) return parsed;
    if (!parsed || typeof parsed !== "object") return [];

    const candidateKeys = [
      "items",
      "orderedItems",
      "orderItems",
      "lineItems",
      "products",
      "menuItems",
    ];

    for (const key of candidateKeys) {
      if (Array.isArray(parsed[key])) return parsed[key];
    }

    for (const value of Object.values(parsed)) {
      if (Array.isArray(value)) return value;
      if (value && typeof value === "object") {
        const nested = getItemsArray(value);
        if (nested.length > 0) return nested;
      }
    }

    return [];
  };

  const extractItemsFromImage = async (imageBase64) => {
    const response = await fetch("/api/extract-items", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ imageBase64 }),
    });

    if (!response.ok) {
      throw new Error(await parseErrorMessage(response));
    }

    const payload = await response.json();
    const normalized = normalizeApiItems(payload?.items);
    if (!normalized.length) {
      throw new Error("No items were found in that image.");
    }
    return normalized;
  };

  const handleImageSelection = async (file) => {
    if (!file) return;
    setUploadError("");
    setJsonError("");
    setExtractedItems([]);

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file.");
      return;
    }

    if (file.size > MAX_IMAGE_BYTES) {
      setUploadError("Image is too large. Please use one smaller than 7MB.");
      return;
    }

    setSelectedImageName(file.name);
    setIsExtracting(true);

    try {
      const imageBase64 = await readFileAsDataUrl(file);
      setImagePreview(imageBase64);
      const normalizedItems = await extractItemsFromImage(imageBase64);
      setExtractedItems(normalizedItems);
    } catch (error) {
      const message =
        error instanceof Error && error.message
          ? error.message
          : "Failed to extract receipt items.";
      setUploadError(message);
      setExtractedItems([]);
    } finally {
      setIsExtracting(false);
    }
  };

  const handleCameraChange = async (event) => {
    const [file] = event.target.files || [];
    await handleImageSelection(file);
    event.target.value = "";
  };

  const handleUploadChange = async (event) => {
    const [file] = event.target.files || [];
    await handleImageSelection(file);
    event.target.value = "";
  };

  const handleExtractJson = () => {
    setUploadError("");
    if (!jsonInput.trim()) {
      setJsonError("Paste JSON first.");
      setExtractedItems([]);
      return;
    }

    try {
      const parsed = JSON.parse(jsonInput);
      const itemsArray = getItemsArray(parsed);
      const normalized = itemsArray.flatMap(normalizeItem);
      if (!normalized.length) {
        setJsonError(
          "Could not find ordered items with name and price fields in the JSON."
        );
        setExtractedItems([]);
        return;
      }

      setJsonError("");
      setExtractedItems(normalized);
    } catch {
      setJsonError("Invalid JSON. Please check the format and try again.");
      setExtractedItems([]);
    }
  };

  const handleNext = () => {
    if (extractedItems.length > 0 && onNext) {
      onNext({ extractedItems });
    }
  };

  return (
    <div className="upload-receipt-container">
      <h2>Upload Receipt</h2>
      <p>Take a receipt photo or upload one to extract ordered items.</p>

      <div className="image-actions">
        <button
          className="upload-btn"
          onClick={() => cameraInputRef.current?.click()}
          disabled={isExtracting}
        >
          Use Camera
        </button>
        <button
          className="upload-btn"
          onClick={() => uploadInputRef.current?.click()}
          disabled={isExtracting}
        >
          Upload Image
        </button>
      </div>

      <input
        ref={cameraInputRef}
        className="image-input"
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleCameraChange}
      />
      <input
        ref={uploadInputRef}
        className="image-input"
        type="file"
        accept="image/*"
        onChange={handleUploadChange}
      />

      {selectedImageName && (
        <p className="selected-image-name">Selected image: {selectedImageName}</p>
      )}
      {imagePreview && (
        <img
          className="receipt-preview"
          src={imagePreview}
          alt="Receipt preview"
        />
      )}

      {isExtracting && <p className="json-status">Extracting items...</p>}
      {uploadError && <p className="json-error">{uploadError}</p>}

      <p className="input-divider">or paste JSON</p>
      <div className="json-paste-section">
        <label htmlFor="receipt-json-input">Paste receipt JSON</label>
        <textarea
          id="receipt-json-input"
          value={jsonInput}
          onChange={(event) => setJsonInput(event.target.value)}
          placeholder='{"items":[{"name":"Pasta","price":14.99}]}'
          rows={6}
          disabled={isExtracting}
        />
        <button
          className="upload-btn"
          onClick={handleExtractJson}
          disabled={isExtracting}
        >
          Extract from JSON
        </button>
      </div>
      {jsonError && <p className="json-error">{jsonError}</p>}
      {extractedItems.length > 0 && (
        <p className="json-success">
          Extracted {extractedItems.length} item{extractedItems.length === 1 ? "" : "s"}.
        </p>
      )}
      <button
        className="next-btn"
        onClick={handleNext}
        disabled={extractedItems.length === 0 || isExtracting}
      >
        Next
      </button>
    </div>
  );
};

export default UploadReceipt;
