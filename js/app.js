// Main Application Entry Point for Digital Skills E-Portfolio

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('Digital Skills E-Portfolio - Initializing...');
    
    // Register all routes
    router.register('/login', renderLoginView);
    router.register('/doctor-dashboard', renderDoctorDashboard);
    router.register('/supervisor-dashboard', renderSupervisorDashboard);
    router.register('/request-form', renderRequestForm);
    router.register('/verification-form', renderVerificationForm);
    router.register('/theory-practice', renderTheoryPracticeView);
    
    // Initialize router (this will trigger the initial route)
    router.init();
    
    console.log('Application initialized successfully');
});

// Global logout function
function logout() {
    dataStore.logout();
    router.navigate('/login');
}
