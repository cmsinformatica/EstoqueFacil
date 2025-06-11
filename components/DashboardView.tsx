import React, { useState, useMemo } from 'react';
import { Product, Person, OutputLog } from '../types';
import { ArrowDownTrayIcon } from './icons';

interface DashboardViewProps {
  products: Product[];
  people: Person[];
  outputLogs: OutputLog[];
}

const LOW_STOCK_THRESHOLD = 5;

const DashboardView: React.FC<DashboardViewProps> = ({ products, people, outputLogs }) => {
  const [dateFilter, setDateFilter] = useState<string>('all'); // 'all', 'last7', 'last30', 'custom'
  const [customStartDate, setCustomStartDate] = useState<string>('');
  const [customEndDate, setCustomEndDate] = useState<string>('');
  const [selectedProductId, setSelectedProductId] = useState<string>('all');
  const [selectedPersonId, setSelectedPersonId] = useState<string>('all');

  const today = new Date();
  const getPastDate = (days: number): Date => {
    const date = new Date();
    date.setDate(today.getDate() - days);
    return date;
  };

  const filteredOutputLogs = useMemo(() => {
    let logs = outputLogs;

    // Date Filter
    if (dateFilter !== 'all') {
      let startDate: Date | null = null;
      let endDate: Date | null = new Date(); // today
      endDate.setHours(23, 59, 59, 999); // End of today

      if (dateFilter === 'last7') {
        startDate = getPastDate(7);
        startDate.setHours(0,0,0,0);
      } else if (dateFilter === 'last30') {
        startDate = getPastDate(30);
         startDate.setHours(0,0,0,0);
      } else if (dateFilter === 'custom' && customStartDate && customEndDate) {
        startDate = new Date(customStartDate);
        startDate.setHours(0,0,0,0);
        endDate = new Date(customEndDate);
        endDate.setHours(23, 59, 59, 999);
      } else if (dateFilter === 'custom' && customStartDate) {
        startDate = new Date(customStartDate);
        startDate.setHours(0,0,0,0);
        // if only start date, then filter from start date to now
      }


      if (startDate) {
        logs = logs.filter(log => {
          const logDate = new Date(log.timestamp);
          return logDate >= startDate! && logDate <= endDate!;
        });
      }
    }
    
    // Product Filter
    if (selectedProductId !== 'all') {
      logs = logs.filter(log => log.productId === selectedProductId);
    }

    // Person Filter
    if (selectedPersonId !== 'all') {
      logs = logs.filter(log => log.personId === selectedPersonId);
    }
    return logs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }, [outputLogs, dateFilter, customStartDate, customEndDate, selectedProductId, selectedPersonId]);

  const totalInventoryValue = useMemo(() => {
    return products.reduce((sum, p) => sum + (p.quantity * p.price), 0);
  }, [products]);

  const lowStockProducts = useMemo(() => {
    return products.filter(p => p.quantity < LOW_STOCK_THRESHOLD && p.quantity > 0).sort((a,b) => a.quantity - b.quantity);
  }, [products]);
  
  const totalFilteredOutputs = filteredOutputLogs.length;
  const totalFilteredQuantity = filteredOutputLogs.reduce((sum, log) => sum + log.quantity, 0);

  const exportReport = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Summary
    csvContent += "Resumo do Relatório\n";
    csvContent += `Período: ${dateFilter === 'custom' && customStartDate && customEndDate ? `${customStartDate} a ${customEndDate}` : dateFilter}\n`;
    csvContent += `Produto Filtrado: ${selectedProductId === 'all' ? 'Todos' : products.find(p=>p.id === selectedProductId)?.name || 'N/A'}\n`;
    csvContent += `Pessoa Filtrada: ${selectedPersonId === 'all' ? 'Todas' : people.find(p=>p.id === selectedPersonId)?.name || 'N/A'}\n`;
    csvContent += `Total de Saídas no Relatório: ${totalFilteredOutputs}\n`;
    csvContent += `Total de Itens Saídos no Relatório: ${totalFilteredQuantity}\n\n`;
    
    // Detailed Logs
    csvContent += "Histórico de Saídas Detalhado\n";
    const headers = ["Data", "Produto", "SKU", "Quantidade", "Pessoa Destinatária", "Contato Pessoa"];
    csvContent += headers.join(",") + "\n";

    filteredOutputLogs.forEach(log => {
      const product = products.find(p => p.id === log.productId);
      const person = people.find(p => p.id === log.personId);
      const row = [
        new Date(log.timestamp).toLocaleString('pt-BR'),
        log.productName || 'N/A',
        product?.sku || 'N/A',
        log.quantity.toString(),
        log.personName || 'N/A',
        person?.contactInfo || '-'
      ];
      csvContent += row.map(val => `"${val.toString().replace(/"/g, '""')}"`).join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `relatorio_inventario_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const inputClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT sm:text-sm";
  const labelClasses = "block text-sm font-medium text-neutral-DEFAULT";

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold text-neutral-dark">Dashboard de Inventário</h2>
      
      {/* Filters Section */}
      <div className="p-4 bg-white shadow rounded-lg space-y-4 md:space-y-0 md:flex md:flex-wrap md:items-end md:space-x-4">
        <div>
          <label htmlFor="dateFilter" className={labelClasses}>Filtrar Período (Saídas)</label>
          <select id="dateFilter" value={dateFilter} onChange={e => setDateFilter(e.target.value)} className={inputClasses}>
            <option value="all">Todo o Período</option>
            <option value="last7">Últimos 7 Dias</option>
            <option value="last30">Últimos 30 Dias</option>
            <option value="custom">Personalizado</option>
          </select>
        </div>
        {dateFilter === 'custom' && (
          <>
            <div>
              <label htmlFor="customStartDate" className={labelClasses}>Data Início</label>
              <input type="date" id="customStartDate" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} className={inputClasses} />
            </div>
            <div>
              <label htmlFor="customEndDate" className={labelClasses}>Data Fim</label>
              <input type="date" id="customEndDate" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} className={inputClasses} />
            </div>
          </>
        )}
        <div>
          <label htmlFor="productFilter" className={labelClasses}>Filtrar Produto (Saídas)</label>
          <select id="productFilter" value={selectedProductId} onChange={e => setSelectedProductId(e.target.value)} className={inputClasses}>
            <option value="all">Todos os Produtos</option>
            {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
        <div>
          <label htmlFor="personFilter" className={labelClasses}>Filtrar Pessoa (Saídas)</label>
          <select id="personFilter" value={selectedPersonId} onChange={e => setSelectedPersonId(e.target.value)} className={inputClasses}>
            <option value="all">Todas as Pessoas</option>
            {people.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
          </select>
        </div>
         <button 
            onClick={exportReport}
            className="flex items-center self-end bg-primary-DEFAULT text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors shadow text-sm"
          >
            <ArrowDownTrayIcon className="w-4 h-4 mr-2" /> Exportar Relatório (CSV)
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 shadow rounded-lg">
          <h3 className="text-sm font-medium text-neutral-DEFAULT">Total de Produtos Únicos</h3>
          <p className="text-2xl font-semibold text-primary-dark">{products.length}</p>
        </div>
        <div className="bg-white p-4 shadow rounded-lg">
          <h3 className="text-sm font-medium text-neutral-DEFAULT">Valor Total do Inventário</h3>
          <p className="text-2xl font-semibold text-primary-dark">R$ {totalInventoryValue.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 shadow rounded-lg">
          <h3 className="text-sm font-medium text-neutral-DEFAULT">Total de Saídas (Filtrado)</h3>
          <p className="text-2xl font-semibold text-primary-dark">{totalFilteredOutputs}</p>
        </div>
        <div className="bg-white p-4 shadow rounded-lg">
          <h3 className="text-sm font-medium text-neutral-DEFAULT">Total de Itens Saídos (Filtrado)</h3>
          <p className="text-2xl font-semibold text-primary-dark">{totalFilteredQuantity}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Low Stock Products */}
        <div className="bg-white p-4 shadow rounded-lg">
          <h3 className="text-lg font-semibold text-neutral-dark mb-3">Produtos com Baixo Estoque (&lt; {LOW_STOCK_THRESHOLD} unidades)</h3>
          {lowStockProducts.length > 0 ? (
            <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
              {lowStockProducts.map(p => (
                <li key={p.id} className="py-2 flex justify-between items-center">
                  <span>{p.name} <span className="text-xs text-neutral-DEFAULT">({p.sku})</span></span>
                  <span className={`font-semibold ${p.quantity <= LOW_STOCK_THRESHOLD / 2 ? 'text-red-500' : 'text-amber-500'}`}>{p.quantity} unidades</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-neutral-DEFAULT">Nenhum produto com baixo estoque.</p>
          )}
           {products.filter(p => p.quantity === 0).length > 0 && (
             <div className="mt-3 pt-3 border-t">
                <h4 className="text-sm font-medium text-red-600">Produtos Esgotados:</h4>
                 <ul className="text-xs text-red-500">
                    {products.filter(p => p.quantity === 0).map(p => <li key={p.id}>- {p.name} ({p.sku})</li>)}
                 </ul>
             </div>
           )}
        </div>

        {/* Recent Activity */}
        <div className="bg-white p-4 shadow rounded-lg">
          <h3 className="text-lg font-semibold text-neutral-dark mb-3">Atividade Recente de Saídas (Filtrado - Últimos 5)</h3>
          {filteredOutputLogs.length > 0 ? (
            <ul className="divide-y divide-gray-200 max-h-60 overflow-y-auto">
              {filteredOutputLogs.slice(0, 5).map(log => (
                <li key={log.id} className="py-2">
                  <div className="flex justify-between text-sm">
                    <span className="font-medium text-neutral-dark">{log.productName}</span>
                    <span className="text-neutral-DEFAULT">{log.quantity} unid.</span>
                  </div>
                  <div className="text-xs text-neutral-DEFAULT">
                    Para: {log.personName} em {new Date(log.timestamp).toLocaleDateString('pt-BR')}
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-neutral-DEFAULT">Nenhuma saída registrada para os filtros selecionados.</p>
          )}
        </div>
      </div>

      {/* Filtered Output Logs Table */}
      <div className="bg-white shadow rounded-lg p-4">
        <h3 className="text-lg font-semibold text-neutral-dark mb-3">Detalhes das Saídas (Filtrado)</h3>
        {filteredOutputLogs.length > 0 ? (
          <div className="overflow-x-auto max-h-96">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50 sticky top-0">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-neutral-DEFAULT uppercase tracking-wider">Data</th>
                  <th className="px-4 py-2 text-left font-medium text-neutral-DEFAULT uppercase tracking-wider">Produto</th>
                  <th className="px-4 py-2 text-left font-medium text-neutral-DEFAULT uppercase tracking-wider">SKU</th>
                  <th className="px-4 py-2 text-left font-medium text-neutral-DEFAULT uppercase tracking-wider">Quantidade</th>
                  <th className="px-4 py-2 text-left font-medium text-neutral-DEFAULT uppercase tracking-wider">Pessoa</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOutputLogs.map(log => {
                  const product = products.find(p => p.id === log.productId);
                  return (
                    <tr key={log.id} className="hover:bg-neutral-light transition-colors">
                      <td className="px-4 py-2 whitespace-nowrap">{new Date(log.timestamp).toLocaleString('pt-BR')}</td>
                      <td className="px-4 py-2 whitespace-nowrap font-medium">{log.productName}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{product?.sku || 'N/A'}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{log.quantity}</td>
                      <td className="px-4 py-2 whitespace-nowrap">{log.personName}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-neutral-DEFAULT py-4 text-center">Nenhum registro de saída corresponde aos filtros selecionados.</p>
        )}
      </div>

    </div>
  );
};

export default DashboardView;