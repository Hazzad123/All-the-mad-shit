/* Module: networking — Networking Deep Dive.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs networking */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('nw-osi', {
  eli5: 'Networking is split into layers, each with one small job, like the stages a letter passes through. The OSI model names seven of them so engineers can say exactly where a problem lives.',

  cards: [
    { kind: 'concept', title: 'Too many jobs for one program',
      body: `You press Send on a message. For it to reach your friend, somebody has to turn it into radio waves, address it, make sure it arrived, keep the pieces in order, and finally hand it to the right app.

        That is a lot of jobs. No single program, and no single company, does them all.

        The trick that makes it manageable is **layers**. Each layer does one job, uses the layer *below* it as a service, and does not care how that layer works. Change how one layer does its job and the others never notice.` },

    { kind: 'metaphor', title: 'The postal system',
      body: `You write a letter. You put it in an envelope and write an address. The post office sorts it by postcode. A lorry carries it between sorting offices.

        You have no idea how lorries work, and the driver never reads your letter. Each stage only deals with the stage next to it. Swap the lorry for a train and you would not notice.

        Where the metaphor stops: on a network, **every layer adds its own envelope**, and the receiving machine unwraps them one by one in reverse. You will see that in a moment.` },

    { kind: 'layers', title: 'The seven layers of OSI',
      body: 'The **OSI model** (Open Systems Interconnection) names seven layers. The first item is drawn on top. Tap through them.',
      layers: [
        { label: '7. Application', note: 'What the software talks about: HTTP, DNS, email.', icon: '🌐', tone: 'good' },
        { label: '6. Presentation', note: 'How data is represented: text encoding, compression, encryption formats.', icon: '🎨' },
        { label: '5. Session', note: 'Keeping a conversation going: starting, pausing, resuming.', icon: '🗣️' },
        { label: '4. Transport', note: 'Delivery between *programs*: TCP, UDP, port numbers.', icon: '📮', tone: 'accent' },
        { label: '3. Network', note: 'Addressing and routing across networks: IP addresses and routers.', icon: '🧭', tone: 'accent' },
        { label: '2. Data link', note: 'Delivery to the next device on the same link: Ethernet and Wi-Fi.', icon: '🔗' },
        { label: '1. Physical', note: 'The actual signals: electricity in copper, light in fibre, radio waves.', icon: '⚡' }
      ] },

    { kind: 'concept', title: 'A sentence that sticks',
      body: `Seven names in order is hard to remember. A silly sentence is easy. From the bottom (layer 1) up:

        **P**lease **D**o **N**ot **T**hrow **S**ausage **P**izza **A**way

        Physical, Data link, Network, Transport, Session, Presentation, Application.

        Prefer top-down? Try **A**ll **P**eople **S**eem **T**o **N**eed **D**ata **P**rocessing.

        Say your favourite one out loud twice. It really does help, and engineers still use these decades later.`,
      note: 'The numbers matter more than the names. People say "layer 4" and "layer 7" all the time.' },

    { kind: 'steps', title: 'Wrapping a message: encapsulation',
      body: 'Your browser sends a request. On its way out, it travels **down** the layers on your machine. Each layer wraps what it was given in its own envelope (a [[header|Header and payload]]) without opening it. Step through it.',
      steps: [
        { title: 'Application: the data', body: 'Your browser writes an HTTP request, such as `GET /`. This is the actual message.' },
        { title: 'Transport: a segment', body: 'TCP adds a header with port numbers (which program here, which program there) and a sequence number. The result is called a **segment**.' },
        { title: 'Network: a packet', body: 'IP adds a header with the source and destination IP addresses. Now it is a **packet**.' },
        { title: 'Data link: a frame', body: 'Ethernet or Wi-Fi adds a header with the address of the *next device*, plus a small trailer for spotting corruption. Now it is a **frame**.' },
        { title: 'Physical: bits', body: 'The frame becomes bits sent as signals. At the far end each layer peels off *its own* envelope, in reverse, and passes the contents up.' }
      ],
      note: 'In the lab that follows, you will wrap a message layer by layer and unwrap it at the far end.' },

    { kind: 'code', title: 'Envelopes inside envelopes',
      body: 'Here is what actually goes down the wire, drawn as nesting. **Tap the lines.**',
      code: { lang: 'text', src: `
        [ Ethernet header
          [ IP header
            [ TCP header
              [ GET / HTTP/1.1 ... ]
            ]
          ]
        ] Ethernet trailer`,
        notes: {
          1: 'The outermost envelope. It only says who the **next device** is, and it is thrown away and rebuilt at every hop.',
          2: 'The IP header names the final destination. It stays the same all the way across the internet.',
          3: 'The TCP header says which program on the destination machine should get the contents.',
          4: 'The real message. Only the application at the far end reads this.',
          7: 'The trailer lets the receiver notice if the frame got damaged in transit.'
        } } },

    { kind: 'pitfall', title: 'OSI is a map, not the territory',
      body: `OSI was designed as a **teaching and reference model**. The real internet runs on a simpler four-layer model (the next lesson), and real protocols do not fit seven tidy boxes.

        Layers 5 and 6 rarely exist as separate things: apps usually handle sessions and data formats themselves. And **TLS**, the encryption behind HTTPS, does not sit neatly in one layer. It runs on top of TCP and underneath HTTP, and people argue for layer 5, 6 or "somewhere around 4.5".

        Do not lose sleep over it. Use the model to say *where* a problem lives, not to win classification arguments.` },

    { kind: 'compare', title: 'The layers you will actually mention',
      body: 'Engineers say "layer 4" and "layer 7" as nicknames. A device is named after the highest layer whose information it reads.',
      cols: ['Reads', 'Example'],
      rows: [
        ['Layer 2', 'MAC addresses (a network card’s own ID)', 'A network switch'],
        ['Layer 3', 'IP addresses', 'A router'],
        ['Layer 4', 'IP addresses and ports', 'A layer 4 load balancer, a basic firewall'],
        ['Layer 7', 'The HTTP request itself: URL, headers, cookies', 'A layer 7 load balancer, a web application firewall']
      ],
      note: 'You will meet load balancers and firewalls properly later. For now, notice the pattern: higher layer means it understands more, but costs more work.' },

    { kind: 'tip', title: 'Debug from the bottom up',
      body: `"The website is down." Start at layer 1 and climb.

        - Is the cable in, is Wi-Fi connected? (layers 1 and 2)
        - Do you have an IP address, can you reach your router? (layer 3)
        - Does the port answer? (layer 4)
        - Does the app reply sensibly? (layer 7)

        Every layer relies on the ones below it, so a fault low down makes everything above look broken. Checking the bottom first saves hours of staring at application logs while the Wi-Fi is switched off.`,
      note: 'The last lesson of this module gives you a command for each of those steps.' }
  ],

  activities: [
    { type: 'match', after: 2, prompt: 'Match each layer to its job.',
      pairs: [['Physical', 'Turns bits into signals on a wire, fibre or radio'], ['Data link', 'Delivers to the next device on the same link'], ['Network', 'Addresses and routes between networks'], ['Transport', 'Gets data to the right program, reliably or not'], ['Application', 'The protocols software speaks, like HTTP']] },

    { type: 'order', after: 4, prompt: 'Put the wrapping in order as a message leaves your machine, starting with the original data.',
      items: ['HTTP request written by the browser', 'TCP header added (ports, sequence numbers)', 'IP header added (source and destination addresses)', 'Ethernet header added (next device on the link)', 'Frame sent as signals on the wire'],
      explain: 'Each layer wraps what it received from the layer above, so the *last* header added is the outermost. The receiver unwraps in the opposite order.' },

    { type: 'mcq', after: 5, q: 'Where does TLS (the encryption behind HTTPS) sit in the OSI model?',
      options: ['It does not fit neatly: it runs between TCP and HTTP, and people disagree about which layer to call it', 'Layer 1, because encryption scrambles the physical signal', 'Layer 3, because it protects IP packets', 'Layer 7, and nobody disputes it'],
      answer: 0,
      why: [null, 'Physical is about signals on a wire. TLS is software working on data long before it is turned into signals.', 'IP packets themselves are not encrypted by TLS. TLS protects the data inside the TCP connection.', 'It is close to the application, but the usual textbook answers vary (5, 6 or 7), so the honest answer is that it straddles layers.'],
      explain: 'OSI is a reference model, not a law. TLS sits on top of TCP and under HTTP, which does not match any single OSI box.' },

    { type: 'tf', statement: 'The real internet is built as seven separate layers, exactly as the OSI model describes.', answer: false,
      explain: 'The internet runs on the four-layer TCP/IP model. OSI is a teaching and reference model. Its layer numbers are still used as handy nicknames.' },

    { type: 'bucket', prompt: 'Which part of the stack does each thing belong to?', buckets: ['Layers 1–2: the local link', 'Layers 3–4: delivery', 'Layer 7: the application'],
      items: [['Wi-Fi radio signals', 0], ['An Ethernet cable', 0], ['A MAC address', 0], ['An IP address', 1], ['A port number', 1], ['Choosing the next router hop', 1], ['An HTTP `GET` request', 2], ['A DNS question', 2]],
      explain: 'The link layers handle the next device only. Layers 3 and 4 get data to the right machine and program. HTTP and DNS are conversations between applications.' },

    { type: 'cloze', text: 'As a message goes down the stack, each layer {{wraps}} it in its own {{header}}. This process is called {{encapsulation}}.',
      distractors: ['deletes', 'compresses', 'decryption'],
      explain: 'Wrapping without opening is the whole idea: each layer only deals with its own envelope, never the contents.' },

    { type: 'short', q: 'At which OSI layer number do TCP and UDP live?', accept: ['4', 'four', 'layer 4'], hint: 'Transport is the one in the middle.',
      explain: 'TCP and UDP are **transport** protocols, layer 4. That is why a "layer 4" device can see ports but not URLs.' },

    { type: 'scenario', title: 'The site will not load', intro: 'Your laptop shows an error when you open the company website. A colleague says: "just start at the bottom and work up." You try it.',
      meters: { 'time wasted': 10, 'confidence': 50 },
      steps: [
        { text: 'Where do you start?',
          choices: [
            { label: 'Check the laptop is actually connected to Wi-Fi or a cable', score: 2, effects: { 'confidence': 15 }, feedback: 'Yes: layers 1 and 2. If the link is down, nothing above it can work, however healthy the website is.' },
            { label: 'Read the website’s application logs', score: 0, effects: { 'time wasted': 30, 'confidence': -10 }, feedback: 'The logs would show nothing at all, because the requests never left your laptop. Always rule out the cheap low layers first.' },
            { label: 'Ask the developers to restart the web server', score: 0, effects: { 'time wasted': 25, 'confidence': -10 }, feedback: 'Restarting a server is a heavy step based on no evidence yet. Climb the layers before blaming the far end.' }
          ] },
        { text: 'Wi-Fi is connected and your laptop has an IP address. Other websites load fine, but this one does not. Which layers have you just effectively ruled out?',
          choices: [
            { label: 'The physical and data link layers, and most of layer 3 for your own machine', score: 2, effects: { 'confidence': 15 }, feedback: 'Right. Other sites loading proves your link and basic addressing work, so the problem is either on the way to this one site or in that site itself.' },
            { label: 'Only the application layer', score: 0, effects: { 'confidence': -10 }, feedback: 'It is the other way round. Working traffic to other sites tells you the *lower* layers are fine.' },
            { label: 'Nothing: every layer could still be at fault', score: 1, effects: { 'time wasted': 10 }, feedback: 'Cautious, but you do know something. If your link and addressing were broken, no site would load. Use what works as evidence.' }
          ] },
        { text: 'You can reach the site’s address, but the page returns an error from its application. Which layer is now the likely home of the problem?',
          choices: [
            { label: 'Layer 7: the application on the server', score: 2, effects: { 'confidence': 20 }, feedback: 'Exactly. The request travelled all the way down, across and up again, and the app answered with an error. That is a job for the people who run the app.' },
            { label: 'Layer 1: a cable somewhere', score: 0, effects: { 'confidence': -15 }, feedback: 'A broken cable would give no answer at all. An answer with an error message means the lower layers did their jobs.' },
            { label: 'Layer 2: your Wi-Fi', score: 0, effects: { 'confidence': -15 }, feedback: 'Your Wi-Fi delivered the request and brought back a reply. It is working.' }
          ] }
      ],
      outro: 'Climbing the layers turns "something is broken" into "the problem is *here*". Each working layer is evidence.' },

    { type: 'explain', prompt: 'A friend asks why networking is split into layers instead of one big program. Explain it using the postal system.',
      model: 'Sending a letter involves writing, addressing, sorting and driving, and nobody does all of that. Each stage does one job and only deals with the stage next to it, so you can swap lorries for trains without the writer noticing. Networks are the same: each layer does one job, wraps the layer above in its own envelope, and can change independently.',
      keywords: ['layer', 'one job', 'envelope', 'swap', 'wrap', 'independent'] }
  ],

  flashcards: [
    { q: 'Why is networking split into layers?', a: 'Each layer has one job and relies only on the layer below, so each can change or be fixed without the others noticing.' },
    { q: 'Name the seven OSI layers from the bottom.', a: 'Physical, Data link, Network, Transport, Session, Presentation, Application. (Please Do Not Throw Sausage Pizza Away.)' },
    { q: 'What is encapsulation?', a: 'Each layer wraps the data from the layer above in its own header as it goes down; the receiver unwraps in reverse order.' },
    { q: 'Which layer is IP, and which is TCP?', a: 'IP is layer 3 (Network). TCP is layer 4 (Transport).' },
    { q: 'Is OSI what the internet actually runs on?', a: 'No. It is a teaching and reference model. The internet uses the four-layer TCP/IP model, though OSI layer numbers are still used as nicknames.' }
  ],

  glossary: [
    { term: 'Protocol', def: 'An agreed set of rules for how two sides talk, such as what to send first and what format to use.', like: 'The etiquette of a phone call: hello, who is this, goodbye.' },
    { term: 'OSI model', def: 'A seven-layer reference model for describing what happens in networking. Used for teaching and for talking about where problems live.', like: 'A map of the postal service: useful, but the real roads wiggle.', aka: ['Open Systems Interconnection'] },
    { term: 'Encapsulation', def: 'Wrapping data in a new header at each layer on the way down the stack. The receiver unwraps the layers in reverse.', like: 'Putting a letter in an envelope, then that envelope in a bigger one.' },
    { term: 'Frame', def: 'The data-link layer\'s unit of data: a packet wrapped with a header for the next device and a trailer for error checking.', like: 'The courier’s own sack that carries your envelope for one leg of the journey.' }
  ],

  takeaways: [
    'Layers split a huge problem into small jobs; each layer only talks to its neighbours.',
    'OSI has seven layers: **P**hysical, **D**ata link, **N**etwork, **T**ransport, **S**ession, **P**resentation, **A**pplication.',
    'Going down, each layer **wraps** the data in a header (encapsulation). Going up, it is unwrapped.',
    'OSI is a reference model; the real internet is TCP/IP. Say "layer 4" and "layer 7", and debug from the bottom up.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('nw-tcpip', {
  eli5: 'The real internet uses four layers, not seven: Application, Transport, Internet and Link. Each message goes down those layers on your machine and back up on the server.',

  cards: [
    { kind: 'concept', title: 'The model the internet really uses',
      body: `Last lesson gave you seven layers. Now open up a real computer's networking code and count what you find: **four**.

        The internet's own protocols, TCP and IP, were already running the network before the OSI model was published. So the model that describes the real thing grew from the protocols, not the other way round. It is called the **TCP/IP model**, named after its two most famous members.

        Think of OSI as the textbook diagram and TCP/IP as the machinery that is actually bolted together.` },

    { kind: 'layers', title: 'The four TCP/IP layers',
      body: 'Top of the stack first. These four are what operating systems and routers really implement.',
      layers: [
        { label: 'Application', note: 'The conversation itself: HTTP, DNS, SSH. TLS is counted here too, as the application\'s own encryption.', icon: '🌐', tone: 'good' },
        { label: 'Transport', note: 'Delivery between programs: TCP (careful) or UDP (quick), plus port numbers.', icon: '📮', tone: 'accent' },
        { label: 'Internet', note: 'Addresses and routing across networks: IP.', icon: '🧭', tone: 'accent' },
        { label: 'Link', note: 'Getting a frame to the next device: Ethernet, Wi-Fi, and the physical signals.', icon: '🔗' }
      ] },

    { kind: 'compare', title: 'Mapping TCP/IP onto OSI',
      body: 'The two models describe the same stack, just sliced differently. OSI layers 5, 6 and 7 are lumped into one; layers 1 and 2 are lumped into another.',
      cols: ['OSI layers', 'TCP/IP layer'],
      rows: [
        ['Top', '7 Application, 6 Presentation, 5 Session', 'Application'],
        ['Middle', '4 Transport', 'Transport'],
        ['Lower', '3 Network', 'Internet'],
        ['Bottom', '2 Data link, 1 Physical', 'Link']
      ],
      note: 'That is why "layer 7" and "layer 4" still make sense in a TCP/IP world: OSI numbers survive as nicknames.' },

    { kind: 'metaphor', title: 'Street, flat number, van and letter',
      body: `You are sending a parcel to a friend in a block of flats.

        - **Application**: what the letter says, and in which language.
        - **Transport**: the flat number and a note such as "signature needed". It gets the parcel to the right *resident*.
        - **Internet**: the street address. It gets the parcel to the right *building*, however many towns away.
        - **Link**: the van on this particular road. It only gets you to the next depot.

        Each helper does their own job and ignores the rest.` },

    { kind: 'diagram', title: 'Where the protocols you know sit',
      body: 'Arrows mean "runs on top of". Most roads lead to IP, which is the point.',
      nodes: [
        { id: 'http', label: 'HTTP', icon: '🌐', x: 0, y: 0, tone: 'good' },
        { id: 'dns', label: 'DNS', icon: '📖', x: 1, y: 0, tone: 'good' },
        { id: 'tls', label: 'TLS', icon: '🔒', x: 0, y: 1, tone: 'warn' },
        { id: 'tcp', label: 'TCP', icon: '📮', x: 0, y: 2, tone: 'accent' },
        { id: 'udp', label: 'UDP', icon: '📣', x: 1, y: 2, tone: 'accent' },
        { id: 'ip', label: 'IP', icon: '🧭', x: 0, y: 3, tone: 'info' },
        { id: 'link', label: 'Ethernet / Wi-Fi', icon: '🔗', x: 0, y: 4, tone: 'muted' }
      ],
      edges: [
        { from: 'http', to: 'tls', label: 'inside' },
        { from: 'tls', to: 'tcp' },
        { from: 'dns', to: 'udp', label: 'usually', dashed: true },
        { from: 'tcp', to: 'ip' },
        { from: 'udp', to: 'ip' },
        { from: 'ip', to: 'link' }
      ],
      groups: [
        { label: 'Application', x: 0, y: 0, w: 2, h: 2 },
        { label: 'Transport', x: 0, y: 2, w: 2, h: 1 },
        { label: 'Internet', x: 0, y: 3, w: 2, h: 1 },
        { label: 'Link', x: 0, y: 4, w: 2, h: 1 }
      ],
      caption: 'HTTP/3 is the odd one out: it runs on a protocol called QUIC, which itself runs on UDP.' },

    { kind: 'sequence', title: 'One request, down and up the stack',
      body: 'Your browser fetches a page over HTTPS. Watch what each machine does with it.',
      actors: ['Browser', 'Router', 'Server'],
      steps: [
        { at: 0, label: 'down: HTTP, TCP, IP, frame', note: 'Your machine wraps the request: **TCP** adds ports (here 443 on the far side), **IP** adds both addresses, **Link** addresses it to your router.' },
        { from: 0, to: 1, label: 'frame for the router', note: 'The router receives the frame and unwraps the Link layer.' },
        { at: 1, label: 'read IP only, re-wrap', note: 'The router reads the **Internet** layer (the destination address), picks the next hop and wraps the packet in a fresh frame. It never looks at TCP or HTTP.' },
        { from: 1, to: 2, label: 'new frame, same packet', note: 'Many routers do this in turn. The IP header stays the same all the way.' },
        { at: 2, label: 'up: frame, IP, TCP, HTTP', note: 'The server unwraps each layer. **IP** says "for me". **TCP** sees port 443 and hands the data to the web server. **HTTP** is finally read.' },
        { from: 2, to: 0, label: 'the response goes back the same way', dashed: true, note: 'The server wraps its reply down its own stack, and your browser unwraps it up its stack. Same layers, opposite direction.' }
      ] },

    { kind: 'deep', title: 'IP is the narrow waist',
      body: `Look at the diagram again. Many protocols sit above IP (HTTP, DNS, SSH, games, video calls). Many technologies sit below it (Wi-Fi, Ethernet, fibre, 4G and 5G). In the middle, **one** protocol.

        That shape is sometimes called an hourglass. It is why a brand-new app needs no new cables, and why a new kind of radio link needs no new apps: both just have to speak IP.

        The narrow waist is a big reason the internet grew so fast, and also why changing IP itself (the slow shift to IPv6) takes decades.` },

    { kind: 'pitfall', title: 'Two models, one vocabulary',
      body: `You will hear people mix the models in the same sentence: "a layer 7 load balancer in front of the TCP transport layer". That is normal.

        The rule of thumb: **TCP/IP names the real layers** (Application, Transport, Internet, Link), and **OSI numbers are the nicknames** (3, 4 and 7 are the ones used most).

        Do not be thrown if a book puts TLS in a different place from the diagram above. It really does straddle layers, and experts do not agree on one answer.` },

    { kind: 'realworld', title: 'See the layers with your own eyes',
      body: `**Wireshark** is a free tool that records the packets leaving and arriving at your machine. Open one captured packet and it shows the layers as an expandable list, outermost first: the Ethernet frame, then IP, then TCP, then HTTP or TLS at the bottom.

        Every header you have just learned about is there, with real numbers in it: the addresses, the port numbers, the sequence numbers.

        It is the single best way to turn this lesson from diagrams into something solid.` }
  ],

  activities: [
    { type: 'match', after: 1, prompt: 'Match each protocol to its TCP/IP layer.',
      pairs: [['HTTP', 'Application'], ['TCP', 'Transport'], ['IP', 'Internet'], ['Wi-Fi', 'Link']] },

    { type: 'mcq', after: 5, q: 'A router in the middle of the internet forwards your packet. How much of it does the router read to decide where to send it?',
      options: ['Only down to the IP header: the destination address', 'All of it, including the HTTP request', 'The TCP header, to check the port first', 'Nothing: it forwards everything the same way'],
      answer: 0,
      why: [null, 'Routers do not open the HTTP request. That is the server\'s job, and it is often encrypted anyway.', 'A plain router does not care about ports. Layer 4 devices such as some firewalls do.', 'A router must read the destination address, or it could not choose a next hop.'],
      explain: 'Routers work at the Internet layer. They read the IP header, choose the next hop and wrap the packet in a fresh frame. The layers above are for the two ends to deal with.' },

    { type: 'tf', after: 6, statement: 'The narrow-waist idea means many applications and many link types all meet at one protocol: IP.', answer: true,
      explain: 'Everything above (HTTP, DNS, games) and everything below (Wi-Fi, Ethernet, 5G) is joined by IP. That shared middle is why the internet can mix so many technologies.' },

    { type: 'bucket', prompt: 'Which TCP/IP layer does each job belong to?', buckets: ['Application', 'Transport', 'Internet', 'Link'],
      items: [['An HTTP request', 0], ['A DNS lookup', 0], ['Port 443', 1], ['Resending a lost piece of data', 1], ['An IP address', 2], ['Choosing the next router', 2], ['Wi-Fi radio signals', 3], ['An Ethernet frame', 3]],
      explain: 'Application is the conversation, Transport targets programs and handles reliability, Internet targets machines across networks, Link handles the next device.' },

    { type: 'order', prompt: 'A response arrives at your laptop. Put the unwrapping steps in order, from the wire up to the browser.',
      items: ['Link: the frame is checked and unwrapped', 'Internet: the IP header says the packet is for this machine', 'Transport: the port number picks the right program', 'Application: the browser reads the HTTP response'],
      explain: 'Going up is the mirror image of going down. Each layer removes its own header and passes the contents upwards, and the last one to look is the application.' },

    { type: 'spot', prompt: 'This is a simplified view of one captured packet. Tap the line that tells the server which **program** should receive the data.',
      code: { lang: 'text', src: `
        Link:      from aa:bb:cc:11:22:33 to the router
        Internet:  from 192.168.1.20 to 198.51.100.4
        Transport: from port 51514 to port 443
        Application: GET /index.html` },
      lines: [3],
      explain: 'The destination **port** (443) picks the program on the machine, in this case the web server. The IP address only gets the packet to the right machine.' },

    { type: 'cloze', text: 'In the TCP/IP model, {{IP}} lives in the Internet layer, while {{TCP}} and UDP live in the {{Transport}} layer.',
      distractors: ['HTTP', 'Link', 'Wi-Fi'],
      explain: 'IP handles addresses and routing. TCP and UDP sit above it and handle delivery to programs.' },

    { type: 'scenario', title: 'The packet detective', intro: 'You have captured one packet from your laptop with a packet analyser. Your teammate asks you three questions about it. Which header answers each?',
      meters: { 'teammate trust': 50 },
      steps: [
        { text: '"Which device on our Wi-Fi gets this frame next?"',
          choices: [
            { label: 'The Link layer header', score: 2, effects: { 'teammate trust': 15 }, feedback: 'Yes. Link headers only name the next device on the same local link. They change at every hop.' },
            { label: 'The IP header', score: 0, effects: { 'teammate trust': -10 }, feedback: 'The IP header names the final destination, possibly across the world, not the next device.' },
            { label: 'The TCP header', score: 0, effects: { 'teammate trust': -10 }, feedback: 'TCP deals with programs and ports, not with which device is next.' }
          ] },
        { text: '"Which machine on the internet is this packet ultimately for?"',
          choices: [
            { label: 'The IP header (destination address)', score: 2, effects: { 'teammate trust': 15 }, feedback: 'Right. It is the one label that stays the same all the way, while Link headers get swapped at every hop.' },
            { label: 'The Link layer header', score: 0, effects: { 'teammate trust': -10 }, feedback: 'The link header only knows the next hop, which is often your home router.' },
            { label: 'The HTTP request line', score: 1, effects: { 'teammate trust': -5 }, feedback: 'The host name in HTTP identifies the site, but routers cannot use it to forward. They need the IP address.' }
          ] },
        { text: '"Is this web traffic or something else?"',
          choices: [
            { label: 'The destination port (443) plus the application data', score: 2, effects: { 'teammate trust': 20 }, feedback: 'Port 443 is the well-known door for HTTPS, and the application data confirms it. Ports are a strong hint, not a guarantee.' },
            { label: 'The source MAC address', score: 0, effects: { 'teammate trust': -10 }, feedback: 'A MAC address identifies a network card, not what kind of traffic is being carried.' },
            { label: 'The hops-left counter in the IP header', score: 0, effects: { 'teammate trust': -10 }, feedback: 'That counter is only a safety measure that stops packets looping forever.' }
          ] }
      ],
      outro: 'Each header answers one question: **which device next, which machine finally, which program**.' },

    { type: 'explain', prompt: 'Explain to a friend how the TCP/IP model relates to the seven-layer OSI model.',
      model: 'OSI is the textbook model with seven layers, and TCP/IP is the four-layer model the real internet uses. They describe the same thing: OSI layers 5 to 7 are lumped into Application, Transport stays as it is, Network is the Internet layer with IP, and Data link plus Physical become Link. People still use the OSI numbers like layer 4 and layer 7 as nicknames.',
      keywords: ['four', 'seven', 'Application', 'Transport', 'Internet', 'Link', 'nicknames'] }
  ],

  flashcards: [
    { q: 'What are the four TCP/IP layers?', a: 'Application, Transport, Internet, Link (from top to bottom).' },
    { q: 'How does TCP/IP map onto OSI?', a: 'Application = OSI 5, 6, 7. Transport = 4. Internet = 3. Link = 2 and 1.' },
    { q: 'Which layer is each of these in: HTTP, TCP, IP, Ethernet?', a: 'HTTP: Application. TCP: Transport. IP: Internet. Ethernet: Link.' },
    { q: 'How much of a packet does a plain router read?', a: 'Only the IP header (down to the Internet layer), enough to choose the next hop.' },
    { q: 'What is the "narrow waist" of the internet?', a: 'IP: many applications above and many link technologies below all meet at one protocol.' }
  ],

  glossary: [
    { term: 'TCP/IP model', def: 'The four-layer model the real internet runs on: Application, Transport, Internet and Link.', like: 'The machinery, where OSI is the textbook diagram.', aka: ['Internet protocol suite'] },
    { term: 'Narrow waist', def: 'The idea that IP sits in the middle of the stack, with many protocols above it and many link types below it.', like: 'The thin middle of an hourglass.', aka: ['hourglass model'] },
    { term: 'Link layer', def: 'The lowest TCP/IP layer, which moves a frame to the next device on the same local network: Ethernet, Wi-Fi and their signals.', like: 'The van between two neighbouring depots.' }
  ],

  takeaways: [
    'The real internet uses **four layers**: Application, Transport, Internet, Link.',
    'HTTP and DNS are Application; TCP and UDP are Transport; **IP** is Internet; Ethernet and Wi-Fi are Link.',
    'A request goes **down** your stack, hops across routers that read only IP, then goes **up** the server\'s stack.',
    'OSI numbers (layer 3, 4, 7) survive as nicknames for the TCP/IP layers.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('nw-tcp-udp', {
  eli5: 'TCP is like registered post: a call to check you are in first, numbered pages and resending anything lost. UDP is like shouting across a room: fast, with no guarantee anyone heard. Ports pick which program gets the message.',

  cards: [
    { kind: 'concept', title: 'IP delivers. It does not promise.',
      body: `IP gets packets to the right machine, but only on a **best-effort** basis. Packets can be lost, arrive twice or arrive in the wrong order.

        That is fine for some jobs. It is a disaster for others: imagine downloading a program where bytes 4,000 to 4,100 quietly went missing.

        So the Transport layer offers two flavours of delivery, and the application picks:

        - **TCP**: careful, ordered, resends what is lost.
        - **UDP**: quick and careless, no promises.` },

    { kind: 'metaphor', title: 'Registered post vs a shouted message',
      body: `**TCP is registered post with a phone call first.** You ring to check the person is home, number every page, ask for a signature on each parcel and resend anything that goes astray.

        **UDP is shouting across a room.** No call, no signature. If a word gets lost in the noise, it is lost. It is faster and costs less effort, and for some jobs that is exactly right.

        Where the metaphor stops: UDP is not unreliable by *malice*. It just leaves the checking to you, if you want any.` },

    { kind: 'sequence', title: 'The three-way handshake',
      body: 'Before TCP sends any real data, the two sides agree to talk. Step through it.',
      actors: ['Client', 'Server'],
      steps: [
        { from: 0, to: 1, label: 'SYN', note: '"Can we talk? My numbering starts at x." **SYN** is short for synchronise. The client has just opened a conversation.' },
        { from: 1, to: 0, label: 'SYN-ACK', dashed: true, note: '"Yes. Got your x, and my numbering starts at y." The server acknowledges the client **and** sends its own SYN.' },
        { from: 0, to: 1, label: 'ACK', note: '"Got your y. Ready." After this, both sides know the other can send **and** receive, and they agree on starting numbers.' },
        { from: 0, to: 1, label: 'GET / (the real data)', note: 'Now, and only now, the actual request is sent. The handshake costs roughly **one round trip** of waiting.' }
      ] },

    { kind: 'sequence', title: 'Lost? Resend just that bit',
      body: 'TCP numbers its data and the receiver confirms what it has. Here the second piece goes missing. (Simplified: real TCP numbers bytes, not pieces.)',
      actors: ['Sender', 'Receiver'],
      steps: [
        { from: 0, to: 1, label: 'piece 1', note: 'The sender transmits pieces one after another.' },
        { from: 1, to: 0, label: 'ACK: next I need is 2', dashed: true, note: 'The receiver confirms piece 1 arrived.' },
        { from: 0, to: 1, label: 'piece 2 (lost on the way)', note: 'Piece 2 never arrives. The sender does not know yet.' },
        { from: 0, to: 1, label: 'piece 3', note: 'Piece 3 arrives, but the receiver cannot use it yet because piece 2 is missing. It keeps piece 3 and waits.' },
        { from: 1, to: 0, label: 'ACK: next I need is 2', dashed: true, note: 'Still asking for 2. A repeated request is a hint that something went missing.' },
        { from: 0, to: 1, label: 'piece 2 again', note: 'The sender resends piece 2, either because of the repeated hint or because no acknowledgement came before a timer expired.' },
        { at: 1, label: 'pieces 1, 2, 3 in order', note: 'The receiver now hands everything to the application in the right order. The program never saw the gap.' }
      ] },

    { kind: 'concept', title: 'Reliable, ordered, and polite',
      body: `That resend dance gives TCP four promises:

        - **Connection**: both sides agree before talking.
        - **Ordering**: data reaches the program in the order it was sent, even if pieces arrived shuffled.
        - **Retransmission**: anything lost is sent again.
        - **Flow control**: the receiver tells the sender how much it can handle, so a fast sender does not drown a slow receiver.

        TCP also slows down when the network itself is congested, so it behaves politely on shared links. All this makes TCP the default for web pages, files and database queries.` },

    { kind: 'concept', title: 'UDP: fast and careless',
      body: `UDP does almost nothing: it takes your message, adds a tiny header, and sends it. No handshake, no numbering, no resending.

        That sounds bad until you see who uses it:

        - **DNS lookups**: one tiny question, one tiny answer. A handshake would cost more than the question. If no answer comes, just ask again.
        - **Video calls and games**: a late frame is worthless. Better to skip it than wait.
        - **QUIC**, the transport under HTTP/3: it builds its own reliability on top of UDP, tuned for the web.

        UDP means "you decide what happens when things go wrong".` },

    { kind: 'compare', title: 'TCP vs UDP at a glance',
      cols: ['TCP', 'UDP'],
      rows: [
        ['Connection', 'Yes: handshake first', 'None: just send'],
        ['Delivery', 'Resends anything lost', 'No guarantee'],
        ['Order', 'Always in order', 'Whatever order arrives'],
        ['Overhead', 'Higher: numbering, ACKs', 'Very low'],
        ['Good for', 'Web pages, files, databases, email', 'DNS, live video and voice, games, QUIC']
      ],
      note: 'Neither is "better". They are tools for different jobs.' },

    { kind: 'metaphor', title: 'Ports: the numbered doors',
      body: `Your server has **one IP address** but runs many programs: a web server, a database, maybe an SSH login. When a packet arrives, which program gets it?

        The answer is the **[[port]] number**. Picture an office building: the IP address is the street address, and the port is the room number. Programs "listen" at a port and wait for visitors.

        Some numbers are agreed by convention, so you rarely have to guess:

        | Port | Used for |
        |---|---|
        | 22 | SSH (remote login) |
        | 53 | DNS |
        | 80 | HTTP |
        | 443 | HTTPS |
        | 5432 | PostgreSQL |
        | 3306 | MySQL |
        | 6379 | Redis |`,
      note: 'Most of these use TCP. DNS mostly uses UDP (and TCP for large answers).' },

    { kind: 'code', title: 'A socket: one end of a conversation',
      body: 'A **socket** is the program\'s handle on one end of a network conversation: an IP address plus a port. Here is a tiny Node.js server. **Tap the lines.**',
      code: { lang: 'js', src: `
        const net = require('net');

        const server = net.createServer((socket) => {
          socket.write('hello\\n');
          socket.end();
        });

        server.listen(8080);`,
        notes: {
          3: 'Each time a client connects, this function runs with a new **socket** for that one client.',
          4: 'Writing to the socket sends bytes to that client. Reading works the same way in reverse.',
          8: 'Claim port 8080 and wait for visitors. **Only one program can listen on a given port** at a time.'
        } },
      note: 'A connection is identified by four things: client address and port, server address and port. That is why one server on port 443 can serve thousands of clients at once.' },

    { kind: 'pitfall', title: '"Address already in use"',
      body: `Start your dev server and you see \`EADDRINUSE\`: **address already in use**. It means another program is already listening on that port. Usually it is an earlier copy of your own server that you forgot to stop.

        Two fixes: stop the other program, or pick a different port.

        Related trap: a service listening on \`127.0.0.1\` (localhost) is reachable only from the same machine. If it should be reachable from outside, it must listen on the machine's real address. Mixing these up causes many "works on my laptop" mysteries.` }
  ],

  activities: [
    { type: 'order', after: 2, prompt: 'Put the TCP handshake in order.',
      items: ['Client sends SYN', 'Server replies SYN-ACK', 'Client sends ACK', 'Client sends the first real data'],
      explain: 'The client opens, the server answers and opens its own side, the client confirms. Only then does real data flow, which is why every new TCP connection costs about one round trip first.' },

    { type: 'mcq', after: 3, q: 'A sender transmits pieces 1, 2 and 3. Piece 2 is lost. What does TCP do?',
      options: ['It resends only piece 2, then delivers everything to the program in order', 'It restarts the whole transfer from piece 1', 'It delivers pieces 1 and 3 and ignores the gap', 'It closes the connection and reports failure'],
      answer: 0,
      why: [null, 'Resending everything would waste time. TCP resends only what is missing.', 'That is closer to UDP behaviour. TCP hides the gap from the program.', 'Closing happens only after many failed attempts, not after one lost piece.'],
      explain: 'TCP tracks what has been acknowledged and resends just the gap. The application only ever sees an unbroken, ordered stream.' },

    { type: 'match', after: 7, prompt: 'Match each port to what normally listens there.',
      pairs: [['22', 'SSH remote login'], ['53', 'DNS'], ['443', 'HTTPS'], ['5432', 'PostgreSQL'], ['3306', 'MySQL'], ['6379', 'Redis']] },

    { type: 'bucket', prompt: 'TCP or UDP: which would you pick?', buckets: ['TCP', 'UDP'],
      items: [['Downloading an installer', 0], ['Loading a web page', 0], ['A database query', 0], ['A live video call', 1], ['A quick DNS lookup', 1], ['Position updates in a fast online game', 1]],
      explain: 'If every byte must arrive exactly right, use TCP. If late data is worse than missing data, or the exchange is tiny, UDP fits.' },

    { type: 'tf', statement: 'UDP guarantees that packets arrive, but not that they arrive in order.', answer: false,
      explain: 'UDP guarantees neither. It sends and forgets. If you need delivery or order on top of UDP, your own code (or QUIC) has to provide it.' },

    { type: 'cloze', text: 'TCP numbers its data so the receiver can restore the {{order}}, and it {{resends}} anything that is never {{acknowledged}}.',
      distractors: ['encrypts', 'ports', 'compresses'],
      explain: 'Numbers plus acknowledgements are the heart of TCP reliability.' },

    { type: 'short', q: 'Which port does PostgreSQL listen on by default?', accept: ['5432'], hint: 'Four digits, starts with 54.',
      explain: 'PostgreSQL listens on **5432**. MySQL uses 3306 and Redis 6379. Learn the common ones and server logs start to read like plain English.' },

    { type: 'estimate', q: 'A page needs 20 small files. Each is fetched over its own new TCP connection, one after another, from a server 50 ms away (round trip). Roughly how much time is spent on handshakes alone?', answer: 1000, unit: 'ms', min: 10, max: 100000,
      explain: 'Each handshake costs about one round trip, 50 ms. Twenty of them is about 1000 ms, a whole second before any real work. This is why reusing connections (keep-alive) and HTTP/2 matter.' },

    { type: 'scenario', title: 'Pick the transport', intro: 'You are building a multiplayer game with a shop. Three different messages need a transport. Choose well.',
      meters: { 'smoothness': 60, 'correctness': 60 },
      steps: [
        { text: 'The game sends each player\'s position 30 times a second. If one update is lost, the next arrives 33 ms later anyway. Which transport?',
          choices: [
            { label: 'UDP: send and forget', score: 2, effects: { 'smoothness': 25 }, feedback: 'Yes. A lost position is out of date by the time it would be resent. Newer data is always coming.' },
            { label: 'TCP: nothing may be lost', score: 0, effects: { 'smoothness': -25 }, feedback: 'One lost packet makes TCP hold back all the later ones until it is resent. Players see freezes and jumps.' },
            { label: 'Either, it makes no difference', score: 0, effects: { 'smoothness': -10 }, feedback: 'It makes a big difference for real-time traffic. Late data is worse than lost data here.' }
          ] },
        { text: 'The shop must record a purchase of an in-game item. Nothing may be lost or duplicated. Which transport?',
          choices: [
            { label: 'TCP, over a normal HTTPS API', score: 2, effects: { 'correctness': 25 }, feedback: 'Right. Ordering and retransmission are exactly what a purchase needs. (You still need idempotency for retries, as you saw in the HTTP module.)' },
            { label: 'UDP, for speed', score: 0, effects: { 'correctness': -30 }, feedback: 'A lost purchase message means a customer pays and gets nothing, or the other way round.' },
            { label: 'UDP with a message every second just in case', score: 1, effects: { 'correctness': 5 }, feedback: 'You are rebuilding TCP badly, and you risk duplicates. Use the tool that already does it.' }
          ] },
        { text: 'You start the shop\'s test server and see `EADDRINUSE` on port 3000. What is the most likely cause?',
          choices: [
            { label: 'Another program, probably an old copy of the server, is already listening on 3000', score: 2, effects: { 'correctness': 10 }, feedback: 'Exactly. Find and stop it, or choose another port. Only one program can listen on a port at a time.' },
            { label: 'The network is down', score: 0, effects: { 'correctness': -10 }, feedback: 'The error is local: your own machine refused to hand out the port twice.' },
            { label: 'TCP has run out of numbers', score: 0, effects: { 'correctness': -10 }, feedback: 'Port numbers are not used up like that. The problem is one specific port being taken.' }
          ] }
      ],
      outro: 'Choose by asking: **is late data worse than lost data?** If yes, UDP. If every byte matters, TCP.' },

    { type: 'explain', prompt: 'Explain the difference between TCP and UDP to a friend, using the registered post metaphor and one example of each.',
      model: 'TCP is like registered post with a phone call first: both sides agree to talk, every piece is numbered, and anything lost is resent, so web pages and files arrive complete and in order. UDP is like shouting across a room: no call, no resending, very quick. It suits things like DNS lookups or video calls where a late piece is useless anyway.',
      keywords: ['handshake', 'resend', 'order', 'no guarantee', 'DNS', 'video', 'fast'] }
  ],

  flashcards: [
    { q: 'What is the TCP three-way handshake?', a: 'SYN from the client, SYN-ACK from the server, ACK from the client. After it, both sides can send and receive, and data can flow.' },
    { q: 'What does TCP promise?', a: 'A connection, ordered delivery, retransmission of lost data and flow control.' },
    { q: 'When is UDP a good fit?', a: 'When speed matters more than perfection, or the exchange is tiny: DNS lookups, video calls, games, and QUIC.' },
    { q: 'Name the well-known ports: SSH, DNS, HTTP, HTTPS.', a: '22 SSH, 53 DNS, 80 HTTP, 443 HTTPS.' },
    { q: 'Ports for PostgreSQL, MySQL and Redis?', a: 'PostgreSQL 5432, MySQL 3306, Redis 6379.' },
    { q: 'What is a socket?', a: 'One end of a network conversation: an IP address plus a port, which a program reads from and writes to.' }
  ],

  glossary: [
    { term: 'Three-way handshake', def: 'The SYN, SYN-ACK, ACK exchange that opens a TCP connection and agrees starting sequence numbers.', like: 'A phone call that begins "Hello? Can you hear me?" "Yes, can you hear me?" "Yes."' },
    { term: 'UDP', def: 'A transport protocol that sends messages with no connection, no resending and no ordering. Very fast and light.', like: 'Shouting across a room.', aka: ['User Datagram Protocol'] },
    { term: 'Socket', def: 'The endpoint a program uses to send and receive over the network: an IP address plus a port number.', like: 'A phone handset: you talk into it, but it is only one end of the call.' },
    { term: 'Retransmission', def: 'Sending a piece of data again because no acknowledgement came back.', like: 'Reposting a parcel that never got a signature.' },
    { term: 'Flow control', def: 'TCP\'s way of letting the receiver tell the sender how much data it can take, so the sender does not overwhelm it.', like: 'Saying "slow down, I am still writing that down".' }
  ],

  takeaways: [
    'IP is best-effort. **TCP** adds a connection, ordering, retransmission and flow control. **UDP** adds almost nothing.',
    'A TCP connection starts with the **three-way handshake**: SYN, SYN-ACK, ACK, costing about one round trip.',
    'Use UDP when late is worse than lost (DNS, calls, games, QUIC); use TCP when every byte matters.',
    'A **port** picks the program, a **socket** is one end of a conversation. Learn 22, 53, 80, 443, 5432, 3306, 6379.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('nw-proxies', {
  eli5: 'A proxy is a middleman that passes traffic along on someone\'s behalf. A forward proxy acts for the client and hides it; a reverse proxy acts for the servers and hides them.',

  cards: [
    { kind: 'concept', title: 'Somebody in the middle',
      body: `Two situations. An office wants to block certain websites and log what staff visit. A busy website has twenty servers, but needs to present **one** address to the world.

        Both are solved by putting a helper in the middle: a **proxy**. A proxy is a server that receives a request, passes it on to somewhere else, and hands the answer back. The word means "someone acting on your behalf".

        The interesting question is: **on whose behalf?** The client's, or the servers'? The answer gives you the two kinds of proxy.` },

    { kind: 'metaphor', title: 'The assistant and the reception desk',
      body: `**A forward proxy is your personal assistant making calls for you.** The person on the other end hears the assistant's number, not yours. The assistant can also refuse to call certain people.

        **A reverse proxy is the reception desk of a company.** Callers speak to reception, never learning staff direct numbers. Reception routes the call to the right person, screens spam and keeps the line tidy.

        Same idea, opposite direction: one protects the caller, the other protects the people being called.` },

    { kind: 'diagram', title: 'A forward proxy acts for the client',
      body: 'Clients send their requests to the proxy, which then fetches from the internet. The website sees the proxy, not the client.',
      nodes: [
        { id: 'c1', label: 'Laptop', icon: '💻', x: 0, y: 0 },
        { id: 'c2', label: 'Phone', icon: '📱', x: 2, y: 0 },
        { id: 'fp', label: 'Forward proxy', icon: '🕵️', x: 1, y: 1, tone: 'accent' },
        { id: 'site', label: 'Any website', icon: '🌍', x: 1, y: 2, tone: 'info' }
      ],
      edges: [
        { from: 'c1', to: 'fp', label: 'I want a site', dashed: true },
        { from: 'c2', to: 'fp', dashed: true },
        { from: 'fp', to: 'site', label: 'fetches for them' }
      ],
      groups: [{ label: 'The client side (an office, a home)', x: 0, y: 0, w: 3, h: 2 }],
      caption: 'Typical uses: company web filtering and logging, caching for a whole office, hiding the client\'s address. Clients are usually told about the proxy and must be set up to use it.' },

    { kind: 'diagram', title: 'A reverse proxy acts for the servers',
      body: 'Visitors talk to one address. The proxy decides which server really handles each request.',
      nodes: [
        { id: 'v', label: 'Visitors', icon: '👥', x: 1, y: 0, tone: 'info' },
        { id: 'rp', label: 'Reverse proxy', icon: '🛎️', x: 1, y: 1, tone: 'accent' },
        { id: 's1', label: 'App server 1', icon: '🖥️', x: 0, y: 2 },
        { id: 's2', label: 'App server 2', icon: '🖥️', x: 1, y: 2 },
        { id: 's3', label: 'App server 3', icon: '🖥️', x: 2, y: 2 }
      ],
      edges: [
        { from: 'v', to: 'rp', label: 'one address' },
        { from: 'rp', to: 's1', dashed: true },
        { from: 'rp', to: 's2', dashed: true },
        { from: 'rp', to: 's3', dashed: true }
      ],
      groups: [{ label: 'The server side (hidden)', x: 0, y: 2, w: 3, h: 1 }],
      caption: 'Visitors never learn the servers\' real addresses, and have no idea the proxy is there.' },

    { kind: 'compare', title: 'Forward vs reverse',
      cols: ['Forward proxy', 'Reverse proxy'],
      rows: [
        ['Acts for', 'The client', 'The servers'],
        ['Hides', 'The client from the website', 'The servers from the visitors'],
        ['Who knows about it', 'The client is set up to use it', 'Clients never know it exists'],
        ['Typical jobs', 'Filtering, logging, caching, anonymity', 'Load balancing, TLS, caching, compression'],
        ['Examples', 'A company web filter', 'nginx, HAProxy, Envoy, Cloudflare']
      ],
      note: 'Memory trick: the word in front tells you whose side it is on. Forward = clients. Reverse = servers.' },

    { kind: 'sequence', title: 'What a reverse proxy does all day',
      body: 'One proxy can do several jobs for the servers behind it. Step through a request, then a repeat.',
      actors: ['Browser', 'Reverse proxy', 'App server'],
      steps: [
        { from: 0, to: 1, label: 'HTTPS request (encrypted)', note: 'The browser opens a secure connection to the proxy.' },
        { at: 1, label: 'decrypt (TLS termination)', note: 'The proxy handles the TLS handshake and certificates, so the app servers do not have to.' },
        { from: 1, to: 2, label: 'plain HTTP, inside the network', note: 'Passed to one app server, chosen by **load balancing**. Inside a trusted network this hop is sometimes left unencrypted; stricter setups re-encrypt it.' },
        { from: 2, to: 1, label: 'response', dashed: true, note: 'The app builds the page.' },
        { at: 1, label: 'compress and cache it', note: 'The proxy **compresses** the response (smaller to send) and **caches** a copy if it is allowed to.' },
        { from: 1, to: 0, label: 'HTTPS response', dashed: true, note: 'Re-encrypted and sent back.' },
        { note: 'The next visitor asking for the same page gets the cached copy straight from the proxy. The app server never even hears about it.' }
      ] },

    { kind: 'concept', title: 'API gateways: reverse proxies with extra jobs',
      body: `An **API gateway** is a reverse proxy specialised for APIs. It is the single front door to a set of backend services, and it handles the chores every API shares:

        - **routing**: \`/orders\` goes to the orders service, \`/users\` to the users service
        - **authentication**: check the API key or token once, at the door
        - **rate limiting**: stop one client hammering the API
        - **logging** for every request

        Examples include Kong and Amazon API Gateway. You will see them again when we cover APIs and microservices. For now: same idea as a reverse proxy, with API manners.` },

    { kind: 'compare', title: 'VPN vs proxy',
      body: 'People mix them up, because both can change the address websites see.',
      cols: ['HTTP proxy', 'VPN'],
      rows: [
        ['Works at', 'The application: web requests', 'The network: all traffic from the device'],
        ['Covers', 'Only apps set up to use it', 'Every app on the device'],
        ['How', 'The app asks the proxy to fetch for it', 'An encrypted tunnel to the VPN server, which sends traffic out for you'],
        ['Typical use', 'Filtering, caching, a single app', 'Public Wi-Fi, reaching a company network from home']
      ],
      note: 'A VPN moves your trust to the VPN provider, who can see where your traffic goes. It hides it from the Wi-Fi owner, not from everyone.' },

    { kind: 'code', title: 'The lost visitor address',
      body: 'Behind a reverse proxy, every connection to your app comes **from the proxy**. Your logs would show the same address for everyone. So the proxy adds headers. **Tap the lines.**',
      code: { lang: 'http', src: `
        GET /orders HTTP/1.1
        Host: shop.example.com
        X-Forwarded-For: 203.0.113.7
        X-Forwarded-Proto: https`,
        notes: {
          3: 'The **original visitor\'s address**. Without this, your app thinks every user is the proxy.',
          4: 'The visitor used HTTPS, even though the hop from the proxy to the app was plain HTTP. Useful for building correct redirect links.'
        } } },

    { kind: 'pitfall', title: 'Do not trust headers from just anyone',
      body: `Anybody can add \`X-Forwarded-For: 1.2.3.4\` to a request. If your app believes it blindly, an attacker can pretend to be any address, dodging IP bans and rate limits.

        The safe rule: trust these headers **only** when the request really came from your own proxy, and let the proxy overwrite them rather than append to whatever the client sent.

        Also remember that a proxy is a single door: if it goes down, everything behind it goes with it. Reverse proxies are usually run in pairs.` }
  ],

  activities: [
    { type: 'bucket', after: 4, prompt: 'Forward proxy or reverse proxy?', buckets: ['Forward proxy', 'Reverse proxy'],
      items: [['Blocks staff from visiting certain sites', 0], ['Spreads traffic over ten app servers', 1], ['Hides a user\'s address from the website', 0], ['Handles TLS certificates for a whole site', 1], ['Visitors do not know it exists', 1], ['Browser has to be configured to use it', 0], ['Caches a site\'s images near the front door', 1]],
      explain: 'Forward proxies work for clients (they decide where clients may go and hide who they are). Reverse proxies work for servers (they distribute, protect and speed up what visitors reach).' },

    { type: 'match', after: 5, prompt: 'Match each reverse proxy job to what it does.',
      pairs: [['TLS termination', 'Decrypts HTTPS so servers can receive plain HTTP'], ['Caching', 'Replies from a stored copy without troubling the app'], ['Compression', 'Shrinks responses before sending them'], ['Load balancing', 'Chooses which server handles each request'], ['API gateway', 'A reverse proxy adding auth, rate limits and routing']] },

    { type: 'tf', after: 7, statement: 'A VPN and an HTTP proxy do the same thing: both only handle web traffic.', answer: false,
      explain: 'A VPN tunnels **all** of a device\'s traffic at the network level. An HTTP proxy only handles the web requests of apps configured to use it.' },

    { type: 'mcq', q: 'Your app sits behind nginx. The logs show every request coming from 10.0.0.5. Why?',
      options: ['That is the proxy\'s address; visitors are named in X-Forwarded-For', 'Every visitor really does share that one address', 'The app has stopped using TCP for its connections', 'DNS is returning the wrong address for the website'],
      answer: 0,
      why: [null, 'Real visitors come from many addresses. The app only sees the connection from the proxy.', 'The app has to use TCP (or something else) to work at all. The cause is the extra hop.', 'DNS decides where visitors connect to, not who the app thinks is calling.'],
      explain: 'The app\'s connection is with the proxy, so the proxy\'s address is what the app sees. The proxy passes the original address along in `X-Forwarded-For`, and the app should trust it only from that proxy.' },

    { type: 'short', q: 'Which HTTP header usually carries the original client address through a proxy?', accept: ['X-Forwarded-For'], hint: 'It starts with X-Forwarded.',
      explain: '`X-Forwarded-For` lists the client address (and any proxies it passed through). Only trust it when it was set by your own proxy.' },

    { type: 'cloze', text: 'A {{forward}} proxy acts for the client, a {{reverse}} proxy acts for the servers, and a {{VPN}} tunnels all of a device\'s traffic.',
      distractors: ['firewall', 'socket', 'gateway'],
      explain: 'Remember whose side each is on: forward = clients, reverse = servers. A VPN works at the network level for everything.' },

    { type: 'scenario', title: 'One server, three headaches', intro: 'Your shop runs on a single app server. Black Friday is coming. You decide to put a reverse proxy in front.',
      meters: { 'uptime': 50, 'ops pain': 70 },
      steps: [
        { text: 'The one server buckles under traffic. What does the reverse proxy let you do?',
          choices: [
            { label: 'Add more app servers behind it and spread requests across them', score: 2, effects: { 'uptime': 25 }, feedback: 'Exactly. Visitors keep using one address while the proxy load balances over as many servers as you need.' },
            { label: 'Ask visitors to retry later', score: 0, effects: { 'uptime': -15 }, feedback: 'That is giving up. A proxy exists to hide the pool of servers behind one door.' },
            { label: 'Turn on a forward proxy for staff', score: 0, effects: { 'uptime': -5 }, feedback: 'A forward proxy helps clients, not your servers. It would do nothing for incoming traffic.' }
          ] },
        { text: 'Renewing the HTTPS certificate means logging in to every app server. With four servers that is a chore. What is the better setup?',
          choices: [
            { label: 'Terminate TLS at the proxy: one certificate in one place', score: 2, effects: { 'ops pain': -30 }, feedback: 'Yes. The proxy holds the certificate and the app servers speak plainly, or re-encrypt if your security rules require it.' },
            { label: 'Copy the certificate to every server and hope', score: 1, effects: { 'ops pain': 5 }, feedback: 'It works, but you multiply the work and the places where a private key can leak.' },
            { label: 'Drop HTTPS for speed', score: 0, effects: { 'ops pain': -10, 'uptime': -10 }, feedback: 'Browsers will warn visitors away. Never trade encryption for convenience.' }
          ] },
        { text: 'The security team wants the app servers\' addresses hidden and abusive clients slowed down. Where does that belong?',
          choices: [
            { label: 'At the proxy (or an API gateway): rate limits and routing at the door', score: 2, effects: { 'uptime': 15, 'ops pain': -10 }, feedback: 'Right. The proxy is the single door, so it is the natural place to check, limit and log.' },
            { label: 'Inside every app, separately', score: 1, effects: { 'ops pain': 15 }, feedback: 'Possible, but every team re-implements it and one gap is enough. A shared door beats ten locks.' },
            { label: 'Nowhere: servers are safe by default', score: 0, effects: { 'uptime': -25 }, feedback: 'Exposed servers get probed constantly. Hiding them behind a proxy is the cheapest first step.' }
          ] }
      ],
      outro: 'A reverse proxy is **one front door** for many servers: spread the load, keep certificates in one place, and do the screening there.' },

    { type: 'explain', prompt: 'Explain the difference between a forward proxy and a reverse proxy to a friend.',
      model: 'A forward proxy acts for the client, like a personal assistant who makes calls for you, so the website sees the proxy and not you. A reverse proxy acts for the servers, like a reception desk: visitors talk to it and never learn the real servers behind it. It can also decrypt HTTPS, cache and compress responses and spread requests across servers.',
      keywords: ['client', 'servers', 'hides', 'assistant', 'reception', 'load balancing', 'TLS'] }
  ],

  flashcards: [
    { q: 'Forward proxy vs reverse proxy?', a: 'A forward proxy acts for the client and hides it. A reverse proxy acts for the servers and hides them.' },
    { q: 'What jobs does a reverse proxy commonly do?', a: 'TLS termination, caching, compression and load balancing.' },
    { q: 'What is an API gateway?', a: 'A reverse proxy specialised for APIs: routing, authentication, rate limiting and logging in one front door.' },
    { q: 'How is a VPN different from an HTTP proxy?', a: 'A VPN tunnels all of a device\'s traffic at the network level. An HTTP proxy only handles web requests from apps set up to use it.' },
    { q: 'Why do apps behind a proxy see the wrong visitor address, and how is it fixed?', a: 'The connection comes from the proxy. The proxy passes the real address in X-Forwarded-For, which the app should only trust from that proxy.' }
  ],

  glossary: [
    { term: 'Proxy', def: 'A server that passes requests and responses along on behalf of someone else.', like: 'A personal assistant or a reception desk.' },
    { term: 'Forward proxy', def: 'A proxy that acts for clients, fetching things from the internet for them and hiding who they are.', like: 'An assistant who makes your calls.' },
    { term: 'Reverse proxy', def: 'A proxy in front of servers that receives all visitors\' requests and decides which server handles them.', like: 'The reception desk of a company.' },
    { term: 'TLS termination', def: 'Decrypting HTTPS at the proxy so the servers behind it handle plain HTTP.', like: 'The reception desk opens the sealed envelope and hands the letter on.' },
    { term: 'API gateway', def: 'A reverse proxy for APIs that adds routing, authentication, rate limiting and logging.', like: 'A reception desk that also checks ID badges.' },
    { term: 'VPN', def: 'An encrypted tunnel carrying all of a device\'s network traffic to another network, so traffic comes out from there.', like: 'A private tunnel under the road.', aka: ['Virtual private network'] }
  ],

  takeaways: [
    '**Forward proxy** = acts for the client, hides the client. **Reverse proxy** = acts for the servers, hides the servers.',
    'Reverse proxies do **TLS termination, caching, compression and load balancing**; an **API gateway** adds auth and rate limits.',
    'A **VPN** tunnels all traffic at the network level; an HTTP proxy only handles web requests.',
    'Behind a proxy, read the visitor address from `X-Forwarded-For`, and trust it only from your own proxy.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('nw-firewalls', {
  eli5: 'A firewall is a bouncer with a list: it checks every connection against its rules, from the top, and lets in only what the list allows. Everything else stays outside.',

  cards: [
    { kind: 'concept', title: 'Strangers are already knocking',
      body: `Put a server on the internet and automated scanners will start trying its doors almost immediately: they probe address after address, port after port, looking for anything that answers.

        Most of your machines should answer to almost nobody. A database has no business talking to the whole world.

        A **firewall** is the thing that decides. It sits at a boundary, checks traffic against a list of rules and either lets it through or drops it. This lesson is about writing those rules well and drawing the boundaries.` },

    { kind: 'metaphor', title: 'The bouncer with a list',
      body: `Picture a club with a bouncer at the door and a list.

        - The bouncer checks each arrival against the list, top to bottom, and acts on the **first line that matches**.
        - If you are not on the list at all, you do not get in.
        - A smarter bouncer **remembers** that you stepped out for fresh air, and lets you back in without checking the list again.

        That last point is the difference between a simple and a **stateful** firewall, coming up shortly.`,
      note: 'In the lab that follows, you will write allow and deny rules and fire test packets at them.' },

    { kind: 'code', title: 'A rule list, read top to bottom',
      body: 'A basic **packet filter** judges each packet by its addresses and port. **Tap the lines.**',
      code: { lang: 'text', src: `
        1  ALLOW  from anywhere        to port 443
        2  ALLOW  from 198.51.100.4    to port 22
        3  DENY   from anywhere        to anywhere`,
        notes: {
          1: 'Anyone may use HTTPS. This is a public website.',
          2: 'SSH (port 22) is for administrators only, so only one trusted address gets in. Everyone else is not on this line.',
          3: 'The **default**: anything that matched no earlier line is denied. A last catch-all deny is the safety net.'
        } },
      note: 'Rules are evaluated **in order**, and the **first match wins**. The rest are not even looked at.' },

    { kind: 'pitfall', title: 'Order is everything',
      body: `Spot what is wrong with this list:

        1. ALLOW from anywhere to anywhere
        2. DENY from 203.0.113.9 to anywhere
        3. ALLOW from anywhere to port 443

        Rule 1 matches **every** packet, so rules 2 and 3 are never reached. The attacker at 203.0.113.9 walks straight in.

        The fix: put **specific** rules first and **general** ones last, and end with a deny. When a rule "mysteriously does nothing", check whether something above it already matched.` },

    { kind: 'concept', title: 'Default deny and allow-lists',
      body: `There are two ways to run a door.

        - **Default allow**: let everybody in, and write a list of banned people. You will never finish the list. The internet has billions of potential troublemakers.
        - **Default deny**: let nobody in, and write a short list of who and what is allowed. This is an **allow-list**.

        Good firewalls use default deny. You open port 443 for the world, port 22 for your team, and everything else stays shut without you thinking about it.

        The rule of thumb: **allow what you need, deny the rest**.` },

    { kind: 'compare', title: 'Stateless vs stateful',
      body: 'A web request needs a reply to get back to you. How does the firewall treat it?',
      cols: ['Stateless filter', 'Stateful firewall'],
      rows: [
        ['Judges', 'Each packet on its own', 'Each packet **and** the connection it belongs to'],
        ['Replies', 'Need their own explicit rule', 'Let back in automatically for connections you started'],
        ['Memory', 'None', 'Keeps a table of open connections'],
        ['Outsiders starting a connection', 'Depends on the rules', 'Blocked unless a rule allows it']
      ],
      note: 'Most modern firewalls are stateful. It is the bouncer who remembers you stepped out.' },

    { kind: 'diagram', title: 'Zones: public, DMZ and private',
      body: 'Draw boundaries so that only what **must** face the internet does, and put firewalls between the zones.',
      nodes: [
        { id: 'net', label: 'The internet', icon: '🌍', x: 1, y: 0, tone: 'info' },
        { id: 'lb', label: 'Load balancer / proxy', icon: '🛎️', x: 1, y: 1, tone: 'warn' },
        { id: 'app', label: 'App servers', icon: '🖥️', x: 1, y: 2, tone: 'accent' },
        { id: 'db', label: 'Database', icon: '🗄️', x: 1, y: 3, tone: 'good' }
      ],
      edges: [
        { from: 'net', to: 'lb', label: 'HTTPS 443' },
        { from: 'lb', to: 'app', label: 'port 3000' },
        { from: 'app', to: 'db', label: 'port 5432' }
      ],
      groups: [
        { label: 'Public subnet / DMZ', x: 0, y: 1, w: 3, h: 1 },
        { label: 'Private subnet', x: 0, y: 2, w: 3, h: 2 }
      ],
      caption: 'The **DMZ** is the buffer zone for machines that must be reachable. If one is compromised, the attacker still faces another firewall before the private machines. Private servers have no direct route from the internet.' },

    { kind: 'code', title: 'Security groups: firewalls in the cloud',
      body: 'Cloud providers give each server a built-in firewall called a **security group**. In AWS, for instance, they are stateful and list only what is **allowed**: anything not listed is denied. They can name other groups instead of addresses. **Tap the lines.**',
      code: { lang: 'text', src: `
        web-sg   allow  443   from anywhere
        app-sg   allow  3000  from web-sg
        db-sg    allow  5432  from app-sg`,
        notes: {
          1: 'The only group open to the world, and only on HTTPS.',
          2: 'App servers accept traffic **only from the web group**. Even a machine inside the same network cannot talk to them.',
          3: 'The database only answers the app servers. It is invisible to everyone else, including you on your laptop.'
        } },
      note: 'Other clouds have equivalents under different names. The principle is the same: allow only what each tier needs, and chain the tiers together.' },

    { kind: 'concept', title: 'WAF: a firewall that reads HTTP',
      body: `A packet filter sees an address and a port. It cannot tell a friendly \`GET /products\` from a malicious request, because both go to port 443.

        A **web application firewall (WAF)** works at layer 7. It reads the HTTP request itself and looks for attack patterns, such as SQL injection text in a form field, scripts in a comment box, or one client hammering the login page.

        To read it, the WAF has to sit where HTTPS has been decrypted, usually at the reverse proxy or the CDN.

        A WAF is a helpful extra layer, **not** a replacement for fixing your code. It also sometimes blocks innocent requests.` },

    { kind: 'pitfall', title: 'The one rule that gets people hacked',
      body: `Under time pressure, someone opens the database port to \`0.0.0.0/0\` ("from anywhere") "just to test something". Nobody closes it. Weeks later it is found by a scanner, and the only thing between the internet and your data is a password.

        Before you open a port, ask: **who needs to reach this, from where?** Answer with a specific address range or another security group.

        And a clue for debugging later: a firewall that **drops** traffic usually shows up as a *timeout*, not an instant refusal. The last lesson uses that.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'With these rules, what happens to a packet from 203.0.113.9 going to port 22?',
      code: { lang: 'text', src: `
        1  ALLOW  from anywhere        to port 443
        2  ALLOW  from 198.51.100.4    to port 22
        3  DENY   from anywhere        to anywhere` },
      options: ['It is denied by rule 3', 'It is allowed by rule 2', 'It is allowed by rule 1', 'It is allowed, because no rule explicitly denies port 22'],
      answer: 0,
      why: [null, 'Rule 2 only names 198.51.100.4. The sender here is a different address, so it does not match.', 'Rule 1 is about port 443. This packet is going to port 22.', 'Rule 3 is exactly the catch-all that denies anything not matched earlier.'],
      explain: 'The packet matches no rule above, so it falls through to the final deny. That catch-all is default deny doing its job.' },

    { type: 'spot', after: 3, prompt: 'Tap the rule that makes the rest of the list pointless.',
      code: { lang: 'text', src: `
        1  ALLOW  from anywhere        to anywhere
        2  DENY   from 203.0.113.9     to anywhere
        3  ALLOW  from anywhere        to port 443` },
      lines: [1],
      explain: 'Rule 1 matches every packet and the first match wins, so rules 2 and 3 can never fire. The broad rule belongs at the bottom (or not at all).' },

    { type: 'tf', after: 5, statement: 'A stateful firewall needs a separate inbound rule to let the replies to your own outgoing requests back in.', answer: false,
      explain: 'A stateful firewall remembers the connection you opened and lets its replies back in automatically. A stateless filter is the one that needs explicit rules for replies.' },

    { type: 'match', prompt: 'Match each term to its meaning.',
      pairs: [['Default deny', 'Block anything not explicitly allowed'], ['Stateful firewall', 'Remembers open connections, so replies get in'], ['Security group', 'A cloud firewall attached to a server or tier'], ['DMZ', 'A buffer zone for machines that face the internet'], ['WAF', 'Reads HTTP requests for attack patterns']] },

    { type: 'bucket', prompt: 'Public subnet or private subnet?', buckets: ['Public subnet / DMZ', 'Private subnet'],
      items: [['Public-facing load balancer', 0], ['Database', 1], ['Redis cache', 1], ['Application servers', 1], ['Reverse proxy for the website', 0], ['Background workers that process jobs', 1]],
      explain: 'Only what must be reachable from the internet goes in the public zone. Everything else sits behind it with no direct route from outside.' },

    { type: 'multi', q: 'Which of these could only be noticed by something that reads the HTTP request (a WAF), not by a simple port filter?',
      options: ['SQL injection text in a login form field', 'A `<script>` tag posted in a comment box', 'A connection to a port nobody should use', 'Traffic from an address on a blocklist', 'A scan of closed ports'],
      answers: [0, 1],
      explain: 'Ports and addresses are visible to a packet filter. What is *inside* the HTTP request (form fields, scripts) can only be judged by something that reads layer 7.' },

    { type: 'short', q: 'What do we call blocking everything unless a rule explicitly allows it? (two words)', accept: ['default deny', 'deny by default'], hint: 'The opposite of default allow.',
      explain: '**Default deny** is the safe stance: you list what is needed and everything else is blocked automatically.' },

    { type: 'scenario', title: 'The exposed database', intro: 'A security scan reports that your PostgreSQL database accepts connections from anywhere on the internet. You are the one who has to fix it.',
      meters: { 'exposure': 90, 'dev speed': 60 },
      steps: [
        { text: 'What is your first change?',
          choices: [
            { label: 'Restrict port 5432 so only the app servers\' group may connect', score: 2, effects: { 'exposure': -70 }, feedback: 'That is the principle of allowing only what is needed. The app still works, and the internet can no longer even reach the database.' },
            { label: 'Change the database to a different port', score: 0, effects: { 'exposure': -10 }, feedback: 'Scanners probe every port. Moving the door does not lock it.' },
            { label: 'Rely on the strong password and move on', score: 0, effects: { 'exposure': 0 }, feedback: 'A password is a last defence, not the only one. Keep the database off the internet entirely.' }
          ] },
        { text: 'A teammate\'s new batch-job server cannot connect to the database now. What do you do?',
          choices: [
            { label: 'Add the batch server\'s group as another allowed source for 5432', score: 2, effects: { 'dev speed': 10, 'exposure': -5 }, feedback: 'Exactly. Open the door only for the party that needs it.' },
            { label: 'Open 5432 to 0.0.0.0/0 "temporarily"', score: 0, effects: { 'dev speed': 10, 'exposure': 60 }, feedback: 'Temporary openings are how breaches start. We are back where we began.' },
            { label: 'Tell them to work around it', score: 1, effects: { 'dev speed': -20 }, feedback: 'The security is intact, but you left a colleague blocked when a one-line rule would solve it.' }
          ] },
        { text: 'A month later the logs show someone typing SQL fragments into your login form. The database port is closed. What is the best next move?',
          choices: [
            { label: 'Fix the code to use parameterised queries, and add a WAF as an extra layer', score: 2, effects: { 'exposure': -15, 'dev speed': -5 }, feedback: 'Yes. Fix the real hole in the application, and let the WAF act as a second net in case something slips through.' },
            { label: 'Only add a WAF', score: 1, effects: { 'exposure': -5 }, feedback: 'It helps, but WAFs are pattern-based and can miss novel input. The bug is still in your code.' },
            { label: 'Do nothing: the firewall already blocks bad traffic', score: 0, effects: { 'exposure': 20 }, feedback: 'The port firewall only sees ports. This attack travels inside a perfectly legitimate request to port 443.' }
          ] }
      ],
      outro: 'Allow only what each tier needs, and remember: firewalls guard the **doors**, while your code guards what happens **inside**.' },

    { type: 'cloze', text: 'Firewall rules are checked {{in order}}, the {{first}} match wins, and traffic that matches nothing falls to the {{default deny}}.',
      distractors: ['last', 'allow', 'random order'],
      explain: 'Order matters because evaluation stops at the first match. A final deny is the safety net.' },

    { type: 'explain', prompt: 'Explain to a colleague why you would put the database in a private subnet and only allow the app servers to reach it.',
      model: 'The database has nothing to do with the public internet, so it should not be reachable from it. In a private subnet it has no direct route from outside, and a security group lets only the app servers connect on the database port. An attacker would have to break through the public layer and an app server first, instead of just guessing a password.',
      keywords: ['private subnet', 'default deny', 'security group', 'app servers', 'internet', 'layers'] }
  ],

  flashcards: [
    { q: 'How are firewall rules evaluated?', a: 'In order, top to bottom. The first matching rule wins. Anything that matches nothing is denied (default deny).' },
    { q: 'What is default deny, and why is it preferred?', a: 'Block everything unless explicitly allowed. A short allow-list is far easier to get right than an endless blocklist.' },
    { q: 'Stateless vs stateful firewall?', a: 'Stateless judges each packet alone. Stateful tracks connections, so replies to connections you started are let back in automatically.' },
    { q: 'What are public subnet, private subnet and DMZ?', a: 'Public/DMZ hosts machines that must face the internet (proxies, load balancers). Private hosts everything else (apps, databases) with no direct route from outside.' },
    { q: 'What does a WAF do that a packet filter cannot?', a: 'It reads the HTTP request (layer 7) and looks for attacks such as SQL injection or scripts. It complements, not replaces, fixing your code.' }
  ],

  glossary: [
    { term: 'Firewall', def: 'A device or software that allows or blocks network traffic according to a list of rules.', like: 'A bouncer with a list.' },
    { term: 'Default deny', def: 'Blocking everything that no rule explicitly allows.', like: 'A guest list: if you are not on it, you are not coming in.', aka: ['allow-list'] },
    { term: 'Stateful firewall', def: 'A firewall that remembers open connections, so replies to connections you started are allowed back in automatically.', like: 'The bouncer who remembers you stepped out for air.' },
    { term: 'Security group', def: 'A cloud firewall attached to servers, listing which traffic is allowed in and out.', like: 'A guest list stuck to one door.' },
    { term: 'DMZ', def: 'A buffer zone holding the machines that must be reachable from the internet, separated by firewalls from the private network.', like: 'The shop floor between the street and the staff-only back office.', aka: ['demilitarised zone'] },
    { term: 'WAF', def: 'A web application firewall: it reads HTTP requests and blocks ones that look like attacks.', like: 'A bouncer who actually searches your bag.', aka: ['web application firewall'] }
  ],

  takeaways: [
    'Rules run **top to bottom, first match wins**; end with a deny. Put specific rules above general ones.',
    '**Default deny**: allow only what you need and block everything else.',
    '**Stateful** firewalls remember connections, so replies are let back in automatically.',
    'Keep databases in **private subnets**, expose only proxies or load balancers, and add a **WAF** to inspect HTTP, never as a substitute for fixing code.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('nw-toolbox', {
  eli5: 'Four tiny commands answer four questions when something will not load: can I reach it (ping), which route does it take (traceroute), what does the name point to (dig), and what does the server say (curl).',

  cards: [
    { kind: 'concept', title: '"It does not work." Where?',
      body: `A page will not load. The cause could be your Wi-Fi, a broken name lookup, a dead server, a firewall, or a bug in the app. Guessing wastes hours.

        Four small commands, each answering one question, let you **find where it broke**:

        - \`ping\`: can I reach that machine, and how slow is it?
        - \`traceroute\`: which route do my packets take?
        - \`dig\`: what address does this name point to?
        - \`curl\`: what does the server actually say?

        They run in a terminal. The outputs below are short, realistic samples with made-up addresses.` },

    { kind: 'code', title: 'ping: is it there, and how slow?',
      body: '`ping` sends tiny test messages and times the replies. (On Windows use `ping -n 4`.) **Tap the lines.**',
      code: { lang: 'sh', src: `
        $ ping -c 4 shop.example.com
        PING shop.example.com (203.0.113.10) 56(84) bytes of data.
        64 bytes from 203.0.113.10: icmp_seq=1 ttl=57 time=21.4 ms
        64 bytes from 203.0.113.10: icmp_seq=2 ttl=57 time=20.9 ms
        64 bytes from 203.0.113.10: icmp_seq=4 ttl=57 time=22.1 ms

        --- shop.example.com ping statistics ---
        4 packets transmitted, 3 received, 25% packet loss, time 3004ms
        rtt min/avg/max/mdev = 20.9/21.5/22.1/0.5 ms`,
        notes: {
          1: 'Send 4 test messages to this name. Windows uses `-n 4` instead of `-c 4`.',
          2: 'The name was turned into an address first, so DNS worked.',
          3: '`time` is the **round-trip latency**: out and back in milliseconds.',
          5: 'The `icmp_seq` jumped from 2 to 4. Number 3 never came back: a **lost packet**.',
          8: 'The summary: one in four lost. Steady 0% is healthy; consistent loss means a flaky link.',
          9: 'Minimum, average and maximum round trip. Big gaps between them mean a jittery connection.'
        } },
      note: 'Some servers and firewalls ignore ping on purpose. No reply does **not** always mean the machine is down.' },

    { kind: 'code', title: 'traceroute: which route, which hop?',
      body: '`traceroute` (called `tracert` on Windows) lists every router your packets pass through. It works by sending packets with a tiny hops-left counter: each router that runs it down to zero reports back. **Tap the lines.**',
      code: { lang: 'sh', src: `
        $ traceroute shop.example.com
        traceroute to shop.example.com (203.0.113.10), 30 hops max, 60 byte packets
         1  192.168.1.1  1.2 ms  1.1 ms  1.0 ms
         2  10.20.0.1  8.4 ms  8.1 ms  8.3 ms
         3  * * *
         4  198.51.100.9  15.2 ms  15.0 ms  15.6 ms
         5  203.0.113.10  21.3 ms  21.0 ms  21.4 ms`,
        notes: {
          3: 'Hop 1: your own home router, one millisecond away. Three times are shown because three probes were sent.',
          4: 'Hop 2: probably your ISP. The jump to 8 ms is the first leg of the real journey.',
          5: '`* * *` means that router did not answer. Many are set up not to. Since hops 4 and 5 answered, packets are clearly still getting through.',
          7: 'The last hop is the destination itself. The route stops when it arrives. If it stopped at a hop and never arrived, that is where to look.'
        } },
      note: 'Look for the hop where latency jumps or where replies stop for good. That is your suspect.' },

    { kind: 'code', title: 'dig: what does this name point to?',
      body: '`dig` asks DNS a question and shows the whole answer. On Windows, `nslookup shop.example.com` does a similar job. **Tap the lines.**',
      code: { lang: 'sh', src: `
        $ dig shop.example.com
        ;; ->>HEADER<<- opcode: QUERY, status: NOERROR, id: 31522
        ;; flags: qr rd ra; QUERY: 1, ANSWER: 1, AUTHORITY: 0, ADDITIONAL: 1

        ;; ANSWER SECTION:
        shop.example.com.   300   IN   A   203.0.113.10

        ;; Query time: 24 msec
        ;; SERVER: 192.168.1.1#53(192.168.1.1)`,
        notes: {
          2: '`status: NOERROR` means the lookup worked. A typo\'d or non-existent name gives `NXDOMAIN` here: "no such name".',
          3: '`ANSWER: 1` means one record came back. `ANSWER: 0` would mean the name exists but has nothing of this type.',
          6: 'The record: name, **TTL** in seconds (300: caches may keep it for five minutes), type `A` (an IPv4 address), and the address.',
          8: 'How long the lookup took.',
          9: 'Which DNS server answered: here the home router, on port 53. If this is not the server you expected, that is a clue.'
        } },
      note: 'Add `+short` for just the address: `dig shop.example.com +short`.' },

    { kind: 'code', title: 'curl -v: what does the server say?',
      body: '`curl` makes an HTTP request from the terminal. `-v` (verbose) shows every step. Lines starting `*` are curl\'s own commentary, `>` is what it **sent**, `<` is what it **received**. **Tap the lines.**',
      code: { lang: 'sh', src: `
        $ curl -v https://shop.example.com/health
        *   Trying 203.0.113.10:443...
        * Connected to shop.example.com (203.0.113.10) port 443
        * SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384
        > GET /health HTTP/2
        > Host: shop.example.com
        > Accept: */*
        < HTTP/2 200
        < content-type: application/json
        {"status":"ok"}`,
        notes: {
          2: 'DNS has worked (curl has an address) and it is now opening a TCP connection to port 443.',
          3: 'The handshake succeeded: something is listening and answered.',
          4: 'TLS was set up. A bad certificate would fail on this step.',
          5: 'The request curl sent: method, path and protocol.',
          8: 'The **status line** of the response. `200` means success. A `502` here would say the proxy could not reach the app behind it.',
          10: 'The body of the response.'
        } },
      note: 'Handy variants: `curl -I url` shows only the headers, and `curl -s -o /dev/null -w "%{http_code}" url` prints just the status code.' },

    { kind: 'metaphor', title: 'Knocking on a door',
      body: `Three different failures, three different silences. Imagine visiting a friend.

        - **DNS failure**: you cannot find their address at all. The street does not exist in your phone book. You never even leave home.
        - **Connection refused**: you arrive and knock, and someone calls back **"nobody here wants visitors!"** Quick, definite. The house exists, but nothing is listening at that door.
        - **Timeout**: you knock and hear **nothing**. The house might be empty, or someone is ignoring you on purpose.

        The difference between a *quick no* and *silence* is the most useful clue in networking.`,
      note: 'Silence is ambiguous, which is exactly why timeouts are the hardest to debug.' },

    { kind: 'compare', title: 'Refused vs timeout vs DNS failure',
      body: 'Learn to read these three at a glance.',
      cols: ['DNS failure', 'Connection refused', 'Timeout'],
      rows: [
        ['You see', '`Could not resolve host`', '`Connection refused`, instantly', 'Nothing, then `Connection timed out`'],
        ['What happened', 'The name could not be turned into an address', 'Something answered: no program is listening on that port', 'Nothing answered at all'],
        ['Likely cause', 'Typo, missing DNS record, DNS server down', 'App crashed, not started, or wrong port', 'Firewall dropping packets, host down, or wrong address'],
        ['Try next', '`dig` the name', 'Check the service is running and its port', 'Check firewall rules and that the host is up']
      ] },

    { kind: 'steps', title: 'A debugging routine that works',
      body: 'It is the layers from lesson one, with a tool for each rung.',
      steps: [
        { title: 'Does the name resolve?', body: 'Run `dig shop.example.com`. No address means a DNS problem. Stop here and fix that first.' },
        { title: 'Can I reach the machine?', body: 'Run `ping`. Replies mean the host is up and the route works. No replies are inconclusive, since ping is often blocked.' },
        { title: 'Where does the route stop?', body: 'Run `traceroute` if packets seem to vanish. Look for where replies end or latency jumps.' },
        { title: 'Does the port answer?', body: 'Run `curl -v` against the real address and port. **Refused** = nothing listening. **Timeout** = something is dropping it, often a firewall.' },
        { title: 'Is the application healthy?', body: 'If curl connects, read the status code in the reply. Now it is an application problem, not a network one.' }
      ] },

    { kind: 'pitfall', title: 'Do not trust a missing ping',
      body: `You ping a server and get nothing. "It is down!" Not so fast.

        Many cloud setups block ping by default, and plenty of firewalls drop it silently. Meanwhile the website on port 443 works perfectly. The reverse is also true: a server can answer ping happily while the app on it has crashed.

        Ping tells you about **the machine and the route**, not the **application**. Always finish with \`curl\` against the real port, because that is the thing your users actually use.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'A traceroute shows `* * *` at hop 3, but hops 4 and 5 reply normally and the last hop is the destination. What does that tell you?',
      options: ['Hop 3 ignores the probes but still forwards traffic', 'The network is broken at hop 3, so packets stop there', 'The destination is down and is not accepting traffic', 'Hop 3 is intercepting the traffic as an attacker'],
      answer: 0,
      why: [null, 'If packets were stopped at hop 3, hops 4 and 5 could not have answered.', 'The final hop answered, so the destination was reached.', 'Nothing here suggests an attack. Routers are commonly set not to answer these probes.'],
      explain: 'Stars mean "no reply from that router", not "traffic blocked". The proof that traffic got through is that later hops answered.' },

    { type: 'match', after: 4, prompt: 'Match each tool to the question it answers.',
      pairs: [['ping', 'Is the machine reachable, and how slow?'], ['traceroute', 'Which routers do my packets pass through?'], ['dig', 'What address does this name point to?'], ['curl -v', 'What does the server say to my request?'], ['nslookup', 'A name lookup tool found on Windows']] },

    { type: 'bucket', after: 6, prompt: 'Which kind of failure does each clue point to?', buckets: ['DNS failure', 'Connection refused', 'Timeout'],
      items: [['`Could not resolve host`', 0], ['A typo in the domain name', 0], ['`Connection refused` appears instantly', 1], ['The app crashed, so nothing is listening on 5432', 1], ['Nothing happens for 30 seconds', 2], ['A firewall silently drops the packets', 2]],
      explain: 'Name unknown means DNS. A quick "no" means something answered but nothing is listening. Silence means packets are being dropped or the host is gone.' },

    { type: 'order', prompt: 'Put this debugging routine in a sensible order.',
      items: ['`dig` the name to check it resolves', '`ping` the address to check the host is reachable', '`traceroute` to find where the route stops', '`curl -v` to see how the port and the app answer'],
      explain: 'Work from the lowest, cheapest question upward: name, machine, route, then the application itself. Each answer rules a whole region out.' },

    { type: 'tf', statement: 'If ping gets no reply, the server is definitely down.', answer: false,
      explain: 'Many servers and firewalls ignore ping on purpose. The website may work perfectly well on port 443. Confirm with `curl` against the real port.' },

    { type: 'spot', prompt: 'DNS clearly worked here. Tap a line that proves curl already had the server\'s address.',
      code: { lang: 'sh', src: `
        $ curl -v http://shop.example.com:8080/
        *   Trying 203.0.113.10:8080...
        * connect to 203.0.113.10 port 8080 failed: Connection refused
        * Failed to connect to shop.example.com port 8080 after 3 ms
        curl: (7) Failed to connect to shop.example.com port 8080 after 3 ms` },
      lines: [2, 3],
      explain: 'Both lines show the numeric address. If DNS had failed, curl would have complained that it could not resolve the host before ever "trying" an address. The quick refusal then says: the machine answered, but nothing listens on port 8080.' },

    { type: 'estimate', q: 'Roughly what round-trip time would `ping` show to a server on the opposite side of the world, such as London to Sydney?', answer: 250, unit: 'ms', min: 1, max: 2000,
      explain: 'Distance sets a floor: light in fibre is slow compared with the size of the planet. Round trips to the far side of the world land in the low hundreds of milliseconds, while a server in your own city is a few milliseconds.' },

    { type: 'scenario', title: 'The site is down', intro: 'It is 08:55. Customers report that shop.example.com will not load. You open a terminal.',
      meters: { 'customer patience': 70, 'time to fix': 20 },
      steps: [
        { text: 'What is your first command?',
          choices: [
            { label: '`dig shop.example.com` to see whether the name still resolves', score: 2, effects: { 'time to fix': 5 }, feedback: 'The cheapest question first. It returns 203.0.113.10, so the name is fine. Rule out DNS and move on.' },
            { label: 'Restart every server, just in case', score: 0, effects: { 'customer patience': -20, 'time to fix': 25 }, feedback: 'You have changed things without learning anything, and you may have destroyed evidence.' },
            { label: 'Check the app\'s error logs', score: 1, effects: { 'time to fix': 15 }, feedback: 'Reasonable eventually, but if requests are not even reaching the app, the logs will say nothing. Check the network first.' }
          ] },
        { text: '`ping 203.0.113.10` times out with no replies. What do you conclude?',
          choices: [
            { label: 'Inconclusive: ping is often blocked. Try the real port with `curl -v`', score: 2, effects: { 'time to fix': 5 }, feedback: 'Yes. A missing ping proves little. Test what users actually use.' },
            { label: 'The server is dead. Declare an outage', score: 0, effects: { 'customer patience': -15 }, feedback: 'That could cause panic over nothing. Ping is routinely blocked by firewalls.' },
            { label: 'Ignore the result and wait', score: 0, effects: { 'customer patience': -15, 'time to fix': 20 }, feedback: 'Waiting is not diagnosing. You have a quick next test available.' }
          ] },
        { text: '`curl -v https://shop.example.com` fails instantly with "Connection refused". What does that mean?',
          choices: [
            { label: 'The machine answered, but nothing is listening on 443. Check the web server or proxy is running', score: 2, effects: { 'customer patience': 15, 'time to fix': -15 }, feedback: 'Exactly. A quick refusal means something answered. You log in, find the proxy crashed, and restart it. The site is back.' },
            { label: 'The firewall is dropping everything', score: 0, effects: { 'customer patience': -5, 'time to fix': 15 }, feedback: 'A dropping firewall gives silence and a timeout. An instant refusal means the machine itself replied.' },
            { label: 'DNS is wrong', score: 0, effects: { 'customer patience': -5, 'time to fix': 15 }, feedback: 'curl already knew the address (and you checked with dig). DNS is not the issue.' }
          ] }
      ],
      outro: 'Name, machine, route, port, app: **each tool rules out a layer**, and a quick refusal versus silence tells you where to look next.' },

    { type: 'explain', prompt: 'A colleague says "the API times out" and another says "the API refuses connections". Explain to a friend why those are different problems.',
      model: 'A refused connection is a quick no: the machine answered, but nothing is listening on that port, so the app is probably down or on the wrong port. A timeout is silence: nothing answered, so packets are being dropped by a firewall, or the host is down or unreachable. And a DNS failure is a third thing: the name was never turned into an address.',
      keywords: ['refused', 'timeout', 'listening', 'firewall', 'DNS', 'answered', 'silence'] }
  ],

  flashcards: [
    { q: 'What does ping tell you, and what does it not?', a: 'Whether a machine is reachable and the round-trip time. It does not prove the application works, and some hosts ignore ping on purpose.' },
    { q: 'What does traceroute show, and what is tracert?', a: 'The list of routers (hops) between you and a destination with their latency. tracert is the Windows name.' },
    { q: 'Which command looks up a DNS record, and what is the Windows alternative?', a: '`dig` shows the DNS answer. `nslookup` is available on Windows.' },
    { q: 'What do the `*`, `>` and `<` lines in `curl -v` mean?', a: '`*` is curl\'s own commentary, `>` is what it sent, `<` is what it received.' },
    { q: 'How do you tell refused, timeout and DNS failure apart?', a: 'DNS failure: the name could not be resolved. Refused: something answered quickly, nothing listens on that port. Timeout: nothing answered, often a firewall or a dead host.' }
  ],

  glossary: [
    { term: 'ping', def: 'A command that sends small test messages to a machine and times the replies, showing reachability and latency.', like: 'Shouting "hello?" down a corridor and timing the echo.' },
    { term: 'traceroute', def: 'A command that lists the routers (hops) between you and a destination, with timings. Called `tracert` on Windows.', like: 'Reading the stamps in a passport, hop by hop.', aka: ['tracert'] },
    { term: 'dig', def: 'A command that asks DNS a question and prints the full answer. `nslookup` does a similar job on Windows.', like: 'Looking a name up in the phone book and showing the whole entry.', aka: ['nslookup'] },
    { term: 'curl', def: 'A command that makes an HTTP request from the terminal. With `-v` it shows every step of the conversation.', like: 'A browser with no window, but with commentary.' },
    { term: 'Connection refused', def: 'An instant error meaning the machine replied but nothing is listening on that port.', like: 'Knocking and hearing "nobody here wants visitors!"' }
  ],

  takeaways: [
    '**ping** = reachable and how slow. **traceroute** = the route. **dig** = what the name points to. **curl -v** = what the server says.',
    '**DNS failure** = the name was not resolved. **Refused** = something answered, nobody is listening. **Timeout** = nothing answered.',
    'No ping reply does not prove the server is down. Test the real port with curl.',
    'Debug from the bottom up: name, machine, route, port, then application.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('networking', {
  title: 'The Firewall Troll',
  intro: 'A troll guards the bridge between your server and the world. It demands to know your layers, your ports and your failure messages. Answer well and it lets you pass.',
  questions: [
    { type: 'mcq', q: 'A load balancer routes `/api` requests to one pool of servers and `/images` to another. At which OSI layer is it working?',
      options: ['Layer 7: it has to read the HTTP request path', 'Layer 3: it routes on IP addresses', 'Layer 2: it reads MAC addresses', 'Layer 1: it reads the signals'],
      answer: 0,
      why: [null, 'IP addresses alone cannot tell `/api` from `/images`. That information is inside the HTTP request.', 'MAC addresses only name the next device on a local link.', 'Physical signals carry bits, not meaning.'],
      explain: 'Deciding by URL path needs the HTTP request itself, which is layer 7 (the Application layer).' },

    { type: 'tf', statement: 'TLS fits neatly into exactly one OSI layer, and everyone agrees which.', answer: false,
      explain: 'TLS runs on top of TCP and below HTTP, so it straddles layers. Textbooks and engineers disagree about whether to call it 5, 6 or 7.' },

    { type: 'order', prompt: 'A reverse proxy handles an HTTPS request. Put the steps in order.',
      items: ['The browser sends an encrypted HTTPS request to the proxy', 'The proxy decrypts it (TLS termination)', 'The proxy picks an app server and forwards the request', 'The app server builds a response', 'The proxy compresses it and sends it back encrypted'],
      explain: 'The proxy is in the middle both ways: it decrypts on the way in, chooses a server, then compresses and re-encrypts the answer.' },

    { type: 'match', prompt: 'Match each item to what it is.',
      pairs: [['UDP', 'Fast and careless: no connection, no resending'], ['Reverse proxy', 'Acts for the servers and hides them'], ['Stateful firewall', 'Remembers connections so replies get in'], ['traceroute', 'Lists the routers a packet passes through'], ['Port 6379', 'Where Redis normally listens']] },

    { type: 'bucket', prompt: 'Layer 4 (addresses and ports) or layer 7 (the HTTP request)? Sort what each device does.', buckets: ['Layer 4', 'Layer 7'],
      items: [['Allow only port 443 from anywhere', 0], ['Block a request containing SQL injection text', 1], ['Send `/api` and `/images` to different servers', 1], ['Allow SSH only from one address', 0], ['Cache responses by URL', 1], ['Spread connections over servers without reading HTTP', 0]],
      explain: 'Ports and addresses are visible at layer 4. URLs, headers and form fields are only visible at layer 7.' },

    { type: 'mcq', q: '`curl -v` to your API fails instantly with "Connection refused". What is the best reading?',
      options: ['The machine answered, but nothing is listening on that port', 'A firewall is silently dropping packets', 'DNS could not resolve the name', 'The server is switched off'],
      answer: 0,
      why: [null, 'A dropping firewall causes silence and a timeout, not an instant refusal.', 'curl already had an address to connect to, so the name was resolved.', 'A switched-off machine cannot send a refusal. Something replied.'],
      explain: 'A fast refusal means the machine itself said no. The program that should be listening is probably down, or you used the wrong port.' },

    { type: 'mcq', q: 'The same request hangs for 30 seconds and then times out. Which explanation fits best?',
      options: ['A firewall is dropping the packets, or the host is down', 'Nothing is listening on the port', 'The domain name has a typo', 'The server rejected your password'],
      answer: 0,
      why: [null, 'That produces an instant "refused", not a long wait.', 'A typo produces a quick resolution error, before any connection is tried.', 'A password check happens after a connection exists. This never connected.'],
      explain: 'Silence means nothing answered. Dropped packets (often a firewall) or a missing host cause timeouts.' },

    { type: 'cloze', text: 'DNS usually runs over {{UDP}} on port {{53}} because one tiny question does not justify a {{handshake}}.',
      distractors: ['TCP', '443', 'certificate'],
      explain: 'A lost question is simply asked again. The cost of a handshake would be larger than the whole exchange.' },

    { type: 'spot', prompt: 'These cloud firewall rules have a dangerous mistake. Tap the line.',
      code: { lang: 'text', src: `
        web-sg   allow  443   from anywhere
        app-sg   allow  3000  from web-sg
        db-sg    allow  5432  from anywhere` },
      lines: [3],
      explain: 'The database accepts connections from anywhere on the internet. It should allow port 5432 only from the app group (`from app-sg`).' },

    { type: 'ab', q: 'Which firewall approach is safer for a new server?',
      a: { lang: 'text', label: 'Allow what you need', src: `
        ALLOW  443  from anywhere
        ALLOW  22   from office
        DENY   everything else` },
      b: { lang: 'text', label: 'Block known bad', src: `
        DENY   203.0.113.9
        DENY   198.51.100.77
        ALLOW  everything else` },
      answer: 'a',
      explain: 'Default deny wins. The internet has far too many bad actors to list, but the set of things your server actually needs is short and known.' },

    { type: 'short', q: 'What is the Windows equivalent of the `traceroute` command?', accept: ['tracert'], hint: 'It is traceroute with some letters missing.',
      explain: 'On Windows the command is `tracert`. It does the same job: listing the routers between you and a destination.' },

    { type: 'multi', q: 'Which of these does TCP provide?',
      options: ['Data reaches the program in order', 'Lost data is sent again', 'A connection is agreed before data flows', 'The data is encrypted', 'Delivery is never delayed', 'No packet is ever lost in the network'],
      answers: [0, 1, 2],
      explain: 'TCP gives ordering, retransmission and a connection (plus flow control). It does not encrypt (that is TLS), and it cannot stop the network losing packets: it just recovers from it, which can cause delay.' }
  ]
});

KS.sheet('networking', {
  title: 'Networking Deep Dive: cheat sheet',
  sections: [
    { title: 'The layers',
      md: `| OSI | TCP/IP | Examples |
        |---|---|---|
        | 7 Application, 6 Presentation, 5 Session | Application | HTTP, DNS, SSH (TLS sits awkwardly here) |
        | 4 Transport | Transport | TCP, UDP, ports |
        | 3 Network | Internet | IP, routers |
        | 2 Data link, 1 Physical | Link | Ethernet, Wi-Fi, cables |

        **Mnemonic (layer 1 up):** Please Do Not Throw Sausage Pizza Away. OSI is a reference model; the internet runs on TCP/IP. **Encapsulation:** data, then segment, packet, frame, bits.` },

    { title: 'TCP vs UDP',
      md: `| | TCP | UDP |
        |---|---|---|
        | Connection | Handshake first | None |
        | Delivery | Resends lost data | No guarantee |
        | Order | Kept | Not kept |
        | Use for | Web, files, databases | DNS, calls, games, QUIC |

        **Handshake:** SYN, then SYN-ACK, then ACK. It costs about one round trip. TCP also gives flow control. A **socket** is an IP plus a port.` },

    { title: 'Well-known ports',
      md: `| Port | Service |
        |---|---|
        | 22 | SSH |
        | 53 | DNS |
        | 80 | HTTP |
        | 443 | HTTPS |
        | 5432 | PostgreSQL |
        | 3306 | MySQL |
        | 6379 | Redis |

        Only one program can listen on a port at a time. \`EADDRINUSE\` means it is taken.` },

    { title: 'Proxies and VPNs',
      md: `| | Forward proxy | Reverse proxy |
        |---|---|---|
        | Acts for | Clients | Servers |
        | Hides | The client | The servers |
        | Jobs | Filter, log, cache | TLS termination, cache, compress, load balance |

        - **API gateway** = reverse proxy + auth, rate limits, routing.
        - **VPN** tunnels *all* device traffic; an HTTP proxy handles web requests only.
        - Behind a proxy, read \`X-Forwarded-For\`, and trust it only from your own proxy.` },

    { title: 'Firewalls and zones',
      md: `- Rules run **top to bottom, first match wins**; specific before general.
        - **Default deny**: allow only what you need.
        - **Stateful** firewalls remember connections, so replies come back in.
        - **Security group** = cloud firewall; can name other groups as sources.
        - **Public subnet / DMZ**: load balancers and proxies. **Private subnet**: apps, databases.
        - **WAF** reads HTTP (layer 7) for attacks; it supplements fixing your code.
        - Never open a database port to \`0.0.0.0/0\`.` },

    { title: 'Debugging toolbox',
      md: `| Tool | Answers |
        |---|---|
        | \`ping\` | Reachable? How slow? (may be blocked) |
        | \`traceroute\` / \`tracert\` | Which hops? Where does it stop? |
        | \`dig\` / \`nslookup\` | What does the name point to? |
        | \`curl -v\` | What does the server say? |

        | Symptom | Means |
        |---|---|
        | Could not resolve host | DNS failure |
        | Instant "refused" | Nothing listening on the port |
        | Long wait, timeout | Dropped by a firewall, or host down |

        Order: name, machine, route, port, app.` }
  ]
});

