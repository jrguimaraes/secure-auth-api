# 🔐 Secure Auth API

API de autenticação construída com Node.js e TypeScript, focada em boas práticas de segurança e arquitetura backend.

---

## 🚀 Tecnologias

- Node.js + Express
- TypeScript
- PostgreSQL + Prisma
- JWT
- Argon2
- Zod
- Vitest + Supertest

---

## 🔐 Funcionalidades

- Registro e login de usuário
- Autenticação com JWT
- Refresh Token via cookie httpOnly
- Refresh Token Rotation
- Reuse Detection (revogação de sessão)
- Rota protegida (`/auth/me`)

---

## 🏗️ Arquitetura

Estrutura baseada em separação de responsabilidades:

```
route → controller → use case → database (Prisma)
```

Organização:

```
src
├── main
├── modules
└── shared
```

---

## ⚙️ Como rodar

```bash
npm install
docker-compose up -d
npx prisma migrate dev
npm run dev
```

---

## 📡 Principais endpoints

- POST /auth/register  
- POST /auth/login  
- POST /auth/refresh  
- POST /auth/logout  
- GET /auth/me  

---

## 🧪 Testes

```bash
npm test
```

Cobertura do fluxo principal:
- login
- autenticação
- refresh token
- reuse detection

---

## 📌 Objetivo

Projeto desenvolvido para demonstrar:

- autenticação segura com JWT
- arquitetura backend organizada
- boas práticas em APIs Node.js
