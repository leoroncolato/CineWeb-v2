import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { LancheCombo } from '../../types';
import { useToast } from '../../components/ToastContext';

export function LanchesPage() {
  const [lanches, setLanches] = useState<LancheCombo[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const [nome, setNome] = useState('');
  const [descricao, setDescricao] = useState('');
  const [preco, setPreco] = useState<number | ''>('');
  const [editId, setEditId] = useState<number | null>(null);
  
  const [errorName, setErrorName] = useState(false);
  const [errorPreco, setErrorPreco] = useState(false);

  const fetchLanches = async () => {
    try {
      const res = await api.get('/lanche-combo');
      setLanches(res.data);
    } catch {
      addToast('Erro ao carregar lanches', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLanches(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let valid = true;
    if (!nome.trim()) { setErrorName(true); valid = false; }
    if (!preco || preco <= 0) { setErrorPreco(true); valid = false; }
    if (!valid) return;

    try {
      const payload = { nome, descricao, preco: Number(preco), qtUnidade: 1 };
      if (editId !== null) {
        await api.patch(`/lanche-combo/${editId}`, payload);
        addToast('Atualizado!', 'success');
      } else {
        await api.post('/lanche-combo', payload);
        addToast('Criado com sucesso!', 'success');
      }
      setNome(''); setDescricao(''); setPreco(''); setEditId(null);
      setErrorName(false); setErrorPreco(false);
      fetchLanches();
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Erro', 'danger');
    }
  };

  const handleEdit = (l: LancheCombo) => {
    setEditId(l.id);
    setNome(l.nome);
    setDescricao(l.descricao || '');
    setPreco(l.preco);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Excluir lanche?')) return;
    try {
      await api.delete(`/lanche-combo/${id}`);
      addToast('Removido', 'success');
      fetchLanches();
    } catch {
      addToast('Erro ao remover', 'danger');
    }
  };

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Estoque de <span>Lanches</span></h2>
      </div>

      <div className="row g-4">
        <div className="col-md-4">
          <div className="glass-panel">
            <h5 className="mb-4">{editId ? 'Editar Item' : 'Novo Lanche/Combo'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-muted">Nome</label>
                <input 
                  type="text" className={`form-control ${errorName ? 'is-invalid' : ''}`}
                  value={nome} onChange={(e) => { setNome(e.target.value); setErrorName(false); }}
                />
              </div>
              <div className="mb-3">
                <label className="form-label text-muted">Descrição</label>
                <textarea 
                  className="form-control" rows={2}
                  value={descricao} onChange={(e) => setDescricao(e.target.value)}
                />
              </div>
              <div className="mb-4">
                <label className="form-label text-muted">Preço (R$)</label>
                <input 
                  type="number" step="0.01" className={`form-control ${errorPreco ? 'is-invalid' : ''}`}
                  value={preco} onChange={(e) => { setPreco(e.target.value ? Number(e.target.value) : ''); setErrorPreco(false); }}
                />
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary w-100">{editId ? 'Salvar' : 'Cadastrar'}</button>
                {editId && (
                  <button type="button" className="btn btn-outline-light w-50" onClick={() => { setEditId(null); setNome(''); setDescricao(''); setPreco(''); }}>
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
                      <th>Nome</th>
                      <th>Descricão</th>
                      <th>Preço</th>
                      <th className="text-end">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lanches.map(l => (
                      <tr key={l.id}>
                        <td className="fw-medium">{l.nome}</td>
                        <td className="text-muted small">{l.descricao}</td>
                        <td className="text-success fw-bold">R$ {Number(l.preco).toFixed(2)}</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-warning border-0 me-2" onClick={() => handleEdit(l)}>
                            <i className="bi bi-pencil-fill"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger border-0" onClick={() => handleDelete(l.id)}>
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
