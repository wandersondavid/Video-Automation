const algorithmia = require('algorithmia')
// const algorithmiaApiKey = require('../credentio/algorithmia.json')
// console.log("**************",algorithmiaApiKey.apiKey,"***************************")
function robot(content) {
    fetchContentFromWikipidia(content)
    // sanitizeContent(content);
    // breakContentIntoSenteces(content);

    async function fetchContentFromWikipidia(content){

        const algorithmiaAuthenticated = algorithmia('simY1VTxIaELpQgOV32Cn1Mm1xp1');
        const wikipediaAlgorithm = algorithmiaAuthenticated.algo('web/WikipediaParser/0.1.2');
        const wikipediaResponde = await wikipediaAlgorithm.pipe(content.searchTerm);
        const wikipediaContent = wikipediaResponde.get();

        console.log(wikipediaContent);
    
    }

}
module.exports = robot;