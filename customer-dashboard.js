// Customer Dashboard JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if customer is logged in
    const customerLoggedIn = localStorage.getItem('customerLoggedIn');
    if (!customerLoggedIn) {
        window.location.href = 'customer-login.html';
        return;
    }

    // Load customer data
    const currentCustomer = JSON.parse(localStorage.getItem('currentCustomer') || '{}');
    const customerNameDisplay = document.getElementById('customerNameDisplay');
    if (customerNameDisplay) {
        customerNameDisplay.textContent = currentCustomer.name || 'Customer';
    }

    // Update stats
    updateStats();
});

function updateStats() {
    const currentCustomer = JSON.parse(localStorage.getItem('currentCustomer') || '{}');
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    
    const customerOrders = orders.filter(o => o.customerId === currentCustomer.id);
    const pendingOrders = customerOrders.filter(o => o.status !== 'delivered' && o.status !== 'cancelled');

    const totalOrdersEl = document.getElementById('customerTotalOrders');
    const pendingOrdersEl = document.getElementById('customerPendingOrders');
    const cartItemsEl = document.getElementById('customerCartItems');

    if (totalOrdersEl) totalOrdersEl.textContent = customerOrders.length;
    if (pendingOrdersEl) pendingOrdersEl.textContent = pendingOrders.length;
    if (cartItemsEl) cartItemsEl.textContent = cart.length;
}

