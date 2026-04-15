import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { Ingresso } from '../../types';
import { useToast } from '../../components/ToastContext';

export function IngressosPage() {
  const [ingressos, setIngressos] = useState<Ingresso[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  useEffect(() => {
    const fetchIngressos = async () => {
      try {
        const res = await api.get('/ingresso');
        setIngressos(res.data);
      } catch {
        addToast('Erro ao carregar ingressos', 'danger');
      } finally {
        setLoading(false);
      }
    };
    fetchIngressos();
  }, []);

  return (
    <>
      <div className="page-header d-flex justify-content-between align-items-center mb-4">
        <h2 className="page-title">Ingressos <span>Emitidos</span></h2>
        <span className="badge bg-secondary fs-6 px-3">{ingressos.length} Ingressos</span>
      </div>

      <div className="glass-panel">
        {loading ? (
          <div className="text-center p-5"><div className="spinner-border text-light"></div></div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th style={{width: '80px'}}>TICKET</th>
                  <th>Filme & Sessão</th>
                  <th>Sala</th>
                  <th>Tipo</th>
                  <th className="text-end">Valor Pago</th>
                </tr>
              </thead>
              <tbody>
                {ingressos.length === 0 ? (
                  <tr><td colSpan={5} className="text-center py-4 text-muted">Ainda não há ingressos vendidos.</td></tr>
                ) : ingressos.map(i => (
                  <tr key={i.id}>
                    <td><span className="badge bg-dark border border-secondary">#{String(i.id).padStart(4, '0')}</span></td>
                    <td>
                      <div className="fw-medium">{i.sessao?.filme?.titulo}</div>
                      <div className="small text-muted">{i.sessao?.data ? new Date(i.sessao.data).toLocaleString() : ''}</div>
                    </td>
                    <td>Sala {i.sessao?.sala?.numero}</td>
                    <td>
                      <span className={`badge ${i.tipo === 'Meia' ? 'bg-primary text-light' : 'bg-success text-dark'}`}>
                        {i.tipo}
                      </span>
                    </td>
                    <td className="text-end fw-bold">R$ {Number(i.valorPago).toFixed(2)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
