import fs from "fs/promises";
import { constants } from "fs";
import path from "path";

export type CheckResult = {
    path: string;
    exists: boolean;
    readable: boolean;
    writable: boolean;
    isFile: boolean;
    isDirectory: boolean;
};

export async function checkPath(p: string): Promise<CheckResult> {
    const resolved = path.resolve(p);
    const res: CheckResult = {
        path: resolved,
        exists: false,
        readable: false,
        writable: false,
        isFile: false,
        isDirectory: false,
    };

    try {
        await fs.access(resolved, constants.F_OK);
        res.exists = true;
    } catch {
        return res;
    }

    try { await fs.access(resolved, constants.R_OK); res.readable = true; } catch { }
    try { await fs.access(resolved, constants.W_OK); res.writable = true; } catch { }

    try {
        const st = await fs.stat(resolved);
        res.isFile = st.isFile();
        res.isDirectory = st.isDirectory();
    } catch { }

    return res;
}
