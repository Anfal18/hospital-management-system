const express = require('express');
const cors = require('cors');
const { readDb, writeDb } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Log incoming requests
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    system: 'PulseCare Hospital Management Backend',
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});

// Dashboard Analytics API
app.get('/api/dashboard/stats', (req, res) => {
  const db = readDb();
  
  const totalPatients = db.patients.length;
  const admittedPatients = db.patients.filter(p => p.status === 'Admitted').length;
  const activeDoctors = db.doctors.filter(d => d.status === 'Available' || d.status === 'In Surgery').length;
  const todayAppointments = db.appointments.filter(a => a.status === 'Scheduled').length;
  
  const totalRevenue = db.billing
    .filter(b => b.status === 'Paid')
    .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);
    
  const pendingRevenue = db.billing
    .filter(b => b.status === 'Pending' || b.status === 'Overdue')
    .reduce((sum, b) => sum + (Number(b.amount) || 0), 0);

  const totalBeds = db.rooms.reduce((sum, r) => sum + (Number(r.totalBeds) || 0), 0);
  const occupiedBeds = db.rooms.reduce((sum, r) => sum + (Number(r.occupiedBeds) || 0), 0);
  const occupancyRate = totalBeds > 0 ? Math.round((occupiedBeds / totalBeds) * 100) : 0;

  res.json({
    totalPatients,
    admittedPatients,
    activeDoctors,
    todayAppointments,
    totalRevenue,
    pendingRevenue,
    totalBeds,
    occupiedBeds,
    occupancyRate,
    recentAppointments: db.appointments.slice(0, 5),
    recentPatients: db.patients.slice(0, 5)
  });
});

/* ==========================================================================
   1. PATIENTS MODULE API
   ========================================================================== */
app.get('/api/patients', (req, res) => {
  const db = readDb();
  res.json(db.patients);
});

app.post('/api/patients', (req, res) => {
  const db = readDb();
  const newPatient = {
    id: `PAT-${1000 + db.patients.length + 1}`,
    name: req.body.name || 'Unnamed Patient',
    age: Number(req.body.age) || 0,
    gender: req.body.gender || 'Other',
    bloodGroup: req.body.bloodGroup || 'Unknown',
    phone: req.body.phone || 'N/A',
    email: req.body.email || 'N/A',
    address: req.body.address || 'N/A',
    status: req.body.status || 'Outpatient',
    roomNo: req.body.roomNo || 'N/A',
    admissionDate: req.body.admissionDate || new Date().toISOString().split('T')[0],
    emergencyContact: req.body.emergencyContact || 'N/A',
    medicalHistory: req.body.medicalHistory || 'None noted'
  };

  db.patients.unshift(newPatient);
  writeDb(db);
  res.status(201).json(newPatient);
});

app.put('/api/patients/:id', (req, res) => {
  const db = readDb();
  const index = db.patients.findIndex(p => p.id === req.params.id);
  
  if (index === -1) {
    return res.status(404).json({ error: 'Patient not found' });
  }

  db.patients[index] = { ...db.patients[index], ...req.body };
  writeDb(db);
  res.json(db.patients[index]);
});

app.delete('/api/patients/:id', (req, res) => {
  const db = readDb();
  db.patients = db.patients.filter(p => p.id !== req.params.id);
  writeDb(db);
  res.json({ success: true, message: `Patient ${req.params.id} deleted successfully` });
});

/* ==========================================================================
   2. DOCTORS MODULE API
   ========================================================================== */
app.get('/api/doctors', (req, res) => {
  const db = readDb();
  res.json(db.doctors);
});

app.post('/api/doctors', (req, res) => {
  const db = readDb();
  const colors = ['#0d9488', '#2563eb', '#7c3aed', '#db2777', '#059669', '#ea580c'];
  const randomColor = colors[Math.floor(Math.random() * colors.length)];

  const newDoctor = {
    id: `DOC-${200 + db.doctors.length + 1}`,
    name: req.body.name || 'Dr. Unknown',
    specialization: req.body.specialization || 'General',
    department: req.body.department || 'General',
    phone: req.body.phone || 'N/A',
    email: req.body.email || 'N/A',
    experience: req.body.experience || '1 Year',
    shift: req.body.shift || 'Morning (08:00 - 16:00)',
    availableDays: req.body.availableDays || 'Mon-Fri',
    status: req.body.status || 'Available',
    avatarColor: randomColor
  };

  db.doctors.unshift(newDoctor);
  writeDb(db);
  res.status(201).json(newDoctor);
});

app.put('/api/doctors/:id', (req, res) => {
  const db = readDb();
  const index = db.doctors.findIndex(d => d.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Doctor not found' });
  }

  db.doctors[index] = { ...db.doctors[index], ...req.body };
  writeDb(db);
  res.json(db.doctors[index]);
});

app.delete('/api/doctors/:id', (req, res) => {
  const db = readDb();
  db.doctors = db.doctors.filter(d => d.id !== req.params.id);
  writeDb(db);
  res.json({ success: true, message: `Doctor ${req.params.id} removed successfully` });
});

/* ==========================================================================
   3. APPOINTMENTS MODULE API
   ========================================================================== */
app.get('/api/appointments', (req, res) => {
  const db = readDb();
  res.json(db.appointments);
});

app.post('/api/appointments', (req, res) => {
  const db = readDb();
  const newAppointment = {
    id: `APT-${500 + db.appointments.length + 1}`,
    patientId: req.body.patientId || 'N/A',
    patientName: req.body.patientName || 'Unknown Patient',
    doctorId: req.body.doctorId || 'N/A',
    doctorName: req.body.doctorName || 'Unknown Doctor',
    department: req.body.department || 'General',
    date: req.body.date || new Date().toISOString().split('T')[0],
    time: req.body.time || '10:00 AM',
    reason: req.body.reason || 'General Consultation',
    status: req.body.status || 'Scheduled'
  };

  db.appointments.unshift(newAppointment);
  writeDb(db);
  res.status(201).json(newAppointment);
});

app.put('/api/appointments/:id', (req, res) => {
  const db = readDb();
  const index = db.appointments.findIndex(a => a.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Appointment not found' });
  }

  db.appointments[index] = { ...db.appointments[index], ...req.body };
  writeDb(db);
  res.json(db.appointments[index]);
});

app.delete('/api/appointments/:id', (req, res) => {
  const db = readDb();
  db.appointments = db.appointments.filter(a => a.id !== req.params.id);
  writeDb(db);
  res.json({ success: true, message: `Appointment ${req.params.id} cancelled/deleted` });
});

/* ==========================================================================
   4. PRESCRIPTIONS MODULE API
   ========================================================================== */
app.get('/api/prescriptions', (req, res) => {
  const db = readDb();
  res.json(db.prescriptions);
});

app.post('/api/prescriptions', (req, res) => {
  const db = readDb();
  const newPrescription = {
    id: `RX-${800 + db.prescriptions.length + 1}`,
    patientId: req.body.patientId || 'N/A',
    patientName: req.body.patientName || 'Unknown Patient',
    doctorName: req.body.doctorName || 'Dr. On Duty',
    date: req.body.date || new Date().toISOString().split('T')[0],
    diagnosis: req.body.diagnosis || 'General Assessment',
    medicines: req.body.medicines || [],
    notes: req.body.notes || 'Take medications as directed.'
  };

  db.prescriptions.unshift(newPrescription);
  writeDb(db);
  res.status(201).json(newPrescription);
});

/* ==========================================================================
   5. BILLING & INVOICING MODULE API
   ========================================================================== */
app.get('/api/billing', (req, res) => {
  const db = readDb();
  res.json(db.billing);
});

app.post('/api/billing', (req, res) => {
  const db = readDb();
  const newInvoice = {
    id: `INV-${900 + db.billing.length + 1}`,
    patientName: req.body.patientName || 'Unknown Patient',
    date: req.body.date || new Date().toISOString().split('T')[0],
    service: req.body.service || 'Medical Services Rendered',
    amount: Number(req.body.amount) || 0.00,
    status: req.body.status || 'Pending',
    paymentMethod: req.body.paymentMethod || 'Direct Billing'
  };

  db.billing.unshift(newInvoice);
  writeDb(db);
  res.status(201).json(newInvoice);
});

app.put('/api/billing/:id', (req, res) => {
  const db = readDb();
  const index = db.billing.findIndex(b => b.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Invoice not found' });
  }

  db.billing[index] = { ...db.billing[index], ...req.body };
  writeDb(db);
  res.json(db.billing[index]);
});

/* ==========================================================================
   6. ROOMS & WARDS API
   ========================================================================== */
app.get('/api/rooms', (req, res) => {
  const db = readDb();
  res.json(db.rooms);
});

app.put('/api/rooms/:id', (req, res) => {
  const db = readDb();
  const index = db.rooms.findIndex(r => r.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Room not found' });
  }

  db.rooms[index] = { ...db.rooms[index], ...req.body };
  // recalculate status
  if (db.rooms[index].occupiedBeds >= db.rooms[index].totalBeds) {
    db.rooms[index].status = 'Full';
  } else {
    db.rooms[index].status = 'Available';
  }

  writeDb(db);
  res.json(db.rooms[index]);
});

/* ==========================================================================
   7. LAB TESTS API
   ========================================================================== */
app.get('/api/lab-tests', (req, res) => {
  const db = readDb();
  res.json(db.labTests);
});

app.post('/api/lab-tests', (req, res) => {
  const db = readDb();
  const newTest = {
    id: `LAB-${700 + db.labTests.length + 1}`,
    testName: req.body.testName || 'Diagnostic Panel',
    patientName: req.body.patientName || 'Unknown Patient',
    doctorName: req.body.doctorName || 'Dr. On Duty',
    category: req.body.category || 'General Pathology',
    date: req.body.date || new Date().toISOString().split('T')[0],
    status: req.body.status || 'Pending',
    resultSummary: req.body.resultSummary || 'Awaiting laboratory processing'
  };

  db.labTests.unshift(newTest);
  writeDb(db);
  res.status(201).json(newTest);
});

app.put('/api/lab-tests/:id', (req, res) => {
  const db = readDb();
  const index = db.labTests.findIndex(t => t.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ error: 'Lab test not found' });
  }

  db.labTests[index] = { ...db.labTests[index], ...req.body };
  writeDb(db);
  res.json(db.labTests[index]);
});

// Start Server
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(` PulseCare Hospital Management API Backend Active `);
  console.log(` Server running on http://localhost:${PORT}`);
  console.log(` Health Check: http://localhost:${PORT}/api/health`);
  console.log(`====================================================`);
});
