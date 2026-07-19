# Engineering Decisions

## Why did you choose your project architecture?
I opted for a standard N-tier architecture (Controllers, Services, Models, Routes) for the backend. This structure enforces a strong separation of concerns: routes simply define endpoints, controllers handle HTTP specifics (req, res), and services encapsulate business logic. This separation is vital for a production-ready application because it makes the codebase significantly easier to test, maintain, and scale. For instance, the `appointmentService` can be reused if we decide to expose a GraphQL or gRPC API later without changing the core business logic.

For the frontend, I chose a modern React architecture powered by Vite, utilizing a modular, component-based approach. The CSS uses standard vanilla CSS variables with a unified design system that focuses on beautiful, responsive UI without relying on heavy frameworks like Tailwind unless requested. 

## How did you design your MongoDB schema?
The database schema is normalized appropriately for a NoSQL environment:
- **User**: Stores doctors, receptionists, and admins. Doctors have a specific field `department`. Passwords and refresh tokens are kept here.
- **Patient**: Stores patient demographic details. Separating `User` (staff) from `Patient` avoids sparse fields and keeps role checks straightforward.
- **DoctorSchedule**: Links a `User` (doctor) with their availability (working days, break times, and session durations).
- **Appointment**: Links a `Patient`, `User` (doctor), and records date and time of the booking.
- **AuditLog**: Dedicated collection to track system actions securely.

## How did you prevent double booking?
To completely eradicate race conditions and double bookings, I utilized a **Unique Compound Index** at the database level on the `Appointment` model:
```javascript
appointmentSchema.index({ doctor: 1, date: 1, time: 1 }, { unique: true });
```
When two users concurrently try to book the exact same slot for the exact same doctor on the exact same date, MongoDB guarantees that the first transaction will succeed, while the second will throw a `Duplicate Key Error (code 11000)`. This database constraint acts as the final and most reliable layer of defense against concurrency issues. The backend explicitly catches this error and gracefully informs the user that the slot is already taken.

## Which database indexes did you create and why?
- `Appointment`: `{ doctor: 1, date: 1, time: 1 }` (unique constraint for double-booking). `{ patient: 1 }` (for quick retrieval of a patient's history). `{ department: 1, date: 1 }` (for fast filtering in the scheduling interface).
- `Patient`: `{ name: 1, mobileNumber: 1 }` (to quickly search existing patients by receptionist).
- `User`: `{ email: 1 }` (unique for logins), `{ role: 1 }` (to quickly fetch all doctors).
- `AuditLog`: `{ createdAt: -1 }` (to quickly sort the audit trail by time).

## What security measures did you implement?
- **Authentication**: JWT-based authentication with separate Access Tokens (short-lived) and Refresh Tokens (long-lived) to mitigate token theft.
- **Password Hashing**: `bcryptjs` is used to hash passwords before storing them.
- **Role-Based Access Control (RBAC)**: Custom middlewares check the token's decoded role to explicitly allow or deny access to sensitive endpoints.
- **Input Validation**: Mongoose validation schema types ensure no garbage data reaches the DB.
- **Environment Variables**: Sensitive data like JWT secrets and MongoDB URIs are excluded from source control.

## What performance optimizations did you apply?
- **Server-Side Pagination**: Implemented `limit` and `skip` in MongoDB queries (like fetchAppointments) so we only fetch a fraction of data rather than the entire collection.
- **Proper Indexing**: Ensured common query paths (like searching for doctors or fetching appointments for a specific date) are indexed, reducing the time complexity of the DB search from O(n) to O(log n).
- **Socket.io Optimization**: Subscribed clients only receive minimal event data, keeping the network overhead low.
- **Frontend State Management**: Using React state efficiently to avoid deep prop-drilling, along with lightweight custom hooks to handle data fetching.

## If this application needed to support millions of appointments, what architectural changes would you make?
1. **Caching**: Implement a Redis caching layer for frequently accessed, read-heavy endpoints like `GET /api/v1/doctors` or available slots for popular doctors.
2. **Database Sharding/Partitioning**: Partition the `Appointment` collection based on regions or timestamps (e.g., separating historical appointments into cold storage).
3. **Microservices Architecture**: Split the monolithic Node.js backend into distinct microservices (e.g., Auth Service, Booking Service, Notification Service) communicating over an event bus like Kafka or RabbitMQ.
4. **Load Balancing**: Deploy multiple backend Node.js instances behind an NGINX load balancer to distribute traffic.
5. **Read Replicas**: Separate MongoDB read operations from write operations, using read replicas for complex queries and reporting dashboards.
