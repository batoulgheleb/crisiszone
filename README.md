# Digital Skills E-Portfolio Application

A comprehensive medical training and assessment platform for tracking surgical skills progression. This application implements a complete e-portfolio system for junior doctors and supervisors to manage verification requests and track curriculum progress.

## Overview

The Digital Skills E-Portfolio is a web-based application built with vanilla JavaScript that enables:
- **Junior Doctors** to track their surgical procedure progress and request verifications
- **Supervisors** to review and verify trainee competencies

## Features

### For Junior Doctors
- **Dashboard Overview**: Real-time progress tracking with statistics
- **Curriculum Progress**: Visual representation of completed/in-progress procedures
- **Verification Requests**: Submit detailed procedure verification requests
- **Progress Tracking**: View detailed breakdown by procedure, skill level, and cases completed

### For Supervisors
- **Pending Requests**: View and manage verification requests from trainees
- **Verification Forms**: Comprehensive assessment forms with ratings and feedback
- **History Tracking**: View all completed verifications

## Technical Architecture

### Core Components

1. **Data Model** (`js/dataStore.js`)
   - In-memory database with transaction support
   - Five core entities: Doctors, Supervisors, Curricula, Verifications, Requests

2. **Business Logic** (`js/businessLogic.js`)
   - `getDoctorProgress()`: Calculates curriculum completion metrics
   - `submitVerification()`: Transactional verification processing
   - `submitRequest()`: Creates new verification requests

3. **Routing** (`js/router.js`)
   - Hash-based client-side routing
   - Navigation history support

4. **Views** (`js/views/`)
   - Login View
   - Doctor Dashboard
   - Supervisor Dashboard
   - Request Form
   - Verification Form
   - Theory/Practice View

## Getting Started

### Prerequisites
- Modern web browser (Chrome, Firefox, Safari, Edge)
- No backend server required (runs entirely in browser)

### Installation

1. Clone or download the repository
2. Open `index.html` in your web browser
3. No build process or dependencies required!

### Demo Accounts

**Junior Doctor:**
- Email: `dr.brown@hospital.com`
- Password: `doctor123`

**Supervisor:**
- Email: `dr.smith@hospital.com`
- Password: `supervisor123`

## Usage Guide

### As a Junior Doctor

1. **Login**: Use doctor credentials
2. **View Dashboard**: See your overall progress and statistics
3. **Browse Procedures**: Switch to "My Procedures" tab to see detailed progress
4. **Request Verification**: 
   - Click "Request Verification"
   - Select procedure, supervisor, and skill level
   - Fill in procedure details and notes
   - Submit request
5. **Track Requests**: View pending requests in "My Requests" tab

### As a Supervisor

1. **Login**: Use supervisor credentials
2. **View Dashboard**: See pending requests and statistics
3. **Review Requests**: View detailed information about each verification request
4. **Submit Verification**:
   - Click "Verify" on a pending request
   - Review trainee's notes and procedure details
   - Select skill level and rating (1-5 stars)
   - Provide detailed feedback
   - Submit verification

## Project Structure

```
crisiszone/
├── index.html                          # Main HTML file
├── styles.css                          # Global styles
├── js/
│   ├── utils.js                        # Utility functions
│   ├── dataStore.js                    # Data management layer
│   ├── sampleData.js                   # Sample/demo data
│   ├── businessLogic.js                # Core business logic
│   ├── router.js                       # Client-side routing
│   ├── app.js                          # Application entry point
│   └── views/
│       ├── loginView.js                # Login page
│       ├── doctorDashboard.js          # Doctor dashboard
│       ├── supervisorDashboard.js      # Supervisor dashboard
│       ├── requestForm.js              # Request submission form
│       ├── verificationForm.js         # Verification form
│       └── theoryPracticeView.js       # Theory/practice resources
├── TECHNICAL_SPECIFICATION.md          # Detailed technical spec
└── README.md                           # This file
```

## Data Model

### Key Entities

**Doctor**
- Personal information and training details
- Associated supervisors and curriculum
- Progress tracking

**Supervisor**
- Professional credentials
- Years of experience
- Certifications

**Curriculum**
- Procedure definitions
- Skill level requirements
- Minimum cases required

**Request**
- Verification requests from doctors
- Pending/Reviewed status
- Procedure and performance details

**Verification**
- Completed assessments
- Supervisor feedback and ratings
- Skill level achieved

## Business Logic

### Progress Calculation
The `getDoctorProgress()` function calculates:
- Overall curriculum completion percentage
- Per-procedure progress and status
- Skill level progression
- Case count tracking

### Verification Workflow
1. Doctor submits request → Creates Request entity
2. Supervisor reviews → Opens verification form
3. Supervisor submits → Creates Verification, deletes Request (transactional)

## Sample Data

The application includes pre-populated sample data:
- 2 Doctors (Emily Brown - CT2, Michael Wilson - CT1)
- 2 Supervisors (Dr. Smith, Dr. Johnson)
- 1 Curriculum (Core Surgical Training with 5 procedures)
- 5 Historical verifications
- 3 Pending requests

## Technical Implementation

### Technologies Used
- **HTML5**: Semantic markup
- **CSS3**: Modern styling with CSS variables
- **Vanilla JavaScript**: No frameworks or libraries
- **ES6+**: Modern JavaScript features

### Key Features
- **Client-side routing**: Hash-based navigation
- **Transaction support**: Rollback capability for failed operations
- **Responsive design**: Mobile-friendly interface
- **Form validation**: Client-side validation with error handling

## Future Enhancements

Potential improvements for production use:
- Backend API integration
- Database persistence
- User authentication with JWT
- File upload for supporting documents
- Email notifications
- Advanced analytics and reporting
- Export functionality (PDF reports)
- Multi-language support
- Offline mode with service workers

## Development

### Adding New Procedures
Edit `js/sampleData.js` and add new procedure objects to the curriculum.

### Adding New Views
1. Create new view file in `js/views/`
2. Register route in `js/app.js`
3. Implement render function

### Customizing Styles
Edit `styles.css` - uses CSS variables for easy theming.

## Browser Support

- Chrome/Edge: ✅ Latest 2 versions
- Firefox: ✅ Latest 2 versions
- Safari: ✅ Latest 2 versions

## License

MIT License - Free to use and modify

## Credits

Built for the Imperials Hackathon for crisis zones

## Support

For issues or questions, please open an issue on the GitHub repository.
