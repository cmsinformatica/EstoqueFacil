import React, { useState } from 'react';
import { Product, Person, OutputLog } from '../types';

interface OutputFormProps {
  products: Product[];
  people: Person[];
  onSubmit: (outputLog: Omit<OutputLog, 'id' | 'timestamp' | 'productName' | 'personName'>) => Promise<boolean>; // Returns true on success
  onClose: () => void;
}

const OutputForm: React.FC<OutputFormProps> = ({ products, people, onSubmit, onClose }) => {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [selectedPersonId, setSelectedPersonId] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!selectedProductId) {
      setError('Por favor, selecione um produto.');
      setIsSubmitting(false);
      return;
    }
    if (!selectedPersonId) {
      setError('Por favor, selecione uma pessoa.');
      setIsSubmitting(false);
      return;
    }
    if (quantity <= 0) {
      setError('A quantidade deve ser maior que zero.');
      setIsSubmitting(false);
      return;
    }

    const product = products.find(p => p.id === selectedProductId);
    if (product && quantity > product.quantity) {
      setError(`Não é possível registrar a saída de ${quantity} itens. Apenas ${product.quantity} disponíveis para ${product.name}.`);
      setIsSubmitting(false);
      return;
    }
    
    const success = await onSubmit({
      productId: selectedProductId,
      personId: selectedPersonId,
      quantity,
    });

    setIsSubmitting(false);
    if (success) {
      // onClose will be called by App.tsx after successful submission and data refresh
      // Resetting form here is optional as modal closes
      // setSelectedProductId('');
      // setSelectedPersonId('');
      // setQuantity(1);
    }
  };

  const formFieldClasses = "mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-DEFAULT focus:border-primary-DEFAULT sm:text-sm";
  const labelClasses = "block text-sm font-medium text-neutral-DEFAULT";

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <p className="text-red-500 text-sm bg-red-100 p-2 rounded-md">{error}</p>}
      <div>
        <label htmlFor="outputProduct" className={labelClasses}>Produto <span className="text-red-500">*</span></label>
        <select
          id="outputProduct"
          value={selectedProductId}
          onChange={(e) => setSelectedProductId(e.target.value)}
          className={formFieldClasses}
          required
          disabled={isSubmitting}
        >
          <option value="">Selecione um produto</option>
          {products.filter(p => p.quantity > 0).map(product => (
            <option key={product.id} value={product.id}>
              {product.name} (Disponível: {product.quantity})
            </option>
          ))}
        </select>
        {products.filter(p => p.quantity > 0).length === 0 && <p className="text-sm text-amber-600 mt-1">Nenhum produto com estoque disponível.</p>}
      </div>
      <div>
        <label htmlFor="outputPerson" className={labelClasses}>Pessoa <span className="text-red-500">*</span></label>
        <select
          id="outputPerson"
          value={selectedPersonId}
          onChange={(e) => setSelectedPersonId(e.target.value)}
          className={formFieldClasses}
          required
          disabled={isSubmitting}
        >
          <option value="">Selecione uma pessoa</option>
          {people.map(person => (
            <option key={person.id} value={person.id}>{person.name}</option>
          ))}
        </select>
        {people.length === 0 && <p className="text-sm text-amber-600 mt-1">Nenhuma pessoa cadastrada. Adicione pessoas primeiro.</p>}
      </div>
      <div>
        <label htmlFor="outputQuantity" className={labelClasses}>Quantidade <span className="text-red-500">*</span></label>
        <input
          type="number"
          id="outputQuantity"
          value={quantity}
          onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value, 10) || 1))}
          className={formFieldClasses}
          min="1"
          required
          disabled={isSubmitting}
        />
      </div>
      <div className="flex justify-end space-x-3 pt-2">
        <button 
            type="button" 
            onClick={onClose} 
            className="px-4 py-2 text-sm font-medium text-neutral-dark bg-neutral-light rounded-md hover:bg-gray-200 transition-colors"
            disabled={isSubmitting}
        >
          Cancelar
        </button>
        <button 
          type="submit" 
          className="px-4 py-2 text-sm font-medium text-white bg-primary-DEFAULT rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
          disabled={products.filter(p => p.quantity > 0).length === 0 || people.length === 0 || isSubmitting}
        >
          {isSubmitting ? 'Registrando...' : 'Registrar Saída'}
        </button>
      </div>
    </form>
  );
};

export default OutputForm;
