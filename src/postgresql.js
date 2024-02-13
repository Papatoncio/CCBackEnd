const Pool = require('pg').Pool
const pool = new Pool({
    host: "localhost",
    port: 5432,
    database: "capicode",
    user: "postgres",
    password: "linux"
});

export default pool;