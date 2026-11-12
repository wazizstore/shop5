import { products } from './data.js';
import { renderGrid } from './product-grid.js';
import { initCartDrawer, renderCart } from './ui.js';

document.addEventListener('DOMContentLoaded', () => {
  initCartDrawer();
  renderCart();
  renderGrid('featuredGrid', products);
});
