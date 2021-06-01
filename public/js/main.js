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

    

    //SET COLOR THEME
    let colorThemeBtn = document.getElementById('color_theme_picker');


    let colorThemeValue = colorThemeBtn.innerHTML;

    // localStorage.setItem("color_theme","light")
    //set
    let colorFirst = localStorage.getItem("color_theme");
    if(colorFirst == 'dark'){
        colorThemeBtn.innerHTML = 'dark_mode';
        document.getElementById('color_theme_css').removeAttribute('disabled');
    }else{
        colorThemeBtn.innerHTML = 'light_mode';
        document.getElementById('color_theme_css').setAttribute('disabled','true');
    }

    document.addEventListener('click', function(e){
        if(e.target.closest('#color_theme_picker')){
            let colorCheck = localStorage.getItem("color_theme");
            if(colorThemeBtn.innerHTML == 'dark_mode'){ // dark -> light
                colorThemeBtn.innerHTML = 'light_mode'
                localStorage.setItem("color_theme","light");
                document.getElementById('color_theme_css').setAttribute('disabled','true');
                
            }else{
                colorThemeBtn.innerHTML = 'dark_mode' // light -> dark
                localStorage.setItem("color_theme","dark");
                document.getElementById('color_theme_css').removeAttribute('disabled');
            }
            
        }
    })

    function contentLoad(){

        //day - night
        let loader = `
        <div class="loader">
      <div class="loader-shimmer">
        <div class="_2iwr"></div>
        <div class="_2iws"></div>
        <div class="_2iwt"></div>
        <div class="_2iwu"></div>
        <div class="_2iwv"></div>
        <div class="_2iww"></div>
        <div class="_2iwx"></div>
        <div class="_2iwy"></div>
        <div class="_2iwz"></div>
        <div class="_2iw-"></div>
        <div class="_2iw_"></div>
        <div class="_2ix0"></div>
      </div>
  </div>
        `
        return loader;

        
    }

    document.getElementById('chat_topic_wrapper').innerHTML = contentLoad();

    function initProfile(data){
        
        
        //location build
        let loc = '';
        if(data.cty){
            loc = 
            `
            <a class="profile_single_wrapper" href="https://en.wikipedia.org/wiki/${data.cty}" target="_blank">
                <div><img src="/icon/loc.png" alt="country" class="profile_icon_loc"></div> 
                <div>${data.cty}</div>
            </a>
            `;
        }
        //social media build
        

        let socmedI = '';

        if(data.web){
            socmedI +=`
            <a href="${data.web}" class="profile_single_wrapper" target="_blank">
                <div><img src="/icon/web.png" alt="website" class="profile_icon"></div> 
                </a> 
            </a>`
        }
        if(data.ig){
            socmedI +=`
            <a href="https://www.instagram.com/${data.ig}" class="profile_single_wrapper" target="_blank">
                <div><img src="/icon/ig.png" alt="instagram" class="profile_icon"></div> 
                </a> 
            </a>`
        }
        if(data.fb){
            socmedI +=`
            <a href="https://www.facebook.com/${data.fb}" class="profile_single_wrapper" target="_blank">
                <div><img src="/icon/fb.png" alt="facebook" class="profile_icon"></div> 
                </a> 
            </a>`
        }
        if(data.tw){
            socmedI +=`
            <a href="https://www.twitter.com/${data.tw}" class="profile_single_wrapper" target="_blank">
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
            EditBtn = `<div id="edit_profile_btn">Edit My Profile</div> <a  id="logout_btn" href="/logout">Sign Out</a>`;
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

        // let header = `${data.name}'s profile`;
        let header = '';
        if(data.isme){
            header = 'My Profile';
        }else{
            header = `${data.name}'s profile`;
        }
        
        
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
        document.getElementById('info_which_chat').innerHTML = 'Edit My Profile';
        document.getElementById('chat_room_output').innerHTML = editProfilePage;
        
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
        
        
   }    

   document.addEventListener('click', function(event){
        if(event.target.closest('#cancel_change_pp')){
            
            document.getElementById("edit_profile_pp").setAttribute("src", `/upload/user/${MY_PROFILE.photo}`);
            document.getElementById("change_profile_pic_hidden").value = "";
            
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
            // document.getElementById('chat_room_output').innerHTML = `<img src="/test/loading.gif" alt="chat" id="illustration_loading"></img>`
            // document.getElementById('profile_right_inside').innerHTML = `<img src="/test/loading.gif" alt="chat" id="illustration_loading"></img>`
            document.getElementById('chat_room_output').innerHTML = contentLoad();
            document.getElementById('profile_right_inside').innerHTML = contentLoad();

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
            if(document.body.clientWidth <= '800'){
                
                document.getElementById('responsive_black_modal').classList.toggle('hide');
                document.getElementById('chat_topic').classList.toggle('show');
            }
        }
        else if(e.target.closest('#right_icon_display')){   

            
            document.getElementById('profile_right_wrapper').classList.toggle('hide')
            if(document.body.clientWidth <= '800'){
                
                document.getElementById('responsive_black_modal').classList.toggle('hide');
                document.getElementById('profile_right_wrapper').classList.toggle('show');
            }else{
                // > 800
                document.getElementById('profile_right_wrapper').classList.remove('show');
            }

            //if
        }
        else if(e.target.closest('#responsive_black_modal')){
            document.getElementById('responsive_black_modal').classList.add('hide');
                document.getElementById('profile_right_wrapper').classList.remove('show');
                document.getElementById('chat_topic').classList.remove('show');
                
        }
    });


    class Stripper
    {
    constructor() {
        this._target = document.createElement("div")
    }
    strip(html) {
        this._target.innerHTML = html
        return this._target.textContent || this._target.innerText || ""
    }
    }

    function sliceToDot(file_name){
        // var file_name = 'Screen Shot 2015-06-16 at 8.26.45 AM.png';
        let result;
        var file_ext = file_name.substring(file_name.lastIndexOf('.')+1);

        let maxChar = 20;
        let untilChar = maxChar - 4;
        if (file_name.length > maxChar){ 
            result = file_name.substring(0,untilChar)+'...';
        } else if(file_name == ''){
            return 'send an image';
        }else{
            return file_name;
        }
        
        return result;
    }
    


    const stripper = new Stripper()
    


    socket.emit('user_load');
    socket.on('user_load',function(data){
        
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
                        "text": "hi 2 from 1",
                        "chatid": 0
                    }
                }
            ]
        }
        */


        //SORT PRIVATE CHAT
        let privateNotOrdered = [];

        // copy the array
        for (let i = 0; i < data.private.length; i++) {
            privateNotOrdered[i] = data.private[i];
        }

        // make the sorted
        // total = sorted + nochat
        let noChat = [];
        for(let i = 0; i < privateNotOrdered.length; i++){

            if(privateNotOrdered[i].lastchat.chatid == 0){
                noChat.push(privateNotOrdered[i]);

                //make value null
                privateNotOrdered[i] = null;

            }


            //noChat.p
        }



let filteredNoChat = privateNotOrdered.filter(function (el) {
  return el != null;
});



//sort array
function compareChatId( a, b ) {
  if ( a.lastchat.chatid < b.lastchat.chatid ){
    return 1;
  }
  if (a.lastchat.chatid > b.lastchat.chatid ){
    return -1;
  }
  return 0;
}

let filteredChat = filteredNoChat.sort( compareChatId );


//combine array
//var children = hege.concat(stale); 

let combinedPrivate = filteredChat.concat(noChat)


        let topicWrapper = document.getElementById('chat_topic_wrapper');
        let privateWrapper = document.getElementById('chat_private_wrapper');
        // chat_selector_single_active
        //topic
        let topicbuild = ``;
        for(let i = 0; i < data.topic.length;  i++){

            //unread build
            let unread = data.topic[i].unread_count;
            let unread_build = ``;
            if(unread > 0){
                
            if(unread > 999){
                unread = '999+'
            }
                unread_build = `<div class="chat_selector_single_unread" data-type="topic" data-id="${data.topic[i].id}">${unread}</div>`;
            }


            topicbuild += 
            `
            <div class="chat_selector_single" data-type="topic" data-id="${data.topic[i].id}">
                <img src="/upload/topic_pic/${data.topic[i].image}" class="profile_pic_small">
                <div class="chat_selector_content">
                    <div>${data.topic[i].name}</div>
                    <div class="chat_selector_history_chat"><span class="chat_selection_name_blue">${data.topic[i].lastchat.name}</span> : ${data.topic[i].lastchat.text}</div>
                </div>
                ${unread_build}
            </div>
            `
        }

        let privatebuild = ``;
        //private
        for(let i = 0; i < combinedPrivate.length; i++){
            //gender check
            let genderBuild = '';
            if(combinedPrivate[i].info_gender){
                genderBuild = `<span class="material-icons icon-${combinedPrivate[i].info_gender}">${combinedPrivate[i].info_gender}</span>`;
            }

            //stripper.strip();
            let lastchat = sliceToDot(stripper.strip(combinedPrivate[i].lastchat.text));

            //unread private
            // let 
            if(combinedPrivate[i].lastchat.unread > 0){

            }

            //unread build
            let unread =  combinedPrivate[i].lastchat.unread;
            let unread_build = ``;
            if(unread > 0){
                
            if(unread > 999){
                unread = '999+'
            }
                unread_build = `<div class="chat_selector_single_unread" data-type="private" data-id="${combinedPrivate[i].identity}">${unread}</div> `;
            }
            
            privatebuild +=
            `
            <div class="chat_selector_single" data-type="private" data-id="${combinedPrivate[i].identity}">
                <img src="/upload/user/${combinedPrivate[i].photo}" class="profile_pic_small">
                <div class="chat_selector_content">
                    <div class="chat_selection_name_blue">${genderBuild}${combinedPrivate[i].name}</div>
                    <div class="chat_selector_history_chat">${lastchat}</div>
                </div>
                ${unread_build}
            </div>
            `
            
        }

        topicWrapper.innerHTML = topicbuild;
        privateWrapper.innerHTML = privatebuild;
    })

   

    socket.on('chat_load', function(data){
        try{
        //unread_build = `<div class="chat_selector_single_unread" data-type="topic" data-id="${data.topic[i].id}">${unread}</div>`;
        
        
        let dotNotif = document.querySelector(`.chat_selector_single_unread[data-type="${data.profile.type}"][data-id="${data.profile.identity}"]`);
        
        if(dotNotif){
            dotNotif.remove();
        }
        
       
        //get active id 
        
        let selector = document.querySelector('.chat_selector_single_active');
        let activeType = selector.getAttribute('data-type');
        let activeId =  selector.getAttribute('data-id');
        
        let dataId = data.profile.identity;

        // if(activeType == 'private'){
        //     dataId = data.profile.identity;
        // }
        // console.log(data.profile)
        // console.log(dataId, activeId)
        if(data.profile.type == activeType && dataId == activeId){
            let info = ''
        if(data.profile.type == 'private'){
            info = `<span>@${data.profile.username}</span>`
        }else{
            info = `<span>${data.profile.topic_name}</span>`   
        }
        // console.log(data.chat)
        let chatbuild = '';
        if(data.profile.type == 'topic'){
            chatbuild = `<div class="chat_beginning"> This is the beginning chat, Say hi first 👋</div>`;
        }else{
            chatbuild = `<div class="chat_beginning"> This is the beginning chat with ${data.profile.name}, Say hi first 👋</div>`;
        }
        
        
        for(let i = 0; i < data.chat.length; i++){
            console.log('assssss')    
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
                    <div class="chat_content_name_date">
                        <div class="chat_content_name">${data.chat[i].name}</div>
                        <div class="chat_date_data"><div>${moment(data.chat[i].date_created).fromNow()}</div></div> 
                    </div>
                    
                    <div class="chat_selector_history_chat">${data.chat[i].text}</div>
                    <div>${imageBuild}</div>
                </div>
                
            </div>`
        }
        // if(data.chat.length == 0){
        //     chatbuild +=`
        //         <div class="chat_beginning"> This is the beginning chat with ${data.profile.name}, Say hi first 👋</div>
        //     `
        // }

        // console.log(chatbuild)

        document.getElementById('info_which_chat').innerHTML = info;
        
        document.getElementById('chat_room_output').innerHTML = chatbuild;
        let output = document.getElementById('chat_room_output');

            output.style.opacity = "0";
        
            setTimeout(function(){
                output.scrollTop = output.scrollHeight;
                output.style.opacity = "1";
            },'300')
        }

        


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
        }catch(err){
            console.log(err)
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
                    <div class="chat_content_name_date">
                        <div class="chat_content_name">${MY_NAME}</div>
                        <div class="chat_date_data"><div>Sending</div></div> 
                    </div>
                    
                    <div class="chat_selector_history_chat">${data.text}</div>
                    <div>${pic}</div>
                </div>
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
    //https://stackoverflow.com/questions/52910602/how-to-trim-html-content-in-js
    //http://jsfiddle.net/fua0skgm/
    function trimHTML(t) {
        var between = false;
        var outHTML = "";
        for (var i = 0; i < t.childNodes.length; i++) {
          var lt = t.childNodes[i];
          
          var nowset = false;
          if (lt.innerHTML != undefined && lt.innerHTML != "" && lt.innerHTML != "<br>") {
            between = !between;
            nowset = true;
            outHTML += lt.outerHTML;
          }
          if (between && !nowset) {
            outHTML += lt.outerHTML;
          }
        }
        return outHTML;
    }
    function sendChat(){
        //SENDING CHAT
        let final_text = document.getElementById('chat_room_input_box').innerHTML.trim();
        final_text = final_text.replace(/^\s*(?:<br\s*\/?\s*>)+|(?:<br\s*\/?\s*>)+\s*$/gi,'');
        final_text = final_text.replace(/^(?:&nbsp;|\s)+|(?:&nbsp;|\s)+$/ig,'');


        function sanitizeHtml(html) {
            const container = document.createElement('DIV');
            // Step 1: Parse the HMTL
            container.innerHTML = html;
        
            // Step 2: Modify the structure
            for (let br of container.querySelectorAll('div > br')) {
                let div = br.parentNode;
                if (div.textContent.trim() === '') div.parentNode.removeChild(div);
                // ...over time, I'm sure you'll find more things you'd like to correct
            }
        
            // Step 3: return the modified HTML
            return container.innerHTML;
        }


        let a = sanitizeHtml(final_text);

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

        let chat_data = {text:a,img:imgSend, topicId : topicId, type : type, checkId : getUniqueID()};
        
        if(a != '' || imgSend.length > 0){
            //empty all element
            document.getElementById('chat_room_input_box').innerHTML = '';
            document.getElementById('chat_preview_images').innerHTML = '';
            imageArr = [];
            base64Arr = [];
            image = {};
            imageChild = '';
    
            createChatSelf(chat_data);
            
            socket.emit('chat_send',chat_data);
            
        }
        
    }
    

    socket.on('chat_send',function(data){
        

        /*
        <div class="chat_selector_single chat_selector_single_active" data-type="private" data-id="1_2">
                        <img src="/upload/user/avatar.png" class="profile_pic_small">
                        <div class="chat_selector_content">
                            <div><span class="material-icons icon-male">male</span>someone1</div>
                            <div class="chat_selector_history_chat">vrozen : send an image</div>
                        </div>
                    </div>
        */

    /*
    //topic
    {
    "uid": "1",
    "uphoto": "img-1622431096423.jpeg",
    "uname": "vrozen",
    "username": "vrozen",
    "chatid": "13",
    "cdate": "2021-05-31T04:38:30.745Z",
    "ctext": "lol",
    "cpic": null,
    "ctopicId": "1",
    "ctype": "topic",
    "checkId": "162243590970625671"
    }

    //private
    {
    "uid": "1",
    "uphoto": "img-1622431096423.jpeg",
    "uname": "vrozen",
    "username": "vrozen",
    "chatid": "14",
    "cdate": "2021-05-31T04:39:14.336Z",
    "ctext": "good",
    "cpic": null,
    "ctopicId": "1_2",
    "ctype": "private",
    "checkId": "162243595333356042"
    }



    */
    //myid
    // let chatActiveTopicId = '1';
    // let chatActiveType = 'topic';

    //get ID/type from active
    let chatActive = document.querySelector('.chat_selector_single_active');
    //topicId 
    let topicId = '';
    let type = '';
    if(chatActive){
        topicId = chatActive.getAttribute('data-id');
        type = chatActive.getAttribute('data-type');
    }
    console.log(topicId, type)

    

    //make LEFT chat selection go up
    // wrapper id : chat_private_wrapper
    // element to move : document.querySelector('.chat_selector_single[data-type="private"][data-id="1_2"]')
    
    



    if(data.ctype == 'private'){
        //check if chat for us
        let idArr = data.ctopicId.split('_');
        if(idArr.includes(MY_ID)){
        let selector = `.chat_selector_single[data-type="private"][data-id="${data.ctopicId}"]`;
        let selectorF = `.chat_selector_single[data-type="private"]`;

        // The original
        let selectMove = document.querySelector(selector);
        let firstChild = document.querySelector(selectorF);

        // The copy
        let copyMove = selectMove.cloneNode(true);

        //remove original
        

        
        // Insert into the DOM
        let privateWrapper = document.getElementById("chat_private_wrapper");    // Get the <ul> element to insert a new node

        
        privateWrapper.insertBefore(copyMove, firstChild);
        selectMove.remove();

        //change content 
        //chat_selector_single[data-type="private"]

        let changeContent = document.querySelector(`.chat_selector_single[data-type="private"][data-id="${data.ctopicId}"] .chat_selector_history_chat`)
        let chatClean = sliceToDot(stripper.strip(data.ctext));
        changeContent.textContent = chatClean;


        // START DOT check if not self message and not active mesage
        if(data.uid != MY_ID){

        
            //check current chat active
            let chatActive1 = document.querySelector('.chat_selector_single_active');
            //topicId 
            let topicId1 = '';
            let type1 = '';
            if(chatActive1){
                topicId1 = chatActive.getAttribute('data-id');
                type1 = chatActive.getAttribute('data-type');
            }
            if(topicId1 != data.ctopicId){
                let d1 = document.querySelector(`.chat_selector_single[data-type="private"][data-id="${data.ctopicId}"]`);
            let unreadDiv = document.querySelector(`.chat_selector_single_unread[data-type="private"][data-id="${data.ctopicId}"]`);
            
            if(unreadDiv){
                let valUnread = parseInt(unreadDiv.innerHTML);
                let finalValue = valUnread + 1;
                if(finalValue > 999){
                    finalValue = '999+';
                }
                document.querySelector(`.chat_selector_single_unread[data-type="private"][data-id="${data.ctopicId}"]`).innerHTML = finalValue;

            }else{
                let unread_build = `<div class="chat_selector_single_unread" data-type="private" data-id="${data.ctopicId}">1</div>`;
                d1.insertAdjacentHTML('beforeend', unread_build);
            }

            
            }
        }
        

        }

    }else if(data.ctype = 'topic'){

        //change content
        //<div class="chat_selector_history_chat">${data.topic[i].lastchat.name} : ${data.topic[i].lastchat.text}</div>
        let changeContent = document.querySelector(`.chat_selector_single[data-type="topic"][data-id="${data.ctopicId}"] .chat_selector_history_chat`)
        

        changeContent.textContent = data.uname +' : '+ data.ctext;

        if(data.uid != MY_ID){
        //check current chat active
        let chatActive2 = document.querySelector('.chat_selector_single_active');
        //topicId 
        let topicId2 = '';
        let type2 = '';
        if(chatActive2){
            topicId2 = chatActive.getAttribute('data-id');
            type2 = chatActive.getAttribute('data-type');
        }
        if(topicId2 != data.ctopicId){
            let d1 = document.querySelector(`.chat_selector_single[data-type="topic"][data-id="${data.ctopicId}"]`);
            console.log(`.chat_selector_single[data-type="topic"][data-id="${data.ctopicId}"]`)
            let unreadDiv = document.querySelector(`.chat_selector_single_unread[data-type="topic"][data-id="${data.ctopicId}"]`);
            if(unreadDiv){
                let valUnread = parseInt(unreadDiv.innerHTML);
                let finalValue = valUnread + 1;
                if(finalValue > 999){
                    finalValue = '999+';
                }
                document.querySelector(`.chat_selector_single_unread[data-type="topic"][data-id="${data.ctopicId}"]`).innerHTML = finalValue;
    
            }else{
                let unread_build = `<div class="chat_selector_single_unread" data-type="topic" data-id="${data.ctopicId}">1</div>`;
                d1.insertAdjacentHTML('beforeend', unread_build);
            }

        }
        }
        
    }


    //print chat on CENTER content
    if(topicId == data.ctopicId && type == data.ctype){
        if(data.uid == MY_ID){

            let checkChatId = document.querySelector(`.chat_content_single[data-checkId="${data.checkId}"]`);
            checkChatId.setAttribute("data-chatId",data.chatid);

            let checkChatDate = document.querySelector(`.chat_content_single[data-checkId="${data.checkId}"] .chat_date_data`);
            checkChatDate.innerHTML = `<div>${moment(data.cdate).fromNow()}</div>`;
        }

        else
        {
      
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

        let chat =
            `<div class="chat_content_single" data-chatId="${data.chatid}">
                <img src="/upload/user/${data.uphoto}" class="profile_pic_small">
                <div class="chat_content_content">
                    <div class="chat_content_name_date">
                        <div class="chat_content_name">${data.uname}</div>
                        <div class="chat_date_data"><div>${dates}</div></div> 
                    </div>
                    
                    <div class="chat_selector_history_chat">${data.ctext}</div>
                    <div>${pic}</div>
                </div>
                
            </div>`;
  

        
        let output = document.getElementById('chat_room_output');
        output.innerHTML += chat;
        output.scrollTop = output.scrollHeight;
        
        }
        
    }

    });

    document.addEventListener('click',function(event){
        if(event.target.closest('#chat_room_send_btn')){
            
            sendChat();

        }
        else if (event.target.closest('.chat_preview_close_image')) {
            let deleteTitle = event.target.getAttribute("data-title");
            
            document.querySelector(`.chat_preview_image_single_wrapper[data-title="${deleteTitle}"]`).remove();
    
            let deleteIndexFinal = getDeleteIndex(deleteTitle, base64Arr);
            base64Arr.splice(deleteIndexFinal, 1);
        }
    })

        


    
