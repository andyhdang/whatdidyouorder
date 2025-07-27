import React, { useState } from "react";
import "./Footer.css";
import Modal from "../Modal/Modal";
import Button from "../Button/Button";

function Footer() {
  const [modalOpen, setModalOpen] = useState(false);
  return (
    <footer className="footer">
      <div className="footer-content">
        <span>© {new Date().getFullYear()} TabbySplit</span>
        <span style={{ marginLeft: "1em" }}>
          <Button
            label="Help us improve"
            className="custom-btn tertiary"
            onClick={() => setModalOpen(true)}
          ></Button>
        </span>
      </div>
      <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
        <iframe
          src="https://docs.google.com/forms/d/e/1FAIpQLScwPLlQ9bzW87hJhJPgMUWDDrBKOJsNGVa30IadB3xu-1HLGg/viewform?embedded=true"
          width="640"
          height="786"
          frameBorder="0"
          marginHeight="0"
          marginWidth="0"
          title="Feedback Form"
          style={{ border: "none", maxWidth: "100%" }}
        >
          Loading…
        </iframe>
      </Modal>
    </footer>
  );
}

export default Footer;
