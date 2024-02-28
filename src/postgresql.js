const Pool = require('pg').Pool
const pool = new Pool({
    host: "roundhouse.proxy.rlwy.net",
    port: 30217,
    database: "railway",
    user: "postgres",
    password: "ed6bAEe2CE3d-AF63f2d32ageA3gcBEG"
});

export default pool;