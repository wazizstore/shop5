/* WAZIZ SHOP — Cart state (single source of truth, used by every page) */

const STORAGE_KEY = 'wz_cart';

function read() {
  try {
    return JSON.parse(sessionStorage.getItem(STORAGE_KEY) || '[]');
  } catch {
    return [];
  }
}

function write(cart) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
}

export const Cart = {
  get() {
    return read();
  },
  count() {
    return read().length;
  },
  total() {
    return read().reduce((sum, item) => sum + parseInt(item.price, 10), 0);
  },
  add(item) {
    const cart = read();
    cart.push(item);
    write(cart);
    return cart;
  },
  remove(index) {
    const cart = read();
    cart.splice(index, 1);
    write(cart);
    return cart;
  },
  clear() {
    write([]);
  }
};
