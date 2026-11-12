import { products } from './data.js';
import { initCartDrawer, renderCart, showToast, updateBadge } from './ui.js';
import { Cart } from './cart.js';
import { initCheckout, openCheckout } from './checkout.js';
import { productCardHtml } from './product-grid.js';

let currentProduct = null;
let selectedColor = null;
let selectedSize = null;
let buyNowItems = null;
let qty = 1;

function switchImage(src, thumbEl) {
  const main = document.getElementById('mainImg');
  main.style.opacity = '0';
  setTimeout(() => {
    main.src = src;
    main.style.opacity = '1';
  }, 150);
  document.querySelectorAll('.thumb-img').forEach(t => t.classList.remove('active'));
  thumbEl.classList.add('active');
}

/* Swipe gestures on the main product image:
   swipe right → previous image, swipe left → next image. */
function initSwipe() {
  const wrap = document.querySelector('.main-img-wrap');
  const thumbs = Array.from(document.querySelectorAll('.thumb-img'));
  if (!wrap || thumbs.length < 2) return;

  const MIN_DISTANCE = 40; // px of horizontal movement needed to count as a swipe
  let startX = 0, startY = 0, tracking = false;

  const currentIndex = () => {
    const i = thumbs.findIndex(t => t.classList.contains('active'));
    return i === -1 ? 0 : i;
  };

  const goTo = (i) => {
    if (i < 0 || i >= thumbs.length) return;
    switchImage(thumbs[i].dataset.img, thumbs[i]);
  };

  wrap.addEventListener('touchstart', (e) => {
    if (e.touches.length !== 1) { tracking = false; return; }
    startX = e.touches[0].clientX;
    startY = e.touches[0].clientY;
    tracking = true;
  }, { passive: true });

  wrap.addEventListener('touchend', (e) => {
    if (!tracking) return;
    tracking = false;
    const t = e.changedTouches[0];
    const dx = t.clientX - startX;
    const dy = t.clientY - startY;
    // Ignore short moves and mostly-vertical gestures (normal page scroll)
    if (Math.abs(dx) < MIN_DISTANCE || Math.abs(dx) < Math.abs(dy) * 1.5) return;
    goTo(currentIndex() + (dx > 0 ? -1 : 1)); // right → previous, left → next
  }, { passive: true });

  wrap.addEventListener('touchcancel', () => { tracking = false; }, { passive: true });
}

function selectColor(colorName, el) {
  selectedColor = colorName;
  document.querySelectorAll('.color-swatch').forEach(s => {
    s.classList.remove('active');
    s.setAttribute('aria-pressed', 'false');
  });
  el.classList.add('active');
  el.setAttribute('aria-pressed', 'true');
}

function selectSize(size, el) {
  selectedSize = size;
  document.querySelectorAll('.chip.size-chip').forEach(c => {
    c.classList.remove('active');
    c.setAttribute('aria-pressed', 'false');
  });
  el.classList.add('active');
  el.setAttribute('aria-pressed', 'true');
}

function validateSelections() {
  const p = currentProduct;
  const hasColors = p.colors && p.colors.length > 0;
  const hasSizes = p.sizes && p.sizes.length > 0;
  if (hasColors && !selectedColor) {
    showToast('الرجاء اختيار اللون', 'error');
    return false;
  }
  if (hasSizes && !selectedSize) {
    showToast('الرجاء اختيار المقاس', 'error');
    return false;
  }
  return true;
}

function buildOrderItem() {
  const p = currentProduct;
  return {
    id: p.id, name: p.name, price: p.price, img: p.images[0],
    color: selectedColor || '', size: selectedSize || ''
  };
}

function addToCart() {
  if (!validateSelections()) return;
  const item = buildOrderItem();
  for (let i = 0; i < qty; i++) Cart.add({ ...item });
  updateBadge();
  showToast('تمت الإضافة إلى السلة ✓', 'success');
  if (typeof fbq === 'function') {
    fbq('track', 'AddToCart', {
      content_ids: [item.id], content_name: item.name, content_type: 'product',
      value: parseInt(item.price, 10) * qty, currency: 'MAD'
    });
  }
}

function buyNow() {
  if (!validateSelections()) return;
  buyNowItems = Array.from({ length: qty }, () => buildOrderItem());
  openCheckout(buyNowItems);
}

function renderGallery(p) {
  return `
    <div class="product-gallery">
      <div class="main-img-wrap">
        <img id="mainImg" class="main-img" src="${p.images[0]}" alt="${p.name}" width="600" height="630" fetchpriority="high" decoding="async">
      </div>
      ${p.images.length > 1 ? `
        <div class="thumb-grid">
          ${p.images.map((img, i) => `
            <img class="thumb-img ${i === 0 ? 'active' : ''}" src="${img}" alt="${p.name} ${i + 1}" width="84" height="84"
              loading="lazy" decoding="async" data-img="${img}" role="button" tabindex="0" aria-label="عرض الصورة ${i + 1} من ${p.images.length}">
          `).join('')}
        </div>` : ''}
    </div>`;
}

function renderInfo(p) {
  const hasColors = p.colors && p.colors.length > 0;
  const hasSizes = p.sizes && p.sizes.length > 0;
  const oos = p.inStock === false;
  const disc = Math.round((1 - p.price / p.originalPrice) * 100);

  const colorsHtml = hasColors ? `
    <div class="option-group">
      <span class="option-label" id="colorLabel">اللون: <span class="chosen" id="colorChosen"></span></span>
      <div class="color-swatch-group" role="group" aria-labelledby="colorLabel">
        ${p.colors.map(c => `
          <button type="button" class="color-swatch ${c.class}${!c.inStock ? ' out-of-stock' : ''}"
            title="${c.name}${!c.inStock ? ' (غير متوفر)' : ''}" aria-label="${c.name}" aria-pressed="false"
            data-color="${c.name}" ${!c.inStock ? 'disabled' : ''}></button>`).join('')}
      </div>
    </div>` : '';

  const sizesHtml = hasSizes ? `
    <div class="option-group">
      <span class="option-label" id="sizeLabel">المقاس</span>
      <div class="chips" role="group" aria-labelledby="sizeLabel">
        ${p.sizes.map(s => `<button type="button" class="chip size-chip" aria-pressed="false" data-size="${s}">${s}</button>`).join('')}
      </div>
    </div>` : '';

  return `
    <div class="product-info">
      <h1 class="product-name">${p.name}</h1>
      <div class="product-prices">
        <span class="product-price-now">${p.price} درهم</span>
        ${disc > 0 ? `<span class="product-price-old">${p.originalPrice} درهم</span><span class="discount-tag">-${disc}%</span>` : ''}
      </div>
      ${colorsHtml}
      ${sizesHtml}
      <div class="stock ${oos ? 'out' : ''}">${oos ? 'نفد المخزون حالياً' : 'متوفر، جاهز للشحن'}</div>
      <div class="qty-row">
        <span>الكمية:</span>
        <div class="qty"><button type="button" id="qtyMinus" aria-label="نقص">-</button><span id="qtyVal">1</span><button type="button" id="qtyPlus" aria-label="زد">+</button></div>
      </div>
      <div class="cta-group">
        <button type="button" class="btn-add-cart" id="addToCartBtn" ${oos ? 'disabled' : ''}><i class="fas fa-shopping-cart"></i> أضف إلى السلة</button>
        <button type="button" class="btn-buy-now" id="buyNowBtn" ${oos ? 'disabled' : ''}><i class="fas fa-bolt"></i> اطلب الآن</button>
      </div>
      <div class="perks">
        <div><i class="fas fa-truck-fast"></i><b>توصيل سريع</b><small>لجميع المدن</small></div>
        <div><i class="fas fa-hand-holding-dollar"></i><b>الدفع عند الاستلام</b><small>كتخلص ملي توصلك</small></div>
        <div><i class="fas fa-circle-check"></i><b>جودة عالية</b><small>مصنوع ليدوم</small></div>
      </div>
      <details class="acc" open><summary>معلومات المنتج <i class="fas fa-chevron-down"></i></summary><div class="acc-body">${p.description}</div></details>
      ${p.showSizeGuide ? `<details class="acc"><summary>دليل المقاسات <i class="fas fa-chevron-down"></i></summary><div class="acc-body">المقاسات المتوفرة: ${p.sizes.join(' / ')}.\nإذا كنت بين مقاسين، نصيحتنا تختار المقاس الأكبر.</div></details>` : ''}
      <details class="acc"><summary>الشحن والدفع <i class="fas fa-chevron-down"></i></summary><div class="acc-body">التوصيل لجميع المدن المغربية.\nالدفع عند الاستلام.\nغادي نتاصلو بيك لتأكيد الطلب قبل الشحن.</div></details>
    </div>`;
}

function notFoundHtml() {
  return `<div style="text-align:center;padding:80px 20px;color:var(--muted)">المنتج غير موجود<br><br><a class="btn-primary" href="shop.html" style="display:inline-flex">العودة للمجموعة</a></div>`;
}

function renderProduct() {
  const id = parseInt(new URLSearchParams(window.location.search).get('id'), 10);
  const p = products.find(x => x.id === id);
  const page = document.getElementById('productPage');
  if (!p) { page.innerHTML = notFoundHtml(); return; }

  currentProduct = p;
  document.title = `${p.name} | WAZIZ store`;
  if (typeof fbq === 'function') {
    fbq('track', 'ViewContent', { content_ids: [p.id], content_name: p.name, content_type: 'product', value: parseInt(p.price, 10), currency: 'MAD' });
  }
  document.querySelector('meta[name="description"]')?.setAttribute('content', p.description.slice(0, 155));

  const others = products.filter(x => x.id !== p.id).slice(0, 4);
  page.innerHTML = `
    <nav class="crumbs" aria-label="breadcrumb"><a href="index.html">الرئيسية</a><span>›</span><a href="shop.html">المجموعة</a><span>›</span><b>${p.name}</b></nav>
    <div class="product-layout">${renderGallery(p)}${renderInfo(p)}</div>
    ${others.length ? `<section class="related"><h2>قد يعجبك أيضاً</h2><div class="grid">${others.map((o, i) => productCardHtml(o, i + 1)).join('')}</div></section>` : ''}`;

  page.querySelectorAll('.thumb-img').forEach(t => t.addEventListener('click', () => switchImage(t.dataset.img, t)));
  initSwipe();
  page.querySelectorAll('.color-swatch:not([disabled])').forEach(s => s.addEventListener('click', () => {
    selectColor(s.dataset.color, s);
    document.getElementById('colorChosen').textContent = s.dataset.color;
  }));
  page.querySelectorAll('.size-chip').forEach(s => s.addEventListener('click', () => selectSize(s.dataset.size, s)));
  const setQty = n => { qty = Math.max(1, Math.min(10, n)); document.getElementById('qtyVal').textContent = qty; };
  document.getElementById('qtyMinus')?.addEventListener('click', () => setQty(qty - 1));
  document.getElementById('qtyPlus')?.addEventListener('click', () => setQty(qty + 1));
  document.getElementById('addToCartBtn')?.addEventListener('click', addToCart);
  document.getElementById('buyNowBtn')?.addEventListener('click', buyNow);
}

document.addEventListener('DOMContentLoaded', () => {
  initCartDrawer();
  renderCart();
  renderProduct();
  initCheckout(
    () => (buyNowItems ? buyNowItems : Cart.get()),
    () => {
      if (!buyNowItems) Cart.clear();
      buyNowItems = null;
    }
  );
});
