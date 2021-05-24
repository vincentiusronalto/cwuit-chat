const fs = require('fs');

const removeFile = (path)=>{
    return new Promise((resolve,reject)=>{
        fs.unlink(path,function(err){
            if(err !== null){
                // reject(new Error(err));
                reject(err);
            }else{
                // resolve('good');
                resolve('good');
            }
        });
    })
}

module.exports = removeFile;