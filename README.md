# EMR Appointment Management System

## Project Overview
This is a production-ready Appointment Management module for an Enterprise Electronic Medical Record (EMR) system. It features a complete booking workflow, user role management (Super Admin, Receptionist, Doctor), concurrent booking prevention, real-time WebSocket updates, and an audit trail mechanism.

## Architecture Overview
The application follows a standard monolithic N-tier backend architecture built with **Node.js, Express, and MongoDB**, implementing the **Service Repository pattern**.
- **Controllers** handle HTTP requests and responses.
- **Services** encapsulate the core business logic.
- **Middlewares** intercept requests for Authentication, RBAC, and error handling.
- **Models** enforce the MongoDB schemas and data constraints.

The frontend is a modern **React (Vite)** application utilizing a component-based UI architecture, built entirely with custom, high-quality, vanilla CSS without reliance on utility frameworks, resulting in a unique, beautiful, and highly responsive user interface.

## Database Design
The MongoDB database uses a scalable model consisting of the following key collections:
- **User**: Stores users (Admin, Receptionist, Doctor) and their hashed passwords.
- **Patient**: Separated from Users, manages patient demographic data.
- **DoctorSchedule**: Manages the available working hours and break times for individual doctors.
- **Appointment**: The main transactional collection, associating Patients with Doctors at a specific date and time slot.
- **AuditLog**: Stores critical system actions for auditing and security tracking.

### Relationships
- `Appointment` -> `Patient` (1:1 per appointment)
- `Appointment` -> `User` (Doctor) (1:1 per appointment)
- `DoctorSchedule` -> `User` (Doctor) (1:1)

## Folder Structure
```
emr-appointment-system/
│
├── backend/                  # Node.js Express Application
│   ├── src/
│   │   ├── config/           # Database and environment configurations
│   │   ├── controllers/      # Route controllers (req, res handlers)
│   │   ├── middlewares/      # Authentication & RBAC validation
│   │   ├── models/           # Mongoose schemas
│   │   ├── routes/           # Express routers
│   │   ├── services/         # Core business logic
│   │   ├── utils/            # Helper utilities and audit loggers
│   │   └── index.js          # Entry point
│   ├── .env
│   └── package.json
│
├── frontend/                 # React Vite Application
│   ├── src/
│   │   ├── assets/           # Static assets
│   │   ├── components/       # Reusable React components
│   │   ├── context/          # State management (Auth, Socket)
│   │   ├── pages/            # Page-level components
│   │   ├── services/         # API integration points
│   │   ├── App.jsx           # Main App component
│   │   ├── index.css         # Global design system & tokens
│   │   └── main.jsx          # React entry point
│   └── package.json
│
├── ENGINEERING_DECISIONS.md  # Engineering thought process documentation
└── README.md                 # This file
```

## API Documentation

### Auth Endpoints
- `POST /api/v1/auth/login`: Authenticate and receive JWT tokens.
- `POST /api/v1/auth/refresh`: Refresh expired JWT access token.
- `POST /api/v1/auth/logout`: Revoke tokens.

### Doctors
- `GET /api/v1/doctors`: Retrieve doctors (with optional search/department filter).
- `GET /api/v1/doctors/:doctorId/schedule`: Fetch a specific doctor's schedule.
- `PUT /api/v1/doctors/:doctorId/schedule`: (Admin) Update a doctor's schedule.

### Slots
- `GET /api/v1/slots?doctorId=&date=`: Retrieve dynamically generated available slots.

### Appointments
- `POST /api/v1/appointments`: Book a new appointment (handles existing/new patients).
- `GET /api/v1/appointments`: Fetch appointments with server-side pagination, sorting, and filtering.
- `PUT /api/v1/appointments/:id`: Update appointment status/purpose/notes.
- `DELETE /api/v1/appointments/:id`: Cancel an appointment.
- `POST /api/v1/appointments/:id/arrive`: Mark patient as arrived.

## Environment Variables
Create a `.env` file in the `backend/` directory:
```
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/emr_appointment_system
JWT_SECRET=super_secret_jwt_key_that_should_be_long
JWT_REFRESH_SECRET=super_secret_jwt_refresh_key_that_should_be_long
JWT_EXPIRE=15m
JWT_REFRESH_EXPIRE=7d
```

## Installation Instructions

1. **Clone the repository** (if applicable) and navigate to the project directory.
2. **Install Backend Dependencies**:
   ```bash
   cd backend
   npm install
   ```
3. **Install Frontend Dependencies**:
   ```bash
   cd ../frontend
   npm install
   ```

## Running the Project

### Database Setup
Ensure MongoDB is running locally on port 27017, or update your `MONGO_URI` in `.env`.

### Seed the Super Admin Account
```bash
cd backend
node src/utils/seeder.js
```

### Start Backend Service
```bash
cd backend
npm run dev
```

### Start Frontend Application
In a separate terminal:
```bash
cd frontend
npm run dev
```

## Assumptions Made
- The working week allows for flexibility (0-6 representation for days).
- Doctors operate under standardized duration slots instead of ad-hoc dynamic variations.
- Patients are uniquely identified by their mobile number primarily.

## Known Limitations
- The system currently supports a single timezone based on the server's local configuration.
- Video consultations are not natively supported out of the box in this specific module.

## Future Improvements
- **Redis Integration**: For caching doctor schedules and available slots.
- **Timezone Support**: Allow specific timezone offsets per clinic or doctor.
- **Microservices Migration**: If load dictates, split Auth, Booking, and Notification into standalone services.
- **Notifications**: Add email/SMS alerts via external providers.
