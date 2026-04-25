// ===== HUFFMAN TREE SVG RENDERER =====

const LEAF_R   = 24;
const INT_R    = 20;
const V_GAP    = 90;
const H_MIN    = 60; // minimum gap between nodes at same level
const PADDING  = 48;

// Compute subtree width bottom-up
function computeLayout(node) {
  if (!node) return;
  if (!node.left && !node.right) {
    node._w = LEAF_R * 2 + H_MIN;
    return;
  }
  computeLayout(node.left);
  computeLayout(node.right);
  const lw = node.left  ? node.left._w  : 0;
  const rw = node.right ? node.right._w : 0;
  node._w = lw + rw;
  if (node._w < (INT_R * 2 + H_MIN)) node._w = INT_R * 2 + H_MIN;
}

// Assign x,y positions
function assignPositions(node, x, y) {
  if (!node) return;
  node._x = x;
  node._y = y;
  if (node.left || node.right) {
    const lw = node.left  ? node.left._w  : 0;
    const rw = node.right ? node.right._w : 0;
    if (node.left)  assignPositions(node.left,  x - rw / 2, y + V_GAP);
    if (node.right) assignPositions(node.right, x + lw / 2, y + V_GAP);
  }
}

function treeDepth(node) {
  if (!node) return 0;
  return 1 + Math.max(treeDepth(node.left), treeDepth(node.right));
}

// Collect all nodes
function collectNodes(node, list) {
  if (!node) return;
  list.push(node);
  collectNodes(node.left, list);
  collectNodes(node.right, list);
}

// Collect all edges
function collectEdges(node, edges) {
  if (!node) return;
  if (node.left) {
    edges.push({ parent: node, child: node.left, bit: '0' });
    collectEdges(node.left, edges);
  }
  if (node.right) {
    edges.push({ parent: node, child: node.right, bit: '1' });
    collectEdges(node.right, edges);
  }
}

function svgEl(tag, attrs, children) {
  const el = document.createElementNS('http://www.w3.org/2000/svg', tag);
  for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, v);
  if (children) el.innerHTML = children;
  return el;
}

function renderTree(root, codeTable, container) {
  container.innerHTML = '';
  if (!root) return;

  computeLayout(root);

  const depth = treeDepth(root);
  const svgH  = depth * V_GAP + LEAF_R * 2 + PADDING * 2;
  const svgW  = Math.max(root._w + PADDING * 2, 400);
  const rootX = svgW / 2;
  const rootY = LEAF_R + PADDING;

  assignPositions(root, rootX, rootY);

  const svg = svgEl('svg', {
    class:   'tree-svg',
    width:   svgW,
    height:  svgH,
    viewBox: `0 0 ${svgW} ${svgH}`
  });

  // Tooltip ref
  const tooltip = document.getElementById('tooltip');

  // Draw edges first (so they appear behind nodes)
  const edges = [];
  collectEdges(root, edges);

  for (const { parent, child, bit } of edges) {
    const color = bit === '0' ? '#2ECC71' : '#E74C3C';
    const mx = (parent._x + child._x) / 2;
    const my = (parent._y + child._y) / 2;

    // Line
    const line = svgEl('line', {
      x1: parent._x, y1: parent._y,
      x2: child._x,  y2: child._y,
      stroke: color, 'stroke-width': 2
    });
    svg.appendChild(line);

    // Bit label pill
    const pill = svgEl('g', {});
    const rect = svgEl('rect', {
      x: mx - 9, y: my - 10,
      width: 18, height: 18,
      rx: 4,
      fill: '#0A1628', stroke: color, 'stroke-width': 1
    });
    const txt = svgEl('text', {
      x: mx, y: my + 4,
      'text-anchor': 'middle',
      'font-family': 'JetBrains Mono, monospace',
      'font-size': 11,
      'font-weight': '700',
      fill: color
    }, bit);
    pill.appendChild(rect);
    pill.appendChild(txt);
    svg.appendChild(pill);
  }

  // Draw nodes
  const nodes = [];
  collectNodes(root, nodes);

  for (const node of nodes) {
    const isLeaf = !node.left && !node.right;
    const r      = isLeaf ? LEAF_R : INT_R;
    const g      = svgEl('g', { class: 'tree-node', style: 'cursor:pointer' });

    // Circle
    const circle = svgEl('circle', {
      cx: node._x, cy: node._y, r,
      fill:         isLeaf ? '#00B4D8' : '#0D2137',
      stroke:       '#00B4D8',
      'stroke-width': isLeaf ? 0 : 2
    });
    g.appendChild(circle);

    // Main label
    const displayChar = isLeaf
      ? (node.ch === ' ' ? '·' : node.ch)
      : '';

    if (isLeaf) {
      const charTxt = svgEl('text', {
        x: node._x, y: node._y - 3,
        'text-anchor': 'middle', 'dominant-baseline': 'middle',
        'font-family': 'JetBrains Mono, monospace',
        'font-size': 13, 'font-weight': '700', fill: '#FFFFFF'
      }, displayChar);
      g.appendChild(charTxt);

      const freqTxt = svgEl('text', {
        x: node._x, y: node._y + 11,
        'text-anchor': 'middle',
        'font-family': 'JetBrains Mono, monospace',
        'font-size': 9, 'font-weight': '500', fill: '#F1C40F'
      }, node.freq);
      g.appendChild(freqTxt);
    } else {
      const freqTxt = svgEl('text', {
        x: node._x, y: node._y,
        'text-anchor': 'middle', 'dominant-baseline': 'middle',
        'font-family': 'JetBrains Mono, monospace',
        'font-size': 12, 'font-weight': '700', fill: '#FFFFFF'
      }, node.freq);
      g.appendChild(freqTxt);
    }

    // Hover interactions
    g.addEventListener('mouseenter', (e) => {
      circle.setAttribute('fill', isLeaf ? '#12C4E8' : '#1E3A5F');
      circle.setAttribute('stroke-width', '3');

      let html = `<div style="color:#90E0EF;font-weight:700;margin-bottom:4px">${
        isLeaf ? (node.ch === ' ' ? '(space)' : `'${node.ch}'`) : 'Internal Node'
      }</div>`;
      html += `<div>Freq: <span style="color:#F1C40F">${node.freq}</span></div>`;
      if (isLeaf && codeTable[node.ch]) {
        html += `<div>Code: <span>${colorBits(codeTable[node.ch])}</span></div>`;
        html += `<div>Bits: <span style="color:#2ECC71">${codeTable[node.ch].length}</span></div>`;
      }
      tooltip.innerHTML = html;
      tooltip.classList.remove('hidden');
      positionTooltip(e);
    });

    g.addEventListener('mousemove', positionTooltip);

    g.addEventListener('mouseleave', () => {
      circle.setAttribute('fill', isLeaf ? '#00B4D8' : '#0D2137');
      circle.setAttribute('stroke-width', isLeaf ? '0' : '2');
      tooltip.classList.add('hidden');
    });

    svg.appendChild(g);
  }

  container.appendChild(svg);
}

function colorBits(code) {
  return code.split('').map(b =>
    b === '0'
      ? `<span style="color:#2ECC71">${b}</span>`
      : `<span style="color:#E74C3C">${b}</span>`
  ).join('');
}

function positionTooltip(e) {
  const tt = document.getElementById('tooltip');
  const pad = 14;
  let x = e.clientX + pad, y = e.clientY + pad;
  if (x + 200 > window.innerWidth) x = e.clientX - 200 - pad;
  if (y + 100 > window.innerHeight) y = e.clientY - 100 - pad;
  tt.style.left = x + 'px';
  tt.style.top  = y + 'px';
}
