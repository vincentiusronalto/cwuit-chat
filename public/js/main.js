
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

        else if(e.target.closest('#chat_room_input')){
            // chat_room_input_box
            window.location.href = "/login";

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
