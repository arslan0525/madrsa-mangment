import React, { createContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [donations, setDonations] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [kitchen, setKitchen] = useState([]);
  const [students, setStudents] = useState([]);
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);

  // Initial Auth Check
  useEffect(() => {
    const checkUser = () => {
      const storedUser = localStorage.getItem('madrasa_user');
      if (storedUser) {
        const user = JSON.parse(storedUser);
        setCurrentUser(user);
        fetchData(user.id);
      } else {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const fetchData = (userId) => {
    setLoading(true);
    try {
      const storedProfile = localStorage.getItem(`madrasa_profile_${userId}`);
      if (storedProfile) setProfile(JSON.parse(storedProfile));

      const storedDonations = localStorage.getItem(`madrasa_donations_${userId}`);
      if (storedDonations) setDonations(JSON.parse(storedDonations));

      const storedExpenses = localStorage.getItem(`madrasa_expenses_${userId}`);
      if (storedExpenses) setExpenses(JSON.parse(storedExpenses));

      const storedKitchen = localStorage.getItem(`madrasa_kitchen_${userId}`);
      if (storedKitchen) setKitchen(JSON.parse(storedKitchen));

      const storedStudents = localStorage.getItem(`madrasa_students_${userId}`);
      if (storedStudents) setStudents(JSON.parse(storedStudents));

      const storedDonors = localStorage.getItem(`madrasa_donors_${userId}`);
      if (storedDonors) setDonors(JSON.parse(storedDonors));
    } catch (error) {
      console.error('Error fetching data from local storage:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveData = (key, data) => {
    if (currentUser) {
      localStorage.setItem(`madrasa_${key}_${currentUser.id}`, JSON.stringify(data));
    }
  };

  const addDonation = async (d) => {
    const newDonation = { ...d, id: uuidv4() };
    const updated = [newDonation, ...donations];
    setDonations(updated);
    saveData('donations', updated);
  };

  const deleteDonation = async (id) => {
    const updated = donations.filter(x => x.id !== id);
    setDonations(updated);
    saveData('donations', updated);
  };

  const addExpense = async (e) => {
    const newExpense = { ...e, id: uuidv4() };
    const updated = [newExpense, ...expenses];
    setExpenses(updated);
    saveData('expenses', updated);
  };

  const deleteExpense = async (id) => {
    const updated = expenses.filter(x => x.id !== id);
    setExpenses(updated);
    saveData('expenses', updated);
  };

  const addKitchenItem = async (k) => {
    const newItem = { ...k, id: uuidv4() };
    const updated = [newItem, ...kitchen];
    setKitchen(updated);
    saveData('kitchen', updated);
  };

  const deleteKitchenItem = async (id) => {
    const updated = kitchen.filter(x => x.id !== id);
    setKitchen(updated);
    saveData('kitchen', updated);
  };

  const addDonor = async (d) => {
    const newDonor = { ...d, id: uuidv4() };
    const updated = [newDonor, ...donors];
    setDonors(updated);
    saveData('donors', updated);
  };

  const deleteDonor = async (id) => {
    const updated = donors.filter(x => x.id !== id);
    setDonors(updated);
    saveData('donors', updated);
  };

  const updateProfile = async (p) => {
    setProfile(p);
    saveData('profile', p);
  };

  const addStudent = async (studentData) => {
    const newStudent = { ...studentData, id: uuidv4() };
    const updated = [newStudent, ...students];
    setStudents(updated);
    saveData('students', updated);
  };

  const updateStudent = async (id, updatedData) => {
    const updated = students.map(s => s.id === id ? { ...s, ...updatedData } : s);
    setStudents(updated);
    saveData('students', updated);
  };

  const deleteStudent = async (id) => {
    const updated = students.filter(s => s.id !== id);
    setStudents(updated);
    saveData('students', updated);
  };

  const toggleStudentFee = async (studentId, year, month) => {
    const newStudents = students.map(s => {
      if (s.id === studentId) {
        const currentFees = s.fees || {};
        const yearFees = currentFees[year] || {};
        const isPaid = !!yearFees[month];
        
        return {
          ...s,
          fees: {
            ...currentFees,
            [year]: {
              ...yearFees,
              [month]: !isPaid
            }
          }
        };
      }
      return s;
    });

    setStudents(newStudents);
    saveData('students', newStudents);
  };

  // Auth Actions
  const login = async (email, password) => {
    const usersStr = localStorage.getItem('madrasa_users') || '[]';
    const users = JSON.parse(usersStr);
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('madrasa_user', JSON.stringify(user));
      fetchData(user.id);
      return true;
    } else {
      throw new Error('Invalid email or password');
    }
  };

  const register = async (userData) => {
    const usersStr = localStorage.getItem('madrasa_users') || '[]';
    const users = JSON.parse(usersStr);
    
    if (users.find(u => u.email === userData.email)) {
      throw new Error('Email already registered');
    }

    const newUser = {
      id: uuidv4(),
      email: userData.email,
      password: userData.password,
    };

    users.push(newUser);
    localStorage.setItem('madrasa_users', JSON.stringify(users));

    const initialProfile = {
      madrasa_name: userData.name,
      phone: userData.phone
    };

    setCurrentUser(newUser);
    localStorage.setItem('madrasa_user', JSON.stringify(newUser));
    setProfile(initialProfile);
    localStorage.setItem(`madrasa_profile_${newUser.id}`, JSON.stringify(initialProfile));
    
    return true;
  };

  const logout = async () => {
    localStorage.removeItem('madrasa_user');
    setCurrentUser(null);
    setProfile(null);
    setDonations([]);
    setExpenses([]);
    setKitchen([]);
    setStudents([]);
    setDonors([]);
  };

  const resetPassword = async (email) => {
    throw new Error('Password reset is not supported in local mode.');
  };

  const updatePassword = async (newPassword) => {
    if (!currentUser) return;
    
    const usersStr = localStorage.getItem('madrasa_users') || '[]';
    let users = JSON.parse(usersStr);
    
    users = users.map(u => u.id === currentUser.id ? { ...u, password: newPassword } : u);
    localStorage.setItem('madrasa_users', JSON.stringify(users));
    
    const updatedUser = { ...currentUser, password: newPassword };
    setCurrentUser(updatedUser);
    localStorage.setItem('madrasa_user', JSON.stringify(updatedUser));
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
