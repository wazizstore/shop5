/* WAZIZ SHOP — Order submission
   Sends orders to a Google Apps Script Web App that writes each order as a
   new row in a Google Sheet. This replaces the previous implementation,
   which called the Telegram Bot API directly from the browser with a bot
   token hard-coded in the page source — a serious security leak, since
   anyone viewing the page source could read the token and send messages
   through the bot. Google Apps Script keeps all secrets server-side. */
import { GAS_ENDPOINT } from './config.js';

/**
 * @param {Object} customer - { name, phone, city, address, orderId }
 * @param {Array}  items    - cart items [{ name, price, color, size }]
 * @returns {Promise<boolean>} success
 */
export async function submitOrder(customer, items) {
  const total = items.reduce((sum, item) => sum + parseInt(item.price, 10), 0);

  const payload = {
    // معرّف فريد للطلب — يُستعمل أيضاً كـ eventID لحدث Purchase في
    // Meta Pixel لمنع تكراره. حقل إضافي فقط، لا يمس بقية الأعمدة.
    orderId: customer.orderId || '',
    name: customer.name,
    phone: customer.phone,
    city: customer.city,
    address: customer.address,
    total,
    items: items.map(item => ({
      name: item.name,
      price: item.price,
      color: item.color || '',
      size: item.size || ''
    })),
    date: new Date().toISOString()
  };

  try {
    // Apps Script Web Apps don't return CORS headers for simple POSTs unless
    // configured to, so we use no-cors and treat the request as "fire and
    // forget" — Apps Script still receives and processes it normally.
    await fetch(GAS_ENDPOINT, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    return true;
  } catch (e) {
    console.error('Order submission failed:', e);
    return false;
  }
}
