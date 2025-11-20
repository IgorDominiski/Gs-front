# Futuro do Trabalho · Global Solution (Front-End)

SPA desenvolvida para a Global Solution – Front-End Design/Web Development. A proposta é simular uma rede colaborativa focada no futuro do trabalho, conectando talentos, competências e propósitos usando React + Tailwind CSS.

## ✨ Destaques

- Catálogo com 60 perfis fictícios carregados de um JSON local (`public/data/professionals.json`)
- Cards responsivos com foto, cargo, localização, área e skills principais
- Modal com informações completas: experiências, formações, certificações, projetos, idiomas, interesses e hobbies
- Sistema de busca + filtros por área, cidade e tecnologia
- Botões funcionais: recomendar profissional (contador em tempo real) e enviar mensagem (formulário com validação)
- Dark mode com persistência via `localStorage`
- Design responsivo construído 100% com Tailwind CSS

## 🧱 Stack

- [React 19](https://react.dev/)
- [Vite](https://vite.dev/)
- [Tailwind CSS 3](https://tailwindcss.com/)
- Dados mockados via JSON + script Node

## 📂 Estrutura do Projeto

```
gs_front/
├── public/
│   └── data/professionals.json   # 60 perfis simulados
├── scripts/
│   └── generateProfiles.mjs      # script para regenerar o JSON
├── src/
│   ├── App.jsx                   # SPA com cards, filtros e modal
│   ├── main.jsx                  # bootstrap React
│   └── index.css                 # Tailwind + estilos globais
├── tailwind.config.js
└── README.md
```

## ⚙️ Como rodar localmente

```bash
# 1. Clonar o repositório
git clone <url-do-repositorio> gs_front
cd gs_front

# 2. Instalar dependências
npm install

# 3. Executar em modo desenvolvimento
npm run dev

# 4. Acessar no navegador
http://localhost:5173
```

## 🗂️ Dataset

- Arquivo: `public/data/professionals.json`
- Possui 60 registros seguindo o esquema definido no enunciado (dados pessoais, acadêmicos, profissionais e comportamentais)
- Para regenerar ou customizar:

```bash
node scripts/generateProfiles.mjs
```

## 🚀 Deploy e Repositório

- **Deploy**: _adicionar link após publicação_
- **Repositório**: _adicionar link após push remoto_

> Durante a avaliação final, garantir ao menos 10 commits significativos no repositório, conforme solicitado pela disciplina.

## 👥 Integrantes

| Nome | RM |
| ---- | -- |
| _Adicione aqui os nomes e RMs do grupo_ | |

## 📄 Observações

- Não há autenticação ou usuários padrão.
- Antes de enviar para avaliação, remova a pasta `node_modules` do pacote compactado.
- Utilize `npm run build` e teste o resultado hospedado/estático para validar o deploy antes da entrega final.
