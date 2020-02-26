const readline = require('readline-sync')

function start(){
    const content = {}

    content.searchTerm = askAndReturnSerachTerm()

    function askAndReturnSerachTerm(){
        return readline.question('Type a Wikipedia search term: ')
    }

    console.log(content)
}
start()