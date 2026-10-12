import { useEffect, useState } from "react";
import Button from "./Button/Button";
import InputField from "./InputField/InputField";
import Modal from "./Modal/Modal";

function SharedSplitModal({
  open,
  mode,
  joinCode = "",
  onClose,
  onCreate,
  onJoin,
  busy,
  error,
}) {
  const [name, setName] = useState("");
  const [code, setCode] = useState(joinCode);

  useEffect(() => {
    if (open) {
      setCode(joinCode);
      setName("");
    }
  }, [joinCode, open]);

  const isJoin = mode === "join";
  const valid = isJoin ? code.trim().length > 0 && name.trim().length > 0 : true;

  return (
    <Modal open={open} onClose={busy ? undefined : onClose}>
      <div style={{ padding: "1.5em", minWidth: 280, maxWidth: 360 }}>
        <h3 style={{ marginTop: 0 }}>
          {isJoin ? "Join a shared split" : "Share this split live"}
        </h3>
        <p className="description">
          {isJoin
            ? "Enter your name, then choose the items you ordered. Everyone sees updates instantly."
            : "Create a code to let friends choose the items they ordered together."}
        </p>
        {isJoin && (
          <>
            <InputField
              label="Join code"
              name="joinCode"
              value={code}
              onChange={(event) =>
                setCode(event.target.value.toUpperCase().replace(/\s/g, ""))
              }
              placeholder="ABC123"
              maxLength={6}
            />
            <InputField
              label="Your name"
              name="participantName"
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="e.g. Garfield"
              onEnter={() => valid && onJoin(code, name)}
            />
          </>
        )}
        {error && (
          <p role="alert" style={{ color: "var(--error, #b42318)" }}>
            {error}
          </p>
        )}
        <div
          style={{
            display: "flex",
            justifyContent: "flex-end",
            gap: "0.75em",
            marginTop: "1.5em",
          }}
        >
          <Button
            label="Cancel"
            className="secondary"
            onClick={onClose}
            disabled={busy}
          />
          <Button
            label={busy ? "Working..." : isJoin ? "Join Split" : "Create Code"}
            onClick={() => (isJoin ? onJoin(code, name) : onCreate())}
            disabled={busy || !valid}
          />
        </div>
      </div>
    </Modal>
  );
}

export default SharedSplitModal;
