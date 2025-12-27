import { FaCheckCircle, FaRegClock, FaPen } from 'react-icons/fa'; // <--- Importa FaPen

const TransactionList = ({ transactions, funds, currentPeriod, onEdit }) => {
  
  return (
    <div className="lg:col-span-8">
      <h3 className="font-bold text-slate-700 mb-3 text-lg">
        Movimientos {currentPeriod ? `- ${currentPeriod.name}` : ""}
      </h3>
      
      <div className="space-y-3">
        {transactions.length === 0 && (
          <p className="text-gray-400 text-center py-10">Sin movimientos.</p>
        )}

        {transactions.map((t) => (
          <div key={t.id} className="bg-white p-4 rounded-lg shadow-sm border border-gray-100 flex justify-between items-center group">
            <div className="flex items-center gap-4">
              
              <button 
                onClick={() => onEdit(t)}
                className="text-gray-300 hover:text-blue-500 p-2 transition opacity-0 group-hover:opacity-100"
                title="Editar"
              >
                <FaPen />
              </button>

              <div className={`p-3 rounded-full ${t.is_executed ? 'bg-green-100 text-green-600' : 'bg-yellow-100 text-yellow-600'}`}>
                {t.is_executed ? <FaCheckCircle /> : <FaRegClock />}
              </div>
              
              <div>
                <p className="font-bold text-slate-800">{t.description}</p>
                <div className="flex gap-2 text-xs text-gray-500">
                  <span>{new Date(t.date).toLocaleDateString()}</span> 
                  • 
                  <span className="text-blue-500 font-bold">
                    {funds.find(f => f.id === t.fund_id)?.name || '...'}
                  </span>
                </div>
              </div>
            </div>
            <span className={`font-bold text-xl ${t.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
              {t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
export default TransactionList;