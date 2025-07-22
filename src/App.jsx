import { useState } from "react";
import TabGroup from "./components/TabGroup/TabGroup";
import People from "./pages/People";
import Items from "./pages/Items";
import Assign from "./pages/Assign";
import Summary from "./pages/Summary";
import Card from "./components/Card/Card";
import logoOrange from "./assets/logos/logo-orange.svg";
import "./App.css";

const tabs = ["People", "Items", "Assign", "Summary"];

function App() {
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
  const taxRateNum = parseFloat(taxRate) || 0;
  const tipNum = parseFloat(tip) || 0;

  // Detect dark mode
  const isDarkMode =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;

  return (
    <main>
      <img
        src={logoOrange}
        alt="Tabby Split Logo"
        style={{ height: "100px", marginBottom: "0rem" }}
      />
      <h1>TabbySplit</h1>
      <p style={{ marginBottom: "2.5rem" }}>Split the bill, purrfectly.</p>
      <TabGroup tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <div
        style={{
          maxWidth: "700px",
          minWidth: "250px",
          width: "90vw",
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
          {activeTab === 1 && <Items items={items} setItems={setItems} />}
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
              setActiveTab={setActiveTab} // <-- pass down
            />
          )}
        </Card>
      </div>
    </main>
  );
}

export default App;
