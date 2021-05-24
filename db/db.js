const {Pool} = require('pg');
const state = process.env.STATE;
// const logger = require('../lib/logger.js');
let poolObj;


    poolObj = {
        "host" : "207.246.95.250",
        "port" : 5432,
        "user" : "vincdb",
        "password" : "jojon123",
        "database" : "cwuit_new2",
        "max" : 100,
        "connectionTimeoutMillis" : 30000,
        "idleTimeoutMillis" : 3000
    }

const pool = new Pool(poolObj);
module.exports = {
    query: (text, params) => pool.query(text, params)
    .catch((err) =>{
        console.log(err);
        // logger.error(err.stack);
    })
}


