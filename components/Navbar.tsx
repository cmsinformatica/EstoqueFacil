import React from 'react';
import { View } from '../types';
import { BoxIcon, UsersIcon, DocumentArrowUpIcon, DocumentTextIcon, ChartBarIcon } from './icons';

interface NavbarProps {
  activeView: View;
  setActiveView: (view: View) => void;
}

const NavItem: React.FC<{
  label: string;
  view: View;
  activeView: View;
  setActiveView: (view: View) => void;
  icon: React.ReactNode;
}> = ({ label, view, activeView, setActiveView, icon }) => (
  <button
    onClick={() => setActiveView(view)}
    className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${activeView === view
                  ? 'bg-primary-DEFAULT text-white'
                  : 'text-neutral-DEFAULT hover:bg-primary-light hover:text-white'
                }`}
  >
    {icon}
    <span>{label}</span>
  </button>
);

const Navbar: React.FC<NavbarProps> = ({ activeView, setActiveView }) => {
  return (
    <nav className="bg-white shadow-md p-4 sticky top-0 z-40">
      <div className="container mx-auto flex flex-wrap justify-between items-center">
        <div className="text-2xl font-bold text-primary-dark">
          Estoque<span className="text-primary-DEFAULT">Fácil</span>
        </div>
        <div className="flex flex-wrap space-x-1 sm:space-x-2 mt-2 sm:mt-0">
          <NavItem label="Dashboard" view={View.Dashboard} activeView={activeView} setActiveView={setActiveView} icon={<ChartBarIcon className="w-5 h-5" />} />
          <NavItem label="Produtos" view={View.Products} activeView={activeView} setActiveView={setActiveView} icon={<BoxIcon className="w-5 h-5" />} />
          <NavItem label="Pessoas" view={View.People} activeView={activeView} setActiveView={setActiveView} icon={<UsersIcon className="w-5 h-5" />} />
          <NavItem label="Registrar Saída" view={View.RecordOutput} activeView={activeView} setActiveView={setActiveView} icon={<DocumentArrowUpIcon className="w-5 h-5" />} />
          <NavItem label="Histórico de Saídas" view={View.OutputLog} activeView={activeView} setActiveView={setActiveView} icon={<DocumentTextIcon className="w-5 h-5" />} />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;