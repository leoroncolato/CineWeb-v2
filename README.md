# CineWeb Backend 🎬

## Visão Geral
O **CineWeb Backend** é uma API robusta desenvolvida para o gerenciamento de um sistema de cinemas. E desde o começo foi um projeto acadêmico, agora com outras caras. A aplicação suporta desde o cadastro de filmes e alocação de salas até a venda de ingressos e gestão de uma bomboniere integrada. O projeto foi construído com foco em escalabilidade, tipagem estrita e manutenibilidade.

## 🛠 Stack Tecnológica & Arquitetura

Este projeto adota uma arquitetura modular baseada em serviços, utilizando as seguintes tecnologias:

* **Linguagem:** TypeScript
* **Framework:** NestJS (Node.js)
* **Banco de Dados:** PostgreSQL
* **ORM:** Prisma ORM
* **Testes:** Jest (Unitários e E2E)
* **Padronização:** ESLint & Prettier

## 🗄️ Modelagem de Dados

A arquitetura de dados foi desenhada para garantir integridade referencial e evitar inconsistências (como conflitos de horários em salas). Os principais domínios incluem:

* **Filmes e Salas:** Gestão do catálogo e espaços físicos.
* **Sessões:** Controle de exibição com travas de unicidade (uma mesma sala não pode ter duas sessões simultâneas).
* **Ingressos:** Emissão de tickets vinculados diretamente às sessões, com suporte a tipos diferentes (Inteira/Meia).
* **Bomboniere (Lanches e Combos):** Módulo adicional atrelado aos ingressos, permitindo pedidos consolidados.