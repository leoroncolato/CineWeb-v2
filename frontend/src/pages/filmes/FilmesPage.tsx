import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { Filme, Genero } from '../../types';
import { useToast } from '../../components/ToastContext';

export function FilmesPage() {
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [generos, setGeneros] = useState<Genero[]>([]);
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const [titulo, setTitulo] = useState('');
  const [sinopse, setSinopse] = useState('');
  const [classificacaoEtaria, setClassificacaoEtaria] = useState('Livre');
  const [duracao, setDuracao] = useState<number | ''>('');
  const [generoId, setGeneroId] = useState<number | ''>('');
  const [dataInicial, setDataInicial] = useState('');
  const [dataFinal, setDataFinal] = useState('');
  const [editId, setEditId] = useState<number | null>(null);

  const fetchDados = async () => {
    try {
      const [resF, resG] = await Promise.all([
        api.get('/filme'),
        api.get('/genero')
      ]);
      setFilmes(resF.data);
      setGeneros(resG.data);
    } catch {
      addToast('Erro ao carregar dados', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDados(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!titulo || !duracao || !generoId || !dataInicial || !dataFinal) {
      addToast('Preencha os campos obrigatórios', 'warning');
      return;
    }

    try {
      const payload = {
        titulo, sinopse, classificacaoEtaria, duracao: Number(duracao),
        generoId: Number(generoId),
        dataInicialExibicao: new Date(dataInicial).toISOString(),
        dataFinalExibicao: new Date(dataFinal).toISOString(),
      };

      if (editId !== null) {
        await api.patch(`/filme/${editId}`, payload);
        addToast('Filme atualizado!', 'success');
      } else {
        await api.post('/filme', payload);
        addToast('Filme criado!', 'success');
      }
      resetForm();
      fetchDados();
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Erro ao salvar filme', 'danger');
    }
  };

  const resetForm = () => {
    setEditId(null); setTitulo(''); setSinopse('');
    setClassificacaoEtaria('Livre'); setDuracao(''); setGeneroId('');
    setDataInicial(''); setDataFinal('');
  };

  const handleEdit = (f: Filme) => {
    setEditId(f.id); setTitulo(f.titulo); setSinopse(f.sinopse || '');
    setClassificacaoEtaria(f.classificacaoEtaria); setDuracao(f.duracao);
    setGeneroId(f.generoId);
    setDataInicial(f.dataInicialExibicao.split('T')[0]);
    setDataFinal(f.dataFinalExibicao.split('T')[0]);
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Excluir este filme? Sessoes associadas podem ser apagadas.')) return;
    try {
      await api.delete(`/filme/${id}`);
      addToast('Filme removido', 'success');
      fetchDados();
    } catch {
      addToast('Erro ao remover', 'danger');
    }
  };

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Gerenciar <span>Filmes</span></h2>
      </div>

      <div className="row g-4">
        <div className="col-lg-4">
          <div className="glass-panel">
            <h5 className="mb-4">{editId ? 'Editar Filme' : 'Novo Filme'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <input type="text" className="form-control" placeholder="Título do Filme" value={titulo} onChange={e => setTitulo(e.target.value)} />
              </div>
              
              <div className="row mb-3">
                <div className="col-6">
                  <select className="form-select" value={generoId} onChange={e => setGeneroId(e.target.value ? Number(e.target.value) : '')}>
                    <option value="">Gênero</option>
                    {generos.map(g => <option key={g.id} value={g.id}>{g.nome}</option>)}
                  </select>
                </div>
                <div className="col-6">
                  <input type="number" className="form-control" placeholder="Minutos" value={duracao} onChange={e => setDuracao(e.target.value ? Number(e.target.value) : '')} />
                </div>
              </div>

              <div className="mb-3">
                <select className="form-select" value={classificacaoEtaria} onChange={e => setClassificacaoEtaria(e.target.value)}>
                  <option value="Livre">Livre</option>
                  <option value="10">10 anos</option>
                  <option value="12">12 anos</option>
                  <option value="14">14 anos</option>
                  <option value="16">16 anos</option>
                  <option value="18">18 anos</option>
                </select>
              </div>

              <div className="row mb-3">
                <div className="col-6">
                  <label className="text-muted small">Data Início</label>
                  <input type="date" className="form-control" value={dataInicial} onChange={e => setDataInicial(e.target.value)} />
                </div>
                <div className="col-6">
                  <label className="text-muted small">Data Fim</label>
                  <input type="date" className="form-control" value={dataFinal} onChange={e => setDataFinal(e.target.value)} />
                </div>
              </div>

              <div className="d-flex gap-2 mt-4">
                <button type="submit" className="btn btn-primary w-100">{editId ? 'Salvar' : 'Cadastrar'}</button>
                {editId && <button type="button" className="btn btn-outline-light w-50" onClick={resetForm}>Cancelar</button>}
              </div>
            </form>
          </div>
        </div>

        <div className="col-lg-8">
          <div className="glass-panel">
            {loading ? <div className="text-center p-5"><div className="spinner-border text-light"></div></div> : (
              <div className="table-responsive">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Título</th>
                      <th>Gênero</th>
                      <th>Classificação</th>
                      <th>Duração</th>
                      <th className="text-end">Ações</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filmes.map(f => (
                      <tr key={f.id}>
                        <td className="fw-medium">{f.titulo}</td>
                        <td className="text-accent">{f.genero?.nome}</td>
                        <td><span className="badge bg-secondary">{f.classificacaoEtaria}</span></td>
                        <td>{f.duracao}m</td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-warning border-0 me-2" onClick={() => handleEdit(f)}>
                            <i className="bi bi-pencil-fill"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger border-0" onClick={() => handleDelete(f.id)}>
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
