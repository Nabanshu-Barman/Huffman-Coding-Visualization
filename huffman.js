// ===== MIN-HEAP (Priority Queue) =====
class MinHeap {
  constructor() { this.arr = []; this.size = 0; }

  _parent(i) { return Math.floor((i - 1) / 2); }
  _left(i)   { return 2 * i + 1; }
  _right(i)  { return 2 * i + 2; }

  _swap(i, j) {
    [this.arr[i], this.arr[j]] = [this.arr[j], this.arr[i]];
  }

  _heapifyDown(i) {
    let smallest = i;
    const l = this._left(i), r = this._right(i);
    if (l < this.size && this.arr[l].freq < this.arr[smallest].freq) smallest = l;
    if (r < this.size && this.arr[r].freq < this.arr[smallest].freq) smallest = r;
    if (smallest !== i) { this._swap(i, smallest); this._heapifyDown(smallest); }
  }

  _heapifyUp(i) {
    while (i > 0 && this.arr[i].freq < this.arr[this._parent(i)].freq) {
      this._swap(i, this._parent(i));
      i = this._parent(i);
    }
  }

  insert(node) {
    this.arr[this.size] = node;
    this.size++;
    this._heapifyUp(this.size - 1);
  }

  extractMin() {
    const top = this.arr[0];
    this.size--;
    this.arr[0] = this.arr[this.size];
    this.arr.length = this.size;
    this._heapifyDown(0);
    return top;
  }

  buildFromArray(nodes) {
    this.arr = nodes.slice();
    this.size = nodes.length;
    for (let i = Math.floor(this.size / 2) - 1; i >= 0; i--) this._heapifyDown(i);
  }
}

// ===== NODE =====
function createNode(ch, freq, left = null, right = null) {
  return { ch, freq, left, right };
}

// ===== BUILD TREE (mirrors C code) =====
function buildTree(freq) {
  const heap = new MinHeap();
  const nodes = [];
  for (let i = 0; i < 256; i++) {
    if (freq[i] > 0) nodes.push(createNode(String.fromCharCode(i), freq[i]));
  }
  heap.buildFromArray(nodes);

  // Edge case: single unique char
  if (heap.size === 1) {
    const only = heap.extractMin();
    const root = createNode('$', only.freq, only, null);
    return root;
  }

  while (heap.size > 1) {
    const left  = heap.extractMin();
    const right = heap.extractMin();
    const merged = createNode('$', left.freq + right.freq, left, right);
    heap.insert(merged);
  }
  return heap.extractMin();
}

// ===== GENERATE CODES (recursive DFS, mirrors C) =====
function generateCodes(root, code, depth, table) {
  if (!root) return;
  if (!root.left && !root.right) {
    table[root.ch] = code.slice(0, depth).join('');
    return;
  }
  code[depth] = '0';
  generateCodes(root.left, code, depth + 1, table);
  code[depth] = '1';
  generateCodes(root.right, code, depth + 1, table);
}

// ===== HUFFMAN MAIN =====
function huffmanCompress(input) {
  if (!input || input.length === 0) return null;

  // Build frequency array
  const freq = new Array(256).fill(0);
  for (const ch of input) freq[ch.charCodeAt(0)]++;

  const root = buildTree(freq);

  // Generate code table
  const codeTable = {};
  generateCodes(root, [], 0, codeTable);

  // Build encoded bitstream
  let bitstream = '';
  for (const ch of input) bitstream += codeTable[ch];

  // Stats
  const asciiTotal  = input.length * 8;
  const huffTotal   = bitstream.length;
  const saved       = ((asciiTotal - huffTotal) / asciiTotal * 100).toFixed(1);

  // Code table entries sorted by frequency desc
  const entries = Object.entries(codeTable).map(([ch, code]) => ({
    ch,
    freq:      freq[ch.charCodeAt(0)],
    code,
    huffBits:  freq[ch.charCodeAt(0)] * code.length,
    asciiBits: freq[ch.charCodeAt(0)] * 8
  })).sort((a, b) => b.freq - a.freq);

  return { root, codeTable, bitstream, asciiTotal, huffTotal, saved, entries, freq };
}
