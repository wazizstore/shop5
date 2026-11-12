/* WAZIZ store — product card renderer (home + shop + related) */
const esc = s => String(s).replace(/[&<>"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

export function productCardHtml(p, index) {
  const disc = Math.round((1 - p.price / p.originalPrice) * 100);
  const oos = p.inStock === false;
  return `
    <a class="pcard reveal" style="animation-delay:${index * 0.06}s" href="product.html?id=${p.id}" aria-label="${esc(p.name)} — ${p.price} درهم">
      <div class="pcard-img">
        <img src="${p.images[0]}" alt="${esc(p.name)}" width="400" height="420" loading="${index === 0 ? 'eager' : 'lazy'}" decoding="async">
        ${oos ? '<span class="pcard-badge oos">نفد المخزون</span>' : (disc > 0 ? `<span class="pcard-badge">تخفيض -${disc}%</span>` : '')}
      </div>
      <div class="pcard-body">
        <div class="pcard-name">${esc(p.name)}</div>
        <div class="pcard-desc">${esc(p.description)}</div>
        <div class="pcard-price">
          <span class="price-now">${p.price} درهم</span>
          ${disc > 0 ? `<span class="price-old">${p.originalPrice} درهم</span>` : ''}
        </div>
      </div>
      <span class="pcard-btn">عرض المنتج</span>
    </a>`;
}

export function renderGrid(containerId, products) {
  const grid = document.getElementById(containerId);
  if (!grid) return;
  grid.innerHTML = products.map((p, i) => productCardHtml(p, i)).join('');
}
