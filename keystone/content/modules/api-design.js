/* Module: api-design — API Design & REST.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs api-design */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('api-what', {
  eli5: 'An API is a menu that one program hands to another: it lists what you may ask for, how to ask, and what you will get back, without showing the kitchen.',

  cards: [
    { kind: 'concept', title: 'Your weather app has never seen a cloud',
      body: `Open a weather app. It shows tomorrow's rain, a pretty icon and a temperature. But the app has no thermometer, no satellites and no meteorologists inside it.

        It simply **asks another program**: "what is the forecast for Leeds?" That program replies with the answer, and the app draws it nicely.

        The agreed way of asking is called an **API**: an *Application Programming Interface*. It is how one program uses the abilities of another **without knowing how it works inside**.

        Almost every app you use is a thin layer on top of dozens of these conversations.` },

    { kind: 'metaphor', title: 'The restaurant menu',
      body: `You do not walk into a restaurant kitchen and start opening fridges. You read the **menu**, pick a dish, and a waiter carries your order in and the food out.

        - The **menu** lists what you may order and how it is described.
        - The **waiter** carries requests and replies, and says "sorry, we are out of that".
        - The **kitchen** can change its stoves, chefs and suppliers overnight. You never notice, as long as the menu keeps its promises.

        An API is the menu plus the waiter. The metaphor stops at one point: a kitchen might be one room, but behind an API there can be hundreds of servers.` },

    { kind: 'sequence', title: 'One request, one response',
      body: 'Here is the weather app\'s conversation. Step through it.',
      actors: ['Weather app', 'Weather API', 'Forecast database'],
      steps: [
        { from: 0, to: 1, label: 'GET /forecast?city=Leeds', note: 'The app sends a **request**: a message saying what it wants. It does not say how to find it.' },
        { from: 1, to: 2, label: 'look up Leeds', note: 'Behind the API, the provider does whatever work is needed. The app never sees this part.' },
        { from: 2, to: 1, label: 'rain 80%, 9°C', dashed: true, note: 'The data comes back to the API server.' },
        { from: 1, to: 0, label: '200 OK + JSON', dashed: true, note: 'The API sends a **response**: a status saying how it went, plus the data in an agreed format.' },
        { at: 0, label: 'draw the rain icon', note: 'The app only has to understand the response. It could be talking to a database, a cache or a hundred servers and could not tell.' }
      ] },

    { kind: 'code', title: 'What a request and response look like',
      body: 'You met raw HTTP in the last module. Most web APIs are just that, used by programs instead of people. **Tap the highlighted lines.**',
      code: { lang: 'http', src: `
        GET /v1/forecast?city=Leeds HTTP/1.1
        Host: api.weather.example
        Accept: application/json

        HTTP/1.1 200 OK
        Content-Type: application/json

        {"city": "Leeds", "tempC": 9, "rainChance": 0.8}`,
        notes: {
          1: 'The **endpoint** is the address a program calls: here `/v1/forecast`. The part after `?` narrows the question.',
          3: 'The caller says which format it wants back. APIs return data, not web pages.',
          5: 'The **status code** tells the program whether it worked, using the codes from the HTTP module.',
          8: 'The body is **data**, laid out so code can read it easily. No fonts, no layout, no adverts.'
        } } },

    { kind: 'concept', title: 'An API is a contract',
      body: `A menu is a promise: "order this, get that". An API makes the same promise, and it covers three things:

        1. **What you may ask for**: the endpoints and the inputs each one needs.
        2. **What you will get back**: the shape of the data and the status codes.
        3. **What happens when it goes wrong**: the errors you may see.

        Both sides can then work **independently**. The weather company may rewrite its entire system in another language. As long as \`/v1/forecast?city=Leeds\` still returns the same shape, no app breaks.

        That is why we call it a **contract**. Break it and you break everyone who relied on it.` },

    { kind: 'compare', title: 'Public, partner and private APIs',
      body: 'The same idea comes in three flavours, depending on **who is allowed to call it**.',
      cols: ['Public (open)', 'Partner', 'Private (internal)'],
      rows: [
        ['Who calls it', 'Any developer who signs up', 'Selected companies with an agreement', 'Your own teams and apps'],
        ['Example', 'A weather or maps API with a free key', 'A bank sharing data with an accounting firm', 'Your mobile app talking to your own servers'],
        ['Changing it', 'Very slowly: strangers depend on it', 'Carefully, by agreement', 'Fastest: you control both ends'],
        ['Documentation', 'Polished, essential', 'Shared under contract', 'Often thin (and often regretted)']
      ],
      note: 'Most APIs in the world are private. The ones you hear about are the public ones.' },

    { kind: 'compare', title: 'API styles at a glance',
      body: 'There is more than one way to design the menu. Three styles dominate; the next module gives them a lesson each.',
      cols: ['REST', 'GraphQL', 'gRPC'],
      rows: [
        ['Shape', 'Many addresses, one per thing', 'One address, you describe what you want', 'Call named functions on another machine'],
        ['Data format', 'Usually JSON', 'JSON', 'Compact binary'],
        ['Often used for', 'Public and general web APIs', 'Apps that need flexible data', 'Fast calls between your own services']
      ],
      note: 'Older SOAP (XML-based) APIs also still run a lot of big companies. This module is mostly about REST, the most common style.' },

    { kind: 'diagram', title: 'Why backend work is mostly API work',
      body: 'Look at one online shop. Every arrow is an API call, in one direction or the other.',
      nodes: [
        { id: 'web', label: 'Website', icon: '🌐', x: 0, y: 0 },
        { id: 'app', label: 'Mobile app', icon: '📱', x: 2, y: 0 },
        { id: 'back', label: 'Your backend', icon: '🖥️', x: 1, y: 1, tone: 'accent' },
        { id: 'pay', label: 'Payment provider', icon: '💳', x: 0, y: 2, tone: 'info' },
        { id: 'mail', label: 'Email service', icon: '✉️', x: 1, y: 2, tone: 'info' },
        { id: 'ship', label: 'Courier', icon: '🚚', x: 2, y: 2, tone: 'info' }
      ],
      edges: [
        { from: 'web', to: 'back', label: 'your API', both: true }, { from: 'app', to: 'back', both: true },
        { from: 'back', to: 'pay', label: 'their API' }, { from: 'back', to: 'mail' }, { from: 'back', to: 'ship' }
      ],
      caption: 'The backend offers an API to its own apps, and uses other people\'s APIs to get work done.' },

    { kind: 'pitfall', title: 'You cannot see everyone using your API',
      body: `Change a function in your own code and the compiler tells you everywhere that breaks. Change an API and **nothing tells you**. The callers are other programs, written by other people, running on phones you will never touch.

        Rename a field from \`tempC\` to \`temperature\`, and thousands of apps may quietly show blank temperatures until their authors wake up.

        So an API is designed more carefully than ordinary code: **once published, it is hard to take back.** The rest of this module is largely about making good choices up front, and changing them safely later.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'A restaurant changes its chefs, its stoves and its suppliers. What should the customers notice?',
      options: ['Nothing, as long as the menu and its promises stay the same', 'They must reorder using a new menu each time', 'They need to know which chef is cooking now', 'They need to visit the kitchen once to be re-introduced'],
      answer: 0,
      explain: 'The menu hides the kitchen. That is the whole value of an API: the provider can change everything behind it, and callers are unaffected while the contract holds.' },

    { type: 'tf', after: 4, statement: 'If a company rewrites its server in a new language but keeps the same endpoints and response shapes, existing apps should carry on working.', answer: true,
      explain: 'Callers depend on the contract (endpoints, inputs, outputs), not on what is inside. Changing the implementation while keeping the contract is exactly what the contract is for.' },

    { type: 'bucket', after: 5, prompt: 'Which kind of API is each of these?', buckets: ['Public', 'Partner', 'Private'],
      items: [['A free maps API anyone can sign up for', 0], ['Your shop app calling your own order servers', 2], ['A supplier\'s stock feed shared only with signed retailers', 1], ['A currency-rate API with a free developer key', 0], ['A billing service called only by your other internal services', 2], ['A bank\'s data link for approved accounting firms', 1]],
      explain: 'Ask who is allowed to call it. Anyone who registers: public. Named companies under an agreement: partner. Only your own systems: private.' },

    { type: 'match', prompt: 'Match each piece of API vocabulary to its meaning.',
      pairs: [['Endpoint', 'An address a program can call'], ['Request', 'A message asking for something'], ['Response', 'The reply, with a status and data'], ['Contract', 'The promise about inputs, outputs and errors'], ['Public API', 'Open to any developer who signs up']] },

    { type: 'cloze', text: 'A program sends a {{request}} to an {{endpoint}} and gets back a {{response}} whose status code says how it went.',
      distractors: ['menu', 'kitchen', 'database'],
      explain: 'Three words carry most of API talk: you request, at an endpoint, and a response comes back.' },

    { type: 'short', q: 'What is the name for one callable address of an API, such as `/v1/forecast`?', accept: ['endpoint', 'an endpoint', 'endpoints'], hint: 'It is where the conversation ends up.',
      explain: 'An **endpoint** is one address (plus method) that the API offers. An API is a collection of endpoints.' },

    { type: 'scenario', title: 'Opening up the order system', intro: 'You work for a small online shop. A courier company wants to check order statuses automatically, and your own mobile team also wants a way to talk to the backend.',
      meters: { 'safety': 60, 'speed': 60 },
      steps: [
        { text: 'The courier wants to check order status. Which kind of API is that, and what should you do about it?',
          choices: [
            { label: 'A partner API: give them credentials, document it and agree what it returns', score: 2, effects: { safety: 20, speed: -5 }, feedback: 'Right. A named company under an agreement is a partner. Credentials let you control access, and documentation means both sides share the same contract.' },
            { label: 'Give them read access to the database so they can look themselves', score: 0, effects: { safety: -30, speed: 10 }, feedback: 'Quick, and a disaster: they now depend on your table layout and can see everything. An API exists so that outsiders never touch the kitchen.' },
            { label: 'Email them a spreadsheet of statuses every morning', score: 1, effects: { safety: 5, speed: -15 }, feedback: 'It works and is safe, but out of date by lunchtime. This is a legitimate older pattern, and the last lesson in this module covers it.' }
          ] },
        { text: 'The mobile team wants an endpoint for "my orders". It will be private, used by your own app only. How careful must you be with its design?',
          choices: [
            { label: 'Still careful: old app versions stay installed on phones for months', score: 2, effects: { safety: 15 }, feedback: 'Right. You control the server, but not when users update the app. Old versions keep calling the old contract, so even a private API needs care.' },
            { label: 'Not at all, it is private so change it whenever you like', score: 0, effects: { safety: -25, speed: 10 }, feedback: 'The next release breaks every phone that has not updated. Private only means you know who the callers are, not that they all update at once.' },
            { label: 'Make it public so that it is documented properly', score: 1, effects: { safety: -10, speed: -10 }, feedback: 'Documentation is good, but opening it to the world adds risks and promises you do not need to make.' }
          ] }
      ],
      outro: 'The pattern to remember: **an API is a promise, and the wider the audience, the harder the promise is to change.**' },

    { type: 'explain', prompt: 'Explain to a friend what an API is, using an everyday comparison rather than technical words.',
      model: 'An API is like a restaurant menu. It lists what you can order and how, and the waiter carries your order to the kitchen and brings the food back. You never see how the kitchen works, and it can change inside as long as the menu keeps its promises. Programs use APIs to ask other programs for things.',
      keywords: ['menu', 'request', 'response', 'contract', 'inside', 'program'] }
  ],

  flashcards: [
    { q: 'What is an API?', a: 'An Application Programming Interface: an agreed way for one program to ask another for something without knowing how it works inside.' },
    { q: 'What does an API contract cover?', a: 'What you may ask for, what you get back, and what happens when something goes wrong.' },
    { q: 'Public vs partner vs private API?', a: 'Public: any developer who signs up. Partner: selected companies under an agreement. Private: only your own teams and apps.' },
    { q: 'Why are APIs harder to change than ordinary code?', a: 'The callers are other programs you cannot see or update, so changing the contract can silently break them.' },
    { q: 'Name the three API styles this module and the next introduce.', a: 'REST (many addresses, one per thing), GraphQL (one address, you ask for fields) and gRPC (call functions on another machine). SOAP is the older XML-based one.' }
  ],

  glossary: [
    { term: 'API', def: 'An Application Programming Interface: the agreed set of requests one program can make to another, and the responses it will get.', like: 'A restaurant menu: you choose from it without entering the kitchen.', aka: ['Application Programming Interface'] },
    { term: 'Endpoint', def: 'One address (with a method) that an API offers, such as `GET /v1/forecast`.', like: 'One dish on the menu.' },
    { term: 'API contract', def: 'The promise an API makes about its inputs, outputs and errors. Callers rely on it, so it must not change carelessly.', like: 'The menu\'s promise that a dish arrives as described.' },
    { term: 'Public API', def: 'An API that any developer can sign up for and use.', like: 'A restaurant open to the street.' },
    { term: 'Partner API', def: 'An API shared only with selected companies under an agreement.', like: 'A supplier\'s trade entrance.' },
    { term: 'Private API', def: 'An API used only by an organisation\'s own apps and services.', aka: ['internal API'], like: 'The hatch between the kitchen and the dining room.' }
  ],

  takeaways: [
    'An API is a **contract**: what you can ask, what you get, what happens on failure.',
    'Callers need not know what is inside, so the inside can change freely.',
    'Public, partner and private APIs differ in **who calls**, which decides how carefully you must change them.',
    'A backend is mostly a collection of APIs: ones it offers and ones it uses.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('api-rest', {
  eli5: 'REST is a way of designing web APIs around things (a book, an order, a user) that each have their own address, which you then read, create, change or remove with the standard HTTP verbs.',

  cards: [
    { kind: 'concept', title: 'Think in things, not in actions',
      body: `Suppose you are building an API for a bookshop. The obvious first idea is one endpoint per action:

        - \`/getBook?id=42\`
        - \`/createBook\`
        - \`/deleteBookById\`
        - \`/listBooksByAuthor\`

        Ten features later you have a hundred of these, and every developer invents their own naming. **REST** takes the opposite view: don't list the *actions*, list the **things**. The book is a **resource** with its own address, \`/books/42\`, and you use the same few HTTP verbs on every resource.

        Learn the pattern once, and you can guess the rest of the API.` },

    { kind: 'metaphor', title: 'Houses and postal addresses',
      body: `Every house has an address, and the address names the **thing**, not what you plan to do there.

        You can *visit* it, *post a letter to it*, or *knock it down*. The address stays the same: only your action changes.

        REST works the same way. \`/books/42\` is the address of book 42. Sending it a \`GET\` reads it, a \`PUT\` replaces it, a \`DELETE\` removes it. The server never needs a separate address for each action.

        The metaphor breaks down in one place: a REST address can point to a *collection* too, such as \`/books\`, which is like the address of a whole street.` },

    { kind: 'compare', title: 'Same address, different verb',
      body: 'Two addresses and five verbs cover most of what a shop API does. The **collection** is the whole set; the **item** is one thing in it.',
      cols: ['On the collection `/books`', 'On one item `/books/42`'],
      rows: [
        ['`GET`', 'List the books', 'Read book 42'],
        ['`POST`', 'Create a new book', 'Rarely used'],
        ['`PUT`', 'Rarely used', 'Replace book 42 completely'],
        ['`PATCH`', 'Rarely used', 'Change part of book 42'],
        ['`DELETE`', 'Rarely used', 'Remove book 42']
      ],
      note: 'This is the HTTP methods lesson, put to work. Safe and idempotent still apply: GET, PUT and DELETE can be retried; POST cannot.' },

    { kind: 'code', title: 'Creating a resource, then reading it',
      body: 'A full round trip with the right methods and status codes. **Tap the highlighted lines.**',
      code: { lang: 'http', src: `
        POST /books HTTP/1.1
        Content-Type: application/json

        {"title": "Dune", "author": "Frank Herbert"}

        HTTP/1.1 201 Created
        Location: /books/42

        GET /books/42 HTTP/1.1
        Accept: application/json

        HTTP/1.1 200 OK
        Content-Type: application/json

        {"id": 42, "title": "Dune", "author": "Frank Herbert"}`,
        notes: {
          1: 'POST goes to the **collection**: the new book has no address yet, so the server chooses one.',
          6: '`201 Created`, not plain 200: a new resource now exists.',
          7: '`Location` tells the caller the address of the new thing.',
          9: 'Now a GET to the item address. No body, because GET only asks.',
          15: 'The same book comes back. It has an `id` that the server added, which the request did not contain.'
        } } },

    { kind: 'concept', title: 'You never get the thing, only a picture of it',
      body: `A book resource lives in a database on the server. What travels down the wire is not the resource itself but a **representation** of it: a snapshot written in some format.

        Think of a photograph of a house. The photo is not the house, and a different photo (a black-and-white one, or one from another angle) still shows the same house.

        Most APIs use **JSON** as the representation. But the same \`/books/42\` could be sent as XML or as a web page, depending on what the caller says it accepts. The caller names the format with \`Accept: application/json\`, and the server says what it chose with \`Content-Type\`.

        Two things to keep apart: the **resource** (the idea of book 42) and its **representation** (one description of it).` },

    { kind: 'sequence', title: 'Stateless: every request stands alone',
      body: 'REST servers do not remember you between requests. Watch why that matters when there is more than one server.',
      actors: ['Phone app', 'Server A', 'Server B'],
      steps: [
        { from: 0, to: 1, label: 'GET /cart + token', note: 'The request carries everything the server needs: who you are (a token) and what you want.' },
        { from: 1, to: 0, label: '200 + cart', dashed: true, note: 'Server A answers, and then **forgets the conversation**.' },
        { from: 0, to: 2, label: 'GET /orders + token', note: 'The next request happens to land on a different server.' },
        { from: 2, to: 0, label: '200 + orders', dashed: true, note: 'It works, because the token came with the request. Server B did not need to ask Server A anything.' },
        { note: 'This is **statelessness**: each request contains all the information needed to handle it. Servers can be added, removed or swapped without anyone losing their place.' }
      ] },

    { kind: 'steps', title: 'The REST constraints in plain English',
      body: 'REST is not a product or a standard. It is a set of design rules (called **constraints**) from Roy Fielding\'s PhD thesis. Six of them:',
      steps: [
        { title: 'Client and server are separate', body: 'The app handles the screen, the server handles the data. Either can be rebuilt without the other, provided the API stays the same.' },
        { title: 'Stateless', body: 'Every request carries all it needs. The server keeps no session in its head between calls.' },
        { title: 'Cacheable', body: 'Responses say whether they may be reused. A cached copy saves a trip to the server.' },
        { title: 'Uniform interface', body: 'Everything uses the same few verbs, addresses for things, and standard formats. This is the one that makes REST *feel* like REST.' },
        { title: 'Layered system', body: 'The client cannot tell whether it is talking to the real server or to a proxy, cache or load balancer in front of it.' },
        { title: 'Code on demand (optional)', body: 'A server may send code, such as JavaScript, for the client to run. This is the only optional rule, and web APIs rarely use it.' }
      ] },

    { kind: 'pitfall', title: 'Verbs sneaking back into the URL',
      body: `The classic mistake is putting the action in the address and using POST for everything:

        - \`POST /deleteBook?id=42\`
        - \`GET /books/42/delete\` (worse: GET must be safe)
        - \`POST /api\` with \`{"action": "getBook"}\`

        Another sneaky one: replying \`200 OK\` with \`{"error": "not found"}\` in the body. Caches, monitors and retry logic all read the status line, so a failure dressed as a success fools every one of them.

        Rule: **nouns in the address, verbs in the method, truth in the status code.**` },

    { kind: 'realworld', title: 'What about actions that are not CRUD?',
      body: `Some things do not map neatly onto create, read, update and delete: "cancel this order", "send this invoice", "reset this password".

        Common REST-friendly answers:

        - Treat the action as a **new resource**: \`POST /orders/42/cancellation\` creates a cancellation.
        - Change a **state field**: \`PATCH /orders/42\` with \`{"status": "cancelled"}\`.
        - Accept a small **verb-style sub-address** for a true action: \`POST /orders/42/cancel\`. Many well-known APIs do this.

        Purists argue about which is best. The practical rule: be consistent, and keep the method honest (POST for anything that changes things).` }
  ],

  activities: [
    { type: 'match', after: 2, prompt: 'Match each request to what it does in a REST bookshop API.',
      pairs: [['GET /books', 'List all the books'], ['POST /books', 'Create a new book'], ['GET /books/42', 'Read one book'], ['PATCH /books/42', 'Change some fields of one book'], ['DELETE /books/42', 'Remove one book']] },

    { type: 'mcq', after: 5, q: 'Why do stateless servers make it easy to add more servers behind a load balancer?',
      options: ['Any server can handle any request, as nothing is remembered between calls', 'Stateless servers are always faster than stateful ones', 'Each user is permanently tied to the server that first served them', 'Stateless servers never need a database'],
      answer: 0,
      why: [null, 'Speed is not the point. Interchangeability is.', 'That is the opposite: it describes sticky, stateful servers.', 'They still use databases; they just do not keep your conversation in memory.'],
      explain: 'If every request carries what is needed, it does not matter which server receives it. New servers can join, and failed ones can leave, without anyone losing a session.' },

    { type: 'tf', after: 8, statement: 'Returning `200 OK` with `{"error": "not found"}` in the body is fine, as long as the error is described clearly.', answer: false,
      explain: 'Clients, caches, monitors and retry logic read the status code first. A failure sent as 200 looks like success to all of them. Use `404` (or another 4xx/5xx) and put the detail in the body as well.' },

    { type: 'spot', prompt: 'Most of these requests follow REST habits. Tap the line that does not.',
      code: { lang: 'http', src: `
        GET /customers/7
        GET /customers/7/orders
        POST /customers
        DELETE /customers/7
        POST /deleteCustomerOrder?customer=7&order=3` },
      lines: [5],
      explain: 'Line 5 puts the verb in the address and tunnels it through POST. The REST way is `DELETE /customers/7/orders/3`: the address names the thing, the method says what to do.' },

    { type: 'ab', q: 'Which design creates a new order the REST way?',
      a: { lang: 'http', label: 'Verb in the URL', src: `
        POST /createNewOrder HTTP/1.1

        {"item": "Dune", "qty": 1}

        HTTP/1.1 200 OK` },
      b: { lang: 'http', label: 'Noun and status', src: `
        POST /orders HTTP/1.1

        {"item": "Dune", "qty": 1}

        HTTP/1.1 201 Created
        Location: /orders/918` },
      answer: 'b',
      explain: 'The address names the collection, the method says "create", and `201` plus `Location` says exactly what happened and where the new order lives.' },

    { type: 'short', q: 'Which status code should a successful POST that created a new resource return?', accept: ['201'], hint: 'Two-hundred and something.',
      explain: '`201 Created`, ideally with a `Location` header giving the address of the new resource.' },

    { type: 'multi', q: 'Which of these are REST constraints?',
      options: ['Stateless requests', 'Separate client and server', 'A uniform interface for every resource', 'Every response must be XML', 'Servers must remember each user\'s session'],
      answers: [0, 1, 2],
      explain: 'Statelessness, client–server separation and a uniform interface are all core. REST does not mandate any one format (JSON is simply popular), and it deliberately avoids server-side sessions.' },

    { type: 'explain', prompt: 'A colleague proposes endpoints `/getUser`, `/updateUser` and `/removeUser`. Explain how REST would reshape them and why it helps.',
      model: 'REST treats the user as a resource with an address like /users/7, and uses the HTTP method for the action: GET to read, PATCH or PUT to update, DELETE to remove, POST to /users to create. The same pattern then works for every other resource, so developers can guess endpoints, and caches and tools understand the methods.',
      keywords: ['resource', 'noun', 'GET', 'DELETE', 'method', 'address', 'guess'] }
  ],

  flashcards: [
    { q: 'What is a resource in REST?', a: 'A thing the API exposes, such as a book or an order, identified by its own URL like `/books/42`.' },
    { q: 'Resource vs representation?', a: 'The resource is the thing itself; the representation is a snapshot of it in some format, usually JSON.' },
    { q: 'What does stateless mean?', a: 'Each request carries everything needed to handle it, so the server keeps no memory of earlier requests.' },
    { q: 'Rule of thumb for REST URLs and methods?', a: 'Nouns in the address, verbs in the HTTP method, and the truth in the status code.' },
    { q: 'Name the six REST constraints.', a: 'Client–server, stateless, cacheable, uniform interface, layered system and (optional) code on demand.' }
  ],

  glossary: [
    { term: 'REST', def: 'REpresentational State Transfer: a style for web APIs built around resources with addresses, standard HTTP methods and stateless requests.', like: 'A town where every house has an address and everyone uses the same few ways to interact with it.' },
    { term: 'Resource', def: 'Any thing an API exposes, identified by a URL, such as a user, an order or a collection of them.', like: 'A house, as opposed to a photo of it.' },
    { term: 'Representation', def: 'A snapshot of a resource\'s current state in some format, usually JSON, that travels in a request or response.', like: 'A photograph of the house.' },
    { term: 'Collection', def: 'A resource that is a set of other resources, such as `/books`.', like: 'A street, as opposed to one house.' },
    { term: 'Stateless', def: 'Describes a server that keeps no memory of earlier requests; each request has all the information it needs.', like: 'A shop assistant with no memory who needs your whole order slip every time.' }
  ],

  takeaways: [
    'REST models an API as **resources** with addresses, and uses HTTP\'s verbs on them.',
    'What travels is a **representation** of the resource, usually JSON.',
    '**Stateless** requests mean any server can answer any call, which is how APIs scale out.',
    'Nouns in the URL, verbs in the method, honest status codes.'
  ],

  links: [
    { label: 'MDN: HTTP request methods', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('api-rest-design', {
  eli5: 'Two APIs can do exactly the same job, and one feels like a joy while the other is a chore; the difference is in small, consistent choices about names, lists, versions and errors.',

  cards: [
    { kind: 'concept', title: 'The same job, a joy or a chore',
      body: `You have worked out the REST basics. Now the harder part: design choices that you can't see are wrong until a hundred developers have used them.

        Compare two ways to ask for "the most recent paid orders of customer 7":

        - \`GET /api/getOrders?cust_id=7&paid=Y&sort=d&n=10\`
        - \`GET /customers/7/orders?status=paid&sort=-created&limit=10\`

        Both work. Only the second can be *guessed* by someone who has never seen the documentation.

        A good API is **predictable**: once you know how one part behaves, you can correctly guess how the rest behaves. This lesson covers the choices that create that.` },

    { kind: 'compare', title: 'Naming: nouns, plurals and consistency',
      body: 'A few habits that nearly every well-regarded API shares.',
      cols: ['Avoid', 'Prefer'],
      rows: [
        ['Verbs in paths', '`/getOrders`, `/createUser`', '`/orders`, `/users`'],
        ['Singular and plural mixed', '`/user/7` but `/orders`', 'Always plural: `/users/7`, `/orders/3`'],
        ['Mixed styles', '`/orderItems` and `/order_items`', 'One style everywhere, such as lowercase with hyphens'],
        ['Internal details leaking', '`/tbl_cust_v2`', 'Words your users would use: `/customers`'],
        ['Same field, different names', '`userId` here, `user_id` there', 'One name, one casing, throughout']
      ],
      note: 'Which style you choose matters far less than choosing one. Consistency beats cleverness.' },

    { kind: 'code', title: 'Nesting: relationships in the URL',
      body: 'Resources belong to other resources. The path can show that, but only so far. **Tap the highlighted lines.**',
      code: { lang: 'http', src: `
        GET /customers/7/orders          # orders belonging to customer 7
        GET /customers/7/orders/918      # one of them
        GET /orders/918                  # the same order, direct
        GET /orders/918/items            # the lines inside the order

        # Too deep. Hard to read, hard to build:
        GET /customers/7/orders/918/items/3/product/reviews`,
        notes: {
          1: 'A sub-collection: "the orders **of** customer 7". Nesting shows ownership.',
          3: 'If an ID is unique on its own, offering a direct address too is friendly. The caller need not know the owner.',
          7: 'Past about two levels, nesting becomes a chore. Give the deep thing its own top-level address and filter instead: `/reviews?product=55`.'
        } } },

    { kind: 'code', title: 'Filtering, sorting and pagination',
      body: 'Collections can be huge. The **query string** (the part after `?`) lets callers narrow, order and slice them. **Tap the highlighted lines.**',
      code: { lang: 'http', src: `
        GET /orders?status=paid
        GET /orders?status=paid&customer=7
        GET /orders?sort=-created
        GET /orders?sort=total,-created
        GET /orders?limit=20&offset=40`,
        notes: {
          1: '**Filtering**: only the orders that match. Each filter is a field name and a value.',
          2: 'Filters combine with "and". Callers build exactly the slice they need.',
          3: '**Sorting**: a field name, with a leading `-` meaning descending (newest first). That convention is common but not universal, so document yours.',
          4: 'Several sort keys, in order of priority.',
          5: '**Pagination**: never return a million rows in one go. Return a page and let the caller ask for the next.'
        } } },

    { kind: 'metaphor', title: 'Page numbers or a bookmark?',
      body: `There are two ways to read a very long book that keeps getting new pages added at the front.

        **Page numbers (offset)**: "give me pages 41 to 60". If three new pages are inserted at the front while you read, page 41 now shows what was page 38, so you see some content twice.

        **A bookmark (cursor)**: "carry on from the spot I marked". New pages at the front do not matter: you resume exactly where you stopped.

        APIs offer both. An **offset** is simple to understand. A **cursor** is a marker returned by the server (often an opaque string) that says "continue after this item".` },

    { kind: 'compare', title: 'Offset vs cursor pagination',
      body: 'Neither is wrong. They suit different jobs.',
      cols: ['Offset / limit', 'Cursor'],
      rows: [
        ['Request', '`?limit=20&offset=40`', '`?limit=20&after=eyJpZCI6NjB9`'],
        ['Jump to page 50', 'Easy', 'Not possible: you must walk forward'],
        ['New items arriving mid-read', 'Rows can repeat or be skipped', 'Stable'],
        ['Speed on deep pages', 'Slows down: the database skips all earlier rows', 'Stays fast'],
        ['Good for', 'Small, steady lists; admin tables', 'Feeds, logs, big and busy collections']
      ] },

    { kind: 'compare', title: 'Versioning: how to change without breaking',
      body: 'Sooner or later you must make a change that breaks old callers. A **version** lets old and new live side by side. Three popular places to put it:',
      cols: ['In the URL', 'In a header', 'In the query'],
      rows: [
        ['Looks like', '`/v2/orders`', '`Accept: application/vnd.shop.v2+json`', '`/orders?version=2`'],
        ['Easy to see and try', 'Yes, in a browser', 'No, hidden in headers', 'Yes'],
        ['Purity', 'Debated: the address changes for the same thing', 'Favoured by purists', 'Easily forgotten']
      ],
      note: 'URL versioning is the most common because it is the easiest to understand. And adding a new optional field is usually **not** a breaking change, so it needs no new version. Removing or renaming one is.' },

    { kind: 'code', title: 'One error shape everywhere',
      body: 'When something fails, the caller\'s code needs to react. A single predictable error format means one piece of error-handling code works for the whole API. **Tap the highlighted lines.**',
      code: { lang: 'json', src: `
        {
          "status": 422,
          "code": "validation_failed",
          "message": "Some fields are invalid.",
          "errors": [
            {"field": "email", "problem": "Not a valid email address"},
            {"field": "qty", "problem": "Must be at least 1"}
          ],
          "requestId": "req_8f2a"
        }`,
        notes: {
          2: 'The same status code as the HTTP response line, so the body can be understood on its own.',
          3: 'A **machine-readable** code. Programs match on this, never on the English text.',
          4: 'A human-readable message for developers and logs. It may change wording freely.',
          5: 'Validation errors list **every** problem at once, per field, so users fix them in one go.',
          9: 'A request ID lets support find this exact call in the logs. A standard exists for this shape too: "Problem Details for HTTP APIs".'
        } } },

    { kind: 'layers', title: 'The Richardson maturity model',
      body: 'Leonard Richardson described four steps on the way to "full REST". Most APIs stop at level 2, and that is fine.',
      layers: [
        { label: 'Level 3: hypermedia controls', note: 'Responses include links to what you can do next (HATEOAS). Later lesson.', tone: 'info', icon: '🔗' },
        { label: 'Level 2: HTTP verbs and status codes', note: 'GET reads, POST creates, DELETE removes; 404 means not found. Where most good APIs live.', tone: 'good', icon: '✅' },
        { label: 'Level 1: many resources', note: 'Separate addresses for each thing: `/orders/918`, not one big endpoint.', tone: 'accent', icon: '📍' },
        { label: 'Level 0: one endpoint, one verb', note: 'Everything is `POST /api` with an action named in the body. HTTP is only a tunnel.', tone: 'warn', icon: '🚇' }
      ] },

    { kind: 'pitfall', title: 'Inconsistency is the real enemy',
      body: `Most painful APIs are not badly designed in any single spot. They are **inconsistent**: one endpoint paginates with \`page\`, another with \`offset\`; dates are text in one place and numbers in another; errors are shaped three different ways because three different teams wrote them.

        Each inconsistency is small. Together, every endpoint becomes a new puzzle and nobody can guess anything.

        Write a short **style guide** early (naming, pagination, errors, dates) and apply it to everything. A mediocre rule applied everywhere beats ten brilliant rules applied sometimes.` }
  ],

  activities: [
    { type: 'ab', after: 1, q: 'Which endpoint is better designed for fetching one customer?',
      a: { lang: 'http', label: 'Verb and singular', src: `
        GET /getCustomer?id=7` },
      b: { lang: 'http', label: 'Plural noun', src: `
        GET /customers/7` },
      answer: 'b',
      explain: 'A plural noun for the collection and the ID in the path follows the pattern callers will already expect: `/customers` is the list, `/customers/7` is one.' },

    { type: 'spot', after: 2, prompt: 'This API mostly follows good naming habits. Tap the line that breaks them.',
      code: { lang: 'http', src: `
        GET /customers
        GET /customers/7
        GET /customers/7/orders
        POST /order_create
        GET /orders/918/items` },
      lines: [4],
      explain: 'Line 4 uses a verb, a singular noun and a different word style. The consistent version is `POST /orders`.' },

    { type: 'mcq', after: 5, q: 'A news feed gets new posts every few seconds and users scroll through it endlessly. Which pagination suits it best?',
      options: ['Cursor-based: continue after the last post seen', 'Offset-based: ask for page numbers', 'No pagination: send everything at once', 'Random pages, so load is spread out'],
      answer: 0,
      why: [null, 'New posts arriving shift the page boundaries, so users would see repeats.', 'A feed grows without limit, so this becomes slower and heavier with time.', 'Users want the next items in order, not random ones.'],
      explain: 'A busy, ever-growing list is where offsets drift and get slow. A cursor says "after this one" and stays correct and fast.' },

    { type: 'tf', after: 6, statement: 'Adding a new optional field to a JSON response normally requires releasing a new API version.', answer: false,
      explain: 'Well-written clients ignore fields they do not know, so adding one is a compatible change. Removing a field, renaming it or changing its meaning are the changes that break callers.' },

    { type: 'bucket', prompt: 'Is this a breaking change for existing callers, or a safe one?', buckets: ['Breaking', 'Safe'],
      items: [['Rename `tempC` to `temperature`', 0], ['Add an optional `humidity` field', 1], ['Change `price` from pounds to pence', 0], ['Add a new endpoint `/reports`', 1], ['Make a previously optional input required', 0], ['Remove the `legacyId` field', 0], ['Add a new, optional filter to `/orders`', 1]],
      explain: 'Safe changes only add. Anything that removes, renames, tightens a requirement or changes the meaning of existing data can break a caller who relied on it.' },

    { type: 'match', prompt: 'Match each Richardson level to what it adds.',
      pairs: [['Level 0', 'One endpoint, everything is a POST'], ['Level 1', 'Separate addresses for separate resources'], ['Level 2', 'Proper HTTP methods and status codes'], ['Level 3', 'Responses carry links to next actions']] },

    { type: 'scenario', title: 'Designing the shop API', intro: 'You are designing the first public API for an online shop. The first draft was written in a hurry, and the team lead asks you to fix the biggest problems.',
      meters: { 'developer joy': 40, 'future flexibility': 50 },
      steps: [
        { text: 'The draft returns the entire product list from `GET /products`: forty thousand items. What do you add?',
          choices: [
            { label: 'Pagination with a limit, plus filters such as `?category=books`', score: 2, effects: { 'developer joy': 20, 'future flexibility': 10 }, feedback: 'Right. Pages protect the server and the caller, and filters mean most callers never need to page far.' },
            { label: 'Nothing: tell callers to be patient', score: 0, effects: { 'developer joy': -20 }, feedback: 'Forty thousand rows per call slows everyone, and the list only grows. Unbounded responses are a bug waiting for a busy day.' },
            { label: 'A separate `/getFirst100Products` endpoint', score: 1, effects: { 'developer joy': -5, 'future flexibility': -10 }, feedback: 'It limits the size, but invents a one-off endpoint. Query parameters on the same collection are more flexible and predictable.' }
          ] },
        { text: 'Errors currently come back as plain text in some places and `{"err": 1}` in others. What do you do?',
          choices: [
            { label: 'Define one JSON error shape with a machine-readable code, and use it everywhere', score: 2, effects: { 'developer joy': 25 }, feedback: 'Callers can now write one error handler. The machine-readable code is what programs match on; the message can change freely.' },
            { label: 'Keep plain text, but make the sentences clearer', score: 0, effects: { 'developer joy': -10 }, feedback: 'Programs cannot reliably parse English, and reworded sentences would break anyone who tried.' },
            { label: 'Standardise only the new endpoints and leave the old ones', score: 1, effects: { 'developer joy': 5, 'future flexibility': -5 }, feedback: 'Better than nothing, but callers must now handle both shapes. Inconsistency is the enemy.' }
          ] },
        { text: 'Marketing wants to rename `price` to `unitPrice` in responses next month. What is the safe approach?',
          choices: [
            { label: 'Add `unitPrice` alongside `price`, announce a deprecation, and remove `price` in a later version', score: 2, effects: { 'future flexibility': 25, 'developer joy': 10 }, feedback: 'Adding is safe, so both fields work during the transition. A clear deprecation lets callers move at their own pace.' },
            { label: 'Rename it now. Developers should keep up', score: 0, effects: { 'developer joy': -30, 'future flexibility': -10 }, feedback: 'Every app that reads `price` breaks the moment you deploy.' },
            { label: 'Never change any name, ever', score: 1, effects: { 'future flexibility': -15 }, feedback: 'Safe, but it freezes your API forever. Versioning and deprecation exist so that you can change.' }
          ] }
      ],
      outro: 'The pattern to remember: **protect callers from big responses, from surprises and from your own renaming.**' },

    { type: 'explain', prompt: 'Explain to a teammate why cursor pagination is often better than page numbers for a fast-changing list.',
      model: 'With page numbers (offset), the position is counted from the start, so if new items arrive while someone is reading, the pages shift and they see repeats or miss items. Deep offsets are also slower, because the database has to skip all earlier rows. A cursor says continue after this specific item, so it stays correct and quick, although you cannot jump straight to page 50.',
      keywords: ['offset', 'cursor', 'shift', 'repeat', 'skip', 'bookmark', 'slower'] }
  ],

  flashcards: [
    { q: 'Naming rules for REST resources?', a: 'Plural nouns, no verbs, one consistent style, and words your users would use, like `/customers/7/orders`.' },
    { q: 'Offset vs cursor pagination?', a: 'Offset (`limit` + `offset`) is simple and allows jumping to a page but drifts and slows on big, busy lists. A cursor continues after the last item seen: stable and fast, but forward-only.' },
    { q: 'Which API changes are breaking?', a: 'Removing or renaming a field, changing its meaning or type, or making an optional input required. Adding optional things is safe.' },
    { q: 'What makes a good error response?', a: 'One consistent shape with the right status code, a machine-readable code, a human message, field-level details and a request ID.' },
    { q: 'What are the levels of the Richardson maturity model?', a: '0: one endpoint. 1: separate resources. 2: HTTP verbs and status codes. 3: hypermedia links (HATEOAS).' }
  ],

  glossary: [
    { term: 'Query parameter', def: 'A name=value pair after the `?` in a URL, used to filter, sort or page a result.', like: 'Telling the librarian "only fiction, newest first".' },
    { term: 'Pagination', def: 'Returning a long list in small pages instead of all at once.', like: 'Reading a long book one page at a time.' },
    { term: 'Cursor', def: 'A marker returned by the server that says where the last page ended, used to ask for the next one.', like: 'A bookmark.' },
    { term: 'API versioning', def: 'Publishing a new version of an API (such as `/v2/`) beside the old one, so that breaking changes do not hurt existing callers.', like: 'Printing a new edition while the old one stays on the shelves.' },
    { term: 'Breaking change', def: 'A change that makes existing correct callers stop working, such as removing or renaming a field.', like: 'Moving the door while people are walking towards it.' },
    { term: 'Richardson maturity model', def: 'A four-level scale (0–3) describing how fully an API uses resources, HTTP verbs and hypermedia.', like: 'Levels of a game, each unlocking more of REST.' }
  ],

  takeaways: [
    'Good APIs are **predictable**: plural nouns, one naming style, one error shape.',
    'Use query parameters to **filter, sort and paginate**; prefer cursors for big, busy lists.',
    'Adding is safe; removing or renaming is **breaking**. Version, or add and deprecate.',
    'Most good APIs sit at **Richardson level 2**: resources, verbs and honest status codes.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('api-json', {
  eli5: 'Programs cannot pass objects through a cable, so they flatten data into text in an agreed format such as JSON, send it, and rebuild it at the other end.',

  cards: [
    { kind: 'concept', title: 'You cannot post an object',
      body: `Inside your program, an order is a neat structure in memory: an ID, a total, a list of items. But memory belongs to one program on one machine. You cannot send "a pointer to memory" down a network cable.

        So before sending, the data must be turned into a **flat stream of text or bytes**. That is called **serialising** (or encoding). The receiver reads the stream and rebuilds the structure: **deserialising** (or decoding, or parsing).

        Both sides must agree on the **format**: the rules for how structure becomes text. That agreement is what a data format is.` },

    { kind: 'metaphor', title: 'Flat-pack furniture',
      body: `A wardrobe will not fit through your front door, so the shop ships it as flat boards, screws and an instruction sheet.

        - **Serialising** is taking the wardrobe apart into a flat box.
        - The **format** is the instruction sheet that both the shop and you can read.
        - **Deserialising** is building it again in your bedroom.

        If you and the shop use different instruction sheets, you end up with a wardrobe that has doors on the inside. The metaphor stops short in one place: with data, a bad rebuild is often silent, which is worse than a wobbly shelf.` },

    { kind: 'code', title: 'Serialising in one line of JavaScript',
      body: 'Every mainstream language has this built in or one import away. **Tap the highlighted lines.**',
      code: { lang: 'js', src: `
        const order = { id: 7, total: 19.99, paid: true };

        const text = JSON.stringify(order);
        // '{"id":7,"total":19.99,"paid":true}'

        const back = JSON.parse(text);
        console.log(back.total);   // 19.99`,
        notes: {
          3: '**Serialise**: from a live object to a string. This string is what travels in the HTTP body.',
          7: '**Deserialise**: parsing the string back into a live object. If the text is not valid JSON, this throws an error, so APIs must handle that.'
        } } },

    { kind: 'concept', title: 'Why JSON won',
      body: `**JSON** (JavaScript Object Notation) did not win because it is clever. It won because it is **small, readable and good enough**.

        - The whole grammar fits on a postcard: objects, arrays, strings, numbers, true/false and null.
        - Humans can read it and type it, so debugging is easy.
        - Every language can parse it, and browsers have done so natively for years.
        - It is lighter than XML, its older rival, which wraps every value in opening and closing tags.

        It is not perfect: it has no comments, no date type and no way to say "this is a very large number". The second half of this lesson is about those gaps.` },

    { kind: 'code', title: 'All of JSON in eight lines',
      body: 'These are all the building blocks there are. **Tap the highlighted lines.**',
      code: { lang: 'json', src: `
        {
          "name": "Ada",
          "age": 36,
          "admin": false,
          "tags": ["maths", "code"],
          "address": {"city": "London"},
          "manager": null
        }`,
        notes: {
          2: 'Keys are always **strings in double quotes**. Single quotes are not valid JSON.',
          3: 'Numbers have no separate integer and decimal types: just "number".',
          4: 'Booleans are lowercase `true` and `false`.',
          5: 'Arrays hold ordered lists of any values.',
          6: 'Objects nest inside objects as far as you like.',
          7: '`null` means "deliberately empty". There is no comments feature and no trailing commas.'
        } } },

    { kind: 'compare', title: 'JSON, XML and Protocol Buffers',
      body: 'JSON is the default, but it is not the only way to flatten data. Two others you will meet:',
      cols: ['JSON', 'XML', 'Protocol Buffers'],
      rows: [
        ['Form', 'Text', 'Text with tags', 'Compact binary'],
        ['Human readable', 'Yes', 'Yes, but wordy', 'No: you need tools'],
        ['Needs a schema', 'No (optional)', 'Optional (XSD)', 'Yes, always'],
        ['Size and speed', 'Medium', 'Largest, slowest to parse', 'Smallest, fastest'],
        ['Typical home', 'Web and mobile APIs', 'Older enterprise (SOAP), documents', 'Service-to-service calls (gRPC)']
      ],
      note: 'Other formats exist (MessagePack, Avro, CBOR), mostly "binary JSON" or big-data cousins. Later lessons return to XML and Protocol Buffers properly.' },

    { kind: 'code', title: 'JSON:API, an agreed shape for the shape',
      body: `JSON itself says nothing about *how* to lay out a book and its author. So every team invents its own layout. **JSON:API** is a published specification that fixes the layout, so tools can be reused. **Tap the highlighted lines.**`,
      code: { lang: 'json', src: `
        {
          "data": {
            "type": "books",
            "id": "42",
            "attributes": {"title": "Dune"},
            "relationships": {
              "author": {"data": {"type": "people", "id": "9"}}
            }
          },
          "included": [
            {"type": "people", "id": "9", "attributes": {"name": "Frank Herbert"}}
          ]
        }`,
        notes: {
          3: 'Every resource states its `type` and `id` in the same place.',
          5: 'Plain fields live under `attributes`, away from the bookkeeping.',
          7: 'Links to other resources are listed under `relationships`, as just a type and ID.',
          10: '`included` lets the server ship related resources in the same response, saving a second trip.'
        } },
      note: 'JSON:API is one of several conventions. Many teams skip it and write a simpler house style. What matters is picking one and using it everywhere.' },

    { kind: 'pitfall', title: 'Trap one: dates',
      body: `JSON has no date type. A date is just a string or number that both sides must interpret the same way, and they often do not.

        Is \`03/04/2025\` the 3rd of April or the 4th of March? It depends who is reading. And what is "9:30" without a time zone?

        The fix is boring and universal: use **ISO 8601**, which orders the parts from biggest to smallest and carries the zone. Store and send times in **UTC**, and let the user's device convert them for display.`,
      code: { lang: 'text', src: `
        "2025-03-14T09:30:00Z"        good: ISO 8601, UTC (Z)
        "2025-03-14T10:30:00+01:00"   good: same moment, with offset
        "2025-03-14"                  good for a date with no time
        "03/04/2025"                  bad: 3 April or 4 March?
        "9:30"                        bad: which day, which zone?`,
        notes: {
          1: 'The `T` separates date from time. `Z` means UTC ("zero offset").',
          2: 'This is the same instant as line 1, just written for a place one hour ahead of UTC.',
          4: 'Regional formats are unreadable to a program that does not know the region.'
        } } },

    { kind: 'pitfall', title: 'Trap two: big numbers and money',
      body: `JSON allows any number, but many readers do not. JavaScript stores all numbers as 64-bit floating point, which can represent whole numbers exactly only up to **9,007,199,254,740,991**. Beyond that, neighbouring numbers collapse into one.

        Database IDs on large systems can exceed this. The usual fix: **send big IDs as strings**.

        **Money** is the other trap. Binary floating point cannot hold 0.1 exactly, so sums go wrong in the last digits (\`0.1 + 0.2\` is \`0.30000000000000004\`). Send money as **whole minor units** (\`1999\` pence) or a string, plus the currency.`,
      code: { lang: 'text', src: `
        server sends:   {"id": 9007199254740993}
        JavaScript has: 9007199254740992

        safer:          {"id": "9007199254740993"}
        money:          {"amount": 1999, "currency": "GBP"}`,
        notes: {
          2: 'The last digit silently changed. No error, just a different record.',
          4: 'A string survives untouched. The caller converts it with a big-integer type if it needs to do arithmetic.',
          5: 'Whole pence (or cents) are exact. The currency says what the number means.'
        } } }
  ],

  activities: [
    { type: 'mcq', after: 3, q: 'Which of these is true of JSON compared with XML?',
      options: ['It carries the same kinds of data with far less wrapping text', 'It supports comments and dates natively', 'It always needs a schema file to be valid', 'It can only be read by JavaScript'],
      answer: 0,
      why: [null, 'JSON has neither comments nor a date type. That is a common complaint.', 'A schema is optional for JSON.', 'Every mainstream language can parse JSON. JavaScript was just first.'],
      explain: 'JSON won by being small and simple: no closing tags, a tiny set of types, readable at a glance and easy for any language to parse.' },

    { type: 'cloze', after: 2, text: 'Turning an object into text to send is called {{serialising}}, and rebuilding the object from that text is called {{deserialising}}.',
      distractors: ['compiling', 'encrypting', 'caching'],
      explain: 'Serialising flattens structure into a stream; deserialising rebuilds the structure at the other end. Neither one encrypts or compiles anything.' },

    { type: 'spot', prompt: 'This text is meant to be JSON, but a strict parser will reject it. Tap a line that breaks the rules.',
      code: { lang: 'text', src: `
        {
          "name": "Ada",
          'role': "admin",
          "scores": [1, 2, 3,],
          "active": true
        }` },
      lines: [3, 4],
      explain: 'Line 3 uses single quotes around a key, and line 4 has a trailing comma. JSON allows neither. These are the most common reasons that hand-written JSON fails to parse.' },

    { type: 'ab', q: 'Which JSON is the safer way to send a timestamp to callers in other countries?',
      a: { lang: 'json', label: 'Local format', src: `
        {"shipped": "03/04/2025 9:30"}` },
      b: { lang: 'json', label: 'ISO 8601, UTC', src: `
        {"shipped": "2025-04-03T09:30:00Z"}` },
      answer: 'b',
      explain: 'ISO 8601 is unambiguous: the biggest unit comes first and the time zone is stated. The local format hides both the order of day and month and the zone.' },

    { type: 'tf', statement: 'JSON has a built-in date type, so APIs can send dates without agreeing on a format.', answer: false,
      explain: 'JSON only has strings, numbers, booleans, null, arrays and objects. A date is a string both sides must agree to interpret, which is why ISO 8601 is the convention.' },

    { type: 'match', prompt: 'Match each format to its best-known trait.',
      pairs: [['JSON', 'Light, readable, the web API default'], ['XML', 'Tag-based and wordy, common in older enterprise systems'], ['Protocol Buffers', 'Compact binary defined by a schema'], ['JSON:API', 'A specification for how to lay out JSON responses'], ['ISO 8601', 'An unambiguous way to write dates and times']] },

    { type: 'multi', q: 'Which of these are good habits for JSON APIs?',
      options: ['Send dates as ISO 8601 strings in UTC', 'Send very large IDs as strings', 'Send money as whole minor units, such as pence, with a currency', 'Send dates as `dd/mm/yyyy` because that is how people write them', 'Send money as floating point so that it is easy to read'],
      answers: [0, 1, 2],
      explain: 'ISO 8601, string IDs and integer minor units each avoid a classic trap. Regional date formats are ambiguous, and floating-point money accumulates rounding errors.' },

    { type: 'estimate', q: 'A server sends the integer 9007199254740993 to a JavaScript client as a plain JSON number. By how much will the client\'s value differ from the one sent?',
      answer: 1, unit: 'difference', tolerance: 1.5, min: 0, max: 1000,
      explain: 'JavaScript can only hold whole numbers exactly up to 9007199254740991. Beyond that, some numbers are skipped, so ...993 is read as ...992. The difference is tiny, which is why this bug is silent and nasty.' },

    { type: 'explain', prompt: 'A colleague stores prices as `19.99` floats and sends them straight through the API. Explain the risk and what you would send instead.',
      model: 'Floating-point numbers cannot represent many decimals exactly, so adding and multiplying prices can produce small errors like 0.30000000000000004, and they can add up. I would send money as whole minor units, such as 1999 pence, together with a currency code, or as a string, and only format it for display at the last moment.',
      keywords: ['floating point', 'rounding', 'minor units', 'pence', 'currency', 'string'] }
  ],

  flashcards: [
    { q: 'What are serialising and deserialising?', a: 'Serialising turns an in-memory object into text or bytes to send; deserialising rebuilds the object from that data.' },
    { q: 'Name the types JSON supports.', a: 'Objects, arrays, strings, numbers, booleans and null. There is no date type and no comments.' },
    { q: 'How should APIs send dates?', a: 'As ISO 8601 strings, ideally in UTC, such as `2025-03-14T09:30:00Z`.' },
    { q: 'Why can big numbers break in JSON?', a: 'JavaScript reads all numbers as 64-bit floats, exact only up to 9,007,199,254,740,991. Send larger IDs as strings.' },
    { q: 'JSON vs XML vs Protocol Buffers in a line each?', a: 'JSON: light text, web default. XML: wordy tags, older enterprise. Protocol Buffers: compact binary with a required schema, used by gRPC.' }
  ],

  glossary: [
    { term: 'Serialisation', def: 'Turning an in-memory data structure into text or bytes that can be sent or stored.', like: 'Packing a wardrobe flat for delivery.', aka: ['encoding', 'marshalling'] },
    { term: 'Deserialisation', def: 'Rebuilding a data structure from the text or bytes that were sent.', like: 'Assembling the flat-pack at home.', aka: ['decoding', 'parsing'] },
    { term: 'JSON', def: 'JavaScript Object Notation: a text format built from objects, arrays, strings, numbers, booleans and null.', like: 'A very short instruction sheet that everyone can read.' },
    { term: 'JSON:API', def: 'A specification that fixes how resources, relationships and errors are laid out in JSON responses.', like: 'A standard form template for every response.' },
    { term: 'ISO 8601', def: 'The international standard for writing dates and times, from largest unit to smallest, such as `2025-03-14T09:30:00Z`.', like: 'A date format that cannot be misread in any country.' },
    { term: 'Protocol Buffers', def: 'A compact binary data format defined by a schema file, used heavily by gRPC.', aka: ['protobuf'], like: 'Shorthand that both sides learnt in advance.' }
  ],

  takeaways: [
    'Data must be **serialised** to travel and **deserialised** on arrival; both sides must agree the format.',
    'JSON won because it is small, readable and universal. XML and Protocol Buffers fill other niches.',
    'Dates: **ISO 8601 in UTC**. Big IDs: **strings**. Money: **whole minor units** plus currency.',
    'A shared layout such as JSON:API, or just a consistent house style, saves every caller from guessing.'
  ],

  links: [
    { label: 'MDN: Working with JSON', url: 'https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Objects/JSON' },
    { label: 'JSON:API specification', url: 'https://jsonapi.org/' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('api-openapi-hateoas', {
  eli5: 'An API can ship with a machine-readable description of itself, from which documentation, test servers and client code can be produced automatically, and its replies can even carry links that say what to do next.',

  cards: [
    { kind: 'concept', title: 'Documentation that goes stale',
      body: `A developer joins the team and asks: "which fields does \`POST /orders\` accept?" Somebody points at a wiki page. The page was last edited a year ago, and three fields have changed since.

        Written docs and real behaviour drift apart because they are two separate things, kept up to date by hand.

        The fix is to write the description in a form that **programs can read**: a single file that lists every endpoint, input, output and error. Then the docs, the checks and even some of the code can be **produced from that file**, so they cannot drift.` },

    { kind: 'metaphor', title: 'The architect\'s blueprint',
      body: `A house starts as a **blueprint**. From that one drawing, the builders know what to build, the inspector knows what to check, and the estate agent prints a brochure. Nobody re-draws the house for each audience.

        A machine-readable API description is the blueprint:

        - **Documentation** is the brochure.
        - **Mock servers** are a show-home you can walk round before the real house exists.
        - **Generated client code** is a ready-cut kit for the builders.
        - **Validation** is the inspector.

        Where it stops being true: a blueprint is finished before building. An API description must be kept alive as the API changes.` },

    { kind: 'code', title: 'A tiny OpenAPI file',
      body: 'This is a real, minimal **OpenAPI** description, written in YAML. **Tap the highlighted lines.**',
      code: { lang: 'yaml', src: `
        openapi: 3.1.0
        info:
          title: Bookshop API
          version: 1.0.0
        paths:
          /books/{id}:
            get:
              summary: Fetch one book
              parameters:
                - name: id
                  in: path
                  required: true
                  schema: { type: integer }
              responses:
                '200':
                  description: The book
                '404':
                  description: No such book`,
        notes: {
          1: 'The version of the OpenAPI specification itself, so tools know how to read the file.',
          6: '`paths` lists each endpoint. `{id}` is a placeholder for the number in the URL.',
          7: 'Under each path, the HTTP methods it supports.',
          10: 'Each input is described: its name, where it goes (`path`, `query` or `header`), and its type.',
          15: 'Every response the API may give is listed by status code.',
          17: 'Errors are part of the contract, too.'
        } } },

    { kind: 'diagram', title: 'One file, many outputs',
      body: 'Write the description once and a whole toolbox feeds from it.',
      nodes: [
        { id: 'spec', label: 'OpenAPI file', icon: '📐', x: 1, y: 0, tone: 'accent' },
        { id: 'docs', label: 'Interactive docs', icon: '📖', x: 0, y: 1 },
        { id: 'client', label: 'Generated clients', icon: '🧰', x: 1, y: 1 },
        { id: 'mock', label: 'Mock server', icon: '🎭', x: 2, y: 1 },
        { id: 'test', label: 'Contract tests', icon: '✅', x: 1, y: 2, tone: 'good' }
      ],
      edges: [
        { from: 'spec', to: 'docs' }, { from: 'spec', to: 'client' }, { from: 'spec', to: 'mock' }, { from: 'client', to: 'test', dashed: true }
      ],
      caption: 'Docs page you can try calls in; client libraries in many languages; a fake API for the front-end team to use early; tests that check the real API matches the file.' },

    { kind: 'concept', title: 'OpenAPI, Swagger and the confusing names',
      body: `**OpenAPI** is the specification: the rules for writing the description file. It began life as **Swagger**, and the name stuck to the tooling.

        So today:

        - **OpenAPI** = the specification (the format of the file).
        - **Swagger** = the family of tools from the same origin, such as Swagger UI, which turns a spec into a web page where you can try each call.

        People still say "Swagger docs" for any of it, and everyone knows what they mean. The file itself can be written in **YAML** or **JSON**. Tools exist to turn it into docs, clients in many languages, server stubs and mock servers.` },

    { kind: 'compare', title: 'Design-first vs code-first',
      body: 'You have to decide **which comes first**: the description or the code.',
      cols: ['Design-first', 'Code-first'],
      rows: [
        ['Order', 'Write the spec, then build to it', 'Write the code, then generate the spec'],
        ['Early feedback', 'Frontend and partners review before any code exists', 'Only once something runs'],
        ['Parallel work', 'Frontend uses a mock while backend builds', 'Frontend waits'],
        ['Drift risk', 'Spec can drift unless tests enforce it', 'Low: the spec comes from the code'],
        ['Feels like', 'Planning the menu, then cooking', 'Cooking, then writing down what you made']
      ],
      note: 'Experienced teams argue both ways. Design-first suits public or multi-team APIs; code-first suits small, fast-moving internal ones.' },

    { kind: 'steps', title: 'A design-first workflow',
      body: 'The usual loop when the spec leads.',
      steps: [
        { title: 'Draft the spec', body: 'Write the paths, inputs, outputs and errors in an OpenAPI file. No code yet.' },
        { title: 'Review it with the callers', body: 'Show the docs page to the frontend and partner teams. Changing a line of YAML is cheap; changing a live API is not.' },
        { title: 'Generate a mock and start in parallel', body: 'A mock server replies with example data from the spec, so consumers can build against it straight away.' },
        { title: 'Implement the backend', body: 'Build the real thing, with validation and tests that check responses against the spec.' },
        { title: 'Keep it in the repository', body: 'Treat the spec as source code: reviewed, versioned, and failing the build when it disagrees with reality.' }
      ] },

    { kind: 'concept', title: 'HATEOAS: responses that carry their own links',
      body: `Think about how you use a website. You do not memorise the URL of every page. You open the home page and **follow links**; the site tells you where you can go next.

        Most APIs are not like that: the client has the URLs written into its code. **HATEOAS** (Hypermedia As The Engine Of Application State, an awkward name) is the idea of making an API behave like a website for programs: **each response includes links to what you can do next**.

        It is the top level of the Richardson model. The server controls the paths, so it may change them without breaking clients, and it can offer actions only when they make sense.` },

    { kind: 'code', title: 'A response with links',
      body: 'A pending order. Notice which actions the server offers. **Tap the highlighted lines.**',
      code: { lang: 'json', src: `
        {
          "id": 918,
          "status": "pending",
          "total": 19.99,
          "_links": {
            "self":    { "href": "/orders/918" },
            "payment": { "href": "/orders/918/payment" },
            "cancel":  { "href": "/orders/918", "method": "DELETE" }
          }
        }`,
        notes: {
          5: 'Links live in their own block. The `_links` name is one convention; others exist, as there is no single standard.',
          6: '`self` is the address of this very resource.',
          7: 'The client does not need to know the payment URL in advance. It follows the link.',
          8: 'A `cancel` link appears because the order is still pending. Once it ships, the server would simply stop sending it.'
        } } },

    { kind: 'realworld', title: 'How much HATEOAS do people really use?',
      body: `Honestly: **full HATEOAS is rare**. Most real APIs stop at Richardson level 2, and clients still hard-code paths. Experts disagree on whether that is a flaw or a sensible trade-off.

        But the *spirit* shows up everywhere:

        - A response includes the **full URL** of related things, so the client need not build it.
        - A paginated list includes **next** and **previous** links (the HTTP \`Link\` header does exactly this). The GitHub API does both.
        - A state-dependent response offers only the actions that currently make sense.

        Use as much as helps your callers. Do not add links nobody will follow.` }
  ],

  activities: [
    { type: 'match', after: 3, prompt: 'Match each tool or thing to what it gives you.',
      pairs: [['OpenAPI file', 'A machine-readable description of every endpoint'], ['Mock server', 'Fake replies so callers can build early'], ['Generated client', 'Ready-made code for calling the API'], ['Swagger UI', 'A web page where you can try each call'], ['Contract test', 'A check that the API matches its description']] },

    { type: 'mcq', after: 5, q: 'A mobile team and a backend team start the same day on a new API. Which approach lets them work in parallel?',
      options: ['Write the OpenAPI spec first, and generate a mock server from it', 'Wait for the backend to finish, then document it', 'Let the mobile team guess the responses', 'Have both teams edit the same code files'],
      answer: 0,
      why: [null, 'That blocks the mobile team for weeks and finds disagreements late.', 'Guesses become disagreements, found at the worst time.', 'That creates merge conflicts, not agreement on a contract.'],
      explain: 'Design-first gives both teams a shared contract on day one. A mock server answers from the spec, so the front end can be built while the real backend is still being written.' },

    { type: 'order', prompt: 'Put a design-first workflow in order.',
      items: ['Draft the OpenAPI spec', 'Review it with the people who will call the API', 'Generate a mock server and start consumers building', 'Implement the real backend', 'Check the real API against the spec in tests'],
      explain: 'Cheap changes come first: a line in a file. Implementation follows once the contract is agreed, and the tests keep the two from drifting apart.' },

    { type: 'bucket', prompt: 'Which approach does each benefit belong to?', buckets: ['Design-first', 'Code-first'],
      items: [['Partners can review the API before any code exists', 0], ['The spec is generated from the code, so it rarely drifts', 1], ['Frontend can work against a mock immediately', 0], ['Fastest way to get a small internal API running', 1], ['Forces the team to think about callers up front', 0]],
      explain: 'Design-first moves feedback before the code. Code-first moves speed and accuracy of the description to the front. Neither is universally better.' },

    { type: 'tf', statement: 'OpenAPI and Swagger are two competing specifications for describing APIs.', answer: false,
      explain: 'OpenAPI is the specification. It began as Swagger, and "Swagger" now mostly names the tools (such as Swagger UI) that read it.' },

    { type: 'mcq', after: 8, q: 'In a HATEOAS response for an order that has already shipped, what would you expect the server to do with the `cancel` link?',
      options: ['Leave it out, because cancelling is no longer possible', 'Keep it, and return an error when clicked', 'Rename it to `refund` without telling anyone', 'Send it as a header instead'],
      answer: 0,
      why: [null, 'That works but misses the point: the response should say what is currently possible.', 'Silent renames break callers.', 'The link block in the body is where this information belongs.'],
      explain: 'Links reflect the current state, so the client can show or hide buttons just by checking which links exist. Business rules stay on the server.' },

    { type: 'scenario', title: 'Spec first or code first?', intro: 'Your company is building a partner API for a dozen retailers, plus an internal admin tool. The team lead asks how you will describe them.',
      meters: { 'partner trust': 50, 'delivery speed': 60 },
      steps: [
        { text: 'For the partner API, how do you proceed?',
          choices: [
            { label: 'Design-first: draft the OpenAPI spec, share it with two partners, then build', score: 2, effects: { 'partner trust': 25, 'delivery speed': -5 }, feedback: 'Outsiders will depend on this for years. Agreeing the contract early is far cheaper than changing it later.' },
            { label: 'Build it, then write the docs afterwards', score: 1, effects: { 'partner trust': -10, 'delivery speed': 10 }, feedback: 'Fast at first, but partners discover surprises late and the docs are written from memory.' },
            { label: 'Send partners the source code and let them work it out', score: 0, effects: { 'partner trust': -25 }, feedback: 'Code is not a contract. It exposes your internals and makes every implementation detail a promise.' }
          ] },
        { text: 'For the internal admin tool, used only by your own team, what is proportionate?',
          choices: [
            { label: 'Code-first: generate the spec from the code to keep docs free and accurate', score: 2, effects: { 'delivery speed': 15, 'partner trust': 5 }, feedback: 'The callers sit next to you. Generating the description keeps the effort low and still gives you docs.' },
            { label: 'A long design review process, as for the partner API', score: 1, effects: { 'delivery speed': -20 }, feedback: 'Thorough but disproportionate. Not every API needs the same ceremony.' },
            { label: 'Skip any description at all', score: 0, effects: { 'delivery speed': -5, 'partner trust': -5 }, feedback: 'Someone will join the team next year and wish that you had at least generated a page.' }
          ] }
      ],
      outro: 'The pattern to remember: **match the ceremony to the audience.** Strangers need a contract first; neighbours can be lighter.' },

    { type: 'explain', prompt: 'Explain what HATEOAS is, as if to a developer who has only hard-coded URLs.',
      model: 'HATEOAS means each API response includes links to related resources and the actions available next, just as a web page has links. The client follows the links instead of hard-coding paths, so the server can change addresses, and can offer or withhold actions depending on state, such as only offering cancel while an order is pending.',
      keywords: ['links', 'next', 'follow', 'hard-coded', 'state', 'server', 'website'] }
  ],

  flashcards: [
    { q: 'What is OpenAPI?', a: 'A specification for describing an HTTP API in a machine-readable file (YAML or JSON): endpoints, inputs, outputs and errors.' },
    { q: 'What can be generated from an OpenAPI file?', a: 'Interactive documentation, client libraries, server stubs, mock servers and contract tests.' },
    { q: 'Design-first vs code-first?', a: 'Design-first: write the spec, review it, then build. Code-first: write the code, then generate the spec from it.' },
    { q: 'Swagger vs OpenAPI?', a: 'OpenAPI is the specification; Swagger is the original name, now mostly used for the tools around it, such as Swagger UI.' },
    { q: 'What is HATEOAS?', a: 'Hypermedia As The Engine Of Application State: responses carry links to related resources and the next possible actions.' }
  ],

  glossary: [
    { term: 'OpenAPI', def: 'A specification for describing HTTP APIs in a machine-readable file, so that tools can produce docs, clients, mocks and tests.', like: 'The architect\'s blueprint for an API.', aka: ['Swagger spec'] },
    { term: 'Mock server', def: 'A stand-in server that replies with example data from the API description, before the real one exists.', like: 'A show-home.' },
    { term: 'Design-first', def: 'Writing and agreeing the API description before writing any code.', like: 'Planning the menu before cooking.' },
    { term: 'Code-first', def: 'Writing the code first and generating the API description from it.', like: 'Cooking first, then writing down what you made.' },
    { term: 'HATEOAS', def: 'Hypermedia As The Engine Of Application State: an API style where responses include links to what the client can do next.', like: 'Following links on a website instead of memorising addresses.', aka: ['hypermedia'] }
  ],

  takeaways: [
    'An **OpenAPI** file describes an API so tools can generate docs, clients, mocks and tests from one source.',
    '**Design-first** moves feedback before code; **code-first** moves speed and accuracy to the front. Choose by audience.',
    'Keep the spec in the repository and test against it, or it will drift like any other docs.',
    '**HATEOAS** puts links in responses so the server steers the client. Rare in full, common in spirit.'
  ],

  links: [
    { label: 'OpenAPI Initiative', url: 'https://www.openapis.org/' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('api-reliability', {
  eli5: 'Networks drop messages at the worst moment, so reliable APIs give up on slow calls, make repeats harmless, limit how fast anyone may call, cap the size of everything, and change without breaking old callers.',

  cards: [
    { kind: 'concept', title: 'Your request will get lost, eventually',
      body: `Every API call crosses a network, and networks are not polite. When a call fails, the caller is often left guessing which of **three** things happened:

        1. The request **never arrived**. Nothing was done.
        2. The request arrived and was **done**, but the reply got lost. Everything was done, and you do not know it.
        3. The server is just **slow**. It may still finish.

        From the caller's side, cases 1 and 2 look identical: silence. Yet one means "do it again" and the other means "do it again and you will pay twice".

        Reliable API design is mostly about making that guess safe.` },

    { kind: 'metaphor', title: 'Hanging up the phone',
      body: `You ring a company. It rings and rings and nobody answers. How long do you hold on? A sensible person gives up after half a minute and tries later. A person with no limit would sit there all afternoon, unable to do anything else.

        A program that calls an API with **no timeout** does exactly that: it waits forever, holding a thread, a connection and possibly a customer who is staring at a spinner.

        Many HTTP libraries have a very long (or even infinite) default wait. So the rule is blunt: **put a timeout on every call you make.** Decide how long is too long *before* the day it matters.` },

    { kind: 'code', title: 'A timeout in practice',
      body: 'Modern JavaScript can cancel a request after a set time. **Tap the highlighted lines.**',
      code: { lang: 'js', src: `
        async function getForecast(city) {
          const url = 'https://api.weather.example/v1/forecast?city=' + city;
          const res = await fetch(url, {
            signal: AbortSignal.timeout(3000)   // give up after 3 seconds
          });
          if (!res.ok) throw new Error('Forecast failed: ' + res.status);
          return res.json();
        }`,
        notes: {
          4: 'The call is cancelled after 3000 ms and throws an error. What you choose depends on the call: a few seconds for most, longer for a big upload.',
          6: 'A reply with an error status must also be handled. A timeout is one kind of failure, not the only kind.'
        } } },

    { kind: 'sequence', title: 'Retrying safely with an idempotency key',
      body: 'Back to the lost-reply case. A payment retry must not charge twice. Step through the fix.',
      actors: ['App', 'API', 'Card processor'],
      steps: [
        { from: 0, to: 1, label: 'POST /payments  key=abc123', note: 'The app invents a unique key for **this** payment attempt and sends it as a header.' },
        { from: 1, to: 2, label: 'charge £30', note: 'The API stores the key, then does the work.' },
        { from: 1, to: 0, label: '201 Created', dashed: true, note: 'The reply is lost on the way back. The app sees only silence.' },
        { from: 0, to: 1, label: 'POST /payments  key=abc123', note: 'The app retries with the **same key**: this is the same attempt, not a new one.' },
        { at: 1, label: 'key seen before', note: 'The API finds `abc123` in its records and knows this is a repeat.' },
        { from: 1, to: 0, label: '201 Created (replayed)', dashed: true, note: 'It returns the **stored result** without charging again. The card processor was only called once.' }
      ] },

    { kind: 'compare', title: 'What the server remembers',
      body: 'An **idempotency key** only works if the server keeps a small record. Roughly like this:',
      cols: ['Key', 'Request seen', 'Stored response'],
      rows: [
        ['Row 1', '`abc123`', '`POST /payments £30`', '`201`, payment 5501'],
        ['Row 2', '`def456`', '`POST /payments £12`', '`201`, payment 5502'],
        ['Row 3', '`ghi789`', '`POST /payments £8`', 'Still in progress']
      ],
      note: 'Same key, same request: replay the stored answer. Same key but a **different** request is a client bug, so APIs usually reject it with a 4xx. Servers keep keys for a limited time, often around a day. Safe methods (GET, PUT, DELETE) are already repeatable; keys matter for POST.' },

    { kind: 'code', title: 'A careful retry loop',
      body: 'Retrying is useful, but done carelessly it makes things worse. **Tap the highlighted lines.**',
      code: { lang: 'js', src: `
        async function withRetry(call, tries = 3) {
          for (let attempt = 1; attempt <= tries; attempt++) {
            try {
              return await call();
            } catch (err) {
              if (attempt === tries) throw err;
              const wait = 2 ** attempt * 100 + Math.random() * 100;
              await new Promise(r => setTimeout(r, wait));
            }
          }
        }`,
        notes: {
          6: 'A **limit**. Retrying forever just makes the problem bigger.',
          7: '**Exponential backoff**: wait 200 ms, then 400, then 800... **Jitter** (the random bit) stops thousands of clients retrying in lockstep.'
        } },
      note: 'Only retry what is safe: timeouts, `503` and `429`, using an idempotency key where the call changes things. Never retry a `400` or `404`: asking again gives the same answer.' },

    { kind: 'code', title: 'Rate limiting and 429',
      body: `An API with no limits can be flattened by one buggy script. So servers cap how many requests each caller may make in a period. Go over, and you get **429**. **Tap the highlighted lines.**`,
      code: { lang: 'http', src: `
        HTTP/1.1 429 Too Many Requests
        Retry-After: 30
        Content-Type: application/json

        {"code": "rate_limited", "message": "Slow down."}`,
        notes: {
          1: '`429 Too Many Requests`: you are not wrong, you are early. It is a **client** error that clears with time.',
          2: '`Retry-After` says how many seconds to wait before trying again. A good client obeys it rather than guessing.',
          5: 'A machine-readable code lets callers handle this case specifically.'
        } },
      note: 'Many APIs also send headers showing your remaining allowance. The names vary between providers, so check the docs. The Resilience world covers the algorithms behind limits.' },

    { kind: 'concept', title: 'Limit sizes, not just speed',
      body: `Speed is one limit. **Size** is the other. Without caps, one request can ask for a million rows, or upload a 20 GB "profile photo", and quietly eat a server's memory.

        Sensible habits:

        - **Cap page sizes.** If \`?limit=\` is missing, use a default (say 20). If it is huge, clamp it to a maximum (say 100) rather than obeying.
        - **Cap request bodies.** Too big gets \`413\`, the "payload too large" status.
        - **Cap lengths** of fields and numbers of items in a list.
        - **Say so in the docs**, so callers can plan.

        Paginate everything that can grow. A list that is small today will not be small after two years of customers.` },

    { kind: 'steps', title: 'Changing an API without breaking callers',
      body: 'Sooner or later you must retire something. The responsible routine looks like this:',
      steps: [
        { title: 'Prefer additive changes', body: 'New optional fields and new endpoints break nobody. Make most of your changes this kind.' },
        { title: 'Expect clients to be tolerant', body: 'Document that callers must ignore fields they do not recognise. Then adding fields stays safe.' },
        { title: 'Announce the deprecation', body: 'Say what is going, what replaces it and when. Many APIs mark it in docs and in responses; a `Sunset` header exists for announcing a retirement date.' },
        { title: 'Watch who still uses it', body: 'Log which callers hit the old thing. You can email the stragglers instead of guessing.' },
        { title: 'Remove only after the deadline', body: 'Often by releasing a new version and retiring the old one. A public API may need years, a private one weeks.' }
      ] },

    { kind: 'pitfall', title: 'The retry storm',
      body: `A server stumbles for ten seconds. Ten thousand clients all time out, and all of them retry at once. The server, which was just recovering, is hit by **ten thousand extra requests** and falls over again. The clients retry again. The outage is now self-inflicted.

        This is a **retry storm**, and it is how small blips become big outages. The defences are the ones in this lesson: **timeouts** so clients do not pile up, **backoff with jitter** so retries spread out, **limits on attempts**, and respecting \`Retry-After\`.

        Retrying is a loan against the server's patience. Spend it carefully.` }
  ],

  activities: [
    { type: 'ab', after: 2, q: 'Which call is safer to ship?',
      a: { lang: 'js', label: 'No timeout', src: `
        const res = await fetch(url);` },
      b: { lang: 'js', label: 'With a timeout', src: `
        const res = await fetch(url, {
          signal: AbortSignal.timeout(3000)
        });` },
      answer: 'b',
      explain: 'Without a timeout, a stalled server can hold your program (and your user) hostage indefinitely. A deadline turns "stuck forever" into an error you can handle.' },

    { type: 'mcq', after: 3, q: 'An app retries `POST /payments` after a lost reply, with the same idempotency key. What should the server do?',
      options: ['Recognise the key and return the original result without charging again', 'Charge again, because every POST is a new request', 'Refuse all requests that carry a key', 'Delete the first payment and create a new one'],
      answer: 0,
      why: [null, 'That is exactly the double charge the key exists to prevent.', 'The key is a feature, not a fault.', 'Deleting would lose a real payment that was already made.'],
      explain: 'The key says "this is the same attempt". The server looks it up, finds the stored result, and replays it, so a retry is harmless however many times it happens.' },

    { type: 'tf', after: 6, statement: 'When a server answers `429` with `Retry-After: 30`, the client should wait about 30 seconds before trying again.', answer: true,
      explain: '`429` means "too many requests", and `Retry-After` is the server telling you when it will accept more. Obeying it is both polite and the fastest way back in.' },

    { type: 'bucket', prompt: 'Should the client retry this failure (with backoff), or not?', buckets: ['Retry with backoff', 'Do not retry'],
      items: [['The request timed out', 0], ['`503 Service Unavailable`', 0], ['`429` with `Retry-After: 10` (wait first)', 0], ['`400 Bad Request` for malformed JSON', 1], ['`404 Not Found` for the wrong ID', 1], ['`422` for an invalid email address', 1]],
      explain: 'Temporary conditions (slow, busy, overloaded) may clear. Errors caused by the request itself will give the same answer however often you ask, so retrying only wastes effort.' },

    { type: 'spot', prompt: 'This retry loop for a payment has a serious problem. Tap a line where it begins.',
      code: { lang: 'js', src: `
        async function pay(order) {
          for (let i = 0; i < 5; i++) {
            try {
              return await post('/payments', order);
            } catch (e) {}
          }
        }` },
      lines: [4, 5],
      explain: 'The call sends no idempotency key, so every retry may charge again, and the empty `catch` retries instantly with no backoff, which feeds a retry storm. A key and a growing delay fix both.' },

    { type: 'short', q: 'Which status code means "too many requests, slow down"?', accept: ['429'], hint: 'Four hundred and twenty-something.',
      explain: '`429 Too Many Requests`, often with a `Retry-After` header saying how long to wait.' },

    { type: 'estimate', q: 'An API allows 100 requests per minute. A buggy client sends 10 requests every second for one minute. Roughly how many of those requests will be rejected with 429?',
      answer: 500, unit: 'requests', tolerance: 1.3,
      explain: 'The client sends 10 × 60 = 600 requests; the server accepts 100 and rejects the other 500. A client that obeyed `Retry-After` would have spread its calls and had none rejected.' },

    { type: 'scenario', title: 'The partner who hammers you', intro: 'Your orders API is slowing down. The logs show one partner\'s integration retrying failed calls immediately, hundreds of times a minute, after your database hiccuped for a few seconds.',
      meters: { 'uptime': 50, 'partner relationship': 60 },
      steps: [
        { text: 'The API is still struggling. What do you do first?',
          choices: [
            { label: 'Apply rate limits per API key, returning `429` with `Retry-After`', score: 2, effects: { uptime: 30, 'partner relationship': 5 }, feedback: 'The limit protects everyone else, and the status tells the partner\'s code exactly what is happening and when to come back.' },
            { label: 'Block the partner entirely until they fix it', score: 1, effects: { uptime: 25, 'partner relationship': -30 }, feedback: 'It works, but a block with no explanation breaks their business for a bug that you could have contained politely.' },
            { label: 'Buy bigger servers and hope', score: 0, effects: { uptime: 5, 'partner relationship': 0 }, feedback: 'An unlimited caller can absorb any capacity. You have raised the bill without fixing the cause.' }
          ] },
        { text: 'Now you contact the partner. What guidance do you give their developers?',
          choices: [
            { label: 'Add timeouts, retry only a few times with exponential backoff and jitter, and honour `Retry-After`', score: 2, effects: { uptime: 15, 'partner relationship': 20 }, feedback: 'This is the standard recipe. It spreads their retries over time and gives your server room to recover.' },
            { label: 'Tell them to retry faster so they do not lose data', score: 0, effects: { uptime: -30, 'partner relationship': -10 }, feedback: 'More speed means more load on a sick server. That is how outages deepen.' },
            { label: 'Tell them never to retry at all', score: 1, effects: { uptime: 10, 'partner relationship': -5 }, feedback: 'Safe for you, but they lose orders to every small blip. Careful retries are healthy.' }
          ] },
        { text: 'One of their calls is `POST /orders`. What else should they add so retries cannot create duplicate orders?',
          choices: [
            { label: 'An idempotency key per order attempt, which your API honours', score: 2, effects: { 'partner relationship': 20, uptime: 5 }, feedback: 'Now a retry replays the first answer. No duplicate orders, however messy the network.' },
            { label: 'Nothing: duplicates are rare', score: 0, effects: { 'partner relationship': -15 }, feedback: 'Rare is not never. With thousands of orders, "rare" is somebody\'s weekly support ticket.' },
            { label: 'A longer timeout on every call', score: 1, effects: { 'partner relationship': 0 }, feedback: 'Helpful for slow replies, but it does nothing about a reply that is lost entirely.' }
          ] }
      ],
      outro: 'The pattern to remember: **limit the damage a caller can do, and teach callers to retry politely and safely.**' },

    { type: 'explain', prompt: 'Explain why a retry can cause a double charge, and how an idempotency key prevents it.',
      model: 'If the reply to a payment request is lost, the client cannot tell whether the server did the work, so it retries, and the server may charge a second time. With an idempotency key, the client sends the same unique key on every attempt. The server records the key with the result, and when it sees the key again it returns the stored result instead of repeating the charge.',
      keywords: ['retry', 'lost reply', 'same key', 'stored result', 'twice', 'unique'] }
  ],

  flashcards: [
    { q: 'Why must every API call have a timeout?', a: 'Without one, a stalled server can block your program indefinitely. A deadline turns hanging into an error you can handle.' },
    { q: 'What is an idempotency key?', a: 'A unique ID the client sends with a request, so that if it is repeated, the server returns the stored result instead of doing the work again.' },
    { q: 'What do 429 and Retry-After mean?', a: '429 Too Many Requests: you hit a rate limit. Retry-After says how many seconds to wait before trying again.' },
    { q: 'Which failures should be retried?', a: 'Temporary ones: timeouts, 503 and 429 (after waiting), with backoff and jitter. Not 400, 404 or 422: the request itself is wrong.' },
    { q: 'How do you retire part of an API responsibly?', a: 'Prefer additive changes, announce a deprecation with a date and replacement, watch who still calls it, and remove it only after the deadline.' }
  ],

  glossary: [
    { term: 'Timeout', def: 'A limit on how long a caller waits for a response before giving up and treating the call as failed.', like: 'Hanging up the phone after half a minute of ringing.' },
    { term: 'Exponential backoff', def: 'Waiting a little longer before each successive retry (say 0.2 s, 0.4 s, 0.8 s), so a struggling server gets room to recover.', like: 'Knocking again after longer and longer pauses.' },
    { term: 'Jitter', def: 'A small random amount added to retry delays so that many clients do not retry at exactly the same moment.', like: 'A crowd leaving a stadium in a trickle instead of all through one gate at once.' },
    { term: 'Rate limiting', def: 'Capping how many requests a caller may make in a period, and answering with `429` when it is exceeded.', like: 'A bouncer letting a club in a few people at a time.', aka: ['throttling'] },
    { term: 'Retry storm', def: 'A pile-up where many clients retry failed requests at once, overloading a server that was trying to recover.', like: 'Everyone pushing on a jammed door at the same time.' },
    { term: 'Deprecation', def: 'Officially announcing that a feature will be removed later, giving callers time to move.', like: 'A "closing down" sign weeks before the shop shuts.' }
  ],

  takeaways: [
    'Put a **timeout** on every call, because a lost reply looks exactly like a lost request.',
    'Make repeats harmless with an **idempotency key**; retry with **backoff and jitter**, and a cap.',
    'Rate-limit callers with **429 + Retry-After**; cap page sizes and body sizes too.',
    'Change by **adding**; retire by **announcing**, watching and waiting.'
  ],

  links: [
    { label: 'MDN: 429 Too Many Requests', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status/429' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('api-integration-patterns', {
  eli5: 'There are only a handful of ways to wire two systems together: ask and wait, ask repeatedly, be called back, swap files, share a database or pass messages, and each has trade-offs.',

  cards: [
    { kind: 'concept', title: 'Two systems that need to talk',
      body: `Your shop takes an order. The warehouse system must hear about it, and later the shop must hear that the parcel has shipped. Two systems, two directions, and a decision: **how do they talk?**

        It turns out there are only a handful of answers. Each has a name, and each is the right choice somewhere and a disaster somewhere else. This lesson is a tour, with one first question to ask of every integration:

        **Does the sender wait for the answer?**

        If yes, the integration is **synchronous**. If it carries on and the answer arrives later, it is **asynchronous**.` },

    { kind: 'metaphor', title: 'A phone call vs a letter',
      body: `A **phone call** is synchronous. You ask, the other person answers, and both of you are tied up until it ends. If they do not pick up, you cannot do anything with your question. But you get your answer immediately.

        A **letter** is asynchronous. You post it and carry on with your day. The reply comes whenever it comes, and neither of you needs to be free at the same moment.

        Neither is better. A quick yes/no question suits a call; something that takes a week suits a letter. APIs behave the same way.` },

    { kind: 'sequence', title: 'Polling: "are we there yet?"',
      body: 'The shop wants a shipping label from a slow service. It starts the job, then keeps asking.',
      actors: ['Shop', 'Label service'],
      steps: [
        { from: 0, to: 1, label: 'POST /labels', note: 'The shop asks for a label to be made.' },
        { from: 1, to: 0, label: '202 Accepted, /labels/9', dashed: true, note: '`202 Accepted` means "I have your request, it is not done". You get a status address to check.' },
        { from: 0, to: 1, label: 'GET /labels/9', note: 'A little later, the shop asks again.' },
        { from: 1, to: 0, label: '{"status": "working"}', dashed: true, note: 'Not yet. This call was wasted effort.' },
        { from: 0, to: 1, label: 'GET /labels/9', note: 'And again.' },
        { from: 1, to: 0, label: '{"status": "done", ...}', dashed: true, note: 'Finally. **Polling** is simple and works anywhere, but most of its calls are wasted.' }
      ] },

    { kind: 'sequence', title: 'Webhooks: "ring me when it is done"',
      body: 'The same job, flipped round. The shop gives the label service an address to call.',
      actors: ['Shop', 'Label service'],
      steps: [
        { from: 0, to: 1, label: 'POST /labels, callback=/hooks/label', note: 'The shop asks for the label **and leaves a callback URL**.' },
        { from: 1, to: 0, label: '202 Accepted', dashed: true, note: 'Accepted for later. The shop is free to do other things.' },
        { at: 1, label: 'label is finished', note: 'The label service does its slow work.' },
        { from: 1, to: 0, label: 'POST /hooks/label {done}', note: 'It calls **the shop\'s** endpoint. This is a **webhook**: an HTTP call made *by* the server *to* you.' },
        { from: 0, to: 1, label: '200 OK', dashed: true, note: 'The shop acknowledges. If it does not reply, a good sender retries, so receivers must handle repeats.' }
      ] },

    { kind: 'compare', title: 'Request/reply, polling and webhooks',
      body: 'All three use ordinary HTTP. They differ in who starts the conversation and when.',
      cols: ['Request/reply', 'Polling', 'Webhook'],
      rows: [
        ['Best for', 'Quick answers', 'Slow jobs, simple clients', 'Events: "something happened"'],
        ['Who starts', 'Caller', 'Caller, repeatedly', 'The service, when it has news'],
        ['Wasted calls', 'None', 'Many', 'None'],
        ['Delay for news', 'None', 'Up to the polling gap', 'Near instant'],
        ['Catch', 'Caller blocks while waiting', 'Chatty and slow to notice', 'Needs a public endpoint, and must verify the sender and handle repeats']
      ],
      note: 'Webhooks need care: check a signature so strangers cannot fake events, and treat repeated deliveries as normal. The realtime module returns to push techniques.' },

    { kind: 'concept', title: 'File transfer: old, ugly, alive',
      body: `The oldest integration of all: system A writes a **file** (often CSV) to a shared location every night, and system B picks it up and loads it.

        It sounds prehistoric, and it is still everywhere: banks, payroll, retail suppliers, government feeds. Why? It is **easy to start**, needs no live connection, and handles huge volumes in one go.

        The costs are real: data is only as fresh as the last file, formats are agreed by email and drift, a half-written file can be read as if it were whole, and errors are discovered the next morning.

        Fine for batch work where hours of delay do not matter. A poor choice for anything the customer is waiting on.` },

    { kind: 'diagram', title: 'The shared database trap',
      body: 'The tempting shortcut: instead of an API, let every system read and write the **same database**.',
      nodes: [
        { id: 'o', label: 'Orders system', x: 0, y: 0 },
        { id: 'b', label: 'Billing system', x: 1, y: 0 },
        { id: 's', label: 'Shipping system', x: 2, y: 0 },
        { id: 'db', label: 'One shared database', icon: '🗄️', x: 1, y: 1, tone: 'bad' }
      ],
      edges: [
        { from: 'o', to: 'db', both: true }, { from: 'b', to: 'db', both: true }, { from: 's', to: 'db', both: true }
      ],
      caption: 'Every table layout is now a public contract that nobody agreed to.' },

    { kind: 'pitfall', title: 'Why a shared database is an anti-pattern',
      body: `It is fast to build, and that is the problem. With a shared database:

        - **No contract.** Every column is now something someone else may depend on, so you cannot rename or restructure anything safely.
        - **No owner.** Any system can write any row, bypassing the rules that the owning team enforces in code.
        - **Hidden coupling.** A change by one team breaks another with no warning, a slower relative of the shared-helper trap you met in Design Principles.
        - **Shared load.** One system's heavy query slows all the others.

        The cure is the lesson's theme: each system **owns its data** and shares it through an **API** or **messages**. The database stays inside the kitchen.` },

    { kind: 'concept', title: 'Messaging: leave it in the post box',
      body: `Another way for two systems to talk: neither calls the other. The sender drops a **message** ("order 918 was placed") into a **queue** or topic managed by a **message broker**. Whoever cares picks it up when ready.

        Think of a post box. The sender does not need the receiver to be at home, or even to exist yet. If the receiver is down for an hour, the messages simply wait.

        That buys you **loose coupling** (neither side knows the other) and **resilience** (a slow consumer does not block the sender). The price is complexity: another moving part, and answers that are not instant.

        The whole **Messaging** world, coming up later in the course, is devoted to this.` },

    { kind: 'diagram', title: 'API gateway: one front door',
      body: 'Behind a busy product there may be dozens of small services. An **API gateway** is the single entrance that outsiders use.',
      nodes: [
        { id: 'web', label: 'Web app', icon: '🌐', x: 0, y: 0 },
        { id: 'mob', label: 'Mobile app', icon: '📱', x: 1, y: 0 },
        { id: 'par', label: 'Partner', icon: '🤝', x: 2, y: 0 },
        { id: 'gw', label: 'API gateway', icon: '🚪', x: 1, y: 1, tone: 'accent' },
        { id: 'ord', label: 'Orders service', x: 0, y: 2 },
        { id: 'usr', label: 'Users service', x: 1, y: 2 },
        { id: 'pay', label: 'Payments service', x: 2, y: 2 }
      ],
      edges: [
        { from: 'web', to: 'gw' }, { from: 'mob', to: 'gw' }, { from: 'par', to: 'gw' },
        { from: 'gw', to: 'ord', label: 'routes' }, { from: 'gw', to: 'usr' }, { from: 'gw', to: 'pay' }
      ],
      caption: 'The gateway checks identity, applies rate limits, routes each request and can log everything in one place.' },

    { kind: 'concept', title: 'Backends for frontends (BFF)',
      body: `A phone app, a website and a smartwatch all want slightly different things. The phone wants small images and one combined call. The website wants more detail. One general-purpose API ends up awkward for everyone.

        A **Backend for Frontend** is a small server built **for one kind of client**. The mobile BFF gathers data from several services, trims it down and shapes it exactly the way the phone wants. The web BFF does the same for the website.

        Gateway and BFF are different: the gateway is **one front door for everyone**, and a BFF is **a tailor for each client type**. Large systems often have both. The cost is more services to run, and some duplicated logic.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'Which of these is an example of asynchronous communication?',
      options: ['Posting a message to a queue and carrying on, with the reply arriving later', 'Calling a function and waiting for the return value', 'Loading a page and staring at a spinner until it arrives', 'A request that blocks until the answer comes back'],
      answer: 0,
      why: [null, 'The caller waits for the answer, so it is synchronous.', 'The spinner is the waiting. That is synchronous.', 'Blocking until the answer arrives is the definition of synchronous.'],
      explain: 'Asynchronous means the sender carries on without waiting. The answer, if there is one, arrives later by some other route.' },

    { type: 'ab', after: 4, q: 'A payment provider needs to tell your shop when a payment settles, which can take hours. Which design fits better?',
      a: { lang: 'text', label: 'Polling', src: `
        Every 5 seconds:
          GET /payments/881
        ...for several hours` },
      b: { lang: 'text', label: 'Webhook', src: `
        Provider calls:
          POST /hooks/payments
        when the payment settles` },
      answer: 'b',
      explain: 'Polling every few seconds for hours is thousands of wasted calls, and still delays news by up to five seconds. A webhook sends exactly one call at the moment it matters (and the shop must verify it is genuine and cope with repeats).' },

    { type: 'tf', after: 6, statement: 'Letting several systems read and write the same database is a convenient way to share data, so long as everyone is careful.', answer: false,
      explain: 'Carefulness does not create a contract. Every table and column becomes an unwritten promise, any system can bypass the owner\'s rules, and one team\'s change can break another with no warning. Share through an API or messages instead.' },

    { type: 'match', prompt: 'Match each integration pattern to its one-line description.',
      pairs: [['Request/reply', 'Ask and wait for an immediate answer'], ['Polling', 'Keep asking until the job is done'], ['Webhook', 'The service calls you when something happens'], ['File transfer', 'A batch file is dropped for another system to load'], ['Message queue', 'Messages wait in a broker until a consumer is ready']] },

    { type: 'bucket', prompt: 'Which integration pattern would you reach for?', buckets: ['Request/reply', 'Webhook', 'File transfer', 'Messaging'],
      items: [['Showing the current price of a product on a page', 0], ['Being told when a customer\'s payment has settled', 1], ['Nightly export of all sales to the finance system', 2], ['Telling billing, shipping and email that an order was placed, without any of them being up right now', 3], ['Looking up a user\'s name by ID', 0], ['A supplier sending a huge daily price list', 2], ['A code host notifying your build server of a new commit', 1]],
      explain: 'Immediate answers need request/reply. "Tell me when" is a webhook. Big, regular, tolerant-of-delay data fits files. Many-to-many events that must not be lost fit messaging.' },

    { type: 'short', q: 'What is the name for an HTTP call that a service makes to your endpoint when something happens?', accept: ['webhook', 'webhooks', 'a webhook'], hint: 'Think "hook" on the web.',
      explain: 'A **webhook** reverses the usual direction: instead of you asking repeatedly, the service calls you once, when there is news.' },

    { type: 'scenario', title: 'Wiring up a growing shop', intro: 'Your shop is growing. Orders must reach the warehouse, partners want live stock levels, and the mobile and web teams keep fighting over what the API should return.',
      meters: { 'reliability': 50, 'team speed': 50 },
      steps: [
        { text: 'The warehouse system is old and sometimes down for maintenance, but must never lose an order. How do you pass orders to it?',
          choices: [
            { label: 'Publish an "order placed" message to a queue; the warehouse picks them up when it is ready', score: 2, effects: { reliability: 30, 'team speed': -5 }, feedback: 'Messages wait safely in the broker while the warehouse is down. Neither side needs the other to be available at the same moment.' },
            { label: 'Call the warehouse API directly and fail the checkout if it is down', score: 1, effects: { reliability: -20, 'team speed': 5 }, feedback: 'Simple, but now the warehouse\'s maintenance window stops customers buying from you.' },
            { label: 'Let the warehouse read the shop\'s database directly', score: 0, effects: { reliability: -25, 'team speed': 5 }, feedback: 'No contract, no owner, and any table change breaks the warehouse. This is the shared-database trap.' }
          ] },
        { text: 'Partners want to know the moment stock levels change. What do you offer?',
          choices: [
            { label: 'Webhooks: partners register a URL and you call it when stock changes', score: 2, effects: { reliability: 10, 'team speed': 15 }, feedback: 'Partners get news immediately and stop hammering you with polling calls. You will need signing and retries on your side.' },
            { label: 'Let partners poll `/stock` every second', score: 0, effects: { reliability: -20, 'team speed': -5 }, feedback: 'A dozen partners polling every second is a lot of wasted traffic, and updates are still up to a second late.' },
            { label: 'Email them a CSV once a week', score: 1, effects: { 'team speed': -10 }, feedback: 'Works for slow-moving data, but the stock figures are stale almost immediately.' }
          ] },
        { text: 'The mobile team wants small, combined responses; the web team wants rich detail. What do you do?',
          choices: [
            { label: 'Put an API gateway in front, and give each client type a small Backend for Frontend', score: 2, effects: { 'team speed': 25, reliability: 5 }, feedback: 'The gateway handles shared concerns such as authentication and limits. Each BFF shapes data for its own client, so the teams stop fighting.' },
            { label: 'Make one API that returns everything for everyone', score: 1, effects: { 'team speed': -5 }, feedback: 'Phones download data they never show, and the compromise suits neither team.' },
            { label: 'Let each team build its own direct connection to every service', score: 0, effects: { reliability: -15, 'team speed': -10 }, feedback: 'Now every client knows every service\'s address and rules, and one internal change breaks them all.' }
          ] }
      ],
      outro: 'The pattern to remember: **choose by what must wait for what.** Immediate answers call, "tell me when" hooks, bulk goes by file, and must-not-lose goes by message.' },

    { type: 'explain', prompt: 'Explain why sharing a database between two systems is considered an anti-pattern, and what to do instead.',
      model: 'A shared database has no contract: every table and column becomes something other systems depend on, so nobody can change the structure safely, and any system can write rows without the owner\'s rules. Changes break other teams silently and heavy queries slow everyone. Instead each system should own its data and share it through an API or messages.',
      keywords: ['contract', 'owner', 'coupling', 'break', 'API', 'messages', 'own their data'] }
  ],

  flashcards: [
    { q: 'Synchronous vs asynchronous integration?', a: 'Synchronous: the caller waits for the answer. Asynchronous: the caller carries on, and any answer arrives later.' },
    { q: 'Polling vs webhooks?', a: 'Polling: the client keeps asking "done yet?" and most calls are wasted. A webhook: the service calls the client\'s URL once, when there is news.' },
    { q: 'What do you need to do when receiving a webhook?', a: 'Verify that it really came from the sender (usually a signature) and cope with the same event being delivered more than once.' },
    { q: 'Why is a shared database an anti-pattern?', a: 'No contract, no clear owner, hidden coupling and shared load: any schema change can break other systems silently.' },
    { q: 'API gateway vs Backend for Frontend?', a: 'A gateway is one front door for all clients (auth, limits, routing). A BFF is a small server tailored to one kind of client, such as mobile or web.' }
  ],

  glossary: [
    { term: 'Synchronous', def: 'A style of communication where the caller waits for the reply before continuing.', like: 'A phone call.' },
    { term: 'Asynchronous', def: 'A style of communication where the sender carries on without waiting, and any reply comes later.', like: 'Posting a letter.' },
    { term: 'Polling', def: 'Repeatedly asking a service whether something has finished or changed.', like: 'Children asking "are we there yet?"' },
    { term: 'Webhook', def: 'An HTTP call a service makes to a URL you supplied, when an event happens.', like: '"Ring me when it is ready."', aka: ['callback'] },
    { term: 'Message broker', def: 'Software that holds messages in queues or topics so senders and receivers need not be online together.', like: 'A post office sorting room.' },
    { term: 'API gateway', def: 'A single entry point in front of many services that handles routing, authentication and limits.', like: 'The reception desk of a large office building.' },
    { term: 'Backend for Frontend', def: 'A small backend built for one type of client (such as mobile) that gathers and shapes data for it.', like: 'A tailor who makes the same cloth fit different people.', aka: ['BFF'] }
  ],

  takeaways: [
    'First question: does the sender **wait** for the answer? That separates sync from async.',
    '**Webhooks** beat **polling** for "tell me when", provided you verify senders and handle repeats.',
    'Files suit slow, bulk batches. A **shared database** is a trap: share through APIs or messages.',
    'A **gateway** is one front door; a **BFF** is a tailor for one client type.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('api-design', {
  title: 'The Contract Goblin',
  intro: 'A goblin lives under the bridge between two systems and eats any API that breaks its promises. Feed it good designs, safe retries and sensible wiring, and it will let you cross.',
  questions: [
    { type: 'mcq', q: 'Why is changing a published API harder than changing a function inside your own program?',
      options: ['Callers are other programs you cannot see or update, so a change can break them silently', 'APIs are written in a stricter language', 'Servers cannot be restarted once an API is live', 'The compiler refuses to build changed APIs'],
      answer: 0,
      why: [null, 'The language is not the issue. The invisible callers are.', 'Servers restart all the time. That does not fix broken callers.', 'No compiler sees the other side of a network call.'],
      explain: 'Inside one program, the compiler finds every broken use. An API\'s callers live elsewhere, so the contract itself is the only protection.' },

    { type: 'spot', prompt: 'Most of these endpoints follow good REST naming. Tap the one that does not.',
      code: { lang: 'http', src: `
        GET /products
        GET /products/55
        GET /products/55/reviews
        POST /product/addNew
        DELETE /products/55` },
      lines: [4],
      explain: 'Line 4 has a verb, a singular noun and a different style. The consistent version is `POST /products`.' },

    { type: 'tf', statement: 'A REST server should remember each client\'s session in memory between requests, so clients need not send credentials each time.', answer: false,
      explain: 'REST is stateless: every request carries what the server needs (such as a token). That is what lets any server in a group answer any request.' },

    { type: 'short', q: 'Which status code should a successful POST that creates a resource normally return?', accept: ['201'], hint: 'Two-oh-something.',
      explain: '`201 Created`, with a `Location` header giving the new resource\'s address.' },

    { type: 'bucket', prompt: 'Breaking change for existing callers, or safe?', buckets: ['Breaking', 'Safe'],
      items: [['Rename a response field', 0], ['Add a new optional response field', 1], ['Add a new endpoint', 1], ['Change an amount from pounds to pence', 0], ['Remove a field nobody should use', 0], ['Make a new input optional that used to be required', 1]],
      explain: 'Adding is safe. Removing, renaming, or changing the meaning of what callers already rely on breaks them. Loosening a requirement is safe too: old callers still send valid requests.' },

    { type: 'mcq', q: 'A busy feed gets new posts every second. Which pagination is the best choice?',
      options: ['Cursor-based: "continue after this post"', 'Offset-based with page numbers', 'No pagination', 'A random page each time'],
      answer: 0,
      why: [null, 'New posts shift the page boundaries, causing repeats and skips, and deep offsets get slow.', 'The response grows without limit.', 'Users need items in order.'],
      explain: 'A cursor anchors to a specific item, so it stays correct and fast however fast the list changes.' },

    { type: 'ab', q: 'Which error response is better for an API?',
      a: { lang: 'http', label: 'Success status', src: `
        HTTP/1.1 200 OK

        {"error": "Email not valid"}` },
      b: { lang: 'http', label: 'Honest status', src: `
        HTTP/1.1 422 Unprocessable Content

        {"code": "validation_failed",
         "errors": [{"field": "email"}]}` },
      answer: 'b',
      explain: 'Caches, monitors and retry logic read the status line. A failure sent as 200 looks like success to all of them, and a machine-readable code lets callers react properly.' },

    { type: 'order', prompt: 'Put the lost-reply payment story in order, with an idempotency key.',
      items: ['The app sends POST /payments with a unique key', 'The server charges the card and stores the key and result', 'The reply is lost and the app times out', 'The app retries with the same key', 'The server finds the key and replays the stored result'],
      explain: 'The key is stored with the first result. On the retry the server recognises it and answers from the record, so nobody is charged twice.' },

    { type: 'cloze', text: 'ISO 8601 is the safe way to write {{dates}} in JSON, big database {{IDs}} are safer sent as strings, and money is best sent as whole minor {{units}} plus a currency.',
      distractors: ['colours', 'floats', 'comments'],
      explain: 'Each of these is a classic JSON trap: dates are ambiguous, large numbers lose precision in JavaScript, and floating-point money accumulates rounding errors.' },

    { type: 'match', prompt: 'Match each term to its meaning.',
      pairs: [['OpenAPI', 'A machine-readable description of an HTTP API'], ['HATEOAS', 'Responses carry links to what you can do next'], ['429 + Retry-After', 'Rate limited; wait this long before retrying'], ['Webhook', 'The service calls your URL when an event happens'], ['BFF', 'A backend tailored to one kind of client']] },

    { type: 'multi', q: 'Which of these are good practice for calling someone else\'s API?',
      options: ['Set a timeout on every call', 'Retry with exponential backoff and jitter', 'Honour `Retry-After` on a 429', 'Retry `400 Bad Request` until it works', 'Retry as fast as possible after any failure'],
      answers: [0, 1, 2],
      explain: 'Timeouts, backoff with jitter and respecting Retry-After keep both sides healthy. A 400 will give the same answer however often you ask, and instant retries cause retry storms.' },

    { type: 'bucket', prompt: 'Which integration pattern fits best?', buckets: ['Request/reply', 'Webhook', 'File transfer', 'Messaging'],
      items: [['Fetching a user\'s profile for a page', 0], ['Hearing that a payment settled hours later', 1], ['A nightly bulk export for the accountants', 2], ['Broadcasting "order placed" to several systems that may be offline', 3], ['Checking whether a username is free as you type', 0]],
      explain: 'Ask what waits for what. Immediate answers call; "tell me when" is a webhook; bulk and tolerant-of-delay is a file; many consumers and must-not-lose is a message.' }
  ]
});

KS.sheet('api-design', {
  title: 'API design & REST: cheat sheet',
  sections: [
    { title: 'REST at a glance',
      md: `**Resources** are things with addresses. **Representations** (usually JSON) travel; the thing stays on the server.

        | Request | Meaning |
        |---|---|
        | \`GET /books\` | List |
        | \`POST /books\` | Create (\`201\` + \`Location\`) |
        | \`GET /books/42\` | Read one |
        | \`PUT /books/42\` | Replace |
        | \`PATCH /books/42\` | Change part |
        | \`DELETE /books/42\` | Remove |

        **Constraints:** client–server, stateless, cacheable, uniform interface, layered, code on demand (optional).` },

    { title: 'Design habits',
      md: `- **Plural nouns**, no verbs, one naming style.
        - Nest at most about two levels: \`/customers/7/orders\`.
        - **Filter / sort / page** with query params: \`?status=paid&sort=-created&limit=20\`.
        - **Offset** (\`limit\`+\`offset\`): simple, can jump, drifts and slows. **Cursor**: stable and fast, forward only.
        - **One error shape**: status, machine code, message, field errors, request ID.
        - **Version** in the URL (\`/v2/\`) or a header. Adding is safe; removing and renaming break callers.` },

    { title: 'Richardson maturity model',
      md: `| Level | What it adds |
        |---|---|
        | 0 | One endpoint, one verb (HTTP as a tunnel) |
        | 1 | Separate resources with their own addresses |
        | 2 | Proper methods and status codes |
        | 3 | Hypermedia links (HATEOAS) |

        Most good APIs live at **level 2**. HATEOAS: responses carry links to related things and the actions that are possible *now*.` },

    { title: 'Data formats and JSON traps',
      md: `| Format | Notes |
        |---|---|
        | JSON | Text, light, the web default |
        | XML | Tags, wordy, older enterprise |
        | Protocol Buffers | Compact binary, schema required |

        **Serialise** = object to text. **Deserialise** = text to object.

        - Dates: **ISO 8601, UTC**: \`2025-03-14T09:30:00Z\`.
        - Big IDs (above 9,007,199,254,740,991): send as **strings**.
        - Money: **whole minor units** plus currency, never floats.
        - JSON:API is one spec for response layout.` },

    { title: 'OpenAPI',
      md: `A YAML/JSON file describing paths, inputs, responses and errors. From it: **docs** (Swagger UI), **client code**, **mock servers**, **contract tests**.

        | | Design-first | Code-first |
        |---|---|---|
        | Order | Spec, then code | Code, then spec |
        | Strength | Early review; parallel work | Always accurate, fast |
        | Suits | Public and multi-team APIs | Small internal APIs |

        Keep the spec in the repository and test against it.` },

    { title: 'Reliability',
      md: `- **Timeout on every call.**
        - **Idempotency key** (header) makes a POST safe to repeat: same key, replay stored result.
        - **Retry** timeouts, \`503\`, \`429\`; never \`400\`/\`404\`/\`422\`. Use **exponential backoff + jitter** and a cap.
        - **Rate limit** with \`429\` and \`Retry-After\`.
        - **Cap** page size and body size (\`413\`).
        - **Deprecate**: add, announce with a date, watch usage, then remove.
        - **Retry storms** turn blips into outages.` },

    { title: 'Integration patterns',
      md: `| Pattern | Use when | Catch |
        |---|---|---|
        | Request/reply | Need an answer now | Caller waits |
        | Polling | Simple, slow jobs | Wasted calls |
        | Webhook | "Tell me when" | Verify sender; handle repeats |
        | File transfer | Bulk, batch | Stale, fragile formats |
        | Messaging | Decouple, must not lose | Extra moving part |
        | Shared database | Avoid | No contract, hidden coupling |

        **Gateway** = one front door. **BFF** = a backend per client type.` }
  ]
});

