import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.join(__dirname, ".env") });
dotenv.config({ path: path.join(__dirname, "..", ".env") });

const serviceDatabases = [
    ["auth", "AUTH_MONGODB_URI"],
    ["chat", "CHAT_MONGODB_URI"],
    ["billing", "BILLING_MONGODB_URI"],
    ["agent", "AGENT_MONGODB_URI"],
];

for (const [serviceName, envName] of serviceDatabases) {
    if (process.env[envName]) continue;

    const envPath = path.join(__dirname, "services", serviceName, ".env");
    if (!fs.existsSync(envPath)) continue;

    const line = fs.readFileSync(envPath, "utf8")
        .split(/\r?\n/)
        .find((item) => item.startsWith("MONGODB_URI="));
    if (!line) continue;

    let value = line.slice("MONGODB_URI=".length).trim();
    if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
    ) {
        value = value.slice(1, -1);
    }

    process.env[envName] = value;
}
