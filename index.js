// EXPRESS
const express = require('express');
const app = express();

//dot env
require('dotenv').config();

//csurf-cookie-bodyparser
const cookieParser = require('cookie-parser')
const csrf = require('csurf')
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());
app.use(csrf({ cookie: true, httpOnly : true, secure: true}))

//csurf-cookie-bodyparser


// SESSION - REDIS
const Session = require('express-session');
const redis = require('redis');
let RedisStore = require('connect-redis')(Session);
let redisClient = redis.createClient();

const session = Session({
    store: new RedisStore({ client: redisClient }),
    secret: PROCESS.ENV.SESSION_SECRET,  //keyboard cat
    resave: false,
    saveUninitialized : false
});

app.use(session)
app.use(require('./routes/routes_login'));
app.use(require('./routes/routes_new'));
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.get("*",async function(req,res,next){
    res.status(404).render('notfound');
});

const server = require('http').Server(app);



server.listen('3000', 'localhost',() => {
    console.log("Listening on port: 3000");
});

//if want to run server with shared local wifi
// server.listen('3000', process.env.LOCAL_IP || 'localhost',() => {
//       console.log("Listening on local ip:3000");
// });




require('./socket/listener_new')(server,session);