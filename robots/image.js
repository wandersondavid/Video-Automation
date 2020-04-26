const { google } = require('googleapis');
const gm = require('gm').subClass({imageMagick: true})
const customSearch = google.customsearch('v1')
const state = require('./state.js');
const googleSearchCredentias = require('../credentials/search-google.json')
const imageDownloader = require('image-downloader')

async function robot() {
    const content = state.load();
    // await fetchImageOfAllSentences(content);
    // await downloadAllImages(content);
    await convertAllImages(content)

    // state.save(content);

    async function fetchImageOfAllSentences(content) {

        for (const sentence of content.sentences) {

            const query = `${content.searchTerm} ${sentence.keywords[0]}`
            sentence.images = await fechGoogleAndReturnImagesLinks(query)
            sentence.googleSearchQuery = query
        }
    }

    async function fechGoogleAndReturnImagesLinks(query) {
        const response = await customSearch.cse.list({
            auth: googleSearchCredentias.apikey,
            cx: googleSearchCredentias.searchEngineID,
            q: query,
            searchType: 'image',
            num: 2
        })

        const imageUrl = response.data.items.map((item) => {
            return item.link
        })
        return imageUrl
    }

    async function downloadAllImages(content) {
        content.downloadImages = [];
        for (let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++) {
            const images = content.sentences[sentenceIndex].images

            for (let imageIndex = 0; imageIndex < images.length; imageIndex++) {
                const imageUrl = images[imageIndex]
                try {
                    if (content.downloadImages.includes(imageUrl)) {
                        throw new Error('Imagem Já baixada')
                    }
                    await downloadAndSave(imageUrl, `${sentenceIndex}-original.png`)
                    content.downloadImages.push(imageUrl);
                    console.log(`>[${sentenceIndex}][${imageIndex}] Baixou imagem com sucesso: ${imageUrl}`)
                    break
                } catch (error) {
                    console.log(`>[${sentenceIndex}][${imageIndex}] Error ao Baixar imagem: ${imageUrl}`)
                    console.log(error)
                }
            }
        }
    }
    async function downloadAndSave(url, fileName) {
        return imageDownloader.image({
            url: url,
            dest: `./content/${fileName}`
        })
    }

    async function convertAllImages(content){
        for(let sentenceIndex = 0; sentenceIndex < content.sentences.length; sentenceIndex++){
            await convertImage(sentenceIndex)
        }
    }

    async function convertImage(sentenceIndex) {
        return new Promise((resolve, reject)=>{
            const inputFile = `./content/${sentenceIndex}-original.png[0]`
            const outputFile = `./content/${sentenceIndex}-converted.png`
            const width = 1920
            const height = 1080

            gm()
            .in(inputFile)
            .out('(')
                .out('-clone')
                .out('0')
                .out('-background', 'white')
                .out('-blur', '0x9')
                .out('-resize', `${width}x${height}^`)
            .out(')')
            .out('(')
                .out('-clone')
                .out('0')
                .out('-background', 'white')
                .out('-resize', `${width}x${height}`)
            .out(')')
            .out('-delete', '0')
            .out('-gravity', 'center')
            .out('-compose', 'over')
            .out('-composite')
            .out('-extent', `${width}x${height}`)
            .write(outputFile, (error)=> {
                if(error){
                    return reject(error)
                }
                console.log(`> Image converted: ${inputFile}`)
                resolve()
            })
        })
    }
}

module.exports = robot