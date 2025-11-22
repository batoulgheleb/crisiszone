// Doctor Dashboard View for Digital Skills E-Portfolio

function renderDoctorDashboard() {
    const user = dataStore.getCurrentUser();
    
    if (!user || user.role !== 'doctor') {
        router.navigate('/login');
        return;
    }
    
    // Get doctor's progress
    const progress = getDoctorProgress(user.id);
    const stats = dataStore.getDoctorStats(user.id);
    const requests = dataStore.findRequestsByDoctorId(user.id);
    const curriculum = dataStore.findCurriculumById(user.curriculumId);
    
    const app = document.getElementById('app');
    
    app.innerHTML = `
        <div class="header">
            <div class="header-content">
                <h1>Digital Skills E-Portfolio</h1>
                <div class="user-info">
                    <span>Dr. ${user.firstName} ${user.lastName}</span>
                    <button onclick="logout()" class="btn btn-secondary">Logout</button>
                </div>
            </div>
        </div>
        
        <div class="container">
            <div class="card">
                <div class="card-header">
                    <h2 class="card-title">My Dashboard</h2>
                    <p style="color: #6b7280; margin-top: 0.5rem;">
                        ${user.specialty} - Year ${user.yearOfTraining} Training
                    </p>
                </div>
                
                <!-- Stats Grid -->
                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-value">${progress.overallPercentage}%</div>
                        <div class="stat-label">Overall Progress</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${progress.completedProcedures}</div>
                        <div class="stat-label">Completed Procedures</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.totalVerifications}</div>
                        <div class="stat-label">Total Verifications</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-value">${stats.pendingRequests}</div>
                        <div class="stat-label">Pending Requests</div>
                    </div>
                </div>
                
                <!-- Overall Progress Bar -->
                <div class="progress-container">
                    <div class="progress-header">
                        <span class="progress-label">Curriculum Progress</span>
                        <span class="progress-percentage">${progress.overallPercentage}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${progress.overallPercentage}%"></div>
                    </div>
                    <p style="color: #6b7280; font-size: 0.875rem; margin-top: 0.5rem;">
                        ${progress.completedProcedures} of ${progress.totalProcedures} procedures completed
                    </p>
                </div>
            </div>
            
            <!-- Tabs -->
            <div class="tabs" style="margin-top: 2rem;">
                <button class="tab active" onclick="switchTab('procedures')">My Procedures</button>
                <button class="tab" onclick="switchTab('requests')">My Requests</button>
            </div>
            
            <!-- Procedures Tab -->
            <div id="procedures-tab" class="tab-content active">
                <div style="margin-bottom: 1rem; display: flex; justify-content: space-between; align-items: center;">
                    <h3>Procedure Progress</h3>
                    <button onclick="router.navigate('/request-form')" class="btn btn-primary">
                        Request Verification
                    </button>
                </div>
                
                <ul class="procedure-list">
                    ${renderProcedureList(progress.procedureProgress)}
                </ul>
            </div>
            
            <!-- Requests Tab -->
            <div id="requests-tab" class="tab-content">
                <h3 style="margin-bottom: 1rem;">Pending Verification Requests</h3>
                
                ${requests.length === 0 ? `
                    <div class="empty-state">
                        <div class="empty-state-icon">📋</div>
                        <div class="empty-state-text">No pending requests</div>
                        <p style="color: #9ca3af;">Submit a verification request to get started</p>
                    </div>
                ` : requests.map(req => renderRequestCard(req)).join('')}
            </div>
        </div>
    `;
}

function renderProcedureList(procedures) {
    return procedures.map(proc => `
        <li class="procedure-item">
            <div class="procedure-header">
                <div>
                    <div class="procedure-name">${proc.procedureName}</div>
                    <div class="procedure-code">${proc.procedureCode}</div>
                </div>
                <span class="badge ${getStatusBadgeClass(proc.status)}">${proc.status}</span>
            </div>
            
            <div class="procedure-meta">
                <span>📊 Category: ${proc.category}</span>
                <span>📈 Level: ${proc.currentLevel || 'Not Started'}</span>
                <span>✅ Cases: ${proc.completedCases}/${proc.minimumCasesRequired}</span>
            </div>
            
            <div class="procedure-progress">
                <div class="progress-header">
                    <span class="progress-label">Progress</span>
                    <span class="progress-percentage">${proc.percentageComplete}%</span>
                </div>
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${proc.percentageComplete}%"></div>
                </div>
            </div>
            
            ${proc.verifications.length > 0 ? `
                <details style="margin-top: 1rem;">
                    <summary style="cursor: pointer; color: #2563eb; font-weight: 500;">
                        View ${proc.verifications.length} verification(s)
                    </summary>
                    <div style="margin-top: 0.75rem; padding-left: 1rem;">
                        ${proc.verifications.map(v => `
                            <div style="padding: 0.5rem; border-left: 2px solid #e5e7eb; margin-bottom: 0.5rem;">
                                <strong>${v.skillLevel}</strong> - Rating: ${'⭐'.repeat(v.rating)}
                                <br>
                                <small style="color: #6b7280;">
                                    ${formatDate(v.datePerformed)} by ${v.supervisorName}
                                </small>
                            </div>
                        `).join('')}
                    </div>
                </details>
            ` : ''}
        </li>
    `).join('');
}

function renderRequestCard(request) {
    const procedure = dataStore.findProcedureById(request.procedureId);
    const supervisor = dataStore.findSupervisorById(request.supervisorId);
    
    return `
        <div class="request-card">
            <div class="request-header">
                <div class="request-info">
                    <div class="request-title">${procedure ? procedure.name : 'Unknown Procedure'}</div>
                    <div class="request-meta">
                        <strong>Supervisor:</strong> ${supervisor ? `Dr. ${supervisor.firstName} ${supervisor.lastName}` : 'Unknown'}
                    </div>
                    <div class="request-meta">
                        <strong>Level Requested:</strong> ${request.requestedLevel}
                    </div>
                    <div class="request-meta">
                        <strong>Date Performed:</strong> ${formatDate(request.datePerformed)}
                    </div>
                    <div class="request-meta">
                        <strong>Status:</strong> <span class="badge ${getStatusBadgeClass(request.status)}">${request.status}</span>
                    </div>
                </div>
            </div>
            
            <div style="margin-top: 0.75rem; padding: 0.75rem; background: #f9fafb; border-radius: 4px;">
                <strong style="display: block; margin-bottom: 0.25rem; color: #374151;">Your Notes:</strong>
                <p style="color: #6b7280; margin: 0;">${request.notes}</p>
            </div>
            
            <div style="margin-top: 0.75rem; font-size: 0.875rem; color: #6b7280;">
                Submitted ${getRelativeTime(request.createdAt)}
            </div>
        </div>
    `;
}

function switchTab(tabName) {
    // Hide all tabs
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // Show selected tab
    document.getElementById(`${tabName}-tab`).classList.add('active');
    event.target.classList.add('active');
}
