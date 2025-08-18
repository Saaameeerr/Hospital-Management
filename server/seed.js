import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import User from './models/User.js';
import Doctor from './models/Doctor.js';
import Patient from './models/Patient.js';
import Appointment from './models/Appointment.js';
import Billing from './models/Billing.js';

dotenv.config();

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('MONGO_URI is not defined in environment variables');
  process.exit(1);
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('MongoDB connected successfully');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
};

const seedData = async () => {
  try {
    await connectDB();

    // Clear existing data
    await User.deleteMany({});
    await Doctor.deleteMany({});
    await Patient.deleteMany({});
    await Appointment.deleteMany({});
    await Billing.deleteMany({});

    console.log('Existing data cleared');

    // Create Admin Users (only these can create more admins)
    const adminUsers = [
      {
        name: 'Super Admin',
        email: 'admin@hospital.com',
        password: 'admin123',
        role: 'admin'
      },
      {
        name: 'Hospital Director',
        email: 'director@hospital.com',
        password: 'director123',
        role: 'admin'
      }
    ];

    console.log('Creating admin users...');
    for (const adminData of adminUsers) {
      const admin = new User(adminData);
      await admin.save();
      console.log(`Admin created: ${adminData.email}`);
    }

    // Create Doctor Users
    const doctorUsers = [
      {
        name: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@hospital.com',
        password: 'doctor123',
        role: 'doctor'
      },
      {
        name: 'Dr. Michael Chen',
        email: 'michael.chen@hospital.com',
        password: 'doctor123',
        role: 'doctor'
      },
      {
        name: 'Dr. Emily Rodriguez',
        email: 'emily.rodriguez@hospital.com',
        password: 'doctor123',
        role: 'doctor'
      },
      {
        name: 'Dr. David Thompson',
        email: 'david.thompson@hospital.com',
        password: 'doctor123',
        role: 'doctor'
      },
      {
        name: 'Dr. Lisa Wang',
        email: 'lisa.wang@hospital.com',
        password: 'doctor123',
        role: 'doctor'
      },
      {
        name: 'Dr. James Wilson',
        email: 'james.wilson@hospital.com',
        password: 'doctor123',
        role: 'doctor'
      },
      {
        name: 'Dr. Maria Garcia',
        email: 'maria.garcia@hospital.com',
        password: 'doctor123',
        role: 'doctor'
      },
      {
        name: 'Dr. Robert Brown',
        email: 'robert.brown@hospital.com',
        password: 'doctor123',
        role: 'doctor'
      },
      {
        name: 'Dr. Jennifer Lee',
        email: 'jennifer.lee@hospital.com',
        password: 'doctor123',
        role: 'doctor'
      },
      {
        name: 'Dr. Christopher Davis',
        email: 'christopher.davis@hospital.com',
        password: 'doctor123',
        role: 'doctor'
      }
    ];

    console.log('Creating doctor users...');
    for (const doctorData of doctorUsers) {
      const doctor = new User(doctorData);
      await doctor.save();
      console.log(`Doctor user created: ${doctorData.email}`);
    }

    // Create Receptionist Users
    const receptionistUsers = [
      {
        name: 'Amanda Smith',
        email: 'amanda.smith@hospital.com',
        password: 'reception123',
        role: 'receptionist'
      },
      {
        name: 'Kevin Martinez',
        email: 'kevin.martinez@hospital.com',
        password: 'reception123',
        role: 'receptionist'
      },
      {
        name: 'Rachel Green',
        email: 'rachel.green@hospital.com',
        password: 'reception123',
        role: 'receptionist'
      },
      {
        name: 'Daniel Kim',
        email: 'daniel.kim@hospital.com',
        password: 'reception123',
        role: 'receptionist'
      }
    ];

    console.log('Creating receptionist users...');
    for (const receptionistData of receptionistUsers) {
      const receptionist = new User(receptionistData);
      await receptionist.save();
      console.log(`Receptionist user created: ${receptionistData.email}`);
    }

    // Create Patient Users
    const patientUsers = [
      {
        name: 'John Smith',
        email: 'john.smith@email.com',
        password: 'patient123',
        role: 'patient'
      },
      {
        name: 'Emma Wilson',
        email: 'emma.wilson@email.com',
        password: 'patient123',
        role: 'patient'
      },
      {
        name: 'Michael Brown',
        email: 'michael.brown@email.com',
        password: 'patient123',
        role: 'patient'
      },
      {
        name: 'Sarah Davis',
        email: 'sarah.davis@email.com',
        password: 'patient123',
        role: 'patient'
      },
      {
        name: 'Robert Johnson',
        email: 'robert.johnson@email.com',
        password: 'patient123',
        role: 'patient'
      },
      {
        name: 'Lisa Anderson',
        email: 'lisa.anderson@email.com',
        password: 'patient123',
        role: 'patient'
      },
      {
        name: 'David Miller',
        email: 'david.miller@email.com',
        password: 'patient123',
        role: 'patient'
      },
      {
        name: 'Jennifer Taylor',
        email: 'jennifer.taylor@email.com',
        password: 'patient123',
        role: 'patient'
      },
      {
        name: 'Christopher White',
        email: 'christopher.white@email.com',
        password: 'patient123',
        role: 'patient'
      },
      {
        name: 'Amanda Harris',
        email: 'amanda.harris@email.com',
        password: 'patient123',
        role: 'patient'
      },
      {
        name: 'Kevin Martin',
        email: 'kevin.martin@email.com',
        password: 'patient123',
        role: 'patient'
      },
      {
        name: 'Rachel Garcia',
        email: 'rachel.garcia@email.com',
        password: 'patient123',
        role: 'patient'
      },
      {
        name: 'Daniel Rodriguez',
        email: 'daniel.rodriguez@email.com',
        password: 'patient123',
        role: 'patient'
      },
      {
        name: 'Maria Lee',
        email: 'maria.lee@email.com',
        password: 'patient123',
        role: 'patient'
      },
      {
        name: 'James Clark',
        email: 'james.clark@email.com',
        password: 'patient123',
        role: 'patient'
      }
    ];

    console.log('Creating patient users...');
    for (const patientData of patientUsers) {
      const patient = new User(patientData);
      await patient.save();
      console.log(`Patient user created: ${patientData.email}`);
    }

    // Get all users for reference
    const allUsers = await User.find({});
    const adminUsersList = allUsers.filter(u => u.role === 'admin');
    const doctorUsersList = allUsers.filter(u => u.role === 'doctor');
    const patientUsersList = allUsers.filter(u => u.role === 'patient');

    // Create Doctor Profiles
    const doctorProfiles = [
      {
        userId: doctorUsersList[0]._id,
        name: 'Dr. Sarah Johnson',
        specialization: 'Cardiology',
        department: 'Cardiology',
        experience: 15,
        contactNumber: '+15550101',
        licenseNumber: 'MD123456',
        email: 'sarah.johnson@hospital.com',
        bio: 'Experienced cardiologist specializing in interventional cardiology and heart failure management.',
        consultationFee: 150,
        availability: {
          monday: { available: true, start: '09:00', end: '17:00' },
          tuesday: { available: true, start: '09:00', end: '17:00' },
          wednesday: { available: true, start: '09:00', end: '17:00' },
          thursday: { available: true, start: '09:00', end: '17:00' },
          friday: { available: true, start: '09:00', end: '17:00' },
          saturday: { available: false, start: '09:00', end: '13:00' },
          sunday: { available: false, start: '09:00', end: '13:00' }
        },
        status: 'active'
      },
      {
        userId: doctorUsersList[1]._id,
        name: 'Dr. Michael Chen',
        specialization: 'Neurology',
        department: 'Neurology',
        experience: 12,
        contactNumber: '+15550102',
        licenseNumber: 'MD123457',
        email: 'michael.chen@hospital.com',
        bio: 'Neurologist with expertise in stroke treatment and neurological disorders.',
        consultationFee: 140,
        availability: {
          monday: { available: true, start: '08:00', end: '16:00' },
          tuesday: { available: true, start: '08:00', end: '16:00' },
          wednesday: { available: true, start: '08:00', end: '16:00' },
          thursday: { available: true, start: '08:00', end: '16:00' },
          friday: { available: true, start: '08:00', end: '16:00' },
          saturday: { available: false, start: '08:00', end: '12:00' },
          sunday: { available: false, start: '08:00', end: '12:00' }
        },
        status: 'active'
      },
      {
        userId: doctorUsersList[2]._id,
        name: 'Dr. Emily Rodriguez',
        specialization: 'Pediatrics',
        department: 'Pediatrics',
        experience: 8,
        contactNumber: '+15550103',
        licenseNumber: 'MD123458',
        email: 'emily.rodriguez@hospital.com',
        bio: 'Pediatrician specializing in child development and preventive care.',
        consultationFee: 120,
        availability: {
          monday: { available: true, start: '09:00', end: '18:00' },
          tuesday: { available: true, start: '09:00', end: '18:00' },
          wednesday: { available: true, start: '09:00', end: '18:00' },
          thursday: { available: true, start: '09:00', end: '18:00' },
          friday: { available: true, start: '09:00', end: '18:00' },
          saturday: { available: true, start: '09:00', end: '14:00' },
          sunday: { available: false, start: '09:00', end: '14:00' }
        },
        status: 'active'
      },
      {
        userId: doctorUsersList[3]._id,
        name: 'Dr. David Thompson',
        specialization: 'Orthopedics',
        department: 'Orthopedics',
        experience: 20,
        contactNumber: '+15550104',
        licenseNumber: 'MD123459',
        email: 'david.thompson@hospital.com',
        bio: 'Orthopedic surgeon specializing in joint replacement and sports medicine.',
        consultationFee: 180,
        availability: {
          monday: { available: true, start: '07:00', end: '15:00' },
          tuesday: { available: true, start: '07:00', end: '15:00' },
          wednesday: { available: true, start: '07:00', end: '15:00' },
          thursday: { available: true, start: '07:00', end: '15:00' },
          friday: { available: true, start: '07:00', end: '15:00' },
          saturday: { available: false, start: '07:00', end: '12:00' },
          sunday: { available: false, start: '07:00', end: '12:00' }
        },
        status: 'active'
      },
      {
        userId: doctorUsersList[4]._id,
        name: 'Dr. Lisa Wang',
        specialization: 'Dermatology',
        department: 'Dermatology',
        experience: 10,
        contactNumber: '+15550105',
        licenseNumber: 'MD123460',
        email: 'lisa.wang@hospital.com',
        bio: 'Dermatologist with expertise in skin cancer detection and cosmetic dermatology.',
        consultationFee: 130,
        availability: {
          monday: { available: true, start: '10:00', end: '18:00' },
          tuesday: { available: true, start: '10:00', end: '18:00' },
          wednesday: { available: true, start: '10:00', end: '18:00' },
          thursday: { available: true, start: '10:00', end: '18:00' },
          friday: { available: true, start: '10:00', end: '18:00' },
          saturday: { available: true, start: '10:00', end: '15:00' },
          sunday: { available: false, start: '10:00', end: '15:00' }
        },
        status: 'active'
      },
      {
        userId: doctorUsersList[5]._id,
        name: 'Dr. James Wilson',
        specialization: 'Psychiatry',
        department: 'Psychiatry',
        experience: 14,
        contactNumber: '+15550106',
        licenseNumber: 'MD123461',
        email: 'james.wilson@hospital.com',
        bio: 'Psychiatrist specializing in mood disorders and psychotherapy.',
        consultationFee: 160,
        availability: {
          monday: { available: true, start: '09:00', end: '17:00' },
          tuesday: { available: true, start: '09:00', end: '17:00' },
          wednesday: { available: true, start: '09:00', end: '17:00' },
          thursday: { available: true, start: '09:00', end: '17:00' },
          friday: { available: true, start: '09:00', end: '17:00' },
          saturday: { available: false, start: '09:00', end: '13:00' },
          sunday: { available: false, start: '09:00', end: '13:00' }
        },
        status: 'active'
      },
      {
        userId: doctorUsersList[6]._id,
        name: 'Dr. Maria Garcia',
        specialization: 'Oncology',
        department: 'Oncology',
        experience: 18,
        contactNumber: '+15550107',
        licenseNumber: 'MD123462',
        email: 'maria.garcia@hospital.com',
        bio: 'Oncologist specializing in breast cancer and targeted therapies.',
        consultationFee: 200,
        availability: {
          monday: { available: true, start: '08:00', end: '16:00' },
          tuesday: { available: true, start: '08:00', end: '16:00' },
          wednesday: { available: true, start: '08:00', end: '16:00' },
          thursday: { available: true, start: '08:00', end: '16:00' },
          friday: { available: true, start: '08:00', end: '16:00' },
          saturday: { available: false, start: '08:00', end: '12:00' },
          sunday: { available: false, start: '08:00', end: '12:00' }
        },
        status: 'active'
      },
      {
        userId: doctorUsersList[7]._id,
        name: 'Dr. Robert Brown',
        specialization: 'Emergency Medicine',
        department: 'Emergency',
        experience: 16,
        contactNumber: '+15550108',
        licenseNumber: 'MD123463',
        email: 'robert.brown@hospital.com',
        bio: 'Emergency medicine specialist with trauma care expertise.',
        consultationFee: 140,
        availability: {
          monday: { available: true, start: '06:00', end: '18:00' },
          tuesday: { available: true, start: '06:00', end: '18:00' },
          wednesday: { available: true, start: '06:00', end: '18:00' },
          thursday: { available: true, start: '06:00', end: '18:00' },
          friday: { available: true, start: '06:00', end: '18:00' },
          saturday: { available: true, start: '06:00', end: '18:00' },
          sunday: { available: true, start: '06:00', end: '18:00' }
        },
        status: 'active'
      },
      {
        userId: doctorUsersList[8]._id,
        name: 'Dr. Jennifer Lee',
        specialization: 'Obstetrics & Gynecology',
        department: 'Obstetrics',
        experience: 11,
        contactNumber: '+15550109',
        licenseNumber: 'MD123464',
        email: 'jennifer.lee@hospital.com',
        bio: 'OB/GYN specialist in high-risk pregnancies and gynecological surgery.',
        consultationFee: 150,
        availability: {
          monday: { available: true, start: '08:00', end: '17:00' },
          tuesday: { available: true, start: '08:00', end: '17:00' },
          wednesday: { available: true, start: '08:00', end: '17:00' },
          thursday: { available: true, start: '08:00', end: '17:00' },
          friday: { available: true, start: '08:00', end: '17:00' },
          saturday: { available: false, start: '08:00', end: '12:00' },
          sunday: { available: false, start: '08:00', end: '12:00' }
        },
        status: 'active'
      },
      {
        userId: doctorUsersList[9]._id,
        name: 'Dr. Christopher Davis',
        specialization: 'Internal Medicine',
        department: 'Internal Medicine',
        experience: 13,
        contactNumber: '+15550110',
        licenseNumber: 'MD123465',
        email: 'christopher.davis@hospital.com',
        bio: 'Internal medicine specialist focusing on preventive care and chronic disease management.',
        consultationFee: 125,
        availability: {
          monday: { available: true, start: '09:00', end: '17:00' },
          tuesday: { available: true, start: '09:00', end: '17:00' },
          wednesday: { available: true, start: '09:00', end: '17:00' },
          thursday: { available: true, start: '09:00', end: '17:00' },
          friday: { available: true, start: '09:00', end: '17:00' },
          saturday: { available: true, start: '09:00', end: '14:00' },
          sunday: { available: false, start: '09:00', end: '14:00' }
        },
        status: 'active'
      }
    ];

    console.log('Creating doctor profiles...');
    for (const doctorProfile of doctorProfiles) {
      const doctor = new Doctor(doctorProfile);
      await doctor.save();
      console.log(`Doctor profile created: ${doctorProfile.name}`);
    }

    // Create Patient Profiles
    const patientProfiles = [
      {
        userId: patientUsersList[0]._id,
        name: 'John Smith',
        age: 35,
        gender: 'male',
        contactNumber: '+15550201',
        address: {
          street: '123 Main St',
          city: 'City',
          state: 'State',
          zipCode: '12345',
          country: 'USA'
        },
        bloodGroup: 'O+',
        emergencyContact: {
          name: 'Jane Smith',
          relationship: 'Spouse',
          phone: '+15550202'
        },
        medicalHistory: [
          { condition: 'Hypertension', diagnosedDate: new Date('2020-01-15'), status: 'chronic' },
          { condition: 'Diabetes Type 2', diagnosedDate: new Date('2021-03-20'), status: 'chronic' }
        ],
        allergies: ['Penicillin'],
        currentMedications: ['Metformin', 'Lisinopril'],
        currentDisease: 'Hypertension',
        admittedDate: new Date('2024-01-15'),
        dischargeDate: new Date('2024-01-20'),
        assignedDoctor: doctorUsersList[0]._id,
        status: 'discharged'
      },
      {
        userId: patientUsersList[1]._id,
        name: 'Emma Wilson',
        age: 28,
        gender: 'female',
        contactNumber: '+15550203',
        address: {
          street: '456 Oak Ave',
          city: 'City',
          state: 'State',
          zipCode: '12345',
          country: 'USA'
        },
        bloodGroup: 'A+',
        emergencyContact: {
          name: 'Robert Wilson',
          relationship: 'Father',
          phone: '+15550204'
        },
        medicalHistory: [
          { condition: 'Asthma', diagnosedDate: new Date('2018-06-10'), status: 'chronic' }
        ],
        allergies: ['Dust', 'Pollen'],
        currentMedications: ['Albuterol'],
        currentDisease: 'Asthma',
        admittedDate: new Date('2024-01-20'),
        dischargeDate: new Date('2024-01-22'),
        assignedDoctor: doctorUsersList[2]._id,
        status: 'discharged'
      },
      {
        userId: patientUsersList[2]._id,
        name: 'Michael Brown',
        age: 45,
        gender: 'male',
        contactNumber: '+15550205',
        address: {
          street: '789 Pine Rd',
          city: 'City',
          state: 'State',
          zipCode: '12345',
          country: 'USA'
        },
        bloodGroup: 'B+',
        emergencyContact: {
          name: 'Lisa Brown',
          relationship: 'Wife',
          phone: '+15550206'
        },
        medicalHistory: [
          { condition: 'Heart Disease', diagnosedDate: new Date('2019-11-05'), status: 'chronic' },
          { condition: 'High Cholesterol', diagnosedDate: new Date('2020-08-12'), status: 'chronic' }
        ],
        allergies: ['Shellfish'],
        currentMedications: ['Atorvastatin', 'Metoprolol'],
        currentDisease: 'Heart Disease',
        admittedDate: new Date('2024-01-25'),
        dischargeDate: null,
        assignedDoctor: doctorUsersList[0]._id,
        status: 'admitted'
      },
      {
        userId: patientUsersList[3]._id,
        name: 'Sarah Davis',
        age: 32,
        gender: 'female',
        contactNumber: '+15550207',
        address: {
          street: '321 Elm St',
          city: 'City',
          state: 'State',
          zipCode: '12345',
          country: 'USA'
        },
        bloodGroup: 'AB+',
        emergencyContact: {
          name: 'Mark Davis',
          relationship: 'Husband',
          phone: '+15550208'
        },
        medicalHistory: [
          { condition: 'Depression', diagnosedDate: new Date('2022-01-10'), status: 'active' },
          { condition: 'Anxiety', diagnosedDate: new Date('2022-01-10'), status: 'active' }
        ],
        allergies: [],
        currentMedications: ['Sertraline'],
        currentDisease: 'Depression',
        admittedDate: new Date('2024-01-18'),
        dischargeDate: new Date('2024-01-25'),
        assignedDoctor: doctorUsersList[5]._id,
        status: 'discharged'
      },
      {
        userId: patientUsersList[4]._id,
        name: 'Robert Johnson',
        age: 52,
        gender: 'male',
        contactNumber: '+15550209',
        address: {
          street: '654 Maple Dr',
          city: 'City',
          state: 'State',
          zipCode: '12345',
          country: 'USA'
        },
        bloodGroup: 'O-',
        emergencyContact: {
          name: 'Patricia Johnson',
          relationship: 'Sister',
          phone: '+15550210'
        },
        medicalHistory: [
          { condition: 'Arthritis', diagnosedDate: new Date('2017-09-15'), status: 'chronic' },
          { condition: 'Osteoporosis', diagnosedDate: new Date('2021-12-03'), status: 'chronic' }
        ],
        allergies: ['Ibuprofen'],
        currentMedications: ['Calcium', 'Vitamin D'],
        currentDisease: 'Arthritis',
        admittedDate: new Date('2024-01-22'),
        dischargeDate: null,
        assignedDoctor: doctorUsersList[3]._id,
        status: 'admitted'
      },
      {
        userId: patientUsersList[5]._id,
        name: 'Lisa Anderson',
        age: 29,
        gender: 'female',
        contactNumber: '+15550211',
        address: {
          street: '987 Cedar Ln',
          city: 'City',
          state: 'State',
          zipCode: '12345',
          country: 'USA'
        },
        bloodGroup: 'A-',
        emergencyContact: {
          name: 'Thomas Anderson',
          relationship: 'Brother',
          phone: '+15550212'
        },
        medicalHistory: [
          { condition: 'Migraine', diagnosedDate: new Date('2019-04-22'), status: 'chronic' }
        ],
        allergies: ['Chocolate'],
        currentMedications: ['Sumatriptan'],
        currentDisease: 'Migraine',
        admittedDate: new Date('2024-01-19'),
        dischargeDate: new Date('2024-01-21'),
        assignedDoctor: doctorUsersList[1]._id,
        status: 'discharged'
      },
      {
        userId: patientUsersList[6]._id,
        name: 'David Miller',
        age: 41,
        gender: 'male',
        contactNumber: '+15550213',
        address: {
          street: '147 Birch Ave',
          city: 'City',
          state: 'State',
          zipCode: '12345',
          country: 'USA'
        },
        bloodGroup: 'B-',
        emergencyContact: {
          name: 'Nancy Miller',
          relationship: 'Wife',
          phone: '+15550214'
        },
        medicalHistory: [
          { condition: 'Sleep Apnea', diagnosedDate: new Date('2020-03-18'), status: 'chronic' }
        ],
        allergies: [],
        currentMedications: ['CPAP therapy'],
        currentDisease: 'Sleep Apnea',
        admittedDate: new Date('2024-01-24'),
        dischargeDate: null,
        assignedDoctor: doctorUsersList[6]._id,
        status: 'admitted'
      },
      {
        userId: patientUsersList[7]._id,
        name: 'Jennifer Taylor',
        age: 36,
        gender: 'female',
        contactNumber: '+15550215',
        address: {
          street: '258 Spruce St',
          city: 'City',
          state: 'State',
          zipCode: '12345',
          country: 'USA'
        },
        bloodGroup: 'O+',
        emergencyContact: {
          name: 'William Taylor',
          relationship: 'Husband',
          phone: '+15550216'
        },
        medicalHistory: [
          { condition: 'PCOS', diagnosedDate: new Date('2018-12-05'), status: 'chronic' },
          { condition: 'Endometriosis', diagnosedDate: new Date('2019-06-20'), status: 'chronic' }
        ],
        allergies: ['Latex'],
        currentMedications: ['Birth control'],
        currentDisease: 'PCOS',
        admittedDate: new Date('2024-01-21'),
        dischargeDate: new Date('2024-01-23'),
        assignedDoctor: doctorUsersList[8]._id,
        status: 'discharged'
      },
      {
        userId: patientUsersList[8]._id,
        name: 'Christopher White',
        age: 38,
        gender: 'male',
        contactNumber: '+15550217',
        address: {
          street: '369 Willow Rd',
          city: 'City',
          state: 'State',
          zipCode: '12345',
          country: 'USA'
        },
        bloodGroup: 'AB-',
        emergencyContact: {
          name: 'Amanda White',
          relationship: 'Wife',
          phone: '+15550218'
        },
        medicalHistory: [
          { condition: 'Ulcerative Colitis', diagnosedDate: new Date('2020-07-14'), status: 'chronic' }
        ],
        allergies: ['Aspirin'],
        currentMedications: ['Mesalamine'],
        currentDisease: 'Ulcerative Colitis',
        admittedDate: new Date('2024-01-23'),
        dischargeDate: null,
        assignedDoctor: doctorUsersList[9]._id,
        status: 'admitted'
      },
      {
        userId: patientUsersList[9]._id,
        name: 'Amanda Harris',
        age: 31,
        gender: 'female',
        contactNumber: '+15550219',
        address: {
          street: '741 Poplar Dr',
          city: 'City',
          state: 'State',
          zipCode: '12345',
          country: 'USA'
        },
        bloodGroup: 'A+',
        emergencyContact: {
          name: 'Steven Harris',
          relationship: 'Husband',
          phone: '+15550220'
        },
        medicalHistory: [
          { condition: 'Eczema', diagnosedDate: new Date('2019-02-28'), status: 'chronic' }
        ],
        allergies: ['Wool', 'Fragrances'],
        currentMedications: ['Hydrocortisone cream'],
        currentDisease: 'Eczema',
        admittedDate: new Date('2024-01-17'),
        dischargeDate: new Date('2024-01-19'),
        assignedDoctor: doctorUsersList[4]._id,
        status: 'discharged'
      },
      {
        userId: patientUsersList[10]._id,
        name: 'Kevin Martin',
        age: 44,
        gender: 'male',
        contactNumber: '+15550221',
        address: {
          street: '852 Ash Ln',
          city: 'City',
          state: 'State',
          zipCode: '12345',
          country: 'USA'
        },
        bloodGroup: 'O+',
        emergencyContact: {
          name: 'Michelle Martin',
          relationship: 'Wife',
          phone: '+15550222'
        },
        medicalHistory: [
          { condition: 'Kidney Stones', diagnosedDate: new Date('2023-08-30'), status: 'active' }
        ],
        allergies: [],
        currentMedications: ['Pain medication'],
        currentDisease: 'Kidney Stones',
        admittedDate: new Date('2024-01-26'),
        dischargeDate: null,
        assignedDoctor: doctorUsersList[7]._id,
        status: 'admitted'
      },
      {
        userId: patientUsersList[11]._id,
        name: 'Rachel Garcia',
        age: 27,
        gender: 'female',
        contactNumber: '+15550223',
        address: {
          street: '963 Cherry Ave',
          city: 'City',
          state: 'State',
          zipCode: '12345',
          country: 'USA'
        },
        bloodGroup: 'B+',
        emergencyContact: {
          name: 'Carlos Garcia',
          relationship: 'Father',
          phone: '+15550224'
        },
        medicalHistory: [
          { condition: 'Anemia', diagnosedDate: new Date('2022-11-15'), status: 'active' }
        ],
        allergies: ['Iron supplements'],
        currentMedications: ['Folic acid'],
        currentDisease: 'Anemia',
        admittedDate: new Date('2024-01-20'),
        dischargeDate: new Date('2024-01-22'),
        assignedDoctor: doctorUsersList[9]._id,
        status: 'discharged'
      },
      {
        userId: patientUsersList[12]._id,
        name: 'Daniel Rodriguez',
        age: 33,
        gender: 'male',
        contactNumber: '+15550225',
        address: {
          street: '159 Hickory St',
          city: 'City',
          state: 'State',
          zipCode: '12345',
          country: 'USA'
        },
        bloodGroup: 'A-',
        emergencyContact: {
          name: 'Isabella Rodriguez',
          relationship: 'Wife',
          phone: '+15550226'
        },
        medicalHistory: [
          { condition: 'Diabetes Type 1', diagnosedDate: new Date('2015-03-10'), status: 'chronic' }
        ],
        allergies: [],
        currentMedications: ['Insulin'],
        currentDisease: 'Diabetes Type 1',
        admittedDate: new Date('2024-01-25'),
        dischargeDate: null,
        assignedDoctor: doctorUsersList[9]._id,
        status: 'admitted'
      },
      {
        userId: patientUsersList[13]._id,
        name: 'Maria Lee',
        age: 39,
        gender: 'female',
        contactNumber: '+15550227',
        address: {
          street: '357 Sycamore Rd',
          city: 'City',
          state: 'State',
          zipCode: '12345',
          country: 'USA'
        },
        bloodGroup: 'O-',
        emergencyContact: {
          name: 'James Lee',
          relationship: 'Husband',
          phone: '+15550228'
        },
        medicalHistory: [
          { condition: 'Fibromyalgia', diagnosedDate: new Date('2021-05-18'), status: 'chronic' }
        ],
        allergies: [],
        currentMedications: ['Gabapentin'],
        currentDisease: 'Fibromyalgia',
        admittedDate: new Date('2024-01-18'),
        dischargeDate: new Date('2024-01-24'),
        assignedDoctor: doctorUsersList[5]._id,
        status: 'discharged'
      },
      {
        userId: patientUsersList[14]._id,
        name: 'James Clark',
        age: 47,
        gender: 'male',
        contactNumber: '+15550229',
        address: {
          street: '486 Magnolia Dr',
          city: 'City',
          state: 'State',
          zipCode: '12345',
          country: 'USA'
        },
        bloodGroup: 'AB+',
        emergencyContact: {
          name: 'Elizabeth Clark',
          relationship: 'Wife',
          phone: '+15550230'
        },
        medicalHistory: [
          { condition: 'Prostate Cancer', diagnosedDate: new Date('2023-01-25'), status: 'active' }
        ],
        allergies: [],
        currentMedications: ['Hormone therapy'],
        currentDisease: 'Prostate Cancer',
        admittedDate: new Date('2024-01-27'),
        dischargeDate: null,
        assignedDoctor: doctorUsersList[6]._id,
        status: 'admitted'
      }
    ];

    // Update first 5 patients with more detailed medicalHistory, recent admittedDate, and assignedDoctor
    patientProfiles[0].medicalHistory.push(
      { condition: 'Blood Test', diagnosedDate: new Date(Date.now() - 7*24*60*60*1000), status: 'resolved' },
      { condition: 'X-Ray', diagnosedDate: new Date(Date.now() - 3*24*60*60*1000), status: 'active' }
    );
    patientProfiles[0].admittedDate = new Date();
    patientProfiles[0].assignedDoctor = doctorUsersList[0]._id;
    patientProfiles[0].status = 'admitted';

    patientProfiles[1].medicalHistory.push(
      { condition: 'MRI', diagnosedDate: new Date(Date.now() - 10*24*60*60*1000), status: 'resolved' },
      { condition: 'ECG', diagnosedDate: new Date(Date.now() - 2*24*60*60*1000), status: 'active' }
    );
    patientProfiles[1].admittedDate = new Date();
    patientProfiles[1].assignedDoctor = doctorUsersList[1]._id;
    patientProfiles[1].status = 'admitted';

    patientProfiles[2].medicalHistory.push(
      { condition: 'CT Scan', diagnosedDate: new Date(Date.now() - 5*24*60*60*1000), status: 'active' }
    );
    patientProfiles[2].admittedDate = new Date();
    patientProfiles[2].assignedDoctor = doctorUsersList[2]._id;
    patientProfiles[2].status = 'admitted';

    patientProfiles[3].medicalHistory.push(
      { condition: 'Urine Test', diagnosedDate: new Date(Date.now() - 1*24*60*60*1000), status: 'active' }
    );
    patientProfiles[4].medicalHistory.push(
      { condition: 'Liver Function Test', diagnosedDate: new Date(Date.now() - 4*24*60*60*1000), status: 'resolved' }
    );

    console.log('Creating patient profiles...');
    for (const patientProfile of patientProfiles) {
      const patient = new Patient(patientProfile);
      await patient.save();
      console.log(`Patient profile created: ${patientProfile.name}`);
    }

    // Get all doctors and patients for appointments
    const allDoctors = await Doctor.find({});
    const allPatients = await Patient.find({});

    // Create Sample Appointments
    const appointments = [
      {
        patientId: allPatients[0]._id,
        doctorId: allDoctors[0]._id,
        appointmentDate: new Date('2024-02-01'),
        appointmentTime: '10:00',
        reason: 'Follow-up consultation for hypertension',
        type: 'follow_up',
        priority: 'medium',
        status: 'scheduled'
      },
      {
        patientId: allPatients[1]._id,
        doctorId: allDoctors[2]._id,
        appointmentDate: new Date('2024-02-01'),
        appointmentTime: '14:00',
        reason: 'Annual checkup',
        type: 'routine_checkup',
        priority: 'low',
        status: 'scheduled'
      },
      {
        patientId: allPatients[2]._id,
        doctorId: allDoctors[0]._id,
        appointmentDate: new Date('2024-02-02'),
        appointmentTime: '09:00',
        reason: 'Chest pain evaluation',
        type: 'consultation',
        priority: 'high',
        status: 'scheduled'
      },
      {
        patientId: allPatients[3]._id,
        doctorId: allDoctors[5]._id,
        appointmentDate: new Date('2024-02-02'),
        appointmentTime: '15:00',
        reason: 'Depression therapy session',
        type: 'consultation',
        priority: 'medium',
        status: 'scheduled'
      },
      {
        patientId: allPatients[4]._id,
        doctorId: allDoctors[3]._id,
        appointmentDate: new Date('2024-02-03'),
        appointmentTime: '11:00',
        reason: 'Joint pain assessment',
        type: 'consultation',
        priority: 'medium',
        status: 'scheduled'
      }
    ];

    // Add 3 new appointments for today
    const today = new Date();
    appointments.push(
      {
        patientId: allPatients[5]._id,
        doctorId: allDoctors[3]._id,
        appointmentDate: today,
        appointmentTime: '11:30',
        reason: 'Migraine follow-up',
        type: 'follow_up',
        priority: 'medium',
        status: 'scheduled'
      },
      {
        patientId: allPatients[6]._id,
        doctorId: allDoctors[4]._id,
        appointmentDate: today,
        appointmentTime: '13:00',
        reason: 'Skin rash check',
        type: 'consultation',
        priority: 'low',
        status: 'confirmed'
      },
      {
        patientId: allPatients[7]._id,
        doctorId: allDoctors[5]._id,
        appointmentDate: today,
        appointmentTime: '15:30',
        reason: 'Therapy session',
        type: 'consultation',
        priority: 'medium',
        status: 'scheduled'
      }
    );

    console.log('Creating appointments...');
    for (const appointment of appointments) {
      const newAppointment = new Appointment(appointment);
      await newAppointment.save();
      console.log(`Appointment created for ${appointment.patientId}`);
    }

         // Create Sample Billing Records
     const billingRecords = [
       {
         patientId: allPatients[0]._id,
         appointmentId: null,
         doctorId: allDoctors[0]._id,
         generatedBy: adminUsersList[0]._id,
         billNumber: 'BILL-001',
         billDate: new Date('2024-01-20'),
         dueDate: new Date('2024-02-20'),
         items: [
           { description: 'Consultation Fee', quantity: 1, unitPrice: 150, total: 150 },
           { description: 'Blood Tests', quantity: 1, unitPrice: 85, total: 85 },
           { description: 'Medication', quantity: 1, unitPrice: 45, total: 45 }
         ],
         subtotal: 280,
         tax: 28,
         totalAmount: 308,
         paidAmount: 308,
         status: 'paid',
         paymentMethod: 'credit_card',
         paymentDate: new Date('2024-01-21')
       },
       {
         patientId: allPatients[1]._id,
         appointmentId: null,
         doctorId: allDoctors[2]._id,
         generatedBy: adminUsersList[0]._id,
         billNumber: 'BILL-002',
         billDate: new Date('2024-01-22'),
         dueDate: new Date('2024-02-22'),
         items: [
           { description: 'Consultation Fee', quantity: 1, unitPrice: 120, total: 120 },
           { description: 'X-Ray', quantity: 1, unitPrice: 120, total: 120 }
         ],
         subtotal: 240,
         tax: 24,
         totalAmount: 264,
         paidAmount: 0,
         status: 'pending',
         paymentMethod: null,
         paymentDate: null
       },
       {
         patientId: allPatients[2]._id,
         appointmentId: null,
         doctorId: allDoctors[0]._id,
         generatedBy: adminUsersList[0]._id,
         billNumber: 'BILL-003',
         billDate: new Date('2024-01-25'),
         dueDate: new Date('2024-02-25'),
         items: [
           { description: 'Emergency Consultation', quantity: 1, unitPrice: 200, total: 200 },
           { description: 'ECG', quantity: 1, unitPrice: 150, total: 150 },
           { description: 'Medication', quantity: 1, unitPrice: 60, total: 60 }
         ],
         subtotal: 410,
         tax: 41,
         totalAmount: 451,
         paidAmount: 0,
         status: 'pending',
         paymentMethod: null,
         paymentDate: null
       }
     ];

    // Add 2 new bills: one pending, one overdue
    billingRecords.push(
      {
        patientId: allPatients[5]._id,
        appointmentId: null,
        doctorId: allDoctors[3]._id,
        generatedBy: adminUsersList[1]._id,
        billNumber: 'BILL-004',
        billDate: new Date(Date.now() - 2*24*60*60*1000),
        dueDate: new Date(Date.now() + 5*24*60*60*1000),
        items: [
          { description: 'Migraine Consultation', quantity: 1, unitPrice: 180, total: 180 },
          { description: 'Medication', quantity: 1, unitPrice: 40, total: 40 }
        ],
        subtotal: 220,
        tax: 22,
        totalAmount: 242,
        paidAmount: 0,
        status: 'pending',
        paymentMethod: null,
        paymentDate: null
      },
      {
        patientId: allPatients[6]._id,
        appointmentId: null,
        doctorId: allDoctors[4]._id,
        generatedBy: adminUsersList[1]._id,
        billNumber: 'BILL-005',
        billDate: new Date(Date.now() - 15*24*60*60*1000),
        dueDate: new Date(Date.now() - 5*24*60*60*1000),
        items: [
          { description: 'Dermatology Consultation', quantity: 1, unitPrice: 130, total: 130 },
          { description: 'Skin Test', quantity: 1, unitPrice: 60, total: 60 }
        ],
        subtotal: 190,
        tax: 19,
        totalAmount: 209,
        paidAmount: 0,
        status: 'overdue',
        paymentMethod: null,
        paymentDate: null
      }
    );

    console.log('Creating billing records...');
    for (const billing of billingRecords) {
      const newBilling = new Billing(billing);
      await newBilling.save();
      console.log(`Billing record created: ${billing.billNumber}`);
    }

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📋 Login Credentials:');
    console.log('\n🔐 Admin Accounts (Only these can create more admins):');
    console.log('   Email: admin@hospital.com | Password: admin123');
    console.log('   Email: director@hospital.com | Password: director123');
    console.log('\n👨‍⚕️ Doctor Accounts:');
    console.log('   Email: sarah.johnson@hospital.com | Password: doctor123');
    console.log('   Email: michael.chen@hospital.com | Password: doctor123');
    console.log('   (and 8 more doctors with same password)');
    console.log('\n👥 Receptionist Accounts:');
    console.log('   Email: amanda.smith@hospital.com | Password: reception123');
    console.log('   (and 3 more receptionists with same password)');
    console.log('\n🏥 Patient Accounts:');
    console.log('   Email: john.smith@email.com | Password: patient123');
    console.log('   (and 14 more patients with same password)');
    console.log('\n⚠️  IMPORTANT: Admin accounts can only be created by existing admins!');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
