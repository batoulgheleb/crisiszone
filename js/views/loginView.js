// Login View for Digital Skills E-Portfolio

function renderLoginView() {
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="login-container">
            <div class="login-card">
                <h2>Digital Skills E-Portfolio</h2>
                <p style="text-align: center; color: #6b7280; margin-bottom: 2rem;">
                    Medical Training & Assessment Platform
                </p>
                
                <form id="loginForm">
                    <div class="form-group">
                        <label for="email">Email</label>
                        <input 
                            type="email" 
                            id="email" 
                            class="form-control" 
                            placeholder="Enter your email"
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="password">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            class="form-control" 
                            placeholder="Enter your password"
                            required
                        >
                    </div>
                    
                    <div class="form-group">
                        <label for="role">Login As</label>
                        <select id="role" class="form-control" required>
                            <option value="">Select Role</option>
                            <option value="doctor">Junior Doctor</option>
                            <option value="supervisor">Supervisor</option>
                        </select>
                    </div>
                    
                    <div id="loginError" class="alert alert-error" style="display: none;"></div>
                    
                    <button type="submit" class="btn btn-primary" style="width: 100%;">
                        Login
                    </button>
                </form>
                
                <div style="margin-top: 2rem; padding-top: 1.5rem; border-top: 1px solid #e5e7eb;">
                    <p style="text-align: center; color: #6b7280; font-size: 0.875rem; margin-bottom: 0.5rem;">
                        <strong>Demo Credentials:</strong>
                    </p>
                    <p style="text-align: center; color: #6b7280; font-size: 0.875rem;">
                        <strong>Doctor:</strong> dr.brown@hospital.com / doctor123<br>
                        <strong>Supervisor:</strong> dr.smith@hospital.com / supervisor123
                    </p>
                </div>
            </div>
        </div>
    `;
    
    // Handle form submission
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
}

function handleLogin(event) {
    event.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const role = document.getElementById('role').value;
    const errorDiv = document.getElementById('loginError');
    
    // Clear previous errors
    errorDiv.style.display = 'none';
    errorDiv.textContent = '';
    
    // Validate inputs
    if (!email || !password || !role) {
        errorDiv.textContent = 'Please fill in all fields';
        errorDiv.style.display = 'block';
        return;
    }
    
    // Attempt login
    const result = dataStore.login(email, password, role);
    
    if (result.success) {
        // Navigate based on role
        if (result.user.role === 'doctor') {
            router.navigate('/doctor-dashboard');
        } else if (result.user.role === 'supervisor') {
            router.navigate('/supervisor-dashboard');
        }
    } else {
        errorDiv.textContent = result.message || 'Invalid email or password';
        errorDiv.style.display = 'block';
    }
}
