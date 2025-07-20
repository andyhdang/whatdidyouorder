import { useState } from "react";
import Card from "../components/Card/Card";
import Pill from "../components/Pill/Pill";
import InputField from "../components/InputField/InputField";

const TIP_PRESETS = [15, 18, 20];

function Assign({
  items = [],
  people = [],
  assignments = [],
  setAssignments,
  taxRate,
  setTaxRate,
  tip,
  setTip,
  tipCalc,
  setTipCalc,
  tipMode,
  setTipMode,
  tipPreset,
  setTipPreset,
  customTipPercent,
  setCustomTipPercent,
}) {
  // Keep assignments array in sync with items
  if (assignments.length !== items.length) {
    setAssignments(items.map((_, idx) => assignments[idx] || []));
  }

  // Set proportionally as default if not set
  if (!tipCalc || tipCalc === "") {
    setTipCalc("proportional");
  }

  const handleTogglePerson = (itemIdx, personIdx) => {
    setAssignments((sel) =>
      sel.map((arr, idx) =>
        idx === itemIdx
          ? arr.includes(personIdx)
            ? arr.filter((i) => i !== personIdx)
            : [...arr, personIdx]
          : arr
      )
    );
  };

  const handleTipChange = (mode, value) => {
    setTipMode(mode);
    if (mode === "percent") {
      setTipPreset(value);
      setCustomTipPercent("");
      // Calculate tip based on subtotal
      const subtotal = items.reduce(
        (sum, item) => sum + (parseFloat(item.price) || 0),
        0
      );
      setTip(((subtotal * value) / 100).toFixed(2));
    } else if (mode === "customPercent") {
      setTipPreset("");
      setCustomTipPercent(value);
      const subtotal = items.reduce(
        (sum, item) => sum + (parseFloat(item.price) || 0),
        0
      );
      setTip(((subtotal * value) / 100).toFixed(2));
    } else if (mode === "amount") {
      setTip(value);
    }
  };

  // Calculate tip based on subtotal, default to 15%
  const subtotal = items.reduce(
    (sum, item) => sum + (parseFloat(item.price) || 0),
    0
  );
  const defaultTipPercent = 15;
  const calculatedTip =
    tipMode === "percent"
      ? ((subtotal * (tipPreset || defaultTipPercent)) / 100).toFixed(2)
      : tipMode === "customPercent"
      ? ((subtotal * (customTipPercent || defaultTipPercent)) / 100).toFixed(2)
      : tip || ((subtotal * defaultTipPercent) / 100).toFixed(2);

  return (
    <main>
      <h2>Assign</h2>
      {items.length === 0 ? (
        <p>No items to assign.</p>
      ) : (
        items.map((item, itemIdx) => {
          const assigned = assignments[itemIdx] || [];
          const split =
            assigned.length > 0
              ? (parseFloat(item.price) / assigned.length).toFixed(2)
              : "0.00";
          return (
            <Card key={itemIdx} heading={null} className="custom-card-list">
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
                  <span
                    style={{
                      fontSize: "1.1rem",
                      fontWeight: 600,
                    }}
                  >
                    {item.name}
                  </span>
                  <span
                    style={{
                      fontSize: "0.95rem",
                      color: "#888",
                      marginBottom: "1em",
                    }}
                  >
                    Price: ${item.price}
                  </span>
                </div>
                {/* Pills and assignment info can remain below or be moved as needed */}
              </div>
              <div
                style={{
                  marginBottom: "1em",
                }}
              >
                {people.length === 0 ? (
                  <span style={{ color: "#888" }}>No people added.</span>
                ) : (
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "flex-start",
                      flexWrap: "wrap",
                      gap: "0.1em",
                    }}
                  >
                    <Pill
                      label={
                        assigned.length === people.length
                          ? "Unassign All"
                          : "All"
                      }
                      selected={assigned.length === people.length}
                      onClick={() => {
                        setAssignments((sel) =>
                          sel.map((arr, idx) =>
                            idx === itemIdx
                              ? assigned.length === people.length
                                ? []
                                : people.map((_, i) => i)
                              : arr
                          )
                        );
                      }}
                    />
                    {people.map((person, personIdx) => (
                      <Pill
                        key={personIdx}
                        label={person}
                        selected={assigned.includes(personIdx)}
                        onClick={() => handleTogglePerson(itemIdx, personIdx)}
                      />
                    ))}
                  </div>
                )}
              </div>
              <div>
                {assigned.length === 0 ? (
                  <span style={{ color: "#888" }}>No one assigned.</span>
                ) : (
                  <span>
                    {assigned.length === 1
                      ? `${people[assigned[0]]} pays $${parseFloat(
                          item.price
                        ).toFixed(2)}`
                      : `Split: $${split} each (${assigned
                          .map((i) => people[i])
                          .join(", ")})`}
                  </span>
                )}
              </div>
            </Card>
          );
        })
      )}
      {/* Add extra spacing below the last item card */}
      <div style={{ height: "2.5em" }}></div>
      <InputField
        label="Tax Rate (%)"
        placeholder="Enter tax rate"
        name="taxRate"
        type="number"
        value={taxRate}
        onChange={(e) => setTaxRate(e.target.value)}
        onEnter={() => {
          document.getElementById("tip")?.focus();
        }}
      />
      <div style={{ height: "2em" }}></div>
      <div style={{ marginBottom: "1em" }}>
        <label style={{ fontWeight: 500, marginRight: "1em" }}>Tip:</label>
        {TIP_PRESETS.map((preset) => (
          <Pill
            key={preset}
            label={`${preset}%`}
            selected={tipMode === "percent" && tipPreset === preset}
            onClick={() => handleTipChange("percent", preset)}
          />
        ))}
        <Pill
          label="Custom %"
          selected={tipMode === "customPercent"}
          onClick={() => setTipMode("customPercent")}
        />
        <Pill
          label="$ Amount"
          selected={tipMode === "amount"}
          onClick={() => setTipMode("amount")}
        />
        {/* Add extra space below the tip pills */}
        <div style={{ height: "1em" }}></div>
        {tipMode === "customPercent" && (
          <InputField
            label="Custom Tip (%)"
            placeholder="Enter tip %"
            name="customTipPercent"
            type="number"
            value={customTipPercent}
            onChange={(e) => handleTipChange("customPercent", e.target.value)}
            style={{ marginTop: "0.5em", maxWidth: 120 }}
          />
        )}
        {tipMode === "amount" && (
          <InputField
            label="Tip ($)"
            placeholder="Enter tip amount"
            name="tip"
            type="number"
            value={tip}
            onChange={(e) => handleTipChange("amount", e.target.value)}
            style={{ marginTop: "0.5em", maxWidth: 120 }}
          />
        )}
        {/* Show total tip amount under the pills */}
        <div style={{ marginTop: "0.5em", color: "#646cff", fontWeight: 600 }}>
          Total Tip: ${parseFloat(calculatedTip || 0).toFixed(2)}
        </div>
      </div>
      <div style={{ margin: "1em 0" }}>
        <label style={{ fontWeight: 500, marginRight: "1em" }}>
          Tip Calculation:
        </label>
        <Pill
          label="Proportionally"
          selected={tipCalc === "proportional"}
          onClick={() => setTipCalc("proportional")}
        />
        <Pill
          label="Evenly"
          selected={tipCalc === "even"}
          onClick={() => setTipCalc("even")}
        />
        <div style={{ marginTop: "0.5em" }}>
          {tipCalc === "proportional" && (
            <span
              style={{
                color: "#646cff",
                fontWeight: 500,
                fontSize: "0.95em",
              }}
            >
              Tip is split proportionally based on each person's subtotal.
            </span>
          )}
          {tipCalc === "even" && (
            <span
              style={{
                color: "#646cff",
                fontWeight: 500,
                fontSize: "0.95em",
              }}
            >
              Tip is split evenly: total tip divided by total number of people.
            </span>
          )}
        </div>
      </div>
    </main>
  );
}

export default Assign;
