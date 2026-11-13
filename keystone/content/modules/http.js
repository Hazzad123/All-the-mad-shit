/* Module: http — HTTP & HTTPS.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs http */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('http-basics', {
  eli5: 'Every time a browser loads something from a server, they swap short text messages: the browser sends a request saying what it wants, and the server sends back a response with the answer.',

  cards: [
    { kind: 'concept', title: 'A page load is a conversation in text',
      body: `You type an address and press Enter. A moment later a page appears. In between, your browser and a server had a short chat, and the chat was **plain text**.

        The browser said, roughly: *"Please send me the page at this address."*

        The server said, roughly: *"Here it is."* Or: *"No such page."* Or: *"Go and look over there instead."*

        The rulebook for that chat is called **HTTP** (HyperText Transfer Protocol). A rulebook for how two computers talk is a [[protocol]]. HTTP is the one the web runs on, and nearly everything you build on the backend will speak it.` },

    { kind: 'metaphor', title: 'The ticket hatch',
      body: `Picture an old-fashioned ticket office with a hatch in the glass. You slide a **slip of paper** through: "One adult return to Leeds, please." The clerk reads it, does the work, and slides back **a reply**: the tickets, or "that train does not run on Sundays".

        - You always speak first. The clerk never shouts at passers-by.
        - Each slip follows a standard layout, so the clerk can read it fast.
        - Every reply says up front whether it worked.

        HTTP is that hatch. The browser (the **client**) slides a **request** through; the **server** slides a **response** back. Where the metaphor stops: the clerk would remember you were here five minutes ago. A web server, as you will see, does not.` },

    { kind: 'sequence', title: 'One page, several requests',
      body: 'A single page is rarely a single request. Step through a simple page load.',
      actors: ['Browser', 'Server'],
      steps: [
        { from: 0, to: 1, label: 'GET /index.html', note: 'You asked for the page, so the browser asks for the **HTML**: the text that describes the page.' },
        { from: 1, to: 0, label: '200 OK + the HTML', dashed: true, note: 'The server answers with the HTML file. `200 OK` means "worked".' },
        { at: 0, label: 'reads the HTML', note: 'The browser reads it and spots that the page needs a stylesheet and a logo image.' },
        { from: 0, to: 1, label: 'GET /style.css', note: 'A **new, separate request** for the stylesheet.' },
        { from: 1, to: 0, label: '200 OK + the CSS', dashed: true, note: 'Another complete response.' },
        { from: 0, to: 1, label: 'GET /logo.png', note: 'And one more request for the image.' },
        { from: 1, to: 0, label: '200 OK + the image', dashed: true, note: 'A real page has dozens of these. Each one is its own request and its own response. Browsers fire several at once to save time.' }
      ] },

    { kind: 'code', title: 'Anatomy of a URL',
      body: 'Every request needs an address. A [[URL]] such as `https://shop.example.com/products/42?colour=red#reviews` is built from parts. **Tap each line.**',
      code: { lang: 'text', src: `
        scheme    https
        host      shop.example.com
        port      443  (usually hidden)
        path      /products/42
        query     ?colour=red&size=m
        fragment  #reviews`,
        notes: {
          1: 'The **scheme** says which protocol to use. `https` is HTTP wrapped in encryption (the lesson on HTTPS covers it).',
          2: 'The **host** is *which computer*. The browser turns this name into an address using DNS.',
          3: 'The **port** is a numbered door on that computer. HTTP defaults to 80 and HTTPS to 443, so browsers hide them. A different one would show, like `:3000`.',
          4: 'The **path** is *which thing* on that server: here, product number 42.',
          5: 'The **query string** carries extra options as `name=value` pairs, joined with `&`. Here: "red, size m".',
          6: 'The **fragment** points at a spot inside the page. The browser keeps it to itself and **never sends it** to the server.'
        } } },

    { kind: 'code', title: 'Inside a request',
      body: 'Here is the real text a browser sends. A request has three parts: a **request line**, some **headers**, and an optional **body**. **Tap the lines.**',
      code: { lang: 'http', src: `
        GET /products/42?colour=red HTTP/1.1
        Host: shop.example.com
        User-Agent: Mozilla/5.0
        Accept: text/html
        Accept-Language: en-GB
        `,
        notes: {
          1: 'The **request line**: the method (what to do), the path with its query (which thing), and the HTTP version. The next lesson is all about methods.',
          2: '`Host` says which website you want. One server can host many sites, so it needs telling.',
          3: '`User-Agent` says what software is asking: a browser, a phone app, a crawler.',
          4: '`Accept` says which formats the client can handle. Here: HTML.',
          5: 'Headers are `Name: value` lines that describe the request. The language preference is another. A **blank line** would follow to end the headers; a `GET` has no body after it, while a `POST` would put its **body** there.'
        } } },

    { kind: 'code', title: 'Inside a response',
      body: 'The server replies in the same shape: a **status line**, headers, a blank line, then the body.',
      code: { lang: 'http', src: `
        HTTP/1.1 200 OK
        Content-Type: text/html; charset=utf-8
        Content-Length: 5120

        <!doctype html>
        <html>
          <head><title>Red hoodie</title></head>
          …`,
        notes: {
          1: 'The **status line**: the version, a three-digit **status code** (`200`) and a short label. The code is how the server says whether it worked. Status codes get their own lesson soon.',
          2: '`Content-Type` tells the client what the body *is*, so the browser knows to render it as a web page rather than show it as text.',
          3: '`Content-Length` is the size of the body in bytes, so the client knows when it has all of it.',
          4: 'The blank line again: headers end, body begins.',
          5: 'The **body** is the actual thing you asked for. Here it is HTML; it could equally be an image or JSON data.'
        } } },

    { kind: 'concept', title: 'HTTP forgets you instantly',
      body: `Look back at the sequence. When the browser asked for \`/style.css\`, did it say anything like "I'm the one who just asked for the page"? No. Each request is **complete on its own**, and the server treats every one as if it had never met you.

        That property is called **stateless**: the server keeps no memory of earlier requests *as part of the protocol*.

        Think of a shop assistant with no memory at all. Every time you walk up, you are a stranger. If you want them to treat you as a regular, you must **show something each time**: a loyalty card, a ticket.

        Real sites do exactly that. How they do it comes in the headers and cookies lesson.`,
      note: 'Stateless makes servers simple and easy to copy: any server can answer any request. It also means "being logged in" has to be rebuilt on every single request.' },

    { kind: 'pitfall', title: 'A path is not a folder',
      body: `A URL like \`/products/42\` looks like a file path, so it is easy to assume there is a folder called \`products\` with a file called \`42\` on the server's disk.

        Sometimes that is true (a plain file server does work that way). Often it is not. On most backends the path is simply **a name the code matches** and then decides what to do with.

        \`/products/42\` might run a function that looks up row 42 in a database and builds a page on the spot. Nothing called \`42\` exists anywhere.

        So think of the path as **a question you ask**, not a place on a disk.` },

    { kind: 'steps', title: 'See it yourself in your browser',
      body: 'You never have to take this on trust. Every browser lets you watch the conversation.',
      steps: [
        { title: 'Open the developer tools', body: 'Press `F12` (or right-click a page and choose **Inspect**). A panel opens beside or below the page.' },
        { title: 'Choose the Network tab', body: 'This tab lists every request the page makes. If it is empty, reload the page while it is open.' },
        { title: 'Click one row', body: 'You will see the request line, the request headers, the status code and the response headers, exactly as in the last two cards.' },
        { title: 'Try the Preview or Response view', body: 'This shows the body: the HTML, the image or the JSON the server sent back.' },
        { title: 'Count the rows', body: 'Even a simple site fires many requests. Sorting by size or time shows what makes a page slow.' }
      ] },

    { kind: 'code', title: 'Or use curl from the terminal',
      body: '`curl` is a command-line tool that makes HTTP requests with no browser. Backend developers use it daily. **Tap a line.**',
      code: { lang: 'sh', src: `
        curl https://example.com
        curl -i https://example.com
        curl -v https://example.com
        curl -I https://example.com`,
        notes: {
          1: 'The plainest form: send a request and print the **body** of the response.',
          2: '`-i` also prints the **status line and response headers** above the body.',
          3: '`-v` (verbose) shows everything: the request your machine sent, plus the response. Great for seeing the exact text.',
          4: 'A capital `-I` sends a `HEAD` request: headers only, no body. A method you will meet in the next lesson.'
        } } }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'A page has one HTML file, one stylesheet and three images. Roughly how many requests does the browser make to load it?',
      options: ['At least five: one for each file', 'One, because the page is one thing', 'Two: one for the text and one for everything else', 'Exactly three: the server picks the main files'],
      answer: 0,
      why: [null, 'The browser only learns what else it needs after reading the HTML, then asks for each file separately.', 'HTTP has no "everything else" bundle. Each file is its own request.', null],
      explain: 'Every file is requested on its own: the HTML first, then the stylesheet and each image once the browser has read the HTML. Real pages commonly make dozens.' },

    { type: 'match', after: 3, prompt: 'Match each part of `https://shop.example.com/cart?item=7#top` to what it does.',
      pairs: [['https', 'Scheme: which protocol to speak'], ['shop.example.com', 'Host: which computer to ask'], ['/cart', 'Path: which thing on that computer'], ['?item=7', 'Query: extra options as name=value'], ['#top', 'Fragment: a spot in the page, kept in the browser']] },

    { type: 'tf', after: 6, statement: 'HTTP itself remembers who you are between requests, so a server can recognise you without being sent anything.', answer: false,
      explain: 'HTTP is **stateless**. Each request stands alone. Sites recognise you only because your browser sends something extra every time, which you will meet in the headers and cookies lesson.' },

    { type: 'order', prompt: 'Put one simple page load in order.',
      items: ['The browser sends a request for the HTML', 'The server replies with a status line, headers and the HTML', 'The browser reads the HTML and finds a stylesheet it needs', 'The browser sends a new request for the stylesheet'],
      explain: 'The browser cannot know it needs the stylesheet until it has read the HTML, so the first response must arrive before the second request can be made.' },

    { type: 'bucket', prompt: 'Which side sends it: the client (browser) or the server?', buckets: ['Client sends', 'Server sends'],
      items: [['The method, such as GET', 0], ['The path `/cart`', 0], ['The `Host` header', 0], ['The status code `404`', 1], ['The HTML of the page', 1], ['A `Content-Type` header describing the reply', 1]],
      explain: 'Requests carry what you want (method, path, who you are asking). Responses carry the outcome (status code) and the thing itself, plus headers describing it.' },

    { type: 'spot', prompt: 'Tap the line that contains the request line, the one naming the method and the path.',
      code: { lang: 'http', src: `
        Host: api.example.com
        Accept: application/json
        GET /users/5 HTTP/1.1
        User-Agent: curl/8.0` },
      lines: [3],
      explain: 'The request line has the method (`GET`), the path (`/users/5`) and the version. In a real request it is always the **first** line; here it has been shuffled to test whether you can spot it by its shape.' },

    { type: 'cloze', text: 'A request begins with a request line, followed by {{headers}}, then a blank line, then an optional {{body}}. A response begins with a status line, which holds a three-digit {{status code}}.',
      distractors: ['fragment', 'query string', 'port'],
      explain: 'Both messages have the same shape: first line, headers, blank line, body. The first line is the only part that differs: request line versus status line.' },

    { type: 'short', q: 'Which command-line tool lets you send an HTTP request from the terminal without a browser?', accept: ['curl'], hint: 'Four letters. Its name sounds like "see URL".',
      explain: '`curl` makes requests and prints responses. `curl -i` shows the headers too, and `curl -v` shows the whole conversation.' },

    { type: 'explain', prompt: 'A friend says: "When I open a web page, my browser downloads one file." Explain in your own words what really happens, and what "stateless" adds to the picture.',
      model: 'The browser sends a request for the HTML, and the server sends a response. The HTML refers to more files (styles, images, scripts), so the browser sends further requests, each with its own response. HTTP is stateless: every one of those requests stands alone and the server does not remember the earlier ones, unless the browser sends something extra to say who it is.',
      keywords: ['request', 'response', 'HTML', 'many', 'separate', 'stateless', 'remember'] }
  ],

  flashcards: [
    { q: 'What are the parts of an HTTP request?', a: 'A request line (method, path, version), headers, a blank line, and an optional body.' },
    { q: 'What are the parts of an HTTP response?', a: 'A status line (version, status code, label), headers, a blank line, and the body.' },
    { q: 'Name the parts of a URL.', a: 'Scheme, host, optional port, path, optional query string and optional fragment.' },
    { q: 'What does "HTTP is stateless" mean?', a: 'Each request stands alone. The server keeps no memory of earlier requests unless the client sends something to identify itself again.' },
    { q: 'Where do you watch HTTP in a browser, and from a terminal?', a: 'The Network tab of the developer tools (F12), and `curl -v` in a terminal.' }
  ],

  glossary: [
    { term: 'HTTP', def: 'HyperText Transfer Protocol: the set of rules for requests and responses between web clients and servers, written as plain text messages.', like: 'The standard layout for the slip you pass through the ticket hatch.' },
    { term: 'Request line', def: 'The first line of a request: the method, the path (with any query), and the HTTP version.', like: 'The top line of an order slip: what you want and where.' },
    { term: 'Header', def: 'A `Name: value` line that describes a request or a response, such as the format of the body or the language wanted.', like: 'The labels on the outside of a parcel.' },
    { term: 'Query string', def: 'The part of a URL after `?`, holding extra options as `name=value` pairs joined by `&`.', like: 'The notes you add to a coffee order: "oat milk, extra hot".' },
    { term: 'Stateless', def: 'Describes a protocol where every request is self-contained and the server remembers nothing between requests.', like: 'A shop assistant who forgets you the moment you walk away.' },
    { term: 'curl', def: 'A command-line program that sends HTTP requests and prints the responses, much used by developers for testing.', like: 'A browser with no window: just the conversation.' }
  ],

  takeaways: [
    'HTTP is **text messages**: the client sends a request, the server sends a response.',
    'Both have the same shape: first line, **headers**, blank line, optional **body**.',
    'A URL is scheme + host + port + path + query + fragment; the fragment never leaves the browser.',
    'HTTP is **stateless**: each request stands alone. Watch it with the Network tab or `curl -v`.'
  ],

  links: [
    { label: 'MDN: An overview of HTTP', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview' },
    { label: 'MDN: What is a URL?', url: 'https://developer.mozilla.org/en-US/docs/Learn/Common_questions/Web_mechanics/What_is_a_URL' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('http-methods', {
  eli5: 'HTTP methods are the verbs of the web: every request starts with one word — GET, POST, PUT, PATCH or DELETE — that tells the server what you want done.',

  cards: [
    { kind: 'concept', title: 'Every request starts with a verb',
      body: `When your browser talks to a server, the very first word it says is a **method**: a verb that announces what kind of request this is.

        The URL says **which thing** you mean. The method says **what you want done to it**.

        - \`GET /orders/42\` means "show me order 42"
        - \`DELETE /orders/42\` means "get rid of order 42"

        Same address, completely different outcome. There are only a handful of methods, and five of them do nearly all the work.` },

    { kind: 'metaphor', title: 'The library front desk',
      body: `Picture the front desk of a library. You can:

        - **ask to see** a book (GET). Nothing changes, so ask as often as you like.
        - **hand in a brand-new book** (POST). The librarian picks a shelf and tells you its number.
        - **swap a book for a new edition** at a shelf number you already know (PUT).
        - **fix one typo** on page 12 (PATCH).
        - **ask for a book to be removed** (DELETE).

        The librarian (the server) can refuse any of these. But the *kind* of request is clear from your first word, before you have explained anything else.` },

    { kind: 'compare', title: 'The big five at a glance',
      body: 'These five line up with the four things you can do to stored data: **C**reate, **R**ead, **U**pdate, **D**elete. Developers call that **CRUD**.',
      cols: ['Means', 'CRUD', 'Sends a body?'],
      rows: [
        ['`GET`', 'Fetch a thing', 'Read', 'No'],
        ['`POST`', 'Create a new thing, or trigger an action', 'Create', 'Yes'],
        ['`PUT`', 'Replace a thing entirely', 'Update', 'Yes'],
        ['`PATCH`', 'Change part of a thing', 'Update', 'Yes'],
        ['`DELETE`', 'Remove a thing', 'Delete', 'Rarely']
      ] },

    { kind: 'example', title: 'What it looks like on the wire',
      body: 'HTTP is plain text you could type by hand. Here a client creates a to-do item, and the server replies. **Tap the highlighted lines.**',
      code: { lang: 'http', src: `
        POST /todos HTTP/1.1
        Host: api.example.com
        Content-Type: application/json

        {"title": "Buy milk"}

        HTTP/1.1 201 Created
        Location: /todos/7`,
        notes: {
          1: 'The **method** comes first, then the path. POST to the *collection* (`/todos`), because the new item has no address yet.',
          3: 'Requests with a body say what format the body is in.',
          5: 'The **body**: the data for the new to-do. GET requests do not have one.',
          7: '`201 Created` is the server saying "done, I made it". Status codes are the next lesson.',
          8: 'The server chose the ID (7) and tells you where the new thing lives.'
        } } },

    { kind: 'concept', title: 'Safe methods: look, don’t touch',
      body: `A method is **safe** if it only *reads*. Calling it should never change anything on the server. \`GET\`, \`HEAD\` and \`OPTIONS\` are safe.

        Why should you care? Because lots of software assumes it:

        - search-engine crawlers follow every link they find
        - browsers pre-load pages they think you might click
        - caches happily replay stored GET responses

        If your site had a link to \`GET /account/delete\`, a crawler would cheerfully delete accounts for you. **Reading must never have side effects.**` },

    { kind: 'concept', title: 'Idempotent: pressing the button twice is fine',
      body: `**Idempotent** (eye-dem-PO-tent) means: doing it once or doing it ten times leaves things in the same state.

        Think of a lift call button. Press it once, the lift comes. Mash it nine more times: still one lift.

        - \`GET\`, \`PUT\`, \`DELETE\` are idempotent. Deleting order 42 twice still leaves it deleted.
        - \`POST\` is **not**. Send "create an order" twice and you get two orders.
        - \`PATCH\` depends. "Set name to Sam" is repeatable; "add 1 to the counter" is not.

        This matters because networks drop things, and software **retries**.` },

    { kind: 'sequence', title: 'The retry that charges you twice',
      body: 'Watch what happens when a non-idempotent request gets retried. Step through it.',
      actors: ['Phone app', 'Server', 'Bank'],
      steps: [
        { from: 0, to: 1, label: 'POST /payments £30', note: 'You tap **Pay**. The app sends a POST to create a payment.' },
        { from: 1, to: 2, label: 'charge £30', note: 'The server does its job and charges your card.' },
        { from: 1, to: 0, label: '201 Created', dashed: true, note: 'The server replies… but you are on a train going into a tunnel. **The reply never arrives.**' },
        { at: 0, label: 'timeout… retry?', note: 'From the app’s side, this looks identical to "the request never got there". It cannot tell the difference.' },
        { from: 0, to: 1, label: 'POST /payments £30', note: 'So it tries again. To the server this is simply a second, brand-new payment.' },
        { from: 1, to: 2, label: 'charge £30 (again)', note: 'You have now paid £60 for one coffee order. With a `PUT` or `DELETE`, a retry would have been harmless.' }
      ] },

    { kind: 'tip', title: 'The fix: idempotency keys',
      body: `You cannot make the network reliable, so you make the *request* repeatable.

        The app invents a random ID for this one payment attempt and sends it in a header, such as \`Idempotency-Key: 7f3c…\`. If the server sees the same key twice, it does **not** charge again; it just replays its first answer.

        Stripe, PayPal and most payment APIs work exactly this way. You will meet the idea again in the APIs and Resilience worlds.`,
      note: 'Rule of thumb: retry GET, PUT and DELETE freely. Retry POST only with an idempotency key.' },

    { kind: 'realworld', title: 'PUT vs PATCH, and the two quiet methods',
      body: `**PUT replaces the whole thing.** Send a user with only a name, and their email is wiped. **PATCH sends just the change**: \`{"email": "new@x.com"}\`. Most modern APIs (GitHub, Stripe) use PATCH for edits.

        Two more methods work quietly in the background:

        - \`HEAD\` is a GET that returns **headers only**, no body. Handy for "does this file exist, and how big is it?"
        - \`OPTIONS\` asks "what am I allowed to do here?" Browsers send it automatically before some cross-site requests. You will see it again under CORS.` }
  ],

  activities: [
    { type: 'match', after: 2, prompt: 'Match each method to what it asks the server to do.',
      pairs: [['GET', 'Show me this thing'], ['POST', 'Make a new thing'], ['PUT', 'Replace this thing completely'], ['PATCH', 'Change part of this thing'], ['DELETE', 'Remove this thing']] },

    { type: 'tf', after: 4, statement: 'A well-behaved GET request should never change data on the server.', answer: true,
      explain: 'GET is a **safe** method. Crawlers, caches and browser pre-loading all assume GETs are read-only, so a GET with side effects will eventually be triggered by something that never meant to.' },

    { type: 'mcq', after: 5, q: 'A phone app sends `DELETE /photos/9`. The connection drops before the reply arrives, so the app sends the same request again. Where does that leave things?',
      options: ['Photo 9 is deleted, exactly as if the request had been sent once', 'Two different photos have been deleted', 'The second request undoes the first and the photo comes back', 'The server cannot cope and must be restarted'],
      answer: 0,
      explain: 'DELETE is **idempotent**. The first request removes photo 9; the second finds nothing left to remove (and typically answers 404 or 204). Either way the end state is the same, which is why retrying is harmless.' },

    { type: 'bucket', prompt: 'Is it safe to repeat? Sort each action.', buckets: ['Idempotent', 'Not idempotent'],
      items: [['`GET /users/5`', 0], ['`PUT /users/5` with the full user', 0], ['`DELETE /users/5`', 0], ['`POST /orders`', 1], ['`POST /emails/send`', 1], ['Pressing a lift call button', 0], ['Adding £10 to a balance', 1], ['Setting a balance to exactly £50', 0]],
      explain: 'Ask: "if this ran twice by accident, would the end result differ?" Setting something to a value is repeatable. Adding, creating or sending is not.' },

    { type: 'cloze', text: 'To create a new comment, send a {{POST}} to `/comments`. To read it later, send a {{GET}} to `/comments/12`. To remove it for good, send a {{DELETE}}.',
      distractors: ['HEAD', 'OPTIONS', 'PATCH'],
      explain: 'POST goes to the collection because the new comment has no address yet. GET and DELETE go to the address of that one comment.' },

    { type: 'spot', prompt: 'One of these requests uses a method in a way that will cause trouble. Which line?',
      code: { lang: 'http', src: `
        GET /articles/12
        POST /articles
        GET /articles/12/delete
        PATCH /articles/12
        DELETE /articles/13` },
      lines: [3],
      explain: 'Line 3 changes data with a GET. GET must be **safe**: a crawler, a browser pre-load or a cache could trigger that delete without anyone clicking anything. It should be `DELETE /articles/12`.' },

    { type: 'short', q: 'Which method fetches only the headers for a resource, with no body?', accept: ['HEAD'], hint: 'It is named after the top part of a message.',
      explain: '`HEAD` behaves like GET but the server leaves out the body. It is a cheap way to check that something exists, or whether it has changed.' },

    { type: 'scenario', title: 'The double-charge bug', intro: 'You have just joined a food-delivery startup. Support is on fire: a few customers each day are being **charged twice** for a single order.',
      meters: { 'customer trust': 60, 'engineering time': 80 },
      steps: [
        { text: 'It is 9am and your team lead asks where you want to start.',
          choices: [
            { label: 'Check the server logs for the affected orders', score: 2, effects: { 'engineering time': -5 }, feedback: 'Good instinct: look before you guess. The logs show two identical `POST /payments` requests a few seconds apart for every affected customer.' },
            { label: 'Email the bank and ask why they are duplicating charges', score: 0, effects: { 'customer trust': -15, 'engineering time': -20 }, feedback: 'Two days later the bank replies: they charged twice because *you asked twice*. Customers kept being double-charged while you waited.' },
            { label: 'Add a banner: "Please only tap Pay once!"', score: 1, effects: { 'customer trust': -5 }, feedback: 'It helps a little, but it makes customers responsible for a bug. And it does nothing about the app’s own automatic retries.' }
          ] },
        { text: 'So the app is sending the same POST twice: sometimes an impatient double-tap, sometimes an automatic retry after a timeout. How do you fix it properly?',
          choices: [
            { label: 'Have the app send an idempotency key, and make the server ignore repeats', score: 2, effects: { 'customer trust': 25, 'engineering time': -15 }, feedback: 'Exactly. The same key means the same payment attempt, so the server replays its first answer instead of charging again. This fixes double-taps **and** retries.' },
            { label: 'Grey out the Pay button after the first tap', score: 1, effects: { 'customer trust': 10, 'engineering time': -5 }, feedback: 'Worth doing, but it only stops double-taps. Automatic retries after a timeout will still double-charge.' },
            { label: 'Change the endpoint to GET, because GET is safe', score: 0, effects: { 'customer trust': -20, 'engineering time': -10 }, feedback: 'Renaming it does not make it safe. Now a browser pre-load or a cached link can take payments too. A method is a promise about behaviour, not a label.' }
          ] },
        { text: 'Last decision. The mobile team asks what the app’s retry policy should be from now on.',
          choices: [
            { label: 'Retry GET, PUT and DELETE freely; retry POST only with the same idempotency key', score: 2, effects: { 'customer trust': 10 }, feedback: 'That is the standard rule. Idempotent requests are safe to repeat; anything else needs a key so the server can recognise the repeat.' },
            { label: 'Retry every failed request up to five times', score: 0, effects: { 'customer trust': -15 }, feedback: 'For POST without a key, that is up to five charges per coffee.' },
            { label: 'Never retry anything; show an error instead', score: 1, effects: { 'customer trust': -5 }, feedback: 'Safe, but miserable on a patchy connection. Retrying idempotent requests costs nothing and hides most network blips.' }
          ] }
      ],
      outro: 'The pattern to remember: **find out what was actually sent, then make the dangerous request repeatable.**' },

    { type: 'explain', prompt: 'After paying online, you refresh the page and the browser warns: "Confirm form resubmission?" Explain to a non-technical friend why it is asking.',
      model: 'The page you are on was the result of *sending* something (a POST), like submitting a payment. Refreshing means "do the last request again". Repeating a request that only reads is harmless, but repeating one that creates or pays could do it twice, so the browser checks with you first.',
      keywords: ['POST', 'again', 'twice', 'not idempotent', 'GET is safe'] }
  ],

  flashcards: [
    { q: 'Which HTTP methods are "safe", and what does that mean?', a: 'GET, HEAD and OPTIONS. Safe means read-only: the request must not change anything on the server.' },
    { q: 'What does "idempotent" mean?', a: 'Doing it once or many times leaves the server in the same state. GET, PUT and DELETE are idempotent; POST is not.' },
    { q: 'PUT vs PATCH?', a: 'PUT replaces the whole resource with what you send. PATCH changes only the fields you send.' },
    { q: 'Why is retrying a POST dangerous, and what fixes it?', a: 'A retry can create or charge twice. An idempotency key lets the server recognise the repeat and reply without doing the work again.' },
    { q: 'What does CRUD stand for, and which methods map to it?', a: 'Create (POST), Read (GET), Update (PUT/PATCH), Delete (DELETE).' }
  ],

  glossary: [
    { term: 'HTTP method', def: 'The verb at the start of an HTTP request (GET, POST, PUT, PATCH, DELETE…) that says what the client wants done.', like: 'The first word you say at a service desk: "show", "add", "replace", "remove".', aka: ['HTTP verb'] },
    { term: 'Safe method', def: 'A method that only reads and must not change server state: GET, HEAD, OPTIONS.', like: 'Looking through a shop window.' },
    { term: 'Idempotent', def: 'An operation that has the same effect whether it runs once or many times.', like: 'A lift call button: pressing it ten times still calls one lift.' },
    { term: 'CRUD', def: 'Create, Read, Update, Delete: the four basic things you can do to stored data.' },
    { term: 'Request body', def: 'The data sent along with a request, after the headers; for example the JSON for a new item in a POST.', like: 'The contents of the parcel, as opposed to the label on it.' },
    { term: 'Idempotency key', def: 'A unique ID the client attaches to a request so the server can detect a repeat and avoid doing the work twice.', like: 'A raffle ticket number: show the same ticket twice and you still only get one prize.' }
  ],

  takeaways: [
    'The URL names the thing; the **method** says what to do with it.',
    'GET reads, POST creates, PUT replaces, PATCH tweaks, DELETE removes.',
    '**Safe** = read-only (GET, HEAD, OPTIONS). Never change data in a GET.',
    '**Idempotent** = repeatable without harm (GET, PUT, DELETE). POST is not, so guard it with an idempotency key.'
  ],

  links: [
    { label: 'MDN: HTTP request methods', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods' },
    { label: 'roadmap.sh: What is HTTP?', url: 'https://roadmap.sh/backend' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('http-status', {
  eli5: 'A status code is a three-digit number at the top of every response that tells you how the request went: the first digit says whether it worked, was redirected, was your fault or was the server’s fault.',

  cards: [
    { kind: 'concept', title: 'The first thing a server says is a number',
      body: `You have seen \`404 Not Found\` a hundred times. It is one of the **status codes** that the server puts on the very first line of every response.

        Why numbers? Because software has to react. A browser must decide, in microseconds: show the page? Follow a redirect? Show an error? Retry? A three-digit code is quick to check and the same in every language.

        There are dozens of codes, but you never need to memorise them all. The trick is that **the first digit tells you the story**, and a small handful of codes cover nearly everything you will meet.` },

    { kind: 'layers', title: 'Five classes, one digit each',
      body: 'Read the first digit and you already know roughly what happened.',
      layers: [
        { label: '1xx · Hold on', note: 'Informational. "Got it, carry on." Rare; you will almost never handle one.', tone: 'muted', icon: '✋' },
        { label: '2xx · Success', note: 'The request worked.', tone: 'good', icon: '✅' },
        { label: '3xx · Look elsewhere', note: 'Redirection. What you want is somewhere else, or you already have it.', tone: 'info', icon: '↪️' },
        { label: '4xx · Your mistake', note: 'Client error. The request was wrong, unauthorised or impossible. Sending it again unchanged will not help.', tone: 'warn', icon: '🙋' },
        { label: '5xx · Our mistake', note: 'Server error. The request was fine, but the server failed to deal with it.', tone: 'bad', icon: '🔥' }
      ] },

    { kind: 'metaphor', title: 'The restaurant, once more',
      body: `Back in the restaurant:

        - **4xx**: "Sorry, we do not serve breakfast after 11" or "You need a reservation." The kitchen is working fine. *You* asked for something it cannot give, and asking again in the same way gets the same answer.
        - **5xx**: "Sorry, the cooker has broken." You ordered something perfectly reasonable. The failure is theirs, and trying again in ten minutes might work.

        That split matters in practice. A **4xx** means the caller should change something. A **5xx** means the owner of the server should wake up. It also decides who gets the pager alert.` },

    { kind: 'compare', title: 'The success and redirect codes you will meet',
      body: 'These come up daily.',
      cols: ['Means', 'Typical use'],
      rows: [
        ['`200 OK`', 'It worked, and here is the result', 'Most successful `GET`s'],
        ['`201 Created`', 'It worked, and something new now exists', 'Reply to a `POST` that made a thing'],
        ['`204 No Content`', 'It worked; there is nothing to send back', 'Often after a `DELETE` or an update'],
        ['`301 Moved Permanently`', 'This address has changed for good', 'A site moving, or `http` to `https`'],
        ['`304 Not Modified`', 'Your saved copy is still current', 'Browser caching: no need to download again']
      ],
      note: 'A `302` also exists: a *temporary* redirect. The difference from 301 is whether browsers and search engines should remember the move.' },

    { kind: 'code', title: 'A redirect on the wire',
      body: 'A 3xx response has no page. It only points the way. **Tap the lines.**',
      code: { lang: 'http', src: `
        HTTP/1.1 301 Moved Permanently
        Location: https://example.com/shop
        Content-Length: 0`,
        notes: {
          1: 'The status line. The `301` tells the browser this is a **permanent** move, so it may remember it and skip the old address next time.',
          2: 'The `Location` header says where to go instead. The browser **automatically** sends a fresh request there, so you barely notice.',
          3: 'There is nothing to show, so the body is empty. The whole message is a signpost.'
        } } },

    { kind: 'compare', title: 'The client-error codes you will meet',
      body: 'All of these say "the request has a problem". Each one says which problem.',
      cols: ['Means', 'Example'],
      rows: [
        ['`400 Bad Request`', 'The request itself is malformed', 'Broken JSON, or a missing required piece'],
        ['`401 Unauthorized`', 'Who are you? No valid proof of identity', 'Not logged in, or an expired token'],
        ['`403 Forbidden`', 'I know who you are, and the answer is no', 'A normal user opening an admin page'],
        ['`404 Not Found`', 'Nothing lives at that address', 'A mistyped URL, or a deleted item'],
        ['`409 Conflict`', 'This clashes with the current state', 'Signing up with an email already taken'],
        ['`422 Unprocessable Content`', 'Well-formed, but the data is not acceptable', 'A password that fails the rules'],
        ['`429 Too Many Requests`', 'Slow down: you hit a rate limit', 'A script hammering an API']
      ],
      note: '`400` and `422` are often blurred. A common split: 400 when the server cannot even read the request, 422 when it reads it fine but the content fails validation.' },

    { kind: 'sequence', title: '401 versus 403',
      body: 'These two get mixed up constantly. Step through one visitor’s session.',
      actors: ['Browser', 'Server'],
      steps: [
        { from: 0, to: 1, label: 'GET /account', note: 'You open your account page without having logged in.' },
        { from: 1, to: 0, label: '401 Unauthorized', dashed: true, note: '**"Who are you?"** The server has no idea who is asking. The fix is to *identify yourself*: log in. (The name says "unauthorized", but it really means **unauthenticated**.)' },
        { from: 0, to: 1, label: 'POST /login', note: 'You log in with your username and password.' },
        { from: 0, to: 1, label: 'GET /account (logged in)', note: 'Now the request carries proof of who you are.' },
        { from: 1, to: 0, label: '200 OK', dashed: true, note: 'The server knows you and lets you in.' },
        { from: 0, to: 1, label: 'GET /admin', note: 'Curious, you try the admin area.' },
        { from: 1, to: 0, label: '403 Forbidden', dashed: true, note: '**"I know exactly who you are, and you are not allowed."** Logging in again changes nothing. You need *permission*, not an identity.' }
      ] },

    { kind: 'diagram', title: 'The gateway codes: 502, 503, 504',
      body: 'Big sites put a front-door server (a **gateway**) between you and the app doing the work. Three different 5xx codes tell you what went wrong behind it. The Networking module covers these gateways properly.',
      nodes: [
        { id: 'b', label: 'Browser', icon: '📱', x: 1, y: 0 },
        { id: 'g', label: 'Gateway (front door)', icon: '🚪', x: 1, y: 1, tone: 'accent' },
        { id: 'a', label: 'App server', icon: '🖥️', x: 1, y: 2, tone: 'warn' }
      ],
      edges: [
        { from: 'b', to: 'g', label: 'request' },
        { from: 'g', to: 'a', label: 'forwards it' }
      ],
      caption: '502 Bad Gateway: the app gave the gateway a broken or invalid reply (or the connection failed). 503 Service Unavailable: the app is overloaded or switched off for maintenance. 504 Gateway Timeout: the app took too long and the gateway gave up. A plain 500 means the app hit a bug of its own.' },

    { kind: 'pitfall', title: 'The “always 200” habit',
      body: `Some APIs return \`200 OK\` for everything and tuck the real result in the body: \`{"success": false, "error": "No such user"}\`.

        It looks harmless. It is not. Browsers, caches, monitoring tools, retry logic and every library built on HTTP read the **status code**, not your custom field. A failure marked \`200\` looks like a success to all of them: it can be cached, it never trips an alert, and no client knows to retry or stop.

        Use the code to say *what kind* of outcome it was, and the body to give the *details* (which field was wrong, what to do next).` },

    { kind: 'steps', title: 'Choosing the right code',
      body: 'When you build an API, pick a code by asking these questions in order.',
      steps: [
        { title: 'Did it work?', body: 'If yes: `200` for a result, `201` if something new was created, `204` if there is nothing to return.' },
        { title: 'Whose fault is the failure?', body: 'The caller sent something wrong: pick a `4xx`. Your own code or infrastructure failed: pick a `5xx`.' },
        { title: 'For a 4xx, which problem?', body: 'Unreadable: `400`. Unknown caller: `401`. Known but not allowed: `403`. Nothing there: `404`. Clashes with existing data: `409`. Bad values: `422`. Too fast: `429`.' },
        { title: 'For a 5xx, be honest', body: 'A bug is `500`. Overloaded or in maintenance is `503`. Never blame the client for your own crash.' },
        { title: 'Put the details in the body', body: 'The code is the category. A short message in the body says exactly what to fix.' }
      ] }
  ],

  activities: [
    { type: 'match', after: 1, prompt: 'Match each class of status code to its meaning.',
      pairs: [['1xx', 'Informational: carry on'], ['2xx', 'Success: it worked'], ['3xx', 'Redirection: look elsewhere'], ['4xx', 'Client error: the request was the problem'], ['5xx', 'Server error: the server failed']] },

    { type: 'mcq', after: 7, q: 'You are logged in as an ordinary customer and open `/admin/users`. The server replies with an error. Which is the correct code?',
      options: ['`403 Forbidden`: it knows who you are and refuses', '`401 Unauthorized`: you must prove who you are', '`404 Not Found`: the page does not exist for you', '`500 Internal Server Error`: it cannot process admin pages'],
      answer: 0,
      why: [null, 'You are already identified. Logging in again would change nothing, so 401 does not fit.', 'Hiding a page with 404 is sometimes done on purpose, but the straightforward answer is 403.', 'Nothing has crashed. Refusing is the server working correctly.'],
      explain: '**401** means "I do not know who you are" (not authenticated). **403** means "I know who you are, and you lack permission" (not authorised).' },

    { type: 'tf', after: 8, statement: 'If an API replies `200 OK` with a body of `{"error": "card declined"}`, clients and monitoring tools will still treat it as a failure.', answer: false,
      explain: 'Most tooling reads only the **status code**. A 200 is treated as success, so it can be cached, will not raise alerts and will not be retried. A declined card should come back as a 4xx.' },

    { type: 'bucket', prompt: 'Whose problem is it? Sort each response.', buckets: ['Client error (4xx)', 'Server error (5xx)'],
      items: [['`404 Not Found`', 0], ['`422` for a password that is too short', 0], ['`429 Too Many Requests`', 0], ['`500` after a bug in the code', 1], ['`503` during maintenance', 1], ['`504` when the app is too slow', 1], ['`401` for a missing login', 0]],
      explain: '4xx: the request needs changing before it can succeed. 5xx: the request was fine, so the server side must be fixed. That split decides who gets paged.' },

    { type: 'short', q: 'Which status code means "Too Many Requests"?', accept: ['429'], hint: 'It is in the 4xx range, in the four-hundred-and-twenties.',
      explain: '`429` is sent when a client goes over a rate limit. Often it comes with a `Retry-After` header saying how long to wait.' },

    { type: 'ab', q: 'A client asks for `GET /users/999`, but there is no such user. Which response is better?',
      a: { lang: 'http', label: 'Everything is 200', src: `
        HTTP/1.1 200 OK

        {"error": "No such user"}` },
      b: { lang: 'http', label: 'Honest code', src: `
        HTTP/1.1 404 Not Found

        {"error": "No such user"}` },
      answer: 'b',
      explain: 'The status code is what caches, browsers and monitoring read. Reporting a missing user as a success hides the failure from all of them. The body still carries the detail.' },

    { type: 'match', prompt: 'Pick the best code for each situation.',
      pairs: [['A new to-do item was saved', '201 Created'], ['An item was deleted and there is nothing to return', '204 No Content'], ['Someone signs up with an email that is already registered', '409 Conflict'], ['The JSON body is missing a closing bracket', '400 Bad Request'], ['A page moved permanently to a new address', '301 Moved Permanently']] },

    { type: 'scenario', title: 'Three alerts at 3am', intro: 'You are on call for an online shop. A gateway sits in front of the app servers, and tonight three different 5xx codes show up in the alerts. Each one points somewhere different.',
      meters: { uptime: 60, 'your sanity': 70 },
      steps: [
        { text: 'First, right after a deployment, customers get `502 Bad Gateway`. The gateway is fine. What does 502 suggest?',
          choices: [
            { label: 'The new app version is crashing or returning garbage to the gateway: check it and roll back', score: 2, effects: { uptime: 20, 'your sanity': 5 }, feedback: 'Yes. 502 means the gateway got a bad reply, or none, from the app behind it. A freshly deployed, broken version is the classic cause.' },
            { label: 'Customers have typed the wrong address', score: 0, effects: { uptime: -15 }, feedback: 'A wrong address would give 404. This is a 5xx: the failure is on your side of the wire.' },
            { label: 'Buy more bandwidth', score: 0, effects: { uptime: -10, 'your sanity': -10 }, feedback: 'Bandwidth does not make a crashing app behave. The gateway reached the app and got something unusable.' }
          ] },
        { text: 'Later, during a flash sale, users see `503 Service Unavailable`. The app is healthy but swamped. What do you do?',
          choices: [
            { label: 'Add capacity, and let the 503s (with a Retry-After) tell clients to come back shortly', score: 2, effects: { uptime: 15 }, feedback: 'Right. 503 honestly says "temporarily unable". Capacity fixes the cause, and well-behaved clients retry after a pause.' },
            { label: 'Return a friendly page with `200 OK` so alerts stop firing', score: 0, effects: { uptime: -15, 'your sanity': -10 }, feedback: 'You have hidden the problem from monitoring, caches and crawlers. A cache might even keep serving the apology page.' },
            { label: 'Restart every server again and again', score: 1, effects: { uptime: -5, 'your sanity': -5 }, feedback: 'Restarts drop the traffic you were handling, then the swamp returns. It treats the symptom, not the load.' }
          ] },
        { text: 'Finally, one report page returns `504 Gateway Timeout`. The app takes 90 seconds to build it; the gateway waits only 60. What is the sound fix?',
          choices: [
            { label: 'Find out why the report is so slow, and consider building it in the background', score: 2, effects: { uptime: 10, 'your sanity': 10 }, feedback: 'Yes. A 90-second request is a design problem. Speeding it up, or running it in the background and notifying the user, fixes it properly.' },
            { label: 'Raise the gateway timeout to ten minutes', score: 1, effects: { 'your sanity': -5 }, feedback: 'It silences the error, but users stare at a spinner and every slow request ties up a connection for far longer.' },
            { label: 'Change the response to `404` so it looks tidier', score: 0, effects: { uptime: -5, 'your sanity': -10 }, feedback: 'The page does exist. A wrong code sends the next engineer searching in the wrong place.' }
          ] }
      ],
      outro: 'The pattern: **502** = bad answer from behind the gateway, **503** = unavailable right now, **504** = too slow, **500** = a bug in the app itself.' },

    { type: 'explain', prompt: 'Explain the difference between `401` and `403` to a colleague who thinks they are the same, and say what a user should do after each.',
      model: '401 means the server does not know who you are: you are not authenticated, so you should log in or send valid credentials. 403 means the server does know who you are but you do not have permission, so logging in again will not help: you need different access.',
      keywords: ['401', '403', 'who you are', 'authenticated', 'permission', 'log in'] }
  ],

  flashcards: [
    { q: 'What does the first digit of a status code mean?', a: '1 informational, 2 success, 3 redirection, 4 client error, 5 server error.' },
    { q: '401 vs 403?', a: '401: not authenticated, so the server does not know who you are. 403: authenticated but not allowed.' },
    { q: 'What do 502, 503 and 504 mean?', a: '502 Bad Gateway: bad reply from the server behind. 503 Service Unavailable: overloaded or down for now. 504 Gateway Timeout: the server behind was too slow.' },
    { q: 'Which codes mean a new thing was created, and nothing to return?', a: '201 Created for a new thing; 204 No Content when it worked but there is no body to send.' },
    { q: 'Why is replying 200 for every error a bad idea?', a: 'Caches, browsers, retry logic and monitoring read the status code, so they treat the failure as a success.' }
  ],

  glossary: [
    { term: 'Status code', def: 'The three-digit number on the first line of a response that says how the request went.', like: 'A traffic light on the response: green, amber or red at a glance.' },
    { term: 'Redirect', def: 'A 3xx response that tells the client to ask somewhere else, using the `Location` header.', like: 'A "we have moved" sign on a shop door.' },
    { term: 'Client error and server error', def: 'A 4xx code blames the request; a 5xx code blames the server.', like: '"You ordered off the menu" versus "the cooker broke".' },
    { term: 'Authentication and authorisation', def: 'Authentication is proving who you are. Authorisation is deciding what that person may do. 401 is about the first, 403 the second.', like: 'Showing your ID at the door, versus the list of rooms your pass opens.', aka: ['authn / authz'] },
    { term: 'Gateway', def: 'A server in front of other servers that receives requests and passes them on. It is what produces 502 and 504 errors.', like: 'A receptionist who forwards your call and reports if nobody picks up.' },
    { term: 'Rate limit', def: 'A cap on how many requests a client may send in a period. Going over it earns a 429.', like: 'A bouncer allowing one drink per person per round.' }
  ],

  takeaways: [
    'Read the **first digit**: 2 worked, 3 go elsewhere, 4 your fault, 5 our fault.',
    '**401** = who are you? **403** = I know you, and no.',
    '**502** bad reply from behind, **503** unavailable, **504** too slow.',
    'Use honest codes and put the detail in the body. Never answer 200 to a failure.'
  ],

  links: [
    { label: 'MDN: HTTP response status codes', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Status' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('http-headers-cookies', {
  eli5: 'Headers are the small labels on every request and response, and a cookie is a note the server asks your browser to carry back on every later visit, which is how a forgetful protocol knows it is you.',

  cards: [
    { kind: 'concept', title: 'The labels you never typed',
      body: `You typed one address. Yet your browser sent a dozen extra lines you never wrote: what it is, which languages you read, what formats it can show.

        Those lines are **headers**: \`Name: value\` pairs that sit between the first line and the body. They are not the thing you asked for. They are information *about* the request or the response.

        Think of the labels on a parcel: *fragile*, *this way up*, *contents: books*. The courier does not open the box to know how to handle it.

        Headers are how the two sides agree on all the small print, and how HTTP gets features without changing its basic shape.` },

    { kind: 'code', title: 'Headers going both ways',
      body: 'Request headers describe the client and its wishes. Response headers describe the reply. **Tap the lines.**',
      code: { lang: 'http', src: `
        GET /report.pdf HTTP/1.1
        Host: files.example.com
        Accept-Language: en-GB
        Authorization: Bearer abc123

        HTTP/1.1 200 OK
        Content-Type: application/pdf
        Content-Length: 48211
        Cache-Control: max-age=3600`,
        notes: {
          2: '`Host`: which website. Required in HTTP/1.1.',
          3: 'The client says which language it prefers.',
          4: 'Proof of identity, for APIs. A preview: auth gets its own world later.',
          6: 'The response status line.',
          7: 'What the body *is*. The browser sees a PDF and opens its PDF viewer.',
          8: 'How big the body is, in bytes.',
          9: 'A preview of caching: the client may reuse this file for 3600 seconds (an hour) without asking again.'
        } } },

    { kind: 'compare', title: 'Headers you will see constantly',
      body: 'You do not need them all. These are the regulars.',
      cols: ['Sent by', 'What it does'],
      rows: [
        ['`Host`', 'Client', 'Which site on this server you want'],
        ['`User-Agent`', 'Client', 'What software is making the request'],
        ['`Accept`', 'Client', 'Which formats the client can handle'],
        ['`Content-Type`', 'Either', 'The format of the body that follows'],
        ['`Authorization`', 'Client', 'Credentials to prove who you are'],
        ['`Cookie`', 'Client', 'Cookies being sent back to the server'],
        ['`Set-Cookie`', 'Server', 'Asks the client to store a cookie'],
        ['`Location`', 'Server', 'Where to go next (used with redirects)']
      ],
      note: 'Header names are not case-sensitive: `content-type` and `Content-Type` are the same header.' },

    { kind: 'code', title: 'Content negotiation: asking nicely for a format',
      body: 'One address can offer several versions of the same thing. The client states its preferences; the server picks one and says which. This is **content negotiation**. **Tap the lines.**',
      code: { lang: 'http', src: `
        GET /users/5 HTTP/1.1
        Accept: application/json
        Accept-Language: fr

        HTTP/1.1 200 OK
        Content-Type: application/json; charset=utf-8

        {"id": 5, "name": "Amélie"}`,
        notes: {
          2: '`Accept` lists the formats the client is happy with. Here it wants **JSON** (data) rather than an HTML page.',
          3: 'And it would like French if the server has it.',
          6: '`Content-Type` is the server’s answer: "here is JSON, encoded as UTF-8 text". These two headers are the pair to remember: **Accept** is the wish, **Content-Type** is what you actually got.',
          8: 'The body is in the chosen format. If the server cannot offer any format the client accepts, it may reply `406 Not Acceptable`.'
        } } },

    { kind: 'metaphor', title: 'The coat-check ticket',
      body: `HTTP forgets you between requests. So how does a shop keep your basket, or a site keep you logged in?

        Think of a **cloakroom**. You hand over your coat; the attendant does not remember your face (there are hundreds of guests). Instead they give you a **numbered ticket**. Come back with the ticket and they find your coat in seconds.

        - The **coat** is your data: who you are, what is in your basket. It stays with the **server**.
        - The **ticket** is a small value given to your browser. It carries nothing but a number.
        - Every time you come back, **you show the ticket**.

        That ticket has a name: a **cookie**.` },

    { kind: 'sequence', title: 'How a cookie keeps you logged in',
      body: 'Nothing about HTTP changes. Two headers do all the work.',
      actors: ['Browser', 'Server'],
      steps: [
        { from: 0, to: 1, label: 'POST /login (email, password)', note: 'You submit your details. This is the only time you send the password.' },
        { at: 1, label: 'creates a session record', note: 'The server checks them, then writes a note on its side: "ticket a8f3k2 belongs to Sam". That note is the **session**.' },
        { from: 1, to: 0, label: '200 OK + Set-Cookie: session=a8f3k2', dashed: true, note: '`Set-Cookie` asks the browser to **store** the ticket.' },
        { at: 0, label: 'stores the cookie', note: 'The browser files it away, labelled with this website’s name.' },
        { from: 0, to: 1, label: 'GET /inbox + Cookie: session=a8f3k2', note: 'On **every later request** to this site, the browser attaches the ticket automatically.' },
        { at: 1, label: 'looks up a8f3k2', note: 'The server finds the note, sees it is Sam, and builds Sam’s inbox.' },
        { from: 1, to: 0, label: '200 OK (Sam’s inbox)', dashed: true, note: 'HTTP is still stateless. The *state* lives on the server and the *ticket* is sent every time. Security has a whole lesson on sessions.' }
      ] },

    { kind: 'code', title: 'A cookie, and the three attributes that protect it',
      body: 'The server can attach settings to a cookie. In reality they sit on one line separated by semicolons; they are split here so you can tap each one.',
      code: { lang: 'text', src: `
        Set-Cookie: session=a8f3k2
          Max-Age=3600
          HttpOnly
          Secure
          SameSite=Lax`,
        notes: {
          1: 'The name and value. The value should be a random, hard-to-guess ID, not real data.',
          2: '`Max-Age` is how long the browser keeps it, in seconds. With no expiry at all it is a *session cookie*, which normally vanishes when the browser closes.',
          3: '**`HttpOnly`**: JavaScript running on the page **cannot read** this cookie. If an attacker sneaks a script into your page, it still cannot steal the ticket.',
          4: '**`Secure`**: the browser will only send it over **HTTPS**, never plain HTTP, where it could be seen in transit.',
          5: '**`SameSite`**: controls whether the cookie is sent on requests that start from *another* site. `Lax` blocks it on most of them, which defends against other sites tricking your browser into acting as you. `Strict` is tighter; `None` allows everything (and needs `Secure`).'
        } } },

    { kind: 'pitfall', title: 'Do not put the data in the cookie',
      body: `A cookie lives in the **user's browser**, and users can open dev tools and edit it. Treat everything in a cookie as something the person could have changed.

        A cookie reading \`user=sam; admin=false\` is an invitation to change \`false\` to \`true\`.

        The safe pattern is the cloakroom one: the cookie holds only a **meaningless random ID**, and the real facts (who you are, whether you are an admin) stay on the server, looked up each time.

        Also remember that cookies are sent on *every* request to that site, images included. Big cookies slow everything down.` },

    { kind: 'realworld', title: 'A preview: caching and auth headers',
      body: `Two header families you will meet properly later:

        - **Caching.** \`Cache-Control: max-age=3600\` says "reuse this for an hour". An \`ETag\` is a fingerprint of the content: the client asks "still this version?", and if so the server replies \`304 Not Modified\` with no body. Cheap and fast.
        - **Authentication.** \`Authorization: Bearer <token>\` carries a token proving who is calling. Mobile apps and APIs use this instead of cookies. Some sites use cookies, some use tokens, many use both.

        Both get their own deep dives in the Caching and Security worlds.` },

    { kind: 'tip', title: 'Look at your own cookies',
      body: `Open the developer tools and find the **Application** tab (called **Storage** in Firefox). Choose **Cookies** and pick a site you are logged in to.

        You will see each cookie's name, value, expiry and flags. Look for the \`HttpOnly\` and \`Secure\` ticks on the session cookie of a serious site such as your bank.

        In the Network tab, click any request: the **Cookie** header is the ticket your browser sent, and the response may carry a **Set-Cookie** header.

        Delete a site's session cookie and reload: you are logged out. The ticket was all it had.` }
  ],

  activities: [
    { type: 'match', after: 2, prompt: 'Match each header to its job.',
      pairs: [['Host', 'Which website on the server is wanted'], ['Accept', 'Which formats the client can handle'], ['Content-Type', 'The format of the body that follows'], ['Set-Cookie', 'Server asks the client to store a cookie'], ['Location', 'Where to go next, used with redirects']] },

    { type: 'mcq', after: 3, q: 'Which header does a server use to tell the client what format its response body is in?',
      options: ['`Content-Type`', '`Accept`', '`Host`', '`User-Agent`'],
      answer: 0,
      why: [null, '`Accept` is the client’s wish list, sent *in the request*. It is not the server’s statement.', '`Host` names the website the client wants.', '`User-Agent` says what software is asking.'],
      explain: '`Accept` is the wish; `Content-Type` is the reality. The client lists what it can handle, and the server labels what it actually sent.' },

    { type: 'tf', after: 5, statement: 'After the server sets a cookie, the browser sends it back automatically on later requests to that same site.', answer: true,
      explain: 'This automatic return is the whole point. The server does the remembering; the cookie is only a ticket the browser presents each time.' },

    { type: 'match', after: 6, prompt: 'Match each cookie attribute to what it does.',
      pairs: [['HttpOnly', 'JavaScript on the page cannot read the cookie'], ['Secure', 'Only sent over HTTPS'], ['SameSite', 'Controls sending on requests started by other sites'], ['Max-Age', 'How many seconds the browser keeps it']] },

    { type: 'spot', prompt: 'One of these cookies is risky as written. Tap the line.',
      code: { lang: 'text', src: `
        Set-Cookie: theme=dark; Path=/
        Set-Cookie: session=a8f3k2; Path=/
        Set-Cookie: lang=en-GB; Path=/; Secure` },
      lines: [2],
      explain: 'The **session** cookie is the key to the account, yet it lacks `HttpOnly`, `Secure` and `SameSite`. A script on the page could read it, and it would travel over plain HTTP. Theme and language are harmless preferences.' },

    { type: 'cloze', text: 'The server sends a {{Set-Cookie}} header once. After that the browser returns the value in a {{Cookie}} header on every request. The cookie should hold only a random {{ID}}, while the real data stays on the server.',
      distractors: ['Authorization', 'Location', 'password'],
      explain: 'Set-Cookie goes server to client, Cookie goes client to server. The value is a meaningless ticket number; the facts it points to are kept server-side.' },

    { type: 'ab', q: 'Which cookie design is safer for remembering a logged-in user?',
      a: { lang: 'text', label: 'A random ticket', src: `
        Set-Cookie: session=a8f3k2; HttpOnly; Secure
        (server stores: a8f3k2 = Sam, not admin)` },
      b: { lang: 'text', label: 'The data itself', src: `
        Set-Cookie: user=sam; admin=false` },
      answer: 'a',
      explain: 'Users can edit anything in their own cookies, so facts like "admin=false" must not live there. A random ID with the real data on the server cannot be forged by changing the cookie.' },

    { type: 'order', prompt: 'Put the login flow in order.',
      items: ['The browser submits the login form', 'The server checks the password and creates a session record', 'The server replies with a Set-Cookie header', 'The browser stores the cookie', 'The browser sends the cookie on the next request', 'The server looks up the session and knows who you are'],
      explain: 'The session is created before the cookie is handed out, and the cookie only helps once the browser has stored it and starts sending it back.' },

    { type: 'explain', prompt: 'HTTP is stateless, yet websites remember that you are logged in. Explain how, and name one cookie attribute that protects the cookie.',
      model: 'Each request stands alone, so after login the server gives the browser a random ticket in a Set-Cookie header. The browser stores it and sends it back in a Cookie header on every later request. The server looks the ticket up in its own records to know who you are. HttpOnly stops page scripts reading the cookie; Secure keeps it off plain HTTP; SameSite limits it on cross-site requests.',
      keywords: ['Set-Cookie', 'Cookie', 'ticket', 'server', 'HttpOnly', 'Secure', 'SameSite', 'stateless'] }
  ],

  flashcards: [
    { q: 'What is the difference between `Accept` and `Content-Type`?', a: '`Accept` (request) lists formats the client can handle. `Content-Type` says the format of the body actually being sent.' },
    { q: 'How do cookies make stateless HTTP remember you?', a: 'The server sends `Set-Cookie` with a random ID; the browser stores it and sends it back in a `Cookie` header on every request, so the server can look you up.' },
    { q: 'What does the HttpOnly cookie attribute do?', a: 'It stops JavaScript on the page from reading the cookie, limiting the damage if an attacker injects a script.' },
    { q: 'What do Secure and SameSite do?', a: 'Secure: the cookie is only sent over HTTPS. SameSite: restricts sending the cookie on requests started from other sites.' },
    { q: 'Why should a cookie hold an ID rather than real data?', a: 'Users can edit their own cookies. A random ID is meaningless to them, while the real data stays safely on the server.' }
  ],

  glossary: [
    { term: 'Cookie', def: 'A small named value that a server asks the browser to store and send back on later requests to that site.', like: 'A cloakroom ticket: it holds a number, not your coat.' },
    { term: 'Content negotiation', def: 'The client and server agreeing on the format or language of a response, using headers such as `Accept` and `Content-Type`.', like: 'Telling a waiter "menu in English, please" and getting the English one.' },
    { term: 'Media type', def: 'A label for a kind of data, such as `text/html`, `application/json` or `image/png`, used in `Content-Type` and `Accept`.', like: 'The "contents" sticker on a box.', aka: ['MIME type', 'Content-Type value'] },
    { term: 'HttpOnly', def: 'A cookie attribute that hides the cookie from JavaScript on the page; the browser still sends it with requests.', like: 'A ticket the attendant can see but you cannot read out loud.' },
    { term: 'Secure (cookie)', def: 'A cookie attribute that makes the browser send the cookie only over HTTPS.', like: 'Only handing over your ticket in a private room.' },
    { term: 'SameSite', def: 'A cookie attribute (`Strict`, `Lax` or `None`) that controls whether the cookie is sent when the request starts on a different site.', like: 'A club pass that only works if you walk in from the club’s own street.' }
  ],

  takeaways: [
    'Headers are `Name: value` labels on requests and responses. They carry the small print.',
    '`Accept` is the wish; `Content-Type` is what you actually got.',
    'Cookies are tickets: `Set-Cookie` hands one out, `Cookie` brings it back every time.',
    'Protect session cookies with **HttpOnly**, **Secure** and **SameSite**, and keep real data on the server.'
  ],

  links: [
    { label: 'MDN: HTTP headers', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers' },
    { label: 'MDN: Using HTTP cookies', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('http-versions', {
  eli5: 'HTTP/1.1, HTTP/2 and HTTP/3 all say the same things (GET, 404, headers), but each newer version packs and delivers the messages more cleverly so pages load faster.',

  cards: [
    { kind: 'concept', title: 'Same language, faster trucks',
      body: `You have spent three lessons on what HTTP *says*: methods, status codes, headers. Here is a surprise: that stayed almost entirely the same for decades.

        What changed is **how the messages are delivered**. Picture the same letters sent by horse, then by van, then by a fleet of drones. The words inside are untouched; the transport got smarter.

        There are three versions you will hear about:

        - **HTTP/1.1**: the long-serving workhorse, plain-text messages.
        - **HTTP/2**: the same meaning, packed more cleverly.
        - **HTTP/3**: the same again, on a different foundation.

        Each one exists to fix a specific slowness in the one before.` },

    { kind: 'sequence', title: 'Keep-alive: do not hang up after every request',
      body: 'The first slowness: opening a connection costs time. Early HTTP opened a fresh [[TCP]] connection for every single file. HTTP/1.1 made reuse the default, called **keep-alive**.',
      actors: ['Browser', 'Server'],
      steps: [
        { from: 0, to: 1, label: 'open TCP connection', note: 'Setting up a connection takes a round trip or more (the handshake). On a far-away server that is real time.' },
        { from: 0, to: 1, label: 'GET /index.html', note: 'First request, on the new connection.' },
        { from: 1, to: 0, label: '200 OK + HTML', dashed: true, note: 'First response. The server does **not** close the line.' },
        { from: 0, to: 1, label: 'GET /style.css (same connection)', note: 'The browser reuses the open connection. No new handshake.' },
        { from: 1, to: 0, label: '200 OK + CSS', dashed: true, note: 'Saved a whole set-up. Now multiply that by the dozens of files on a page.' },
        { note: 'The connection closes after it has been idle for a while. This is the **persistent connection** idea.' }
      ] },

    { kind: 'metaphor', title: 'One checkout, one slow customer',
      body: `A supermarket has a single checkout open. The first customer is buying one trolley of mixed produce with a price check on a mango. Behind them, three people each hold one packet of biscuits.

        The biscuit buyers cannot be served until the mango is sorted. Their purchases are tiny, but they wait for the **front of the line**. That is **head-of-line blocking**.

        HTTP/1.1 behaves like this on each connection: it must send responses **back in the order the requests were made**. One slow or large response holds up every small one queued behind it.

        The workaround: open several checkouts. Browsers typically open around six connections to each site, which helps but costs more set-up and memory.` },

    { kind: 'concept', title: 'HTTP/2: one connection, many streams',
      body: `HTTP/2 lets a single connection carry **many requests and responses at once**, interleaved. Each request and its response is a numbered **stream**, cut into small labelled pieces called frames, so pieces from different streams can be shuffled together and sorted out at the other end.

        That is **multiplexing**. The slow mango no longer blocks the biscuits: their frames slip through in between.

        Two more changes:

        - **Header compression.** Every request repeats nearly the same headers (including big cookies). HTTP/2 compresses them and refers back to ones already sent, so repeats cost almost nothing.
        - **Binary.** Messages are sent as compact binary frames, not readable text. The meaning (methods, codes, headers) is unchanged; your tools translate it back.` },

    { kind: 'layers', title: 'What the stack looks like for HTTP/3',
      body: 'HTTP/1.1 and HTTP/2 both ride on [[TCP]], with encryption ([[TLS]]) on top for HTTPS. HTTP/3 takes a different foundation. Reading top to bottom:',
      layers: [
        { label: 'HTTP/3', note: 'The same methods, status codes and headers you already know.', tone: 'accent', icon: '📨' },
        { label: 'QUIC', note: 'A newer transport protocol with its own streams, loss recovery and built-in encryption.', tone: 'info', icon: '🚀' },
        { label: 'UDP', note: 'A bare-bones way to send packets. No ordering or retries of its own, which QUIC adds in a smarter way.', tone: 'warn', icon: '📦' },
        { label: 'IP', note: 'Addresses and routing, as ever.', tone: 'muted', icon: '🌍' }
      ] },

    { kind: 'deep', title: 'Why HTTP/3 left TCP behind',
      body: `HTTP/2 fixed blocking at the HTTP level, but it still sat on one TCP connection. TCP guarantees everything arrives **in order**, so if a single packet is lost, TCP holds back *all later data* until it is re-sent, even data that belonged to unrelated streams. The checkout line moved down a layer.

        **QUIC** keeps each stream independent: a lost packet delays only the stream it belonged to. It also folds the encryption set-up into the connection set-up, so a new connection can be ready sooner, and a connection can survive you moving from Wi-Fi to mobile data.

        It runs over **UDP** simply because the networks of the world already pass UDP everywhere, so QUIC could be rolled out without changing them. (You will meet TCP and UDP properly in the Networking module.)` },

    { kind: 'compare', title: 'The three versions side by side',
      body: 'Keep this table: it is the whole lesson in one glance.',
      cols: ['HTTP/1.1', 'HTTP/2', 'HTTP/3'],
      rows: [
        ['Runs over', 'TCP', 'TCP', 'QUIC (on UDP)'],
        ['Message format', 'Readable text', 'Binary frames', 'Binary frames'],
        ['Requests at once', 'One at a time per connection', 'Many streams on one connection', 'Many streams on one connection'],
        ['Head-of-line blocking', 'Yes, per connection', 'Fixed in HTTP, but a lost TCP packet still stalls all', 'Largely removed: a loss hits one stream'],
        ['Header compression', 'None', 'Yes', 'Yes'],
        ['Encryption in practice', 'Optional (HTTP or HTTPS)', 'Browsers use it over HTTPS only', 'Always encrypted (built into QUIC)']
      ] },

    { kind: 'tip', title: 'Which version did I just use?',
      body: `In the browser's Network tab, right-click the column headings and tick **Protocol**. You will see \`http/1.1\`, \`h2\` (HTTP/2) or \`h3\` (HTTP/3) beside each request.

        With the terminal, \`curl -v\` prints the version it spoke when it connects.

        Browsers and servers **negotiate** the version automatically: the browser uses the newest one that both support, and quietly falls back to an older one if a network blocks the newer. You rarely choose it yourself.` },

    { kind: 'pitfall', title: 'A newer version will not fix a slow server',
      body: `It is tempting to think "we are slow, upgrade to HTTP/3". But the protocol only changes **how bytes travel**. If your page is slow because a database query takes two seconds, or the images are twelve megabytes each, the same two seconds are still there.

        Similarly, old tricks built to dodge HTTP/1.1's limits, such as spreading files over many hostnames or gluing everything into one giant file, matter far less on HTTP/2 and can even be counter-productive.

        Measure first. The Network tab's timing breakdown tells you whether the wait is the *network* or the *server*.` },

    { kind: 'realworld', title: 'What changes for you as a developer',
      body: `Very little, which is the point.

        Your code still reads methods, sends status codes and sets headers. The version is handled one layer below, typically by your web server, a gateway in front of it, or a CDN. Often turning on HTTP/2 or HTTP/3 is a setting rather than a code change.

        What you should know:

        - Keep-alive and multiplexing mean **many small requests are cheaper** than they once were.
        - Turn on **HTTPS**: browsers only use HTTP/2 over it, and HTTP/3 is always encrypted.
        - Do not assume every client supports the newest version; the fallback is automatic, but test the old path.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'What does keep-alive let HTTP/1.1 do?',
      options: ['Reuse one open connection for several requests', 'Keep the server running on its own when the app crashes', 'Remember the user between one visit and the next', 'Send several responses back in any order it likes'],
      answer: 0,
      why: [null, 'That would be resilience, not a connection setting.', 'Remembering users is cookies, which sit above the connection.', 'HTTP/1.1 sends responses in order; sending out of order is not what keep-alive does.'],
      explain: 'Opening a connection costs at least one round trip. Keeping it open and reusing it for the next request removes that cost for every file after the first.' },

    { type: 'tf', after: 3, statement: 'HTTP/2 changed what `GET` and `404` mean, so servers have to be rewritten to use new status codes.', answer: false,
      explain: 'The meaning (methods, status codes, headers) stayed the same. HTTP/2 changed how messages are packed and delivered, which is why a server can usually switch on the new version without changing application code.' },

    { type: 'match', after: 5, prompt: 'Match each version or idea to its key feature.',
      pairs: [['HTTP/1.1', 'Text messages; keep-alive; one response at a time per connection'], ['HTTP/2', 'Many streams multiplexed over one TCP connection'], ['HTTP/3', 'Runs over QUIC, which runs over UDP'], ['Head-of-line blocking', 'One slow item holds up everything queued behind it'], ['Header compression', 'Repeated headers sent cheaply instead of in full']] },

    { type: 'bucket', prompt: 'Which version does each statement best describe?', buckets: ['HTTP/1.1', 'HTTP/2', 'HTTP/3'],
      items: [['Browsers open about six connections per site to work around blocking', 0], ['Messages are readable plain text', 0], ['First version to multiplex many streams over one TCP connection', 1], ['Compresses headers that are repeated across requests', 1], ['Uses QUIC over UDP instead of TCP', 2], ['A single lost packet delays only the stream it belonged to', 2]],
      explain: 'HTTP/1.1 works around its one-at-a-time limit with extra connections. HTTP/2 introduces multiplexing. HTTP/3 moves to QUIC so loss no longer stalls unrelated streams.' },

    { type: 'mcq', after: 8, q: 'A page loads 80 small files and feels slow, but the server answers each one in 5 ms. Where is HTTP/2 most likely to help?',
      options: ['Many requests share one connection at the same time, so they do not queue up', 'It makes the server’s database queries faster', 'It makes each image smaller', 'It stops browsers from caching the files'],
      answer: 0,
      why: [null, 'The protocol does not change how the server works inside.', 'Compression of headers does not shrink image data.', 'Caching is unrelated to the version.'],
      explain: 'With many tiny requests, waiting in line (HTTP/1.1) dominates. Multiplexing lets them proceed together over one connection. If the server itself were slow, the protocol would not help.' },

    { type: 'multi', q: 'Which of these are the SAME across HTTP/1.1, HTTP/2 and HTTP/3?',
      options: ['What `GET`, `POST` and the other methods mean', 'The meaning of status codes such as `404`', 'Headers such as `Content-Type` and `Set-Cookie` and what they do', 'Whether the messages are readable text on the wire', 'Which transport protocol carries them'],
      answers: [0, 1, 2],
      explain: 'The meaning of the conversation is stable. What changes is the packing (text versus binary frames) and the transport underneath (TCP versus QUIC on UDP).' },

    { type: 'cloze', text: 'HTTP/3 runs over {{QUIC}}, which itself runs over {{UDP}}. Because each stream is independent, one lost packet no longer causes {{head-of-line blocking}} across all of them.',
      distractors: ['TCP', 'DNS', 'cookies'],
      explain: 'QUIC provides streams, loss recovery and encryption on top of UDP, so a loss delays only its own stream instead of everything behind it.' },

    { type: 'short', q: 'What is the name for one slow response holding up everything queued behind it on the same connection? (Three words, or the initials.)', accept: ['head-of-line blocking', 'head of line blocking', 'HOL blocking', 'HOL'], hint: 'The supermarket checkout problem.',
      explain: '**Head-of-line blocking**: the item at the front of the queue stalls everyone behind it. HTTP/2 removed it at the HTTP level; HTTP/3 removed the TCP-level version too.' },

    { type: 'explain', prompt: 'Explain to a friend why HTTP/2 can load a busy page faster than HTTP/1.1, without the server being any quicker.',
      model: 'With HTTP/1.1 each connection handles one request at a time and returns responses in order, so one slow or big file makes the rest wait, and browsers need many connections to work around it. HTTP/2 multiplexes many streams over a single connection, so small files are not stuck behind large ones, and it compresses repeated headers. The server does the same work; the delivery is just smarter.',
      keywords: ['multiplex', 'streams', 'one connection', 'in order', 'blocking', 'headers', 'compress'] }
  ],

  flashcards: [
    { q: 'What problem does keep-alive solve?', a: 'The cost of opening a new connection for every request: the connection stays open and is reused for the next request.' },
    { q: 'What is head-of-line blocking?', a: 'One slow or large item at the front of a queue delaying everything behind it, as with HTTP/1.1 responses that must come back in order.' },
    { q: 'What does HTTP/2 add over HTTP/1.1?', a: 'Multiplexing (many streams over one TCP connection), header compression, and binary framing. The meaning of methods, codes and headers is unchanged.' },
    { q: 'What is HTTP/3 built on?', a: 'QUIC, a transport protocol that runs over UDP and has built-in encryption and independent streams.' },
    { q: 'What changes in your application code when you move to HTTP/2 or HTTP/3?', a: 'Usually nothing: the version is handled by the web server, gateway or CDN. It is mostly configuration, plus enabling HTTPS.' }
  ],

  glossary: [
    { term: 'Keep-alive', def: 'Leaving a connection open after a response so the next request can reuse it. The default behaviour in HTTP/1.1.', aka: ['persistent connection'], like: 'Staying on the phone between questions instead of redialling each time.' },
    { term: 'Head-of-line blocking', def: 'When the first item in a queue is slow and holds up all those waiting behind it.', like: 'One slow customer at a single checkout.', aka: ['HOL blocking'] },
    { term: 'Multiplexing', def: 'Sending many separate streams of data interleaved over one connection and separating them at the other end.', like: 'Several conversations sharing one phone line, each tagged with its speaker.' },
    { term: 'Stream', def: 'One request and its response inside an HTTP/2 or HTTP/3 connection, carried as numbered frames mixed with other streams.', like: 'One lane of traffic in a shared tunnel.' },
    { term: 'Header compression', def: 'Shrinking the repeated headers of a connection, by referring back to ones already sent. Used in HTTP/2 and HTTP/3.', like: 'Saying "same address as before" instead of spelling it out each time.' },
    { term: 'QUIC', def: 'A modern transport protocol built on UDP that provides streams, loss recovery and encryption. HTTP/3 runs on it.', like: 'A courier firm that handles tracking and locks on top of a plain postal service.' }
  ],

  takeaways: [
    'The **meaning** of HTTP (methods, codes, headers) stayed put; only the delivery changed.',
    '**HTTP/1.1** reuses connections (keep-alive) but suffers head-of-line blocking.',
    '**HTTP/2** multiplexes many streams over one connection and compresses headers.',
    '**HTTP/3** runs over QUIC on UDP so a lost packet stalls only one stream.'
  ],

  links: [
    { label: 'MDN: Evolution of HTTP', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Evolution_of_HTTP' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('http-https', {
  eli5: 'HTTPS is HTTP sent inside an encrypted, identity-checked tunnel, so strangers on the way cannot read your messages, change them, or pretend to be the website.',

  cards: [
    { kind: 'concept', title: 'Plain HTTP is a postcard',
      body: `You are in a café, on its free Wi-Fi, logging in to a website. Every message you send passes through the café's router, then your provider, then a chain of other networks you have never heard of.

        With plain HTTP, every one of those stops can **read the message**, because it is just text. Passwords, cookies, messages, everything.

        It is a postcard: whoever handles it can read it, and nothing stops them scribbling on it or swapping it for another.

        **HTTPS** is HTTP with a security layer, built on [[TLS]], wrapped around it. Same requests, same responses, but sealed. The little padlock in the address bar means that layer is in place.` },

    { kind: 'metaphor', title: 'A sealed envelope from a verified sender',
      body: `Now imagine the same message sent differently. You put it in an **envelope** that only the recipient can open. The envelope has a **tamper-evident seal**, so if anyone alters it on the way, the recipient can see. And the sender includes an **ID that a trusted authority has checked**, so you know the letter really is from your bank and not from a lookalike.

        That is three protections in one:

        - **Secrecy**: nobody on the way can read it.
        - **Integrity**: nobody can change it unnoticed.
        - **Identity**: you know who you are talking to.

        HTTPS delivers all three. The next two cards show what each one stops.` },

    { kind: 'compare', title: 'Three things that go wrong on plain HTTP',
      body: 'Security people have names for each attack. Now you can too.',
      cols: ['Plain HTTP', 'HTTPS'],
      rows: [
        ['Eavesdropping: someone reads your traffic', 'Anyone on the path can read it all', 'Scrambled: only the two ends can read it'],
        ['Tampering: someone alters it in transit', 'Pages can be changed on the way (ads, malware, wrong prices)', 'Any change is detected and the data rejected'],
        ['Impersonation: someone pretends to be the site', 'You cannot tell a fake from the real server', 'The server must prove its identity with a certificate']
      ],
      note: 'Tampering is not hypothetical: some networks have injected adverts into plain-HTTP pages. A tampered download could contain anything.' },

    { kind: 'code', title: 'What a snooper sees on plain HTTP',
      body: 'This is a login sent over plain HTTP. **Tap the lines to see what an observer gets for free.**',
      code: { lang: 'http', src: `
        POST /login HTTP/1.1
        Host: shop.example
        Cookie: visitor=91ac2
        Content-Type: application/x-www-form-urlencoded

        email=sam@example.com&password=hunter2`,
        notes: {
          1: 'The **path** being visited: any observer sees exactly which page you are on.',
          3: 'Cookies travel in the clear too. Someone who copies a session cookie can often pretend to be you.',
          6: 'The **password**, in plain text, readable by every network between you and the server. Over HTTPS this whole message arrives as unreadable noise.'
        } } },

    { kind: 'diagram', title: 'TLS in one picture',
      body: 'HTTPS runs the usual HTTP conversation inside an encrypted tunnel that exists only between the browser and the server.',
      nodes: [
        { id: 'snoop', label: 'Snooper on the café Wi-Fi', icon: '🕵️', x: 1, y: 0, tone: 'bad' },
        { id: 'b', label: 'Browser', icon: '📱', x: 0, y: 1, tone: 'accent' },
        { id: 'net', label: 'Wi-Fi, ISP, routers', icon: '🌐', x: 1, y: 1, tone: 'muted' },
        { id: 's', label: 'Server', icon: '🖥️', x: 2, y: 1, tone: 'good' }
      ],
      edges: [
        { from: 'b', to: 'net', label: 'encrypted', both: true },
        { from: 'net', to: 's', label: 'encrypted', both: true },
        { from: 'snoop', to: 'net', label: 'sees only noise', dashed: true }
      ],
      groups: [{ label: 'Encrypted from end to end', x: 0, y: 1, w: 3, h: 1 }],
      caption: 'Everyone in the middle still carries the traffic. They just cannot read or alter it.' },

    { kind: 'sequence', title: 'Setting up the tunnel',
      body: 'Before any HTTP is sent, the two ends spend a moment setting up. The full step-by-step is in the Security world; this is the outline.',
      actors: ['Browser', 'Server'],
      steps: [
        { from: 0, to: 1, label: 'Hello: here is what I support', note: 'The browser opens the conversation and lists the security methods it knows.' },
        { from: 1, to: 0, label: 'Hello + my certificate', dashed: true, note: 'The server picks one and sends its **certificate**: its ID card, vouching for its name.' },
        { at: 0, label: 'checks the certificate', note: 'Is it for the right name? Not expired? Signed by an authority the browser trusts? If any answer is no, the browser shows a scary warning.' },
        { note: 'Both ends now work out a **shared secret key** that nobody watching could have learned, even though they saw the whole exchange.' },
        { from: 0, to: 1, label: 'GET /account (encrypted)', note: 'Now the normal HTTP request travels, scrambled with that key.' },
        { from: 1, to: 0, label: '200 OK + page (encrypted)', dashed: true, note: 'And the response comes back the same way. HTTP itself is unchanged.' }
      ] },

    { kind: 'concept', title: 'Certificates: the website’s ID card',
      body: `Encryption alone is not enough. If you set up a perfectly secret tunnel to a *fraudster*, you have a private chat with a fraudster. You also need to know **who is at the other end**.

        That is what a **certificate** is for: a digital ID card that says "this key belongs to \`bank.example\`". It is issued, and signed, by a **certificate authority** (CA), an organisation your browser and operating system already trust.

        Think of a passport: you trust it because you trust the government that issued it, not because you know the holder.

        Your device ships with a list of trusted authorities. A site whose certificate chains back to one of them gets the padlock. How that checking works is a later lesson.` },

    { kind: 'compare', title: 'What HTTPS hides, and what it does not',
      body: 'HTTPS is powerful, but it is not invisibility. An observer on the path still learns some things.',
      cols: ['Hidden from observers', 'Still visible to observers'],
      rows: [
        ['Which page', 'The path and query, like `/health/symptoms?q=…`', 'The server’s IP address'],
        ['Which site', 'Headers and cookies', 'The domain name in most cases'],
        ['The content', 'Page contents, form data and passwords', 'Roughly how much data moved, and when']
      ],
      note: 'The domain usually leaks through the DNS lookup and the start of the TLS set-up. Newer techniques can hide more, but do not count on them being in use.' },

    { kind: 'pitfall', title: 'The padlock is not a trust badge',
      body: `The padlock means **the connection is private and the site's identity matches the name in the address bar**. That is all.

        It does *not* mean the site is honest. A criminal can register \`my-bank-login.example\`, obtain a perfectly valid certificate for it, and show a padlock. It is a secure line to a scammer.

        It also does not protect you from the site itself (which can see everything you send it), or from malware already on your own device.

        So: **check the domain name**, not just the padlock. HTTPS protects the road, not the destination.` },

    { kind: 'code', title: 'Forcing HTTPS: redirects and HSTS',
      body: 'Sites still get plain `http://` requests, from old links and typed addresses. So they redirect, and then tell the browser never to try again. **Tap the lines.**',
      code: { lang: 'http', src: `
        GET / HTTP/1.1
        Host: shop.example

        HTTP/1.1 301 Moved Permanently
        Location: https://shop.example/

        HTTP/1.1 200 OK
        Strict-Transport-Security: max-age=31536000`,
        notes: {
          1: 'The browser tries plain HTTP. This very first request is unprotected.',
          4: 'The server answers with a **permanent redirect**...',
          5: '...to the HTTPS version. Everything from here on is encrypted.',
          8: '**HSTS** (HTTP Strict Transport Security): "for the next 31,536,000 seconds (about a year), only ever use HTTPS for this site." The browser remembers, and skips the unprotected request next time. It closes the gap where an attacker could meddle with the first plain request.'
        } } }
  ],

  activities: [
    { type: 'match', after: 2, prompt: 'Match each security idea to what it means.',
      pairs: [['Eavesdropping', 'Someone reads your traffic on its way'], ['Tampering', 'Someone alters the data before it arrives'], ['Impersonation', 'Someone pretends to be the real site'], ['Encryption', 'Scrambling data so only the two ends can read it'], ['Certificate', 'A signed ID card vouching for a site’s name']] },

    { type: 'multi', after: 6, q: 'When your browser examines a site’s certificate, which of these does it check?',
      options: ['The certificate matches the domain name you asked for', 'It is signed by an authority the browser trusts', 'It has not expired', 'The owner of the site is an honest business', 'The server is physically in your country'],
      answers: [0, 1, 2],
      explain: 'The browser checks name, issuer and dates. It cannot judge honesty or location, which is why a padlock proves a private line to the named site and nothing more.' },

    { type: 'tf', after: 7, statement: 'Because of HTTPS, someone on the same café Wi-Fi cannot tell which website you are visiting.', answer: false,
      explain: 'They cannot read the content, but they can usually still see the server’s IP address and, in most cases, the domain name, plus timing and rough size. HTTPS hides what is said, not who is being talked to.' },

    { type: 'bucket', prompt: 'On an HTTPS connection, what can a Wi-Fi snooper see?', buckets: ['Hidden', 'Still visible'],
      items: [['The password typed into a form', 0], ['The path, such as `/account/loans`', 0], ['The contents of your cookies', 0], ['The IP address of the server', 1], ['The domain name, in most cases', 1], ['When you connected and roughly how much data moved', 1]],
      explain: 'Everything inside the encrypted HTTP message is hidden. The outside details needed to deliver it are not: where it is going, when and how big.' },

    { type: 'spot', prompt: 'This login form has a serious flaw. Tap the line.',
      code: { lang: 'html', src: `
        <form method="POST"
              action="http://shop.example/login">
          <input name="email">
          <input name="password" type="password">
        </form>` },
      lines: [2],
      explain: 'The form submits to a plain `http://` address, so the password travels as readable text. It should post to `https://`. Putting the form on an HTTPS page is not enough on its own: the destination matters too.' },

    { type: 'ab', q: 'A visitor types `http://shop.example` into their browser. Which server behaviour is better?',
      a: { lang: 'http', label: 'Redirect and remember', src: `
        HTTP/1.1 301 Moved Permanently
        Location: https://shop.example/

        (later) Strict-Transport-Security:
          max-age=31536000` },
      b: { lang: 'http', label: 'Serve both', src: `
        HTTP/1.1 200 OK
        (the same page, over plain HTTP,
         exactly as asked)` },
      answer: 'a',
      explain: 'Redirecting sends the visitor to the protected version, and HSTS tells the browser to skip the plain request from then on. Serving the page over plain HTTP leaves the visitor open to snooping and tampering.' },

    { type: 'order', prompt: 'Put a first visit to a site that uses redirect and HSTS in order.',
      items: ['The browser requests `http://shop.example`', 'The server replies with a 301 pointing to the HTTPS address', 'The browser sets up TLS and checks the certificate', 'The request is sent again, encrypted', 'The response includes a Strict-Transport-Security header', 'Later visits go straight to HTTPS'],
      explain: 'The redirect comes first, then the secure tunnel is built, then HTTP flows inside it. The HSTS header, delivered over the secure connection, removes the plain first step next time.' },

    { type: 'short', q: 'Which response header tells a browser to use only HTTPS for a site from now on? (Give the full header name or its initials.)', accept: ['Strict-Transport-Security', 'HSTS'], hint: 'Its initials are four letters long.',
      explain: '`Strict-Transport-Security` (HSTS) makes the browser upgrade every future request to HTTPS for the stated number of seconds.' },

    { type: 'explain', prompt: 'A friend says: "The site has a padlock, so it must be safe." Explain what the padlock does and does not tell you.',
      model: 'The padlock means the connection is encrypted and the site proved it owns the name in the address bar, so people on the way cannot read or change what is sent. It does not mean the site is honest: scammers can get certificates for lookalike names, and the site itself can see everything you send. Check the domain, not only the padlock.',
      keywords: ['encrypted', 'identity', 'domain', 'honest', 'scam', 'certificate'] }
  ],

  flashcards: [
    { q: 'What three things does HTTPS protect against?', a: 'Eavesdropping (reading), tampering (altering) and impersonation (pretending to be the site).' },
    { q: 'What does a certificate do?', a: 'It vouches that a public key belongs to a particular domain, signed by a certificate authority the browser trusts.' },
    { q: 'What can an observer still see on an HTTPS connection?', a: 'The server’s IP address, usually the domain name, and the timing and rough size of the traffic. Not the path, headers, cookies or body.' },
    { q: 'What does the padlock actually guarantee?', a: 'A private connection to the site named in the address bar. Not that the site is trustworthy.' },
    { q: 'What is HSTS for?', a: 'The `Strict-Transport-Security` header tells the browser to use only HTTPS for that site for a set time, avoiding the unprotected first request.' }
  ],

  glossary: [
    { term: 'HTTPS', def: 'HTTP carried inside a TLS-encrypted connection, usually on port 443. Same messages, protected in transit.', like: 'A sealed, tamper-evident envelope instead of a postcard.' },
    { term: 'Encryption', def: 'Scrambling data with a key so that only someone holding the right key can read it.', like: 'A lock that only the recipient has the key to.' },
    { term: 'Certificate', def: 'A signed digital document that ties a website’s name to its key, proving who the server is.', like: 'A passport for a website.' },
    { term: 'Certificate authority', def: 'An organisation trusted by browsers and operating systems to issue and sign certificates after checking the requester controls the domain.', aka: ['CA'], like: 'The passport office.' },
    { term: 'Man-in-the-middle', def: 'An attacker who sits between two parties and reads or alters their messages, sometimes pretending to be each one.', like: 'A postman who opens your letters and reseals them.', aka: ['MITM'] },
    { term: 'HSTS', def: 'HTTP Strict Transport Security: a response header telling the browser to use only HTTPS for a site for a stated period.', like: 'Telling the doorman "never let me in through the unlocked side door again".' }
  ],

  takeaways: [
    'Plain HTTP is a postcard: readable, alterable and easy to fake.',
    'HTTPS gives **secrecy, integrity and identity** using TLS and certificates.',
    'An observer still sees the IP, usually the domain, and the timing and size.',
    'A padlock means a private line to the named site, **not** an honest site. Redirect to HTTPS and add HSTS.'
  ],

  links: [
    { label: 'MDN: Transport Layer Security', url: 'https://developer.mozilla.org/en-US/docs/Web/Security/Transport_Layer_Security' },
    { label: 'MDN: Strict-Transport-Security', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('http', {
  title: 'The Protocol Dragon',
  intro: 'A dragon sleeps on a hoard of raw HTTP messages and guards them with riddles. Beat it by reading requests, choosing the right codes and knowing exactly what the padlock does.',
  questions: [
    { type: 'mcq', q: 'Which part of `https://shop.example/cart?item=7#top` is never sent to the server?',
      options: ['`#top`, the fragment', '`?item=7`, the query string', '`/cart`, the path', '`shop.example`, the host'],
      answer: 0,
      why: [null, 'The query string is sent with the request line.', 'The path is the core of the request line.', 'The host is sent in the Host header and used to find the server.'],
      explain: 'The fragment points at a spot inside the page, so the browser keeps it to itself. Everything else is needed by the server.' },

    { type: 'tf', statement: 'Two requests sent down the same keep-alive connection share state, so the server knows the second comes from the same person.', answer: false,
      explain: 'Keep-alive only saves the cost of reconnecting. HTTP stays stateless: recognising someone needs something sent with each request, such as a cookie.' },

    { type: 'short', q: 'A logged-in customer opens an admin page and is refused. Which status code should the server send?', accept: ['403'], hint: 'Known user, not allowed.',
      explain: '`403 Forbidden`: the server knows who you are and says no. A `401` is for callers it cannot identify at all.' },

    { type: 'mcq', q: 'A gateway waits 60 seconds for an app server that never answers, then gives up and replies to the user. Which code fits best?',
      options: ['`504 Gateway Timeout`', '`502 Bad Gateway`', '`503 Service Unavailable`', '`400 Bad Request`'],
      answer: 0,
      why: [null, '502 means it got an invalid reply or the connection failed. Here nothing came back in time.', '503 is the server saying it is overloaded or in maintenance.', 'The request was fine. 4xx codes blame the client.'],
      explain: 'The gateway reached out and ran out of patience, which is exactly a gateway timeout. 502 is a bad answer; 503 is "unavailable right now".' },

    { type: 'multi', q: 'A phone app loses signal mid-request and retries automatically. Which requests are safe to retry without any extra protection?',
      options: ['`GET /orders/9`', '`PUT /users/5` with the full user', '`DELETE /photos/3`', '`POST /payments`', '`PATCH /counter` with "add 1"'],
      answers: [0, 1, 2],
      explain: 'GET, PUT and DELETE are idempotent: repeating them leaves the same end state. A repeated POST can charge twice, and "add 1" repeated adds twice.' },

    { type: 'spot', prompt: 'A user’s card is declined. Tap the line where this API response goes wrong.',
      code: { lang: 'http', src: `
        HTTP/1.1 200 OK
        Content-Type: application/json

        {"status": "error", "message": "Card declined"}` },
      lines: [1],
      explain: 'The status line says success while the body says failure. Caches, monitoring and retry logic read the status code, so this failure looks like a success. A 4xx such as `402` or `422`, or at least a clear 4xx, tells the truth.' },

    { type: 'order', prompt: 'Put what happens when you open `https://shop.example` in order.',
      items: ['The browser looks up the server’s IP address with DNS', 'The browser opens a TCP connection', 'TLS sets up encryption and the certificate is checked', 'The HTTP request is sent, encrypted', 'The server sends back a response with a status code'],
      explain: 'You need an address to connect to, a connection to secure, a secure channel before the request goes out, and only then can the response come back.' },

    { type: 'bucket', prompt: 'Which side sends this header: the client or the server?', buckets: ['Client sends (request)', 'Server sends (response)'],
      items: [['`Cookie`', 0], ['`Accept`', 0], ['`Authorization`', 0], ['`Set-Cookie`', 1], ['`Location` on a redirect', 1], ['`Strict-Transport-Security`', 1]],
      explain: 'Clients describe themselves and their wishes (who they are, which formats they accept). Servers describe the reply and give instructions such as "store this", "go there" and "only use HTTPS".' },

    { type: 'match', prompt: 'Match each item to what it does.',
      pairs: [['304 Not Modified', 'Your saved copy is still current'], ['HttpOnly', 'Hides a cookie from page JavaScript'], ['429', 'Slow down: rate limit reached'], ['HSTS', 'Browser must use HTTPS for this site'], ['Multiplexing', 'Many streams sharing one connection']] },

    { type: 'ab', q: 'Which design is better for deleting a user?',
      a: { lang: 'http', label: 'DELETE the thing', src: `
        DELETE /users/42 HTTP/1.1` },
      b: { lang: 'http', label: 'GET with a verb', src: `
        GET /users/42/delete HTTP/1.1` },
      answer: 'a',
      explain: 'GET must be safe. Crawlers, caches and browser pre-loading assume it only reads, so a GET that deletes will eventually be triggered by something that never meant to. DELETE says what it does, and is idempotent.' },

    { type: 'cloze', text: 'HTTP/2 multiplexes many {{streams}} over one {{TCP}} connection, while HTTP/3 runs over {{QUIC}}, which is built on {{UDP}}.',
      distractors: ['cookies', 'DNS', 'FTP'],
      explain: 'HTTP/2 shares one TCP connection between streams. HTTP/3 moves to QUIC on UDP so a lost packet delays only its own stream.' },

    { type: 'mcq', q: 'You are on café Wi-Fi visiting an HTTPS site. A snooper is watching all your traffic. What can they NOT see?',
      options: ['The full path and the data you send, such as `/account/loans`', 'The IP address of the server you are talking to', 'The domain name, in most cases', 'Roughly when you connected and how much data moved'],
      answer: 0,
      why: [null, 'The IP address is needed to deliver the traffic, so the network sees it.', 'The domain name is usually exposed by the lookup and the start of the TLS set-up.', 'Timing and size are visible from outside any encrypted tunnel.'],
      explain: 'HTTPS encrypts the whole HTTP message: path, headers, cookies and body. Only the outside details needed for delivery stay visible.' }
  ]
});

KS.sheet('http', {
  title: 'HTTP & HTTPS: cheat sheet',
  sections: [
    { title: 'Anatomy of a message',
      md: `**URL:** \`https://shop.example.com:443/cart?item=7#top\` = scheme, host, port, path, query, fragment (the fragment never leaves the browser).

        | Request | Response |
        |---|---|
        | Request line: \`GET /cart HTTP/1.1\` | Status line: \`HTTP/1.1 200 OK\` |
        | Headers: \`Name: value\` | Headers |
        | Blank line | Blank line |
        | Optional body | Body (HTML, JSON, image...) |

        HTTP is **stateless**: each request stands alone. See it with the Network tab (F12) or \`curl -v\`.` },

    { title: 'Methods',
      md: `| Method | Means | Safe | Idempotent |
        |---|---|---|---|
        | GET | Read | Yes | Yes |
        | HEAD | Headers only | Yes | Yes |
        | OPTIONS | What is allowed? | Yes | Yes |
        | POST | Create / trigger | No | No |
        | PUT | Replace whole thing | No | Yes |
        | PATCH | Change part | No | Depends |
        | DELETE | Remove | No | Yes |

        **Safe** = read-only. **Idempotent** = repeating is harmless. Retry POST only with an **idempotency key**.` },

    { title: 'Status codes',
      md: `**1xx** hold on, **2xx** worked, **3xx** go elsewhere, **4xx** your fault, **5xx** our fault.

        | Code | Meaning |
        |---|---|
        | 200 / 201 / 204 | OK / created / OK, no body |
        | 301 / 304 | Moved for good / use your copy |
        | 400 / 422 | Unreadable / bad values |
        | **401** / **403** | Who are you? / known, not allowed |
        | 404 / 409 / 429 | Not there / clash / slow down |
        | 500 | Bug in the server |
        | 502 / 503 / 504 | Bad reply / unavailable / timed out |` },

    { title: 'Headers and cookies',
      md: `| Header | Use |
        |---|---|
        | Host | Which site |
        | Accept | Formats I can take |
        | Content-Type | Format of this body |
        | Authorization | Credentials |
        | Cache-Control, ETag | Caching |
        | Cookie / Set-Cookie | Return / store a cookie |
        | Location | Redirect target |

        **Cookie attributes:** \`HttpOnly\` (no JavaScript access), \`Secure\` (HTTPS only), \`SameSite\` (limits cross-site sending), \`Max-Age\` (lifetime). Store an **ID**, never the data.` },

    { title: 'HTTP versions',
      md: `| | 1.1 | 2 | 3 |
        |---|---|---|---|
        | Over | TCP | TCP | QUIC on UDP |
        | Format | Text | Binary | Binary |
        | Concurrency | One at a time per connection | Many streams on one connection | Many streams, independent |
        | Headers | Repeated in full | Compressed | Compressed |

        **Keep-alive** reuses connections. **Head-of-line blocking:** one slow item stalls the queue. Methods, codes and headers mean the same in all three. A newer version will not fix a slow server.` },

    { title: 'HTTPS',
      md: `HTTPS = HTTP inside **TLS**, normally on port 443. It gives:

        - **Secrecy** against eavesdropping
        - **Integrity** against tampering
        - **Identity** against impersonation, via a **certificate** signed by a trusted authority

        **Hidden:** path, headers, cookies, body. **Visible:** server IP, usually the domain, timing and size.

        The padlock means a private line to the named site, **not** an honest one. Redirect with \`301\` to HTTPS, then add \`Strict-Transport-Security: max-age=31536000\` (HSTS).` }
  ]
});

