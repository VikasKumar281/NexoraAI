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

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;

if (!serviceAccountJson) {
  throw new Error("FIREBASE_SERVICE_ACCOUNT environment variable is missing");
}

const serviceAccount = JSON.parse(serviceAccountJson);

export const app = initializeApp({
  credential: cert(serviceAccount)
});
