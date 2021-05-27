require('dotenv').config();
const socketio = require('socket.io');
const sharedsession = require("express-socket.io-session");
const sio_redis = require('socket.io-redis');
const db = require('../db/db');
// const func = require("./func.js");

const base64ToImage = require('base64-to-image');
const compressImg = require('../lib/compressnew.js');
const removeFile = require('../lib/remove.js');
const sanitizeHtml = require('sanitize-html');

const fetch = require('node-fetch');
// ARRAY FOR GUEST
let ranNumber = require('random-number');
const { query } = require('../db/db');
let options = {
  min:  1
, max:  999999999999
, integer: true
}

//need login
function needLogin(MYID){
    if(MYID == 0){
        return false;
    }else{
        return true;
    }
}

function cleanInput(dirty){
    let clean;
    
    let ifArray = Array.isArray(dirty);
    if(!dirty){
        clean = '';
    }else{
        if(ifArray){
        
            clean = [];
            let cleanSingle;
            // if(dirty)
            for(let i=0; i < dirty.length; i++){
                cleanSingle = sanitizeHtml(dirty, {
                    allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'mention','hashtag']),
                    disallowedTagsMode: 'escape'
                  });
                  clean.push(cleanSingle);
            }
            
            
        }else{
        clean = sanitizeHtml(dirty, {
            allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'mention','hashtag']),
            disallowedTagsMode: 'escape'
          });
        
        }

    }
    
    return clean
}

let onlineArr = [];
let offlineArr = [];

module.exports = function(server,session){
    const io = socketio(server,
        {
            maxHttpBufferSize: 1e8
        });
   

    io.adapter(sio_redis({ host: 'localhost', port: 6379 }));
    io.use(sharedsession(session));

    io.on('connection', async function(socket){
       
        let socketId = socket.id;
        let MYID = 0;
        
        if(socket.handshake.session.userid){
            MYID = socket.handshake.session.userid;    
        }


        // socketId
        // MYID
        if(MYID){
            onlineArr.push(MYID);            
            let index = offlineArr.indexOf(MYID);
            if (index !== -1) {
                offlineArr.splice(index, 1);
            }
            //if user online remove MYID value from array
            // socket.emit('user_online', MYID)
            socket.emit('user_just_online', MYID);
            
        }

        socket.on('user_check_online', function(){
            io.to(socketId).emit('user_check_online', onlineArr);
        });

        //on online / disconnect - online minute/hour/days ago
        socket.on('disconnect', async function(){
            
            if(!MYID){
                return 1;
            }
            offlineArr.push(MYID);
            setTimeout(async function(){ 
            
            let ifoffline =  offlineArr.includes(MYID); 
            
            if(ifoffline){

                let index2 = onlineArr.indexOf(MYID);
                if (index2 !== -1) {
                    onlineArr.splice(index2, 1);
                }

                //update user database last online
                dbUpdateLastOnline = await db.query(`UPDATE users SET status_last_online = NOW() WHERE id = $1`,[MYID]);

            }
            }, 5000);
                
            
            
        });

        // USER LOAD

        socket.on('user_load', async function(){
            
            //HARDCODED TO 1
            let dbTopic = await db.query(`SELECT id, name, image FROM chat_list_topic`);
            let topicList = dbTopic.rows;

            for(let i = 0; i < topicList.length; i++){
                 //GET 1 -  ALL TOPIC -last message
                let dbChatTopic = await db.query(`SELECT u.name, c.text  FROM users u, chat_data_topic c WHERE id_topic = $1 AND u.id = c.id_sender ORDER BY c.id DESC LIMIT 1`,[topicList[i].id]);
                topicList[i].lastchat = dbChatTopic.rows[0];
            }

           
            //load all member except me
            let dbMember = await db.query(`SELECT id, name, username, photo, info_gender FROM users WHERE id != $1`,[MYID]);
            let memberR = dbMember.rows;
            

            //loop and check chat
            for(let i =0; i < memberR.length; i++){
                let identity = '';
                //get identity
                if(memberR[i].id < MYID){
                    identity = `${memberR[i].id}_${MYID}`;
                }else{
                    identity = `${MYID}_${memberR[i].id}`;
                }

                memberR[i].identity = identity;

                let dbSingleMemberChat = await db.query(`SELECT u.name, c.text FROM chat_data_private c, users u WHERE identity = $1     AND c.sender_id = u.id ORDER BY c.id DESC LIMIT 1`,[identity]);
                memberR[i].lastchat = dbSingleMemberChat.rows[0];
            }

            let result =
            {   
                topic   : topicList,
                private : memberR
            }
            
            io.to(socketId).emit('user_load', result);
        });


        // CHAT

        socket.on('chat_load', async function(data){
            let type = data.type;
            let id = data.id;
            let inputId = id;
            
            let profileId = '';
            if(type == 'topic'){
                profileId = MYID;
            }else{
                let idS = id.split('_');
                for(let i = 0; i < idS.length; i++){
                    if(idS[i] != MYID){
                        profileId = idS[i]
                    }
                }
            }
            //if topic -> my profile
            
            //if private chat -> their profile

           

            // MYID
            let dbProfile = 
            await db.query(`SELECT id, name, username, photo, date_created, info_instagram, 
            info_twitter, info_bio, info_website, info_country, 
            info_facebook FROM users WHERE id = $1 LIMIT 1`,[profileId]);
            let profile = dbProfile.rows[0];
            // console.log(profileId)
            try{

                if(data.type == 'topic'){
                    let dbCheckTopic = await db.query(`SELECT name FROM chat_list_topic WHERE id = $1 LIMIT 1`,[inputId]);
                    profile.topic_name = dbCheckTopic.rows[0].name

                    profile.type = 'topic';
                    let sqlChat = `SELECT c.id, c.id_sender, c.text, c.date_created, 
                    c.id_topic, c.image, u.name, u.username, u.photo 
                    FROM chat_data_topic c, users u WHERE id_topic = $1 AND u.id = c.id_sender ORDER BY c.date_created ASC`;
                    let dbTopic = await db.query(sqlChat,[inputId]);
                    chat = dbTopic.rows;
                }else{
                    profile.type = 'private'
                    let sqlChat = `SELECT c.id, c.sender_id, c.receiver_id, c.identity, 
                    c.date_created, c.read_status, c.image, c.text, u.name, u.username, u.photo 
                    FROM chat_data_private c , users u WHERE identity = $1 AND u.id = c.sender_id`;
                    let dbTopic = await db.query(sqlChat,[inputId]);
                    chat = dbTopic.rows;
                }
                let result = {chat,profile};
                
                io.to(socketId).emit('chat_load', result);
            }catch(err){
                console.log(err)
            }
            
        });


        socket.on('chat_send', async function(){
            try{
                if(!needLogin(uid)){                
                    io.to(socketId).emit('need_login', true);
                    return 0 
                }
                let dbInsert;
                let checkId = data.checkId;
                let nullVal = null;
                let zero = '0';
                let pic = await uploadImage2(data.img,'chat');
                if(data.type == 'lang'){
                    
                    let sql = `INSERT INTO chat_data_language (sender_id, text, youtube, date_created, topic_id, picture, check_id)
                    VALUES ($1, $2, $3, NOW(), $4, $5, $6) RETURNING id, date_created
                    `;
                    
                    dbInsert = await db.query(sql, [uid,data.text,nullVal,data.topicId, pic, checkId]);
                    
                }else if(data.type == 'daily'){
                    let sql = `INSERT INTO chat_data_topic (sender_id, text, youtube, date_created, topic_id, picture, check_id)
                    VALUES ($1, $2, $3, NOW(), $4, $5, $6) RETURNING id, date_created
                    `;
    
                    dbInsert = await db.query(sql, [uid,data.text,nullVal,data.topicId, pic, checkId]);
                    
                }else{ //private
                    let sql = `INSERT INTO chat_data_personal (sender_id, text, receiver_id, identity, date_created, read_status,  youtube, picture, check_id)
                    VALUES ($1, $2, $3, $4, NOW(), $5, $6, $7, $8) RETURNING id, date_created
                    `;
                    let identityArr = data.topicId;
                    let receiverId;
                    for(let i = 0 ; i < identityArr.length; i++){
                        if(uid != identityArr[i]){
                            receiverId = identityArr[i];
                        }
                    }
                    
                    dbInsert = await db.query(sql, [uid,data.text,receiverId,data.topicId, zero, nullVal, pic, checkId]);
                    
                }
                //get sender data to present in ui
                let sqlSender = `SELECT id AS uid, name, username, photo FROM users WHERE id = $1 LIMIT 1`;
                let dbSender = await db.query(sqlSender, [uid]);
                
                let returnId = dbInsert.rows[0].id;
                let returnDate = dbInsert.rows[0].date_created;
                let senderData = {
                    uid : dbSender.rows[0].uid,
                    uphoto : dbSender.rows[0].photo,
                    uname : dbSender.rows[0].name,
                    username : dbSender.rows[0].username,
                    chatid : returnId,
                    cdate : returnDate,
                    ctext : data.text,
                    cpic : pic,
                    ctopicId : data.topicId,
                    ctype : data.type,
                    checkId : checkId
                }
                socket.emit('chat_send_finish', senderData);
            }catch(err){
                
            }
        });

        // PROFILE
        socket.on('profile_load', async function(){
            try{

            }catch(err){
                
            }
        });

        socket.on('profile_update', async function(){
            try{

            }catch(err){
                
            }
        });


        

        // USER INTERACTION

        socket.on('follow_check', async function(){
            try{
                if(!needLogin(uid)){                
                    io.to(socketId).emit('need_login', true);
                    return 0 
                }
    
              
                let object = cleanInput(data);
                let subject = uid;
    
                //check if i follow
                let dbFollowCheck = await db.query(`SELECT COUNT(subject) AS countfollow FROM follow WHERE subject = $1 AND object = $2`,[subject, object]);
                let followCheck = dbFollowCheck.rows[0].countfollow;
    
                if(followCheck > 0){
                    //hasnt follow -> so follow
                    let dbFollowUser = await db.query("INSERT INTO follow (subject, object, date_created) VALUES ($1, $2, NOW ()) returning id",[subject,object]); 
                    let result = dbFollowUser.rows[0].id;
                }else{
                    //already follow -> so unfollow
                    let dbFollowUser = await db.query("DELETE FROM follow WHERE subject = $1 AND object = $2; RETURNING id",[subject,object]); 
                    let result = dbFollowUser.rows[0].id;
                }
                //
                io.to(socketId).emit('user_follow', object);
            }catch(err){
                
            }
        })

        



    }); 

    
}
