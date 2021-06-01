const express = require('express');
const router = express.Router();
const db = require('../db/db');
const logger = require('../lib/logger.js');
async function ifLoggedIn(req,res,next){
    try{
    if(req.session.uid){
        let myData = await db.query(
        `SELECT id,name,username,photo,
        info_bio, info_website, info_instagram, info_facebook, info_twitter, info_country, info_gender, date_created
        FROM users WHERE id = $1 LIMIT 1`,[req.session.uid]);


        res.locals.MYDATA = myData.rows[0];

        console.log(res.locals.MYDATA)
        res.locals.myid = req.session.uid;
        res.locals.ifLogin =  true;
    }else{
        res.locals.MYDATA = {id:'0',name:'Guest',username:'guest',photo:'avatar.png',info_bio:'Hii',info_website:'https://www.example.com',info_instagram:'example',info_facebook:'example',info_twitter:'example',info_country:'example',
        info_gender:'male',date_created:'0'};
        res.locals.myid = '';
        res.locals.ifLogin = false;
    }
    
    next()
    }  catch(err){
        logger.error(err.stack);
    }
}





router.get("/", ifLoggedIn, async function(req,res,next){ 
    
    
    if(res.locals.ifLogin){
        res.redirect('/chat')
    }else{
        res.redirect('/login')
    }
    
});

// PROTECT IMAGE

router.get("/upload/private_chat/:something", ifLoggedIn, async function(req,res,next){
    try{
    let MYID = req.session.uid;
    if(!MYID){
        res.status(403).send({
            message: 'Access Forbidden'
         });
    }
    let check = req.params.something;
    let checkI = `%${check}%`;
    let dbCheck = await db.query(`SELECT image FROM chat_data_private WHERE (sender_id = $1 OR receiver_id = $1) AND image LIKE $2`,[MYID, checkI]);
    let checkR = dbCheck.rows.length;
    if(checkR > 0){
        next();
    }else{
        res.status(403).send({
            message: 'Access Forbidden'
         });
    }
    }catch(err){
        logger.error(err.stack);
    }

});


router.get("/login", ifLoggedIn, async function(req,res,next){
    
    res.render('login',{link:'login', csrf:req.csrfToken()});
});
router.get("/chat", ifLoggedIn, async function(req,res,next){
    
    res.render('index',{link:'chat', csrf:req.csrfToken()});
});
// router.get("/u/:username", ifLoggedIn,async function(req,res,next){
    
//     res.render('index',{link:'profile', csrf:req.csrfToken()});
// });



// router.get("*",async function(req,res,next){
//     res.status(404).render('main',{mainnav:'notfound', csrf:req.csrfToken()});
// });
module.exports = router;