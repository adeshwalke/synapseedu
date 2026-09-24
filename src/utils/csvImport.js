// Pure CSV/JSON → structured items parser for SynapseEdu's bulk importer.
// No React dependencies so it can be unit-tested in Node directly.

const OPTION_LETTERS = ['A', 'B', 'C', 'D'];

const HEADER_HINTS = {
  subjects: ['name', 'subject', 'topic'],
  flashcards: ['front', 'question', 'back', 'answer', 'q', 'a'],
  questions: ['question', 'stem', 'text', 'option', 'choice', 'answer', 'correct', 'explanation'],
};

function isHeaderRow(row, type) {
  const joined = row.join(' ').toLowerCase();
  return HEADER_HINTS[type].some((h) => {
    // match whole cell, not substring, to avoid false positives like "questionable"
    return row.some((cell) => cell.trim().toLowerCase() === h);
  });
}

// minimal CSV line parser (handles quoted fields with escaped quotes)
function parseCsvLine(line, delim) {
  const out = [];
  let cur = '';
  let inQ = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (inQ) {
      if (c === '"') {
        if (line[i + 1] === '"') { cur += '"'; i++; }
        else inQ = false;
      } else cur += c;
    } else if (c === '"') inQ = true;
    else if (c === delim) { out.push(cur); cur = ''; }
    else cur += c;
  }
  out.push(cur);
  return out.map((s) => s.trim());
}

// Pick the most likely delimiter from the first non-blank line.
function detectDelimiter(lines) {
  const first = lines.find((l) => l.trim());
  if (!first) return ',';
  const counts = { ',': 0, ';': 0, '\t': 0 };
  for (const ch of first) if (ch in counts) counts[ch]++;
  if (counts[';'] > counts[','] && counts[';'] > 0) return ';';
  if (counts['\t'] > counts[','] && counts['\t'] > 0) return '\t';
  return ',';
}

function asText(v) {
  if (v === null || v === undefined) return '';
  return String(v);
}

// Be forgiving about the answer column: accept A/B/C/D, a/b/c/d, or 1-4.
function parseCorrectIndex(raw) {
  const t = asText(raw).trim().toUpperCase();
  if (/^[ABCD]$/.test(t)) return OPTION_LETTERS.indexOf(t);
  if (/^[1-4]$/.test(t)) return Number(t) - 1;
  return -1;
}

export function parseImport(text, type) {
  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const errors = [];
  if (!lines.length) return { items: [], errors: ['Empty input.'] };

  const isJsonish = text.trim().startsWith('[') || text.trim().startsWith('{');
  const items = [];

  if (isJsonish) {
    let data;
    try { data = JSON.parse(text); } catch (e) { return { items: [], errors: [`Invalid JSON: ${e.message}`] }; }
    const list = Array.isArray(data) ? data : [data];
    if (type === 'subjects') {
      for (const row of list) {
        if (row && row.name) {
          const topics = Array.isArray(row.topics)
            ? row.topics.map((t) => (typeof t === 'string' ? t : (t?.name || asText(t))))
            : [];
          items.push({ name: asText(row.name), topics });
        } else {
          errors.push('Skipped a subject row missing "name".');
        }
      }
    } else if (type === 'flashcards') {
      for (const row of list) {
        const front = row.front ?? row.question ?? row.q;
        const back = row.back ?? row.answer ?? row.a;
        if (front && back) items.push({ front: asText(front), back: asText(back) });
        else if (front) errors.push(`Card missing "back": ${asText(front).slice(0, 40)}…`);
      }
    } else if (type === 'questions') {
      for (const row of list) {
        const textQ = row.question ?? row.text ?? row.stem;
        let options = Array.isArray(row.options) ? row.options.map(asText) : null;
        if (!options && Array.isArray(row.choices)) options = row.choices.map(asText);
        const answerRaw = row.correctIndex ?? row.correct ?? row.answer;
        let correctIndex = typeof answerRaw === 'number' ? answerRaw : parseCorrectIndex(asText(answerRaw));
        if (typeof row.answer === 'number' && correctIndex === -1) correctIndex = row.answer;
        if (textQ && options && options.length >= 4 && correctIndex >= 0 && correctIndex < 4) {
          items.push({
            text: asText(textQ),
            options: options.slice(0, 4),
            correctIndex,
            explanation: asText(row.explanation ?? row.rationale ?? ''),
          });
        } else {
          errors.push(`Skipped a question row missing text, 4 options, or a valid answer (${asText(textQ).slice(0, 40)}…)`);
        }
      }
    }
    return { items, errors };
  }

  // --- CSV / TSV / semicolon-delimited ---
  const delim = detectDelimiter(lines);
  for (const line of lines) {
    const row = parseCsvLine(line, delim);

    if (type === 'subjects') {
      const [name, topic] = row;
      if (!name || (line === lines[0] && isHeaderRow(row, 'subjects'))) continue;
      const existing = items.find((i) => i.name.toLowerCase() === name.toLowerCase());
      if (existing) { if (topic) existing.topics.push(topic); }
      else items.push({ name, topics: topic ? [topic] : [] });
    } else if (type === 'flashcards') {
      const [front, back] = row;
      if (!front || (line === lines[0] && isHeaderRow(row, 'flashcards'))) continue;
      if (back) items.push({ front, back });
      else errors.push(`Card missing "back" column: ${front.slice(0, 40)}…`);
    } else if (type === 'questions') {
      const [qText, a, b, c, d, correct, expl] = row;
      if (line === lines[0] && isHeaderRow(row, 'questions')) continue;
      if (qText && (a !== undefined || b !== undefined)) {
        const idx = parseCorrectIndex(correct);
        if (idx >= 0 && a !== undefined && b !== undefined && c !== undefined && d !== undefined) {
          items.push({ text: qText, options: [a, b, c, d], correctIndex: idx, explanation: expl || '' });
        } else if (idx < 0) {
          errors.push(`Skipped question "…${qText.slice(0, 40)}": answer column must be A/B/C/D (or 1-4).`);
        } else {
          errors.push(`Skipped question "…${qText.slice(0, 40)}": need at least question,A,B,C,D,correct.`);
        }
      } else if (qText) {
        errors.push(`Skipped row (need question,A,B,C,D,correct [,explanation]): ${line.slice(0, 60)}…`);
      }
    }
  }

  return { items, errors };
}