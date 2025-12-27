import { useState } from 'react';
import { FaPlusCircle, FaCheckCircle, FaRegClock } from 'react-icons/fa';

function TransactionForm({ onAdd, funds }) {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("Efectivo"); 
  const [type, setType] = useState("expense"); 
  
  // NUEVOS CAMPOS
  const [selectedFund, setSelectedFund] = useState(""); // ¿De qué bolsa sale?
  const [isExecuted, setIsExecuted] = useState(true); // ¿Ya se aplicó en el banco?

  const handleSubmit = (e) => {
    e.preventDefault();
    // Validamos que haya descripción, monto y un fondo seleccionado
    if (!description || !amount || !selectedFund) {
      alert("Por favor llena todos los campos y selecciona un Fondo.");
      return;
    }

    onAdd({
      id: Date.now(),
      description,
      amount: +amount,
      category,
      type,
      fundId: Number(selectedFund), // Guardamos el ID del fondo
      isExecuted, // Guardamos si ya se aplicó
      date: new Date().toLocaleDateString()
    });

    // Limpiar campos
    setDescription("");
    setAmount("");
    setIsExecuted(true);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md mb-6 border border-gray-100">
      
      {/* Botones Gasto / Ingreso */}
      <div className="flex gap-4 mb-4">
        <button
          type="button"
          onClick={() => setType("expense")}
          className={`flex-1 py-2 rounded-md font-bold transition-colors ${type === 'expense' ? 'bg-red-100 text-red-600 border border-red-200' : 'bg-gray-100 text-gray-400'}`}
        >
          Gasto 📉
        </button>
        <button
          type="button"
          onClick={() => setType("income")}
          className={`flex-1 py-2 rounded-md font-bold transition-colors ${type === 'income' ? 'bg-green-100 text-green-600 border border-green-200' : 'bg-gray-100 text-gray-400'}`}
        >
          Ingreso 📈
        </button>
      </div>

      <div className="space-y-3">
        {/* Descripción y Monto */}
        <div className="grid grid-cols-2 gap-3">
          <input
            type="text" placeholder="Concepto (ej. Netflix)" className="border p-2 rounded w-full"
            value={description} onChange={(e) => setDescription(e.target.value)}
          />
          <input
            type="number" placeholder="$0.00" className="border p-2 rounded w-full"
            value={amount} onChange={(e) => setAmount(e.target.value)}
          />
        </div>

        {/* Selección de Fondo (Nómina, Aguinaldo, etc) */}
        <div>
          <label className="text-xs font-bold text-gray-500 mb-1 block">¿De qué fondo?</label>
          <select
            className="border p-2 rounded w-full bg-white"
            value={selectedFund}
            onChange={(e) => setSelectedFund(e.target.value)}
          >
            <option value="">-- Selecciona un Fondo --</option>
            {funds.map(fund => (
              <option key={fund.id} value={fund.id}>
                {fund.name} (Saldo: ${fund.balance})
              </option>
            ))}
          </select>
        </div>

        {/* Método de Pago */}
        <select
          className="border p-2 rounded w-full bg-white"
          value={category}
          onChange={(e) => setCategory(e.target.value)}
        >
          <option value="Efectivo">💵 Efectivo</option>
          <option value="Tarjeta BBVA">💳 Tarjeta BBVA</option>
          <option value="Tarjeta Nu">🟣 Tarjeta Nu</option>
          <option value="Transferencia">📲 Transferencia</option>
        </select>

        {/* Checkbox: ¿Ya se aplicó en el banco? */}
        <div 
          className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${isExecuted ? 'bg-blue-50 border-blue-200' : 'bg-gray-50 border-gray-200'}`}
          onClick={() => setIsExecuted(!isExecuted)}
        >
          <div className={`text-xl ${isExecuted ? 'text-blue-600' : 'text-gray-400'}`}>
            {isExecuted ? <FaCheckCircle /> : <FaRegClock />}
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">
              {isExecuted ? "Movimiento Aplicado" : "Pendiente en Banco"}
            </p>
            <p className="text-xs text-gray-500">
              {isExecuted ? "Ya se reflejó en mi cuenta" : "Aún no aparece en la app del banco"}
            </p>
          </div>
        </div>
        
        <button className="w-full bg-slate-900 text-white font-bold p-3 rounded-lg hover:bg-slate-800 transition flex items-center justify-center gap-2 mt-4">
          <FaPlusCircle /> Registrar Movimiento
        </button>
      </div>
    </form>
  );
}

export default TransactionForm;