import Card from "../components/Card/Card";

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
    // Proportional to item cost assigned
    const itemTotals = people.map((_, pIdx) => {
      return items.reduce((sum, item, iIdx) => {
        if (assignments[iIdx] && assignments[iIdx].includes(pIdx)) {
          return sum + (parseFloat(item.price) || 0) / assignments[iIdx].length;
        }
        return sum;
      }, 0);
    });
    const totalAssigned = itemTotals.reduce((a, b) => a + b, 0);
    tipPerPerson = itemTotals.map((val) =>
      totalAssigned ? (val / totalAssigned) * tip : 0
    );
  }

  // Calculate what each person owes
  const personTotals = people.map((person, pIdx) => {
    let itemsOwed = [];
    let total = 0;
    items.forEach((item, iIdx) => {
      if (assignments[iIdx] && assignments[iIdx].includes(pIdx)) {
        const base = (parseFloat(item.price) || 0) / assignments[iIdx].length;
        const tax = base * (taxRate / 100);
        const tipShare = tipPerPerson[pIdx] || 0;
        const itemTotal = base + tax + tipShare;
        itemsOwed.push({
          name: item.name,
          base,
          tax,
          tip: tipShare,
          total: itemTotal,
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
      {personTotals.map(({ person, itemsOwed, total }, idx) => (
        <Card key={idx} heading={person}>
          <ul style={{ paddingLeft: 0, listStyle: "none" }}>
            {itemsOwed.map((item, i) => (
              <li key={i} style={{ marginBottom: "0.5em" }}>
                <strong>{item.name}</strong>: ${item.base.toFixed(2)} + Tax $
                {item.tax.toFixed(2)} + Tip ${item.tip.toFixed(2)} ={" "}
                <strong>${item.total.toFixed(2)}</strong>
              </li>
            ))}
          </ul>
          <div style={{ fontWeight: 600, marginTop: "1em" }}>
            Total Owed: ${total.toFixed(2)}
          </div>
        </Card>
      ))}
      <div style={{ fontWeight: 700, fontSize: "1.2em", marginTop: "2em" }}>
        Subtotal: ${subtotal.toFixed(2)}
        <br />
        Total Tax: ${taxAmount.toFixed(2)}
        <br />
        Total Tip: ${tip.toFixed(2)}
        <br />
        Grand Total: ${grandTotal.toFixed(2)}
      </div>
      <button
        style={{
          marginTop: "2em",
          padding: "0.7em 1.5em",
          fontSize: "1em",
          fontWeight: 500,
          borderRadius: "6px",
          border: "none",
          background: "#646cff",
          color: "#fff",
          cursor: "pointer",
        }}
        onClick={() => {
          const summaryData = {
            people,
            items,
            assignments,
            taxRate,
            tip,
            tipCalc,
          };
          const url = `${window.location.origin}${
            window.location.pathname
          }?summary=${encodeURIComponent(JSON.stringify(summaryData))}`;
          navigator.clipboard.writeText(url);
          alert("Summary URL copied to clipboard!");
        }}
      >
        Copy Summary URL
      </button>
    </main>
  );
}

export default Summary;
