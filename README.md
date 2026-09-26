# Worknoon AI-Powered Customer Support Refund System

A production-minded, fully containerized full-stack web application designed for **WORKNOON**. This system intelligently processes, approves, denies, or escalates e-commerce refund requests using a resilient hybrid architecture combining **Deterministic Business Rules** with **Probabilistic GenAI Inference Layers** powered by Google's latest **Gemini 3.8 Flash** engine.

---

## 🏗️ System Architecture

The application is explicitly engineered with a clean separation of concerns across distinct infrastructure tiers:

```
                          +-----------------------------------+
                          |      Next.js Frontend Client      |
                          |   (Chat Hub & Admin Dashboard)    |
                          +-----------------+-----------------+
                                            |
                                 REST HTTP  | (JSON API)
                                            v
                          +-----------------+-----------------+
                          |     Node.js / Express Backend     |
                          |   (TypeScript Dev / Build Engine) |
                          +--------+-----------------+--------+
                                   |                 |
                   Local File I/O  |                 | Secure SDK HTTPS
                                   v                 v
                 +-----------------+---+   +---------+---------+
                 |  Mock CRM Database  |   | Google Gen AI API |
                 | (15 Customer Cases) |   | (Gemini 3.8 Flash)|
                 +---------------------+   +-------------------+
```

### 1. Deterministic Rule Engine (Hard Defenses)
To prevent prompt injection exploits, boundary condition bypasses, and unnecessary LLM execution token fees, the system evaluates all inbound traffic against hard-coded boundary constraints **before** invoking the AI tier:
* **Final Sale Verification:** Instantly blocks requests for items purchased under non-refundable clearance terms.
* **Temporal Windows Limit:** Enforces a strict 30-day transactional return duration window from the relative base timeline.
* **Financial Value Thresholds:** Automatically escalates any high-value transactions exceeding \$500 to require human verification.

### 2. Probabilistic Gen AI Evaluation & Resiliency Layer
When queries fall into contextual policy areas (e.g., assessing claims of damaged goods or wrong orders), control drops to the AI Orchestration layer:
* **Structured Input Payload Binding:** Injecting raw customer claims alongside rigid mock order metadata variables directly.
* **Strict Schema Contracts:** Leverages native `responseSchema` parameters to strictly enforce a typed output structural model (`Approved`, `Denied`, or `Escalated` status enums along with a `reasoning` justification string).
* **High-Availability Multi-Tier Fallback:** If the primary `gemini-3.8-flash` production node undergoes a temporary cluster capacity spike or rate limit (HTTP 503), the engine catches the exception and routes to a high-throughput fallback node (`gemini-3.5-flash-lite`).

---

## 🗄️ Pre-Seeded Evaluation Scenarios (Nigerian Profiles)

The system includes a pre-seeded mockup CRM (`mockDb.json`) containing **15 custom user and order context states** representing distinct evaluation parameters:
1. **Chidi Okafor (ORD-001):** Valid window, standard amount -> Routes to AI for validation.
2. **Amara Bello (ORD-002):** Value over \$500 (\$650.00) -> Deterministic **Escalation**.
3. **Tunde Bakare (ORD-003):** Clear marked clearance flag -> Deterministic **Denial** (Final Sale).
4. **Funmi Adebayo (ORD-004):** Dated 2026-05-01 (Exceeds 30 days) -> Deterministic **Denial** (Expired Window).
5. ...and 11 additional distinct matrix data paths containing varying parameters (low, medium, high risk scores) to test compliance boundaries comprehensively.

---

## 🚀 Setup & Execution Guide

### Prerequisites
* [Node.js](https://nodejs.org/) (v18+ recommended)
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (Required for containerized deployment review)

### Local Development Quickstart (No Docker)
To rapidly run and inspect the runtime loop across standard system contexts, initialize the processes locally across two terminal split segments:

#### Terminal 1: Backend API Engine
```bash
cd backend
npm install
# Create a local .env file inside /backend with:
# GEMINI_API_KEY=your_actual_api_key_string
# PORT=5000
npm run dev
```

#### Terminal 2: Frontend Dashboard UI
```bash
cd frontend
npm install
npm run dev
```
Open `http://localhost:3000` to interact with the interface panels.

### Unified Production Containerization (Docker Compose)
To launch the complete infrastructure stack inside an isolated multi-container mesh with one single instruction, configure your root environment variables and execute:

```bash
# 1. Create a root .env file configuration string:
# GEMINI_API_KEY=your_actual_api_key_string

# 2. Build and launch all infrastructure services seamlessly
docker compose up --build
```
* **Client Frontend Panel Interface:** accessible at `http://localhost:3000`
* **Core REST Express Service Engine:** listening securely at `http://localhost:5000`

---




