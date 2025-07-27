import React, { useState, useEffect } from "react";
import InputField from "../components/InputField/InputField";
import Button from "../components/Button/Button";
import Card from "../components/Card/Card";
import DeleteIcon from "../assets/icons/DeleteIcon";
import EditIcon from "../assets/icons/EditIcon";
import Modal from "../components/Modal/Modal";
import PersonAddIcon from "../assets/icons/PersonAddIcon";

const EMOJIS = [
  "🐱",
  "😺",
  "😸",
  "😹",
  "😻",
  "😼",
  "😽",
  "🙀",
  "😿",
  "😾",
  "🐈",
  "🐈‍⬛",
  "🧶",
  "🐾",
];

function People({ people, setPeople, emojis, setEmojis }) {
  const [name, setName] = useState("");
  const [editIdx, setEditIdx] = useState(null);
  const [editName, setEditName] = useState("");

  const handleAdd = () => {
    if (name.trim()) {
      const names = name
        .split(",")
        .map((n) => n.trim())
        .filter((n) => n);
      const newEmojis = names.map(
        () => EMOJIS[Math.floor(Math.random() * EMOJIS.length)]
      );
      setPeople([...people, ...names]);
      setEmojis([...emojis, ...newEmojis]);
      setName("");
    }
  };

  const handleRemove = (idx) => {
    setPeople(people.filter((_, i) => i !== idx));
    setEmojis(emojis.filter((_, i) => i !== idx));
  };

  const openEditModal = (idx) => {
    setEditIdx(idx);
    setEditName(people[idx]);
  };

  const handleSaveEdit = () => {
    if (editName.trim()) {
      const updatedPeople = people.map((person, idx) =>
        idx === editIdx ? editName.trim() : person
      );
      setPeople(updatedPeople);
      setEditIdx(null);
      setEditName("");
    }
  };

  const handleCloseEdit = () => {
    setEditIdx(null);
    setEditName("");
  };

  useEffect(() => {
    const handler = (e) => {
      if (e.detail?.tab === "Items") {
        // Find tab index for Items and trigger tab change if possible
        const tabGroup = document.querySelector(".tab-group");
        if (tabGroup) {
          const itemsTab = Array.from(tabGroup.querySelectorAll(".tab")).find(
            (tab) => tab.textContent.trim() === "Items"
          );
          if (itemsTab) itemsTab.click();
        }
      }
    };
    window.addEventListener("changeTab", handler);
    return () => window.removeEventListener("changeTab", handler);
  }, []);

  return (
    <main>
      <h2>People</h2>
      <div className="description">Who are you splitting the bill with?</div>
      <InputField
        label="Name"
        placeholder="e.g. Garfield, Tom, Marie"
        name="personName"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onEnter={handleAdd}
        description="You can add multiple people at once by separating names with commas."
      />
      <Button
        label="Add Person(s)"
        icon={
          <PersonAddIcon
            width={20}
            height={20}
            style={{ color: "inherit", verticalAlign: "middle" }}
          />
        }
        onClick={handleAdd}
        fullWidth
      />
      <div style={{ height: "2em" }}></div>
      <div>
        {people.map((person, idx) => (
          <Card
            key={idx}
            heading={null}
            className={
              idx === people.length - 1
                ? "custom-card-list no-border"
                : "custom-card-list"
            }
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                width: "100%",
              }}
            >
              <span style={{ fontSize: "1.25rem", fontWeight: 600 }}>
                {emojis[idx] ? emojis[idx] + " " : ""}
                {person}
              </span>
              <div style={{ display: "flex", gap: "0.5em" }}>
                <Button
                  icon={
                    <EditIcon
                      width={20}
                      height={20}
                      style={{ color: "inherit" }}
                      title="Edit"
                    />
                  }
                  onClick={() => openEditModal(idx)}
                  aria-label={`Edit ${person}`}
                  className="icon-btn custom-btn secondary"
                  title="Edit Name"
                />
                <Button
                  icon={
                    <DeleteIcon
                      width={20}
                      height={20}
                      style={{ color: "inherit" }}
                      title="Delete"
                    />
                  }
                  onClick={() => handleRemove(idx)}
                  aria-label={`Remove ${person}`}
                  className="icon-btn custom-btn secondary"
                  title="Delete Name"
                />
              </div>
              {/* Edit Person Modal */}
              <Modal open={editIdx !== null} onClose={handleCloseEdit}>
                <div style={{ padding: "1em", minWidth: 260 }}>
                  <h3>Edit Person</h3>
                  <InputField
                    label="Name"
                    value={editName}
                    onChange={(e) => setEditName(e.target.value)}
                    autoFocus
                  />
                  <div
                    style={{
                      display: "flex",
                      gap: "1em",
                      marginTop: "1.5em",
                      justifyContent: "flex-end",
                    }}
                  >
                    <Button
                      label="Cancel"
                      onClick={handleCloseEdit}
                      className="custom-btn tertiary"
                    />
                    <Button
                      label="Save"
                      onClick={handleSaveEdit}
                      className="custom-btn primary"
                    />
                  </div>
                </div>
              </Modal>
            </div>
          </Card>
        ))}
      </div>
      <div style={{ marginTop: "2em", fontWeight: 600, fontSize: "1.1em" }}>
        Total people: {people.length}
      </div>
      {people.length > 0 && (
        <Button
          label="Next: Add Items"
          className="custom-btn tertiary"
          onClick={() => {
            if (typeof setActiveTab === "function") {
              setActiveTab(3);
            } else {
              window.dispatchEvent(
                new CustomEvent("changeTab", { detail: { tab: "Items" } })
              );
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
    </main>
  );
}

export default People;
