const express = require('express');
const router = express.Router();
const db = require('../db/db');

async function ifLoggedIn(req,res,next){
    
    if(req.session.uid){
        res.locals.myid = req.session.uid;
        res.locals.ifLogin =  true;
    }else{
        res.locals.myid = '';
        res.locals.ifLogin = false;
    }
    
    next();
}

router.use(ifLoggedIn);

router.get("/", async function(req,res,next){ 
    if(res.locals.ifLogin){
        res.redirect('/chat')
    }else{
        res.redirect('/login')
    }

});
router.get("/login", async function(req,res,next){
    res.render('index',{link:'login', csrf:req.csrfToken()});
});
router.get("/chat", async function(req,res,next){
    res.render('index',{link:'chat', csrf:req.csrfToken()});
});
router.get("/u/:username", async function(req,res,next){
    res.render('index',{link:'profile', csrf:req.csrfToken()});
});

// router.get("*",async function(req,res,next){
//     res.status(404).render('main',{mainnav:'notfound', csrf:req.csrfToken()});
// });
module.exports = router;