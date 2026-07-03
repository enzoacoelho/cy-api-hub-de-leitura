# HUB DE LEITURA - E2E (Testes de API)

Testes end-to-end de API desenvolvidos com Cypress sobre o [Hub de Leitura Integrado](https://github.com/EBAC-QE/hub-de-leitura-integrado), um sistema de biblioteca completo desenvolvido especialmente pela EBAC para estudos de QA, testes e automação.

## ℹ️ Sobre o projeto

Este projeto cobre os fluxos principais e regras de negócio de uma API de biblioteca full-stack. O sistema simula o funcionamento real de um acervo literário que gerencia acessos para usuários comuns e administradores (responsáveis pelo catálogo, usuários e controle do sistema), aplicando regras estritas de reservas, devoluções, controle de cestas e disponibilidade de livros.

## 🛠️ Tecnologias utilizadas

- Cypress (Automação de API)
- JavaScript
- NPM
- Allure Report (Relatório de execução dos testes)
- GitHub Actions (Integração Contínua - CI)

### 🎯 O que foi validado

* **Autenticação (`auth/`)** — Processos de login, cadastro de novos usuários e validação de segurança via tokens de autenticação.
* **Sistema (`system/`)** — Checagem de saúde da API (*healthcheck*) e coleta de informações gerais do servidor.
* **Usuários (`users/`)** — Gerenciamento completo de contas (listar, cadastrar, atualizar e remover usuários).
* **Livros (`books/`)** — Controle total do catálogo de livros (criar, listar, editar e remover títulos do acervo).
* **Reservas (`reservations/`)** — Fluxo de reservas de livros, listagem de solicitações em aberto, cancelamentos e atualizações de status.
* **Cesta (`basket/`)** — Gerenciamento da cesta temporária de livros (adicionar itens, listar conteúdo atual e editar quantidades).

## 📋 Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:
* Node.js (versão 18 ou superior recomendada)
* NPM (gerenciador de pacotes, já incluso no Node)

---

## 🚀 Como executar

Este projeto contém **apenas os testes de API**. O servidor da biblioteca precisa ser clonado e executado separadamente.

**1. Suba a API (Hub de Leitura Integrado)**

Em um terminal, clone o repositório oficial do servidor e inicialize a aplicação:
```bash
git clone [https://github.com/EBAC-QE/hub-de-leitura-integrado.git](https://github.com/EBAC-QE/hub-de-leitura-integrado.git)
cd hub-de-leitura-integrado
npm install
npm start
```

📖 API Docs (Swagger): Com o servidor rodando, você pode acessar e consultar a documentação detalhada e todos os endpoints disponíveis em: http://localhost:3000/api-docs

**2. Em outro terminal, clone e configure este repositório de testes**
```bash
git clone [https://github.com/enzoacoelho/cy-api-hub-de-leitura.git](https://github.com/enzoacoelho/cy-api-hub-de-leitura.git)
cd cy-api-hub-de-leitura
npm install
```

### 3. Com a API já rodando, execute os testes

Você pode utilizar os seguintes comandos configurados no `package.json`:

| Script | Descrição |
|---|---|
| `npm run cy:open` | Abre a interface gráfica do Cypress para execução visual dos testes de API |
| `npm run cy:run` | Executa a suíte de testes de API em modo headless (segundo plano) |
| `npm run allure:generate` | Lê a pasta de resultados e compila o relatório estático do Allure |
| `npm run allure:open` | Abre localmente o relatório gerado do Allure no seu navegador padrão |

---

## 📊 Relatório de testes (Allure)

Para gerar e visualizar o relatório HTML dinâmico com os gráficos de resposta e status dos endpoints testados, execute a sequência de comandos após rodar os testes em modo headless:

```bash
# Compila os arquivos JSON em HTML limpo
npm run allure:generate

# Abre o painel do Allure no seu navegador
npm run allure:open
```
---

## 🔄 Integração Contínua (CI)

Este projeto conta com um pipeline automatizado via **GitHub Actions** configurado para rodar a cada `push` ou `pull_request` nas branches `main` e `master`.

O workflow executa as seguintes etapas no servidor de integração:

* **Checkout do projeto de testes** — Baixa o código do próprio projeto de testes onde o workflow está rodando.
* **Clone e inicialização da API** — Clona e inicia a API do servidor em segundo plano de forma efêmera (`enzoacoelho/hub-de-leitura-integrado`).
* **Verificação de prontidão** — Aguarda o tempo necessário para o servidor estar totalmente online.
* **Execução dos testes** — Roda os testes de API via Cypress (`npm run cy:run`).
* **Geração do relatório** — Compila os resultados brutos em um relatório completo do Allure.
* **Armazenamento de artefatos** — Disponibiliza o relatório final consolidado (`allure-html-report`) como um artefato de download por até 10 dias.
