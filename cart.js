// Cart JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const customerLoggedIn = localStorage.getItem('customerLoggedIn');
    if (!customerLoggedIn) {
        alert('Please login to view cart!');
        window.location.href = 'customer-login.html';
        return;
    }

    loadCart();
});

function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    
    const cartItems = document.getElementById('cartItems');
    if (!cartItems) return;

    if (cart.length === 0) {
        cartItems.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add some products to get started!</p>
                <a href="products.html" class="btn btn-primary" style="margin-top: 1rem;">Browse Products</a>
            </div>
        `;
        updateSummary(0);
        return;
    }

    cartItems.innerHTML = cart.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return '';

        return `
            <div class="cart-item">
                <img src="${product.image}" alt="${product.name}" class="cart-item-image">
                <div class="cart-item-details">
                    <h4>${product.name}</h4>
                    <div class="product-mode">${getModeLabel(product.mode)}</div>
                    <div class="cart-item-price">₹${item.price.toFixed(2)}/kg</div>
                    <div class="cart-item-quantity">
                        <button class="quantity-btn" onclick="updateQuantity('${item.productId}', -1)">-</button>
                        <span>${item.quantity} kg</span>
                        <button class="quantity-btn" onclick="updateQuantity('${item.productId}', 1)">+</button>
                    </div>
                    <div style="margin-top: 0.5rem;">
                        <strong>Total: ₹${(item.price * item.quantity).toFixed(2)}</strong>
                    </div>
                </div>
                <button class="btn btn-secondary" onclick="removeFromCart('${item.productId}')">Remove</button>
            </div>
        `;
    }).join('');

    updateSummary();
}

function getModeLabel(mode) {
    const modes = {
        'direct': 'Direct Sale',
        'auction': 'Auction',
        'contract': 'Contract Agreement'
    };
    return modes[mode] || mode;
}

function updateQuantity(productId, change) {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    
    const item = cart.find(i => i.productId === productId);
    if (!item) return;

    const product = products.find(p => p.id === productId);
    if (!product) return;

    const newQuantity = item.quantity + change;
    
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }

    if (newQuantity > product.availableQuantity) {
        alert(`Only ${product.availableQuantity} kg available!`);
        return;
    }

    item.quantity = newQuantity;
    localStorage.setItem('cart', JSON.stringify(cart));
    loadCart();
}

function removeFromCart(productId) {
    if (!confirm('Remove this item from cart?')) return;

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const filteredCart = cart.filter(item => item.productId !== productId);
    localStorage.setItem('cart', JSON.stringify(filteredCart));
    loadCart();
    updateCartCount();
}

function updateSummary() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    
    const subtotal = cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return sum;
        return sum + (item.price * item.quantity);
    }, 0);

    const delivery = 50;
    const total = subtotal + delivery;

    const subtotalEl = document.getElementById('subtotal');
    const deliveryEl = document.getElementById('delivery');
    const totalEl = document.getElementById('total');

    if (subtotalEl) subtotalEl.textContent = `₹${subtotal.toFixed(2)}`;
    if (deliveryEl) deliveryEl.textContent = `₹${delivery.toFixed(2)}`;
    if (totalEl) totalEl.textContent = `₹${total.toFixed(2)}`;
}

function proceedToCheckout() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    window.location.href = 'checkout.html';
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartCount = document.getElementById('cartCount');
    const cartCountNav = document.getElementById('cartCountNav');
    
    if (cartCount) cartCount.textContent = cart.length;
    if (cartCountNav) cartCountNav.textContent = cart.length;
}

