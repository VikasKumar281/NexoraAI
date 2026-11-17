# NexoraAI 🚀

<p align="center">
  <strong>A multi-agent AI workspace for chat, coding, research, documents, and visual understanding.</strong>
</p>

<p align="center">
  <a href="https://github.com/VikasKumar281/NexoraAI">GitHub Repository</a> ·
  <a href="https://github.com/VikasKumar281/NexoraAI/issues">Report an Issue</a>
</p>

---

## Table of Contents 📚

- [🌟 1. Overview](#1-overview)
- [✨ 2. Features](#2-features)
- [🔄 3. How NexoraAI Works](#3-how-nexoraai-works)
- [🧰 4. Technology Stack](#4-technology-stack)
- [🏗️ 5. Architecture](#5-architecture)
- [📁 6. Project Structure](#6-project-structure)
- [✅ 7. Prerequisites](#7-prerequisites)
- [⚙️ 8. Local Setup](#8-local-setup)
- [🔐 9. Environment Variables](#9-environment-variables)
- [▶️ 10. Run the Application](#10-run-the-application)
- [🤖 11. AI Agent Workflows](#11-ai-agent-workflows)
- [🔌 12. API Reference](#12-api-reference)
- [🗄️ 13. Data, Sessions, and File Storage](#13-data-sessions-and-file-storage)
- [☁️ 14. Deployment on Render](#14-deployment-on-render)
- [🛠️ 15. Troubleshooting](#15-troubleshooting)
- [🔒 16. Security Notes](#16-security-notes)
- [🚧 17. Future Improvements](#17-future-improvements)
- [👨‍💻 18. Author](#18-author)

---

## 1. Overview 🌟

**NexoraAI** is a full-stack AI workspace that brings multiple AI capabilities into one application. Instead of using a separate tool for every task, users can chat, ask for current information, generate code, create PDF documents and PowerPoint presentations, generate images, and analyze uploaded files from one interface.

The backend uses a LangGraph workflow to decide which specialist agent should handle a request. Users can let the application select an agent automatically or choose an agent directly.

The project is organized into modular backend domains:

- **Auth** — authentication, user sessions, plans, and credits.
- **Chat** — conversations, messages, and conversation management.
- **Billing** — subscription checkout and payment verification.
- **Agent** — prompt routing and AI task execution.
- **Gateway/shared modules** — request protection and reusable backend functionality.

The current production setup uses a **combined Express server** in `backend/server.js`. The modular service folders remain in the codebase, while the Render blueprint deploys a single web service and a Redis instance.

## 2. Features ✨

| Feature | What it does |
| --- | --- |
| 💬 AI Chat | Answers general questions and maintains conversation context. |
| 🧭 Automatic Agent Routing | Selects a specialist based on the prompt or uploaded file. |
| 🔎 Web Search | Retrieves current web information through Tavily. |
| 💻 Coding Assistant | Generates code projects and helps explain, review, convert, or debug code. |
| 📄 PDF Generation | Creates a downloadable PDF from a topic or instruction. |
| 📊 PowerPoint Generation | Creates a downloadable presentation. |
| 🎨 Image Generation | Converts a text request into an image-generation prompt and retrieves a generated image. |
| 📚 PDF RAG | Extracts text from an uploaded PDF, retrieves relevant chunks, and answers from that document. |
| 🖼️ Image Analysis | Analyzes an uploaded image and can explain visible text, charts, and other content. |
| 🗂️ Conversation Management | Creates, lists, updates, and deletes conversations. |
| 🔐 Authentication | Uses Firebase Authentication and a server-managed session. |
| 🎟️ Credits and Limits | Applies agent-specific usage limits and credit deductions. |
| 💳 Billing | Creates Razorpay orders and verifies payment signatures. |
| 📦 Generated Artifacts | Makes generated files available through temporary download links. |

> Feature availability depends on configuring the relevant database, Redis instance, and provider credentials. A frontend build alone does not validate external integrations.

## 3. How NexoraAI Works 🔄

At a high level, a request travels through the following path:

```text
User
  |
  v
React + Vite Frontend
  |
  | HTTP request (Axios, cookie credentials)
  v
Express Backend (backend/server.js)
  |
  +---- Authentication / session protection
  |
  +---- Chat routes
  |
  +---- Billing routes
  |
  +---- Agent route
          |
          v
       LangGraph Workflow
          |
          v
       Prompt / File Router
          |
          +---- Chat Agent
          +---- Search Agent
          +---- Coding Agent
          +---- PDF Agent
          +---- PPT Agent
          +---- Vision Agent
          +---- PDF RAG Agent
          +---- Image Analyzer Agent
          |
          v
       Save conversation and response
          |
          v
       Return answer / artifact links
          |
          v
       React UI
```

### Request lifecycle 🔄

1. The user signs in through the frontend.
2. Firebase Authentication provides an ID token.
3. The frontend sends the token to the backend login endpoint.
4. The backend verifies the token and creates a server-side session.
5. Protected API requests include the session cookie.
6. The user sends a prompt, selects an agent, or uploads a supported file.
7. The backend passes the request into the LangGraph workflow.
8. The router selects the relevant specialist agent.
9. The selected agent calls its configured model or external integration.
10. The backend stores the user and assistant messages and returns the result.
11. The frontend renders the response, image, or downloadable artifact.

The agent upload endpoint accepts multipart form data and uses the field name `file`.

## 4. Technology Stack 🧰

### Frontend 💻

| Technology | Responsibility |
| --- | --- |
| React 19 | Component-based user interface. |
| Vite | Development server and production build. |
| Redux Toolkit | Application state management. |
| React Redux | Connects React components to the Redux store. |
| Axios | HTTP requests to the backend. |
| Firebase Web SDK | Browser-side authentication. |
| Tailwind CSS 4 | Utility-first styling. |
| Motion | UI animations. |
| Monaco Editor | Code editing and display. |
| React Markdown | Markdown response rendering. |
| Lucide React / React Icons | Interface icons. |

### Backend ⚙️

| Technology | Responsibility |
| --- | --- |
| Node.js (20+) | JavaScript runtime. |
| Express 5 | HTTP server and API routes. |
| MongoDB + Mongoose | Persistent application data. |
| Redis / ioredis | Session and short-lived application data. |
| Firebase Admin | Verification of Firebase ID tokens. |
| LangChain | Model and tool integrations. |
| LangGraph | State-based agent workflow and routing. |
| Multer | Multipart file uploads. |
| PDF Parse | PDF text extraction. |
| PDFKit | PDF document generation. |
| PptxGenJS | PowerPoint generation. |
| Razorpay SDK | Payment order and verification integration. |

### External integrations 🔗

- **Google Gemini** — model and embedding integration used by relevant workflows.
- **Groq** — chat and model execution.
- **OpenRouter** — coding model integration.
- **Tavily** — web search.
- **Qdrant** — vector storage and similarity search for PDF RAG.
- **Firebase** — user authentication.
- **MongoDB** — persistent records.
- **Redis** — session, memory, and rate-limit support.
- **Razorpay** — payment processing.
- **AWS S3 helpers** — retained in the repository for an earlier storage path; current document/image generation uses temporary local file storage.

## 5. Architecture 🏗️

### Backend ⚙️ modules

| Module | Responsibility |
| --- | --- |
| Gateway | Session-protected entry points and current-user lookup. |
| Auth | Firebase token verification, login/logout, user records, plans, and credit operations. |
| Chat | Conversation and message persistence. |
| 💳 Billing | Razorpay order creation and signature verification. |
| Agent | Agent request handling and LangGraph execution. |
| Shared | Reusable MongoDB connection and internal controller-call helpers. |

### Current deployment model 🚀

The backend has separate module directories, but the active Render start command is:

```bash
node backend/server.js
```

That server mounts the Auth, Chat, Billing, and Agent routes in one Node process. Do not assume that the current Render blueprint starts one independent container for every module.

## 6. Project Structure 📁

The following is a high-level map of the important project directories:

```text
NexoraAI/
│
├── .env.example
├── .gitignore
├── render.yaml
├── README.md
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
│   ├── index.html
│   ├── utils/
│   │   ├── axios.js
│   │   └── firebase.js
│   └── src/
│       ├── App.jsx
│       ├── main.jsx
│       ├── components/
│       ├── features/
│       ├── pages/
│       ├── redux/
│       └── assets/
│
└── backend/
    ├── package.json
    ├── server.js
    ├── loadEnv.js
    ├── docker-compose.yml
    │
    ├── gateway/
    │   ├── controllers/
    │   ├── middleware/
    │   └── utils/
    │
    ├── shared/
    │   ├── callHandler.js
    │   ├── mongo.js
    │   └── redis/
    │
    └── services/
        ├── auth/
        │   ├── config/
        │   ├── controllers/
        │   ├── models/
        │   └── routes/
        │
        ├── chat/
        │   ├── config/
        │   ├── controllers/
        │   ├── models/
        │   └── routes/
        │
        ├── billing/
        │   ├── config/
        │   ├── controllers/
        │   ├── models/
        │   └── routes/
        │
        └── agent/
            ├── agents/
            ├── config/
            ├── controllers/
            ├── graph/
            ├── routes/
            ├── utils/
            └── temp/
```

### Important folders and files 🗂️

| Path | What it contains |
| --- | --- |
| `frontend/src/components/` | Reusable interface elements such as chat, sidebar, composer, and artifact views. |
| `frontend/src/features/` | Frontend feature/API logic. |
| `frontend/src/redux/` | Redux store and state slices. |
| `frontend/utils/axios.js` | Axios instance; includes cookies with `withCredentials: true`. |
| `frontend/utils/firebase.js` | Firebase browser app and Google provider initialization. |
| `backend/server.js` | Main Express server, middleware, route mounting, health check, static frontend, and file serving. |
| `backend/loadEnv.js` | Loads backend/root environment files and maps service-local MongoDB values. |
| `backend/gateway/middleware/` | Request authentication protection. |
| `backend/shared/` | Shared database and internal service helpers. |
| `backend/services/auth/` | Authentication, user, plan, and credit logic. |
| `backend/services/chat/` | Conversation/message models and controllers. |
| `backend/services/billing/` | Payment records, Razorpay integration, and billing routes. |
| `backend/services/agent/agents/` | Individual specialist agents. |
| `backend/services/agent/graph/` | LangGraph state, router, and workflow. |
| `backend/services/agent/config/` | Model, memory, Redis, embedding, Qdrant, Tavily, upload, and limits configuration. |
| `backend/services/agent/utils/` | PDF/PPT generation, credit handling, and generated-file helpers. |
| `render.yaml` | Render service blueprint. |

## 7. Prerequisites ✅

Install the following before starting local development:

1. **Node.js 20 or newer.** Node 22 is configured in the Render blueprint.
2. **npm**, included with Node.js.
3. **Git**, to clone the repository.
4. A **MongoDB** database or MongoDB Atlas cluster.
5. A **Redis** instance.
6. A **Firebase project** with Authentication configured.
7. API credentials for the AI providers and integrations used by the features you plan to run.
8. A **Qdrant** endpoint and key for PDF RAG.
9. **Razorpay** test credentials to test billing.

You do not need to configure every external provider to start the frontend and backend, but a feature that depends on an unconfigured integration will not work.

## 8. Local Setup ⚙️

Follow these steps in order.

### Step 1 — Clone the repository 📥

Open PowerShell, Windows Terminal, or a shell and run:

```bash
git clone https://github.com/VikasKumar281/NexoraAI.git
cd NexoraAI
```

This downloads the source code and moves your terminal into the project root.

### Step 2 — Install backend dependencies 📦

From the repository root:

```bash
npm install --prefix backend
```

This installs packages from `backend/package.json`. The backend uses ES modules, as indicated by `"type": "module"`.

### Step 3 — Create the backend environment file 📝

The repository contains a root `.env.example`. Copy it into the backend directory.

**Windows PowerShell:**

```powershell
Copy-Item .env.example backend/.env
```

**macOS / Linux:**

```bash
cp .env.example backend/.env
```

Open `backend/.env` in your editor. Add your own connection strings and secrets. The next section explains each variable.

### Step 4 — Set up MongoDB 🍃

Create the required databases or connection strings. The application reads four logical MongoDB connection variables:

- `AUTH_MONGODB_URI` — user and authentication data.
- `CHAT_MONGODB_URI` — conversation and message data.
- `BILLING_MONGODB_URI` — payment data.
- `AGENT_MONGODB_URI` — agent service data.

They can refer to separate databases within one MongoDB Atlas cluster, or to separately hosted databases. Make sure the database network access rules allow your local machine or deployment host to connect.

Example format (replace with your own values):

```env
AUTH_MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<auth_database>
CHAT_MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<chat_database>
BILLING_MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<billing_database>
AGENT_MONGODB_URI=mongodb+srv://<username>:<password>@<cluster>/<agent_database>
```

Do not paste real credentials into source code or commit them.

### Step 5 — Set up Redis ⚡

Create a Redis instance and put its connection URL in `backend/.env`.

For a local Redis server, the usual local URL is:

```env
REDIS_URL=redis://localhost:6379
```

For a managed Redis provider, use the provider's TLS or non-TLS connection URL exactly as supplied. The app uses Redis-backed functionality such as session/memory/rate-limit support; the exact required behavior depends on the route or agent being exercised.

### Step 6 — Configure Firebase Authentication 🔥

1. Open the Firebase Console.
2. Create or select a Firebase project.
3. Enable the sign-in provider used by the application (Google Authentication).
4. Register a Web App in the Firebase project.
5. Copy the Web API key into the frontend environment file in Step 7.
6. Generate a Firebase Admin service-account credential from the Firebase project settings.
7. Supply the service-account JSON securely to the backend through `FIREBASE_SERVICE_ACCOUNT`.

The frontend uses the Firebase Web SDK. The backend uses Firebase Admin to verify the ID token before establishing the application session.

Keep the Admin service-account private key secret. Never place it in a `VITE_*` variable.

### Step 7 — Configure the frontend environment 🎨

Create `frontend/.env`:

```env
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_RAZORPAY_KEY_ID=your_razorpay_public_key_id
VITE_SERVER_URL=http://localhost:8000
```

Explanation:

- `VITE_FIREBASE_API_KEY` configures the Firebase browser SDK.
- `VITE_RAZORPAY_KEY_ID` is the public key ID used by the browser checkout flow.
- `VITE_SERVER_URL` tells Axios where the API is hosted. For local development, use port 8000.

Vite exposes variables prefixed with `VITE_` in the browser bundle. Never put private API keys, database credentials, Firebase Admin JSON, or Razorpay secret keys in frontend variables.

### Step 8 — Configure AI and integration providers 🧠

Add only the credentials for the features you intend to test. See the environment-variable table below.

- Chat and several general model operations use Groq.
- Coding uses OpenRouter in the current model configuration.
- Image analysis uses Google Gemini.
- Web search uses Tavily.
- PDF RAG uses Google embeddings/model access and Qdrant.
- Billing uses Razorpay.

The current model factory and agent code determine which provider is used for each workflow. A missing key may cause that specific operation to fail even if the application starts successfully.

### Step 9 — Check the environment files 🔍

Before starting, confirm:

- `backend/.env` exists and contains server-side values.
- `frontend/.env` exists and contains the required public Vite values.
- MongoDB connection strings are correct and accessible.
- Redis is reachable.
- Firebase Web and Admin configuration belong to the intended project.
- Provider keys are valid.
- No secret file is being staged for Git.

## 9. Environment Variables 🔐

The repository's `.env.example` is the environment-variable reference. Use it as the starting point.

### Backend ⚙️ variables

| Variable | Required for | Description |
| --- | --- | --- |
| `AUTH_MONGODB_URI` | Auth | MongoDB connection string for authentication and user records. |
| `CHAT_MONGODB_URI` | Chat | MongoDB connection string for conversations and messages. |
| `BILLING_MONGODB_URI` | 💳 Billing | MongoDB connection string for payment records. |
| `AGENT_MONGODB_URI` | Agent | MongoDB connection string for the agent module. |
| `REDIS_URL` | Redis-backed functionality | Redis connection URL. |
| `FIREBASE_SERVICE_ACCOUNT` | Login | Firebase Admin service-account JSON value. |
| `FRONTEND_URL` | CORS | Allowed frontend origin. For local frontend/backend development, use `http://localhost:5173`; when using the combined same-origin setup, configure the deployed origin as appropriate. |
| `GOOGLE_API_KEY` | Gemini / embeddings | Google AI API key. |
| `GROQ_API_KEY` | Groq models | Groq API key. |
| `OPENROUTER_API_KEY` | Coding model | OpenRouter API key. |
| `TAVILY_API_KEY` | 🔎 Web Search | Tavily API key. |
| `QDRANT_URL` | 📚 PDF RAG | Qdrant endpoint URL. |
| `QDRANT_API_KEY` | 📚 PDF RAG | Qdrant API key. |
| `RAZORPAY_KEY_ID` | 💳 Billing | Razorpay server-side key ID. |
| `RAZORPAY_KEY_SECRET` | 💳 Billing | Razorpay secret used by the backend for payment operations and signature verification. |

### Frontend 💻 variables

| Variable | Description |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Firebase Web API key. |
| `VITE_RAZORPAY_KEY_ID` | Public Razorpay key ID for checkout. |
| `VITE_SERVER_URL` | Backend base URL. Use `http://localhost:8000` locally. Keep empty when the frontend and API are served by the same host. |

### Optional / legacy AWS values ☁️

The example environment file includes commented AWS variables:

- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_KEY`
- `AWS_BUCKET_NAME`

S3 helper code is present, but the current PDF/PPT/image generation agents save files to the server's temporary directory. These AWS values are not required by the active local/Render file-generation path.

## 10. Run the Application ▶️

Start the frontend and backend in separate terminals.

### Terminal 1 — Start the backend 🚀

From the repository root:

```bash
npm run dev --prefix backend
```

The backend's development script uses Node's watch mode. The default local port is **8000** unless overridden by `PORT`.

You should see a log similar to:

```text
NexoraAI listening on 8000
```

### Terminal 2 — Install frontend dependencies 📦

From the repository root:

```bash
npm install --prefix frontend
```

### Terminal 2 — Start the frontend 🌐

```bash
npm run dev --prefix frontend
```

Vite prints the local development URL in the terminal, commonly:

```text
http://localhost:5173
```

Open the URL printed by Vite in your browser.

### Build the frontend 🏗️

To create a production build:

```bash
npm run build --prefix frontend
```

Vite writes the production bundle to `frontend/dist`. The combined backend server serves this folder in production.

### Run backend in production mode locally ✅

After building the frontend:

```bash
npm start --prefix backend
```

The backend start script runs `node server.js`.

## 11. AI Agent Workflows 🤖

NexoraAI uses a LangGraph state graph. The workflow begins at the router node, then follows the route selected for the current request.

### 11.1 Automatic routing 🧭

When the agent field is `auto` or no specific agent has been selected, the router checks the uploaded file and prompt.

Current routing behavior includes:

| Input | Selected agent |
| --- | --- |
| Uploaded PDF | `pdfRag` |
| Uploaded image | `imageAnalyzer` |
| Prompt asking for slides or a presentation | `ppt` |
| Prompt asking to generate a PDF | `pdf` |
| Prompt asking for current/latest information | `search` |
| Prompt containing common coding/debugging terms | `coding` |
| Simple greeting | `chat` |
| Other prompts | Model-assisted routing, with chat as the workflow fallback |

If a user explicitly selects an agent other than `auto`, the router keeps that selection.

### 11.2 Chat Agent 💬

**Purpose:** General-purpose conversation and explanations.

Flow:

1. Checks the configured chat usage limit.
2. Loads recent conversation memory from Redis-backed agent memory.
3. Builds the system and conversation messages.
4. Invokes the configured chat model.
5. Deducts the relevant credits.
6. Returns the assistant response to the agent controller.

### 11.3 Search Agent 🔎

**Purpose:** Retrieve current information from the web.

Flow:

1. Checks the user's search-agent limit.
2. Sends the prompt to the configured Tavily search tool.
3. Compacts the answer and a small number of search results.
4. Deducts credits.
5. Passes search context to the chat agent for the final user-facing answer.

Search requires a valid `TAVILY_API_KEY`.

### 11.4 Coding Agent 💻

**Purpose:** Code generation, code review, explanations, debugging, conversion, and documentation.

Flow:

1. Checks the coding-agent limit.
2. Classifies the requested coding task.
3. For project generation, asks the coding model to return structured project files.
4. Parses the model response and returns the generated files as an artifact.
5. For other coding tasks, returns a Markdown explanation or code-focused answer.
6. Deducts credits.

The current code-generation prompt defines a default HTML/CSS/JavaScript project structure unless another framework is explicitly requested.

### 11.5 PDF Agent 📄

**Purpose:** Create a PDF document from a topic.

Flow:

1. Checks the PDF-agent limit.
2. Asks the configured model to create structured document content.
3. Parses the generated content.
4. Builds a PDF using PDFKit.
5. Saves it in temporary local storage.
6. Returns a download link.

The generated file link is temporary and is configured to expire after approximately ten minutes.

### 11.6 PowerPoint Agent 📊

**Purpose:** Generate a PowerPoint presentation.

Flow:

1. Checks the presentation-agent limit.
2. Asks the model to produce slide content in a structured format.
3. Builds a PPTX file using PptxGenJS.
4. Saves it in temporary local storage.
5. Returns a download link.

The current prompt requests six content slides. The generated download link is temporary.

### 11.7 Vision Agent — Image Generation 🎨

**Purpose:** Generate an image from a text description.

Flow:

1. Checks the image-generation usage limit.
2. Converts the user's request into a detailed image prompt.
3. Requests an image from the configured image-generation endpoint.
4. Saves the returned image in temporary local storage.
5. Returns an image preview and download link.

### 11.8 PDF RAG Agent 📚

**Purpose:** Answer questions using an uploaded PDF as the source.

RAG means **Retrieval-Augmented Generation**. Instead of asking the language model to answer from general knowledge alone, the application retrieves relevant pieces of the uploaded document and provides them as context.

Flow:

1. The user uploads a PDF with the question.
2. Multer receives the file.
3. The PDF parser extracts its text.
4. A text splitter divides the document into chunks, with overlap between neighboring chunks.
5. The application creates embeddings and stores the chunks in a timestamp-named Qdrant collection.
6. Similarity search retrieves the most relevant chunks for the user's question.
7. The retrieved text is passed to the model as context.
8. The model is instructed to answer from the uploaded PDF and avoid unsupported claims.
9. The temporary uploaded PDF is removed in the agent's cleanup step.

This workflow requires PDF parsing, Google model/embedding access, and Qdrant configuration.

### 11.9 Image Analyzer Agent 🖼️

**Purpose:** Understand an uploaded image.

Flow:

1. The user uploads an image and asks a question.
2. Multer receives the image.
3. The agent reads the image and converts it to Base64.
4. The image and prompt are sent to the configured Gemini model.
5. The model returns the analysis.
6. The temporary upload is removed in the cleanup step.

It can be used for visible text, charts, tables, and general image understanding. Results depend on the clarity of the input image and model capability.

## 12. API Reference 🔌

The active API routes are mounted by `backend/server.js`. Protected routes require a valid session cookie.

### Health and user ❤️

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Health-check response. |
| `POST` | `/api/auth/login` | Public | Verify Firebase ID token and establish a session. |
| `GET` | `/api/auth/logout` | Session | Clear the current session. |
| `GET` | `/api/me` | Protected | Return the current authenticated user. |

### Chat 💬

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `GET` | `/api/chat/create-conversation` | Protected | Create a conversation. |
| `GET` | `/api/chat/get-conversations` | Protected | List conversations for the current user. |
| `POST` | `/api/chat/update-conversation` | Protected | Update conversation metadata. |
| `POST` | `/api/chat/save-message` | Protected | Save a message. |
| `GET` | `/api/chat/get-messages/:conversationId` | Protected | Fetch messages for a conversation. |
| `DELETE` | `/api/chat/delete-conversation/:id` | Protected | Delete a conversation. |

### Agent 🤖

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/agent/chat` | Protected | Run an AI agent. |

The agent route accepts multipart form data. Its fields include:

| Field | Type | Purpose |
| --- | --- | --- |
| `prompt` | Text | User's instruction or question. |
| `conversationId` | Text | Conversation to associate with the request. |
| `agent` | Text | Agent selection, including `auto` where supported. |
| `file` | File | Optional PDF or image upload; use this exact field name. |

### Billing 💳

| Method | Endpoint | Access | Purpose |
| --- | --- | --- | --- |
| `POST` | `/api/billing/create` | Protected | Create a Razorpay order. |
| `POST` | `/api/billing/verify` | Protected | Verify the payment response and signature. |

### Example: check backend health

```bash
curl http://localhost:8000/health
```

Expected response:

```json
{
  "ok": true
}
```

Protected endpoints require the authenticated session cookie. Use the application's login flow or an authorized test session rather than treating these routes as public APIs.

## 13. Data, Sessions, and File Storage 🗄️

### MongoDB 🍃

The backend uses separate Mongoose connections for the four logical data areas:

| Environment variable | Data responsibility |
| --- | --- |
| `AUTH_MONGODB_URI` | Authentication and user-related records. |
| `CHAT_MONGODB_URI` | Conversations and messages. |
| `BILLING_MONGODB_URI` | Payment records. |
| `AGENT_MONGODB_URI` | Agent service data. |

### Redis ⚡

Redis supports application features such as session state, recent agent conversation memory, and per-user/per-agent rate-limit counters.

### Qdrant 🧠

Qdrant stores vector representations of extracted PDF text for retrieval. The PDF RAG agent currently creates a timestamp-based collection name when processing a PDF. Review collection retention and cleanup when operating the application at scale.

### Generated files 📦

Generated PDFs, PPTX files, and images are saved to a temporary directory on the server. The backend exposes this directory through:

```text
/files
```

The generated-file helper schedules downloads for deletion after approximately ten minutes. Treat these links as short-lived. Temporary local storage is not a substitute for persistent object storage; files may disappear when an instance restarts or its filesystem is replaced.

### S3 note ☁️

AWS S3 client and helper modules are present in the repository, but the current PDF, PPT, and image generation agents use local temporary storage. The current Render configuration does not require AWS credentials for those generation flows.

## 14. Deployment on Render ☁️

The repository includes a `render.yaml` blueprint.

### Deployment architecture 🏗️

The current blueprint defines:

| Service | Type | Purpose |
| --- | --- | --- |
| `nexora-redis` | Key Value | Redis used by the application. |
| `nexoraai` | Node web service | Runs the combined Express backend and serves the built frontend. |

The blueprint currently specifies the Singapore region and the Render free plan. Render product availability, quotas, sleep behavior, and pricing can change; check the current Render dashboard and pricing before relying on a free deployment.

### Step 1 — Push your latest code to GitHub 📤

Make sure your project changes are committed and pushed to the repository's deployment branch.

```bash
git add .
git commit -m "Prepare NexoraAI for deployment"
git push origin main
```

Do not add `.env`, private keys, service-account JSON, or credentials to Git.

### Step 2 — Create a Render account 👤

1. Open [Render](https://render.com/).
2. Sign in or create an account.
3. Connect the GitHub account that contains NexoraAI.

### Step 3 — Create a Blueprint deployment 🧩

1. In the Render dashboard, choose the option to create a new Blueprint.
2. Select the NexoraAI repository.
3. Select the branch containing `render.yaml`.
4. Allow Render to read the blueprint.
5. Review the services and settings before applying the deployment.

### Step 4 — Configure environment variables 🔐

The blueprint marks secrets and provider configuration as dashboard-managed values using `sync: false`.

Open the `nexoraai` web service's environment settings and add the values required by the application:

- Four MongoDB connection strings.
- Firebase Admin service account.
- Firebase frontend API key.
- Groq, Google, OpenRouter, and Tavily credentials as required.
- Qdrant URL and API key.
- Razorpay key ID and secret.

The blueprint connects the Redis service's connection string to `REDIS_URL`.

**Important:** The Vite `VITE_*` variables are used during the frontend build. Set them in the Render service environment before the build runs. If you change a Vite variable later, trigger a new deployment/build so the generated frontend bundle contains the updated value.

### Step 5 — Understand the build command 🏗️

The Render blueprint currently runs:

```bash
npm install --omit=dev --prefix backend && npm install --include=dev --prefix frontend && npm run build --prefix frontend
```

This:

1. Installs backend production dependencies.
2. Installs frontend dependencies, including build tools.
3. Builds the React application with Vite.
4. Produces the `frontend/dist` directory.

### Step 6 — Understand the start command ▶️

The configured start command is:

```bash
node backend/server.js
```

The server:

1. Loads environment variables.
2. Creates the generated-file directory.
3. Configures Express middleware and CORS.
4. Exposes the `/health` endpoint.
5. Connects to the MongoDB databases when API routes are requested.
6. Mounts Auth, Chat, Billing, and Agent routes.
7. Serves temporary generated files under `/files`.
8. Serves the compiled frontend from `frontend/dist`.
9. Listens on the port supplied by Render's `PORT` environment variable.

### Step 7 — Verify the deployment ✅

After the deployment succeeds:

1. Open the Render service URL.
2. Confirm that the frontend loads.
3. Open `/health` on the deployed host and confirm that it returns `{"ok":true}`.
4. Test Google login.
5. Send a basic chat prompt.
6. Test each provider-backed feature only after its credentials are configured.
7. Check the Render logs if an API request fails.

### Deployment considerations ⚠️

- The frontend and API share a host in this deployment, so `VITE_SERVER_URL` can remain empty.
- Configure CORS using the correct frontend origin for the deployment.
- Keep database and provider secrets in Render environment settings, not in Git.
- Temporary generated files are not durable across instance restarts.
- A free service may have limits or become unavailable under current platform rules. Confirm current service limits before using it for production workloads.

## 15. Troubleshooting 🛠️

### Backend ⚙️ does not start

Check:

1. Node.js is version 20 or newer.
2. You installed backend dependencies.
3. `backend/.env` exists.
4. The terminal is running commands from the repository root.
5. Port 8000 is not already occupied.

Run:

```bash
npm install --prefix backend
npm run dev --prefix backend
```

### MongoDB 🍃 connection error

- Check each MongoDB URI for spelling and database name.
- Confirm the database user and password.
- Confirm the network/IP access list in MongoDB Atlas.
- URL-encode special characters in the MongoDB password.
- Confirm that the four logical database variables are set.

### Redis ⚡ connection error

- Check `REDIS_URL`.
- Confirm that the Redis instance is running and reachable.
- Check whether the provider requires TLS.
- Confirm the deployment environment is using the correct connection URL.

### Login fails 🔑

- Confirm the Firebase Web API key is set in `frontend/.env`.
- Confirm that the Firebase Admin service-account JSON is set in `FIREBASE_SERVICE_ACCOUNT`.
- Confirm Google sign-in is enabled in Firebase Authentication.
- Check the backend logs for token-verification errors.
- Confirm the frontend origin and credentialed CORS settings.

### AI agent fails 🤖

- Confirm the API key for the provider used by that agent.
- Confirm the relevant service is reachable.
- Check the backend logs for provider errors or rate limits.
- Confirm that the required integration is configured (for example, Tavily for search and Qdrant for PDF RAG).

### Uploaded file is not processed 📎

- Use the field name `file` in multipart form data.
- Check that the file type is supported by the route/agent.
- Check upload size and provider limits.
- For PDF RAG, confirm that Google embedding/model access and Qdrant are configured.
- For image analysis, confirm that the selected model supports image input.

### Frontend 💻 cannot reach the API

- For local development, set `VITE_SERVER_URL=http://localhost:8000`.
- Restart Vite after changing `.env`.
- Confirm the backend is running on port 8000.
- Confirm credentialed CORS allows the frontend origin.
- When frontend and backend share one production host, use an empty `VITE_SERVER_URL` to use same-origin API paths.

### Generated download link does not work 📥

Generated links are temporary and expire after approximately ten minutes. Generate the file again. The current implementation uses local temporary storage, not persistent object storage.

## 16. Security Notes 🔒

- Never commit `.env` files, passwords, API keys, or private service-account credentials.
- Never expose `FIREBASE_SERVICE_ACCOUNT`, `RAZORPAY_KEY_SECRET`, database credentials, or provider secrets in frontend variables.
- Only browser configuration values intended to be public should use the `VITE_` prefix.
- Use HTTPS in deployed environments.
- Restrict database network access to trusted hosts whenever possible.
- Use Razorpay test credentials while testing payments.
- Treat uploaded files and generated download URLs as temporary user data.
- Review authentication, authorization, upload validation, rate limiting, and retention policies before public production use.

## 17. Future Improvements 🚧

Possible next steps for the project include:

- Add automated tests for authentication, conversation ownership, agent routing, and payment verification.
- Add background cleanup for unused Qdrant collections.
- Add persistent object storage for generated files.
- Add monitoring and structured request tracing across agent workflows.
- Add robust model/provider fallback and retry strategies.
- Add pagination and retention policies for long conversations.
- Add automated plan-expiry and credit-renewal processing.
- Add request cancellation that propagates to long-running model operations.
- Add API documentation generated from a maintained OpenAPI specification.

## 18. Author 👨‍💻

**Vikas Kumar**

- GitHub: [@VikasKumar281](https://github.com/VikasKumar281)
- Repository: [NexoraAI](https://github.com/VikasKumar281/NexoraAI)

---

<p align="center">
  <strong>NexoraAI</strong><br />
  One workspace. Multiple AI workflows.
</p>
