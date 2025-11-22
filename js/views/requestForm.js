// Request Form View for Digital Skills E-Portfolio

function renderRequestForm() {
    const user = dataStore.getCurrentUser();
    
    if (!user || user.role !== 'doctor') {
        router.navigate('/login');
        return;
    }
    
    const curriculum = dataStore.findCurriculumById(user.curriculumId);
    const supervisors = dataStore.findSupervisorsByIds(user.supervisors);
    
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
                    <button onclick="router.navigate('/doctor-dashboard')" class="btn btn-secondary btn-small">
                        ← Back to Dashboard
                    </button>
                    <h2 class="card-title" style="margin-top: 1rem;">Request Verification</h2>
                </div>
                
                <form id="requestForm">
                    <div class="form-group">
                        <label for="procedure">Procedure *</label>
                        <select id="procedure" class="form-control" required>
                            <option value="">Select a procedure</option>
                            ${curriculum.procedures.map(p => `
                                <option value="${p.id}">${p.name} (${p.code})</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="supervisor">Supervisor *</label>
                        <select id="supervisor" class="form-control" required>
                            <option value="">Select a supervisor</option>
                            ${supervisors.map(s => `
                                <option value="${s.id}">Dr. ${s.firstName} ${s.lastName} - ${s.title}</option>
                            `).join('')}
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="skillLevel">Skill Level Achieved *</label>
                        <select id="skillLevel" class="form-control" required>
                            <option value="">Select skill level</option>
                            <option value="Observed">Observed</option>
                            <option value="Assisted">Assisted</option>
                            <option value="Supervised">Supervised</option>
                            <option value="Independent">Independent</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="datePerformed">Date Performed *</label>
                        <input type="date" id="datePerformed" class="form-control" required max="${new Date().toISOString().split('T')[0]}">
                    </div>
                    
                    <div class="form-group">
                        <label for="location">Location *</label>
                        <input type="text" id="location" class="form-control" placeholder="e.g., OR-3, Emergency Room" required>
                    </div>
                    
                    <div class="form-group">
                        <label for="urgency">Urgency *</label>
                        <select id="urgency" class="form-control" required>
                            <option value="">Select urgency</option>
                            <option value="Routine">Routine</option>
                            <option value="Urgent">Urgent</option>
                            <option value="Emergency">Emergency</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="patientAge">Patient Age (optional)</label>
                        <input type="number" id="patientAge" class="form-control" min="0" max="120">
                    </div>
                    
                    <div class="form-group">
                        <label for="patientSex">Patient Sex (optional)</label>
                        <select id="patientSex" class="form-control">
                            <option value="">Select</option>
                            <option value="M">Male</option>
                            <option value="F">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>
                    
                    <div class="form-group">
                        <label for="notes">Procedure Notes *</label>
                        <textarea id="notes" class="form-control" rows="5" placeholder="Describe the procedure, patient condition, your role, and any notable outcomes..." required></textarea>
                    </div>
                    
                    <div class="form-group">
                        <label for="complications">Complications (optional)</label>
                        <textarea id="complications" class="form-control" rows="3" placeholder="Describe any complications encountered..."></textarea>
                    </div>
                    
                    <div id="requestError" class="alert alert-error" style="display: none;"></div>
                    
                    <div style="display: flex; gap: 1rem;">
                        <button type="submit" class="btn btn-primary">Submit Request</button>
                        <button type="button" onclick="router.navigate('/doctor-dashboard')" class="btn btn-secondary">Cancel</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    document.getElementById('requestForm').addEventListener('submit', handleRequestSubmit);
}

function handleRequestSubmit(event) {
    event.preventDefault();
    
    const user = dataStore.getCurrentUser();
    const errorDiv = document.getElementById('requestError');
    
    const formData = {
        doctorId: user.id,
        supervisorId: document.getElementById('supervisor').value,
        procedureId: document.getElementById('procedure').value,
        requestedLevel: document.getElementById('skillLevel').value,
        datePerformed: document.getElementById('datePerformed').value,
        notes: document.getElementById('notes').value,
        location: document.getElementById('location').value,
        urgency: document.getElementById('urgency').value,
        patientAge: document.getElementById('patientAge').value ? parseInt(document.getElementById('patientAge').value) : undefined,
        patientSex: document.getElementById('patientSex').value || undefined,
        complications: document.getElementById('complications').value || undefined
    };
    
    const result = submitRequest(
        formData.doctorId,
        formData.supervisorId,
        formData.procedureId,
        formData.requestedLevel,
        formData.datePerformed,
        formData.notes,
        formData.location,
        formData.urgency,
        formData.patientAge,
        formData.patientSex,
        formData.complications
    );
    
    if (result.success) {
        showSuccess('Verification request submitted successfully!');
        router.navigate('/doctor-dashboard');
    } else {
        errorDiv.textContent = result.message;
        errorDiv.style.display = 'block';
    }
}
