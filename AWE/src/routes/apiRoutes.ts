import { pool } from "../db/db.js";

export async function handleApiRoutes(
  req: any,
  res: any,
  pathname: string,
  searchParams: URLSearchParams
) {
  if (pathname === "/api/accidents") {
    const startDate = searchParams.get("start_date");
    const endDate = searchParams.get("end_date");
    const states = searchParams.getAll("state");
    const cities = searchParams.getAll("city");
    const severity = searchParams.get("severity");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = 10;
    const offset = (page - 1) * limit;

    if (!startDate || !endDate) {
      res.writeHead(400);
      res.end("Start date and end date are required");
      return;
    }

    try {
      let whereClause = `WHERE start_time BETWEEN $1 AND $2`;
      const values: (string | number | string[])[] = [startDate, endDate];
      let paramIndex = 3;

      if (states.length > 0) {
        const statePlaceholders = states
          .map(() => `$${paramIndex++}`)
          .join(",");
        whereClause += ` AND state IN (${statePlaceholders})`;
        values.push(...states);
      }

      if (cities.length > 0) {
        const cityPlaceholders = cities.map(() => `$${paramIndex++}`).join(",");
        whereClause += ` AND city IN (${cityPlaceholders})`;
        values.push(...cities);
      }

      if (severity && severity !== "0") {
        whereClause += ` AND severity = $${paramIndex++}`;
        values.push(severity);
      }

      const countQuery = `SELECT COUNT(*) FROM accidents ${whereClause}`;
      const totalResult = await pool.query(countQuery, values);
      const totalAccidents = parseInt(totalResult.rows[0].count, 10);

      const query = `SELECT * FROM accidents ${whereClause} ORDER BY start_time DESC LIMIT $${paramIndex++} OFFSET $${paramIndex++}`;
      const queryValues = [...values, limit, offset];

      const result = await pool.query(query, queryValues);

      if (cities.length > 0 && totalAccidents === 0) {
        const missingCities = cities;
        res.writeHead(200, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            error: `The city selected doesn't exist in the state selected.`,
            missingCities: missingCities,
          })
        );
        return;
      }

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          accidents: result.rows,
          total: totalAccidents,
          page: page,
          limit: limit,
        })
      );
    } catch (error) {
      console.error("Database error:", error);
      res.writeHead(500);
      res.end("Error querying database");
    }
    return;
  }

  if (pathname === "/api/accidents/for-charts") {
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
      let whereClause = `WHERE start_time BETWEEN $1 AND $2`;
      const values: (string | number | string[])[] = [startDate, endDate];
      let paramIndex = 3;

      if (states.length > 0) {
        const statePlaceholders = states
          .map(() => `$${paramIndex++}`)
          .join(",");
        whereClause += ` AND state IN (${statePlaceholders})`;
        values.push(...states);
      }

      if (cities.length > 0) {
        const cityPlaceholders = cities.map(() => `$${paramIndex++}`).join(",");
        whereClause += ` AND city IN (${cityPlaceholders})`;
        values.push(...cities);
      }

      if (severity && severity !== "0") {
        whereClause += ` AND severity = $${paramIndex++}`;
        values.push(severity);
      }

      const query = `SELECT severity, start_time FROM accidents ${whereClause}`;
      const result = await pool.query(query, values);

      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify(result.rows));
    } catch (error) {
      console.error("Database error:", error);
      res.writeHead(500);
      res.end("Error querying database");
    }
    return;
  }

  res.writeHead(404);
  res.end("API Not Found");
}
