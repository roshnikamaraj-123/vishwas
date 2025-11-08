// Products JavaScript
document.addEventListener('DOMContentLoaded', function() {
    loadProducts();
    updateCartCount();

    // Filter handlers
    const filterMode = document.getElementById('filterMode');
    const filterCategory = document.getElementById('filterCategory');
    
    if (filterMode) {
        filterMode.addEventListener('change', loadProducts);
    }
    if (filterCategory) {
        filterCategory.addEventListener('change', loadProducts);
    }
});

function loadProducts() {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const filterMode = document.getElementById('filterMode')?.value || 'all';
    const filterCategory = document.getElementById('filterCategory')?.value || 'all';
    
    // Filter products
    let filteredProducts = products.filter(p => {
        if (p.status !== 'active') return false;
        
        // Check expiry date
        const expiryDate = new Date(p.expiryDate);
        const today = new Date();
        if (expiryDate < today) return false;
        
        // Check available quantity
        if (p.availableQuantity <= 0) return false;
        
        return true;
    });

    // Apply mode filter
    if (filterMode !== 'all') {
        filteredProducts = filteredProducts.filter(p => p.mode === filterMode);
    }

    // Apply category filter
    if (filterCategory !== 'all') {
        const categoryMap = {
            'vegetables': ['Tomato', 'Onion', 'Potato', 'Carrot', 'Cabbage', 'Cauliflower', 'Brinjal', 'Okra', 'Cucumber', 'Pepper'],
            'fruits': ['Apple', 'Banana', 'Orange', 'Mango', 'Grapes', 'Watermelon', 'Papaya'],
            'grains': ['Wheat', 'Paddy', 'Rice', 'Corn', 'Barley'],
            'pulses': ['Lentil', 'Chickpea', 'Black Gram', 'Green Gram', 'Red Kidney Bean']
        };
        
        if (categoryMap[filterCategory]) {
            filteredProducts = filteredProducts.filter(p => 
                categoryMap[filterCategory].includes(p.name)
            );
        }
    }

    displayProducts(filteredProducts);
}

function displayProducts(products) {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    if (products.length === 0) {
        productsGrid.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1;">
                <div class="empty-state-icon">🔍</div>
                <h3>No products found</h3>
                <p>Try adjusting your filters or check back later.</p>
            </div>
        `;
        return;
    }

    productsGrid.innerHTML = products.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-price">₹${product.price.toFixed(2)}/kg</div>
                <div class="product-mode">${getModeLabel(product.mode)}</div>
                <div class="product-quantity">Available: ${product.availableQuantity} kg</div>
                <div class="product-expiry">Expires: ${formatDate(product.expiryDate)}</div>
                ${product.description ? `<p style="color: #666; font-size: 0.9rem; margin: 0.5rem 0;">${product.description}</p>` : ''}
                <div style="margin-top: 1rem;">
                    <button class="btn btn-primary" onclick="addToCart('${product.id}')">Add to Cart</button>
                    ${product.mode === 'contract' ? `<button class="btn btn-secondary" style="margin-top: 0.5rem; width: 100%;" onclick="openNegotiation('${product.id}')">Negotiate Price</button>` : ''}
                    ${product.mode === 'auction' ? `<button class="btn btn-secondary" style="margin-top: 0.5rem; width: 100%;" onclick="placeBid('${product.id}')">Place Bid</button>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function getModeLabel(mode) {
    const modes = {
        'direct': 'Direct Sale',
        'auction': 'Auction',
        'contract': 'Contract Agreement'
    };
    return modes[mode] || mode;
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' });
}

function addToCart(productId) {
    const customerLoggedIn = localStorage.getItem('customerLoggedIn');
    if (!customerLoggedIn) {
        alert('Please login to add items to cart!');
        window.location.href = 'customer-login.html';
        return;
    }

    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        alert('Product not found!');
        return;
    }

    if (product.mode === 'auction') {
        alert('Auction items cannot be added to cart directly. Please place a bid first.');
        return;
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    // Check if product already in cart
    const existingItem = cart.find(item => item.productId === productId);
    if (existingItem) {
        alert('Product already in cart!');
        return;
    }

    cart.push({
        productId: productId,
        quantity: 1,
        price: product.price,
        mode: product.mode
    });

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartCount();
    alert('Product added to cart!');
}

function openNegotiation(productId) {
    const customerLoggedIn = localStorage.getItem('customerLoggedIn');
    if (!customerLoggedIn) {
        alert('Please login to negotiate prices!');
        window.location.href = 'customer-login.html';
        return;
    }

    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const product = products.find(p => p.id === productId);
    
    if (!product || product.mode !== 'contract') {
        alert('Negotiation is only available for contract mode products!');
        return;
    }

    // Create negotiation modal
    const modal = document.createElement('div');
    modal.className = 'modal negotiation-modal';
    modal.style.display = 'block';
    modal.innerHTML = `
        <div class="negotiation-content">
            <span class="close" onclick="this.parentElement.parentElement.remove()">&times;</span>
            <h3>Negotiate Price - ${product.name}</h3>
            <div class="price-display">
                <p>Current Price:</p>
                <div class="current-price">₹${product.price.toFixed(2)}/kg</div>
            </div>
            <div class="form-group">
                <label>Your Proposed Price (₹ per kg)</label>
                <input type="number" id="proposedPrice" step="0.01" min="0" value="${product.price}" required>
            </div>
            <div class="form-group">
                <label>Quantity (kg)</label>
                <input type="number" id="negotiationQuantity" step="0.01" min="0.01" max="${product.availableQuantity}" value="1" required>
            </div>
            <div class="form-group">
                <label>Message to Farmer (Optional)</label>
                <textarea id="negotiationMessage" rows="3" placeholder="Add any additional notes..."></textarea>
            </div>
            <button class="btn btn-primary btn-block" onclick="submitNegotiation('${productId}')">Submit Negotiation</button>
        </div>
    `;
    document.body.appendChild(modal);

    // Close on outside click
    modal.addEventListener('click', function(e) {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

function submitNegotiation(productId) {
    const proposedPrice = parseFloat(document.getElementById('proposedPrice').value);
    const quantity = parseFloat(document.getElementById('negotiationQuantity').value);
    const message = document.getElementById('negotiationMessage').value;

    if (!proposedPrice || proposedPrice <= 0) {
        alert('Please enter a valid price!');
        return;
    }

    if (!quantity || quantity <= 0) {
        alert('Please enter a valid quantity!');
        return;
    }

    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const product = products.find(p => p.id === productId);
    
    if (!product) {
        alert('Product not found!');
        return;
    }

    const currentCustomer = JSON.parse(localStorage.getItem('currentCustomer') || '{}');
    
    // Get negotiations
    const negotiations = JSON.parse(localStorage.getItem('negotiations') || '[]');
    
    negotiations.push({
        id: Date.now().toString(),
        productId: productId,
        farmerId: product.farmerId,
        customerId: currentCustomer.id,
        customerName: currentCustomer.name,
        productName: product.name,
        currentPrice: product.price,
        proposedPrice: proposedPrice,
        quantity: quantity,
        message: message,
        status: 'pending',
        createdAt: new Date().toISOString()
    });

    localStorage.setItem('negotiations', JSON.stringify(negotiations));
    
    alert('Negotiation submitted! The farmer will review your proposal.');
    document.querySelector('.negotiation-modal').remove();
}

function placeBid(productId) {
    const customerLoggedIn = localStorage.getItem('customerLoggedIn');
    if (!customerLoggedIn) {
        alert('Please login to place bids!');
        window.location.href = 'customer-login.html';
        return;
    }

    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const product = products.find(p => p.id === productId);
    
    if (!product || product.mode !== 'auction') {
        alert('Bidding is only available for auction mode products!');
        return;
    }

    // Get existing bids
    const bids = JSON.parse(localStorage.getItem('bids') || '[]');
    const productBids = bids.filter(b => b.productId === productId);
    const highestBid = productBids.length > 0 ? Math.max(...productBids.map(b => b.amount)) : product.price;

    const bidAmount = prompt(`Enter your bid amount (₹ per kg)\nCurrent highest bid: ₹${highestBid.toFixed(2)}/kg\nMinimum bid: ₹${(highestBid + 1).toFixed(2)}/kg`, (highestBid + 1).toFixed(2));
    
    if (!bidAmount) return;

    const bid = parseFloat(bidAmount);
    if (bid <= highestBid) {
        alert(`Your bid must be higher than ₹${highestBid.toFixed(2)}/kg!`);
        return;
    }

    const quantity = prompt('Enter quantity (kg):', '1');
    if (!quantity) return;

    const qty = parseFloat(quantity);
    if (qty <= 0 || qty > product.availableQuantity) {
        alert(`Please enter a valid quantity (1-${product.availableQuantity} kg)!`);
        return;
    }

    const currentCustomer = JSON.parse(localStorage.getItem('currentCustomer') || '{}');
    
    bids.push({
        id: Date.now().toString(),
        productId: productId,
        farmerId: product.farmerId,
        customerId: currentCustomer.id,
        customerName: currentCustomer.name,
        productName: product.name,
        amount: bid,
        quantity: qty,
        createdAt: new Date().toISOString()
    });

    localStorage.setItem('bids', JSON.stringify(bids));
    alert('Bid placed successfully!');
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const cartCount = document.getElementById('cartCount');
    const cartCountNav = document.getElementById('cartCountNav');
    
    if (cartCount) cartCount.textContent = cart.length;
    if (cartCountNav) cartCountNav.textContent = cart.length;
}

