import { pool } from "../db/db.js";
export async function handleApiRoutes(req, res, pathname, searchParams) {
    if (pathname === "/api/accidents") {
        const startDate = searchParams.get("start_date");
        const endDate = searchParams.get("end_date");
        const states = searchParams.getAll("state");
        const cities = searchParams.getAll("city");
        const severity = searchParams.get("severity");
        if (!startDate || !endDate) {
            res.writeHead(400);
            res.end("Start date and end date are required");
            return;
        }
        try {
            let query = `SELECT * FROM accidents WHERE start_time BETWEEN $1 AND $2`;
            const values = [startDate, endDate];
            let paramIndex = 3;
            if (states.length > 0) {
                const statePlaceholders = states
                    .map(() => `$${paramIndex++}`)
                    .join(",");
                query += ` AND state IN (${statePlaceholders})`;
                values.push(...states);
            }
            if (cities.length > 0) {
                const cityPlaceholders = cities.map(() => `$${paramIndex++}`).join(",");
                query += ` AND city IN (${cityPlaceholders})`;
                values.push(...cities);
            }
            if (severity) {
                query += ` AND severity = $${paramIndex++}`;
                values.push(severity);
            }
            query += ` ORDER BY start_time DESC`;
            const result = await pool.query(query, values);
            if (cities.length > 0) {
                const foundCities = new Set(result.rows.map((row) => row.city));
                const missingCities = cities.filter((city) => !foundCities.has(city));
                if (missingCities.length > 0 && result.rows.length === 0) {
                    res.writeHead(200, { "Content-Type": "application/json" });
                    res.end(JSON.stringify({
                        error: `The city selected doesn't exist in the state selected.`,
                        missingCities: missingCities,
                    }));
                    return;
                }
            }
            res.writeHead(200, { "Content-Type": "application/json" });
            res.end(JSON.stringify(result.rows));
        }
        catch (error) {
            console.error("Database error:", error);
            res.writeHead(500);
            res.end("Error querying database");
        }
        return;
    }
    res.writeHead(404);
    res.end("API Not Found");
}
