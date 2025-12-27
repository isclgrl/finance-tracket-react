import { useState } from 'react';
import { supabase } from '../supabaseClient';
import { FaLock, FaUser } from 'react-icons/fa';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  // Función para manejar el Login
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Intentamos iniciar sesión con Supabase
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } 
    // Si no hay error, Supabase actualiza la sesión automáticamente y App.jsx lo detectará
    setLoading(false);
  };

  // Función para manejar el Registro
  const handleSignUp = async () => {
    setLoading(true);
    // Creamos el usuario en Supabase
    const { error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) {
      alert(error.message);
    } else {
      alert('¡Usuario creado! Ya puedes iniciar sesión.');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg w-full max-w-md">
        <h1 className="text-2xl font-bold text-center text-slate-800 mb-6">
          Bienvenido a FinanceTracker 💸
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Correo Electrónico</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="text-gray-400" />
              </div>
              <input
                type="email"
                required
                className="pl-10 block w-full border-gray-300 rounded-md p-2 border focus:ring-blue-500 focus:border-blue-500"
                placeholder="tu@correo.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Contraseña</label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="text-gray-400" />
              </div>
              <input
                type="password"
                required
                className="pl-10 block w-full border-gray-300 rounded-md p-2 border focus:ring-blue-500 focus:border-blue-500"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none disabled:bg-blue-300"
          >
            {loading ? 'Cargando...' : 'Iniciar Sesión'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">¿No tienes cuenta?</p>
          <button
            onClick={handleSignUp}
            disabled={loading}
            className="mt-2 text-blue-600 hover:text-blue-500 font-medium text-sm"
          >
            Registrarse ahora
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;