// EXPRESS
const express = require('express');
const app = express();

//dot env
require('dotenv').config();

//csurf-cookie-bodyparser
const cookieParser = require('cookie-parser')
const bodyParser = require('body-parser')
const csrf = require('csurf')

app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(csrf({ cookie: true }))

//csurf-cookie-bodyparser
let localIP = '192.168.100.4';

// SESSION - REDIS
const Session = require('express-session');
const redis = require('redis');
let RedisStore = require('connect-redis')(Session);
let redisClient = redis.createClient();

const session = Session({
    store: new RedisStore({ client: redisClient }),
    secret: 'thisisverysecretpasswordoftheyear',  //keyboard cat
    resave: false,
    saveUninitialized : false
});

app.use(session)

// VIEWS
app.set('view engine', 'ejs');
app.use(express.static('public'));

// ROUTES

// app.use(require('./routes/routes_app'));
app.use(require('./routes/routes_login'));
// app.use(require('./routes/routes_main'));
app.use(require('./routes/routes_new'));


const server = require('http').Server(app);

server.listen('3000', 'localhost',() => {
    console.log("Listening on port: 3000");
});

// server.listen('3000', localIP || 'localhost',() => {
//       console.log("Listening on port: 3000");
// });




require('./socket/listener')(server,session);