const express = require('express')
const getFile = require('./myModules/getFile')
const multer = require('multer')
const path = require('path')

const app = express()
const port = 3000

// This sends all the static files in the folder 'public' to the client
app.use(express.static("public"));

// This triggers a download for the client
app.get('/download', (req, res) => {
    const file = `${__dirname}/Data/_DSC0703.JPG`
    res.download(file,(err)=>{
        if (err){
            console.log(err)
        }
        res.end()
    })
})

// This is the link to the multer tutorial
//var TUTORIAL = 'https://www.youtube.com/watch?v=9Qzmri1WaaE'

//Set up the storage engine for multer
const storage = multer.diskStorage({
    destination: './Uploads/',
    filename:  function(req, file, cb){
        cb(null, file.fieldname + '-' + Date.now() + path.extname(file.originalname))
    }
})

//inti upload
const upload = multer({
    storage: storage,
    limits: {fileSize: 10000000}
}).single('myImage')

app.post('/uploads', (req, res) => {
    upload(req, res, (err) => {
        if (err){
            res.send(err)
        }else{
            console.log(req.file)
            res.send('Picture is sent!!')
        }
    })
})


// This is the server listening for client to connect on the given port (3000)
app.listen(port, ()=>{
    console.log(`listening on port ${port}`)
})



/* const http = require('http')

const server = http.createServer((req, res) =>{
    res.setHeader('Content-Type', 'text/html')
    res.write('hello')
    res.end('by')
})
server.listen(8080) 

/* app.get('/', (req, res) => {
    res.sendFile('./FrontEnd/index.html' , { root : __dirname} ,(err)=>{ // Callback function kommt wenn das file übertragen wurde.

        //res.setHeader('Content-Type', 'text/plain') -> muss nicht übergeben werden, da in der funktion sendFile der Header als argument mitgegeben wird.

        if (err){
            console.log(err)
        }
        res.statusCode = 200
        res.end(); // Wenn res.end() ausserhalb der sendFile fuction ist wird die .get übertragung beendet bevor das file gesendet wurde!
    });
})
app.use(express.static(__dirname + '/FrontEnd')); 

// This handels a file upload (never worked)

//const fileUpload = require('express-fileupload');
/* // enable files upload
app.use(fileUpload({
    createParentPath: true
})); 
app.post('/upload-pic', async (req,res) => {
    var file = req.files.pic

    file.mv(`./Uploads/${file.name}`)

    res.send('uploaded')
    
})*/
