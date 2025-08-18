import express from 'express';
import { body, validationResult } from 'express-validator';
import Doctor from '../models/Doctor.js';
import { protect, requireStaff } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/doctors/available
// @desc    Get available doctors for patients to book appointments
// @access  Public (no authentication required)
router.get('/available', async (req, res) => {
  try {
    const { 
      specialization, 
      department, 
      date, 
      search,
      limit = 20 
    } = req.query;

    // Build query
    const query = { status: 'active' };
    
    if (specialization) {
      query.specialization = { $regex: specialization, $options: 'i' };
    }
    
    if (department) {
      query.department = { $regex: department, $options: 'i' };
    }
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { department: { $regex: search, $options: 'i' } }
      ];
    }

    // Get doctors
    const doctors = await Doctor.find(query)
      .select('name specialization department availability consultationFee experience bio avatar')
      .sort({ name: 1 })
      .limit(parseInt(limit));

    // If date is provided, filter by availability
    let availableDoctors = doctors;
    if (date) {
      const dayOfWeek = new Date(date).toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
      availableDoctors = doctors.filter(doctor => {
        const dayAvailability = doctor.availability[dayOfWeek];
        return dayAvailability && dayAvailability.available;
      });
    }

    // Get unique specializations and departments for filters
    const specializations = await Doctor.distinct('specialization', { status: 'active' });
    const departments = await Doctor.distinct('department', { status: 'active' });

    res.json({
      success: true,
      data: availableDoctors,
      filters: {
        specializations: specializations.sort(),
        departments: departments.sort()
      },
      total: availableDoctors.length
    });
  } catch (error) {
    console.error('Get available doctors error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching available doctors' 
    });
  }
});

// @route   GET /api/doctors
// @desc    Get all doctors with pagination and search
// @access  Private (Staff only)
router.get('/', protect, requireStaff, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const department = req.query.department || '';
    const status = req.query.status || '';

    const query = {};
    
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { specialization: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (department) {
      query.department = department;
    }

    if (status) {
      query.status = status;
    }

    const skip = (page - 1) * limit;
    
    const doctors = await Doctor.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Doctor.countDocuments(query);

    res.json({
      success: true,
      data: doctors,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get doctors error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching doctors' 
    });
  }
});

// @route   GET /api/doctors/:id
// @desc    Get single doctor by ID
// @access  Private (Staff only)
router.get('/:id', protect, requireStaff, async (req, res) => {
  try {
    const doctor = await Doctor.findById(req.params.id);

    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not found' 
      });
    }

    res.json({
      success: true,
      data: doctor
    });
  } catch (error) {
    console.error('Get doctor error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching doctor' 
    });
  }
});

// @route   POST /api/doctors
// @desc    Create new doctor
// @access  Private (Staff only)
router.post('/', protect, requireStaff, [
  body('name').trim().notEmpty().withMessage('Doctor name is required'),
  body('specialization').trim().notEmpty().withMessage('Specialization is required'),
  body('contactNumber').notEmpty().withMessage('Contact number is required'),
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('licenseNumber').notEmpty().withMessage('License number is required'),
  body('department').trim().notEmpty().withMessage('Department is required'),
  body('consultationFee').isFloat({ min: 0 }).withMessage('Consultation fee must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const doctor = await Doctor.create(req.body);

    res.status(201).json({
      success: true,
      data: doctor
    });
  } catch (error) {
    console.error('Create doctor error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while creating doctor' 
    });
  }
});

// @route   PUT /api/doctors/:id
// @desc    Update doctor
// @access  Private (Staff only)
router.put('/:id', protect, requireStaff, [
  body('name').optional().trim().notEmpty().withMessage('Doctor name cannot be empty'),
  body('consultationFee').optional().isFloat({ min: 0 }).withMessage('Consultation fee must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const doctor = await Doctor.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not found' 
      });
    }

    res.json({
      success: true,
      data: doctor
    });
  } catch (error) {
    console.error('Update doctor error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating doctor' 
    });
  }
});

// @route   DELETE /api/doctors/:id
// @desc    Delete doctor
// @access  Private (Admin only)
router.delete('/:id', protect, requireStaff, async (req, res) => {
  try {
    const doctor = await Doctor.findByIdAndDelete(req.params.id);

    if (!doctor) {
      return res.status(404).json({ 
        success: false, 
        message: 'Doctor not found' 
      });
    }

    res.json({
      success: true,
      message: 'Doctor deleted successfully'
    });
  } catch (error) {
    console.error('Delete doctor error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting doctor' 
    });
  }
});

// @route   GET /api/doctors/stats/overview
// @desc    Get doctor statistics for dashboard
// @access  Private (Staff only)
router.get('/stats/overview', protect, requireStaff, async (req, res) => {
  try {
    const totalDoctors = await Doctor.countDocuments();
    const activeDoctors = await Doctor.countDocuments({ status: 'active' });
    const onLeaveDoctors = await Doctor.countDocuments({ status: 'on_leave' });

    // Get doctors by department
    const doctorsByDepartment = await Doctor.aggregate([
      {
        $group: {
          _id: '$department',
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    // Get doctors by specialization
    const doctorsBySpecialization = await Doctor.aggregate([
      {
        $group: {
          _id: '$specialization',
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
        totalDoctors,
        activeDoctors,
        onLeaveDoctors,
        doctorsByDepartment,
        doctorsBySpecialization
      }
    });
  } catch (error) {
    console.error('Get doctor stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching doctor statistics' 
    });
  }
});

export default router;
