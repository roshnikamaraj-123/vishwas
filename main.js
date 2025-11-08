// Main JavaScript for index page
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    checkAuthStatus();
});

function checkAuthStatus() {
    const farmerLoggedIn = localStorage.getItem('farmerLoggedIn');
    const customerLoggedIn = localStorage.getItem('customerLoggedIn');
    
    // Update navigation based on login status
    // This can be expanded if needed
}

