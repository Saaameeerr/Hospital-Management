import mongoose from 'mongoose';

const billingSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: [true, 'Patient ID is required']
  },
  appointmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment'
  },
  doctorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor'
  },
  billNumber: {
    type: String,
    required: [true, 'Bill number is required'],
    unique: true
  },
  billDate: {
    type: Date,
    default: Date.now
  },
  dueDate: {
    type: Date,
    required: [true, 'Due date is required']
  },
  items: [{
    description: {
      type: String,
      required: [true, 'Item description is required']
    },
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1']
    },
    unitPrice: {
      type: Number,
      required: [true, 'Unit price is required'],
      min: [0, 'Unit price cannot be negative']
    },
    total: {
      type: Number,
      required: [true, 'Total is required'],
      min: [0, 'Total cannot be negative']
    }
  }],
  subtotal: {
    type: Number,
    required: [true, 'Subtotal is required'],
    min: [0, 'Subtotal cannot be negative']
  },
  tax: {
    type: Number,
    default: 0,
    min: [0, 'Tax cannot be negative']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Discount cannot be negative']
  },
  totalAmount: {
    type: Number,
    required: [true, 'Total amount is required'],
    min: [0, 'Total amount cannot be negative']
  },
  paidAmount: {
    type: Number,
    default: 0,
    min: [0, 'Paid amount cannot be negative']
  },
  balance: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'partial', 'paid', 'overdue', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'credit_card', 'debit_card', 'insurance', 'bank_transfer', 'online_payment'],
    default: 'cash'
  },
  paymentDate: {
    type: Date
  },
  insuranceProvider: {
    name: String,
    policyNumber: String,
    coverageAmount: Number
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  generatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User who generated the bill is required']
  }
}, {
  timestamps: true
});

// Index for better query performance
// billingSchema.index({ patientId: 1, billDate: -1 });
// billingSchema.index({ status: 1, dueDate: 1 });
// billingSchema.index({ billNumber: 1 });
// billingSchema.index({ dueDate: 1 });

// Pre-save middleware to calculate totals
billingSchema.pre('save', function(next) {
  // Calculate subtotal from items
  this.subtotal = this.items.reduce((sum, item) => sum + item.total, 0);
  
  // Calculate total amount
  this.totalAmount = this.subtotal + this.tax - this.discount;
  
  // Calculate balance
  this.balance = this.totalAmount - this.paidAmount;
  
  // Update status based on payment
  if (this.balance <= 0) {
    this.status = 'paid';
  } else if (this.paidAmount > 0) {
    this.status = 'partial';
  } else if (new Date() > this.dueDate) {
    this.status = 'overdue';
  }
  
  next();
});

// Virtual for payment percentage
billingSchema.virtual('paymentPercentage').get(function() {
  if (this.totalAmount === 0) return 0;
  return Math.round((this.paidAmount / this.totalAmount) * 100);
});

// Ensure virtuals are serialized
billingSchema.set('toJSON', { virtuals: true });
billingSchema.set('toObject', { virtuals: true });

const Billing = mongoose.model('Billing', billingSchema);

export default Billing;
