import { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Lightbulb, Users as UsersIcon } from 'lucide-react';
import api from '../api';
import type { User } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';

export default function ServiceForm() {
  const [searchParams] = useSearchParams();
  const initialAssetId = searchParams.get('asset') || '';
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [assets, setAssets] = useState<any[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<number[]>([]);
  const [historicalSuggestions, setHistoricalSuggestions] = useState<string[]>([]);
  
  // Estados para os Dropdowns Específicos
  const [naturalInfluenceSelect, setNaturalInfluenceSelect] = useState('');
  const [naturalInfluenceCustom, setNaturalInfluenceCustom] = useState('');
  
  const [pipingMaterialSelect, setPipingMaterialSelect] = useState('PVC');
  const [pipingMaterialCustom, setPipingMaterialCustom] = useState('');

  const [replacedPartsBool, setReplacedPartsBool] = useState('false');
  const [replacedPartsText, setReplacedPartsText] = useState('');

  const [form, setForm] = useState({
    asset_id: initialAssetId,
    date: new Date().toISOString().split('T')[0],
    macro_type: 'Preventiva',
    category: 'Macromedição',
    is_closed_system: 'true',
    diameter_mm: '',
    electrical_interferences: 'false',
    materials_used: '',
  });

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Busca ativos e usuários aprovados
    Promise.all([
      api.get('/assets'),
      api.get('/users')
    ]).then(([assetsRes, usersRes]) => {
      setAssets(assetsRes.data);
      setUsers(usersRes.data);
    }).catch(console.error);
  }, []);

  // Monitorar mudança do asset para carregar histórico e prever peças
  useEffect(() => {
    if (form.asset_id) {
      api.get(`/assets/${form.asset_id}`)
        .then(res => {
           const history = res.data.services || [];
           // Extrair e deduzir peças trocadas anteriormente
           const parts = history
             .map((s: any) => s.replaced_parts)
             .filter(Boolean);
           
           // Pega os itens unicos quebados por vírgula e junta
           const uniquePartsSet = new Set<string>();
           parts.forEach((p: string) => {
             p.split(',').map(item => item.trim()).filter(Boolean).forEach(i => uniquePartsSet.add(i));
           });
           setHistoricalSuggestions(Array.from(uniquePartsSet));
        })
        .catch(console.error);
    } else {
       setHistoricalSuggestions([]);
    }
  }, [form.asset_id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.asset_id) return alert('Selecione um ativo');
    
    // Resolver os valores finais (Select vs Custom)
    const finalNaturalInfluence = naturalInfluenceSelect === 'Outro' ? naturalInfluenceCustom : naturalInfluenceSelect;
    const finalPipingMaterial = pipingMaterialSelect === 'Outro' ? pipingMaterialCustom : pipingMaterialSelect;

    setLoading(true);
    try {
      await api.post('/services', {
        asset_id: parseInt(form.asset_id),
        date: form.date,
        macro_type: form.macro_type,
        category: form.category,
        is_closed_system: form.is_closed_system === 'true',
        piping_material: finalPipingMaterial,
        diameter_mm: parseFloat(form.diameter_mm) || null,
        natural_influences: finalNaturalInfluence,
        electrical_interferences: form.electrical_interferences === 'true',
        materials_used: form.materials_used,
        replaced_parts: replacedPartsBool === 'true' ? replacedPartsText : null,
        user_ids: selectedUserIds
      });
      setForm(prev => ({ ...prev, materials_used: '', diameter_mm: '', date: new Date().toISOString().split('T')[0] }));
      setNaturalInfluenceSelect('');
      setNaturalInfluenceCustom('');
      setPipingMaterialSelect('PVC');
      setPipingMaterialCustom('');
      setReplacedPartsBool('false');
      setReplacedPartsText('');
      setSelectedUserIds([]);
      addToast('Serviço registrado com sucesso! O checklist foi salvo no histórico do ativo.', 'success');
      navigate('/assets');
    } catch (err) {
      console.error(err);
      addToast('Ocorreu um erro ao salvar o serviço. Tente novamente.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-20">
      <h1 className="text-2xl font-bold text-slate-800">Registrar Intervenção Técnica</h1>
      
      {success && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200 font-medium">
          Serviço registrado com sucesso! O status do ativo foi atualizado.
        </div>
      )}

      {historicalSuggestions.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-4 flex gap-4 items-start shadow-sm animate-in fade-in slide-in-from-top-4">
          <div className="bg-indigo-100 p-2 rounded-full text-indigo-600">
             <Lightbulb size={24} />
          </div>
          <div>
            <h3 className="text-indigo-900 font-bold mb-1">Sugestão Inteligente de Materiais</h3>
            <p className="text-indigo-800 text-sm mb-2">Historicamente, este ativo já precisou da substituição dos seguintes componentes. Considere levá-los de reserva:</p>
            <div className="flex flex-wrap gap-2">
              {historicalSuggestions.map((part, idx) => (
                <span key={idx} className="bg-white/60 border border-indigo-200 text-indigo-700 px-3 py-1 rounded-full text-xs font-semibold">
                  {part}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 space-y-6">
        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Identificação</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Data da Intervenção</label>
              <input 
                type="date"
                value={form.date}
                max={new Date().toISOString().split('T')[0]}
                onChange={e => setForm({...form, date: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Selecione o Ativo (Tag)</label>
              <select 
                value={form.asset_id} 
                onChange={e => setForm({...form, asset_id: e.target.value})} 
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                required
              >
                <option value="">Selecione...</option>
                {assets.map(a => (
                  <option key={a.id} value={a.id}>{a.tag} - {a.category}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Macro-Tipo de Manutenção</label>
              <select 
                value={form.macro_type} 
                onChange={e => setForm({...form, macro_type: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value="Preventiva">Preventiva</option>
                <option value="Corretiva">Corretiva</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Categoria</label>
              <select 
                value={form.category} 
                onChange={e => setForm({...form, category: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value="Macromedição">Macromedição</option>
                <option value="Telemetria">Telemetria</option>
                <option value="Inversor">Inversor</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2 flex items-center gap-2">
            <UsersIcon size={20} className="text-slate-500" /> Profissionais Envolvidos
          </h2>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-3">Quem fez a atividade? (Selecione um ou mais)</label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {users.map(u => (
                <label key={u.id} className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg cursor-pointer hover:bg-slate-100 transition-colors">
                  <input 
                    type="checkbox"
                    checked={selectedUserIds.includes(u.id)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedUserIds([...selectedUserIds, u.id]);
                      } else {
                        setSelectedUserIds(selectedUserIds.filter(id => id !== u.id));
                      }
                    }}
                    className="w-4 h-4 text-primary-600 rounded focus:ring-primary-500 border-slate-300"
                  />
                  <span className="text-sm font-medium text-slate-700">{u.full_name}</span>
                </label>
              ))}
              {users.length === 0 && <span className="text-sm text-slate-500">Nenhum técnico cadastrado ou aprovado...</span>}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-lg font-semibold border-b pb-2">Checklist Técnico</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
             <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Sistema Aberto ou Fechado?</label>
              <select 
                value={form.is_closed_system} 
                onChange={e => setForm({...form, is_closed_system: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value="true">Fechado</option>
                <option value="false">Aberto</option>
              </select>
            </div>

            {/* Material de Tubulação com customização */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Material da Tubulação</label>
              <select 
                value={pipingMaterialSelect} 
                onChange={e => setPipingMaterialSelect(e.target.value)}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none mb-2"
              >
                <option value="PVC">PVC</option>
                <option value="Ferro Fundido">Ferro Fundido</option>
                <option value="Aço Carbono">Aço Carbono</option>
                <option value="PAD">PAD</option>
                <option value="Outro">Adicionar nova opção...</option>
              </select>
              {pipingMaterialSelect === 'Outro' && (
                <input 
                  type="text"
                  value={pipingMaterialCustom}
                  onChange={e => setPipingMaterialCustom(e.target.value)}
                  className="w-full px-4 py-2 bg-white border border-primary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
                  placeholder="Digite o novo material..."
                  required
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Diâmetro (mm) - Opcional</label>
              <select 
                value={form.diameter_mm} 
                onChange={e => setForm({...form, diameter_mm: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value="">Não se aplica / Não medido</option>
                <option value="50">50 mm</option>
                <option value="75">75 mm</option>
                <option value="100">100 mm</option>
                <option value="150">150 mm</option>
                <option value="200">200 mm</option>
                <option value="250">250 mm</option>
                <option value="300">300 mm</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Interferências Elétricas?</label>
              <select 
                value={form.electrical_interferences} 
                onChange={e => setForm({...form, electrical_interferences: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none"
              >
                <option value="false">Não</option>
                <option value="true">Sim (Aviso de anomalia)</option>
              </select>
            </div>
          </div>

          {/* Influências Naturais com customização */}
          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
             <label className="block text-sm font-semibold text-slate-800 mb-2">Influências Naturais no Local</label>
             <select 
                value={naturalInfluenceSelect} 
                onChange={e => setNaturalInfluenceSelect(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none mb-3"
              >
                <option value="">Nenhuma / Local limpo</option>
                <option value="Presença de vegetação">Presença de vegetação</option>
                <option value="Goteira">Goteira</option>
                <option value="Alta umidade na caixa">Alta umidade na caixa</option>
                <option value="Infiltração grave">Infiltração grave</option>
                <option value="Infestação de insetos/animais">Infestação de insetos/animais</option>
                <option value="Outro">Adicionar nova opção (Outros)...</option>
              </select>

              {naturalInfluenceSelect === 'Outro' && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <input 
                    type="text"
                    value={naturalInfluenceCustom}
                    onChange={e => setNaturalInfluenceCustom(e.target.value)}
                    className="w-full px-4 py-2 bg-white border-2 border-primary-400 rounded-lg focus:ring-2 focus:ring-primary-600 focus:outline-none"
                    placeholder="Especifique a influência natural..."
                    required
                  />
                </div>
              )}
          </div>

          <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
             <label className="block text-sm font-semibold text-slate-800 mb-2">Houve Substituição de Peças/Equipamentos?</label>
             <select 
                value={replacedPartsBool} 
                onChange={e => setReplacedPartsBool(e.target.value)}
                className="w-full px-4 py-2 bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none mb-3"
              >
                <option value="false">Não</option>
                <option value="true">Sim, realizei substituição</option>
              </select>

              {replacedPartsBool === 'true' && (
                <div className="animate-in fade-in slide-in-from-top-2">
                  <label className="block text-sm font-medium text-slate-700 mb-1">Quais materiais foram substituídos/utilizados?</label>
                  <input 
                    type="text"
                    value={replacedPartsText}
                    onChange={e => setReplacedPartsText(e.target.value)}
                    className="w-full px-4 py-2 bg-white border-2 border-primary-400 rounded-lg focus:ring-2 focus:ring-primary-600 focus:outline-none"
                    placeholder="Ex: modem abs levei e voltou a funcionar, disjuntor trocado..."
                    required
                  />
                </div>
              )}
          </div>

          <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Outras Anotações Extras (Opcional)</label>
             <textarea 
                value={form.materials_used}
                onChange={e => setForm({...form, materials_used: e.target.value})}
                className="w-full px-4 py-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none h-24"
                placeholder="Detalhe os reparos, limpezas..."
              />
          </div>

          {/* Fotos */}
           <div>
             <label className="block text-sm font-medium text-slate-700 mb-1">Anexar Fotos Opcionais (Antes / Depois)</label>
             <input type="file" multiple className="text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100 cursor-pointer" />
           </div>

        </div>

        <button 
          type="submit" 
          disabled={loading}
          className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 shadow-sm"
        >
          {loading ? 'Registrando...' : 'Registrar Serviço e Atualizar Status'}
        </button>
      </form>
    </div>
  );
}
