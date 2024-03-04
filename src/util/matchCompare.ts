const MATCH_TYPE_ORDER = ['p', 'qm', 'sf', 'f']
const TYPE_REGEX = /^[^\d]*/
const TYPE_NUMBER_REGEX = /([\d]+)(?=.)/
const MATCH_NUMBER_REGEX = /([\d]+)$/

export default function matchCompare(a: string, b: string): number {
    const idA = a.includes('_') ? a.substring(a.indexOf('_') + 1) : a;
    const idB = b.includes('_') ? b.substring(b.indexOf('_') + 1) : b;

    return (
        MATCH_TYPE_ORDER.indexOf(idA.match(TYPE_REGEX)?.[0] || '') - MATCH_TYPE_ORDER.indexOf(idB.match(TYPE_REGEX)?.[0] || '') ||
        (parseInt(idA.match(TYPE_NUMBER_REGEX)?.[0] || '0') - parseInt(idB.match(TYPE_NUMBER_REGEX)?.[0] || '0')) ||
        (parseInt(idA.match(MATCH_NUMBER_REGEX)?.[0] || '0') - parseInt(idB.match(MATCH_NUMBER_REGEX)?.[0] || '0')) ||
        console.log("MatchCompare: Unhandled case for", a, b, "returning 0.")||0
    );
}