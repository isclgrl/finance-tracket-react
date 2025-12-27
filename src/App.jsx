import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Login from './components/Login';
import TransactionForm from './components/TransactionForm';
import AddMoneyModal from './components/AddMoneyModal';
import { FaWallet, FaPlus, FaCheckCircle, FaRegClock, FaSignOutAlt, FaArchive, FaPlusCircle, FaCalendarAlt, FaPlay } from 'react-icons/fa';

function App() {
  const [session, setSession] = useState(null);
  const [funds, setFunds] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPeriod, setCurrentPeriod] = useState(null);

  // Estados visuales
  const [showAddFund, setShowAddFund] = useState(false);
  const [newFundName, setNewFundName] = useState("");
  const [newFundAmount, setNewFundAmount] = useState("");
  const [selectedFundToTopUp, setSelectedFundToTopUp] = useState(null); 

  // --- SESIÓN ---
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

  // --- INICIALIZACIÓN DE DATOS ---
  const initData = async (userId) => {
    try {
      // 1. Buscamos el periodo activo
      const { data: periodData, error: periodError } = await supabase
        .from('periods')
        .select('*')
        .eq('is_active', true)
        .eq('user_id', userId)
        .maybeSingle();
      
      if (periodError) throw periodError;

      // CAMBIO IMPORTANTE: Si no hay periodo, NO creamos nada automático.
      setCurrentPeriod(periodData || null);

      // Si existe un periodo activo, cargamos sus datos. Si no, todo se queda vacío.
      if (periodData) {
        fetchTransactionsAndFunds(periodData.id);
      } else {
        setFunds([]);
        setTransactions([]);
      }

    } catch (error) { console.error("Error init:", error); }
  };

  const fetchTransactionsAndFunds = async (periodId) => {
    // 1. Fondos
    const { data: fundsData } = await supabase.from('funds').select('*').order('id', { ascending: true });
    setFunds(fundsData || []);
    // 2. Transacciones
    const { data: transData } = await supabase.from('transactions').select('*').eq('period_id', periodId).order('date', { ascending: false });
    setTransactions(transData || []);
  };

  // --- NUEVA FUNCIÓN: INICIAR PRIMER PERIODO ---
  const handleStartPeriod = async () => {
    const name = window.prompt("¡Bienvenido! 👋\n\nPara comenzar, asigna un nombre a este periodo:", "Ej. Marzo 2025");
    if (!name) return;

    try {
      const { data: newPeriod, error } = await supabase
        .from('periods')
        .insert([{ name: name, is_active: true, user_id: session.user.id }])
        .select()
        .single();

      if (error) throw error;

      setCurrentPeriod(newPeriod);
      alert(`¡Periodo "${name}" creado! Ahora agrega tus bolsas de dinero.`);
    } catch (error) { alert(error.message); }
  };

  // --- FUNCIÓN: CERRAR PERIODO ACTUAL ---
  const handleClosePeriod = async () => {
    const nextPeriodName = window.prompt("Cerrarás el periodo actual. \n\n¿Cómo se llamará el NUEVO periodo?", "Ej. Abril 2025");
    if (!nextPeriodName) return;

    try {
      // 1. Desactivar actual
      if (currentPeriod) {
        await supabase.from('periods').update({ is_active: false }).eq('id', currentPeriod.id);
      }
      // 2. Crear nuevo
      const { data: newPeriod, error } = await supabase
        .from('periods')
        .insert([{ name: nextPeriodName, is_active: true, user_id: session.user.id }])
        .select()
        .single();

      if (error) throw error;

      setCurrentPeriod(newPeriod);
      setTransactions([]); // Limpiamos visualmente los gastos
      alert(`¡Cambio de periodo exitoso! Bienvenido a: ${nextPeriodName}`);

    } catch (error) { alert("Error al cerrar: " + error.message); }
  };

  // --- CREAR FONDO (Protegido) ---
  const handleCreateFund = async (e) => {
    e.preventDefault();
    if (!currentPeriod) return alert("Primero debes iniciar un periodo.");
    if (!newFundName) return;
    try {
      const { data, error } = await supabase.from('funds').insert([{ name: newFundName, balance: Number(newFundAmount) || 0, user_id: session.user.id }]).select();
      if (error) throw error;
      setFunds([...funds, data[0]]); setNewFundName(""); setNewFundAmount(""); setShowAddFund(false);
    } catch (error) { alert(error.message); }
  };

  // --- AGREGAR TRANSACCIÓN (Protegido) ---
  const addTransaction = async (transactionLocal) => {
    if (!currentPeriod) return alert("No hay periodo activo");
    try {
      const { data: transData, error: transError } = await supabase.from('transactions').insert([{
            description: transactionLocal.description, amount: transactionLocal.amount, category: transactionLocal.category, type: transactionLocal.type, fund_id: transactionLocal.fundId, is_executed: transactionLocal.isExecuted, date: new Date().toISOString(), user_id: session.user.id, period_id: currentPeriod.id 
          }]).select();
      if (transError) throw transError;
      
      const fund = funds.find(f => f.id === transactionLocal.fundId);
      if (fund) {
        const newBalance = transactionLocal.type === 'income' ? fund.balance + transactionLocal.amount : fund.balance - transactionLocal.amount;
        await supabase.from('funds').update({ balance: newBalance }).eq('id', transactionLocal.fundId);
        setTransactions([transData[0], ...transactions]);
        setFunds(funds.map(f => f.id === transactionLocal.fundId ? { ...f, balance: newBalance } : f));
      }
    } catch (error) { alert("Error: " + error.message); }
  };

  const handleTopUpConfirm = (amount) => {
    if (!selectedFundToTopUp) return;
    addTransaction({ description: "Recarga Manual 💵", amount: amount, category: "Ahorro/Ingreso", type: "income", fundId: selectedFundToTopUp.id, isExecuted: true });
    setSelectedFundToTopUp(null);
  };

  if (loading) return <div>Cargando...</div>;
  if (!session) return <Login />;

  const totalBalance = funds.reduce((acc, fund) => acc + fund.balance, 0);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-10 font-sans relative">
      {selectedFundToTopUp && <AddMoneyModal fund={selectedFundToTopUp} onClose={() => setSelectedFundToTopUp(null)} onConfirm={handleTopUpConfirm} />}
      
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
              <FaWallet className="text-blue-600"/> Mis Finanzas
            </h1>
            {currentPeriod ? (
              <div className="flex items-center gap-2 text-gray-500 mt-1 ml-1 animate-fade-in">
                <FaCalendarAlt className="text-blue-400" />
                <span className="text-sm font-bold uppercase tracking-wider border-b-2 border-blue-200">{currentPeriod.name}</span>
              </div>
            ) : (
              <div className="text-red-400 text-xs font-bold mt-1 ml-1">🔴 Sin periodo activo</div>
            )}
          </div>
          
          <div className="flex items-center gap-3">
            {/* LÓGICA DEL BOTÓN PRINCIPAL: INICIAR O CERRAR */}
            {!currentPeriod ? (
              <button 
                onClick={handleStartPeriod} 
                className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-700 shadow-lg animate-bounce"
              >
                <FaPlay /> Iniciar Quincena
              </button>
            ) : (
              <button 
                onClick={handleClosePeriod} 
                className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-200 transition"
              >
                <FaArchive /> Cerrar Periodo
              </button>
            )}

            <button onClick={() => supabase.auth.signOut()} className="text-red-500 px-3 py-2 rounded-lg border border-red-200 text-sm font-bold hover:bg-red-50 transition">
              <FaSignOutAlt /> Salir
            </button>
          </div>
        </div>

        {/* FONDOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg md:col-span-3 flex justify-between items-center">
            <div><p className="text-gray-400 text-sm font-medium uppercase">Patrimonio Total</p><h2 className="text-5xl font-bold mt-1">${totalBalance.toLocaleString()}</h2></div>
            
            {/* BOTÓN NUEVA BOLSA (Solo si hay periodo) */}
            {currentPeriod && (
              <button onClick={() => setShowAddFund(!showAddFund)} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition">
                <FaPlus /> Nueva Bolsa
              </button>
            )}
          </div>

          {showAddFund && currentPeriod && (
            <form onSubmit={handleCreateFund} className="bg-white p-4 rounded-lg shadow md:col-span-3 flex gap-3 items-end animate-pulse">
              <input type="text" placeholder="Nombre" className="border p-2 rounded w-full" autoFocus value={newFundName} onChange={e => setNewFundName(e.target.value)}/>
              <input type="number" placeholder="Monto" className="border p-2 rounded w-full" value={newFundAmount} onChange={e => setNewFundAmount(e.target.value)}/>
              <button className="bg-green-600 text-white p-2 rounded font-bold">Guardar</button>
            </form>
          )}

          {funds.map(fund => (
            <div key={fund.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all relative group">
              <div className="flex justify-between items-start">
                <div><h3 className="text-gray-500 font-bold text-xs uppercase mb-1">{fund.name}</h3><p className={`text-2xl font-bold ${fund.balance < 0 ? 'text-red-500' : 'text-slate-800'}`}>${Number(fund.balance).toLocaleString()}</p></div>
                {currentPeriod && (
                  <button onClick={() => setSelectedFundToTopUp(fund)} className="bg-green-100 text-green-600 p-2 rounded-full hover:bg-green-200 transition"><FaPlusCircle /></button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* TRANSACCIONES */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <h3 className="font-bold text-slate-700 mb-3 text-lg">Registrar Movimiento</h3>
            {/* BLOQUEO DE FORMULARIO SI NO HAY PERIODO */}
            {!currentPeriod ? (
              <div className="bg-gray-100 p-6 rounded-lg text-gray-500 text-center border-2 border-dashed border-gray-300">
                <p className="mb-2 text-2xl">🛑</p>
                <p className="font-bold text-sm">Sistema en Pausa</p>
                <p className="text-xs mt-1">Debes iniciar un periodo arriba para comenzar a registrar operaciones.</p>
              </div>
            ) : funds.length > 0 ? (
              <TransactionForm onAdd={addTransaction} funds={funds} />
            ) : (
              <div className="bg-yellow-50 p-4 rounded text-yellow-700 text-sm">
                ¡Periodo activo! 🎉 <br/>Ahora crea una bolsa (fondo) para empezar.
              </div>
            )}
          </div>

          <div className="lg:col-span-8">
            <h3 className="font-bold text-slate-700 mb-3 text-lg">
              Movimientos {currentPeriod ? `- ${currentPeriod.name}` : ""}
            </h3>
            <div className="space-y-3">
              {transactions.length === 0 && <p className="text-gray-400 text-center py-10">Sin movimientos.</p>}
              {transactions.map((t) => (
                <div key={t.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className={`p-3 rounded-full ${t.is_executed ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                      {t.is_executed ? <FaCheckCircle /> : <FaRegClock />}
                    </div>
                    <div>
                      <p className="font-bold text-slate-800">{t.description}</p>
                      <div className="flex gap-2 text-xs text-gray-500">
                        <span>{new Date(t.date).toLocaleDateString()}</span> • <span className="text-blue-500 font-bold">{funds.find(f => f.id === t.fund_id)?.name}</span>
                      </div>
                    </div>
                  </div>
                  <span className={`font-bold text-xl ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>{t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;