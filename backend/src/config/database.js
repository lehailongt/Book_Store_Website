import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

dotenv.config();


// create a database if it does not exist and then build a pool
const DB_NAME = process.env.DB_NAME || 'book_store';

async function createPool() {
    // first create a connection without database to ensure it exists
    const rootConn = await mysql.createConnection({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        port: process.env.DB_PORT || 3306
    });

    try {
        await rootConn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);
        console.log(`✅ Database '${DB_NAME}' ensured`);
    } catch (err) {
        console.error('❌ Could not create database', err.message);
    } finally {
        await rootConn.end();
    }

    const pool = mysql.createPool({
        host: process.env.DB_HOST || 'localhost',
        user: process.env.DB_USER || 'root',
        password: process.env.DB_PASSWORD || '',
        database: DB_NAME,
        port: process.env.DB_PORT || 3306,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0,
        enableKeepAlive: true,
        keepAliveInitialDelay: 0
    });

    // test connection
    try {
        const connection = await pool.getConnection();
        console.log('✅ Kết nối MySQL thành công!');
        connection.release();
    } catch (error) {
        console.error('❌ Kết nối MySQL thất bại:', error.message);
    }

    return pool;
}

const pool = await createPool();

export default pool;