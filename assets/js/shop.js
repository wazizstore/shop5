import { products } from './data.js';
import { renderGrid } from './product-grid.js';
import { initCartDrawer, renderCart } from './ui.js';
import { Cart } from './cart.js';
import { initCheckout } from './checkout.js';

document.addEventListener('DOMContentLoaded', () => {
  initCartDrawer();
  renderCart();
  renderGrid('shopGrid', products);

  initCheckout(
    () => Cart.get(),
    () => Cart.clear()
  );
});
