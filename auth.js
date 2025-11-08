// Authentication JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Farmer Login
    const farmerLoginForm = document.getElementById('farmerLoginForm');
    if (farmerLoginForm) {
        farmerLoginForm.addEventListener('submit', handleFarmerLogin);
    }

    // Customer Login
    const customerLoginForm = document.getElementById('customerLoginForm');
    if (customerLoginForm) {
        customerLoginForm.addEventListener('submit', handleCustomerLogin);
    }

    // Farmer Register
    const farmerRegisterForm = document.getElementById('farmerRegisterForm');
    if (farmerRegisterForm) {
        farmerRegisterForm.addEventListener('submit', handleFarmerRegister);
    }

    // Customer Register
    const customerRegisterForm = document.getElementById('customerRegisterForm');
    if (customerRegisterForm) {
        customerRegisterForm.addEventListener('submit', handleCustomerRegister);
    }

    // Logout handlers
    const farmerLogout = document.getElementById('farmerLogout');
    if (farmerLogout) {
        farmerLogout.addEventListener('click', handleFarmerLogout);
    }

    const customerLogout = document.getElementById('customerLogout');
    if (customerLogout) {
        customerLogout.addEventListener('click', handleCustomerLogout);
    }
});

function handleFarmerLogin(e) {
    e.preventDefault();
    const email = document.getElementById('farmerEmail').value;
    const password = document.getElementById('farmerPassword').value;

    // Get farmers from localStorage
    const farmers = JSON.parse(localStorage.getItem('farmers') || '[]');
    const farmer = farmers.find(f => f.email === email && f.password === password);

    if (farmer) {
        localStorage.setItem('farmerLoggedIn', 'true');
        localStorage.setItem('currentFarmer', JSON.stringify(farmer));
        alert('Login successful!');
        window.location.href = 'farmer-dashboard.html';
    } else {
        alert('Invalid email or password!');
    }
}

function handleCustomerLogin(e) {
    e.preventDefault();
    const email = document.getElementById('customerEmail').value;
    const password = document.getElementById('customerPassword').value;

    // Get customers from localStorage
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const customer = customers.find(c => c.email === email && c.password === password);

    if (customer) {
        localStorage.setItem('customerLoggedIn', 'true');
        localStorage.setItem('currentCustomer', JSON.stringify(customer));
        alert('Login successful!');
        window.location.href = 'customer-dashboard.html';
    } else {
        alert('Invalid email or password!');
    }
}

function handleFarmerRegister(e) {
    e.preventDefault();
    const farmer = {
        id: Date.now().toString(),
        name: document.getElementById('farmerName').value,
        email: document.getElementById('farmerEmailReg').value,
        phone: document.getElementById('farmerPhone').value,
        address: document.getElementById('farmerAddress').value,
        password: document.getElementById('farmerPasswordReg').value
    };

    // Get existing farmers
    const farmers = JSON.parse(localStorage.getItem('farmers') || '[]');
    
    // Check if email already exists
    if (farmers.find(f => f.email === farmer.email)) {
        alert('Email already registered!');
        return;
    }

    farmers.push(farmer);
    localStorage.setItem('farmers', JSON.stringify(farmers));
    alert('Registration successful! Please login.');
    window.location.href = 'farmer-login.html';
}

function handleCustomerRegister(e) {
    e.preventDefault();
    const customer = {
        id: Date.now().toString(),
        name: document.getElementById('customerName').value,
        email: document.getElementById('customerEmailReg').value,
        phone: document.getElementById('customerPhone').value,
        address: document.getElementById('customerAddress').value,
        password: document.getElementById('customerPasswordReg').value
    };

    // Get existing customers
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    
    // Check if email already exists
    if (customers.find(c => c.email === customer.email)) {
        alert('Email already registered!');
        return;
    }

    customers.push(customer);
    localStorage.setItem('customers', JSON.stringify(customers));
    alert('Registration successful! Please login.');
    window.location.href = 'customer-login.html';
}

function handleFarmerLogout(e) {
    e.preventDefault();
    localStorage.removeItem('farmerLoggedIn');
    localStorage.removeItem('currentFarmer');
    alert('Logged out successfully!');
    window.location.href = 'index.html';
}

function handleCustomerLogout(e) {
    e.preventDefault();
    localStorage.removeItem('customerLoggedIn');
    localStorage.removeItem('currentCustomer');
    alert('Logged out successfully!');
    window.location.href = 'index.html';
}

