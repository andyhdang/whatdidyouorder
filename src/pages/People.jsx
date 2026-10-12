import React, { useState } from "react";
import InputField from "../components/InputField/InputField";
import Button from "../components/Button/Button";
import Card from "../components/Card/Card";
import DeleteIcon from "../assets/icons/DeleteIcon";
import EditIcon from "../assets/icons/EditIcon";
import Modal from "../components/Modal/Modal";
import PersonAddIcon from "../assets/icons/PersonAddIcon";
import QrcodeIcon from "../assets/icons/QrcodeIcon";
import LinkIcon from "../assets/icons/LinkIcon";
import ShareUrlQRCode from "../components/ShareUrlQRCode";
import Snackbar from "../components/Snackbar/Snackbar";

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

function People({
  people,
  setPeople,
  emojis,
  setEmojis,
  setActiveTab,
  isSupabaseConfigured = false,
  sharedJoinCode,
  sharedJoinUrl,
  onStartLiveShare,
  onCopyLiveShare,
}) {
  const [name, setName] = useState("");
  const [editIdx, setEditIdx] = useState(null);
  const [editName, setEditName] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", type: "info" });

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
      setIsAddModalOpen(false);
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

  const handleCopyInviteLink = async () => {
    try {
      await onCopyLiveShare();
      setSnackbar({
        open: true,
        message: "Share code link copied to clipboard.",
        type: "success",
      });
    } catch (error) {
      console.error("Failed to copy share code link", error);
      setSnackbar({
        open: true,
        message: "Couldn't copy the share code link. Please try again.",
        type: "error",
      });
    }
  };

  return (
    <main>
      <h2>People</h2>
      <div className="description">Who are you splitting the bill with?</div>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.5em",
          justifyContent: "center",
        }}
      >
        {isSupabaseConfigured && (
          sharedJoinCode ? (
            <>
              <Button
                label="Show QR Code"
                icon={<QrcodeIcon size={20} color="currentColor" />}
                className="primary"
                onClick={() => setIsQrModalOpen(true)}
              />
              <Button
                label={`Share Code: ${sharedJoinCode}`}
                icon={<LinkIcon size={18} style={{ verticalAlign: "middle" }} />}
                className="secondary"
                onClick={handleCopyInviteLink}
              />
            </>
          ) : (
            <Button
              label="Generate Share Code"
              className="primary"
              onClick={onStartLiveShare}
            />
          )
        )}
        <Button
          label="Add Person(s)"
          className={isSupabaseConfigured ? "secondary" : "primary"}
          onClick={() => setIsAddModalOpen(true)}
        />
      </div>
      {sharedJoinCode && (
        <div
          className="input-description"
          style={{ marginTop: "1em", textAlign: "center" }}
        >
          Share this code with friends so they can choose their items.
        </div>
      )}
      <Modal open={isQrModalOpen} onClose={() => setIsQrModalOpen(false)}>
        <ShareUrlQRCode url={sharedJoinUrl} />
      </Modal>
      <div style={{ marginTop: "1.5em" }}>
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
      <Modal
        open={isAddModalOpen}
        onClose={() => {
          setIsAddModalOpen(false);
          setName("");
        }}
      >
        <div style={{ padding: "1em", minWidth: 260 }}>
          <h3>Add people</h3>
          <InputField
            label="Names"
            placeholder="e.g. Garfield, Tom, Marie"
            name="personName"
            value={name}
            onChange={(event) => setName(event.target.value)}
            onEnter={handleAdd}
            description="Separate names with commas to add multiple people."
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
              className="secondary"
              onClick={() => {
                setIsAddModalOpen(false);
                setName("");
              }}
            />
            <Button
              label="Add Person(s)"
              icon={
                <PersonAddIcon
                  width={20}
                  height={20}
                  style={{ color: "inherit" }}
                />
              }
              onClick={handleAdd}
            />
          </div>
        </div>
      </Modal>
      <div
        style={{
          marginTop: "2em",
          marginBottom: "1.5em",
          fontWeight: 600,
          fontSize: "1.1em",
        }}
      >
        Total people: {people.length}
      </div>
      {people.length > 0 && (
        <Button
          label="Next: Assign People to Items"
          className="primary"
          onClick={() => {
            if (typeof setActiveTab === "function") {
              setActiveTab(3);
            }
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
        />
      )}
      <Snackbar
        open={snackbar.open}
        message={snackbar.message}
        type={snackbar.type}
        onClose={() => setSnackbar((current) => ({ ...current, open: false }))}
      />
    </main>
  );
}

export default People;
