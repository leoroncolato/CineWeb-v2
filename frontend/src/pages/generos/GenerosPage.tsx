import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { Genero } from '../../types';
import { useToast } from '../../components/ToastContext';

export function GenerosPage() {
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const [nome, setNome] = useState('');
  const [editId, setEditId] = useState<number | null>(null);
  const [errorName, setErrorName] = useState(false);

  const fetchGeneros = async () => {
    try {
      const res = await api.get('/genero');
      setGeneros(res.data);
    } catch (error) {
      addToast('Erro ao carregar gêneros', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGeneros();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome.trim()) {
      setErrorName(true);
      return;
    }

    try {
      if (editId !== null) {
        await api.patch(`/genero/${editId}`, { nome });
        addToast('Gênero atualizado com sucesso!', 'success');
      } else {
        await api.post('/genero', { nome });
        addToast('Gênero criado com sucesso!', 'success');
      }
      setNome('');
      setEditId(null);
      setErrorName(false);
      fetchGeneros();
    } catch (error: any) {
      addToast(error.response?.data?.message || 'Erro ao processar requisição', 'danger');
    }
  };

  const handleEdit = (g: Genero) => {
    setEditId(g.id);
    setNome(g.nome);
    setErrorName(false);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza?')) return;
    try {
      await api.delete(`/genero/${id}`);
      addToast('Gênero removido com sucesso!', 'success');
      fetchGeneros();
    } catch (error: any) {
      addToast('Erro ao remover', 'danger');
    }
  };

  return (
    <>
      <div className="page-header d-flex justify-content-between align-items-center">
        <h2 className="page-title">Gerenciar <span>Gêneros</span></h2>
      </div>

      <div className="row g-4">
        {/* Form Column */}
        <div className="col-md-4">
          <div className="glass-panel">
            <h5 className="mb-4">{editId ? 'Editar Gênero' : 'Novo Gênero'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label text-muted">Nome do Gênero</label>
                <input 
                  type="text" 
                  className={`form-control ${errorName ? 'is-invalid' : ''}`}
                  value={nome}
                  onChange={(e) => { setNome(e.target.value); setErrorName(false); }}
                  placeholder="Ex: Ação"
                />
                {errorName && <div className="invalid-feedback">O nome é obrigatório.</div>}
              </div>
              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-primary w-100">
                  {editId ? 'Salvar Edição' : 'Cadastrar'}
                </button>
                {editId && (
                  <button type="button" className="btn btn-outline-light w-50" onClick={() => { setEditId(null); setNome(''); }}>
                    Cancelar
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>

        {/* Table Column */}
        <div className="col-md-8">
          <div className="glass-panel">
            {loading ? (
              <div className="text-center p-5"><div className="spinner-border text-light" role="status"></div></div>
            ) : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th style={{width: '60px'}}>ID</th>
                      <th>Nome</th>
                      <th style={{width: '120px'}} className="text-end">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {generos.length === 0 ? (
                      <tr><td colSpan={3} className="text-center py-4 text-muted">Nenhum gênero cadastrado.</td></tr>
                    ) : generos.map(g => (
                      <tr key={g.id}>
                        <td>#{g.id}</td>
                        <td className="fw-medium">{g.nome}</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-warning border-0 me-2" onClick={() => handleEdit(g)}>
                            <i className="bi bi-pencil-fill"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger border-0" onClick={() => handleDelete(g.id)}>
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
