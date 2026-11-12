// import {cert, initializeApp} from "firebase-admin";
// import serviceAccount from "../serviceAccountKey.json" with {type:"json"};

// export const app = initializeApp({
//   credential: cert(serviceAccount)
// });




import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { cert, initializeApp } from "firebase-admin";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.join(__dirname, "../.env") });

function unwrap(value) {
  const trimmed = value.trim().replace(/^\uFEFF/, "");
  if (
    (trimmed.startsWith("'") && trimmed.endsWith("'")) ||
    (trimmed.startsWith('"') && trimmed.endsWith('"'))
  ) {
    return trimmed.slice(1, -1);
  }
  return trimmed;
}

function parseServiceAccount(raw) {
  if (!raw || !raw.trim()) {
    throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is missing");
  }

  let value = unwrap(raw);
  let parsed;

  try {
    parsed = JSON.parse(value);
  } catch {
    parsed = JSON.parse(value.replace(/\r?\n/g, "\\n"));
  }

  if (typeof parsed === "string") {
    parsed = JSON.parse(parsed);
  }

  const required = ["type", "project_id", "private_key", "client_email"];
  const missing = required.filter((key) => typeof parsed[key] !== "string" || !parsed[key]);
  if (missing.length > 0) {
    throw new Error(
      `FIREBASE_SERVICE_ACCOUNT is missing ${missing.join(", ")}. Paste the entire Firebase service-account JSON, including client_email.`
    );
  }

  parsed.private_key = parsed.private_key.replace(/\\n/g, "\n");
  return parsed;
}

const serviceAccount = parseServiceAccount(process.env.FIREBASE_SERVICE_ACCOUNT);

export const app = initializeApp({
  credential: cert(serviceAccount)
});
