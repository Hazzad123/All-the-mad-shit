/* Lab: encapsulation — each network layer wraps the data in its own envelope; routers only open the outer ones. */
(function () {
  // <model>
  function byteLen(s) { return encodeURIComponent(s).replace(/%[0-9A-F]{2}/g, 'x').length; }
  function hex(n, w) { let s = (n >>> 0).toString(16).toUpperCase(); while (s.length < w) s = '0' + s; return s; }
  function checksum(str) {            // the real internet checksum: 16-bit ones-complement sum
    let sum = 0;
    for (let i = 0; i < str.length; i += 2) sum += ((str.charCodeAt(i) & 255) << 8) + (i + 1 < str.length ? str.charCodeAt(i + 1) & 255 : 0);
    while (sum > 65535) sum = (sum & 65535) + (sum >>> 16);
    return (~sum) & 65535;
  }
  const MAC = { sender: '02:00:00:00:0A:0A', routerLan: '02:00:00:00:01:01', routerWan: '02:00:00:00:02:02', receiver: '02:00:00:00:0B:0B' };
  // Returns the four layers, innermost first: [application, transport, network, link]. A field is [name, value, previousValue?].
  function build(msg, proto, hopped) {
    const m = String(msg).trim() ? String(msg) : '(empty message)';
    const tcp = proto === 'tcp', dataLen = byteLen(m), appLen = 12, tLen = tcp ? 20 : 8;
    const seg = tLen + appLen + dataLen, ipTotal = 20 + seg, frame = 14 + ipTotal + 4;
    const sum = checksum('Ä\u0088\u0013\u0088' + m);
    const transport = tcp
      ? [['source port', '50312', 'the sender\'s random "return address"'], ['destination port', '5000', 'which program on the server'], ['sequence number', '1000', 'numbers the bytes so they can be put back in order'], ['acknowledgement', '0', 'what the sender has received so far'], ['flags', 'PSH, ACK', 'push this data now'], ['window', '64240', 'how much the receiver can take'], ['checksum', '0x' + hex(sum, 4), 'detects damage']]
      : [['source port', '50312', 'the sender\'s random "return address"'], ['destination port', '5000', 'which program on the server'], ['length', String(seg) + ' bytes', 'header plus data'], ['checksum', '0x' + hex(sum, 4), 'detects damage']];
    return {
      msg: m, dataLen: dataLen,
      layers: [
        { key: 'app', name: '4 · Application', color: '--accent', bytes: appLen, fields: [['protocol', 'chat app'], ['type', 'message'], ['length', dataLen + ' bytes']] },
        { key: 'transport', name: '3 · Transport (' + (tcp ? 'TCP' : 'UDP') + ')', color: '--good', bytes: tLen, fields: transport },
        { key: 'network', name: '2 · Network (IP)', color: '--info', bytes: 20, fields: [['version', '4'], ['source IP', '192.168.1.10'], ['destination IP', '203.0.113.5'], hopped ? ['TTL', '63', '64'] : ['TTL', '64'], ['protocol', tcp ? '6 (TCP)' : '17 (UDP)'], ['total length', ipTotal + ' bytes']] },
        { key: 'link', name: '1 · Link (Ethernet)', color: '--warn', bytes: 18, fields: [hopped ? ['destination MAC', MAC.receiver, MAC.routerLan] : ['destination MAC', MAC.routerLan], hopped ? ['source MAC', MAC.routerWan, MAC.sender] : ['source MAC', MAC.sender], ['type', '0x0800 (IPv4)'], ['frame size', frame + ' bytes']] }
      ]
    };
  }
  // how many layers are wrapped around the data after `pos` steps (0-4 wrap, 5 router, 6-9 unwrap)
  function layerCount(pos) { return pos <= 4 ? pos : 9 - pos; }
  // </model>

  const ORDER = ['Application', 'Transport', 'Network', 'Link'];
  const UNW = ['Link', 'Network', 'Transport', 'Application'];

  KS.labs.register({
    id: 'encapsulation',
    title: 'Packet Wrapping',
    emoji: '📦',
    blurb: 'Watch your message get wrapped in envelope after envelope, cross a router that only opens the outer one, and get unwrapped again.',
    tags: ['networking', 'tcp', 'udp', 'ip', 'osi', 'layers'],
    goals: [
      { id: 'wrap', text: 'Wrap a message through **all four layers**' },
      { id: 'hop', text: 'Send it through the **router** and notice which header changed' },
      { id: 'unwrap', text: '**Unwrap** it at the receiver' },
      { id: 'udp', text: 'Send the same kind of message over **UDP** and compare the header with TCP' }
    ],
    help: `Sending data over a network is like posting a letter inside a letter inside a letter. Each **layer** adds its own **header** (an envelope with an address on it) and only cares about that one.

- **Application**: what the programs say to each other.
- **Transport** (TCP or UDP): which *program* on the machine (the **port**), and for TCP, order and delivery.
- **Network** (IP): which *machine* in the world (the **IP address**).
- **Link** (Ethernet): which *neighbour* on this one cable or Wi-Fi (the **MAC address**).

A **router** only opens the outer envelopes it needs. It strips the link envelope and puts a new one on with fresh MAC addresses, but the IP addresses stay put. It never looks at ports or your message. Tap *Next step* to go layer by layer. Fields that changed at the router glow.`,

    mount(root, api) {
      const ui = api.ui, h = api.h;
      let msg = 'Hello, server!', proto = 'tcp', pos = 0, run = 0, busy = false, playing = false, seenTcp = false;

      const msgIn = ui.input('Message to send', msg, v => { msg = v; reset('Message changed. Start again from the top.'); }, { maxlength: '60' });
      const protoSeg = ui.seg([['tcp', 'TCP (careful)'], ['udp', 'UDP (fast)']], proto, v => { proto = v; reset('Switched to **' + v.toUpperCase() + '**. Same message, different transport header.'); });
      const nextBtn = ui.btn('Next step', () => onNext(), 'primary');
      const playBtn = ui.btn('⏩ Play all', () => play());
      const resetBtn = ui.btn('↺ Start over', () => reset('Back to the plain message.'), 'sm');
      const sender = ui.node('Sender', '💻', { sub: '192.168.1.10' }), router = ui.node('Router', '🛜', { sub: 'between networks' }), receiver = ui.node('Receiver', '🖥️', { sub: '203.0.113.5' });
      const stage = ui.stage();
      stage.el.appendChild(ui.cols([sender], [router], [receiver]));
      stage.wire(sender, router); stage.wire(router, receiver);
      const envHost = h('div');
      const sizeNote = h('p.muted.small', { style: { margin: '10px 0 0' } });
      const log = ui.log(40);
      const cmp = h('div.lab-table-wrap', h('table.lab-table',
        h('thead', h('tr', h('th', 'transport header'), h('th', 'TCP'), h('th', 'UDP'))),
        h('tbody', [['size', '20 bytes', '8 bytes'], ['ports', 'yes', 'yes'], ['sequence numbers', 'yes', 'no'], ['acknowledgements', 'yes', 'no'], ['lost data resent', 'yes', 'no'], ['good for', 'web, email, files', 'video calls, games, DNS']].map(r => h('tr', r.map(c => h('td', c)))))));

      root.appendChild(ui.panel('Your message', ui.row(msgIn, protoSeg), ui.row(nextBtn, playBtn, resetBtn)));
      root.appendChild(stage.el);
      root.appendChild(h('div.lab-grid2', ui.panel('The packet right now (outer = last wrapped)', envHost, sizeNote), ui.panel('What just happened', log.el)));
      root.appendChild(ui.panel('TCP and UDP side by side', cmp));

      function box(layer, hopped, inner) {
        return h('div', { style: { border: '2px solid var(' + layer.color + ')', borderRadius: '12px', padding: '8px', background: 'color-mix(in srgb, var(' + layer.color + ') 10%, transparent)', minWidth: '0' } },
          h('div', { style: { fontWeight: '800', fontSize: '.8rem', marginBottom: '4px', color: 'var(' + layer.color + ')' } }, layer.name + ' header · ' + layer.bytes + ' bytes'),
          h('div.lab-mono', { style: { display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1px 10px', fontSize: '.74rem', marginBottom: '8px' } },
            layer.fields.map(f => {
              const chg = !!f[2] && (layer.key === 'link' || f[0] === 'TTL');
              return [h('span.muted', f[0]), chg ? h('span', { style: { color: 'var(--warn)', fontWeight: '800' } }, f[1] + '  (was ' + f[2] + ')') : h('span', f[1], f[2] ? h('span.muted', ' · ' + f[2]) : null)];
            })),
          inner);
      }
      function render() {
        const hopped = pos >= 5, count = layerCount(pos), data = build(msg, proto, hopped);
        KS.clear(envHost);
        let inner = h('div', { style: { border: '2px dashed var(--line-2)', borderRadius: '10px', padding: '8px 10px', background: pos === 9 ? 'var(--good-soft)' : 'var(--panel-2)', fontWeight: '700', overflowWrap: 'anywhere' } }, (pos === 9 ? '✅ Delivered: ' : '✉️ ') + '"' + data.msg + '"');
        for (let i = 0; i < count; i++) inner = box(data.layers[i], hopped, inner);
        envHost.appendChild(inner);
        // total size
        let total = data.dataLen; for (let i = 0; i < count; i++) total += data.layers[i].bytes;
        sizeNote.textContent = 'Message ' + data.dataLen + ' bytes. With all headers wrapped: ' + (data.dataLen + data.layers.reduce((a, l) => a + l.bytes, 0)) + ' bytes. Right now: ' + total + ' bytes.';
        nextBtn.disabled = busy || playing;
        nextBtn.textContent = pos < 4 ? 'Wrap: add the ' + ORDER[pos] + ' header ▼' : pos === 4 ? 'Send through the router ➡' : pos < 9 ? 'Unwrap: open the ' + UNW[pos - 5] + ' envelope ▲' : '↺ Send another';
        playBtn.disabled = busy || playing; playBtn.textContent = playing ? '… playing' : '⏩ Play all';
        sender.setState(pos > 0 && pos < 5 ? 'active' : ''); router.setState(pos === 5 ? 'active' : ''); receiver.setState(pos >= 6 ? 'active' : '');
      }
      function reset(why) { run++; busy = false; playing = false; pos = 0; render(); if (why) log.add(why, 'dim'); }
      function check() {
        if (proto === 'tcp' && pos >= 2) seenTcp = true;
        if (pos >= 4) api.goal('wrap'); if (pos >= 5) api.goal('hop'); if (pos >= 9) api.goal('unwrap');
        if (proto === 'udp' && pos >= 2 && seenTcp) api.goal('udp');
      }
      function narrate(p) {
        const tcp = proto === 'tcp';
        if (p === 1) log.add('**Application** adds a tiny header saying what kind of data this is, then hands it down.', 'info');
        else if (p === 2) log.add(tcp ? '**Transport (TCP)** adds ports (which program), a sequence number (so bytes can be re-ordered) and a checksum: **20 bytes**. TCP will resend if this gets lost.' : '**Transport (UDP)** adds only ports, a length and a checksum: just **8 bytes**. No sequence numbers, no resending: fire and forget.', 'info');
        else if (p === 3) log.add('**Network (IP)** adds the source and destination **IP addresses**: the sender\'s and the final receiver\'s, anywhere in the world. TTL starts at 64.', 'info');
        else if (p === 4) log.add('**Link (Ethernet)** adds **MAC addresses**, but only for the *next hop*: the destination MAC is the router\'s, not the receiver\'s. The frame is ready to leave.', 'info');
        else if (p === 5) log.add('**Router** opened only the link envelope, read the **IP** header to choose a route, and built a **new link envelope**: both MACs changed. The IP addresses did not change; only TTL went 64 → 63. It never looked at ports or your message.', 'warn');
        else if (p === 6) log.add('Receiver\'s network card sees its own MAC address, so it keeps the frame and **removes the Link envelope**.', 'info');
        else if (p === 7) log.add('IP: the destination is me ✓ (TTL 63 shows one router on the way). **Network header removed.**', 'info');
        else if (p === 8) log.add(tcp ? 'TCP: port 5000 means "give it to the chat program". Sequence number checked, ACK sent back. **Transport header removed.**' : 'UDP: port 5000 means "give it to the chat program". Nothing is acknowledged. **Transport header removed.**', 'info');
        else if (p === 9) log.add('Application reads its header and gets the message. **Delivered!** Every layer only dealt with its own envelope.', 'good');
      }
      async function doStep() {
        if (pos >= 9) return false;
        const my = run;
        if (pos === 4) {
          busy = true; render();
          await stage.send(sender, router, { label: 'frame', ms: 420 }); if (!api.alive() || my !== run) return false;
          pos = 5; narrate(5); render(); check();
          await stage.send(router, receiver, { label: 'frame', ms: 420 }); if (!api.alive() || my !== run) return false;
          busy = false; render();
          return true;
        }
        pos++; narrate(pos); render(); check();
        return true;
      }
      function onNext() {
        if (busy || playing) return;
        if (pos >= 9) { reset('New send.'); return; }
        doStep();
      }
      async function play() {
        if (busy || playing) return;
        if (pos >= 9) reset();
        playing = true; const my = run; render();
        while (pos < 9) {
          const ok = await doStep(); if (!api.alive() || my !== run) return;
          if (!ok) break;
          await api.sleep(700); if (!api.alive() || my !== run) return;
        }
        playing = false; render();
      }

      render();
      log.add('Press **Next step** to start wrapping your message.', 'dim');
      return () => stage.destroy();
    }
  });
})();
