import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Stripe from 'stripe';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import QRCode from 'qrcode';
import PDFDocument from 'pdfkit';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- FINALE LÖSUNG FÜR NETCUP (PORT 25) ---
const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'mx150e.netcup.net',
  port: 25, // Port 25 ist oft die letzte Rettung bei Timeouts
  secure: false, // Muss false sein für Port 25/587
  auth: {
    user: process.env.MAIL_USER || 'info@afghanshop.at',
    pass: process.env.MAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Ignoriert Zertifikatsfehler zwischen Render/Netcup
    ignoreTLS: false
  }
});

// Test-Log für Render Dashboard
transporter.verify((error, success) => {
  if (error) {
    console.log("!!! Mail-Server Verbindung fehlgeschlagen auf Port 25:", error);
  } else {
    console.log("--- Mail-Server (Netcup) ist JETZT bereit ---");
  }
});

// --- HILFSFUNKTION FÜR EPC-QR-CODE ---
const generatePaymentQRCode = async (order) => {
  const iban = "IE49SUMU99036512768145";
  const bic = "SUMUIE22XXX";
  const name = "Jawed REZAI";
  const amount = Number(order.totalPrice).toFixed(2);
  const reference = `RE-${order.invoiceNumber}`;

  const qrData = `BCD\n001\n1\nSCT\n${bic}\n${name}\n${iban}\nEUR${amount}\nNONE\n${reference}\nVielen Dank`;

  try {
    return await QRCode.toDataURL(qrData, {
      margin: 1,
      width: 300,
      color: { dark: '#000000', light: '#ffffff' }
    });
  } catch (err) {
    console.error('QR Generator Fehler:', err);
    return null;
  }
};

// --- PDF GENERIERUNGS LOGIK ---
const drawInvoiceContent = async (doc, order) => {
  try {
    const logoPath = path.resolve(__dirname, '../public/images/logo.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, 450, 45, { width: 100 });
    }
  } catch (error) {
    console.error('Logo Fehler', error);
  }
  
  doc.fillColor('#444444').fontSize(10)
    .font('Helvetica-Bold').text('AfghanShop - Afghanische Spezialitäten', 50, 50)
    .font('Helvetica').text('Jawed REZAI')
    .font('Helvetica').text('Mozartstrasse 17/6')
    .text('5280 Braunau am Inn')
    .text('Email: info@afghanshop.at')
    .moveDown();

  doc.moveDown(2);
  doc.fillColor('#0099b5').fontSize(22).font('Helvetica-Bold').text('RECHNUNG', 50, 150);
  doc.fillColor('#444444').fontSize(10).font('Helvetica')
    .text(`Rechnungsnr: RE-${order.invoiceNumber}`, 50, 175)
    .text(`Datum: ${new Date(order.createdAt).toLocaleDateString('de-DE')}`, 50, 190);

  const tableTop = 260;
  doc.rect(50, tableTop, 500, 25).fill('#0099b5');
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(11)
    .text('Produkt', 60, tableTop + 7)
    .text('Menge', 280, tableTop + 7)
    .text('Einzelpreis', 360, tableTop + 7)
    .text('Gesamt', 460, tableTop + 7);

  let i = 0;
  let currentY = tableTop + 35;

  for (const item of order.orderItems) {
    if (i % 2 === 0) {
      doc.rect(50, currentY - 5, 500, 45).fill('#f2f2f2'); 
    }
    
    doc.fillColor('#444444').fontSize(10).font('Helvetica');

    let weightLabel = "";
    let rawWeight = item.weight;
    
    if (!rawWeight) {
      const dbProd = await Product.findById(item.product).lean();
      if (dbProd) rawWeight = dbProd.weight;
    }

    if (rawWeight) {
      let w = String(rawWeight).replace(/[^\d.]/g, ''); 
      if (w.length >= 4 && w.length % 2 === 0) {
        const half = w.length / 2;
        if (w.substring(0, half) === w.substring(half)) w = w.substring(0, half);
      }
      
      const unit = item.unit || 'g';
      const fullW = `${w}${unit}`;
      const nameClean = item.name.toLowerCase().replace(/\s/g, '');
      const weightClean = fullW.toLowerCase().replace(/\s/g, '');

      if (!nameClean.includes(weightClean)) {
        weightLabel = ` (${fullW})`;
      }
    }

    const displayName = (item.isBundle ? `🎁 ${item.name}` : item.name) + weightLabel;
    
    doc.text(displayName, 60, currentY + 10)
      .text(item.qty.toString(), 280, currentY + 10);

    if (item.oldPrice && Number(item.oldPrice) > Number(item.price)) {
      doc.fillColor('#999999').fontSize(8);
      const oldPriceText = `${Number(item.oldPrice).toFixed(2)} EUR`;
      doc.text(oldPriceText, 360, currentY + 2);
      const textWidth = doc.widthOfString(oldPriceText);
      doc.moveTo(360, currentY + 6).lineTo(360 + textWidth, currentY + 6).stroke('#999999');
      doc.fillColor('#d32f2f').font('Helvetica-Bold').fontSize(10)
        .text(`${Number(item.price).toFixed(2)} EUR`, 360, currentY + 12);
    } else {
      doc.fillColor('#444444').font('Helvetica').fontSize(10)
        .text(`${Number(item.price).toFixed(2)} EUR`, 360, currentY + 10);
    }

    doc.fillColor('#444444').font('Helvetica').fontSize(10)
      .text(`${((item.qty * item.price)).toFixed(2)} EUR`, 460, currentY + 10);

    if (item.isBundle) {
      const productData = await Product.findById(item.product).lean();
      if (productData && productData.bundleItems) {
        currentY += 25;
        doc.fillColor('#777777').fontSize(8).font('Helvetica-Oblique');
        if (Array.isArray(productData.bundleItems)) {
          for (const bItem of productData.bundleItems) {
            doc.text(`   • Enthält: ${bItem.qty}x ${bItem.name || 'Produkt'}`, 60, currentY);
            currentY += 12;
          }
        }
      }
    }

    currentY += 35;
    i++;
  }

  const depositValue = order.totalDeposit || 0;
  if (depositValue > 0) {
    doc.rect(50, currentY - 5, 500, 25).fill('#fff7ed').fillColor('#c2410c');
    doc.font('Helvetica-Bold').text('zzgl. Getränkepfand', 60, currentY)
      .text(`${Number(depositValue).toFixed(2)} EUR`, 460, currentY);
    currentY += 30;
  }

  if (order.shippingPrice > 0) {
    doc.fillColor('#444444').font('Helvetica').fontSize(10)
      .text('Versandkosten', 60, currentY)
      .text(`${Number(order.shippingPrice).toFixed(2)} EUR`, 460, currentY);
    currentY += 25;
  }

  const footerY = currentY + 10;
  doc.rect(50, footerY, 500, 30).fill('#e1f5fe');
  doc.fillColor('#000000').font('Helvetica-Bold').fontSize(12)
    .text('GESAMTSUMME:', 260, footerY + 9)
    .text(`${Number(order.totalPrice).toFixed(2)} EUR`, 460, footerY + 9);

  doc.fillColor('#444444').fontSize(8).font('Helvetica-Oblique')
    .text('Es erfolgt kein Ausweis der Umsatzsteuer aufgrund der Anwendung der Kleinunternehmerregelung gemäß § 6 Abs. 1 Z 27 UStG.', 50, footerY + 40);

  const qrCodeImage = await generatePaymentQRCode(order);
  if (qrCodeImage) {
    const qrPos = footerY + 60;
    doc.image(qrCodeImage, 50, qrPos, { width: 80 });
    doc.fontSize(8).font('Helvetica').fillColor('#444444')
      .text(`Verwendungszweck: RE-${order.invoiceNumber}`, 140, qrPos + 25)
      .text(`IBAN: IE49SUMU99036512768145`, 140, qrPos + 40);
  }
  doc.end();
};

export const addOrder = async (req, res) => {
  try {
    const { orderItems, shippingAddress } = req.body;
    const isBraunau = shippingAddress.postalCode === '5280' || 
                      shippingAddress.city.toLowerCase().includes('braunau');

    for (const item of orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        const isFresh = product.category === 'Frischware' || product.isFresh;
        const isHeavy = product.weight >= 5000 || (product.name.toLowerCase().includes('reis') && product.weight >= 4000);
        if ((isFresh || isHeavy) && !isBraunau) {
          return res.status(400).json({ 
            message: `Das Produkt "${product.name}" kann leider nur innerhalb von Braunau am Inn geliefert werden.` 
          });
        }
      }
    }

    const lastOrder = await Order.findOne().sort({ invoiceNumber: -1 });
    const newInvoiceNumber = lastOrder && lastOrder.invoiceNumber >= 1063 ? lastOrder.invoiceNumber + 1 : 1063;
    
    const itemsPrice = orderItems.reduce((acc, item) => acc + item.price * item.qty, 0);
    let shippingPrice = req.body.shippingPrice;
    if (shippingPrice > 0) {
      shippingPrice = itemsPrice >= 60 ? 0 : 4.99;
    }

    const order = new Order({
      ...req.body,
      shippingPrice: shippingPrice, 
      user: req.user._id,
      invoiceNumber: newInvoiceNumber
    });

    const depositPrice = order.totalDeposit || 0;
    order.totalPrice = itemsPrice + shippingPrice + depositPrice;

    const createdOrder = await order.save();
    const populatedOrder = await Order.findById(createdOrder._id).populate('user', 'name email');

    for (const item of createdOrder.orderItems) {
      const product = await Product.findById(item.product);
      if (product) {
        if (product.isBundle && Array.isArray(product.bundleItems)) {
          for (const bItem of product.bundleItems) {
            const subProduct = await Product.findById(bItem.product);
            if (subProduct) {
              subProduct.countInStock -= (bItem.qty * item.qty);
              await subProduct.save({ validateBeforeSave: false });
            }
          }
        }
        product.countInStock -= item.qty;
        product.sold = (product.sold || 0) + item.qty;
        product.revenue = (product.revenue || 0) + (item.qty * Number(item.price));
        await product.save({ validateBeforeSave: false });
      }
    }

    // PDF Generierung und E-Mail Versand
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    let buffers = [];
    doc.on('data', buffers.push.bind(buffers));
    doc.on('end', async () => {
      const pdfBuffer = Buffer.concat(buffers);
      
      const mailOptions = {
        from: `"AfghanShop" <${process.env.MAIL_USER || 'info@afghanshop.at'}>`,
        to: populatedOrder.user.email,
        subject: `Rechnung RE-${populatedOrder.invoiceNumber}`,
        text: `Vielen Dank für Ihre Bestellung! Bitte überweisen Sie den Betrag auf unser Konto: Jawed REZAI, IBAN: IE49SUMU99036512768145`,
        attachments: [{ filename: `RE-${populatedOrder.invoiceNumber}.pdf`, content: pdfBuffer }]
      };

      const adminMail = {
        from: `"AfghanShop System" <${process.env.MAIL_USER || 'info@afghanshop.at'}>`,
        // Hier habe ich deine zweite Mailadresse direkt hinzugefügt
        to: ["info@afghanshop.at", "Jawedrezai23@hotmail.com"],
        subject: `NEUE BESTELLUNG - RE-${populatedOrder.invoiceNumber}`,
        html: `
          <h3>Neue Bestellung erhalten!</h3>
          <p><strong>Kunde:</strong> ${populatedOrder.shippingAddress.fullName}</p>
          <p><strong>Email:</strong> ${populatedOrder.user.email}</p>
          <p><strong>Summe:</strong> ${Number(populatedOrder.totalPrice).toFixed(2)} EUR</p>
        `,
        attachments: [{ filename: `RE-${populatedOrder.invoiceNumber}.pdf`, content: pdfBuffer }]
      };

      try {
        await transporter.sendMail(mailOptions);
        await transporter.sendMail(adminMail);
      } catch (e) { 
        console.error("Mail Error bei Bestellung:", e); 
      }
    });

    await drawInvoiceContent(doc, populatedOrder);
    res.status(201).json(createdOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ... Rest des Codes bleibt gleich ...
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      for (const item of order.orderItems) {
        const product = await Product.findById(item.product);
        if (product) {
          if (product.isBundle && Array.isArray(product.bundleItems)) {
            for (const bItem of product.bundleItems) {
              const subProduct = await Product.findById(bItem.product);
              if (subProduct) {
                subProduct.countInStock += (bItem.qty * item.qty);
                await subProduct.save({ validateBeforeSave: false });
              }
            }
          }
          product.countInStock += item.qty;
          product.sold = Math.max(0, (product.sold || 0) - item.qty);
          product.revenue = Math.max(0, (product.revenue || 0) - (item.qty * Number(item.price)));
          await product.save({ validateBeforeSave: false });
        }
      }
      await order.deleteOne();
      res.json({ message: 'Bestellung gelöscht' });
    } else { res.status(404).json({ message: 'Nicht gefunden' }); }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const generateInvoice = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (!order) return res.status(404).json({ message: 'Bestellung nicht gefunden' });
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=RE-${order.invoiceNumber}.pdf`);
    doc.pipe(res);
    await drawInvoiceContent(doc, order);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');
    if (order) {
      const qrCode = !order.isPaid ? await generatePaymentQRCode(order) : null;
      res.json({ ...order.toObject(), qrCode });
    } else { res.status(404).json({ message: 'Nicht gefunden' }); }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const createCheckoutSession = async (req, res) => {
  try {
    const { items, orderId, shippingPrice } = req.body;
    const itemsPrice = items.reduce((acc, item) => acc + item.price * item.qty, 0);
    const finalShipping = shippingPrice > 0 ? (itemsPrice >= 60 ? 0 : 4.99) : 0;
    
    const line_items = items.map((item) => ({
      price_data: {
        currency: 'eur',
        product_data: { name: item.name },
        unit_amount: Math.round((Number(item.price) + (item.isDeposit ? Number(item.depositValue) : 0)) * 100),
      },
      quantity: Number(item.qty),
    }));
    if (finalShipping > 0) {
      line_items.push({
        price_data: { currency: 'eur', product_data: { name: 'Versandkosten' }, unit_amount: Math.round(finalShipping * 100) },
        quantity: 1,
      });
    }
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items,
      mode: 'payment',
      success_url: `${process.env.STRIPE_SUCCESS_URL || 'http://localhost:5173/order/success'}?orderId=${orderId}`,
      cancel_url: `${process.env.STRIPE_CANCEL_URL || 'http://localhost:5173/cart'}`,
    });
    res.json({ id: session.id, url: session.url });
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const confirmPayment = async (req, res) => {
  try {
    const order = await Order.findById(req.body.orderId);
    if (order) {
      order.isPaid = true;
      order.paidAt = Date.now();
      await order.save();
      res.json(order);
    } else { res.status(404).json({ message: 'Nicht gefunden' }); }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isDelivered = true;
      order.deliveredAt = Date.now();
      order.carrier = req.body.carrier || order.carrier;
      order.trackingNumber = req.body.trackingNumber || order.trackingNumber;
      const updatedOrder = await order.save();
      res.json(updatedOrder);
    } else { res.status(404).json({ message: 'Bestellung nicht gefunden' }); }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const updateOrderToPaidAdmin = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (order) {
      order.isPaid = !order.isPaid;
      order.paidAt = order.isPaid ? Date.now() : undefined;
      await order.save();
      res.json(order);
    } else { res.status(404).json({ message: 'Nicht gefunden' }); }
  } catch (error) { res.status(500).json({ message: error.message }); }
};

export const getNextInvoiceNumber = async (req, res) => {
  try {
    const lastOrder = await Order.findOne().sort({ invoiceNumber: -1 });
    const nextNumber = lastOrder && lastOrder.invoiceNumber >= 1063 ? lastOrder.invoiceNumber + 1 : 1063;
    res.json({ nextInvoiceNumber: nextNumber });
  } catch (error) { res.status(500).json({ message: error.message }); }
};