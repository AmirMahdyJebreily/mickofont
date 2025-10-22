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
export async function validatePaths(
    srcPath: string | undefined,
): Promise<boolean> {
    if (!srcPath ) {
        console.error("❌ Fatal Error: Source or distribution paths are not defined.");
        process.exit(1);
    }

    const [srcInfo] = await Promise.all([checkPath(srcPath)]);

    // Source checks
    if (!srcInfo.exists) {
        console.error(`❌ Source not found: ${srcInfo.path}`);
        console.error("➡ Fix: The source path does not exist. Run `init` to create project structure or fix the src path in your config.");
        process.exit(2);
    }

    if (!srcInfo.readable) {
        console.error(`❌ Source not readable: ${srcInfo.path}`);
        console.error("➡ Fix: Check file/folder permissions or run the program with a user that has read access.");
        process.exit(3);
    }

    if (!srcInfo.isFile && !srcInfo.isDirectory) {
        console.error(`❌ Source exists but is neither a file nor a directory: ${srcInfo.path}`);
        process.exit(4);
    }

    return true;
}