import { useState, useEffect } from 'react';
import { BrainCircuit, Database, Download } from 'lucide-react';
import api from '../api';
import { useAuth } from '../contexts/AuthContext';

export default function MlDataViewer() {
  const { user } = useAuth();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Busca todos os relatórios que contêm o histórico de vistorias
    api.get('/reports')
      .then(res => {
        setData(res.data.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleSimulateTraining = () => {
    alert("Funcionalidade futura: Em breve aqui conectaremos um modelo Scikit-Learn ou XGBoost que irá rodar em cima deste dataset para sugerir manutenções e prever a próxima data de falha de um ativo!");
  };

  if (user?.role !== 'desenvolvedor' && user?.role !== 'chefe') {
    return <div className="p-8 text-center text-red-500">Acesso negado. Apenas desenvolvedores / chefes.</div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <BrainCircuit className="text-indigo-600" />
            Dataset IA (Machine Learning)
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Visualização dos dados brutos das vistorias que alimentarão o modelo preditivo.
          </p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSimulateTraining}
            className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition"
          >
            <BrainCircuit size={18} />
            Treinar IA (Em Breve)
          </button>
          <button className="flex items-center gap-2 bg-slate-200 text-slate-700 px-4 py-2 rounded-lg font-medium hover:bg-slate-300 transition">
            <Download size={18} />
            Exportar CSV
          </button>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600 whitespace-nowrap">
            <thead className="bg-slate-50 text-slate-700 text-xs uppercase font-semibold border-b border-slate-200">
              <tr>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Ativo (Tag)</th>
                <th className="px-4 py-3">Tipo Manut.</th>
                <th className="px-4 py-3">Tubulação</th>
                <th className="px-4 py-3">Inf. Naturais</th>
                <th className="px-4 py-3">Interf. Elétrica</th>
                <th className="px-4 py-3">Peças Substituídas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                 <tr><td colSpan={7} className="text-center py-6">Carregando dados...</td></tr>
              ) : data.length === 0 ? (
                 <tr><td colSpan={7} className="text-center py-6 text-slate-500">Nenhum dado de vistoria cadastrado ainda.</td></tr>
              ) : (
                data.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-700">{row['Data da Manutencao']}</td>
                    <td className="px-4 py-3 text-indigo-600 font-bold">{row['Tag do Ativo']}</td>
                    <td className="px-4 py-3">
                       <span className={`px-2 py-1 rounded-full text-xs font-semibold ${row['Tipo Manutencao'] === 'Preventiva' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                          {row['Tipo Manutencao']}
                       </span>
                    </td>
                    <td className="px-4 py-3">{row['Material/Tubulacao'] || '-'}</td>
                    <td className="px-4 py-3 max-w-[200px] truncate" title={row['Influencias Naturais']}>{row['Influencias Naturais'] || '-'}</td>
                    <td className="px-4 py-3">
                      {row['Interferencia Eletrica'] === 'Sim' ? (
                        <span className="text-red-600 font-bold">Sim</span>
                      ) : (
                        <span className="text-slate-500">Não</span>
                      )}
                    </td>
                    <td className="px-4 py-3 max-w-[200px] truncate" title={row['Pecas Substituidas']}>{row['Pecas Substituidas'] || '-'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <div className="bg-slate-50 border-t border-slate-200 p-3 text-xs text-slate-500 flex items-center gap-2">
          <Database size={14} /> Total de registros coletados: {data.length} amostras
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-blue-50 border border-blue-100 p-5 rounded-xl">
           <h3 className="font-bold text-blue-800 mb-2">Por que esses dados são importantes?</h3>
           <p className="text-sm text-blue-700">A correlação entre "Influências Naturais", "Interferência Elétrica" e as datas de "Manutenção Corretiva" criam um padrão estatístico. O modelo descobrirá que ativos num ambiente com 'Goteira' falham mais rápido do que outros.</p>
        </div>
        <div className="bg-indigo-50 border border-indigo-100 p-5 rounded-xl">
           <h3 className="font-bold text-indigo-800 mb-2">Previsão de Peças</h3>
           <p className="text-sm text-indigo-700">Com o histórico de "Peças Substituídas", a IA começará a sugerir automaticamente qual o Kit de Peças ideal que o técnico deve levar para cada tipo de ativo antes mesmo de ele chegar no local.</p>
        </div>
      </div>
    </div>
  );
}
