const express = require('express');
const router = express.Router();
const db = require('../db/db');

const uniqueKeygen = require('unique-keygen');

//paypal
const paypal = require('paypal-rest-sdk');
const paypalEnv = process.env.STATE == 'D' ? 'sandbox' : 'live';
const paypalClient = process.env.STATE == 'D' ? process.env.PAYPAL_CLIENT_ID : process.env.PAYPAL_CLIENT_ID_P;
const paypalSecret = process.env.STATE == 'D' ? process.env.PAYPAL_CLIENT_SECRET : process.env.PAYPAL_CLIENT_SECRET_P;

paypal.configure({
    'mode': paypalEnv, //sandbox or live
    'client_id': paypalClient,
    'client_secret': paypalSecret
});

//sender, example: system
//receiver, example: 30 / receiver id
//message, example : hi thanks for joining cwuit.com
async function createInbox(sender,message,receiver,type){
    let dbCreateInbox = await db.query(`INSERT into inbox_list(uid, body, read_status, date_created, sender, type) VALUES ($1, $2, 0, NOW(), $3, $4)`,[
        receiver, message, sender,type
    ])
}

async function ifLoggedIn(req,res,next){
    let login = false;
    if(req.session.userid){
        res.locals.myid = req.session.userid;
        let myid = req.session.userid;

        let myDataSql = `SELECT id, name, username, photo FROM users WHERE id = $1`;
        let dbMyData = await db.query(myDataSql,[myid]);
        res.locals.myname = dbMyData.rows[0].name;
        res.locals.myusername = dbMyData.rows[0].username;
        res.locals.myphoto = dbMyData.rows[0].photo;
        
        login =  true;

    }else{
        res.locals.myid = '';
        login = false;
    }
    res.locals.ifLogin = login;
    next();
}

async function alsoFollow(req,res,next){
    let sqlRecProUser = `SELECT u.id, u.name, u.username, u.photo FROM users u, pro_list p WHERE u.id = p.uid`;
    let dbRecProUser = await db.query(sqlRecProUser);
    let resultRecProUser = dbRecProUser.rows;

    let sqlRecNewUser = `SELECT u.id, u.name, u.username, u.photo FROM users u ORDER BY date_created DESC LIMIT 5`;
    let dbRecNewUser = await db.query(sqlRecNewUser);
    let resultRecNewUser = dbRecNewUser.rows;
    res.locals.resultRecProUser = resultRecProUser;
    res.locals.resultRecNewUser = resultRecNewUser;
    next();
}

router.use(ifLoggedIn,alsoFollow);
router.get("/", async function(req,res,next){
    
    res.render('main',{mainnav:'chats', csrf:req.csrfToken()});
});

router.get("/search", async function(req,res,next){
    
    res.render('main',{mainnav:'search', csrf:req.csrfToken()});
});

router.get("/chats", async function(req,res,next){
    
    res.render('main',{mainnav:'chats', csrf:req.csrfToken()});
});

router.get("/posts", async function(req,res,next){
    
    res.render('main',{mainnav:'posts', csrf:req.csrfToken()});
});

router.get("/members", async function(req,res,next){
    
    res.render('main',{mainnav:'members', csrf:req.csrfToken()});
});

// router.get("/games", async function(req,res,next){
    
//     res.render('pages/main',{mainnav:'games', csrf:req.csrfToken()});
// });

router.get("/inbox", async function(req,res,next){
    
    res.render('main',{mainnav:'inbox', csrf:req.csrfToken()});
});
router.get("/pro", async function(req,res,next){
    
    res.render('main',{mainnav:'pro', csrf:req.csrfToken()});
});
router.get("/support", async function(req,res,next){
    
    res.render('main',{mainnav:'support', csrf:req.csrfToken()});
});
router.get("/shop", async function(req,res,next){
    
    res.render('main',{mainnav:'shop', csrf:req.csrfToken()});
});
router.get("/terms", async function(req,res,next){
    
    res.render('main',{mainnav:'terms', csrf:req.csrfToken()});
});
router.get("/privacy", async function(req,res,next){
    
    res.render('main',{mainnav:'privacy', csrf:req.csrfToken()});
});
router.get("/cookie", async function(req,res,next){
    
    res.render('main',{mainnav:'cookie', csrf:req.csrfToken()});
});

router.get("/profile/:username", async function(req,res,next){
    let username = req.params.username;
    let profileSql = `SELECT id, name, username, photo FROM users WHERE username = $1 LIMIT 1`;
    let dbProfile = await db.query(profileSql,[username]);
    let resultProfile = dbProfile.rows[0];

    //get users info
    // let usersInfo = await db.query

    
    res.render('main',{mainnav:'profile', profileData : resultProfile, csrf:req.csrfToken()});
    
});

 // Payment and paypal
router.post("/paypal_pay", async function(req, res, next){
    try{
            
        //IF PACKAGE
        // let gemsid = req.body.pkg_gemsid;
        // let dbGetGemId = await db.query(`SELECT amount, price FROM list_gems_package WHERE id = $1`,[gemsid]);
        // let gemsAmount = dbGetGemId.rows[0].amount;
        // let priceAmount = dbGetGemId.rows[0].price;

        // SINGLE GEMS BUY
        let gemsAmount = req.body.gems_amount;
        let priceAmount = gemsAmount * 0.40;
        priceAmount = Math.round(priceAmount * 100) / 100
        //add 2 decimals
        function add2Decimal(raw){
            //convert raw to string
            raw = ""+raw;
          
            //the magic
            let addDec = raw.indexOf('.') == -1 ? 
                         raw+'.00' : raw.length - raw.indexOf('.') == 2?
                         raw+'0' : raw;
            return addDec;
        }
        
        let gems_totalpriceI = add2Decimal(priceAmount);
        
        // decimalCount()

        let price = gems_totalpriceI; //"25.00"
        let itemName = gemsAmount + ' cwuit gems';
        let sku = uniqueKeygen(7);
        let description = 'gems payment';
        let quantity = "1";
        let currency = "USD";
        let url;
        
        req.session.gemsPayment = {
            price      : price,
            gemsAmount : gemsAmount,
            uid        : req.session.userid
        };
        console.log(price)
    
        if(process.env.STATE == 'D'){
            url = "http://localhost:3000/";
        }else{
            url = "https://cwuit.com/";
        }
        
        const create_payment_json = {
            "intent": "sale",
            "payer": {
                "payment_method": "paypal"
            },
            "redirect_urls": {
                "return_url": url+"paypal_success",
                "cancel_url": url+"paypal_cancel"
            },
            "transactions": [{
                "item_list": {
                    "items": [{
                        "name": itemName,
                        "sku": sku,
                        "price": price,
                        "currency": currency,
                        "quantity": quantity
                    }]
                },
                "amount": {
                    "currency": currency,
                    "total": price
                },
                "description": description
            }]
        }
        // console.log(create_payment_json);
        // res.send(create_payment_json);
        //if validation okay
        
        paypal.payment.create(create_payment_json, function (error, payment) {
            if (error) {
                console.log(error);
                // throw error;
            } else {
                for(let i = 0;i < payment.links.length;i++){
                  if(payment.links[i].rel === 'approval_url'){
                    res.redirect(payment.links[i].href);
                    
                    // res.sendStatus(200);
                  }
                }
            }
          });
        }
        catch(err){
            console.log(err.stack)
            // res.send('something is wrong, please check again later');
        }
});

router.get('/paypal_success', async function(req,res,next){
    // http://localhost:3000/paypal_success?paymentId=PAYID-L7NOVNA9PH61174AT403614M&token=EC-76W25601041649450&PayerID=6CWMMMPDDT9KU
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;
    const total = req.session.gemsPayment.price ;

    const execute_payment_json = {
    "payer_id": payerId,
    "transactions": [{
        "amount": {
            "currency": "USD",
            "total": total
        }
    }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, async function (error, payment) {
        if (error) {
            console.log(error.stack);
            // throw error;
        } else {
            console.log(JSON.stringify(payment));
            /*
            {"id":"PAYID-L7NPW6I513707750J5048355","intent":"sale","state":"approved","cart":"0MX71491TY2056739","payer":{"payment_method":"paypal","status":"VERIFIED","payer_info":{"email":"vincentius.ronalto.d-buyer@gmail.com","first_name":"test","last_name":"buyer","payer_id":"6CWMMMPDDT9KU","shipping_address":{"recipient_name":"test buyer","line1":"1 Main St","city":"San Jose","state":"CA","postal_code":"95131","country_code":"US"},"country_code":"US"}},"transactions":[{"amount":{"total":"100.00","currency":"USD","details":{"subtotal":"100.00","shipping":"0.00","insurance":"0.00","handling_fee":"0.00","shipping_discount":"0.00","discount":"0.00"}},"payee":{"merchant_id":"X5AGVY5SQS6E6","email":"vincentius.ronalto.d-facilitator@gmail.com"},"description":"gems payment","item_list":{"items":[{"name":"10 cwuit gems","sku":"up2sl8k","price":"100.00","currency":"USD","tax":"0.00","quantity":1}],"shipping_address":{"recipient_name":"test buyer","line1":"1 Main St","city":"San Jose","state":"CA","postal_code":"95131","country_code":"US"}},"related_resources":[{"sale":{"id":"9RB78903VG745915H","state":"completed","amount":{"total":"100.00","currency":"USD","details":{"subtotal":"100.00","shipping":"0.00","insurance":"0.00","handling_fee":"0.00","shipping_discount":"0.00","discount":"0.00"}},"payment_mode":"INSTANT_TRANSFER","protection_eligibility":"ELIGIBLE","protection_eligibility_type":"ITEM_NOT_RECEIVED_ELIGIBLE,UNAUTHORIZED_PAYMENT_ELIGIBLE","transaction_fee":{"value":"3.20","currency":"USD"},"parent_payment":"PAYID-L7NPW6I513707750J5048355","create_time":"2020-12-17T06:32:56Z","update_time":"2020-12-17T06:32:56Z","links":[{"href":"https://api.sandbox.paypal.com/v1/payments/sale/9RB78903VG745915H","rel":"self","method":"GET"},{"href":"https://api.sandbox.paypal.com/v1/payments/sale/9RB78903VG745915H/refund","rel":"refund","method":"POST"},{"href":"https://api.sandbox.paypal.com/v1/payments/payment/PAYID-L7NPW6I513707750J5048355","rel":"parent_payment","method":"GET"}]}}]}],"failed_transactions":[],"create_time":"2020-12-17T06:32:25Z","update_time":"2020-12-17T06:32:56Z","links":[{"href":"https://api.sandbox.paypal.com/v1/payments/payment/PAYID-L7NPW6I513707750J5048355","rel":"self","method":"GET"}],"httpStatusCode":200}
            */

            // req.session.gemsPayment = {
            //     price      : price,
            //     gemsAmount : gemsAmount,
            //     uid        : req.session.user.id
            // };

            let placeholder = {
                price : req.session.gemsPayment.price,
                payid : payment.id,
                gems  : req.session.gemsPayment.gemsAmount,
                uid   : req.session.gemsPayment.uid
            }

            //get gems before + gems after
            let dbGemsCheck = await db.query(`SELECT gems FROM users WHERE id = $1 LIMIT 1`,[placeholder.uid]);
            let gemsBefore = parseInt(dbGemsCheck.rows[0].gems);
            let gemsAfter = gemsBefore + parseInt(placeholder.gems);

            //insert gems after to users db
            let dbUpdateGems = await db.query(`UPDATE users SET gems = $1 WHERE id = $2`,[gemsAfter, placeholder.uid]);

            // add to transaction db
            let dbGetGemPackage = await db.query(`
            INSERT INTO transaction_gems 
            (price, paypal_id, uid, date_created, total_gems, gems_before, gems_after)
            VALUES
            ($1,$2,$3,NOW(),$4, $5, $6) RETURNING id`,
            [
            placeholder.price, placeholder.payid,
            placeholder.uid, placeholder.gems, gemsBefore, gemsAfter
            ]);

            //create inbox thank you
            createInbox('system',`Thank you so much for purchasing ${placeholder.gems} gems, now you can use it for purchasing banner ad`,placeholder.uid,'system')
            //

            let infoId = dbGetGemPackage.rows[0].id;
            //send success msg / thanks
            if(infoId){
                //success
                //redirect to inbox for checking thanks
                res.redirect('/inbox');
                //send back to page
            }{
                //failed
            }


        }
    });
});

router.get('/paypal_cancel', async function(req,res){
    res.redirect('/store');
} );



router.get("*",async function(req,res,next){
    res.status(404).render('main',{mainnav:'notfound', csrf:req.csrfToken()});
});


module.exports = router;