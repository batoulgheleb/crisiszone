// Core Business Logic Functions for Digital Skills E-Portfolio

/**
 * Calculate comprehensive progress metrics for a doctor's curriculum
 * Implements the getDoctorProgress function from the technical specification
 */
function getDoctorProgress(doctorId) {
    // STEP 1: Retrieve Doctor Record
    const doctor = dataStore.findDoctorById(doctorId);
    if (!doctor) {
        throw new Error(`Doctor with ID ${doctorId} not found`);
    }

    // STEP 2: Retrieve Associated Curriculum
    const curriculum = dataStore.findCurriculumById(doctor.curriculumId);
    if (!curriculum) {
        throw new Error(`Curriculum with ID ${doctor.curriculumId} not found`);
    }

    // STEP 3: Retrieve All Verifications for Doctor
    const verifications = dataStore.findVerificationsByDoctorId(doctorId);

    // STEP 4: Group Verifications by Procedure ID
    const verificationsByProcedure = new Map();
    for (const verification of verifications) {
        if (!verificationsByProcedure.has(verification.procedureId)) {
            verificationsByProcedure.set(verification.procedureId, []);
        }
        verificationsByProcedure.get(verification.procedureId).push(verification);
    }

    // STEP 5: Initialize Counters
    let completedCount = 0;
    let inProgressCount = 0;
    let notStartedCount = 0;
    const procedureProgressList = [];

    // STEP 6: Calculate Progress for Each Procedure
    const skillLevelOrder = ['Observed', 'Assisted', 'Supervised', 'Independent'];

    for (const procedure of curriculum.procedures) {
        // Get verifications for this procedure
        const procedureVerifications = verificationsByProcedure.get(procedure.id) || [];

        // Calculate completed cases count
        const completedCases = procedureVerifications.length;

        // Determine highest skill level achieved
        let currentLevel = null;
        let currentLevelIndex = -1;

        for (const verification of procedureVerifications) {
            const levelIndex = skillLevelOrder.indexOf(verification.skillLevel);
            if (levelIndex > currentLevelIndex) {
                currentLevelIndex = levelIndex;
                currentLevel = verification.skillLevel;
            }
        }

        // Check theory and practice completion
        const theoryCompleted = procedure.theoryRequired
            ? procedureVerifications.some(v => v.supervisorNotes.toLowerCase().includes('theory'))
            : true;

        const practiceCompleted = procedure.practiceRequired
            ? completedCases >= procedure.minimumCases
            : true;

        // Determine procedure status
        const minLevelIndex = skillLevelOrder.indexOf(procedure.minimumLevel);
        const meetsMinimumLevel = currentLevelIndex >= minLevelIndex;
        const meetsMinimumCases = completedCases >= procedure.minimumCases;

        let status;
        if (completedCases === 0) {
            status = 'Not Started';
            notStartedCount++;
        } else if (meetsMinimumLevel && meetsMinimumCases && theoryCompleted && practiceCompleted) {
            status = 'Completed';
            completedCount++;
        } else {
            status = 'In Progress';
            inProgressCount++;
        }

        // Calculate percentage complete
        const casesProgress = Math.min((completedCases / procedure.minimumCases) * 100, 100);
        const levelProgress = currentLevelIndex >= minLevelIndex ? 100 :
            (currentLevelIndex + 1) / (minLevelIndex + 1) * 100;
        const theoryProgress = theoryCompleted ? 100 : 0;
        const practiceProgress = practiceCompleted ? 100 : 0;

        // Weighted average: 40% cases, 30% level, 15% theory, 15% practice
        const percentageComplete = Math.round(
            (casesProgress * 0.4) +
            (levelProgress * 0.3) +
            (theoryProgress * 0.15) +
            (practiceProgress * 0.15)
        );

        // Create verification summaries
        const verificationSummaries = procedureVerifications.map(v => {
            const supervisor = dataStore.findSupervisorById(v.supervisorId);
            return {
                id: v.id,
                skillLevel: v.skillLevel,
                rating: v.rating,
                datePerformed: v.datePerformed,
                supervisorName: supervisor ? `${supervisor.firstName} ${supervisor.lastName}` : 'Unknown'
            };
        });

        // Add to procedure progress list
        procedureProgressList.push({
            procedureId: procedure.id,
            procedureName: procedure.name,
            procedureCode: procedure.code,
            category: procedure.category,
            status,
            currentLevel,
            minimumLevelRequired: procedure.minimumLevel,
            minimumCasesRequired: procedure.minimumCases,
            completedCases,
            casesRemaining: Math.max(0, procedure.minimumCases - completedCases),
            theoryCompleted,
            practiceCompleted,
            percentageComplete,
            verifications: verificationSummaries
        });
    }

    // STEP 7: Calculate Overall Progress Percentage
    const totalProcedures = curriculum.procedures.length;
    const overallPercentage = totalProcedures > 0
        ? Math.round((completedCount / totalProcedures) * 100)
        : 0;

    // STEP 8: Return Complete Progress Object
    return {
        doctorId,
        curriculumId: curriculum.id,
        overallPercentage,
        totalProcedures,
        completedProcedures: completedCount,
        inProgressProcedures: inProgressCount,
        notStartedProcedures: notStartedCount,
        procedureProgress: procedureProgressList,
        lastUpdated: new Date().toISOString()
    };
}

/**
 * Submit a verification for a procedure request
 * Implements the submitVerification function from the technical specification
 */
function submitVerification(requestId, supervisorId, rating, skillLevel, notes, areasOfStrength = [], areasForImprovement = [], followUpRequired = false) {
    // STEP 1: Input Validation
    const errors = [];

    if (!requestId || requestId.trim() === '') {
        errors.push('Request ID is required');
    }

    if (!supervisorId || supervisorId.trim() === '') {
        errors.push('Supervisor ID is required');
    }

    if (rating < 1 || rating > 5) {
        errors.push('Rating must be between 1 and 5');
    }

    const validSkillLevels = ['Observed', 'Assisted', 'Supervised', 'Independent'];
    if (!validSkillLevels.includes(skillLevel)) {
        errors.push(`Skill level must be one of: ${validSkillLevels.join(', ')}`);
    }

    if (!notes || notes.trim() === '') {
        errors.push('Supervisor notes are required');
    }

    if (errors.length > 0) {
        return {
            success: false,
            verificationId: '',
            message: 'Validation failed',
            errors
        };
    }

    // STEP 2: Begin Transaction
    dataStore.beginTransaction();

    try {
        // STEP 3: Retrieve and Validate Request
        const request = dataStore.findRequestById(requestId);
        if (!request) {
            throw new Error(`Request with ID ${requestId} not found`);
        }

        if (request.status !== 'Pending') {
            throw new Error(`Request status is ${request.status}, cannot verify`);
        }

        // STEP 4: Validate Supervisor Authorization
        const supervisor = dataStore.findSupervisorById(supervisorId);
        if (!supervisor) {
            throw new Error(`Supervisor with ID ${supervisorId} not found`);
        }

        if (request.supervisorId !== supervisorId) {
            throw new Error('Supervisor is not authorized to verify this request');
        }

        // STEP 5: Retrieve Doctor and Validate
        const doctor = dataStore.findDoctorById(request.doctorId);
        if (!doctor) {
            throw new Error(`Doctor with ID ${request.doctorId} not found`);
        }

        // STEP 6: Retrieve Procedure Information
        const curriculum = dataStore.findCurriculumById(doctor.curriculumId);
        if (!curriculum) {
            throw new Error(`Curriculum with ID ${doctor.curriculumId} not found`);
        }

        const procedure = curriculum.procedures.find(p => p.id === request.procedureId);
        if (!procedure) {
            throw new Error(`Procedure with ID ${request.procedureId} not found in curriculum`);
        }

        // STEP 7: Create Verification Record
        const now = new Date().toISOString();
        const verificationId = generateUUID();

        const verification = {
            id: verificationId,
            doctorId: request.doctorId,
            supervisorId: supervisorId,
            procedureId: request.procedureId,
            requestId: requestId,
            skillLevel: skillLevel,
            rating: rating,
            datePerformed: request.datePerformed,
            dateVerified: now,
            supervisorNotes: notes,
            doctorNotes: request.notes,
            patientAge: request.patientAge,
            patientSex: request.patientSex,
            location: request.location,
            urgency: request.urgency,
            complications: request.complications,
            areasOfStrength: areasOfStrength,
            areasForImprovement: areasForImprovement,
            followUpRequired: followUpRequired,
            createdAt: now,
            updatedAt: now
        };

        // STEP 8: Persist Verification to Data Store
        dataStore.createVerification(verification);

        // STEP 9: Delete Request Record
        dataStore.deleteRequestById(requestId);

        // STEP 10: Commit Transaction
        dataStore.commitTransaction();

        // STEP 11: Return Success Result
        return {
            success: true,
            verificationId: verificationId,
            message: 'Verification submitted successfully',
            verification: verification
        };

    } catch (error) {
        // STEP 12: Rollback on Error
        dataStore.rollbackTransaction();

        return {
            success: false,
            verificationId: '',
            message: `Failed to submit verification: ${error.message}`,
            errors: [error.message]
        };
    }
}

/**
 * Create a new verification request
 * Implements the submitRequest function from the technical specification
 */
function submitRequest(doctorId, supervisorId, procedureId, requestedLevel, datePerformed, notes, location, urgency, patientAge, patientSex, complications) {
    // STEP 1: Input Validation
    const errors = [];

    if (!doctorId || doctorId.trim() === '') {
        errors.push('Doctor ID is required');
    }

    if (!supervisorId || supervisorId.trim() === '') {
        errors.push('Supervisor ID is required');
    }

    if (!procedureId || procedureId.trim() === '') {
        errors.push('Procedure ID is required');
    }

    const validSkillLevels = ['Observed', 'Assisted', 'Supervised', 'Independent'];
    if (!validSkillLevels.includes(requestedLevel)) {
        errors.push(`Requested level must be one of: ${validSkillLevels.join(', ')}`);
    }

    if (!datePerformed) {
        errors.push('Date performed is required');
    } else {
        const performedDate = new Date(datePerformed);
        const now = new Date();
        if (isNaN(performedDate.getTime())) {
            errors.push('Invalid date format for datePerformed');
        } else if (performedDate > now) {
            errors.push('Date performed cannot be in the future');
        }
    }

    if (!notes || notes.trim() === '') {
        errors.push('Procedure notes are required');
    }

    if (!location || location.trim() === '') {
        errors.push('Location is required');
    }

    const validUrgencies = ['Routine', 'Urgent', 'Emergency'];
    if (!validUrgencies.includes(urgency)) {
        errors.push(`Urgency must be one of: ${validUrgencies.join(', ')}`);
    }

    if (errors.length > 0) {
        return {
            success: false,
            requestId: '',
            message: 'Validation failed',
            errors
        };
    }

    try {
        // STEP 2: Validate Doctor Exists
        const doctor = dataStore.findDoctorById(doctorId);
        if (!doctor) {
            throw new Error(`Doctor with ID ${doctorId} not found`);
        }

        // STEP 3: Validate Supervisor Exists and is Associated
        const supervisor = dataStore.findSupervisorById(supervisorId);
        if (!supervisor) {
            throw new Error(`Supervisor with ID ${supervisorId} not found`);
        }

        if (!doctor.supervisors.includes(supervisorId)) {
            throw new Error('Selected supervisor is not associated with this doctor');
        }

        // STEP 4: Validate Procedure Exists in Curriculum
        const curriculum = dataStore.findCurriculumById(doctor.curriculumId);
        if (!curriculum) {
            throw new Error(`Curriculum with ID ${doctor.curriculumId} not found`);
        }

        const procedure = curriculum.procedures.find(p => p.id === procedureId);
        if (!procedure) {
            throw new Error(`Procedure with ID ${procedureId} not found in curriculum`);
        }

        // STEP 5: Create Request Record
        const now = new Date().toISOString();
        const requestId = generateUUID();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30); // 30 days expiry

        const request = {
            id: requestId,
            doctorId: doctorId,
            supervisorId: supervisorId,
            procedureId: procedureId,
            requestedLevel: requestedLevel,
            status: 'Pending',
            datePerformed: datePerformed,
            patientAge: patientAge,
            patientSex: patientSex,
            notes: notes,
            location: location,
            urgency: urgency,
            complications: complications,
            createdAt: now,
            updatedAt: now,
            expiresAt: expiresAt.toISOString()
        };

        // STEP 6: Persist Request to Data Store
        dataStore.createRequest(request);

        // STEP 7: Return Success Result
        return {
            success: true,
            requestId: requestId,
            message: 'Request submitted successfully',
            request: request
        };

    } catch (error) {
        return {
            success: false,
            requestId: '',
            message: `Failed to submit request: ${error.message}`,
            errors: [error.message]
        };
    }
}
