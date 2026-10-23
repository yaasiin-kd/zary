import { useEffect } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppProvider, useZary } from './store.jsx';
import '../styles/auth.css';
import './ui/ui.css';
import AuthLayout from './auth/AuthLayout.jsx';
import Login from './auth/Login.jsx';
import Register from './auth/Register.jsx';
import Verify from './auth/Verify.jsx';
import Onboarding from './auth/Onboarding.jsx';
import Shell from './Shell.jsx';
import Toast from './Toast.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Expenses from './pages/Expenses.jsx';
import Budget from './pages/Budget.jsx';
import Transfer from './pages/Transfer.jsx';
import Profile from './pages/Profile.jsx';

export default function ZaryApp() {
  return (
    <AppProvider>
      <ZaryRoot />
    </AppProvider>
  );
}

function ZaryRoot() {
  const { theme, user, pending } = useZary();

  useEffect(() => {
    document.title = 'Zary';
    document.body.style.background = theme === 'dark' ? '#0b1220' : '#f4f6f1';
  }, [theme]);

  const home = user ? '/app/dashboard' : '/app/login';
  const guard = (el) => (user ? el : <Navigate to="/app/login" replace />);

  return (
    <div className="za" data-theme={theme}>
      <Routes>
        <Route element={<AuthLayout />}>
          <Route path="login" element={user ? <Navigate to={home} replace /> : <Login />} />
          <Route path="register" element={user ? <Navigate to={home} replace /> : <Register />} />
          <Route path="verify" element={pending ? <Verify /> : <Navigate to={home} replace />} />
          <Route path="welcome" element={pending && pending.isNew ? <Onboarding /> : <Navigate to={home} replace />} />
        </Route>
        <Route element={guard(<Shell />)}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="budget" element={<Budget />} />
          <Route path="transfer" element={<Transfer />} />
          <Route path="profile" element={<Profile />} />
        </Route>
        <Route index element={<Navigate to={home} replace />} />
        <Route path="*" element={<Navigate to={home} replace />} />
      </Routes>
      <Toast />
    </div>
  );
}
