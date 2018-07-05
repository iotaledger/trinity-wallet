/*eslint-disable*/
'use strict';

Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.randomiseSeedCharacter = exports.generateNewSeed = undefined;

var _utils = require('./iota/utils');

var generateNewSeed = exports.generateNewSeed = function generateNewSeed(randomBytesFn) {
    var charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
    var seed = '';
    return randomBytesFn(100).then(function (bytes) {
        Object.keys(bytes).forEach(function (key) {
            if (bytes[key] < 243 && seed.length < _utils.MAX_SEED_LENGTH) {
                var randomNumber = bytes[key] % 27;
                var randomLetter = charset.charAt(randomNumber);
                seed += randomLetter;
            }
        });
        return seed;
    });
};

var randomiseSeedCharacter = exports.randomiseSeedCharacter = function randomiseSeedCharacter(seed, charId, randomBytesFn) {
    var charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
    return randomBytesFn(5).then(function (bytes) {
        var i = 0;
        var id = charId;
        var updatedSeed = seed;
        Object.keys(bytes).forEach(function (key) {
            if (bytes[key] < 243 && i < 1) {
                var randomNumber = bytes[key] % 27;
                var randomLetter = charset.charAt(randomNumber);
                var substr1 = updatedSeed.substr(0, id);
                id++;
                var substr2 = updatedSeed.substr(id, 80);
                updatedSeed = substr1 + randomLetter + substr2;
                i++;
            }
        });
        return updatedSeed;
    });
};
