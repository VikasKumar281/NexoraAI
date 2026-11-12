import "./loadEnv.js";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import connectDb from "./services/auth/config/db.js";
import protect from "./gateway/middleware/auth.middleware.js";
import { getCurrentUser } from "./gateway/controllers/user.controller.js";
import authRouter from "./services/auth/routes/auth.route.js";
import chatRouter from "./services/chat/routes/chat.routes.js";
import billingRouter from "./services/billing/routes/billing.route.js";
import { fileDir } from "./services/agent/utils/saveGeneratedFile.js";

fs.mkdirSync(fileDir, { recursive: true });

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const frontendDist = path.resolve(__dirname, "../frontend/dist");
const frontendUrl = process.env.FRONTEND_URL || process.env.RENDER_EXTERNAL_URL;

const app = express();

app.set("trust proxy", 1);

app.get("/health", (_req, res) => {
    res.status(200).json({ ok: true });
});

app.use(morgan("dev"));
app.use(cookieParser());
app.use(express.json({ limit: "2mb" }));
app.use(cors({
    origin: frontendUrl || true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    optionsSuccessStatus: 204,
}));

function attachUser(req, _res, next) {
    if (req.user?.userId) {
        req.headers["x-user-id"] = String(req.user.userId);
    }
    next();
}

app.use("/api", async (req, res, next) => {
    try {
        await connectDb();
        next();
    } catch (error) {
        console.error("Database connection failed:", error);
        res.status(503).json({ message: "Database connection failed" });
    }
});

app.use("/api/auth", authRouter);
app.use("/api/chat", protect, attachUser, chatRouter);
app.use("/api/billing", protect, attachUser, billingRouter);
app.get("/api/me", protect, getCurrentUser);

let agentRouter;
app.use("/api/agent", protect, attachUser, async (req, res, next) => {
    try {
        if (!agentRouter) {
            const mod = await import("./services/agent/routes/agent.route.js");
            agentRouter = mod.default;
        }
        return agentRouter(req, res, next);
    } catch (error) {
        next(error);
    }
});

app.use("/api", (_req, res) => {
    res.status(404).json({ message: "Not found" });
});

app.use("/files", express.static(fileDir, { fallthrough: false }));

app.use(express.static(frontendDist));

app.use((req, res, next) => {
    if (req.method !== "GET" && req.method !== "HEAD") return next();
    res.sendFile(path.join(frontendDist, "index.html"), (error) => {
        if (error) next();
    });
});

app.use((_req, res) => {
    res.status(404).json({ message: "Not found" });
});

app.use((error, _req, res, next) => {
    console.error(error);
    if (res.headersSent) return next(error);
    const status = error.status && Number.isInteger(error.status) ? error.status : 500;
    res.status(status).json({ message: error.message || "Server error" });
});

if (!process.env.VERCEL) {
    const port = process.env.PORT || 8000;
    app.listen(port, () => {
        console.log(`NexoraAI listening on ${port}`);
    });
}

export default app;
