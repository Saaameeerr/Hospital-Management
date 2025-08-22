# Hospital Management Dashboard

A comprehensive hospital management system built with the MERN stack (MongoDB, Express.js, React.js, Node.js) featuring modern UI/UX, role-based access control, and comprehensive healthcare management features.

## 🚀 Features

### 🔐 Authentication & Authorization
- JWT-based authentication system
- Role-based access control (Admin, Doctor, Receptionist, Patient)
- Secure password hashing with bcrypt
- Protected routes and middleware

### 📊 Dashboard
- Real-time statistics and metrics
- Interactive charts using Recharts
- Patient admissions trends
- Bed occupancy tracking
- Upcoming appointments overview
- Revenue analytics

### 👥 Patient Management
- Complete patient records (CRUD operations)
- Medical history tracking
- Admission/discharge management
- Status monitoring (admitted, discharged, under observation)
- Search and filtering capabilities
- Pagination support

### 👨‍⚕️ Doctor Management
- Doctor profiles and specializations
- Department assignments
- Availability scheduling
- License and experience tracking
- Contact information management

### 📅 Appointment Management
- Appointment scheduling and management
- Conflict detection
- Priority and status tracking
- Patient-doctor assignments
- Calendar integration

### 💰 Billing & Payments
- Comprehensive billing system
- Payment status tracking
- Multiple payment methods
- Tax calculations
- Overdue bill alerts
- Financial reporting

### 🎨 Modern UI/UX
- Responsive design with TailwindCSS
- shadcn/ui components
- Smooth animations with Framer Motion
- Lucide React icons
- Mobile-first approach

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern React with hooks
- **Vite** - Fast build tool and dev server
- **TailwindCSS** - Utility-first CSS framework
- **shadcn/ui** - Beautiful UI components
- **Framer Motion** - Animation library
- **Recharts** - Chart components
- **Lucide React** - Icon library
- **React Router** - Client-side routing
- **Axios** - HTTP client

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB ODM
- **JWT** - Authentication tokens
- **bcryptjs** - Password hashing
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **Morgan** - HTTP request logger
- **CORS** - Cross-origin resource sharing

## 📁 Project Structure

```
hospital-management-dashboard/
├── client/                          # React frontend
│   ├── src/
│   │   ├── components/             # Reusable components
│   │   │   ├── Layout.jsx         # Main layout with sidebar
│   │   │   └── LoadingSpinner.jsx # Loading component
│   │   ├── contexts/               # React contexts
│   │   │   └── AuthContext.jsx    # Authentication context
│   │   ├── pages/                  # Page components
│   │   │   ├── Login.jsx          # Login page
│   │   │   ├── Dashboard.jsx      # Main dashboard
│   │   │   ├── Patients.jsx       # Patient management
│   │   │   ├── Doctors.jsx        # Doctor management
│   │   │   ├── Appointments.jsx   # Appointment management
│   │   │   └── Billing.jsx        # Billing management
│   │   ├── App.jsx                # Main app component
│   │   ├── main.jsx               # Entry point
│   │   └── index.css              # Global styles
│   ├── package.json                # Frontend dependencies
│   ├── vite.config.js             # Vite configuration
│   ├── tailwind.config.js         # TailwindCSS configuration
│   ├── postcss.config.js          # PostCSS configuration
│   └── .gitignore                  # Git ignore rules for client
├── server/                         # Node.js backend
│   ├── models/                     # Database models
│   │   ├── User.js                # User model
│   │   ├── Patient.js             # Patient model
│   │   ├── Doctor.js              # Doctor model
│   │   ├── Appointment.js         # Appointment model
│   │   └── Billing.js             # Billing model
│   ├── routes/                     # API routes
│   │   ├── auth.js                # Authentication routes
│   │   ├── patients.js            # Patient routes
│   │   ├── doctors.js             # Doctor routes
│   │   ├── appointments.js        # Appointment routes
│   │   └── billing.js             # Billing routes
│   ├── middleware/                 # Custom middleware
│   │   ├── auth.js                # Authentication middleware
│   │   └── errorHandler.js        # Error handling middleware
│   ├── server.js                   # Main server file
│   ├── package.json                # Backend dependencies
│   ├── .gitignore                  # Git ignore rules for server
│   └── .env                        # Environment variables
└── README.md                       # Project documentation
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd hospital-management-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm run install-all
   ```

3. **Environment Setup**
   ```bash
   # Copy environment file
   cp server/.env.example server/.env
   
   # Edit server/.env with your configuration
   MONGO_URI=mongodb://localhost:27017/hospital_dashboard
   JWT_SECRET=your-super-secret-jwt-key
   ```

4. **Start the development servers**
   ```bash
   npm run dev
   ```

   This will start both:
   - Backend server on http://localhost:5000
   - Frontend dev server on http://localhost:5173

### Alternative Manual Setup

If you prefer to set up frontend and backend separately:

```bash
# Backend setup
cd server
npm install
npm run dev

# Frontend setup (in another terminal)
cd client
npm install
npm run dev
```

## 🔧 Configuration

### Environment Variables

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGO_URI=mongodb://localhost:27017/hospital_dashboard

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRE=7d

# CORS Configuration
CLIENT_URL=http://localhost:5173
```

### Database Setup

1. **Local MongoDB**
   - Install MongoDB locally
   - Start MongoDB service
   - Create database: `hospital_dashboard`

2. **MongoDB Atlas (Cloud)**
   - Create MongoDB Atlas account
   - Create cluster
   - Get connection string
   - Update `MONGO_URI` in `.env`

## 📱 Demo Credentials

The system comes with pre-configured demo accounts:

- **Admin**: admin@hospital.com / admin123
- **Doctor**: doctor@hospital.com / doctor123
- **Receptionist**: reception@hospital.com / reception123

## 🚀 Available Scripts

### Git Commands

When working with this repository, ensure you don't accidentally commit sensitive files:

```bash
# Check what files would be committed
git status

# Check if any sensitive files are being tracked (should show empty)
git ls-files | grep -E '\.env|node_modules|dist/'

# If you accidentally committed sensitive files, remove them from git but keep locally
git rm --cached server/.env
git rm --cached client/.env
```

### Root Level
```bash
npm run dev          # Start both client and server
npm run server       # Start only the backend server
npm run client       # Start only the frontend client
npm run build        # Build the frontend for production
npm run install-all  # Install dependencies for all packages
```

### Backend (server/)
```bash
npm run dev          # Start development server with nodemon
npm start            # Start production server
```

### Frontend (client/)
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
```

## 🔒 Security Features

- JWT token-based authentication
- Password hashing with bcrypt
- Role-based access control
- Input validation and sanitization
- CORS configuration
- Helmet security headers
- Environment variable protection

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/logout` - User logout

### Patients
- `GET /api/patients` - Get all patients (with pagination)
- `GET /api/patients/:id` - Get single patient
- `POST /api/patients` - Create patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient
- `GET /api/patients/stats/overview` - Patient statistics

### Doctors
- `GET /api/doctors` - Get all doctors (with pagination)
- `GET /api/doctors/:id` - Get single doctor
- `POST /api/doctors` - Create doctor
- `PUT /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor
- `GET /api/doctors/stats/overview` - Doctor statistics

### Appointments
- `GET /api/appointments` - Get all appointments (with pagination)
- `GET /api/appointments/:id` - Get single appointment
- `POST /api/appointments` - Create appointment
- `PUT /api/appointments/:id` - Update appointment
- `DELETE /api/appointments/:id` - Delete appointment
- `GET /api/appointments/stats/overview` - Appointment statistics

### Billing
- `GET /api/billing` - Get all bills (with pagination)
- `GET /api/billing/:id` - Get single bill
- `POST /api/billing` - Create bill
- `PUT /api/billing/:id` - Update bill
- `DELETE /api/billing/:id` - Delete bill
- `GET /api/billing/stats/overview` - Billing statistics

## 🎨 UI Components

The project uses shadcn/ui components for a consistent and modern design:

- **Cards** - For displaying information
- **Tables** - For data presentation
- **Forms** - For data input
- **Modals** - For detailed views and actions
- **Buttons** - For user interactions
- **Icons** - Lucide React icons throughout

## 📱 Responsive Design

- Mobile-first approach
- Responsive sidebar navigation
- Adaptive table layouts
- Touch-friendly interactions
- Optimized for all screen sizes

## 🚀 Deployment

### Frontend Deployment
```bash
cd client
npm run build
# Deploy the dist/ folder to your hosting service
```

### Backend Deployment
```bash
cd server
npm start
# Use PM2 or similar process manager for production
```

### Environment Variables for Production
- Set `NODE_ENV=production`
- Use strong `JWT_SECRET`
- Configure production `MONGO_URI`
- Set appropriate `CLIENT_URL`

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Check the documentation
- Review the code examples

## 🔮 Future Enhancements

- [ ] Real-time notifications
- [ ] Advanced reporting and analytics
- [ ] Integration with medical devices
- [ ] Mobile app development
- [ ] Multi-language support
- [ ] Advanced search and filtering
- [ ] Export functionality (PDF, Excel)
- [ ] Email notifications
- [ ] SMS integration
- [ ] Advanced user management

---

**Built with ❤️ using the MERN stack**
