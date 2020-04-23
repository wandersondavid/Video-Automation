const algorithmia = require('algorithmia')
const sentenceBoundaryDetection = require('sbd')
const watsonApiKey = require('../credentials/watson-nlu.json');
const algorithmiaApiKey = require('../credentials/algorithimia.json')
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js')
const state = require('./state');
const nlu = new NaturalLanguageUnderstandingV1({
    iam_apikey: watsonApiKey.apikey,
    version: '2018-11-16',
    ulr: "https://gateway-lon.watsonplatform.net/natural-language-understanding/api/v1/analyze?"
})


async function robot() {
    const content = state.load()

    await fetchContentFromWikipidia(content)
    sanitizeContent(content);
    breakContentIntoSenteces(content);
    limitMamimunSenteces(content)
    await keywordsOfAllSentences(content)

    state.save(content)
    async function fetchContentFromWikipidia(content) {

        const algorithmiaAuthenticated = algorithmia(algorithmiaApiKey.apikey);
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2');
        const wikipediaResponde = await wikipediaAlgorithm.pipe(content.searchTerm);
        const wikipediaContent = wikipediaResponde.get();

        content.sourceContentOriginal = wikipediaContent.content

    }

    function sanitizeContent(content) {
        const withoutBlankLinesAndMankLines = removeBlankLinesandMarkdom(content.sourceContentOriginal);

        content.sourceContentSanitized = withoutBlankLinesAndMankLines
        function removeBlankLinesandMarkdom(text) {
            const allLines = text.split('\n');

            const withoutBlankLinesMarkdon = allLines.filter((line) => {
                if (line.trim().length === 0 || line.trim().startsWith('='))
                    return false;
                return true;
            })

            return withoutBlankLinesMarkdon.join(' ');

        }
    }

    function breakContentIntoSenteces(content) {
        content.sentences = []

        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized);
        sentences.forEach((sentence) => {
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
    }

    function limitMamimunSenteces(content) {
        content.sentences = content.sentences.slice(0, content.maximumSentences)
    }

    async function keywordsOfAllSentences(content){
        for (const sentence of content.sentences){
            sentence.keywords = await watsonAndReturnKeywords(sentence.text)
        }
    }

    async function watsonAndReturnKeywords(sentence) {
        return new Promise((resolve, rejete) => {
            nlu.analyze({
                text: sentence,
                features: {
                    keywords: {}
                }
            }, (error, response) => {
                if (error) {
                    throw error
                }
                const keywords = response.keywords.map((keywords) => {
                    return keywords.text
                })
                resolve(keywords)
            })
        })
    }
}
module.exports = robot;