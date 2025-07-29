import Card from "../components/Card/Card";
import Button from "../components/Button/Button";
import CopyIcon from "../assets/icons/CopyIcon";
import LinkIcon from "../assets/icons/LinkIcon";
import QrcodeIcon from "../assets/icons/QrcodeIcon";
import Modal from "../components/Modal/Modal";
import Callout from "../components/Callout/Callout";
import EmptyArea from "../components/EmptyArea/EmptyArea";
import LZString from "lz-string";

import ShareUrlQRCode from "../components/ShareUrlQRCode";
import Snackbar from "../components/Snackbar/Snackbar";

import { useEffect, useState, useRef } from "react";

function Summary({
  people = [],
  items = [],
  assignments = [],
  taxRate = 0,
  tip = 0,
  tipCalc = "even",
  setActiveTab,
  taxMode = "percent", // new prop
  taxAmount = null, // new prop
  tipAmountInput = "",
  customTipPercentInput = "",
  tipMode = "percent", // add tipMode prop
}) {
  // Detect if user is coming from a shared URL
  const [fromSharedUrl, setFromSharedUrl] = useState(false);
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isShared = params.get("data");
    const alertKey = "tabby-shared-alert-shown";
    if (isShared && !sessionStorage.getItem(alertKey)) {
      setFromSharedUrl(true);
      sessionStorage.setItem(alertKey, "true");
      setTimeout(() => {
        alert("Tabby did the math, here’s the damage!");
      }, 100);
    }
  }, []);

  // Shareable URL logic
  const getShareUrl = () => {
    const state = {
      people,
      items,
      assignments,
      // Use effective values for tax
      taxRate: effectiveTaxRate,
      taxMode,
      taxAmount: effectiveTaxAmount,
      tip,
      tipCalc,
      tipMode,
      tipAmountInput,
      customTipPercentInput,
    };
    const compressed = LZString.compressToEncodedURIComponent(
      JSON.stringify(state)
    );
    return `${window.location.origin}${window.location.pathname}?data=${compressed}`;
  };
  // Calculate subtotal
  const subtotal = items.reduce(
    (sum, item) => sum + (parseFloat(item.price) || 0),
    0
  );
  // Use passed-in taxAmount if in $ mode, else calculate from taxRate
  let effectiveTaxAmount, effectiveTaxRate;
  if (taxMode === "amount") {
    effectiveTaxAmount = parseFloat(taxAmount) || 0;
    effectiveTaxRate = subtotal > 0 ? (effectiveTaxAmount / subtotal) * 100 : 0;
  } else {
    effectiveTaxRate = parseFloat(taxRate) || 0;
    effectiveTaxAmount = (subtotal * effectiveTaxRate) / 100;
  }

  // Calculate tip per person
  let tipPerPerson = Array(people.length).fill(0);
  let totalTip = 0;
  // Determine tip value based on Assign page choices
  if (tipMode === "customPercent" && customTipPercentInput !== "") {
    totalTip = (subtotal * parseFloat(customTipPercentInput)) / 100;
  } else if (tipMode === "amount" && tipAmountInput !== "") {
    totalTip = parseFloat(tipAmountInput) || 0;
  } else if (tipMode === "percent" && typeof tip === "number") {
    totalTip = tip;
  } else {
    totalTip = parseFloat(tip) || 0;
  }

  if (tipCalc === "even" && people.length > 0) {
    tipPerPerson = tipPerPerson.map(() => totalTip / people.length);
  } else if (tipCalc === "proportional" && people.length > 0) {
    // Proportional to subtotal assigned (not per item)
    const personSubtotals = people.map((_, pIdx) => {
      return items.reduce((sum, item, iIdx) => {
        if (assignments[iIdx] && assignments[iIdx].includes(pIdx)) {
          return sum + (parseFloat(item.price) || 0) / assignments[iIdx].length;
        }
        return sum;
      }, 0);
    });
    const totalAssigned = personSubtotals.reduce((a, b) => a + b, 0);
    tipPerPerson = personSubtotals.map((val) =>
      totalAssigned ? (val / totalAssigned) * totalTip : 0
    );
  }

  // Calculate what each person owes
  const personTotals = people.map((person, pIdx) => {
    let itemsOwed = [];
    let total = 0;
    let subtotal = 0;
    items.forEach((item, iIdx) => {
      if (assignments[iIdx] && assignments[iIdx].includes(pIdx)) {
        const base = (parseFloat(item.price) || 0) / assignments[iIdx].length;
        subtotal += base;
        // Use effectiveTaxRate for per-person tax calculation
        const tax = base * (effectiveTaxRate / 100);
        itemsOwed.push({
          name: item.name,
          base,
          tax,
          tip: 0, // tip is not per item, handled below
          total: base + tax,
          splitWith: assignments[iIdx].length,
        });
        total += base + tax;
      }
    });
    // Add tip once per person for even/proportional tip
    let personTip = 0;
    if (tipCalc === "even") {
      personTip = totalTip / people.length;
      total += personTip;
    } else if (tipCalc === "proportional") {
      personTip = tipPerPerson[pIdx] || 0;
      total += personTip;
    }
    return { person, itemsOwed, total, tip: personTip };
  });

  const grandTotal = personTotals.reduce((sum, p) => sum + p.total, 0);

  const [qrModalOpen, setQrModalOpen] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState("");

  return (
    <main>
      <h2>Summary</h2>
      {fromSharedUrl && (
        <Callout type="warning" style={{ marginBottom: "1em" }}>
          You opened a shared summary. Navigating away from this tab may change
          the results.
        </Callout>
      )}
      {/* Alert dialog shown instead of Callout for shared URL message */}
      {personTotals.every((p) => p.itemsOwed.length === 0) && (
        <EmptyArea
          text="Assign people to items to calculate total owed for each person."
          buttonLabel="Go to Assign"
          onButtonClick={() => setActiveTab && setActiveTab(2)}
        />
      )}
      {items.length > 0 &&
        assignments.some((a) => a && a.length > 0) &&
        assignments.some((a) => !a || a.length === 0) && (
          <Callout type="warning">
            Not all items have been assigned to a person
          </Callout>
        )}
      {personTotals.map(({ person, itemsOwed, total, tip }, idx) => {
        const personSubtotal = itemsOwed.reduce(
          (sum, item) => sum + item.base,
          0
        );
        const personTax = personSubtotal * (effectiveTaxRate / 100);
        // For even tip, use tip from personTotals, not sum of item tips
        const personTip = tip;
        const personTotalOwed = personSubtotal + personTax + tip;
        return (
          <Card key={idx} heading={person} className="custom-card-list">
            <ul style={{ paddingLeft: 0, listStyle: "none" }}>
              {itemsOwed.map((item, i) => (
                <li key={i} style={{ marginBottom: "0.5em" }}>
                  {item.name}: ${item.base.toFixed(2)}
                  {item.splitWith > 1
                    ? ` (split with ${item.splitWith} people)`
                    : ""}
                </li>
              ))}
            </ul>
            <div style={{ fontWeight: 600, marginTop: "1em" }}>
              Subtotal: ${personSubtotal.toFixed(2)}
              <br />
              Tax ({effectiveTaxRate.toFixed(2)}%): ${personTax.toFixed(2)}
              <br />
              Tip: $
              {tipCalc === "even"
                ? (totalTip / people.length).toFixed(2)
                : tip.toFixed(2)}
              <br />
              <span className="text-highlight">
                Total Owed: $
                {(
                  personSubtotal +
                  personTax +
                  (tipCalc === "even" ? totalTip / people.length : tip)
                ).toFixed(2)}
              </span>
            </div>
          </Card>
        );
      })}
      <div
        style={{
          fontWeight: 700,
          fontSize: "1.2em",
          marginTop: "2em",
          marginBottom: "2em",
        }}
      >
        Subtotal: ${subtotal.toFixed(2)}
        <br />
        Total Tax ({effectiveTaxRate.toFixed(2)}%): $
        {effectiveTaxAmount.toFixed(2)}
        <br />
        Total Tip: ${totalTip.toFixed(2)}
        <br />
        Grand Total: ${(subtotal + effectiveTaxAmount + totalTip).toFixed(2)}
      </div>
      {(() => {
        // Remove rounding for validation calculations
        const sumSubtotals = personTotals.reduce(
          (sum, p) => sum + p.itemsOwed.reduce((s, i) => s + i.base, 0),
          0
        );
        const sumTax = personTotals.reduce(
          (sum, p) =>
            sum +
            p.itemsOwed.reduce((s, i) => s + i.base, 0) *
              (effectiveTaxRate / 100),
          0
        );
        const sumTip = personTotals.reduce((sum, p) => sum + p.tip, 0);
        const sumTotalOwed = personTotals.reduce((sum, p) => sum + p.total, 0);
        const errors = [];
        const allAssigned =
          items.length > 0 && assignments.every((a) => a && a.length > 0);
        if (Math.abs(sumSubtotals - subtotal) >= 0.01) {
          errors.push(
            "Individual subtotals do not add up to the total subtotal."
          );
        }
        if (Math.abs(sumTax - effectiveTaxAmount) >= 0.01) {
          errors.push("Individual tax amounts do not add up to the total tax.");
        }
        if (Math.abs(sumTip - totalTip) >= 0.01) {
          errors.push("Individual tips do not add up to the total tip.");
        }
        if (Math.abs(sumTotalOwed - grandTotal) >= 0.01) {
          errors.push(
            "Individual totals owed do not add up to the grand total."
          );
        }
        if (
          errors.length > 0 ||
          people.length === 0 ||
          items.length === 0 ||
          !allAssigned
        ) {
          if (errors.length > 0) {
            return (
              <Callout type="error">
                {errors.map((err, i) => (
                  <div key={i}>{err}</div>
                ))}
              </Callout>
            );
          }
          return null;
        }
        return (
          <>
            <Callout type="success">
              All calculations match! Subtotals, tax, tip, and total owed add
              up. Choose one of the options below to share with your group.
            </Callout>
            {(taxMode === "percent" && effectiveTaxRate === 0) ||
            (taxMode === "amount" && effectiveTaxAmount === 0) ? (
              <Callout type="warning">
                Tax rate is at 0%. Add tax rate in Assign tab
              </Callout>
            ) : null}
          </>
        );
      })()}
      <div style={{ height: "2em" }}></div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1em",
          maxWidth: 320,
          margin: "0 auto",
          alignItems: "center",
        }}
      >
        <Button
          label="Copy Summary"
          icon={<CopyIcon size={18} style={{ verticalAlign: "middle" }} />}
          onClick={() => {
            let text = `TabbySplit.app Summary\n`;
            text += `People involved: ${people.length}\n`;
            personTotals.forEach(({ person, itemsOwed, total, tip }, idx) => {
              const personSubtotal = itemsOwed.reduce(
                (sum, item) => sum + item.base,
                0
              );
              const personTax = itemsOwed.reduce(
                (sum, item) => sum + item.tax,
                0
              );
              const personTip = tip;
              const personTotalOwed = personSubtotal + personTax + personTip;
              text += `\n${person}:\n`;
              itemsOwed.forEach((item) => {
                if (item.splitWith && item.splitWith > 1) {
                  text += `  - ${item.name}: $${item.base.toFixed(
                    2
                  )} (split with ${item.splitWith} people)\n`;
                } else {
                  text += `  - ${item.name}: $${item.base.toFixed(2)}\n`;
                }
              });
              text += `  Subtotal: $${personSubtotal.toFixed(2)}\n`;
              text += `  Tax (${effectiveTaxRate.toFixed(
                2
              )}%): $${effectiveTaxAmount.toFixed(2)}\n`;
              text += `  Tip: $${tip.toFixed(2)}\n`;
              text += `  Total Owed: $${personTotalOwed.toFixed(2)}\n`;
            });
            text += `\n---\n`;
            text += `Subtotal: $${subtotal.toFixed(2)}\n`;
            text += `Total Tax (${effectiveTaxRate.toFixed(
              2
            )}%): $${effectiveTaxAmount.toFixed(2)}\n`;
            text += `Total Tip: $${tip.toFixed(2)}\n`;
            text += `Grand Total: $${(
              subtotal +
              effectiveTaxAmount +
              totalTip
            ).toFixed(2)}\n`;
            navigator.clipboard.writeText(text);
            setSnackbarMsg("Summary copied to clipboard!");
            setSnackbarOpen(true);
          }}
        />
        <Button
          label="Share URL"
          icon={<LinkIcon size={18} style={{ verticalAlign: "middle" }} />}
          onClick={() => {
            const url = getShareUrl();
            navigator.clipboard.writeText(url);
            setSnackbarMsg("Shareable URL copied to clipboard!");
            setSnackbarOpen(true);
          }}
        />
        <Snackbar
          open={snackbarOpen}
          message={snackbarMsg}
          type="success"
          onClose={() => setSnackbarOpen(false)}
        />
        <Button
          label="Generate QR Code"
          icon={<QrcodeIcon size={18} style={{ verticalAlign: "middle" }} />}
          onClick={() => setQrModalOpen(true)}
        />
        <Button
          label="Split Another Bill"
          className="tertiary"
          onClick={() => {
            window.open(
              window.location.origin + window.location.pathname,
              "_blank"
            );
          }}
        />
        <Modal open={qrModalOpen} onClose={() => setQrModalOpen(false)}>
          <ShareUrlQRCode url={getShareUrl()} />
        </Modal>
      </div>
    </main>
  );
}

export default Summary;
