import React, { createContext, useState, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { supabase } from '../lib/supabase';

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
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setCurrentUser(session.user);
        fetchData(session.user.id);
      } else {
        setLoading(false);
      }
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setCurrentUser(session.user);
        fetchData(session.user.id);
      } else {
        setCurrentUser(null);
        setProfile(null);
        setDonations([]);
        setExpenses([]);
        setKitchen([]);
        setStudents([]);
        setDonors([]);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchData = async (userId) => {
    setLoading(true);
    try {
      const [
        { data: prof },
        { data: dons },
        { data: exps },
        { data: kit },
        { data: studs },
        { data: dons_list }
      ] = await Promise.all([
        supabase.from('profiles').select('*').eq('uid', userId).single(),
        supabase.from('donations').select('*').eq('uid', userId).order('date', { ascending: false }),
        supabase.from('expenses').select('*').eq('uid', userId).order('date', { ascending: false }),
        supabase.from('kitchen').select('*').eq('uid', userId).order('date', { ascending: false }),
        supabase.from('students').select('*').eq('uid', userId).order('created_at', { ascending: false }),
        supabase.from('donors').select('*').eq('uid', userId).order('created_at', { ascending: false })
      ]);

      if (prof) setProfile(prof);
      if (dons) setDonations(dons);
      if (exps) setExpenses(exps);
      if (kit) setKitchen(kit);
      if (studs) setStudents(studs);
      if (dons_list) setDonors(dons_list);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Data fetching and auth logic already handled above


  // Actions helper
  const withSync = async (fn) => {
    setSyncing(true);
    try {
      await fn();
    } catch (error) {
      console.error('Sync error:', error);
      alert('ڈیٹا سنک کرنے میں دشواری پیش آئی۔ (Sync Error)');
    } finally {
      setSyncing(false);
    }
  };

  const addDonation = async (d) => {
    const newDonation = { ...d, uid: currentUser.id };
    setDonations([newDonation, ...donations]);
    await withSync(() => supabase.from('donations').insert([newDonation]));
  };

  const deleteDonation = async (id) => {
    setDonations(donations.filter(x => x.id !== id));
    await withSync(() => supabase.from('donations').delete().eq('id', id));
  };

  const addExpense = async (e) => {
    const newExpense = { ...e, uid: currentUser.id };
    setExpenses([newExpense, ...expenses]);
    await withSync(() => supabase.from('expenses').insert([newExpense]));
  };

  const deleteExpense = async (id) => {
    setExpenses(expenses.filter(x => x.id !== id));
    await withSync(() => supabase.from('expenses').delete().eq('id', id));
  };

  const addKitchenItem = async (k) => {
    const newItem = { ...k, uid: currentUser.id };
    setKitchen([newItem, ...kitchen]);
    await withSync(() => supabase.from('kitchen').insert([newItem]));
  };

  const deleteKitchenItem = async (id) => {
    setKitchen(kitchen.filter(x => x.id !== id));
    await withSync(() => supabase.from('kitchen').delete().eq('id', id));
  };

  const addDonor = async (d) => {
    const newDonor = { ...d, id: uuidv4(), uid: currentUser.id };
    setDonors([newDonor, ...donors]);
    await withSync(() => supabase.from('donors').insert([newDonor]));
  };

  const deleteDonor = async (id) => {
    setDonors(donors.filter(x => x.id !== id));
    await withSync(() => supabase.from('donors').delete().eq('id', id));
  };

  const updateProfile = async (p) => {
    setProfile(p);
    await withSync(() => supabase.from('profiles').upsert({ ...p, uid: currentUser.id }));
  };

  const addStudent = async (studentData) => {
    const newStudent = { ...studentData, id: uuidv4(), uid: currentUser.id };
    setStudents([newStudent, ...students]);
    await withSync(() => supabase.from('students').insert([newStudent]));
  };

  const updateStudent = async (id, updatedData) => {
    const updated = students.map(s => s.id === id ? { ...s, ...updatedData } : s);
    setStudents(updated);
    await withSync(() => supabase.from('students').update(updatedData).eq('id', id));
  };

  const deleteStudent = async (id) => {
    setStudents(students.filter(s => s.id !== id));
    await withSync(() => supabase.from('students').delete().eq('id', id));
  };

  const toggleStudentFee = async (studentId, year, month) => {
    let updatedStudent = null;
    const newStudents = students.map(s => {
      if (s.id === studentId) {
        const currentFees = s.fees || {};
        const yearFees = currentFees[year] || {};
        const isPaid = !!yearFees[month];
        
        updatedStudent = {
          ...s,
          fees: {
            ...currentFees,
            [year]: {
              ...yearFees,
              [month]: !isPaid
            }
          }
        };
        return updatedStudent;
      }
      return s;
    });

    setStudents(newStudents);
    if (updatedStudent) {
      await withSync(() => supabase.from('students').update({ fees: updatedStudent.fees }).eq('id', studentId));
    }
  };

  // Auth Actions
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    setCurrentUser(data.user);
    return true;
  };

  const register = async (userData) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
    });
    if (error) throw error;
    
    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert([{
        uid: data.user.id,
        madrasa_name: userData.name, // Using name as madrasa name for now
        phone: userData.phone
      }]);
      if (profileError) {
        console.error("Profile creation error:", profileError);
        // We still return true or we can throw. Throwing is safer so they know it failed.
        throw new Error(profileError.message);
      }
    }
    
    setCurrentUser(data.user);
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setCurrentUser(null);
  };

  const resetPassword = async (email) => {
    const { error } = await supabase.auth.resetPasswordForEmail(email);
    if (error) throw error;
    return 'email_sent';
  };

  const updatePassword = async (newPassword) => {
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) throw error;
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
