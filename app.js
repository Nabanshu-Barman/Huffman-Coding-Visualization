// ===== PAGE NAVIGATION =====
function goToPage2() {
  const p1 = document.getElementById('page1');
  const p2 = document.getElementById('page2');
  p1.style.display = 'none';
  p1.classList.remove('active');
  p2.style.display = 'block';
  p2.classList.add('active');
  p2.style.animation = 'none';
  void p2.offsetWidth;
  p2.style.animation = '';
  window.scrollTo({ top: 0 });
}

function goToPage1() {
  const p1 = document.getElementById('page1');
  const p2 = document.getElementById('page2');
  p2.style.display = 'none';
  p2.classList.remove('active');
  p1.style.display = 'block';
  p1.classList.add('active');
  p1.style.animation = 'none';
  void p1.offsetWidth;
  p1.style.animation = '';
  window.scrollTo({ top: 0 });
}

// ===== SYNTAX HIGHLIGHTED CODE =====
const C_CODE = `#include <stdio.h>
#include <stdio.h>      // standard input/output (printf, fgets)
#include <stdlib.h>     // memory allocation (malloc)
#include <string.h>     // string functions (strlen, strcpy, strcspn)

#define MAX_CHAR 256        // total possible ASCII characters
#define MAX_CODE_LEN 100    // max length of any Huffman code

// Node of Huffman Tree
typedef struct Node {
    char ch;                // character stored (leaf nodes only meaningful)
    int freq;               // frequency of the character
    struct Node *left, *right; // left and right children
} Node;

// Min Heap structure (priority queue based on frequency)
typedef struct {
    int size;               // current number of elements in heap
    Node* arr[MAX_CHAR];    // array of pointers to nodes
} MinHeap;

// Stores final Huffman codes
typedef struct {
    char ch;                    // character
    char code[MAX_CODE_LEN];    // binary code string
    int len;                    // length of code
} CodeEntry;

// Global table to store all character codes
CodeEntry code_table[MAX_CHAR];
int code_table_size = 0;        // tracks number of entries

// Create a new tree node
Node* create_node(char ch, int freq) {
    Node* n = (Node*)malloc(sizeof(Node)); // allocate memory for node
    n->ch = ch;            // assign character
    n->freq = freq;        // assign frequency
    n->left = n->right = NULL; // initialize children as NULL
    return n;              // return pointer to node
}

// Swap two node pointers (used in heap operations)
void swap(Node** a, Node** b) {
    Node* t = *a;          // store first pointer temporarily
    *a = *b;               // assign second to first
    *b = t;                // assign temp to second
}

// Maintain min-heap property starting from index i
void heapify(MinHeap* h, int i) {
    int smallest = i;              // assume current node is smallest
    int l = 2*i+1, r = 2*i+2;      // left and right child indices

    // check if left child exists and is smaller
    if (l < h->size && h->arr[l]->freq < h->arr[smallest]->freq)
        smallest = l;

    // check if right child exists and is smaller
    if (r < h->size && h->arr[r]->freq < h->arr[smallest]->freq)
        smallest = r;

    // if smallest is not the current node, swap and recurse
    if (smallest != i) {
        swap(&h->arr[i], &h->arr[smallest]);
        heapify(h, smallest);  // recursively fix subtree
    }
}

// Remove and return the node with minimum frequency
Node* extract_min(MinHeap* h) {
    Node* temp = h->arr[0];         // root is minimum
    h->arr[0] = h->arr[--h->size];  // replace root with last element
    heapify(h, 0);                 // restore heap property
    return temp;                   // return smallest node
}

// Insert a new node into the heap
void insert_heap(MinHeap* h, Node* n) {
    int i = h->size++;     // insert at end, then fix upward
    h->arr[i] = n;

    // move up while parent is larger
    while (i && h->arr[i]->freq < h->arr[(i-1)/2]->freq) {
        swap(&h->arr[i], &h->arr[(i-1)/2]);
        i = (i-1)/2;       // move to parent index
    }
}

// Build Huffman Tree using frequency array
Node* build_tree(int freq[]) {
    MinHeap h = {0};   // initialize heap with size = 0

    // Step 1: create leaf nodes for each character
    for (int i = 0; i < MAX_CHAR; i++)
        if (freq[i] > 0)  // only include characters that appear
            h.arr[h.size++] = create_node(i, freq[i]);

    // Step 2: build initial heap (bottom-up heapify)
    for (int i = h.size/2 - 1; i >= 0; i--)
        heapify(&h, i);

    // Step 3: repeatedly combine two smallest nodes
    while (h.size > 1) {
        Node* left = extract_min(&h);    // smallest node
        Node* right = extract_min(&h);   // second smallest

        // create new internal node (no character, use '$')
        Node* merged = create_node('$', left->freq + right->freq);

        merged->left = left;     // attach left subtree
        merged->right = right;   // attach right subtree

        insert_heap(&h, merged); // insert back into heap
    }

    return extract_min(&h);  // final node = root of Huffman tree
}

// Recursively generate Huffman codes
void generate_codes(Node* root, char* code, int depth) {
    if (!root) return;   // base case: null node

    // if leaf node → assign code
    if (!root->left && !root->right) {
        code[depth] = '\0';   // terminate string

        code_table[code_table_size].ch = root->ch;     // store character
        strcpy(code_table[code_table_size].code, code); // store code string
        code_table[code_table_size].len = depth;       // store length

        code_table_size++;    // move to next slot
        return;
    }

    // go left → add '0'
    code[depth] = '0';
    generate_codes(root->left, code, depth + 1);

    // go right → add '1'
    code[depth] = '1';
    generate_codes(root->right, code, depth + 1);
}

int main() {
    char input[1000];             // input string
    int freq[MAX_CHAR] = {0};     // frequency array initialized to 0

    printf("Enter message: ");
    fgets(input, sizeof(input), stdin);   // read input including spaces

    // remove trailing newline character
    input[strcspn(input, "\n")] = 0;

    // count frequency of each character
    for (int i = 0; input[i]; i++)
        freq[(unsigned char)input[i]]++;

    // original size in bits (8 bits per character)
    int ascii_total = strlen(input) * 8;

    // build Huffman Tree
    Node* root = build_tree(freq);

    char code[MAX_CODE_LEN];   // temporary buffer for codes

    // generate Huffman codes from tree
    generate_codes(root, code, 0);

    // Output part missing: should print codes + compression stats
    return 0;
}`;

function escapeHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function highlightLine(raw) {
  // Comment lines
  if (/^\s*\/\//.test(raw)) return `<span class="tok-cmt">${escapeHtml(raw)}</span>`;
  // Preprocessor
  if (/^\s*#(include|define)/.test(raw)) {
    return raw.replace(/(#(?:include|define))(\s+)(\S+)(.*)/,
      (_, dir, sp, val, rest) =>
        `<span class="tok-pre">${escapeHtml(dir)}</span>${sp}<span class="tok-str">${escapeHtml(val)}</span><span class="tok-cmt">${escapeHtml(rest)}</span>`
    );
  }

  let out = escapeHtml(raw);

  // Types (before keywords to avoid overlap)
  out = out.replace(/\b(Node|MinHeap|CodeEntry)\b/g, '<span class="tok-type">$1</span>');

  // Keywords
  const kws = ['int','char','void','while','if','for','return','struct','typedef','else','unsigned','sizeof'];
  kws.forEach(kw => {
    out = out.replace(new RegExp(`\\b(${kw})\\b`, 'g'), '<span class="tok-kw">$1</span>');
  });

  // String/char literals
  out = out.replace(/(&quot;[^&]*?&quot;)/g, '<span class="tok-str">$1</span>');
  out = out.replace(/(&#x27;[^&#]*?&#x27;)/g, '<span class="tok-str">$1</span>');
  out = out.replace(/('(?:[^'\\]|\\.)*')/g, '<span class="tok-str">$1</span>');

  // Numeric literals
  out = out.replace(/\b(\d+)\b/g, '<span class="tok-num">$1</span>');

  // Function names (word followed by open paren)
  out = out.replace(/\b([a-z_][a-z0-9_]*)(\s*\()/gi, (m, fn, paren) => {
    const skip = ['if','while','for','return','sizeof'];
    if (skip.includes(fn)) return m;
    return `<span class="tok-fn">${fn}</span>${paren}`;
  });

  return out;
}

function renderCode() {
  const table = document.getElementById('codeTable');
  const lines = C_CODE.split('\n');
  lines.forEach((line, i) => {
    const tr = document.createElement('tr');
    const numTd = document.createElement('td');
    numTd.textContent = i + 1;
    const codeTd = document.createElement('td');
    codeTd.innerHTML = highlightLine(line) || '&nbsp;';
    tr.appendChild(numTd);
    tr.appendChild(codeTd);
    table.appendChild(tr);
  });
}

// ===== HUFFMAN OUTPUT =====
function runHuffman() {
  const input = document.getElementById('msgInput').value.trim();
  if (!input) {
    document.getElementById('msgInput').focus();
    return;
  }

  const result = huffmanCompress(input);
  if (!result) return;

  const outputArea = document.getElementById('outputArea');
  outputArea.classList.remove('hidden');

  renderStats(result);
  renderTable(result);
  renderBitstream(result);
  renderTreeSection(result);

  setTimeout(() => {
    outputArea.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, 100);
}

function renderStats({ asciiTotal, huffTotal, saved }) {
  const row = document.getElementById('statsRow');
  row.innerHTML = `
    <div class="stat-card" style="animation-delay:0s">
      <div class="stat-value" style="color:#E74C3C">${asciiTotal}</div>
      <div class="stat-label">ASCII Bits</div>
    </div>
    <div class="stat-card" style="animation-delay:0.1s">
      <div class="stat-value" style="color:#2ECC71">${huffTotal}</div>
      <div class="stat-label">Huffman Bits</div>
    </div>
    <div class="stat-card" style="animation-delay:0.2s">
      <div class="stat-value" style="color:#00B4D8">${saved}<span style="font-size:22px">%</span></div>
      <div class="stat-label">Space Saved</div>
    </div>`;
}

function renderTable({ entries }) {
  const tbody = document.getElementById('huffTbody');
  tbody.innerHTML = '';
  let totalHuff = 0, totalAscii = 0;

  entries.forEach((e, idx) => {
    totalHuff  += e.huffBits;
    totalAscii += e.asciiBits;
    const tr = document.createElement('tr');
    tr.style.animationDelay = `${idx * 50}ms`;

    const charDisplay = e.ch === ' '
      ? `<span class="char-display">' '</span><span class="space-label">(space)</span>`
      : `<span class="char-display">${escHtml(e.ch)}</span>`;

    tr.innerHTML = `
      <td>${charDisplay}</td>
      <td style="color:#F1C40F;font-family:'JetBrains Mono',monospace">${e.freq}</td>
      <td class="code-bits">${colorBits(e.code)}</td>
      <td style="color:#2ECC71;font-family:'JetBrains Mono',monospace">${e.huffBits}</td>
      <td style="color:#E74C3C;font-family:'JetBrains Mono',monospace">${e.asciiBits}</td>`;
    tbody.appendChild(tr);
  });

  // Total row
  const totalRow = document.createElement('tr');
  totalRow.className = 'total-row';
  totalRow.innerHTML = `
    <td colspan="3">TOTAL</td>
    <td style="color:#2ECC71;font-family:'JetBrains Mono',monospace">${totalHuff}</td>
    <td style="color:#E74C3C;font-family:'JetBrains Mono',monospace">${totalAscii}</td>`;
  tbody.appendChild(totalRow);
}

function renderBitstream({ bitstream }) {
  const display = document.getElementById('bitstreamDisplay');
  const total   = document.getElementById('bitstreamTotal');

  // Group in sets of 8
  let html = '';
  for (let i = 0; i < bitstream.length; i++) {
    if (i > 0 && i % 8 === 0) html += ' ';
    const b = bitstream[i];
    html += b === '0'
      ? `<span class="bit-0">0</span>`
      : `<span class="bit-1">1</span>`;
  }
  display.innerHTML = html;
  total.textContent = `Total: ${bitstream.length} bits encoded`;
}

function renderTreeSection({ root, codeTable }) {
  const container = document.getElementById('treeContainer');
  renderTree(root, codeTable, container);
}

function colorBits(code) {
  return code.split('').map(b =>
    b === '0'
      ? `<span class="bit-0">0</span>`
      : `<span class="bit-1">1</span>`
  ).join('');
}

function escHtml(s) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// ===== KEYBOARD SUPPORT =====
document.addEventListener('DOMContentLoaded', () => {
  renderCode();
  document.getElementById('msgInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') runHuffman();
  });
});
