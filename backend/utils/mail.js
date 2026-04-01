import nodemailer from 'nodemailer';

// Diese Funktion konfiguriert den E-Mail-Versand (z.B. via Gmail oder Outlook)
const transporter = nodemailer.createTransport({
  service: 'gmail', // Oder dein Anbieter
  auth: {
    user: process.env.EMAIL_USER, // Deine E-Mail Adresse in der .env
    pass: process.env.EMAIL_PASS, // Dein App-Passwort in der .env
  },
});

// VORLAGE: Bestellung bezahlt
export const sendPayEmail = async (order) => {
  const mailOptions = {
    from: `"AfghanShop" <${process.env.EMAIL_USER}>`,
    to: order.user.email,
    subject: `Zahlungsbestätigung - Bestellung #${order._id.toString().slice(-6)}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
        <div style="background-color: #06b6d4; padding: 30px; text-align: center;">
          <img src="cid:logo" style="width: 80px;" />
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
    `,
    attachments: [{
      filename: 'logo.png',
      path: './public/images/logo.png',
      cid: 'logo' // Das verbindet das Bild mit dem <img src="cid:logo"> Tag
    }]
  };

  await transporter.sendMail(mailOptions);
};

// VORLAGE: Bestellung versendet
export const sendDeliverEmail = async (order) => {
  const trackingLink = order.carrier.toLowerCase().includes('post') 
    ? `https://www.post.at/s/sendungsdetails?sn=${order.trackingNumber}`
    : `https://www.google.com/search?q=${order.carrier}+tracking+${order.trackingNumber}`;

  const mailOptions = {
    from: `"AfghanShop" <${process.env.EMAIL_USER}>`,
    to: order.user.email,
    subject: `Dein Paket ist unterwegs! 🚚`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #eee; border-radius: 20px; overflow: hidden;">
        <div style="background-color: #0f172a; padding: 30px; text-align: center;">
          <img src="cid:logo" style="width: 80px;" />
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
    `,
    attachments: [{
      filename: 'logo.png',
      path: './public/images/logo.png',
      cid: 'logo'
    }]
  };

  await transporter.sendMail(mailOptions);
};