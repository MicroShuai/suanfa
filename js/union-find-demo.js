class UnionFind {
    constructor(n) {
        this.parent = Array.from({ length: n }, (_, i) => i);
        this.rank = Array(n).fill(0);
    }

    find(x) {
        if (this.parent[x] !== x) {
            this.parent[x] = this.find(this.parent[x]);
        }
        return this.parent[x];
    }

    union(a, b) {
        const rootA = this.find(a);
        const rootB = this.find(b);
        if (rootA === rootB) return;
        if (this.rank[rootA] < this.rank[rootB]) {
            this.parent[rootA] = rootB;
        } else if (this.rank[rootA] > this.rank[rootB]) {
            this.parent[rootB] = rootA;
        } else {
            this.parent[rootB] = rootA;
            this.rank[rootA]++;
        }
    }

    connected(a, b) {
        return this.find(a) === this.find(b);
    }

    sets() {
        const groups = {};
        for (let i = 0; i < this.parent.length; i++) {
            const root = this.find(i);
            if (!groups[root]) groups[root] = [];
            groups[root].push(i);
        }
        return Object.values(groups);
    }
}

const uf = new UnionFind(10);

function updateDisplay() {
    const setsDiv = document.getElementById('sets');
    setsDiv.textContent = uf.sets().map((set, idx) => `集合 ${idx}: {${set.join(', ')}}`).join('\n');
}

function handleUnion() {
    const a = parseInt(document.getElementById('unionA').value, 10);
    const b = parseInt(document.getElementById('unionB').value, 10);
    if (Number.isInteger(a) && Number.isInteger(b)) {
        uf.union(a, b);
        updateDisplay();
    }
}

function handleFind() {
    const x = parseInt(document.getElementById('findX').value, 10);
    if (Number.isInteger(x)) {
        const root = uf.find(x);
        alert(`元素 ${x} 的根是 ${root}`);
        updateDisplay();
    }
}

document.getElementById('unionBtn').addEventListener('click', handleUnion);
document.getElementById('findBtn').addEventListener('click', handleFind);

updateDisplay();
