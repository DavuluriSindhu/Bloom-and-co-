/* app.js — IMAGE-VALIDATED version
 - This file validates product image URLs on load and replaces any broken URLs
   with a reliable fallback image, so no product tiles show broken image icons.
 - Keeps all previous app behavior (cart, modal, theme, checkout simulation).
*/

// sample products (feel free to swap titles/prices/tags but leave ids stable)
const SAMPLE_PRODUCTS = [
  { id: 'p1', title: 'Floral Summer Dress', price: 999, tags: ['Women','New','Casual'],
    img: 'https://images.unsplash.com/photo-1520975680246-1e6c9a1f3c6f?auto=format&fit=crop&w=1400&q=80' },

  { id: 'p2', title: 'Classic White Tee', price: 499, tags: ['Men','Casual'],
    img: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?auto=format&fit=crop&w=1400&q=80' },

  { id: 'p3', title: 'Lightweight Denim Jacket', price: 1799, tags: ['Women','Jackets'],
    img: 'https://images.unsplash.com/photo-1490481651871-ab68de25d43d?auto=format&fit=crop&w=1400&q=80' },

  { id: 'p4', title: 'Striped Casual Shirt', price: 699, tags: ['Men','Casual'],
    img: 'https://images.unsplash.com/photo-1497339100215-1e3b2b0b2f76?auto=format&fit=crop&w=1400&q=80' },

  { id: 'p5', title: 'Elegant Blazer', price: 2499, tags: ['Women','Jackets'],
    img: 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?auto=format&fit=crop&w=1400&q=80' },

  { id: 'p6', title: 'Comfort Hoodie', price: 1199, tags: ['Men','New'],
    img: 'https://images.unsplash.com/photo-1551854838-9f6d4a0d76d6?auto=format&fit=crop&w=1400&q=80' },

  { id: 'p7', title: 'Boho Maxi Skirt', price: 899, tags: ['Women','Casual'],
    img: 'https://images.unsplash.com/photo-1520975680246-1e6c9a1f3c6f?auto=format&fit=crop&w=1400&q=80' },

  { id: 'p8', title: 'Tailored Chinos', price: 1399, tags: ['Men'],
    img: 'https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1400&q=80' }
];

// a reliable fallback image (used if any product URL fails)
const FALLBACK_IMG = 'https://images.unsplash.com/photo-1520975919479-7f67b6b916bd?auto=format&fit=crop&w=1400&q=80';

// validate a single image url; resolves with the (possibly replaced) url
function validateImageUrl(url, timeout = 5000) {
  return new Promise((resolve) => {
    const img = new Image();
    let done = false;
    const timer = setTimeout(()=> {
      if(done) return;
      done = true;
      resolve(FALLBACK_IMG);
    }, timeout);

    img.onload = () => {
      if(done) return;
      done = true;
      clearTimeout(timer);
      resolve(url); // load succeeded
    };
    img.onerror = () => {
      if(done) return;
      done = true;
      clearTimeout(timer);
      resolve(FALLBACK_IMG); // broken, use fallback
    };
    // start load
    img.src = url;
    // also set srcset and crossOrigin could be added but not necessary
  });
}

// validate all product image urls then persist products to localStorage
async function validateAndStoreProducts(products) {
  const validated = [];
  for (const p of products) {
    try {
      const goodUrl = await validateImageUrl(p.img);
      validated.push({ ...p, img: goodUrl });
    } catch (e) {
      // on unexpected error, push with fallback
      validated.push({ ...p, img: FALLBACK_IMG });
    }
  }
  localStorage.setItem('bt_products', JSON.stringify(validated));
  return validated;
}

/* Initialize products & other data only after image validation */
(async function initProducts() {
  // if products already exist in localStorage, keep them (but optionally revalidate)
  // We'll revalidate and update localStorage each load to guard against link rot.
  const existing = JSON.parse(localStorage.getItem('bt_products') || 'null');
  const toValidate = existing && Array.isArray(existing) && existing.length ? existing : SAMPLE_PRODUCTS;
  // validate images and store
  try {
    await validateAndStoreProducts(toValidate);
  } catch(e){
    // fallback strong guarantee
    localStorage.setItem('bt_products', JSON.stringify(SAMPLE_PRODUCTS.map(p=>({...p, img:FALLBACK_IMG}))));
  }
  // ensure cart and orders are present
  if(!localStorage.getItem('bt_cart')) localStorage.setItem('bt_cart', JSON.stringify([]));
  if(!localStorage.getItem('bt_orders')) localStorage.setItem('bt_orders', JSON.stringify([]));
})();

/* ========== Below is the original app logic (unchanged) ========== */

/* THEME */
function initTheme(){
  const t = localStorage.getItem('bt_theme') || 'light';
  document.documentElement.setAttribute('data-theme', t);
  const icon = document.getElementById('themeIcon');
  if(icon) icon.textContent = t === 'dark' ? '☀️' : '🌙';
}
function toggleTheme(){
  const cur = document.documentElement.getAtt
