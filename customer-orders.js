// Customer Orders JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const customerLoggedIn = localStorage.getItem('customerLoggedIn');
    if (!customerLoggedIn) {
        window.location.href = 'customer-login.html';
        return;
    }

    loadOrders();
});

function loadOrders() {
    const currentCustomer = JSON.parse(localStorage.getItem('currentCustomer') || '{}');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const customerOrders = orders.filter(o => o.customerId === currentCustomer.id).reverse();

    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;

    if (customerOrders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <h3>No orders yet</h3>
                <p>Start shopping to see your orders here!</p>
                <a href="products.html" class="btn btn-primary" style="margin-top: 1rem;">Browse Products</a>
            </div>
        `;
        return;
    }

    ordersList.innerHTML = customerOrders.map(order => `
        <div class="product-card" style="margin-bottom: 2rem;">
            <div class="product-info">
                <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                    <div>
                        <h3>Order #${order.id}</h3>
                        <div style="color: #666; font-size: 0.9rem; margin-top: 0.25rem;">
                            Placed on ${formatDateTime(order.createdAt)}
                        </div>
                    </div>
                    <div style="text-align: right;">
                        <div class="product-mode" style="background: ${getStatusColor(order.status)}; color: white;">
                            ${getStatusLabel(order.status)}
                        </div>
                        <div style="margin-top: 0.5rem; font-size: 1.2rem; font-weight: bold; color: #2d5016;">
                            ₹${order.total.toFixed(2)}
                        </div>
                    </div>
                </div>
                
                <div style="margin: 1rem 0; padding: 1rem; background: #f8f9fa; border-radius: 5px;">
                    <strong>Items:</strong>
                    ${order.items.map(item => `
                        <div style="display: flex; justify-content: space-between; margin-top: 0.5rem;">
                            <span>${item.productName} (${item.quantity} kg)</span>
                            <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                    `).join('')}
                </div>

                <div style="margin: 1rem 0; padding: 1rem; background: #f8f9fa; border-radius: 5px;">
                    <strong>Delivery Address:</strong><br>
                    ${order.deliveryAddress}
                </div>

                <div style="display: flex; gap: 0.5rem; margin-top: 1rem; flex-wrap: wrap;">
                    <a href="track-order.html?id=${order.id}" class="btn btn-primary">Track Order</a>
                    ${order.status === 'pending' ? `<button class="btn btn-secondary" onclick="cancelOrder('${order.id}')">Cancel Order</button>` : ''}
                </div>
            </div>
        </div>
    `).join('');
}

function getStatusLabel(status) {
    const labels = {
        'pending': 'Pending',
        'confirmed': 'Confirmed',
        'processing': 'Processing',
        'shipped': 'Shipped',
        'out_for_delivery': 'Out for Delivery',
        'delivered': 'Delivered',
        'cancelled': 'Cancelled'
    };
    return labels[status] || status;
}

function getStatusColor(status) {
    const colors = {
        'pending': '#ff9800',
        'confirmed': '#2196f3',
        'processing': '#9c27b0',
        'shipped': '#00bcd4',
        'out_for_delivery': '#ff5722',
        'delivered': '#4caf50',
        'cancelled': '#f44336'
    };
    return colors[status] || '#666';
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-IN', { 
        year: 'numeric', 
        month: 'short', 
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function cancelOrder(orderId) {
    if (!confirm('Are you sure you want to cancel this order?')) return;

    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        alert('Order not found!');
        return;
    }

    if (order.status !== 'pending') {
        alert('Only pending orders can be cancelled!');
        return;
    }

    order.status = 'cancelled';
    order.tracking.push({
        status: 'cancelled',
        message: 'Order cancelled by customer',
        timestamp: new Date().toISOString()
    });

    // Refund items to products
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    order.items.forEach(item => {
        const product = products.find(p => p.id === item.productId);
        if (product) {
            product.availableQuantity += item.quantity;
        }
    });
    localStorage.setItem('products', JSON.stringify(products));

    localStorage.setItem('orders', JSON.stringify(orders));
    alert('Order cancelled successfully!');
    loadOrders();
}

