import { QRCodeCanvas } from "qrcode.react";

export default function ShareUrlQRCode({ url }) {
  return (
    <div style={{ textAlign: "center", padding: "1em" }}>
      <h3>Share via QR Code</h3>
      <QRCodeCanvas value={url} size={180} />
    </div>
  );
}
