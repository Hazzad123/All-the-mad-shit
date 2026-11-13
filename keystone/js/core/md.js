/* Keystone — tiny safe markdown renderer + syntax highlighter (no dependencies). */
(function () {
  'use strict';
  const KS = window.KS;
  const esc = KS.esc;

  // ======================= syntax highlighting =======================
  const KW = {
    js: 'const let var function return if else for while do class extends new this super import export from default async await try catch finally throw switch case break continue typeof instanceof in of null undefined true false void delete yield static get set interface type enum implements public private protected readonly abstract as namespace declare',
    py: 'def class return if elif else for while in not and or is import from as try except finally raise with lambda None True False pass yield async await global nonlocal assert del break continue self print',
    java: 'class interface enum extends implements public private protected static final abstract void int long double float boolean char byte short new return if else for while do switch case break continue default try catch finally throw throws import package this super null true false var record instanceof synchronized volatile fun val when object companion data override def trait match let func guard struct protocol extension init',
    cs: 'class interface enum struct namespace using public private protected internal static readonly const abstract virtual override sealed void int long double float bool string object var new return if else for foreach in while do switch case break continue default try catch finally throw this base null true false async await get set is as out ref record',
    go: 'package import func return if else for range switch case default break continue go defer chan select struct interface map type var const nil true false make new string int int64 float64 bool error',
    rust: 'fn let mut pub struct enum impl trait use mod match if else for while loop return self Self crate super as in ref move async await dyn where const static true false Some None Ok Err',
    php: 'function class public private protected static return if else elseif foreach for while new echo namespace use extends implements interface abstract final try catch throw null true false array as',
    rb: 'def end class module if elsif else unless while until for in do return yield begin rescue ensure raise require include attr_accessor attr_reader nil true false self puts and or not then',
    sql: 'select from where and or not in is null like between join inner left right outer full cross on group by order having limit offset insert into values update set delete create table alter drop index primary key foreign references unique default as distinct count sum avg min max case when then else end begin commit rollback transaction union all exists asc desc explain analyze with constraint add column int integer text varchar boolean timestamp serial bigint numeric decimal date view grant revoke to if',
    sh: 'if then else elif fi for do done while case esac function return export echo cd ls cat grep sudo in',
    graphql: 'query mutation subscription fragment on type input enum interface union scalar schema extend implements true false null',
    proto: 'syntax package import message service rpc returns enum repeated optional required string int32 int64 bool float double bytes map oneof stream option',
    docker: 'FROM RUN CMD COPY ADD ENV EXPOSE ENTRYPOINT WORKDIR ARG USER VOLUME LABEL HEALTHCHECK AS',
    tf: 'resource variable output provider module data locals terraform true false null'
  };
  const ALIAS = {
    javascript: 'js', ts: 'js', typescript: 'js', jsx: 'js', tsx: 'js', node: 'js', python: 'py', kotlin: 'java', scala: 'java', swift: 'java',
    csharp: 'cs', 'c#': 'cs', dotnet: 'cs', golang: 'go', rs: 'rust', ruby: 'rb', bash: 'sh', shell: 'sh', zsh: 'sh', console: 'sh', terminal: 'sh',
    yml: 'yaml', dockerfile: 'docker', gql: 'graphql', protobuf: 'proto', hcl: 'tf', terraform: 'tf', xml: 'html', pseudo: 'js', pseudocode: 'js', c: 'java', cpp: 'java'
  };
  const SETS = {};
  for (const k in KW) SETS[k] = new Set(KW[k].split(' '));

  const RX = {
    clike: /(\/\/[^\n]*|\/\*[\s\S]*?\*\/)|("(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*'|`(?:\\.|[^`\\])*`)|(\b\d[\d_]*(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|([A-Za-z_$][\w$]*)|(@[A-Za-z_]\w*)/g,
    hash: /(#[^\n]*)|("""[\s\S]*?"""|'''[\s\S]*?'''|"(?:\\.|[^"\\\n])*"|'(?:\\.|[^'\\\n])*')|(\b\d[\d_]*(?:\.\d+)?\b)|([A-Za-z_][\w]*)|(@[A-Za-z_]\w*|\$[A-Za-z_{][\w}]*)/g,
    sql: /(--[^\n]*|\/\*[\s\S]*?\*\/)|('(?:''|[^'])*'|"(?:[^"])*")|(\b\d+(?:\.\d+)?\b)|([A-Za-z_][\w]*)|(\$\d+|:[a-z_]\w*|\?)/g
  };
  const FAMILY = { js: 'clike', java: 'clike', cs: 'clike', go: 'clike', rust: 'clike', php: 'clike', graphql: 'hash', proto: 'clike', tf: 'hash', py: 'hash', rb: 'hash', sh: 'hash', docker: 'hash', sql: 'sql' };

  function span(cls, text) { return '<span class="tk-' + cls + '">' + esc(text) + '</span>'; }

  /** Tokenise to [[class|null, text], ...] */
  function tokens(src, lang) {
    const out = [];
    const fam = FAMILY[lang];
    if (fam) {
      const rx = new RegExp(RX[fam].source, 'g'); const set = SETS[lang]; const ci = lang === 'sql';
      let last = 0, m;
      while ((m = rx.exec(src))) {
        if (m.index > last) out.push([null, src.slice(last, m.index)]);
        if (m[1]) out.push(['c', m[1]]);
        else if (m[2]) out.push(['s', m[2]]);
        else if (m[3]) out.push(['n', m[3]]);
        else if (m[4]) {
          const w = m[4];
          if (set.has(ci ? w.toLowerCase() : w)) out.push(['k', w]);
          else if (src.charAt(rx.lastIndex) === '(') out.push(['f', w]);
          else if (/^[A-Z][A-Za-z0-9]*[a-z]/.test(w) && !ci) out.push(['t', w]);
          else out.push([null, w]);
        } else out.push(['m', m[5]]);
        last = rx.lastIndex;
      }
      if (last < src.length) out.push([null, src.slice(last)]);
      return out;
    }
    if (lang === 'json') return generic(src, /("(?:\\.|[^"\\\n])*")(\s*:)?|(\b-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?\b)|\b(true|false|null)\b/g, function (m) {
      if (m[1]) return m[2] ? [['p', m[1]], [null, m[2]]] : [['s', m[1]]];
      if (m[3]) return [['n', m[3]]];
      return [['k', m[4]]];
    });
    if (lang === 'yaml') return generic(src, /(#[^\n]*)|^(\s*-?\s*)([\w.\/-]+)(:)(?=\s|$)|("(?:\\.|[^"\\\n])*"|'[^'\n]*')|(\b\d+(?:\.\d+)?\b)|\b(true|false|null|yes|no)\b/gm, function (m) {
      if (m[1]) return [['c', m[1]]];
      if (m[3]) return [[null, m[2]], ['p', m[3]], [null, m[4]]];
      if (m[5]) return [['s', m[5]]];
      if (m[6]) return [['n', m[6]]];
      return [['k', m[7]]];
    });
    if (lang === 'http') return generic(src, /^(GET|POST|PUT|PATCH|DELETE|HEAD|OPTIONS|CONNECT|TRACE)( \S+)( HTTP\/[\d.]+)?|^(HTTP\/[\d.]+ )(\d{3})([^\n]*)|^([A-Za-z][\w-]*)(:)|("(?:\\.|[^"\\\n])*")|(\b\d+(?:\.\d+)?\b)/gm, function (m) {
      if (m[1]) return [['k', m[1]], ['s', m[2]], ['c', m[3] || '']];
      if (m[4]) return [['c', m[4]], [m[5][0] === '2' ? 'ok' : m[5][0] === '3' ? 'm' : 'err', m[5]], ['t', m[6]]];
      if (m[7]) return [['p', m[7]], [null, m[8]]];
      if (m[9]) return [['s', m[9]]];
      return [['n', m[10]]];
    });
    if (lang === 'html') return generic(src, /(<!--[\s\S]*?-->)|(<\/?)([A-Za-z][\w:-]*)|("(?:[^"\n])*"|'(?:[^'\n])*')|(\s)([A-Za-z-:@]+)(=)/g, function (m) {
      if (m[1]) return [['c', m[1]]];
      if (m[3]) return [[null, m[2]], ['k', m[3]]];
      if (m[4]) return [['s', m[4]]];
      return [[null, m[5]], ['p', m[6]], [null, m[7]]];
    });
    if (lang === 'css') return generic(src, /(\/\*[\s\S]*?\*\/)|("[^"\n]*"|'[^'\n]*')|(#[0-9a-fA-F]{3,8}\b|\b\d+(?:\.\d+)?(?:px|em|rem|%|s|ms|vh|vw|fr|deg)?\b)|([\w-]+)(\s*:)(?=[^{}]*;|[^{}]*\})|(@[\w-]+|[.#]?[A-Za-z_][\w-]*)(?=[^{};]*\{)/g, function (m) {
      if (m[1]) return [['c', m[1]]];
      if (m[2]) return [['s', m[2]]];
      if (m[3]) return [['n', m[3]]];
      if (m[4]) return [['p', m[4]], [null, m[5]]];
      return [['k', m[6]]];
    });
    return [[null, src]];
  }
  function generic(src, rx, fn) {
    const out = []; let last = 0, m;
    while ((m = rx.exec(src))) {
      if (m[0] === '') { rx.lastIndex++; continue; }
      if (m.index > last) out.push([null, src.slice(last, m.index)]);
      const parts = fn(m); for (let i = 0; i < parts.length; i++) if (parts[i][1]) out.push(parts[i]);
      last = rx.lastIndex;
    }
    if (last < src.length) out.push([null, src.slice(last)]);
    return out;
  }

  /** Highlight source → array of HTML strings, one per line. */
  KS.hlLines = function (src, lang) {
    lang = String(lang || 'text').toLowerCase(); lang = ALIAS[lang] || lang;
    const toks = tokens(String(src), lang);
    const lines = ['']; let li = 0;
    for (let i = 0; i < toks.length; i++) {
      const parts = toks[i][1].split('\n');
      for (let p = 0; p < parts.length; p++) {
        if (p > 0) { lines.push(''); li++; }
        if (parts[p]) lines[li] += toks[i][0] ? span(toks[i][0], parts[p]) : esc(parts[p]);
      }
    }
    return lines;
  };
  KS.highlight = function (src, lang) { return KS.hlLines(src, lang).join('\n'); };

  /**
   * Rich code block element with line numbers.
   * opts: { notes: {lineNo: 'text'}, title, pick: fn(lineNo, el) , wrap }
   */
  KS.codeBlock = function (src, lang, opts) {
    opts = opts || {};
    const h = KS.h;
    src = KS.dedent(src);
    const lines = KS.hlLines(src, lang);
    const body = h('div.code-body');
    const notes = opts.notes || {};
    lines.forEach(function (html, i) {
      const n = i + 1;
      const row = h('div.cl', { dataset: { n: n } }, h('span.ln', String(n)), h('span.lc', { html: html || ' ' }));
      if (notes[n]) {
        row.classList.add('has-note');
        row.setAttribute('tabindex', '0'); row.setAttribute('role', 'button'); row.setAttribute('aria-label', 'Line ' + n + ': show note');
        const note = h('div.cl-note', { html: '<span class="cl-note-dot">💬</span> ' + inline(notes[n]) });
        const toggle = function () { row.classList.toggle('open'); note.classList.toggle('show'); };
        row.addEventListener('click', toggle);
        row.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggle(); } });
        body.appendChild(row); body.appendChild(note);
      } else {
        if (opts.pick) { row.classList.add('pickable'); row.setAttribute('tabindex', '0'); row.setAttribute('role', 'button'); row.addEventListener('click', function () { opts.pick(n, row); }); row.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); opts.pick(n, row); } }); }
        body.appendChild(row);
      }
    });
    const hasNotes = Object.keys(notes).length > 0;
    const bar = h('div.code-bar', h('span.code-lang', opts.title || String(lang || 'code')),
      hasNotes ? h('span.code-hint', '💬 tap the highlighted lines') : null,
      h('button.code-copy', { type: 'button', title: 'Copy code', onclick: function (e) {
        const b = e.currentTarget;
        try { navigator.clipboard.writeText(src).then(function () { b.textContent = 'Copied'; setTimeout(function () { b.textContent = 'Copy'; }, 1200); }).catch(function () { /* clipboard blocked */ }); } catch (err) { /* clipboard unavailable */ }
      } }, 'Copy'));
    return h('div.code' + (opts.wrap ? '.wrap' : ''), { dataset: { lang: String(lang || '') } }, bar, body);
  };

  // ======================= markdown-lite =======================
  function inline(src) {
    const codes = [];
    let s = String(src == null ? '' : src).replace(/`([^`\n]+)`/g, function (_, c) { codes.push(c); return '\u0001' + (codes.length - 1) + '\u0001'; });
    s = esc(s);
    s = s.replace(/\[\[([^\]|]+)(?:\|([^\]]+))?\]\]/g, function (_, a, b) { return '<span class="term" data-term="' + KS.slug(b || a) + '" tabindex="0" role="button">' + a + '</span>'; });
    s = s.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+|#[^\s)]*)\)/g, function (_, t, u) { return '<a href="' + u + '"' + (u.charAt(0) === '#' ? '' : ' target="_blank" rel="noopener noreferrer"') + '>' + t + '</a>'; });
    s = s.replace(/\*\*([^*\n]+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/(^|[\s(>“"'])\*([^*\s][^*\n]*?)\*(?=[\s).,;:!?<”"']|$)/g, '$1<em>$2</em>');
    s = s.replace(/==([^=\n]+?)==/g, '<mark>$1</mark>');
    s = s.replace(/\u0001(\d+)\u0001/g, function (_, i) { return '<code>' + esc(codes[+i]) + '</code>'; });
    return s;
  }

  const LIST = /^\s*([-*•]|\d+[.)])\s+/;
  function table(rows) {
    const cells = rows.map(function (r) { return r.trim().replace(/^\||\|$/g, '').split('|').map(function (c) { return c.trim(); }); });
    let head = null, body = cells;
    if (cells.length > 1 && cells[1].every(function (c) { return /^:?-{2,}:?$/.test(c); })) { head = cells[0]; body = cells.slice(2); }
    let html = '<div class="tbl-wrap"><table>';
    if (head) html += '<thead><tr>' + head.map(function (c) { return '<th>' + inline(c) + '</th>'; }).join('') + '</tr></thead>';
    html += '<tbody>' + body.map(function (r) { return '<tr>' + r.map(function (c) { return '<td>' + inline(c) + '</td>'; }).join('') + '</tr>'; }).join('') + '</tbody></table></div>';
    return html;
  }

  function md(src) {
    const lines = KS.dedent(src).split('\n');
    let out = '', i = 0, para = [];
    const flush = function () { if (para.length) { out += '<p>' + inline(para.join(' ')) + '</p>'; para = []; } };
    while (i < lines.length) {
      const line = lines[i]; const t = line.trim(); let m;
      if (/^```/.test(t)) {
        flush(); const lang = t.slice(3).trim(); const buf = []; i++;
        while (i < lines.length && !/^```/.test(lines[i].trim())) buf.push(lines[i++]);
        i++;
        out += '<pre class="code-inline-block" data-lang="' + esc(lang) + '"><code>' + KS.highlight(KS.dedent(buf.join('\n')), lang) + '</code></pre>';
        continue;
      }
      if (!t) { flush(); i++; continue; }
      if ((m = t.match(/^(#{1,4})\s+(.*)$/))) { flush(); const lv = Math.min(6, m[1].length + 2); out += '<h' + lv + '>' + inline(m[2]) + '</h' + lv + '>'; i++; continue; }
      if (/^\|.*\|$/.test(t)) { flush(); const rows = []; while (i < lines.length && /^\|.*\|$/.test(lines[i].trim())) rows.push(lines[i++]); out += table(rows); continue; }
      if (/^>/.test(t)) {
        flush(); const buf = [];
        while (i < lines.length && /^>/.test(lines[i].trim())) buf.push(lines[i++].trim().replace(/^>\s?/, ''));
        out += '<blockquote>' + md(buf.join('\n')) + '</blockquote>'; continue;
      }
      if (/^(-{3,}|\*{3,})$/.test(t)) { flush(); out += '<hr>'; i++; continue; }
      if (LIST.test(line)) {
        flush(); const ordered = /^\s*\d+[.)]\s+/.test(line); const items = [];
        while (i < lines.length && LIST.test(lines[i])) {
          let item = lines[i].replace(LIST, ''); i++;
          while (i < lines.length && lines[i].trim() && /^\s{2,}\S/.test(lines[i]) && !LIST.test(lines[i])) item += ' ' + lines[i++].trim();
          items.push(item);
        }
        out += (ordered ? '<ol>' : '<ul>') + items.map(function (x) { return '<li>' + inline(x) + '</li>'; }).join('') + (ordered ? '</ol>' : '</ul>');
        continue;
      }
      para.push(t); i++;
    }
    flush();
    return out;
  }

  KS.md = md;
  KS.md.inline = inline;
  /** Element helper: KS.mdEl('**hi**', 'div.x') */
  KS.mdEl = function (src, sel) { return KS.h(sel || 'div.md', { html: md(src) }); };
  /** Strip markdown to plain text (search, previews). */
  KS.plain = function (src) {
    return String(src == null ? '' : src).replace(/```[\s\S]*?```/g, ' ').replace(/\[\[([^\]|]+)(\|[^\]]+)?\]\]/g, '$1').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').replace(/[*`=#>|]/g, '').replace(/\s+/g, ' ').trim();
  };
})();
