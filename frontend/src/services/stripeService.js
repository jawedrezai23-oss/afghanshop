import axios from 'axios';

const API_URL = 'http://localhost:5001/api/orders';

export const startStripePayment = async (cartItems) => {
  try {
    // 1. Wir senden die Warenkorb-Daten an dein Backend
    const response = await axios.post(`${API_URL}/create-checkout-session`, {
      items: cartItems
    });

    // 2. Das Backend schickt uns eine URL von Stripe zurück
    if (response.data.url) {
      // 3. Wir leiten den User direkt zu Stripe weiter
      window.location.href = response.data.url;
    }
  } catch (error) {
    console.error('Fehler beim Starten der Stripe-Zahlung:', error);
    alert('Zahlung konnte nicht gestartet werden. Bitte versuche es später erneut.');
  }
};