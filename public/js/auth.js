(function(){
    function showContent(selectorClass,selectorActive,contentClass,contentActive,flexOrBlock){
        let selectorLink = document.getElementsByClassName(selectorClass);
        let contentLink = document.getElementsByClassName(contentClass);
        let contentOpen;
        let contentId;
        for(let i = 0; i < selectorLink.length; i++){
            if(selectorLink[i].classList.contains(selectorActive)){
                contentOpen = selectorLink[i].getAttribute('data-content');
                contentId = document.getElementById(contentOpen);
            }
        }
        //close all content
        for(let i = 0; i < contentLink.length; i++){
            contentLink[i].classList.remove(contentActive);
            contentLink[i].style.display = 'none';
        }
    
        contentId.classList.add(contentActive);
        contentId.style.display = flexOrBlock;
    }
    
    function sendAuthPost(sendString, destination, csrfVal){  
          var xhttp = new XMLHttpRequest();
          xhttp.onreadystatechange = function() {
              if (this.readyState == 4 && this.status == 200) {
                  console.log(this.responseText);
              
                let data = JSON.parse(this.responseText);
                let type = data.type;
                
                if(type == 'login'){
                    let success = data.success;
                    let note = '';
                    if(success){
                        note = `<span class="success">Successful login, Entering...<span>`;
                        setTimeout(function(){window.location.href = "/chat";},'1500');
                        
                    }else{
                        note = `<span class="failed">Wrong email/username or password<span>`;
                    }
                    document.getElementById('auth_confirm').innerHTML = "";
                    document.getElementById('auth_confirm').innerHTML = note;
                    document.getElementById('auth_confirm').style.display = 'block';
                    loginBtn.innerHTML = 'Login';
                }
    
                else if(type == 'signup'){
                    let email = data.email;
                    let username = data.username;
                    let success = data.success;
                    let errArr = data.errorCheck;

                    let note = ''
                    if(success){
                        note = `<span class="success">Thanks ${username} for joining, Entering...<span>`;
                        setTimeout(function(){window.location.href = "/chat";},'1500');
                    }else{
                        /*
                        {"success":false,"type":"signup","errorCheck":{"username_unique":[0,"username : already exist"],"username_alpha":[0,"username : only alphanumeric allowed (a-z or 0-9)"],"username_length":[1,"username : 4-50 characters allowed"],"email_unique":[0,"email : already exist"],"email_valid":[1,"email : invalid format"],"password_length":[1,"password : min 7 characters allowed"]}}


                        */
                        
                        for(let i=0; i < errArr.length ; i++){
                            note += `<div class="failed">${errArr[i]}</div>`;
                        }
                    }
                    document.getElementById('auth_confirm').innerHTML = "";
                    document.getElementById('auth_confirm').innerHTML = note;
                    document.getElementById('auth_confirm').style.display = 'block';
                }

                else if(type == 'passreset'){
                    let success = data.success;
                    let note = '';
                    if(success){
                        note = `<span class="success">Check your email for password reset<span>`;
                    }else{
                        note = `<span class="failed">Wrong email/username<span>`;

                    }
                    document.getElementById('auth_confirm').innerHTML = "";
                    document.getElementById('auth_confirm').innerHTML = note;
                }
              }
          };
          xhttp.open("POST", destination, true);
          xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
          xhttp.setRequestHeader('X-CSRF-Token',csrfVal);
          xhttp.send(sendString);
    }
    
    //login-signup-forgotpass
        
    let authlink = document.getElementsByClassName('auth_single_link');
    
    for(let i = 0; i < authlink.length; i++){
        authlink[i].addEventListener('click', function (e) { 
            if(!e.target.classList.contains('auth_link_active')){
                for(let j = 0; j < authlink.length; j++){
                    authlink[j].classList.remove("auth_link_active"); 
                }
                e.target.classList.add("auth_link_active"); 
                showContent('auth_single_link','auth_link_active','auth_single_wrapper','auth_single_active','flex');
            }
         }, false);
    }
    
    //login on click
    let loginBtn  = document.getElementById('login_btn');
    let signupBtn = document.getElementById('signup_btn');
    let fpassBtn  = document.getElementById('fpass_btn');
    let csrfVal = document.getElementById('auth_csrf_val').value;
    
    loginBtn.addEventListener('click', function(e){
        let usernameEmail = document.getElementById('input_login_uname_email').value;
        let password      = document.getElementById('input_login_pass').value;
        let sendString    = `uname_email=${usernameEmail}&password=${password}`;
        let destination   = 'auth_login';
        loginBtn.innerHTML = 'Please Wait...';
        
        // console.log(sendString, destination, csrfVal);
        sendAuthPost(sendString,destination,csrfVal);
    });
    
    signupBtn.addEventListener('click', function(e){
        console.log('ok')
        let username = document.getElementById('input_signup_uname').value;
        let email = document.getElementById('input_signup_email').value;
        let password = document.getElementById('input_signup_pass').value;
        
        let sendString = `username=${username}&email=${email}&password=${password}`;
        let destination = 'auth_register';
        console.log(sendString, destination, csrfVal);
        
        sendAuthPost(sendString, destination, csrfVal);
    });
    
    fpassBtn.addEventListener('click', function(){
        let usernameEmail = document.getElementById('input_fpass_uname_email').value;
        let sendString = `uname_email=${usernameEmail}`;
        let destination = 'auth_req_change_password';
        console.log(sendString, destination, csrfVal);
        sendAuthPost(sendString, destination, csrfVal);
    });

    
    
    
    })(); //end