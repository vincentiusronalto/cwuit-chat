    let socket = io();
    let MY_NAME = document.getElementById('MY_NAME').value;
    let MY_USERNAME = document.getElementById('MY_USERNAME').value;
    let MY_ID = document.getElementById('MY_ID').value;
    let MY_PHOTO = document.getElementById('MY_PHOTO').value;
    let MY_GEN = document.getElementById('MY_GEN').value;
    let MY_BIO = document.getElementById('MY_BIO').value;
    let MY_WEB = document.getElementById('MY_WEB').value;
    let MY_IG = document.getElementById('MY_IG').value;
    let MY_FB = document.getElementById('MY_FB').value;
    let MY_TW = document.getElementById('MY_TW').value;
    let MY_CTY = document.getElementById('MY_CTY').value;

    let MY_DATE = document.getElementById('MY_DATE').value;

    
    function initProfile(){

    }

    function G_dateFormat(dateInput){
        //format 1
        //2020-01-21 03:44:21
        //year-month-date hours:minute:second
        // let dInputObj = new Date();
      
        //format2 
        //July 4, 2020
        let isoDate = new Date(dateInput).toISOString();
        let dInputObj = new Date(isoDate);
        let months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
        let year = ""+dInputObj.getFullYear();
        // let month = ""+(dInputObj.getMonth() + 1);
        let month = months[dInputObj.getMonth()]
        let monthN = dInputObj.getMonth() + 1;
        let date = ""+dInputObj.getDate();
        let hour = ""+dInputObj.getHours();
        let minute = ""+dInputObj.getMinutes();
        let sec = ""+dInputObj.getSeconds();
    
        let format = `${month}, ${date} ${year}`
        return format;
    }

    function showContentFirst(link){
        if(!link){
            link = 'chat'
        }
        history.pushState({page:link},link, origin+`/${link}`);
        // document.querySelector(`.single_nav[data-link="${link}"]`).classList.add('single_nav_active');
        document.querySelector(`.single_content[data-link="${link}"]`).classList.remove('hide');
    }

    function showContentClick(link){
        history.pushState({page:link},link, origin+`/${link}`);
        let nav = document.querySelectorAll(`.single_nav`);
        let content = document.querySelectorAll(`.single_content`);
        for(let i = 0; i < nav.length; i++){
            nav[i].classList.remove('single_nav_active')
        }

        for(let i = 0; i < content.length; i++){    
            content[i].classList.add('hide')
        }
        // document.querySelector(`.single_nav[data-link="${link}"]`).classList.add('single_nav_active');
        document.querySelector(`.single_content[data-link="${link}"]`).classList.remove('hide');
    }
    //init
    var pathArray = window.location.pathname.split('/');
    var linkName = pathArray[1];
    showContentFirst(linkName)

    document.addEventListener('click', function(e){
        if(e.target.closest('#sign_btn')){
            console.log('sign in')
        }

        else if(e.target.closest('.single_nav')){
            let link = e.target.getAttribute('data-link');
            
            showContentClick(link)
        }

        else if(e.target.closest('.chat_selector_single')){
            /*
            data-type //topic or private
            data-id

             */ 

            let dataType = e.target.closest('.chat_selector_single').getAttribute('data-type');
            let dataId = e.target.closest('.chat_selector_single').getAttribute('data-id');
            let cl = document.getElementsByClassName('chat_selector_single');
            for(let i = 0; i < cl.length ; i++){
                cl[i].classList.remove('chat_selector_single_active')
            }
            document.querySelector(`.chat_selector_single[data-id="${dataId}"]`).classList.add('chat_selector_single_active');
            document.getElementById('chat_room_output').innerHTML = `<img src="/test/loading.gif" alt="chat" id="illustration_loading"></img>`
            
            
            let data = {type:dataType,id:dataId};
            document.getElementById('chat_room_input').classList.remove('hide')
            socket.emit('chat_load',data)
        }

        else if(e.target.closest('#chat_room_input')){
            // chat_room_input_box
            // window.location.href = "/login";

            // window.location('/login')
        }
        else if(e.target.closest('mention')){
            
        }

        else if(e.target.closest('#left_icon_display')){
            document.getElementById('chat_topic').classList.toggle('hide')
        }
        else if(e.target.closest('#right_icon_display')){   
            document.getElementById('profile_right_wrapper').classList.toggle('hide')
        }
    });


    socket.emit('user_load');
    socket.on('user_load',function(data){
        //console.log(data)
        /*
        {
        "topic": [
                {
                    "id": 1,
                    "name": "All",
                    "image": "profile_all.png",
                    "lastchat": {
                        "name": "vrozen",
                        "text": "sender:1, topic: 1"
                    }
                }
            ],
        "private": [
                {
                    "id": "2",
                    "name": "user2",
                    "username": "user2",
                    "photo": "profile_test.png",
                    "info_gender": "male",
                    "identity": "1_2",
                    "lastchat": {
                        "name": "vrozen",
                        "text": "hi 2 from 1"
                    }
                }
            ]
        }
        */

        let topicWrapper = document.getElementById('chat_topic_wrapper');
        let privateWrapper = document.getElementById('chat_private_wrapper');
        // chat_selector_single_active
        //topic
        let topicbuild = ``;
        for(let i = 0; i < data.topic.length;  i++){
            topicbuild += 
            `
            <div class="chat_selector_single" data-type="topic" data-id="${data.topic[i].id}">
                <img src="/upload/topic_pic/${data.topic[i].image}" class="profile_pic_small">
                <div class="chat_selector_content">
                    <div>${data.topic[i].name}</div>
                    <div class="chat_selector_history_chat">${data.topic[i].lastchat.name} : ${data.topic[i].lastchat.text}</div>
                </div>
            </div>
            `
        }

        let privatebuild = ``;
        //private
        for(let i = 0; i < data.private.length; i++){
        
            privatebuild +=
            `
            <div class="chat_selector_single" data-type="private" data-id="${data.private[i].identity}">
                <img src="/upload/user/${data.private[i].photo}" class="profile_pic_small">
                <div class="chat_selector_content">
                    <div><span class="material-icons icon-${data.private[i].info_gender}">${data.private[i].info_gender}</span>${data.private[i].name}</div>
                    <div class="chat_selector_history_chat">${data.private[i].lastchat.name} : ${data.private[i].lastchat.text}</div>
                </div>
            </div>
            `
            
        }

        topicWrapper.innerHTML = topicbuild;
        privateWrapper.innerHTML = privatebuild;
    })

    socket.on('chat_load', function(data){
        //console.log(data)
        /*

                {
            "chat": [
                {
                    "id": "1",
                    "sender_id": "1",
                    "receiver_id": "2",
                    "identity": "1_2",
                    "date_created": "2021-05-27T10:40:10.228Z",
                    "read_status": 0,
                    "image": null,
                    "text": "hi 2 from 1",
                    "name": "vrozen",
                    "username": "vrozen",
                    "photo": "profile_test.png"
                }
            ],
            "profile": {
                "id": "2",
                "name": "user2",
                "username": "user2",
                "photo": "profile_test.png",
                "date_created": "2021-05-26T18:48:36.268Z",
                "info_instagram": null,
                "info_twitter": null,
                "info_bio": null,
                "info_website": null,
                "info_country": null,
                "info_facebook": null

                topic_name: "All" //if topic
            }
        }

        <div id="info_which_chat">
            <mention>@Natalia</mention>
        </div>


        chat_room_output

        <div class="chat_selector_single">
            <img src="/test/profile_test.png" class="profile_pic_small">
            <div class="chat_selector_content">
                <div><span class="material-icons icon-female">female</span>Roxy</div>
                <div class="chat_selector_history_chat">lol lolol</div>
            </div>
        </div>
        */

        let info = ''
        if(data.profile.type == 'private'){
            info = `<span>@${data.profile.username}</span>`
        }else{
            info = `<span>${data.profile.topic_name}</span>`   
        }

        let chatbuild = '';
        for(let i = 0; i < data.chat.length; i++){
            
            let imageBuild = '';
            if(data.chat[i].image){
                let imageMaker = data.chat[i].image.split('_');
            
            let imageFolder = '';
            if(data.profile.type == 'private'){
                imageFolder = 'private_chat';
            }else{
                imageFolder = 'topic_chat';
            }
            if(imageMaker.length > 0){
                for(let j=0; j < imageMaker.length ; j++){
                    imageBuild += `<img src="/upload/${imageFolder}/${imageMaker[j]}" class="chat_image_inside" alt="image">`
                }
            }

            }
            
            chatbuild += 
            `<div class="chat_content_single">
                <img src="/upload/user/${data.chat[i].photo}" class="profile_pic_small">
                <div class="chat_content_content">
                    <div>${data.chat[i].name}</div>
                    <div class="chat_selector_history_chat">${data.chat[i].text}</div>
                    <div>${imageBuild}</div>
                </div>
                <div class="chat_date_data"><div>${moment(data.chat[i].date_created).fromNow()}</div></div> 
            </div>`
        }
        document.getElementById('info_which_chat').innerHTML = info;
        // console.log(data);
        document.getElementById('chat_room_output').innerHTML = chatbuild;
        let output = document.getElementById('chat_room_output');

            output.style.opacity = "0";
        
            setTimeout(function(){
                output.scrollTop = output.scrollHeight;
                output.style.opacity = "1";
            },'300')
    });


    // SENDING CHAT
    function checkImageExist(imgArr, imgPush){
        if(imgArr.length == 0 ){
            return false;
        }    
        for(let i = 0; i < imgArr.length; i++){
            if(imgArr[i].name == imgPush.name){
                return true;
            }
        }
        return false;
    }
    
    function checkBase64(base64Arr, fileName){
        
        for(let i = 0; i < base64Arr.length; i++){
            
            
            if(fileName == base64Arr[i][0]){
                
                return true;
            }
        }
        
        return false
    }
    
    function getDeleteIndex(deleteName, base64Arr){
        for(let i = 0; i < base64Arr.length; i++ ){
            if(base64Arr[i][0] == deleteName){
                return i;
            }
        }
    }
    
    function checkImgL(){   
        //check image counter
        let imgL = document.getElementsByClassName('posting_preview_image_single_wrapper').length;
        let countImg = document.getElementById('posting_images_counter_number');
        countImg.innerHTML = imgL;
    }
    let imageArr = [];
    let base64Arr = [];
    let image = {};
    let imageChild = '';
    
    document.addEventListener('change', function(event){
        if(event.target.closest('#chat_hidden_input_file')){
            let preview = document.getElementById('chat_preview_images'); //hidden div to preview image
            let FilesValue = document.getElementById('chat_hidden_input_file'); //id input file   
            let fileList = document.getElementById("chat_hidden_input_file").files;
    
            let fileLength = fileList.length; 
            
            for(let i = 0; i < fileLength; i++){
                
                if(imageArr.length == 0 ){
                    imageArr.push(fileList[i]);
                }
                else if (checkImageExist(imageArr, fileList[i]) == false){
                    
                    imageArr.push(fileList[i]);
                
                }
                
            }
            FilesValue.value = null;
            
            
            let counter = 0;
            for(let i = 0; i < imageArr.length; i++){
            
            var FR = new FileReader();
            FR.addEventListener("load", function(e) {
                counter++;
                
                if(base64Arr.length == 0 ){
                    base64Arr.push([imageArr[i].name, e.target.result]);
                }
                else if(checkBase64(base64Arr, imageArr[i].name) == false ){
                    base64Arr.push([imageArr[i].name, e.target.result]);
                }
                
                if(counter == imageArr.length){
                    counter = 0;
                    imageChild = '';
                    for( let p = 0; p < base64Arr.length; p++){
                        image.title = base64Arr[p][0];
                        image.src = base64Arr[p][1];
                        image.class = 'chat_preview_image_single';
                        imageChild += '<div class="chat_preview_image_single_wrapper" data-src="'+image.src+'" data-title="'+image.title+'"><img  alt="'+image.title+'" title="'+image.title+'" src="'+image.src+'" class="'+image.class+'">';
                        imageChild += '<i class="material-icons chat_preview_close_image" data-title="'+image.title+'">close</i></div>';
                        preview.innerHTML = imageChild;
                        imageArr = [];
                    }
                }
    
                // checkImgL();
            });       
            FR.readAsDataURL( imageArr[i] );
    
            }
        }
    });
    
    function createChatSelf(data){
        // let chat_data = {text:final_text2,img:imgSend, topicId : chatActiveTopicId, type : chatActiveType,checkId : getUniqueID()};
    
        let balloon = 'chat_room_balloon_gray';
        let cdata = 'chat_data_gray';
        let pic = '';
        if(data.img){
            let picArr = data.img;
            
            for(let j = 0; j < picArr.length; j++){
                pic += `<img src="${picArr[j]}" class="chat_image_inside" alt="chat_image">`;
            }
        }
    
        // let chat = 
        // `
        // <div class="chat_room_single" data-checkId="${data.checkId}" data-chatId="">
        //         <img src="/upload/user/${MY_PHOTO}" class="chat_room_pp" alt="chat_profile_picture">
        //         <div class="chat_room_single_content ${balloon}">
        //             <div class="chat_room_data ${cdata}">${MY_USERNAME}</div>
        //             <div class="">${data.text}</div>
        //             <div>${pic}</div> 
        //             <div class="chat_date_data"><div>Sending</div></div>
        //     </div>
        // </div>
        // `;

        let chat = 
        `<div class="chat_content_single" data-checkId="${data.checkId}">
            <img src="/upload/user/${MY_PHOTO}" class="profile_pic_small">
            <div class="chat_content_content">
                <div>${MY_NAME}</div>
                <div class="chat_selector_history_chat">${data.text}</div>
                <div>${pic}</div>
            </div>
            <div class="chat_date_data"><div>Sending</div></div> 
        </div>`
    
        let output = document.getElementById('chat_room_output');
            output.innerHTML += chat;
            output.scrollTop = output.scrollHeight;
            //scroll if my chat
            // setTimeout(function(){
            //     output.scrollTop = output.scrollHeight;
            // }, 100);
    }
    function getUniqueID(){
        let uid = (Date.now() + ( (Math.random()*100000).toFixed()))
        return uid;
    }
    function sendChat(){
        //SENDING CHAT
        let final_text = document.getElementById('chat_room_input_box').innerHTML.trim();   
        let regex = /^\s*(?:<br\s*\/?\s*>)+|(?:<br\s*\/?\s*>)+\s*$/gi;
        let final_text2 = final_text.replace(regex, '');
        final_text2 = final_text2.replace(/^(?:&nbsp;|\s)+|(?:&nbsp;|\s)+$/ig,'');
        //chat 
        
        //pic
        //get image
        let img = document.getElementsByClassName('chat_preview_image_single_wrapper');
        let srcArr = [];
        for(let i = 0; i < img.length; i++){
            srcArr.push(img[i].getAttribute('data-src'));
        }
        
        //get mention
        let imgSend = srcArr;
        let chatActive = document.querySelector('.chat_selector_single_active');
        //topicId 
        let topicId = chatActive.getAttribute('data-id')

        //type
        let type = chatActive.getAttribute('data-type')

        let chat_data = {text:final_text2,img:imgSend, topicId : topicId, type : type, checkId : getUniqueID()};
        
        if(final_text2 != '' || imgSend.length > 0){
            //empty all element
            document.getElementById('chat_room_input_box').innerHTML = '';
            document.getElementById('chat_preview_images').innerHTML = '';
            imageArr = [];
            base64Arr = [];
            image = {};
            imageChild = '';
    
            createChatSelf(chat_data);
            console.log(chat_data)
            socket.emit('chat_send',chat_data);
            // G_socket.emit("chat_send_finish",chat_data);
        }
        
    }

    socket.on('chat_send',function(data){

    /*
    cdate: "2021-05-07T15:46:54.684Z"
    chatid: "8"
    cpic: null
    ctext: "yoiiii"
    ctopicId: "1"
    ctype: "daily"
    uid: "3"
    uname: "vronalto"
    uphoto: "user.jpeg"
    username: "vronalto"
    */
    //myid
    // let chatActiveTopicId = '1';
    // let chatActiveType = 'topic';

    // let balloon;
    // let cdata;

    let chatActive = document.querySelector('.chat_selector_single_active');
    //topicId 
    let topicId = chatActive.getAttribute('data-id');
    //type
    let type = chatActive.getAttribute('data-type');

    if(topicId == data.ctopicId && type == data.ctype){
        if(data.uid == MY_ID){
            // balloon = 'chat_room_balloon_gray';
            // cdata = 'chat_data_gray';
            // chat is mine - check checkId and correct Sending
            // checkId : checkId,
            // chatid : returnId,
            // cdate : returnDate,

            let checkChatId = document.querySelector(`.chat_content_single[data-checkId="${data.checkId}"]`);
            checkChatId.setAttribute("data-chatId",data.chatid);

            let checkChatDate = document.querySelector(`.chat_content_single[data-checkId="${data.checkId}"] .chat_date_data`);
            checkChatDate.innerHTML = `<div>${moment(data.cdate).fromNow()}</div>`;
        }

        else
        {
        // balloon = 'chat_room_balloon_blue';
        // cdata = 'chat_data_blue';
            
        
        let pic = '';
        
        if(data.cpic){

            let folder = '';
            //check image folder
            if(data.ctype == 'topic'){
                folder = 'topic_chat';
            }else if(data.ctype == 'private'){
                folder = 'private_chat';
            }

            let picArr;
            picArr = data.cpic.split("_");
            for(let j = 0; j < picArr.length; j++){
                pic += `
                <img src="/upload/${folder}/${picArr[j]}" class="chat_image_inside" alt="image">
                `
            }
            
        }
        // let dates = G_dateFormat(data.cdate);
        let dates = moment(data.cdate).fromNow();
        
        // let chat = 
        // `
        // <div class="chat_room_single" data-chatId="${data.chatid}">
        //     <img src="/upload/user/${data.uphoto}" class="chat_room_pp" alt="chat_profile_picture">
        //     <div class="chat_room_single_content ${balloon}">
        //         <div class="chat_room_data ${cdata}">${data.uname}</div>
        //         <div class="">${data.ctext}</div>
        //         <div>${pic}</div> 
        //         <div class="chat_date_data"><div>${dates}</div></div>
        //     </div>
        // </div>        
        // `;

        let chat =
        `<div class="chat_content_single" data-chatId="${data.chatid}">
            <img src="/upload/user/${data.uphoto}" class="profile_pic_small">
            <div class="chat_content_content">
                <div>${data.uname}</div>
                <div class="chat_selector_history_chat">${data.ctext}</div>
                <div>${pic}</div>
            </div>
            <div class="chat_date_data"><div>${dates}</div></div> 
        </div>`;


        
        let output = document.getElementById('chat_room_output');
        output.innerHTML += chat;
        
        }
        
    }

    });

    document.addEventListener('click',function(event){
        if(event.target.closest('#chat_room_send_btn')){
            // console.log('sign in')
            sendChat();

        }
        else if (event.target.closest('.chat_preview_close_image')) {
            let deleteTitle = event.target.getAttribute("data-title");
            
            document.querySelector(`.chat_preview_image_single_wrapper[data-title="${deleteTitle}"]`).remove();
    
            let deleteIndexFinal = getDeleteIndex(deleteTitle, base64Arr);
            base64Arr.splice(deleteIndexFinal, 1);
        }
    })

        


    
