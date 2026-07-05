import React, { useState } from "react";
import "./UploadReceipt.css";

const UploadReceipt = ({ onNext }) => {
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [extractedItems, setExtractedItems] = useState([]);

  const toNumber = (value) => {
    if (typeof value === "number" && Number.isFinite(value)) return value;
    if (typeof value === "string") {
      const parsed = parseFloat(value.replace(/[^0-9.-]/g, ""));
      return Number.isFinite(parsed) ? parsed : null;
    }
    return null;
  };

  const normalizeItem = (item) => {
    if (!item || typeof item !== "object") return [];

    const quantity = Math.max(
      1,
      parseInt(item.quantity ?? item.qty ?? item.count ?? 1, 10) || 1
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

  const handleExtractJson = () => {
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

      setExtractedItems(normalized);
      setJsonError("");
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
      <p>Paste your receipt JSON to extract ordered items.</p>
      <div className="json-paste-section">
        <label htmlFor="receipt-json-input">Paste receipt JSON</label>
        <textarea
          id="receipt-json-input"
          value={jsonInput}
          onChange={(e) => setJsonInput(e.target.value)}
          placeholder='{"items":[{"name":"Pasta","price":14.99}]}'
          rows={7}
        />
        <button className="upload-btn" onClick={handleExtractJson}>
          Extract Ordered Items
        </button>
      </div>
      {jsonError && <p className="json-error">{jsonError}</p>}
      {extractedItems.length > 0 && (
        <p className="json-success">
          Extracted {extractedItems.length} item
          {extractedItems.length === 1 ? "" : "s"} from JSON.
        </p>
      )}
      <button
        className="next-btn"
        onClick={handleNext}
        disabled={extractedItems.length === 0}
      >
        Next
      </button>
    </div>
  );
};

export default UploadReceipt;
