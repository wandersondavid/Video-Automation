const { google } = require('googleapis');
const customSearch = google.customsearch('v1')
const state = require('./state.js');
const googleSearchCredentias = require('../credentials/search-google.json')

async function robot() {
    const content = state.load();
    await fetchImageOfAllSentences(content);

    state.save(content);

    async function fetchImageOfAllSentences(content) {
      

        for (const sentence of content.sentences) {
            console.log("======================teste Aqui====================")
            console.log(sentence.keywords[0])
            console.log("======================teste====================")
            const query = `${content.searchTerm}`//`${content.searchTerm} ${sentence.keywords[0]}`
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

}

module.exports = robot