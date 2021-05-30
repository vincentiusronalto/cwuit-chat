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

    let MY_PROFILE = 
    {
        name     : MY_NAME,
        uname    : MY_USERNAME,
        uid      : MY_ID, 
        photo    : MY_PHOTO,
        gender   : MY_GEN,
        bio      : MY_BIO,
        web      : MY_WEB,
        ig       : MY_IG,
        fb       : MY_FB,
        tw       : MY_TW,
        cty      : MY_CTY,
        date     : MY_DATE,
        isme     : true
    }

    console.log(MY_PROFILE)

    function initProfile(data){
        

        //location build
        let loc = '';
        if(data.cty){
            loc = 
            `
            <div class="profile_single_wrapper">
                <div><img src="/icon/loc.png" alt="country" class="profile_icon_loc"></div> 
                <div>${data.cty}</div>
            </div>
            `;
        }
        //social media build
        

        let socmedI = '';

        if(data.web){
            socmedI +=`
            <a href="${data.web}" class="profile_single_wrapper">
                <div><img src="/icon/web.png" alt="website" class="profile_icon"></div> 
                </a> 
            </a>`
        }
        if(data.ig){
            socmedI +=`
            <a href="https://www.instagram.com/${data.ig}" class="profile_single_wrapper">
                <div><img src="/icon/ig.png" alt="instagram" class="profile_icon"></div> 
                </a> 
            </a>`
        }
        if(data.fb){
            socmedI +=`
            <a href="https://www.facebook.com/${data.fb}" class="profile_single_wrapper">
                <div><img src="/icon/fb.png" alt="facebook" class="profile_icon"></div> 
                </a> 
            </a>`
        }
        if(data.tw){
            socmedI +=`
            <a href="https://www.twitter.com/${data.tw}" class="profile_single_wrapper">
                <div><img src="/icon/tw.png" alt="twitter" class="profile_icon"></div> 
                </a> 
            </a>`
        }
    

        let soctotal = 
        `
        <div id="profile_social_media_wrapper">
            ${socmedI}
        </div>
        `;

        if(socmedI == ''){
            soctotal = '';
        }
        console.log(data.date);
        //Join : ${G_dateFormat(data.date)}
        let biomaker = '';
        if(!data.bio){
            biomaker = `Hi I'm new here`;
        }else{
            biomaker = data.bio;
        }


        let EditBtn = '';
        //check if me
        if(data.isme && data.uid != '0')
        {
            EditBtn = `<div id="edit_profile_btn">Edit Profile</div> <a  id="logout_btn" href="/logout">Sign Out</a>`;
        }else if(data.isme && data.uid == '0' ){
            EditBtn = `<a  id="signin_btn" href="/login">Sign In</a>`;
        }
        let genderMake = '';
        if(data.gender){
            genderMake = `<span class="material-icons icon-${data.gender}">${data.gender}</span>`
        }
        let profile = `
        
                    <img src="/upload/user/${data.photo}" class="profile_pic_big">
                    <div>${genderMake}${data.name}</div>
                    <mention>@${data.uname}</mention>
                    
                    <div id="profile_bio_wrapper">"${biomaker}"</div>
                    <div>
                        Join : ${G_dateFormat(data.date)}
                    </div>

                    ${loc}
                    
                   
                    ${soctotal}

                    ${EditBtn}

        
        `

        let header = `${data.name}'s profile`;
        
        document.getElementById('profile_header').innerHTML = header;
        document.getElementById('profile_right_inside').innerHTML = profile;
    }

    initProfile(MY_PROFILE)

    

    //edit profile
    document.addEventListener('click',function(e){
        if(e.target.closest('#profile_photo_small_right')){
            initProfile(MY_PROFILE)
        }
        else if(e.target.closest('#edit_profile_btn')){
            if(!document.getElementById('edit_profile_wrapper')){

        
        //hide input chat
        document.getElementById('chat_room_input').classList.add('hide');

        //select gender init
        let gender_male = '';
        let gender_female = '';
        let gender_secret = '';
        if(MY_PROFILE.gender == 'male'){
            gender_male = 'gender_select_active';
        }
        else if(MY_PROFILE.gender == 'female'){
            gender_female = 'gender_select_active';
        }
        else{
            gender_secret = 'gender_select_active';
        }
        
        //show profile edit page
        let editProfilePage = 
        `
        <div id="edit_profile_wrapper">
            <div id="profile_success" class="hide">Successfully Updated Profile, Reloading the page...</div>
            <div id="profile_failed" class="hide">Sorry, Error on Updating Profile</div>
            <div><img src="/upload/user/${MY_PROFILE.photo}" class="profile_pic_big" id="edit_profile_pp"></div>
            <label id="change_profile_picture_btn" for="change_profile_pic_hidden">
                <input type="file" accept="image/png, image/jpeg" id="change_profile_pic_hidden">
                <span class="material-icons">photo_camera</span>
                <div>Change Profile Picture</div>
            </label> 
            <div id="cancel_profile_pic">

            </div>

            <div id="gender_select" class="mbt10">
                <div class="gender_select_single ${gender_secret}" data-gender="">
                    Secret
                </div>
                <div class="gender_select_single ${gender_male}" data-gender="male">
                    Male
                </div>
                <div class="gender_select_single ${gender_female}" data-gender="female">
                    Female
                </div>
            </div>

            <div>
                <div>
                <input type="text" value="${MY_PROFILE.name}" placeholder="Name" class="mbt10" id="change_profile_data_name">
                </div>
                <div>
                <input type="text" value="${MY_PROFILE.bio}" placeholder="About Me" class="mbt10" id="change_profile_data_bio">
                </div>
                
            </div>

            
            <div>
                <input type="text" value="${MY_PROFILE.cty}" placeholder="Country" class="mbt10" id="change_profile_data_country">
            </div>
            <div>
                <input type="text" value="${MY_PROFILE.web}" placeholder="Website" class="mbt10" id="change_profile_data_website">
            </div>
            
            <div>
                
                <div>
                    <input type="text" value="${MY_PROFILE.ig}" placeholder="Instagram Username" class="mbt10"  id="change_profile_data_instagram">
                </div>
                <div>
                    <input type="text" value="${MY_PROFILE.fb}" placeholder="Facebook Username" class="mbt10" id="change_profile_data_facebook">
                </div>
                <div>
                    <input type="text" value="${MY_PROFILE.tw}" placeholder="Twitter Username" class="mbt10" id="change_profile_data_twitter">
                </div>
                
                

            </div>

            <div id="submit_change_profile">Submit Change</div> 
        </div>
        `
        document.getElementById('info_which_chat').innerHTML = 'Edit Profile';
        document.getElementById('chat_room_output').innerHTML = editProfilePage;
        console.log(document.getElementById('change_profile_pic_hidden').value)
        }
        }
        //change gender
        else if(e.target.closest('.gender_select_single')){
            let genderS = document.getElementsByClassName('gender_select_single');
            for(let i = 0; i < genderS.length; i++){
                genderS[i].classList.remove('gender_select_active');
            }
            e.target.classList.add('gender_select_active');
        }

        //submit
        else if(e.target.closest('#submit_change_profile')){
            //get photo data
            let photo = document.getElementById('change_profile_pic_hidden').value;
            let photoF = '';
            if(photo){
                photoF = document.getElementById("edit_profile_pp").getAttribute("src")
            }
            console.log(photoF)

            //get gender
            let activeGender = document.querySelector('.gender_select_active');
            let gender = activeGender.getAttribute('data-gender');

            //get other data
            let name = document.getElementById('change_profile_data_name').value.trim();
            let bio = document.getElementById('change_profile_data_bio').value.trim();
            let country = document.getElementById('change_profile_data_country').value.trim();
            let website = document.getElementById('change_profile_data_website').value.trim();
            let instagram = document.getElementById('change_profile_data_instagram').value.trim();
            let facebook = document.getElementById('change_profile_data_facebook').value.trim();
            let twitter = document.getElementById('change_profile_data_twitter').value.trim();

            let sendData = {
                photo : photoF,
                gender,
                name,
                bio,
                country,
                website,
                instagram,
                facebook,
                twitter
            }
            console.log(sendData);
            socket.emit('profile_update', sendData);
        
     }
    });

    socket.on('profile_update', function(data){
        let page = document.getElementById('chat_room_output');
            page.scrollTop = '0';
        if(data){
            //success
            document.getElementById('profile_success').classList.remove('hide')
            setTimeout(function(){location.reload();},'1500')
        }else{
            //failed
            document.getElementById('profile_failed').classList.remove('hide')

        }
    })


    //EDIT PROFILE PHOTO
    function getPic(iHidden) {
        const file = document.querySelector(iHidden).files[0];
        var reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
        document.getElementById("edit_profile_pp").setAttribute("src", reader.result)
        };

        document.getElementById('cancel_profile_pic').innerHTML = '<div id="cancel_change_pp">Cancel Change Photo</div>'
        console.log(document.getElementById('change_profile_pic_hidden').value)
        
   }    

   document.addEventListener('click', function(event){
        if(event.target.closest('#cancel_change_pp')){
            
            document.getElementById("edit_profile_pp").setAttribute("src", `/upload/user/${MY_PROFILE.photo}`);
            document.getElementById("change_profile_pic_hidden").value = "";
            console.log(document.getElementById('change_profile_pic_hidden').value)
        }
   })

   document.addEventListener('change', function(event){
        if(event.target.closest('#change_profile_pic_hidden')){
            getPic('#change_profile_pic_hidden');
        }
   });
   


    function G_dateFormat(dateInput){
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
            document.getElementById('profile_right_inside').innerHTML = `<img src="/test/loading.gif" alt="chat" id="illustration_loading"></img>`
            
            
            let data = {type:dataType,id:dataId};
            if(MY_ID == '0'){
                document.getElementById('chat_room_input').innerHTML = '<a href="/login">Please Login to start chatting</a>'
            }
            
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
            if(document.body.clientWidth <= '700'){
                console.log('tt')
                document.getElementById('responsive_black_modal').classList.toggle('hide');
                document.getElementById('chat_topic').classList.toggle('show');
            }
        }
        else if(e.target.closest('#right_icon_display')){   

            
            document.getElementById('profile_right_wrapper').classList.toggle('hide')
            if(document.body.clientWidth <= '700'){
                console.log('tt')
                document.getElementById('responsive_black_modal').classList.toggle('hide');
                document.getElementById('profile_right_wrapper').classList.toggle('show');
            }

            //if
        }
        else if(e.target.closest('#responsive_black_modal')){
            document.getElementById('responsive_black_modal').classList.add('hide');
                document.getElementById('profile_right_wrapper').classList.remove('show');
                document.getElementById('chat_topic').classList.remove('show');
                
        }
    });



    socket.emit('user_load');
    socket.on('user_load',function(data){
        console.log(data)
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
            //gender check
            let genderBuild = '';
            if(data.private[i].info_gender){
                genderBuild = `<span class="material-icons icon-${data.private[i].info_gender}">${data.private[i].info_gender}</span>`;
            }
            privatebuild +=
            `
            <div class="chat_selector_single" data-type="private" data-id="${data.private[i].identity}">
                <img src="/upload/user/${data.private[i].photo}" class="profile_pic_small">
                <div class="chat_selector_content">
                    <div>${genderBuild}${data.private[i].name}</div>
                    <div class="chat_selector_history_chat">${data.private[i].lastchat.name} : ${data.private[i].lastchat.text}</div>
                </div>
            </div>
            `
            
        }

        topicWrapper.innerHTML = topicbuild;
        privateWrapper.innerHTML = privatebuild;
    })

    socket.on('chat_load', function(data){
        console.log(data)
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


        //initProfile()
        /*
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
        */

            if(data.profile.type == 'private'){
                let PARTNER = {
                    name     : data.profile.name,
                    uname    : data.profile.username,
                    uid      : data.profile.id, 
                    photo    : data.profile.photo,
                    gender   : data.profile.info_gender,
                    bio      : data.profile.info_bio,
                    web      : data.profile.info_website,
                    ig       : data.profile.info_instagram,
                    fb       : data.profile.info_facebook,
                    tw       : data.profile.info_twitter,
                    cty      : data.profile.info_country,
                    date     : data.profile.date_created,
                    isme     : false
                }
                initProfile(PARTNER)
            }else{
                initProfile(MY_PROFILE)
            }


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

        


    
