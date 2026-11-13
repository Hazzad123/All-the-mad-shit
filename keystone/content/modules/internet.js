/* Module: internet — How the Internet Works.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs internet */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('net-big-picture', {
  eli5: 'The internet is millions of separate networks joined together, passing small numbered chunks of data called packets from computer to computer until they arrive.',

  cards: [
    { kind: 'concept', title: 'You tapped a link. What just happened?',
      body: `You tap a link. Half a second later, a page from a computer on the other side of the planet is on your phone. No cable runs from your sofa to that computer. Nobody carried anything.

        So what moved, and how did it find its way?

        Here is the whole answer in one line: **the internet is a network of networks.** Your home network connects to your provider's network, which connects to bigger networks, which connect to other providers' networks, and so on, until you reach the place you are trying to talk to.

        No single company owns it all. It works because everyone agreed on the same rules for passing data along.` },

    { kind: 'metaphor', title: 'The road network',
      body: `Think of roads. Your street joins a town road, which joins a main road, which joins a motorway. Different bodies built and look after each piece: you, the council, the government. Yet you can drive from your front door to a stranger's front door in another country, because all the roads *connect*, and everyone drives on the agreed side with the agreed signs.

        The internet is the same: thousands of separately owned networks, joined at meeting points, following shared rules about how to move things.

        Where the metaphor stops: roads carry cars. The internet carries **data**, and it cuts that data into small pieces first. We will get to that.`,
      note: 'Those shared rules are called **protocols**. You will meet the main ones in this module and the next.' },

    { kind: 'diagram', title: 'From your phone to a server',
      body: 'A simplified trip. Every box is a different organisation or piece of equipment, and each one just passes things along.',
      nodes: [
        { id: 'phone', label: 'Your phone', icon: '📱', x: 1, y: 0, tone: 'accent' },
        { id: 'home', label: 'Home router', icon: '📡', x: 1, y: 1 },
        { id: 'isp1', label: 'Your ISP', icon: '🏢', x: 1, y: 2, tone: 'info' },
        { id: 'cable', label: 'Long-distance cables', icon: '🌊', x: 1, y: 3, tone: 'warn' },
        { id: 'alt', label: 'A backup route', x: 2, y: 3, tone: 'muted' },
        { id: 'isp2', label: 'The server’s ISP', icon: '🏢', x: 1, y: 4, tone: 'info' },
        { id: 'srv', label: 'A server', icon: '🖥️', x: 1, y: 5, tone: 'good' }
      ],
      edges: [
        { from: 'phone', to: 'home', label: 'Wi-Fi', dashed: true },
        { from: 'home', to: 'isp1' },
        { from: 'isp1', to: 'cable' },
        { from: 'cable', to: 'isp2' },
        { from: 'isp1', to: 'alt', dashed: true },
        { from: 'alt', to: 'isp2', dashed: true },
        { from: 'isp2', to: 'srv' }
      ],
      caption: 'The dashed backup route is why one broken cable rarely takes a whole country offline.' },

    { kind: 'concept', title: 'Clients and servers',
      body: `Two computers are talking. One of them started it, by asking for something. The other has the thing and hands it over.

        - The **client** is the one that asks. Your phone, your laptop, a smart TV.
        - The **server** is the one that answers. It is just a computer that is switched on all the time, waiting for requests.

        "Server" does not mean a special kind of machine. It describes a *role*. Your laptop could act as a server if you set it up to answer requests.

        Real servers usually live in big, cool, noisy buildings, and they are built to stay running day and night.`,
      note: 'The same device can be a client in one conversation and a server in another. The words describe who is doing what, not what the hardware is.' },

    { kind: 'metaphor', title: 'The restaurant',
      body: `You are in a restaurant. You do not walk into the kitchen and cook. You *ask*: a waiter takes your order, the kitchen prepares the dish, and the waiter brings it back.

        - You are the **client**. You ask for things.
        - The kitchen is the **server**. It holds the ingredients and does the work.
        - The order and the dish travelling back and forth are the **request** and the **response**.

        Many diners can order at once, and the kitchen keeps up. Every website you have ever used works this way: your browser orders, a server cooks.`,
      note: 'Yes, the English word "server" is also a waiter. The pun is accidental, but it helps.' },

    { kind: 'concept', title: 'Why data is chopped into packets',
      body: `Say you send a photo. It might be a few million bytes. You could send it as one giant lump, but that goes badly:

        - If one tiny error happens near the end, you would have to resend the **whole** thing.
        - While the lump hogs a link, everybody else's data has to wait.

        So the internet cuts everything into small pieces called **packets**. Each one carries a slice of your data plus a label saying where it is going and which slice it is.

        Think of posting a long letter as a stack of numbered postcards. Postcards can take different routes, arrive in any order, and be put back in sequence at the end. If one goes missing, you only resend that one.` },

    { kind: 'sequence', title: 'A photo travels as packets',
      body: 'Step through what happens when your phone uploads a photo.',
      actors: ['Phone', 'The network', 'Server'],
      steps: [
        { at: 0, label: 'chop into packets', note: 'The photo is split into many small packets. Each is numbered: 1, 2, 3, and so on.' },
        { from: 0, to: 1, label: 'packets 1, 2, 3, 4', note: 'They are sent off one after another. Routers along the way pass each packet on separately.' },
        { from: 1, to: 2, label: 'packets 2, 1, 4', note: 'They can take different routes, so they may arrive **out of order**. And look: packet 3 is missing. It got lost on the way.' },
        { at: 2, label: 'sort by number', note: 'The server puts the packets in order using their numbers, and notices that number 3 never turned up.' },
        { from: 2, to: 0, label: 'please resend packet 3', dashed: true, note: 'It asks for just the missing piece.' },
        { from: 0, to: 2, label: 'packet 3', note: 'Only one small packet is resent, not the whole photo.' },
        { at: 2, label: 'photo complete', note: 'All pieces are present and in order. The server rebuilds the photo.' }
      ] },

    { kind: 'compare', title: 'The internet is not the web',
      body: 'People use the two words as if they mean the same thing. They do not.',
      cols: ['The internet', 'The web'],
      rows: [
        ['What it is', 'The global network of connected networks', 'A service that runs *on* the internet'],
        ['What it carries', 'Any data at all', 'Web pages, images, videos and the links between them'],
        ['Needs', 'Cables, routers and shared rules', 'Browsers, web servers and addresses like `example.com`'],
        ['Other things on it', 'Email, video calls, online games, app updates', 'Nothing else: it *is* one of the things on it'],
        ['Metaphor', 'The road network', 'One kind of delivery service driving on the roads']
      ],
      note: 'When your phone checks for a game update, that uses the internet but not the web.' },

    { kind: 'realworld', title: 'Under the sea, not through the sky',
      body: `It is tempting to picture the internet as signals bouncing off satellites. In fact most traffic between continents travels through **cables lying on the sea floor**: bundles of hair-thin glass fibres carrying pulses of light, wrapped in protective layers.

        Your **ISP** (internet service provider) is the company you pay to get onto the network. It joins you to the rest. ISPs link to each other, and to the long-distance cables, using powerful devices called **routers**, which decide where each packet goes next.

        Ships' anchors and fishing nets do occasionally damage cables. The internet copes because there are many routes between places: traffic simply finds another way, sometimes a slower one.` },

    { kind: 'pitfall', title: 'Wi-Fi is not the internet',
      body: `"The internet is down!" Often it is not. Wi-Fi is only the last few metres: a radio link between your phone and your home router. If the router has lost its connection to your ISP, your Wi-Fi is perfectly healthy and you are still stuck.

        A useful test: can your phone talk to something *inside* your home (a printer, a smart speaker)? If yes, your local network is fine, and the problem is further along the line.

        Keep the layers apart in your head: the Wi-Fi in your home, your provider's network, the wider internet, and the server you are trying to reach. Any of them can be the broken one.` }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'What does "the internet is a network of networks" mean?',
      options: ['Many separately run networks are linked together and follow shared rules', 'One giant company runs a single huge network that everyone plugs into', 'Every computer is wired directly to every other computer', 'It is a set of satellites that relay messages between phones'],
      answer: 0,
      why: [null, 'No single organisation owns it. Many companies and bodies run their own parts.', 'That would need billions of cables per computer. Instead, networks join at meeting points and pass traffic along.', 'Satellites exist, but most long-distance traffic travels through cables.'],
      explain: 'Home networks, ISPs, universities, companies and data centres each run their own network. They connect at meeting points and agree on common rules, so data can hop from one to the next.' },

    { type: 'tf', after: 3, statement: 'A "server" is a special kind of computer that cannot be used for anything else.', answer: false,
      explain: 'Server describes a **role**: answering requests. Any computer can do it. Real servers are built to run all day, but the word is about what the machine is doing, not what it is.' },

    { type: 'order', after: 6, prompt: 'Put these steps of uploading a photo in order.',
      items: ['The phone cuts the photo into numbered packets', 'The packets travel across the network, possibly by different routes', 'The server notices one packet is missing and asks for it again', 'The server puts all the packets back in order', 'The finished photo is stored'],
      explain: 'Chopping happens first so each piece can travel on its own. Order and missing pieces are sorted out at the destination, which is why only the lost packet is resent.' },

    { type: 'match', prompt: 'Match each word to its job.',
      pairs: [['Client', 'The device that asks for something'], ['Server', 'The computer that answers requests'], ['Packet', 'A small, labelled slice of data'], ['ISP', 'The company that connects you to the wider network'], ['Router', 'A device that decides where a packet goes next']] },

    { type: 'bucket', prompt: 'Which belongs to the internet itself, and which is part of the web?', buckets: ['The internet (the plumbing)', 'The web (one service on it)'],
      items: [['Undersea fibre cables', 0], ['A page of HTML with links to other pages', 1], ['An online game sending moves between players', 0], ['Routers passing packets along', 0], ['Your browser showing a news site', 1], ['A phone downloading an app update', 0]],
      explain: 'Anything that moves data between machines uses the internet. The web is the particular system of linked pages, browsers and web servers built on top of it.' },

    { type: 'multi', q: 'Which of these are good reasons to cut data into packets?',
      options: ['A lost piece can be resent without resending everything', 'Many people can share the same links at once', 'Packets can take different routes if one path is busy or broken', 'Packets make the data smaller, so it takes less space', 'Each packet is guaranteed to arrive in order'],
      answers: [0, 1, 2],
      explain: 'Small pieces mean small resends, fair sharing and flexible routing. Packets do not shrink the data (the labels even add a little), and they can arrive out of order, which is why they are numbered.' },

    { type: 'short', q: 'What is the name for one small, labelled piece of data sent across a network?', accept: ['packet', 'packets'], hint: 'Think postcards.',
      explain: 'A **packet** carries a slice of your data plus a label with its destination and its position in the sequence.' },

    { type: 'scenario', title: 'The cut cable', intro: 'A ship drags its anchor across the sea floor and snaps one of the cables linking your country to a neighbouring one. You run a small online shop with customers in both countries.',
      meters: { 'orders flowing': 90, 'customer patience': 80 },
      steps: [
        { text: 'Your shop’s server is in the neighbouring country. Suddenly your own customers can still load it, but a bit slower than usual. What is the most likely explanation?',
          choices: [
            { label: 'Traffic is being sent along other, longer routes', score: 2, effects: { 'orders flowing': -5 }, feedback: 'Yes. Many routes join the two places, so packets find another way. It is longer and busier, so everything is slower, but it still works.' },
            { label: 'The cable was the only link, so the shop must be offline', score: 0, effects: { 'orders flowing': -40, 'customer patience': -15 }, feedback: 'It would be if there were only one route. But networks of networks are built with many routes, so a single break usually means slower, not dead.' },
            { label: 'Your server has been hacked', score: 0, effects: { 'customer patience': -20 }, feedback: 'Slowness plus a news story about a broken cable is a strong clue. Look for the simple explanation before the dramatic one.' }
          ] },
        { text: 'A customer emails: "Your site feels sluggish and a few pages half-loaded." Packets are queueing on the remaining routes. What do you tell them?',
          choices: [
            { label: 'A cable fault is slowing the whole region; it is not your connection or our shop, and it should recover as repairs finish', score: 2, effects: { 'customer patience': 15 }, feedback: 'Honest and specific. It also stops the customer rebooting their router for an hour.' },
            { label: 'Restart your Wi-Fi router and try again', score: 1, effects: { 'customer patience': -5 }, feedback: 'Restarting is a classic first step, but here the problem is far beyond their router. It will not help.' },
            { label: 'Say nothing and hope it fixes itself', score: 0, effects: { 'customer patience': -20 }, feedback: 'Silence reads as "broken and ignoring you". A short, truthful note costs nothing.' }
          ] }
      ],
      outro: 'The lesson: because the internet is **many networks with many routes**, damage usually causes detours and slowness before it causes silence.' },

    { type: 'explain', prompt: 'A friend asks: "Where does a web page actually come from when I tap a link?" Explain in your own words, using clients, servers and packets.',
      model: 'Your phone is the client. It asks a server, a computer that is always switched on somewhere, for the page. The request and the answer travel across many linked networks: your home router, your ISP, long-distance cables, the server\'s ISP. The data is chopped into numbered packets that are passed along by routers and put back in order at the other end.',
      keywords: ['client', 'server', 'packets', 'router', 'ISP', 'network of networks'] }
  ],

  flashcards: [
    { q: 'What is the internet?', a: 'A network of networks: thousands of separately run networks joined together, passing data along using shared rules.' },
    { q: 'What is the difference between a client and a server?', a: 'The client asks for something; the server answers. They are roles, not types of machine.' },
    { q: 'Why is data split into packets?', a: 'So lost pieces can be resent cheaply, many users can share links, and each piece can take whichever route is available.' },
    { q: 'Is the internet the same as the web?', a: 'No. The web (pages, browsers, links) is one service that runs on the internet, alongside email, games and app updates.' },
    { q: 'How does most data travel between continents?', a: 'Through cables of glass fibre lying on the sea floor, not mainly through satellites.' }
  ],

  glossary: [
    { term: 'Internet', def: 'The global network of connected networks that moves data between computers using shared rules.', like: 'The road network: separately owned roads that all join up.' },
    { term: 'Client', def: 'The side of a conversation that asks for something, such as a phone or a browser.', like: 'The diner who places an order.' },
    { term: 'Server', def: 'A computer that is always on, waiting to answer requests from clients.', like: 'The kitchen that cooks what was ordered.' },
    { term: 'Packet', def: 'A small piece of data with a label saying where it is going and which piece it is.', like: 'One numbered postcard from a long letter.' },
    { term: 'ISP', def: 'Internet service provider: the company that connects your home or phone to the wider internet.', like: 'The slip road that joins your street to the motorway.', aka: ['Internet service provider'] },
    { term: 'Router', def: 'A device that receives packets and decides which way to send each one next.', like: 'A signpost at a junction that also reads the address on every parcel.' }
  ],

  takeaways: [
    'The internet is a **network of networks**, owned by nobody and joined by shared rules.',
    'A **client** asks, a **server** answers. They are roles, not special hardware.',
    'Data travels as small numbered **packets**, so losses are cheap and routes flexible.',
    'The **web** is one service on the internet, not the internet itself.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('net-packets-ip', {
  eli5: 'Every device on the internet has a numbered address, and every packet is labelled with one, so routers can pass it along, hop by hop, until it arrives.',

  cards: [
    { kind: 'concept', title: 'Every packet needs an address',
      body: `Last lesson, packets travelled across the world. But how does a router in the middle know where one is *going*?

        The packet is labelled with a destination: an **IP address**. IP stands for Internet Protocol, the set of rules for addressing and forwarding packets.

        Think of a postal address, but made only of numbers. Every device that is on the internet gets one. An address in the older format looks like \`203.0.113.7\`: four numbers, each from 0 to 255, separated by dots.

        Routers do not know or care what is *inside* the packet. They only read the address and pass it on.` },

    { kind: 'compare', title: 'IPv4 and IPv6',
      body: 'There are two formats in use today, side by side.',
      cols: ['IPv4', 'IPv6'],
      rows: [
        ['Looks like', '`203.0.113.7`', '`2001:db8::7`'],
        ['Size', '32 bits (four numbers)', '128 bits (eight groups of hex digits)'],
        ['How many', 'About 4.3 billion in total', 'An astronomically large number'],
        ['Status', 'The original. The world ran short of free addresses', 'The replacement, rolling out gradually']
      ],
      note: 'Why not just switch? Because everything already works with IPv4, so the world runs both together while IPv6 slowly takes over.' },

    { kind: 'metaphor', title: 'The block of flats',
      body: `About 4.3 billion addresses sounds like plenty, until you remember there are more phones, laptops, TVs and light bulbs than that. So how does everything fit?

        Picture a block of flats. The *building* has one street address that the postal service knows. Inside, each flat has just a number: flat 1, flat 2, flat 3. Those flat numbers mean something only inside the building. Another block can have its own flat 1.

        Your home works like that. Your devices have **private** addresses that are only meaningful inside your home. Your router has the one **public** address that the outside world sees.`,
      note: 'Private addresses start with `192.168.`, `10.`, or fall between `172.16.` and `172.31.`. Anything else in IPv4 is public.' },

    { kind: 'diagram', title: 'NAT: one public address, many devices',
      body: 'Your router keeps track of who asked for what, and hands each reply to the right device. This translation trick is called **NAT** (network address translation).',
      nodes: [
        { id: 'laptop', label: 'Laptop 192.168.1.20', icon: '💻', x: 0, y: 0 },
        { id: 'phone', label: 'Phone 192.168.1.21', icon: '📱', x: 1, y: 0 },
        { id: 'tv', label: 'TV 192.168.1.22', icon: '📺', x: 2, y: 0 },
        { id: 'router', label: 'Home router (NAT)', icon: '📡', x: 1, y: 1, tone: 'accent' },
        { id: 'net', label: 'The internet', icon: '🌍', x: 1, y: 2, tone: 'info' }
      ],
      edges: [
        { from: 'laptop', to: 'router', dashed: true },
        { from: 'phone', to: 'router', dashed: true },
        { from: 'tv', to: 'router', dashed: true },
        { from: 'router', to: 'net', label: 'one public address', both: true }
      ],
      groups: [{ label: 'Private network (your home)', x: 0, y: 0, w: 3, h: 2 }],
      caption: 'To the outside world, your whole household looks like one device.' },

    { kind: 'code', title: 'Inside one packet',
      body: 'A packet has two parts: a **header** (the label) and a **payload** (the cargo). This is a simplified picture. **Tap the lines.**',
      code: { lang: 'text', src: `
        From:       203.0.113.7
        To:         198.51.100.4
        Piece:      3 of 12
        Hops left:  64
        ---------------------------
        (a few hundred bytes of your
         photo, message or web page)`,
        notes: {
          1: 'The **sender**. The receiver needs this so it knows where to send replies.',
          2: 'The **destination**. This is the only line most routers care about.',
          3: 'Which slice of the whole this is, so the pieces can be reassembled in order.',
          4: 'A safety counter. Every router subtracts one. If it hits zero the packet is thrown away, so a packet that is lost in a loop cannot travel forever.',
          7: 'The **payload**: the actual data. Routers pass it along without looking inside.'
        } },
      note: 'Real headers have a few more fields, and the piece numbers are really part of a different layer. You will see how they stack in the HTTP module.' },

    { kind: 'sequence', title: 'Hop by hop to the server',
      body: 'No router knows the whole route. Each one only knows the **next hop**, the neighbour that is a step closer. Step through it.',
      actors: ['Laptop', 'Home router', 'ISP router', 'Server'],
      steps: [
        { from: 0, to: 1, label: 'to 198.51.100.4 (hops left 64)', note: 'The laptop sends the packet to its router, the only door out of the house.' },
        { at: 1, label: 'check table, pick next hop', note: 'The router looks up the destination in its **routing table**: a list of "for addresses like this, send to that neighbour".' },
        { from: 1, to: 2, label: 'to 198.51.100.4 (hops left 63)', note: 'One hop done. The counter went down by one.' },
        { at: 2, label: 'check table, pick next hop', note: 'The ISP router repeats the same decision. It knows only its own neighbours.' },
        { from: 2, to: 3, label: 'to 198.51.100.4 (hops left 55)', note: 'In real life there are usually many more hops in between, perhaps ten to twenty. The counter has dropped to match.' },
        { note: 'The packet arrives. No single device ever planned the whole journey: lots of small, local decisions added up.' }
      ] },

    { kind: 'metaphor', title: 'A motorway, with three numbers that matter',
      body: `When people say the internet is "slow", they might mean three different things. A road makes them easy to separate.

        - **Bandwidth** is how many lanes the road has: how much data can flow at once. Measured in bits per second.
        - **Latency** is how long the road is: how long one packet takes to get there. Measured in milliseconds.
        - **Packet loss** is lorries that vanish on the way and have to be sent again.

        Eight lanes will not make a 10,000 km road shorter. A short road with one lane carries one lorry fast, but only one at a time.`,
      note: 'Latency has a hard floor: signals in fibre travel at roughly two thirds of the speed of light, so distance always costs time.' },

    { kind: 'pitfall', title: 'More bandwidth will not fix lag',
      body: `A shop sells you "a faster plan" to fix your laggy online game. It might not help at all.

        - **Downloading a film** needs lots of bandwidth. It does not matter much if the first packet is 50 ms late.
        - **A video call or an online game** needs low latency and little loss. It sends tiny amounts of data, but every packet must arrive *now*.

        Lag in a game usually comes from high latency or lost packets: a long route, a busy Wi-Fi connection or a congested link. A wired cable instead of Wi-Fi often fixes more than a bigger plan.`,
      note: 'A mid-call glitch like a frozen face and robotic voice is typically packet loss or a latency spike, not a lack of bandwidth.' },

    { kind: 'tip', title: 'Watch the hops yourself',
      body: `You can see all this on your own computer. Open a terminal and try:

        - \`ping example.com\` sends small test packets and reports the **round-trip time** in milliseconds, and whether any were lost.
        - \`traceroute example.com\` (on Windows: \`tracert example.com\`) lists each router the packet passes through, with the time to reach each one.

        You will usually see the first hop is your own router, then your ISP, then a number of unfamiliar names. Some hops show \`* * *\`: that router just chose not to answer. It does not mean your packet got lost.`,
      note: 'Backend engineers use ping and traceroute constantly when something "cannot reach" something else.' }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'Why was IPv6 created?',
      options: ['IPv4 only has about 4.3 billion addresses, and the world needed more', 'IPv4 packets could not carry photos or video', 'IPv4 addresses were too long to type', 'IPv6 makes every connection twice as fast'],
      answer: 0,
      why: [null, 'IPv4 packets can carry any data. The limit was how many addresses exist.', 'IPv6 addresses are actually much longer.', 'Speed is not what changed. The number of addresses is.'],
      explain: 'IPv4 uses 32 bits, which gives about 4.3 billion addresses. With billions of phones, laptops and gadgets, that ran out. IPv6 uses 128 bits so addresses are effectively unlimited.' },

    { type: 'tf', after: 3, statement: 'Your laptop\'s home address of 192.168.1.20 could be used by a stranger\'s laptop in another country at the same time.', answer: true,
      explain: 'Private addresses only mean something inside one local network. Millions of homes reuse the same ones. Only the public address of each router has to be unique on the internet.' },

    { type: 'order', after: 5, prompt: 'Put the hop-by-hop journey in order.',
      items: ['Laptop sends the packet to the home router', 'Home router checks its routing table', 'Home router forwards the packet to the next hop', 'Each router along the way repeats the check and forward', 'The packet reaches the server with its hops-left counter reduced'],
      explain: 'Every router does the same small job: read the destination, look up the best next hop, pass it on. The hops-left counter drops each time.' },

    { type: 'match', prompt: 'Match each term with what it describes.',
      pairs: [['Bandwidth', 'How much data can flow at once'], ['Latency', 'How long a packet takes to arrive'], ['Packet loss', 'Packets that never arrive and must be resent'], ['Header', 'The label with addresses and counters'], ['Payload', 'The actual data being carried'], ['Hop', 'One step from router to router']] },

    { type: 'bucket', prompt: 'Is each IPv4 address private (home-only) or public (visible on the internet)?', buckets: ['Private', 'Public'],
      items: [['192.168.0.12', 0], ['10.0.0.5', 0], ['172.16.4.9', 0], ['8.8.8.8', 1], ['172.32.0.1', 1], ['192.169.1.1', 1]],
      explain: 'The private ranges are `10.x.x.x`, `172.16.x.x` to `172.31.x.x` and `192.168.x.x`. The tricky ones are 172.32 and 192.169: close, but just outside the ranges, so they are public.' },

    { type: 'estimate', q: 'Roughly how many different addresses can IPv4 provide?', answer: 4300000000, unit: 'addresses', min: 1000000, max: 1000000000000000,
      explain: 'Four numbers of 0–255 make 32 bits, and 2 to the power 32 is about 4.3 billion. Not many, when there are more internet-connected devices than people.' },

    { type: 'short', q: 'Which command-line tool lists every router your packets pass through on the way to a server? (Mac and Linux spelling.)', accept: ['traceroute'], hint: 'Trace the route.',
      explain: '`traceroute` (Windows: `tracert`) shows each hop and the time taken to reach it. `ping` only tells you about the round trip as a whole.' },

    { type: 'scenario', title: 'The laggy game night', intro: 'Your friend Priya has a fast broadband plan, but every evening her online game stutters and her voice chat sounds robotic. She asks you for help.',
      meters: { 'Priya’s patience': 60, 'money spent': 100 },
      steps: [
        { text: 'She wants to upgrade to a plan with four times the bandwidth. What do you suggest first?',
          choices: [
            { label: 'Measure first: run ping to see round-trip time and packet loss', score: 2, effects: { 'Priya’s patience': 10 }, feedback: 'Yes. Latency and loss are what a game feels. Measuring tells you which of the three numbers is actually bad.' },
            { label: 'Upgrade the plan; more bandwidth fixes everything', score: 0, effects: { 'money spent': -30, 'Priya’s patience': -15 }, feedback: 'More lanes do not shorten the road or stop lorries vanishing. She would pay more and still lag.' },
            { label: 'Tell her to restart the game', score: 1, effects: { 'Priya’s patience': -5 }, feedback: 'Cheap, but it will not touch network-level problems.' }
          ] },
        { text: 'Ping shows round-trip times jumping between 20 ms and 400 ms, with a few packets lost. She plays on Wi-Fi from the next room. What do you try?',
          choices: [
            { label: 'Plug her console into the router with a cable and test again', score: 2, effects: { 'Priya’s patience': 20, 'money spent': -2 }, feedback: 'A cable removes the flaky radio link, which is a very common source of jitter and loss. Costs a few pounds at most.' },
            { label: 'Buy the most expensive gaming router', score: 1, effects: { 'money spent': -25 }, feedback: 'It might help, but you have not yet proved Wi-Fi is the weak point. A cable test is far cheaper.' },
            { label: 'Change her game\'s server to one on another continent', score: 0, effects: { 'Priya’s patience': -20 }, feedback: 'Distance adds latency. A server nearer to her would be the improvement, not further away.' }
          ] }
      ],
      outro: 'Slow is three different problems wearing one costume. **Name which number is bad before you spend money.**' },

    { type: 'explain', prompt: 'Explain to a friend how your laptop, phone and TV can all be online at once when the outside world sees only one address for your home.',
      model: 'Inside the home each device has a private address that only matters locally, like flat numbers in a block. The router has the one public address, like the building\'s street address. When a device sends something, the router remembers who asked, sends the request out under its public address, and passes the reply back to the right device. That translation is called NAT.',
      keywords: ['private', 'public', 'router', 'NAT', 'address'] }
  ],

  flashcards: [
    { q: 'What is an IP address?', a: 'A numeric address for a device on a network. Every packet carries a destination address so routers know where to send it.' },
    { q: 'IPv4 vs IPv6?', a: 'IPv4 has 32-bit addresses (about 4.3 billion, now scarce). IPv6 has 128-bit addresses, enough that they effectively never run out.' },
    { q: 'What do public vs private addresses mean?', a: 'Private addresses only work inside a local network (like 192.168.x.x). A public address is unique on the internet and is what the outside world sees.' },
    { q: 'What is NAT?', a: 'Network address translation: a router shares one public address among many private devices by tracking which device made each request.' },
    { q: 'Header vs payload?', a: 'The header is the label (addresses, piece number, hops left). The payload is the data being carried.' },
    { q: 'Bandwidth vs latency?', a: 'Bandwidth is how much data per second the link can carry. Latency is how long one packet takes to arrive. Lag is usually about latency, not bandwidth.' }
  ],

  glossary: [
    { term: 'IP address', def: 'A number that identifies a device on a network and is used as the destination label on packets.', like: 'A postal address made only of numbers.', aka: ['IP'] },
    { term: 'IPv4 and IPv6', def: 'The two versions of IP addresses. IPv4 looks like 203.0.113.7 and is running short. IPv6 is longer and has room for far more.', aka: ['IPv4', 'IPv6'] },
    { term: 'NAT', def: 'Network address translation: how a router lets many private devices share one public address.', like: 'The front desk of a block of flats that sorts the post to each flat.', aka: ['network address translation'] },
    { term: 'Header and payload', def: 'The two parts of a packet: the header is the label with addressing information, the payload is the data inside.', like: 'The address on an envelope versus the letter within.', aka: ['header', 'payload'] },
    { term: 'Hop', def: 'One step of a packet from one router to the next.', like: 'One leg of a relay race.', aka: ['next hop'] },
    { term: 'Latency, bandwidth and packet loss', def: 'Latency is delay, bandwidth is capacity, and packet loss is the share of packets that never arrive.', like: 'Road length, number of lanes, and lorries that go missing.', aka: ['latency', 'bandwidth', 'packet loss'] }
  ],

  takeaways: [
    'Every packet carries a destination **IP address**; routers only read the label, never the contents.',
    'IPv4 ran short (about 4.3 billion), so IPv6 exists and both run side by side.',
    '**NAT** lets a whole home share one public address, with private addresses inside.',
    'Routing is **hop by hop**: no router plans the whole route.',
    'Lag is usually **latency or loss**, not low bandwidth.'
  ],

  links: [
    { label: 'MDN: What is an IP address?', url: 'https://developer.mozilla.org/en-US/docs/Glossary/IP_Address' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('net-domains-dns', {
  eli5: 'DNS is the internet\'s phone book: you type a name like example.com, and it looks up the numeric address of the computer you want.',

  cards: [
    { kind: 'concept', title: 'Computers want numbers, people want names',
      body: `You know how to reach your favourite site: you type its name. But last lesson, you learnt that packets are addressed with **IP addresses**, which are numbers like \`203.0.113.7\`.

        Nobody wants to remember that. And if the site moves to a new server, the number changes but the name should not.

        So there is a system whose only job is to translate a name into an address. It is called the **Domain Name System**, or **DNS**.

        Your browser asks "what is the address for \`example.com\`?", gets a number back, and *then* sends the actual request to that number.` },

    { kind: 'metaphor', title: 'The contacts app',
      body: `When you want to call a friend, you tap "Sam", not 07700 900123. Your phone looks the number up in your contacts.

        DNS is a contacts app for the whole planet. The **name** is the label you remember. The **record** is the entry behind it, holding the number.

        Where the metaphor stops: your contacts live in one place, on your phone. The internet's contacts are split across millions of servers, because no single list could hold every name, survive every failure and be edited by everyone who needs to. We will see how that works in a few cards.` },

    { kind: 'code', title: 'Reading a domain name',
      body: 'A domain name reads like a chain, from the **right** to the left, going from big to small. **Tap the lines.**',
      code: { lang: 'text', src: `
        blog.example.com

        com       top-level domain (TLD)
        example   second-level domain
        blog      subdomain`,
        notes: {
          1: 'Read **right to left**. Each dot separates a smaller, more specific part.',
          3: 'The **top-level domain**: the biggest group. Others you know: `org`, `uk`, `io`. Each has an organisation looking after it.',
          4: 'The **name you actually register**. You pay to own `example` under `com`. This is the part people think of as "the domain".',
          5: 'A **subdomain** is anything you add on the left, for free, whenever you like: `blog`, `shop`, `api`, `mail`. They often point to different servers.'
        } } },

    { kind: 'concept', title: 'Who owns a name? Registries and registrars',
      body: `You cannot just start using \`example.com\`. Someone has to keep the official list of who owns what, and someone has to sell it to you.

        - A **registry** keeps the master list for one TLD. One organisation looks after everything ending in \`.com\`, another looks after \`.uk\`.
        - A **registrar** is the shop you actually buy from. It talks to the registry on your behalf.

        Think of the registry as the land registry and the registrar as the estate agent. You do not buy a name forever: you **rent** it, usually by the year. Forget to renew, and it goes back on sale.`,
      note: 'Buying the domain and hosting the website are separate things. You can buy a name from one company and point it at a server run by another.' },

    { kind: 'compare', title: 'DNS records you will meet',
      body: 'A domain\'s entries in DNS are called **records**. Each record has a type that says what kind of answer it gives.',
      cols: ['What it holds', 'Example'],
      rows: [
        ['`A`', 'An IPv4 address for the name', '`203.0.113.7`'],
        ['`AAAA`', 'An IPv6 address for the name', '`2001:db8::7`'],
        ['`CNAME`', 'An alias: "this name is another name"', '`www` → `example.com`'],
        ['`MX`', 'Which servers receive email for the domain', '`mail.example.com`'],
        ['`TXT`', 'Free text: proofs of ownership, email policies', '`"verify=abc123"`'],
        ['`NS`', 'Which servers hold this domain\'s records', '`ns1.example.com`']
      ] },

    { kind: 'sequence', title: 'The lookup: root, TLD, authoritative',
      body: 'Your browser does not do the legwork. It asks a **resolver**, usually run by your ISP or a public service, whose job is to hunt for the answer. Step through its search for `example.com`.',
      actors: ['Resolver', 'Root server', '.com server', 'example.com server'],
      steps: [
        { note: 'The browser has asked the resolver for `example.com`. It has never heard of this name, and has nothing saved. Now the resolver goes hunting.' },
        { from: 0, to: 1, label: 'example.com?', note: 'The resolver starts at the top: the **root servers**, which know who looks after each TLD.' },
        { from: 1, to: 0, label: 'ask the .com servers', dashed: true, note: 'The root does not know the answer, but knows who might: a referral to the `.com` servers.' },
        { from: 0, to: 2, label: 'example.com?', note: 'The `.com` servers know every `.com` name’s *name servers*, but not the final addresses.' },
        { from: 2, to: 0, label: 'ask example.com’s name servers', dashed: true, note: 'Another referral, this time to the servers named in the domain’s `NS` records.' },
        { from: 0, to: 3, label: 'example.com?', note: 'These **authoritative** servers hold the real records. They are the source of truth.' },
        { from: 3, to: 0, label: 'A 203.0.113.7 (cache 300 s)', note: 'The answer, with a note on how long it may be remembered.' },
        { at: 0, label: 'save in cache, tell the browser', note: 'The resolver remembers the answer, so the next person to ask gets it instantly, and hands the browser its number: `203.0.113.7`. Now the browser can connect.' }
      ] },

    { kind: 'concept', title: 'Caching and TTL: do not ask twice',
      body: `That lookup involved four conversations. Doing it for every page would be painfully slow, so every step remembers its answers. Your browser, your computer, and the resolver all keep a **cache**.

        How long may an answer be remembered? The domain owner decides, with a **TTL** (time to live): a number of seconds attached to each record.

        - A TTL of 300 means "reuse this for up to five minutes".
        - A TTL of 86400 means "reuse this for a whole day".

        Short TTL: changes spread quickly, but more lookups. Long TTL: fewer lookups, but changes spread slowly.`,
      note: 'The lab that follows lets you watch a resolver ask each server in turn, and see the cache and TTL at work.' },

    { kind: 'pitfall', title: 'DNS changes are not instant',
      body: `You move your site to a new server and update the \`A\` record. You reload and see... the old site. A friend sees the new one. What?

        Somewhere between you and the authoritative servers, a resolver still holds the *old* answer, and it will keep it until the TTL runs out. People call this **propagation**, but nothing is being pushed anywhere: copies just expire at different times.

        Plan ahead. A day before a move, lower the TTL to a few minutes. After the move is stable, raise it again.`,
      note: 'Engineers joke: "It is always DNS." Often it is.' },

    { kind: 'realworld', title: 'Root servers and your own look-ups',
      body: `The root of DNS is a famous example of a system with no single point of failure. There are 13 named root server *addresses* (labelled A to M), run by a dozen or so different organisations. Each is really hundreds of machines spread across the globe, and your query goes to a nearby one.

        Want to see DNS yourself? In a terminal:

        - \`nslookup example.com\` works on most systems.
        - \`dig example.com\` (Mac and Linux) shows the full record and TTL.

        Pro tip: when a site is "down" for one person but fine for another, DNS caching is a prime suspect.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'In `shop.example.co.uk` the part `shop` is the...',
      options: ['Subdomain', 'Top-level domain', 'Registrar', 'Name server'],
      answer: 0,
      why: [null, 'The TLD is the rightmost part: `uk`.', 'A registrar is the company you buy a domain from, not part of the name.', 'A name server is a machine that holds records, not a piece of the name.'],
      explain: 'Anything added on the left of a registered domain is a subdomain. You choose it freely, and it can point to a different server from the main site.' },

    { type: 'tf', after: 3, statement: 'A registrar and a registry are two names for the same thing.', answer: false,
      explain: 'The **registry** keeps the master list for a TLD. The **registrar** is the shop that sells you a name and records it with the registry for you.' },

    { type: 'order', after: 5, prompt: 'Put the lookup of `example.com` in order, starting after the browser asks its resolver.',
      items: ['Resolver asks a root server', 'Root points it to the .com servers', 'Resolver asks the .com servers', '.com servers point it to the domain\'s name servers', 'Authoritative server returns the IP address and TTL', 'Resolver caches the answer and passes it back'],
      explain: 'Each step narrows the search: from the whole internet, to one TLD, to one domain. The authoritative server is the end of the chain.' },

    { type: 'match', prompt: 'Match each DNS record type to what it does.',
      pairs: [['A', 'Name to IPv4 address'], ['AAAA', 'Name to IPv6 address'], ['CNAME', 'Makes one name an alias of another'], ['MX', 'Says where email for the domain goes'], ['TXT', 'Holds free text, such as ownership proofs'], ['NS', 'Says which servers hold the domain\'s records']] },

    { type: 'bucket', prompt: 'Which record type would you change?', buckets: ['A / AAAA', 'CNAME', 'MX', 'TXT'],
      items: [['Point `example.com` at a new server\'s IPv4 address', 0], ['Point `example.com` at a new IPv6 address', 0], ['Make `www` another name for `example.com`', 1], ['Make `shop` follow wherever `www` goes', 1], ['Send @example.com email to a new mail provider', 2], ['Prove to a service that you own the domain', 3]],
      explain: 'Addresses go in A and AAAA, aliases in CNAME, mail routing in MX, and everything that is "just a note" in TXT.' },

    { type: 'cloze', text: 'The resolver asks a {{root}} server first, which refers it to the {{TLD}} servers, which refer it to the {{authoritative}} servers that hold the real answer.',
      distractors: ['browser', 'registrar', 'CNAME'],
      explain: 'Root knows the TLDs, the TLD servers know each domain\'s name servers, and the authoritative servers know the records themselves.' },

    { type: 'short', q: 'Which two-letter record type says where a domain\'s email should be delivered?', accept: ['MX'], hint: 'Mail e-X-change.',
      explain: '`MX` records list the mail servers for a domain, with priorities. Without them, email to your domain has nowhere to go.' },

    { type: 'scenario', title: 'Moving house: migrating a site', intro: 'Your company\'s website is moving to a new server with a new IP address. The current `A` record has a TTL of 86400 seconds (one day). You do not want visitors to land on a dead server.',
      meters: { 'visitors reaching the site': 100, 'stress': 20 },
      steps: [
        { text: 'The move is planned for tomorrow morning. What do you do today?',
          choices: [
            { label: 'Lower the TTL to about 300 seconds, so caches expire quickly by tomorrow', score: 2, effects: { 'stress': -5 }, feedback: 'Exactly. Caches that still hold the one-day answer will expire during the day, so by the time you switch, nearly everyone will re-check within minutes.' },
            { label: 'Nothing: update the record tomorrow and hope', score: 0, effects: { 'visitors reaching the site': -30, 'stress': 20 }, feedback: 'With a one-day TTL, some visitors would be sent to the old address for up to 24 hours.' },
            { label: 'Email everyone to clear their browser cache', score: 0, effects: { 'stress': 15 }, feedback: 'The stale copy is mostly held by resolvers you do not control. Customers cannot fix that.' }
          ] },
        { text: 'Switch time. The new server is ready and tested. What do you do?',
          choices: [
            { label: 'Update the A record, and keep the old server running for a while', score: 2, effects: { 'visitors reaching the site': 0, 'stress': -5 }, feedback: 'Good. Anyone still holding the old address lands on a working server while the change spreads.' },
            { label: 'Update the A record and turn off the old server straight away', score: 0, effects: { 'visitors reaching the site': -25, 'stress': 15 }, feedback: 'Anyone whose resolver still had the old address now sees an error until their cache expires.' },
            { label: 'Delete the A record and re-add it later', score: 0, effects: { 'visitors reaching the site': -40 }, feedback: 'For a while nobody can find the site at all. Updating in place is safer.' }
          ] },
        { text: 'Everything is stable. What do you do with the TTL?',
          choices: [
            { label: 'Raise it again, to an hour or more', score: 2, effects: { 'stress': -10 }, feedback: 'A longer TTL means fewer lookups and slightly faster visits. You only needed the short one while you were moving.' },
            { label: 'Leave it at 300 forever', score: 1, effects: {}, feedback: 'It works, but resolvers must keep re-asking. A short TTL is a tool for moving, not a permanent setting.' },
            { label: 'Set it to zero', score: 0, effects: { 'visitors reaching the site': -5 }, feedback: 'That makes every lookup hit your servers, which is a slow and costly way to run a site.' }
          ] }
      ],
      outro: 'The pattern: **shrink the TTL before a change, make the change, then relax it.**' },

    { type: 'explain', prompt: 'Explain to a friend why typing a website name triggers several lookups, and why the second visit is faster.',
      model: 'The browser needs an IP address. A resolver finds it by asking the root servers, then the TLD servers, then the domain\'s own authoritative servers, which return the address. The answer is then cached for as long as the TTL allows, so the next lookup is answered from memory without repeating the search.',
      keywords: ['resolver', 'root', 'TLD', 'authoritative', 'cache', 'TTL'] }
  ],

  flashcards: [
    { q: 'What does DNS do?', a: 'It translates human-friendly domain names into IP addresses (and other records) that computers need.' },
    { q: 'In blog.example.com, name the three parts.', a: 'com is the top-level domain, example the second-level domain (the name you register), blog a subdomain.' },
    { q: 'Registry vs registrar?', a: 'The registry keeps the master list for a TLD. The registrar is the shop that sells you a name and registers it for you.' },
    { q: 'What are A, AAAA, CNAME, MX, TXT and NS records?', a: 'A: IPv4 address. AAAA: IPv6 address. CNAME: alias. MX: mail servers. TXT: free text. NS: the domain\'s name servers.' },
    { q: 'What is the order of a DNS lookup?', a: 'Resolver, then root server, then TLD server, then authoritative server. The answer is cached on the way back.' },
    { q: 'What is TTL, and why does it matter?', a: 'Time to live: how many seconds an answer may be cached. It decides how fast a DNS change reaches everyone.' }
  ],

  glossary: [
    { term: 'DNS', def: 'The Domain Name System: a worldwide, distributed directory that turns domain names into IP addresses and other information.', like: 'A phone book split across millions of servers.', aka: ['Domain Name System'] },
    { term: 'Domain name', def: 'A human-readable name such as blog.example.com, made of a top-level domain (com), a second-level domain (example) and optional subdomains (blog).', like: 'The name in your contacts app.', aka: ['TLD', 'subdomain'] },
    { term: 'DNS record', def: 'One entry in a domain\'s DNS data. Its type (A, AAAA, CNAME, MX, TXT, NS) says what sort of answer it gives.', like: 'One line in an address book.', aka: ['A record', 'CNAME', 'MX'] },
    { term: 'Resolver', def: 'The server that does the searching for you, asking root, TLD and authoritative servers in turn, and caching what it learns.', like: 'A librarian who goes off and finds the book for you.', aka: ['recursive resolver'] },
    { term: 'Authoritative server', def: 'The DNS server that holds the real, official records for a domain. The end of the lookup chain.', like: 'The original publisher, as opposed to a bookshop\'s copy.', aka: ['name server'] },
    { term: 'TTL', def: 'Time to live: how long, in seconds, a DNS answer may be stored in caches before it has to be re-checked.', like: 'The use-by date on a carton of milk.', aka: ['time to live'] }
  ],

  takeaways: [
    '**DNS** turns names into numbers; your browser looks up the address first and connects second.',
    'Read domains **right to left**: TLD, then the name you register, then subdomains.',
    'A lookup walks **resolver → root → TLD → authoritative**, then gets cached.',
    '**TTL** decides how long answers live in caches, which is why DNS changes are not instant.'
  ],

  links: [
    { label: 'MDN: DNS', url: 'https://developer.mozilla.org/en-US/docs/Glossary/DNS' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('net-hosting', {
  eli5: 'A website lives as files and programs on a computer that is always switched on and connected; hosting is just renting space and power on one.',

  cards: [
    { kind: 'concept', title: 'Where is your website, physically?',
      body: `You have built a website on your laptop. It works beautifully at \`localhost\`. You send a friend the address and... nothing. Of course: it only exists on *your* laptop.

        For the whole world to see it, the files and the program that serves them must live on a computer that is:

        - switched on **all the time**
        - connected to the internet by a fast, reliable link
        - reachable at an address that **does not change**

        Finding and running such a computer is called **hosting**. Your site is then said to be "hosted" there.` },

    { kind: 'concept', title: 'A server is just a computer with a job',
      body: `Strip away the mystique and a server is a computer. It has a processor, memory, disk, and an operating system, usually Linux. It usually has no screen or keyboard. Administrators log in over the network.

        What makes it a server is what runs on it: a program that **waits for requests** and answers them.

        Why not use your home laptop? It sleeps. Your home IP address can change. A power cut or a spilled tea ends the site. Real servers sit in buildings with spare power, cooling and several internet connections, so they stay up when your laptop would not.`,
      note: 'Servers are often described as "boxes", but they might be a physical machine, or a slice of one. We will see how in a moment.' },

    { kind: 'metaphor', title: 'Renting a place to live',
      body: `Hosting options are like housing options.

        - **Shared hosting** is a *house-share*. Cheap, but the other tenants hog the bathroom.
        - **VPS** (virtual private server) is a *flat in a block*. Your own door and your own space, in a building shared with others.
        - **Dedicated hosting** is a *detached house*. The whole machine is yours, and so is the bill.
        - **Cloud** is a *hotel*. Book a room (or fifty) when you need it, check out when you do not, pay for the nights you stayed.

        Where the metaphor stops: hotels do not let you knock through to the next room in seconds. Cloud can add capacity that fast.` },

    { kind: 'compare', title: 'Shared, VPS and dedicated',
      body: 'The three classic ways to rent a server, from cheapest to most expensive.',
      cols: ['Shared', 'VPS', 'Dedicated'],
      rows: [
        ['You get', 'A folder on a server that runs many sites', 'A guaranteed slice of a machine, with your own operating system', 'A whole physical machine'],
        ['Control', 'Low: the host sets everything up', 'High: install what you like', 'Total'],
        ['Neighbours', 'A busy neighbour can slow you down', 'Mostly isolated from each other', 'None'],
        ['Cost', 'Lowest', 'Middle', 'Highest'],
        ['Good for', 'A small, simple site', 'A growing app', 'Heavy or sensitive workloads']
      ] },

    { kind: 'concept', title: 'What "the cloud" actually means',
      body: `You have heard the joke: "the cloud is just someone else's computer". It is mostly true. Companies such as Amazon (AWS), Google (Google Cloud) and Microsoft (Azure) run enormous data centres full of servers, and **rent** them out.

        What makes it special is *how* you rent:

        - **On demand:** start a server in a minute, delete it when done.
        - **Pay for what you use**, often by the hour or even the second.
        - **Elastic:** more servers when busy, fewer when quiet.
        - **Managed extras:** databases, storage, queues, all ready to plug in.

        It is a way of renting computing like electricity, rather than owning a power station.` },

    { kind: 'compare', title: 'Static sites and dynamic sites',
      body: 'What your server actually *does* when a request arrives splits sites into two broad kinds.',
      cols: ['Static', 'Dynamic'],
      rows: [
        ['What it serves', 'Ready-made files, the same for everyone', 'Pages built **on request**, often different for each visitor'],
        ['Server work', 'Almost none: find the file, send it', 'Runs a program, often asks a database'],
        ['Example', 'A portfolio, documentation, a blog built from files', 'A shopping basket, a social feed, a bank'],
        ['Speed and cost', 'Very fast, cheap, easy to copy around the world', 'Slower per request, costs more, needs more care'],
        ['Hosting', 'Almost anywhere', 'Needs a server that can run your code']
      ],
      note: 'Many sites mix the two: static files for the shell, dynamic calls for the personal bits. The last lessons of this module show how.' },

    { kind: 'sequence', title: 'How a dynamic page gets built',
      body: 'A static site just fetches a file. A dynamic site cooks the page fresh. Here is a profile page being made.',
      actors: ['Browser', 'Web server', 'Database'],
      steps: [
        { from: 0, to: 1, label: 'GET /profile', note: 'Your browser asks for your profile page.' },
        { at: 1, label: 'run the code', note: 'The server does not have a ready-made "profile.html". It runs a program that will create one.' },
        { from: 1, to: 2, label: 'find user 42', note: 'The program needs your name and photo, which are stored in a database.' },
        { from: 2, to: 1, label: 'name, photo, bio', dashed: true, note: 'The database returns your details.' },
        { at: 1, label: 'fill in a template', note: 'The program drops your details into an HTML template.' },
        { from: 1, to: 0, label: 'finished HTML page', dashed: true, note: 'The page is sent back. Another user asking for their profile would receive a different page.' }
      ] },

    { kind: 'layers', title: 'Regions, data centres and servers',
      body: 'Big providers organise their buildings in layers. Top is the largest.',
      layers: [
        { label: 'Region', note: 'A geographic area, such as "western Europe". You choose where your app runs.', icon: '🌍', tone: 'accent' },
        { label: 'Data centre', note: 'A building full of machines. A region usually has several, far enough apart that one fire or power cut will not take out them all.', icon: '🏢', tone: 'info' },
        { label: 'Rack', note: 'A tall cabinet holding dozens of servers, with shared power and network cables.', icon: '🗄️' },
        { label: 'Server', note: 'One machine. Often sliced into several virtual servers.', icon: '🖥️' }
      ] },

    { kind: 'concept', title: 'Why the region matters, and what "uptime" means',
      body: `Distance costs time: a request that crosses an ocean takes longer than one that crosses a town. So pick a region **near your users**. Laws can matter too: some data must stay within a country or area.

        **Uptime** is the share of time your site is working, usually written as a percentage. Small differences hide big gaps:

        | Uptime | Downtime per year |
        |---|---|
        | 99% | about 3.7 days |
        | 99.9% | about 8.8 hours |
        | 99.99% | about 53 minutes |

        Providers often promise a figure like this, called a service level. Each extra "nine" is much harder, and costs much more.` },

    { kind: 'pitfall', title: 'One server is one point of failure',
      body: `A tidy setup: one VPS, one data centre, one database, all on the same machine. It works. Until the disk dies, or the building loses power, or you reboot it at the wrong moment. And your site is gone.

        Moving to "the cloud" does not fix this by itself. A cloud server fails just as easily. What the cloud gives you is the *ability* to run several copies, in different data centres, so that one failure does not take you out.

        Whenever you see a single box in an architecture diagram, ask: **what happens when this one dies?** The Scaling and Resilience worlds later are all about good answers.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'Why is a server in a data centre a better home for a website than your home laptop?',
      options: ['It stays on, stays connected and keeps a stable address', 'It runs a special kind of internet that laptops cannot use', 'It uses a different language from your laptop', 'Laptops are not able to answer requests at all'],
      answer: 0,
      why: [null, 'There is just one internet. Servers and laptops both use it.', 'Languages are not the difference. A laptop could run the same software.', 'A laptop can serve requests, but it sleeps, moves and loses power.'],
      explain: 'A server is just a computer, but one set up to be always on, always reachable and at a fixed address, with backup power and cooling around it.' },

    { type: 'match', after: 3, prompt: 'Match each hosting type to its housing metaphor.',
      pairs: [['Shared hosting', 'A house-share with other tenants'], ['VPS', 'A flat in a block'], ['Dedicated server', 'A detached house all to yourself'], ['Cloud', 'A hotel: book rooms when needed']] },

    { type: 'order', after: 6, prompt: 'Put the steps of building a dynamic profile page in order.',
      items: ['The browser asks the web server for the profile page', 'The server runs a program', 'The program asks the database for the user\'s details', 'The details are dropped into an HTML template', 'The finished page is sent back to the browser'],
      explain: 'A dynamic page does not exist until someone asks for it. The program fetches the data, then fills a template, then sends the result.' },

    { type: 'bucket', prompt: 'Does this site need to be built fresh for each visitor (dynamic), or can it be a set of ready-made files (static)?', buckets: ['Static', 'Dynamic'],
      items: [['A personal portfolio with four fixed pages', 0], ['A bank\'s "my account" page', 1], ['A documentation site built from text files', 0], ['A social media feed', 1], ['A shop\'s basket page', 1], ['A company brochure with opening hours', 0]],
      explain: 'If every visitor should see the same thing, ready-made files will do. If the page depends on who is asking, or on data that changes constantly, a program must build it.' },

    { type: 'tf', statement: 'Switching to the cloud automatically makes your site stay up if one data centre loses power.', answer: false,
      explain: 'A cloud server in one data centre fails like any other. The cloud only makes it **easy** to run copies in several places. You still have to design for that.' },

    { type: 'multi', q: 'Which of these are good reasons to choose a hosting region close to your users?',
      options: ['Requests and responses travel a shorter distance, so pages feel quicker', 'The data may need to stay inside a certain country or area', 'It makes your site\'s uptime percentage higher', 'Latency, the delay in a packet arriving, is lower', 'It stops you from needing a domain name'],
      answers: [0, 1, 3],
      explain: 'Distance adds latency, and some laws care where data lives. Region does not change uptime directly, and has nothing to do with domain names.' },

    { type: 'estimate', q: 'A host promises 99.95% uptime. Roughly how many hours of downtime a year is that allowed to include?', answer: 4.4, unit: 'hours per year', min: 0.1, max: 1000,
      explain: 'A year has about 8,760 hours, and 0.05% of that is about 4.4 hours. Because 99.9% is about 8.8 hours, halving the gap halves the allowed downtime.' },

    { type: 'scenario', title: 'Launch day', intro: 'You are launching a small shop. It has a marketing site (the same for everyone), and an ordering system (different for everyone). Budget is tight, and you hope for a burst of publicity.',
      meters: { 'site stays up': 80, 'budget': 70 },
      steps: [
        { text: 'Where do you put the marketing pages, which never change per visitor?',
          choices: [
            { label: 'As static files on cheap static hosting', score: 2, effects: { 'budget': 10, 'site stays up': 5 }, feedback: 'Ready-made files are cheap, fast and nearly impossible to overload.' },
            { label: 'On the same dynamic server as the ordering system, built fresh each time', score: 1, effects: { 'site stays up': -10 }, feedback: 'Works, but a rush of curious visitors now competes with paying customers for the same machine.' },
            { label: 'On a dedicated physical machine just for them', score: 0, effects: { 'budget': -40 }, feedback: 'Heavy and costly for files that never change.' }
          ] },
        { text: 'The ordering system needs code and a database. You are new, and the traffic is unknown. What do you pick?',
          choices: [
            { label: 'A small cloud server you can resize, plus a managed database', score: 2, effects: { 'budget': -10, 'site stays up': 10 }, feedback: 'On-demand capacity suits unknown traffic: start small, scale if the publicity works.' },
            { label: 'A big dedicated server, bought for a year, to be safe', score: 0, effects: { 'budget': -45 }, feedback: 'You would pay for capacity you may never use.' },
            { label: 'Your own laptop at home, to save money', score: 0, effects: { 'site stays up': -40 }, feedback: 'It sleeps, the home address may change, and one power cut ends the shop.' }
          ] },
        { text: 'A cloud region has an outage in one data centre. How could you have been protected?',
          choices: [
            { label: 'Run a copy of the ordering system in a second data centre in the same region', score: 2, effects: { 'budget': -10, 'site stays up': 15 }, feedback: 'Copies in separate buildings mean one failure does not take everything down.' },
            { label: 'Hope the provider never fails', score: 0, effects: { 'site stays up': -30 }, feedback: 'Every provider has outages. The only question is whether you planned for one.' },
            { label: 'Buy a bigger server in the same building', score: 0, effects: { 'budget': -20, 'site stays up': -5 }, feedback: 'Bigger is not safer: the building is still a single point of failure.' }
          ] }
      ],
      outro: 'Match the hosting to the job: **static where you can, dynamic where you must, and copies wherever failure would hurt.**' },

    { type: 'explain', prompt: 'Someone says, "The cloud is just someone else\'s computer." In what ways is that true, and what does it miss?',
      model: 'It is true that cloud providers run ordinary servers in data centres and rent them out. It misses how you rent: on demand, paid by usage, adding or removing capacity in minutes, with managed extras like databases. It also does not mean it never fails; you still need copies in several places.',
      keywords: ['rent', 'data centre', 'on demand', 'pay for what you use', 'servers', 'scale'] }
  ],

  flashcards: [
    { q: 'What is a server, really?', a: 'An ordinary computer, usually without a screen, that runs a program waiting for requests and is kept on, connected and at a stable address.' },
    { q: 'Shared vs VPS vs dedicated hosting?', a: 'Shared: many sites on one server. VPS: your own virtual slice of a machine. Dedicated: a whole physical machine to yourself.' },
    { q: 'What does "the cloud" really mean?', a: 'Renting computing from big providers on demand, paying for what you use, and scaling up or down quickly.' },
    { q: 'Static vs dynamic site?', a: 'Static sites serve ready-made files, the same for everyone. Dynamic sites run code (and often query a database) to build each page on request.' },
    { q: 'What do 99.9% and 99.99% uptime allow per year?', a: 'About 8.8 hours and about 53 minutes of downtime.' }
  ],

  glossary: [
    { term: 'Hosting', def: 'Renting space and power on an always-on, internet-connected computer so that your website can be reached by anyone.', like: 'Renting a shop unit rather than selling from your living room.' },
    { term: 'VPS', def: 'Virtual private server: your own slice of a physical machine with its own operating system, sharing the hardware with other customers.', like: 'A flat in a block.', aka: ['virtual private server'] },
    { term: 'Cloud', def: 'Computing resources rented on demand from large providers, paid for by use and quick to scale up or down.', like: 'Electricity from the grid instead of your own generator.' },
    { term: 'Static vs dynamic site', def: 'A static site serves pre-made files. A dynamic site runs code to build pages on request, often using a database.', like: 'A printed leaflet versus a made-to-order meal.', aka: ['static site', 'dynamic site'] },
    { term: 'Data centre', def: 'A building filled with servers, backed by spare power, cooling and several network connections.', like: 'A warehouse for computers.', aka: ['region'] },
    { term: 'Uptime', def: 'The percentage of time a service is working. Each extra nine (99.9%, 99.99%) cuts allowed downtime tenfold.', like: 'How many days a shop is open as promised.' }
  ],

  takeaways: [
    'A server is **just a computer** that stays on, stays connected and answers requests.',
    'Shared, VPS, dedicated and cloud trade **cost, control and flexibility**.',
    '**Static** sites serve files; **dynamic** sites build pages on request using code and data.',
    'Pick a region near users, and remember that **one box is one point of failure**.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('net-client-server', {
  eli5: 'The backend is the part of an app that runs on a server and does the real work (rules, data, security) every time a client sends it a request.',

  cards: [
    { kind: 'concept', title: 'Every click is a question',
      body: `You open a shopping app and tap **My orders**. In a flash the list appears. What just happened?

        Your phone, the **client**, sent a message to a **server**: "please show me this customer's orders". The server found the orders and sent a message back.

        That pair is the **request/response cycle**, and nearly everything online is built on it:

        - the client sends a **request**
        - the server sends back a **response**
        - then the conversation is over

        The client always speaks first. A server never calls you out of the blue; it only answers.` },

    { kind: 'sequence', title: 'One trip through the cycle',
      body: 'Here is the "My orders" tap in slow motion.',
      actors: ['App', 'Server', 'Database'],
      steps: [
        { from: 0, to: 1, label: 'GET /orders', note: 'The app sends a **request**: what it wants (the orders) and who is asking.' },
        { at: 1, label: 'check who is asking', note: 'The server first works out *who you are* and whether you may see these orders.' },
        { from: 1, to: 2, label: 'orders for user 42', note: 'The orders are not stored in the server\'s head. They live in a **database**, so the server asks it.' },
        { from: 2, to: 1, label: 'rows of data', dashed: true, note: 'The database returns the raw records.' },
        { from: 1, to: 0, label: '200 OK + order list', dashed: true, note: 'The server packages them into a **response**. The `200` means "all went well". The next module covers those codes.' },
        { at: 0, label: 'draw the screen', note: 'The app turns the data into the list you see.' }
      ] },

    { kind: 'metaphor', title: 'The shop floor and the stockroom',
      body: `A clothes shop has two halves. On the **shop floor**, customers see rails, signs and tills, all designed to be pleasant. Behind a door is the **stockroom**, where stock is counted and delivered and prices are set. Customers never see it, but nothing on the floor works without it.

        An app is the same. The **front end** is the shop floor: what appears on your screen. The **back end** is the stockroom: the code and data running on servers, out of sight.

        Where the metaphor stops: in a shop you trust the staff on both sides. On the internet you trust the back end and never the customer's side. A later card shows why.` },

    { kind: 'compare', title: 'Front end and back end',
      body: 'The same app, two halves, two worlds.',
      cols: ['Front end', 'Back end'],
      rows: [
        ['Runs on', 'The user\'s device (phone, laptop)', 'A server you control'],
        ['Job', 'Show things, react to taps and typing', 'Decide, store, protect, connect'],
        ['Written in', 'HTML, CSS and JavaScript', 'Any language: JavaScript, Python, Java, Go, C# and more'],
        ['Who can see the code', 'Anyone willing to look', 'Only you'],
        ['Can you trust it?', 'No: users can change what runs in their browser', 'Yes, that is where the rules live']
      ] },

    { kind: 'diagram', title: 'What a backend is made of',
      body: 'Four jobs come up again and again. Every backend you meet is some mix of them.',
      nodes: [
        { id: 'client', label: 'Client (app or browser)', icon: '📱', x: 1, y: 0 },
        { id: 'logic', label: 'Backend: logic', icon: '⚙️', x: 1, y: 1, tone: 'accent' },
        { id: 'auth', label: 'Auth: who are you?', icon: '🔑', x: 0, y: 2, tone: 'warn' },
        { id: 'db', label: 'Data: the database', icon: '🗄️', x: 1, y: 2, tone: 'good' },
        { id: 'ext', label: 'Integrations', icon: '🔌', x: 2, y: 2, tone: 'info' },
        { id: 'pay', label: 'Payments, email, maps…', x: 2, y: 3, tone: 'muted' }
      ],
      edges: [
        { from: 'client', to: 'logic', label: 'request', both: true },
        { from: 'logic', to: 'auth', dashed: true },
        { from: 'logic', to: 'db', both: true },
        { from: 'logic', to: 'ext', dashed: true },
        { from: 'ext', to: 'pay', dashed: true, both: true }
      ],
      caption: 'Logic is the rules ("a basket over £50 gets free delivery"). Auth is identity and permission. Data is storage. Integrations are other companies\' services.' },

    { kind: 'steps', title: 'Placing an order, behind the scenes',
      body: 'Tap by tap, here is what a backend does when you press **Buy**.',
      steps: [
        { title: 'Identify', body: 'Who is asking? The request carries proof of who you are, and the server checks it. No proof, no order.' },
        { title: 'Validate', body: 'Is the request sane? Is the basket empty? Is the quantity negative? Never assume the client sent sensible data.' },
        { title: 'Apply the rules', body: 'Work out the real price from the real prices *on the server*, include delivery and discounts, and check stock.' },
        { title: 'Call outside services', body: 'Ask a payment provider to charge the card. Wait for its answer. If it says no, stop here.' },
        { title: 'Save', body: 'Write the order to the database so it survives a restart.' },
        { title: 'Respond', body: 'Send back "order confirmed" and an order number, and perhaps queue a confirmation email.' }
      ] },

    { kind: 'code', title: 'A server is a program that listens on a port',
      body: `A computer can run many server programs at once. The IP address gets a packet to the right *machine*. A **port** is a numbered door that gets it to the right *program*. A program claims one and **listens** there. By convention, web servers use 80 (plain) and 443 (secure). **Tap the lines.**`,
      code: { lang: 'js', src: `
        const http = require('http');

        const server = http.createServer((req, res) => {
          res.end('Hello from the backend!');
        });

        server.listen(3000);`,
        notes: {
          1: 'Node.js, a way of running JavaScript outside the browser, includes a tool for building servers.',
          3: 'This function is the **handler**. It runs once for *every* request that arrives. `req` is the request, `res` is how you reply.',
          4: 'Send the response. The client sees this text. A real server would work out the answer here: check, ask the database, and so on.',
          7: 'Claim **port 3000** and wait. Run this and visit `http://localhost:3000`: `localhost` means "this very computer".'
        } },
      note: 'A running program is called a **process**. Two processes cannot listen on the same port. If you ever see "port already in use", that is why.' },

    { kind: 'metaphor', title: 'The receptionist with no memory',
      body: `Picture a receptionist who forgets everyone the moment they walk away. You say, "Hi, I'm Sam, I would like to see my file." They fetch it. You ask a follow-up: "And the one before?" They look blank: "Sorry, who are you?"

        That is how servers treat requests. **Each request stands alone.** The server does not remember that you asked a moment ago. To get continuity, the client must bring proof each time: "I'm Sam, here's my badge."

        This sounds annoying, but it is a gift. Any one of many servers can answer any request, and a server that restarts forgets nothing important.`,
      note: 'Staying logged in is done by sending a small token with every request. The next module on HTTP explains exactly how.' },

    { kind: 'pitfall', title: 'Never trust the front end',
      body: `A shop's checkout page sends: \`{"item": "headphones", "price": 1}\`. The front end showed £79, but anyone can open the browser tools, edit the request, and send £1. If the backend believes the number, the shop sells headphones for a pound.

        Everything that arrives from a client is just a **claim**. Prices, user IDs, "is admin: true", all of it. The backend must look up the real price, check who the user really is, and reject nonsense.

        Front-end checks, like a red box around a bad email, are for **friendliness**. Back-end checks are for **safety**. You need both.` },

    { kind: 'realworld', title: 'What backends are built with',
      body: `Backends are written in almost every language: JavaScript (Node.js), Python, Java, C#, Go, Ruby, PHP and others. Which one matters less than you would guess. The ideas in this site apply to all of them.

        A backend usually wraps its work in an **API**: a menu of requests that clients may send, such as "list orders" or "create order", answered in a data format like JSON. The same backend can then serve a website, an iPhone app and an Android app at once.

        When you hear "full-stack developer", it means someone who can build both the front end and the back end.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'In the request/response cycle, which side speaks first?',
      options: ['The client sends a request', 'The server sends the data it thinks you will want', 'The database, to say it is ready', 'Whichever has the faster connection'],
      answer: 0,
      why: [null, 'A server waits to be asked. It does not guess what clients want.', 'The database only ever answers the server.', 'Speed does not decide it. The roles do.'],
      explain: 'Clients ask, servers answer. A server sits and listens; nothing happens until a request arrives.' },

    { type: 'tf', after: 3, statement: 'Because code on the front end runs on the user\'s own device, a user can inspect and change it.', answer: true,
      explain: 'The user owns the device and the browser. They can read your front-end code and edit what it sends. That is why important checks must be repeated on the back end.' },

    { type: 'order', after: 5, prompt: 'Put the backend\'s work on a "Buy" request in a sensible order.',
      items: ['Check who is asking', 'Validate the request', 'Work out the real price from server-side data', 'Ask the payment provider to charge the card', 'Save the order to the database', 'Send the confirmation response'],
      explain: 'Cheap checks come first so you waste no effort on bad requests. You take the money before saving the order as paid, and the response goes last, because it reports what happened.' },

    { type: 'bucket', prompt: 'Where does each job belong?', buckets: ['Front end', 'Back end'],
      items: [['Animating a menu as it opens', 0], ['Working out the true price of a basket', 1], ['Showing an error in red under a text box', 0], ['Charging a card through a payment provider', 1], ['Saving an order so it survives a restart', 1], ['Deciding which button is blue', 0]],
      explain: 'The front end handles what the user sees and touches. Anything involving rules, money, data or permission belongs on the back end, where the user cannot tamper with it.' },

    { type: 'match', prompt: 'Match each term to what it means.',
      pairs: [['Port', 'A numbered door on a machine, claimed by one program'], ['Process', 'A program that is currently running'], ['Port 443', 'The usual door for secure web traffic'], ['localhost', 'This very computer, not somewhere else'], ['Handler', 'The function that runs for each incoming request']] },

    { type: 'spot', prompt: 'This server tries to remember who logged in. Tap a line where the bug starts.',
      code: { lang: 'js', src: `
        let currentUser = null;
        http.createServer((req, res) => {
          if (req.url === '/login') currentUser = 'Sam';
          if (req.url === '/profile') res.end('Hello ' + currentUser);
        }).listen(3000);` },
      lines: [1, 3],
      explain: 'The variable on line 1 is shared by *every* request from *every* user. The moment Sam logs in, everybody else is "Sam" too. Each request stands alone, so identity must travel with the request itself, not be left lying around in the server.' },

    { type: 'multi', q: 'Which of these are typical jobs of a backend?',
      options: ['Applying business rules, like free delivery over £50', 'Storing and fetching data from a database', 'Checking who the user is and what they are allowed to do', 'Calling outside services, such as a payment provider', 'Deciding how big the heading looks on a phone'],
      answers: [0, 1, 2, 3],
      explain: 'Logic, data, auth and integrations are the four recurring jobs. Heading size is presentation, which belongs to the front end.' },

    { type: 'scenario', title: 'The £1 headphones', intro: 'You run the backend for a small shop. The front end sends the price of each item in the checkout request. Orders for £1 headphones start appearing.',
      meters: { 'money': 70, 'customer trust': 80 },
      steps: [
        { text: 'You look at a suspicious order. The request clearly said `"price": 1`. What is the root problem?',
          choices: [
            { label: 'The backend trusted a price sent by the client', score: 2, effects: { 'money': -5 }, feedback: 'Yes. A client can send whatever it likes. Prices must come from the server\'s own data.' },
            { label: 'The front end showed the wrong price', score: 0, effects: { 'money': -20 }, feedback: 'The front end showed £79. The request was edited after that. Fixing the display would change nothing.' },
            { label: 'Customers are dishonest', score: 0, effects: { 'customer trust': -10 }, feedback: 'Some may be. But you cannot fix people, only your design.' }
          ] },
        { text: 'What do you change?',
          choices: [
            { label: 'Accept only the item ID and quantity, and look up the price in the database', score: 2, effects: { 'money': 15, 'customer trust': 5 }, feedback: 'The client says *what* it wants. The server decides *what it costs*. Nothing the client sends can change that.' },
            { label: 'Hide the price field so it is harder to find', score: 0, effects: { 'money': -10 }, feedback: 'Obscurity is not security. Anyone who can see the request can still alter it.' },
            { label: 'Reject any order under £5', score: 1, effects: { 'money': 5, 'customer trust': -10 }, feedback: 'It catches this attack but breaks genuine small orders, and a £5 fake price is still possible.' }
          ] },
        { text: 'Beyond prices, which other fields from the client deserve the same suspicion?',
          choices: [
            { label: 'All of them: user ID, quantity, discount codes, "isAdmin"', score: 2, effects: { 'customer trust': 10 }, feedback: 'Everything from the client is a claim to be checked. That is the habit that makes backends safe.' },
            { label: 'Only the ones that involve money', score: 1, effects: {}, feedback: 'Money is the obvious one. But an edited user ID lets someone read another customer\'s orders.' },
            { label: 'None: the front end already validates them', score: 0, effects: { 'money': -15, 'customer trust': -20 }, feedback: 'Front-end validation is a courtesy. It cannot stop someone who skips the front end completely.' }
          ] }
      ],
      outro: 'The habit to keep: **the client suggests, the server decides.**' },

    { type: 'explain', prompt: 'Explain to a friend what "the backend" is, using what happens when you tap a button in an app.',
      model: 'The app (the client) sends a request to a server. The backend code there works out who you are, applies the rules, reads or writes the database, perhaps calls other services like payments, and sends a response back. The app then shows the result. Each request stands alone, and the backend never trusts what the client claims.',
      keywords: ['request', 'response', 'server', 'database', 'rules', 'client'] }
  ],

  flashcards: [
    { q: 'What is the request/response cycle?', a: 'The client sends a request, the server sends back a response, and the exchange ends. The client always speaks first.' },
    { q: 'Front end vs back end?', a: 'Front end: what runs on the user\'s device and what they see. Back end: the code and data on servers that does the real work.' },
    { q: 'What are the four recurring jobs of a backend?', a: 'Business logic, data storage, authentication and authorisation, and integrations with other services.' },
    { q: 'What is a port?', a: 'A numbered door on a machine. A server program listens on one port; web servers conventionally use 80 (HTTP) and 443 (HTTPS).' },
    { q: 'What does "each request stands alone" mean?', a: 'The server keeps no memory of earlier requests. The client must send proof of who it is every time.' },
    { q: 'Why must a backend never trust the client?', a: 'Users control their own devices and can edit anything they send. The server must validate and decide for itself.' }
  ],

  glossary: [
    { term: 'Request and response', def: 'The two halves of a client-server exchange: the client asks, the server answers.', like: 'Placing an order and being handed the dish.', aka: ['request/response cycle'] },
    { term: 'Front end', def: 'The part of an app that runs on the user\'s device and shows the interface.', like: 'The shop floor.', aka: ['frontend', 'client side'] },
    { term: 'Back end', def: 'The code and data on servers that applies the rules, stores information and serves the front end.', like: 'The stockroom behind the shop.', aka: ['backend', 'server side'] },
    { term: 'Port', def: 'A numbered endpoint on a machine. A server program claims a port and listens for requests on it.', like: 'A numbered door on a building.' },
    { term: 'API', def: 'Application programming interface: the menu of requests a backend accepts, and the replies it gives.', like: 'A restaurant menu: you may only order what is on it.' }
  ],

  takeaways: [
    'Everything online is **client asks, server answers**, and then the exchange is over.',
    'The back end does four jobs: **logic, data, auth and integrations**.',
    'Servers listen on **ports**, and each request **stands alone**.',
    '**The client suggests, the server decides.** Never trust what a browser sends.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('net-browsers', {
  eli5: 'When you press Enter, the browser looks up the server, connects, asks for the page, then turns the HTML and CSS it receives into pixels on your screen.',

  cards: [
    { kind: 'concept', title: 'Half a second, a dozen steps',
      body: `You type \`https://www.example.com/shop\` and press Enter. Less than a second later there is a page. It feels like a single thing.

        It is actually a relay race with two big halves:

        1. **Getting the page**: working out which computer to talk to, connecting to it safely, and asking for the page.
        2. **Showing the page**: turning the text that comes back into the colourful thing on your screen.

        This lesson walks through both halves. Each step you have already met, or is a small step from something you have. The lab that follows lets you step through the whole journey yourself.` },

    { kind: 'code', title: 'Step 1: reading the URL',
      body: 'First the browser takes the address apart. A **URL** is a set of labelled pieces. **Tap the lines.**',
      code: { lang: 'text', src: `
        https://www.example.com:443/shop/shoes?colour=red#reviews

        https://          scheme
        www.example.com   host
        :443              port
        /shop/shoes       path
        ?colour=red       query
        #reviews          fragment`,
        notes: {
          3: 'The **scheme** says how to talk. \`https\` means the secure version of the web\'s language.',
          4: 'The **host** is the domain name. This is what gets looked up in DNS.',
          5: 'The **port**. Usually hidden, because 443 is the default for https and 80 for http.',
          6: 'The **path** says which page or item you want from that server.',
          7: 'The **query** passes extra details, as `name=value` pairs: here, a colour.',
          8: 'The **fragment** says which part of the page to scroll to. It stays in the browser and is **never sent** to the server.'
        } } },

    { kind: 'sequence', title: 'Steps 2 to 4: find, connect, ask',
      body: 'Now the browser has to reach the server. Three short conversations come before the real one.',
      actors: ['Browser', 'DNS resolver', 'Server'],
      steps: [
        { from: 0, to: 1, label: 'address for www.example.com?', note: '**DNS.** The browser needs a number. This is the lookup you saw earlier. Usually the answer is already cached.' },
        { from: 1, to: 0, label: '203.0.113.7', dashed: true, note: 'Now the browser knows which machine to contact.' },
        { from: 0, to: 2, label: 'SYN: can we talk?', note: '**TCP.** The browser opens a reliable connection with a three-way handshake. First, a hello.' },
        { from: 2, to: 0, label: 'SYN-ACK: yes, ready', dashed: true, note: 'The server agrees and says hello back.' },
        { from: 0, to: 2, label: 'ACK: great', note: 'The browser confirms. A connection is open, and from now on lost packets are resent and reordered automatically.' },
        { from: 0, to: 2, label: 'TLS: hello, my options', note: '**TLS.** The browser proposes ways of scrambling the conversation.' },
        { from: 2, to: 0, label: 'certificate + chosen options', dashed: true, note: 'The server proves who it is with a **certificate** and picks the options. Both sides now share a secret key. This is the padlock.' },
        { from: 0, to: 2, label: 'GET /shop (encrypted)', note: '**HTTP.** Only now does the browser ask for the page, scrambled so that eavesdroppers see nonsense.' },
        { from: 2, to: 0, label: '200 OK + HTML (encrypted)', dashed: true, note: 'The server sends back the page\'s HTML. The long journey is over.' }
      ] },

    { kind: 'metaphor', title: 'Making a phone call',
      body: `Each step has a counterpart in an old-fashioned phone call.

        - **DNS** is looking up the number in your contacts.
        - **TCP** is dialling and hearing "hello?" "hello!". You both know the line works.
        - **TLS** is checking you have the right person and agreeing to speak in a private code so nobody can listen in.
        - **HTTP** is the actual conversation: "Could I have the page for the shop, please?"

        Each layer uses the one beneath it. HTTP gets only a brief introduction here. The next module is all about it, and the TLS padlock gets a lesson of its own.`,
      note: 'TCP is where the numbering and resending of packets from the first lesson actually happens.' },

    { kind: 'diagram', title: 'Step 5: HTML becomes the DOM',
      body: 'HTML arrives as plain text. The browser reads it top to bottom and builds a **tree** of objects, the **DOM** (Document Object Model). For a tiny page with a title, a heading, a paragraph and an image, it looks like this.',
      nodes: [
        { id: 'html', label: '<html>', x: 1, y: 0, tone: 'accent' },
        { id: 'head', label: '<head>', x: 0, y: 1 },
        { id: 'body', label: '<body>', x: 2, y: 1 },
        { id: 'title', label: '<title>', x: 0, y: 2, tone: 'muted' },
        { id: 'h1', label: '<h1>', x: 1, y: 2, tone: 'good' },
        { id: 'p', label: '<p>', x: 2, y: 2, tone: 'good' },
        { id: 'img', label: '<img>', x: 3, y: 2, tone: 'good' }
      ],
      edges: [
        { from: 'html', to: 'head' }, { from: 'html', to: 'body' },
        { from: 'head', to: 'title' }, { from: 'body', to: 'h1' }, { from: 'body', to: 'p' }, { from: 'body', to: 'img' }
      ],
      caption: 'Nested tags become parents and children. The DOM is the browser\'s live model of the page, and the thing JavaScript later changes.' },

    { kind: 'steps', title: 'Steps 6 to 9: from tree to pixels',
      body: 'The HTML usually points to stylesheets, scripts and images, which are fetched too. Then the browser runs its **rendering pipeline**.',
      steps: [
        { title: 'Build the DOM', body: 'Parse the HTML into the tree of elements. The browser can start before the whole file has arrived.' },
        { title: 'Build the CSSOM', body: 'Parse the CSS into a second tree of style rules: which elements are what colour, size and font. This is the **CSSOM**.' },
        { title: 'Make the render tree', body: 'Combine the two, keeping only what will be visible. An element hidden with `display: none` does not make it in.' },
        { title: 'Layout', body: 'Work out the size and position of every box. How wide is the heading? Where does the image go? A change in window width means doing this again.' },
        { title: 'Paint', body: 'Fill in the pixels: text, colours, borders, images. Layers are stacked, and the result appears on screen.' }
      ] },

    { kind: 'concept', title: 'Step 10: JavaScript joins in',
      body: `So far the page is static: a picture of a document. **JavaScript** is what makes it alive.

        When the browser's HTML parser meets a \`<script>\`, it usually pauses, downloads the script, runs it, and only then carries on. Scripts can:

        - read and **change the DOM**: add a row, hide a menu, update a basket count
        - react to taps, clicks and typing
        - fetch more data from a server, without reloading the page

        When a script changes the DOM, the browser repeats the needed work: re-style, re-layout, re-paint. That cycle is what makes pages feel interactive.` },

    { kind: 'pitfall', title: 'Why pages sometimes stay blank',
      body: `The browser will not draw anything until it has the CSS: it would flash an unstyled page otherwise. And a script placed early in the page makes the parser *wait*, so nothing below it is shown until the script has downloaded and run.

        A giant script at the top of \`<head>\` is the classic cause of a blank screen on a slow connection.

        Two fixes:

        - Add **\`defer\`**: the script downloads while the page builds, and runs after the HTML is parsed.
        - Add **\`async\`** for independent scripts such as analytics: they run whenever they are ready.

        A page that looks slow is not always a slow server. It could be this.` },

    { kind: 'tip', title: 'Watch it happen in DevTools',
      body: `Every browser has built-in **developer tools**. Press \`F12\`, or right-click a page and choose **Inspect**.

        - The **Elements** tab shows the live DOM, and the CSS rules applied to each element.
        - The **Network** tab lists every request: the HTML first, then each stylesheet, script and image it asked for. Click any row for its raw request and response, and a timeline of DNS, connecting and waiting.

        One page is rarely one request. It is the HTML plus dozens of extra files, each a separate round trip. Seeing a waterfall of them is the fastest way to understand where time goes.`,
      note: 'The lab that follows lets you step through the journey from Enter to pixels.' }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'In `https://shop.example.com/shoes?size=9#reviews`, which part tells the server which item you want?',
      options: ['`/shoes`, the path', '`#reviews`, the fragment', '`https`, the scheme', '`shop`, the subdomain'],
      answer: 0,
      why: [null, 'The fragment is for the browser to scroll to a section. It is never sent to the server.', 'The scheme says *how* to talk (securely), not *what* to ask for.', 'The subdomain helps find the server, via DNS, but not the item.'],
      explain: 'The path names the thing on the server. The query (`size=9`) adds details. The host is used for DNS, and the fragment never leaves the browser.' },

    { type: 'order', after: 2, prompt: 'Put the browser\'s journey in order, from Enter to receiving the page.',
      items: ['Look up the IP address with DNS', 'Open a TCP connection', 'Set up encryption with TLS', 'Send the HTTP request', 'Receive the HTML in the response'],
      explain: 'You need an address before you can connect, a connection before you can encrypt, and encryption before you send anything private. Only then is the page requested.' },

    { type: 'match', prompt: 'Match each step to its phone-call counterpart.',
      pairs: [['DNS', 'Looking up the number in your contacts'], ['TCP', 'Dialling and hearing "hello?" back'], ['TLS', 'Agreeing on a private code and checking who it is'], ['HTTP', 'The conversation itself: asking for what you want']] },

    { type: 'tf', after: 5, statement: 'The DOM is built from the HTML, and the CSSOM is built from the CSS; the browser combines them to decide what to draw.', answer: true,
      explain: 'Two trees: structure (DOM) and styles (CSSOM). The render tree combines them, keeping only what is visible, before layout and paint.' },

    { type: 'bucket', prompt: 'Is this part of getting the page, or of showing it?', buckets: ['Getting the page', 'Showing the page'],
      items: [['Looking up an IP address', 0], ['Agreeing encryption keys', 0], ['Building the DOM tree', 1], ['Opening a TCP connection', 0], ['Working out where each box sits', 1], ['Filling in pixels', 1]],
      explain: 'Everything up to receiving the HTML is networking. Parsing, layout and paint happen inside the browser, on your device.' },

    { type: 'cloze', text: 'The browser turns HTML into the {{DOM}}, CSS into the {{CSSOM}}, then works out where everything sits in {{layout}} and fills in pixels during {{paint}}.',
      distractors: ['TLS', 'DNS', 'handshake'],
      explain: 'Parse HTML, parse CSS, combine, measure, draw. TLS and DNS belong to the networking half.' },

    { type: 'spot', prompt: 'This page stays blank on slow connections. Tap the line that blocks the page from appearing.',
      code: { lang: 'html', src: `
        <head>
          <title>Shop</title>
          <script src="huge-slideshow.js"></script>
          <link rel="stylesheet" href="shop.css">
        </head>
        <body>
          <h1>Welcome to the shop</h1>
        </body>` },
      lines: [3],
      explain: 'A normal script in the head makes the parser stop, download and run it before reading the rest. Adding `defer` lets the page build while the script downloads, and runs it afterwards.' },

    { type: 'scenario', title: 'The blank page', intro: 'Your friend\'s shop shows a white screen for four seconds before anything appears. They ask you why. You open the browser\'s DevTools.',
      meters: { 'diagnosis accuracy': 50, 'friend\'s patience': 70 },
      steps: [
        { text: 'Where do you look first?',
          choices: [
            { label: 'The Network tab, to see the timeline of every request', score: 2, effects: { 'diagnosis accuracy': 20 }, feedback: 'Yes. The waterfall shows which request took the time, and whether it was waiting, downloading or something else.' },
            { label: 'Rewrite the CSS, just in case', score: 0, effects: { 'diagnosis accuracy': -10, 'friend\'s patience': -10 }, feedback: 'Changing things before measuring is guessing. You may fix nothing and break something.' },
            { label: 'Tell them to buy a faster hosting plan', score: 0, effects: { 'friend\'s patience': -20 }, feedback: 'Maybe the server is slow, maybe not. You have not looked yet.' }
          ] },
        { text: 'The first request, for the HTML, finishes in 150 ms. The page then waits on a 1.5 MB script in the `<head>` and two big images. What is happening?',
          choices: [
            { label: 'The script blocks the parser, and nothing below it is drawn until it has downloaded and run', score: 2, effects: { 'diagnosis accuracy': 25 }, feedback: 'That is it. The server answered quickly; the browser is stuck waiting on its own homework.' },
            { label: 'DNS must be slow', score: 0, effects: { 'diagnosis accuracy': -10 }, feedback: 'DNS happens before the first request, and that request finished quickly. DNS is not the culprit here.' },
            { label: 'TLS is misconfigured', score: 0, effects: { 'diagnosis accuracy': -10 }, feedback: 'The encrypted request already completed in 150 ms. Setup was fine.' }
          ] },
        { text: 'What is the best change?',
          choices: [
            { label: 'Add `defer` to the script, and shrink the images', score: 2, effects: { 'friend\'s patience': 25, 'diagnosis accuracy': 5 }, feedback: 'The page can now appear while the script loads, and there is less to download.' },
            { label: 'Move the script to a different folder', score: 0, effects: {}, feedback: 'Where the file lives on the server changes nothing about how the browser waits for it.' },
            { label: 'Remove JavaScript from the site entirely', score: 1, effects: { 'friend\'s patience': -5 }, feedback: 'It would load, but the shop would lose everything interactive. `defer` keeps both.' }
          ] }
      ],
      outro: 'Measure first, then fix the actual bottleneck. **A slow page is not always a slow server.**' },

    { type: 'explain', prompt: 'Describe, in your own words, what happens between pressing Enter on a URL and seeing the page. Cover both getting it and showing it.',
      model: 'The browser reads the URL, looks up the server\'s IP address with DNS, opens a TCP connection, sets up encryption with TLS, then sends an HTTP request and receives HTML. It builds the DOM from the HTML and the CSSOM from the CSS, combines them into a render tree, works out layout, paints pixels, and runs JavaScript, which can change the DOM and trigger more layout and paint.',
      keywords: ['DNS', 'TCP', 'TLS', 'HTML', 'DOM', 'layout', 'paint', 'JavaScript'] }
  ],

  flashcards: [
    { q: 'What are the parts of a URL?', a: 'Scheme (https), host (the domain), port (usually hidden), path, query (?name=value) and fragment (#section, never sent to the server).' },
    { q: 'What happens, in order, before the browser receives a page?', a: 'DNS lookup, TCP connection, TLS encryption setup, then the HTTP request and response.' },
    { q: 'What do DNS, TCP and TLS each do?', a: 'DNS finds the server\'s address. TCP gives a reliable connection. TLS encrypts it and proves the server\'s identity.' },
    { q: 'What are the DOM and CSSOM?', a: 'The DOM is the tree of elements built from HTML. The CSSOM is the tree of style rules built from CSS.' },
    { q: 'What are layout and paint?', a: 'Layout works out the size and position of every box. Paint fills in the actual pixels.' },
    { q: 'Why can a script in the head slow a page?', a: 'It pauses the HTML parser while it downloads and runs. `defer` lets the page build first.' }
  ],

  glossary: [
    { term: 'URL', def: 'A web address made of a scheme, host, optional port, path, query and fragment.', like: 'A full postal address: country, town, street and flat.', aka: ['web address'] },
    { term: 'TCP', def: 'The protocol that opens a reliable connection and makes sure packets arrive complete and in order, resending any that are lost.', like: 'A phone call with "are you still there?" checks built in.', aka: ['TCP connection', 'handshake'] },
    { term: 'TLS', def: 'The protocol that encrypts a connection and lets the browser verify the server\'s identity. It is what puts the padlock in the address bar.', like: 'Agreeing on a secret language after checking ID.', aka: ['encryption'] },
    { term: 'DOM', def: 'The Document Object Model: the browser\'s live tree of elements built from the HTML, which JavaScript can read and change.', like: 'A family tree of the page\'s elements.', aka: ['CSSOM'] },
    { term: 'Rendering pipeline', def: 'The browser\'s sequence for turning HTML and CSS into pixels: DOM and CSSOM, render tree, layout, paint.', like: 'An assembly line: blueprint, measurements, painting.', aka: ['render tree', 'layout', 'paint'] }
  ],

  takeaways: [
    'Pressing Enter starts two halves: **getting** the page (DNS, TCP, TLS, HTTP) and **showing** it.',
    'A URL has labelled parts; the **fragment** never leaves the browser.',
    'HTML becomes the **DOM**, CSS becomes the **CSSOM**, and together they become layout, then paint.',
    '**JavaScript** can change the DOM, and a blocking script can hold up the whole page.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('net-frontend-basics', {
  eli5: 'Every web page is built from three things: HTML for what is on it, CSS for how it looks, and JavaScript for what it does, including asking your backend for data.',

  cards: [
    { kind: 'metaphor', title: 'A house in three layers',
      body: `You are a backend developer. Your server sends back some text, and a browser turns it into a page. To build the right thing, you need to know what that text is made of.

        Think of a house:

        - **HTML** is the bricks and walls: the structure. A heading here, a list there, a link to another page.
        - **CSS** is the paint, carpets and furniture: how it all looks.
        - **JavaScript** is the electrics and plumbing: what happens when you flick a switch or turn a tap.

        You can have walls without paint, but not paint without walls. And a house with no wiring is a very quiet house.`,
      note: 'You do not need to become a front-end expert. You need enough to read a page, serve it, and know how it will talk to you.' },

    { kind: 'code', title: 'HTML: structure and meaning',
      body: 'HTML wraps content in **tags**. Most come in pairs, an opening and a closing one. The tags say what each piece *is*. **Tap the lines.**',
      code: { lang: 'html', src: `
        <h1>Today's menu</h1>
        <p>Fresh soup, <strong>made daily</strong>.</p>
        <ul>
          <li>Tomato</li>
          <li>Leek and potato</li>
        </ul>
        <a href="/order">Order now</a>`,
        notes: {
          1: '`<h1>` is the top-level **heading**. HTML says "this is a heading", not "make it big".',
          2: '`<p>` is a paragraph. Tags can nest: `<strong>` marks its words as important, inside the paragraph.',
          3: '`<ul>` is an unordered **list**, and each `<li>` is an item in it.',
          7: 'A **link**. The `href` says where to go. Tapping it makes the browser send a request for `/order`.'
        } },
      note: 'Other tags you will meet: `<img>` for pictures, `<form>` and `<input>` for typing, `<button>` for buttons, `<div>` for a plain container.' },

    { kind: 'code', title: 'CSS: presentation',
      body: 'CSS is a list of rules. Each says **which elements** to style, then **what to change**. **Tap the lines.**',
      code: { lang: 'text', src: `
        h1 {
          color: darkred;
          font-size: 2rem;
        }

        .sold-out {
          text-decoration: line-through;
        }`,
        notes: {
          1: 'The **selector**: this rule applies to every `<h1>` on the page.',
          2: 'A **declaration**: a property (`color`) and the value you want.',
          6: 'A selector starting with a dot targets a **class**: any element written as `<li class="sold-out">` gets this rule. That is how you style *some* things differently.'
        } },
      note: 'Same HTML, different CSS, completely different look. That separation is the whole point: structure in one file, style in another.' },

    { kind: 'code', title: 'JavaScript: behaviour',
      body: 'HTML and CSS describe a page. JavaScript **responds** to what the user does, and can change the page. **Tap the lines.**',
      code: { lang: 'js', src: `
        const button = document.querySelector('#order');

        button.addEventListener('click', () => {
          button.textContent = 'Ordered!';
        });`,
        notes: {
          1: '`document` is the page, as the browser sees it (the **DOM** from last lesson). `querySelector` finds one element, here the one whose `id` is `order`.',
          3: 'An **event listener**: "when this button is clicked, run this function". The page sits idle until something happens.',
          4: 'Change the DOM. The text on the button changes, and the browser re-paints. No server, no reload.'
        } } },

    { kind: 'code', title: 'How a page calls your API',
      body: 'This is the bridge between the front end and your backend. **`fetch`** sends an HTTP request from JavaScript. Tap the lines.',
      code: { lang: 'js', src: `
        const list = document.querySelector('#menu');
        async function loadMenu() {
          const response = await fetch('/api/menu');
          const items = await response.json();
          for (const item of items) {
            const li = document.createElement('li');
            li.textContent = item.name;
            list.append(li);
          }
        }`,
        notes: {
          3: '`fetch` sends a request to your server\'s `/api/menu`. `await` means "wait for the reply, but do not freeze the page meanwhile".',
          4: 'The body of the response is text. `.json()` turns that text into real JavaScript data you can loop over.',
          6: 'Create a new list item...',
          7: '...fill it with the item\'s name. Using `textContent` treats it as plain text, which matters for safety (see the last card)...',
          8: '...and add it to the list on the page. The browser re-lays-out and paints the new rows.'
        } } },

    { kind: 'sequence', title: 'The page and your API, in order',
      body: 'This is the most common shape of modern apps. A page loads once, then keeps talking to a backend behind the scenes.',
      actors: ['Browser page', 'Your API'],
      steps: [
        { from: 0, to: 1, label: 'GET /menu.html', note: 'The browser asks for the page. The server sends HTML, CSS and JavaScript. Often these are plain static files.' },
        { at: 0, label: 'JavaScript runs loadMenu()', note: 'The page is on screen, but the list is empty. The script springs into action.' },
        { from: 0, to: 1, label: 'GET /api/menu', note: '`fetch` sends a request. This is your backend\'s API: code, rules and the database.' },
        { from: 1, to: 0, label: '200 OK + JSON data', dashed: true, note: 'Not a page this time, just data: a list of items in **JSON** format.' },
        { at: 0, label: 'build list items in the DOM', note: 'JavaScript turns the data into elements and adds them to the page.' },
        { note: 'The screen updates without reloading. It is why a modern app feels like an app rather than a stack of pages.' }
      ] },

    { kind: 'concept', title: 'JSON: how data travels',
      body: `Between the page and your API the data is sent as text. The standard format is **JSON** (JavaScript Object Notation), which looks almost exactly like JavaScript objects and lists:

        - Curly braces hold **objects**, with a name and a value for each item: \`{"name": "Tomato", "price": 4.5}\`
        - Square brackets hold **lists**: \`[ ... , ... ]\`
        - Values can be text (in double quotes), numbers, \`true\` or \`false\`, \`null\`, or more objects and lists.

        JSON is not tied to JavaScript. Python, Java, Go and everything else can read and write it. That is exactly why it is the common language between front ends and back ends.`,
      code: { lang: 'json', src: `
        [
          { "name": "Tomato", "price": 4.5, "vegan": true },
          { "name": "Leek and potato", "price": 5, "vegan": false }
        ]` } },

    { kind: 'example', title: 'Forms: sending data without any JavaScript',
      body: 'The web had a way to send data to a server long before `fetch`: the **form**. Press Submit, and the browser gathers every field into a request.',
      code: { lang: 'html', src: `
        <form method="post" action="/signup">
          <input name="email" type="email">
          <input name="password" type="password">
          <button>Sign up</button>
        </form>`,
        notes: {
          1: '`action` is the URL to send to. `method` is the kind of request. Page forms mostly use `post`, which carries the data in the request body.',
          2: 'Each `name` becomes a field name in what the server receives: `email=...`',
          4: 'Press this, and the browser builds the request, sends it, and shows whatever page comes back.'
        } },
      note: 'Your backend receives the same kind of request from a form, from `fetch` or from a phone app. Only the packaging differs.' },

    { kind: 'compare', title: 'The same-origin idea',
      body: `An **origin** is three things: the scheme, the host and the port. The browser has a strict rule: **a page may not read responses from a different origin** unless that other server explicitly allows it. Compared with a page at \`https://shop.example.com\`:`,
      cols: ['Same origin?', 'Why'],
      rows: [
        ['`https://shop.example.com/cart`', 'Yes', 'Only the path differs'],
        ['`http://shop.example.com`', 'No', 'Different scheme'],
        ['`https://api.example.com`', 'No', 'Different host'],
        ['`https://shop.example.com:8443`', 'No', 'Different port']
      ],
      note: 'The rule protects you: a malicious page cannot quietly use your logged-in session to read your bank\'s data. A server can opt in to sharing, using something called CORS, which gets a full lesson later.' },

    { kind: 'pitfall', title: 'Do not put raw text into the page as HTML',
      body: `Say your API returns a comment: \`<script>steal()</script>\`. If the front end drops it into the page as **HTML** (with a feature called \`innerHTML\`), the browser sees a script tag and **runs it**. A comment box has just become a way to run an attacker's code in every visitor's browser. This attack is called **cross-site scripting** (XSS).

        The safe habit: insert user-supplied text as **text** (\`textContent\`), which the browser never interprets as markup.

        As a backend developer you are the other half of the defence: never assume the data you send out is harmless just because it came from your own database.` }
  ],

  activities: [
    { type: 'match', after: 0, prompt: 'Match each piece of the web to its job.',
      pairs: [['HTML', 'The structure: what is on the page'], ['CSS', 'The look: colours, fonts, layout'], ['JavaScript', 'The behaviour: reacting and changing things'], ['fetch', 'JavaScript\'s way of calling a backend'], ['JSON', 'A text format for sending data around']] },

    { type: 'order', after: 5, prompt: 'Put the steps of a page loading its menu from the API in order.',
      items: ['The browser loads the HTML, CSS and JavaScript', 'The script calls `fetch` for `/api/menu`', 'The API replies with JSON', 'The script turns the JSON into elements', 'The browser repaints and the menu appears'],
      explain: 'The page arrives first, empty. The script then asks for the data, and the answer is turned into elements. No page reload is needed.' },

    { type: 'cloze', text: `const response = await {{fetch}}('/api/menu');
const items = await response.{{json}}();`,
      code: true, distractors: ['send', 'get', 'parse'],
      explain: '`fetch` sends the request. `.json()` turns the text of the response body into data you can loop over.' },

    { type: 'tf', after: 7, statement: 'A web page can send data to your backend using only HTML, with no JavaScript at all.', answer: true,
      explain: 'A `<form>` does exactly this. The browser collects the fields, sends the request to the `action` URL, and displays the reply. `fetch` is the more flexible modern alternative.' },

    { type: 'mcq', after: 8, q: 'A page at `https://shop.example.com/cart` wants to read a response from each address. Which one is the same origin, and so allowed by default?',
      options: ['`https://shop.example.com/orders`', '`http://shop.example.com/cart`', '`https://api.example.com/cart`', '`https://shop.example.com:8443/cart`'],
      answer: 0,
      why: [null, 'The scheme is different (http vs https), so it is a different origin.', 'The host is different (api vs shop), so it is a different origin.', 'The port is different, so it is a different origin.'],
      explain: 'An origin is scheme + host + port. Only the path differs for `/orders`, so it is the same origin. Any change in the other three makes it a different one.' },

    { type: 'spot', prompt: 'This code shows a user\'s comment on the page. Tap the line that opens a security hole.',
      code: { lang: 'js', src: `
        const res = await fetch('/api/comments/7');
        const comment = await res.json();
        box.innerHTML = '<p>' + comment.text + '</p>';` },
      lines: [3],
      explain: 'Setting `innerHTML` with user-supplied text lets a comment such as `<script>…</script>` run as code in every visitor\'s browser. Use `textContent` (or build elements) so that the text stays text.' },

    { type: 'ab', q: 'A website and a phone app both need the menu. Which response from `/api/menu` serves both best?',
      a: { lang: 'json', label: 'Data', src: `
        [{ "name": "Tomato", "price": 4.5 }]` },
      b: { lang: 'html', label: 'Ready-made markup', src: `
        <ul><li class="item">Tomato - £4.50</li></ul>` },
      answer: 'a',
      explain: 'Plain data can be shown however each client likes: a web page, an iPhone screen or an Android one. Markup bakes in how it looks, which suits only the one client that understands it.' },

    { type: 'scenario', title: 'It works in curl, not in the browser', intro: 'You built an API at `https://api.myshop.com`. Your colleague built a web page at `https://www.myshop.com`. Your own test requests work fine, but the page\'s `fetch` call fails and the browser console complains about a blocked request.',
      meters: { 'team morale': 60, 'time lost': 20 },
      steps: [
        { text: 'You are sure the API itself is working. What is the most likely cause?',
          choices: [
            { label: 'The page and the API are different origins, and the browser blocks reading the response unless the API allows it', score: 2, effects: { 'time lost': -5 }, feedback: 'Exactly. `www` and `api` are different hosts. The browser enforces the same-origin rule, and your test tool does not, which is why only the page fails.' },
            { label: 'The API is down', score: 0, effects: { 'time lost': 25, 'team morale': -10 }, feedback: 'But your own requests work, so it is up. The difference is *who* is asking: a browser.' },
            { label: 'JSON is not allowed in browsers', score: 0, effects: { 'time lost': 20 }, feedback: 'Browsers handle JSON constantly. The problem is the origin, not the format.' }
          ] },
        { text: 'How do you fix it properly?',
          choices: [
            { label: 'Have the API explicitly allow requests from the web page\'s origin (CORS), or serve both from one origin', score: 2, effects: { 'team morale': 15 }, feedback: 'The server is the one who decides who may read its responses. A later lesson shows how, with CORS headers.' },
            { label: 'Ask every user to turn off their browser\'s security', score: 0, effects: { 'team morale': -20 }, feedback: 'That would remove protection from every other site they visit, and it is not something you can ask of customers.' },
            { label: 'Copy all the API code into the web page project', score: 1, effects: { 'time lost': 20 }, feedback: 'It sidesteps the problem, but you now have two copies of your backend. Sharing an origin or allowing one cleanly is far simpler.' }
          ] }
      ],
      outro: 'Remember: **a rule enforced by the browser can only be relaxed by the server.**' },

    { type: 'explain', prompt: 'Explain to a friend how a modern app page shows a list of products that come from a database, using HTML, CSS, JavaScript, fetch and JSON.',
      model: 'The browser loads a page whose HTML gives it structure and CSS gives it a look. JavaScript on the page uses fetch to ask the backend API for the products. The backend reads its database and replies with JSON, a text format of data. The script turns that JSON into elements in the page, and the browser paints them, all without reloading.',
      keywords: ['HTML', 'CSS', 'JavaScript', 'fetch', 'JSON', 'API', 'database'] }
  ],

  flashcards: [
    { q: 'What are the roles of HTML, CSS and JavaScript?', a: 'HTML gives structure and meaning, CSS gives presentation, JavaScript gives behaviour.' },
    { q: 'What does fetch do?', a: 'It lets JavaScript send an HTTP request to a server, for example your backend API, and read the response without reloading the page.' },
    { q: 'What is JSON?', a: 'A text format for data, built from objects in curly braces and lists in square brackets. Nearly every language can read and write it.' },
    { q: 'How can a page send data without JavaScript?', a: 'With an HTML form: the browser collects the named fields and sends them to the form\'s action URL.' },
    { q: 'What is an origin, and what is the same-origin rule?', a: 'An origin is scheme + host + port. A page may not read responses from a different origin unless that server allows it (CORS).' },
    { q: 'Why not insert API data into a page with innerHTML?', a: 'Text containing tags could run as code in visitors\' browsers (XSS). Insert it as text with textContent.' }
  ],

  glossary: [
    { term: 'HTML', def: 'The markup language that describes the structure and meaning of a page using tags: headings, paragraphs, lists, links, forms.', like: 'The walls and rooms of a house.' },
    { term: 'CSS', def: 'The language of rules that controls how HTML elements look: colours, fonts, spacing and layout.', like: 'The paint and furniture.' },
    { term: 'JavaScript', def: 'The programming language browsers run to make pages interactive: reacting to events, changing the DOM and calling APIs.', like: 'The wiring and plumbing.' },
    { term: 'fetch', def: 'A built-in JavaScript function that sends an HTTP request to a server and returns the response.', like: 'Phoning the backend from inside the page.' },
    { term: 'JSON', def: 'A plain-text format for structured data, made of objects, lists, text, numbers and true/false values.', like: 'A standard packing list that every company can read.' },
    { term: 'Same-origin policy', def: 'A browser rule that stops a page from reading responses from a different origin (scheme, host or port) unless that server permits it.', like: 'A building where each office can only open its own post.', aka: ['origin', 'CORS'] }
  ],

  takeaways: [
    '**HTML** is structure, **CSS** is looks, **JavaScript** is behaviour.',
    'A page calls your API with **fetch** and usually gets **JSON** back.',
    'Forms are the original way to send data; both produce ordinary requests for your backend.',
    'Browsers block reading **cross-origin** responses unless the server opts in, and raw HTML from users must never be inserted as markup.'
  ],

  links: []
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('internet', {
  title: 'The Packet Gremlin',
  intro: 'A gremlin lives in the cables between you and the server, and it loves to scramble things. Defeat it by showing you understand every hop from packet to pixel.',
  questions: [
    { type: 'mcq', q: 'Which statement about the internet and the web is correct?',
      options: ['The web is one service that runs on the internet, alongside email and games', 'The internet is a kind of browser that shows the web', 'The web is the cables, and the internet is the pages', 'They are two names for exactly the same thing'],
      answer: 0,
      why: [null, 'A browser is software on your device. The internet is the global network it uses.', 'It is the other way round: the internet is the network, and the web is a service on it.', 'Email, games and app updates use the internet without using the web.'],
      explain: 'The internet is the network of networks. The web (pages, browsers, links) is one thing that runs on it.' },

    { type: 'tf', statement: 'Two homes in different countries can both have devices using 192.168.1.20 at the same time.', answer: true,
      explain: 'Private addresses only mean something inside one local network. NAT lets the home router share a single public address for all of them.' },

    { type: 'multi', q: 'Which of these problems would a bigger-bandwidth plan NOT fix?',
      options: ['Lag from a game server on the far side of the world', 'A frozen video call caused by weak Wi-Fi dropping packets', 'A film that takes ages to download on a thin connection', 'Jumpy round-trip times from a congested link'],
      answers: [0, 1, 3],
      explain: 'Distance, loss and congestion are latency and loss problems: wider lanes do not help. Only the slow bulk download is a bandwidth problem.' },

    { type: 'estimate', q: 'A service promises 99.99% uptime. Roughly how many minutes of downtime a year does that allow?', answer: 53, unit: 'minutes per year', min: 1, max: 100000,
      explain: 'A year has about 525,600 minutes. 0.01% of that is roughly 53 minutes. Each extra nine divides allowed downtime by ten.' },

    { type: 'short', q: 'Which DNS record type makes one name an alias of another?', accept: ['CNAME'], hint: 'Canonical name.',
      explain: 'A `CNAME` says "this name is really that other name". An `A` record points straight at an address.' },

    { type: 'order', prompt: 'Put the browser\'s journey in order, from pressing Enter to seeing the page.',
      items: ['Look up the IP address with DNS', 'Open a TCP connection', 'Agree encryption with TLS', 'Send the HTTP request and receive HTML', 'Build the DOM and CSSOM', 'Lay out the boxes and paint the pixels'],
      explain: 'First the network steps, in order of dependence: address, connection, encryption, request. Then the rendering steps: trees, layout, paint.' },

    { type: 'bucket', prompt: 'Who does this job: the network, the browser, or the server?', buckets: ['The network', 'The browser', 'The server'],
      items: [['A router reading a packet\'s destination address', 0], ['Building the DOM from HTML', 1], ['Checking the real price against the database', 2], ['Working out where each box sits (layout)', 1], ['Passing a packet on to the next hop', 0], ['Deciding whether a user may see an order', 2]],
      explain: 'Routers move packets without caring what is inside. The browser turns HTML and CSS into pixels. The server holds the rules, the data and the permissions.' },

    { type: 'cloze', text: 'A DNS record with a short {{TTL}} lets a change spread {{quickly}}, but it means resolvers do more {{lookups}}.',
      distractors: ['slowly', 'certificates', 'ports'],
      explain: 'TTL is how long caches may keep an answer. Short means fresher answers and more repeated lookups; long means fewer lookups and slower change.' },

    { type: 'spot', prompt: 'This backend handler has a serious flaw. Tap the line.',
      code: { lang: 'js', src: `
        function checkout(req) {
          const user = findUser(req.token);
          const total = req.body.total;
          charge(user, total);
          return { ok: true };
        }` },
      lines: [3],
      explain: 'The total comes straight from the client, who can edit it to anything. The server should compute it from item IDs and its own prices. The client suggests; the server decides.' },

    { type: 'ab', q: 'Which way of showing a user\'s comment on a page is safer?',
      a: { lang: 'js', label: 'As text', src: `
        box.textContent = comment.text;` },
      b: { lang: 'js', label: 'As HTML', src: `
        box.innerHTML = comment.text;` },
      answer: 'a',
      explain: 'With `textContent`, a comment containing tags is displayed literally. With `innerHTML` the browser may run it as code, which is cross-site scripting.' },

    { type: 'match', prompt: 'Match each item to what it is.',
      pairs: [['Port 443', 'The usual door for secure web traffic'], ['MX record', 'Says where a domain\'s email goes'], ['URL fragment', 'Stays in the browser, never sent to the server'], ['NAT', 'Lets a router share one public address'], ['Origin', 'Scheme plus host plus port']] },

    { type: 'mcq', q: 'Visitors in Australia say your shop is slow, while UK visitors say it is fine. The server is in London and nothing else is wrong. What is the most likely cause?',
      options: ['Distance: every round trip crosses the world, so latency is higher', 'The Australian visitors have the wrong kind of browser', 'DNS records only work in the UK', 'The shop has too little bandwidth for two countries at once'],
      answer: 0,
      why: [null, 'Browsers work the same way everywhere. Distance is what differs.', 'DNS is global. Records work from anywhere.', 'Bandwidth is not tied to countries. Round-trip delay grows with distance.'],
      explain: 'Packets cannot beat the speed of light in fibre. A page involves several round trips, so a distant server feels slow. Hosting in more regions, or nearer to users, is the fix.' }
  ]
});

KS.sheet('internet', {
  title: 'How the Internet Works: cheat sheet',
  sections: [
    { title: 'The big picture',
      md: `| Word | Means |
        |---|---|
        | Internet | A network of networks, passing packets by shared rules |
        | Web | One service on it: pages, links, browsers |
        | Client / server | The asker / the answerer (roles, not machines) |
        | Packet | Small labelled slice of data, resent if lost |
        | ISP / router | Gets you online / picks each next hop |

        Long-distance traffic mostly crosses oceans on **sea-floor fibre cables**. Many routes exist, so one break means detours.` },

    { title: 'Addresses, packets and speed',
      md: `- **IPv4:** \`203.0.113.7\`, 32 bits, about 4.3 billion addresses. **IPv6:** \`2001:db8::7\`, 128 bits.
        - **Private ranges:** \`10.x.x.x\`, \`172.16-31.x.x\`, \`192.168.x.x\`. **NAT** shares one public address.
        - **Packet** = header (from, to, piece number, hops left) + payload.
        - Routing is **hop by hop**.

        | Measure | Road picture |
        |---|---|
        | Bandwidth | Lanes |
        | Latency | Length of road |
        | Packet loss | Lorries that vanish |

        Tools: \`ping\`, \`traceroute\` (\`tracert\` on Windows).` },

    { title: 'DNS',
      md: `**Anatomy:** \`blog.example.com\`: \`com\` = TLD, \`example\` = what you register, \`blog\` = subdomain.

        | Record | Holds |
        |---|---|
        | A / AAAA | IPv4 / IPv6 address |
        | CNAME | Alias to another name |
        | MX | Mail servers |
        | TXT | Free text, proofs |
        | NS | The domain's name servers |

        **Lookup:** resolver, then root, then TLD, then authoritative; answers are cached for the **TTL**. Lower the TTL *before* a move. Tools: \`dig\`, \`nslookup\`.` },

    { title: 'Hosting',
      md: `| Type | Think of | Notes |
        |---|---|---|
        | Shared | House-share | Cheap, noisy neighbours |
        | VPS | Flat | Own slice, own OS |
        | Dedicated | Detached house | Whole machine |
        | Cloud | Hotel | On demand, pay for use |

        - **Static** = ready-made files. **Dynamic** = code builds each page.
        - Region, then data centres, then racks, then servers. Pick a region near users.
        - **Uptime:** 99% is about 3.7 days a year, 99.9% about 8.8 hours, 99.99% about 53 minutes.
        - One box means one point of failure.` },

    { title: 'Backend basics',
      md: `- **Request/response:** the client always speaks first; the server answers.
        - **Four jobs:** logic, data, auth, integrations.
        - **Port:** numbered door on a machine. 80 = HTTP, 443 = HTTPS. A program *listens* on one; two processes cannot share a port.
        - **Each request stands alone:** the client sends proof of identity every time. Do not keep per-user data in a server variable.
        - **Never trust the client:** validate everything, look up prices and permissions server-side.
        - Front-end checks are for friendliness, back-end checks are for safety.` },

    { title: 'What the browser does',
      md: `**URL:** \`https://host:443/path?query#fragment\`: the fragment is never sent.

        1. DNS: find the address
        2. TCP: open a reliable connection
        3. TLS: encrypt and verify identity
        4. HTTP: request, then HTML response
        5. HTML becomes the **DOM**, CSS becomes the **CSSOM**
        6. Render tree, **layout**, **paint**
        7. JavaScript can change the DOM and trigger layout and paint again

        A normal script in \`<head>\` blocks the parser: use \`defer\` or \`async\`. Use DevTools (F12), Network tab.` },

    { title: 'Frontend for backend people',
      md: `| Language | Role | Example |
        |---|---|---|
        | HTML | Structure | \`<h1>\`, \`<ul>\`, \`<a href>\` |
        | CSS | Looks | \`h1 { color: darkred; }\` |
        | JavaScript | Behaviour | \`addEventListener('click', …)\` |

        - **fetch** calls your API; \`await response.json()\` reads **JSON**.
        - **Forms** send named fields to the \`action\` URL with no JavaScript.
        - **Origin** = scheme + host + port. Cross-origin reads are blocked unless the server allows it (CORS).
        - Insert untrusted text with \`textContent\`, never \`innerHTML\`.` }
  ]
});

/* @@END */
