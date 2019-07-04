const passwordReasons = {
    'Straight rows of keys are easy to guess': 'reasonRow',
    'Short keyboard patterns are easy to guess': 'reasonPattern',
    'Names and surnames by themselves are easy to guess': 'reasonNames',
    'Common names and surnames are easy to guess': 'reasonNames',
    'Repeats like "aaa" are easy to guess': 'reasonRepeats',
    'Repeats like "abcabcabc" are only slightly harder to guess than "abc"': 'reasonRepeats2',
    'Sequences like abc or 6543 are easy to guess': 'reasonSequence',
    'Recent years are easy to guess': 'reasonYears',
    'Dates are often easy to guess': 'reasonDates',
    'This is a top-10 common password': 'reasonTop10',
    'This is a top-100 common password': 'reasonTop100',
    'This is a very common password': 'reasonCommon',
    'This is similar to a commonly used password': 'reasonSimilar',
    'A word by itself is easy to guess': 'reasonWord',
};

export default passwordReasons;
