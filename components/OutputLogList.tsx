
import React from 'react';
import { OutputLog } from '../types';

interface OutputLogListProps {
  outputLogs: OutputLog[];
}

const OutputLogList: React.FC<OutputLogListProps> = ({ outputLogs }) => {
  if (outputLogs.length === 0) {
    return <p className="text-center text-neutral-DEFAULT py-8">Nenhuma saída de produto registrada ainda.</p>;
  }

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-DEFAULT uppercase tracking-wider">Data</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-DEFAULT uppercase tracking-wider">Produto</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-DEFAULT uppercase tracking-wider">Quantidade</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-DEFAULT uppercase tracking-wider">Destinado a</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {outputLogs.slice().sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((log) => (
            <tr key={log.id} className="hover:bg-neutral-light transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-DEFAULT">
                {new Date(log.timestamp).toLocaleString('pt-BR')}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-dark">{log.productName || 'N/A'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-DEFAULT">{log.quantity}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-DEFAULT">{log.personName || 'N/A'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default OutputLogList;