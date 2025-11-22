// Data Store - In-memory database for Digital Skills E-Portfolio

class DataStore {
    constructor() {
        this.doctors = [];
        this.supervisors = [];
        this.curricula = [];
        this.verifications = [];
        this.requests = [];
        this.currentUser = null;
        this.transactionState = null;
    }

    // Initialize with sample data
    initialize(sampleData) {
        this.doctors = sampleData.doctors || [];
        this.supervisors = sampleData.supervisors || [];
        this.curricula = sampleData.curricula || [];
        this.verifications = sampleData.verifications || [];
        this.requests = sampleData.requests || [];
    }

    // Transaction support
    beginTransaction() {
        this.transactionState = {
            doctors: deepClone(this.doctors),
            supervisors: deepClone(this.supervisors),
            curricula: deepClone(this.curricula),
            verifications: deepClone(this.verifications),
            requests: deepClone(this.requests)
        };
    }

    commitTransaction() {
        this.transactionState = null;
    }

    rollbackTransaction() {
        if (this.transactionState) {
            this.doctors = this.transactionState.doctors;
            this.supervisors = this.transactionState.supervisors;
            this.curricula = this.transactionState.curricula;
            this.verifications = this.transactionState.verifications;
            this.requests = this.transactionState.requests;
            this.transactionState = null;
        }
    }

    // Authentication
    login(email, password, role) {
        let user = null;
        
        if (role === 'doctor') {
            user = this.doctors.find(d => d.email === email && d.password === password);
        } else if (role === 'supervisor') {
            user = this.supervisors.find(s => s.email === email && s.password === password);
        }
        
        if (user) {
            this.currentUser = { ...user };
            return { success: true, user: this.currentUser };
        }
        
        return { success: false, message: 'Invalid credentials' };
    }

    logout() {
        this.currentUser = null;
    }

    getCurrentUser() {
        return this.currentUser;
    }

    // Doctor CRUD
    findDoctorById(id) {
        return this.doctors.find(d => d.id === id);
    }

    findDoctorByEmail(email) {
        return this.doctors.find(d => d.email === email);
    }

    createDoctor(doctor) {
        this.doctors.push(doctor);
        return doctor;
    }

    updateDoctor(id, updates) {
        const index = this.doctors.findIndex(d => d.id === id);
        if (index !== -1) {
            this.doctors[index] = { ...this.doctors[index], ...updates, updatedAt: new Date().toISOString() };
            return this.doctors[index];
        }
        return null;
    }

    deleteDoctor(id) {
        const index = this.doctors.findIndex(d => d.id === id);
        if (index !== -1) {
            this.doctors.splice(index, 1);
            return true;
        }
        return false;
    }

    // Supervisor CRUD
    findSupervisorById(id) {
        return this.supervisors.find(s => s.id === id);
    }

    findSupervisorByEmail(email) {
        return this.supervisors.find(s => s.email === email);
    }

    findSupervisorsByIds(ids) {
        return this.supervisors.filter(s => ids.includes(s.id));
    }

    createSupervisor(supervisor) {
        this.supervisors.push(supervisor);
        return supervisor;
    }

    updateSupervisor(id, updates) {
        const index = this.supervisors.findIndex(s => s.id === id);
        if (index !== -1) {
            this.supervisors[index] = { ...this.supervisors[index], ...updates, updatedAt: new Date().toISOString() };
            return this.supervisors[index];
        }
        return null;
    }

    deleteSupervisor(id) {
        const index = this.supervisors.findIndex(s => s.id === id);
        if (index !== -1) {
            this.supervisors.splice(index, 1);
            return true;
        }
        return false;
    }

    getAllSupervisors() {
        return this.supervisors;
    }

    // Curriculum CRUD
    findCurriculumById(id) {
        return this.curricula.find(c => c.id === id);
    }

    findCurriculumBySpecialty(specialty) {
        return this.curricula.find(c => c.specialty === specialty);
    }

    createCurriculum(curriculum) {
        this.curricula.push(curriculum);
        return curriculum;
    }

    updateCurriculum(id, updates) {
        const index = this.curricula.findIndex(c => c.id === id);
        if (index !== -1) {
            this.curricula[index] = { ...this.curricula[index], ...updates, updatedAt: new Date().toISOString() };
            return this.curricula[index];
        }
        return null;
    }

    deleteCurriculum(id) {
        const index = this.curricula.findIndex(c => c.id === id);
        if (index !== -1) {
            this.curricula.splice(index, 1);
            return true;
        }
        return false;
    }

    getAllCurricula() {
        return this.curricula;
    }

    // Procedure helpers
    findProcedureById(procedureId) {
        for (const curriculum of this.curricula) {
            const procedure = curriculum.procedures.find(p => p.id === procedureId);
            if (procedure) {
                return procedure;
            }
        }
        return null;
    }

    // Verification CRUD
    findVerificationById(id) {
        return this.verifications.find(v => v.id === id);
    }

    findVerificationsByDoctorId(doctorId) {
        return this.verifications.filter(v => v.doctorId === doctorId);
    }

    findVerificationsBySupervisorId(supervisorId) {
        return this.verifications.filter(v => v.supervisorId === supervisorId);
    }

    findVerificationsByProcedureId(procedureId) {
        return this.verifications.filter(v => v.procedureId === procedureId);
    }

    findVerificationsByDoctorAndProcedure(doctorId, procedureId) {
        return this.verifications.filter(v => v.doctorId === doctorId && v.procedureId === procedureId);
    }

    createVerification(verification) {
        this.verifications.push(verification);
        return verification;
    }

    updateVerification(id, updates) {
        const index = this.verifications.findIndex(v => v.id === id);
        if (index !== -1) {
            this.verifications[index] = { ...this.verifications[index], ...updates, updatedAt: new Date().toISOString() };
            return this.verifications[index];
        }
        return null;
    }

    deleteVerification(id) {
        const index = this.verifications.findIndex(v => v.id === id);
        if (index !== -1) {
            this.verifications.splice(index, 1);
            return true;
        }
        return false;
    }

    getAllVerifications() {
        return this.verifications;
    }

    // Request CRUD
    findRequestById(id) {
        return this.requests.find(r => r.id === id);
    }

    findRequestsByDoctorId(doctorId) {
        return this.requests.filter(r => r.doctorId === doctorId);
    }

    findRequestsBySupervisorId(supervisorId) {
        return this.requests.filter(r => r.supervisorId === supervisorId);
    }

    findRequestsByStatus(status) {
        return this.requests.filter(r => r.status === status);
    }

    createRequest(request) {
        this.requests.push(request);
        return request;
    }

    updateRequest(id, updates) {
        const index = this.requests.findIndex(r => r.id === id);
        if (index !== -1) {
            this.requests[index] = { ...this.requests[index], ...updates, updatedAt: new Date().toISOString() };
            return this.requests[index];
        }
        return null;
    }

    deleteRequest(id) {
        const index = this.requests.findIndex(r => r.id === id);
        if (index !== -1) {
            this.requests.splice(index, 1);
            return true;
        }
        return false;
    }

    deleteRequestById(id) {
        return this.deleteRequest(id);
    }

    getAllRequests() {
        return this.requests;
    }

    // Statistics helpers
    getDoctorStats(doctorId) {
        const verifications = this.findVerificationsByDoctorId(doctorId);
        const requests = this.findRequestsByDoctorId(doctorId);
        
        return {
            totalVerifications: verifications.length,
            pendingRequests: requests.filter(r => r.status === 'Pending').length,
            averageRating: verifications.length > 0 
                ? verifications.reduce((sum, v) => sum + v.rating, 0) / verifications.length 
                : 0
        };
    }

    getSupervisorStats(supervisorId) {
        const verifications = this.findVerificationsBySupervisorId(supervisorId);
        const requests = this.findRequestsBySupervisorId(supervisorId);
        
        return {
            totalVerifications: verifications.length,
            pendingRequests: requests.filter(r => r.status === 'Pending').length,
            doctorsSupervised: new Set(verifications.map(v => v.doctorId)).size
        };
    }
}

// Create global data store instance
const dataStore = new DataStore();
