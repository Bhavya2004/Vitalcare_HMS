# Healthcare Management System - Backend

A robust and secure backend system for managing healthcare operations, built with Node.js, Express, TypeScript, and Prisma. The Healthcare Management System is an integrated platform designed to streamline the process of managing medical appointments, patient records, billing, staff management, and doctor-patient interactions.This system supports three types of users: Admin, Doctor, and Patient, each with its own set of features. The flow of the project is organized by the roles, detailing their respective functionalities. 

## 🚀 Features

### Authentication & Authorization
- JWT-based authentication system
- Role-based access control (RBAC)
- Secure password hashing with bcrypt
- Protected routes with middleware
- User registration and login endpoints

### Patient Management
- Patient registration with detailed information
- Profile management with image upload support
- Patient registration status verification

### Appointment System
- Create medical appointments (Patient Side)
- Appointment status tracking
- Appointment history and statistics


### Security Features
- Input validation using Zod
- File upload security with size and type restrictions
- CORS protection
- Environment variable management


## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT
- **File Upload:** Multer
- **Validation:** Zod
- **Testing:** (not planned)


## 📁 Project Structure

```
backend/
├── src/
│   ├── api/
│   │   └── v1/
│   │       ├── controllers/    # Request handlers
│   │       ├── middlewares/    # Custom middleware
│   │       ├── routes/         # API routes
│   │       ├── validations/    # Input validation schemas
│   │       └── interfaces/     # TypeScript interfaces
│   ├── prisma/                 # Database schema and migrations
│   └── server.ts              # Application entry point
├── uploads/                   # File upload directory
└── package.json
```

## 🔐 API Endpoints

### Authentication
- `POST /login` - User login
- `POST /register` - User registration

### Patient
- `GET /patient/check-registration` - Check patient registration status
- `POST /patient/register` - Register patient details
- `GET /patient/appointments` - Get patient appointments
- `POST /patient/appointments` - Create new appointment
- `GET /patient/appointments/:id` - Get appointment details
- `PATCH /patient/appointments/:id/status` - Update appointment status

### Admin
- `GET /admin/dashboard` - Get admin dashboard data

## 🔒 Security Considerations

- All passwords are hashed using bcrypt
- JWT tokens expire after 1 hour
- File uploads are restricted to images only
- Maximum file size limit of 5MB
- Input validation on all endpoints
- CORS protection enabled
- Environment variables for sensitive data

## 🚧 Development Status

The backend is currently in active development with the following features implemented:

✅ Completed:
- Authentication system
- Patient registration
- Appointment booking
- Seperate dashboard routes for admin , doctor & patient
- File upload system
- Input validation
- Error handling

🔄 In Progress:
- Adding doctors through admin side
- Dynamic dropdown for selecting physician during appointment booking
- Handle doctor availability (doctor side)
- API documentation

📋 Planned:
- Real-time notifications and Email integration
- Billing feature
- Doctors can add prescriptions & diagnosis after every appointment
- Chat feature between doctor and patient
- Record tracking
- Analytics dashboard including charts based on patient's medical history
- Doctor ratings and review system 

## 📚 Additional Resources

- [Project Documentation](https://simformsolutionspvtltd-my.sharepoint.com/:w:/g/personal/bhavya_barai_simformsolutions_com/ER85co2NPRBKnPyHtnYTAaIBrXQyIfVvwdYRAiyeTbFAoQ
)
- [Database/ER Diagram](https://app.eraser.io/workspace/i6a4BWiOGLytq5zJh9HX?origin=share)

## 📋 Prerequisites

- Node.js (v14 or higher)
- PostgreSQL
- npm or yarn

## 🔧 Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```
Edit `.env` with your configuration:
```
DATABASE_URL="postgresql://user:password@localhost:5432/healthcare_db"
JWT_SECRET="your-secret-key"
PORT=3000
```

4. Set up the database:
```bash
npx prisma migrate dev
```

5. Start the development server:
```bash
npm run dev
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request


## 👥 Authors

- Bhavya Barai 
