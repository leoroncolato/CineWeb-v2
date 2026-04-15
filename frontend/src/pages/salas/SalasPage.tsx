import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { Sala } from '../../types';
import { useToast } from '../../components/ToastContext';

export function SalasPage() {
  const [salas, setSalas] = useState<Sala[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const [numero, setNumero] = useState<number | ''>('');
  const [capacidade, setCapacidade] = useState<number | ''>('');
  const [editId, setEditId] = useState<number | null>(null);
  
  const [errorNum, setErrorNum] = useState(false);
  const [errorCap, setErrorCap] = useState(false);

  const fetchSalas = async () => {
    try {
      const res = await api.get('/sala');
      setSalas(res.data);
    } catch {
      addToast('Erro ao carregar salas', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSalas(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    if (!numero || numero <= 0) { setErrorNum(true); valid = false; }
    if (!capacidade || capacidade <= 0) { setErrorCap(true); valid = false; }
    if (!valid) return;

    try {
      const payload = { numero: Number(numero), capacidade: Number(capacidade), poltronas: [] };
      if (editId !== null) {
        await api.patch(`/sala/${editId}`, payload);
        addToast('Sala atualizada!', 'success');
      } else {
        await api.post('/sala', payload);
        addToast('Sala criada!', 'success');
      }
      setNumero(''); setCapacidade(''); setEditId(null);
      setErrorNum(false); setErrorCap(false);
      fetchSalas();
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Erro ao salvar sala (Verifique se o nº já existe)', 'danger');
    }
  };

  const handleEdit = (s: Sala) => {
    setEditId(s.id);
    setNumero(s.numero);
    setCapacidade(s.capacidade);
    setErrorNum(false);
    setErrorCap(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Excluir sala?')) return;
    try {
      await api.delete(`/sala/${id}`);
      addToast('Sala removida', 'success');
      fetchSalas();
    } catch {
      addToast('Erro ao remover', 'danger');
    }
  };

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Gerenciar <span>Salas</span></h2>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="glass-panel">
            <h5 className="mb-4">{editId ? 'Editar Sala' : 'Nova Sala'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-muted">Número da Sala</label>
                <input 
                  type="number" 
                  className={`form-control ${errorNum ? 'is-invalid' : ''}`}
                  value={numero}
                  onChange={(e) => { setNumero(e.target.value ? Number(e.target.value) : ''); setErrorNum(false); }}
                  placeholder="Ex: 1"
                />
              </div>
              <div className="mb-4">
                <label className="form-label text-muted">Capacidade (Assentos)</label>
                <input 
                  type="number" 
                  className={`form-control ${errorCap ? 'is-invalid' : ''}`}
                  value={capacidade}
                  onChange={(e) => { setCapacidade(e.target.value ? Number(e.target.value) : ''); setErrorCap(false); }}
                  placeholder="Ex: 50"
                />
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary w-100">
                  {editId ? 'Salvar Edição' : 'Cadastrar'}
                </button>
                {editId && (
                  <button type="button" className="btn btn-outline-light w-50" onClick={() => { setEditId(null); setNumero(''); setCapacidade(''); }}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        <div className="col-md-8">
          <div className="glass-panel">
            {loading ? (
              <div className="text-center p-5"><div className="spinner-border text-light"></div></div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{width: '60px'}}>ID</th>
                      <th>Número</th>
                      <th>Capacidade</th>
                      <th style={{width: '120px'}} className="text-end">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {salas.length === 0 ? (
                      <tr><td colSpan={4} className="text-center py-4 text-muted">Nenhuma sala.</td></tr>
                    ) : salas.map(s => (
                      <tr key={s.id}>
                        <td>#{s.id}</td>
                        <td className="fw-bold fs-5 text-accent">Sala {s.numero}</td>
                        <td>{s.capacidade} lugares</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-warning border-0 me-2" onClick={() => handleEdit(s)}>
                            <i className="bi bi-pencil-fill"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger border-0" onClick={() => handleDelete(s.id)}>
                            <i className="bi bi-trash-fill"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
