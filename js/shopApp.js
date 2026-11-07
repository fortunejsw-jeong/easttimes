/**
 * East Times Mall (이스트 타임스 로컬 쇼핑몰 기능 엔진)
 * - 상품 렌더링 및 카테고리 필터
 * - 장바구니 추가, 수량 변경, 삭제
 * - 실제 구매 주문서 작성 및 결제 시뮬레이션
 * - 주문 완료 영수증 생성 및 주문 내역 로컬스토리지 보관
 */

window.cart = JSON.parse(localStorage.getItem('easttimes_cart') || '[]');

document.addEventListener('DOMContentLoaded', () => {
  renderShopProducts('all');
  updateCartBadge();
  initCheckoutForm();
});

/* --- 상품 렌더링 --- */
function renderShopProducts(categoryKey = 'all') {
  const container = document.getElementById('shopProductGrid');
  const shopData = window.EAST_TIMES_SHOP;
  if (!container || !shopData) return;

  const filtered = categoryKey === 'all' 
    ? shopData.products 
    : shopData.products.filter(p => p.category === categoryKey);

  container.innerHTML = filtered.map(prod => `
    <div class="card-product">
      <div class="prod-img-box">
        <img src="${prod.thumb}" alt="${prod.name}" />
        <span class="prod-badge-region">${prod.region} 특산</span>
        <span style="position:absolute; bottom:10px; right:10px; background:rgba(0,0,0,0.7); color:#fff; font-size:0.75rem; padding:0.2rem 0.5rem; border-radius:4px;">
          ★ ${prod.rating} (${prod.reviewCount})
        </span>
      </div>
      <div class="prod-content-box">
        <div>
          <span style="font-size:0.75rem; color:var(--c-gold); font-weight:700;">${prod.badge} · ${prod.origin.split(' ')[1]}</span>
          <h4 class="prod-title">${prod.name}</h4>
          <p class="prod-desc-short">${prod.desc}</p>
        </div>
        <div>
          <div class="prod-price-row">
            <span class="prod-discount">${prod.discount}</span>
            <span class="prod-current-price">${prod.price.toLocaleString()}원</span>
            <span class="prod-original-price">${prod.originalPrice.toLocaleString()}원</span>
          </div>
          <div class="prod-btn-group">
            <button class="btn-prod-action btn-add-cart" onclick="addToCart('${prod.id}')">
              <i class="fas fa-shopping-cart"></i> 장바구니
            </button>
            <button class="btn-prod-action btn-buy-direct" onclick="buyNow('${prod.id}')">
              <i class="fas fa-bolt"></i> 바로구매
            </button>
          </div>
        </div>
      </div>
    </div>
  `).join('');
}

/* --- 장바구니 추가 --- */
window.addToCart = function(productId) {
  const prod = window.EAST_TIMES_SHOP.products.find(p => p.id === productId);
  if (!prod) return;

  const existing = window.cart.find(item => item.id === productId);
  if (existing) {
    existing.qty += 1;
  } else {
    window.cart.push({
      id: prod.id,
      name: prod.name,
      price: prod.price,
      thumb: prod.thumb,
      region: prod.region,
      qty: 1
    });
  }

  saveCart();
  updateCartBadge();
  showToast(`'${prod.name}'이(가) 장바구니에 담겼습니다!`);
};

/* --- 바로구매 --- */
window.buyNow = function(productId) {
  addToCart(productId);
  openCartModal();
};

/* --- 장바구니 모달 열기 & 렌더링 --- */
window.openCartModal = function() {
  const modal = document.getElementById('cartModal');
  const cartList = document.getElementById('cartItemsList');
  const totalPriceElem = document.getElementById('cartTotalPrice');
  if (!modal || !cartList) return;

  if (window.cart.length === 0) {
    cartList.innerHTML = `
      <div style="text-align:center; padding:3rem; color:#94a3b8;">
        <i class="fas fa-shopping-bag" style="font-size:3rem; margin-bottom:1rem; opacity:0.5;"></i>
        <p>장바구니에 담긴 로컬 특산물이 없습니다.</p>
      </div>
    `;
    if (totalPriceElem) totalPriceElem.innerText = '0원';
  } else {
    let total = 0;
    cartList.innerHTML = window.cart.map((item, idx) => {
      const itemSubtotal = item.price * item.qty;
      total += itemSubtotal;
      return `
        <div style="display:flex; gap:1rem; align-items:center; padding:1rem 0; border-bottom:1px solid #e2e8f0;">
          <img src="${item.thumb}" style="width:65px; height:65px; object-fit:cover; border-radius:6px;" />
          <div style="flex:1;">
            <span style="font-size:0.75rem; color:#0284c7; font-weight:700;">${item.region} 특산품</span>
            <h5 style="font-size:0.95rem; color:#0f172a; margin:0.2rem 0;">${item.name}</h5>
            <div style="font-size:0.9rem; font-weight:700; color:#0f172a;">${item.price.toLocaleString()}원</div>
          </div>
          <div style="display:flex; align-items:center; gap:0.5rem;">
            <button onclick="changeQty(${idx}, -1)" style="width:26px; height:26px; border:1px solid #cbd5e1; border-radius:4px; font-weight:700;">-</button>
            <span style="font-size:0.9rem; font-weight:700; min-width:20px; text-align:center;">${item.qty}</span>
            <button onclick="changeQty(${idx}, 1)" style="width:26px; height:26px; border:1px solid #cbd5e1; border-radius:4px; font-weight:700;">+</button>
          </div>
          <div style="font-size:0.95rem; font-weight:800; min-width:80px; text-align:right;">
            ${itemSubtotal.toLocaleString()}원
          </div>
          <button onclick="removeCartItem(${idx})" style="color:#ef4444; font-size:1.1rem; padding:0.3rem;">
            <i class="fas fa-trash-alt"></i>
          </button>
        </div>
      `;
    }).join('');

    if (totalPriceElem) totalPriceElem.innerText = total.toLocaleString() + '원';
  }

  window.openModal('cartModal');
};

window.changeQty = function(index, delta) {
  if (!window.cart[index]) return;
  window.cart[index].qty += delta;
  if (window.cart[index].qty <= 0) {
    window.cart.splice(index, 1);
  }
  saveCart();
  updateCartBadge();
  openCartModal();
};

window.removeCartItem = function(index) {
  window.cart.splice(index, 1);
  saveCart();
  updateCartBadge();
  openCartModal();
};

function saveCart() {
  localStorage.setItem('easttimes_cart', JSON.stringify(window.cart));
}

function updateCartBadge() {
  const badge = document.getElementById('headerCartCount');
  const count = window.cart.reduce((sum, item) => sum + item.qty, 0);
  if (badge) badge.innerText = count;
}

/* --- 주문서 작성 및 결제 프로세스 --- */
window.proceedToCheckout = function() {
  if (window.cart.length === 0) {
    alert('장바구니에 담긴 상품이 없습니다.');
    return;
  }
  window.closeModal('cartModal');
  
  // 주문 총액 계산
  const total = window.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  document.getElementById('checkoutSummaryTotal').innerText = total.toLocaleString() + '원';
  document.getElementById('checkoutSummaryItems').innerHTML = window.cart.map(i => `
    <div style="display:flex; justify-content:space-between; font-size:0.85rem; color:#475569; margin-bottom:0.4rem;">
      <span>${i.name} (${i.qty}개)</span>
      <span>${(i.price * i.qty).toLocaleString()}원</span>
    </div>
  `).join('');

  window.openModal('checkoutModal');
};

function initCheckoutForm() {
  const form = document.getElementById('checkoutOrderForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const orderNo = 'ET-' + new Date().toISOString().slice(0,10).replace(/-/g,'') + '-' + Math.floor(1000 + Math.random() * 9000);
    const buyerName = document.getElementById('buyerName').value;
    const buyerPhone = document.getElementById('buyerPhone').value;
    const buyerAddress = document.getElementById('buyerAddress').value;
    const payMethod = document.querySelector('input[name="payMethod"]:checked')?.value || '카드결제';

    const total = window.cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

    // 주문 성공 영수증 렌더링
    const receiptBox = document.getElementById('orderSuccessReceipt');
    receiptBox.innerHTML = `
      <div style="text-align:center; padding:1.5rem 0;">
        <i class="fas fa-check-circle" style="font-size:3.5rem; color:#10b981; margin-bottom:1rem;"></i>
        <h3 style="font-family:var(--font-serif); font-size:1.6rem; color:var(--c-deep-navy);">주문 및 결제가 성공적으로 완료되었습니다!</h3>
        <p style="color:#64748b; font-size:0.9rem; margin-top:0.3rem;">동해와 설악의 신선함을 산지에서 정성껏 포장하여 배송해 드립니다.</p>
      </div>

      <div style="background:#f8fafc; border:1px solid #e2e8f0; border-radius:8px; padding:1.2rem; margin:1.5rem 0; font-size:0.9rem;">
        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
          <span style="color:#64748b;">주문번호</span>
          <strong>${orderNo}</strong>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
          <span style="color:#64748b;">수령인</span>
          <span>${buyerName} (${buyerPhone})</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
          <span style="color:#64748b;">배송지</span>
          <span>${buyerAddress}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-bottom:0.5rem;">
          <span style="color:#64748b;">결제수단</span>
          <span>${payMethod}</span>
        </div>
        <div style="display:flex; justify-content:space-between; border-top:1px dashed #cbd5e1; padding-top:0.8rem; margin-top:0.8rem; font-size:1.1rem; color:var(--c-deep-navy);">
          <span><strong>최종 결제 금액</strong></span>
          <strong style="color:#ef4444;">${total.toLocaleString()}원</strong>
        </div>
      </div>
    `;

    // 장바구니 비우기
    window.cart = [];
    saveCart();
    updateCartBadge();

    window.closeModal('checkoutModal');
    window.openModal('orderCompleteModal');
  });
}

function showToast(msg) {
  const toast = document.createElement('div');
  toast.style.cssText = `
    position: fixed;
    bottom: 30px;
    right: 30px;
    background: #0b1329;
    color: #d4af37;
    border: 1px solid #d4af37;
    padding: 0.9rem 1.4rem;
    border-radius: 8px;
    font-size: 0.9rem;
    font-weight: 700;
    box-shadow: 0 10px 25px rgba(0,0,0,0.4);
    z-index: 9999;
    animation: fadeIn 0.3s ease;
  `;
  toast.innerText = msg;
  document.body.appendChild(toast);
  setTimeout(() => {
    toast.remove();
  }, 2500);
}
