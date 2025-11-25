/* app.js
 - Handles products display, cart, modal, theme, and simulated payment flow
 - Uses localStorage keys:
   - bt_products (array)
   - bt_cart (array)
   - bt_theme (string)
*/

const SAMPLE_PRODUCTS = [
  {id:'p1', title:'Floral Summer Dress', price:999, tags:['Women','New','Casual'], img:'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1200&auto=format&fit=crop'},
  {id:'p2', title:'Classic White Tee', price:499, tags:['Men','Casual'], img:'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?q=80&w=1200&auto=format&fit=crop'},
  {id:'p3', title:'Lightweight Denim Jacket', price:1799, tags:['Women','Jackets'], img:'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=1200&auto=format&fit=crop'},
  {id:'p4', title:'Striped Casual Shirt', price:699, tags:['Men','Casual'], img:'https://images.unsplash.com/photo-1530845641273-5e9b2b0d0abb?q=80&w=1200&auto=format&fit=crop'},
  {id:'p5', title:'Elegant Blazer', price:2499, tags:['Women','Jackets'], img:'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?q=80&w=1200&auto=format&fit=crop'},
  {id:'p6', title:'Comfort Hoodie', price:1199, tags:['Men','New'], img:'https://images.unsplash.com/photo-1551854838-9f6d4a0d76d6?q=80&w=1200&auto=format&fit=crop'},
  {id:'p7', title:'Boho Maxi Skirt', price:899, tags:['Women','Casual'], img:'https://images.unsplash.com/photo-1520975680246-1e6c9a1f3c6f?q=80&w=1200&auto=format&fit=crop'},
  {id:'p8', title:'Tailored Chinos', price:1399, tags:['Men'], img:'https://images.unsplash.com/photo-1520975919479-7f67b6b916bd?q=80&w=1200&auto=format&fit=crop'}
];

if(!localStorage.getItem('bt_products')) localStorage.setItem('bt_products', JSON.stringify(SAMPLE_PRODUCTS));
if(!localStorage.getItem('bt_cart')) localStorage.setItem('bt_cart', JSON.stringify([]));

/* THEME */
function initTheme(){
  const t = localStorage.getItem('bt_theme') || 'light';
  document.documentElement.setAttribute('data-theme', t);
  document.getElementById('themeIcon')?.replaceWith(document.getElementById('themeIcon')?.cloneNode(true));
  document.getElementById('themeIcon')?.parentElement && (document.getElementById('themeIcon').textContent = t === 'dark' ? '☀️' : '🌙');
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
  const el = document.getElementById('cartCount');
  if(el) el.textContent = count;
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
  window.scrollTo({top: 420, behavior:'smooth'});
}

function renderProducts(){
  const raw = JSON.parse(localStorage.getItem('bt_products') || '[]');
  const q = (document.getElementById('search')?.value || '').trim().toLowerCase();
  const sort = document.getElementById('sort')?.value || 'popular';
  let items = raw.filter(p=>{
    if(activeTag !== 'All' && !(p.tags||[]).includes(activeTag)) return false;
    if(!q) return true;
    return p.title.toLowerCase().includes(q) || (p.tags||[]).some(t=>t.toLowerCase().includes(q));
  });
  if(sort === 'low') items.sort((a,b)=>a.price-b.price);
  if(sort === 'high') items.sort((a,b)=>b.price-a.price);

  const grid = document.getElementById('grid');
  grid.innerHTML = '';
  items.forEach(p=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <div class="meta">
        <h3>${p.title}</h3>
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
  const p = products.find(x=>x.id===id);
  if(!p) return alert('Product not found');
  const mc = document.getElementById('modalContent');
  mc.innerHTML = `
    <div style="display:flex;gap:18px;align-items:stretch">
      <img src="${p.img}" style="width:48%;border-radius:10px;object-fit:cover">
      <div style="flex:1">
        <h2>${p.title}</h2>
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
  document.getElementById('modal').style.display = 'flex';
}

function closeModal(ev){
  if(ev && ev.target && ev.target.id === 'modal') {
    document.getElementById('modal').style.display = 'none';
    return;
  }
  if(ev && ev.stopPropagation) ev.stopPropagation();
  document.getElementById('modal').style.display = 'none';
}

/* CART actions */
function addToCart(productId){
  const products = JSON.parse(localStorage.getItem('bt_products')||'[]');
  const p = products.find(x=>x.id===productId);
  if(!p) return alert('Product not found');
  const cart = getCart();
  // store each unit as item — grouped later
  cart.push({id:p.id, title:p.title, price:p.price, img:p.img, qty:1});
  saveCart(cart);
  // small confirmation
  toast('Added to cart');
}

function toast(msg){
  // tiny ephemeral message
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
  setTimeout(()=> t.remove(), 1600);
}

function openCart(){
  renderCart();
  document.getElementById('cartDrawer').style.display = 'flex';
}

function closeCart(){
  document.getElementById('cartDrawer').style.display = 'none';
}

function renderCart(){
  const items = getCart();
  const container = document.getElementById('cartItems');
  container.innerHTML = '';
  if(items.length === 0){
    container.innerHTML = '<div class="muted">Your cart is empty</div>';
    document.getElementById('cartTotal').textContent = '₹0';
    updateCartCount();
    return;
  }
  // group by id
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
      <img src="${it.img}">
      <div style="flex:1">
        <div style="font-weight:600">${it.title}</div>
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
  document.getElementById('cartTotal').textContent = `₹${total}`;
  updateCartCount();
}

function removeFromCart(id){
  let cart = getCart();
  // remove all units of that product for simplicity
  cart = cart.filter(i => i.id !== id);
  saveCart(cart);
  renderCart();
}

function clearCart(){
  if(!confirm('Clear cart?')) return;
  saveCart([]);
  renderCart();
}

/* Checkout routing */
function goToPayment(){
  const items = getCart();
  if(items.length === 0) return alert('Your cart is empty');
  // compute total
  const grouped = {};
  items.forEach(it => {
    if(!grouped[it.id]) grouped[it.id] = {...it, qty:0};
    grouped[it.id].qty += it.qty;
  });
  let total = 0;
  Object.values(grouped).forEach(it => total += it.price * it.qty);
  // store summary into localStorage to show on payment page
  localStorage.setItem('bt_checkout', JSON.stringify({items: Object.values(grouped), total}));
  // navigate to payment page
  location.href = 'https://neon-basbousa-5510b8.netlify.app/payment';
}

/* Payment page helpers */
function renderOrderSummary(){
  const summary = JSON.parse(localStorage.getItem('bt_checkout') || '{}');
  const root = document.getElementById('orderSummary');
  if(!root) return;
  if(!summary || !summary.items) return root.innerHTML = '<div class="muted">Nothing to pay — your cart may be empty.</div>';
  let html = '<div><strong>Order summary</strong></div><div style="margin-top:8px">';
  summary.items.forEach(it => {
    html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0"><div><strong>${it.title}</strong><div class="muted tiny">Qty: ${it.qty}</div></div><div>₹${it.price * it.qty}</div></div>`;
  });
  html += `</div><div style="text-align:right;margin-top:10px"><strong>Total: ₹${summary.total}</strong></div>`;
  root.innerHTML = html;
}

async function handlePay(event){
  event.preventDefault();
  const method = document.getElementById('method').value;
  // basic validation
  const name = document.getElementById('name').value.trim();
  const email = document.getElementById('email').value.trim();
  if(!name || !email) return alert('Please enter name and email');

  // In demo mode: simulate a successful payment
  if(method === 'demo'){
    // create fake order record
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
    // clear cart & checkout
    localStorage.removeItem('bt_cart');
    localStorage.removeItem('bt_checkout');
    alert('Payment simulated — success! Thank you for your order.');
    location.href = 'index.html';
    return;
  }

  // For real providers, your app must call your BACKEND to create an order/session.
  // Stripe example (server): create Checkout Session -> return sessionId -> on client call stripe.redirectToCheckout({ sessionId }).
  // Razorpay example (server): create Order -> return order_id -> open Razorpay checkout with the order id & key.
  // Here we just show instructions:
  if(method === 'stripe' || method === 'razorpay'){
    alert('This demo page cannot perform real payments. To enable real payments:\n\n1) Implement a server endpoint to create a payment session/order.\n2) From client, call the endpoint, receive the session/order ID.\n3) Redirect user to provider checkout (Stripe) or open Razorpay Checkout with returned order id.\n\nAfter integrating server-side you can replace this message flow with an actual redirect.');
    return;
  }

  return false;
}

/* Load payment page behaviour when loaded */
document.addEventListener('DOMContentLoaded', ()=>{
  // if on index page, make sure search input triggers render, and set cart count
  updateCartCount();
  initTheme();
  // if order summary element exists, call renderOrderSummary
  if(document.getElementById('orderSummary')) renderOrderSummary();
  // product detail page support: if productId in query param, show modal
  const params = new URLSearchParams(location.search);
  const pid = params.get('product');
  if(pid) viewProductModal(pid);
});
