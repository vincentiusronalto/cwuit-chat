require('dotenv').config();
const socketio = require('socket.io');
const sharedsession = require("express-socket.io-session");
const sio_redis = require('socket.io-redis');
const db = require('../db/db');
const func = require('controller.js')
const logger = require('../lib/logger.js');

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
        
        if(socket.handshake.session.uid){
            MYID = socket.handshake.session.uid;    
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
            // io.emit('user_online', MYID)
            io.emit('user_just_online', MYID);
            
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
            try{
                let result = await func.user_load(MY_ID);
                io.to(socketId).emit('user_load', result);
            }catch(err){
                logger.error(err.stack);
            }
        });


        // CHAT

        socket.on('chat_load', async function(data){
            try{
                let result = await func.chat_load(data,MY_ID);
                io.to(socketId).emit('chat_load', result);
            }catch(err){
                logger.error(err.stack);
            }
            
        });
        
        
        socket.on('chat_send', async function(data){
            try{
                let result = await func.chat_send(data,MY_ID);
                io.emit('chat_send', senderData);
            }catch(err){
                logger.error(err.stack);
            }
        });

     

        socket.on('profile_update', async function(data){
            try{
                
                let result = await func.profile_update(data,MY_ID)
                io.to(socketId).emit('profile_update', result);

            }catch(err){
                logger.error(err.stack);
            }
        });

    }); 

    
}
