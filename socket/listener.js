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
let options = {
  min:  1
, max:  999999999999
, integer: true
}

//need login
function needLogin(uid){
    if(uid == 0){
        return false;
    }else{
        return true;
    }
}



function aaa(uid){ console.log('hihi'); return 0}
// 
async function createInbox(sender,message,receiver,type){
    let dbCreateInbox = await db.query(`INSERT into inbox_list(uid, body, read_status, date_created, sender, type) VALUES ($1, $2, 0, NOW(), $3, $4)`,[
        receiver, message, sender,type
    ])
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

async function uploadImage(inputRaw, location){
    try{
    
    let input = inputRaw.map(x=>x[1]);
    
    //input : ['base64_1','base64_2',...] etc
  
    // [[xxx.png,""],[xxx.png,"base64"]]
    // looping and skip if no [[0,1]] 1 is empty string
    let imageResult = '';
    
    if(input.length > 0){ 
        
        for(i = 0,j = input.length; i < j; i++){
  
            if (!input[i]) { continue; }
  
            //convert base64 to image
            
            let base64Str = input[i];
            let uncompress_path = './public/upload/uncompressed/';
            
            //input:base64 and output:uncompresspath
            // imageInfo : { imageType: 'jpeg', fileName: 'img-1571230468779.jpeg' }
            let imageInfo = await base64ToImage(base64Str,uncompress_path); 
         
            let uncompress_path_start = uncompress_path+imageInfo.fileName;
            let compress_output = './public/upload/'+location;
  
            //COMPRESS ALL TO WEBP --
            //input:uncompresspath+filename and output public+location
            
            let check = await compressImg(uncompress_path_start, compress_output);
          
            // await removeFile(uncompress_path_start);
  
  
            // await webpConvert(compress_output);
  
            if(i == j-1){
                imageResult += imageInfo.fileName + "";
                
            }else{
                imageResult += imageInfo.fileName + "_";
            }
         }
         
    }else{
        imageResult = '';
    }
    return imageResult;
    }catch(err){
        logger.error(err.stack);
    }
  }
  
  async function uploadImage2(input, location){
    
    //single image upload , without old file name
    try{
    // (input);
    //input : ['base64_1','base64_2',...] etc
    let imageResult = '';
  
    if(input.length > 0){ 
        
        for(i = 0,j = input.length; i < j; i++){
            //convert base64 to image
            
            let base64Str = input[i];
            let uncompress_path = './public/upload/uncompressed/';
            
            //input:base64 and output:uncompresspath
            // imageInfo : { imageType: 'jpeg', fileName: 'img-1571230468779.jpeg' }
            let imageInfo = await base64ToImage(base64Str,uncompress_path); 
  
            let uncompress_path_start = uncompress_path+imageInfo.fileName;
            let compress_output = './public/upload/'+location;
  
            //input:uncompresspath+filename and output public+location
            let check = await compressImg(uncompress_path_start, compress_output);
  
            //delete uncompress image
            let checkRemove = await removeFile(uncompress_path_start);
  
            
            if(i == j-1){
                imageResult += imageInfo.fileName + "";
                
            }else{
                imageResult += imageInfo.fileName + "_";
            }
         }
         
    }else{
        imageResult = null;
    }
    return imageResult;
    }catch(err){
        (err);
    }
  }

function sanitize(){
    clean = sanitizeHtml(dirty, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat([ 'mention','hashtag']),
        disallowedTagsMode: 'escape'
      });
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
        let uid = 0;
        
        if(socket.handshake.session.userid){
            uid = socket.handshake.session.userid;    
        }


        // socketId
        // uid
        if(uid){
            onlineArr.push(uid);            
            let index = offlineArr.indexOf(uid);
            if (index !== -1) {
                offlineArr.splice(index, 1);
            }
            //if user online remove uid value from array
            // socket.emit('user_online', uid)
            socket.emit('user_just_online', uid);
            
        }

        socket.on('user_check_online', function(){
            io.to(socketId).emit('user_check_online', onlineArr);
        });

        //on online / disconnect - online minute/hour/days ago
        socket.on('disconnect', async function(){
            
            if(!uid){
                return 1;
            }
            offlineArr.push(uid);
            setTimeout(async function(){ 
            
            let ifoffline =  offlineArr.includes(uid); 
            
            if(ifoffline){

                let index2 = onlineArr.indexOf(uid);
                if (index2 !== -1) {
                    onlineArr.splice(index2, 1);
                }

                //update user database last online
                dbUpdateLastOnline = await db.query(`UPDATE users SET status_last_online = NOW() WHERE id = $1`,[uid]);

            }
            }, 5000);
                
            
            
        });

        socket.on('first_init', async function(data){
            let sqlChatTopicTopic = `SELECT id, name FROM chat_list_topic`;
            let dbTopic = await db.query(sqlChatTopicTopic);
            let topic = dbTopic.rows;
            
            io.to(socketId).emit('first_init', topic);
        });

        socket.on('request_guest_id',async function(data){
            
            const result = await func.request_guest_id(socketId);
            if(result.success){
                io.to(socketId).emit('request_guest_id', result.guestId);
            }
        });
        socket.on('search_result', async function(data){
            
            let word = `%${data}%`; 
            let searchUser = `SELECT id, name, username, photo from users WHERE name LIKE $1 OR username LIKE $1`;
            let dbSearchUser = await db.query(searchUser,[word]);

            let searchPost = `SELECT id, uid, text, image, youtube, date_created, is_exist FROM posting WHERE text LIKE $1 AND is_exist = '1'`;
            let dbSearchPost = await db.query(searchPost,[word]);
            let result = {user : dbSearchUser.rows, post : dbSearchPost.rows};
            
            
            io.to(socketId).emit('search_result', result);
        });

        socket.on('mention_suggestion', async function(data){
            let word = `%${data}%`;
            let sql = `SELECT id, name, username, photo FROM users WHERE name LIKE $1 OR username LIKE $1`;
            let dbMention = await db.query(sql,[word]);
            let result = dbMention.rows;
            
            io.to(socketId).emit('mention_suggestion', result);
        });

        // socket.on('check_notif_chat', async function(){
            
        //     let check = await func.check_notif_chat(uid);
            
        //     io.to(socketId).emit('check_notif_chat', check);
        // });

        // socket.on('check_notif_inbox', async function(){

        // });

        //** 
        socket.on('user_follow', async function(data){
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
        });

        socket.on('user_unfollow', async function(data){
            let subject = socket.handshake.session.user.id
            // const result = await func.user_unfollow(subject,object);
        });

        socket.on('follow_check', async function(data){

        });

        //first load post **
        socket.on('posting_load_first', async function(data){
            // const result = await func.posting_load_first(uid);
            io.to(socketId).emit('posting_load_first', result);
        });

        //**
        socket.on('posting_load_more', async function(data){
            // const result = await func.posting_load();
            io.to(socketId).emit('posting_load', result.guestId);
        });
        socket.on('posting_create',async function(data){
            try{
                if(!needLogin(uid)){                
                    io.to(socketId).emit('need_login', true);
                    return 0 
                }

                let zero = 0;
                let one = 1;
                data.youtube = '';
                let sql = 
                `INSERT INTO posting 
                (uid, text, image, youtube, 
                date_created, is_exist, is_sponsored)
                VALUES ($1,$2,$3,$4,NOW(),$5,$6) RETURNING id, date_created`;
                let text = cleanInput(data.text);
                let image = await uploadImage2(data.image,'post');
                let createPost = await db.query(sql,
                [uid, text,
                image, data.youtube, one, zero]);
        
                let lastid = createPost.rows[0].id;
                let lastdate = createPost.rows[0].date_created;
        
                let user_data = `SELECT id, name, username, photo FROM users WHERE id = $1`;
        
                let dbUserData = await db.query(user_data,[uid]);
        
                let result = {
                  user : dbUserData.rows[0],
                  post : {
                    text : text,
                    image : image,
                    id : lastid,
                    date : lastdate
                  }
                }
                io.to(socketId).emit('posting_create', result);
              }catch(err){
                console.log(err);
        
              }
        });
        socket.on('posting_remove',async function(data){
            try{
                if(!needLogin(uid)){                
                    io.to(socketId).emit('need_login', true);
                    return 0 
                }

                let sql = `UPDATE posting SET is_exist = '0' WHERE id = $1`;
                let dbPostingCreate = await db.query(sql);
                let result = dbPostingCreate.rows[0];
              }catch(err){
                console.log(err);
              }
        });

        socket.on('posting_comment_create', async function(data){
            try{
                if(!needLogin(uid)){                
                    io.to(socketId).emit('need_login', true);
                    return 0 
                }

                let sql = `INSERT INTO posting_comment (uid, posting_id, text, date_created, is_exist)
                VALUES ($1, $2, $3, NOW(), $4) RETURNING id`
                let dbInsert = await db.query(sql, [uid, postid, text, is_exist]);

                let udata = await db.query(`
                SELECT id, name, username, photo from users WHERE id = $1
                `,[uid]);

            }catch(err){
                console.log(err);
            }
        });

        socket.on('posting_comment_load',async function(data){
            try{
                if(!needLogin(uid)){                
                    io.to(socketId).emit('need_login', true);
                    return 0 
                }

                let sql = `SELECT id, uid, posting_id, text, date_created FROM posting_comment WHERE posting_id = $1`;
                let dbLoad = await db.query(sql,[postid]);
                let result = dbLoad.rows;
                io.to(socketId).emit('posting_comment_load', result);
              }catch(err){
        
              }
        });
        socket.on('posting_comment_remove',async function(data){
            try{
                if(!needLogin(uid)){                
                    io.to(socketId).emit('need_login', true);
                    return 0 
                }

                let sql = `UPDATE posting_comment SET is_exist = '0' WHERE id = $1`;
                let dbPostingCreate = await db.query(sql,[commentid]);
                let result = dbPostingCreate.rows[0];
            }catch(err){
                console.log(err);
            }
            
        });
        socket.on('posting_like', async function(data){
            try{
                if(!needLogin(uid)){                
                    io.to(socketId).emit('need_login', true);
                    return 0 
                }

                let postid = data;
                //check if user has like
                let sqlCheck1 = `SELECT COUNT(posting_id) FROM posting_like  WHERE posting_id = $1 AND uid = $2`;
                let dbCheck1 = await db.query(sqlCheck1,[postid, uid]);
                let check1 = dbCheck1.rows[0].count;
                let result = {};
                if(check1 >= '1'){
                  //delete / cancel like
                  let sqlDelete = `DELETE FROM posting_like WHERE posting_id = $1 and uid = $2`;
                  let dbDelete = await db.query(sqlDelete,[postid, uid]);
                  result.type = 'cancel';
                }else{
                  //add like
                  let sqlLike = `INSERT INTO posting_like (posting_id, uid, date_created) VALUES ($1,$2,NOW())`;
                  let dbLike = await db.query(sqlLike,[postid, uid]);
                  result.type = 'like';
                }
        
        
                //get number of like
        
                let sql2 = `SELECT COUNT(posting_id) FROM posting_like  WHERE posting_id = $1 AND uid = $2`;
                let dbCheck2 = await db.query(sql2,[postid, uid]);
        
                result.likecount = dbCheck2.rows[0].count;
                result.postid = postid;
                
                io.to(socketId).emit('posting_like', result);
              }catch(err){
                  console.log(err);
              }
        });
     
        socket.on('chat_load_first', async function(){
            let sqlChatTopicTopic = `SELECT id, name FROM chat_list_topic`;
            let dbTopic = await db.query(sqlChatTopicTopic);
            let topic = dbTopic.rows;

            let sqlChatTopicLang = `SELECT id, language AS name FROM chat_list_language`;
            let dbLang = await db.query(sqlChatTopicLang);
            let lang = dbLang.rows;

            let private = [];
            
                
            if(uid){
                let sqlChatTopicPrivate = `SELECT DISTINCT identity FROM chat_data_personal WHERE sender_id = $1 OR receiver_id = $1`;
                
                let dbPrivate = await db.query(sqlChatTopicPrivate,[uid])
                
                let privateArr = dbPrivate.rows;
                
                let splitPrivate;
                for(let i = 0; i < privateArr.length; i++){
                    splitPrivate = privateArr[i].identity.split('_');
                   
                    let partnerId;
                    for(let k = 0; k < splitPrivate.length; k++){
                        if(uid != splitPrivate[k]){
                            partnerId = splitPrivate[k];
                        }
                    }

                    partnerId = partnerId + '';
                    let partnerInfo = await db.query(`SELECT id, name, username, photo FROM users WHERE id = $1 LIMIT 1`, [partnerId]);
                    let partner = partnerInfo.rows[0];
                    partner.identity = privateArr[i].identity;
                    private.push(partner);
                    /*
                    {
                        id: '4',
                        name: 'wikiman',
                        username: 'wikiman',
                        photo: 'profileempty.png'
                    }
                    */
                    // (partner);
                    // private[i].partner = partner;

                }
            }
            (private)
            
            let result = {topic, lang, private};
            
            io.to(socketId).emit('chat_load_first', result);
        });

        socket.on('chat_new_single', async function(data){
            

            let identity = cleanInput(data);
            let identityArr = identity.split("_");
   
            let partnerId;
            
            // uid
            for(let i = 0; i < identityArr.length; i++){
                if(!(identityArr[i] == uid)){
                    partnerId = identityArr[i];
                }
            }

            // get partner data for topic selection

            let dbPartnerData = await db.query(`SELECT id, name, username, photo FROM users WHERE id = $1 LIMIT 1`,[partnerId]);
            let partnerData = dbPartnerData.rows[0];

            // get chat from identity
            let sqlGetChat = `SELECT c.id, c.sender_id, c.receiver_id, c.identity, 
            c.date_created, c.read_status, c.picture, c.text, u.name, u.username, u.photo 
            FROM chat_data_personal c , users u WHERE identity = $1 AND u.id = c.sender_id`;
            let dbChatSingle = await db.query(sqlGetChat,[identity]);
            let chatresult = dbChatSingle.rows;
            let data2 = {
                type : "private",
                chatid : identity,
                name : partnerData.name,
                partnerPhoto : partnerData.photo,
                partnerId : partnerData.id,
                partnerUsername : partnerData.username
            };
            let result  = {
                data : data2,
                chat : chatresult
            }
            io.to(socketId).emit('chat_new_single', result);

        });

        socket.on('chat_get_inside', async function(data){
         
            let result;
            let chat;
          
            if(data.type == 'daily'){
                let sqlChat = `SELECT c.id, c.sender_id, c.text, c.date_created, 
                c.topic_id, c.picture, u.name, u.username, u.photo 
                FROM chat_data_topic c, users u WHERE topic_id = $1 AND u.id = c.sender_id ORDER BY c.date_created ASC`;
                let dbTopic = await db.query(sqlChat,[data.chatid]);
                chat = dbTopic.rows;
            }
            else if(data.type == 'lang'){
                let sqlChat = `SELECT c.id, c.sender_id, c.text, c.date_created, 
                c.topic_id , c.picture, u.name, u.username, u.photo 
                FROM chat_data_language c, users u WHERE topic_id = $1 AND u.id = c.sender_id`;
                let dbTopic = await db.query(sqlChat,[data.chatid]);
                chat = dbTopic.rows;
            }
            //{ type: 'private', chatid: '3_4', name: 'wikiman' }
            else if(data.type == 'private'){
                let sqlChat = `SELECT c.id, c.sender_id, c.receiver_id, c.identity, 
                c.date_created, c.read_status, c.picture, c.text, u.name, u.username, u.photo 
                FROM chat_data_personal c , users u WHERE identity = $1 AND u.id = c.sender_id`;
                let dbTopic = await db.query(sqlChat,[data.chatid]);
                chat = dbTopic.rows;
            }  
            result = {
                chat,
                data
            }
            
            io.to(socketId).emit('chat_get_inside', result);
        })

        socket.on('chat_send_finish', async function(data){
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
            
        });

        socket.on('members_get', async function(data){
            let dbGetMembers = await db.query(`
                SELECT u.id, u.name, u.username, u.photo, u.date_created, u.membership FROM users u
            `);
            let members = dbGetMembers.rows
            for(let i = 0; i < members.length; i++){
            let userid = members[i].id;
                //count chats
            let dbCountChatTopic = await db.query(`SELECT COUNT(id) FROM chat_data_topic WHERE sender_id = $1`,[userid]);
            let countChatTopic = dbCountChatTopic.rows[0].count;
            let dbCountChatLang = await db.query(`
                SELECT COUNT(id) FROM chat_data_language WHERE sender_id = $1`,[userid]);
            let countChatLang = dbCountChatLang.rows[0].count;

                //count posts
            let dbCountPosts = await db.query(`
                SELECT COUNT(id) FROM posting WHERE uid = $1 AND is_exist = '1'`,[userid]);
            let countPosts = dbCountPosts.rows[0].count;

            members[i].chatCount = parseInt(countChatTopic) + parseInt(countChatLang);
            members[i].postCount = countPosts;


            //check if i follow
            let dbFollowCheck = await db.query(`SELECT COUNT(subject) AS countfollow FROM follow WHERE subject = $1 AND object = $2`,[uid, members[i].id]);
            let followCheck = dbFollowCheck.rows[0].countfollow;
            
            if(followCheck > 0){
                //I follow
                members[i].ifollow = true;
            }else{
                //I dont follow
                members[i].ifollow = false;
            }

            }
            
            
            io.to(socketId).emit('members_get', members);
            
        });
       
        socket.on('support_update', async function(data){
            
        });
       
        socket.on('profile_update', async function(data){
            //change name, username
            
        });

        socket.on('bio_update', async function(data){
            try{
                if(!needLogin(uid)){                
                    return 0 
                }

                data.uid = uid;
                let sql = `UPDATE users_info SET  about_me = $1, 
                hobby = $2, instagram = $3, facebook = $4, 
                twitter = $5, youtube = $6, website = $7, 
                country = $8, last_edit = NOW() WHERE uid = $9 RETURNING id`;
                let dbEditBio = await db.query(sql,[data.about_me, data.hobby, 
                  data.instagram, data.facebook, data.twitter, data.youtube, 
                  data.website, data.country, data.uid
                ])
        
                let result =  dbEditBio.rows[0];
                io.to(socketId).emit('bio_update', result);
        
              }catch(err){
                console.log(err);
              }
        })

        socket.on('profile_get', async function(data){
            try{  
                
    
                let targetUsername = data;

                let profileId = `SELECT id FROM users WHERE username = $1 LIMIT 1`;
                let dbProfileId = await db.query(profileId,[targetUsername]);
                let targetId = dbProfileId.rows[0].id;

                let myprofile = false;
                let sqlUserData;
                //check if id == uid   
                if(targetId == uid){
                    //our profile
                    myprofile = true;
                    sqlUserData = `SELECT id, name, username, photo, email, email_verified FROM users WHERE id = $1 LIMIT 1`;
                }else{
                    //other profile
                    myprofile = false;
                    sqlUserData = `SELECT id, name, username, photo FROM users WHERE id = $1 LIMIT 1`;
                }
                
                
                let sqlPosting = `select id, uid, text, image, youtube, date_created, is_exist FROM posting WHERE uid = $1 AND is_exist = '1'`;
                let dbPosting = await db.query(sqlPosting,[targetId]);
                let resultPosting = dbPosting.rows;
                for(let i = 0;  i < resultPosting.length; i++){

                    //get comment
                    let sqlComment =  `SELECT u.name, u.id, u.username, u.photo, c.id AS comment_id, c.uid, c.posting_id, c.text, c.date_created, c.is_exist FROM posting_comment c, users u WHERE  u.id = c.uid AND c.posting_id = $1`;
                    let dbComment = await db.query(sqlComment,[resultPosting[i].id]);
                    let resultComment = dbComment.rows;
                    resultPosting[i].comment = resultComment;
                    resultPosting[i].commentCount = resultComment.length;
          
                    //if i comment
                    let sqlIfComment = `SELECT COUNT(id) FROM posting_comment WHERE posting_id = $1 AND uid = $2`;
                    let dbIfComment = await db.query(sqlIfComment,[resultPosting[i].id, uid]);
                    let checkIfComment = dbIfComment.rows[0].count;
                    let ifComment = false;
                    if(checkIfComment > 0){
                      ifComment = true;
                    }
          
                    resultPosting[i].ifComment = ifComment;
          
                    //get like
                    let sqlLike = `SELECT COUNT(id) AS p_like FROM posting_like WHERE posting_id = $1`;
                    let dbLike = await db.query(sqlLike,[resultPosting[i].id]);
                    let resultLike = dbLike.rows[0].p_like;
          
                    resultPosting[i].likeCount = resultLike;
          
                    //if i like
                    let sqlIfLike = `SELECT COUNT(posting_id) FROM posting_like  WHERE posting_id = $1 AND uid = $2`;
                    let dbIfLike = await db.query(sqlIfLike,[resultPosting[i].id, uid]);
                    
                    let checkIfLike = dbIfLike.rows[0].count;
                    
                    let ifLike = false;
                    if(checkIfLike > 0){  
                      ifLike = true;
                    }
          
                    resultPosting[i].ifLike = ifLike;
          
                  }




                let sqlFollower = `SELECT f.subject, f.object, u.id, u.name, u.username, u.photo FROM follow f, users u WHERE f.object = $1 AND f.subject = u.id`;
                let sqlFollowing = `SELECT f.subject, f.object, u.id, u.name, u.username, u.photo FROM follow f, users u WHERE f.subject = $1 AND f.object = u.id`;

                let sqlUserInfo = `SELECT id, uid, about_me, hobby, instagram, facebook, twitter, youtube, website, country, last_edit FROM users_info WHERE uid = $1 LIMIT 1`;

               
                
                let dbUserData = await db.query(sqlUserData,[targetId]);
                let dbFollower = await db.query(sqlFollower,[targetId]);
                let dbFollowing = await db.query(sqlFollowing,[targetId]);
                let dbUserInfo = await db.query(sqlUserInfo,[targetId]);


        
                let result = {
                  user : dbUserData.rows[0],
                  post : resultPosting,
                  follower : dbFollower.rows,
                  following : dbFollowing.rows,
                  info : dbUserInfo.rows[0],
                }
                
                io.to(socketId).emit('profile_get', result);
        
              }catch(err){
                console.log(err);
              }
        })

        
        socket.on('transaction_load', async function(data){
            
        });
        socket.on('support_create', async function(data){
            
        });

        socket.on('broadcast_create', async function(data){
            try {

            if(!needLogin(uid)){                
                io.to(socketId).emit('need_login', true);
                return 0 
            }

            let sender = cleanInput(data.sender);
            let message = cleanInput(data.message);
            //check if enough gems
            let dbCheckGems = await db.query(`SELECT gems FROM users WHERE id =  $1`, [uid])
            let gemsRemaining = dbCheckGems.rows[0].gems;

            let dbCheckPrice = await db.query(`SELECT gems_price FROM broadcast_price LIMIT 1`);
            let gems_price = dbCheckPrice.rows[0].gems_price;

            if(gemsRemaining >= gems_price){
                
                //reduce gems from user
                let gemsAfterBuy = gemsRemaining - gems_price;
                let dbUpdateGems = await db.query(`UPDATE users SET gems = $1 WHERE id = $2`,[gemsAfterBuy, uid]);

                //insert broadcast transaction
                let dbBuyBanner = 
                await db.query(
                `
                INSERT INTO broadcast_transaction
                (uid, date_created, sender, message, gems_before, gems_after, gems_price)
                VALUES
                ($1,NOW(),$2,$3,$4,$5,$6)
                `,
                [uid, data.sender,message,gemsRemaining,gemsAfterBuy,gems_price]
                );
                
                //get all user id
                let dbGetUID = await db.query(`SELECT id FROM users ORDER BY id ASC`);
                let allID = dbGetUID.rows;
                

                //create 
                let type = 'ads';

                for(let i = 0; i < allID.length; i++){
                    
                    let dbCreateInbox = await db.query(`INSERT into inbox_list(uid, body, read_status, date_created, sender, type) VALUES ($1, $2, 0, NOW(), $3, $4)`,[
                        allID[i].id, message, sender,type
                    ])
                }
                
                io.to(socketId).emit('broadcast_create', 'success');

            }
            } catch (error) {
                console.log(error)
            }
            
        });

        socket.on('banner_buy', async function(data){

            if(!needLogin(uid)){                
                io.to(socketId).emit('need_login', true);
                return 0 
            }
            
            
            let image = await uploadImage2(data.image,'banner');

            //start date
            let dbStartDate = await db.query(`
            SELECT end_date FROM banner_transaction  WHERE location = $1 ORDER BY end_date DESC LIMIT 1
            `,[location]) 

            //end date
            let dbEndDate = await db.query(`SELECT ${start_date}
            + interval ${duration} day 
            `,[location]) 

            //data -    get location , duration list price
            //location
            let dbLocation = await db.query(
            `SELECT id, location, gems_price FROM banner_location_list_price WHERE id = $1 LIMIT 1`,[location_id]);
            let gems_location = parseInt(dbLocation.rows[0].gems_price);
            //duration
            let dbDuration = await db.query(
            `SELECT id, days, gems_price FROM banner_duration_list_price WHERE id = $1 LIMIT 1`,[duration_id])
            let gems_duration = parseInt(dbLocation.rows[0].gems_price);

            //get location duration total
            let gems_total = gems_location_price + gems_location_duration;


            //check if enough gems
            let dbCheckGems = await db.query(`SELECT gems FROM users WHERE id =  $1`, [uid])
            let gemsRemaining = dbCheckGems.rows[0].gems;

            if(gemsRemaining >= gems_total){

                //reduce gems from user
                let gemsAfterBuy = gemsRemaining - gems_total;
                let dbUpdateGems = await db.query(`UPDATE users SET gems = $1 WHERE id = $2`,[gemsAfterBuy, uid]);

                //insert banner data to db
                let dbBuyBanner = 
                await db.query(
                `
                INSERT INTO banner_transaction 
                (start_date, end_date, location, duration, image, text, 
                link, uid, gems_location, gems_duration, gems_total)
                VALUES ($1, $2, $3, $4, %5, $6, $7, $8, $9, $10, $11)`,
                [start_date, end_date, location, duration, image, text, link,
                    uid, gems_location, gems_duration, gems_total
                ]
                );
            }

            

            

            
        });

        socket.on('banner_edit', async function(data){
            let dbBuyBanner = 
            await db.query(
            `UPDATE banner_transaction 
            SET
            image = ${newimg}, 
            text = ${newtext}, 
            link = ${newlink}
            WHERE id = $1
            `,[banner_id])
            ; 

            
        });

        socket.on('banner_check', async function(data){
            try{
                
                console.log('banner check')
                let maxlocation = 3;
                let result = {};

                 //banner price
                let dbGetDurationPrice = await db.query(`SELECT id, days, gems_price FROM banner_duration_list_price ORDER BY id ASC`);
                let durationPrice = dbGetDurationPrice.rows;
                let dbGetLocationPrice = await db.query(`SELECT id, location, gems_price FROM banner_location_list_price ORDER BY id ASC`);
                let locationPrice = dbGetLocationPrice.rows;

                result.durationPrice = durationPrice;
                result.locationPrice = locationPrice


                //looping 3 location
                for(let i = 1 ; i <= maxlocation; i++){
                    result[i] = {};

                    //current banner check
                    let dbCheck = `
                    SELECT start_date, end_date, location, 
                    duration, image, text, link, uid, NOW() AS now_date 
                    FROM banner_transaction 
                    WHERE NOW() > start_date AND NOW() < end_date AND location = $1 LIMIT 1`;

                    let dbLoad = await db.query(dbCheck,[i]);
                    
                    let banner = dbLoad.rows[0];
                    
                    result[i]['exist'] = `0`;
                    let start_date = 'NOW()';
                    result[i]['next_start'] = 'NOW()';
                    if(banner){
                        Object.assign(result[i], banner);
                        
                        result[i]['exist'] = `1`;
                    
                        let dbAvailable = await db.query(
                        `
                        SELECT end_date FROM banner_transaction  WHERE location = $1 ORDER BY end_date DESC LIMIT 1
                        `, [i]) 
                        let start = dbAvailable.rows[0];
                        result[i]['next_start'] = start;
                        
                    }
                    start_date = result[i]['next_start'];
                    //check 30, 90, 180, 360 end date or now
                    //+ interval '10' day;
                    
                    let dbEndCheck = await db.query (`
                    SELECT 
                    ${start_date} + interval '30' day AS end_30,
                    ${start_date} + interval '90' day AS end_90,
                    ${start_date} + interval '180' day AS end_180,
                    ${start_date} + interval '360' day AS end_360
                    `)

                    let endCheck = dbEndCheck.rows[0];
                    Object.assign(result[i], endCheck);
                    
                    }
                    socket.emit('banner_check', result);
            }
            catch(err){
                console.log(err);
            }
            

        })
       
        

        // fetch news
        // fetch('http://api.mediastack.com/v1/news?access_key=0c261ee5595f1aaaf163cc5d4b3a8906&sources=cnn&date=2020-05-12')
        // .then(res => res.text())
        // .then(body => console.log(JSON.parse(body)));

        const request = require('request');
        // let randomWord = ['game','tech','school','film','soccer','nba','reddit','tiktok','tweet','car','instagram'];
        let randomWord = ['soccer','nba','elon musk'];
        
        let wordPick = randomWord[Math.floor(Math.random() * randomWord.length)];
        
        const options = {
        method: 'GET',
        url: 'https://free-news.p.rapidapi.com/v1/search',
        qs: {q: wordPick, lang: 'en'},
        headers: {
            'x-rapidapi-key': '425b19cff4msheeb436704a3b757p15ffa2jsnaa91728f0b7b',
            'x-rapidapi-host': 'free-news.p.rapidapi.com',
            useQueryString: true
        }
        };

        function getNews(){
            request(options, async function (error, response, body) {
                if (error) throw new Error(error);
                
                let jsonresult = await JSON.parse(body);
                let result = jsonresult["articles"];
                let result2 = [];
                if(!result){
                    getNews();
                    return 0;
                }
                for(let i = 0; i < result.length; i++){
                    // media
                    // link
                    // title
                    let single = {
                        img : result[i].media,
                        title : result[i].title,
                        link : result[i].link
                    }
                    
                    // {
                    //     img: 'https://www.investopedia.com/thmb/ZQbXl0gSnIndS-hDxBT0XvMyFiA=/380x254/filters:fill(auto,1)/virtual_goods-5bfc2b8a46e0fb00517bdfe5.jpg',
                    //     title: 'Viral Marketing Defdinition',
                    //     link: 'https://www.investopedia.com/terms/v/viral-marketing.asp'
                    //   }
                    result2.push(single);
                }
                
                socket.emit('get_news',result2);
            
            });
        }

        getNews();

        
        
    }); 

    
}