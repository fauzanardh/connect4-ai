class TranspositionTable {
    constructor() {
        this.T = new Array(56).fill({key: 0n, val: 0});
    }

    reset() {
        this.T = new Array(56).fill({key: 0n, val: 0});
    }

    put(key, val) {
        const i = this.index(key);
        this.T[i].key = key;
        this.T[i].val = val;
    }

    get(key) {
        const i = this.index(key);
        if (this.T[i].key === key)
            return this.T[i].val;
        else
            return 0;
    }

    /* "Private" Functions */
    index(key) {
        // eslint-disable-next-line no-undef
        return key % BigInt(this.T.length);
    }
}

export default TranspositionTable;
