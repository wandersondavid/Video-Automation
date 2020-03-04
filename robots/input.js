const readline = require('readline-sync')
const state = require('./state.js')

function robot() {
    const content = {
        maximumSentences: 7
    };

    content.searchTerm = askAndReturnSerachTerm();
    content.prefix = askAndReturnPrefix();
    state.save(content)

    function askAndReturnSerachTerm() {
        return readline.question('Type a Wikipedia search term: ');
    }

    function askAndReturnPrefix() {
        const prefixes = ['Who is', 'What is', 'The history of'];
        const selectedPrefixIndex = readline.keyInSelect(prefixes, 'Choose on option: ')
        const selectedPrefixText = prefixes[selectedPrefixIndex]
        return selectedPrefixText
    }
}
module.exports = robot