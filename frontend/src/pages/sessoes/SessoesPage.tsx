import { useEffect, useState } from 'react';
import api from '../../services/api';
import type { Sessao, Filme, Sala } from '../../types';
import { useToast } from '../../components/ToastContext';

export function SessoesPage() {
  const [sessoes, setSessoes] = useState<Sessao[]>([]);
  const [filmes, setFilmes] = useState<Filme[]>([]);
  const [salas, setSalas] = useState<Sala[]>([]);
  
  const [loading, setLoading] = useState(true);
  const { addToast } = useToast();

  const [data, setData] = useState('');
  const [valorIngresso, setValorIngresso] = useState<number | ''>('');
  const [filmeId, setFilmeId] = useState<number | ''>('');
  const [salaId, setSalaId] = useState<number | ''>('');
  const [editId, setEditId] = useState<number | null>(null);

  // Modal Venda State
  const [showModal, setShowModal] = useState(false);
  const [sellSessao, setSellSessao] = useState<Sessao | null>(null);
  const [tipoIngresso, setTipoIngresso] = useState<'Inteira'|'Meia'>('Inteira');

  const fetchDados = async () => {
    try {
      const [resS, resF, resSala] = await Promise.all([
        api.get('/sessao'), api.get('/filme'), api.get('/sala')
      ]);
      setSessoes(resS.data); setFilmes(resF.data); setSalas(resSala.data);
    } catch {
      addToast('Erro ao carregar dados', 'danger');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDados(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!data || !valorIngresso || !filmeId || !salaId) {
      addToast('Preencha os campos', 'warning'); return;
    }
    try {
      const payload = {
        data: new Date(data).toISOString(),
        valorIngresso: Number(valorIngresso),
        filmeId: Number(filmeId), salaId: Number(salaId)
      };
      if (editId !== null) {
        await api.patch(`/sessao/${editId}`, payload);
        addToast('Sessão atualizada!', 'success');
      } else {
        await api.post('/sessao', payload);
        addToast('Sessão criada!', 'success');
      }
      resetForm(); fetchDados();
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Conflito de horário na sala!', 'danger');
    }
  };

  const resetForm = () => {
    setEditId(null); setData(''); setValorIngresso('');
    setFilmeId(''); setSalaId('');
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm('Excluir sessão?')) return;
    try {
      await api.delete(`/sessao/${id}`);
      addToast('Removido', 'success'); fetchDados();
    } catch { addToast('Erro ao remover', 'danger'); }
  };

  const handleSellTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!sellSessao) return;

    const vTotal = tipoIngresso === 'Inteira' ? sellSessao.valorIngresso : sellSessao.valorIngresso / 2;
    
    try {
      await api.post('/ingresso', {
        tipo: tipoIngresso,
        valorPago: vTotal,
        sessaoId: sellSessao.id
      });
      addToast(`Ingresso Vendido com Sucesso!`, 'success');
      setShowModal(false);
      setSellSessao(null);
    } catch (err: any) {
      addToast(err.response?.data?.message || 'Lotação excedida ou erro na venda', 'danger');
    }
  };

  return (
    <>
      <div className="page-header">
        <h2 className="page-title">Gerenciar <span>Sessões</span></h2>
      </div>

      <div className="row g-4">
        {/* Formulario Sessão */}
        <div className="col-lg-3">
          <div className="glass-panel">
            <h5 className="mb-4">{editId ? 'Editar Sessão' : 'Nova Sessão'}</h5>
            <form onSubmit={handleSubmit}>
              <div className="mb-3">
                <select className="form-select" value={filmeId} onChange={e => setFilmeId(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">Filme</option>
                  {filmes.map(f => <option key={f.id} value={f.id}>{f.titulo}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <select className="form-select" value={salaId} onChange={e => setSalaId(e.target.value ? Number(e.target.value) : '')}>
                  <option value="">Sala</option>
                  {salas.map(s => <option key={s.id} value={s.id}>Sala {s.numero}</option>)}
                </select>
              </div>
              <div className="mb-3">
                <label className="text-muted small">Data e Hora</label>
                <input type="datetime-local" className="form-control" value={data} onChange={e => setData(e.target.value)} />
              </div>
              <div className="mb-4">
                <label className="text-muted small">Valor Integral (R$)</label>
                <input type="number" step="0.01" className="form-control" value={valorIngresso} onChange={e => setValorIngresso(e.target.value ? Number(e.target.value) : '')} />
              </div>
              <div className="d-flex gap-2 mt-4">
                <button type="submit" className="btn btn-primary w-100">{editId ? 'Salvar' : 'Agendar'}</button>
                {editId && <button type="button" className="btn btn-outline-light w-50" onClick={resetForm}>Cancelar</button>}
              </div>
            </form>
          </div>
        </div>

        {/* Tabela Sessões */}
        <div className="col-lg-9">
          <div className="glass-panel">
            {loading ? <div className="text-center p-5"><div className="spinner-border text-light"></div></div> : (
              <div className="table-responsive">
                <table className="table gap-2">
                  <thead>
                    <tr>
                      <th>Horário</th>
                      <th>Filme</th>
                      <th>Sala</th>
                      <th>Valor Base</th>
                      <th className="text-end">PDV Direto</th>
                      <th className="text-end">Ações do Pátio</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessoes.map(s => (
                      <tr key={s.id}>
                        <td className="fw-medium text-accent">{new Date(s.data).toLocaleString()}</td>
                        <td className="fw-bold fs-6">{s.filme?.titulo}</td>
                        <td>Sala {s.sala?.numero}</td>
                        <td>R$ {s.valorIngresso}</td>
                        <td className="text-end">
                          <button 
                            className="btn btn-sm btn-primary rounded-pill px-3"
                            onClick={() => { setSellSessao(s); setShowModal(true); setTipoIngresso('Inteira'); }}
                          >
                            <i className="bi bi-ticket-perforated me-1"></i> Vender Ingresso
                          </button>
                        </td>
                        <td className="text-end">
                          <button className="btn btn-sm btn-outline-warning border-0 me-1" onClick={() => {
                            setEditId(s.id); setFilmeId(s.filmeId); setSalaId(s.salaId);
                            setValorIngresso(s.valorIngresso);
                            setData(new Date(s.data).toISOString().slice(0,16));
                          }}><i className="bi bi-pencil-fill"></i></button>
                          <button className="btn btn-sm btn-outline-danger border-0" onClick={() => handleDelete(s.id)}><i className="bi bi-trash-fill"></i></button>
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

      {/* Modal de Venda de Ingresso (Avulsa) */}
      {showModal && (
        <>
          <div className="modal-backdrop fade show" style={{opacity: 0.8}}></div>
          <div className="modal fade show d-block" tabIndex={-1}>
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content">
                <div className="modal-header border-bottom-0 pb-0">
                  <h5 className="modal-title fs-4">Gerar <span className="text-white">Ingresso Direto</span></h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
                </div>
                <div className="modal-body pt-3">
                  <div className="p-3 bg-dark rounded border border-secondary mb-3">
                    <p className="mb-1 text-muted small">SESSÃO SELECIONADA</p>
                    <h6 className="mb-0 fw-bold">{sellSessao?.filme?.titulo} - Sala {sellSessao?.sala?.numero}</h6>
                    <small className="text-accent">{sellSessao?.data && new Date(sellSessao.data).toLocaleString()}</small>
                  </div>
                  
                  <form id="vendaForm" onSubmit={handleSellTicket}>
                    <div className="form-group mb-4">
                      <label className="text-muted d-block border-bottom border-secondary pb-2 mb-3">Tipo do Bilhete</label>
                      <div className="d-flex gap-3">
                        <div className="form-check">
                          <input className="form-check-input" type="radio" name="tipo" id="inteira" 
                            checked={tipoIngresso === 'Inteira'} onChange={() => setTipoIngresso('Inteira')} />
                          <label className="form-check-label fs-5" htmlFor="inteira">Inteira</label>
                        </div>
                        <div className="form-check">
                          <input className="form-check-input" type="radio" name="tipo" id="meia" 
                            checked={tipoIngresso === 'Meia'} onChange={() => setTipoIngresso('Meia')} />
                          <label className="form-check-label fs-5" htmlFor="meia">Meia-entrada</label>
                        </div>
                      </div>
                    </div>
                  </form>
                </div>
                <div className="modal-footer bg-dark border-top-0 rounded-bottom-4 d-flex justify-content-between align-items-center">
                  <div>
                    <span className="text-muted small d-block">VALOR FINAL</span>
                    <span className="fs-3 fw-bold text-success">
                      R$ {sellSessao ? (tipoIngresso === 'Inteira' ? sellSessao.valorIngresso : sellSessao.valorIngresso / 2).toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <button type="submit" form="vendaForm" className="btn btn-primary px-4 py-2 fs-5">
                    <i className="bi bi-cart-check"></i> Emitir
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}
