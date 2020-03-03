const algorithmia = require('algorithmia')
const sentenceBoundaryDetection = require('sbd')
// const watsonApiKey = require('../credentials/watson-nlu').apiKey
const NaturalLanguageUnderstandingV1 = require('watson-developer-cloud/natural-language-understanding/v1.js')


const watsonApiKey = {
    "apikey": "ezQVz6JQu3d8MHXfTy9HcXCyxewddNBFqAJpFfYMA1Rr",
    "iam_apikey_description": "Auto-generated for key 62c3275d-5a1e-4316-b864-6ebf3136cf35",
    "iam_apikey_name": "Auto-generated service credentials",
    "iam_role_crn": "crn:v1:bluemix:public:iam::::serviceRole:Manager",
    "iam_serviceid_crn": "crn:v1:bluemix:public:iam-identity::a/296ccff6b56e44eeb75e92f485031e34::serviceid:ServiceId-995a39a5-0fa9-442f-9b1a-1cf787e5a51b",
    "url": "https://api.us-south.natural-language-understanding.watson.cloud.ibm.com/instances/a380a6e0-6c2b-489c-b78f-bfa06d925967"
}

const nlu = new NaturalLanguageUnderstandingV1({
    iam_apikey: watsonApiKey.apikey,
    version: '2018-11-16',
    ulr: "https://gateway-lon.watsonplatform.net/natural-language-understanding/api/v1/analyze?"
})

// nlu.analyze({
//     text: `Search the world's information, including webpages, images, videos and more. Google has many special features to help you find exactly what you're looking`,
//     features: {
//         keywords: {}
//     }
// }, (error, response) => {
//     if (error) {
//         throw error
//     }
//     console.log(JSON.stringify(response, null, 4))
//     process.exit(0)
// })

async function robot(content) {
    await fetchContentFromWikipidia(content)
    sanitizeContent(content);
    breakContentIntoSenteces(content);
    limitMamimunSenteces(content)
    await keywordsOfAllSentences(content)

    async function fetchContentFromWikipidia(content) {

        const algorithmiaAuthenticated = algorithmia('simY1VTxIaELpQgOV32Cn1Mm1xp1');
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2');
        const wikipediaResponde = await wikipediaAlgorithm.pipe(content.searchTerm);
        const wikipediaContent = wikipediaResponde.get();

        content.sourceContentOriginal = wikipediaContent.content

    }
    function sanitizeContent(content) {
        const withoutBlankLinesAndMankLines = removeBlankLinesandMarkdom(content.sourceContentOriginal);

        // console.log(withoutBlankLinesAndMankLines);
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