import { useState, useEffect } from "react";
import LZString from "lz-string";
import TabGroup from "./components/TabGroup/TabGroup";
import People from "./pages/People";
import Items from "./pages/Items";
import Assign from "./pages/Assign";
import Summary from "./pages/Summary";
import Card from "./components/Card/Card";
import logo from "./assets/logos/logo.png";
import logoBlurple from "./assets/logos/logo-blurple.png";
import "./App.css";

const tabs = ["People", "Items", "Assign", "Summary"];

function App() {
  // Load state from URL if present
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const compressed = params.get("data");
    if (compressed) {
      try {
        const raw = LZString.decompressFromEncodedURIComponent(compressed);
        if (raw) {
          const state = JSON.parse(raw);
          if (state.people) setPeople(state.people);
          if (state.items) setItems(state.items);
          if (state.assignments) setAssignments(state.assignments);
          if (state.taxRate !== undefined) setTaxRate(state.taxRate);
          if (state.tip !== undefined) setTip(state.tip);
          if (state.tipCalc) setTipCalc(state.tipCalc);
          // Optionally handle taxMode and taxAmount if you store them in state
          setActiveTab(3); // Go straight to Summary tab
        }
      } catch (e) {
        // Optionally show error to user
        console.error("Failed to load shared data from URL", e);
      }
    }
  }, []);
  const [activeTab, setActiveTab] = useState(0);
  const [people, setPeople] = useState([]);
  const [emojis, setEmojis] = useState([]);
  const [items, setItems] = useState([]);
  const [assignments, setAssignments] = useState(items.map(() => []));
  const [taxRate, setTaxRate] = useState("");
  const [tip, setTip] = useState("");
  const [tipCalc, setTipCalc] = useState("proportional");
  // Tip choices state (persisted)
  const [tipMode, setTipMode] = useState("percent");
  const [tipPreset, setTipPreset] = useState(15);
  const [customTipPercent, setCustomTipPercent] = useState("");

  // Keep assignments array in sync with items
  if (assignments.length !== items.length) {
    setAssignments(items.map((_, idx) => assignments[idx] || []));
  }

  // Convert taxRate and tip to numbers for calculations
  // Helper: get tax mode and value for Summary
  let taxMode = "percent";
  let taxAmount = null;
  let taxRateNum = 0;
  if (typeof taxRate === "object") {
    if (taxRate.mode === "amount") {
      taxMode = "amount";
      taxAmount = taxRate.amount;
      taxRateNum = parseFloat(taxRate.value) || 0;
    } else {
      taxMode = "percent";
      taxRateNum = parseFloat(taxRate.value) || 0;
    }
  } else {
    taxMode = "percent";
    taxRateNum = parseFloat(taxRate) || 0;
  }
  const tipNum = parseFloat(tip) || 0;

  // Detect dark mode and update on theme change
  const [isDarkMode, setIsDarkMode] = useState(
    window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches
  );

  // Listen for theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => setIsDarkMode(mediaQuery.matches);
    mediaQuery.addEventListener("change", handleChange);
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []);

  return (
    <main>
      <img
        src={isDarkMode ? logoBlurple : logo}
        alt="Tabby Split Logo"
        style={{ height: "100px", marginBottom: "0rem" }}
      />
      <h1>TabbySplit</h1>
      <p style={{ marginBottom: "2.5rem" }}>Split the bill, purrfectly.</p>
      <TabGroup tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <div
        style={{
          maxWidth: "700px",
          width: "90vw",
          minWidth: "300px",
          margin: "0 auto",
        }}
      >
        <Card>
          {activeTab === 0 && (
            <People
              people={people}
              setPeople={setPeople}
              emojis={emojis}
              setEmojis={setEmojis}
            />
          )}
          {activeTab === 1 && (
            <Items
              items={items}
              setItems={setItems}
              setActiveTab={setActiveTab}
            />
          )}
          {activeTab === 2 && (
            <Assign
              people={people}
              items={items}
              assignments={assignments}
              setAssignments={setAssignments}
              taxRate={taxRate}
              setTaxRate={setTaxRate}
              tip={tip}
              setTip={setTip}
              tipCalc={tipCalc}
              setTipCalc={setTipCalc}
              tipMode={tipMode}
              setTipMode={setTipMode}
              tipPreset={tipPreset}
              setTipPreset={setTipPreset}
              customTipPercent={customTipPercent}
              setCustomTipPercent={setCustomTipPercent}
              setActiveTab={setActiveTab} // <-- pass down
            />
          )}
          {activeTab === 3 && (
            <Summary
              people={people}
              items={items}
              assignments={assignments}
              taxRate={taxRateNum}
              tip={tipNum}
              tipCalc={tipCalc}
              setActiveTab={setActiveTab}
              taxMode={taxMode}
              taxAmount={taxAmount}
            />
          )}
        </Card>
      </div>
    </main>
  );
}

export default App;
