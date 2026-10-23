import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Split so the app screens never download three.js, and the landing page never downloads the app.
const Landing = lazy(() => import('./landing/Landing.jsx'));
const ZaryApp = lazy(() => import('./app/ZaryApp.jsx'));

export default function App() {
  return (
    <Suspense fallback={null}>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/app/*" element={<ZaryApp />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
