
import React, { useState, useEffect } from 'react';
import { Person } from '../types';

interface PersonFormProps {
  onSubmit: (person: Person) => void;
  onClose: () => void;
  initialData?: Person | null;
}

const PersonForm: React.FC<PersonFormProps> = ({ onSubmit, onClose, initialData }) => {
  const [name, setName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setName(initialData.name);
      setContactInfo(initialData.contactInfo || '');
    } else {
      setName('');
      setContactInfo('');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name.trim()) {
      setError('O nome da pessoa é obrigatório.');
      return;
    }

    onSubmit({
      id: initialData?.id || Date.now().toString(),
      name,
      contactInfo,
    });
  };
  
  const formFieldClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT sm:text-sm";
  const labelClasses = "block text-sm font-medium text-neutral-DEFAULT";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded-md">{error}</p>}
      <div>
        <label htmlFor="personName" className={labelClasses}>Nome <span className="text-red-500">*</span></label>
        <input type="text" id="personName" value={name} onChange={(e) => setName(e.target.value)} className={formFieldClasses} required />
      </div>
      <div>
        <label htmlFor="personContact" className={labelClasses}>Informação de Contato (Opcional)</label>
        <input type="text" id="personContact" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} className={formFieldClasses} />
      </div>
      <div className="flex justify-end space-x-3 pt-2">
        <button type="button" onClick={onClose} className="px-4 py-2 text-sm font-medium text-neutral-dark bg-neutral-light rounded-md hover:bg-gray-200 transition-colors">
          Cancelar
        </button>
        <button type="submit" className="px-4 py-2 text-sm font-medium text-white bg-primary-DEFAULT rounded-md hover:bg-primary-dark transition-colors">
          {initialData ? 'Salvar Alterações' : 'Adicionar Pessoa'}
        </button>
      </div>
    </form>
  );
};

export default PersonForm;