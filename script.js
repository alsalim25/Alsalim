/* بسيط وعملي - JS لإدارة المنتجات، السلة، وواجهة التسجيل */
const products = [
  { id: 'p1', category:'pigeon', title:'خلطة حمام 25كغ', price:42000, weight:'25 كغ', img:'https://via.placeholder.com/400x300?text=خلطة+حمام' },
  { id: 'p2', category:'ornamental', title:'أعلاف طيور زينة 1كغ', price:8000, weight:'1 كغ', img:'https://via.placeholder.com/400x300?text=طيور+زينة' },
  { id: 'p3', category:'mixes', title:'خلطة بروتين عالية 25كغ', price:52000, weight:'25 كغ', img:'https://via.placeholder.com/400x300?text=خلطة+بروتين' },
  { id: 'p4', category:'offers', title:'عرض: 2x خلطة حمام (25كغ)', price:80000, weight:'50 كغ', img:'https://via.placeholder.com/400x300?text=عرض' }
];

const $ = sel => document.querySelector(sel);
const $$ = sel => document.querySelectorAll(sel);

document.addEventListener('DOMContentLoaded', ()=> {
  // year
  document.getElementById('year').textContent = new Date().getFullYear();

  // init
  renderProducts(products);
  initSearch();
  initFilters();
  initCart();
  initAuth();
  initLang();
  bindCTAs();
});

/* --------- منتجات --------- */
function renderProducts(list){
  const grid = document.getElementById('productsGrid');
  grid.innerHTML = '';
  list.forEach(p=>{
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <h4>${p.title}</h4>
      <div>${p.weight}</div>
      <div class="price">${formatCurrency(p.price)} د.ع</div>
      <div class="actions">
        <button class="btn add-to-cart" data-id="${p.id}">أضف للسلة</button>
        <button class="btn" onclick="showQuickInfo('${p.id}')">تفاصيل</button>
      </div>
    `;
    grid.appendChild(card);
  });

  // bind add-to-cart
  $$('.add-to-cart').forEach(b=>{
    b.addEventListener('click', e=>{
      const id = e.currentTarget.dataset.id;
      addToCart(id,1);
    });
  });
}

/* --------- بحث وفلتر --------- */
function initSearch(){
  $('#search').addEventListener('input', (e)=>{
    const q = e.target.value.trim().toLowerCase();
    const filtered = products.filter(p=> p.title.toLowerCase().includes(q) || p.category.includes(q));
    renderProducts(filtered.length ? filtered : products);
  });
}

function initFilters(){
  $('#filterCategory').addEventListener('change', (e)=>{
    const val = e.target.value;
    document.querySelectorAll('.main-nav a').forEach(a=> a.classList.remove('active'));
    if(val === 'all') renderProducts(products);
    else renderProducts(products.filter(p=>p.category === val));
  });

  // nav links filter
  $$('.main-nav a').forEach(a=>{
    a.addEventListener('click', (ev)=>{
      ev.preventDefault();
      const cat = a.dataset.cat || 'all';
      if(cat === 'all') { $('#filterCategory').value = 'all'; renderProducts(products); }
      else { $('#filterCategory').value = cat; renderProducts(products.filter(p=>p.category === cat)); }
    });
  });
}

/* --------- سلة التسوق --------- */
function initCart(){
  // restore cart
  let cart = JSON.parse(localStorage.getItem('cart')||'{}');
  updateCartUI(cart);

  $('#cartBtn').addEventListener('click', ()=> {
    $('#cartSidebar').classList.toggle('hidden');
    $('#cartSidebar').setAttribute('aria-hidden', $('#cartSidebar').classList.contains('hidden'));
  });
  $('#closeCart').addEventListener('click', ()=> {
    $('#cartSidebar').classList.add('hidden');
  });

  $('#checkoutBtn').addEventListener('click', ()=> {
    if(!getUser()) {
      alert('الرجاء تسجيل الدخول قبل طلب المنتجات.'); openAuth();
      return;
    }
    // محاكاة عملية الدفع / الطلب
    alert('شكراً! سيتم تجهيز طلبك. هذه محاكاة: ادمج بوابة دفع لاحقاً.');
    localStorage.removeItem('cart');
    updateCartUI({});
    $('#cartSidebar').classList.add('hidden');
  });
}

function addToCart(id, qty=1){
  let cart = JSON.parse(localStorage.getItem('cart')||'{}');
  if(!cart[id]) cart[id]=0;
  cart[id] += qty;
  localStorage.setItem('cart', JSON.stringify(cart));
  updateCartUI(cart);
}

function updateCartUI(cart){
  cart = cart || {};
  const cartItemsWrap = $('#cartItems');
  cartItemsWrap.innerHTML = '';
  let total = 0; let count = 0;

  Object.keys(cart).forEach(id=>{
    const qty = cart[id];
    const p = products.find(x=>x.id===id);
    if(!p) return;
    count += qty;
    total += p.price * qty;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <img src="${p.img}" alt="${p.title}">
      <div style="flex:1">
        <strong>${p.title}</strong>
        <div>${p.weight}</div>
        <div>${formatCurrency(p.price)} د.ع × ${qty}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:6px">
        <button class="btn small" data-id="${id}" data-op="inc">+</button>
        <button class="btn small" data-id="${id}" data-op="dec">-</button>
      </div>
    `;
    cartItemsWrap.appendChild(div);
  });

  $('#cartTotal').textContent = formatCurrency(total);
  $('#cartCount').textContent = count;

  // bind inc/dec
  $$('.cart-item .btn[data-op]').forEach(b=>{
    b.addEventListener('click', (e)=>{
      const id = e.currentTarget.dataset.id;
      const op = e.currentTarget.dataset.op;
      let cart = JSON.parse(localStorage.getItem('cart')||'{}');
      if(op==='inc') cart[id] = (cart[id]||0) + 1;
      else {
        cart[id] = (cart[id]||0) - 1;
        if(cart[id] <= 0) delete cart[id];
      }
      localStorage.setItem('cart', JSON.stringify(cart));
      updateCartUI(cart);
    });
  });

  // cart empty message
  if(Object.keys(cart).length === 0) cartItemsWrap.innerHTML = '<p>السلة فارغة</p>';
}

/* --------- مصغرات مساعدة --------- */
function formatCurrency(n){ return new Intl.NumberFormat('ar-IQ').format(n); }
function showQuickInfo(id){
  const p = products.find(x=>x.id===id);
  alert(`${p.title}\nالوزن: ${p.weight}\nالسعر: ${formatCurrency(p.price)} د.ع`);
}

/* --------- تسجيل/دخول بسيط (محلي) --------- */
function initAuth(){
  $('#loginBtn').addEventListener('click', openAuth);
  $('#closeAuth').addEventListener('click', ()=> { $('#authModal').classList.add('hidden'); });

  $('#authForm').addEventListener('submit', (e)=>{
    e.preventDefault();
    const user = {
      name: $('#nameInput').value.trim(),
      email: $('#emailInput').value.trim(),
      phone: $('#phoneInput').value.trim()
    };
    localStorage.setItem('user', JSON.stringify(user));
    alert('تم تسجيلك (محلياً).');
    $('#authModal').classList.add('hidden');
    updateUserUI();
  });
  updateUserUI();
}

function openAuth(){ $('#authModal').classList.remove('hidden'); $('#authModal').setAttribute('aria-hidden','false'); }

function getUser(){ return JSON.parse(localStorage.getItem('user')||'null'); }
function updateUserUI(){
  const u = getUser();
  if(u) {
    $('#loginBtn').textContent = u.name;
  } else {
    $('#loginBtn').textContent = 'دخول / تسجيل';
  }
}

/* --------- لغة (بسيطة) --------- */
function initLang(){
  const langBtn = $('#langToggle');
  langBtn.addEventListener('click', ()=>{
    const current = document.documentElement.lang;
    if(current === 'ar'){ document.documentElement.lang = 'en'; document.documentElement.dir = 'ltr'; langBtn.textContent = 'ع'; alert('تم التبديل للإنجليزية (الواجهة التجريبية)'); }
    else { document.documentElement.lang = 'ar'; document.documentElement.dir = 'rtl'; langBtn.textContent = 'EN'; alert('تم التبديل للعربية'); }
  });
}

/* --------- روابط مساعدة --------- */
function bindCTAs(){
  $('#ctaShop').addEventListener('click', ()=> window.scrollTo({top: document.querySelector('.products-section').offsetTop - 20, behavior:'smooth'}));
  $('#newsletterForm').addEventListener('submit', (e)=>{
    e.preventDefault(); alert('شكراً للاشتراك! (محاكاة)');
  });
}