# Digital Skills E-Portfolio Application - Technical Specification

## Overview

This document provides a comprehensive technical specification for implementing the Digital Skills E-Portfolio application. The specification is system-agnostic and can be implemented in any backend framework or database system.

---

## 1. Relational Data Model (JSON Schema)

### 1.1 Doctor Entity

```typescript
interface Doctor {
  id: string;                    // Unique identifier (UUID)
  email: string;                 // Primary email (unique)
  password: string;              // Hashed password
  firstName: string;             // Doctor's first name
  lastName: string;              // Doctor's last name
  role: "doctor";                // User role (fixed)
  specialty: string;             // Medical specialty (e.g., "General Surgery")
  yearOfTraining: number;        // Current training year (1-6)
  hospitalId: string;            // Associated hospital identifier
  supervisors: string[];         // Array of supervisor IDs
  curriculumId: string;          // Associated curriculum ID
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
  profileImage?: string;         // Optional profile image URL
  bio?: string;                  // Optional biography
}
```

**Relationships:**
- `supervisors` → Many-to-Many with Supervisor entities
- `curriculumId` → Many-to-One with Curriculum entity
- Referenced by: `Request.doctorId`, `Verification.doctorId`

---

### 1.2 Supervisor Entity

```typescript
interface Supervisor {
  id: string;                    // Unique identifier (UUID)
  email: string;                 // Primary email (unique)
  password: string;              // Hashed password
  firstName: string;             // Supervisor's first name
  lastName: string;              // Supervisor's last name
  role: "supervisor";            // User role (fixed)
  title: string;                 // Professional title (e.g., "Consultant Surgeon")
  specialty: string;             // Medical specialty
  hospitalId: string;            // Associated hospital identifier
  certifications: string[];      // Array of certification names
  yearsOfExperience: number;     // Total years in practice
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
  profileImage?: string;         // Optional profile image URL
  bio?: string;                  // Optional biography
}
```

**Relationships:**
- Referenced by: `Doctor.supervisors`, `Request.supervisorId`, `Verification.supervisorId`

---

### 1.3 Curriculum Entity (Procedure Definitions)

```typescript
interface Curriculum {
  id: string;                    // Unique identifier (UUID)
  name: string;                  // Curriculum name (e.g., "Core Surgical Training")
  specialty: string;             // Medical specialty
  version: string;               // Version number (e.g., "2024.1")
  effectiveDate: string;         // ISO 8601 date when curriculum becomes active
  procedures: Procedure[];       // Array of procedure definitions
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
  description?: string;          // Optional curriculum description
}

interface Procedure {
  id: string;                    // Unique procedure identifier (UUID)
  code: string;                  // Procedure code (e.g., "SURG-001")
  name: string;                  // Procedure name (e.g., "Appendectomy")
  category: string;              // Category (e.g., "Emergency Surgery", "Elective Surgery")
  subcategory?: string;          // Optional subcategory
  description: string;           // Detailed procedure description
  skillLevels: SkillLevel[];     // Required skill progression levels
  theoryRequired: boolean;       // Whether theoretical knowledge assessment is required
  practiceRequired: boolean;     // Whether practical assessment is required
  minimumCases: number;          // Minimum number of cases required for completion
  minimumLevel: SkillLevelType;  // Minimum skill level required (e.g., "Supervised")
  estimatedDuration: number;     // Estimated duration in minutes
  difficulty: "Basic" | "Intermediate" | "Advanced" | "Complex";
  prerequisites: string[];       // Array of prerequisite procedure IDs
  references?: string[];         // Optional array of reference materials/URLs
}

interface SkillLevel {
  level: SkillLevelType;         // Skill level name
  description: string;           // What this level means
  requiredCases: number;         // Number of cases to achieve this level
}

type SkillLevelType = "Observed" | "Assisted" | "Supervised" | "Independent";
```

**Relationships:**
- Referenced by: `Doctor.curriculumId`
- `procedures` → One-to-Many relationship with Procedure definitions
- `Procedure.id` → Referenced by `Request.procedureId`, `Verification.procedureId`

---

### 1.4 Request Entity

```typescript
interface Request {
  id: string;                    // Unique identifier (UUID)
  doctorId: string;              // Foreign key to Doctor
  supervisorId: string;          // Foreign key to Supervisor
  procedureId: string;           // Foreign key to Procedure (within Curriculum)
  requestedLevel: SkillLevelType; // Skill level being requested for verification
  status: RequestStatus;         // Current request status
  datePerformed: string;         // ISO 8601 date when procedure was performed
  patientAge?: number;           // Optional patient age (anonymized)
  patientSex?: "M" | "F" | "Other"; // Optional patient sex (anonymized)
  notes: string;                 // Doctor's notes about the procedure
  location: string;              // Where procedure was performed (e.g., "OR-3", "Emergency Room")
  urgency: "Routine" | "Urgent" | "Emergency"; // Procedure urgency
  complications?: string;        // Optional complications encountered
  createdAt: string;             // ISO 8601 timestamp (when request created)
  updatedAt: string;             // ISO 8601 timestamp
  expiresAt?: string;            // Optional expiration date for request
}

type RequestStatus = "Pending" | "Reviewed" | "Expired" | "Cancelled";
```

**Relationships:**
- `doctorId` → Many-to-One with Doctor entity
- `supervisorId` → Many-to-One with Supervisor entity
- `procedureId` → Many-to-One with Procedure (via Curriculum)
- Converted to Verification upon approval (transactional operation)

---

### 1.5 Verification Entity

```typescript
interface Verification {
  id: string;                    // Unique identifier (UUID)
  doctorId: string;              // Foreign key to Doctor
  supervisorId: string;          // Foreign key to Supervisor
  procedureId: string;           // Foreign key to Procedure (within Curriculum)
  requestId?: string;            // Optional reference to original request ID
  skillLevel: SkillLevelType;    // Achieved skill level
  rating: number;                // Supervisor rating (1-5 scale)
  datePerformed: string;         // ISO 8601 date when procedure was performed
  dateVerified: string;          // ISO 8601 date when verification completed
  supervisorNotes: string;       // Supervisor's detailed feedback
  doctorNotes?: string;          // Optional doctor's original notes (from request)
  patientAge?: number;           // Optional patient age (anonymized)
  patientSex?: "M" | "F" | "Other"; // Optional patient sex (anonymized)
  location: string;              // Where procedure was performed
  urgency: "Routine" | "Urgent" | "Emergency"; // Procedure urgency
  complications?: string;        // Optional complications encountered
  areasOfStrength: string[];     // Array of strength areas identified
  areasForImprovement: string[]; // Array of improvement areas identified
  followUpRequired: boolean;     // Whether follow-up training is needed
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
}
```

**Relationships:**
- `doctorId` → Many-to-One with Doctor entity
- `supervisorId` → Many-to-One with Supervisor entity
- `procedureId` → Many-to-One with Procedure (via Curriculum)
- `requestId` → Optional reference to original Request (before deletion)

---

## 2. Core Business Logic (Pseudocode/TypeScript)

### 2.1 getDoctorProgress Function

**Purpose:** Calculate a doctor's curriculum completion status, including overall progress percentage, procedure counts, and individual skill completion status.

```typescript
interface DoctorProgress {
  doctorId: string;
  curriculumId: string;
  overallPercentage: number;        // 0-100
  totalProcedures: number;          // Total procedures in curriculum
  completedProcedures: number;      // Procedures meeting minimum requirements
  inProgressProcedures: number;     // Procedures with some verifications
  notStartedProcedures: number;     // Procedures with no verifications
  procedureProgress: ProcedureProgress[];
  lastUpdated: string;              // ISO 8601 timestamp
}

interface ProcedureProgress {
  procedureId: string;
  procedureName: string;
  procedureCode: string;
  category: string;
  status: "Not Started" | "In Progress" | "Completed";
  currentLevel: SkillLevelType | null;
  minimumLevelRequired: SkillLevelType;
  minimumCasesRequired: number;
  completedCases: number;
  casesRemaining: number;
  theoryCompleted: boolean;
  practiceCompleted: boolean;
  percentageComplete: number;       // 0-100
  verifications: VerificationSummary[];
}

interface VerificationSummary {
  id: string;
  skillLevel: SkillLevelType;
  rating: number;
  datePerformed: string;
  supervisorName: string;
}

/**
 * Calculates comprehensive progress metrics for a doctor's curriculum
 * 
 * @param doctorId - The unique identifier of the doctor
 * @returns DoctorProgress object with detailed progress information
 * @throws Error if doctor or curriculum not found
 */
function getDoctorProgress(doctorId: string): DoctorProgress {
  
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
  const verificationsByProcedure = new Map<string, Verification[]>();
  for (const verification of verifications) {
    if (!verificationsByProcedure.has(verification.procedureId)) {
      verificationsByProcedure.set(verification.procedureId, []);
    }
    verificationsByProcedure.get(verification.procedureId)!.push(verification);
  }
  
  // STEP 5: Initialize Counters
  let completedCount = 0;
  let inProgressCount = 0;
  let notStartedCount = 0;
  const procedureProgressList: ProcedureProgress[] = [];
  
  // STEP 6: Calculate Progress for Each Procedure
  for (const procedure of curriculum.procedures) {
    
    // Get verifications for this procedure
    const procedureVerifications = verificationsByProcedure.get(procedure.id) || [];
    
    // Calculate completed cases count
    const completedCases = procedureVerifications.length;
    
    // Determine highest skill level achieved
    const skillLevelOrder: SkillLevelType[] = ["Observed", "Assisted", "Supervised", "Independent"];
    let currentLevel: SkillLevelType | null = null;
    let currentLevelIndex = -1;
    
    for (const verification of procedureVerifications) {
      const levelIndex = skillLevelOrder.indexOf(verification.skillLevel);
      if (levelIndex > currentLevelIndex) {
        currentLevelIndex = levelIndex;
        currentLevel = verification.skillLevel;
      }
    }
    
    // Check theory and practice completion (simplified - could be separate verification types)
    const theoryCompleted = procedure.theoryRequired 
      ? procedureVerifications.some(v => v.supervisorNotes.toLowerCase().includes("theory"))
      : true;
    
    const practiceCompleted = procedure.practiceRequired
      ? completedCases >= procedure.minimumCases
      : true;
    
    // Determine procedure status
    const minLevelIndex = skillLevelOrder.indexOf(procedure.minimumLevel);
    const meetsMinimumLevel = currentLevelIndex >= minLevelIndex;
    const meetsMinimumCases = completedCases >= procedure.minimumCases;
    
    let status: "Not Started" | "In Progress" | "Completed";
    if (completedCases === 0) {
      status = "Not Started";
      notStartedCount++;
    } else if (meetsMinimumLevel && meetsMinimumCases && theoryCompleted && practiceCompleted) {
      status = "Completed";
      completedCount++;
    } else {
      status = "In Progress";
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
    const verificationSummaries: VerificationSummary[] = procedureVerifications.map(v => {
      const supervisor = dataStore.findSupervisorById(v.supervisorId);
      return {
        id: v.id,
        skillLevel: v.skillLevel,
        rating: v.rating,
        datePerformed: v.datePerformed,
        supervisorName: supervisor ? `${supervisor.firstName} ${supervisor.lastName}` : "Unknown"
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
```

---

### 2.2 submitVerification Function

**Purpose:** Complete the verification process by creating a verification record and removing the associated request in a transactional manner.

```typescript
interface VerificationResult {
  success: boolean;
  verificationId: string;
  message: string;
  verification?: Verification;
  errors?: string[];
}

/**
 * Submits a verification for a procedure request
 * This is a transactional operation that creates a verification and deletes the request
 * 
 * @param requestId - The ID of the request being verified
 * @param supervisorId - The ID of the supervisor providing verification
 * @param rating - Performance rating (1-5)
 * @param skillLevel - Achieved skill level
 * @param notes - Supervisor's detailed feedback
 * @param areasOfStrength - Optional array of strength areas
 * @param areasForImprovement - Optional array of improvement areas
 * @param followUpRequired - Whether follow-up is needed
 * @returns VerificationResult object
 */
function submitVerification(
  requestId: string,
  supervisorId: string,
  rating: number,
  skillLevel: SkillLevelType,
  notes: string,
  areasOfStrength: string[] = [],
  areasForImprovement: string[] = [],
  followUpRequired: boolean = false
): VerificationResult {
  
  // STEP 1: Input Validation
  const errors: string[] = [];
  
  if (!requestId || requestId.trim() === "") {
    errors.push("Request ID is required");
  }
  
  if (!supervisorId || supervisorId.trim() === "") {
    errors.push("Supervisor ID is required");
  }
  
  if (rating < 1 || rating > 5) {
    errors.push("Rating must be between 1 and 5");
  }
  
  const validSkillLevels: SkillLevelType[] = ["Observed", "Assisted", "Supervised", "Independent"];
  if (!validSkillLevels.includes(skillLevel)) {
    errors.push(`Skill level must be one of: ${validSkillLevels.join(", ")}`);
  }
  
  if (!notes || notes.trim() === "") {
    errors.push("Supervisor notes are required");
  }
  
  if (errors.length > 0) {
    return {
      success: false,
      verificationId: "",
      message: "Validation failed",
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
    
    if (request.status !== "Pending") {
      throw new Error(`Request status is ${request.status}, cannot verify`);
    }
    
    // STEP 4: Validate Supervisor Authorization
    const supervisor = dataStore.findSupervisorById(supervisorId);
    if (!supervisor) {
      throw new Error(`Supervisor with ID ${supervisorId} not found`);
    }
    
    // Verify supervisor is authorized for this request
    if (request.supervisorId !== supervisorId) {
      throw new Error("Supervisor is not authorized to verify this request");
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
    const verificationId = generateUUID(); // Utility function to generate UUID
    
    const verification: Verification = {
      id: verificationId,
      doctorId: request.doctorId,
      supervisorId: supervisorId,
      procedureId: request.procedureId,
      requestId: requestId, // Keep reference to original request
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
    
    // STEP 10: Send Notification to Doctor (async, non-blocking)
    notificationService.sendVerificationComplete({
      doctorId: request.doctorId,
      procedureName: procedure.name,
      skillLevel: skillLevel,
      rating: rating,
      supervisorName: `${supervisor.firstName} ${supervisor.lastName}`
    });
    
    // STEP 11: Commit Transaction
    dataStore.commitTransaction();
    
    // STEP 12: Return Success Result
    return {
      success: true,
      verificationId: verificationId,
      message: "Verification submitted successfully",
      verification: verification
    };
    
  } catch (error) {
    // STEP 13: Rollback on Error
    dataStore.rollbackTransaction();
    
    return {
      success: false,
      verificationId: "",
      message: `Failed to submit verification: ${error.message}`,
      errors: [error.message]
    };
  }
}
```

---

### 2.3 submitRequest Function

**Purpose:** Create a new verification request that a doctor can submit to a supervisor for assessment.

```typescript
interface RequestResult {
  success: boolean;
  requestId: string;
  message: string;
  request?: Request;
  errors?: string[];
}

/**
 * Creates a new verification request
 * 
 * @param doctorId - The ID of the doctor submitting the request
 * @param supervisorId - The ID of the supervisor who will verify
 * @param procedureId - The ID of the procedure to be verified
 * @param requestedLevel - The skill level being claimed
 * @param datePerformed - ISO 8601 date when procedure was performed
 * @param notes - Doctor's notes about the procedure
 * @param location - Where the procedure was performed
 * @param urgency - Urgency level of the procedure
 * @param patientAge - Optional patient age
 * @param patientSex - Optional patient sex
 * @param complications - Optional complications description
 * @returns RequestResult object
 */
function submitRequest(
  doctorId: string,
  supervisorId: string,
  procedureId: string,
  requestedLevel: SkillLevelType,
  datePerformed: string,
  notes: string,
  location: string,
  urgency: "Routine" | "Urgent" | "Emergency",
  patientAge?: number,
  patientSex?: "M" | "F" | "Other",
  complications?: string
): RequestResult {
  
  // STEP 1: Input Validation
  const errors: string[] = [];
  
  if (!doctorId || doctorId.trim() === "") {
    errors.push("Doctor ID is required");
  }
  
  if (!supervisorId || supervisorId.trim() === "") {
    errors.push("Supervisor ID is required");
  }
  
  if (!procedureId || procedureId.trim() === "") {
    errors.push("Procedure ID is required");
  }
  
  const validSkillLevels: SkillLevelType[] = ["Observed", "Assisted", "Supervised", "Independent"];
  if (!validSkillLevels.includes(requestedLevel)) {
    errors.push(`Requested level must be one of: ${validSkillLevels.join(", ")}`);
  }
  
  if (!datePerformed) {
    errors.push("Date performed is required");
  } else {
    // Validate date format and ensure it's not in the future
    const performedDate = new Date(datePerformed);
    const now = new Date();
    if (isNaN(performedDate.getTime())) {
      errors.push("Invalid date format for datePerformed");
