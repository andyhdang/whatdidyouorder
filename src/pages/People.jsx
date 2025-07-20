import React, { useState } from "react";
import InputField from "../components/InputField/InputField";
import Button from "../components/Button/Button";
import Card from "../components/Card/Card";
import DeleteIcon from "../assets/icons/delete.svg";
import PersonAddIcon from "../assets/icons/person-add.svg";

const EMOJIS = [
  "😀",
  "😎",
  "🥳",
  "🦄",
  "🍕",
  "🌟",
  "🐱",
  "🐶",
  "🍀",
  "🎉",
  "🚀",
  "🍔",
  "🍣",
  "🧋",
  "🍦",
  "🦕",
  "🦖",
  "🦋",
  "🌈",
  "🍩",
];

function People({ people, setPeople, emojis, setEmojis }) {
  const [name, setName] = useState("");

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

  return (
    <main>
      <h2>People</h2>
      <InputField
        label="Name"
        placeholder="e.g. Alice, Bob, Charlie"
        name="personName"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onEnter={handleAdd}
        description="You can add multiple people at once by separating names with commas."
      />
      <Button
        label="Add"
        icon={
          <img
            src={PersonAddIcon}
            alt="Add"
            style={{
              width: 20,
              height: 20,
              filter: "brightness(0) invert(1)",
            }}
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
              <Button
                label="Delete"
                icon={
                  <img
                    src={DeleteIcon}
                    alt="Delete"
                    style={{
                      width: 20,
                      height: 20,
                      filter:
                        "invert(34%) sepia(98%) saturate(747%) hue-rotate(210deg) brightness(97%) contrast(101%)",
                    }}
                  />
                }
                onClick={() => handleRemove(idx)}
                aria-label={`Remove ${person}`}
                className="custom-btn secondary"
              />
            </div>
          </Card>
        ))}
      </div>
      <div style={{ marginTop: "2em", fontWeight: 600, fontSize: "1.1em" }}>
        Total people: {people.length}
      </div>
    </main>
  );
}

export default People;
