import { useState } from 'react';
import { FileDown, Calendar, DownloadCloud, AlertCircle, FileText } from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import api from '../api';

export default function Reports() {
  const [filterType, setFilterType] = useState('weekly'); // weekly, monthly, specific
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [noData, setNoData] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    setNoData(false);
    
    // Calcula datas relativas baseado no filterType se não for específico
    let start = startDate;
    let end = endDate;
    
    if (filterType === 'weekly') {
      const date = new Date();
      end = date.toISOString().split('T')[0];
      date.setDate(date.getDate() - 7);
      start = date.toISOString().split('T')[0];
    } else if (filterType === 'monthly') {
      const date = new Date();
      end = date.toISOString().split('T')[0];
      date.setMonth(date.getMonth() - 1);
      start = date.toISOString().split('T')[0];
    }

    try {
      const res = await api.get('/reports', {
        params: { start_date: start, end_date: end }
      });

      const data = res.data.data;
      if (data.length === 0) {
        setNoData(true);
        setIsExporting(false);
        return;
      }

      // Convertendo array de objetos para CSV String
      const headers = Object.keys(data[0]);
      const csvRows = [];
      
      // Header row
      csvRows.push(headers.join(','));

      // Dados
      for (const row of data) {
        const values = headers.map(header => {
          let val = row[header];
          if (val === null || val === undefined) val = "";
          val = String(val);
          // Escapar aspas duplas se houver string com vírgula ou aspas
          if (val.includes(',') || val.includes('"') || val.includes('\n')) {
             val = `"${val.replace(/"/g, '""')}"`;
          }
          return val;
        });
        csvRows.push(values.join(','));
      }

      const csvString = csvRows.join('\n');
      const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `nuiam_relatorio_${start}_a_${end}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

    } catch (err) {
      console.error(err);
      alert('Erro ao gerar CSV.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    setNoData(false);
    
    let start = startDate;
    let end = endDate;
    
    if (filterType === 'weekly') {
      const date = new Date();
      end = date.toISOString().split('T')[0];
      date.setDate(date.getDate() - 7);
      start = date.toISOString().split('T')[0];
    } else if (filterType === 'monthly') {
      const date = new Date();
      end = date.toISOString().split('T')[0];
      date.setMonth(date.getMonth() - 1);
      start = date.toISOString().split('T')[0];
    }

    try {
      const res = await api.get('/reports', {
        params: { start_date: start, end_date: end }
      });

      const data = res.data.data;
      if (data.length === 0) {
        setNoData(true);
        setIsExporting(false);
        return;
      }

      const doc = new jsPDF('landscape');
      
      // Cabeçalho do Relatório
      doc.setFontSize(18);
      doc.setTextColor(30, 58, 138); // bg-blue-900 equivalent
      doc.text('Relatório Descritivo de Manutenções - NUIAM', 14, 22);
      
      doc.setFontSize(11);
      doc.setTextColor(100, 100, 100);
      doc.text(`Período de Extração: ${start} até ${end}`, 14, 30);
      doc.text(`Total de Intervenções Registradas: ${data.length}`, 14, 36);
      doc.text(`Gerado pelo Sistema NUIAM em ${new Date().toLocaleDateString()}`, 14, 42);

      // Preparando Tabela
      const tableColumn = ["Data", "Localidade", "Sistema", "Ativo", "Categoria", "Ocorrência", "Interf. Elét.", "Peças Substituídas"];
      const tableRows: any[] = [];

      data.forEach((svc: any) => {
        const rowData = [
          svc["Data da Manutencao"],
          svc["Cidade/Regional"],
          svc["Sistema"],
          svc["Tag do Ativo"],
          svc["Categoria Ativo"],
          svc["Tipo Manutencao"],
          svc["Interferencia Eletrica"],
          svc["Pecas Substituidas"] || '-'
        ];
        tableRows.push(rowData);
      });

      // @ts-ignore
      doc.autoTable({
        head: [tableColumn],
        body: tableRows,
        startY: 50,
        styles: { fontSize: 8, cellPadding: 3 },
        headStyles: { fillColor: [37, 99, 235], textColor: [255,255,255] },
        alternateRowStyles: { fillColor: [248, 250, 252] }
      });

      doc.save(`nuiam_relatorio_descritivo_${start}_a_${end}.pdf`);

    } catch (err) {
      console.error(err);
      alert('Erro ao gerar PDF.');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className="space-y-6 pb-10">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
          <FileDown className="text-primary-600" /> Relatórios e Exportação
        </h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden max-w-2xl">
        <div className="p-6 border-b border-slate-100 bg-slate-50">
          <h2 className="text-lg font-semibold text-slate-800">Extrair Planilha de Manutenções (CSV)</h2>
          <p className="text-slate-500 text-sm mt-1">Gere um relatório completo das ordens de serviço e manutenções computadas pelos técnicos em campo.</p>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-3">
            <label className="block text-sm font-bold text-slate-700">Qual período você deseja analisar?</label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button 
                onClick={() => setFilterType('weekly')}
                className={`py-3 px-4 rounded-lg border flex flex-col items-center justify-center gap-2 transition-colors
                  ${filterType === 'weekly' ? 'bg-primary-50 border-primary-500 text-primary-700 font-bold shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <Calendar size={20} />
                Última Semana
              </button>
              <button 
                onClick={() => setFilterType('monthly')}
                className={`py-3 px-4 rounded-lg border flex flex-col items-center justify-center gap-2 transition-colors
                  ${filterType === 'monthly' ? 'bg-primary-50 border-primary-500 text-primary-700 font-bold shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <Calendar size={20} />
                Último Mês
              </button>
              <button 
                onClick={() => setFilterType('specific')}
                className={`py-3 px-4 rounded-lg border flex flex-col items-center justify-center gap-2 transition-colors
                  ${filterType === 'specific' ? 'bg-primary-50 border-primary-500 text-primary-700 font-bold shadow-sm' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}
              >
                <Calendar size={20} />
                Data Específica
              </button>
            </div>
          </div>

          {filterType === 'specific' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in fade-in slide-in-from-top-2">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data Inicial</label>
                <input 
                  type="date"
                  value={startDate}
                  onChange={e => setStartDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none text-slate-700"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Data Final</label>
                <input 
                  type="date"
                  value={endDate}
                  onChange={e => setEndDate(e.target.value)}
                  className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none text-slate-700"
                />
              </div>
            </div>
          )}

          {noData && (
            <div className="bg-amber-50 text-amber-800 p-4 rounded-lg border border-amber-200 flex items-center gap-3">
              <AlertCircle className="text-amber-500 shrink-0" />
              <p className="text-sm font-medium">Nenhum serviço registrado neste período no NUIAM. A planilha não foi gerada.</p>
            </div>
          )}
        </div>

        <div className="p-6 bg-slate-50 border-t border-slate-100 flex flex-col sm:flex-row justify-end gap-3">
          <button
            onClick={handleExport}
            disabled={isExporting || (filterType === 'specific' && (!startDate || !endDate))}
            className="bg-white border text-primary-600 border-primary-200 hover:bg-primary-50 px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm w-full sm:w-auto"
          >
            <DownloadCloud size={20} />
            Baixar Planilha CSV
          </button>
          
          <button
            onClick={handleExportPDF}
            disabled={isExporting || (filterType === 'specific' && (!startDate || !endDate))}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm w-full sm:w-auto"
          >
            <FileText size={20} />
            Gerar Relatório PDF
          </button>
        </div>
      </div>
    </div>
  );
}
