import Movie from "../models/Movie"
const im = require('imagemagick');
const request = require('request');
const Fs = require('fs')
const Path = require('path')
const Axios = require('axios')
const gm = require('gm').subClass({ imageMagick: true });



export const batchMinify = async () => {
    const movies = await Movie.find({});
    let count = 1;
    for (let movie of movies) {
        if (!movie.idIMDB) return;
        await minify(movie.idIMDB);
        console.log("count " + count);
        count++;
    };

}

export const batchDownload = async () => {
    const movies = await Movie.find({});
    let count = 1;
    for (let movie of movies) {
        const url = movie.urlPoster;
        let c = false;
        try {
            if (url && movie.idIMDB) await downloadImage(url, `../../public/tmp/${movie.idIMDB}.jpg`);
            c = true;
        } catch (error) {
            console.log("errr")
        }
        console.log("count " + count);
        count++;
    };
}

async function downloadImage(url: string, id: string) {
    const path = Path.resolve(__dirname, '../public/tmp', id)
    const writer = Fs.createWriteStream(path)

    const response = await Axios({
        url,
        method: 'GET',
        responseType: 'stream'
    })

    response.data.pipe(writer)

    return new Promise((resolve, reject) => {
        writer.on('finish', resolve)
        writer.on('error', reject)
    })
}



export const minify = async (id: string) => {
    await im.convert([`public/tmp/${id}.jpg`, '-resize', '164x222', '-strip', '-interlace', "Plane", '-quality', "85%", `public/posters/${id}.jpg`],
        function (err: any, stdout: any) {
            if (err) throw err;
            console.log('Converted image :' + id);
        });
}