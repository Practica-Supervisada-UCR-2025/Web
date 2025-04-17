import { Client } from 'pg';
import fs from 'fs';
import path from 'path';

// Create a single connection pool that can be reused
let client: Client | null = null;

export async function getDbClient() {
    if (!client) {
        client = new Client({
            host: process.env.DB_HOST || "ucrconnect-postgresql-do-user-20845382-0.m.db.ondigitalocean.com",
            user: process.env.DB_USER || "backendUser",
            password: process.env.DB_PASSWORD || "",
            database: process.env.DB_NAME || "backendDB",
            port: parseInt(process.env.DB_PORT || "25060"),
            ssl: {
                ca: fs.readFileSync(path.join(process.cwd(), "certs", "digitalOcean-ca-certificate.crt")).toString()
            }
        });

        try {
            await client.connect();
            console.log('Successfully connected to PostgreSQL database');
        } catch (error) {
            console.error('Error connecting to PostgreSQL database:', error);
            throw error;
        }
    }
    return client;
}

// Function to close the database connection
export async function closeDbConnection() {
    if (client) {
        await client.end();
        client = null;
        console.log('Database connection closed');
    }
} 