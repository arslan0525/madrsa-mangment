import React, { createContext, useState, useEffect } from 'react';
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

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        setCurrentUser(session.user);
        fetchAllData(session.user.id);
      } else {
        setLoading(false);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        setCurrentUser(session.user);
        fetchAllData(session.user.id);
      } else {
        setCurrentUser(null);
        clearData();
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const clearData = () => {
    setProfile(null);
    setDonations([]);
    setExpenses([]);
    setKitchen([]);
    setStudents([]);
    setDonors([]);
  };

  const fetchAllData = async (uid) => {
    setLoading(true);
    try {
      // Fetch profile first
      let { data: prof, error: profError } = await supabase
        .from('profiles')
        .select('*')
        .eq('uid', uid)
        .single();

      // If profile doesn't exist, create it from user metadata
      if (profError && profError.code === 'PGRST116') {
        const { data: userData } = await supabase.auth.getUser();
        const meta = userData?.user?.user_metadata;
        if (meta) {
          const { data: newProf, error: insertError } = await supabase
            .from('profiles')
            .insert([{ uid: uid, madrasa_name: meta.madrasa_name, phone: meta.phone }])
            .select()
            .single();
          if (!insertError) {
            prof = newProf;
          }
        }
      }

      const [
        { data: dons },
        { data: exps },
        { data: kit },
        { data: studs },
        { data: donsList }
      ] = await Promise.all([
        supabase.from('donations').select('*').eq('uid', uid).order('created_at', { ascending: false }),
        supabase.from('expenses').select('*').eq('uid', uid).order('created_at', { ascending: false }),
        supabase.from('kitchen').select('*').eq('uid', uid).order('created_at', { ascending: false }),
        supabase.from('students').select('*').eq('uid', uid).order('created_at', { ascending: false }),
        supabase.from('donors').select('*').eq('uid', uid).order('created_at', { ascending: false })
      ]);

      if (prof) setProfile(prof);
      setDonations(dons || []);
      setExpenses(exps || []);
      setKitchen(kit || []);
      setStudents(studs || []);
      setDonors(donsList || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  // ---- AUTH ----
  const login = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    return true;
  };

  const register = async (userData) => {
    const { data, error } = await supabase.auth.signUp({
      email: userData.email,
      password: userData.password,
      options: {
        data: {
          phone: userData.phone,
          madrasa_name: userData.name
        }
      }
    });
    if (error) throw error;
    
    // We do not insert the profile here because if Email Confirmations are ON,
    // the user is not logged in yet, so RLS will block the insert.
    // The profile will be created automatically in fetchAllData on first login.
    
    if (!data.session) {
      throw new Error("Registration successful! Please check your email to confirm your account before logging in.");
    }
    
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
  };

  const resetPassword = async () => {
    throw new Error('Password reset - please contact admin.');
  };

  const updatePassword = async () => {};

  // ---- PROFILE ----
  const updateProfile = async (p) => {
    if (!currentUser) return;
    setSyncing(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .upsert({ uid: currentUser.id, ...p })
        .select()
        .single();
      if (error) throw error;
      setProfile(data);
    } catch (err) {
      console.error('Profile update error:', err);
      throw err;
    } finally { setSyncing(false); }
  };

  // ---- DONATIONS ----
  const addDonation = async (d) => {
    if (!currentUser) return;
    setSyncing(true);
    try {
      const { data, error } = await supabase
        .from('donations')
        .insert([{ ...d, uid: currentUser.id }])
        .select()
        .single();
      if (error) throw error;
      setDonations(prev => [data, ...prev]);
    } catch (err) {
      console.error('Add donation error:', err);
      throw err;
    } finally { setSyncing(false); }
  };

  const deleteDonation = async (id) => {
    setSyncing(true);
    try {
      const { error } = await supabase.from('donations').delete().eq('id', id);
      if (error) throw error;
      setDonations(prev => prev.filter(x => x.id !== id));
    } catch (err) {
      console.error('Delete donation error:', err);
      throw err;
    } finally { setSyncing(false); }
  };

  // ---- EXPENSES ----
  const addExpense = async (e) => {
    if (!currentUser) return;
    setSyncing(true);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .insert([{ ...e, uid: currentUser.id }])
        .select()
        .single();
      if (error) throw error;
      setExpenses(prev => [data, ...prev]);
    } catch (err) {
      console.error('Add expense error:', err);
      throw err;
    } finally { setSyncing(false); }
  };

  const deleteExpense = async (id) => {
    setSyncing(true);
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
      setExpenses(prev => prev.filter(x => x.id !== id));
    } catch (err) {
      console.error('Delete expense error:', err);
      throw err;
    } finally { setSyncing(false); }
  };

  // ---- KITCHEN ----
  const addKitchenItem = async (k) => {
    if (!currentUser) return;
    setSyncing(true);
    try {
      const { data, error } = await supabase
        .from('kitchen')
        .insert([{ ...k, uid: currentUser.id }])
        .select()
        .single();
      if (error) throw error;
      setKitchen(prev => [data, ...prev]);
    } catch (err) {
      console.error('Add kitchen item error:', err);
      throw err;
    } finally { setSyncing(false); }
  };

  const deleteKitchenItem = async (id) => {
    setSyncing(true);
    try {
      const { error } = await supabase.from('kitchen').delete().eq('id', id);
      if (error) throw error;
      setKitchen(prev => prev.filter(x => x.id !== id));
    } catch (err) {
      console.error('Delete kitchen item error:', err);
      throw err;
    } finally { setSyncing(false); }
  };

  // ---- DONORS ----
  const addDonor = async (d) => {
    if (!currentUser) return;
    setSyncing(true);
    try {
      const { data, error } = await supabase
        .from('donors')
        .insert([{ ...d, uid: currentUser.id }])
        .select()
        .single();
      if (error) throw error;
      setDonors(prev => [data, ...prev]);
    } catch (err) {
      console.error('Add donor error:', err);
      throw err;
    } finally { setSyncing(false); }
  };

  const deleteDonor = async (id) => {
    setSyncing(true);
    try {
      const { error } = await supabase.from('donors').delete().eq('id', id);
      if (error) throw error;
      setDonors(prev => prev.filter(x => x.id !== id));
    } catch (err) {
      console.error('Delete donor error:', err);
      throw err;
    } finally { setSyncing(false); }
  };

  // ---- STUDENTS ----
  const addStudent = async (studentData) => {
    if (!currentUser) return;
    setSyncing(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .insert([{ ...studentData, uid: currentUser.id }])
        .select()
        .single();
      if (error) throw error;
      setStudents(prev => [data, ...prev]);
    } catch (err) {
      console.error('Add student error:', err);
      throw err;
    } finally { setSyncing(false); }
  };

  const updateStudent = async (id, updatedData) => {
    setSyncing(true);
    try {
      const { data, error } = await supabase
        .from('students')
        .update(updatedData)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      setStudents(prev => prev.map(s => s.id === id ? { ...s, ...data } : s));
    } catch (err) {
      console.error('Update student error:', err);
      throw err;
    } finally { setSyncing(false); }
  };

  const deleteStudent = async (id) => {
    setSyncing(true);
    try {
      const { error } = await supabase.from('students').delete().eq('id', id);
      if (error) throw error;
      setStudents(prev => prev.filter(s => s.id !== id));
    } catch (err) {
      console.error('Delete student error:', err);
      throw err;
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
