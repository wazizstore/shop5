/* WAZIZ SHOP — Checkout drawer (shared logic) */
import { Cart } from './cart.js';
import { showToast, updateBadge } from './ui.js';
import { submitOrder } from './order-api.js';

/*
  ─────────────────────────────────────────────────────────────
  إصلاح مشكلة تكرار حدث Purchase في Meta Pixel
  ─────────────────────────────────────────────────────────────
  السبب الجذري: زر "تأكيد الطلب" وحقول الفورم لم تكن محمية من
  إرسال الفورم مرتين لنفس الطلب (مثلاً عبر الضغط على Enter مرة
  ثانية أو نقر سريع متكرر أثناء انتظار استجابة Google Apps
  Script). كل استدعاء لمعالج submit كان يحسب value ويطلق
  fbq('track','Purchase') من جديد بعد نجاح submitOrder، فإذا
  تم استدعاء المعالج مرتين لنفس الطلب، يتكرر الحدث Purchase
  بفارق ثوانٍ قليلة (بقدر ما يستغرقه fetch الثاني).

  الحل:
  1) isSubmitting: يمنع تنفيذ المعالج من جديد إذا كان هناك
     إرسال قيد التنفيذ لنفس الفورم (حماية من الضغط المزدوج).
  2) orderId فريد لكل طلب (يُنشأ مرة واحدة عند بدء الإرسال).
  3) sendPurchaseOnce(): يطلق Purchase مرة واحدة فقط، ويستعمل
     sessionStorage لمنع إعادة إرساله لنفس orderId حتى لو تم
     استدعاء الدالة أكثر من مرة بالخطأ.
  4) Purchase لا يُطلق إلا بعد أن يعيد submitOrder النتيجة
     "ناجحة" (ok === true) — أي بعد محاولة الحفظ في
     Google Sheets، وليس عند الضغط على الزر أو عند بداية submit.
  5) eventID = orderId يُمرَّر إلى fbq كمعامل رابع لدعم
     de-duplication من جهة Meta أيضاً.
*/

let isSubmitting = false;

function generateOrderId() {
  return 'ord_' + Date.now() + '_' + Math.random().toString(36).slice(2, 8);
}

/**
 * يطلق حدث Purchase مرة واحدة فقط لكل orderId.
 * محمي بـ sessionStorage حتى لو استُدعيت الدالة أكثر من مرة
 * بالخطأ (مثلاً بسبب استدعاء مزدوج للمعالج).
 */
function sendPurchaseOnce(orderId, items, value) {
  const key = `wz_purchase_sent_${orderId}`;

  try {
    if (sessionStorage.getItem(key)) {
      // تم إرسال Purchase لهذا الطلب من قبل — لا تكرره أبداً
      return;
    }
    sessionStorage.setItem(key, '1');
  } catch {
    // sessionStorage غير متاح (وضع خاص مثلاً) — نكمل مع تعليم
    // ذاكرة داخل الصفحة فقط كخط دفاع أخير
    if (sendPurchaseOnce._sent && sendPurchaseOnce._sent.has(orderId)) return;
    sendPurchaseOnce._sent = sendPurchaseOnce._sent || new Set();
    sendPurchaseOnce._sent.add(orderId);
  }

  if (typeof fbq === 'function') {
    fbq('track', 'Purchase', {
      content_ids: items.map(i => i.id),
      content_type: 'product',
      contents: items.map(i => ({ id: i.id, quantity: 1 })),
      num_items: items.length,
      value,
      currency: 'MAD'
    }, { eventID: orderId });
  }
}

export function openCheckout(items) {
  document.getElementById('coDrawer')?.classList.add('open');
  document.getElementById('coOverlay')?.classList.add('open');

  // Meta Pixel: user reached the checkout step
  if (typeof fbq === 'function') {
    const list = typeof items === 'function' ? items() : (Array.isArray(items) ? items : []);
    if (list.length) {
      const value = list.reduce((sum, item) => sum + parseInt(item.price, 10), 0);
      fbq('track', 'InitiateCheckout', {
        content_ids: list.map(i => i.id),
        content_type: 'product',
        contents: list.map(i => ({ id: i.id, quantity: 1 })),
        num_items: list.length,
        value,
        currency: 'MAD'
      });
    }
  }
}

export function closeCheckout() {
  document.getElementById('coDrawer')?.classList.remove('open');
  document.getElementById('coOverlay')?.classList.remove('open');
}

/**
 * Wires the checkout form.
 * @param {() => Array} getItems - returns the items to be ordered
 *        (the full cart on shop.html, or a single buy-now item on product.html)
 * @param {() => void} [onSuccess] - extra cleanup after a successful order
 */
export function initCheckout(getItems, onSuccess) {
  document.querySelectorAll('[data-action="open-checkout"]').forEach(el =>
    el.addEventListener('click', () => openCheckout(getItems))
  );
  document.querySelectorAll('[data-action="close-checkout"]').forEach(el =>
    el.addEventListener('click', closeCheckout)
  );
  document.getElementById('coOverlay')?.addEventListener('click', closeCheckout);

  const form = document.getElementById('checkoutForm');
  const submitBtn = document.getElementById('coSubmitBtn');
  if (!form || !submitBtn) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // ── حماية من الضغط المزدوج / إعادة إرسال نفس الطلب ──
    // إذا كان هناك إرسال قيد التنفيذ بالفعل، تجاهل أي محاولة
    // submit إضافية (نقر متكرر، ضغط Enter مرتين، إلخ).
    if (isSubmitting) return;
    isSubmitting = true;

    const name = document.getElementById('cName').value.trim();
    const phone = document.getElementById('cPhone').value.trim();
    const city = document.getElementById('cCity').value.trim();
    const address = document.getElementById('cAddr').value.trim();

    if (!name || !phone || !city || !address) {
      showToast('يرجى ملء جميع الحقول', 'error');
      isSubmitting = false;
      return;
    }

    const items = getItems();
    if (!items.length) {
      showToast('السلة فارغة', 'error');
      isSubmitting = false;
      return;
    }

    // تعطيل الزر فوراً — قبل أي عملية غير متزامنة — لمنع نقرة ثانية
    submitBtn.disabled = true;
    submitBtn.innerHTML = 'جاري الإرسال... <span class="spinner" aria-hidden="true"></span>';

    const orderId = generateOrderId();
    const value = items.reduce((sum, item) => sum + parseInt(item.price, 10), 0);

    // Meta Pixel: customer attempted to place an order
    if (typeof fbq === 'function') {
      fbq('track', 'Lead', {
        content_ids: items.map(i => i.id),
        content_type: 'product',
        value,
        currency: 'MAD'
      }, { eventID: orderId + '-lead' });
    }

    const ok = await submitOrder({ name, phone, city, address, orderId }, items);

    if (ok) {
      document.getElementById('coBody').innerHTML = `
        <div class="success-box" role="status">
          <div class="suc-ico"><i class="fas fa-check-circle" aria-hidden="true"></i></div>
          <h3>لقد تم إرسال طلبك</h3>
          <p>سنتصل بك اليوم أو غداً لكي نؤكد طلبيتك، ومن بعدها تمر إلى التوصيل. المرجو ترك الهاتف بجانبك.</p>
        </div>
      `;

      // Meta Pixel: order was successfully submitted (conversion)
      // يُطلق مرة واحدة فقط لكل orderId (انظر sendPurchaseOnce أعلاه)
      sendPurchaseOnce(orderId, items, value);

      onSuccess?.();
      updateBadge();
      // لا حاجة لإعادة isSubmitting إلى false هنا: الفورم اختفى
      // واستُبدل بصندوق النجاح، فلا يمكن إرسال طلب جديد من نفس الفورم.
    } else {
      showToast('حدث خطأ، حاول مرة أخرى', 'error');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fas fa-paper-plane" aria-hidden="true"></i> تأكيد الطلب الآن';
      // فشل الإرسال: نسمح للمستخدم بإعادة المحاولة
      isSubmitting = false;
    }
  });
}
