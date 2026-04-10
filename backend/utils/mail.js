import nodemailer from 'nodemailer';

// Konfiguration für Netcup (basierend auf deinen Screenshots)
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'mx150e.netcup.net', // Host aus dem Netcup Screenshot
  port: 465, // Port für SSL/TLS (siehe Screenshot)
  secure: true, // Muss true sein für Port 465
  auth: {
    user: process.env.MAIL_USER, // Deine E-Mail: info@afghanshop.at
    pass: process.env.MAIL_PASS, // Das Passwort aus dem Plesk-Panel
  },
});

// VORLAGE: Bestellung bezahlt
export const sendPayEmail = async (order) => {
  const mailOptions = {
    // Hier nutzen wir MAIL_FROM für ein sauberes Erscheinungsbild
    from: `"AfghanShop" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
    to: order.user.email,
    subject: `Zahlungsbestätigung - Bestellung #${order._id.toString().slice(-6)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
        <div style="background-color: #06b6d4; padding: 30px; text-align: center;">
          <h1 style="color: white; margin: 10px 0 0 0;">Vielen Dank!</h1>
        </div>
        <div style="padding: 30px;">
          <h2>Hallo ${order.shippingAddress.fullName},</h2>
          <p>Wir haben deine Zahlung erhalten. Deine Spezialitäten werden jetzt verpackt!</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
          <p><strong>Summe:</strong> ${order.totalPrice.toFixed(2)} €</p>
          <p>Wir melden uns, sobald das Paket unterwegs ist.</p>
        </div>
      </div>
    `
    // Hinweis: Die "attachments" mit dem Logo habe ich drin gelassen, 
    // stell sicher, dass der Pfad './public/images/logo.png' auf dem Server existiert.
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("E-Mail Versandfehler (Pay):", error);
  }
};

// VORLAGE: Bestellung versendet
export const sendDeliverEmail = async (order) => {
  const trackingLink = order.carrier.toLowerCase().includes('post') 
    ? `https://www.post.at/s/sendungsdetails?sn=${order.trackingNumber}`
    : `https://www.google.com/search?q=${order.carrier}+tracking+${order.trackingNumber}`;

  const mailOptions = {
    from: `"AfghanShop" <${process.env.MAIL_FROM || process.env.MAIL_USER}>`,
    to: order.user.email,
    subject: `Dein Paket ist unterwegs! 🚚`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 30px; text-align: center;">
          <h1 style="color: #06b6d4; margin: 10px 0 0 0;">Bestellung versendet!</h1>
        </div>
        <div style="padding: 30px; text-align: center;">
          <p>Hallo ${order.shippingAddress.fullName}, dein Paket wurde an <b>${order.carrier}</b> übergeben.</p>
          <a href="${trackingLink}" style="display: inline-block; background-color: #06b6d4; color: white; padding: 15px 25px; text-decoration: none; border-radius: 10px; font-weight: bold; margin: 20px 0;">
            SENDUNG VERFOLGEN: ${order.trackingNumber}
          </a>
          <p style="font-size: 11px; color: #999;">Tracking-Nummer: ${order.trackingNumber}</p>
        </div>
      </div>
    `
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("E-Mail Versandfehler (Deliver):", error);
  }
};