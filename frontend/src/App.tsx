import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import { ToastProvider } from './components/ToastContext';
import { GenerosPage } from './pages/generos/GenerosPage';
import { SalasPage } from './pages/salas/SalasPage';
import { LanchesPage } from './pages/lanches/LanchesPage';
import { IngressosPage } from './pages/ingressos/IngressosPage';
import { FilmesPage } from './pages/filmes/FilmesPage';
import { SessoesPage } from './pages/sessoes/SessoesPage';
import { PDVPage } from './pages/pdv/PDVPage';

function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/pdv" replace />} />
            <Route path="pdv" element={<PDVPage />} />
            <Route path="sessoes" element={<SessoesPage />} />
            <Route path="filmes" element={<FilmesPage />} />
            <Route path="salas" element={<SalasPage />} />
            <Route path="generos" element={<GenerosPage />} />
            <Route path="lanches" element={<LanchesPage />} />
            <Route path="ingressos" element={<IngressosPage />} />
          </Route>
        </Routes>
      </ToastProvider>
    </BrowserRouter>
  );
}

export default App;
