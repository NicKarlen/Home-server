const express = require('express')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const { stringify } = require('querystring')
const sharp = require('sharp');

const app = express()
const port = 3000


// This sends all the static files in the folder 'public' to the client
app.use(express.static(__dirname+'/public'))
app.use(express.json());    // this is needed to read JSON responses from the client (in POST or PATCH)


// This is the link to the multer tutorial, click below:
//var TUTORIAL = 'https://www.youtube.com/watch?v=9Qzmri1WaaE'

//Set up the storage engine for multer
const storage = multer.diskStorage({
    //destination: './public/Uploads/',
    destination: function(req, file, cb) {
        cb(null, './public/Gallery/'+req.params.id+'/')
    },
    filename:  function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})


//inti upload multible image
const multiUploads = multer({
    storage: storage,
    limits: {fileSize: 1000000000}
}).array('myImages',20)



//Upload multible images to server
app.post('/multiUploads', (req, res) => {
    req.params.id = findActiveFolder()
    //console.log(findActiveFolder())
    multiUploads(req, res, (err) => {
        if (err){
            res.send(err)
        }else{
            setTimeout(function() {
                res.redirect('http://localhost:3000/');
              }, 1500)
            CompressImage(req.params.id);
        }
    })
})


// Function to compress Images (sharp). It's called when the images are uploaded.
function CompressImage(folderName){
    var urlOriginalPic = __dirname+'/public/Gallery/'+folderName+'/'
    var urlSmallPic = __dirname+'/public/Gallery/'+folderName+'/Small_Img/'
    fs.readdir(urlOriginalPic, function (err, images) {
        if (err) {
            return console.error(err)
        }else{
            for (image in images){
                if(images[image] !== "Small_Img"){ // Because with fs.readDir I also read the folder "Small_Img" within
                    sharp(urlOriginalPic+images[image])
                    .resize(width=200,height=200,options='cover',200)
                    .toFile(urlSmallPic+'small_'+images[image])
                } 
            }     
        }
    })
}
// function that reads the json-folder-file and returns the name of the active folder
function findActiveFolder(){
    var path = __dirname+'/public/FoldersInGallery.json'
    var obj = JSON.parse(fs.readFileSync(path, 'utf8'))
    for(folder in obj.folders){ 
        if(obj.folders[folder].active == "true"){
            return obj.folders[folder].name
        }
    }
}

//Log List of Images in Uploads and send JSON with names of all images
app.get('/ShowDir', (req, res) => {
    createListOfImagesInActiveFolder(req,res)
})

// function that creats a list of Images in the currently active folder and sends it as a response
function createListOfImagesInActiveFolder(req,res){
    var activeFolder = findActiveFolder()
    var urlOriginalPic = __dirname+'/public/Gallery/'+activeFolder+'/'
    fs.readdir(urlOriginalPic, function (err, images) {
        if (err) {
            return console.error(err)
        }else{   
            images = images.slice(0,-1)   
            images.unshift(activeFolder)
            res.send(JSON.stringify(images))                
        }
        res.end()
    })
}

// Delete request, client wants to delete a img or folder with this id
app.get('/deleteImg/:id', function(req, res) {
    var id = req.params.id.slice(1);
    if(id.slice(0,2)=='li'){
        var id = id.slice(3);

        var emptyObj = {"folders":[]}
        var path = __dirname+'/public/FoldersInGallery.json'
        var obj = JSON.parse(fs.readFileSync(path, 'utf8'))
        for(folder in obj.folders){ 
            if(obj.folders[folder].name !== id){
                emptyObj.folders.push(obj.folders[folder])
            }
        }
        
        json = JSON.stringify(emptyObj); //convert it back to json
        fs.writeFileSync('./public/FoldersInGallery.json', json, 'utf8', () => {}); 
        fs.rmdirSync(__dirname+'/public/Gallery/'+id+'/', { recursive: true });
        
    }else{
        var activeFolder = findActiveFolder()
        console.log('delete '+id+' in folder '+activeFolder)
        fs.unlinkSync(__dirname+'/public/Gallery/'+activeFolder+'/'+id)
        fs.unlinkSync(__dirname+'/public/Gallery/'+activeFolder+'/'+'Small_Img/small_'+id)    
    }
    res.redirect('http://localhost:3000/');
   })

// Add new folder to the database
app.post('/addFolder', function(req, res){   

    var emptyObj = {"folders":[]}
    fs.readFile('./public/FoldersInGallery.json', 'utf8', function readFileCallback(err, data){
        if (err){
            console.log(err);
        } else {
        obj = JSON.parse(data); //now its an object
        obj.folders.push(req.body); //add JSON (not with stringify!!)
        emptyObj.folders.push(req.body) // Is needed to send an response with only the new folder
        json = JSON.stringify(obj); //convert it back to json
        jsonNewFolder = JSON.stringify(emptyObj); // Is needed to send an response with only the new folder
        fs.writeFile('./public/FoldersInGallery.json', json, 'utf8', () => {
            res.send(jsonNewFolder)// write it back 
        }); 
    }});
    
    var dir = './public/Gallery/'+req.body.name; //read name property of sent Json (new folder name)
    // creat folder in directory
    if (!fs.existsSync(dir)){
        fs.mkdirSync(dir)
        fs.mkdirSync(dir+'/Small_Img')
    };
})

// Change the active folder
app.patch('/changeActiveFolder', function(req, res) {
    var path = __dirname+'/public/FoldersInGallery.json'
    var obj = JSON.parse(fs.readFileSync(path, 'utf8'))
    for(folder in obj.folders){ 
        if(obj.folders[folder].name == req.body.name){
            obj.folders[folder].active = "true"
        }else{
            obj.folders[folder].active = "false"
        }
    }
    json = JSON.stringify(obj); //convert it back to json
    fs.writeFile('./public/FoldersInGallery.json', json, 'utf8', () => {
        //res.send({'msg': 'active folder is now '+req.body.name})
        createListOfImagesInActiveFolder(req,res)
    }); 
})

// Send all folder names of folders that are in the directory Gallery
app.get('/sendFolderNames', function(req, res) {
    var path = __dirname+'/public/FoldersInGallery.json'
    var obj = JSON.parse(fs.readFileSync(path, 'utf8'))
    res.send(JSON.stringify(obj))
})


// This is the server listening for client to connect on the given port (3000)
app.listen(port, ()=>{
    console.log(`listening on port ${port}`)
})



