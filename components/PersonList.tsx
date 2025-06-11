
import React from 'react';
import { Person } from '../types';
import { PencilIcon, TrashIcon } from './icons';

interface PersonListProps {
  people: Person[];
  onEdit: (person: Person) => void;
  onDelete: (personId: string) => void;
}

const PersonList: React.FC<PersonListProps> = ({ people, onEdit, onDelete }) => {
  if (people.length === 0) {
    return <p className="text-center text-neutral-DEFAULT py-8">Nenhuma pessoa encontrada. Adicione algumas para começar!</p>;
  }

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-DEFAULT uppercase tracking-wider">Nome</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-DEFAULT uppercase tracking-wider">Informação de Contato</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-DEFAULT uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {people.map((person) => (
            <tr key={person.id} className="hover:bg-neutral-light transition-colors">
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-dark">{person.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-DEFAULT">{person.contactInfo || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button onClick={() => onEdit(person)} className="text-primary-DEFAULT hover:text-primary-dark" title="Editar Pessoa">
                  <PencilIcon />
                </button>
                <button onClick={() => onDelete(person.id)} className="text-red-500 hover:text-red-700" title="Excluir Pessoa">
                  <TrashIcon />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default PersonList;