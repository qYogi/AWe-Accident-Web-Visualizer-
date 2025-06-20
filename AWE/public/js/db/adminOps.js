import { pool } from "./db.js";
export async function addAccident(accident) {
    const fields = [
        "id",
        "severity",
        "start_time",
        "end_time",
        "start_lat",
        "start_lng",
        "end_lat",
        "end_lng",
        "distance_mi",
        "description",
        "street",
        "city",
        "county",
        "state",
        "zipcode",
        "country",
        "timezone",
        "airport_code",
        "weather_timestamp",
        "temperature_f",
        "wind_chill_f",
        "humidity_percent",
        "pressure_in",
        "visibility_mi",
        "wind_direction",
        "wind_speed_mph",
        "precipitation_in",
        "weather_condition",
        "amenity",
        "bump",
        "crossing",
        "give_way",
        "junction",
        "no_exit",
        "railway",
        "roundabout",
        "station",
        "stop",
        "traffic_calming",
        "traffic_signal",
        "turning_loop",
        "sunrise_sunset",
        "civil_twilight",
        "nautical_twilight",
        "astronomical_twilight",
    ];
    const values = fields.map((f) => accident[f] !== undefined &&
        accident[f] !== ""
        ? accident[f]
        : null);
    const placeholders = fields.map((_, i) => `$${i + 1}`).join(", ");
    const query = `INSERT INTO accidents (${fields.join(", ")}) VALUES (${placeholders}) RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0];
}
export async function deleteAccident(id) {
    const query = `DELETE FROM accidents WHERE id = $1 RETURNING *`;
    const result = await pool.query(query, [id]);
    return result.rows[0];
}
