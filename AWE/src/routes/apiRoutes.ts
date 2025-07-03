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
    const duration = searchParams.get("duration");
    const distance = searchParams.get("distance");
    const weather = searchParams.get("weather");
    const timeOfDay = searchParams.get("timeOfDay");
    const dayOfWeek = searchParams.get("dayOfWeek");
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

      if (duration && duration !== "all") {
        switch (duration) {
          case "short":
            whereClause += ` AND (end_time - start_time) < interval '30 minutes'`;
            break;
          case "medium":
            whereClause += ` AND (end_time - start_time) >= interval '30 minutes' AND (end_time - start_time) <= interval '2 hours'`;
            break;
          case "long":
            whereClause += ` AND (end_time - start_time) > interval '2 hours'`;
            break;
        }
      }

      if (distance && distance !== "all") {
        switch (distance) {
          case "short":
            whereClause += ` AND distance_mi < 1`;
            break;
          case "medium":
            whereClause += ` AND distance_mi >= 1 AND distance_mi <= 5`;
            break;
          case "long":
            whereClause += ` AND distance_mi > 5`;
            break;
        }
      }

      if (weather && weather !== "all") {
        let weatherConditions: string[] = [];
        switch (weather) {
          case "clear":
            weatherConditions = ["%Clear%"];
            break;
          case "rain":
            weatherConditions = ["%Rain%", "%Drizzle%", "%Showers%"];
            break;
          case "snow":
            weatherConditions = ["%Snow%", "%Sleet%", "%Blizzard%"];
            break;
          case "fog":
            weatherConditions = ["%Fog%", "%Mist%", "%Haze%"];
            break;
          case "cloudy":
            weatherConditions = ["%Cloud%", "%Overcast%", "%Partly Cloudy%"];
            break;
        }
        if (weatherConditions.length > 0) {
          whereClause +=
            " AND (" +
            weatherConditions
              .map((_, i) => `weather_condition ILIKE $${paramIndex + i}`)
              .join(" OR ") +
            ")";
          values.push(...weatherConditions);
          paramIndex += weatherConditions.length;
        }
      }

      if (timeOfDay && timeOfDay !== "all") {
        switch (timeOfDay) {
          case "morning":
            whereClause += ` AND EXTRACT(HOUR FROM start_time) >= 6 AND EXTRACT(HOUR FROM start_time) < 12`;
            break;
          case "afternoon":
            whereClause += ` AND EXTRACT(HOUR FROM start_time) >= 12 AND EXTRACT(HOUR FROM start_time) < 17`;
            break;
          case "evening":
            whereClause += ` AND EXTRACT(HOUR FROM start_time) >= 17 AND EXTRACT(HOUR FROM start_time) < 20`;
            break;
          case "night":
            whereClause += ` AND (EXTRACT(HOUR FROM start_time) >= 20 OR EXTRACT(HOUR FROM start_time) < 6)`;
            break;
        }
      }

      if (dayOfWeek && dayOfWeek !== "all") {
        switch (dayOfWeek) {
          case "monday":
            whereClause += ` AND EXTRACT(DOW FROM start_time) = 1`;
            break;
          case "tuesday":
            whereClause += ` AND EXTRACT(DOW FROM start_time) = 2`;
            break;
          case "wednesday":
            whereClause += ` AND EXTRACT(DOW FROM start_time) = 3`;
            break;
          case "thursday":
            whereClause += ` AND EXTRACT(DOW FROM start_time) = 4`;
            break;
          case "friday":
            whereClause += ` AND EXTRACT(DOW FROM start_time) = 5`;
            break;
          case "saturday":
            whereClause += ` AND EXTRACT(DOW FROM start_time) = 6`;
            break;
          case "sunday":
            whereClause += ` AND EXTRACT(DOW FROM start_time) = 0`;
            break;
          case "weekday":
            whereClause += ` AND EXTRACT(DOW FROM start_time) BETWEEN 1 AND 5`;
            break;
          case "weekend":
            whereClause += ` AND (EXTRACT(DOW FROM start_time) = 0 OR EXTRACT(DOW FROM start_time) = 6)`;
            break;
        }
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
    const duration = searchParams.get("duration");
    const distance = searchParams.get("distance");
    const weather = searchParams.get("weather");
    const timeOfDay = searchParams.get("timeOfDay");
    const dayOfWeek = searchParams.get("dayOfWeek");

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

      if (duration && duration !== "all") {
        switch (duration) {
          case "short":
            whereClause += ` AND (end_time - start_time) < interval '30 minutes'`;
            break;
          case "medium":
            whereClause += ` AND (end_time - start_time) >= interval '30 minutes' AND (end_time - start_time) <= interval '2 hours'`;
            break;
          case "long":
            whereClause += ` AND (end_time - start_time) > interval '2 hours'`;
            break;
        }
      }

      if (distance && distance !== "all") {
        switch (distance) {
          case "short":
            whereClause += ` AND distance_mi < 1`;
            break;
          case "medium":
            whereClause += ` AND distance_mi >= 1 AND distance_mi <= 5`;
            break;
          case "long":
            whereClause += ` AND distance_mi > 5`;
            break;
        }
      }

      
      if (weather && weather !== "all") {
        let weatherConditions: string[] = [];
        switch (weather) {
          case "clear":
            weatherConditions = ["%Clear%"];
            break;
          case "rain":
            weatherConditions = ["%Rain%", "%Drizzle%", "%Showers%"];
            break;
          case "snow":
            weatherConditions = ["%Snow%", "%Sleet%", "%Blizzard%"];
            break;
          case "fog":
            weatherConditions = ["%Fog%", "%Mist%", "%Haze%"];
            break;
          case "cloudy":
            weatherConditions = ["%Cloud%", "%Overcast%", "%Partly Cloudy%"];
            break;
        }
        if (weatherConditions.length > 0) {
          whereClause +=
            " AND (" +
            weatherConditions
              .map((_, i) => `weather_condition ILIKE $${paramIndex + i}`)
              .join(" OR ") +
            ")";
          values.push(...weatherConditions);
          paramIndex += weatherConditions.length;
        }
      }

      if (timeOfDay && timeOfDay !== "all") {
        switch (timeOfDay) {
          case "morning":
            whereClause += ` AND EXTRACT(HOUR FROM start_time) >= 6 AND EXTRACT(HOUR FROM start_time) < 12`;
            break;
          case "afternoon":
            whereClause += ` AND EXTRACT(HOUR FROM start_time) >= 12 AND EXTRACT(HOUR FROM start_time) < 17`;
            break;
          case "evening":
            whereClause += ` AND EXTRACT(HOUR FROM start_time) >= 17 AND EXTRACT(HOUR FROM start_time) < 20`;
            break;
          case "night":
            whereClause += ` AND (EXTRACT(HOUR FROM start_time) >= 20 OR EXTRACT(HOUR FROM start_time) < 6)`;
            break;
        }
      }

      if (dayOfWeek && dayOfWeek !== "all") {
        switch (dayOfWeek) {
          case "monday":
            whereClause += ` AND EXTRACT(DOW FROM start_time) = 1`;
            break;
          case "tuesday":
            whereClause += ` AND EXTRACT(DOW FROM start_time) = 2`;
            break;
          case "wednesday":
            whereClause += ` AND EXTRACT(DOW FROM start_time) = 3`;
            break;
          case "thursday":
            whereClause += ` AND EXTRACT(DOW FROM start_time) = 4`;
            break;
          case "friday":
            whereClause += ` AND EXTRACT(DOW FROM start_time) = 5`;
            break;
          case "saturday":
            whereClause += ` AND EXTRACT(DOW FROM start_time) = 6`;
            break;
          case "sunday":
            whereClause += ` AND EXTRACT(DOW FROM start_time) = 0`;
            break;
          case "weekday":
            whereClause += ` AND EXTRACT(DOW FROM start_time) BETWEEN 1 AND 5`;
            break;
          case "weekend":
            whereClause += ` AND (EXTRACT(DOW FROM start_time) = 0 OR EXTRACT(DOW FROM start_time) = 6)`;
            break;
        }
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
