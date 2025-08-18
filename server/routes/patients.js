import express from 'express';
import { body, validationResult } from 'express-validator';
import Patient from '../models/Patient.js';
import { protect, requireStaff, protectPatientOrStaff } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/patients
// @desc    Get all patients with pagination and search
// @access  Private (Staff only)
router.get('/', protect, requireStaff, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';

    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { contactNumber: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    
    const patients = await Patient.find(query)
      .populate('assignedDoctor', 'name specialization')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Patient.countDocuments(query);

    res.json({
      success: true,
      data: patients,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get patients error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching patients' 
    });
  }
});

// @route   GET /api/patients/:id
// @desc    Get single patient by ID
// @access  Private (Staff only)
router.get('/:id', protect, protectPatientOrStaff, async (req, res) => {
  try {
    const patient = await Patient.findById(req.params.id)
      .populate('assignedDoctor', 'name specialization department');

    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Get patient error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching patient' 
    });
  }
});

// @route   POST /api/patients
// @desc    Create new patient
// @access  Private (Staff only)
router.post('/', protect, requireStaff, [
  body('name').trim().notEmpty().withMessage('Patient name is required'),
  body('age').isInt({ min: 0, max: 150 }).withMessage('Age must be between 0 and 150'),
  body('gender').isIn(['male', 'female', 'other']).withMessage('Invalid gender'),
  body('contactNumber').notEmpty().withMessage('Contact number is required'),
  body('currentDisease').trim().notEmpty().withMessage('Current disease is required'),
  body('admittedDate').isISO8601().withMessage('Valid admission date is required')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const patient = await Patient.create(req.body);

    res.status(201).json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Create patient error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while creating patient' 
    });
  }
});

// @route   PUT /api/patients/:id
// @desc    Update patient
// @access  Private (Staff only)
router.put('/:id', protect, requireStaff, [
  body('name').optional().trim().notEmpty().withMessage('Patient name cannot be empty'),
  body('age').optional().isInt({ min: 0, max: 150 }).withMessage('Age must be between 0 and 150'),
  body('gender').optional().isIn(['male', 'female', 'other']).withMessage('Invalid gender')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const patient = await Patient.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    res.json({
      success: true,
      data: patient
    });
  } catch (error) {
    console.error('Update patient error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating patient' 
    });
  }
});

// @route   DELETE /api/patients/:id
// @desc    Delete patient
// @access  Private (Admin only)
router.delete('/:id', protect, requireStaff, async (req, res) => {
  try {
    const patient = await Patient.findByIdAndDelete(req.params.id);

    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    res.json({
      success: true,
      message: 'Patient deleted successfully'
    });
  } catch (error) {
    console.error('Delete patient error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting patient' 
    });
  }
});

// @route   GET /api/patients/stats/overview
// @desc    Get patient statistics for dashboard
// @access  Private (Staff only)
router.get('/stats/overview', protect, requireStaff, async (req, res) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const admittedPatients = await Patient.countDocuments({ status: 'admitted' });
    const dischargedPatients = await Patient.countDocuments({ status: 'discharged' });
    const underObservation = await Patient.countDocuments({ status: 'under_observation' });

    // Get weekly admission trend (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const weeklyAdmissions = await Patient.aggregate([
      {
        $match: {
          admittedDate: { $gte: sevenDaysAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$admittedDate" } },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalPatients,
        admittedPatients,
        dischargedPatients,
        underObservation,
        weeklyAdmissions
      }
    });
  } catch (error) {
    console.error('Get patient stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching patient statistics' 
    });
  }
});

// @route   GET /api/patients/profile
// @desc    Get logged-in patient's profile
// @access  Private (Patient only)
router.get('/profile', protect, async (req, res) => {
  try {
    if (req.user.role !== 'patient') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    const patient = await Patient.findOne({ userId: req.user._id }).populate('assignedDoctor', 'name specialization department');
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }
    res.json({ success: true, data: patient });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Server error while fetching patient profile' });
  }
});

export default router;
