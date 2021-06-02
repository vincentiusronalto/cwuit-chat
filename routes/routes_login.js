const db = require('../db/db');
const express = require('express');
const router = express.Router();
const xssFilters = require('xss-filters');
const isAlphanumeric = require('is-alphanumeric');
const emailValidator = require('email-validator');
const bcrypt = require('bcrypt');
const saltRounds = 8;
const uniqueKeygen = require('unique-keygen');
const logger = require('../lib/logger.js');
const sendemail = require('../lib/sendemail_new.js');

function tokenMaker(){
    let id1 = uniqueKeygen(20);
    let id2 = uniqueKeygen(20);
    let token = id1+'-'+id2;
    let result = 
    {
        token_hash  : id1,
        token_check : id2,
        token : token
    }
    
    return result;
}

router.get("/logout", async function(req,res,next){
    try{
        req.session.destroy();
        res.redirect('/');
    }catch(err){
        logger.error(err.stack);
    }
})

router.post("/auth_login",async function(req,res,next){
    try{
     
        let loginErrExist = false;
       
        let loginErr = '';

        //get username-email 
        const username_email       = xssFilters.inHTMLData(req.body.uname_email);
        const password             = xssFilters.inHTMLData(req.body.password);
        
        req.session.username_email = username_email;

        //check if username exist
        const dbGetUsername = await db.query('SELECT email, username, id, password, email_verified FROM users WHERE username = $1', [username_email]);

        //check if email exist
        const dbGetEmail    = await db.query('SELECT email, username, id, password, email_verified FROM users WHERE email = $1', [username_email]);
        
        let userEmail, userName, userId,userPassword,userActive;
        let userExist = false;
       
        if(dbGetUsername.rows.length >= 1){
            userEmail    = dbGetUsername.rows[0].email;
            userName     = dbGetUsername.rows[0].username;
            userId       = dbGetUsername.rows[0].id;
            userPassword = dbGetUsername.rows[0].password;
            userActive   = dbGetUsername.rows[0].email_verified;
            userExist    = true;
        }
        else if(dbGetEmail.rows.length >= 1){
            userEmail    = dbGetEmail.rows[0].email;
            userName     = dbGetEmail.rows[0].username;
            userId       = dbGetEmail.rows[0].id;
            userPassword = dbGetEmail.rows[0].password;
            userActive   = dbGetEmail.rows[0].email_verified;
            userExist    = true;
        }
        
        if(userExist){
            
            //username/email exist 
            const checkPassword = await bcrypt.compare(password, userPassword);

            if(checkPassword){
                
                //true password
                req.session.uid = userId;
                req.session.cookie.maxAge = 365 * 24 * 60 * 60 * 1000;
                req.session.justlogin = 'y';
                // FIRST LOGIN ATTEMPT
                // const dbUpdateStatusLogin = await db.query('UPDATE users SET status_is_online = 1 WHERE id = $1', [userId]);
                
                if(userActive == 1){
                    
                    
                    // res.redirect('/');
                    res.send({
                        success  : true,
                        type:'login',
                        note:'active'
                    })
                }else{
                    
                    res.send({
                        success  : true,
                        type:'login',
                        note:'not_active'
                    })
                }
            }else{
    
                //wrong password

                res.send({
                    success  : false,
                    type:'login',
                    note:'wrong_username/email/password'
                })
            }
            
            
        }else{
            //username/email not exist
            //send back to login, tell username/email not exist 
            
            res.send({
                success: false,
                type:'login',
                note:'wrong_username/email/password'
            })
        }
        
        

    } catch(err){
        
        logger.error(err.stack);
    }
})

router.post("/auth_register", async function(req,res,next){
    try{
        //clean input
        let username =  xssFilters.inHTMLData(req.body.username);
        let email    =  xssFilters.inHTMLData(req.body.email);
        let password =  xssFilters.inHTMLData(req.body.password);

        // let formdata = {username,email,password};
        
        let errExist = false;

        let errorCheck = {
            username_unique : [0,"username : already exist"],
            username_alpha  : [0,"username : only alphanumeric allowed (a-z or 0-9)"],
            username_length : [0,"username : 4-50 characters allowed"],
            email_unique    : [0,"email : already exist"],
            email_valid     : [0,"email : invalid format"],
            password_length : [0,"password : min 7 characters allowed"]
        }
    
        //USERNAME
        //is unique username 
        username = username.toLowerCase();
        const dbUniqueUser = await db.query('SELECT username FROM users WHERE username = $1', [username]);

        if(dbUniqueUser.rows.length > 0){
            errorCheck.username_unique[0] = 1;
        }
    
        //is alphanumeric && length 4-50
        let isAlphaUsername = isAlphanumeric(username);
        const userL = username.length;
    
        //EMAIL
        //is unique email
        const dbUniqueEmail = await db.query('SELECT email FROM users WHERE email = $1', [email]);
        if(dbUniqueEmail.rows.length > 0){
            errorCheck.email_unique[0] = 1;
        }
    
        //is valid email
        const validEmail = emailValidator.validate(email);
    
        //PASSWORD 
    
        //length 7-100
        const passL = password.length;
    
        //ERROR CHECKING
        if(!isAlphaUsername){
            errorCheck.username_alpha[0] = 1;
        }
        if(userL < 4 || userL > 30){
            errorCheck.username_length[0] = 1;
        }
        if(!validEmail){
            errorCheck.email_valid[0] = 1;
        }
        if(passL < 7){
            errorCheck.password_length[0] = 1;
        }

        
        let errArr = [];
        //CHECKING IF ANY ERROR = 1
        for (let key in errorCheck){
            if(errorCheck[key][0] == 1){
                errExist = 1;
                errArr.push(errorCheck[key][1]);
            }
        }
        
        //RETURN SIGNUP -OR- SUCCESSFUL OPERATION
    
        if(errExist){
          
    
            res.send({
                success  : false,
                type:'signup',
                errorCheck : errArr
            })
            
        }else{
           
          
            const hashPassword = await bcrypt.hash(password,saltRounds);
            let authority = 'member';
            let info_bio = `Hi I'm new here`;
            let photo = 'avatar.png'
            let saveUserSql = 
            `INSERT INTO users 
            (date_created, password, name, username, photo, email, authority, info_bio)
            VALUES (NOW(), $1, $2, $2, $3, $4, $5, $6) RETURNING id`
            let dbSaveNewUser = await db.query(saveUserSql,[hashPassword,username, photo, email, authority, info_bio])
           
            let user_id = dbSaveNewUser.rows[0].id;
           
            req.session.uid = user_id;
            req.session.cookie.maxAge = 365 * 24 * 60 * 60 * 1000;
            req.session.justlogin = 'y';
                if(user_id){
                    res.send({
                        success  : true,
                        type:'signup',
                        errorCheck,
                        email,
                        username
        
                    })
                }else{
                    res.send({
                        success  : false,
                        type:'signup',
                        errorCheck,
                        email,
                        username
        
                    })
                }
            
        }
        }catch(err){
            logger.error(err.stack);
            
        }
})
router.post("/auth_req_change_password", async function(req,res,next){
    try{
        const email = xssFilters.inHTMLData(req.body.email);
        
        // let email ='vincentius.ronalto.d@gmail.com';
        
        //CHECK EMAIL
        const dbCheckEmail = await db.query('SELECT id FROM users WHERE email = $1', [email]);
        
        
        if(dbCheckEmail.rows.length >= 1){
            
            //get user id
            const userId = dbCheckEmail.rows[0].id;

            //IF EMAIL EXIST SEND PASSWORD RESET

            let tokenResult = tokenMaker();
            
            let {token_hash, token_check, token} = tokenResult;

            //UPDATE TOKEN
            token_hash = await bcrypt.hash(token_hash,saltRounds);
            
            // const dbInsertToken = await db.query("UPDATE token_request SET token_hash = $1, token_check = $2, expiration_date = NOW() + interval '1 hour', available = TRUE WHERE user_id = $3", [token_hash, token_check, userId]);
            const dbInsertToken = await db.query("INSERT INTO token_request(token_hash, token_check, expiration_date, user_id, available) VALUES ($1, $2, NOW() + interval '1 hour', $3, TRUE)", [token_hash, token_check, userId]);
            if(process.env.STATE == 'D'){
                linkChangePassword = 'http://localhost:3000/change_password?token='+token;
            }else{
                linkChangePassword = 'https://www.cwuit.com/change_password?token='+token;
                
            }
            // thank you, we have sent link email regarding password reset
            // sorry, email not valid/not registered in our database, please signup first
            // let textSend = `<p>to activate your cwuit account, please click/copy the link below:</p><p><a href="${linkChangePassword}">${linkChangePassword}</a></p>`;
            
            let textSend = `<p>to reset your account password, please click/copy the link below: (this link below will be expired for hour from now on)</p><p><a href="${linkChangePassword}">${linkChangePassword}</a></p>`;
            

            //{
                //     from: "Excited User <mailgun@sandbox-123.mailgun.org>",
                //     to: ["test@example.com"],
                //     subject: "Hello",
                //     text: "Testing some Mailgun awesomness!",
                //     html: "<h1>Testing some Mailgun awesomness!</h1>"
                //   }
            const data = {
                from: 'Cwuit <noreply@cwuit.com>',
                to: email,
                subject: "Please reset your account's password",
                html: textSend
            }
            
            //SEND EMAIL
            const sendEmail = await sendemail(data);
            
            if(sendEmail){
                req.session.passResetOk =  true;
                
                res.send({
                    success  : true
                    
                })
                //set session to make user verified go to password reset ok
            }else{
                //success confirm back to login page
                
                res.send({
                    success  : false
                   
                })
            }
        }else{
            
            res.send({
                success  : false
                
            });
        }

    }catch(err){
        logger.error(err.stack);
        res.send({
            success  : false
            
        });
    }
})

router.get("/auth_create_new_password", async function(req,res,next){
    try{
        if(req.session.CreateNewPasswordUIDTransfer){
            //get password and confirm_password from post body
            let password         = xssFilters.inHTMLData(req.body.password);
            let confirm_password = xssFilters.inHTMLData(req.body.confirm_password);
            let userId = req.session.CreateNewPasswordUIDTransfer;
            req.session.CreateNewPasswordUIDTransfer = false;
            if(password.length < 7){
                res.send({
                    success : false,
                    errorMsg :'change password failed - password too short, min 7 chars'
                });
                
            }


            //check if password === confirm_password
            else if(password != confirm_password){
                res.send({
                    success  : false,
                    errorMsg : 'change password failed - wrong confirm field'
                })
                // res.send('change password failed - wrong confirm field');
            }
            else{
                //all-passed change user password
                //first encrypt the password
                const hashPassword = await bcrypt.hash(password,saltRounds);

                //second save to db
                const dbUpdateUserPassword = await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashPassword, userId]);

                
                

                // res.send('success :O');
                res.send({
                    success  : true,
                    errorMsg : 'success'
                })
            }
            

    }
    
    }
    
    
    catch(err){
        logger.error(err.stack);
    }
})

router.get("/verify", async function(req,res,next){
    try {
        //get token from url
        
        const token = req.query.token;
        
        const tokenArr = token.split("-");
        const token_hash = tokenArr[0];
        const token_check = tokenArr[1];
        
            //get token from database
            //check if token2(back is same && not expired)
            const dbGetToken = await db.query('SELECT id, token_hash, token_check, user_id FROM token_request WHERE token_check = $1 AND expiration_date > NOW()', [token_check]);
            
            let checker = dbGetToken.rows.length;
            if(checker == 0){
                
                // res.render('auth/verify_failed',{csrf:req.csrfToken()});
                
                req.session.notif = {
                    errExist : true,
                    Msg: "wrong/expired/used email verification token, please request new one",
                    Type : "email_verification_token"}
                
            }
            else{
                const tokenId = dbGetToken.rows[0].id;
                //check if crypt and token 1 is same
                const hashMatch = await bcrypt.compare(token_hash, dbGetToken.rows[0].token_hash);
                const userId = dbGetToken.rows[0].user_id;
        
                if(hashMatch){
                    //if compare true update user
                    
                    const one = 1;
                    const dbUpdateActive = await db.query('UPDATE users SET email_verified = $1 WHERE id = $2', [one,userId]);
                      
                    //successful update token to available to false
                    const dbUpdateTokenFalse = await db.query('UPDATE token_request SET available = FALSE WHERE id = $1', [tokenId]);
                    req.session.notif = {
                        errExist : false,
                        Msg: "Your email address has been succesfully verified! Please login to continue",
                        Type : "email_verification_token_success"}
                    
                }else{
                    req.session.notif = {
                        errExist : true,
                        Msg: "wrong/expired/used email verification token, please request new one",
                        Type : "email_verification_token"}
                }
            }
            res.redirect('/')
        } catch (error) {
            logger.error(err.stack);
        }
})

router.get("/auth_req_new_verify_emai", async function(req,res,next){
    try{
        let userEmail    = req.body.email;
        let dbCheckEmail = await db.query("SELECT id, email FROM users WHERE email = $1", [userEmail]);
        let emailCheck   = dbCheckEmail.rows.length;
        if(emailCheck === 0){
            res.send('notexist')
        }else{
            //check if email exist in db
            let user_id = dbCheckEmail.rows[0].id;
            let emailTo = dbCheckEmail.rows[0].email;
            let tokenResult = tokenMaker();
            let {token_hash,token_check,token} = tokenResult; 
    
            token_hash = await bcrypt.hash(token_hash,saltRounds);
            
            const dbInsertToken = await db.query(`INSERT INTO 
            token_request(token_hash, token_check, expiration_date, user_id, available) 
            VALUES ($1, $2, NOW() + interval '1 hour', $3, TRUE)`, 
            [token_hash, token_check, user_id]);
    
            if(process.env.STATE == 'D'){
                linkVerification = 'http://localhost:3000/verify?token='+token;
            }else{
                linkVerification = 'https://cwuit.com/verify?token='+token;
            }
            
            //------ SENDING EMAIL
            let textSend = `<p>to activate your cwuit account, please click/copy the link below:</p><p><a href="${linkVerification}">${linkVerification}</a></p>`;
    
            const data = {
                from: 'Cwuit <noreply@cwuit.com>',
                to: emailTo,
                subject: 'Please Activate Your Account',
                html: textSend
            }
            
            const sendEmail = await sendemail(data);
            res.send('exist')
        }
        }catch(err){
            logger.error(err.stack);
        }
})

router.get("/change_password", async function(req,res,next){

    // res.render('change_password',{mainnav:'support', csrf:req.csrfToken()});
    res.render('cpass',{mainnav:'support', csrf:req.csrfToken()});

    // try{
    //     if(req.session.CreateNewPasswordUID){
            
    //         req.session.CreateNewPasswordUIDTransfer = req.session.CreateNewPasswordUID;
       
    //         res.render('auth/create_new_password',{csrf:req.csrfToken()});
    //     }else{
    //         res.redirect('/password_reset');
    //     }
        
    // }catch(err){
    //     console.log(err);
    // }
})

router.post("/create_new_password", async function(req,res,next){    
    try{
        // return 0;
        //get password and confirm_password from post body
        let password         = xssFilters.inHTMLData(req.body.password);
        let confirm_password = xssFilters.inHTMLData(req.body.confirm_password);
        let token            = xssFilters.inHTMLData(req.body.token);


        

        if(password.length < 7){
        res.send({
        success : false,
        errorMsg :'change password failed - password too short, min 7 chars'
        });

        }


        //check if password === confirm_password
        else if(password != confirm_password){
        res.send({
        success  : false,
        errorMsg : 'change password failed - wrong confirm field'
        })
        // res.send('change password failed - wrong confirm field');
        }
        else{


        const tokenArr = token.split("-");
        const token_hash = tokenArr[0];
        const token_check = tokenArr[1];

        //get token from database
        //check if token2(back is same && not expired)
        const dbGetToken = await db.query('SELECT id, token_hash, token_check, user_id, available FROM token_request WHERE token_check = $1 AND expiration_date > NOW()', [token_check]);
            
        let checker = dbGetToken.rows.length;

        if(checker == 0){


        res.send({
        success  : false,
        errorMsg : 'wrong/expired token, please create new request'
        })

        }
        else{
        const tokenId = dbGetToken.rows[0].id;
        const userId = dbGetToken.rows[0].user_id;
        const available = dbGetToken.rows[0].available;

        //check if crypt and token 1 is same
        const hashMatch = await bcrypt.compare(token_hash, dbGetToken.rows[0].token_hash);



        
        if(!available){
        res.send({
        success  : false,
        errorMsg : 'already changed password, please create new request'
        })
        }

        else if(hashMatch){
        //if compare true update user

        //all-passed change user password
        //first encrypt the password
        const hashPassword = await bcrypt.hash(password,saltRounds);

        //second save to db
        const dbUpdateUserPassword = await db.query('UPDATE users SET password = $1 WHERE id = $2', [hashPassword, userId]);

        const dbUpdateTokenFalse = await db.query('UPDATE token_request SET available = FALSE WHERE id = $1', [tokenId]);
        // res.send('success :O');
        res.send({
        success  : true,
        errorMsg : 'success'
        })
        }else{
        res.send({
        success  : false,
        errorMsg : 'wrong token'
        })
        }
        }
        }
    }
    catch(err){
        logger.error(err.stack);
    }
});

module.exports = router;