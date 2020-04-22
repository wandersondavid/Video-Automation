const { google } = require('googleapis');
const customSearch = google.customsearch('v1')
const state = require('./state.js');
const googleSearchCredentias = require('../credentials/search-google.json')

async function robot() {
    const content = state.load();

    const imagesArry = await fechGoogleAndReturnImagesLinks('Google');

    console.log('======================================================')
    console.dir(imagesArry, { depth: null })
    process.exit(0)

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

}

module.exports = robot