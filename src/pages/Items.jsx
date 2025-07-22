import React, { useState } from "react";
import InputField from "../components/InputField/InputField";
import Button from "../components/Button/Button";
import Card from "../components/Card/Card";
import ShoppingCartAddIcon from "../assets/icons/ShoppingCartAddIcon";
import DeleteIcon from "../assets/icons/DeleteIcon";

function Items({ items, setItems }) {
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");

  const handleAddItem = () => {
    if (itemName.trim() && itemPrice.trim()) {
      setItems([...items, { name: itemName.trim(), price: itemPrice.trim() }]);
      setItemName("");
      setItemPrice("");
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
        placeholder="e.g. Burger"
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
        onEnter={handleAddItem}
      />
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
