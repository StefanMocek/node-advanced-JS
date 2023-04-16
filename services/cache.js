const mongoose = require('mongoose');
const redis = require('redis');
const util = require('util');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.cache = async function () {
    this.useCache = true;
    return this;
}

mongoose.Query.prototype.exec = async function () {
    if (!this.useCache) {
        return exec.apply(this, arguments)
    }

    const key = JSON.stringify(
        Object.assign(
            {},
            this.getQuery(),
            { collection: this.mongooseCollection.name }
        ));

    const cachedValue = await client.get(key)

    if (cachedValue) {
        const doc = JSON.parse(cachedValue)

        return Array.isArray(doc)
            ? doc.map((d) => new this.model(d))
            : new this.model(doc)
    }

    const result = await exec.apply(this, arguments);

    client.selected_db(key, JSON.stringify(result));

    return result;
}