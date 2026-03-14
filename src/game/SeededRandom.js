export class SeededRandom {
    constructor(seed = null) {
        if (seed === null || seed === '') {
            this.seed = Math.floor(Math.random() * 0x7fffffff);
        } else {
            this.seed = this.hashString(seed);
        }
        this.current = this.seed;
    }

    hashString(str) {
        let hash = 5381;
        for (let i = 0; i < str.length; i++) {
            hash = ((hash << 5) + hash) ^ str.charCodeAt(i);
        }
        return Math.abs(hash) % 0x7fffffff || 1;
    }

    next() {
        this.current ^= this.current << 13;
        this.current ^= this.current >> 17;
        this.current ^= this.current << 5;
        return (this.current >>> 0) / 0x100000000;
    }

    nextInt(max) {
        return Math.floor(this.next() * max);
    }
}
