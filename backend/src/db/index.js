const sqlite3 = require('sqlite3').verbose();
const { open } = require('sqlite');
const path = require('path');

let db;

async function initializeDB() {
    if (!db) {
        const dbPath = path.join(__dirname, '../../data/infinium.db');
        console.log('Database path:', dbPath);
        // Ensure the directory exists
        const dbDir = path.dirname(dbPath);
        require('fs').mkdirSync(dbDir, { recursive: true });
        
        db = await open({
            filename: dbPath,
            driver: sqlite3.Database
        });
    }
    return db;
}

async function getDB() {
    if (!db) {
        await initializeDB();
    }
    return db;
}

async function run(query, params = []) {
    const db = await getDB();
    return db.run(query, params);
}

async function get(query, params = []) {
    const db = await getDB();
    return db.get(query, params);
}

async function all(query, params = []) {
    const db = await getDB();
    return db.all(query, params);
}

module.exports = {
    initializeDB,
    getDB,
    run,
    get,
    all
};