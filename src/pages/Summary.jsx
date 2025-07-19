import Card from "../components/Card/Card";
import Button from "../components/Button/Button";

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
  if (tipCalc === "even" && people.length > 0) {
    tipPerPerson = tipPerPerson.map(() => tip / people.length);
  } else if (tipCalc === "proportional" && people.length > 0) {
    // Proportional to subtotal assigned (not per item)
    const personSubtotals = people.map((_, pIdx) => {
      return items.reduce((sum, item, iIdx) => {
        if (assignments[iIdx] && assignments[iIdx].includes(pIdx)) {
          return sum + (parseFloat(item.price) || 0) / assignments[iIdx].length;
        }
        return sum;
      }, 0);
      const totalAssigned = personSubtotals.reduce((a, b) => a + b, 0);
      tipPerPerson = personSubtotals.map((val) =>
        totalAssigned ? (val / totalAssigned) * tip : 0
      );
    });
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
      }
    });
    // Calculate tip share for proportional
    let tipShare =
      tipCalc === "proportional" && subtotal > 0 && subtotal <= subtotal
        ? (subtotal / subtotal) * tip
        : tipPerPerson[pIdx] || 0;
    items.forEach((item, iIdx) => {
      if (assignments[iIdx] && assignments[iIdx].includes(pIdx)) {
        const base = (parseFloat(item.price) || 0) / assignments[iIdx].length;
        const tax = base * (taxRate / 100);
        const itemTotal = base + tax + tipShare;
        itemsOwed.push({
          name: item.name,
          base,
          tax,
          tip: tipShare,
          total: itemTotal,
          splitWith: assignments[iIdx].length,
        });
        total += itemTotal;
      }
    });
    return { person, itemsOwed, total };
  });

  const grandTotal = personTotals.reduce((sum, p) => sum + p.total, 0);

  return (
    <main>
      <h2>Summary</h2>
      {personTotals.map(({ person, itemsOwed, total }, idx) => {
        const personTax = itemsOwed.reduce((sum, item) => sum + item.tax, 0);
        const personTip = itemsOwed.reduce((sum, item) => sum + item.tip, 0);
        return (
          <Card key={idx} heading={person}>
            <ul style={{ paddingLeft: 0, listStyle: "none" }}>
              {itemsOwed.map((item, i) => (
                <li key={i} style={{ marginBottom: "0.5em" }}>
                  {item.name}: ${item.base.toFixed(2)} (split with{" "}
                  {item.splitWith || 1} people)
                </li>
              ))}
            </ul>
            <div style={{ fontWeight: 600, marginTop: "1em" }}>
              Subtotal: $
              {itemsOwed.reduce((sum, item) => sum + item.base, 0).toFixed(2)}
              <br />
              Total Tax ({taxRate}%): ${personTax.toFixed(2)}
              <br />
              Total Tip: ${personTip.toFixed(2)}
              <br />
              Total Owed: ${total.toFixed(2)}
            </div>
          </Card>
        );
      })}
      <div style={{ fontWeight: 700, fontSize: "1.2em", marginTop: "2em" }}>
        Subtotal: ${subtotal.toFixed(2)}
        <br />
        Total Tax ({taxRate}%): ${taxAmount.toFixed(2)}
        <br />
        Total Tip: ${tip.toFixed(2)}
        <br />
        Grand Total: ${grandTotal.toFixed(2)}
      </div>
      <Button
        label="Copy Summary"
        onClick={() => {
          let text = `Bill Splitter Summary\n`;
          text += `People involved: ${people.length}\n`;
          personTotals.forEach(({ person, itemsOwed, total }, idx) => {
            const personTax = itemsOwed.reduce(
              (sum, item) => sum + item.tax,
              0
            );
            const personTip = itemsOwed.reduce(
              (sum, item) => sum + item.tip,
              0
            );
            const personSubtotal = itemsOwed.reduce(
              (sum, item) => sum + item.base,
              0
            );
            text += `\n${person}:\n`;
            itemsOwed.forEach((item) => {
              text += `  - ${item.name}: $${item.base.toFixed(2)} (split with ${
                item.splitWith || 1
              } people)\n`;
            });
            text += `  Subtotal: $${personSubtotal.toFixed(2)}\n`;
            text += `  Total Tax (${taxRate}%): $${personTax.toFixed(2)}\n`;
            text += `  Total Tip: $${personTip.toFixed(2)}\n`;
            text += `  Total Owed: $${total.toFixed(2)}\n`;
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
