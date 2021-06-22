const imagemin = require('imagemin');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminPngquant = require('imagemin-pngquant');
const imageminGifsicle = require('imagemin-gifsicle');
const imageminSvgo = require('imagemin-svgo');
const {extendDefaultPlugins} = require('svgo');



const compressImage = async (inputPath,outputPath) => {
    let input = inputPath; // 'uncompressed/*.{jpg,png,gif,svg}'
    let output = outputPath; // 'targetfolder/images'

        const files =  imagemin([input], {
            destination: output,
            plugins: [
                // imageminJpegtran(),
                imageminMozjpeg({
                    quality: 50
                }),
                // imageminJpegRecompress(),
                imageminPngquant({
                    quality: [0.6, 0.8]
                }),
                imageminGifsicle(),
                imageminSvgo({
                    plugins: extendDefaultPlugins([
                        {name: 'removeViewBox', active: false}
                    ])
                })
            ]
        });
       
        return files;

}

module.exports = compressImage;