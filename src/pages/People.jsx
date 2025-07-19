import { useState } from "react";
import InputField from "../components/InputField/InputField";
import Button from "../components/Button/Button";
import Card from "../components/Card/Card";
import DeleteIcon from "../assets/icons/delete.svg";
import PersonAddIcon from "../assets/icons/person-add.svg";

function People({ people, setPeople }) {
  const [name, setName] = useState("");

  const handleAdd = () => {
    if (name.trim()) {
      setPeople([...people, name.trim()]);
      setName("");
    }
  };

  const handleRemove = (idx) => {
    setPeople(people.filter((_, i) => i !== idx));
  };

  return (
    <main>
      <h2>People</h2>
      <InputField
        label="Name"
        placeholder="Enter person's name"
        name="personName"
        value={name}
        onChange={(e) => setName(e.target.value)}
        onEnter={handleAdd}
      />
      <Button
        label="Add"
        icon={
          <img
            src={PersonAddIcon}
            alt="Add"
            style={{ width: 20, height: 20, filter: "brightness(0) invert(1)" }}
          />
        }
        onClick={handleAdd}
        fullWidth
      />
      <div>
        {people.map((person, idx) => (
          <Card
            key={idx}
            heading={person}
            button={
              <Button
                label="Delete"
                icon={
                  <img
                    src={DeleteIcon}
                    alt="Delete"
                    style={{
                      width: 20,
                      height: 20,
                      filter: "brightness(0) invert(1)",
                    }}
                  />
                }
                onClick={() => handleRemove(idx)}
                aria-label={`Remove ${person}`}
                fullWidth
              />
            }
          >
            {/* Optionally add more info here */}
          </Card>
        ))}
      </div>
    </main>
  );
}

export default People;
