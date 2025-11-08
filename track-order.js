// Track Order JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if order ID is in URL
    const urlParams = new URLSearchParams(window.location.search);
    const orderId = urlParams.get('id');
    if (orderId) {
        document.getElementById('orderIdInput').value = orderId;
        trackOrder();
    }
});

function trackOrder() {
    const orderId = document.getElementById('orderIdInput').value.trim();
    
    if (!orderId) {
        alert('Please enter an order ID!');
        return;
    }

    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.id === orderId);

    const orderTracking = document.getElementById('orderTracking');
    if (!orderTracking) return;

    if (!order) {
        orderTracking.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">❌</div>
                <h3>Order not found</h3>
                <p>Please check your order ID and try again.</p>
            </div>
        `;
        return;
    }

    // Display order details and tracking
    const statusSteps = [
        { key: 'pending', label: 'Order Placed', icon: '📦' },
        { key: 'confirmed', label: 'Order Confirmed', icon: '✓' },
        { key: 'processing', label: 'Processing', icon: '⚙️' },
        { key: 'shipped', label: 'Shipped', icon: '🚚' },
        { key: 'out_for_delivery', label: 'Out for Delivery', icon: '🏍️' },
        { key: 'delivered', label: 'Delivered', icon: '✅' }
    ];

    const currentStatusIndex = statusSteps.findIndex(s => s.key === order.status);
    
    let trackingHTML = `
        <div style="background: white; padding: 2rem; border-radius: 10px; margin-bottom: 2rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="color: #2d5016; margin-bottom: 1rem;">Order Details</h3>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1rem;">
                <div>
                    <strong>Order ID:</strong><br>
                    ${order.id}
                </div>
                <div>
                    <strong>Order Date:</strong><br>
                    ${formatDateTime(order.createdAt)}
                </div>
                <div>
                    <strong>Total Amount:</strong><br>
                    ₹${order.total.toFixed(2)}
                </div>
                <div>
                    <strong>Payment Status:</strong><br>
                    ${getPaymentStatusLabel(order.paymentStatus)}
                </div>
            </div>
            <div style="margin-top: 1rem;">
                <strong>Delivery Address:</strong><br>
                ${order.deliveryAddress}
            </div>
        </div>
        <div style="background: white; padding: 2rem; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h3 style="color: #2d5016; margin-bottom: 1rem;">Order Status</h3>
            <div class="tracking-status">
    `;

    statusSteps.forEach((step, index) => {
        let stepClass = '';
        if (index < currentStatusIndex) {
            stepClass = 'completed';
        } else if (index === currentStatusIndex) {
            stepClass = 'active';
        }

        trackingHTML += `
            <div class="status-step ${stepClass}">
                <div class="status-icon">${step.icon}</div>
                <div>
                    <strong>${step.label}</strong>
                    ${index === currentStatusIndex && order.tracking && order.tracking.length > 0 ? 
                        `<div style="color: #666; font-size: 0.9rem; margin-top: 0.25rem;">${order.tracking[order.tracking.length - 1].message || ''}</div>` : ''}
                </div>
            </div>
        `;
    });

    trackingHTML += `
            </div>
        </div>
    `;

    if (order.tracking && order.tracking.length > 0) {
        trackingHTML += `
            <div style="background: white; padding: 2rem; border-radius: 10px; margin-top: 2rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                <h3 style="color: #2d5016; margin-bottom: 1rem;">Tracking History</h3>
                <div style="display: flex; flex-direction: column; gap: 1rem;">
        `;

        order.tracking.reverse().forEach(track => {
            trackingHTML += `
                <div style="padding: 1rem; background: #f8f9fa; border-radius: 5px; border-left: 3px solid #4a7c2a;">
                    <strong>${track.message}</strong>
                    <div style="color: #666; font-size: 0.9rem; margin-top: 0.25rem;">
                        ${formatDateTime(track.timestamp)}
                    </div>
                </div>
            `;
        });

        trackingHTML += `
                </div>
            </div>
        `;
    }

    orderTracking.innerHTML = trackingHTML;
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

function getPaymentStatusLabel(status) {
    const labels = {
        'pending': 'Pending',
        'escrow': 'Escrow (Held)',
        'paid': 'Paid',
        'failed': 'Failed'
    };
    return labels[status] || status;
}

