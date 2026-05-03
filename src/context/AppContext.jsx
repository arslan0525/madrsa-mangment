import React, { createContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const AppContext = createContext();

// API base URL - works both locally and on Netlify
const API = import.meta.env.DEV
  ? 'http://localhost:8888/api'
  : '/api';

// Helper to make API calls
async function apiCall(endpoint, method = 'GET', body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const options = { method, headers };
  if (body) options.body = JSON.stringify(body);

  const res = await fetch(`${API}${endpoint}`, options);
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || 'Server error');
  return data;
}

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [token, setToken] = useState(null);
  const [profile, setProfile] = useState(null);
  const [donations, setDonations] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [kitchen, setKitchen] = useState([]);
  const [students, setStudents] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Load saved session on app start
  useEffect(() => {
    const savedToken = localStorage.getItem('madrasa_token');
    const savedUser = localStorage.getItem('madrasa_user');
    if (savedToken && savedUser) {
      const user = JSON.parse(savedUser);
      setToken(savedToken);
      setCurrentUser(user);
      fetchAllData(savedToken);
    } else {
      setLoading(false);
    }
  }, []);

  const fetchAllData = async (tkn) => {
    setLoading(true);
    try {
      const [prof, dons, exps, kit, studs, dons_list] = await Promise.all([
        apiCall('/data/profiles', 'GET', null, tkn),
        apiCall('/data/donations', 'GET', null, tkn),
        apiCall('/data/expenses', 'GET', null, tkn),
        apiCall('/data/kitchen', 'GET', null, tkn),
        apiCall('/data/students', 'GET', null, tkn),
        apiCall('/data/donors', 'GET', null, tkn),
      ]);
      if (prof) setProfile(prof);
      setDonations(dons || []);
      setExpenses(exps || []);
      setKitchen(kit || []);
      setStudents(studs || []);
      setDonors(dons_list || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ---- AUTH ----
  const login = async (email, password) => {
    const res = await apiCall('/auth/login', 'POST', { email, password });
    setCurrentUser(res.user);
    setToken(res.token);
    localStorage.setItem('madrasa_token', res.token);
    localStorage.setItem('madrasa_user', JSON.stringify(res.user));
    await fetchAllData(res.token);
    return true;
  };

  const register = async (userData) => {
    const res = await apiCall('/auth/register', 'POST', userData);
    setCurrentUser(res.user);
    setToken(res.token);
    setProfile({ madrasa_name: userData.name, phone: userData.phone });
    localStorage.setItem('madrasa_token', res.token);
    localStorage.setItem('madrasa_user', JSON.stringify(res.user));
    return true;
  };

  const logout = async () => {
    localStorage.removeItem('madrasa_token');
    localStorage.removeItem('madrasa_user');
    setCurrentUser(null);
    setToken(null);
    setProfile(null);
    setDonations([]);
    setExpenses([]);
    setKitchen([]);
    setStudents([]);
    setDonors([]);
  };

  const resetPassword = async (email) => {
    throw new Error('Password reset - please contact admin.');
  };

  const updatePassword = async (newPassword) => {
    // Can be implemented later
  };

  // ---- PROFILE ----
  const updateProfile = async (p) => {
    setSyncing(true);
    try {
      await apiCall('/data/profiles', 'POST', p, token);
      setProfile(p);
    } finally {
      setSyncing(false);
    }
  };

  // ---- DONATIONS ----
  const addDonation = async (d) => {
    setSyncing(true);
    try {
      const newItem = await apiCall('/data/donations', 'POST', d, token);
      setDonations(prev => [newItem, ...prev]);
    } finally {
      setSyncing(false);
    }
  };

  const deleteDonation = async (id) => {
    setSyncing(true);
    try {
      await apiCall(`/data/donations/${id}`, 'DELETE', null, token);
      setDonations(prev => prev.filter(x => x.id !== id));
    } finally {
      setSyncing(false);
    }
  };

  // ---- EXPENSES ----
  const addExpense = async (e) => {
    setSyncing(true);
    try {
      const newItem = await apiCall('/data/expenses', 'POST', e, token);
      setExpenses(prev => [newItem, ...prev]);
    } finally {
      setSyncing(false);
    }
  };

  const deleteExpense = async (id) => {
    setSyncing(true);
    try {
      await apiCall(`/data/expenses/${id}`, 'DELETE', null, token);
      setExpenses(prev => prev.filter(x => x.id !== id));
    } finally {
      setSyncing(false);
    }
  };

  // ---- KITCHEN ----
  const addKitchenItem = async (k) => {
    setSyncing(true);
    try {
      const newItem = await apiCall('/data/kitchen', 'POST', k, token);
      setKitchen(prev => [newItem, ...prev]);
    } finally {
      setSyncing(false);
    }
  };

  const deleteKitchenItem = async (id) => {
    setSyncing(true);
    try {
      await apiCall(`/data/kitchen/${id}`, 'DELETE', null, token);
      setKitchen(prev => prev.filter(x => x.id !== id));
    } finally {
      setSyncing(false);
    }
  };

  // ---- DONORS ----
  const addDonor = async (d) => {
    setSyncing(true);
    try {
      const newItem = await apiCall('/data/donors', 'POST', d, token);
      setDonors(prev => [newItem, ...prev]);
    } finally {
      setSyncing(false);
    }
  };

  const deleteDonor = async (id) => {
    setSyncing(true);
    try {
      await apiCall(`/data/donors/${id}`, 'DELETE', null, token);
      setDonors(prev => prev.filter(x => x.id !== id));
    } finally {
      setSyncing(false);
    }
  };

  // ---- STUDENTS ----
  const addStudent = async (studentData) => {
    setSyncing(true);
    try {
      const newItem = await apiCall('/data/students', 'POST', studentData, token);
      setStudents(prev => [newItem, ...prev]);
    } finally {
      setSyncing(false);
    }
  };

  const updateStudent = async (id, updatedData) => {
    setSyncing(true);
    try {
      await apiCall('/data/students', 'PUT', { id, ...updatedData }, token);
      setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updatedData } : s));
    } finally {
      setSyncing(false);
    }
  };

  const deleteStudent = async (id) => {
    setSyncing(true);
    try {
      await apiCall(`/data/students/${id}`, 'DELETE', null, token);
      setStudents(prev => prev.filter(s => s.id !== id));
    } finally {
      setSyncing(false);
    }
  };

  const toggleStudentFee = async (studentId, year, month) => {
    const student = students.find(s => s.id === studentId);
    if (!student) return;

    const currentFees = student.fees || {};
    const yearFees = currentFees[year] || {};
    const isPaid = !!yearFees[month];

    const updatedFees = {
      ...currentFees,
      [year]: { ...yearFees, [month]: !isPaid },
    };

    await updateStudent(studentId, { fees: updatedFees });
  };

  return (
    <AppContext.Provider value={{
      currentUser, login, register, logout, resetPassword, updatePassword, loading, syncing,
      profile, updateProfile,
      donations, addDonation, deleteDonation,
      expenses, addExpense, deleteExpense,
      kitchen, addKitchenItem, deleteKitchenItem,
      donors, addDonor, deleteDonor,
      students, addStudent, updateStudent, deleteStudent, toggleStudentFee
    }}>
      {children}
    </AppContext.Provider>
  );
};
