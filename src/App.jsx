import "./App.css";
import { useState } from "react";
import TabGroup from "./components/TabGroup/TabGroup";
import People from "./pages/People";
import Items from "./pages/Items";
import Assign from "./pages/Assign";
import Summary from "./pages/Summary";

const tabs = ["People", "Items", "Assign", "Summary"];

function App() {
  const [activeTab, setActiveTab] = useState(0);
  const [people, setPeople] = useState([]);
  const [items, setItems] = useState([]);
  const [assignments, setAssignments] = useState(items.map(() => []));
  const [taxRate, setTaxRate] = useState("");
  const [tip, setTip] = useState("");
  const [tipCalc, setTipCalc] = useState("even");

  // Keep assignments array in sync with items
  if (assignments.length !== items.length) {
    setAssignments(items.map((_, idx) => assignments[idx] || []));
  }

  // Convert taxRate and tip to numbers for calculations
  const taxRateNum = parseFloat(taxRate) || 0;
  const tipNum = parseFloat(tip) || 0;

  return (
    <main>
      <h1>Bill Splitter</h1>
      <TabGroup tabs={tabs} activeTab={activeTab} onTabChange={setActiveTab} />
      <div className="card">
        {activeTab === 0 && <People people={people} setPeople={setPeople} />}
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
          />
        )}
      </div>
    </main>
  );
}

export default App;
