import express from 'express';
import { protect, requireAdmin } from '../middleware/auth.js';
import Patient from '../models/Patient.js';
import Doctor from '../models/Doctor.js';
import Appointment from '../models/Appointment.js';
import Billing from '../models/Billing.js';

const router = express.Router();

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics for admin
// @access  Private (Admin only)
router.get('/stats', protect, requireAdmin, async (req, res) => {
  try {
    // Get counts in parallel for better performance
    const [
      totalPatients,
      totalDoctors,
      totalAppointments,
      totalRevenue
    ] = await Promise.all([
      Patient.countDocuments(),
      Doctor.countDocuments({ status: 'active' }),
      Appointment.countDocuments(),
      Billing.aggregate([
        { $match: { status: 'paid' } },
        { $group: { _id: null, total: { $sum: '$total' } } }
      ])
    ]);

    // Get revenue from aggregation result
    const revenue = totalRevenue.length > 0 ? totalRevenue[0].total : 0;

    res.json({
      success: true,
      data: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        totalRevenue: revenue
      }
    });

  } catch (error) {
    console.error('Get dashboard stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard statistics'
    });
  }
});

export default router;

