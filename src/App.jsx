import { useState } from 'react';
import TransactionForm from './components/TransactionForm';
import { FaWallet, FaPlus, FaCheckCircle, FaRegClock, FaTrash } from 'react-icons/fa';

function App() {
  // Estado inicial de tus fondos (Bolsas)
  const [funds, setFunds] = useState([
    { id: 1, name: "Nómina Mensual", balance: 0 },
    { id: 2, name: "Aguinaldo", balance: 0 },
    { id: 3, name: "Fondo de Ahorro", balance: 0 },
  ]);

  const [transactions, setTransactions] = useState([]);
  
  // Estados para crear un fondo nuevo
  const [showAddFund, setShowAddFund] = useState(false);
  const [newFundName, setNewFundName] = useState("");
  const [newFundAmount, setNewFundAmount] = useState("");

  // Crear Fondo Nuevo
  const handleCreateFund = (e) => {
    e.preventDefault();
    if (!newFundName) return;
    const newFund = {
      id: Date.now(),
      name: newFundName,
      balance: Number(newFundAmount) || 0
    };
    setFunds([...funds, newFund]);
    setNewFundName("");
    setNewFundAmount("");
    setShowAddFund(false);
  };

  // Agregar Transacción
  const addTransaction = (transaction) => {
    setTransactions([transaction, ...transactions]);

    // Actualizar el saldo del fondo correspondiente
    // NOTA: Restamos el dinero AUNQUE esté "pendiente", para que no gastes dinero que ya comprometiste.
    const updatedFunds = funds.map(fund => {
      if (fund.id === Number(transaction.fundId)) {
        const newBalance = transaction.type === 'income' 
          ? fund.balance + transaction.amount 
          : fund.balance - transaction.amount;
        return { ...fund, balance: newBalance };
      }
      return fund;
    });
    setFunds(updatedFunds);
  };

  const totalBalance = funds.reduce((acc, fund) => acc + fund.balance, 0);

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-10 font-sans">
      <div className="max-w-5xl mx-auto">
        
        {/* Header */}
        <h1 className="text-3xl font-bold text-slate-800 mb-6 flex items-center gap-2">
          <FaWallet className="text-blue-600"/> Control de Finanzas
        </h1>

        {/* --- SECCIÓN DE FONDOS (BOLSAS) --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          
          {/* Tarjeta Principal (Total) */}
          <div className="bg-slate-900 text-white p-6 rounded-xl shadow-lg md:col-span-3 flex justify-between items-center relative overflow-hidden">
            <div className="z-10">
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Saldo Total Disponible</p>
              <h2 className="text-5xl font-bold mt-1">${totalBalance.toLocaleString()}</h2>
            </div>
            <button 
              onClick={() => setShowAddFund(!showAddFund)}
              className="z-10 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition-all shadow-lg"
            >
              <FaPlus /> Nueva Bolsa
            </button>
            {/* Decoración de fondo */}
            <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-blue-900 to-transparent opacity-30"></div>
          </div>

          {/* Formulario Crear Fondo (Toggle) */}
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

          {/* Tarjetas de cada Fondo */}
          {funds.map(fund => (
            <div key={fund.id} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <h3 className="text-gray-500 font-bold text-xs uppercase mb-1">{fund.name}</h3>
              <p className={`text-2xl font-bold ${fund.balance < 0 ? 'text-red-500' : 'text-slate-800'}`}>
                ${fund.balance.toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        {/* --- CONTENIDO PRINCIPAL --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Columna Izquierda: Formulario (4 columnas) */}
          <div className="lg:col-span-4">
            <h3 className="font-bold text-slate-700 mb-3 text-lg">Registrar Movimiento</h3>
            <TransactionForm onAdd={addTransaction} funds={funds} />
          </div>

          {/* Columna Derecha: Historial (8 columnas) */}
          <div className="lg:col-span-8">
            <h3 className="font-bold text-slate-700 mb-3 text-lg">Historial de Movimientos</h3>
            
            <div className="space-y-3">
              {transactions.length === 0 && (
                <div className="text-center py-10 bg-white rounded-lg border border-dashed border-gray-300">
                  <p className="text-gray-400">Aún no hay registros en este mes.</p>
                </div>
              )}

              {transactions.map((t) => {
                const fundName = funds.find(f => f.id === Number(t.fundId))?.name || "Desconocido";
                
                return (
                  <div key={t.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center group hover:bg-gray-50 transition">
                    
                    <div className="flex items-center gap-4">
                      {/* Icono de Estado (Check o Reloj) */}
                      <div className={`p-3 rounded-full ${t.isExecuted ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`} title={t.isExecuted ? "Aplicado en Banco" : "Pendiente"}>
                        {t.isExecuted ? <FaCheckCircle /> : <FaRegClock />}
                      </div>

                      <div>
                        <p className="font-bold text-slate-800 text-lg">{t.description}</p>
                        <div className="flex gap-2 text-xs text-gray-500">
                          <span>📅 {t.date}</span>
                          <span>•</span>
                          <span className="font-bold text-blue-500">{fundName}</span>
                          <span>•</span>
                          <span>{t.category}</span>
                        </div>
                        {!t.isExecuted && (
                          <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded mt-1 inline-block font-bold">
                            Pendiente en Banco
                          </span>
                        )}
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