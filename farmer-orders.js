// Farmer Orders JavaScript
document.addEventListener('DOMContentLoaded', function() {
    const farmerLoggedIn = localStorage.getItem('farmerLoggedIn');
    if (!farmerLoggedIn) {
        window.location.href = 'farmer-login.html';
        return;
    }

    loadOrders();
});

function loadOrders() {
    const currentFarmer = JSON.parse(localStorage.getItem('currentFarmer') || '{}');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const products = JSON.parse(localStorage.getItem('products') || '[]');
    
    // Get orders for products belonging to this farmer
    const farmerOrders = orders.filter(order => {
        return order.items.some(item => {
            const product = products.find(p => p.id === item.productId);
            return product && product.farmerId === currentFarmer.id;
        });
    }).reverse();

    const ordersList = document.getElementById('farmerOrdersList');
    if (!ordersList) return;

    if (farmerOrders.length === 0) {
        ordersList.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📦</div>
                <h3>No orders yet</h3>
                <p>Orders for your products will appear here!</p>
            </div>
        `;
        return;
    }

    ordersList.innerHTML = farmerOrders.map(order => {
        // Filter items that belong to this farmer
        const farmerItems = order.items.filter(item => {
            const product = products.find(p => p.id === item.productId);
            return product && product.farmerId === currentFarmer.id;
        });

        const farmerTotal = farmerItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);

        return `
            <div class="product-card" style="margin-bottom: 2rem;">
                <div class="product-info">
                    <div style="display: flex; justify-content: space-between; align-items: start; margin-bottom: 1rem;">
                        <div>
                            <h3>Order #${order.id}</h3>
                            <div style="color: #666; font-size: 0.9rem; margin-top: 0.25rem;">
                                Placed on ${formatDateTime(order.createdAt)}
                            </div>
                            <div style="color: #666; font-size: 0.9rem; margin-top: 0.25rem;">
                                Customer: ${order.customerName}
                            </div>
                        </div>
                        <div style="text-align: right;">
                            <div class="product-mode" style="background: ${getStatusColor(order.status)}; color: white;">
                                ${getStatusLabel(order.status)}
                            </div>
                            <div style="margin-top: 0.5rem; font-size: 1.2rem; font-weight: bold; color: #2d5016;">
                                ₹${farmerTotal.toFixed(2)}
                            </div>
                        </div>
                    </div>
                    
                    <div style="margin: 1rem 0; padding: 1rem; background: #f8f9fa; border-radius: 5px;">
                        <strong>Your Products:</strong>
                        ${farmerItems.map(item => `
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
                        ${getActionButtons(order)}
                    </div>
                </div>
            </div>
        `;
    }).join('');
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

function getActionButtons(order) {
    let buttons = '';

    switch(order.status) {
        case 'pending':
            buttons = `
                <button class="btn btn-primary" onclick="updateOrderStatus('${order.id}', 'confirmed')">Confirm Order</button>
                <button class="btn btn-secondary" onclick="updateOrderStatus('${order.id}', 'cancelled')">Cancel Order</button>
            `;
            break;
        case 'confirmed':
            buttons = `
                <button class="btn btn-primary" onclick="updateOrderStatus('${order.id}', 'processing')">Start Processing</button>
            `;
            break;
        case 'processing':
            buttons = `
                <button class="btn btn-primary" onclick="updateOrderStatus('${order.id}', 'shipped')">Mark as Shipped</button>
            `;
            break;
        case 'shipped':
            buttons = `
                <button class="btn btn-primary" onclick="updateOrderStatus('${order.id}', 'out_for_delivery')">Out for Delivery</button>
            `;
            break;
        case 'out_for_delivery':
            buttons = `
                <button class="btn btn-primary" onclick="updateOrderStatus('${order.id}', 'delivered')">Mark as Delivered</button>
            `;
            break;
        case 'delivered':
            buttons = `<span style="color: #4caf50; font-weight: bold;">✓ Order Delivered</span>`;
            break;
        default:
            buttons = '';
    }

    return buttons;
}

function updateOrderStatus(orderId, newStatus) {
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id === orderId);
    
    if (!order) {
        alert('Order not found!');
        return;
    }

    const statusMessages = {
        'confirmed': 'Order confirmed by farmer',
        'processing': 'Order is being processed',
        'shipped': 'Order has been shipped',
        'out_for_delivery': 'Order is out for delivery',
        'delivered': 'Order has been delivered',
        'cancelled': 'Order cancelled by farmer'
    };

    order.status = newStatus;
    order.tracking.push({
        status: newStatus,
        message: statusMessages[newStatus] || `Order status updated to ${newStatus}`,
        timestamp: new Date().toISOString()
    });

    // If delivered, release escrow payment
    if (newStatus === 'delivered' && order.paymentStatus === 'escrow') {
        order.paymentStatus = 'paid';
    }

    localStorage.setItem('orders', JSON.stringify(orders));
    
    if (newStatus === 'delivered') {
        alert('Order marked as delivered! Payment has been released from escrow.');
    } else {
        alert(`Order status updated to ${getStatusLabel(newStatus)}`);
    }
    
    loadOrders();
}

