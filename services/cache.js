const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');
// const keys = require('../config/keys');

// set up redis connection & promisify the get function
// so that we can use it with async/await
const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.hget = util.promisify(client.hget);

// save an instance of the originial mongoose exec function
// so we can use it later
const exec = mongoose.Query.prototype.exec;

// create a new function called cache
// if we want to use caching then we can call this function
// and pass in an options object
// ex: Blog.find({ _user: req.user.id }).cache({ key: req.user.id });
// we will nest the cached data under the user id, which will be provided
// by in the options object
mongoose.Query.prototype.cache = function(options = {}) {
  this.useCache = true;
  this.hashKey = JSON.stringify(options.key || '');
  return this;
}

// override the exec function with our caching logic
mongoose.Query.prototype.exec = async function() {
  // if we don't want to use caching then just return the original exec function
  if (!this.useCache) {
    return exec.apply(this, arguments);
  }

  // we create a unique key by copying all properties from the query object
  // and also adding the collection name to a new object and then stringifying the object
  // Object.assign() is used to safely copy properties from one object to another
  const key = JSON.stringify(
    // the empty object is the target object that properties will be copied to
    // the 2nd & 3rd arguments are the source objects that properties will be copied from
    Object.assign({}, this.getQuery(), {
      collection: this.mongooseCollection.name
    })
  );

  // see if we have a value for 'key' in redis
  const cacheValue = await client.hget(this.hashKey, key);

  // if we have a cached value then return it
  if (cacheValue) {
    console.log('Serving from cache');
    const doc = JSON.parse(cacheValue);

    // hydrate the JSON object. Meaning turn it back into a mongoose model instance
    // if the cached value is an array then we need to map over it
    // and create a new instance of a mongo model for each object in the array
    return Array.isArray(doc)
      ? doc.map(d => new this.model(d))
      : new this.model(doc);
  }

  // if there is no cached value then issue the query and store the result in redis
  const result = await exec.apply(this, arguments);

  // set value in redis
  // set expiration time to 10 seconds
  client.hset(this.hashKey, key, JSON.stringify(result), 'EX', 10);
  console.log('Serving from MongoDB');
  return result;
}

// clear the cached data for a key
module.exports = {
  clearHash(hashKey) {
    client.del(JSON.stringify(hashKey));
  }
};