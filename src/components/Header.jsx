import { FaWallet, FaCalendarAlt, FaPlay, FaArchive, FaSignOutAlt } from 'react-icons/fa';

const Header = ({ currentPeriod, onStart, onClose, onLogout }) => {
  return (
    <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
      <div>
        <h1 className="text-3xl font-bold text-slate-800 flex items-center gap-2">
          <FaWallet className="text-blue-600"/> Mis Finanzas
        </h1>
        {currentPeriod ? (
          <div className="flex items-center gap-2 text-gray-500 mt-1 ml-1 animate-fade-in">
            <FaCalendarAlt className="text-blue-400" />
            <span className="text-sm font-bold uppercase tracking-wider border-b-2 border-blue-200">
              {currentPeriod.name}
            </span>
          </div>
        ) : (
          <div className="text-red-400 text-xs font-bold mt-1 ml-1">🔴 Sin periodo activo</div>
        )}
      </div>
      
      <div className="flex items-center gap-3">
        {!currentPeriod ? (
          <button 
            onClick={onStart} 
            className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-green-700 shadow-lg animate-bounce"
          >
            <FaPlay /> Iniciar Periodo
          </button>
        ) : (
          <button 
            onClick={onClose} 
            className="bg-indigo-100 text-indigo-700 px-4 py-2 rounded-lg text-sm font-bold flex items-center gap-2 hover:bg-indigo-200 transition"
          >
            <FaArchive /> Cerrar Periodo
          </button>
        )}

        <button 
          onClick={onLogout} 
          className="text-red-500 px-3 py-2 rounded-lg border border-red-200 text-sm font-bold hover:bg-red-50 transition"
        >
          <FaSignOutAlt /> Salir
        </button>
      </div>
    </div>
  );
}

export default Header;