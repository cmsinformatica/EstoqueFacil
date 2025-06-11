
import React from 'react';
import { Product } from '../types';
import { PencilIcon, TrashIcon, BoxIcon } from './icons'; // Import BoxIcon for placeholder

interface ProductListProps {
  products: Product[];
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
}

const ProductList: React.FC<ProductListProps> = ({ products, onEdit, onDelete }) => {
  if (products.length === 0) {
    return <p className="text-center text-neutral-DEFAULT py-8">Nenhum produto encontrado. Adicione alguns para começar!</p>;
  }

  return (
    <div className="overflow-x-auto bg-white shadow-md rounded-lg">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-neutral-DEFAULT uppercase tracking-wider">Imagem</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-DEFAULT uppercase tracking-wider">Nome</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-DEFAULT uppercase tracking-wider">SKU</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-DEFAULT uppercase tracking-wider">Quantidade</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-DEFAULT uppercase tracking-wider">Preço</th>
            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-neutral-DEFAULT uppercase tracking-wider">Descrição</th>
            <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-neutral-DEFAULT uppercase tracking-wider">Ações</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {products.map((product) => (
            <tr key={product.id} className="hover:bg-neutral-light transition-colors">
              <td className="px-3 py-4 whitespace-nowrap">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="h-10 w-10 rounded-md object-cover" />
                ) : (
                  <div className="h-10 w-10 flex items-center justify-center bg-gray-100 rounded-md">
                    <BoxIcon className="h-6 w-6 text-gray-400" />
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-neutral-dark">{product.name}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-DEFAULT">{product.sku}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-DEFAULT">{product.quantity}</td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-DEFAULT">R$ {product.price.toFixed(2)}</td>
              <td className="px-6 py-4 text-sm text-neutral-DEFAULT max-w-xs truncate" title={product.description}>{product.description || '-'}</td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                <button onClick={() => onEdit(product)} className="text-primary-DEFAULT hover:text-primary-dark" title="Editar Produto">
                  <PencilIcon />
                </button>
                <button onClick={() => onDelete(product.id)} className="text-red-500 hover:text-red-700" title="Excluir Produto">
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

export default ProductList;
