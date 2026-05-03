import { Routes, Route, useNavigate } from 'react-router-dom';
import { AuthProvider, useAuthContext } from './contexts/AuthContext';
import { PrivateRoute } from './components/PrivateRoute';
import { useEffect, useState } from 'react';
import { listService } from './services/listService';

// Pages
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Home } from './pages/Home';
import { NoList } from './pages/NoList';
import { Dashboard } from './pages/Dashboard';

function IndexRedirect() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkList() {
      if (!user) return;
      try {
        const lista = await listService.getListByUser(user.id);
        if (lista) {
          navigate(`/lista/${lista.id}`, { replace: true });
        } else {
          navigate('/sem-lista', { replace: true });
        }
      } catch (err) {
        console.error(err);
        navigate('/sem-lista', { replace: true });
      } finally {
        setLoading(false);
      }
    }
    checkList();
  }, [user, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return null;
}

function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<PrivateRoute><IndexRedirect /></PrivateRoute>} />
        <Route path="/sem-lista" element={<PrivateRoute><NoList /></PrivateRoute>} />
        <Route path="/lista/:id" element={<PrivateRoute><Home /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
