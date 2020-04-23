const { google } = require('googleapis');
const customSearch = google.customsearch('v1')
const state = require('./state.js');
const googleSearchCredentias = require('../credentials/search-google.json')
const imageDownloader = require('image-downloader')

async function robot() {
    const content = state.load();
    await fetchImageOfAllSentences(content);
    await downloadAllImages(content);

    state.save(content);

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
        // content.sentences[1].images[0] = 'https://images-na.ssl-images-amazon.com/images/I/41jEbK-jG%2BL._SX374_BO1,204,203,200_.jpg'
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
}

module.exports = robot