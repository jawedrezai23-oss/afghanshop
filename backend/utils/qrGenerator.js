import QRCode from 'qrcode';

export const generatePaymentQRCode = async (order) => {
  const iban = "AT123456789012345678"; // DEINE IBAN HIER EINTRAGEN
  const bic = "ABCDEFGH";               // DEINE BIC HIER EINTRAGEN
  const name = "Afghan Shop Braunau";   // DEIN NAME / FIRMENNAME
  const amount = order.totalPrice.toFixed(2);
  const reference = `Rechnung ${order._id.toString().slice(-6)}`; // Rechnungsnummer

  // Der EPC-QR-Code Standard (BezahlCode)
  const qrData = `BCD
001
1
SCT
${bic}
${name}
${iban}
EUR${amount}
NONE
${reference}
Zahlung Shop`;

  try {
    const qrCodeImage = await QRCode.toDataURL(qrData);
    return qrCodeImage; // Gibt einen Base64 String zurück
  } catch (err) {
    console.error('QR Fehler', err);
    return null;
  }
};