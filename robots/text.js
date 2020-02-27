function robot(content) {
    fetchContentFromWikipedia(content)
    sanitizeContent(content);
    breakContentIntoSenteces(content)
}
module.exports = robot;