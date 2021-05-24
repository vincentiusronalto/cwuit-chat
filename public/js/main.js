
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
        if(event.target.closest('.single_nav')){
            let link = e.target.getAttribute('data-link');
            
            showContentClick(link)
        }
    });
