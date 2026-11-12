import fs from "node:fs/promises";
import path from "node:path";
import os from "node:os";

export const fileDir = path.join(os.tmpdir(), "nexora-files");

export async function saveGeneratedFile(filename, buffer, _contentType, expiresIn = 600) {
    const safeName = path.basename(filename);
    await fs.mkdir(fileDir, { recursive: true });
    const filePath = path.join(fileDir, safeName);
    await fs.writeFile(filePath, buffer);

    setTimeout(() => {
        fs.unlink(filePath).catch(() => {});
    }, expiresIn * 1000);

    const base = (process.env.RENDER_EXTERNAL_URL || "").replace(/\/$/, "");
    return `${base}/files/${encodeURIComponent(safeName)}`;
}
