import { initializeDatabase } from './src/lib/db.ts';
initializeDatabase().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
