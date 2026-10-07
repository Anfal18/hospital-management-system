// Determine API Base URL depending on environment
const TUNNEL_URL = 'https://gonna-almost-nested-bubble.trycloudflare.com/api';

const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

export const API_BASE_URL = isLocalhost ? 'http://localhost:5000/api' : TUNNEL_URL;

// Fallback in-memory/localStorage data for offline deployment
const LOCAL_STORAGE_KEY = 'pulsecare_offline_db';

function getLocalDb() {
  const saved = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (saved) return JSON.parse(saved);
  return {
    patients: [
      { id: "PAT-1001", name: "Eleanor Vance", age: 34, gender: "Female", bloodGroup: "O+", phone: "+1 (555) 234-5678", email: "eleanor.vance@example.com", address: "742 Evergreen Terrace", status: "Admitted", roomNo: "ICU-02", emergencyContact: "Thomas Vance", medicalHistory: "Asthma" },
      { id: "PAT-1002", name: "Marcus Aurelius Sterling", age: 58, gender: "Male", bloodGroup: "A+", phone: "+1 (555) 876-5432", email: "marcus.sterling@example.com", address: "120 Baker Street", status: "Outpatient", roomNo: "N/A", emergencyContact: "Clara Sterling", medicalHistory: "Diabetes" }
    ],
    doctors: [
      { id: "DOC-201", name: "Dr. Sarah Jenkins", specialization: "Cardiology", department: "Cardiology", phone: "+1 (555) 111-2233", experience: "14 Years", shift: "Morning", availableDays: "Mon-Fri", status: "Available", avatarColor: "#0d9488" },
      { id: "DOC-202", name: "Dr. Alexander Wright", specialization: "Neurology", department: "Neurology", phone: "+1 (555) 222-3344", experience: "18 Years", shift: "Afternoon", availableDays: "Mon, Wed, Fri", status: "In Surgery", avatarColor: "#2563eb" }
    ],
    appointments: [
      { id: "APT-501", patientName: "Marcus Sterling", doctorName: "Dr. Sarah Jenkins", department: "Cardiology", date: "2026-10-07", time: "10:30 AM", reason: "ECG Review", status: "Scheduled" }
    ],
    prescriptions: [],
    billing: [
      { id: "INV-901", patientName: "Eleanor Vance", date: "2026-10-02", service: "ICU Admission", amount: 2450.00, status: "Paid", paymentMethod: "Credit Card" }
    ],
    rooms: [
      { id: "RM-101", roomNo: "ICU-01", type: "ICU", totalBeds: 2, occupiedBeds: 2, costPerDay: 850, status: "Full" },
      { id: "RM-102", roomNo: "ICU-02", type: "ICU", totalBeds: 2, occupiedBeds: 1, costPerDay: 850, status: "Available" }
    ],
    labTests: [
      { id: "LAB-701", testName: "Comprehensive Metabolic Panel", patientName: "Eleanor Vance", doctorName: "Dr. Sarah Jenkins", category: "Pathology", date: "2026-10-02", status: "Completed", resultSummary: "Glucose normal" }
    ]
  };
}

function saveLocalDb(db) {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(db));
}

export async function fetchHealth() {
  try {
    const res = await fetch(`${API_BASE_URL}/health`);
    if (!res.ok) throw new Error('Health check failed');
    return await res.json();
  } catch (err) {
    console.warn('API Health check failed, operating with dynamic state:', err);
    return { status: 'offline', mode: 'Static Demo' };
  }
}

export async function fetchDashboardStats() {
  try {
    const res = await fetch(`${API_BASE_URL}/dashboard/stats`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    const db = getLocalDb();
    return {
      totalPatients: db.patients.length,
      admittedPatients: db.patients.filter(p => p.status === 'Admitted').length,
      activeDoctors: db.doctors.length,
      todayAppointments: db.appointments.length,
      totalRevenue: db.billing.reduce((s, b) => s + (b.amount || 0), 0),
      pendingRevenue: 0,
      totalBeds: 10,
      occupiedBeds: 4,
      occupancyRate: 40,
      recentAppointments: db.appointments,
      recentPatients: db.patients
    };
  }
}

// Patients API
export async function getPatients() {
  try {
    const res = await fetch(`${API_BASE_URL}/patients`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    return getLocalDb().patients;
  }
}

export async function createPatient(data) {
  try {
    const res = await fetch(`${API_BASE_URL}/patients`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    const db = getLocalDb();
    const newP = { ...data, id: `PAT-${1000 + db.patients.length + 1}` };
    db.patients.unshift(newP);
    saveLocalDb(db);
    return newP;
  }
}

export async function updatePatient(id, data) {
  try {
    const res = await fetch(`${API_BASE_URL}/patients/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    const db = getLocalDb();
    const idx = db.patients.findIndex(p => p.id === id);
    if (idx !== -1) {
      db.patients[idx] = { ...db.patients[idx], ...data };
      saveLocalDb(db);
    }
    return db.patients[idx];
  }
}

export async function deletePatient(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/patients/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    const db = getLocalDb();
    db.patients = db.patients.filter(p => p.id !== id);
    saveLocalDb(db);
    return { success: true };
  }
}

// Doctors API
export async function getDoctors() {
  try {
    const res = await fetch(`${API_BASE_URL}/doctors`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    return getLocalDb().doctors;
  }
}

export async function createDoctor(data) {
  try {
    const res = await fetch(`${API_BASE_URL}/doctors`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    const db = getLocalDb();
    const newD = { ...data, id: `DOC-${200 + db.doctors.length + 1}` };
    db.doctors.unshift(newD);
    saveLocalDb(db);
    return newD;
  }
}

export async function updateDoctor(id, data) {
  try {
    const res = await fetch(`${API_BASE_URL}/doctors/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    const db = getLocalDb();
    const idx = db.doctors.findIndex(d => d.id === id);
    if (idx !== -1) {
      db.doctors[idx] = { ...db.doctors[idx], ...data };
      saveLocalDb(db);
    }
    return db.doctors[idx];
  }
}

export async function deleteDoctor(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/doctors/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    const db = getLocalDb();
    db.doctors = db.doctors.filter(d => d.id !== id);
    saveLocalDb(db);
    return { success: true };
  }
}

// Appointments API
export async function getAppointments() {
  try {
    const res = await fetch(`${API_BASE_URL}/appointments`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    return getLocalDb().appointments;
  }
}

export async function createAppointment(data) {
  try {
    const res = await fetch(`${API_BASE_URL}/appointments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    const db = getLocalDb();
    const newA = { ...data, id: `APT-${500 + db.appointments.length + 1}` };
    db.appointments.unshift(newA);
    saveLocalDb(db);
    return newA;
  }
}

export async function updateAppointment(id, data) {
  try {
    const res = await fetch(`${API_BASE_URL}/appointments/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    const db = getLocalDb();
    const idx = db.appointments.findIndex(a => a.id === id);
    if (idx !== -1) {
      db.appointments[idx] = { ...db.appointments[idx], ...data };
      saveLocalDb(db);
    }
    return db.appointments[idx];
  }
}

export async function deleteAppointment(id) {
  try {
    const res = await fetch(`${API_BASE_URL}/appointments/${id}`, { method: 'DELETE' });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    const db = getLocalDb();
    db.appointments = db.appointments.filter(a => a.id !== id);
    saveLocalDb(db);
    return { success: true };
  }
}

// Prescriptions API
export async function getPrescriptions() {
  try {
    const res = await fetch(`${API_BASE_URL}/prescriptions`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    return getLocalDb().prescriptions;
  }
}

export async function createPrescription(data) {
  try {
    const res = await fetch(`${API_BASE_URL}/prescriptions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    const db = getLocalDb();
    const newRx = { ...data, id: `RX-${800 + db.prescriptions.length + 1}` };
    db.prescriptions.unshift(newRx);
    saveLocalDb(db);
    return newRx;
  }
}

// Billing API
export async function getBilling() {
  try {
    const res = await fetch(`${API_BASE_URL}/billing`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    return getLocalDb().billing;
  }
}

export async function createInvoice(data) {
  try {
    const res = await fetch(`${API_BASE_URL}/billing`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    const db = getLocalDb();
    const newInv = { ...data, id: `INV-${900 + db.billing.length + 1}` };
    db.billing.unshift(newInv);
    saveLocalDb(db);
    return newInv;
  }
}

export async function updateInvoice(id, data) {
  try {
    const res = await fetch(`${API_BASE_URL}/billing/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    const db = getLocalDb();
    const idx = db.billing.findIndex(b => b.id === id);
    if (idx !== -1) {
      db.billing[idx] = { ...db.billing[idx], ...data };
      saveLocalDb(db);
    }
    return db.billing[idx];
  }
}

// Rooms API
export async function getRooms() {
  try {
    const res = await fetch(`${API_BASE_URL}/rooms`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    return getLocalDb().rooms;
  }
}

export async function updateRoom(id, data) {
  try {
    const res = await fetch(`${API_BASE_URL}/rooms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    const db = getLocalDb();
    const idx = db.rooms.findIndex(r => r.id === id);
    if (idx !== -1) {
      db.rooms[idx] = { ...db.rooms[idx], ...data };
      saveLocalDb(db);
    }
    return db.rooms[idx];
  }
}

// Lab Tests API
export async function getLabTests() {
  try {
    const res = await fetch(`${API_BASE_URL}/lab-tests`);
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    return getLocalDb().labTests;
  }
}

export async function createLabTest(data) {
  try {
    const res = await fetch(`${API_BASE_URL}/lab-tests`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    const db = getLocalDb();
    const newLab = { ...data, id: `LAB-${700 + db.labTests.length + 1}` };
    db.labTests.unshift(newLab);
    saveLocalDb(db);
    return newLab;
  }
}

export async function updateLabTest(id, data) {
  try {
    const res = await fetch(`${API_BASE_URL}/lab-tests/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) throw new Error();
    return await res.json();
  } catch (err) {
    const db = getLocalDb();
    const idx = db.labTests.findIndex(t => t.id === id);
    if (idx !== -1) {
      db.labTests[idx] = { ...db.labTests[idx], ...data };
      saveLocalDb(db);
    }
    return db.labTests[idx];
  }
}
