import { useState, useEffect } from 'react';
import { supabase } from './supabaseClient';
import Login from './components/Login';
import TransactionForm from './components/TransactionForm';
import { FaWallet, FaPlus, FaCheckCircle, FaRegClock, FaSignOutAlt, FaTrash } from 'react-icons/fa';

function App() {
  const [session, setSession] = useState(null);
  const [funds, setFunds] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Estados para formularios
  const [showAddFund, setShowAddFund] = useState(false);
  const [newFundName, setNewFundName] = useState("");
  const [newFundAmount, setNewFundAmount] = useState("");

  // 1. GESTIÓN DE SESIÓN (Login/Logout)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) fetchData(); // Si hay usuario, cargamos sus datos
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) fetchData();
      else {
        setFunds([]);
        setTransactions([]);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. FUNCIÓN PARA LEER DATOS DE SUPABASE (SELECT)
  const fetchData = async () => {
    try {
      // Pedimos los fondos
      const { data: fundsData, error: fundsError } = await supabase
        .from('funds')
        .select('*')
        .order('id', { ascending: true });

      if (fundsError) throw fundsError;
      setFunds(fundsData || []);

      // Pedimos las transacciones
      const { data: transData, error: transError } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false }); // Las más nuevas primero

      if (transError) throw transError;
      setTransactions(transData || []);

    } catch (error) {
      console.error('Error cargando datos:', error.message);
    }
  };

  // 3. CREAR NUEVO FONDO (INSERT)
  const handleCreateFund = async (e) => {
    e.preventDefault();
    if (!newFundName) return;

    try {
      const { data, error } = await supabase
        .from('funds')
        .insert([
          { 
            name: newFundName, 
            balance: Number(newFundAmount) || 0,
            user_id: session.user.id 
          }
        ])
        .select();

      if (error) throw error;
      
      // Actualizamos la pantalla agregando el nuevo fondo a la lista
      setFunds([...funds, data[0]]);
      setNewFundName("");
      setNewFundAmount("");
      setShowAddFund(false);

    } catch (error) {
      alert('Error creando fondo: ' + error.message);
    }
  };

  // 4. REGISTRAR MOVIMIENTO (INSERT + UPDATE)
  const addTransaction = async (transactionLocal) => {
    try {
      // A) Insertar la transacción en la tabla 'transactions'
      const { data: transData, error: transError } = await supabase
        .from('transactions')
        .insert([
          {
            description: transactionLocal.description,
            amount: transactionLocal.amount,
            category: transactionLocal.category,
            type: transactionLocal.type,
            fund_id: transactionLocal.fundId,
            is_executed: transactionLocal.isExecuted,
            date: new Date().toISOString(), // Usamos formato ISO para la BD
            user_id: session.user.id
          }
        ])
        .select();

      if (transError) throw transError;

      // B) Actualizar el saldo del fondo en la tabla 'funds'
      // Primero calculamos el nuevo saldo
      const fund = funds.find(f => f.id === transactionLocal.fundId);
      if (fund) {
        const newBalance = transactionLocal.type === 'income' 
          ? fund.balance + transactionLocal.amount 
          : fund.balance - transactionLocal.amount;

        const { error: fundError } = await supabase
          .from('funds')
          .update({ balance: newBalance })
          .eq('id', transactionLocal.fundId);

        if (fundError) throw fundError;

        // C) Actualizar estado local (para que se vea instantáneo sin recargar)
        setTransactions([transData[0], ...transactions]);
        const updatedFunds = funds.map(f => 
          f.id === transactionLocal.fundId ? { ...f, balance: newBalance } : f
        );
        setFunds(updatedFunds);
      }

    } catch (error) {
      console.error("Error en transacción:", error);
      alert("Error guardando: " + error.message);
    }
  };

  // --- RENDERIZADO ---

  if (loading) return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
  if (!session) return <Login />;

  const totalBalance = funds.reduce((acc, fund) => acc + fund.balance, 0);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header con Logout */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
            <FaWallet className="text-blue-600"/> Mis Finanzas
          </h1>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-500 hidden md:block">{session.user.email}</span>
            <button 
              onClick={() => supabase.auth.signOut()}
              className="text-red-500 hover:text-red-700 flex items-center gap-2 text-sm font-bold border border-red-200 px-3 py-1 rounded-full hover:bg-red-50 transition"
            >
              <FaSignOutAlt /> Salir
            </button>
          </div>
        </div>

        {/* --- SECCIÓN DE FONDOS --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          
          <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg md:col-span-3 flex justify-between items-center relative overflow-hidden">
            <div className="z-10">
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Patrimonio Total</p>
              <h2 className="text-5xl font-bold mt-1">${totalBalance.toLocaleString()}</h2>
            </div>
            <button 
              onClick={() => setShowAddFund(!showAddFund)}
              className="z-10 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-lg"
            >
              <FaPlus /> Nueva Bolsa
            </button>
          </div>

          {/* Formulario Crear Fondo */}
          {showAddFund && (
            <form onSubmit={handleCreateFund} className="bg-white p-4 rounded-lg shadow md:col-span-3 flex gap-3 items-end border border-blue-100 animate-pulse">
              <div className="flex-1">
                <label className="text-xs font-bold text-gray-500">Nombre (ej. Bono)</label>
                <input 
                  type="text" className="border p-2 rounded w-full text-sm" autoFocus
                  value={newFundName} onChange={e => setNewFundName(e.target.value)}
                />
              </div>
              <div className="w-32">
                <label className="text-xs font-bold text-gray-500">Monto Inicial</label>
                <input 
                  type="number" className="border p-2 rounded w-full text-sm"
                  value={newFundAmount} onChange={e => setNewFundAmount(e.target.value)}
                />
              </div>
              <button className="bg-green-600 text-white p-2 rounded h-10 px-6 font-bold text-sm">Guardar</button>
            </form>
          )}

          {/* Lista de Fondos (Desde DB) */}
          {funds.length === 0 && !showAddFund && (
             <div className="col-span-3 text-center py-4 text-gray-400 bg-white rounded-lg border border-dashed">
                ¡Empieza creando una Bolsa (Fondo) arriba! 👆
             </div>
          )}

          {funds.map(fund => (
            <div key={fund.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-gray-500 font-bold text-xs uppercase mb-1">{fund.name}</h3>
              <p className={`text-2xl font-bold ${fund.balance < 0 ? 'text-red-500' : 'text-slate-800'}`}>
                ${Number(fund.balance).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* --- CONTENIDO PRINCIPAL --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          <div className="lg:col-span-4">
            <h3 className="font-bold text-slate-700 mb-3 text-lg">Registrar Movimiento</h3>
            {/* Validamos que haya fondos antes de dejar registrar */}
            {funds.length > 0 ? (
              <TransactionForm onAdd={addTransaction} funds={funds} />
            ) : (
              <div className="bg-yellow-50 p-4 rounded text-yellow-700 text-sm">
                Primero crea un fondo para poder registrar gastos.
              </div>
            )}
          </div>

          <div className="lg:col-span-8">
            <h3 className="font-bold text-slate-700 mb-3 text-lg">Historial de Movimientos</h3>
            
            <div className="space-y-3">
              {transactions.length === 0 && (
                <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-400">Sin movimientos.</p>
                </div>
              )}

              {transactions.map((t) => {
                const fundName = funds.find(f => f.id === t.fund_id)?.name || "Fondo Borrado"; // Nota: en DB usamos snake_case (fund_id)
                const dateObj = new Date(t.date);
                
                return (
                  <div key={t.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center group hover:bg-gray-50 transition">
                    <div className="flex items-center gap-4">
                      <div className={`p-3 rounded-full ${t.is_executed ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                        {t.is_executed ? <FaCheckCircle /> : <FaRegClock />}
                      </div>

                      <div>
                        <p className="font-bold text-slate-800 text-lg">{t.description}</p>
                        <div className="flex gap-2 text-xs text-gray-500">
                          <span>📅 {dateObj.toLocaleDateString()}</span>
                          <span>•</span>
                          <span className="font-bold text-blue-500">{fundName}</span>
                          <span>•</span>
                          <span>{t.category}</span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className={`block font-bold text-xl ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                        {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;