// ==================== HUFFMAN ====================

class HuffmanNode {
  constructor(char, freq) {
    this.char = char;
    this.freq = freq;
    this.left = null;
    this.right = null;
  }
}

function buildHuffmanTree(text) {
  const freq = {};
  for (const c of text) freq[c] = (freq[c] || 0) + 1;

  let nodes = Object.entries(freq).map(([c, f]) => new HuffmanNode(c, f));
  if (nodes.length === 1) {
    const root = new HuffmanNode(null, nodes[0].freq);
    root.left = nodes[0];
    return { root, freq };
  }

  while (nodes.length > 1) {
    nodes.sort((a, b) => a.freq - b.freq);
    const l = nodes.shift(), r = nodes.shift();
    const parent = new HuffmanNode(null, l.freq + r.freq);
    parent.left = l;
    parent.right = r;
    nodes.push(parent);
  }
  return { root: nodes[0], freq };
}

function generateCodes(node, prefix = '', codes = {}) {
  if (!node) return codes;
  if (node.char !== null) {
    codes[node.char] = prefix || '0';
    return codes;
  }
  generateCodes(node.left, prefix + '0', codes);
  generateCodes(node.right, prefix + '1', codes);
  return codes;
}

function runHuffman() {
  const text = document.getElementById('huff-input').value;
  if (!text) return;

  const { root, freq } = buildHuffmanTree(text);
  const codes = generateCodes(root);

  // Show results section
  document.getElementById('huff-results').style.display = 'block';

  // Stats
  const origBits = text.length * 8;
  let encodedBits = 0;
  for (const c of text) encodedBits += codes[c].length;
  const ratio = ((1 - encodedBits / origBits) * 100).toFixed(1);

  const statsEl = document.getElementById('huff-stats');
  const stats = [
    { val: text.length, label: 'Karakter' },
    { val: Object.keys(freq).length, label: 'Benzersiz' },
    { val: origBits, label: 'Orijinal Bit' },
    { val: encodedBits, label: 'Kodlanmış Bit' },
    { val: ratio + '%', label: 'Sıkıştırma' },
  ];
  statsEl.innerHTML = stats.map((s, i) =>
    `<div class="stat-card" style="transition-delay:${i*0.07}s">
      <div class="stat-value">${s.val}</div>
      <div class="stat-label">${s.label}</div>
    </div>`
  ).join('');
  setTimeout(() => statsEl.querySelectorAll('.stat-card').forEach(el => el.classList.add('visible')), 50);

  // Frequency table
  const maxFreq = Math.max(...Object.values(freq));
  const freqEl = document.getElementById('huff-freq');
  const sorted = Object.entries(freq).sort((a,b) => b[1]-a[1]);
  freqEl.innerHTML = sorted.map(([c, f], i) => {
    const barH = Math.max(4, (f / maxFreq) * 40);
    const displayChar = c === ' ' ? '·' : c;
    return `<div class="freq-item" style="transition-delay:${i*0.05}s">
      <span class="freq-char">${displayChar}</span>
      <div class="freq-bar" style="height:${barH}px"></div>
      <span class="freq-count">${f}×</span>
    </div>`;
  }).join('');
  setTimeout(() => freqEl.querySelectorAll('.freq-item').forEach(el => el.classList.add('visible')), 100);

  // Draw tree
  drawHuffmanTree(root, codes);

  // Code table
  const tbody = document.getElementById('huff-code-table');
  tbody.innerHTML = sorted.map(([c, f]) => {
    const code = codes[c];
    const stdBits = 8;
    const saved = ((stdBits - code.length) / stdBits * 100).toFixed(0);
    const displayChar = c === ' ' ? '<span style="opacity:0.4">SPACE</span>' : `<strong>${c}</strong>`;
    const coloredCode = code.split('').map(b => `<span class="${b==='0'?'bit-0':'bit-1'}">${b}</span>`).join('');
    return `<tr>
      <td>${displayChar}</td>
      <td>${f}</td>
      <td class="code-bits">${coloredCode}</td>
      <td>${code.length} bit</td>
      <td style="color:${saved>0?'var(--accent1)':'var(--accent4)'}">${saved}%</td>
    </tr>`;
  }).join('');

  // Encoded output
  const encEl = document.getElementById('huff-encoded');
  let html = '';
  for (const c of text) {
    const code = codes[c];
    html += code.split('').map(b => `<span class="b${b}">${b}</span>`).join('') + ' ';
  }
  encEl.innerHTML = html;
}

function drawHuffmanTree(root, codes) {
  const svg = document.getElementById('huffman-tree-svg');
  svg.innerHTML = '';

  // Calculate tree depth and node positions
  function getDepth(node) {
    if (!node) return 0;
    return 1 + Math.max(getDepth(node.left), getDepth(node.right));
  }

  const depth = getDepth(root);
  const nodeR = 24;
  const levelH = 80;
  const baseW = Math.pow(2, depth - 1) * 60;
  const svgW = Math.max(500, baseW + 100);
  const svgH = depth * levelH + 60;

  svg.setAttribute('viewBox', `0 0 ${svgW} ${svgH}`);
  svg.setAttribute('width', svgW);
  svg.setAttribute('height', svgH);

  const positions = [];
  let nodeIdx = 0;

  function assignPos(node, level, leftBound, rightBound) {
    if (!node) return null;
    const x = (leftBound + rightBound) / 2;
    const y = level * levelH + 40;
    const id = nodeIdx++;
    node._x = x; node._y = y; node._id = id;

    if (node.left) assignPos(node.left, level + 1, leftBound, x);
    if (node.right) assignPos(node.right, level + 1, x, rightBound);
    return { x, y, id };
  }

  assignPos(root, 0, 30, svgW - 30);

  // Draw edges first
  function drawEdges(node) {
    if (!node) return;
    if (node.left) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', node._x); line.setAttribute('y1', node._y);
      line.setAttribute('x2', node.left._x); line.setAttribute('y2', node.left._y);
      line.classList.add('tree-edge');
      svg.appendChild(line);

      const mx = (node._x + node.left._x) / 2;
      const my = (node._y + node.left._y) / 2 - 6;
      const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lbl.setAttribute('x', mx); lbl.setAttribute('y', my);
      lbl.classList.add('edge-label');
      lbl.textContent = '0';
      svg.appendChild(lbl);
      drawEdges(node.left);
    }
    if (node.right) {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', node._x); line.setAttribute('y1', node._y);
      line.setAttribute('x2', node.right._x); line.setAttribute('y2', node.right._y);
      line.classList.add('tree-edge');
      svg.appendChild(line);

      const mx = (node._x + node.right._x) / 2;
      const my = (node._y + node.right._y) / 2 - 6;
      const lbl = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      lbl.setAttribute('x', mx); lbl.setAttribute('y', my);
      lbl.classList.add('edge-label');
      lbl.textContent = '1';
      svg.appendChild(lbl);
      drawEdges(node.right);
    }
  }

  drawEdges(root);

  // Draw nodes
  let delay = 0;
  function drawNodes(node) {
    if (!node) return;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.classList.add('tree-node');
    if (node.char !== null) g.classList.add('leaf');
    g.style.opacity = '0';
    g.style.transformOrigin = `${node._x}px ${node._y}px`;
    g.style.transition = `all 0.4s ease ${delay * 0.08}s`;
    delay++;

    const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
    circle.setAttribute('cx', node._x);
    circle.setAttribute('cy', node._y);
    circle.setAttribute('r', nodeR);
    g.appendChild(circle);

    // Frequency text
    const freqText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
    freqText.setAttribute('x', node._x);
    freqText.setAttribute('y', node.char ? node._y + 7 : node._y);
    freqText.textContent = node.freq;
    g.appendChild(freqText);

    // Char label for leaves
    if (node.char !== null) {
      const charText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      charText.setAttribute('x', node._x);
      charText.setAttribute('y', node._y - 9);
      charText.classList.add('char-label');
      charText.textContent = node.char === ' ' ? '·' : node.char;
      g.appendChild(charText);
    }

    svg.appendChild(g);
    setTimeout(() => { g.style.opacity = '1'; g.style.transform = 'scale(1)'; }, delay * 20);

    drawNodes(node.left);
    drawNodes(node.right);
  }

  drawNodes(root);
}

// ==================== LZW ====================

function runLZW() {
  const text = document.getElementById('lzw-input').value;
  if (!text) return;

  // Initialize dictionary with single chars
  const dict = {};
  const uniqueChars = [...new Set(text.split(''))].sort();
  uniqueChars.forEach((c, i) => dict[c] = i);
  let nextCode = uniqueChars.length;

  const steps = [];
  const dictEntries = uniqueChars.map((c, i) => ({ key: `${i}`, val: c, isNew: false }));

  let buffer = '';
  const outputCodes = [];

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    const newBuffer = buffer + c;

    if (dict.hasOwnProperty(newBuffer)) {
      buffer = newBuffer;
      steps.push({
        i: steps.length + 1,
        buffer: newBuffer,
        output: null,
        dictEntry: null
      });
    } else {
      const code = dict[buffer];
      outputCodes.push(code);
      dict[newBuffer] = nextCode;
      dictEntries.push({ key: `${nextCode}`, val: newBuffer, isNew: true });

      steps.push({
        i: steps.length + 1,
        buffer: buffer,
        output: code,
        dictEntry: `${nextCode}: "${newBuffer}"`
      });
      nextCode++;
      buffer = c;
    }
  }

  if (buffer !== '') {
    outputCodes.push(dict[buffer]);
    steps.push({
      i: steps.length + 1,
      buffer: buffer,
      output: dict[buffer],
      dictEntry: null
    });
  }

  document.getElementById('lzw-results').style.display = 'block';

  // Stats
  const origBits = text.length * 8;
  const encodedBits = outputCodes.length * Math.ceil(Math.log2(nextCode + 1));
  const ratio = ((1 - encodedBits / origBits) * 100).toFixed(1);

  const statsEl = document.getElementById('lzw-stats');
  const stats = [
    { val: text.length, label: 'Karakter' },
    { val: outputCodes.length, label: 'Çıktı Kodu' },
    { val: nextCode, label: 'Sözlük Boyutu' },
    { val: ratio + '%', label: 'Oran' },
  ];
  statsEl.innerHTML = stats.map((s, i) =>
    `<div class="stat-card" style="transition-delay:${i*0.07}s">
      <div class="stat-value">${s.val}</div>
      <div class="stat-label">${s.label}</div>
    </div>`
  ).join('');
  setTimeout(() => statsEl.querySelectorAll('.stat-card').forEach(el => el.classList.add('visible')), 50);

  // Steps
  const stepsEl = document.getElementById('lzw-steps');
  stepsEl.innerHTML = steps.map((s, i) =>
    `<div class="lzw-step" style="transition-delay:${Math.min(i,30)*0.05}s">
      <span class="lzw-step-num">${s.i}</span>
      <span class="lzw-buffer">"${s.buffer}"</span>
      <span class="lzw-output">${s.output !== null ? `→ [${s.output}]` : '<span style="color:var(--muted);font-size:11px">buffering</span>'}</span>
      <span class="lzw-dict-entry">${s.dictEntry || ''}</span>
    </div>`
  ).join('');
  setTimeout(() => stepsEl.querySelectorAll('.lzw-step').forEach(el => el.classList.add('visible')), 50);

  // Dictionary
  const dictEl = document.getElementById('lzw-dict');
  dictEl.innerHTML = dictEntries.map((e, i) =>
    `<div class="dict-entry ${e.isNew ? 'new' : ''}" style="transition-delay:${Math.min(i,40)*0.03}s">
      <span class="dict-key">${e.key}</span>
      <span class="dict-val">"${e.val}"</span>
    </div>`
  ).join('');
  setTimeout(() => dictEl.querySelectorAll('.dict-entry').forEach(el => el.classList.add('visible')), 50);

  // Output
  document.getElementById('lzw-encoded').innerHTML = outputCodes
    .map(c => `<span style="color:var(--accent1);margin-right:6px">${c}</span>`)
    .join('<span style="color:var(--border)">·</span>');
}

// ==================== COMPARE ====================

function runCompare() {
  const text = document.getElementById('cmp-input').value;
  if (!text) return;

  // Huffman metrics
  const { root, freq } = buildHuffmanTree(text);
  const codes = generateCodes(root);
  const origBits = text.length * 8;
  let hEncBits = 0;
  for (const c of text) hEncBits += codes[c].length;
  const hRatio = ((1 - hEncBits / origBits) * 100).toFixed(1);
  const hUniq = Object.keys(freq).length;

  // LZW metrics
  const dictL = {};
  const uniq = [...new Set(text.split(''))].sort();
  uniq.forEach((c, i) => dictL[c] = i);
  let nextCode = uniq.length;
  let buffer = '';
  const outCodes = [];
  for (const c of text) {
    const nb = buffer + c;
    if (dictL.hasOwnProperty(nb)) { buffer = nb; }
    else { outCodes.push(dictL[buffer]); dictL[nb] = nextCode++; buffer = c; }
  }
  if (buffer) outCodes.push(dictL[buffer]);
  const lBitsPerCode = Math.ceil(Math.log2(nextCode + 1));
  const lEncBits = outCodes.length * lBitsPerCode;
  const lRatio = ((1 - lEncBits / origBits) * 100).toFixed(1);

  document.getElementById('cmp-results').style.display = 'block';

  function makeRows(data) {
    return data.map(([k, v]) =>
      `<div class="compare-row"><span class="compare-key">${k}</span><span class="compare-val">${v}</span></div>`
    ).join('');
  }

  document.getElementById('cmp-huffman-rows').innerHTML = makeRows([
    ['Orijinal', `${origBits} bit`],
    ['Kodlanmış', `${hEncBits} bit`],
    ['Sıkıştırma', `${hRatio}%`],
    ['Benzersiz Karakter', hUniq],
    ['Tablo Gerekliliği', 'Evet (decoder)'],
    ['En İyi Durum', 'Düşük entropi'],
  ]);

  document.getElementById('cmp-lzw-rows').innerHTML = makeRows([
    ['Orijinal', `${origBits} bit`],
    ['Kodlanmış', `~${lEncBits} bit`],
    ['Sıkıştırma', `${lRatio}%`],
    ['Sözlük Boyutu', nextCode],
    ['Tablo Gerekliliği', 'Hayır (self-building)'],
    ['En İyi Durum', 'Tekrarlı desenler'],
  ]);

  const winner = parseFloat(hRatio) > parseFloat(lRatio) ? 'huffman' : 'lzw';
  const winnerName = winner === 'huffman' ? 'Huffman' : 'LZW';
  const winColor = winner === 'huffman' ? 'var(--accent1)' : 'var(--accent2)';
  document.getElementById('cmp-verdict').innerHTML =
    `Bu metin için <span style="color:${winColor}">${winnerName}</span> daha iyi sıkıştırıyor ` +
    `(${winner === 'huffman' ? hRatio : lRatio}% tasarruf)`;
}

// ==================== TAB SWITCH ====================

function switchTab(tab) {
  document.querySelectorAll('.tab-btn').forEach((b, i) => {
    b.classList.toggle('active', ['huffman','lzw','compare'][i] === tab);
  });
  document.querySelectorAll('.panel').forEach(p => p.classList.remove('active'));
  document.getElementById('panel-' + tab).classList.add('active');
}

// Auto-run on load
window.onload = () => {
  runHuffman();
};