/**
 * @typedef {Object} User
 * @property {string} id
 * @property {string} name
 * @property {string} email
 * @property {string} role
 * @property {string=} createdAt
 * @property {string=} updatedAt
 */

/**
 * @typedef {Object} Money
 * @property {number} amount
 * @property {string} currency
 */

/**
 * @typedef {number | Money} PriceValue
 */

/**
 * @typedef {Object} Product
 * @property {string} id
 * @property {string} name
 * @property {string} slug
 * @property {string} description
 * @property {PriceValue} price
 * @property {string} imageUrl
 * @property {string[]} tags
 * @property {boolean=} isPublished
 */

export {}; // ESM module placeholder
