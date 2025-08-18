import express from 'express';
import { body, validationResult } from 'express-validator';
import Billing from '../models/Billing.js';
import Patient from '../models/Patient.js';
import { protect, requireStaff, protectPatientOrStaff } from '../middleware/auth.js';

const router = express.Router();

// @route   GET /api/billing
// @desc    Get all billing records with pagination and filters
// @access  Private (Staff only)
router.get('/', protect, protectPatientOrStaff, async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || '';
    const status = req.query.status || '';
    const date = req.query.date || '';

    const query = {};
    
    if (search) {
      // Search by patient name or bill number
      const patients = await Patient.find({ 
        name: { $regex: search, $options: 'i' } 
      }).select('_id');
      
      query.$or = [
        { patientId: { $in: patients.map(p => p._id) } },
        { billNumber: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      query.status = status;
    }

    if (date) {
      const searchDate = new Date(date);
      const nextDay = new Date(searchDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      query.billDate = {
        $gte: searchDate,
        $lt: nextDay
      };
    }

    const skip = (page - 1) * limit;
    
    const billingRecords = await Billing.find(query)
      .populate('patientId', 'name age gender contactNumber')
      .populate('doctorId', 'name specialization')
      .sort({ billDate: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Billing.countDocuments(query);

    res.json({
      success: true,
      data: billingRecords,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get billing records error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching billing records' 
    });
  }
});

// @route   GET /api/billing/:id
// @desc    Get single billing record by ID
// @access  Private (Staff only)
router.get('/:id', protect, requireStaff, async (req, res) => {
  try {
    const billingRecord = await Billing.findById(req.params.id)
      .populate('patientId', 'name age gender contactNumber address')
      .populate('doctorId', 'name specialization department')
      .populate('generatedBy', 'name');

    if (!billingRecord) {
      return res.status(404).json({ 
        success: false, 
        message: 'Billing record not found' 
      });
    }

    res.json({
      success: true,
      data: billingRecord
    });
  } catch (error) {
    console.error('Get billing record error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching billing record' 
    });
  }
});

// @route   POST /api/billing
// @desc    Create new billing record
// @access  Private (Staff only)
router.post('/', protect, requireStaff, [
  body('patientId').isMongoId().withMessage('Valid patient ID is required'),
  body('billNumber').notEmpty().withMessage('Bill number is required'),
  body('dueDate').isISO8601().withMessage('Valid due date is required'),
  body('items').isArray({ min: 1 }).withMessage('At least one item is required'),
  body('items.*.description').notEmpty().withMessage('Item description is required'),
  body('items.*.quantity').isInt({ min: 1 }).withMessage('Item quantity must be at least 1'),
  body('items.*.unitPrice').isFloat({ min: 0 }).withMessage('Item unit price must be positive'),
  body('tax').optional().isFloat({ min: 0 }).withMessage('Tax must be positive'),
  body('discount').optional().isFloat({ min: 0 }).withMessage('Discount must be positive')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { patientId, items } = req.body;

    // Check if patient exists
    const patient = await Patient.findById(patientId);
    if (!patient) {
      return res.status(404).json({ 
        success: false, 
        message: 'Patient not found' 
      });
    }

    // Calculate item totals
    const calculatedItems = items.map(item => ({
      ...item,
      total: item.quantity * item.unitPrice
    }));

    // Create billing record with calculated totals
    const billingData = {
      ...req.body,
      items: calculatedItems,
      generatedBy: req.user._id
    };

    const billingRecord = await Billing.create(billingData);

    // Populate the created billing record
    const populatedBillingRecord = await Billing.findById(billingRecord._id)
      .populate('patientId', 'name age gender contactNumber')
      .populate('doctorId', 'name specialization')
      .populate('generatedBy', 'name');

    res.status(201).json({
      success: true,
      data: populatedBillingRecord
    });
  } catch (error) {
    console.error('Create billing record error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while creating billing record' 
    });
  }
});

// @route   PUT /api/billing/:id
// @desc    Update billing record
// @access  Private (Staff only)
router.put('/:id', protect, requireStaff, [
  body('status').optional().isIn(['pending', 'partial', 'paid', 'overdue', 'cancelled']).withMessage('Invalid status'),
  body('paidAmount').optional().isFloat({ min: 0 }).withMessage('Paid amount must be positive'),
  body('paymentMethod').optional().isIn(['cash', 'credit_card', 'debit_card', 'insurance', 'bank_transfer', 'online_payment']).withMessage('Invalid payment method')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ 
        success: false, 
        errors: errors.array() 
      });
    }

    const { paidAmount, paymentMethod, status } = req.body;
    const updateData = { ...req.body };

    // If payment is being made, set payment date
    if (paidAmount && paidAmount > 0) {
      updateData.paymentDate = new Date();
    }

    const billingRecord = await Billing.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    ).populate('patientId', 'name age gender contactNumber')
     .populate('doctorId', 'name specialization')
     .populate('generatedBy', 'name');

    if (!billingRecord) {
      return res.status(404).json({ 
        success: false, 
        message: 'Billing record not found' 
      });
    }

    res.json({
      success: true,
      data: billingRecord
    });
  } catch (error) {
    console.error('Update billing record error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while updating billing record' 
    });
  }
});

// @route   DELETE /api/billing/:id
// @desc    Delete billing record
// @access  Private (Staff only)
router.delete('/:id', protect, requireStaff, async (req, res) => {
  try {
    const billingRecord = await Billing.findByIdAndDelete(req.params.id);

    if (!billingRecord) {
      return res.status(404).json({ 
        success: false, 
        message: 'Billing record not found' 
      });
    }

    res.json({
      success: true,
      message: 'Billing record deleted successfully'
    });
  } catch (error) {
    console.error('Delete billing record error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while deleting billing record' 
    });
  }
});

// @route   GET /api/billing/stats/overview
// @desc    Get billing statistics for dashboard
// @access  Private (Staff only)
router.get('/stats/overview', protect, requireStaff, async (req, res) => {
  try {
    const totalBills = await Billing.countDocuments();
    const pendingBills = await Billing.countDocuments({ status: 'pending' });
    const paidBills = await Billing.countDocuments({ status: 'paid' });
    const overdueBills = await Billing.countDocuments({ status: 'overdue' });

    // Calculate total revenue
    const revenueStats = await Billing.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalAmount' },
          totalPaid: { $sum: '$paidAmount' },
          totalPending: { $sum: { $subtract: ['$totalAmount', '$paidAmount'] } }
        }
      }
    ]);

    // Get monthly revenue trend (last 6 months)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlyRevenue = await Billing.aggregate([
      {
        $match: {
          billDate: { $gte: sixMonthsAgo }
        }
      },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m", date: "$billDate" } },
          revenue: { $sum: '$totalAmount' },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);

    // Get bills by status
    const billsByStatus = await Billing.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$totalAmount' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        totalBills,
        pendingBills,
        paidBills,
        overdueBills,
        revenue: revenueStats[0] || { totalRevenue: 0, totalPaid: 0, totalPending: 0 },
        monthlyRevenue,
        billsByStatus
      }
    });
  } catch (error) {
    console.error('Get billing stats error:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Server error while fetching billing statistics' 
    });
  }
});

export default router;
