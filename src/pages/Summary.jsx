import Card from "../components/Card/Card";
import Button from "../components/Button/Button";
import copyIcon from "../assets/icons/copy.svg";

function Summary({
  people = [],
  items = [],
  assignments = [],
  taxRate = 0,
  tip = 0,
  tipCalc = "even",
}) {
  // Calculate subtotal
  const subtotal = items.reduce(
    (sum, item) => sum + (parseFloat(item.price) || 0),
    0
  );
  const taxAmount = subtotal * (taxRate / 100);
  const totalWithTax = subtotal + taxAmount;

  // Calculate tip per person
  let tipPerPerson = Array(people.length).fill(0);
  let totalTip = 0;
  // Determine tip value based on Assign page choices
  if (typeof tip === "string" && tip.endsWith("%")) {
    // Tip entered as percent string, e.g. "18%"
    const percent = parseFloat(tip);
    const subtotal = items.reduce(
      (sum, item) => sum + (parseFloat(item.price) || 0),
      0
    );
    totalTip = (subtotal * percent) / 100;
  } else {
    // Tip entered as dollar amount (number or string)
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
        const tax = base * (taxRate / 100);
        // For even tip, do not add tip to each item
        itemsOwed.push({
          name: item.name,
          base,
          tax,
          tip: tipCalc === "proportional" ? tipPerPerson[pIdx] || 0 : 0,
          total: base + tax,
          splitWith: assignments[iIdx].length,
        });
        total += base + tax;
      }
    });
    // Add tip once per person for even tip
    if (tipCalc === "even") {
      total += tipPerPerson[pIdx] || 0;
    } else if (tipCalc === "proportional") {
      total += tipPerPerson[pIdx] || 0;
    }
    return { person, itemsOwed, total, tip: tipPerPerson[pIdx] || 0 };
  });

  const grandTotal = personTotals.reduce((sum, p) => sum + p.total, 0);

  return (
    <main>
      <h2>Summary</h2>
      {personTotals.map(({ person, itemsOwed, total, tip }, idx) => {
        const personSubtotal = itemsOwed.reduce(
          (sum, item) => sum + item.base,
          0
        );
        const personTax = itemsOwed.reduce((sum, item) => sum + item.tax, 0);
        // For even tip, use tip from personTotals, not sum of item tips
        const personTip =
          tipCalc === "even" ? tipPerPerson[idx] : tipPerPerson[idx];
        const personTotalOwed = personSubtotal + personTax + personTip;
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
              Tax ({taxRate}%): ${personTax.toFixed(2)}
              <br />
              Tip: ${personTip.toFixed(2)}
              <br />
              <span
                style={{
                  color: "#646cff",
                  fontWeight: 700,
                  fontSize: "1.1em",
                  display: "inline-block",
                  marginTop: "0.5em",
                }}
              >
                Total Owed: ${personTotalOwed.toFixed(2)}
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
        Total Tax ({taxRate}%): ${taxAmount.toFixed(2)}
        <br />
        Total Tip: ${totalTip.toFixed(2)}
        <br />
        Grand Total: ${grandTotal.toFixed(2)}
      </div>
      {/* Increased space before Copy Summary button */}
      <div style={{ height: "2em" }}></div>
      <Button
        label="Copy Summary"
        icon={
          <img
            src={copyIcon}
            alt="Copy"
            style={{
              width: 18,
              height: 18,
              verticalAlign: "middle",
              marginRight: 8,
              filter: "brightness(0) invert(1)",
            }}
          />
        }
        onClick={() => {
          let text = `Bill Splitter Summary\n`;
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
            text += `  Tax (${taxRate}%): $${personTax.toFixed(2)}\n`;
            text += `  Tip: $${personTip.toFixed(2)}\n`;
            text += `  Total Owed: $${personTotalOwed.toFixed(2)}\n`;
          });
          text += `\n---\n`;
          text += `Subtotal: $${subtotal.toFixed(2)}\n`;
          text += `Total Tax (${taxRate}%): $${taxAmount.toFixed(2)}\n`;
          text += `Total Tip: $${tip.toFixed(2)}\n`;
          text += `Grand Total: $${grandTotal.toFixed(2)}\n`;
          navigator.clipboard.writeText(text);
          alert("Summary copied to clipboard!");
        }}
      />
    </main>
  );
}

export default Summary;
