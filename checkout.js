// Checkout and Payment JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const customerLoggedIn = localStorage.getItem('customerLoggedIn');
    if (!customerLoggedIn) {
        alert('Please login to checkout!');
        window.location.href = 'customer-login.html';
        return;
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    if (cart.length === 0) {
        alert('Your cart is empty!');
        window.location.href = 'cart.html';
        return;
    }

    loadCheckoutSummary();
    setupPaymentHandlers();
});

function setupPaymentHandlers() {
    const paymentMethods = document.querySelectorAll('input[name="paymentMethod"]');
    paymentMethods.forEach(method => {
        method.addEventListener('change', function() {
            const onlinePaymentDetails = document.getElementById('onlinePaymentDetails');
            if (this.value === 'escrow-online') {
                if (onlinePaymentDetails) onlinePaymentDetails.style.display = 'block';
            } else {
                if (onlinePaymentDetails) onlinePaymentDetails.style.display = 'none';
            }
        });
    });

    const gateways = document.querySelectorAll('input[name="gateway"]');
    gateways.forEach(gateway => {
        gateway.addEventListener('change', function() {
            const cardDetails = document.getElementById('cardDetails');
            if (this.value === 'credit-card') {
                if (cardDetails) cardDetails.style.display = 'block';
            } else {
                if (cardDetails) cardDetails.style.display = 'none';
            }
        });
    });

    // Format card number
    const cardNumber = document.getElementById('cardNumber');
    if (cardNumber) {
        cardNumber.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\s/g, '');
            let formattedValue = value.match(/.{1,4}/g)?.join(' ') || value;
            e.target.value = formattedValue;
        });
    }

    // Format expiry date
    const cardExpiry = document.getElementById('cardExpiry');
    if (cardExpiry) {
        cardExpiry.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length >= 2) {
                value = value.substring(0, 2) + '/' + value.substring(2, 4);
            }
            e.target.value = value;
        });
    }
}

function loadCheckoutSummary() {
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const checkoutSummary = document.getElementById('checkoutSummary');
    
    if (!checkoutSummary) return;

    const summaryItems = cart.map(item => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return '';

        return `
            <div style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #eee;">
                <div>
                    <strong>${product.name}</strong>
                    <div style="color: #666; font-size: 0.9rem;">${item.quantity} kg × ₹${item.price.toFixed(2)}</div>
                </div>
                <div>₹${(item.price * item.quantity).toFixed(2)}</div>
            </div>
        `;
    }).join('');

    const subtotal = cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return sum;
        return sum + (item.price * item.quantity);
    }, 0);

    const delivery = 50;
    const total = subtotal + delivery;

    checkoutSummary.innerHTML = `
        ${summaryItems}
        <div style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #eee;">
            <span>Subtotal:</span>
            <span>₹${subtotal.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 0.75rem 0; border-bottom: 1px solid #eee;">
            <span>Delivery Charges:</span>
            <span>₹${delivery.toFixed(2)}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding: 0.75rem 0; font-size: 1.2rem; font-weight: bold; color: #2d5016;">
            <span>Total:</span>
            <span>₹${total.toFixed(2)}</span>
        </div>
    `;
}

function placeOrder() {
    const deliveryAddress = document.getElementById('deliveryAddress').value;
    if (!deliveryAddress.trim()) {
        alert('Please enter delivery address!');
        return;
    }

    const paymentMethod = document.querySelector('input[name="paymentMethod"]:checked');
    if (!paymentMethod) {
        alert('Please select a payment method!');
        return;
    }

    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    const currentCustomer = JSON.parse(localStorage.getItem('currentCustomer') || '{}');

    if (cart.length === 0) {
        alert('Your cart is empty!');
        return;
    }

    // Validate payment details for online payment
    if (paymentMethod.value === 'escrow-online') {
        const gateway = document.querySelector('input[name="gateway"]:checked');
        if (!gateway) {
            alert('Please select a payment gateway!');
            return;
        }

        if (gateway.value === 'credit-card') {
            const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
            const cardExpiry = document.getElementById('cardExpiry').value;
            const cardCVV = document.getElementById('cardCVV').value;
            const cardName = document.getElementById('cardName').value;

            if (!cardNumber || cardNumber.length < 16) {
                alert('Please enter a valid card number!');
                return;
            }
            if (!cardExpiry || cardExpiry.length !== 5) {
                alert('Please enter a valid expiry date (MM/YY)!');
                return;
            }
            if (!cardCVV || cardCVV.length !== 3) {
                alert('Please enter a valid CVV!');
                return;
            }
            if (!cardName) {
                alert('Please enter cardholder name!');
                return;
            }
        }
    }

    // Calculate totals
    const subtotal = cart.reduce((sum, item) => {
        const product = products.find(p => p.id === item.productId);
        if (!product) return sum;
        return sum + (item.price * item.quantity);
    }, 0);

    const delivery = 50;
    const total = subtotal + delivery;

    // Create order
    const order = {
        id: 'ORD' + Date.now().toString(),
        customerId: currentCustomer.id,
        customerName: currentCustomer.name,
        customerEmail: currentCustomer.email,
        customerPhone: currentCustomer.phone,
        deliveryAddress: deliveryAddress,
        items: cart.map(item => {
            const product = products.find(p => p.id === item.productId);
            return {
                productId: item.productId,
                productName: product ? product.name : 'Unknown',
                productImage: product ? product.image : '',
                quantity: item.quantity,
                price: item.price,
                mode: item.mode
            };
        }),
        subtotal: subtotal,
        delivery: delivery,
        total: total,
        paymentMethod: paymentMethod.value,
        paymentGateway: paymentMethod.value === 'escrow-online' ? 
            document.querySelector('input[name="gateway"]:checked')?.value : null,
        paymentStatus: paymentMethod.value === 'escrow-cod' ? 'pending' : 'escrow',
        status: 'pending',
        createdAt: new Date().toISOString(),
        tracking: [
            {
                status: 'pending',
                message: 'Order placed',
                timestamp: new Date().toISOString()
            }
        ]
    };

    // Save order
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(order);
    localStorage.setItem('orders', JSON.stringify(orders));

    // Update product quantities
    cart.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            product.availableQuantity -= item.quantity;
            if (product.availableQuantity < 0) product.availableQuantity = 0;
        }
    });
    localStorage.setItem('products', JSON.stringify(products));

    // Clear cart
    localStorage.removeItem('cart');

    // Show success message
    alert(`Order placed successfully!\nOrder ID: ${order.id}\nTotal: ₹${total.toFixed(2)}\n\nPayment Status: ${paymentMethod.value === 'escrow-cod' ? 'Cash on Delivery' : 'Escrow Payment - Funds held until delivery confirmation'}`);

    // Redirect to orders page
    window.location.href = 'customer-orders.html';
}

