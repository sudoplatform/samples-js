const PostalMime = require('postal-mime/dist/node').postalMime.default

/**
 * The purpose of this module is to wrap the parser function of the
 * `postal-mime` package and add types to the resulting data (as this
 * package is JS-only and does not include any type definitions).
 */
module.exports = {
  parseMessage: async (email) => {
    const parser = new PostalMime()
    return await parser.parse(email)
  },
}
