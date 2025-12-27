import { useState } from 'react';
import { FaMoneyBillWave, FaTimes } from 'react-icons/fa';

function AddMoneyModal({ fund, onClose, onConfirm }) {
  const [amount, setAmount] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!amount || amount <= 0) return;
    
    onConfirm(Number(amount));
    setAmount("");
  };

  if (!fund) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100">
        
        <div className="bg-green-600 p-4 flex justify-between items-center text-white">
          <h3 className="font-bold flex items-center gap-2">
            <FaMoneyBillWave /> Agregar Fondos
          </h3>
          <button onClick={onClose} className="hover:bg-green-700 p-1 rounded">
            <FaTimes />
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-500 text-sm mb-1">Vas a agregar dinero a:</p>
          <p className="text-xl font-bold text-slate-800 mb-4">{fund.name}</p>

          <form onSubmit={handleSubmit}>
            <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Monto a ingresar</label>
            <div className="relative mb-6">
              <span className="absolute left-3 top-2 text-gray-400 font-bold">$</span>
              <input 
                type="number" 
                autoFocus
                className="w-full border-2 border-green-100 rounded-lg py-2 pl-8 pr-4 text-xl font-bold text-green-700 focus:outline-none focus:border-green-500"
                placeholder="0.00"
                value={amount}
                onChange={e => setAmount(e.target.value)}
              />
            </div>

            <div className="flex gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="flex-1 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg transition"
              >
                Cancelar
              </button>
              <button 
                type="submit"
                className="flex-1 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 shadow-md transition transform active:scale-95"
              >
                Guardar
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default AddMoneyModal;