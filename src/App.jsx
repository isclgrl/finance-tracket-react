import { useState } from 'react';
// import { useFinance } from './hooks/useFinance'; // <--- Importamos el cerebro
import useFinance from './hook/useFinance';
import Login from './components/Login';
import TransactionForm from './components/TransactionForm';
import AddMoneyModal from './components/AddMoneyModal';
import Header from './components/Header';
import FundSection from './components/FundSection';
import TransactionList from './components/TransactionList';

const App = () => {
  const [showAddFund, setShowAddFund] = useState(false);
  const [newFundName, setNewFundName] = useState("");
  const [newFundAmount, setNewFundAmount] = useState("");
  const [selectedFundToTopUp, setSelectedFundToTopUp] = useState(null); 

  const { 
    session, loading, funds, transactions, currentPeriod, 
    startPeriod, closePeriod, createFund, addTransaction, logout,
    toggleFundStatus
  } = useFinance();

  const activeFundsForSpending = funds.filter(fund => fund.is_active);

  const handleStart = async () => {
    const name = window.prompt("Nombre del periodo:", "Ej. Marzo 2025");
    if (name) {
        const res = await startPeriod(name);
        if (res.success) alert(`¡Periodo "${name}" creado!`);
        else alert(res.error);
    }
  };

  const handleClose = async () => {
    const nextName = window.prompt("Nombre del NUEVO periodo:", "Ej. Abril 2025");
    if (nextName) {
        const res = await closePeriod(nextName);
        if (res.success) alert(`¡Bienvenido a: ${nextName}`);
        else alert(res.error);
    }
  };

  const handleCreateFundUI = async (e) => {
    e.preventDefault();
    const res = await createFund(newFundName, newFundAmount);
    if (res.success) {
      setNewFundName(""); setNewFundAmount(""); setShowAddFund(false);
    } else {
      alert(res.error);
    }
  };

  const handleTopUpConfirm = (amount) => {
    if (selectedFundToTopUp) {
      addTransaction({
        description: "Recarga de Fondos 💵", amount, category: "Ahorro/Ingreso",
        type: "income", fundId: selectedFundToTopUp.id, isExecuted: true
      });
      setSelectedFundToTopUp(null);
    }
  };

  if (loading) return <div>Cargando...</div>;
  if (!session) return <Login />;

  return (
    <div className="min-h-screen bg-gray-100 p-4 md:p-10 font-sans relative">
      
      {selectedFundToTopUp && (
        <AddMoneyModal 
          fund={selectedFundToTopUp} 
          onClose={() => setSelectedFundToTopUp(null)} 
          onConfirm={handleTopUpConfirm} 
        />
      )}

      <div className="max-w-5xl mx-auto">
        <Header 
          currentPeriod={currentPeriod}
          onStart={handleStart}
          onClose={handleClose}
          onLogout={logout}
        />

        <FundSection 
          funds={funds}
          toggleFundStatus={toggleFundStatus}
          currentPeriod={currentPeriod}
          showAddFund={showAddFund}
          setShowAddFund={setShowAddFund}
          newFundName={newFundName}
          setNewFundName={setNewFundName}
          newFundAmount={newFundAmount}
          setNewFundAmount={setNewFundAmount}
          onCreateFund={handleCreateFundUI}
          onTopUp={setSelectedFundToTopUp}
        />

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-4">
            <h3 className="font-bold text-slate-700 mb-3 text-lg">Registrar Movimiento</h3>
            {!currentPeriod ? (
              <div className="bg-gray-100 p-6 rounded-lg text-gray-500 text-center border-2 border-dashed border-gray-300">
                <p className="mb-2 text-2xl">🛑</p><p className="font-bold text-sm">Sistema en Pausa</p>
              </div>
            ) : funds.length > 0 ? (
              <TransactionForm
                onAdd={addTransaction} 
                funds={activeFundsForSpending}
              />
            ) : (
              <div className="bg-yellow-50 p-4 rounded text-yellow-700 text-sm">Crea una bolsa primero.</div>
            )}
          </div>

          <TransactionList transactions={transactions} funds={funds} currentPeriod={currentPeriod} />
        </div>
      </div>
    </div>
  );
}

export default App;