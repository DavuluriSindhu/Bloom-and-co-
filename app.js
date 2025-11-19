/* app.js (UPDATED image URLs)
 - Replaced product image links with stable Unsplash URLs so images load reliably.
 - Keeps the same features: products display, cart, modal, theme, simulated payment.
 - LocalStorage keys used:
    - bt_products (array)
    - bt_cart (array)
    - bt_checkout (object for checkout summary)
    - bt_orders (array)
    - bt_theme (string)
*/

const SAMPLE_PRODUCTS = [
  { id: 'p1', title: 'Floral Summer Dress', price: 999, tags: ['Women','New','Casual'],
    img: 'https://images.unsplash.com/photo-1520975680246-1e6c9a1f3c6f?q=80&w=1400&auto=format&fit=crop' },

  { id: 'p2', title: 'Classic White Tee', price: 499, tags: ['Men','Casual'],
    img: 'https://images.unsplash.com/photo-1512436991641-6745cdb1723f?q=80&w=1400&auto=format&fit=crop' },

  { id: 'p3', title: 'Lightweight Denim Jacket', price: 1799, tags: ['Women','Jackets'],
    img: 'https://images.unsplash.com/photo-1520975919479-7f67b6b916bd?q=80&w=1400&auto=format&fit=crop' },

  { id: 'p4', title: 'Striped Casual Shirt', price: 699, tags: ['Men','Casual'],
    img: 'https://images.unsplash.com/photo-1497339100215-1e3b2b0b2f76?q=80&w=1400&auto=format&fit=crop' },

  { id: 'p5', title: 'Elegant Blazer', price: 2499, tags: ['Women','Jackets'],
    img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1400&auto=format&fit=crop' },

  { id: 'p6', title: 'Comfort Hoodie', price: 1199, tags: ['Men','New'],
    img: 'https://images.unsplash.com/photo-1541099649105-1d9a1f4b8f5d?q=80&w=1400&auto=format&fit=crop' },

  { id: 'p7', title: 'Boho Maxi Skirt', price: 899, tags: ['Women','Casual'],
    img: 'https://images.unsplash.com/photo-1495121605193-b116b5b09b6a?q=80&w=1400&auto=format&fit=crop' },

  { id: 'p8', title: 'Tailored Chinos', price: 1399, tags: ['Men'],
    img: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?q=80&w=1400&auto=format&fit=crop' }
];

// Initialize products & cart if missing
if (!localStorage.getItem('bt_products')) localStorage.setItem('bt_products', JSON.stringify(SAMPLE_PRODUCTS));
if (!localStorage.getItem('bt_cart')) localStorage.setItem('bt_cart', JSON.stringify([]));
if (!localStorage.getItem('bt_orders')) localStorage.setItem('bt_orders', JSON.stringify([]));

/* THEME */
function initTheme(){
  const t = localStorage.getItem('bt_theme') || 'light';
  document.documentElement.setAttribute('data-theme', t);
  const icon = document.getElementById('themeIcon');
  if(icon) icon.textContent = t === 'dark' ? '☀️' : '🌙';
}
function toggleTheme(){
  const cur = document.documentElement.getAttribute('data-theme') || 'light';
  const next = cur === 'dark' ? 'light' : 'dark';
  localStorage.setItem('bt_theme', next);
  document.documentElement.setAttribute('data-theme', next);
  initTheme();
}

/* CART helpers */
function getCart(){ return JSON.parse(localStorage.getItem('bt_cart') || '[]'); }
function saveCart(cart){ localStorage.setItem('bt_cart', JSON.stringify(cart)); updateCartCount(); }
function updateCartCount(){
  const count = getCart().length;
  const el1 = document.getElementById('cartCount');
  const el2 = document.getElementById('cartCount2'); // some pages use different IDs
  if(el1) el1.textContent = count;
  if(el2) el2.textContent = count;
}

/* SITE INIT */
function initSite(){
  initTheme();
  renderProducts();
  updateCartCount();
}

/* Products UI */
let activeTag = 'All';
function applyTag(tag){
  activeTag = tag;
  renderProducts();
  window.scrollTo({ top: 420, behavior: 'smooth' });
}

function renderProducts(){
  const raw = JSON.parse(localStorage.getItem('bt_products') || '[]');
  const qEl = document.getElementById('search');
  const q = qEl ? (qEl.value || '').trim().toLowerCase() : '';
  const sortEl = document.getElementById('sort');
  const sort = sortEl ? sortEl.value : 'popular';

  let items = raw.filter(p => {
    if (activeTag !== 'All' && !(p.tags || []).includes(activeTag)) return false;
    if (!q) return true;
    return p.title.toLowerCase().includes(q) || (p.tags || []).some(t => t.toLowerCase().includes(q));
  });

  if (sort === 'low') items.sort((a,b) => a.price - b.price);
  if (sort === 'high') items.sort((a,b) => b.price - a.price);

  const grid = document.getElementById('grid');
  if (!grid) return;
  grid.innerHTML = '';

  items.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    // safe image element with onerror fallback
    const safeImg = `<img src="${p.img}" alt="${escapeHtml(p.title)}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1520975919479-7f67b6b916bd?q=80&w=1400&auto=format&fit=crop'">`;
    card.innerHTML = `
      ${safeImg}
      <div class="meta">
        <h3>${escapeHtml(p.title)}</h3>
        <div class="muted tiny">${(p.tags||[]).join(' • ')}</div>
        <div style="display:flex;justify-content:space-between;align-items:center;margin-top:8px">
          <div class="price">₹${p.price}</div>
          <div style="display:flex;gap:8px">
            <button class="btn ghost" onclick="viewProductModal('${p.id}')">View</button>
            <button class="btn" onclick="addToCart('${p.id}')">Add</button>
          </div>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

/* Product modal */
function viewProductModal(id){
  const products = JSON.parse(localStorage.getItem('bt_products') || '[]');
  const p = products.find(x => x.id === id);
  if (!p) return alert('Product not found');
  const mc = document.getElementById('modalContent');
  if(!mc) return;
  mc.innerHTML = `
    <div style="display:flex;gap:18px;align-items:stretch">
      <img src="${p.img}" alt="${escapeHtml(p.title)}" style="width:48%;border-radius:10px;object-fit:cover" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1520975919479-7f67b6b916bd?q=80&w=1400&auto=format&fit=crop'">
      <div style="flex:1">
        <h2>${escapeHtml(p.title)}</h2>
        <div class="muted tiny">${(p.tags||[]).join(' • ')}</div>
        <p style="margin-top:12px;line-height:1.6">Soft fabric, comfortable fit, great for daily wear or a day out. Sizes available: S, M, L.</p>
        <div style="margin-top:14px"><strong class="price">₹${p.price}</strong></div>
        <div style="display:flex;gap:10px;margin-top:18px">
          <button class="btn" onclick="addToCart('${p.id}'); closeModal()">${'Add to cart'}</button>
          <button class="btn ghost" onclick="closeModal()">Close</button>
        </div>
      </div>
    </div>
  `;
  const modal = document.getElementById('modal');
  if(modal) modal.style.display = 'flex';
}

function closeModal(ev){
  if(ev && ev.target && ev.target.id === 'modal'){ document.getElementById('modal').style.display = 'none'; return; }
  if(ev && ev.stopPropagation) ev.stopPropagation();
  const modal = document.getElementById('modal');
  if(modal) modal.style.display = 'none';
}

/* CART actions */
function addToCart(productId){
  const products = JSON.parse(localStorage.getItem('bt_products')||'[]');
  const p = products.find(x=>x.id===productId);
  if(!p) return alert('Product not found');
  const cart = getCart();
  cart.push({ id: p.id, title: p.title, price: p.price, img: p.img, qty: 1 });
  saveCart(cart);
  toast('Added to cart');
}

function toast(msg){
  const t = document.createElement('div');
  t.style.position = 'fixed';
  t.style.right = '18px';
  t.style.bottom = '18px';
  t.style.padding = '10px 14px';
  t.style.background = 'linear-gradient(90deg,#ff7aa2,#5ad0e6)';
  t.style.color = '#fff';
  t.style.borderRadius = '10px';
  t.style.boxShadow = '0 10px 30px rgba(11,21,35,0.2)';
  t.style.zIndex = 120;
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(()=> t.remove(), 1500);
}

function openCart(){
  renderCart();
  const panel = document.getElementById('cartDrawer');
  if(panel) panel.style.display = 'flex';
}

function closeCart(){
  const panel = document.getElementById('cartDrawer');
  if(panel) panel.style.display = 'none';
}

function renderCart(){
  const items = getCart();
  const container = document.getElementById('cartItems');
  if(!container) return;
  container.innerHTML = '';
  if(items.length === 0){
    container.innerHTML = '<div class="muted">Your cart is empty</div>';
    const totalEl = document.getElementById('cartTotal');
    if(totalEl) totalEl.textContent = '₹0';
    updateCartCount();
    return;
  }
  const grouped = {};
  items.forEach(it => {
    if(!grouped[it.id]) grouped[it.id] = {...it, qty:0};
    grouped[it.id].qty += it.qty;
  });
  let total = 0;
  Object.values(grouped).forEach(it => {
    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${it.img}" alt="${escapeHtml(it.title)}" onerror="this.onerror=null;this.src='https://images.unsplash.com/photo-1520975919479-7f67b6b916bd?q=80&w=1400&auto=format&fit=crop'">
      <div style="flex:1">
        <div style="font-weight:600">${escapeHtml(it.title)}</div>
        <div class="muted tiny">Qty: ${it.qty}</div>
      </div>
      <div style="text-align:right">
        <div style="font-weight:700">₹${it.price * it.qty}</div>
        <div style="margin-top:8px"><button class="btn ghost" onclick="removeFromCart('${it.id}')">Remove</button></div>
      </div>
    `;
    container.appendChild(div);
    total += it.price * it.qty;
  });
  const totalEl = document.getElementById('cartTotal');
  if(totalEl) totalEl.textContent = `₹${total}`;
  updateCartCount();
}

function removeFromCart(id){
  let cart = getCart();
  cart = cart.filter(i => i.id !== id);
  saveCart(cart);
  renderCart();
}

function clearCart(){
  if(!confirm('Clear cart?')) return;
  saveCart([]);
  renderCart();
}

/* Checkout */
function goToPayment(){
  const items = getCart();
  if(items.length === 0) return alert('Your cart is empty');
  const grouped = {};
  items.forEach(it => {
    if(!grouped[it.id]) grouped[it.id] = {...it, qty:0};
    grouped[it.id].qty += it.qty;
  });
  let total = 0;
  Object.values(grouped).forEach(it => total += it.price * it.qty);
  localStorage.setItem('bt_checkout', JSON.stringify({ items: Object.values(grouped), total }));
  location.href = 'payment.html';
}

/* Payment page helpers */
function renderOrderSummary(){
  const summary = JSON.parse(localStorage.getItem('bt_checkout') || '{}');
  const root = document.getElementById('orderSummary');
  if(!root) return;
  if(!summary || !summary.items) return root.innerHTML = '<div class="muted">Nothing to pay — your cart may be empty.</div>';
  let html = '<div><strong>Order summary</strong></div><div style="margin-top:8px">';
  summary.items.forEach(it => {
    html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0"><div><strong>${escapeHtml(it.title)}</strong><div class="muted tiny">Qty: ${it.qty}</div></div><div>₹${it.price * it.qty}</div></div>`;
  });
  html += `</div><div style="text-align:right;margin-top:10px"><strong>Total: ₹${summary.total}</strong></div>`;
  root.innerHTML = html;
}

function handlePay(event){
  if(event && event.preventDefault) event.preventDefault();
  const methodEl = document.getElementById('method');
  const nameEl = document.getElementById('name');
  const emailEl = document.getElementById('email');
  const method = methodEl ? methodEl.value : 'demo';
  const name = nameEl ? nameEl.value.trim() : '';
  const email = emailEl ? emailEl.value.trim() : '';
  if(!name || !email) return alert('Please enter name and email');

  if(method === 'demo'){
    const checkout = JSON.parse(localStorage.getItem('bt_checkout') || '{}');
    const orders = JSON.parse(localStorage.getItem('bt_orders') || '[]');
    const order = {
      id: 'ORD' + Date.now(),
      created: new Date().toISOString(),
      name, email,
      method: 'demo',
      status: 'paid',
      amount: checkout.total || 0,
      items: checkout.items || []
    };
    orders.push(order);
    localStorage.setItem('bt_orders', JSON.stringify(orders));
    localStorage.removeItem('bt_cart');
    localStorage.removeItem('bt_checkout');
    alert('Payment simulated — success! Thank you for your order.');
    location.href = 'index.html';
    return;
  }

  // For production integrations (Stripe / Razorpay), you must create an order/session server-side.
  alert('This demo cannot perform real payments. Integrate a backend to create sessions/orders for Stripe or Razorpay.');
  return false;
}

/* Utilities */
function escapeHtml(text){
  if(!text) return '';
  return text.replace(/[&<>"']/g, function(m){ return { '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;' }[m] });
}

/* Load-time behavior */
document.addEventListener('DOMContentLoaded', ()=>{
  // update cart count if present
  updateCartCount();
  initTheme();

  // render order summary if on payment page
  if(document.getElementById('orderSummary')) renderOrderSummary();

  // product detail modal if product query exists (optional)
  const params = new URLSearchParams(location.search);
  const pid = params.get('product') || params.get('id');
  if(pid) viewProductModal(pid);
});
