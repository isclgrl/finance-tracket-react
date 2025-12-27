import { FaPlus, FaPlusCircle } from 'react-icons/fa';

const FundSection = ({ 
  funds, 
  currentPeriod, 
  showAddFund, 
  setShowAddFund, 
  newFundName, 
  setNewFundName, 
  newFundAmount, 
  setNewFundAmount, 
  onCreateFund, 
  onTopUp,
  toggleFundStatus // Recibimos la nueva función
}) => {
  
  // Cálculo basado en la propiedad is_active
  const totalBalance = funds.reduce((acc, fund) => {
    if (!fund.is_active) return acc; // Si está desactivada en DB, no suma
    return acc + fund.balance;
  }, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
      {/* TARJETA TOTAL */}
      <div className="bg-slate-500 text-white p-6 rounded-xl shadow-lg md:col-span-3 flex justify-between items-center">
        <div>
          <p className="text-gray-300 text-sm font-medium uppercase">Fondo Total (Activos)</p>
          <h5 className="text-2xl font-bold mt-1">${totalBalance.toLocaleString()}</h5>
        </div>
        {currentPeriod && (
          <button onClick={() => setShowAddFund(!showAddFund)} className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-full text-sm font-bold flex items-center gap-2 transition">
            <FaPlus /> Nueva Bolsa
          </button>
        )}
      </div>

      {/* FORMULARIO */}
      {showAddFund && currentPeriod && (
        <form onSubmit={onCreateFund} className="bg-white p-4 rounded-lg shadow md:col-span-3 flex gap-3 items-end animate-pulse">
          <input type="text" placeholder="Nombre" className="border p-2 rounded w-full" autoFocus value={newFundName} onChange={e => setNewFundName(e.target.value)}/>
          <input type="number" placeholder="Monto" className="border p-2 rounded w-full" value={newFundAmount} onChange={e => setNewFundAmount(e.target.value)}/>
          <button className="bg-green-600 text-white p-2 rounded font-bold">Guardar</button>
        </form>
      )}

      {/* LISTA DE BOLSAS */}
      {funds.map(fund => {
        // Usamos el dato directo de la DB
        const isIncluded = fund.is_active;

        return (
          <div key={fund.id} className={`p-5 rounded-xl shadow-sm border transition-all relative group ${isIncluded ? 'bg-white border-gray-100' : 'bg-gray-50 border-gray-200 opacity-75'}`}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  {/* Checkbox llama a la función de DB */}
                  <input 
                    type="checkbox" 
                    checked={isIncluded} 
                    onChange={() => toggleFundStatus(fund.id, isIncluded)}
                    className="w-4 h-4 text-blue-600 rounded cursor-pointer"
                  />
                  <h3 className="text-gray-500 font-bold text-xs uppercase cursor-pointer" onClick={() => toggleFundStatus(fund.id, isIncluded)}>
                    {fund.name}
                  </h3>
                </div>

                <p className={`text-2xl font-bold ${fund.balance < 0 ? 'text-red-500' : 'text-slate-800'}`}>
                  ${Number(fund.balance).toLocaleString()}
                </p>
                {!isIncluded && <span className="text-[10px] text-gray-400 font-medium bg-gray-200 px-2 py-0.5 rounded-full">No suma al total</span>}
              </div>
              
              {currentPeriod && (
                <button onClick={() => onTopUp(fund)} className="bg-green-100 text-green-600 p-2 rounded-full hover:bg-green-200 transition">
                  <FaPlusCircle />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default FundSection;