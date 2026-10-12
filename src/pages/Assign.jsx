import { useEffect } from "react";
import Card from "../components/Card/Card";
import Pill from "../components/Pill/Pill";
import EmptyArea from "../components/EmptyArea/EmptyArea";
import Button from "../components/Button/Button";

function Assign({
  items = [],
  people = [],
  assignments = [],
  setAssignments,
  setActiveTab,
}) {
  // Keep assignments array in sync with items

  useEffect(() => {
    if (assignments.length !== items.length) {
      setAssignments(items.map((_, idx) => assignments[idx] || []));
    }
  }, [items, assignments, setAssignments]);

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

  return (
    <main>
      <h2>Assign</h2>
      <p className="description">Who ordered what?</p>
      {items.length === 0 ? (
        <EmptyArea
          text="Add items to assign."
          buttonLabel="Go to Items"
          onButtonClick={() => setActiveTab && setActiveTab(1)}
        />
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
                      color: "var(--neutral-weak)",
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
      <div style={{ display: "flex", justifyContent: "center", marginTop: "2em" }}>
        <Button
          label="Final Step: See Summary"
          className="primary"
          onClick={() => {
            if (typeof setActiveTab === "function") setActiveTab(4);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      </div>
    </main>
  );
}

export default Assign;
