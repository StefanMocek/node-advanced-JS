const mongoose = require('mongoose');

const exec = mongoose.Query.prototype.exec;

mongoose.Query.prototype.exec = function () {
    // check if this approach works
    console.log('I am running a query');
    return exec.apply(this, arguments)
}