import { useEffect, useState } from "react";
import InputField from "../components/InputField/InputField";
import Button from "../components/Button/Button";
import Card from "../components/Card/Card";
import Pill from "../components/Pill/Pill";
import ShoppingCartAddIcon from "../assets/icons/ShoppingCartAddIcon";
import DeleteIcon from "../assets/icons/DeleteIcon";
import EditIcon from "../assets/icons/EditIcon";
import Stepper from "../components/Stepper/Stepper";
import Modal from "../components/Modal/Modal";

const TIP_PRESETS = [15, 18, 20];

function Items({
  items,
  setItems,
  taxRate,
  setTaxRate,
  fees,
  setFees,
  tip,
  setTip,
  tipCalc,
  setTipCalc,
  tipMode,
  setTipMode,
  tipPreset,
  setTipPreset,
  tipAmountInput,
  setTipAmountInput,
  customTipPercentInput,
  setCustomTipPercentInput,
  setActiveTab,
}) {
  const [activeModal, setActiveModal] = useState(null);
  const [editingItemIndex, setEditingItemIndex] = useState(null);
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemQuantity, setItemQuantity] = useState(1);
  const [feeName, setFeeName] = useState("");
  const [feeAmount, setFeeAmount] = useState("");

  const subtotal = items.reduce(
    (sum, item) => sum + (parseFloat(item.price) || 0),
    0
  );
  const taxAmount =
    taxRate?.mode === "amount"
      ? parseFloat(taxRate.amount) || 0
      : (subtotal *
          (parseFloat(
            typeof taxRate === "object" ? taxRate.value : taxRate
          ) || 0)) /
        100;
  const totalTip =
    tipMode === "customPercent"
      ? (subtotal * (parseFloat(customTipPercentInput) || 0)) / 100
      : tipMode === "amount"
      ? parseFloat(tipAmountInput) || 0
      : parseFloat(tip) || 0;
  const totalFees = fees.reduce(
    (sum, fee) => sum + (parseFloat(fee.amount) || 0),
    0
  );
  const total = subtotal + taxAmount + totalTip + totalFees;
  const hasTax =
    typeof taxRate === "object"
      ? taxRate.mode === "amount"
        ? taxRate.amount !== ""
        : taxRate.value !== ""
      : taxRate !== "";
  const hasTip =
    tipMode === "amount"
      ? tipAmountInput !== ""
      : tipMode === "customPercent"
      ? customTipPercentInput !== ""
      : tip !== "";

  useEffect(() => {
    if (items.length > 0 && tipMode === "percent") {
      setTip(((subtotal * tipPreset) / 100).toFixed(2));
    }
  }, [items.length, setTip, subtotal, tipMode, tipPreset]);

  const closeModal = () => {
    setActiveModal(null);
    setEditingItemIndex(null);
    setItemName("");
    setItemPrice("");
    setItemQuantity(1);
    setFeeName("");
    setFeeAmount("");
  };

  const openItemModal = (index = null) => {
    setEditingItemIndex(index);
    if (index !== null) {
      setItemName(items[index].name);
      setItemPrice(items[index].price);
    }
    setActiveModal("item");
  };

  const saveItem = () => {
    const normalizedPrice = itemPrice.replace(/[$,\s]/g, "");
    if (
      !itemName.trim() ||
      !normalizedPrice ||
      Number.isNaN(Number(normalizedPrice))
    ) {
      return;
    }

    if (editingItemIndex !== null) {
      setItems(
        items.map((item, index) =>
          index === editingItemIndex
            ? { ...item, name: itemName.trim(), price: normalizedPrice }
            : item
        )
      );
    } else {
      setItems([
        ...items,
        ...Array.from({ length: itemQuantity }, () => ({
          name: itemName.trim(),
          price: normalizedPrice,
        })),
      ]);
    }
    closeModal();
  };

  const handleTipChange = (mode, value) => {
    setTipMode(mode);
    if (mode === "percent") {
      setTipPreset(value);
      setTip(((subtotal * value) / 100).toFixed(2));
    } else if (mode === "customPercent") {
      const percent = value === undefined ? customTipPercentInput : value;
      setTipPreset("");
      if (value !== undefined) setCustomTipPercentInput(value);
      setTip(((subtotal * (parseFloat(percent) || 0)) / 100).toFixed(2));
    } else {
      const amount = value === undefined ? tipAmountInput : value;
      if (value !== undefined) setTipAmountInput(value);
      setTip(amount);
    }
  };

  const addFee = () => {
    if (!feeName.trim() || !feeAmount.trim()) return;
    setFees([...fees, { name: feeName.trim(), amount: feeAmount.trim() }]);
    closeModal();
  };

  const adjustmentRow = (label, amount, onEdit, onDelete) => (
    <Card key={label} heading={null} button={null} className="custom-card-list">
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
          <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>{label}</span>
          <span style={{ fontSize: "0.95rem", color: "var(--neutral-weak)" }}>
            ${amount.toFixed(2)}
          </span>
        </div>
        <div style={{ display: "flex", gap: "0.5em" }}>
          <Button
            icon={<EditIcon width={20} height={20} style={{ color: "inherit" }} />}
            onClick={onEdit}
            aria-label={`Edit ${label}`}
            className="icon-btn custom-btn secondary"
            title={`Edit ${label}`}
          />
          <Button
            icon={<DeleteIcon width={20} height={20} style={{ color: "inherit" }} />}
            onClick={onDelete}
            aria-label={`Delete ${label}`}
            className="icon-btn custom-btn secondary"
            title={`Delete ${label}`}
          />
        </div>
      </div>
    </Card>
  );

  return (
    <main>
      <h2>Items</h2>
      <p className="description">What was ordered?</p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5em", justifyContent: "center" }}>
        <Button label="Add Item(s)" className="primary" onClick={() => openItemModal()} />
        <Button label="Tax & Tip" className="secondary" onClick={() => setActiveModal("tax-tip")} />
        <Button label="Fees" className="secondary" onClick={() => setActiveModal("fees")} />
      </div>

      <div style={{ marginTop: "1.5em" }}>
        {items.map((item, index) => (
          <Card key={`${item.name}-${index}`} heading={null} button={null} className="custom-card-list">
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
              <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <span style={{ fontSize: "1.1rem", fontWeight: 600 }}>{item.name}</span>
                <span style={{ fontSize: "0.95rem", color: "var(--neutral-weak)" }}>
                  ${parseFloat(item.price).toFixed(2)}
                </span>
              </div>
              <div style={{ display: "flex", gap: "0.5em" }}>
                <Button icon={<EditIcon width={20} height={20} style={{ color: "inherit" }} />} onClick={() => openItemModal(index)} aria-label={`Edit ${item.name}`} className="icon-btn custom-btn secondary" title="Edit item" />
                <Button icon={<DeleteIcon width={20} height={20} style={{ color: "inherit" }} />} onClick={() => setItems(items.filter((_, itemIndex) => itemIndex !== index))} aria-label={`Delete ${item.name}`} className="icon-btn custom-btn secondary" title="Delete item" />
              </div>
            </div>
          </Card>
        ))}
        {hasTax &&
          adjustmentRow(
            "Tax",
            taxAmount,
            () => setActiveModal("tax-tip"),
            () =>
              setTaxRate({
                value: "",
                amount: "",
                mode: typeof taxRate === "object" ? taxRate.mode : "percent",
              })
          )}
        {hasTip &&
          adjustmentRow(
            "Tip",
            totalTip,
            () => setActiveModal("tax-tip"),
            () => {
              setTipMode("amount");
              setTipAmountInput("");
              setTip("");
            }
          )}
        {fees.map((fee, index) =>
          adjustmentRow(
            fee.name,
            parseFloat(fee.amount) || 0,
            () => setActiveModal("fees"),
            () => setFees(fees.filter((_, feeIndex) => feeIndex !== index))
          )
        )}
      </div>

      <div style={{ marginTop: "2em", fontWeight: 600, fontSize: "1.1em" }}>
        Grand Total: ${total.toFixed(2)}
        {items.length > 0 && (
          <div style={{ display: "flex", justifyContent: "center", marginTop: "1em" }}>
            <Button label="Next: Add People" className="primary" onClick={() => { setActiveTab(2); window.scrollTo({ top: 0, behavior: "smooth" }); }} />
          </div>
        )}
      </div>

      <Modal open={activeModal === "item"} onClose={closeModal}>
        <div style={{ padding: "1em", minWidth: 260 }}>
          <h3>{editingItemIndex === null ? "Add item(s)" : "Edit item"}</h3>
          <InputField label="Item name" placeholder="e.g. Cat Nip" name="itemName" value={itemName} onChange={(event) => setItemName(event.target.value)} />
          <InputField label="Price" placeholder="e.g. 12.99" name="itemPrice" inputMode="decimal" value={itemPrice} onChange={(event) => setItemPrice(event.target.value)} onEnter={saveItem} />
          {editingItemIndex === null && (
            <div style={{ display: "flex", alignItems: "center", marginTop: "1em" }}>
              <label htmlFor="itemQuantity-stepper" style={{ fontWeight: 500, marginRight: "0.5em" }}>Quantity:</label>
              <Stepper id="itemQuantity-stepper" value={itemQuantity} min={1} onChange={setItemQuantity} />
            </div>
          )}
          <div style={{ display: "flex", gap: "1em", marginTop: "1.5em", justifyContent: "flex-end" }}>
            <Button label="Cancel" onClick={closeModal} className="secondary" />
            <Button label={editingItemIndex === null ? "Add Item(s)" : "Save"} onClick={saveItem} />
          </div>
        </div>
      </Modal>

      <Modal open={activeModal === "tax-tip"} onClose={closeModal}>
        <div style={{ padding: "1em", minWidth: 260 }}>
          <h3>Tax & Tip</h3>
          <label style={{ display: "block", fontWeight: 500, textAlign: "left" }}>Tax:</label>
          <div style={{ display: "flex", gap: "0.25em", margin: "0.5em 0" }}>
            <Pill label="$ Amount" selected={taxRate?.mode === "amount"} onClick={() => setTaxRate(typeof taxRate === "object" ? { ...taxRate, mode: "amount" } : { value: taxRate, mode: "amount" })} />
            <Pill label="%" selected={!taxRate?.mode || taxRate.mode === "percent"} onClick={() => setTaxRate(typeof taxRate === "object" ? { ...taxRate, mode: "percent" } : { value: taxRate, mode: "percent" })} />
          </div>
          <InputField label={undefined} placeholder={taxRate?.mode === "amount" ? "Enter tax amount" : "Enter tax rate"} name="taxRate" type="number" value={typeof taxRate === "object" ? (taxRate.mode === "amount" ? taxRate.amount || "" : taxRate.value || "") : taxRate} onChange={(event) => setTaxRate(typeof taxRate === "object" ? { ...taxRate, [taxRate.mode === "amount" ? "amount" : "value"]: event.target.value } : event.target.value)} />
          <label style={{ fontWeight: 500, display: "block", marginTop: "1.5em", textAlign: "left" }}>Tip:</label>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "0.25em", margin: "0.5em 0" }}>
            {TIP_PRESETS.map((preset) => <Pill key={preset} label={`${preset}%`} selected={tipMode === "percent" && tipPreset === preset} onClick={() => handleTipChange("percent", preset)} />)}
            <Pill label="Custom %" selected={tipMode === "customPercent"} onClick={() => handleTipChange("customPercent")} />
            <Pill label="$ Amount" selected={tipMode === "amount"} onClick={() => handleTipChange("amount")} />
          </div>
          {tipMode === "customPercent" && <InputField label={undefined} placeholder="Enter tip %" name="customTipPercent" type="number" value={customTipPercentInput} onChange={(event) => handleTipChange("customPercent", event.target.value)} />}
          {tipMode === "amount" && <InputField label={undefined} placeholder="Enter tip amount" name="tipAmount" type="number" value={tipAmountInput} onChange={(event) => handleTipChange("amount", event.target.value)} />}
          <label style={{ fontWeight: 500, display: "block", marginTop: "1.5em", textAlign: "left" }}>Tip calculation:</label>
          <div style={{ display: "flex", gap: "0.25em", marginTop: "0.5em" }}>
            <Pill label="Evenly" selected={tipCalc === "even"} onClick={() => setTipCalc("even")} />
            <Pill label="Proportionally" selected={tipCalc === "proportional"} onClick={() => setTipCalc("proportional")} />
          </div>
          <div style={{ display: "flex", gap: "1em", justifyContent: "flex-end", marginTop: "2em" }}>
            <Button label="Cancel" onClick={closeModal} className="secondary" />
            <Button label="Add Tax & Tip" onClick={closeModal} />
          </div>
        </div>
      </Modal>

      <Modal open={activeModal === "fees"} onClose={closeModal}>
        <div style={{ padding: "1em", minWidth: 260 }}>
          <h3>Fees</h3>
          <p className="description">Add service, delivery, or other fixed fees.</p>
          <InputField label="Fee name" placeholder="e.g. Biscuit making service fee" name="feeName" value={feeName} onChange={(event) => setFeeName(event.target.value)} />
          <InputField label="Fee amount" placeholder="e.g. 4.99" name="feeAmount" type="number" value={feeAmount} onChange={(event) => setFeeAmount(event.target.value)} onEnter={addFee} />
          <div style={{ display: "flex", gap: "1em", justifyContent: "flex-end", marginTop: "1.5em" }}>
            <Button label="Cancel" onClick={closeModal} className="secondary" />
            <Button label="Add Fee" onClick={addFee} />
          </div>
        </div>
      </Modal>
    </main>
  );
}

export default Items;
