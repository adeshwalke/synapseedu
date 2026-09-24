// Tiny markdown-lite renderer for SynapseAI output (headings, bullets,
// numbered lists, bold, horizontal rules). No external deps, safe content.

const line = (text, key) => {
  const bolded = text.replace(/\*\*([^*]+)\*\*/g, '<b>$1</b>');
  return <span key={key} dangerouslySetInnerHTML={{ __html: bolded }} />;
};

export default function Md({ text }) {
  if (!text) return null;
  const paragraphs = [];
  let list = [];
  let listType = null;
  const flush = (key) => {
    if (list.length) {
      const items = [...list];
      paragraphs.push(
        listType === 'ol' ? (
          <ol key={`ol-${key}`} className="my-1.5 [&_li]:ml-5 [&_li]:list-decimal [&_li]:my-0.5">
            {items.map((it, i) => <li key={i}>{line(it.content, `${key}-${i}`)}</li>)}
          </ol>
        ) : (
          <ul key={`ul-${key}`} className="my-1.5 [&_li]:ml-5 [&_li]:list-disc [&_li]:my-0.5">
            {items.map((it, i) => <li key={i}>{line(it.content, `${key}-${i}`)}</li>)}
          </ul>
        )
      );
      list = [];
    }
  };
  const blocks = text.split('\n');

  blocks.forEach((raw, i) => {
    const t = raw.replace(/\s+$/g, '');
    if (!t.trim()) return;

    if (/^#{1,3}\s/.test(t)) {
      flush(`h-${i}`);
      const level = t.match(/^#+/)[0].length;
      const content = t.replace(/^#+\s*/, '');
      const Tag = level === 1 ? 'h2' : level === 2 ? 'h3' : 'h4';
      paragraphs.push(
        <Tag key={`h-${i}`} className="font-bold text-slate-100 mt-3 mb-1 first:mt-0 text-sm leading-snug">
          {line(content, `h-${i}`)}
        </Tag>
      );
      return;
    }
    if (/^[-*]\s/.test(t)) {
      if (listType !== 'ul') { flush(`l-${i}`); listType = 'ul'; }
      list.push({ content: t.replace(/^[-*]\s*/, '') });
      return;
    }
    if (/^\d+[.)]\s/.test(t)) {
      if (listType !== 'ol') { flush(`l-${i}`); listType = 'ol'; }
      list.push({ content: t.replace(/^\d+[.)]\s*/, '') });
      return;
    }
    flush(`p-${i}`);
    listType = null;
    if (/^---+$/.test(t.trim())) {
      paragraphs.push(<hr key={`hr-${i}`} className="border-slate-700 my-2" />);
    } else {
      paragraphs.push(
        <p key={`p-${i}`} className="my-1 leading-relaxed text-slate-200 text-sm">
          {line(t, `p-${i}`)}
        </p>
      );
    }
  });
  flush('final');

  return <div>{paragraphs}</div>;
}