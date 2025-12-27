import { useState } from 'react';
import { FaSave, FaTimes, FaRegClock, FaCheckCircle } from 'react-icons/fa';

export default function EditTransactionModal({ transaction, funds, onClose, onSave }) {
  const [description, setDescription] = useState(transaction.description);
  const [amount, setAmount] = useState(transaction.amount);
  const [category, setCategory] = useState(transaction.category);
  const [fundId, setFundId] = useState(transaction.fund_id);
  const [type, setType] = useState(transaction.type);
  const [isExecuted, setIsExecuted] = useState(transaction.is_executed);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      description,
      amount: Number(amount),
      category,
      fundId,
      type,
      isExecuted
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-fade-in">
        
        <div className="bg-blue-600 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold flex items-center gap-2">✏️ Editar Movimiento</h3>
          <button onClick={onClose}><FaTimes /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="flex gap-2 p-1 bg-gray-100 rounded-lg">
            <button type="button" onClick={() => setType('expense')} className={`flex-1 py-1 rounded-md text-sm font-bold ${type === 'expense' ? 'bg-white text-red-600 shadow' : 'text-gray-500'}`}>Gasto</button>
            <button type="button" onClick={() => setType('income')} className={`flex-1 py-1 rounded-md text-sm font-bold ${type === 'income' ? 'bg-white text-green-600 shadow' : 'text-gray-500'}`}>Ingreso</button>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Descripción</label>
            <input type="text" required className="border p-2 rounded w-full" value={description} onChange={e => setDescription(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">Monto</label>
              <input type="number" step="0.01" required className="border p-2 rounded w-full" value={amount} onChange={e => setAmount(e.target.value)} />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase">Bolsa</label>
              <select className="border p-2 rounded w-full bg-white" value={fundId} onChange={e => setFundId(Number(e.target.value))}>
                {funds.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase">Categoría</label>
            <select className="border p-2 rounded w-full bg-white" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Retiro">💵 Retiro</option>
                <option value="Tarjeta PlataCard">🟠 Tarjeta PlataCard</option>
                <option value="Tarjeta Nu">🟣 Tarjeta Nu</option>
                <option value="Tarjeta Vexi">⚪ Tarjeta Vexi</option>
                <option value="Transferencia">📲 Transferencia</option>
            </select>
          </div>

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
                {isExecuted ? "Ya hice el movimiento en el banco" : "Aún no realizo el movimiento en el banco"}
              </p>
            </div>
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg font-bold hover:bg-blue-700 flex justify-center items-center gap-2">
            <FaSave /> Guardar Cambios
          </button>
        </form>
      </div>
    </div>
  );
}