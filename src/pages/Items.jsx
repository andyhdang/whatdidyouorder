import { useState } from "react";
import InputField from "../components/InputField/InputField";
import Button from "../components/Button/Button";
import Card from "../components/Card/Card";
import ShoppingCartAddIcon from "../assets/icons/shopping-cart-add.svg";
import DeleteIcon from "../assets/icons/delete.svg";

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
      <InputField
        label="Item Name"
        placeholder="Enter item name"
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
        placeholder="Enter price"
        name="itemPrice"
        type="number"
        value={itemPrice}
        onChange={(e) => setItemPrice(e.target.value)}
        onEnter={handleAddItem}
      />
      <Button
        label="Add Item"
        icon={
          <img
            src={ShoppingCartAddIcon}
            alt="Add Item"
            style={{
              width: 20,
              height: 20,
              filter: "brightness(0) invert(1)",
            }}
          />
        }
        onClick={handleAddItem}
        fullWidth
      />
      <div>
        {items.map((item, idx) => (
          <Card
            key={idx}
            heading={item.name}
            button={
              <Button
                label="Delete"
                icon={
                  <img
                    src={DeleteIcon}
                    alt="Delete"
                    style={{
                      width: 20,
                      height: 20,
                      filter: "brightness(0) invert(1)",
                    }}
                  />
                }
                onClick={() => handleDeleteItem(idx)}
                aria-label={`Delete ${item.name}`}
              />
            }
          >
            <div>Price: ${item.price}</div>
          </Card>
        ))}
      </div>
      {/* Subtotal calculation and display */}
      <div style={{ marginTop: "2em", fontWeight: 600, fontSize: "1.1em" }}>
        Subtotal: $
        {items
          .reduce((sum, item) => sum + (parseFloat(item.price) || 0), 0)
          .toFixed(2)}
      </div>
    </main>
  );
}

export default Items;
