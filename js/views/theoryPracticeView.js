// Theory and Practice View for Digital Skills E-Portfolio

function renderTheoryPracticeView() {
    const user = dataStore.getCurrentUser();
    
    if (!user) {
        router.navigate('/login');
        return;
    }
    
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
                    <button onclick="router.back()" class="btn btn-secondary btn-small">
                        ← Back
                    </button>
                    <h2 class="card-title" style="margin-top: 1rem;">Theory & Practice Resources</h2>
                    <p style="color: #6b7280; margin-top: 0.5rem;">
                        Educational materials and guidelines for surgical procedures
                    </p>
                </div>
                
                <div class="empty-state">
                    <div class="empty-state-icon">📚</div>
                    <div class="empty-state-text">Theory & Practice Module</div>
                    <p style="color: #9ca3af; max-width: 600px; margin: 1rem auto;">
                        This section would contain educational resources, theoretical knowledge assessments, 
                        and practice guidelines for each procedure in the curriculum. Features could include:
                    </p>
                    <ul style="text-align: left; max-width: 600px; margin: 1rem auto; color: #6b7280;">
                        <li>Video tutorials and demonstrations</li>
                        <li>Step-by-step procedure guides</li>
                        <li>Anatomy and physiology references</li>
                        <li>Quiz assessments</li>
                        <li>Clinical case studies</li>
                        <li>Best practice guidelines</li>
                    </ul>
                </div>
            </div>
        </div>
    `;
}
