# 🚗 Autochek Vehicle Financing & Valuation API

This task implements a backend API to support **Autochek’s vehicle valuation and loan financing** services using **NestJS**, **TypeORM**, and **SQLite**.

The system enables:

- Vehicle ingestion and valuation
- Loan application processing
- Offer generation and eligibility checks

---

## Overview

The application provides endpoints that allow users to:

- Register and authenticate
- Submit and fetch vehicle details
- Request vehicle valuations (via mock or API integration)
- Apply for loans using vehicles as collateral
- Generate loan offers and check eligibility

It also includes:

- Role-based access control (Admin, User)
- End-to-end (E2E) tests with Jest and Supertest

---

## Tech Stack

| Component          | Technology                    |
| ------------------ | ----------------------------- |
| **Framework**      | [NestJS](https://nestjs.com)  |
| **ORM**            | [TypeORM](https://typeorm.io) |
| **Database**       | SQLite                        |
| **Language**       | TypeScript                    |
| **Testing**        | Jest + Supertest              |
| **Authentication** | JWT (JSON Web Token)          |

---

## Setup Instructions

### 1. Clone the Repository

```bash
git clone git@github.com:gabrieladeremi/auto-check-task.git
cd auto-check-task
```

### 2. Install dependencies

```bash
npm install
```

### 3. Start the server, it should start on localhost:3000

```bash
npm run start:dev
```

## Testing

```bash
npm run test
```

Tests cover:
- Authentication flow
- Vehicle ingestion
- Valuation requests
- Loan creation and eligibility
- Offer generation and acceptance logic

## API Documentation

Full API documentation (with request and response examples) is available here:

👉 View API Documentation
https://documenter.getpostman.com/view/26718931/2sB3WsNzF2
