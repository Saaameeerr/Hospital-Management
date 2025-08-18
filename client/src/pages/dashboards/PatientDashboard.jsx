import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Calendar,
  Clock,
  User,
  FileText,
  CreditCard,
  Activity,
  Heart,
  Stethoscope,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const PatientDashboard = () => {
  const { user } = useAuth();
  const [patientData, setPatientData] = useState({
    healthSummary: {},
    medicalReports: [],
    bills: [],
    appointments: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPatientDashboardData();
  }, []);

  const fetchPatientDashboardData = async () => {
    try {
      setLoading(true);
      // Fetch patient profile by userId
      const patientRes = await axios.get('/api/patients/profile');
      const patient = patientRes.data.data;
      // Now fetch appointments and bills using patient._id
      const [appointmentsRes, billsRes] = await Promise.all([
        axios.get(`/api/appointments?patientId=${patient._id}&limit=5`),
        axios.get(`/api/billing?patientId=${patient._id}&limit=5`)
      ]);
      setPatientData({
        healthSummary: patient || {},
        appointments: appointmentsRes.data.data || [],
        bills: billsRes.data.data || [],
        medicalReports: (patient && patient.medicalHistory) ? patient.medicalHistory : []
      });
    } catch (error) {
      console.error('Error fetching patient data:', error);
    } finally {
      setLoading(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <motion.div
      variants={containerVariants}
      animate="visible"
      className="space-y-6"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Patient Dashboard</h1>
          <p className="text-gray-600">Your health summary and medical information</p>
        </div>
        <div className="flex items-center space-x-2 text-sm text-gray-500">
          <Clock className="w-4 h-4" />
          <span>{new Date().toLocaleDateString('en-US', { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</span>
        </div>
      </motion.div>

      {/* Health Summary Cards */}
      <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Current Status</p>
              <p className="text-2xl font-bold text-gray-900 mt-1 capitalize">
                {patientData.healthSummary.status || 'Healthy'}
              </p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <Activity className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Blood Group</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {patientData.healthSummary.bloodGroup || 'N/A'}
              </p>
            </div>
            <div className="bg-red-50 p-3 rounded-lg">
              <Heart className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Upcoming Appointments</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                {patientData.appointments.filter(apt => apt.status === 'scheduled').length}
              </p>
            </div>
            <div className="bg-green-50 p-3 rounded-lg">
              <Calendar className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Outstanding Bills</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">
                ${patientData.bills.filter(bill => bill.status === 'pending').reduce((sum, bill) => sum + (bill.totalAmount - bill.paidAmount), 0).toLocaleString()}
              </p>
            </div>
            <div className="bg-yellow-50 p-3 rounded-lg">
              <CreditCard className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Health Information and Reports */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Personal Health Summary */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Health Summary</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Current Condition</span>
              <span className="text-sm text-gray-900 capitalize">
                {patientData.healthSummary.currentDisease || 'Healthy'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Assigned Doctor</span>
              <span className="text-sm text-gray-900">
                {patientData.healthSummary.assignedDoctor?.name || 'Not Assigned'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Room Number</span>
              <span className="text-sm text-gray-900">
                {patientData.healthSummary.roomNumber || 'N/A'}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <span className="text-sm font-medium text-gray-600">Admission Date</span>
              <span className="text-sm text-gray-900">
                {patientData.healthSummary.admittedDate 
                  ? new Date(patientData.healthSummary.admittedDate).toLocaleDateString()
                  : 'N/A'
                }
              </span>
            </div>
          </div>
        </motion.div>

        {/* Medical Reports */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Medical Reports</h3>
          <div className="space-y-3">
            {patientData.medicalReports.length > 0 ? (
              patientData.medicalReports.map((report, index) => (
                <div key={index} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{report.condition}</p>
                    <p className="text-xs text-gray-600">
                      {report.diagnosedDate ? new Date(report.diagnosedDate).toLocaleDateString() : ''}
                      {report.status ? ` (${report.status})` : ''}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No medical reports available</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Bills and Appointments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Bills */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Bills</h3>
          <div className="space-y-3">
            {patientData.bills.length > 0 ? (
              patientData.bills.map((bill, index) => (
                <div key={bill._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="text-sm font-medium text-gray-900">Bill #{bill.billNumber}</p>
                    <p className="text-xs text-gray-600">{new Date(bill.billDate).toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-gray-900">${bill.totalAmount}</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      bill.status === 'paid' ? 'bg-green-100 text-green-800' :
                      bill.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {bill.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <CreditCard className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No bills available</p>
              </div>
            )}
          </div>
        </motion.div>

        {/* Upcoming Appointments */}
        <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Appointments</h3>
          <div className="space-y-3">
            {patientData.appointments.length > 0 ? (
              patientData.appointments.map((appointment, index) => (
                <div key={appointment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Dr. {appointment.doctorId?.name || 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-600">{appointment.reason}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      {new Date(appointment.appointmentDate).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-gray-600">{appointment.appointmentTime}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No appointments scheduled</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <motion.div variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="flex items-center justify-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors duration-200">
            <Calendar className="w-5 h-5 text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-900">Book Appointment</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors duration-200">
            <FileText className="w-5 h-5 text-green-600 mr-2" />
            <span className="text-sm font-medium text-green-900">View Reports</span>
          </button>
          <button className="flex items-center justify-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors duration-200">
            <CreditCard className="w-5 h-5 text-purple-600 mr-2" />
            <span className="text-sm font-medium text-purple-900">Pay Bills</span>
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default PatientDashboard;
