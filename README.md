
# Sistema de Gerenciamento de Inventário - EstoqueFácil

## Descrição

**EstoqueFácil** é uma aplicação web local para gerenciamento de inventário de produtos. Ela permite o cadastro, alteração, exclusão de produtos (incluindo imagens), registro de pessoas e o rastreamento de saídas de produtos vinculadas a essas pessoas. A aplicação também conta com um dashboard para visualização de dados e relatórios. Todos os dados são armazenados localmente no navegador do usuário utilizando IndexedDB, garantindo privacidade e funcionamento offline após o primeiro carregamento.

## Funcionalidades Principais

*   **Gerenciamento de Produtos:**
    *   Cadastro de novos produtos com nome, SKU (único), quantidade, preço, descrição e imagem.
    *   Edição dos detalhes de produtos existentes.
    *   Exclusão de produtos (com verificação para evitar exclusão de itens em histórico de saídas).
    *   Upload e visualização de imagens para cada produto.
*   **Gerenciamento de Pessoas:**
    *   Cadastro de pessoas com nome e informações de contato.
    *   Edição dos detalhes de pessoas existentes.
    *   Exclusão de pessoas (com verificação para evitar exclusão de pessoas em histórico de saídas).
*   **Controle de Saídas:**
    *   Registro de saídas de produtos, vinculando um produto a uma pessoa e especificando a quantidade.
    *   Atualização automática da quantidade em estoque do produto.
    *   Visualização do histórico detalhado de todas as saídas.
*   **Dashboard Interativo:**
    *   Visão geral do inventário com métricas chave (total de produtos, valor do inventário, etc.).
    *   Filtros por período, produto e pessoa para analisar o histórico de saídas.
    *   Listagem de produtos com baixo estoque.
    *   Visualização das atividades recentes de saída.
    *   Exportação de relatórios de saídas filtradas para CSV.
*   **Armazenamento Local:**
    *   Utiliza IndexedDB para armazenar todos os dados diretamente no navegador do usuário, permitindo o uso offline (após o carregamento inicial dos scripts) e mantendo os dados privados.
*   **Interface Responsiva:**
    *   Design adaptável para uso em diferentes tamanhos de tela.

## Tecnologias Utilizadas

*   **Frontend:**
    *   HTML5
    *   CSS3 com Tailwind CSS (via CDN)
    *   TypeScript
    *   React 19 (via `esm.sh` e `importmap`)
*   **Armazenamento de Dados:**
    *   IndexedDB (API nativa do navegador)
*   **Ícones:**
    *   Heroicons (SVG)

## Configuração e Execução Local

Esta é uma aplicação puramente frontend e não requer um backend complexo para rodar.

**Pré-requisitos:**
*   Um navegador web moderno (Chrome, Firefox, Edge, Safari) com suporte a JavaScript, `importmap` e IndexedDB.

**Passos para Executar:**

1.  **Clone o Repositório (ou Baixe os Arquivos):**
    ```bash
    git clone https://github.com/seu-usuario/seu-repositorio.git
    cd seu-repositorio
    ```
    Ou, se você baixou os arquivos como ZIP, extraia-os para uma pasta.

2.  **Sirva os Arquivos Estáticos:**
    Como a aplicação usa módulos ES6 (`index.tsx`), você precisa servi-la através de um servidor HTTP local. Abrir o `index.html` diretamente do sistema de arquivos (`file:///`) pode não funcionar corretamente.

    *   **Usando Python (se tiver Python 3 instalado):**
        Navegue até a pasta raiz do projeto no seu terminal e execute:
        ```bash
        python3 -m http.server 8000
        ```
        (Você pode usar qualquer porta, como 8000, 8081, etc.)

    *   **Usando Node.js e `npx serve` (se tiver Node.js instalado):**
        Navegue até a pasta raiz do projeto no seu terminal e execute:
        ```bash
        npx serve .
        ```
        Ele geralmente iniciará o servidor na porta `3000` ou `5000`.

    *   **Usando a Extensão "Live Server" no VS Code:**
        Se você usa o Visual Studio Code, pode instalar a extensão "Live Server" de Ritwick Dey. Depois de instalada, abra a pasta do projeto no VS Code, clique com o botão direito no arquivo `index.html` e selecione "Open with Live Server".

3.  **Acesse a Aplicação no Navegador:**
    Abra seu navegador e vá para o endereço fornecido pelo servidor local:
    *   Se usou Python: `http://localhost:8000`
    *   Se usou `npx serve`: `http://localhost:3000` (ou a porta indicada no terminal)
    *   Se usou Live Server, ele deve abrir automaticamente.

## Como Funciona o Armazenamento de Dados

*   Todos os dados da aplicação (produtos, pessoas, histórico de saídas) são armazenados no **IndexedDB do seu navegador**.
*   Isso significa que os dados são **locais** àquele navegador e àquele perfil de usuário no seu computador.
*   Se você limpar os dados do site para este domínio no seu navegador, ou usar um navegador diferente, os dados não estarão lá.
*   Não há sincronização com a nuvem ou um servidor central; os dados são inteiramente gerenciados pelo seu navegador.
*   A aplicação precisará de conexão com a internet na primeira vez que for carregada para baixar o React e o Tailwind CSS dos CDNs. Após isso, os scripts podem ser cacheados pelo navegador, permitindo algum nível de funcionalidade offline.

## Estrutura dos Arquivos

```
.
├── README.md                # Este arquivo
├── index.html               # Ponto de entrada HTML
├── index.tsx                # Ponto de entrada do React
├── App.tsx                  # Componente principal da aplicação
├── db.ts                    # Lógica de interação com o IndexedDB
├── types.ts                 # Definições de tipos TypeScript
├── metadata.json            # Metadados da aplicação
└── components/              # Diretório para os componentes React
    ├── Navbar.tsx
    ├── ProductList.tsx
    ├── ProductForm.tsx
    ├── PersonList.tsx
    ├── PersonForm.tsx
    ├── OutputForm.tsx
    ├── OutputLogList.tsx
    ├── DashboardView.tsx
    ├── Modal.tsx
    ├── ConfirmationDialog.tsx
    └── icons.tsx
```

## Possíveis Melhorias Futuras

*   **Progressive Web App (PWA):** Adicionar um Service Worker para melhor performance offline e capacidade de "instalação".
*   **Backup/Restauração de Dados:** Funcionalidade para exportar todo o banco de dados IndexedDB para um arquivo e importá-lo posteriormente.
*   **Testes Unitários e de Integração.**
*   **Temas Adicionais ou Customização de UI.**
*   **Otimização de Imagens:** Compressão de imagens no lado do cliente antes de salvar para economizar espaço no IndexedDB.

## Contribuições

Contribuições são bem-vindas! Se você tiver sugestões, correções de bugs ou novas funcionalidades, sinta-se à vontade para abrir uma *Issue* ou enviar um *Pull Request*.

---

Divirta-se gerenciando seu inventário!
