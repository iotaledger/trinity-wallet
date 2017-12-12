import { createRandomSeed } from './src/libs/util';

const map = {};

for (let i = 0; i < 1000000; i++) {
    createRandomSeed()
        .split('')
        .forEach(letter => {
            if (!map[letter]) {
                map[letter] = 1;
            } else {
                map[letter] = map[letter] + 1;
            }
        });
}

console.log(map);
