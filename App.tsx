import React, { useState, useEffect, useCallback } from 'react';
import { Product, Person, OutputLog, View } from './types';
import Navbar from './components/Navbar';
import ProductList from './components/ProductList';
import ProductForm from './components/ProductForm';
import PersonList from './components/PersonList';
import PersonForm from './components/PersonForm';
import OutputForm from './components/OutputForm';
import OutputLogList from './components/OutputLogList';
import Modal from './components/Modal';
import ConfirmationDialog from './components/ConfirmationDialog';
import DashboardView from './components/DashboardView';
import { PlusIcon } from './components/icons';
import { 
  initDB,
  getProductsDB, addProductDB, updateProductDB, deleteProductDB, getProductDBById,
  getPeopleDB, addPersonDB, updatePersonDB, deletePersonDB,
  getOutputLogsDB, recordProductOutputDB
} from './db'; // Import IndexedDB functions

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<View>(View.Dashboard);
  
  const [products, setProducts] = useState<Product[]>([]);
  const [people, setPeople] = useState<Person[]>([]);
  const [outputLogs, setOutputLogs] = useState<OutputLog[]>([]);

  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [isPersonModalOpen, setIsPersonModalOpen] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);

  const [isOutputModalOpen, setIsOutputModalOpen] = useState(false);

  const [itemToDelete, setItemToDelete] = useState<{ type: 'product' | 'person', id: string } | null>(null);
  const [isConfirmDialogOpen, setIsConfirmDialogOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [dbError, setDbError] = useState<string | null>(null);

  // Initialize DB and load initial data
  useEffect(() => {
    const initializeData = async () => {
      try {
        await initDB();
        await fetchAllData();
        setDbError(null);
      } catch (error: any) {
        console.error("Failed to initialize database:", error);
        setDbError(`Falha ao inicializar o banco de dados: ${error.message || 'Erro desconhecido'}. Verifique as permissões do navegador para IndexedDB.`);
      } finally {
        setIsLoading(false);
      }
    };
    initializeData();
  }, []);

  const fetchAllData = async () => {
    try {
      const [dbProducts, dbPeople, dbOutputLogs] = await Promise.all([
        getProductsDB(),
        getPeopleDB(),
        getOutputLogsDB()
      ]);
      setProducts(dbProducts);
      setPeople(dbPeople);
      setOutputLogs(dbOutputLogs);
    } catch (error: any) {
       console.error("Error fetching data from DB:", error);
       setDbError(`Erro ao buscar dados: ${error.message || 'Erro desconhecido'}`);
    }
  };

  // Product Handlers
  const handleProductSubmit = async (productData: Product) => {
    try {
      if (editingProduct) {
        await updateProductDB(productData);
      } else {
        const newProduct = { ...productData, id: productData.id || Date.now().toString() };
        await addProductDB(newProduct);
      }
      await fetchAllData(); // Refresh data from DB
      setIsProductModalOpen(false);
      setEditingProduct(null);
    } catch (error: any) {
      console.error("Error submitting product:", error);
      if (error.name === 'ConstraintError') {
         alert(`Erro: SKU '${productData.sku}' já existe. O SKU deve ser único.`);
      } else {
         alert(`Erro ao salvar produto: ${error.message || 'Verifique o console para detalhes'}`);
      }
    }
  };

  const openEditProductModal = (product: Product) => {
    setEditingProduct(product);
    setIsProductModalOpen(true);
  };

  const openDeleteConfirmation = (type: 'product' | 'person', id: string) => {
    setItemToDelete({ type, id });
    setIsConfirmDialogOpen(true);
  };
  
  const handleDeleteProduct = async (productId: string) => {
    try {
      await deleteProductDB(productId);
      await fetchAllData(); // Refresh data
    } catch (error: any) {
      alert(`Erro ao excluir produto: ${error.message}`);
    }
  };


  // Person Handlers
  const handlePersonSubmit = async (personData: Person) => {
    try {
      if (editingPerson) {
        await updatePersonDB(personData);
      } else {
        const newPerson = { ...personData, id: personData.id || Date.now().toString() };
        await addPersonDB(newPerson);
      }
      await fetchAllData(); // Refresh
      setIsPersonModalOpen(false);
      setEditingPerson(null);
    } catch (error: any) {
      alert(`Erro ao salvar pessoa: ${error.message}`);
    }
  };

  const openEditPersonModal = (person: Person) => {
    setEditingPerson(person);
    setIsPersonModalOpen(true);
  };

  const handleDeletePerson = async (personId: string) => {
     try {
      await deletePersonDB(personId);
      await fetchAllData(); // Refresh
    } catch (error: any) {
      alert(`Erro ao excluir pessoa: ${error.message}`);
    }
  };

  const confirmDelete = async () => {
    if (itemToDelete) {
      if (itemToDelete.type === 'product') {
        const isProductInLog = outputLogs.some(log => log.productId === itemToDelete.id);
        if (isProductInLog) {
          alert("Este produto não pode ser excluído pois está registrado em um histórico de saídas. Remova os registros de saída primeiro ou considere desativar o produto.");
        } else {
          await handleDeleteProduct(itemToDelete.id);
        }
      } else if (itemToDelete.type === 'person') {
        const isPersonInLog = outputLogs.some(log => log.personId === itemToDelete.id);
        if (isPersonInLog) {
          alert("Esta pessoa não pode ser excluída pois está registrada em um histórico de saídas. Remova os registros de saída primeiro.");
        } else {
          await handleDeletePerson(itemToDelete.id);
        }
      }
      setItemToDelete(null);
    }
    setIsConfirmDialogOpen(false);
  };

  // Output Handlers
  const handleOutputSubmit = useCallback(async (outputData: Omit<OutputLog, 'id' | 'timestamp' | 'productName' | 'personName'>): Promise<boolean> => {
    const product = products.find(p => p.id === outputData.productId);
    const person = people.find(p => p.id === outputData.personId);

    if (!product || !person) {
      alert("Produto ou pessoa selecionada não encontrados.");
      return false;
    }

    if (product.quantity < outputData.quantity) {
      alert(`Não há ${product.name} suficiente em estoque. Disponível: ${product.quantity}`);
      return false;
    }

    const updatedProduct: Product = { ...product, quantity: product.quantity - outputData.quantity };
    const newLogEntry: OutputLog = {
      ...outputData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      productName: product.name,
      personName: person.name,
    };

    try {
      await recordProductOutputDB(newLogEntry, updatedProduct);
      await fetchAllData(); // Refresh all data
      setIsOutputModalOpen(false);
      return true;
    } catch (error: any) {
      alert(`Erro ao registrar saída: ${error.message}`);
      // Potentially revert local state changes if UI optimistically updated, though fetchAllData handles this.
      return false;
    }
  }, [products, people]); // Removed fetchAllData from dependencies to avoid loop, managed manually

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-neutral-light">
        <p className="text-xl text-primary-DEFAULT">Carregando dados...</p>
      </div>
    );
  }

  if (dbError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-neutral-light p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative max-w-md text-center" role="alert">
          <strong className="font-bold">Erro no Banco de Dados!</strong>
          <p className="block sm:inline mt-2">{dbError}</p>
          <p className="mt-2 text-sm">Por favor, tente recarregar a página. Se o problema persistir, verifique se o IndexedDB está habilitado e não bloqueado nas configurações do seu navegador.</p>
        </div>
      </div>
    );
  }

  const renderView = () => {
    switch(activeView) {
      case View.Dashboard:
        return <DashboardView products={products} people={people} outputLogs={outputLogs} />;
      case View.Products:
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-neutral-dark">Produtos</h2>
              <button 
                onClick={() => { setEditingProduct(null); setIsProductModalOpen(true); }}
                className="flex items-center bg-primary-DEFAULT text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors shadow"
              >
                <PlusIcon className="w-5 h-5 mr-2" /> Adicionar Produto
              </button>
            </div>
            <ProductList products={products} onEdit={openEditProductModal} onDelete={(id) => openDeleteConfirmation('product', id)} />
          </>
        );
      case View.People:
        return (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-semibold text-neutral-dark">Pessoas</h2>
              <button 
                onClick={() => { setEditingPerson(null); setIsPersonModalOpen(true); }}
                className="flex items-center bg-primary-DEFAULT text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors shadow"
              >
                <PlusIcon className="w-5 h-5 mr-2" /> Adicionar Pessoa
              </button>
            </div>
            <PersonList people={people} onEdit={openEditPersonModal} onDelete={(id) => openDeleteConfirmation('person', id)} />
          </>
        );
      case View.RecordOutput:
        return (
            <>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-semibold text-neutral-dark">Registrar Saída de Produto</h2>
                     {!isOutputModalOpen && (products.length > 0 && people.length > 0) && (
                        <button 
                            onClick={() => setIsOutputModalOpen(true)}
                            className="flex items-center bg-primary-DEFAULT text-white px-4 py-2 rounded-md hover:bg-primary-dark transition-colors shadow"
                        >
                            <PlusIcon className="w-5 h-5 mr-2" /> Registrar Nova Saída
                        </button>
                     )}
                </div>
                {isOutputModalOpen && (
                    <Modal isOpen={isOutputModalOpen} onClose={() => setIsOutputModalOpen(false)} title="Registrar Saída de Produto">
                        <OutputForm products={products} people={people} onSubmit={handleOutputSubmit} onClose={() => setIsOutputModalOpen(false)} />
                    </Modal>
                )}
                 {!isOutputModalOpen && (
                    <div className="bg-white p-6 rounded-lg shadow-md text-center">
                        {products.length === 0 && <p className="text-amber-600 mb-2">Nenhum produto cadastrado. Adicione produtos antes de registrar uma saída.</p>}
                        {people.length === 0 && <p className="text-amber-600 mb-2">Nenhuma pessoa cadastrada. Adicione pessoas antes de registrar uma saída.</p>}
                        {(products.length > 0 && people.length > 0) 
                            ? <p className="text-neutral-DEFAULT">Clique no botão acima para registrar uma nova saída de produto.</p>
                            : <p className="text-neutral-DEFAULT">Complete os cadastros necessários para habilitar o registro de saídas.</p>
                        }
                        <p className="text-sm text-neutral-DEFAULT mt-2">Certifique-se de que possui produtos com estoque disponível e pessoas cadastradas.</p>
                    </div>
                )}
            </>
        );

      case View.OutputLog:
        return (
          <>
            <h2 className="text-2xl font-semibold text-neutral-dark mb-6">Histórico de Saídas</h2>
            <OutputLogList outputLogs={outputLogs} />
          </>
        );
      default:
        setActiveView(View.Dashboard); // Fallback to dashboard
        return <DashboardView products={products} people={people} outputLogs={outputLogs} />;
    }
  };

  const getConfirmationMessage = () => {
    if (!itemToDelete) return "";
    const itemType = itemToDelete.type === 'product' ? 'produto' : 'pessoa';
    let message = `Tem certeza que deseja excluir este ${itemType}? Esta ação não pode ser desfeita.`;

    // Warnings for linked items are now handled before calling delete, so this message can be simpler.
    // However, keeping them can be a good double check if the pre-delete check fails or is bypassed.
    if (itemToDelete.type === 'product' && outputLogs.some(log => log.productId === itemToDelete.id)) {
        message += `\n\nAVISO: Este produto está referenciado em registros de saída. A exclusão não será permitida.`;
    }
    if (itemToDelete.type === 'person' && outputLogs.some(log => log.personId === itemToDelete.id)) {
        message += `\n\nAVISO: Esta pessoa está referenciada em registros de saída. A exclusão não será permitida.`;
    }
    return message;
  };


  return (
    <div className="min-h-screen bg-neutral-light">
      <Navbar activeView={activeView} setActiveView={setActiveView} />
      <main className="container mx-auto p-4 sm:p-6 lg:p-8">
        {renderView()}
      </main>

      <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title={editingProduct ? 'Editar Produto' : 'Adicionar Novo Produto'}>
        <ProductForm 
          onSubmit={handleProductSubmit} 
          onClose={() => setIsProductModalOpen(false)}
          initialData={editingProduct}
        />
      </Modal>

      <Modal isOpen={isPersonModalOpen} onClose={() => setIsPersonModalOpen(false)} title={editingPerson ? 'Editar Pessoa' : 'Adicionar Nova Pessoa'}>
        <PersonForm 
          onSubmit={handlePersonSubmit}
          onClose={() => setIsPersonModalOpen(false)}
          initialData={editingPerson}
        />
      </Modal>
      
      <ConfirmationDialog
        isOpen={isConfirmDialogOpen}
        onClose={() => setIsConfirmDialogOpen(false)}
        onConfirm={confirmDelete}
        title="Confirmar Exclusão"
        message={getConfirmationMessage()}
      />
    </div>
  );
};

export default App;
