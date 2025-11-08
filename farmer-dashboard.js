// Farmer Dashboard JavaScript with Camera Functionality
let videoStream = null;
let capturedImage = null;

document.addEventListener('DOMContentLoaded', function() {
    // Check if farmer is logged in
    const farmerLoggedIn = localStorage.getItem('farmerLoggedIn');
    if (!farmerLoggedIn) {
        window.location.href = 'farmer-login.html';
        return;
    }

    // Load farmer data
    const currentFarmer = JSON.parse(localStorage.getItem('currentFarmer') || '{}');
    
    // Load products
    loadProducts();
    
    // Update stats
    updateStats();

    // Add product form handler
    const addProductForm = document.getElementById('addProductForm');
    if (addProductForm) {
        addProductForm.addEventListener('submit', handleAddProduct);
    }

    // Set minimum expiry date to today
    const expiryDateInput = document.getElementById('expiryDate');
    if (expiryDateInput) {
        const today = new Date().toISOString().split('T')[0];
        expiryDateInput.setAttribute('min', today);
    }

    // Auto-set expiry date based on product type
    const productNameSelect = document.getElementById('productName');
    if (productNameSelect) {
        productNameSelect.addEventListener('change', function() {
            setExpiryDateBasedOnProduct(this.value);
        });
    }
});

// Set expiry date based on product type
function setExpiryDateBasedOnProduct(productName) {
    const expiryDateInput = document.getElementById('expiryDate');
    if (!expiryDateInput || !productName) return;

    const today = new Date();
    let expiryDate = new Date();

    // Define expiry days for different product categories
    const expiryDays = {
        // Vegetables (3-7 days)
        'Tomato': 5,
        'Onion': 30, // Onions last longer
        'Potato': 30, // Potatoes last longer
        'Carrot': 7,
        'Cabbage': 7,
        'Cauliflower': 5,
        'Brinjal': 4,
        'Okra': 3,
        'Cucumber': 5,
        'Pepper': 5,
        // Fruits (2-7 days)
        'Apple': 14,
        'Banana': 3,
        'Orange': 7,
        'Mango': 5,
        'Grapes': 3,
        'Watermelon': 7,
        'Papaya': 3,
        // Grains & Crops (6-12 months)
        'Wheat': 180,
        'Paddy': 180,
        'Rice': 180,
        'Corn': 90,
        'Barley': 180,
        // Pulses (6-12 months)
        'Lentil': 180,
        'Chickpea': 180,
        'Black Gram': 180,
        'Green Gram': 180,
        'Red Kidney Bean': 180
    };

    const days = expiryDays[productName] || 7; // Default 7 days
    expiryDate.setDate(today.getDate() + days);
    
    expiryDateInput.value = expiryDate.toISOString().split('T')[0];
}

function showAddProductModal() {
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.style.display = 'block';
    }
}

function closeAddProductModal() {
    const modal = document.getElementById('addProductModal');
    if (modal) {
        modal.style.display = 'none';
        stopCamera();
        capturedImage = null;
        document.getElementById('addProductForm').reset();
        const preview = document.getElementById('capturedImagePreview');
        if (preview) {
            preview.innerHTML = '';
        }
    }
}

// Camera Functions
async function startCamera() {
    try {
        const video = document.getElementById('video');
        if (!video) return;

        const stream = await navigator.mediaDevices.getUserMedia({ 
            video: { facingMode: 'environment' } // Use back camera on mobile
        });
        
        video.srcObject = stream;
        videoStream = stream;
        video.play();
    } catch (error) {
        console.error('Error accessing camera:', error);
        alert('Unable to access camera. Please check permissions.');
    }
}

function stopCamera() {
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }
    const video = document.getElementById('video');
    if (video) {
        video.srcObject = null;
    }
}

function captureImage() {
    const video = document.getElementById('video');
    const canvas = document.getElementById('canvas');
    const preview = document.getElementById('capturedImagePreview');
    
    if (!video || !canvas || !preview) return;

    if (!videoStream) {
        alert('Please start camera first!');
        return;
    }

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    
    capturedImage = canvas.toDataURL('image/jpeg');
    
    preview.innerHTML = `
        <img src="${capturedImage}" alt="Captured Product" style="max-width: 100%; border-radius: 10px;">
        <p style="margin-top: 0.5rem; color: green;">✓ Image captured successfully!</p>
    `;
    
    stopCamera();
}

// Product Management
function handleAddProduct(e) {
    e.preventDefault();
    
    if (!capturedImage) {
        alert('Please capture product image using camera!');
        return;
    }

    const productName = document.getElementById('productName').value;
    const productPrice = parseFloat(document.getElementById('productPrice').value);
    const sellingMode = document.getElementById('sellingMode').value;
    const productQuantity = parseFloat(document.getElementById('productQuantity').value);
    const expiryDate = document.getElementById('expiryDate').value;
    const description = document.getElementById('productDescription').value;
    
    const currentFarmer = JSON.parse(localStorage.getItem('currentFarmer') || '{}');
    
    const product = {
        id: Date.now().toString(),
        farmerId: currentFarmer.id,
        farmerName: currentFarmer.name,
        name: productName,
        image: capturedImage,
        price: productPrice,
        mode: sellingMode,
        quantity: productQuantity,
        availableQuantity: productQuantity,
        expiryDate: expiryDate,
        description: description || '',
        createdAt: new Date().toISOString(),
        status: 'active'
    };

    // Get existing products
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    products.push(product);
    localStorage.setItem('products', JSON.stringify(products));

    alert('Product added successfully!');
    closeAddProductModal();
    loadProducts();
    updateStats();
}

function loadProducts() {
    const currentFarmer = JSON.parse(localStorage.getItem('currentFarmer') || '{}');
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const farmerProducts = products.filter(p => p.farmerId === currentFarmer.id);
    
    const productsList = document.getElementById('productsList');
    if (!productsList) return;

    if (farmerProducts.length === 0) {
        productsList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <h3>No products yet</h3>
                <p>Add your first product to get started!</p>
            </div>
        `;
        return;
    }

    productsList.innerHTML = farmerProducts.map(product => `
        <div class="product-card">
            <img src="${product.image}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <h3>${product.name}</h3>
                <div class="product-price">₹${product.price.toFixed(2)}/kg</div>
                <div class="product-mode">${getModeLabel(product.mode)}</div>
                <div class="product-quantity">Available: ${product.availableQuantity} kg</div>
                <div class="product-expiry">Expires: ${formatDate(product.expiryDate)}</div>
                <div style="margin-top: 1rem; display: flex; gap: 0.5rem;">
                    <button class="btn btn-secondary" onclick="editProduct('${product.id}')">Edit</button>
                    <button class="btn btn-secondary" onclick="deleteProduct('${product.id}')">Delete</button>
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

function updateStats() {
    const currentFarmer = JSON.parse(localStorage.getItem('currentFarmer') || '{}');
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    
    const farmerProducts = products.filter(p => p.farmerId === currentFarmer.id);
    const farmerOrders = orders.filter(o => o.items.some(item => {
        const product = products.find(p => p.id === item.productId);
        return product && product.farmerId === currentFarmer.id;
    }));

    const totalRevenue = farmerOrders
        .filter(o => o.status === 'delivered')
        .reduce((sum, o) => sum + o.total, 0);

    const totalProductsEl = document.getElementById('totalProducts');
    const totalOrdersEl = document.getElementById('totalOrders');
    const totalRevenueEl = document.getElementById('totalRevenue');

    if (totalProductsEl) totalProductsEl.textContent = farmerProducts.length;
    if (totalOrdersEl) totalOrdersEl.textContent = farmerOrders.length;
    if (totalRevenueEl) totalRevenueEl.textContent = `₹${totalRevenue.toFixed(2)}`;
}

function editProduct(productId) {
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const product = products.find(p => p.id === productId);
    
    if (!product) return;

    // Populate form with product data
    document.getElementById('productName').value = product.name;
    document.getElementById('productPrice').value = product.price;
    document.getElementById('sellingMode').value = product.mode;
    document.getElementById('productQuantity').value = product.quantity;
    document.getElementById('expiryDate').value = product.expiryDate;
    document.getElementById('productDescription').value = product.description;
    
    capturedImage = product.image;
    const preview = document.getElementById('capturedImagePreview');
    if (preview) {
        preview.innerHTML = `<img src="${capturedImage}" alt="Product" style="max-width: 100%; border-radius: 10px;">`;
    }

    showAddProductModal();
    
    // Update form submit handler to edit instead of add
    const form = document.getElementById('addProductForm');
    form.onsubmit = function(e) {
        e.preventDefault();
        
        product.name = document.getElementById('productName').value;
        product.price = parseFloat(document.getElementById('productPrice').value);
        product.mode = document.getElementById('sellingMode').value;
        product.quantity = parseFloat(document.getElementById('productQuantity').value);
        product.expiryDate = document.getElementById('expiryDate').value;
        product.description = document.getElementById('productDescription').value;
        
        if (capturedImage) {
            product.image = capturedImage;
        }

        localStorage.setItem('products', JSON.stringify(products));
        alert('Product updated successfully!');
        closeAddProductModal();
        loadProducts();
        updateStats();
        
        // Reset form handler
        form.onsubmit = handleAddProduct;
    };
}

function deleteProduct(productId) {
    if (!confirm('Are you sure you want to delete this product?')) return;

    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const filteredProducts = products.filter(p => p.id !== productId);
    localStorage.setItem('products', JSON.stringify(filteredProducts));

    alert('Product deleted successfully!');
    loadProducts();
    updateStats();
}

// Close modal when clicking outside
window.onclick = function(event) {
    const modal = document.getElementById('addProductModal');
    if (event.target === modal) {
        closeAddProductModal();
    }
}

