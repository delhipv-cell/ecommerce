// =============================================
//   LUXE — E-Commerce JavaScript
// =============================================

// ---- PRODUCT DATA ----
const products = [
  {
    id: 1, category: 'women',
    brand: 'Studio LUXE', name: 'Silk Slip Dress',
    price: 4999, originalPrice: 7999,
    badge: 'sale', color: 'linear-gradient(160deg, #d4a8a8 0%, #b07070 100%)'
  },
  {
    id: 2, category: 'women',
    brand: 'Studio LUXE', name: 'Linen Blazer',
    price: 6499, originalPrice: null,
    badge: 'new', color: 'linear-gradient(160deg, #c8bca8 0%, #9a8c78 100%)'
  },
  {
    id: 3, category: 'men',
    brand: 'LUXE Man', name: 'Oxford Shirt',
    price: 2999, originalPrice: null,
    badge: null, color: 'linear-gradient(160deg, #8fa0b4 0%, #5a6e82 100%)'
  },
  {
    id: 4, category: 'men',
    brand: 'LUXE Man', name: 'Merino Sweater',
    price: 5499, originalPrice: 7499,
    badge: 'sale', color: 'linear-gradient(160deg, #8a8070 0%, #5c5040 100%)'
  },
  {
    id: 5, category: 'accessories',
    brand: 'LUXE Edit', name: 'Leather Tote Bag',
    price: 8999, originalPrice: 11999,
    badge: 'sale', color: 'linear-gradient(160deg, #b8a080 0%, #8a6a40 100%)'
  },
  {
    id: 6, category: 'women',
    brand: 'Studio LUXE', name: 'Wide Leg Trousers',
    price: 3999, originalPrice: null,
    badge: 'new', color: 'linear-gradient(160deg, #c0b4a0 0%, #8c7860 100%)'
  },
  {
    id: 7, category: 'men',
    brand: 'LUXE Man', name: 'Tailored Chinos',
    price: 3499, originalPrice: null,
    badge: null, color: 'linear-gradient(160deg, #9aaa8a 0%, #6a7a5a 100%)'
  },
  {
    id: 8, category: 'accessories',
    brand: 'LUXE Edit', name: 'Silk Scarf',
    price: 1999, originalPrice: 2999,
    badge: 'sale', color: 'linear-gradient(160deg, #d4b0c0 0%, #a08090 100%)'
  },
];

// ---- CART STATE ----
let cart = JSON.parse(localStorage.getItem('luxe-cart') || '[]');

// ---- UTILITY ----
function formatPrice(p) {
  return '₹' + p.toLocaleString('en-IN');
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('visible');
  setTimeout(() => t.classList.remove('visible'), 2500);
}

function saveCart() {
  localStorage.setItem('luxe-cart', JSON.stringify(cart));
}

// ---- RENDER PRODUCTS ----
function renderProducts(filter = 'all') {
  const grid = document.getElementById('products-grid');
  const filtered = filter === 'all' ? products : products.filter(p => p.category === filter);
  grid.innerHTML = filtered.map((p, i) => {
    const discount = p.originalPrice
      ? Math.round((1 - p.price / p.originalPrice) * 100)
      : null;
    return `
      <div class="product-card" style="animation-delay:${i * 0.07}s" data-id="${p.id}">
        <div class="product-img-wrap">
          <div class="product-img" style="background:${p.color}"></div>
          ${p.badge ? `<span class="product-badge ${p.badge}">${p.badge === 'new' ? 'New' : 'Sale'}</span>` : ''}
          <div class="product-actions">
            <button class="product-action-btn" onclick="addToCart(${p.id})" title="Add to Cart">🛍</button>
            <button class="product-action-btn" onclick="showToast('Added to wishlist!')" title="Wishlist">♡</button>
          </div>
        </div>
        <div class="product-info">
          <p class="product-brand">${p.brand}</p>
          <h3 class="product-name">${p.name}</h3>
          <div class="product-price">
            <span class="price-current">${formatPrice(p.price)}</span>
            ${p.originalPrice ? `<span class="price-original">${formatPrice(p.originalPrice)}</span>` : ''}
            ${discount ? `<span class="price-discount">-${discount}%</span>` : ''}
          </div>
        </div>
      </div>
    `;
  }).join('');
}

// ---- FILTER TABS ----
document.querySelectorAll('.filter-tab').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-tab').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    renderProducts(btn.dataset.filter);
  });
});

// ---- CART FUNCTIONS ----
function addToCart(id) {
  const product = products.find(p => p.id === id);
  if (!product) return;
  const existing = cart.find(c => c.id === id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({ ...product, qty: 1 });
  }
  saveCart();
  updateCartUI();
  showToast(`${product.name} added to cart!`);
}

function removeFromCart(id) {
  cart = cart.filter(c => c.id !== id);
  saveCart();
  updateCartUI();
}

function changeQty(id, delta) {
  const item = cart.find(c => c.id === id);
  if (!item) return;
  item.qty += delta;
  if (item.qty <= 0) removeFromCart(id);
  else {
    saveCart();
    updateCartUI();
  }
}

function clearCart() {
  cart = [];
  saveCart();
  updateCartUI();
}

function updateCartUI() {
  const count = cart.reduce((s, c) => s + c.qty, 0);
  const total = cart.reduce((s, c) => s + c.price * c.qty, 0);

  // Count badge
  const badge = document.getElementById('cart-count');
  badge.textContent = count;
  badge.classList.toggle('visible', count > 0);

  // Sidebar header count
  document.getElementById('cart-item-count').textContent = count;

  // Total
  document.getElementById('cart-total').textContent = formatPrice(total);

  // Items
  const itemsEl = document.getElementById('cart-items');
  const footerEl = document.getElementById('cart-footer');

  if (cart.length === 0) {
    itemsEl.innerHTML = `
      <div class="cart-empty">
        <div class="empty-icon">🛍️</div>
        <p>Your cart is empty</p>
        <a href="#products" class="btn btn-primary" onclick="closeCart()">Start Shopping</a>
      </div>`;
    footerEl.style.display = 'none';
  } else {
    itemsEl.innerHTML = cart.map(item => `
      <div class="cart-item">
        <div class="cart-item-img" style="background:${item.color}"></div>
        <div class="cart-item-info">
          <div class="cart-item-name">${item.name}</div>
          <div class="cart-item-price">${formatPrice(item.price)}</div>
          <div class="cart-item-qty">
            <button class="qty-btn" onclick="changeQty(${item.id}, -1)">−</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn" onclick="changeQty(${item.id}, 1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeFromCart(${item.id})">✕</button>
      </div>
    `).join('');
    footerEl.style.display = 'block';
  }
}

// ---- CART SIDEBAR OPEN/CLOSE ----
function openCart() {
  document.getElementById('cart-sidebar').classList.add('open');
  document.getElementById('cart-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeCart() {
  document.getElementById('cart-sidebar').classList.remove('open');
  document.getElementById('cart-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

document.getElementById('cart-toggle').addEventListener('click', openCart);
document.getElementById('cart-close').addEventListener('click', closeCart);
document.getElementById('cart-overlay').addEventListener('click', closeCart);

// ---- SEARCH TOGGLE ----
const searchBar = document.getElementById('search-bar');
document.getElementById('search-toggle').addEventListener('click', () => {
  searchBar.classList.toggle('open');
  if (searchBar.classList.contains('open')) {
    document.getElementById('search-input').focus();
  }
});
document.getElementById('search-close').addEventListener('click', () => {
  searchBar.classList.remove('open');
});

// ---- HAMBURGER / MOBILE NAV ----
const hamburger = document.getElementById('hamburger');
const nav = document.getElementById('nav');
const mobileOverlay = document.getElementById('mobile-overlay');

hamburger.addEventListener('click', () => {
  hamburger.classList.toggle('open');
  nav.classList.toggle('open');
  mobileOverlay.classList.toggle('active');
  document.body.style.overflow = nav.classList.contains('open') ? 'hidden' : '';
});

mobileOverlay.addEventListener('click', () => {
  hamburger.classList.remove('open');
  nav.classList.remove('open');
  mobileOverlay.classList.remove('active');
  document.body.style.overflow = '';
});

// Close mobile nav on link click
nav.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    hamburger.classList.remove('open');
    nav.classList.remove('open');
    mobileOverlay.classList.remove('active');
    document.body.style.overflow = '';
  });
});

// ---- HEADER SCROLL EFFECT ----
const header = document.getElementById('header');
window.addEventListener('scroll', () => {
  header.classList.toggle('scrolled', window.scrollY > 20);
});

// ---- NEWSLETTER SUBMIT ----
function handleNewsletterSubmit(e) {
  e.preventDefault();
  const input = e.target.querySelector('input');
  showToast('Thank you for subscribing! 🎉');
  input.value = '';
}

// ---- INTERSECTION OBSERVER (scroll animations) ----
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.style.opacity = '1';
      entry.target.style.transform = 'translateY(0)';
    }
  });
}, { threshold: 0.1 });

// observe section children
document.querySelectorAll('.cat-card, .testi-card, .feature, .section-header').forEach(el => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(20px)';
  el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
  observer.observe(el);
});

// ---- INIT ----
renderProducts();
updateCartUI();
