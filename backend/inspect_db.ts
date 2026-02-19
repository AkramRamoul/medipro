
import { sqlite } from './src/db';

try {
    const tables = sqlite.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    console.log("Existing tables:", tables.map((t: any) => t.name).join(", "));
} catch (err) {
    console.error("Error inspecting database:", err);
} finally {
    sqlite.close();
}
