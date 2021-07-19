
// fetches an JSON with all the Images that are saved on the server
function showPics(){
    fetch(`${window.location.href}ShowDir`)
    .then(response => response.json())
    .then(jsonResponse => createElement(jsonResponse))
    
}
// Creats an div and img inside with the saved Images on the server
function createElement(images){
    var gallaryItem = document.getElementById("gallary")
    gallaryItem.innerHTML = ''; // delete all elements in gallary

    const activeFolder = images[0]
    const urlBase = `${window.location.href}Gallery/${activeFolder}/`
    for(image in images){
        if(image > 0){
            var url = "'"+urlBase+images[image]+"'"
            //console.log(url)
            var d = document.createElement('div')
            d.setAttribute('class','col s12 m2')
            var img = document.createElement('img')
            img.setAttribute('class','responsive-img')
            img.setAttribute('draggable','true')
            img.setAttribute('id',images[image])
            img.setAttribute('src',urlBase+'Small_Img/small_'+images[image])
            img.setAttribute('onclick','imageClick('+url+')')
            d.appendChild(img)
            var element = document.getElementById("gallary")
            element.appendChild(d)
        }
    }
}
//Show progress Bar
function showProgressBar(){
    var d = document.createElement('div')
    d.setAttribute('class', 'progress')
    var prog = document.createElement('div')
    prog.setAttribute('class', 'determinate')
    prog.setAttribute('style', 'width: 0%')
    prog.setAttribute('id', 'Progressbar')
    d.appendChild(prog)
    var element = document.getElementById("UploadForm")
    element.append(d)


    //Adjust width over time for the progress bar
    var i = 0
    fillProgressBar()
    function fillProgressBar(stop){
        if(!stop){
            setTimeout(function() {
                i++
                w = i*2
                w > 98 ? w=98 : w=w
                w.toString()
                document.getElementById("Progressbar").style.width = w+'%';
                if(i>100) stop=true
                fillProgressBar(stop)
            }, 25)  
        }
    }
//     <div class="progress" >
//          <div class="determinate" style="width: 70%"></div>
//     </div>
}

//Shows the clicked Image as a whole (high devinition)
function imageClick(url) {
    window.location.assign(url)
}

//Drag n Drop of images to the Trash LINK: https://www.w3schools.com/jsref/event_ondrop.asp

    var WasPlacedOverTrash = false
    // Event that triggers wenn the dragging has ended
    document.addEventListener('dragend', function(event) {
        if(WasPlacedOverTrash){
            console.log(event.target.id+' was placed over trash')
            WasPlacedOverTrash=false
            var id = event.target.id
            console.log(event.target.id)
            var url = `${window.location.href}deleteImg/:${id}`
            window.location.assign(url)
        }
    });
    // By default, data/elements cannot be dropped in other elements. To allow a drop, we must prevent the default handling of the element
    document.addEventListener("dragover", function(event) {
        event.preventDefault();
    });
    // Event that triggers when a image was dragged and released over the trash icon
    document.addEventListener("drop", function(event) { 
        if ( event.target.id == "ziel" ) {
        WasPlacedOverTrash = true
        }
    });

// Add Folder and send the new folder as a json to the server to update the json-folder-file
function addNewFolder(){
    var id = document.getElementById('icon_prefix').value
    if(id !== ''){
        document.getElementById('icon_prefix').value = ''
        var url = `${window.location.href}addFolder`
        // window.location.assign(url)
        fetch(url, { 
            method: "POST",
            headers: {
                "Content-Type" : "application/json"
            },
            body: JSON.stringify(
            {
                "name": id,              // keys and values we want to add
                "active": "false"
            })
        }).then(response => response.json())
        .then(jsonResponse => createFolders(jsonResponse)) // call the createFolder function but only for the newly created folder (no page reload)
    }

    
}

// fetch JSON with all folders in the server side json-folder-file
function showFolder(){
    fetch(`${window.location.href}sendFolderNames`)
    .then(response => response.json())
    .then(jsonResponse => createFolders(jsonResponse))


}
// creat folders from JSON 
function createFolders(json){

    for(folder in json.folders){
        var li = document.createElement('li')
        if(json.folders[folder].active == 'true'){
            li.setAttribute('class','active')
        }else{
            li.setAttribute('class','waves-effect')
        }
        li.setAttribute('id','li_'+json.folders[folder].name)
        li.setAttribute('draggable','true')
        var a = document.createElement('a')
        a.setAttribute('onclick','changeFolder(this)')
        a.setAttribute('id','a_'+json.folders[folder].name)
        a.innerHTML = json.folders[folder].name
        li.appendChild(a)
        var element = document.getElementById("FolderUL")
        element.appendChild(li)
    }
    // <li class="active" id="li_xxx"><a onclick="changeFolder(this)" id='a_XXX'>Italien 2021</a></li>
    // <li class="waves-effect" id="li_xxx"><a onclick="changeFolder(this)" id='a_XXX'>Italien 2021</a></li>
    // <li class="waves-effect" id="li_xxx"><a onclick="changeFolder(this)" id='a_XXX'>Italien 2021</a></li>
}

// Choose folder and highlight choosen folder
function changeFolder(element){
    var all_li = document.getElementById("FolderUL").children
    for(li in all_li){
        try{
            document.getElementById('li_'+all_li[li].id.slice(3)).className = "waves-effect"
        }catch{}
    }
    try{
        setActivFolder(element.id.slice(2))
        document.getElementById('li_'+element.id.slice(2)).className = "active"
    }catch{}
}

// send to server which folder is active
function setActivFolder(folderName){
    var url = `${window.location.href}changeActiveFolder`
    fetch(url, { 
        method: "PATCH",
        headers: {
            "Content-Type" : "application/json"
        },
        body: JSON.stringify(
        {
            "name": folderName,              // keys and values we want to add
            "active": "true"
        })
    }).then(response => response.json())
    .then(jsonResponse => createElement(jsonResponse))
}

//Call show-functions on every refresh
showPics()
showFolder()