import React, { createContext, useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(() => JSON.parse(localStorage.getItem('madrasa_current_user')) || null);
  const [profile, setProfile] = useState(() => JSON.parse(localStorage.getItem('madrasa_profile')) || null);
  const [donations, setDonations] = useState(() => JSON.parse(localStorage.getItem('madrasa_donations')) || []);
  const [expenses, setExpenses] = useState(() => JSON.parse(localStorage.getItem('madrasa_expenses')) || []);
  const [kitchen, setKitchen] = useState(() => JSON.parse(localStorage.getItem('madrasa_kitchen')) || []);
  const [students, setStudents] = useState(() => JSON.parse(localStorage.getItem('madrasa_students')) || []);
  const [donors, setDonors] = useState(() => JSON.parse(localStorage.getItem('madrasa_donors')) || []);
  const [loading, setLoading] = useState(false);

  // Sync to local storage whenever state changes
  useEffect(() => {
    localStorage.setItem('madrasa_donations', JSON.stringify(donations));
  }, [donations]);

  useEffect(() => {
    localStorage.setItem('madrasa_expenses', JSON.stringify(expenses));
  }, [expenses]);

  useEffect(() => {
    localStorage.setItem('madrasa_kitchen', JSON.stringify(kitchen));
  }, [kitchen]);

  useEffect(() => {
    localStorage.setItem('madrasa_students', JSON.stringify(students));
  }, [students]);

  useEffect(() => {
    localStorage.setItem('madrasa_profile', JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem('madrasa_current_user', JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem('madrasa_donors', JSON.stringify(donors));
  }, [donors]);


  // Actions
  const addDonation = (d) => setDonations([d, ...donations]);
  const deleteDonation = (id) => setDonations(donations.filter(x => x.id !== id));

  const addExpense = (e) => setExpenses([e, ...expenses]);
  const deleteExpense = (id) => setExpenses(expenses.filter(x => x.id !== id));

  const addKitchenItem = (k) => setKitchen([k, ...kitchen]);
  const deleteKitchenItem = (id) => setKitchen(kitchen.filter(x => x.id !== id));

  const addDonor = (d) => setDonors([d, ...donors]);
  const deleteDonor = (id) => setDonors(donors.filter(x => x.id !== id));

  const updateProfile = (p) => setProfile(p);

  // Students Fee Management Actions
  const addStudent = (studentData) => {
    setStudents([{ ...studentData, id: uuidv4() }, ...students]);
  };

  const updateStudent = (id, updatedData) => {
    setStudents(students.map(s => s.id === id ? { ...s, ...updatedData } : s));
  };

  const deleteStudent = (id) => {
    setStudents(students.filter(s => s.id !== id));
  };

  const toggleStudentFee = (studentId, year, month) => {
    setStudents(students.map(s => {
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
    }));
  };

  // Auth Mock Actions
  const login = async (email, password) => {
    // Mock login that just sets a local user
    // Since it's a completely local app, any login can be accepted if it matches a stored PIN, or just set it
    const user = { id: 'local_user', email: email, name: email.split('@')[0] };
    setCurrentUser(user);
    return true;
  };

  const register = async (userData) => {
    const user = { id: 'local_user', email: userData.email, name: userData.name };
    setCurrentUser(user);
    return true;
  };

  const logout = async () => {
    setCurrentUser(null);
    // Don't clear local storage if we want data to persist, just logout the session
  };

  const resetPassword = async (identifier) => {
    return 'email_sent'; // Mock
  };

  const updatePassword = async (newPassword) => {
    // Mock
  };

  return (
    <AppContext.Provider value={{
      currentUser, login, register, logout, resetPassword, updatePassword, loading,
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
