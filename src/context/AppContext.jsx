import React, { createContext, useState, useEffect } from 'react';

export const AppContext = createContext();

// Helper to call Netlify functions
async function authApi(action, payload) {
  const res = await fetch('/.netlify/functions/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, ...payload }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Server error');
  return data;
}

async function dataApi(collection, action, payload = {}, token) {
  const res = await fetch('/.netlify/functions/data', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ collection, action, ...payload }),
  });
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
        dataApi('profiles', 'get', {}, tkn),
        dataApi('donations', 'get', {}, tkn),
        dataApi('expenses', 'get', {}, tkn),
        dataApi('kitchen', 'get', {}, tkn),
        dataApi('students', 'get', {}, tkn),
        dataApi('donors', 'get', {}, tkn),
      ]);
      if (prof) setProfile(prof);
      setDonations(Array.isArray(dons) ? dons : []);
      setExpenses(Array.isArray(exps) ? exps : []);
      setKitchen(Array.isArray(kit) ? kit : []);
      setStudents(Array.isArray(studs) ? studs : []);
      setDonors(Array.isArray(dons_list) ? dons_list : []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ---- AUTH ----
  const login = async (email, password) => {
    const res = await authApi('login', { email, password });
    setCurrentUser(res.user);
    setToken(res.token);
    localStorage.setItem('madrasa_token', res.token);
    localStorage.setItem('madrasa_user', JSON.stringify(res.user));
    await fetchAllData(res.token);
    return true;
  };

  const register = async (userData) => {
    const res = await authApi('register', userData);
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

  const resetPassword = async () => {
    throw new Error('Password reset - please contact admin.');
  };

  const updatePassword = async () => {};

  // ---- PROFILE ----
  const updateProfile = async (p) => {
    setSyncing(true);
    try {
      await dataApi('profiles', 'add', { item: p }, token);
      setProfile(p);
    } finally { setSyncing(false); }
  };

  // ---- DONATIONS ----
  const addDonation = async (d) => {
    setSyncing(true);
    try {
      const newItem = await dataApi('donations', 'add', { item: d }, token);
      setDonations(prev => [newItem, ...prev]);
    } finally { setSyncing(false); }
  };

  const deleteDonation = async (id) => {
    setSyncing(true);
    try {
      await dataApi('donations', 'delete', { id }, token);
      setDonations(prev => prev.filter(x => x.id !== id));
    } finally { setSyncing(false); }
  };

  // ---- EXPENSES ----
  const addExpense = async (e) => {
    setSyncing(true);
    try {
      const newItem = await dataApi('expenses', 'add', { item: e }, token);
      setExpenses(prev => [newItem, ...prev]);
    } finally { setSyncing(false); }
  };

  const deleteExpense = async (id) => {
    setSyncing(true);
    try {
      await dataApi('expenses', 'delete', { id }, token);
      setExpenses(prev => prev.filter(x => x.id !== id));
    } finally { setSyncing(false); }
  };

  // ---- KITCHEN ----
  const addKitchenItem = async (k) => {
    setSyncing(true);
    try {
      const newItem = await dataApi('kitchen', 'add', { item: k }, token);
      setKitchen(prev => [newItem, ...prev]);
    } finally { setSyncing(false); }
  };

  const deleteKitchenItem = async (id) => {
    setSyncing(true);
    try {
      await dataApi('kitchen', 'delete', { id }, token);
      setKitchen(prev => prev.filter(x => x.id !== id));
    } finally { setSyncing(false); }
  };

  // ---- DONORS ----
  const addDonor = async (d) => {
    setSyncing(true);
    try {
      const newItem = await dataApi('donors', 'add', { item: d }, token);
      setDonors(prev => [newItem, ...prev]);
    } finally { setSyncing(false); }
  };

  const deleteDonor = async (id) => {
    setSyncing(true);
    try {
      await dataApi('donors', 'delete', { id }, token);
      setDonors(prev => prev.filter(x => x.id !== id));
    } finally { setSyncing(false); }
  };

  // ---- STUDENTS ----
  const addStudent = async (studentData) => {
    setSyncing(true);
    try {
      const newItem = await dataApi('students', 'add', { item: studentData }, token);
      setStudents(prev => [newItem, ...prev]);
    } finally { setSyncing(false); }
  };

  const updateStudent = async (id, updatedData) => {
    setSyncing(true);
    try {
      await dataApi('students', 'update', { item: { id, ...updatedData } }, token);
      setStudents(prev => prev.map(s => s.id === id ? { ...s, ...updatedData } : s));
    } finally { setSyncing(false); }
  };

  const deleteStudent = async (id) => {
    setSyncing(true);
    try {
      await dataApi('students', 'delete', { id }, token);
      setStudents(prev => prev.filter(s => s.id !== id));
    } finally { setSyncing(false); }
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
