const express = require('express');
const router = express.Router();
const db = require('../db/db');

async function ifLoggedIn(req,res,next){
    
    if(req.session.uid){
        let myData = await db.query(`SELECT id,name,username,photo FROM users WHERE id = $1 LIMIT 1`,[req.session.uid]);
        res.locals.MYDATA = myData.rows[0]
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

// PROTECT IMAGE

router.get("/upload/private_chat/:something", async function(req,res,next){
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

});


router.get("/login", async function(req,res,next){
    res.render('login',{link:'login', csrf:req.csrfToken()});
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