const base64 = require('file-base64');
const path   = require('path');

const base64Decoder = function(base64String,directory,fileType){
    let base64StringF = base64String.split(',')[1];
    let timeMs        = new Date().getTime();
    let fileName      = timeMs+"."+fileType;
    let directoryPath = path.join(__dirname,directory);
    let fileFinal     = directoryPath+fileName;
    return new Promise((resolve, reject)=>{
        base64.decode(base64StringF, fileFinal, 
            function(err, output) {
                if(err){
                    reject(err);
                }else{
                    resolve(fileName);
                }
        });
    });
}

module.exports = base64Decoder;