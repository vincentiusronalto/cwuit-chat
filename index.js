// EXPRESS
const express = require('express');
const app = express();

//dot env
require('dotenv').config();

//csurf-cookie-bodyparser
const cookieParser = require('cookie-parser')

const csrf = require('csurf')
// const bodyParser = require('body-parser')
//https://stackoverflow.com/questions/24330014/bodyparser-is-deprecated-express-4
// app.use(bodyParser.urlencoded({extended: false}));
// app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(csrf({ cookie: true, httpOnly : true, secure: true}))

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



// ROUTES

// app.use(require('./routes/routes_app'));
app.use(require('./routes/routes_login'));
// app.use(require('./routes/routes_main'));
app.use(require('./routes/routes_new'));

// VIEWS
app.set('view engine', 'ejs');
app.use(express.static('public'));

const server = require('http').Server(app);

server.listen('3000', 'localhost',() => {
    console.log("Listening on port: 3000");
});

// server.listen('3000', localIP || 'localhost',() => {
//       console.log("Listening on port: 3000");
// });




require('./socket/listener_new')(server,session);