import React, { useState, useEffect } from 'react';
import {
  Activity,
  Users,
  UserCheck,
  Calendar,
  FileText,
  CreditCard,
  Bed,
  FlaskConical,
  Plus,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  X,
  Printer,
  Trash2,
  Check,
  RefreshCw,
  Phone,
  Mail,
  MapPin,
  ShieldAlert,
  SlidersHorizontal,
  Stethoscope
} from 'lucide-react';

import {
  fetchHealth,
  fetchDashboardStats,
  getPatients,
  createPatient,
  deletePatient,
  getDoctors,
  createDoctor,
  deleteDoctor,
  updateDoctor,
  getAppointments,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  getPrescriptions,
  createPrescription,
  getBilling,
  createInvoice,
  updateInvoice,
  getRooms,
  updateRoom,
  getLabTests,
  createLabTest,
  updateLabTest
} from './api';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isServerOnline, setIsServerOnline] = useState(false);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  // Data states
  const [stats, setStats] = useState(null);
  const [patients, setPatients] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [prescriptions, setPrescriptions] = useState([]);
  const [billing, setBilling] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [labTests, setLabTests] = useState([]);

  // Modal states
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showDoctorModal, setShowDoctorModal] = useState(false);
  const [showAppointmentModal, setShowAppointmentModal] = useState(false);
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [showLabTestModal, setShowLabTestModal] = useState(false);

  // View modal states
  const [selectedPrescription, setSelectedPrescription] = useState(null);
  const [selectedPatientDrawer, setSelectedPatientDrawer] = useState(null);

  // Form states
  const [newPatient, setNewPatient] = useState({ name: '', age: '', gender: 'Female', bloodGroup: 'O+', phone: '', email: '', address: '', status: 'Admitted', roomNo: '', emergencyContact: '', medicalHistory: '' });
  const [newDoctor, setNewDoctor] = useState({ name: '', specialization: 'Cardiology', department: 'Cardiology', phone: '', email: '', experience: '5 Years', shift: 'Morning (08:00 - 16:00)', availableDays: 'Mon-Fri', status: 'Available' });
  const [newAppointment, setNewAppointment] = useState({ patientId: '', patientName: '', doctorId: '', doctorName: '', department: 'Cardiology', date: '', time: '10:00 AM', reason: '', status: 'Scheduled' });
  const [newRx, setNewRx] = useState({ patientId: '', patientName: '', doctorName: '', diagnosis: '', notes: '', medicines: [{ name: '', dosage: '', frequency: '', duration: '' }] });
  const [newInvoice, setNewInvoice] = useState({ patientName: '', service: '', amount: '', status: 'Pending', paymentMethod: 'Direct Billing' });
  const [newLabTest, setNewLabTest] = useState({ testName: '', patientName: '', doctorName: '', category: 'Pathology', status: 'Pending', resultSummary: 'Awaiting lab results' });

  // Initial Data Load & Backend Health Check
  useEffect(() => {
    loadAllData();
    const interval = setInterval(checkBackendHealth, 8000);
    return () => clearInterval(interval);
  }, []);

  async function checkBackendHealth() {
    const res = await fetchHealth();
    setIsServerOnline(!!res);
  }

  async function loadAllData() {
    setLoading(true);
    try {
      const health = await fetchHealth();
      setIsServerOnline(!!health);

      const [statsRes, patRes, docRes, aptRes, rxRes, billRes, roomRes, labRes] = await Promise.all([
        fetchDashboardStats(),
        getPatients(),
        getDoctors(),
        getAppointments(),
        getPrescriptions(),
        getBilling(),
        getRooms(),
        getLabTests()
      ]);

      setStats(statsRes);
      setPatients(patRes);
      setDoctors(docRes);
      setAppointments(aptRes);
      setPrescriptions(rxRes);
      setBilling(billRes);
      setRooms(roomRes);
      setLabTests(labRes);
    } catch (err) {
      console.error('Error fetching backend data:', err);
    } finally {
      setLoading(false);
    }
  }

  /* Handler Functions */
  const handleAddPatient = async (e) => {
    e.preventDefault();
    await createPatient(newPatient);
    setShowPatientModal(false);
    setNewPatient({ name: '', age: '', gender: 'Female', bloodGroup: 'O+', phone: '', email: '', address: '', status: 'Admitted', roomNo: '', emergencyContact: '', medicalHistory: '' });
    loadAllData();
  };

  const handleDeletePatient = async (id) => {
    if (window.confirm(`Are you sure you want to delete patient ${id}?`)) {
      await deletePatient(id);
      loadAllData();
    }
  };

  const handleAddDoctor = async (e) => {
    e.preventDefault();
    await createDoctor(newDoctor);
    setShowDoctorModal(false);
    setNewDoctor({ name: '', specialization: 'Cardiology', department: 'Cardiology', phone: '', email: '', experience: '5 Years', shift: 'Morning (08:00 - 16:00)', availableDays: 'Mon-Fri', status: 'Available' });
    loadAllData();
  };

  const handleToggleDoctorStatus = async (doc) => {
    const nextStatus = doc.status === 'Available' ? 'In Surgery' : doc.status === 'In Surgery' ? 'On Call' : 'Available';
    await updateDoctor(doc.id, { status: nextStatus });
    loadAllData();
  };

  const handleAddAppointment = async (e) => {
    e.preventDefault();
    let patName = newAppointment.patientName;
    let docName = newAppointment.doctorName;

    if (newAppointment.patientId) {
      const pat = patients.find(p => p.id === newAppointment.patientId);
      if (pat) patName = pat.name;
    }
    if (newAppointment.doctorId) {
      const doc = doctors.find(d => d.id === newAppointment.doctorId);
      if (doc) {
        docName = doc.name;
        newAppointment.department = doc.department;
      }
    }

    await createAppointment({ ...newAppointment, patientName: patName, doctorName: docName });
    setShowAppointmentModal(false);
    setNewAppointment({ patientId: '', patientName: '', doctorId: '', doctorName: '', department: 'Cardiology', date: '', time: '10:00 AM', reason: '', status: 'Scheduled' });
    loadAllData();
  };

  const handleUpdateAppointmentStatus = async (id, status) => {
    await updateAppointment(id, { status });
    loadAllData();
  };

  const handleAddRx = async (e) => {
    e.preventDefault();
    await createPrescription(newRx);
    setShowPrescriptionModal(false);
    setNewRx({ patientId: '', patientName: '', doctorName: '', diagnosis: '', notes: '', medicines: [{ name: '', dosage: '', frequency: '', duration: '' }] });
    loadAllData();
  };

  const handleAddInvoice = async (e) => {
    e.preventDefault();
    await createInvoice(newInvoice);
    setShowInvoiceModal(false);
    setNewInvoice({ patientName: '', service: '', amount: '', status: 'Pending', paymentMethod: 'Direct Billing' });
    loadAllData();
  };

  const handlePayInvoice = async (id) => {
    await updateInvoice(id, { status: 'Paid' });
    loadAllData();
  };

  const handleAddLabTest = async (e) => {
    e.preventDefault();
    await createLabTest(newLabTest);
    setShowLabTestModal(false);
    setNewLabTest({ testName: '', patientName: '', doctorName: '', category: 'Pathology', status: 'Pending', resultSummary: 'Awaiting lab results' });
    loadAllData();
  };

  const handleUpdateLabStatus = async (id, status) => {
    await updateLabTest(id, { status });
    loadAllData();
  };

  const handleToggleBed = async (room, delta) => {
    const newOccupied = Math.max(0, Math.min(room.totalBeds, room.occupiedBeds + delta));
    await updateRoom(room.id, { occupiedBeds: newOccupied });
    loadAllData();
  };

  // Filter helpers
  const filteredPatients = patients.filter(p => p.name.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredDoctors = doctors.filter(d => d.name.toLowerCase().includes(searchTerm.toLowerCase()) || d.specialization.toLowerCase().includes(searchTerm.toLowerCase()));
  const filteredAppointments = appointments.filter(a => a.patientName.toLowerCase().includes(searchTerm.toLowerCase()) || a.doctorName.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="app-container">
      {/* Sidebar Navigation */}
      <aside className="sidebar">
        <div className="brand">
          <div className="brand-icon">
            <Activity className="icon" />
          </div>
          <div>
            <div className="brand-title">PulseCare</div>
            <div className="brand-subtitle">Hospital System</div>
          </div>
        </div>

        <ul className="nav-list">
          <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <Activity className="icon" /> Dashboard
          </li>
          <li className={`nav-item ${activeTab === 'patients' ? 'active' : ''}`} onClick={() => setActiveTab('patients')}>
            <Users className="icon" /> Patients ({patients.length})
          </li>
          <li className={`nav-item ${activeTab === 'doctors' ? 'active' : ''}`} onClick={() => setActiveTab('doctors')}>
            <UserCheck className="icon" /> Doctors ({doctors.length})
          </li>
          <li className={`nav-item ${activeTab === 'appointments' ? 'active' : ''}`} onClick={() => setActiveTab('appointments')}>
            <Calendar className="icon" /> Appointments ({appointments.length})
          </li>
          <li className={`nav-item ${activeTab === 'prescriptions' ? 'active' : ''}`} onClick={() => setActiveTab('prescriptions')}>
            <FileText className="icon" /> Prescriptions ({prescriptions.length})
          </li>
          <li className={`nav-item ${activeTab === 'billing' ? 'active' : ''}`} onClick={() => setActiveTab('billing')}>
            <CreditCard className="icon" /> Billing & Invoices
          </li>
          <li className={`nav-item ${activeTab === 'rooms' ? 'active' : ''}`} onClick={() => setActiveTab('rooms')}>
            <Bed className="icon" /> Rooms & Wards
          </li>
          <li className={`nav-item ${activeTab === 'lab' ? 'active' : ''}`} onClick={() => setActiveTab('lab')}>
            <FlaskConical className="icon" /> Lab Diagnostics
          </li>
        </ul>

        {/* Server Connection Status */}
        <div className="server-status-box">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontWeight: 700 }}>Backend Server</span>
            <span className={`status-dot ${isServerOnline ? 'online' : 'offline'}`}></span>
          </div>
          <div style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
            {isServerOnline ? 'Connected (Port 5000)' : 'Connecting / Offline'}
          </div>
        </div>
      </aside>

      {/* Main Content View */}
      <main className="main-wrapper">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search patients, doctors, appointments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="header-actions">
            <button className="btn btn-secondary btn-sm" onClick={loadAllData} title="Refresh Data">
              <RefreshCw size={14} className={loading ? 'spin' : ''} /> Refresh
            </button>

            {activeTab === 'patients' && (
              <button className="btn btn-primary" onClick={() => setShowPatientModal(true)}>
                <Plus size={16} /> Add Patient
              </button>
            )}
            {activeTab === 'doctors' && (
              <button className="btn btn-primary" onClick={() => setShowDoctorModal(true)}>
                <Plus size={16} /> Add Doctor
              </button>
            )}
            {activeTab === 'appointments' && (
              <button className="btn btn-primary" onClick={() => setShowAppointmentModal(true)}>
                <Plus size={16} /> Book Appointment
              </button>
            )}
            {activeTab === 'prescriptions' && (
              <button className="btn btn-primary" onClick={() => setShowPrescriptionModal(true)}>
                <Plus size={16} /> Issue Prescription
              </button>
            )}
            {activeTab === 'billing' && (
              <button className="btn btn-primary" onClick={() => setShowInvoiceModal(true)}>
                <Plus size={16} /> Create Invoice
              </button>
            )}
            {activeTab === 'lab' && (
              <button className="btn btn-primary" onClick={() => setShowLabTestModal(true)}>
                <Plus size={16} /> Request Lab Test
              </button>
            )}
          </div>
        </header>

        {/* Content Body */}
        <div className="content-body">
          {loading && (
            <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Loading Hospital Data from Backend REST API...
            </div>
          )}

          {/* DASHBOARD TAB */}
          {activeTab === 'dashboard' && stats && (
            <div>
              <div style={{ marginBottom: '1.5rem' }}>
                <h1 style={{ fontSize: '1.6rem', fontWeight: 800 }}>Hospital Executive Overview</h1>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                  Real-time synchronization with Node.js Express & Database Server
                </p>
              </div>

              {/* 4 KPI Cards */}
              <div className="grid-4">
                <div className="stat-card">
                  <div className="stat-info">
                    <div className="label">Total Patients</div>
                    <div className="value">{stats.totalPatients}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--success)', marginTop: '4px' }}>
                      {stats.admittedPatients} Currently Admitted
                    </div>
                  </div>
                  <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #0d9488, #14b8a6)' }}>
                    <Users size={24} />
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-info">
                    <div className="label">Active Doctors</div>
                    <div className="value">{stats.activeDoctors}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--info)', marginTop: '4px' }}>
                      Across 5 Specializations
                    </div>
                  </div>
                  <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #0284c7, #38bdf8)' }}>
                    <UserCheck size={24} />
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-info">
                    <div className="label">Scheduled Appointments</div>
                    <div className="value">{stats.todayAppointments}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--warning)', marginTop: '4px' }}>
                      Today's Consultations
                    </div>
                  </div>
                  <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #7c3aed, #a78bfa)' }}>
                    <Calendar size={24} />
                  </div>
                </div>

                <div className="stat-card">
                  <div className="stat-info">
                    <div className="label">Revenue Collected</div>
                    <div className="value">${stats.totalRevenue.toLocaleString()}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                      Pending: ${stats.pendingRevenue.toLocaleString()}
                    </div>
                  </div>
                  <div className="stat-icon" style={{ background: 'linear-gradient(135deg, #059669, #34d399)' }}>
                    <CreditCard size={24} />
                  </div>
                </div>
              </div>

              {/* Bed Occupancy Progress Bar & Quick Actions */}
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                <div className="table-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1rem', fontWeight: 700 }}>Hospital Bed Capacity & Occupancy</h3>
                    <span className="badge badge-info">{stats.occupancyRate}% Occupied</span>
                  </div>
                  <div style={{ height: '14px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden', marginBottom: '1rem' }}>
                    <div style={{ width: `${stats.occupancyRate}%`, height: '100%', background: 'linear-gradient(90deg, #0d9488, #38bdf8)', transition: 'width 0.5s ease' }}></div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                    <span>Total Beds: {stats.totalBeds}</span>
                    <span>Occupied Beds: {stats.occupiedBeds}</span>
                    <span>Available Beds: {stats.totalBeds - stats.occupiedBeds}</span>
                  </div>
                </div>

                <div className="table-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', justify: 'center', gap: '0.75rem' }}>
                  <h3 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.5rem' }}>Quick Actions</h3>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowPatientModal(true)}>
                    <Plus size={14} /> Register New Patient
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowAppointmentModal(true)}>
                    <Calendar size={14} /> Schedule Appointment
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setShowInvoiceModal(true)}>
                    <CreditCard size={14} /> Generate Invoice
                  </button>
                </div>
              </div>

              {/* Recent Appointments Table */}
              <div className="table-card">
                <div className="table-header">
                  <div className="table-title">Upcoming Appointments</div>
                  <button className="btn btn-secondary btn-sm" onClick={() => setActiveTab('appointments')}>View All</button>
                </div>
                <div className="table-wrapper">
                  <table>
                    <thead>
                      <tr>
                        <th>Appointment ID</th>
                        <th>Patient Name</th>
                        <th>Doctor</th>
                        <th>Department</th>
                        <th>Date & Time</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments.slice(0, 5).map(apt => (
                        <tr key={apt.id}>
                          <td><strong>{apt.id}</strong></td>
                          <td>{apt.patientName}</td>
                          <td>{apt.doctorName}</td>
                          <td>{apt.department}</td>
                          <td>{apt.date} at {apt.time}</td>
                          <td>
                            <span className={`badge ${apt.status === 'Completed' ? 'badge-success' : apt.status === 'Cancelled' ? 'badge-danger' : 'badge-warning'}`}>
                              {apt.status}
                            </span>
                          </td>
                          <td>
                            {apt.status === 'Scheduled' && (
                              <button className="btn btn-secondary btn-sm" onClick={() => handleUpdateAppointmentStatus(apt.id, 'Completed')}>
                                Complete
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* PATIENTS TAB */}
          {activeTab === 'patients' && (
            <div className="table-card">
              <div className="table-header">
                <div className="table-title">Patients Directory</div>
                <div style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Showing {filteredPatients.length} patients</div>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Patient ID</th>
                      <th>Full Name</th>
                      <th>Age / Gender</th>
                      <th>Blood Group</th>
                      <th>Contact</th>
                      <th>Status</th>
                      <th>Room</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPatients.map(p => (
                      <tr key={p.id}>
                        <td><strong>{p.id}</strong></td>
                        <td>{p.name}</td>
                        <td>{p.age} yrs / {p.gender}</td>
                        <td><span className="badge badge-info">{p.bloodGroup}</span></td>
                        <td>{p.phone}</td>
                        <td>
                          <span className={`badge ${p.status === 'Admitted' ? 'badge-danger' : p.status === 'Discharged' ? 'badge-success' : 'badge-warning'}`}>
                            {p.status}
                          </span>
                        </td>
                        <td>{p.roomNo}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            <button className="btn btn-secondary btn-sm" onClick={() => setSelectedPatientDrawer(p)}>
                              Details
                            </button>
                            <button className="btn btn-danger btn-sm" onClick={() => handleDeletePatient(p.id)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* DOCTORS TAB */}
          {activeTab === 'doctors' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {filteredDoctors.map(doc => (
                  <div key={doc.id} className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%' }}>
                      <div style={{ width: '50px', height: '50px', borderRadius: '50%', background: doc.avatarColor || '#0d9488', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 800, fontSize: '1.2rem' }}>
                        {doc.name.replace('Dr. ', '').charAt(0)}
                      </div>
                      <div>
                        <h4 style={{ fontSize: '1.05rem', fontWeight: 700 }}>{doc.name}</h4>
                        <div style={{ fontSize: '0.8rem', color: 'var(--primary-light)', fontWeight: 600 }}>{doc.specialization}</div>
                      </div>
                    </div>

                    <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', width: '100%', display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
                      <div><strong>Shift:</strong> {doc.shift}</div>
                      <div><strong>Available Days:</strong> {doc.availableDays}</div>
                      <div><strong>Experience:</strong> {doc.experience}</div>
                      <div><strong>Contact:</strong> {doc.phone}</div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', paddingTop: '0.75rem', borderTop: '1px solid var(--border-color)' }}>
                      <span className={`badge ${doc.status === 'Available' ? 'badge-success' : doc.status === 'In Surgery' ? 'badge-danger' : 'badge-warning'}`}>
                        {doc.status}
                      </span>
                      <button className="btn btn-secondary btn-sm" onClick={() => handleToggleDoctorStatus(doc)}>
                        Toggle Status
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* APPOINTMENTS TAB */}
          {activeTab === 'appointments' && (
            <div className="table-card">
              <div className="table-header">
                <div className="table-title">Appointment Schedules</div>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>APT ID</th>
                      <th>Patient</th>
                      <th>Doctor</th>
                      <th>Department</th>
                      <th>Date</th>
                      <th>Time Slot</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredAppointments.map(apt => (
                      <tr key={apt.id}>
                        <td><strong>{apt.id}</strong></td>
                        <td>{apt.patientName}</td>
                        <td>{apt.doctorName}</td>
                        <td>{apt.department}</td>
                        <td>{apt.date}</td>
                        <td>{apt.time}</td>
                        <td>{apt.reason}</td>
                        <td>
                          <span className={`badge ${apt.status === 'Completed' ? 'badge-success' : apt.status === 'Cancelled' ? 'badge-danger' : 'badge-warning'}`}>
                            {apt.status}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.35rem' }}>
                            {apt.status === 'Scheduled' && (
                              <button className="btn btn-secondary btn-sm" onClick={() => handleUpdateAppointmentStatus(apt.id, 'Completed')}>
                                Mark Done
                              </button>
                            )}
                            <button className="btn btn-danger btn-sm" onClick={() => deleteAppointment(apt.id).then(loadAllData)}>
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PRESCRIPTIONS TAB */}
          {activeTab === 'prescriptions' && (
            <div className="table-card">
              <div className="table-header">
                <div className="table-title">Issued Prescriptions</div>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Prescription ID</th>
                      <th>Patient Name</th>
                      <th>Prescribed By</th>
                      <th>Date</th>
                      <th>Diagnosis</th>
                      <th>Medicines Count</th>
                      <th>View / Print</th>
                    </tr>
                  </thead>
                  <tbody>
                    {prescriptions.map(rx => (
                      <tr key={rx.id}>
                        <td><strong>{rx.id}</strong></td>
                        <td>{rx.patientName}</td>
                        <td>{rx.doctorName}</td>
                        <td>{rx.date}</td>
                        <td>{rx.diagnosis}</td>
                        <td><span className="badge badge-info">{rx.medicines?.length || 0} Medicines</span></td>
                        <td>
                          <button className="btn btn-secondary btn-sm" onClick={() => setSelectedPrescription(rx)}>
                            <Printer size={14} /> Print Rx
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* BILLING & INVOICES TAB */}
          {activeTab === 'billing' && (
            <div className="table-card">
              <div className="table-header">
                <div className="table-title">Billing Records & Invoices</div>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Invoice ID</th>
                      <th>Patient Name</th>
                      <th>Service Details</th>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Payment Method</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {billing.map(inv => (
                      <tr key={inv.id}>
                        <td><strong>{inv.id}</strong></td>
                        <td>{inv.patientName}</td>
                        <td>{inv.service}</td>
                        <td>{inv.date}</td>
                        <td><strong>${Number(inv.amount).toFixed(2)}</strong></td>
                        <td>{inv.paymentMethod}</td>
                        <td>
                          <span className={`badge ${inv.status === 'Paid' ? 'badge-success' : inv.status === 'Overdue' ? 'badge-danger' : 'badge-warning'}`}>
                            {inv.status}
                          </span>
                        </td>
                        <td>
                          {inv.status !== 'Paid' && (
                            <button className="btn btn-primary btn-sm" onClick={() => handlePayInvoice(inv.id)}>
                              Mark as Paid
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ROOMS & WARDS TAB */}
          {activeTab === 'rooms' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1.5rem' }}>
                {rooms.map(room => (
                  <div key={room.id} className="stat-card" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '1rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                      <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>{room.roomNo}</h4>
                      <span className={`badge ${room.status === 'Available' ? 'badge-success' : 'badge-danger'}`}>
                        {room.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                      <div>Type: <strong>{room.type}</strong></div>
                      <div>Rate: <strong>${room.costPerDay} / day</strong></div>
                    </div>

                    <div style={{ width: '100%' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '4px' }}>
                        <span>Occupancy</span>
                        <span>{room.occupiedBeds} / {room.totalBeds} Beds</span>
                      </div>
                      <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{ width: `${(room.occupiedBeds / room.totalBeds) * 100}%`, height: '100%', background: 'var(--primary-light)' }}></div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                      <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => handleToggleBed(room, 1)} disabled={room.occupiedBeds >= room.totalBeds}>
                        + Assign Bed
                      </button>
                      <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => handleToggleBed(room, -1)} disabled={room.occupiedBeds <= 0}>
                        - Release Bed
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* LAB DIAGNOSTICS TAB */}
          {activeTab === 'lab' && (
            <div className="table-card">
              <div className="table-header">
                <div className="table-title">Laboratory & Diagnostic Tests</div>
              </div>
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Lab ID</th>
                      <th>Test Name</th>
                      <th>Category</th>
                      <th>Patient Name</th>
                      <th>Doctor</th>
                      <th>Date</th>
                      <th>Status</th>
                      <th>Result Summary</th>
                      <th>Update Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labTests.map(lab => (
                      <tr key={lab.id}>
                        <td><strong>{lab.id}</strong></td>
                        <td>{lab.testName}</td>
                        <td><span className="badge badge-info">{lab.category}</span></td>
                        <td>{lab.patientName}</td>
                        <td>{lab.doctorName}</td>
                        <td>{lab.date}</td>
                        <td>
                          <span className={`badge ${lab.status === 'Completed' ? 'badge-success' : lab.status === 'In Progress' ? 'badge-warning' : 'badge-danger'}`}>
                            {lab.status}
                          </span>
                        </td>
                        <td style={{ maxWidth: '200px' }}>{lab.resultSummary}</td>
                        <td>
                          {lab.status !== 'Completed' && (
                            <button className="btn btn-secondary btn-sm" onClick={() => handleUpdateLabStatus(lab.id, 'Completed')}>
                              Complete Test
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* =========================================================================
         MODALS SECTION
         ========================================================================= */}

      {/* Add Patient Modal */}
      {showPatientModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Register New Patient</h3>
              <X style={{ cursor: 'pointer' }} onClick={() => setShowPatientModal(false)} />
            </div>
            <form onSubmit={handleAddPatient} className="modal-body">
              <div className="form-group">
                <label>Patient Full Name</label>
                <input className="form-control" required value={newPatient.name} onChange={e => setNewPatient({ ...newPatient, name: e.target.value })} placeholder="e.g. Jane Doe" />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Age</label>
                  <input type="number" className="form-control" required value={newPatient.age} onChange={e => setNewPatient({ ...newPatient, age: e.target.value })} placeholder="28" />
                </div>
                <div className="form-group">
                  <label>Gender</label>
                  <select className="form-control" value={newPatient.gender} onChange={e => setNewPatient({ ...newPatient, gender: e.target.value })}>
                    <option>Female</option>
                    <option>Male</option>
                    <option>Other</option>
                  </select>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Blood Group</label>
                  <select className="form-control" value={newPatient.bloodGroup} onChange={e => setNewPatient({ ...newPatient, bloodGroup: e.target.value })}>
                    <option>O+</option><option>O-</option><option>A+</option><option>A-</option><option>B+</option><option>B-</option><option>AB+</option><option>AB-</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Admission Status</label>
                  <select className="form-control" value={newPatient.status} onChange={e => setNewPatient({ ...newPatient, status: e.target.value })}>
                    <option>Admitted</option>
                    <option>Outpatient</option>
                    <option>Discharged</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Contact Phone</label>
                <input className="form-control" value={newPatient.phone} onChange={e => setNewPatient({ ...newPatient, phone: e.target.value })} placeholder="+1 555-000-1111" />
              </div>

              <div className="form-group">
                <label>Emergency Contact Info</label>
                <input className="form-control" value={newPatient.emergencyContact} onChange={e => setNewPatient({ ...newPatient, emergencyContact: e.target.value })} placeholder="Relative Name & Phone" />
              </div>

              <div className="form-group">
                <label>Initial Medical Notes / History</label>
                <textarea className="form-control" rows={2} value={newPatient.medicalHistory} onChange={e => setNewPatient({ ...newPatient, medicalHistory: e.target.value })} placeholder="Known allergies, existing conditions..." />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowPatientModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Patient Record</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Doctor Modal */}
      {showDoctorModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Add Doctor Record</h3>
              <X style={{ cursor: 'pointer' }} onClick={() => setShowDoctorModal(false)} />
            </div>
            <form onSubmit={handleAddDoctor} className="modal-body">
              <div className="form-group">
                <label>Doctor Name</label>
                <input className="form-control" required value={newDoctor.name} onChange={e => setNewDoctor({ ...newDoctor, name: e.target.value })} placeholder="Dr. First Last" />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Specialization</label>
                  <input className="form-control" required value={newDoctor.specialization} onChange={e => setNewDoctor({ ...newDoctor, specialization: e.target.value })} placeholder="e.g. Cardiology" />
                </div>
                <div className="form-group">
                  <label>Experience</label>
                  <input className="form-control" value={newDoctor.experience} onChange={e => setNewDoctor({ ...newDoctor, experience: e.target.value })} placeholder="e.g. 10 Years" />
                </div>
              </div>
              <div className="form-group">
                <label>Contact Phone</label>
                <input className="form-control" value={newDoctor.phone} onChange={e => setNewDoctor({ ...newDoctor, phone: e.target.value })} placeholder="+1 (555) 123-4567" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowDoctorModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Doctor Profile</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Book Appointment Modal */}
      {showAppointmentModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Book New Appointment</h3>
              <X style={{ cursor: 'pointer' }} onClick={() => setShowAppointmentModal(false)} />
            </div>
            <form onSubmit={handleAddAppointment} className="modal-body">
              <div className="form-group">
                <label>Select Patient</label>
                <select className="form-control" value={newAppointment.patientId} onChange={e => setNewAppointment({ ...newAppointment, patientId: e.target.value })}>
                  <option value="">-- Choose Registered Patient --</option>
                  {patients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.id})</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Select Doctor</label>
                <select className="form-control" value={newAppointment.doctorId} onChange={e => setNewAppointment({ ...newAppointment, doctorId: e.target.value })}>
                  <option value="">-- Choose Attending Doctor --</option>
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name} - {d.specialization}</option>
                  ))}
                </select>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" className="form-control" required value={newAppointment.date} onChange={e => setNewAppointment({ ...newAppointment, date: e.target.value })} />
                </div>
                <div className="form-group">
                  <label>Time Slot</label>
                  <input className="form-control" value={newAppointment.time} onChange={e => setNewAppointment({ ...newAppointment, time: e.target.value })} placeholder="10:30 AM" />
                </div>
              </div>

              <div className="form-group">
                <label>Consultation Reason</label>
                <input className="form-control" value={newAppointment.reason} onChange={e => setNewAppointment({ ...newAppointment, reason: e.target.value })} placeholder="e.g. Annual Health Checkup" />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAppointmentModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Schedule Appointment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Prescription Printable Modal */}
      {selectedPrescription && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px', background: '#ffffff', color: '#111827' }}>
            <div className="modal-header" style={{ borderBottom: '2px solid #0d9488' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <Activity color="#0d9488" size={28} />
                <div>
                  <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#0f766e' }}>PulseCare Medical Center</h2>
                  <div style={{ fontSize: '0.75rem', color: '#4b5563' }}>Official Digital Medical Prescription</div>
                </div>
              </div>
              <X style={{ cursor: 'pointer', color: '#111827' }} onClick={() => setSelectedPrescription(null)} />
            </div>
            <div className="modal-body">
              <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid #e5e7eb', paddingBottom: '0.75rem', marginBottom: '1rem', fontSize: '0.85rem' }}>
                <div>
                  <div><strong>Rx ID:</strong> {selectedPrescription.id}</div>
                  <div><strong>Patient:</strong> {selectedPrescription.patientName}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div><strong>Date:</strong> {selectedPrescription.date}</div>
                  <div><strong>Doctor:</strong> {selectedPrescription.doctorName}</div>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <strong style={{ color: '#0d9488' }}>Diagnosis:</strong>
                <p style={{ marginTop: '0.25rem', fontSize: '0.9rem', background: '#f0fdf4', padding: '0.5rem', borderRadius: '6px' }}>
                  {selectedPrescription.diagnosis}
                </p>
              </div>

              <strong style={{ color: '#0d9488' }}>Prescribed Medicines:</strong>
              <table style={{ width: '100%', marginTop: '0.5rem', marginBottom: '1rem', color: '#111827', border: '1px solid #e5e7eb' }}>
                <thead>
                  <tr style={{ background: '#f3f4f6' }}>
                    <th style={{ padding: '0.5rem', color: '#374151' }}>Medicine Name</th>
                    <th style={{ padding: '0.5rem', color: '#374151' }}>Dosage</th>
                    <th style={{ padding: '0.5rem', color: '#374151' }}>Frequency</th>
                    <th style={{ padding: '0.5rem', color: '#374151' }}>Duration</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedPrescription.medicines?.map((m, idx) => (
                    <tr key={idx} style={{ borderTop: '1px solid #e5e7eb' }}>
                      <td style={{ padding: '0.5rem' }}><strong>{m.name}</strong></td>
                      <td style={{ padding: '0.5rem' }}>{m.dosage}</td>
                      <td style={{ padding: '0.5rem' }}>{m.frequency}</td>
                      <td style={{ padding: '0.5rem' }}>{m.duration}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div style={{ fontSize: '0.85rem', color: '#4b5563', marginBottom: '1.5rem' }}>
                <strong>Doctor's Advice / Notes:</strong> {selectedPrescription.notes}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button className="btn btn-secondary" onClick={() => window.print()}>
                  <Printer size={16} /> Print Document
                </button>
                <button className="btn btn-primary" onClick={() => setSelectedPrescription(null)}>
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Patient Drawer View */}
      {selectedPatientDrawer && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Patient Full Profile: {selectedPatientDrawer.name}</h3>
              <X style={{ cursor: 'pointer' }} onClick={() => setSelectedPatientDrawer(null)} />
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ background: 'rgba(255,255,255,0.04)', padding: '1rem', borderRadius: '8px' }}>
                <div><strong>Patient ID:</strong> {selectedPatientDrawer.id}</div>
                <div><strong>Age / Gender:</strong> {selectedPatientDrawer.age} yrs / {selectedPatientDrawer.gender}</div>
                <div><strong>Blood Group:</strong> {selectedPatientDrawer.bloodGroup}</div>
                <div><strong>Status:</strong> {selectedPatientDrawer.status}</div>
                <div><strong>Room Assigned:</strong> {selectedPatientDrawer.roomNo}</div>
              </div>
              <div>
                <strong>Emergency Contact:</strong> {selectedPatientDrawer.emergencyContact}
              </div>
              <div>
                <strong>Medical History & Notes:</strong>
                <p style={{ color: 'var(--text-muted)', marginTop: '0.25rem' }}>{selectedPatientDrawer.medicalHistory}</p>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button className="btn btn-secondary" onClick={() => setSelectedPatientDrawer(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Invoice Modal */}
      {showInvoiceModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Create Billing Invoice</h3>
              <X style={{ cursor: 'pointer' }} onClick={() => setShowInvoiceModal(false)} />
            </div>
            <form onSubmit={handleAddInvoice} className="modal-body">
              <div className="form-group">
                <label>Patient Name</label>
                <input className="form-control" required value={newInvoice.patientName} onChange={e => setNewInvoice({ ...newInvoice, patientName: e.target.value })} placeholder="Eleanor Vance" />
              </div>
              <div className="form-group">
                <label>Service / Treatment Provided</label>
                <input className="form-control" required value={newInvoice.service} onChange={e => setNewInvoice({ ...newInvoice, service: e.target.value })} placeholder="e.g. ICU Ward & Consultation" />
              </div>
              <div className="form-group">
                <label>Total Billed Amount ($)</label>
                <input type="number" className="form-control" required value={newInvoice.amount} onChange={e => setNewInvoice({ ...newInvoice, amount: e.target.value })} placeholder="1250.00" />
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowInvoiceModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Generate Invoice</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Lab Test Modal */}
      {showLabTestModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>Request Diagnostic Test</h3>
              <X style={{ cursor: 'pointer' }} onClick={() => setShowLabTestModal(false)} />
            </div>
            <form onSubmit={handleAddLabTest} className="modal-body">
              <div className="form-group">
                <label>Diagnostic Test Name</label>
                <input className="form-control" required value={newLabTest.testName} onChange={e => setNewLabTest({ ...newLabTest, testName: e.target.value })} placeholder="e.g. Complete Blood Count (CBC)" />
              </div>
              <div className="form-group">
                <label>Patient Name</label>
                <input className="form-control" required value={newLabTest.patientName} onChange={e => setNewLabTest({ ...newLabTest, patientName: e.target.value })} placeholder="Patient Name" />
              </div>
              <div className="form-group">
                <label>Category</label>
                <select className="form-control" value={newLabTest.category} onChange={e => setNewLabTest({ ...newLabTest, category: e.target.value })}>
                  <option>Pathology</option><option>Cardiology</option><option>Radiology</option><option>Microbiology</option>
                </select>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowLabTestModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Order Test</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
