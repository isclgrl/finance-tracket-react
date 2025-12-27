import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

const useFinance = () => {
  const [session, setSession] = useState(null);
  const [funds, setFunds] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [currentPeriod, setCurrentPeriod] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) initData(session.user.id);
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) initData(session.user.id);
      else { setFunds([]); setTransactions([]); setCurrentPeriod(null); }
    });
    return () => subscription.unsubscribe();
  }, []);

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

  const toggleFundStatus = async (fundId, currentStatus) => {
    try {
      const newStatus = !currentStatus;

      const { error } = await supabase
        .from('funds')
        .update({ is_active: newStatus })
        .eq('id', fundId);

      if (error) throw error;

      setFunds(funds.map(f => f.id === fundId ? { ...f, is_active: newStatus } : f));

    } catch (error) { alert("Error al actualizar: " + error.message); }
  };

  const startPeriod = async (name) => {
    try {
      const { data, error } = await supabase.from('periods').insert([{ name, is_active: true, user_id: session.user.id }]).select().single();
      if (error) throw error; setCurrentPeriod(data); return { success: true };
    } catch (error) { return { success: false, error: error.message }; }
  };

  const closePeriod = async (nextName) => {
    try {
      if (currentPeriod) await supabase.from('periods').update({ is_active: false }).eq('id', currentPeriod.id);
      const { data, error } = await supabase.from('periods').insert([{ name: nextName, is_active: true, user_id: session.user.id }]).select().single();
      if (error) throw error; setCurrentPeriod(data); setTransactions([]); return { success: true };
    } catch (error) { return { success: false, error: error.message }; }
  };

  const createFund = async (name, initialAmount) => {
    if (!currentPeriod) return;
    try {
      const { data, error } = await supabase.from('funds').insert([{ name, balance: Number(initialAmount) || 0, user_id: session.user.id }]).select();
      if (error) throw error; setFunds([...funds, data[0]]); return { success: true };
    } catch (error) { return { success: false, error: error.message }; }
  };

  const addTransaction = async (tx) => {
    if (!currentPeriod) return;
    try {
      const { data: transData, error: transError } = await supabase.from('transactions').insert([{
        description: tx.description, amount: tx.amount, category: tx.category, type: tx.type, fund_id: tx.fundId, is_executed: tx.isExecuted, date: new Date().toISOString(), user_id: session.user.id, period_id: currentPeriod.id
      }]).select();
      if (transError) throw transError;
      const fund = funds.find(f => f.id === tx.fundId);
      if (fund) {
        const newBalance = tx.type === 'income' ? fund.balance + tx.amount : fund.balance - tx.amount;
        await supabase.from('funds').update({ balance: newBalance }).eq('id', tx.fundId);
        setTransactions([transData[0], ...transactions]);
        setFunds(funds.map(f => f.id === tx.fundId ? { ...f, balance: newBalance } : f));
      } return { success: true };
    } catch (error) { return { success: false, error: error.message }; }
  };

  const updateTransaction = async (oldTx, newData) => {
    if (!currentPeriod) return;

    try {
      const amountChanged = oldTx.amount !== newData.amount;
      const typeChanged = oldTx.type !== newData.type;
      const fundChanged = oldTx.fund_id !== newData.fundId;

      if (amountChanged || typeChanged || fundChanged) {
        const oldFund = funds.find(f => f.id === oldTx.fund_id);
        if (oldFund) {
          let restoredBalance = oldFund.balance;
          if (oldTx.type === 'income') restoredBalance -= oldTx.amount;
          else restoredBalance += oldTx.amount;

          if (fundChanged) {
            await supabase.from('funds').update({ balance: restoredBalance }).eq('id', oldFund.id);
          } else {
            
            oldFund.balance = restoredBalance; 
          }
        }

        const targetFundId = Number(newData.fundId);
        
        const targetFund = funds.find(f => f.id === targetFundId);
        
        if (targetFund) {
          let finalBalance = targetFund.balance;
          if (newData.type === 'income') finalBalance += Number(newData.amount);
          else finalBalance -= Number(newData.amount);

          await supabase.from('funds').update({ balance: finalBalance }).eq('id', targetFundId);
        }
      }

      const { error } = await supabase
        .from('transactions')
        .update({
          description: newData.description,
          amount: Number(newData.amount),
          category: newData.category,
          type: newData.type,
          fund_id: Number(newData.fundId),
          is_executed: newData.isExecuted
        })
        .eq('id', oldTx.id);

      if (error) throw error;

      await fetchTransactionsAndFunds(currentPeriod.id);
      return { success: true };

    } catch (error) {
      console.error(error);
      return { success: false, error: error.message };
    }
  };

  const logout = () => supabase.auth.signOut();

  return {
    session, loading, funds, transactions, currentPeriod,
    startPeriod, closePeriod, createFund, addTransaction, logout,
    toggleFundStatus, updateTransaction
  };
};

export default useFinance;