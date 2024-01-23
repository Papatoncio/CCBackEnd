const Pool = require('pg').Pool
const pool = new Pool({
    host: "roundhouse.proxy.rlwy.net",
    port: 16071,
    database: "railway",
    user: "postgres",
    password: "d1GEe4g-1CB3eFgGA5GACcb*1gGd4D4-"
});

export default pool;