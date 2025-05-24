import { Pool } from "pg";
import "dotenv/config";
export const pool = new Pool({
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT),
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: {
        rejectUnauthorized: false,
    },
});
pool.connect((err, client) => {
    if (err) {
        console.log(err.stack);
    }
    client?.query("SELECT * from accidents LIMIT 2", (err, res) => {
        if (err) {
            console.log(err.stack);
        }
        else {
            console.log(res.rows);
        }
        pool.end();
    });
});
