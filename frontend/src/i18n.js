import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const resources = {
  de: {
    translation: {
      "welcome": "Authentische Produkte direkt zu dir.",
      "hero_subtitle": "Entdecke unser handverlesenes Sortiment in bester Qualität.",
      "browse_now": "Jetzt stöbern",
      "recommendations": "Unsere Empfehlungen",
      "search_placeholder": "Produkte suchen...",
      "out_of_stock": "Ausverkauft",
      "shop": "Shop",
      "login": "Anmelden",
      "results_for": "Ergebnisse für",
      "no_products": "Keine Produkte gefunden, Brudi.",
      "admin_products": "Produkte",
      "admin_orders": "Bestellungen",
      "shopping_cart": "Warenkorb",
      "items": "Artikel",
      "subtotal": "Zwischensumme",
      "proceed_to_checkout": "Zur Kasse gehen",
      "empty_cart_msg": "Dein Warenkorb ist leer.",
      "back_to_shop": "Zurück zum Shop",
      "delete": "Löschen",
      "price": "Preis",
      "quantity": "Anzahl",
      "shipping_address": "Lieferadresse",
      "address_label": "Straße & Hausnummer",
      "city": "Stadt",
      "postal_code": "Postleitzahl",
      "country": "Land",
      "pay_now": "Mit Karte bezahlen",
      "processing": "Verarbeite Zahlung...",
      "shipping": "Versandkosten", 
      "free": "Gratis"
    }
  },
  fa: {
    translation: {
      "welcome": "محصولات اصیل مستقیماً به شما",
      "hero_subtitle": "مجموعه دست‌چین شده ما را با بهترین کیفیت کشف کنید.",
      "browse_now": "اکنون خرید کنید",
      "recommendations": "پیشنهادات ما",
      "search_placeholder": "جستجوی محصولات...",
      "out_of_stock": "تمام شد",
      "results_for": "نتایج für",
      "no_products": "محصولی یافت نشد، برادر.",
      "shop": "فروشگاه",
      "login": "ورود",
      "admin_products": "محصولات",
      "admin_orders": "سفارشات",
      "shopping_cart": "سبد خرید",
      "items": "اجناس",
      "subtotal": "مجموع کل",
      "proceed_to_checkout": "تکمیل خرید / پرداخت",
      "empty_cart_msg": "سبد خرید شما خالی است.",
      "back_to_shop": "بازگشت به فروشگاه",
      "delete": "حذف",
      "price": "قیمت",
      "quantity": "تعداد",
      "shipping_address": "آدرس ارسال",
      "address_label": "سرک و نمبر خانه",
      "city": "شهر",
      "postal_code": "کد پستی",
      "country": "کشور",
      "pay_now": "پرداخت با کارت",
      "processing": "در حال پردازش پرداخت...",
      "shipping": "هزینه ارسال", 
      "free": "رایگان"
    }
  },
  ps: {
    translation: {
      "welcome": "اصلي محصولات مستقیم تاسو ته",
      "hero_subtitle": "زموږ غوره شوي محصولات په لوړ کیفیت سره ومومئ.",
      "browse_now": "همدا اوس لټون وکړئ",
      "recommendations": "زموږ وړاندیزونه",
      "search_placeholder": "د محصولاتو لټون...",
      "out_of_stock": "ختم شوي",
      "results_for": "د پایلو لپاره",
      "no_products": "هیڅ محصول ونه موندل شو، وروره.",
      "shop": "هټۍ",
      "login": "ننوتل",
      "admin_products": "محصولات",
      "admin_orders": "امرونه",
      "shopping_cart": "کڅوړه",
      "items": "توکي",
      "subtotal": "ټوله مجموعه",
      "proceed_to_checkout": "Checkout ته لاړشئ",
      "empty_cart_msg": "ستاسو کڅوړه خالي ده.",
      "back_to_shop": "بیرته پلورنځي ته",
      "delete": "پاکول",
      "price": "بیه",
      "quantity": "شمېر",
      "shipping_address": "د لیږلو پته",
      "address_label": "سړک او د کور نمبر",
      "city": "ښار",
      "postal_code": "پوستی کوډ",
      "country": "هیواد",
      "pay_now": "په کارت سره تادیه کول",
      "processing": "د تادیې پروسس روان دی...",
      "shipping": "د لیږد لګښت", 
      "free": "وړیا"
    }
  }
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: "de", 
    fallbackLng: "de", 
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;