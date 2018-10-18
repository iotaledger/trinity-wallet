import assign from 'lodash/assign';
import map from 'lodash/map';
import uniqBy from 'lodash/uniqBy';
import {
    confirmedZeroValueTrytes,
    confirmedValueTrytes,
    unconfirmedValueTrytes,
    failedTrytesWithCorrectTransactionHashes,
    failedTrytesWithIncorrectTransactionHashes,
} from './trytes';
import { iota } from '../../libs/iota';

const defaultProps = {
    persistence: false,
    broadcasted: true,
};

const _convertToTransactions = (trytes, props = defaultProps) =>
    trytes.map((tryteString) => assign({}, iota.utils.transactionObject(tryteString), props));

const confirmedZeroValueTransactions = _convertToTransactions(
    confirmedZeroValueTrytes,
    assign({}, defaultProps, { persistence: true }),
);
const confirmedValueTransactions = _convertToTransactions(
    confirmedValueTrytes,
    assign({}, defaultProps, { persistence: true }),
);
const unconfirmedValueTransactions = _convertToTransactions(unconfirmedValueTrytes);
const failedTransactionsWithCorrectTransactionHashes = _convertToTransactions(
    failedTrytesWithCorrectTransactionHashes,
    assign({}, defaultProps, { broadcasted: false }),
);
const failedTransactionsWithIncorrectTransactionHashes = _convertToTransactions(
    failedTrytesWithIncorrectTransactionHashes,
    assign({}, defaultProps, { broadcasted: false }),
);

const normalisedTransactions = {
    LSOSKNQPHHOKHAHCTJJKJNTYQJJYQMOCQXGBJSEXHBFEGORLHHUGTWTAIHKJIYVKNALOOVNJAEWIYIJRB: {
        bundle: 'LSOSKNQPHHOKHAHCTJJKJNTYQJJYQMOCQXGBJSEXHBFEGORLHHUGTWTAIHKJIYVKNALOOVNJAEWIYIJRB',
        timestamp: 1539991308,
        attachmentTimestamp: 1539991311255,
        broadcasted: false,
        inputs: [],
        outputs: [
            {
                address: 'ETMNPSYWCRTODOE9EHSCABKRFQBBYVENDHMZRPLXKOJOMMAUE9PAAOGVRWLB9G9UPMLSPZJXZPPJ9UTAC',
                value: 2,
                hash: 'JTBWOTAADTOSUQDQYLS9NW9NCIM9ZQGICGXWUAVLEUUZKJYNPMFTDDBBCFBX9OXWMGQOEVMXNMHXKOQNE',
                currentIndex: 0,
                lastIndex: 2,
                checksum: 'E9SMAQIJC',
            },
        ],
        persistence: false,
        incoming: true,
        transferValue: 0,
        message: 'Trinity test transaction eight (failed)',
        tailTransactions: [
            {
                hash: 'JTBWOTAADTOSUQDQYLS9NW9NCIM9ZQGICGXWUAVLEUUZKJYNPMFTDDBBCFBX9OXWMGQOEVMXNMHXKOQNE',
                attachmentTimestamp: 1539991311255,
            },
        ],
    },
    YNPOOWQDBCZ9LFIVGDKOXXCKLTDG9RXWIAHFKHSODZLCNNYIWHEAZELYFIAZBKYGIEAG9XBY9WAKGSDJC: {
        bundle: 'YNPOOWQDBCZ9LFIVGDKOXXCKLTDG9RXWIAHFKHSODZLCNNYIWHEAZELYFIAZBKYGIEAG9XBY9WAKGSDJC',
        timestamp: 1539990648,
        attachmentTimestamp: 1539990651939,
        broadcasted: false,
        inputs: [],
        outputs: [
            {
                address: 'THSCQHSPXS9LVTDFDHHFHHUYBKKGGOZHKHGDRYOIGYG9HPEMQLKKZ9DVRRB9NMUTZYGBHTVDGEEZBLLJY',
                value: 1,
                hash: 'ULVGVNQB9QBUEVHZZUWFIEFXFCODGMWQUKJFCA9QZOQPESMWGEVOWEYKIGPGUGUBI9DGIHBTUOPWZ9999',
                currentIndex: 0,
                lastIndex: 2,
                checksum: 'TVHXVSRHD',
            },
        ],
        persistence: false,
        incoming: true,
        transferValue: 0,
        message: 'Trinity test transaction six (failed)',
        tailTransactions: [
            {
                hash: 'ULVGVNQB9QBUEVHZZUWFIEFXFCODGMWQUKJFCA9QZOQPESMWGEVOWEYKIGPGUGUBI9DGIHBTUOPWZ9999',
                attachmentTimestamp: 1539990651939,
            },
        ],
    },
    FERK9XBVDBZHOJKRIJ9UUQEOWHG9IZYRWDJ9HZ9SFSGRHTYGHIOVZIIKFOGQJAHZJFDKVBBSHCRKUOIC9: {
        bundle: 'FERK9XBVDBZHOJKRIJ9UUQEOWHG9IZYRWDJ9HZ9SFSGRHTYGHIOVZIIKFOGQJAHZJFDKVBBSHCRKUOIC9',
        timestamp: 1539990265,
        attachmentTimestamp: 1539990267270,
        broadcasted: true,
        inputs: [],
        outputs: [
            {
                address: 'UKYIRCMASLAWZBNZMNHFQVLKULZTVOQGEJZIOPAAJENGSXJUIBEARZVB99EXRGKYU9UHDIWQR9NZNNXPW',
                value: 5,
                hash: 'IXZUUKVWLWPWWTJWGSAO9GUVVDCEYOUNJRTPPDQVAJQKGTLSZHDHUPGBNJJPZHZADJENZQ9MGQVR99999',
                currentIndex: 0,
                lastIndex: 2,
                checksum: '9JGTWKFHW',
            },
        ],
        persistence: false,
        incoming: true,
        transferValue: 0,
        message: 'Trinity test transaction four',
        tailTransactions: [
            {
                hash: 'IXZUUKVWLWPWWTJWGSAO9GUVVDCEYOUNJRTPPDQVAJQKGTLSZHDHUPGBNJJPZHZADJENZQ9MGQVR99999',
                attachmentTimestamp: 1539990267270,
            },
        ],
    },
    VGPSTOJHLLXGCOIQJPFIGGPYLISUNBBHDLQUINNKNRKEDQZLBTKCT9KJELDEXSQNPSQDSPHWQICTJFLCB: {
        bundle: 'VGPSTOJHLLXGCOIQJPFIGGPYLISUNBBHDLQUINNKNRKEDQZLBTKCT9KJELDEXSQNPSQDSPHWQICTJFLCB',
        timestamp: 1539990059,
        attachmentTimestamp: 1539990062087,
        broadcasted: true,
        inputs: [],
        outputs: [
            {
                address: 'EGESUXEIFAHIRLP9PB9YQJUPNWNWVDBEZAIYWUFKYKHTAHDHRVKSBCYYRJOUJSRBZKUTJGJIIGUGLDPVX',
                value: 5,
                hash: 'AWHIUDGXYYMKHGOJMDTMYPAOZHWCDUWEXH9HCNWPGXEXTJLQQHELQYZLCUC9UDNUHQUFGLKGNKENZ9999',
                currentIndex: 0,
                lastIndex: 3,
                checksum: 'BZIF9ZEBC',
            },
        ],
        persistence: false,
        incoming: true,
        transferValue: 5,
        message: 'Trinity test transaction three',
        tailTransactions: [
            {
                hash: 'AWHIUDGXYYMKHGOJMDTMYPAOZHWCDUWEXH9HCNWPGXEXTJLQQHELQYZLCUC9UDNUHQUFGLKGNKENZ9999',
                attachmentTimestamp: 1539990062087,
            },
        ],
    },
    SAVG9OACQFXYIUDISAYV9HZTVVJCMCZNGJXZYOESIVIRU99RKJDAIJTRAQCKCYAOJH9NV9DEVYGSSDLAC: {
        bundle: 'SAVG9OACQFXYIUDISAYV9HZTVVJCMCZNGJXZYOESIVIRU99RKJDAIJTRAQCKCYAOJH9NV9DEVYGSSDLAC',
        timestamp: 1539989762,
        attachmentTimestamp: 1539989765314,
        broadcasted: true,
        inputs: [],
        outputs: [
            {
                address: 'KHZJOKSEFOYTUQSJ9FFDQMGMEVKU9IIGVCSAKC9FTYO9YXFRMKJFVNVQTLENANRGLTGWJFPAGNSF99LAA',
                value: 1,
                hash: 'GERAGOPQB9ULOVZJWJWQQ9ONFRNAIECCAHCMIGDOWSLJOKKDFGBFYZYGMU9UVEW9DOMKDE9VPSLJZ9999',
                currentIndex: 0,
                lastIndex: 2,
                checksum: 'EPYJOBTWY',
            },
        ],
        persistence: true,
        incoming: true,
        transferValue: 0,
        message: 'Trinity test transaction two',
        tailTransactions: [
            {
                hash: 'GERAGOPQB9ULOVZJWJWQQ9ONFRNAIECCAHCMIGDOWSLJOKKDFGBFYZYGMU9UVEW9DOMKDE9VPSLJZ9999',
                attachmentTimestamp: 1539989765314,
            },
        ],
    },
    IHVLVHCNIPZGDAO9VYAOTDBVKRETZX9XP9AUSTWHSXEJLPLFSGIBFLMNCYBRAFEYAVHY9IIPRGZOYEGAY: {
        bundle: 'IHVLVHCNIPZGDAO9VYAOTDBVKRETZX9XP9AUSTWHSXEJLPLFSGIBFLMNCYBRAFEYAVHY9IIPRGZOYEGAY',
        timestamp: 1539988167,
        attachmentTimestamp: 1539988169342,
        broadcasted: true,
        inputs: [],
        outputs: [
            {
                address: 'QVMPTRCCXYHUORXY9BLOZAFGVHRMRLPWFBX9DTWEXI9CNCKRWTNAZUPECVQUHGBTVIFNAWM9GMVDGJVEB',
                value: 1,
                hash: 'FQVZNSOUKKSQPCFWCBJCSMAZNAGGVFROELHOOZGFXUVZUWL9TXIQGSUZORIUXJSBKKSUCWNPPWFGA9999',
                currentIndex: 0,
                lastIndex: 3,
                checksum: 'PKBRNQVCA',
            },
        ],
        persistence: true,
        incoming: true,
        transferValue: 1,
        message: 'Trinity test transaction one',
        tailTransactions: [
            {
                hash: 'FQVZNSOUKKSQPCFWCBJCSMAZNAGGVFROELHOOZGFXUVZUWL9TXIQGSUZORIUXJSBKKSUCWNPPWFGA9999',
                attachmentTimestamp: 1539988169342,
            },
        ],
    },
    AGLVISDEBEYCZVIQFVHSSZISEZDCPKQJNQIHLQASIGHJWEJPWLHQUTPDQZUEZQIBHEDY9SRIBGJJEQQLZ: {
        bundle: 'AGLVISDEBEYCZVIQFVHSSZISEZDCPKQJNQIHLQASIGHJWEJPWLHQUTPDQZUEZQIBHEDY9SRIBGJJEQQLZ',
        timestamp: 1539992386,
        attachmentTimestamp: 1539992389860,
        inputs: [],
        outputs: [
            {
                address: 'RRHMYUP9RNBBNAORNMNHYTLJZWXCWKOYV9TVQPGPKDNTTSTVLCXCDKDKPILANYIOPOHBTNAXZ9IUBPQCC',
                value: 0,
                hash: 'SATTUQCNMVTAIADHRQGC9SINCOYHDFQ9CZLTDESRKTWDJICSVLGRQVDFTHBDEACYFJURHBCLJPIBZ9999',
                currentIndex: 0,
                lastIndex: 0,
                checksum: 'YBBRFADGD',
            },
        ],
        persistence: true,
        broadcasted: true,
        incoming: true,
        transferValue: 0,
        message: 'Trinity test zero value one',
        tailTransactions: [
            {
                hash: 'SATTUQCNMVTAIADHRQGC9SINCOYHDFQ9CZLTDESRKTWDJICSVLGRQVDFTHBDEACYFJURHBCLJPIBZ9999',
                attachmentTimestamp: 1539992389860,
            },
        ],
    },
};

const promotableBundleHashes = map(
    uniqBy([...unconfirmedValueTransactions], 'bundle'),
    (transaction) => transaction.bundle,
);

export default [
    ...confirmedZeroValueTransactions,
    ...confirmedValueTransactions,
    ...unconfirmedValueTransactions,
    ...failedTransactionsWithCorrectTransactionHashes,
    ...failedTransactionsWithIncorrectTransactionHashes,
];

export {
    confirmedZeroValueTransactions,
    confirmedValueTransactions,
    unconfirmedValueTransactions,
    failedTransactionsWithCorrectTransactionHashes,
    failedTransactionsWithIncorrectTransactionHashes,
    normalisedTransactions,
    promotableBundleHashes,
};
