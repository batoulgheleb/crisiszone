// Supervisor Dashboard View for Digital Skills E-Portfolio

function renderSupervisorDashboard() {
    const user = dataStore.getCurrentUser();
    
    if (!user || user.role !== 'supervisor') {
        router.navigate('/login');
        return;
    }
    
    const stats = dataStore.getSupervisorStats(user.id);
    const requests = dataStore.findRequestsBySupervisorId(user.id).filter(r => r.status === 'Pending');
    const verifications = dataStore.findVerificationsBySupervisorId(user.id);
    
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
                    <h2 class="card-title">Supervisor Dashboard</h2>
                    <p style="color: #6b7280; margin-top: 0.5rem;">
                        ${user.title} - ${user.specialty}
                    </p>
                </div>
                
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${stats.pendingRequests}</div>
                        <div class="stat-label">Pending Requests</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.totalVerifications}</div>
                        <div class="stat-label">Total Verifications</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.doctorsSupervised}</div>
                        <div class="stat-label">Doctors Supervised</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${user.yearsOfExperience}</div>
                        <div class="stat-label">Years Experience</div>
                    </div>
                </div>
            </div>
            
            <div class="card">
                <h3 style="margin-bottom: 1.5rem;">Pending Verification Requests</h3>
                
                ${requests.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-state-icon">✅</div>
                        <div class="empty-state-text">No pending requests</div>
                        <p style="color: #9ca3af;">All verification requests have been completed</p>
                    </div>
                ` : requests.map(req => renderSupervisorRequestCard(req)).join('')}
            </div>
            
            <div class="card">
                <h3 style="margin-bottom: 1.5rem;">Recent Verifications</h3>
                
                ${verifications.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-state-icon">📝</div>
                        <div class="empty-state-text">No verifications yet</div>
                    </div>
                ` : verifications.slice(0, 5).map(ver => renderVerificationCard(ver)).join('')}
            </div>
        </div>
    `;
}

function renderSupervisorRequestCard(request) {
    const doctor = dataStore.findDoctorById(request.doctorId);
    const procedure = dataStore.findProcedureById(request.procedureId);
    
    return `
        <div class="request-card">
            <div class="request-header">
                <div class="request-info">
                    <div class="request-title">${procedure ? procedure.name : 'Unknown Procedure'}</div>
                    <div class="request-meta">
                        <strong>Doctor:</strong> ${doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Unknown'}
                    </div>
                    <div class="request-meta">
                        <strong>Level Requested:</strong> ${request.requestedLevel}
                    </div>
                    <div class="request-meta">
                        <strong>Date Performed:</strong> ${formatDate(request.datePerformed)}
                    </div>
                    <div class="request-meta">
                        <strong>Location:</strong> ${request.location} | <strong>Urgency:</strong> ${request.urgency}
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 0.75rem; padding: 0.75rem; background: #f9fafb; border-radius: 4px;">
                <strong style="display: block; margin-bottom: 0.25rem; color: #374151;">Doctor's Notes:</strong>
                <p style="color: #6b7280; margin: 0;">${request.notes}</p>
            </div>
            
            <div class="request-actions">
                <button onclick="verifyRequest('${request.id}')" class="btn btn-success">
                    Verify
                </button>
            </div>
        </div>
    `;
}

function renderVerificationCard(verification) {
    const doctor = dataStore.findDoctorById(verification.doctorId);
    const procedure = dataStore.findProcedureById(verification.procedureId);
    
    return `
        <div class="request-card">
            <div class="request-header">
                <div class="request-info">
                    <div class="request-title">${procedure ? procedure.name : 'Unknown Procedure'}</div>
                    <div class="request-meta">
                        <strong>Doctor:</strong> ${doctor ? `Dr. ${doctor.firstName} ${doctor.lastName}` : 'Unknown'}
                    </div>
                    <div class="request-meta">
                        <strong>Level:</strong> ${verification.skillLevel} | 
                        <strong>Rating:</strong> ${'⭐'.repeat(verification.rating)}
                    </div>
                    <div class="request-meta">
                        <strong>Verified:</strong> ${formatDate(verification.dateVerified)}
                    </div>
                </div>
            </div>
        </div>
    `;
}

function verifyRequest(requestId) {
    router.navigate('/verification-form', { requestId });
}
