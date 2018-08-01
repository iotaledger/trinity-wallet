/* eslint-disable no-console */
const FigmaParse = require('figma-parser');
const fs = require('fs');

if (!process.env.FIGMAKEY) {
    console.log('Missing env variable FIGMAKEY');
}

const template = `export default { {{colors}}
{{set}}: { {{values}}{{name}}: '{{value}}',{{/values}} },{{/colors}}
};
`;

const figmaFiles = [
    {
        title: 'Default',
        fileId: 'mnDqmOTqtDyUReD9Cy1MkC',
    },
    {
        title: 'Mint',
        fileId: '3XHBInzqPJprPLzS6e7Uq3',
    },
    {
        title: 'Electric',
        fileId: 'PLHGlooUrbz2T8IGycBBrU',
    },
];

(async () => {
    const figma = new FigmaParse({
        token: process.env.FIGMAKEY,
    });

    for (let i = 0; i < figmaFiles.length; i++) {
        const file = figmaFiles[i];

        const output = await figma.parse(file.fileId, template).catch(() => {
            return null;
        });

        if (output) {
            fs.writeFile(`${__dirname}/themes/${file.title}.js`, output, (err) => {
                if (err) {
                    throw Error('Error writting template file');
                }
                console.log(`Template "${file.title}" synced`);
            });
        } else {
            throw Error(`Error parsing template "${file.title}`);
        }
    }
})().catch(() => {
    throw Error('Error parsing template files');
});
