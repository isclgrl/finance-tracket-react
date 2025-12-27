import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const useFinance = () => {
  const [session, setSession] = useState(null);
  const [funds, setFunds] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [loading, setLoading] = useState(true);
  const [excludedFundIds, setExcludedFundIds] = useState([]);

  // --- 1. GESTIÓN DE SESIÓN ---
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) initData(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) initData(session.user.id);
      else { resetStates(); }
    });
    return () => subscription.unsubscribe();
  }, []);

  const resetStates = () => {
    setFunds([]);
    setTransactions([]);
    setCurrentPeriod(null);
  };

  // --- 2. CARGA DE DATOS ---
  const initData = async (userId) => {
    try {
      const { data: periodData } = await supabase.from('periods').select('*').eq('is_active', true).eq('user_id', userId).maybeSingle();
      setCurrentPeriod(periodData || null);
      if (periodData) fetchTransactionsAndFunds(periodData.id);
      else { setFunds([]); setTransactions([]); }
    } catch (error) { console.error(error); }
  };

  const fetchTransactionsAndFunds = async (periodId) => {
    const { data: fundsData } = await supabase.from('funds').select('*').order('id', { ascending: true });
    setFunds(fundsData || []);
    const { data: transData } = await supabase.from('transactions').select('*').eq('period_id', periodId).order('date', { ascending: false });
    setTransactions(transData || []);
  };

  // --- 3. ACCIONES (Logic Business) ---
  
  // A. Iniciar Periodo
  const startPeriod = async (name) => {
    try {
      const { data, error } = await supabase.from('periods').insert([{ name, is_active: true, user_id: session.user.id }]).select().single();
      if (error) throw error;
      setCurrentPeriod(data);
      return { success: true };
    } catch (error) { return { success: false, error: error.message }; }
  };

  // B. Cerrar Periodo
  const closePeriod = async (nextName) => {
    try {
      if (currentPeriod) await supabase.from('periods').update({ is_active: false }).eq('id', currentPeriod.id);
      const { data, error } = await supabase.from('periods').insert([{ name: nextName, is_active: true, user_id: session.user.id }]).select().single();
      if (error) throw error;
      setCurrentPeriod(data);
      setTransactions([]);
      return { success: true };
    } catch (error) { return { success: false, error: error.message }; }
  };

  // C. Crear Fondo
  const createFund = async (name, initialAmount) => {
    if (!currentPeriod) return;
    try {
      const { data, error } = await supabase.from('funds').insert([{ name, balance: Number(initialAmount) || 0, user_id: session.user.id }]).select();
      if (error) throw error;
      setFunds([...funds, data[0]]);
      return { success: true };
    } catch (error) { return { success: false, error: error.message }; }
  };

  // D. Agregar Transacción (La más compleja)
  const addTransaction = async (tx) => {
    if (!currentPeriod) return;
    try {
      // Insertar gasto
      const { data: transData, error: transError } = await supabase.from('transactions').insert([{
        description: tx.description,
        amount: tx.amount,
        category: tx.category,
        type: tx.type,
        fund_id: tx.fundId,
        is_executed: tx.isExecuted,
        date: new Date().toISOString(),
        user_id: session.user.id,
        period_id: currentPeriod.id
      }]).select();

      if (transError) throw transError;

      // Actualizar Saldo localmente y en BD
      const fund = funds.find(f => f.id === tx.fundId);
      if (fund) {
        const newBalance = tx.type === 'income' ? fund.balance + tx.amount : fund.balance - tx.amount;
        await supabase.from('funds').update({ balance: newBalance }).eq('id', tx.fundId);
        
        // Actualizar estados para refrescar UI
        setTransactions([transData[0], ...transactions]);
        setFunds(funds.map(f => f.id === tx.fundId ? { ...f, balance: newBalance } : f));
      }
      return { success: true };
    } catch (error) { return { success: false, error: error.message }; }
  };

  const toggleFundInclusion = (fundId) => {
    if (excludedFundIds.includes(fundId)) {
      setExcludedFundIds(excludedFundIds.filter(id => id !== fundId));
    } else {
      setExcludedFundIds([...excludedFundIds, fundId]);
    }
  };

  const logout = () => supabase.auth.signOut();

  // EXPORTAMOS TODO LO QUE LA UI NECESITA
  return {
    session,
    loading,
    funds,
    transactions,
    currentPeriod,
    startPeriod,
    closePeriod,
    createFund,
    addTransaction,
    excludedFundIds,
    toggleFundInclusion,
    logout
  };
}

export default useFinance;