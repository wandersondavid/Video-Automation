const algorithmia = require('algorithmia')
const sentenceBoundaryDetection = require('sbd')

async function robot(content) {
    await fetchContentFromWikipidia(content)
    sanitizeContent(content);
    breakContentIntoSenteces(content);

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
    function breakContentIntoSenteces(content){
        content.sentences = []

        const sentences = sentenceBoundaryDetection.sentences(content.sourceContentSanitized);
        sentences.forEach((sentence)=>{
            content.sentences.push({
                text: sentence,
                keywords: [],
                images: []
            })
        })
    }
}
module.exports = robot;