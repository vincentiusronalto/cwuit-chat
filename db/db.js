const {Pool} = require('pg');
const state = process.env.STATE;
// const logger = require('../lib/logger.js');
let poolObj;


    poolObj = {
        "host" : process.env.HOST,
        "port" : process.env.PORT,
        "user" : process.env.USER,
        "password" : process.env.DB_PASSWORD,
        "database" : process.env.DB_DATABASE,
        "max" : process.env.MAX,
        "connectionTimeoutMillis" : process.env.DB_TIMEOUT,
        "idleTimeoutMillis" : process.env.DB_IDLE
    }

const pool = new Pool(poolObj);
module.exports = {
    query: (text, params) => pool.query(text, params)
    .catch((err) =>{
        console.log(err);
        // logger.error(err.stack);
    })
}


