const latestAddressObject = {
    address: 'DMBXMBUXTNBMQBWKENUROZ9OFVFABPETLAQPZSWTPDAJABOLQGKIQQHP9VQSRQ9LTOTGCYUVGNIJIPYOX',
    balance: 0,
    index: 9,
    checksum: 'UAPBKXRAC',
    spent: { local: false, remote: false },
};

const addressData = [
    {
        address: 'QVMPTRCCXYHUORXY9BLOZAFGVHRMRLPWFBX9DTWEXI9CNCKRWTNAZUPECVQUHGBTVIFNAWM9GMVDGJVEB',
        balance: 0,
        index: 0,
        checksum: 'PKBRNQVCA',
        spent: { local: true, remote: true },
    },
    {
        address: 'EGESUXEIFAHIRLP9PB9YQJUPNWNWVDBEZAIYWUFKYKHTAHDHRVKSBCYYRJOUJSRBZKUTJGJIIGUGLDPVX',
        balance: 0,
        index: 1,
        checksum: 'BZIF9ZEBC',
        spent: { local: true, remote: true },
    },
    {
        address: 'D9QCAHCWFN9BCFNNSPNGFVUEUSKBX9XQEKSIRRWXHHBQBJMEEI9ATVWNPJRLO9ETRPCBIRNQBLDMBUYVW',
        balance: 0,
        index: 2,
        checksum: 'NXL99BCPW',
        spent: { local: true, remote: false },
    },
    {
        address: 'OXCGKSXOVOFR9UMWGZMYHPWGVSSDZOTQAIKVMHVEHJBFPUNEZZKTISCKVVOVUGDHXLSVFIEWMMXGVYHOD',
        balance: 0,
        index: 3,
        checksum: 'FDPMAF9UD',
        spent: { local: true, remote: false },
    },
    {
        address: 'RRHMYUP9RNBBNAORNMNHYTLJZWXCWKOYV9TVQPGPKDNTTSTVLCXCDKDKPILANYIOPOHBTNAXZ9IUBPQCC',
        balance: 0,
        index: 4,
        checksum: 'YBBRFADGD',
        spent: { local: false, remote: false },
    },
    {
        address: 'FXWIQUQWEATQQGUIWQTVOBHQBIEYCCYKZSNNAYBBILGA9ZRQKYQVPZKDBO9W9AUZBBGEDKNTTZQECBIBX',
        balance: 100,
        index: 5,
        checksum: 'YTZTLCYBW',
        spent: { local: false, remote: true },
    },
    {
        address: 'ZBQWFOZVCOURPSVBNIBWOBQNRQXDBESSEJWWETTWWMGSJDUJLITMJYYBM9ZUFXTYTTPSGDTVBNIKLKXJA',
        balance: 0,
        index: 6,
        checksum: 'BKRYGOJYC',
        spent: { local: false, remote: true },
    },
    {
        address: 'VOVTUPNCVSEYOGYXPER9RRHPICCMTBD9DNTJMBZPCUNXHHYTZQOAVJBBIGRCMBXRVRLHVROE9OMNDKTVW',
        balance: 150,
        index: 7,
        checksum: 'MLUGSLZRA',
        spent: { local: false, remote: false },
    },
    {
        address: 'JEFTSJGSNYGDSYHTCIZF9WXPWGHOPKRJSGXGNNZIUJUZGOFEGXRHPJVGPUZNIZMQ9QSNAITO9QUYQZZEC',
        balance: 10,
        index: 8,
        checksum: 'RHAFCPMZY',
        spent: { local: false, remote: false },
    },
    latestAddressObject,
];

const latestAddressWithoutChecksum =
    'DMBXMBUXTNBMQBWKENUROZ9OFVFABPETLAQPZSWTPDAJABOLQGKIQQHP9VQSRQ9LTOTGCYUVGNIJIPYOX';
const latestAddressChecksum = 'UAPBKXRAC';
const latestAddressWithChecksum = `${latestAddressWithoutChecksum}${latestAddressChecksum}`;
const latestAddressIndex = 9;
const latestAddressBalance = 0;

const balance = 260;

export default addressData.map((addressObject) => addressObject.address);

export {
    addressData,
    latestAddressWithoutChecksum,
    latestAddressChecksum,
    latestAddressWithChecksum,
    latestAddressIndex,
    latestAddressBalance,
    latestAddressObject,
    balance,
};
