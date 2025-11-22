// Verification Form View for Digital Skills E-Portfolio

function renderVerificationForm(params) {
    const user = dataStore.getCurrentUser();
    
    if (!user || user.role !== 'supervisor') {
        router.navigate('/login');
        return;
    }
    
    const requestId = params.requestId;
    const request = dataStore.findRequestById(requestId);
    
    if (!request) {
        showError('Request not found');
        router.navigate('/supervisor-dashboard');
        return;
    }
    
    const doctor = dataStore.findDoctorById(request.doctorId);
    const procedure = dataStore.findProcedureById(request.procedureId);
    
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="header">
            <div class="header-content">
                <h1>Digital Skills E-Portfolio</h1>
                <div class="user-info">
                    <span>Dr. ${user.firstName} ${user.lastName} - Supervisor</span>
                    <button onclick="logout()" class="btn btn-secondary">Logout</button>
                </div>
            </div>
        </div>
        
        <div class="container">
            <div class="card">
                <div class="card-header">
                    <button onclick="router.navigate('/supervisor-dashboard')" class="btn btn-secondary btn-small">
                        ← Back to Dashboard
                    </button>
                    <h2 class="card-title" style="margin-top: 1rem;">Verify Procedure</h2>
                </div>
                
                <!-- Request Details -->
                <div class="card" style="background: #f9fafb;">
                    <h3 style="margin-bottom: 1rem;">Request Details</h3>
                    <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 1rem;">
                        <div>
                            <strong>Doctor:</strong> Dr. ${doctor ? `${doctor.firstName} ${doctor.lastName}` : 'Unknown'}
                        </div>
                        <div>
                            <strong>Procedure:</strong> ${procedure ? procedure.name : 'Unknown'}
                        </div>
                        <div>
                            <strong>Level Requested:</strong> ${request.requestedLevel}
                        </div>
                        <div>
                            <strong>Date Performed:</strong> ${formatDate(request.datePerformed)}
                        </div>
                        <div>
                            <strong>Location:</strong> ${request.location}
                        </div>
                        <div>
                            <strong>Urgency:</strong> ${request.urgency}
                        </div>
                    </div>
                    <div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid #e5e7eb;">
                        <strong>Doctor's Notes:</strong>
                        <p style="margin-top: 0.5rem; color: #6b7280;">${request.notes}</p>
                    </div>
                </div>
                
                <!-- Verification Form -->
                <form id="verificationForm">
                    <input type="hidden" id="requestId" value="${requestId}">
                    
                    <div class="form-group">
                        <label for="skillLevel">Skill Level Assessment *</label>
                        <select id="skillLevel" class="form-control" required>
                            <option value="">Select skill level</option>
                            <option value="Observed" ${request.requestedLevel === 'Observed' ? 'selected' : ''}>Observed</option>
                            <option value="Assisted" ${request.requestedLevel === 'Assisted' ? 'selected' : ''}>Assisted</option>
                            <option value="Supervised" ${request.requestedLevel === 'Supervised' ? 'selected' : ''}>Supervised</option>
                            <option value="Independent" ${request.requestedLevel === 'Independent' ? 'selected' : ''}>Independent</option>
                        </select>
                        <small style="color: #6b7280;">Requested: ${request.requestedLevel}</small>
                    </div>
                    
                    <div class="form-group">
                        <label>Performance Rating *</label>
                        <div id="rating" class="star-rating">
                            <span class="star" data-rating="1">★</span>
                            <span class="star" data-rating="2">★</span>
                            <span class="star" data-rating="3">★</span>
                            <span class="star" data-rating="4">★</span>
                            <span class="star" data-rating="5">★</span>
                        </div>
                        <input type="hidden" id="ratingValue" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="notes">Supervisor Notes *</label>
                        <textarea id="notes" class="form-control" rows="6" placeholder="Provide detailed feedback on the trainee's performance, technique, decision-making, and areas for improvement..." required></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="strengths">Areas of Strength (optional)</label>
                        <textarea id="strengths" class="form-control" rows="3" placeholder="List specific strengths demonstrated (one per line)"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="improvements">Areas for Improvement (optional)</label>
                        <textarea id="improvements" class="form-control" rows="3" placeholder="List specific areas for development (one per line)"></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label>
                            <input type="checkbox" id="followUp" style="margin-right: 0.5rem;">
                            Follow-up training required
                        </label>
                    </div>
                    
                    <div id="verificationError" class="alert alert-error" style="display: none;"></div>
                    
                    <div style="display: flex; gap: 1rem;">
                        <button type="submit" class="btn btn-success">Submit Verification</button>
                        <button type="button" onclick="router.navigate('/supervisor-dashboard')" class="btn btn-secondary">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Setup star rating
    setupStarRating();
    
    document.getElementById('verificationForm').addEventListener('submit', handleVerificationSubmit);
}

function setupStarRating() {
    const stars = document.querySelectorAll('.star');
    const ratingInput = document.getElementById('ratingValue');
    
    stars.forEach(star => {
        star.addEventListener('click', function() {
            const rating = parseInt(this.getAttribute('data-rating'));
            ratingInput.value = rating;
            
            stars.forEach((s, index) => {
                if (index < rating) {
                    s.classList.add('active');
                } else {
                    s.classList.remove('active');
                }
            });
        });
    });
}

function handleVerificationSubmit(event) {
    event.preventDefault();
    
    const user = dataStore.getCurrentUser();
    const errorDiv = document.getElementById('verificationError');
    const requestId = document.getElementById('requestId').value;
    const rating = parseInt(document.getElementById('ratingValue').value);
    
    if (!rating) {
        errorDiv.textContent = 'Please select a rating';
        errorDiv.style.display = 'block';
        return;
    }
    
    const skillLevel = document.getElementById('skillLevel').value;
    const notes = document.getElementById('notes').value;
    const strengthsText = document.getElementById('strengths').value;
    const improvementsText = document.getElementById('improvements').value;
    const followUp = document.getElementById('followUp').checked;
    
    // Parse strengths and improvements
    const areasOfStrength = strengthsText ? strengthsText.split('\n').filter(s => s.trim()) : [];
    const areasForImprovement = improvementsText ? improvementsText.split('\n').filter(s => s.trim()) : [];
    
    const result = submitVerification(
        requestId,
        user.id,
        rating,
        skillLevel,
        notes,
        areasOfStrength,
        areasForImprovement,
        followUp
    );
    
    if (result.success) {
        showSuccess('Verification submitted successfully!');
        router.navigate('/supervisor-dashboard');
    } else {
        errorDiv.textContent = result.message;
        errorDiv.style.display = 'block';
    }
}
