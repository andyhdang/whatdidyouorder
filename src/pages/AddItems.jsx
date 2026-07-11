import React, { useRef, useState } from "react";
import InputField from "../components/InputField/InputField";
import Button from "../components/Button/Button";
import Card from "../components/Card/Card";
import Stepper from "../components/Stepper/Stepper";
import Modal from "../components/Modal/Modal";
import ShoppingCartAddIcon from "../assets/icons/ShoppingCartAddIcon";
import DeleteIcon from "../assets/icons/DeleteIcon";
import EditIcon from "../assets/icons/EditIcon";

const MAX_IMAGE_BYTES = 7 * 1024 * 1024;
const SUPPORTED_UPLOAD_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

function AddItems({ items, setItems, setActiveTab }) {
  // Active add mode: null | 'scan' | 'upload' | 'manual'
  const [addMode, setAddMode] = useState(null);

  // Receipt upload/scan state
  const cameraInputRef = useRef(null);
  const uploadInputRef = useRef(null);
  const [imagePreview, setImagePreview] = useState("");
  const [selectedImageName, setSelectedImageName] = useState("");
  const [uploadError, setUploadError] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);

  // Manual add state
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);

  // Edit modal state
  const [editIdx, setEditIdx] = useState(null);
  const [editName, setEditName] = useState("");
  const [editPrice, setEditPrice] = useState("");

  // --- Receipt helpers ---
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

  const convertImageToJpegDataUrl = (file) =>
    new Promise((resolve, reject) => {
      const objectUrl = URL.createObjectURL(file);
      const image = new Image();

      image.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = image.naturalWidth || image.width;
        canvas.height = image.naturalHeight || image.height;
        const context = canvas.getContext("2d");
        if (!context) {
          URL.revokeObjectURL(objectUrl);
          reject(new Error("Failed to process image file."));
          return;
        }
        context.fillStyle = "#ffffff";
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0);
        const jpegDataUrl = canvas.toDataURL("image/jpeg", 0.92);
        URL.revokeObjectURL(objectUrl);
        resolve(jpegDataUrl);
      };

      image.onerror = () => {
        URL.revokeObjectURL(objectUrl);
        reject(new Error("Failed to process image file."));
      };

      image.src = objectUrl;
    });

  const toUploadDataUrl = async (file) => {
    const fileType = String(file.type || "").toLowerCase();
    if (SUPPORTED_UPLOAD_TYPES.has(fileType)) {
      return readFileAsDataUrl(file);
    }
    return convertImageToJpegDataUrl(file);
  };

  const normalizeApiItems = (apiItems) => {
    if (!Array.isArray(apiItems)) return [];
    return apiItems.flatMap((item) => {
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

  const extractItemsFromImage = async (imageBase64) => {
    const response = await fetch("/api/extract-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
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
      const imageBase64 = await toUploadDataUrl(file);
      setImagePreview(imageBase64);
      const extracted = await extractItemsFromImage(imageBase64);
      setItems((prev) => [...prev, ...extracted]);
    } catch (error) {
      setUploadError(
        error instanceof Error && error.message
          ? error.message
          : "Failed to extract receipt items."
      );
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

  // --- Manual add ---
  const handleAddItem = () => {
    if (itemName.trim() && itemPrice.trim() && itemQuantity > 0) {
      const newItems = [];
      for (let i = 0; i < itemQuantity; i++) {
        newItems.push({ name: itemName.trim(), price: itemPrice.trim() });
      }
      setItems([...items, ...newItems]);
      setItemName("");
      setItemPrice("");
      setItemQuantity(1);
      setTimeout(() => {
        document.getElementById("itemName")?.focus();
      }, 0);
    }
  };

  // --- Edit/delete ---
  const openEditModal = (idx) => {
    setEditIdx(idx);
    setEditName(items[idx].name);
    setEditPrice(items[idx].price);
  };

  const handleSaveEdit = () => {
    if (editName.trim() && editPrice.trim()) {
      setItems(
        items.map((item, idx) =>
          idx === editIdx
            ? { ...item, name: editName.trim(), price: editPrice.trim() }
            : item
        )
      );
      setEditIdx(null);
      setEditName("");
      setEditPrice("");
    }
  };

  const handleCloseEdit = () => {
    setEditIdx(null);
    setEditName("");
    setEditPrice("");
  };

  const handleDeleteItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  // --- Mode switcher ---
  const handleModeSelect = (mode) => {
    setAddMode((prev) => (prev === mode ? null : mode));
    setUploadError("");
    setImagePreview("");
    setSelectedImageName("");
  };

  return (
    <main>
      <h2>Add Items</h2>
      <p className="description">How would you like to add items?</p>

      {/* Hidden file inputs */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        style={{ display: "none" }}
        onChange={handleCameraChange}
      />
      <input
        ref={uploadInputRef}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={handleUploadChange}
      />

      {/* Three option buttons */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: "0.75em",
          marginBottom: "1.5em",
        }}
      >
        <Button
          label="📷 Scan Receipt"
          onClick={() => {
            setAddMode(null);
            setUploadError("");
            setImagePreview("");
            setSelectedImageName("");
            cameraInputRef.current?.click();
          }}
          className={`custom-btn secondary`}
          disabled={isExtracting}
          fullWidth
        />
        <Button
          label="📁 Upload Receipt"
          onClick={() => handleModeSelect("upload")}
          className={`custom-btn ${addMode === "upload" ? "primary" : "secondary"}`}
          disabled={isExtracting}
          fullWidth
        />
        <Button
          label="✏️ Add Manually"
          onClick={() => handleModeSelect("manual")}
          className={`custom-btn ${addMode === "manual" ? "primary" : "secondary"}`}
          fullWidth
        />
      </div>

      {/* Upload Receipt panel */}
      {addMode === "upload" && (
        <div style={{ marginBottom: "1.5em" }}>
          <Button
            label="Choose Image"
            onClick={() => uploadInputRef.current?.click()}
            className="custom-btn secondary"
            disabled={isExtracting}
            fullWidth
          />
          {selectedImageName && (
            <p style={{ fontSize: "0.9rem", color: "var(--neutral-weak)", marginTop: "0.5em" }}>
              {selectedImageName}
            </p>
          )}
          {imagePreview && (
            <img
              src={imagePreview}
              alt="Receipt preview"
              style={{
                width: "100%",
                maxHeight: "260px",
                objectFit: "contain",
                border: "1px solid var(--neutral-weak)",
                borderRadius: "8px",
                margin: "0.75em 0",
                background: "var(--surface-subtle)",
              }}
            />
          )}
          {isExtracting && (
            <p style={{ color: "var(--brand)", textAlign: "center", marginTop: "0.5em" }}>
              Extracting items…
            </p>
          )}
          {uploadError && (
            <p style={{ color: "var(--error)", textAlign: "center", marginTop: "0.5em" }}>
              {uploadError}
            </p>
          )}
        </div>
      )}

      {/* Manual add panel */}
      {addMode === "manual" && (
        <div style={{ marginBottom: "1.5em" }}>
          <InputField
            label="Item Name"
            placeholder="e.g. Cat Nip"
            name="itemName"
            id="itemName"
            value={itemName}
            onChange={(e) => setItemName(e.target.value)}
            onEnter={() => document.getElementById("itemPrice")?.focus()}
          />
          <InputField
            label="Price"
            placeholder="e.g. 12.99"
            name="itemPrice"
            id="itemPrice"
            type="number"
            value={itemPrice}
            onChange={(e) => setItemPrice(e.target.value)}
            onEnter={() => {
              if (itemName.trim() && itemPrice.trim()) {
                handleAddItem();
              } else {
                document.getElementById("itemQuantity-stepper")?.focus();
              }
            }}
          />
          <div
            style={{
              margin: "0.5em 0 1.25em 0",
              display: "flex",
              alignItems: "center",
              justifyContent: "flex-start",
            }}
          >
            <label
              htmlFor="itemQuantity-stepper"
              style={{ fontWeight: 500, marginRight: "0.5em" }}
            >
              Quantity:
            </label>
            <Stepper
              id="itemQuantity-stepper"
              value={itemQuantity}
              min={1}
              onChange={setItemQuantity}
            />
          </div>
          <Button
            label="Add Item"
            icon={
              <ShoppingCartAddIcon
                width={20}
                height={20}
                style={{ color: "inherit" }}
              />
            }
            onClick={handleAddItem}
            fullWidth
          />
        </div>
      )}

      {/* Items list */}
      {items.length > 0 && (
        <>
          <div style={{ height: "0.5em" }} />
          <div>
            {items.map((item, idx) => (
              <Card
                key={idx}
                heading={null}
                button={null}
                className={
                  idx === items.length - 1
                    ? "custom-card-list no-border"
                    : "custom-card-list"
                }
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    width: "100%",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                    }}
                  >
                    <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>
                      {item.name}
                    </span>
                    <span
                      style={{ fontSize: "0.95rem", color: "var(--neutral-weak)" }}
                    >
                      ${item.price}
                    </span>
                  </div>
                  <div style={{ display: "flex", gap: "0.5em" }}>
                    <Button
                      icon={
                        <EditIcon
                          width={20}
                          height={20}
                          style={{ color: "inherit" }}
                        />
                      }
                      onClick={() => openEditModal(idx)}
                      aria-label={`Edit ${item.name}`}
                      className="icon-btn custom-btn secondary"
                      title="Edit Item"
                    />
                    <Button
                      icon={
                        <DeleteIcon
                          width={20}
                          height={20}
                          style={{ color: "inherit" }}
                        />
                      }
                      onClick={() => handleDeleteItem(idx)}
                      aria-label={`Delete ${item.name}`}
                      className="icon-btn custom-btn secondary"
                      title="Delete Item"
                    />
                  </div>
                </div>
              </Card>
            ))}
          </div>

          <div style={{ marginTop: "1.5em", fontWeight: 600, fontSize: "1.1em" }}>
            Subtotal: $
            {items
              .reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0)
              .toFixed(2)}
          </div>
          <div
            style={{ display: "flex", justifyContent: "center", marginTop: "1em" }}
          >
            <Button
              label="Next: Add People"
              className="custom-btn tertiary"
              onClick={() => {
                if (typeof setActiveTab === "function") setActiveTab(1);
                window.scrollTo({ top: 0, behavior: "smooth" });
              }}
            />
          </div>
        </>
      )}

      {/* Edit modal */}
      <Modal open={editIdx !== null} onClose={handleCloseEdit}>
        <div style={{ padding: "1em", minWidth: 260 }}>
          <h3>Edit Item</h3>
          <InputField
            label="Item Name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            autoFocus
          />
          <InputField
            label="Price"
            type="number"
            value={editPrice}
            onChange={(e) => setEditPrice(e.target.value)}
          />
          <div
            style={{
              display: "flex",
              gap: "1em",
              marginTop: "1.5em",
              justifyContent: "flex-end",
            }}
          >
            <Button
              label="Cancel"
              onClick={handleCloseEdit}
              className="custom-btn tertiary"
            />
            <Button
              label="Save"
              onClick={handleSaveEdit}
              className="custom-btn primary"
            />
          </div>
        </div>
      </Modal>
    </main>
  );
}

export default AddItems;
