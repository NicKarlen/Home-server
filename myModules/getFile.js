const fs = require('fs')

var readfile = function(){
    fs.readFile('./Data/dataSet1.txt','utf8', (error, data) =>{
        if (error){
            console.log(error)
            return
        }
        //console.log(data)
        return data
    })
} 

module.exports.readfile = readfile