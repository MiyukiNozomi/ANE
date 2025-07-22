export class SimplexNoise2D {
    grad3: number[][];
    perm: number[];
    p: number[];
    public constructor() {
        this.grad3 = [
            [1, 1], [-1, 1], [1, -1], [-1, -1],
            [1, 0], [-1, 0], [1, 0], [-1, 0],
            [0, 1], [0, -1], [0, 1], [0, -1],
        ];

        this.p = [];
        for (let i = 0; i < 256; i++) this.p[i] = Math.floor(Math.random() * 256);
        this.perm = [];
        for (let i = 0; i < 512; i++) this.perm[i] = this.p[i & 255];
    }

    public dot(g: number[], x: number, y: number) {
        return g[0] * x + g[1] * y;
    }

    public evaluate(xin: number, yin: number) {
        const F2 = 0.5 * (Math.sqrt(3) - 1);
        const G2 = (3 - Math.sqrt(3)) / 6;

        let n0, n1, n2;

        // Skew input space to determine simplex cell
        const s = (xin + yin) * F2;
        const i = Math.floor(xin + s);
        const j = Math.floor(yin + s);

        const t = (i + j) * G2;
        const X0 = i - t;
        const Y0 = j - t;
        const x0 = xin - X0;
        const y0 = yin - Y0;

        // Determine which simplex we're in
        let i1, j1;
        if (x0 > y0) {
            i1 = 1; j1 = 0;
        } else {
            i1 = 0; j1 = 1;
        }

        const x1 = x0 - i1 + G2;
        const y1 = y0 - j1 + G2;
        const x2 = x0 - 1 + 2 * G2;
        const y2 = y0 - 1 + 2 * G2;

        // Hashed gradient indices
        const ii = i & 255;
        const jj = j & 255;
        const gi0 = this.perm[ii + this.perm[jj]] % 12;
        const gi1 = this.perm[ii + i1 + this.perm[jj + j1]] % 12;
        const gi2 = this.perm[ii + 1 + this.perm[jj + 1]] % 12;

        // Noise contributions from each corner
        const t0 = 0.5 - x0 * x0 - y0 * y0;
        n0 = t0 < 0 ? 0 : Math.pow(t0, 4) * this.dot(this.grad3[gi0], x0, y0);

        const t1 = 0.5 - x1 * x1 - y1 * y1;
        n1 = t1 < 0 ? 0 : Math.pow(t1, 4) * this.dot(this.grad3[gi1], x1, y1);

        const t2 = 0.5 - x2 * x2 - y2 * y2;
        n2 = t2 < 0 ? 0 : Math.pow(t2, 4) * this.dot(this.grad3[gi2], x2, y2);

        // Final noise value in [-1,1]
        return 70 * (n0 + n1 + n2);
    }
}