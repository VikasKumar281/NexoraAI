# NexoraAI

**An AI-powered, multi-agent assistant that brings chat, coding, web search, document generation, image generation, and image understanding into one workspace.**

NexoraAI is a ChatGPT-style web application built with **React, Node.js, Express, LangGraph, MongoDB, and Redis**. A user signs in with Google, starts a conversation, and sends a prompt to the assistant. The backend routes the request to the appropriate specialist agent, runs the selected AI workflow, and returns a response that is displayed in the chat interface.

<p align="center">
  <a href="https://nexoraai-vlme.onrender.com/"><strong>Open Live Application</strong></a>
  &nbsp; · &nbsp;
  <a href="https://github.com/VikasKumar281/NexoraAI">View Source Code</a>
</p>

---

## Table of Contents

- [Project Overview](#-project-overview)
- [Live Application](#-live-application)
- [Features](#-features)
- [AI Agents and Model Routing](#-ai-agents-and-model-routing)
- [Technology Stack](#-technology-stack)
- [System Architecture](#-system-architecture)
- [How a Request Works](#-how-a-request-works)
- [Authentication and Session Management](#-authentication-and-session-management)
- [Conversation and Message Management](#-conversation-and-message-management)
- [File Uploads and Document Processing](#-file-uploads-and-document-processing)
- [Code Generation and Artifact Preview](#-code-generation-and-artifact-preview)
- [Credits, Plans, and Rate Limits](#-credits-plans-and-rate-limits)
- [Database and Storage Design](#-database-and-storage-design)
- [API Reference](#-api-reference)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Run the Project Locally](#-run-the-project-locally)
- [Deployment on Render](#-deployment-on-render)
- [Earlier Microservices Deployment Design](#-earlier-microservices-deployment-design)
- [Implementation Notes](#-implementation-notes)
- [Future Improvements](#-future-improvements)

---

## 📌 Project Overview

NexoraAI was designed to provide multiple AI capabilities through a single chat interface. Instead of relying on one model for every type of request, the application uses a **LangGraph workflow** to select a specialist agent based on the user's selected mode, prompt, and uploaded file.

For example:

- A general question is handled by the Chat Agent.
- A request for recent information is sent to the Search Agent, and its results are then used by the Chat Agent to prepare the answer.
- A request to debug or generate code is handled by the Coding Agent.
- A request to create a PDF or PowerPoint presentation is handled by the corresponding document-generation agent.
- An uploaded PDF can be processed with retrieval-augmented generation (RAG), allowing the user to ask questions about the document.
- An uploaded image can be sent to the Image Analyzer, while a request to create a new image is handled by the Vision Agent.

The frontend is a React single-page application. The backend is built with Express and organized into separate service modules for authentication, chat, billing, and AI-agent workflows. The current Render deployment runs these modules inside one Node.js process to keep the deployment simpler and lower-cost.

## 🌐 Live Application

| Resource | Link |
| --- | --- |
| Live application | [https://nexoraai-vlme.onrender.com](https://nexoraai-vlme.onrender.com) |
| GitHub repository | [https://github.com/VikasKumar281/NexoraAI](https://github.com/VikasKumar281/NexoraAI) |

The live URL is configured as the repository homepage. Availability and performance depend on the hosting platform and the external services configured for the application.

---

## ✨ Features

### 1. Google Authentication

- Users sign in with their Google account through Firebase Authentication.
- The frontend obtains a Firebase ID token and sends it to the backend.
- The backend verifies the token with Firebase Admin SDK.
- A user record is created in MongoDB when the account is used for the first time.
- The backend creates a Redis session and sends the session identifier to the browser in an HTTP-only cookie.
- The session is configured for a seven-day lifetime.

### 2. AI Chat Workspace

- Start a new conversation from the sidebar.
- Conversations are created when the first message is sent, rather than saving an empty chat immediately.
- Previous conversations are loaded from MongoDB.
- The most recently updated, non-archived conversation is selected when the user loads the workspace.
- The chat view displays messages in chronological order and scrolls to the latest message.
- Assistant replies support Markdown, tables, links, images, and formatted code blocks.
- Users can copy an assistant response or an individual code block.

### 3. Conversation Management

The sidebar includes tools to manage saved conversations:

- **Search:** Filter conversations by their title.
- **Rename:** Change a conversation title.
- **Pin / Unpin:** Keep important conversations in a separate Pinned section.
- **Archive / Unarchive:** Move conversations out of the recent list without deleting them.
- **Delete:** Delete a conversation and its saved messages.
- **Recent conversations:** Display non-pinned conversations ordered by their latest update.

Pinned conversations are displayed separately from the regular recent list. Archived conversations can be opened from the Archived view.

### 4. Specialist AI Modes

The message composer provides these modes:

| Mode | Purpose |
| --- | --- |
| Auto | Let the backend router choose an agent based on the request or uploaded file. |
| Chat | General questions, explanations, and conversation. |
| Coding | Code generation, debugging, code review, explanations, and related development tasks. |
| PDF | Generate a formatted PDF document from a topic. |
| PPT | Generate a PowerPoint presentation from a topic. |
| Vision | Generate a new image from a text prompt. |
| Search | Search the web for current or relevant information. |

When a user selects a specific mode, that selection takes precedence over automatic routing. In Auto mode, PDF and image attachments are routed to their corresponding document/image understanding workflows.

### 5. File Attachments

Users can provide supporting files in the chat composer:

- Attach a PDF or image using the paperclip button.
- Drag and drop a supported file into the composer.
- Paste an image or PDF from the clipboard with `Ctrl + V` where the browser provides the clipboard file.
- View the selected file before sending it.
- Remove the attachment before sending the message.

The backend accepts PDF and image MIME types and configures a maximum upload size of **20 MB** in Multer.

### 6. Voice-to-Text Input

The microphone button uses the browser's **Web Speech API SpeechRecognition interface** to convert speech into text in the composer.

- The recognition language follows the browser's configured language (`navigator.language`) with `en-IN` as a fallback.
- Recognized speech is inserted into the message input.
- The user can stop voice input using the microphone button.
- The feature depends on browser support and microphone permission. The interface indicates that voice input is intended for supported browsers such as Chrome and Edge.

This is speech-to-text dictation. It is not a live audio conversation or voice call with the AI.

### 7. Stop a Pending Response

The composer provides a stop control while a response request is in progress. The frontend uses an `AbortController` to abort the browser's pending request. This stops the client from waiting for that response; it should not be interpreted as guaranteed cancellation of all server-side model processing.

### 8. Code Workspace

When the Coding Agent generates a project, the response can include multiple files. These are stored as message artifacts and shown in a separate code panel.

- Open generated files in the Monaco Editor.
- Switch between files such as `index.html`, `style.css`, and `script.js`.
- Copy the contents of the selected file.
- Preview generated HTML in an iframe when an `index.html` artifact is available.
- Open the code panel on smaller screens through the View Code control.

### 9. PDF and PowerPoint Downloads

- The PDF Agent produces downloadable PDF documents using PDFKit.
- The PPT Agent produces downloadable `.pptx` presentations using PptxGenJS.
- Generated files are written to a temporary server directory.
- The current implementation schedules generated files for deletion after **10 minutes**.

### 10. Credit-Based Billing

- New users receive the Free plan and its initial credit balance.
- Users can upgrade to Starter or Pro through Razorpay Checkout.
- The backend creates payment orders and verifies the Razorpay signature before applying a paid plan.
- The billing drawer displays the current plan and credit balance.
- After successful verification, the frontend refreshes the session data so the plan and credits can update without a full page reload.

---

## 🤖 AI Agents and Model Routing

The agent workflow is implemented with **LangGraph**. Its state carries the prompt, selected agent, conversation ID, user ID, uploaded file, search results, generated images, artifacts, and the assistant response.

### Agent Workflow

```text
                         User Message
                              |
                              v
                     POST /api/agent/chat
                              |
                              v
                       LangGraph Router
                              |
             +----------------+----------------+
             |                |                |
             v                v                v
       Explicit Mode     File Detection    Prompt Matching
             |                |                |
             +----------------+----------------+
                              |
                              v
                       Selected Agent
                              |
       +----------+-----------+----------+----------+
       |          |           |          |          |
       v          v           v          v          v
      Chat      Search      Coding      PDF        PPT
       |          |                                  
       |          v                                  
       |      Search Results                         
       |          |                                  
       +----------+                                  
       |                                             
       +--------------------+------------------------+
                            |
                            v
                     Agent Response
                            |
                            v
                  Save to Chat Database
                            |
                            v
                   Return Result to UI
```

The graph also includes separate nodes for `pdfRag` and `imageAnalyzer`. The router sends an uploaded PDF to `pdfRag` and an uploaded image to `imageAnalyzer` when Auto mode is selected.

### 1. Router Agent

The router decides which specialist should handle a request.

Its selection process is:

1. If the user has selected a mode other than Auto, use that mode.
2. In Auto mode, inspect the uploaded file. A PDF is routed to `pdfRag`, and an image is routed to `imageAnalyzer`.
3. Apply quick keyword and greeting checks for common request types.
4. If a quick match is not found, ask the routing language model to classify the prompt into one of the supported modes.
5. Send the state to the selected LangGraph node.

The router includes quick checks for presentation requests, PDF generation requests, image-generation requests, web-search-style requests, coding requests, and common greetings. The model-based router is used when these checks do not produce a match.

### 2. Chat Agent

The Chat Agent handles ordinary conversation, explanations, and general questions.

Its workflow:

1. Check the user's chat rate limit.
2. Load recent conversation history from Redis or retrieve it from the chat database when it is not cached.
3. Add a system message containing NexoraAI's response and Markdown formatting rules.
4. Include web search context when the request has passed through the Search Agent.
5. Send the conversation messages to the Groq chat model.
6. Deduct the configured chat credit cost.
7. Return the assistant response to the agent controller.

### 3. Search Agent

The Search Agent uses the Tavily Search integration.

- It submits the user's prompt as a search query.
- The current Tavily configuration requests up to five general search results and includes images.
- Search results are stored in the graph state.
- The LangGraph workflow then passes the state from Search to Chat.
- The Chat Agent uses the retrieved search context to prepare a natural-language answer.

This design separates information retrieval from response composition.

### 4. Coding Agent

The Coding Agent handles development-related requests. It uses a model to classify the user's coding intent into categories such as:

- `CODE_GENERATION`
- `CODE_REVIEW`
- `CODE_EXPLANATION`
- `DEBUGGING`
- `CONVERSION`
- `DOCUMENTATION`

For code generation, the agent asks the coding model to return structured JSON containing a `files` array. Each generated file has a name and content. The current prompt defaults to HTML, CSS, and JavaScript unless the user explicitly requests another framework or stack.

For code review, explanation, debugging, conversion, or documentation, the agent returns a Markdown response rather than a project artifact. Generated project files are returned through the `artifacts` field and displayed in the frontend code panel.

### 5. PDF Agent — PDF Generation

The PDF Agent creates a document from a user-provided topic.

1. The language model is prompted to create structured document data containing a title, subtitle, headings, and bullet points.
2. The response is parsed as JSON.
3. PDFKit builds an A4 PDF with a title, optional subtitle, sections, bullet points, and a NexoraAI footer.
4. The generated PDF is saved to the temporary file directory.
5. The assistant returns a download link.

The generation prompt requests between four and eight sections, with concise points under each section.

### 6. PDF RAG Agent — Ask Questions About a PDF

The PDF RAG workflow is different from PDF generation. It is used when a PDF is attached and Auto routing selects document understanding.

1. Read the uploaded PDF and extract its text with `pdf-parse`.
2. Split the extracted text into overlapping text chunks using `RecursiveCharacterTextSplitter`.
3. Create a Qdrant vector collection for the uploaded document.
4. Generate embeddings with Google's `gemini-embedding-001` embedding model.
5. Search for the five most relevant chunks for the user's question.
6. Pass those chunks as context to the language model.
7. Ask the model to answer only from the uploaded PDF context and to say when the requested information cannot be found.
8. Remove the temporary uploaded PDF from the server after processing.

The current text-splitting configuration uses a **1,000-character chunk size** and **200-character overlap**. The vector search retrieves up to **five relevant chunks** for a question.

### 7. PPT Agent — PowerPoint Generation

The PPT Agent creates a PowerPoint presentation from a topic.

1. The language model returns structured JSON containing a title, subtitle, and slide content.
2. The current prompt requests six content slides and concise bullet points for each slide.
3. PptxGenJS creates a wide-layout presentation with a cover slide, content slides, and a closing thank-you slide.
4. The presentation is written to a Node.js buffer and saved in the temporary file directory.
5. The assistant returns a `.pptx` download link.

### 8. Vision Agent — Image Generation

The Vision Agent generates a new image from a text prompt.

1. The prompt is expanded into a more detailed image-generation prompt by the configured language model.
2. The expanded prompt is sent to the Pollinations image-generation endpoint.
3. The returned image is downloaded as binary data.
4. The image is saved to the temporary file directory.
5. The assistant returns an image preview and a download link.

The current code uses the Pollinations image endpoint. AWS S3 upload calls in this agent are commented out and are not used by the active Render implementation.

### 9. Image Analyzer Agent — Image Understanding

The Image Analyzer handles an image attached to a message in Auto mode.

- It reads the uploaded image from the temporary upload directory.
- The image is converted to Base64 and sent with the user's question to the Gemini model.
- Its system instructions ask it to analyze the uploaded image, extract visible text where possible, explain charts or tables, and avoid inventing unclear details.
- The uploaded file is removed in the cleanup block after processing.

### Model and Provider Configuration

The model assignments are centralized in `backend/services/agent/config/llmModels.js`.

| Task | Provider / model configuration |
| --- | --- |
| Chat responses | Groq — `openai/gpt-oss-120b` |
| Automatic agent classification | Groq — default model returned by `getModel()` |
| Coding responses | OpenRouter — `deepseek/deepseek-chat` |
| Coding intent classification | Groq — default model returned by `getModel()` |
| Image understanding | Google Gemini — `gemini-3.8-flash` |
| PDF text embeddings | Google Gemini embeddings — `gemini-embedding-001` |
| Web search | Tavily Search integration |
| Image generation | Pollinations image endpoint, with the prompt expanded by the configured Groq model |
| PDF and PPT content | Groq — default model returned by `getModel()` |

The model names and provider assignments above reflect the current source files on the `main` branch. Availability and model access depend on the corresponding provider account and API key.

---

## 🧰 Technology Stack

### Frontend

| Technology | Usage |
| --- | --- |
| React 19 | Component-based user interface |
| Vite | Frontend development server and production build |
| Redux Toolkit | Application state for users, conversations, messages, loading state, and artifacts |
| React Redux | Access Redux state from React components |
| Tailwind CSS 4 | Utility-first styling and responsive layouts |
| Motion | UI transitions and panel animations |
| Lucide React | Interface icons |
| React Markdown | Render assistant responses as Markdown |
| remark-gfm | GitHub-Flavored Markdown support such as tables |
| react-syntax-highlighter | Syntax-highlighted code blocks |
| Monaco Editor | Generated code viewing |
| Firebase Authentication | Google sign-in in the browser |
| Axios | HTTP requests to the backend |

### Backend

| Technology | Usage |
| --- | --- |
| Node.js | JavaScript runtime |
| Express 5 | HTTP API and application server |
| LangGraph | Agent workflow and conditional routing |
| LangChain | Model messages, provider integrations, text splitting, embeddings, and vector search |
| MongoDB | Users, payments, conversations, and messages |
| Mongoose | MongoDB models and database connections |
| Redis / ioredis | Sessions, conversation memory cache, and rate-limit counters |
| Firebase Admin SDK | Verify Firebase ID tokens on the server |
| Multer | Receive uploaded PDF and image files |
| Axios | Internal HTTP service calls where configured |
| Tavily | Web search |
| Qdrant | Vector storage and similarity search for PDF RAG |
| PDFKit | Generate PDF documents |
| PptxGenJS | Generate PowerPoint presentations |
| Razorpay | Payment order creation and signature verification |

### External Services

- Firebase Authentication
- MongoDB Atlas or another MongoDB-compatible deployment
- Redis-compatible service
- Groq API
- OpenRouter API
- Google Gemini API
- Tavily Search API
- Qdrant Cloud or a reachable Qdrant instance
- Razorpay
- Pollinations image generation endpoint
- Render for the current hosting configuration

---

## 🏗️ System Architecture

### Current Production Architecture

The current Render deployment uses one Node.js process. `backend/server.js` is the production entry point. It imports the authentication, chat, billing, and agent modules and mounts their routes under a common Express application.

```text
                         Browser
                            |
                            | HTTPS / Cookie
                            v
                 React + Vite Frontend
                            |
                            | /api/*
                            v
                 Express Application
                  backend/server.js
                            |
          +-----------------+-----------------+
          |                 |                 |
          v                 v                 v
      Auth Routes       Chat Routes       Billing Routes
          |                 |                 |
          v                 v                 v
      Auth Logic        Chat Logic       Razorpay Logic
          |                 |                 |
          +-----------------+-----------------+
                            |
                            v
                       Agent Route
                            |
                            v
                       LangGraph
                            |
          +-----------------+------------------+
          |                 |                  |
          v                 v                  v
      AI Providers      Tavily Search      Qdrant RAG
          |                                    |
          +-----------------+------------------+
                            |
                            v
                 MongoDB + Redis + Temp Files
```

### Why the Current Deployment Uses One Process

The codebase was initially organized around independently deployable backend services. The current Render configuration uses a combined Express server instead:

- There is one web service to build and run.
- Auth, chat, billing, and agent routes are mounted in the same process.
- Internal calls can use controller functions directly through `backend/shared/callHandler.js` when separate service URLs are not configured.
- The browser frontend is built into `frontend/dist` and served by the Express application.
- Redis remains a separate service for session and cache operations.

This reduces the number of application containers required by the current deployment while preserving the service-oriented code organization.

---

## 🔄 How a Request Works

### Login Request

```text
User clicks Continue with Google
              |
              v
Firebase Google Sign-In
              |
              v
Frontend receives Firebase ID token
              |
              v
POST /api/auth/login
              |
              v
Firebase Admin verifies token
              |
              v
Find or create MongoDB user
              |
              v
Create Redis session (7 days)
              |
              v
Set HTTP-only session cookie
              |
              v
Frontend stores user data in Redux
```

### Chat Request

```text
User submits text / file / selected mode
                    |
                    v
Frontend creates conversation if required
                    |
                    v
POST /api/agent/chat
                    |
                    v
Session middleware identifies the user
                    |
                    v
Agent controller saves the user message
                    |
                    v
LangGraph router selects an agent
                    |
                    v
Specialist agent runs its workflow
                    |
                    v
Assistant response is saved to MongoDB
                    |
                    v
Redis conversation memory is updated
                    |
                    v
Response returns to the frontend
                    |
                    v
Redux updates the currently active chat
```

### Conversation Isolation During Responses

The frontend attaches a conversation ID to messages and keeps track of the active conversation ID. A response is applied to the visible chat only when it belongs to the conversation that is still open. The backend also saves the request and response against the same conversation ID. If the conversation has been deleted while a response is being processed, the chat save operation can return a not-found result and the agent controller returns a discarded response.

---

## 🔐 Authentication and Session Management

NexoraAI uses Firebase Authentication for Google sign-in and Redis for application sessions.

### Login Flow

1. The user selects **Continue With Google**.
2. Firebase Authentication performs the Google sign-in flow in the frontend.
3. The frontend obtains the Firebase ID token from the authenticated Firebase user.
4. The token is sent to `POST /api/auth/login`.
5. The backend uses Firebase Admin SDK to verify the token.
6. The backend finds the user by `firebaseUid`. If no user exists, a user record is created.
7. The backend creates a random session identifier and stores the session data in Redis.
8. The session identifier is returned in an HTTP-only cookie.

### Session Storage

The backend stores two Redis keys:

| Redis key | Purpose |
| --- | --- |
| `user-session-<userId>` | Maps the user ID to the current session identifier. |
| `session-<sessionId>` | Stores the serialized session information used by authentication middleware. |

The session data includes the user's ID, name, email, avatar, plan, credits, total credits, and plan expiry metadata.

The cookie is configured with `httpOnly`, `secure`, `SameSite=None`, and a seven-day maximum age. Protected routes use the `protect` middleware to read the session from Redis and attach the user information to the request.

### Current User Endpoint

The frontend requests `GET /api/me` during application startup to restore the user session. After payment or a credit deduction, it can request the endpoint again to refresh the user information shown in the interface.

---

## 💬 Conversation and Message Management

### MongoDB Conversation Model

A conversation contains:

- `title` — defaults to `New Chat`.
- `userId` — identifies its owner.
- `pinned` — whether the conversation is pinned.
- `pinnedAt` — timestamp used to order pinned conversations.
- `archived` — whether the conversation is archived.
- `createdAt` and `updatedAt` — timestamps maintained by Mongoose.

### MongoDB Message Model

Each message contains:

- `conversationId` — the conversation to which it belongs.
- `role` — either `user` or `assistant`.
- `content` — message text or Markdown response.
- `images` — image URLs or image references associated with the message.
- `artifacts` — generated project files, including their names and contents.
- `createdAt` and `updatedAt` — timestamps.

### Conversation Lifecycle

1. The user selects New Chat. The frontend clears the selected conversation but does not immediately create an empty database record.
2. When the first message is sent, the frontend requests a new conversation from the chat API.
3. The user message is saved against that conversation ID.
4. The agent processes the prompt and returns the result.
5. The assistant message, images, and generated artifacts are saved against the same conversation.
6. The sidebar refreshes or reorders conversations using the latest update timestamp.

### Redis Conversation Memory

The agent service uses Redis keys in the form `messages-<conversationId>` for recent chat context. When the cache is not available, it retrieves the saved messages from the chat service/database. The in-memory context is limited to the latest 20 message entries before older entries are removed from that cache list.

MongoDB remains the persistent source for saved conversations and messages; Redis is used to make recent context retrieval faster.

---

## 📎 File Uploads and Document Processing

### Accepted Upload Types

| File type | Supported workflow in Auto mode |
| --- | --- |
| PDF | PDF RAG Agent (`pdfRag`) |
| Image | Image Analyzer Agent (`imageAnalyzer`) |

The upload middleware uses disk storage in a temporary operating-system directory. It accepts PDF and image MIME types and has a 20 MB file-size limit.

### PDF Question Answering

The PDF RAG Agent extracts text, splits it into chunks, embeds the chunks, stores them in a Qdrant collection, retrieves relevant chunks for the user's question, and asks the language model to answer using that context. This is retrieval-augmented generation rather than simply attaching the whole PDF text to every request.

### Image Understanding

The Image Analyzer reads the uploaded image, converts it to Base64, and sends it to Gemini together with the prompt. The model is instructed to describe the image, extract visible text, interpret charts or tables, and state when details are unclear.

### Temporary Upload Cleanup

The PDF and image processing agents include cleanup logic to remove their uploaded temporary file after processing. This avoids treating the upload directory as permanent file storage.

---

## 🧑‍💻 Code Generation and Artifact Preview

The Coding Agent supports both conversational coding assistance and multi-file code generation.

### Code Assistance

For debugging, explanation, review, conversion, and documentation tasks, the Coding Agent returns a Markdown answer. The frontend renders the response with syntax highlighting and a copy action for code blocks.

### Project Generation

For a project-generation request, the Coding Agent asks the model for JSON in this shape:

```json
{
  "files": [
    {
      "name": "index.html",
      "content": "..."
    },
    {
      "name": "style.css",
      "content": "..."
    },
    {
      "name": "script.js",
      "content": "..."
    }
  ]
}
```

The generated files are wrapped in an artifact object containing an ID, type, title, and files array. The agent controller saves the artifact with the assistant message, and the frontend displays it in the Artifact panel.

### Code Panel

`frontend/src/components/Artifact.jsx` uses Monaco Editor to display generated code. It detects common file extensions to select the editor language. When the artifact contains `index.html`, the Preview tab combines the HTML, CSS, and JavaScript contents and renders them in a sandboxed iframe.

---

## 💳 Credits, Plans, and Rate Limits

### Plans

The current plan catalog is defined in `backend/services/billing/config/Plans.js`.

| Plan | Price | Credits in plan | Validity configured |
| --- | ---: | ---: | ---: |
| Free | ₹0 | 100 | 30 days |
| Starter | ₹199 | 500 | 30 days |
| Pro | ₹499 | 1,000 | 30 days |

A newly created user defaults to the Free plan with 100 credits and 100 total credits. On a successful paid-plan update, the purchased credits are added to the user's current credit balance and `totalCredits` is increased. The plan expiry timestamp is set to 30 days from the plan update.

The plan catalog contains a 30-day validity value. In the current code, the expiry timestamp is written when a paid plan is applied; the repository does not currently show a scheduled job that automatically resets or expires credit balances when that date passes.

### Credit Cost by Agent

The credit cost is defined in the authentication service's credit deduction handler.

| Agent operation | Credits per successful deduction |
| --- | ---: |
| Chat | 1 |
| Search | 5 |
| Coding | 10 |
| PDF generation or PDF analysis | 10 |
| PowerPoint generation | 10 |
| Vision / image understanding | 10 |

### Rate Limits

Rate-limit counters are maintained in Redis on a per-user, per-agent basis. The configured window is 60 seconds.

| Agent category | Maximum requests |
| --- | ---: |
| Chat | 20 per minute |
| Coding | 5 per minute |
| PDF | 5 per minute |
| PPT | 5 per minute |
| Image operations | 5 per minute |
| Search | 5 per minute |

When the request count exceeds the configured maximum, the rate-limit helper raises an HTTP 429 error with retry information.

### Razorpay Payment Flow

```text
User selects Starter or Pro
             |
             v
POST /api/billing/create
             |
             v
Backend creates Razorpay order
             |
             v
Payment record saved as created
             |
             v
Razorpay Checkout opens in browser
             |
             v
Razorpay returns order, payment and signature data
             |
             v
POST /api/billing/verify
             |
             v
Backend validates HMAC signature
             |
             v
Payment record updated to paid
             |
             v
User plan and credits updated
             |
             v
Frontend refreshes session data
```

The backend verifies the Razorpay signature using the configured Razorpay secret before updating the payment and user plan. The frontend uses the public Razorpay key ID to open Checkout; the secret key remains on the server.

---

## 🗄️ Database and Storage Design

### MongoDB

The backend creates separate Mongoose connections for four logical application areas. These connection strings can point to separate databases on one MongoDB Atlas cluster or to separately hosted databases.

| Environment variable | Logical database responsibility |
| --- | --- |
| `AUTH_MONGODB_URI` | User accounts, plans, and credit balances |
| `CHAT_MONGODB_URI` | Conversations and messages |
| `BILLING_MONGODB_URI` | Razorpay payment records |
| `AGENT_MONGODB_URI` | Agent service database connection |

`backend/shared/mongo.js` provides a reusable connection factory. Each service database config selects its own URI environment variable and caches its Mongoose connection. `backend/loadEnv.js` loads the backend/root environment files and can map a service-local `MONGODB_URI` to the matching service variable when that service-local file is used.

### Redis

Redis is used for:

- Login session data and user-to-session mapping.
- Recent conversation memory used by the agent workflow.
- Per-user, per-agent rate-limit counters.

### Qdrant

Qdrant stores vector embeddings created from the extracted text of uploaded PDFs. The current PDF RAG implementation creates a collection name using a timestamp for each processed PDF and performs similarity search over the resulting collection.

### Temporary File Storage

Generated PDFs, PPTX files, and images are saved under a temporary directory created in the operating system's temp folder. The application exposes that directory through `/files` and schedules generated files for deletion after ten minutes.

This is temporary download storage, not permanent object storage. A process restart or a hosting filesystem reset can make temporary downloads unavailable.

### AWS S3 Code

AWS S3 client, upload, and signed-URL helper files are retained in the repository, but their active calls are commented out in the current generation agents. The current Render implementation uses temporary local files instead of uploading generated documents and images to S3.

---

## 🔌 API Reference

The current combined Express server mounts the following routes. Protected routes require a valid session cookie.

### Health and Session

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `GET` | `/health` | Render health-check endpoint. | Public |
| `POST` | `/api/auth/login` | Verify Firebase ID token and create a session. | Public |
| `GET` | `/api/auth/logout` | Clear the current Redis session and cookie. | Session cookie |
| `GET` | `/api/me` | Return the current authenticated user's session data. | Protected |

### Chat

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `GET` | `/api/chat/create-conversation` | Create a conversation for the authenticated user. | Protected |
| `GET` | `/api/chat/get-conversations` | List the user's conversations. | Protected |
| `POST` | `/api/chat/update-conversation` | Rename, pin/unpin, or archive/unarchive a conversation. | Protected |
| `POST` | `/api/chat/save-message` | Save a user or assistant message. | Protected |
| `GET` | `/api/chat/get-messages/:conversationId` | Fetch messages for a conversation. | Protected |
| `DELETE` | `/api/chat/delete-conversation/:id` | Delete a conversation and its messages. | Protected |

### AI Agent

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `POST` | `/api/agent/chat` | Submit a prompt, selected agent, and optional PDF/image upload. | Protected |

The agent endpoint accepts multipart form data when a file is attached. The form fields include `prompt`, `conversationId`, `agent`, and optional `file`.

### Billing

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| `POST` | `/api/billing/create` | Create a Razorpay order for a selected plan. | Protected |
| `POST` | `/api/billing/verify` | Verify the Razorpay payment signature and apply the plan. | Protected |

The authentication router also contains handlers for internal plan updates and credit deductions that are used by the service logic. They should be treated as backend-internal operations rather than public client APIs.

---

## 📁 Project Structure

```text
NexoraAI/
│
├── .env.example
├── .gitignore
├── render.yaml
│
├── backend/
│   ├── server.js
│   ├── loadEnv.js
│   ├── package.json
│   ├── docker-compose.yml
│   │
│   ├── gateway/
│   │   ├── index.js
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── utils/
│   │
│   ├── shared/
│   │   ├── callHandler.js
│   │   ├── mongo.js
│   │   └── redis/
│   │
│   └── services/
│       ├── auth/
│       │   ├── index.js
│       │   ├── config/
│       │   ├── controllers/
│       │   ├── models/
│       │   └── routes/
│       │
│       ├── chat/
│       │   ├── index.js
│       │   ├── config/
│       │   ├── controllers/
│       │   ├── models/
│       │   └── routes/
│       │
│       ├── billing/
│       │   ├── index.js
│       │   ├── config/
│       │   ├── controllers/
│       │   ├── models/
│       │   └── routes/
│       │
│       └── agent/
│           ├── index.js
│           ├── agents/
│           ├── config/
│           ├── controllers/
│           ├── graph/
│           ├── routes/
│           ├── utils/
│           └── temp/
│
├── frontend/
│   ├── package.json
│   ├── vite.config.js
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
└── package-lock.json
```

### Important Directories

| Path | Responsibility |
| --- | --- |
| `frontend/src/components/` | Chat UI, sidebar, composer, message renderer, billing drawer, and artifact panel. |
| `frontend/src/features/` | API calls for authentication, conversations, messages, billing, and agent requests. |
| `frontend/src/redux/` | Redux store and user, conversation, and message state slices. |
| `frontend/utils/` | Axios client and Firebase browser configuration. |
| `backend/server.js` | Combined production Express entry point used by Render. |
| `backend/loadEnv.js` | Loads environment files and maps service database variables. |
| `backend/shared/` | Shared MongoDB connection factory, Redis client, and in-process controller-call helper. |
| `backend/gateway/` | Original gateway module, including session middleware and user-session endpoint. |
| `backend/services/auth/` | Firebase token verification, user model, sessions, plans, and credit operations. |
| `backend/services/chat/` | Conversation and message models, controllers, and routes. |
| `backend/services/billing/` | Plan catalog, Razorpay integration, payment model, and payment verification. |
| `backend/services/agent/agents/` | Individual AI agent implementations. |
| `backend/services/agent/graph/` | LangGraph state, router, nodes, and workflow edges. |
| `backend/services/agent/config/` | Model providers, Redis, embeddings, Qdrant, Tavily, uploads, and rate limits. |
| `backend/services/agent/utils/` | Credit deduction, PDF/PPT builders, message retrieval, and temporary file helpers. |
| `render.yaml` | Render web service and Redis deployment blueprint. |

---

## ⚙️ Environment Variables

The repository includes a root `.env.example` file. Copy it to `backend/.env` for local backend development and fill in the required values. Never commit real credentials or private keys.

### Backend Variables

| Variable | Purpose |
| --- | --- |
| `AUTH_MONGODB_URI` | MongoDB connection string for user/auth data. |
| `CHAT_MONGODB_URI` | MongoDB connection string for conversations and messages. |
| `BILLING_MONGODB_URI` | MongoDB connection string for payment records. |
| `AGENT_MONGODB_URI` | MongoDB connection string used by the agent service database connection. |
| `REDIS_URL` | Redis connection URL. |
| `FIREBASE_SERVICE_ACCOUNT` | Firebase Admin service-account JSON, supplied as an environment variable. |
| `FRONTEND_URL` | Allowed frontend origin for CORS. For local Vite development, use `http://localhost:5173`. |
| `GOOGLE_API_KEY` | Google Gemini model and embedding access. |
| `GROQ_API_KEY` | Groq model access. |
| `OPENROUTER_API_KEY` | OpenRouter coding model access. |
| `TAVILY_API_KEY` | Tavily web-search access. |
| `QDRANT_URL` | Qdrant endpoint for PDF vector search. |
| `QDRANT_API_KEY` | Qdrant API key. |
| `RAZORPAY_KEY_ID` | Razorpay server-side key ID. |
| `RAZORPAY_KEY_SECRET` | Razorpay server-side secret used for order/payment operations and signature verification. |

The `.env.example` also contains commented AWS variables. They are retained for the older S3 deployment path and are not required by the active Render file-storage implementation.

### Frontend Variables

Create `frontend/.env` for the Vite build:

| Variable | Purpose |
| --- | --- |
| `VITE_FIREBASE_API_KEY` | Firebase web API key used by the browser SDK. |
| `VITE_RAZORPAY_KEY_ID` | Public Razorpay key ID used to open Checkout. |
| `VITE_SERVER_URL` | Backend base URL. Use `http://localhost:8000` for local split frontend/backend development. Leave empty when frontend and API share the same host in production. |

Only frontend values with the `VITE_` prefix are exposed to the browser build. Do not put private service-account JSON, database passwords, provider secrets, or Razorpay secret keys in frontend environment variables.

---

## 🚀 Run the Project Locally

### Prerequisites

- Node.js 20 or newer. Node.js 22 is the version configured for the Render deployment.
- npm.
- MongoDB instance with separate database connection strings for the application areas.
- Redis instance.
- Firebase project configured for Google Authentication and a Firebase Admin service account.
- API credentials for the AI/search/vector/payment services used by the features you want to test.

### 1. Clone the Repository

```bash
git clone https://github.com/VikasKumar281/NexoraAI.git
cd NexoraAI
```

### 2. Install Backend Dependencies

```bash
npm install --prefix backend
```

### 3. Configure the Backend Environment

On Windows PowerShell:

```powershell
Copy-Item .env.example backend/.env
```

On macOS/Linux:

```bash
cp .env.example backend/.env
```

Open `backend/.env` and configure the database, Redis, Firebase Admin, AI provider, Qdrant, and Razorpay values.

For local development, set the frontend CORS origin to the Vite development URL:

```env
FRONTEND_URL=http://localhost:5173
```

If Redis is running locally, its URL can be configured as:

```env
REDIS_URL=redis://localhost:6379
```

### 4. Configure the Frontend Environment

Create `frontend/.env`:

```env
VITE_FIREBASE_API_KEY=your_firebase_web_api_key
VITE_RAZORPAY_KEY_ID=your_razorpay_key_id
VITE_SERVER_URL=http://localhost:8000
```

Use values from your own Firebase and Razorpay projects. The Firebase web configuration also contains the project's public Firebase identifiers in `frontend/utils/firebase.js`.

### 5. Start the Backend

Open a terminal at the repository root and run:

```bash
npm run dev --prefix backend
```

The backend starts on port `8000` by default. The port can be overridden by the `PORT` environment variable.

### 6. Start the Frontend

Open a second terminal at the repository root and run:

```bash
npm install --prefix frontend
npm run dev --prefix frontend
```

Vite prints the local development URL in the terminal. Open that URL in your browser.

### 7. Test the Main Flows

1. Sign in with a Google account.
2. Send a normal chat message.
3. Switch to Coding and ask for a small project to test generated artifacts.
4. Use Search for a current-information query.
5. Select PDF or PPT to test document generation.
6. Attach a PDF in Auto mode and ask a question about it.
7. Attach an image in Auto mode and ask the assistant to analyze it.
8. Open the Billing drawer to test plan selection using Razorpay test credentials.

Some features require their respective external API keys and services. For example, PDF RAG requires both Google embeddings access and Qdrant configuration.

---

## ☁️ Deployment on Render

The repository contains a `render.yaml` blueprint for the current deployment design.

### Render Services

The blueprint declares:

| Service | Type | Purpose |
| --- | --- | --- |
| `nexora-redis` | Key Value | Redis for sessions, memory cache, and rate limiting. |
| `nexoraai` | Node web service | Runs the combined backend and serves the built frontend. |

Both services are configured for the Singapore region in the blueprint. The configuration declares the `free` plan; actual availability and platform limits are controlled by Render and can change over time.

### Build Command

The Render blueprint uses:

```bash
npm install --omit=dev --prefix backend && npm install --include=dev --prefix frontend && npm run build --prefix frontend
```

This installs backend production dependencies, installs the frontend build dependencies, and creates the production frontend bundle.

### Start Command

```bash
node backend/server.js
```

The combined server:

1. Loads environment variables.
2. Creates the temporary file directory.
3. Configures Express, cookie parsing, CORS, JSON parsing, and request logging.
4. Connects to the four MongoDB databases when API requests arrive.
5. Mounts authentication, chat, billing, and agent routes.
6. Serves generated downloads from `/files`.
7. Serves the compiled React application from `frontend/dist`.
8. Listens on `0.0.0.0` using Render's `PORT` environment variable.

### Health Check

Render is configured to call:

```text
GET /health
```

The endpoint returns a successful JSON response when the Express application is reachable.

### Configure Render Environment Variables

The Render blueprint marks provider credentials and database connection strings as dashboard-managed values (`sync: false`). Add the required values in the Render service settings. The Redis connection string is linked from the `nexora-redis` Key Value service by the blueprint.

Remember that the `VITE_` variables are needed during the frontend build because Vite embeds them into the generated browser bundle.

---

## 🧱 Earlier Microservices Deployment Design

The backend was initially structured so its main responsibilities could run as separate services. Each service has its own folder, entry point, routes, controllers, configuration, package files, and Dockerfile where applicable.

| Service | Original responsibility |
| --- | --- |
| Gateway | Validate session cookies, protect API requests, and forward the user ID to downstream services. |
| Auth | Verify Firebase tokens, create users and sessions, manage plans, and deduct credits. |
| Chat | Create conversations, save messages, update conversation metadata, and return chat history. |
| Billing | Create Razorpay orders, store payment records, and verify payments. |
| Agent | Route prompts through LangGraph and execute specialist AI agents. |

The individual service entry points are retained in the repository. The current Render production path uses `backend/server.js` instead of starting five separate application containers.

`backend/shared/callHandler.js` supports in-process calls to controller functions when a separate service URL is not configured. The agent and billing code can also use HTTP service URLs when the corresponding environment variables are provided. This allows the codebase to retain a modular service design while using a combined process for the current deployment.

---

## 📝 Implementation Notes

- **Voice input is browser-based.** It relies on SpeechRecognition support and microphone permission; it is not a live voice assistant.
- **Uploaded files are temporary.** PDF and image uploads are processed from a temporary directory and removed by the agent cleanup logic.
- **Generated files are temporary.** PDF, PPTX, and image downloads are scheduled for deletion after ten minutes.
- **S3 is not active in the current Render path.** The S3 helper files remain in the repository, but the current generation agents save files locally.
- **PDF RAG uses Qdrant.** It creates timestamped collections for document content; the current flow does not show a collection cleanup job.
- **Plan expiry is recorded but not automatically enforced by a scheduler in the current repository.** The plan definitions specify 30 days and paid plan updates write `planExpiresAt`, but no scheduled expiry/reset worker is present in the inspected code.
- **Stopping a response is client-side abort.** The frontend aborts its request with an `AbortController`; it does not establish that the provider's server-side model execution is cancelled.
- **Some features need external credentials.** A successful local build alone does not verify Firebase, AI providers, Tavily, Qdrant, Razorpay, MongoDB, or Redis connectivity.

---

## 🔭 Future Improvements

Potential areas for further development include:

- Add automated cleanup for old Qdrant PDF collections.
- Add scheduled plan-expiry handling and a clear renewal/reset policy.
- Add server-side cancellation propagation for long-running agent requests.
- Add persistent object storage for generated files when longer download availability is required.
- Add automated tests for authentication, billing verification, conversation ownership, and agent routing.
- Add request tracing and structured logs across the service modules.
- Add model/provider fallback handling and clearer user-facing errors for provider outages.
- Add pagination for long conversation histories.

---

## 👨‍💻 Author

**Vikas Kumar**  
GitHub: [@VikasKumar281](https://github.com/VikasKumar281)

---

<p align="center">
  Built with React, Node.js, LangGraph, MongoDB, Redis, and AI provider integrations.
  <br />
  <strong>NexoraAI — One workspace for multiple AI workflows.</strong>
</p>
