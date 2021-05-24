var gifFrames = require('gif-frames');
var fs = require('fs');
 
gifFrames({ url: 'original.gif', frames: 0 }).then(function (frameData) {
  frameData[0].getImage().pipe(fs.createWriteStream('./outputgifnew/original.png'));
});