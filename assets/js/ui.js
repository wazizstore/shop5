/* WAZIZ SHOP — Shared UI: toast notifications + cart drawer */
import { Cart } from './cart.js';

export function showToast(msg, type = '') {
  const t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.className = type;
  t.style.display = 'block';
  clearTimeout(showToast._timer);
  showToast._timer = setTimeout(() => { t.style.display = 'none'; }, 3000);
}

export function updateBadge() {
  const badge = document.getElementById('cartBadge');
  if (badge) badge.textContent = Cart.count();
}

export function toggleCart() {
  document.getElementById('cartDrawer')?.classList.toggle('open');
  document.getElementById('cartOverlay')?.classList.toggle('open');
  renderCart();
}

export function renderCart() {
  const body = document.getElementById('cartBody');
  const foot = document.getElementById('cartFoot');
  if (!body || !foot) return;

  const cart = Cart.get();

  if (!cart.length) {
    body.innerHTML = `<div class="cart-empty"><i class="fas fa-shopping-bag" aria-hidden="true"></i>السلة فارغة</div>`;
    foot.style.display = 'none';
    return;
  }

  body.innerHTML = cart.map((item, idx) => `
    <div class="cart-item">
      <img src="${item.img}" alt="${item.name}" width="50" height="50" loading="lazy" decoding="async">
      <div class="cart-item-info">
        <div class="cart-item-name">${item.name}</div>
        ${(item.color || item.size) ? `<div class="cart-item-meta">${[item.color, item.size].filter(Boolean).join(' · ')}</div>` : ''}
        <div class="cart-item-price">${item.price} درهم</div>
      </div>
      <button class="cart-item-remove" type="button" aria-label="حذف ${item.name} من السلة" data-idx="${idx}">
        <i class="fas fa-trash-alt" aria-hidden="true"></i>
      </button>
    </div>
  `).join('');

  body.querySelectorAll('.cart-item-remove').forEach(btn => {
    btn.addEventListener('click', () => {
      Cart.remove(Number(btn.dataset.idx));
      updateBadge();
      renderCart();
    });
  });

  document.getElementById('cartTotal').textContent = Cart.total() + ' درهم';
  foot.style.display = 'block';
}

/** Wires the cart-toggle and overlay-close buttons that exist on every page. */
export function initCartDrawer() {
  document.querySelectorAll('[data-action="toggle-cart"]').forEach(el =>
    el.addEventListener('click', toggleCart)
  );
  document.getElementById('cartOverlay')?.addEventListener('click', toggleCart);
  updateBadge();
}
