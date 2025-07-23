import React, { useState } from "react";
import InputField from "../components/InputField/InputField";
import Button from "../components/Button/Button";
import Card from "../components/Card/Card";
import ShoppingCartAddIcon from "../assets/icons/ShoppingCartAddIcon";
import DeleteIcon from "../assets/icons/DeleteIcon";
import Stepper from "../components/Stepper/Stepper";

function Items({ items, setItems }) {
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);

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

  const handleDeleteItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  return (
    <main>
      <h2>Items</h2>
      <p className="description">What was ordered?</p>
      <InputField
        label="Item Name"
        placeholder="e.g. Cat Nip"
        name="itemName"
        id="itemName"
        value={itemName}
        onChange={(e) => setItemName(e.target.value)}
        onEnter={() => {
          document.getElementById("itemPrice")?.focus();
        }}
      />
      <InputField
        label="Price"
        placeholder="e.g. 12.99"
        name="itemPrice"
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
          margin: "0.5em 0 2em 0",
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
      {items.length > 0 && (
        <Button
          label="Clear All"
          onClick={() => {
            if (
              window.confirm(
                "Are you sure you want to clear all items? This cannot be undone."
              )
            ) {
              setItems([]);
            }
          }}
          className="custom-btn tertiary"
          style={{ marginTop: "0.5em", width: "100%" }}
        />
      )}
      <div style={{ height: "2em" }}></div>
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
                <span style={{ fontSize: "0.95rem", color: "#888" }}>
                  Price: ${item.price}
                </span>
              </div>
              <Button
                label="Delete"
                icon={
                  <DeleteIcon
                    width={20}
                    height={20}
                    style={{ color: "inherit" }}
                  />
                }
                onClick={() => handleDeleteItem(idx)}
                aria-label={`Delete ${item.name}`}
                className="custom-btn secondary"
              />
            </div>
          </Card>
        ))}
      </div>
      {/* Subtotal calculation and display */}
      <div
        style={{
          marginTop: "2em",
          fontWeight: 600,
          fontSize: "1.1em",
        }}
      >
        Subtotal: $
        {items
          .reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0)
          .toFixed(2)}
      </div>
    </main>
  );
}

export default Items;
