import express from 'express';
import { body, validationResult } from 'express-validator';
import Appointment from '../models/Appointment.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import { protect, requireStaff } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/appointments
// @desc    Get all appointments with pagination and filters
// @access  Private (Staff only)
router.get('/', protect, requireStaff, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const date = req.query.date || '';
    const doctorId = req.query.doctorId || '';

    const query = {};
    
    if (search) {
      // Search by patient name or doctor name
      const patients = await Patient.find({ 
        name: { $regex: search, $options: 'i' } 
      }).select('_id');
      
      const doctors = await Doctor.find({ 
        name: { $regex: search, $options: 'i' } 
      }).select('_id');
      
      query.$or = [
        { patientId: { $in: patients.map(p => p._id) } },
        { doctorId: { $in: doctors.map(d => d._id) } }
      ];
    }

    if (status) {
      query.status = status;
    }

    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.appointmentDate = {
        $gte: searchDate,
        $lt: nextDay
      };
    }

    if (doctorId) {
      query.doctorId = doctorId;
    }

    const skip = (page - 1) * limit;
    
    const appointments = await Appointment.find(query)
      .populate('patientId', 'name age gender')
      .populate('doctorId', 'name specialization department')
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .skip(skip)
      .limit(limit);

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      data: appointments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get appointments error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching appointments' 
    });
  }
});

// @route   GET /api/appointments/:id
// @desc    Get single appointment by ID
// @access  Private (Staff only)
router.get('/:id', protect, requireStaff, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name age gender contactNumber')
      .populate('doctorId', 'name specialization department contactNumber');

    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Get appointment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching appointment' 
    });
  }
});

// @route   GET /api/appointments/patient/:patientId
// @desc    Get appointments for a specific patient
// @access  Private (Patient can view their own appointments)
router.get('/patient/:patientId', protect, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { status, limit = 10, page = 1 } = req.query;

    // Check if user is requesting their own appointments or is staff
    if (req.user.role === 'patient' && req.user._id.toString() !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own appointments'
      });
    }

    const query = { patientId };
    
    if (status) {
      query.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const appointments = await Appointment.find(query)
      .populate('doctorId', 'name specialization department')
      .populate('patientId', 'name age gender')
      .sort({ appointmentDate: -1, appointmentTime: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Appointment.countDocuments(query);

    res.json({
      success: true,
      data: appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Get patient appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching patient appointments'
    });
  }
});

// @route   POST /api/appointments/check-availability
// @desc    Check if appointment slot is available
// @access  Private
router.post('/check-availability', protect, async (req, res) => {
  try {
    const { doctorId, appointmentDate, appointmentTime } = req.body;

    if (!doctorId || !appointmentDate || !appointmentTime) {
      return res.status(400).json({
        success: false,
        message: 'Doctor ID, appointment date, and time are required'
      });
    }

    // Check if the doctor exists and is active
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || doctor.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Doctor not found or not available'
      });
    }

    // Check if the date is valid (not in the past)
    const appointmentDateTime = new Date(`${appointmentDate}T${appointmentTime}`);
    if (appointmentDateTime <= new Date()) {
      return res.status(400).json({
        success: false,
        message: 'Appointment date and time must be in the future'
      });
    }

    // Check doctor's availability for the day
    const dayOfWeek = appointmentDateTime.toLocaleDateString('en-US', { weekday: 'lowercase' });
    const dayAvailability = doctor.availability[dayOfWeek];
    
    if (!dayAvailability || !dayAvailability.available) {
      return res.status(400).json({
        success: false,
        message: 'Doctor is not available on this day'
      });
    }

    // Check if the time falls within doctor's working hours
    const appointmentTimeObj = new Date(`2000-01-01T${appointmentTime}`);
    const startTime = new Date(`2000-01-01T${dayAvailability.start}`);
    const endTime = new Date(`2000-01-01T${dayAvailability.end}`);
    
    if (appointmentTimeObj < startTime || appointmentTimeObj >= endTime) {
      return res.status(400).json({
        success: false,
        message: 'Appointment time is outside doctor\'s working hours'
      });
    }

    // Check for existing appointments at the same time
    const existingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate,
      appointmentTime,
      status: { $in: ['scheduled', 'confirmed'] }
    });

    if (existingAppointment) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked. Please choose another time.'
      });
    }

    res.json({
      success: true,
      message: 'Appointment slot is available',
      data: {
        available: true,
        doctorName: doctor.name,
        specialization: doctor.specialization,
        consultationFee: doctor.consultationFee
      }
    });

  } catch (error) {
    console.error('Check availability error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while checking availability'
    });
  }
});

// @route   POST /api/appointments/patient
// @desc    Create new appointment for patients (self-booking)
// @access  Private (Patients can book their own appointments)
router.post('/patient', protect, [
  body('doctorId').isMongoId().withMessage('Valid doctor ID is required'),
  body('appointmentDate').isISO8601().withMessage('Valid appointment date is required'),
  body('appointmentTime').notEmpty().withMessage('Appointment time is required'),
  body('reason').trim().notEmpty().withMessage('Appointment reason is required'),
  body('symptoms').optional().trim(),
  body('type').optional().isIn(['consultation', 'follow_up', 'emergency', 'routine_checkup']).withMessage('Invalid appointment type'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    // Only patients can use this route
    if (req.user.role !== 'patient') {
      return res.status(403).json({
        success: false,
        message: 'Only patients can book appointments using this route'
      });
    }

    const { doctorId, appointmentDate, appointmentTime } = req.body;
    const patientId = req.user._id; // Use the authenticated user's ID

    // Check if doctor exists and is active
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || doctor.status !== 'active') {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not found or not available' 
      });
    }

    // Check for appointment conflicts
    const conflictingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate,
      appointmentTime,
      status: { $nin: ['cancelled', 'completed'] }
    });

    if (conflictingAppointment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Time slot is already booked for this doctor' 
      });
    }

    // Create appointment data
    const appointmentData = {
      ...req.body,
      patientId,
      status: 'scheduled',
      type: req.body.type || 'consultation',
      priority: req.body.priority || 'medium'
    };

    const appointment = await Appointment.create(appointmentData);

    // Populate the created appointment
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'name age gender')
      .populate('doctorId', 'name specialization department');

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully!',
      data: populatedAppointment
    });
  } catch (error) {
    console.error('Create patient appointment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while booking appointment' 
    });
  }
});

// @route   POST /api/appointments
// @desc    Create new appointment
// @access  Private (Staff only)
router.post('/', protect, requireStaff, [
  body('patientId').isMongoId().withMessage('Valid patient ID is required'),
  body('doctorId').isMongoId().withMessage('Valid doctor ID is required'),
  body('appointmentDate').isISO8601().withMessage('Valid appointment date is required'),
  body('appointmentTime').notEmpty().withMessage('Appointment time is required'),
  body('reason').trim().notEmpty().withMessage('Appointment reason is required'),
  body('type').optional().isIn(['consultation', 'follow_up', 'emergency', 'routine_checkup']).withMessage('Invalid appointment type'),
  body('priority').optional().isIn(['low', 'medium', 'high', 'urgent']).withMessage('Invalid priority level')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { patientId, doctorId, appointmentDate, appointmentTime } = req.body;

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not found' 
      });
    }

    // Check for appointment conflicts
    const conflictingAppointment = await Appointment.findOne({
      doctorId,
      appointmentDate,
      appointmentTime,
      status: { $nin: ['cancelled', 'completed'] }
    });

    if (conflictingAppointment) {
      return res.status(400).json({ 
        success: false, 
        message: 'Time slot is already booked for this doctor' 
      });
    }

    const appointment = await Appointment.create(req.body);

    // Populate the created appointment
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate('patientId', 'name age gender')
      .populate('doctorId', 'name specialization department');

    res.status(201).json({
      success: true,
      data: populatedAppointment
    });
  } catch (error) {
    console.error('Create appointment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while creating appointment' 
    });
  }
});

// @route   PUT /api/appointments/:id
// @desc    Update appointment
// @access  Private (Staff only)
router.put('/:id', protect, requireStaff, [
  body('status').optional().isIn(['scheduled', 'confirmed', 'in_progress', 'completed', 'cancelled', 'no_show']).withMessage('Invalid status'),
  body('notes').optional().isLength({ max: 1000 }).withMessage('Notes cannot exceed 1000 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    ).populate('patientId', 'name age gender')
     .populate('doctorId', 'name specialization department');

    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }

    res.json({
      success: true,
      data: appointment
    });
  } catch (error) {
    console.error('Update appointment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating appointment' 
    });
  }
});

// @route   DELETE /api/appointments/:id
// @desc    Delete appointment
// @access  Private (Staff only)
router.delete('/:id', protect, requireStaff, async (req, res) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
      return res.status(404).json({ 
        success: false, 
        message: 'Appointment not found' 
      });
    }

    res.json({
      success: true,
      message: 'Appointment deleted successfully'
    });
  } catch (error) {
    console.error('Delete appointment error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting appointment' 
    });
  }
});

// @route   PUT /api/appointments/:id/cancel
// @desc    Cancel appointment (patients can cancel their own appointments)
// @access  Private
router.put('/:id/cancel', protect, async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate('patientId', 'name email')
      .populate('doctorId', 'name specialization');

    if (!appointment) {
      return res.status(404).json({
        success: false,
        message: 'Appointment not found'
      });
    }

    // Check if user can cancel this appointment
    if (req.user.role === 'patient' && appointment.patientId._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own appointments'
      });
    }

    // Check if appointment can be cancelled
    if (appointment.status === 'completed' || appointment.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'This appointment cannot be cancelled'
      });
    }

    // Update appointment status
    appointment.status = 'cancelled';
    appointment.cancelledAt = new Date();
    appointment.cancelledBy = req.user._id;
    await appointment.save();

    res.json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });

  } catch (error) {
    console.error('Cancel appointment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while cancelling appointment'
    });
  }
});

// @route   GET /api/appointments/upcoming/:patientId
// @desc    Get upcoming appointments for a patient
// @access  Private
router.get('/upcoming/:patientId', protect, async (req, res) => {
  try {
    const { patientId } = req.params;
    const { limit = 5 } = req.query;

    // Check if user is requesting their own appointments or is staff
    if (req.user.role === 'patient' && req.user._id.toString() !== patientId) {
      return res.status(403).json({
        success: false,
        message: 'You can only view your own appointments'
      });
    }

    const upcomingAppointments = await Appointment.find({
      patientId,
      appointmentDate: { $gte: new Date() },
      status: { $in: ['scheduled', 'confirmed'] }
    })
      .populate('doctorId', 'name specialization department')
      .sort({ appointmentDate: 1, appointmentTime: 1 })
      .limit(parseInt(limit));

    res.json({
      success: true,
      data: upcomingAppointments
    });

  } catch (error) {
    console.error('Get upcoming appointments error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching upcoming appointments'
    });
  }
});

// @route   GET /api/appointments/stats/overview
// @desc    Get appointment statistics for dashboard
// @access  Private (Staff only)
router.get('/stats/overview', protect, requireStaff, async (req, res) => {
  try {
    const totalAppointments = await Appointment.countDocuments();
    const todayAppointments = await Appointment.countDocuments({
      appointmentDate: {
        $gte: new Date().setHours(0, 0, 0, 0),
        $lt: new Date().setHours(23, 59, 59, 999)
      }
    });
    const pendingAppointments = await Appointment.countDocuments({ status: 'scheduled' });
    const completedAppointments = await Appointment.countDocuments({ status: 'completed' });

    // Get weekly appointment trend (next 7 days)
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);

    const weeklyAppointments = await Appointment.aggregate([
      {
        $match: {
          appointmentDate: { $gte: today, $lte: nextWeek }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$appointmentDate" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get appointments by status
    const appointmentsByStatus = await Appointment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalAppointments,
        todayAppointments,
        pendingAppointments,
        completedAppointments,
        weeklyAppointments,
        appointmentsByStatus
      }
    });
  } catch (error) {
    console.error('Get appointment stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching appointment statistics' 
    });
  }
});

export default router;
