/* Module: authn — Authentication.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs authn */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('au-basics', {
  eli5: 'Authentication is proving who you are (like showing your passport); authorization is the separate question of what you are then allowed to do (like which rooms your key card opens).',

  cards: [
    { kind: 'concept', title: 'Two questions every system asks',
      body: `You send a request to a server: *"show me the invoices."* Before it answers, the server has to settle two different questions, in this order:

        1. **Who are you?** This is **authentication**. The server needs to know which user (or program) is knocking.
        2. **What are you allowed to do?** This is **authorization**. Now that it knows you are Priya, may Priya see *these* invoices?

        People mix these up constantly, and many real security bugs live in the gap between them. This module is all about question one. The next module is entirely about question two.` },

    { kind: 'metaphor', title: 'The hotel',
      body: `You arrive at a hotel. At reception you show your passport and the booking is found: **you have been authenticated**. Reception hands you a key card.

        That card opens your room, the gym and the lift. It does *not* open room 412, the staff office or the safe. The card is **authorization**: a list of what you may do, attached to who you were proven to be.

        Notice the order. Nobody programs a key card until someone has checked a passport. And a perfectly genuine passport does not get you into the safe.

        Where the metaphor stops: hotels check you once. Servers have to check you again on *every request*, because HTTP has no memory.` },

    { kind: 'compare', title: 'Authentication vs authorization',
      body: 'Keep this table in your head. You will use it for the rest of the course.',
      cols: ['Authentication', 'Authorization'],
      rows: [
        ['The question', 'Who are you?', 'What may you do?'],
        ['Hotel version', 'Showing your passport', 'What your key card opens'],
        ['Happens', 'First, once per login or request', 'After, on every action'],
        ['Fails with', '`401` (really "unauthenticated")', '`403 Forbidden`'],
        ['Examples', 'Password, passkey, SMS code', 'Roles, permissions, ownership']
      ] },

    { kind: 'concept', title: 'Identity, credentials and factors',
      body: `Three words that sound alike but are not:

        - **Identity** is the *claim*: "I am priya@example.com".
        - A **credential** is the *proof* offered for that claim: a password, a code, a fingerprint, a cryptographic key.
        - A **factor** is the *kind* of proof. There are three kinds: something you **know** (a password), something you **have** (your phone), something you **are** (a face or fingerprint).

        Anyone can *type* an identity. Authentication is the server deciding whether the credential really backs it up. Using more than one factor together is called multi-factor authentication, and it gets a whole lesson later.` },

    { kind: 'sequence', title: 'The life of a login',
      body: 'Here is what actually happens when you sign in to a website. Step through it.',
      actors: ['Browser', 'Server', 'Database'],
      steps: [
        { from: 0, to: 1, label: 'POST /login  {email, password}', note: 'You type your details and press **Sign in**. The browser sends them (over HTTPS, as you saw in the TLS lessons).' },
        { from: 1, to: 2, label: 'find user by email', note: 'The server looks the user up. It never stored your password itself, only a hash of it (see *Storing Passwords Safely*).' },
        { from: 2, to: 1, label: 'user + stored hash', dashed: true, note: 'The database returns the saved record.' },
        { at: 1, label: 'hash(password) == stored hash?', note: 'The server hashes what you typed and compares. A match means the credential is good: **you are authenticated**.' },
        { from: 1, to: 0, label: 'proof to carry (cookie or token)', dashed: true, note: 'The server cannot ask for your password on every click, so it hands you a small piece of proof of the login.' },
        { from: 0, to: 1, label: 'GET /invoices  + the proof', note: 'Every later request carries that proof. The server recognises it and knows who you are, without the password again.' }
      ] },

    { kind: 'compare', title: 'Two ways to be remembered',
      body: 'That "proof to carry" comes in two broad styles. You will spend the next four lessons on them, so here is the preview.',
      cols: ['Sessions', 'Tokens'],
      rows: [
        ['Who remembers you?', 'The **server** keeps a record', 'The **client** carries the proof'],
        ['What you hold', 'A random ID, meaningless alone', 'A token that can prove itself'],
        ['Logging someone out', 'Delete the record', 'Harder: wait for expiry'],
        ['Metaphor', 'Cloakroom ticket', 'Festival wristband']
      ],
      note: 'Neither is "the right one". Choosing between them is the last lesson of the module.' },

    { kind: 'concept', title: 'Three bits of vocabulary',
      body: `You will see these words in every auth document, so let us name them now.

        - A **principal** is whoever is making the request once identified: a human user, or a program such as a billing service. Auth systems say "principal" because it is not always a person.
        - A **claim** is one statement about the principal: "email is priya@example.com", "is an admin", "logged in at 09:14". Later you will see tokens that are literally bundles of claims.
        - An **identity provider** (IdP) is a service whose job is to log people in and vouch for them, so other apps do not have to. "Sign in with Google" means Google is the identity provider.` },

    { kind: 'pitfall', title: 'Logged in does not mean allowed',
      body: `Here is the classic bug. A shop's order page lives at \`/orders/101\`. You log in, open your order, and change the URL to \`/orders/102\`. Up comes a stranger's order, address and all.

        The server did its authentication job perfectly: it knew exactly who you were. It simply never asked the second question, *"is this order yours?"*

        Remember the two status codes: \`401\` means "I do not know who you are", \`403\` means "I know exactly who you are, and no".

        The fix lives in authorization, which is the whole of the next module.`,
      note: 'Broken access control is, at the time of writing, at the top of the OWASP list of web security risks. You will meet it again.' },

    { kind: 'layers', title: 'The map of this module',
      body: 'Each lesson sits on the one below it. Read from the bottom up.',
      layers: [
        { label: 'Authorization (next module)', note: 'What may this principal do?', tone: 'accent', icon: '🔑' },
        { label: 'Single sign-on: OAuth, OIDC, SAML', note: 'Letting one login be trusted by many apps', tone: 'info', icon: '🤝' },
        { label: 'Sessions, tokens and JWTs', note: 'Staying logged in without sending the password each time', tone: 'info', icon: '🎟️' },
        { label: 'Basic auth', note: 'The simplest scheme: send the password every time', icon: '🔤' },
        { label: 'Passwords, MFA and passkeys', note: 'The proof itself', tone: 'good', icon: '🪪' }
      ] }
  ],

  activities: [
    { type: 'bucket', after: 2, prompt: 'Which question is each of these answering?', buckets: ['Authentication', 'Authorization'],
      items: [['Is this really Priya?', 0], ['May Priya delete this invoice?', 1], ['Does the password match the stored hash?', 0], ['Is this user an admin?', 1], ['Is the fingerprint a match?', 0], ['Does this user own order 102?', 1]],
      explain: 'Authentication is about identity: proving who. Authorization is about permission: deciding what that identity may do. Notice that "is an admin" is a fact you look up *after* you know who someone is.' },

    { type: 'mcq', after: 3, q: 'Which of these is a **credential**?',
      options: ['A fingerprint scan offered to unlock an account', 'The email address typed into the login box', 'The "Admin" role stored on a user record', 'The `403` status code'],
      answer: 0,
      why: [null, 'The email address is the identity claim; it proves nothing by itself.', 'A role is a permission, which is authorization, not proof of who you are.', 'A status code is the server’s answer, not something you offer.'],
      explain: 'A credential is proof offered to back up an identity claim: a password, a code, a fingerprint, a key. The email says *who you claim to be*; the credential is what convinces the server.' },

    { type: 'order', after: 4, prompt: 'Put the steps of a login in order.',
      items: ['The browser sends the email and password', 'The server finds the user and their stored hash', 'The server hashes the typed password and compares', 'The server hands back proof of the login', 'Later requests carry that proof'],
      explain: 'The server cannot compare anything until it has found the stored hash, and it only issues proof once the comparison succeeds. Later requests reuse the proof so the password is not sent again.' },

    { type: 'tf', statement: 'A `403 Forbidden` response means the server does not know who you are.', answer: false,
      explain: 'That is `401`. With a `403` the server knows who you are and has decided you are not allowed. The two codes line up with authentication and authorization.' },

    { type: 'match', prompt: 'Match each word to its meaning.',
      pairs: [['Principal', 'Whoever is making the request: a user or a program'], ['Claim', 'One statement about a principal, such as their email'], ['Credential', 'The proof offered for an identity'], ['Identity provider', 'A service that logs people in and vouches for them'], ['Factor', 'A kind of proof: know, have or are']],
      explain: 'These five words come up in every later lesson. If one feels fuzzy, flip back to the vocabulary card.' },

    { type: 'short', q: 'Which HTTP status code means "I do not know who you are" (despite its official name, "Unauthorized")?', accept: ['401'], hint: 'Three digits, starts with 4.',
      explain: '`401` is really about authentication. Its official name is unfortunate: it should have been called "Unauthenticated". Being known but refused is `403`.' },

    { type: 'scenario', title: 'The curious customer', intro: 'You run a small online shop. A customer emails: *"I changed the number at the end of my order link and saw someone else\'s order."* Your team lead looks at you.',
      meters: { 'customer trust': 60, 'data safety': 50 },
      steps: [
        { text: 'First: what kind of bug is this, authentication or authorization?',
          choices: [
            { label: 'Authorization: the server knew who they were but did not check that the order was theirs', score: 2, effects: { 'data safety': 10 }, feedback: 'Exactly. The login worked fine. The missing piece is the ownership check on every order lookup.' },
            { label: 'Authentication: the login must be broken', score: 0, effects: { 'data safety': -15, 'customer trust': -10 }, feedback: 'The customer *was* correctly logged in as themselves. Rewriting the login would take weeks and leave this hole wide open.' },
            { label: 'Neither: they are just guessing numbers, so it is their fault', score: 0, effects: { 'customer trust': -20, 'data safety': -20 }, feedback: 'Guessing a URL should never reveal someone else’s data. This is the server’s bug, whatever the customer did.' }
          ] },
        { text: 'The order page is only reached by logged-in users. What should the server do when you ask for an order that belongs to someone else?',
          choices: [
            { label: 'Refuse with a 403 (or a 404, to avoid confirming the order exists)', score: 2, effects: { 'data safety': 25 }, feedback: 'Right. Many systems choose 404 so that attackers cannot even learn which order numbers exist.' },
            { label: 'Return a 401 and ask them to log in again', score: 1, effects: { 'data safety': 10 }, feedback: 'It blocks the leak, but 401 means "unknown user". Logging in again will not help and will confuse the customer.' },
            { label: 'Show the order but hide the address', score: 0, effects: { 'data safety': -10, 'customer trust': -10 }, feedback: 'Half a leak is still a leak. Order contents are personal data too.' }
          ] },
        { text: 'Last: where should the "is this order yours?" check live?',
          choices: [
            { label: 'On the server, on every request that returns an order', score: 2, effects: { 'data safety': 15, 'customer trust': 15 }, feedback: 'The server is the only part you control. A check that only exists in the browser can be skipped by anyone.' },
            { label: 'In the browser: hide the links to other people’s orders', score: 0, effects: { 'data safety': -20 }, feedback: 'Hiding a link is not a lock. Anyone can type the address by hand.' },
            { label: 'Only on the orders list page, not the detail page', score: 1, effects: { 'data safety': -5, 'customer trust': 5 }, feedback: 'The detail page is exactly where the bug was. Check wherever the data is actually returned.' }
          ] }
      ],
      outro: 'The pattern: **authentication tells you who; authorization is checked separately, on the server, every time.**' },

    { type: 'explain', prompt: 'Explain the difference between authentication and authorization to a friend, using any everyday example.',
      model: 'Authentication is proving who you are, like showing a passport at a hotel desk. Authorization is what you are allowed to do once they know that, like the key card that opens your room but not anyone else’s. You need both, in that order, and passing the first does not give you the second.',
      keywords: ['who you are', 'allowed', 'prove', 'permission', 'identity', 'order'] }
  ],

  flashcards: [
    { q: 'Authentication vs authorization in one line each?', a: 'Authentication: proving who you are. Authorization: deciding what you are allowed to do.' },
    { q: 'What is the difference between `401` and `403`?', a: '`401` means the server does not know who you are (unauthenticated). `403` means it knows, and you are not allowed.' },
    { q: 'What are the three kinds of authentication factor?', a: 'Something you know (password), something you have (phone or key), something you are (fingerprint or face).' },
    { q: 'What is a principal?', a: 'Whoever is making a request once identified: a human user or a program.' },
    { q: 'Why do clients carry "proof" after logging in?', a: 'The server cannot ask for the password on every request, so it issues a session ID or token that stands in for the login.' }
  ],

  glossary: [
    { term: 'Authentication', def: 'Proving who you are to a system.', like: 'Showing your passport at hotel reception.', aka: ['AuthN'] },
    { term: 'Authorization', def: 'Deciding what an already-identified user or program may do.', like: 'The key card that opens your room but not the safe.', aka: ['AuthZ'] },
    { term: 'Credential', def: 'The proof offered for an identity claim: a password, a code, a fingerprint, a key.', like: 'The passport itself.' },
    { term: 'Principal', def: 'Whoever is making a request once identified: a person or a program.', like: 'The "guest" on a hotel booking, whether a person or a company.' },
    { term: 'Claim', def: 'A single statement about a principal, such as "email is priya@example.com" or "is an admin".', like: 'One line printed on a name badge.' },
    { term: 'Identity provider', def: 'A service whose job is to log users in and vouch for them to other apps.', like: 'The passport office, rather than every shop checking your birth certificate.', aka: ['IdP'] }
  ],

  takeaways: [
    '**Authentication** = who are you? **Authorization** = what may you do? Always in that order.',
    'A credential is the proof; the factor is the kind of proof (know, have, are).',
    'After login the client carries proof (session ID or token) so the password is not sent every time.',
    '`401` = unknown, `403` = known but not allowed. Being logged in never means being allowed.'
  ],

  links: [
    { label: 'MDN: HTTP authentication', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Authentication' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('au-basic', {
  eli5: 'Basic authentication is the simplest way to log in over HTTP: you attach your username and password to every single request, lightly scrambled but not secret, so it is only safe inside HTTPS.',

  cards: [
    { kind: 'concept', title: 'The simplest login on the web',
      body: `Imagine an office with no ID badges. Every time you walk through any door, you say your name and your password out loud to the guard.

        It is tedious, but there is nothing to set up and nothing to remember.

        That is **Basic authentication**, built into HTTP itself. There is no login page, no cookie and no token. The client simply attaches the username and password to *every request*, and the server checks them every time.

        It is where HTTP security started, and it is still found in more places than you might expect.` },

    { kind: 'sequence', title: 'The Basic auth conversation',
      body: 'Browsers know this dance by heart. Step through it.',
      actors: ['User', 'Browser', 'Server'],
      steps: [
        { from: 1, to: 2, label: 'GET /reports', note: 'The browser asks for a page. It has no credentials yet.' },
        { from: 2, to: 1, label: '401 + WWW-Authenticate: Basic', dashed: true, note: 'The server answers "who are you?" and names the scheme it accepts. The `realm` names the protected area.' },
        { from: 1, to: 0, label: 'pop-up: username / password?', dashed: true, note: 'The browser shows its own plain login box.' },
        { from: 0, to: 1, label: 'alice / hunter2', note: 'You type your details.' },
        { from: 1, to: 2, label: 'GET /reports + Authorization: Basic …', note: 'The browser retries, with the credentials attached in a header.' },
        { from: 2, to: 1, label: '200 OK', dashed: true, note: 'The server checks them and replies. From now on the browser adds the header to **every** request to that site, without asking again.' }
      ] },

    { kind: 'code', title: 'What the header actually contains',
      body: 'The header is `Basic`, a space, then the username and password joined by a colon and run through **Base64**. Tap the lines.',
      code: { lang: 'http', src: `
        GET /reports HTTP/1.1
        Host: internal.example.com
        Authorization: Basic YWxpY2U6aHVudGVyMg==`,
        notes: {
          3: '`YWxpY2U6aHVudGVyMg==` is just `alice:hunter2` written in Base64. A colon separates the two halves, which is why a username may not contain a colon.',
          1: 'The header goes on every request, including images and stylesheets.'
        } } },

    { kind: 'code', title: 'Base64 is not encryption',
      body: `Base64 is a way of writing any bytes using only safe printable letters and digits. It exists so odd characters survive inside a header. It involves **no key and no secret**, so anyone can reverse it in one line:`,
      code: { lang: 'js', src: `
        const header = 'YWxpY2U6aHVudGVyMg==';
        const plain = Buffer.from(header, 'base64').toString();
        console.log(plain);   // "alice:hunter2"`,
        notes: {
          2: 'No password and no key. Decoding is a built-in function.',
          3: 'The username **and the password**, in plain sight.'
        } },
      note: 'Encoding changes the *shape* of data so it travels safely. Encryption hides its *meaning* from anyone without a key. Base64 is only the first.' },

    { kind: 'metaphor', title: 'A postcard, posted every time',
      body: `Sending Basic auth over plain HTTP is like writing your password on a **postcard** and posting it. Every postal worker, every sorting office and anyone standing near the postbox can read it.

        Worse, you post a fresh postcard with every request, so there are hundreds of chances to intercept it.

        **HTTPS is the sealed envelope.** The TLS you learned about earlier wraps the whole request, headers included, so the header is unreadable on the wire.

        Where the metaphor stops: even in the envelope, the server at the far end opens it and reads the password *every time*. Which brings us to the costs.` },

    { kind: 'concept', title: 'Why HTTPS is not optional',
      body: `The rule has no exceptions: **Basic auth must only ever travel over HTTPS.** Without it, anyone on the same Wi-Fi, or any router along the route, can copy the header and decode it in seconds.

        Even with HTTPS, Basic auth has weaknesses by design:

        - The real password is sent on **every** request, so there are far more chances for it to leak into a log, a proxy or a crash report.
        - There is **no logout**. The browser keeps sending the credentials until it is closed.
        - There is no built-in second factor, and no lock-out or expiry logic.

        This is the cost of simplicity.` },

    { kind: 'concept', title: 'The hidden cost: checking the password every time',
      body: `Remember from *Storing Passwords Safely* that good password hashes are **deliberately slow**, so that attackers cannot guess billions of passwords a second.

        With Basic auth, the server must run that slow hash on *every request*. A page that loads ten images triggers ten password checks.

        That is wasted work, and it makes it easy for a flood of requests to overload the server.

        Sessions and tokens avoid this: you pay for one slow check at login, and then each later request is verified cheaply. This is a big reason Basic auth is rare in user-facing apps.` },

    { kind: 'realworld', title: 'Where Basic auth is still fine',
      body: `Simple tools for simple jobs. Basic auth over HTTPS is common for:

        - **Internal tools**: a status page or admin panel for a small team
        - **Scripts and cron jobs** that call an API from a server
        - **Machine-to-machine calls** where the "password" is a long random value generated for that one program, not a human's password
        - Quick protection of a staging site before it launches

        The test: *no human logging in and out, HTTPS guaranteed, and the secret is long, random and revocable*. Some payment APIs even use Basic auth with an API key as the username, because it is so easy for every programming language to send.` },

    { kind: 'pitfall', title: 'Never put it in the URL',
      body: `You can write credentials into an address: \`https://alice:hunter2@internal.example.com/reports\`. Some old tutorials still show it.

        Do not. URLs are logged by servers, saved in browser history, shown on screen, pasted into chat and sent along in referrer headers. Your password would end up in all of those places.

        Credentials belong in the \`Authorization\` header, which software treats as sensitive and typically does not log.`,
      note: 'Rule of thumb: secrets go in headers or bodies, never in URLs.' },

    { kind: 'deep', title: 'A footnote: Digest authentication',
      body: `Basic's plain-text weakness inspired a sibling called **Digest authentication**. The server sends a one-off random value (a *nonce*); the client sends back a **hash** mixing the username, password and nonce, so the password itself never crosses the wire.

        It sounds neat, but it needed old, weak hashing choices and awkward storage on the server, and once HTTPS became universal the problem it solved mostly vanished.

        Today you will almost never choose it. It is worth knowing the name, and that "hash it with a nonce" was an early attempt at what modern schemes do better.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'You spot this in a request log: `Authorization: Basic YWxpY2U6aHVudGVyMg==`. What can you learn from it?',
      options: ['The username and password, because decoding Base64 needs no key', 'Nothing, because the value is encrypted', 'Only the username, since passwords are hashed first', 'Only that the user logged in successfully'],
      answer: 0,
      why: [null, 'Base64 is encoding, not encryption. There is nothing to break.', 'Basic auth sends the real password, not a hash of it.', 'The header carries the credentials, not a result.'],
      explain: 'The value decodes to `alice:hunter2` with no key at all. This is why the header must never be visible on the wire, and why it should not appear in logs either.' },

    { type: 'tf', after: 3, statement: 'Base64 hides the password from anyone who intercepts the request.', answer: false,
      explain: 'Base64 is only a way of writing bytes with printable characters. Anyone can decode it instantly. Only HTTPS (encryption) protects the header in transit.' },

    { type: 'cloze', after: 6, text: 'With Basic auth the server must check the password on {{every}} request, and because good password hashes are {{slow}}, this is wasteful.',
      distractors: ['first', 'fast', 'encrypted'],
      explain: 'Sessions and tokens pay the slow hash once at login, then use something cheap to verify afterwards.' },

    { type: 'short', q: 'Which request header carries Basic credentials?', accept: ['Authorization'], hint: 'It shares a name with the topic of the next module, with an extra letter or two.',
      explain: 'The `Authorization` header (the name is historical, since it actually carries authentication) holds `Basic ` followed by the Base64 text.' },

    { type: 'ab', q: 'Which request handles credentials more safely?',
      a: { lang: 'http', label: 'In the URL', src: `
        GET https://alice:hunter2@api.example.com/reports` },
      b: { lang: 'http', label: 'In the header', src: `
        GET /reports HTTP/1.1
        Host: api.example.com
        Authorization: Basic YWxpY2U6aHVudGVyMg==` },
      answer: 'b',
      explain: 'URLs get written to logs, browser history and referrer headers. Headers are treated as sensitive and are not normally logged. Both still require HTTPS.' },

    { type: 'spot', prompt: 'This script calls an internal API with Basic auth. Tap the line that makes it unsafe.',
      code: { lang: 'js', src: `
        const user = 'deploy-bot';
        const pass = process.env.API_PASS;
        const token = Buffer.from(user + ':' + pass).toString('base64');
        fetch('http://api.example.com/reports', {
          headers: { Authorization: 'Basic ' + token }
        });` },
      lines: [4],
      explain: 'The address starts with `http://`, so the header travels unencrypted and anyone on the path can decode the password. It must be `https://`. Reading the password from an environment variable, by the way, is fine.' },

    { type: 'bucket', prompt: 'Is Basic auth over HTTPS a reasonable choice here?', buckets: ['Reasonable', 'Look elsewhere'],
      items: [['A cron job calling an internal metrics endpoint with a generated secret', 0], ['A public social network with millions of users and a logout button', 1], ['A password-protected staging site shared by a small team', 0], ['A banking app that needs a second factor at login', 1], ['A script calling a partner API with a long random key', 0], ['A site where users must be logged out after 15 minutes idle', 1]],
      explain: 'Basic suits non-human callers and small trusted audiences. Anything with real users, logout, expiry or multiple factors needs sessions or tokens.' },

    { type: 'explain', prompt: 'A colleague says: "It is safe, the password is Base64-encoded." Explain what is wrong, and what actually protects it.',
      model: 'Base64 is just encoding. It needs no key, so anyone who sees the header can decode it straight back to the username and password. What protects it is HTTPS, which encrypts the whole request in transit. Even then, Basic auth sends the real password on every request, so it suits simple machine-to-machine or internal cases better than public logins.',
      keywords: ['encoding', 'not encryption', 'decode', 'HTTPS', 'every request', 'key'] }
  ],

  flashcards: [
    { q: 'What does a Basic auth header look like?', a: '`Authorization: Basic ` followed by Base64 of `username:password`.' },
    { q: 'Is Base64 encryption?', a: 'No. It is reversible with no key, so it hides nothing. HTTPS must protect the header.' },
    { q: 'Name two weaknesses of Basic auth even over HTTPS.', a: 'The real password is sent on every request, and there is no logout, expiry or built-in second factor.' },
    { q: 'Why is Basic auth costly for the server?', a: 'It must run the slow password hash on every request instead of once at login.' },
    { q: 'Where is Basic auth still a sensible choice?', a: 'Internal tools, scripts and machine-to-machine calls, over HTTPS, with long random generated secrets.' }
  ],

  glossary: [
    { term: 'Basic authentication', def: 'An HTTP scheme where the client sends `Authorization: Basic` plus Base64 of `username:password` on every request.', like: 'Saying your name and password to the guard at every door.' },
    { term: 'Base64', def: 'A way of writing any bytes using only printable letters, digits and a few symbols. It is encoding, not encryption.', like: 'Writing a message in a different alphabet: anyone who knows the alphabet reads it.' },
    { term: 'Realm', def: 'A label in the `WWW-Authenticate` header that names the protected area, shown in the browser’s login box.', like: 'The sign on a door: "Staff only".' },
    { term: 'Digest authentication', def: 'An older HTTP scheme in which the client sends a hash mixing the password with a server-supplied nonce instead of the password itself. Rarely used today.', like: 'Proving you know a secret without saying it aloud.' }
  ],

  takeaways: [
    'Basic auth sends `username:password` in a header on **every** request.',
    '**Base64 is encoding, not encryption**: anyone can reverse it. Only HTTPS protects it.',
    'It is simple and fine for internal tools and machine-to-machine calls, poor for user-facing apps.',
    'Never put credentials in a URL.'
  ],

  links: [
    { label: 'MDN: Authorization header', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('au-sessions', {
  eli5: 'A session is the server writing your login on a note and giving you a random ticket number in a cookie; every time you come back with the ticket, it looks up the note and knows who you are.',

  cards: [
    { kind: 'concept', title: 'The server forgets you instantly',
      body: `HTTP has no memory. Each request arrives like a stranger: the server answers it, then forgets it ever happened. So you log in, click "My account", and the server has no idea you just proved who you were two seconds ago.

        Basic auth solved this by sending the password every time. That is wasteful and risky.

        The classic better answer is a **session**: after a successful login, the **server remembers you**. It creates a record saying "this visitor is Priya, logged in at 09:14", and gives the browser a small, meaningless ticket that points to that record.

        The ticket travels with every request. The memory stays on the server.` },

    { kind: 'metaphor', title: 'The cloakroom ticket',
      body: `At a theatre you hand your coat to the cloakroom. They give you a numbered ticket. The ticket is not your coat and says nothing about you; it is just a **reference**. The coat stays behind the counter.

        Come back with the ticket, they find the coat. Lose the ticket and you are stuck. Hand your ticket to a stranger and *they* get your coat, so keep it safe.

        And if the theatre wants to get rid of your coat early, they simply take it off the rail; your ticket becomes worthless instantly.

        A session ID is exactly this: the ticket in your pocket, with your details on the server's rail.` },

    { kind: 'sequence', title: 'Logging in with a session',
      body: 'Watch the ticket being issued and then used.',
      actors: ['Browser', 'Server', 'Session store'],
      steps: [
        { from: 0, to: 1, label: 'POST /login  {email, password}', note: 'The usual login. The server checks the password against its stored hash.' },
        { from: 1, to: 2, label: 'save  a8f3…  →  user 42', note: 'The server invents a long **random** session ID and stores what it knows: who this is, when it expires.' },
        { from: 1, to: 0, label: '200 OK + Set-Cookie: sid=a8f3…', dashed: true, note: 'The ID goes back as a **cookie**: a small piece of text the browser is told to keep.' },
        { from: 0, to: 1, label: 'GET /invoices  + Cookie: sid=a8f3…', note: 'From now on the browser attaches the cookie **automatically** to every request to this site. No JavaScript needed.' },
        { from: 1, to: 2, label: 'look up  a8f3…', note: 'The server uses the ID to find the record.' },
        { from: 2, to: 1, label: 'user 42, expires 10:14', dashed: true, note: 'Found, and not expired: this is user 42. The server can now answer, and check what user 42 may see.' }
      ] },

    { kind: 'code', title: 'The cookie, line by line',
      body: 'This is the header a careful server sends. The bits after the semicolons are **flags**. Tap the lines.',
      code: { lang: 'http', src: `
        HTTP/1.1 200 OK
        Set-Cookie: sid=a8f3c19e5b2d47f0; HttpOnly; Secure; SameSite=Lax;
          Max-Age=3600`,
        notes: {
          2: '`sid=…` is the session ID: long, random and unguessable. It holds **no data** about you. `HttpOnly`, `Secure` and `SameSite` are three defences you will almost always want; the next card explains each.',
          3: '`Max-Age=3600` tells the browser to drop the cookie after an hour.'
        } } },

    { kind: 'concept', title: 'What the three flags stop',
      body: `A session ID is a key to your account, so it has to be guarded. Three flags do most of the work:

        - **\`HttpOnly\`**: JavaScript on the page cannot read the cookie. If an attacker sneaks a script into a page (called XSS), they cannot simply copy your session ID.
        - **\`Secure\`**: the browser only sends the cookie over HTTPS, never in the clear.
        - **\`SameSite\`**: the browser does not attach the cookie to requests started by *other* websites (\`Lax\` or \`Strict\`). This blocks a nasty trick called CSRF, where a malicious page makes your browser send a request to your bank, cookie included.

        You will dig into XSS and CSRF in the security module.` },

    { kind: 'diagram', title: 'Scaling: where do the notes live?',
      body: 'One server can keep sessions in its own memory. Add a second server behind a load balancer and the trouble starts: a login on server A is invisible to server B.',
      nodes: [
        { id: 'user', label: 'Browser', icon: '🧑', x: 1, y: 0 },
        { id: 'lb', label: 'Load balancer', icon: '⚖️', x: 1, y: 1 },
        { id: 'a', label: 'Server A', icon: '🖥️', x: 0, y: 2 },
        { id: 'b', label: 'Server B', icon: '🖥️', x: 2, y: 2 },
        { id: 'store', label: 'Shared session store', icon: '🗄️', x: 1, y: 3, tone: 'good' }
      ],
      edges: [
        { from: 'user', to: 'lb' },
        { from: 'lb', to: 'a' }, { from: 'lb', to: 'b' },
        { from: 'a', to: 'store', label: 'look up', dashed: true },
        { from: 'b', to: 'store', dashed: true }
      ],
      caption: 'The usual fix: keep sessions in one shared place (a database or a fast in-memory store such as Redis) that every server can reach. The alternative, "sticky" routing, pins each user to one server, but loses their login if that server dies.' },

    { kind: 'sequence', title: 'Session fixation: the planted ticket',
      body: 'A subtle attack, and why you regenerate the ID at login.',
      actors: ['Attacker', 'Victim', 'Server'],
      steps: [
        { from: 0, to: 2, label: 'GET /  (visits site)', note: 'The attacker visits the site and is handed a session ID, say `abc`. Nobody is logged in yet.' },
        { from: 0, to: 1, label: 'tricks victim into using  abc', note: 'Through a crafted link or by some other trick, the attacker gets the **victim’s browser** to use session ID `abc`.' },
        { from: 1, to: 2, label: 'POST /login  + cookie abc', note: 'The victim logs in, genuinely, with their own password.' },
        { at: 2, label: 'marks session abc as "victim"', note: 'The flaw: the server **keeps the same ID** and just attaches the login to it. Session `abc` is now logged in.' },
        { from: 0, to: 2, label: 'GET /account  + cookie abc', note: 'The attacker already knows `abc`. They are now the victim, with no password needed.' },
        { note: '**The fix:** the moment a login succeeds, issue a brand-new session ID and discard the old one. The attacker’s `abc` is then worthless.' }
      ] },

    { kind: 'concept', title: 'Logout, expiry and revocation',
      body: `Because the server holds the record, **ending a session is easy**: delete it. The ticket in the browser instantly stops working, even though the browser still has it. That makes sessions great for:

        - **Logout**: delete the record and clear the cookie.
        - **"Log me out of all devices"**: delete every record for that user.
        - **Banning someone**: delete their sessions and they are out on the next click.

        Sessions should also **expire**: an *idle timeout* (no activity for 30 minutes, say) and sometimes an *absolute timeout* (never longer than a day, however busy). A forgotten laptop should not stay logged in for ever.` },

    { kind: 'tip', title: 'In the wild: do not hand-roll sessions',
      body: `Almost every web framework (Express, Django, Rails, Laravel, Spring) ships a session system with good defaults: random IDs, the cookie flags, expiry, storage plug-ins. Use it, and check the three flags are on.

        Sessions are the default choice for a traditional website where the browser and the server share a domain. They are simple, easy to revoke and hard to get badly wrong.

        The cost is the shared store as you grow. In the lab that follows you will log in with a session, then add a second server and watch the login vanish.`,
      note: 'Rule of thumb: for a classic web app, start with sessions. Reach for something fancier only when you can say why.' }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'What does the session cookie actually contain?',
      options: ['A long random ID that points to a record on the server', 'The user’s name, email and permissions, encrypted', 'The user’s password, hashed', 'A copy of the whole session, stored in the browser'],
      answer: 0,
      why: [null, 'The data stays on the server. The cookie is only a reference.', 'The password is never needed again after login.', 'That would be a token carrying its own data; with sessions the server holds it.'],
      explain: 'The cookie holds only the session ID, a meaningless reference like a cloakroom ticket. All the real information sits on the server, which is why a session can be cancelled by deleting the record.' },

    { type: 'match', after: 4, prompt: 'Match each cookie flag to what it does.',
      pairs: [['HttpOnly', 'Scripts on the page cannot read the cookie'], ['Secure', 'The cookie is only sent over HTTPS'], ['SameSite', 'Not attached to requests started by other sites'], ['Max-Age', 'Browser forgets the cookie after this long']],
      explain: 'HttpOnly protects against stolen cookies via injected scripts; Secure against eavesdropping; SameSite against cross-site request tricks; Max-Age limits how long a forgotten login lasts.' },

    { type: 'tf', after: 6, statement: 'Issuing a brand-new session ID the moment a user logs in defends against session fixation.', answer: true,
      explain: 'Fixation works because the server keeps an ID the attacker already knows. A fresh ID at login means the planted one is worthless.' },

    { type: 'short', q: 'Which cookie flag stops JavaScript on the page from reading the cookie?', accept: ['HttpOnly'], hint: 'It is about the cookie being for HTTP only, not scripts.',
      explain: '`HttpOnly` hides the cookie from `document.cookie`. The browser still sends it with requests; scripts just cannot see it.' },

    { type: 'spot', prompt: 'This login handler has a security problem. Tap a line that causes one.',
      code: { lang: 'js', src: `
        app.post('/login', (req, res) => {
          const user = checkPassword(req.body);
          req.session.userId = user.id;    // reuses the current session ID
          res.cookie('sid', req.session.id, { httpOnly: false, secure: true });
          res.send('ok');
        });` },
      lines: [3, 4],
      explain: 'Line 3 keeps the old session ID, which allows fixation: regenerate the session on login. Line 4 sets `httpOnly: false`, so any injected script can read the cookie. Both lines are worth fixing.' },

    { type: 'multi', q: 'Which of these are good practice for session cookies?',
      options: ['Use a long, random, unguessable session ID', 'Set `HttpOnly`, `Secure` and `SameSite`', 'Give sessions an idle timeout', 'Use the user’s numeric ID as the session ID', 'Store the user’s password in the cookie so you can check it again'],
      answers: [0, 1, 2],
      explain: 'Random IDs cannot be guessed, the flags close common attack routes, and timeouts limit damage from forgotten logins. A guessable ID lets anyone impersonate user 43 by trying 43, and passwords never belong in cookies.' },

    { type: 'scenario', title: 'Randomly logged out', intro: 'Your shop launched with one server. It was getting busy, so you added a second behind a load balancer. Now customers complain: *"I log in, click a link, and I am logged out again!"* Sessions live in each server\'s memory.',
      meters: { 'customer trust': 50, 'uptime': 70 },
      steps: [
        { text: 'Why is it happening?',
          choices: [
            { label: 'Login on server A created a session only A knows. The next click landed on B, which has never heard of it', score: 2, effects: { 'customer trust': 5 }, feedback: 'Exactly. The ticket is valid, but B’s rail has no coat. In-memory sessions do not survive a second server.' },
            { label: 'The load balancer is deleting the cookies', score: 0, effects: { 'customer trust': -10 }, feedback: 'Cookies are fine; the browser still holds the ID. The problem is that the *record* is not where the request went.' },
            { label: 'Passwords are expiring too fast', score: 0, effects: { 'customer trust': -10 }, feedback: 'Nothing about passwords is involved. The user logged in correctly; the second server just cannot see that.' }
          ] },
        { text: 'Choose a fix.',
          choices: [
            { label: 'Move sessions into a shared store that both servers use', score: 2, effects: { 'uptime': 15, 'customer trust': 20 }, feedback: 'The standard answer. Any server can look up any session, and servers can be added or removed freely.' },
            { label: 'Make the load balancer always send each user to the same server', score: 1, effects: { 'uptime': -5, 'customer trust': 10 }, feedback: 'It works ("sticky sessions"), but when that server restarts or dies, every user on it is logged out, and traffic may spread unevenly.' },
            { label: 'Go back to one server', score: 0, effects: { 'uptime': -20, 'customer trust': -5 }, feedback: 'That removes the symptom, along with your ability to grow or survive a server failure.' }
          ] },
        { text: 'A customer reports their account was taken over. You want to cut off all of their logins right now.',
          choices: [
            { label: 'Delete every session record belonging to that user in the shared store', score: 2, effects: { 'customer trust': 15 }, feedback: 'The big advantage of sessions: the server owns the record, so revoking is instant.' },
            { label: 'Ask the customer to clear their browser cookies', score: 0, effects: { 'customer trust': -15 }, feedback: 'The attacker’s copy of the cookie stays valid. Revocation must happen on the server.' },
            { label: 'Wait for the sessions to expire naturally', score: 1, effects: { 'customer trust': -10 }, feedback: 'It closes the door eventually, but the attacker keeps full access until then.' }
          ] }
      ],
      outro: 'The pattern: **sessions give you easy revocation, and cost you a shared store once you have more than one server.**' },

    { type: 'explain', prompt: 'Explain how a session keeps you logged in, and why deleting it on the server logs you out, even though the browser still has the cookie.',
      model: 'After login the server stores a record under a long random session ID and sends that ID to the browser in a cookie. The browser attaches it to every request and the server looks the record up to see who you are. The cookie is only a reference. If the server deletes the record, the ID points at nothing, so the request is treated as anonymous.',
      keywords: ['session ID', 'cookie', 'server', 'record', 'random', 'lookup', 'delete'] }
  ],

  flashcards: [
    { q: 'What is a session?', a: 'A record the server keeps about a logged-in visitor, found via a random session ID the browser sends in a cookie.' },
    { q: 'What do `HttpOnly`, `Secure` and `SameSite` each do?', a: 'HttpOnly hides the cookie from scripts; Secure sends it only over HTTPS; SameSite stops other sites from triggering requests that carry it.' },
    { q: 'Why do sessions need a shared store when you scale out?', a: 'Each server only knows sessions in its own memory, so a login on one would be invisible to another. A shared store lets any server look up any session.' },
    { q: 'What is session fixation and what stops it?', a: 'An attacker plants a session ID they know, the victim logs in under it, and the attacker reuses it. Issue a new session ID at login.' },
    { q: 'Why are sessions easy to revoke?', a: 'The server owns the record: delete it and the cookie stops working immediately.' }
  ],

  glossary: [
    { term: 'Session', def: 'Server-side record of a logged-in visitor, looked up with a session ID.', like: 'Your coat, hanging behind the cloakroom counter.' },
    { term: 'Session ID', def: 'A long, random, unguessable value that points to a session. It holds no user data itself.', like: 'The numbered cloakroom ticket.' },
    { term: 'Cookie', def: 'A small piece of text a server asks the browser to store and send back automatically with later requests to the same site.', like: 'A ticket the browser keeps in its pocket and shows at the door each time.' },
    { term: 'Session fixation', def: 'An attack where the attacker plants a known session ID and waits for the victim to log in with it.', like: 'Giving someone a pre-marked cloakroom ticket, then collecting their coat.' },
    { term: 'Session store', def: 'The place sessions are kept: server memory, a database or a fast shared cache such as Redis.', like: 'The cloakroom rail, shared by every counter.' }
  ],

  takeaways: [
    'A session = **server remembers you**; the browser holds only a random ID in a cookie.',
    'Set `HttpOnly`, `Secure` and `SameSite`, and expire sessions.',
    'Regenerate the session ID at login to stop fixation.',
    'Easy to revoke (delete the record), but needs a shared store once you have several servers.'
  ],

  links: [
    { label: 'MDN: Using HTTP cookies', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Cookies' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('au-tokens', {
  eli5: 'A token is a pass you carry and show at each door, so the doorman can check the pass itself instead of looking you up in a notebook.',

  cards: [
    { kind: 'concept', title: 'What if the server did not have to remember you?',
      body: `Sessions have a cost: the server must keep a record for every logged-in user and look it up on every request. That is awkward when your app is a phone app, or when ten different services all need to know who is calling.

        The other big idea flips it around. After login the server hands you a **token**: a piece of proof that you carry yourself. On each request you present it, and the server checks the *token*, not a notebook.

        Sessions: *"the server remembers you."*
        Tokens: *"you carry proof."*` },

    { kind: 'metaphor', title: 'The festival wristband',
      body: `At a festival you show your ticket once at the gate and get a **wristband**. After that, every stage, bar and food stall just glances at the wristband. Nobody phones the gate to ask who you are.

        The wristband has two other properties worth noticing:

        - **Whoever wears it gets in.** Staff do not check your face. Lend it to a friend and it works for them.
        - It can have an **end time**. Day passes stop working after the day.

        Both of these will matter, because they are exactly how tokens behave.` },

    { kind: 'sequence', title: 'Using a token',
      body: 'The flow, from login to an API call.',
      actors: ['App', 'Login service', 'API'],
      steps: [
        { from: 0, to: 1, label: 'POST /login  {email, password}', note: 'Same start as always: prove who you are, once.' },
        { from: 1, to: 0, label: '{ "access_token": "eyJ…" }', dashed: true, note: 'Instead of setting a cookie, the service replies with a **token** in the body.' },
        { at: 0, label: 'keep the token somewhere', note: 'The app has to store it. Where is a big question, coming up shortly.' },
        { from: 0, to: 2, label: 'GET /orders  Authorization: Bearer eyJ…', note: 'On each request the app puts the token in a header. Unlike a cookie, nothing happens automatically: the code adds it.' },
        { from: 2, to: 0, label: '200 OK  [orders]', dashed: true, note: 'The API checks the token is genuine and not expired, then answers.' }
      ] },

    { kind: 'concept', title: '"Bearer" means whoever holds it',
      body: `The header says \`Authorization: Bearer <token>\`. **Bearer** is the key word: like cash, or a festival wristband, **whoever bears it may use it**. The server does not ask "are you really Priya?" at that point. It only asks "is this a valid token?"

        So a stolen token is as good as a stolen password, until it expires or is cancelled.

        Three habits follow from that:

        - always send it over **HTTPS**
        - keep it **short-lived**
        - never put it in URLs, logs or screenshots` },

    { kind: 'compare', title: 'Two kinds of token',
      body: 'How does the server decide a token is real? There are two designs, and the difference matters a lot.',
      cols: ['Opaque token', 'Self-contained token'],
      rows: [
        ['Looks like', 'A random string, meaning nothing', 'A structured string carrying claims (a [[JWT]])'],
        ['Server checks by', 'Looking it up in a database or cache', 'Verifying a signature, no lookup'],
        ['Revoking one', 'Easy: delete it from the table', 'Hard: valid until it expires'],
        ['Size', 'Small', 'Bigger, as it carries the data'],
        ['Lookup per request', 'Yes', 'No']
      ],
      note: 'Opaque tokens are really sessions wearing a different hat. Self-contained tokens are the genuinely new idea; the next lesson opens one up.' },

    { kind: 'concept', title: 'API keys: tokens for programs',
      body: `An **API key** is a long random string that a service gives to a developer, to put in the requests their *program* makes.

        The key difference from a user token: an API key identifies an **application** (or a developer account), **not a person**. When your app calls a weather service, the key says "this is the Acme Shop app, on the Free plan". No human is logging in.

        API keys are usually long-lived, sent in a header, and used for server-to-server calls. They behave like a password for your program: keep them out of source code, give each application its own, and be able to revoke or rotate one without breaking the others.` },

    { kind: 'steps', title: 'Access tokens and refresh tokens',
      body: 'A short life limits the damage of theft, but nobody wants to log in every ten minutes. The compromise is two tokens.',
      steps: [
        { title: 'Log in and receive two tokens', body: 'An **access token** that lasts minutes (say 15), and a **refresh token** that lasts much longer (days or weeks).' },
        { title: 'Use the access token for API calls', body: 'It goes in the `Bearer` header on every request. If it leaks, it is useless again soon.' },
        { title: 'It expires, and the API answers 401', body: 'The app notices the rejection. The user has not done anything.' },
        { title: 'Swap the refresh token for a new access token', body: 'The app sends the refresh token **only to the login service**, which checks it and issues a fresh access token. The user sees nothing.' },
        { title: 'Refresh tokens can be cancelled', body: 'Because they are checked at the login service, they can be revoked: log out, ban the user, or detect theft. Once that happens, no new access tokens can be minted.' }
      ] },

    { kind: 'compare', title: 'Where does a browser keep a token?',
      body: 'In a native phone app the answer is simple: use the system’s secure storage (the iOS Keychain or Android Keystore). In a browser, every option has a price.',
      cols: ['localStorage', 'HttpOnly cookie', 'In memory'],
      rows: [
        ['Readable by page scripts?', 'Yes', 'No', 'Yes'],
        ['Survives a refresh?', 'Yes', 'Yes', 'No'],
        ['Main danger', 'XSS: injected script steals it', 'CSRF: other sites trigger requests', 'Lost on refresh'],
        ['Defence', 'Strong XSS protection', '`SameSite` and CSRF protection', 'Pair with a refresh cookie']
      ],
      note: 'Experts disagree on which is best. The HttpOnly cookie is the common recommendation for the main login token; the trade-off is the point.' },

    { kind: 'pitfall', title: 'Four ways tokens go wrong',
      body: `- **Living too long.** A 30-day access token is a 30-day stolen-token problem.
        - **Leaking into URLs.** \`?token=…\` ends up in logs, history and referrer headers.
        - **Sitting in localStorage on a site with an XSS hole.** One injected script can read it and send it away.
        - **Trusting the client with the decision.** A token proves identity; the server must still decide what that identity may do.

        None of these are exotic. They are what real incidents tend to look like. The fix is almost always the same: keep tokens short-lived, narrow and out of places scripts can reach.`,
      note: 'The lab that follows lets you compare a session and a token side by side, including what happens behind a load balancer.' }
  ],

  activities: [
    { type: 'tf', after: 3, statement: 'A bearer token only works for the person it was issued to.', answer: false,
      explain: 'Bearer means *whoever bears it*. The server checks that the token is valid, not who is presenting it. That is why theft matters, and why tokens should be short-lived and sent only over HTTPS.' },

    { type: 'mcq', after: 4, q: 'A user reports their account was hacked. Which token design lets you cut them off instantly, with no extra machinery?',
      options: ['Opaque tokens looked up in a database: delete the row', 'Self-contained tokens: they carry their own expiry', 'Either: tokens cannot be misused after logout', 'Neither: only changing the server’s domain would work'],
      answer: 0,
      why: [null, 'A self-contained token is valid until it expires; the server does not need to ask anyone, which is also why it cannot be easily cancelled.', 'Logging out does not erase a copy someone else already holds.', 'Not true: deleting the lookup row is enough.'],
      explain: 'With opaque tokens the server holds the list of valid tokens, so removing one cancels it at once. Self-contained tokens trade that away for speed.' },

    { type: 'match', after: 6, prompt: 'Match the term to its description.',
      pairs: [['Bearer token', 'Whoever holds it may use it'], ['Opaque token', 'Random string looked up on the server'], ['API key', 'Identifies an application, not a person'], ['Access token', 'Short-lived, sent with API calls'], ['Refresh token', 'Longer-lived, swapped for new access tokens']],
      explain: 'Two design choices (opaque or self-contained, and one token or two) and one separate idea (API keys for programs) cover nearly every token system you will meet.' },

    { type: 'bucket', prompt: 'Which kind of token does each statement describe?', buckets: ['Opaque', 'Self-contained'],
      items: [['The server must look it up on every request', 0], ['It can be verified with no database call', 1], ['Cancelling it is as simple as deleting a row', 0], ['It stays valid until it expires', 1], ['It is a random string with no meaning of its own', 0], ['It carries the user’s claims inside it', 1]],
      explain: 'Opaque tokens push the knowledge onto the server, so they are easy to revoke but need a lookup. Self-contained tokens carry it with them, so they are fast to check but hard to cancel.' },

    { type: 'ab', q: 'Which API call handles the token better?',
      a: { lang: 'http', label: 'Token in the URL', src: `
        GET /orders?access_token=eyJhbGci… HTTP/1.1
        Host: api.example.com` },
      b: { lang: 'http', label: 'Token in a header', src: `
        GET /orders HTTP/1.1
        Host: api.example.com
        Authorization: Bearer eyJhbGci…` },
      answer: 'b',
      explain: 'URLs are written to server logs and browser history and passed along in referrer headers. Headers are normally treated as sensitive and kept out of logs.' },

    { type: 'short', q: 'After `Authorization:` which word marks a token that anyone holding it can use?', accept: ['Bearer'], hint: 'Another word for "carrier".',
      explain: '`Authorization: Bearer <token>` is the standard form. The word tells the server this is a token to be validated, not a username and password.' },

    { type: 'scenario', title: 'Where do I put the token?', intro: 'You are building a single-page web app that calls your own API. After login you receive an access token and a refresh token. Where do they go?',
      meters: { 'security': 50, 'user experience': 50 },
      steps: [
        { text: 'The access token lasts 15 minutes. Where does it live in the app?',
          choices: [
            { label: 'In memory only; the refresh mechanism restores it after a page reload', score: 2, effects: { 'security': 20, 'user experience': 5 }, feedback: 'A script cannot read what is not stored anywhere persistent, and with a short life the damage of leaks is small. A silent refresh keeps users logged in across reloads.' },
            { label: 'In localStorage, because it is the easiest', score: 1, effects: { 'security': -10, 'user experience': 15 }, feedback: 'Convenient, and many apps do it, but any XSS bug now lets an attacker read and steal the token.' },
            { label: 'In a URL parameter so it survives refreshes', score: 0, effects: { 'security': -30 }, feedback: 'URLs are logged and shared. This is the worst of the options.' }
          ] },
        { text: 'And the longer-lived refresh token?',
          choices: [
            { label: 'In an HttpOnly, Secure, SameSite cookie used only for the refresh endpoint', score: 2, effects: { 'security': 20, 'user experience': 10 }, feedback: 'Scripts cannot read it, it is only sent over HTTPS, and SameSite plus a narrow path limits CSRF. That is a common, solid design.' },
            { label: 'In localStorage next to the access token', score: 0, effects: { 'security': -25 }, feedback: 'You have put the most powerful token in the most exposed place. One XSS bug gives an attacker weeks of access.' },
            { label: 'Do not use one; make the access token last 30 days', score: 1, effects: { 'security': -15, 'user experience': 10 }, feedback: 'Simple, but a leaked token now works for a month and cannot easily be cancelled.' }
          ] },
        { text: 'A user clicks "log out everywhere". What should happen?',
          choices: [
            { label: 'Revoke their refresh tokens at the login service; access tokens die within minutes', score: 2, effects: { 'security': 15 }, feedback: 'No new access tokens can be minted, and the existing ones lapse almost immediately. That is the point of the short life.' },
            { label: 'Just delete the token from this browser', score: 1, effects: { 'security': -5 }, feedback: 'That logs out one device. Copies on other devices, or in an attacker’s hands, are still valid.' },
            { label: 'Nothing; tokens cannot be revoked', score: 0, effects: { 'security': -15, 'user experience': -10 }, feedback: 'Access tokens are hard to revoke, but refresh tokens are checked on the server and can be.' }
          ] }
      ],
      outro: 'The pattern: **short-lived access tokens, revocable refresh tokens, and nothing sensitive where scripts can read it.**' },

    { type: 'explain', prompt: 'Explain the difference between an opaque token and a self-contained token, and say which is easier to revoke and why.',
      model: 'An opaque token is just a random string; the server looks it up in storage to find out who it belongs to. A self-contained token carries its own claims and is verified by checking a signature, with no lookup. Opaque tokens are easier to revoke because the server owns the list: delete the entry and the token is dead. A self-contained token stays valid until it expires.',
      keywords: ['opaque', 'lookup', 'self-contained', 'signature', 'revoke', 'expire', 'claims'] }
  ],

  flashcards: [
    { q: 'What does "bearer token" mean?', a: 'Whoever holds (bears) the token may use it; the server checks validity, not who is presenting it.' },
    { q: 'Opaque token vs self-contained token?', a: 'Opaque: random string looked up on the server (easy to revoke). Self-contained: carries its own claims and is verified by signature (no lookup, hard to revoke).' },
    { q: 'What does an API key identify?', a: 'An application or developer account, not an individual user.' },
    { q: 'Why use both access and refresh tokens?', a: 'A short-lived access token limits damage if stolen; a longer-lived refresh token, checked at the login service, gets new ones without re-login and can be revoked.' },
    { q: 'What is the browser storage trade-off?', a: 'localStorage is readable by scripts (XSS risk). HttpOnly cookies are not readable by scripts but need CSRF protection.' }
  ],

  glossary: [
    { term: 'Token', def: 'A piece of proof of a login that the client carries and presents with each request.', like: 'A festival wristband.' },
    { term: 'Bearer token', def: 'A token that grants access to whoever holds it, sent as `Authorization: Bearer <token>`.', like: 'Cash: nobody checks whose it is.' },
    { term: 'Opaque token', def: 'A random-looking token with no meaning of its own, validated by looking it up on the server.', like: 'A cloakroom ticket.' },
    { term: 'API key', def: 'A long-lived secret that identifies an application when it calls a service.', like: 'A company account number rather than a personal ID.' },
    { term: 'Access token', def: 'A short-lived token presented to an API to prove the right to make calls.', like: 'A day pass.' },
    { term: 'Refresh token', def: 'A longer-lived token used only to obtain new access tokens from the login service.', like: 'A season ticket you swap for a fresh day pass.' }
  ],

  takeaways: [
    'Tokens = **you carry proof**; the server verifies it instead of remembering you.',
    '**Bearer** means whoever holds it can use it: HTTPS, short life, never in URLs.',
    'Opaque tokens are looked up (easy to revoke); self-contained tokens are verified (fast, hard to revoke).',
    'Short-lived access token plus revocable refresh token; in browsers, storage is a trade-off between XSS and CSRF.'
  ],

  links: [
    { label: 'MDN: Authorization header', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Authorization' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('au-jwt', {
  eli5: 'A JWT is a small note that says who you are and when it expires, stamped with a seal only the issuer can make: anyone can read the note, but nobody can change it without breaking the seal.',

  cards: [
    { kind: 'concept', title: 'The token that carries its own facts',
      body: `Last lesson you met the **self-contained token**: one that proves itself, so the server needs no lookup. The most famous kind is the **JWT** (JSON Web Token, usually said "jot").

        Here is one. It looks like gibberish, but notice the two dots:

        \`eyJhbGciOiJSUzI1NiJ9.eyJzdWIiOiJ1c2VyLTQyIn0.dBjftJeZ4CVP\`

        Three chunks joined by dots: **header . payload . signature**. The first two are just JSON that has been written in a URL-safe flavour of Base64 (you met plain Base64 in the Basic auth lesson). The third is a cryptographic signature. Each chunk has a job, and the next cards open them up.` },

    { kind: 'metaphor', title: 'A letter in a clear envelope, with a wax seal',
      body: `Picture a letter that says *"The bearer is Priya, an admin, valid until Friday."* The letter sits in a **clear** envelope, so any postman, or any nosy neighbour, can read it.

        What nobody can do is *change* it. The envelope is closed with the issuer's **wax seal**, and only the issuer owns the stamp. Alter a word, and the seal no longer matches. The shop checking it does not need to phone the issuer; it just inspects the seal.

        That is a JWT: **readable by everyone, forgeable by no one**. Hold on to the first half of that sentence; it is the thing people forget.` },

    { kind: 'code', title: 'Inside a JWT: header and payload',
      body: 'Decode the first two chunks and you get plain JSON. Tap the lines.',
      code: { lang: 'js', src: `
        // header: how the token was signed
        { "alg": "RS256", "typ": "JWT" }

        // payload: the claims
        { "iss": "https://login.example.com",
          "sub": "user-42",
          "aud": "shop-api",
          "exp": 1893456000,
          "role": "admin" }`,
        notes: {
          2: '`alg` names the signing algorithm. We will see why the server must not blindly trust this field.',
          5: '`iss`, the **issuer**: who created and signed this token.',
          6: '`sub`, the **subject**: who the token is about. Usually a stable user ID.',
          7: '`aud`, the **audience**: which service the token is meant for.',
          8: '`exp`, the **expiry**: a Unix timestamp (seconds since 1970). After this moment the token must be rejected.',
          9: 'You can add your own claims, like `role`. Keep them few and non-secret.'
        } } },

    { kind: 'layers', title: 'The three parts, built up',
      body: 'Read from the top. The signature covers the other two, which is what makes tampering detectable.',
      layers: [
        { label: 'Header', note: 'Says which algorithm signed the token. Base64url-encoded JSON.', tone: 'info', icon: '🏷️' },
        { label: 'Payload', note: 'The claims: who, for whom, until when, plus any extras. Base64url-encoded JSON.', tone: 'accent', icon: '📄' },
        { label: 'Signature', note: 'A signature over `header.payload`, made with a secret or private key.', tone: 'good', icon: '🔏' }
      ] },

    { kind: 'concept', title: 'The claims you will meet most',
      body: `The payload is a bag of **claims**: statements about the token and its subject. A few have standard names, and a good server checks them:

        | Claim | Means | Why check it |
        |---|---|---|
        | \`iss\` | Who issued it | Reject tokens from strangers |
        | \`sub\` | Who it is about | This is your user |
        | \`aud\` | Who it is for | A token for service A must not work on B |
        | \`exp\` | When it dies | Old tokens must stop working |

        Others you may see: \`iat\` (when it was issued) and \`nbf\` (not valid before).` },

    { kind: 'pitfall', title: 'Signed is not encrypted',
      body: `This is the single most important thing in the lesson. A signature proves **integrity** (nobody changed it) and **origin** (the issuer made it). It does **not** hide anything.

        Paste any JWT into a decoder and the whole payload appears, no key needed. Anyone who touches the token, including the user and any script on the page, can read every claim.

        So **never put secrets in a JWT**: no passwords, no card numbers, no private notes. (An encrypted form, called JWE, does exist, but the everyday "JWT" is just signed.)`,
      note: 'The lab that follows lets you decode a token, edit it, and watch the signature check fail.' },

    { kind: 'sequence', title: 'Why tampering fails',
      body: 'An attacker with a valid "user" token tries to promote themselves. Step through it.',
      actors: ['Attacker', 'API'],
      steps: [
        { at: 0, label: 'decode payload: role = "user"', note: 'The attacker has their own legitimate token and can read it freely. That part is not a flaw.' },
        { at: 0, label: 'edit payload: role = "admin"', note: 'They change the claim and re-encode the middle chunk. The signature chunk is left alone, because they cannot make a valid one without the issuer’s key.' },
        { from: 0, to: 1, label: 'GET /admin  Bearer header.NEW.sig', note: 'They send the doctored token.' },
        { at: 1, label: 'recompute signature over header.payload', note: 'The API checks the signature against the **received** header and payload using the key it trusts.' },
        { at: 1, label: 'mismatch', note: 'The signature was made for the *old* payload. It cannot match the new one.' },
        { from: 1, to: 0, label: '401 Unauthorized', dashed: true, note: 'Rejected. Changing even one character breaks the seal.' }
      ] },

    { kind: 'steps', title: 'What a server must check',
      body: 'Receiving a JWT is not the same as trusting it. Every time, in this order:',
      steps: [
        { title: 'Verify the signature', body: 'Use the key you expect, and the algorithm **you** have configured. Never let the token pick.' },
        { title: 'Check `exp` (and `nbf`)', body: 'An expired token is a dead token, even with a perfect signature.' },
        { title: 'Check `iss`', body: 'Was it issued by the login service you trust, not by some other server that can also sign JWTs?' },
        { title: 'Check `aud`', body: 'Is this token meant for **this** service? Otherwise a token stolen from a minor app could be replayed against a major one.' },
        { title: 'Only then trust the claims', body: 'Read `sub`, `role` and the rest. Authorization decisions come after all of the above pass.' }
      ] },

    { kind: 'compare', title: 'HS256 vs RS256: who can verify?',
      body: 'The signature comes in two families, and the choice shapes your architecture.',
      cols: ['HS256 (shared secret)', 'RS256 / ES256 (key pair)'],
      rows: [
        ['Signing key', 'One secret, shared', 'A private key, kept by the issuer'],
        ['Verifying key', 'The **same** secret', 'A public key, safe to share'],
        ['Who can forge tokens?', 'Anyone holding the secret', 'Only the issuer'],
        ['Good when', 'One service issues and checks', 'Many services check, one issues']
      ],
      note: 'This is the symmetric vs asymmetric split from *Encryption* and *Digital Signatures & HMAC*. HS256 is an HMAC; RS256 and ES256 are digital signatures.' },

    { kind: 'pitfall', title: 'Classic JWT mistakes',
      body: `- **Accepting \`alg: none\`.** The header can say "no signature needed". A server that obeys it lets anyone forge any token. **Never accept it**, and fix the allowed algorithms on the server.
        - **Decoding without verifying.** Reading the payload and acting on it, without checking the signature, is the same as trusting a note anyone can write.
        - **A weak HS256 secret.** Short secrets can be brute-forced offline. Use a long random one.
        - **Skipping \`exp\`, \`iss\` or \`aud\`.**
        - **Secrets in the payload.** It is readable by anyone.

        Use a well-maintained library, and turn on its strict checks.` },

    { kind: 'concept', title: 'The revocation problem',
      body: `A JWT is valid until \`exp\`, and the server holds no list to cross off. So if a token leaks, or an employee is sacked, **it keeps working** until it expires. There is no "delete the row".

        The standard answers:

        - Keep access tokens **short-lived** (minutes), and pair them with revocable refresh tokens. This is why you met that pair last lesson.
        - Keep a **denylist** of cancelled tokens. It works, but each request now needs a lookup, which gives back the very thing JWTs were meant to avoid.
        - Rotate signing keys in an emergency, which kills every token at once.

        Self-contained means fast and scalable. It also means **hard to take back**.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'Which part of a JWT tells the server which algorithm signed it?',
      options: ['The header', 'The payload', 'The signature', 'The `exp` claim'],
      answer: 0,
      why: [null, 'The payload holds claims about the user and token, not the algorithm.', 'The signature is the result of signing, not a description of it.', '`exp` is only the expiry time.'],
      explain: 'The header carries `alg`. That is also why the server must not trust it blindly: the attacker controls the header too, so the server should insist on the algorithm it expects.' },

    { type: 'tf', after: 5, statement: 'A JWT payload is encrypted, so only the server can read what is inside.', answer: false,
      explain: 'A JWT is **signed**, not encrypted. The payload is only Base64url-encoded, so anyone who holds the token can decode and read it. Signing prevents *changes*, not *reading*.' },

    { type: 'mcq', after: 6, q: 'An attacker changes `role` from "user" to "admin" in the payload and sends the token. Why is it rejected?',
      options: ['The old signature no longer matches the changed header and payload', 'The server notices that `role` is an unusual claim', 'Base64 decoding fails on edited tokens', 'The token has already expired'],
      answer: 0,
      why: [null, 'The server does not need to understand the claim; the signature check alone fails.', 'Edited JSON re-encodes into valid Base64url perfectly well.', 'Expiry is unrelated to tampering.'],
      explain: 'The signature was computed over the original header and payload using a key only the issuer has. Change one character and the recomputed signature differs, and the attacker cannot produce a matching one.' },

    { type: 'match', prompt: 'Match each claim to its job.',
      pairs: [['iss', 'Who issued the token'], ['sub', 'Who the token is about'], ['aud', 'Which service the token is for'], ['exp', 'When the token stops being valid']],
      explain: 'A good verifier checks all four. Skipping `aud`, for instance, lets a token meant for one service be replayed against another.' },

    { type: 'bucket', prompt: 'Because a JWT payload is readable by anyone, which of these may go in it?', buckets: ['Fine to include', 'Never include'],
      items: [['The user ID (`sub`)', 0], ['The token’s expiry time', 0], ['The user’s password', 1], ['A role such as "editor"', 0], ['A credit-card number', 1], ['A private API secret for another service', 1], ['A display name', 0]],
      explain: 'Anything in the payload can be read by the user, by scripts on the page, and by anyone who captures the token. Keep it to non-secret facts needed to make decisions.' },

    { type: 'spot', prompt: 'This middleware has a serious JWT mistake. Tap the line.',
      code: { lang: 'js', src: `
        function requireAdmin(req, res, next) {
          const token = req.headers.authorization.split(' ')[1];
          const claims = jwt.decode(token);   // read the payload
          if (claims.role === 'admin') return next();
          res.status(403).send('Forbidden');
        }` },
      lines: [3],
      explain: '`decode` only unpacks the Base64; it never checks the signature. Anyone can craft a token claiming `role: "admin"`. You must call a *verify* function that checks the signature, `exp`, `iss` and `aud` first.' },

    { type: 'short', q: 'Which `alg` value in a JWT header means "no signature", and must never be accepted?', accept: ['none'], hint: 'It is the absence of an algorithm.',
      explain: 'If a server obeys `alg: none`, an attacker can write any payload they like and skip the signature entirely. Always fix the accepted algorithms on the server side.' },

    { type: 'scenario', title: 'The sacked employee', intro: 'Your internal tool uses JWT access tokens that last **7 days**. HR phones: an employee has just been dismissed, and they were an admin. Their laptop is still logged in.',
      meters: { 'security': 40, 'speed': 70 },
      steps: [
        { text: 'The employee’s token is valid for another 5 days. What happens if you do nothing?',
          choices: [
            { label: 'It keeps working; the server has no way to know it should not', score: 2, effects: { 'security': 5 }, feedback: 'Right. The server only checks signature and expiry, so a valid token is a valid token. This is the revocation problem.' },
            { label: 'It stops working as soon as their account is disabled', score: 0, effects: { 'security': -15 }, feedback: 'Only if the server looks the account up on every request, which is exactly what self-contained tokens avoid doing.' },
            { label: 'It stops once they close their browser', score: 0, effects: { 'security': -15 }, feedback: 'The token is a string; they can copy and reuse it from anywhere.' }
          ] },
        { text: 'You need to cut them off today. What is the best immediate action?',
          choices: [
            { label: 'Add their token (or user ID) to a denylist the API checks', score: 2, effects: { 'security': 25, 'speed': -10 }, feedback: 'It works, at the price of a lookup on every request. For a rare emergency, a small denylist is a sensible trade.' },
            { label: 'Rotate the signing key, logging out every user', score: 1, effects: { 'security': 25, 'speed': -25 }, feedback: 'It certainly works, but you have just logged out the whole company. A last resort.' },
            { label: 'Ask them to log out', score: 0, effects: { 'security': -20 }, feedback: 'You are relying on the goodwill of the person you just dismissed.' }
          ] },
        { text: 'How do you stop this being a week-long exposure next time?',
          choices: [
            { label: 'Use 10–15 minute access tokens plus a revocable refresh token', score: 2, effects: { 'security': 25, 'speed': 5 }, feedback: 'Now the worst case is minutes, and the refresh token can be cancelled at the login service. This is the standard design.' },
            { label: 'Make tokens last 30 days so people log in less often', score: 0, effects: { 'security': -25, 'speed': 10 }, feedback: 'More convenient and much worse: a longer life means a longer window for any stolen or stale token.' },
            { label: 'Put a "revoked" flag inside the token', score: 0, effects: { 'security': -10 }, feedback: 'The token is fixed once signed. It cannot be changed after it has been issued.' }
          ] }
      ],
      outro: 'The pattern: **a JWT cannot be taken back, so make it short-lived and revoke the refresh token instead.**' },

    { type: 'explain', prompt: 'Explain why a JWT is described as "signed, not encrypted", and what that means for what you put in it and for how a server must treat it.',
      model: 'The signature proves nobody changed the token and that the issuer made it, but the payload is only Base64url-encoded, so anyone can read it. Never put secrets in it. The server must still verify the signature, and check exp, iss and aud, before trusting any claim.',
      keywords: ['signature', 'integrity', 'readable', 'secrets', 'verify', 'exp', 'aud', 'iss'] }
  ],

  flashcards: [
    { q: 'What are the three parts of a JWT?', a: 'Header (algorithm), payload (claims) and signature, written as three Base64url chunks joined by dots.' },
    { q: 'Is a JWT encrypted?', a: 'No. It is signed, so it cannot be altered undetected, but anyone can read the payload. Never put secrets in it.' },
    { q: 'What must a server check when it receives a JWT?', a: 'The signature (with an expected algorithm), then `exp`, `iss` and `aud`.' },
    { q: 'HS256 vs RS256?', a: 'HS256 uses one shared secret to sign and verify. RS256 signs with a private key and verifies with a public key, so verifiers cannot forge tokens.' },
    { q: 'Why can a JWT not easily be revoked, and what is the usual remedy?', a: 'It is valid until `exp` and the server holds no list. Keep access tokens short-lived and revoke the refresh token.' }
  ],

  glossary: [
    { term: 'JWT', def: 'JSON Web Token: a signed, self-contained token made of a header, a payload of claims and a signature.', like: 'A letter in a clear envelope with a wax seal.', aka: ['JSON Web Token'] },
    { term: 'Base64url', def: 'A URL-safe variant of Base64 used for the chunks of a JWT. It is encoding, not encryption.', like: 'Writing in a different alphabet.' },
    { term: 'Audience (aud)', def: 'The claim naming which service a token is intended for.', like: 'The name of the recipient on the envelope.' },
    { term: 'Expiry (exp)', def: 'The claim holding the time after which the token must be rejected.', like: 'The date printed on a day pass.' },
    { term: 'Denylist', def: 'A list of tokens or users that have been cancelled, checked on each request to allow early revocation.', like: 'A bouncer’s list of banned guests.' }
  ],

  takeaways: [
    'A JWT is **header.payload.signature**: readable by anyone, changeable by no one.',
    '**Signed is not encrypted**: never put secrets in the payload.',
    'Always verify the signature (never accept `alg: none`), then check `exp`, `iss` and `aud`.',
    'JWTs cannot easily be revoked, so keep access tokens short-lived.'
  ],

  links: [
    { label: 'jwt.io: Introduction to JSON Web Tokens', url: 'https://jwt.io/introduction' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('au-oauth', {
  eli5: 'OAuth lets an app act for you with limited, revocable permission, like handing over a valet key, so you never have to give the app your actual password.',

  cards: [
    { kind: 'concept', title: 'Please do not give them your password',
      body: `You find a website that prints your holiday photos as a book. Your photos live in your Google account. To fetch them, the print shop would like to log in as you.

        The old, terrible answer: *"give us your Google email and password."* Now a small print shop holds the key to your whole account, forever. It could read your mail, delete everything, or leak the password. You could only stop it by changing your password, which breaks everything else.

        **OAuth 2.0** exists to fix exactly this. The shop gets a *limited, temporary, revocable* permission to do one thing. It never sees your password.` },

    { kind: 'metaphor', title: 'The valet key',
      body: `Many cars come with a **valet key**. It starts the engine and opens the driver's door, but it will not open the boot or the glovebox, and it may limit the speed. You hand it to a stranger without handing over your life.

        OAuth works the same way:

        - **Limited**: it covers only what you agreed to (the *scope*)
        - **Revocable**: you can cancel it later without changing your house keys
        - **Not your password**: the real keys stay with you

        Where the metaphor stops: a car key is cut once. An OAuth token is issued on demand, expires, and can be refreshed.` },

    { kind: 'concept', title: 'OAuth is authorization, not login',
      body: `Read this one slowly, because it trips up almost everyone.

        **OAuth 2.0 is delegated authorization.** It answers: *"may this app do this thing on this user's behalf?"* It hands the app an **access token**.

        It does not, by itself, answer *"who is this user?"* The token tells the app what it may do, not who logged in. (That gap is exactly what OpenID Connect, the next lesson, fills. "Sign in with Google" is built on OAuth, plus an identity layer.)

        Keep the pairing straight: **authentication** = who; **OAuth** = permission to act. They are neighbours, not twins.` },

    { kind: 'diagram', title: 'The four roles',
      body: 'Every OAuth conversation has four parties. Learn these names; the documentation uses them constantly.',
      nodes: [
        { id: 'owner', label: 'Resource owner (you)', icon: '🧑', x: 0, y: 0, tone: 'accent' },
        { id: 'client', label: 'Client (print shop)', icon: '🖨️', x: 2, y: 0, tone: 'warn' },
        { id: 'as', label: 'Authorization server', icon: '🛂', x: 0, y: 2, tone: 'info' },
        { id: 'rs', label: 'Resource server (Photos API)', icon: '🗄️', x: 2, y: 2, tone: 'good' }
      ],
      edges: [
        { from: 'client', to: 'owner', label: 'asks permission', dashed: true },
        { from: 'owner', to: 'as', label: 'logs in, approves' },
        { from: 'as', to: 'client', label: 'access token' },
        { from: 'client', to: 'rs', label: 'calls API with token' }
      ],
      caption: 'The resource owner owns the data. The client is the app that wants it. The authorization server issues tokens. The resource server holds the data and checks them. Often the last two belong to the same company.' },

    { kind: 'sequence', title: 'The authorization code flow',
      body: 'This is the flow you should use for web apps, single-page apps and mobile apps. Step through it slowly; every step has a reason.',
      actors: ['Browser', 'Print shop', 'Auth server', 'Photos API'],
      steps: [
        { from: 0, to: 1, label: 'click "Import from Photos"', note: 'You, in your browser, ask the print shop (the client) to fetch your photos.' },
        { from: 1, to: 0, label: 'redirect to the auth server', dashed: true, note: 'The shop sends your browser to the authorization server, with a request describing who it is and what it wants (the scope).' },
        { from: 0, to: 2, label: 'GET /authorize?client_id&scope&state…', note: 'You arrive at **Google’s** own page, not the shop’s. The shop never sees what happens here.' },
        { at: 2, label: 'you log in and click "Allow"', note: 'You enter your password **only at the authorization server**, and see a consent screen listing what is being requested.' },
        { from: 2, to: 0, label: 'redirect back with ?code=xyz&state=…', dashed: true, note: 'The server sends you back to the shop carrying a short-lived, one-time **authorization code**. It is not yet a token.' },
        { from: 0, to: 1, label: 'GET /callback?code=xyz&state=…', note: 'The shop receives the code, and checks that `state` matches the one it sent.' },
        { from: 1, to: 2, label: 'POST /token  code + code_verifier', note: 'The shop swaps the code for tokens in a **direct, behind-the-scenes** call, proving it is the same app that started the flow.' },
        { from: 2, to: 1, label: 'access token (+ refresh token)', dashed: true, note: 'The tokens never pass through the browser address bar.' },
        { from: 1, to: 3, label: 'GET /photos  Bearer <token>', note: 'The shop now calls the API with the access token.' },
        { from: 3, to: 1, label: 'your photos', dashed: true, note: 'The resource server checks the token and its scope, and answers. You never shared your password.' }
      ] },

    { kind: 'code', title: 'The request, with its protections',
      body: 'Step 3 is where the shop describes what it wants. Tap the lines to see what each part does.',
      code: { lang: 'http', src: `
        GET /authorize?response_type=code
          &client_id=print-shop
          &redirect_uri=https://print.example/callback
          &scope=photos.read
          &state=k3j9x2
          &code_challenge=E9Melhoa2OwvFrEMTJguCHaoeK1t8URWbuGJSstw-cM
          &code_challenge_method=S256`,
        notes: {
          1: '`response_type=code` asks for the authorization code flow.',
          3: 'The server will only redirect to an address **registered in advance** for this client.',
          4: '`scope` is the permission requested. Here: *read* photos, nothing else.',
          5: '`state` is a random value the shop made up. It must come back unchanged.',
          6: '`code_challenge` is a **hash** of a secret the shop is keeping (the `code_verifier`). The secret itself comes later.'
        } } },

    { kind: 'concept', title: 'Two protections: state and PKCE',
      body: `The redirect steps happen in a browser, where things can go wrong. Two small values guard them.

        **\`state\`** protects against CSRF on the redirect. The shop invents a random value, sends it out, and insists it comes back identical. If an attacker tries to feed the shop *their own* code, the value will not match, and the shop refuses.

        **PKCE** (said "pixie") protects the **code** from interception. The shop keeps a secret, sends only its hash at the start, and reveals the secret when swapping the code. A thief who steals the code on the way back does not have the secret, so the code is worthless to them.

        Use both. OAuth 2.1 makes PKCE mandatory.` },

    { kind: 'concept', title: 'Scopes and consent',
      body: `A **scope** is a named slice of permission: \`photos.read\`, \`calendar.events\`, \`email.send\`. The app asks for the scopes it needs, and the **consent screen** shows them in plain language: *"Print Shop wants to view your photos."*

        You can say yes or no. The token you eventually issue is limited to those scopes, even though your account can do far more.

        Two good habits for app builders:

        - ask for the **least** access that works
        - ask only when needed, because a long scary list makes users click Deny

        Later you will see how scopes fit into the wider story of authorization.` },

    { kind: 'compare', title: 'The flows: which survived?',
      body: 'OAuth defines several ways to get a token. Two are current, and two have been retired.',
      cols: ['Used today?', 'Why'],
      rows: [
        ['Authorization code + PKCE', '✅ Yes: web, single-page, mobile', 'Tokens never travel through the browser address bar; the code is useless without the verifier'],
        ['Client credentials', '✅ Yes: machine-to-machine', 'No user at all: a service proves *itself* with its own ID and secret'],
        ['Implicit', '❌ Deprecated', 'Returned the token straight in the redirect URL, where history, logs and scripts could capture it'],
        ['Resource-owner password', '❌ Deprecated', 'The app collects your password and trades it for a token, which defeats the whole point of OAuth']
      ],
      note: 'OAuth 2.1 is the tidied-up edition: it removes the implicit and password flows and makes PKCE mandatory.' },

    { kind: 'tip', title: 'Build with care, not from scratch',
      body: `A few rules that experienced teams follow:

        - **Use a library or a provider.** OAuth is full of small details; do not hand-write the flow.
        - **Register exact redirect addresses.** A wildcard lets an attacker redirect codes to their own site.
        - **Keep client secrets on servers only.** A phone app or single-page app is a "public client": anyone can inspect it, so it cannot hide a secret, which is *why* it uses PKCE.
        - **Treat tokens like passwords** (the previous lessons).

        In the lab that follows you will play each party in the authorization-code and PKCE flow.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'What problem does OAuth 2.0 mainly solve?',
      options: ['Letting an app act for you with limited access, without sharing your password', 'Proving to a website who you are when you log in', 'Encrypting the connection between browser and server', 'Storing passwords safely in a database'],
      answer: 0,
      why: [null, 'That is authentication. OAuth is about permission to act; identity comes from OpenID Connect on top.', 'That is TLS, which you met earlier.', 'That is password hashing.'],
      explain: 'OAuth is **delegated authorization**: the user lets an app do specific things on their behalf, with a revocable token, and the password stays with the authorization server.' },

    { type: 'match', after: 3, prompt: 'Match each OAuth role to the print-shop example.',
      pairs: [['Resource owner', 'You, who own the photos'], ['Client', 'The print shop that wants the photos'], ['Authorization server', 'Google’s login and consent service'], ['Resource server', 'The Photos API that holds your pictures']],
      explain: 'Four roles, four jobs. The authorization server and resource server are often run by the same company, but they play different parts: one issues tokens, the other checks them.' },

    { type: 'order', after: 4, prompt: 'Put the authorization code flow in order.',
      items: ['The app redirects the browser to the authorization server', 'The user logs in and approves at the authorization server', 'The browser returns to the app with a one-time code', 'The app swaps the code (plus verifier) for tokens', 'The app calls the API with the access token'],
      explain: 'The user only ever types a password at the authorization server. The code is a short-lived stepping stone, exchanged for tokens in a direct call, and only then does the app call the API.' },

    { type: 'tf', statement: 'With PKCE, a stolen authorization code is useless to the thief, because they do not have the code verifier.', answer: true,
      explain: 'The app sends a hash of its secret at the start and reveals the secret only when exchanging the code. An attacker who intercepts just the code cannot complete that exchange.' },

    { type: 'mcq', q: 'What is the `state` parameter for?',
      options: ['Blocking forged redirects, by checking the value returned matches the one sent', 'Naming the user’s country for data-protection rules', 'Encrypting the authorization code', 'Telling the server which scopes to grant'],
      answer: 0,
      why: [null, 'It has nothing to do with location.', 'The code is protected by PKCE, not `state`.', 'Scopes are carried by the separate `scope` parameter.'],
      explain: 'The client sends a random `state`, then requires the same value back. If an attacker tries to push their own code into the user’s browser, it will not match, and the client rejects it (a CSRF defence).' },

    { type: 'bucket', prompt: 'Which approach fits each situation?', buckets: ['Authorization code + PKCE', 'Client credentials', 'Do not use (deprecated)'],
      items: [['A phone app that connects to the user’s calendar', 0], ['A nightly backend job where one service calls another, no user involved', 1], ['A single-page app reading the user’s repositories', 0], ['The client collects the user’s username and password and trades them for a token', 2], ['The token is returned in the redirect URL fragment', 2], ['A billing service calling the inventory API as itself', 1]],
      explain: 'If there is a user to consent, use authorization code with PKCE. If a service acts as itself, client credentials. The password and implicit flows were retired because of the leaks they cause.' },

    { type: 'cloze', text: 'OAuth 2.0 is delegated {{authorization}}. The permission is limited by a {{scope}}, and the user approves it on a {{consent}} screen.',
      distractors: ['authentication', 'password', 'cookie'],
      explain: 'Authorization (not authentication) is the key word. Scopes limit what the token can do; the consent screen is where the user agrees.' },

    { type: 'scenario', title: 'Choose the flow', intro: 'You are the lead engineer at a scheduling startup. You need to read users’ calendars from Google, and a separate back-office service must call your own internal API. Time to make decisions.',
      meters: { 'security': 50, 'effort': 50 },
      steps: [
        { text: 'Your single-page web app needs to read the user’s calendar. Which flow?',
          choices: [
            { label: 'Authorization code with PKCE', score: 2, effects: { 'security': 25, 'effort': -10 }, feedback: 'This is the recommended flow for single-page apps. The browser app cannot hide a secret, so PKCE protects the code instead.' },
            { label: 'Ask users for their Google password and log in on their behalf', score: 0, effects: { 'security': -40 }, feedback: 'That is exactly the thing OAuth was invented to stop. You would hold the keys to their accounts.' },
            { label: 'Implicit flow: it was designed for browser apps', score: 1, effects: { 'security': -15, 'effort': 5 }, feedback: 'It was once recommended for that, but it exposes tokens in the redirect URL. It is deprecated; use code with PKCE.' }
          ] },
        { text: 'A back-office service (no human, just a server) calls your internal reporting API every night. Which flow?',
          choices: [
            { label: 'Client credentials: the service authenticates as itself', score: 2, effects: { 'security': 15, 'effort': -5 }, feedback: 'There is no user to consent, so the service proves its own identity with a client ID and secret and receives an access token.' },
            { label: 'Authorization code, with a person clicking Allow each night', score: 0, effects: { 'effort': -25 }, feedback: 'Nobody is there to click. Machines need a flow that does not involve a user.' },
            { label: 'Hard-code one employee’s password in the script', score: 0, effects: { 'security': -35 }, feedback: 'A human’s password in a script is a breach waiting to happen.' }
          ] },
        { text: 'During review you notice the app registered its redirect address as `https://*.scheduler.example/*` with a wildcard. What do you do?',
          choices: [
            { label: 'Register the exact callback address and nothing else', score: 2, effects: { 'security': 20 }, feedback: 'Exact matching stops attackers redirecting codes to a page they control, even a sub-page on a related domain.' },
            { label: 'Keep it: it is easier when we add new pages', score: 0, effects: { 'security': -25, 'effort': 10 }, feedback: 'Convenient for you, and for attackers: any page that matches can receive the user’s authorization code.' },
            { label: 'Remove `state`, because the wildcard already protects us', score: 0, effects: { 'security': -30 }, feedback: 'The wildcard protects nothing, and `state` guards against a different attack. Keep both and tighten the address.' }
          ] }
      ],
      outro: 'The pattern: **users present means authorization code with PKCE; machines acting alone means client credentials; never the password or implicit flows.**' },

    { type: 'explain', prompt: 'Explain OAuth 2.0 to a friend using the valet-key idea, and name the roles involved.',
      model: 'OAuth lets you give an app a limited, revocable permission instead of your password, like a valet key that starts the car but does not open the boot. You (the resource owner) approve on the authorization server’s page, which gives the client app an access token limited by scopes. The client then calls the resource server with that token. OAuth is about permission to act, not about proving who you are.',
      keywords: ['password', 'scope', 'access token', 'resource owner', 'client', 'authorization server', 'consent'] }
  ],

  flashcards: [
    { q: 'What is OAuth 2.0 in one sentence?', a: 'A standard for delegated authorization: an app gets limited, revocable access to your data without ever seeing your password.' },
    { q: 'Name the four OAuth roles.', a: 'Resource owner (you), client (the app), authorization server (issues tokens), resource server (holds the data and checks tokens).' },
    { q: 'What do `state` and PKCE each protect?', a: '`state` protects the redirect against CSRF; PKCE protects the authorization code from interception.' },
    { q: 'Which OAuth flow is recommended for web, single-page and mobile apps?', a: 'The authorization code flow with PKCE.' },
    { q: 'Why were the implicit and password flows deprecated?', a: 'Implicit exposed tokens in redirect URLs; the password flow made apps handle your password, defeating OAuth’s purpose. OAuth 2.1 removes both.' },
    { q: 'When do you use the client credentials flow?', a: 'Machine-to-machine calls where no user is involved and a service acts as itself.' }
  ],

  glossary: [
    { term: 'OAuth 2.0', def: 'A standard for delegated authorization: letting an app act on a user’s behalf with limited, revocable access, without sharing their password.', like: 'A valet key.' },
    { term: 'Scope', def: 'A named slice of permission that an app requests and the user approves, such as `photos.read`.', like: 'Which doors the valet key opens.' },
    { term: 'Authorization code', def: 'A short-lived, one-time value returned after the user approves, which the app swaps for tokens.', like: 'A claim slip you exchange at the counter for the real item.' },
    { term: 'PKCE', def: 'Proof Key for Code Exchange: the app sends a hash of a secret first and reveals the secret when exchanging the code, so a stolen code is useless.', like: 'Tearing a ticket in half and matching the halves later.' },
    { term: 'Client credentials flow', def: 'An OAuth flow where a service gets a token by proving its own identity, with no user involved.', like: 'A company vehicle’s own pass, not a person’s.' },
    { term: 'Consent screen', def: 'The page where the user sees what an app is asking for and chooses Allow or Deny.', like: 'The "this app wants to…" prompt.' }
  ],

  takeaways: [
    '**OAuth 2.0 = delegated authorization**: limited, revocable access without sharing your password. Not a login system by itself.',
    'Four roles: resource owner, client, authorization server, resource server.',
    'Use the **authorization code flow with PKCE**; `state` guards the redirect, PKCE guards the code.',
    'Client credentials for machines. Implicit and password flows are deprecated.'
  ],

  links: [
    { label: 'oauth.net: OAuth 2.0', url: 'https://oauth.net/2/' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('au-oidc', {
  eli5: 'OpenID Connect adds a name badge on top of OAuth: after you approve, the app receives a signed ID token saying who you are, which is what makes "Sign in with Google" work.',

  cards: [
    { kind: 'concept', title: 'The app has a key, but no idea who you are',
      body: `Last lesson ended with the print shop holding an **access token**. That token lets it call the Photos API. But look at what it does *not* tell the shop: your name, your email, or even a stable ID for you.

        Often that is exactly what an app wants. A new site thinks: *"Instead of making users invent yet another password, let them sign in with Google."* To do that it needs a trustworthy answer to **"who just logged in?"**

        OAuth was never designed to give one. Developers bent it into shape with ad-hoc tricks, and every site did it differently. **OpenID Connect** (OIDC) is the tidy, standard fix.` },

    { kind: 'metaphor', title: 'The conference lanyard',
      body: `At a conference you get two things at the desk. A **ticket** that opens the workshop rooms, and a **name badge** that says who you are.

        The ticket is the OAuth **access token**: it grants entry, and the doors do not care about your name. The badge is the OIDC **ID token**: it states who you are, and the organiser has signed it so nobody can fake one.

        OpenID Connect is not a new system. It is the same conference, with name badges added to the desk.

        Where the metaphor stops: the badge is meant for *the app that asked for it*, not for presenting at every door.` },

    { kind: 'concept', title: 'OIDC is OAuth plus identity',
      body: `OIDC is a thin layer **on top of** OAuth 2.0, so the flow you learned is almost unchanged. The differences are small:

        1. The app adds the special scope \`openid\` to its request. That is the signal "I want identity too".
        2. Alongside the access token, the authorization server returns an **ID token**: a JWT *about the user*.
        3. A standard set of claims, and standard endpoints, so every provider behaves the same way.

        Summary: **OAuth = authorization. OIDC = authentication, built on OAuth.** Google, Microsoft and Apple all provide it.` },

    { kind: 'sequence', title: '"Sign in with Google", step by step',
      body: 'It is the authorization-code-with-PKCE flow again. Watch for the new pieces.',
      actors: ['Browser', 'The app', 'Google'],
      steps: [
        { from: 0, to: 1, label: 'click "Sign in with Google"', note: 'The user asks the app to log them in. The app is called the **relying party**, because it relies on someone else’s login.' },
        { from: 1, to: 0, label: 'redirect to Google', dashed: true, note: 'The redirect carries `scope=openid email profile`, plus `state`, a PKCE challenge and a random **nonce**.' },
        { from: 0, to: 2, label: 'GET /authorize?scope=openid…', note: 'The browser lands on Google’s page. The app never sees the password.' },
        { at: 2, label: 'user logs in (and perhaps does MFA)', note: 'Google authenticates the user, in whatever way it likes. This is where the real authentication happens.' },
        { from: 2, to: 0, label: 'redirect back with ?code=…', dashed: true, note: 'A one-time code, exactly as in plain OAuth.' },
        { from: 0, to: 1, label: 'GET /callback?code=…&state=…', note: 'The app checks `state`.' },
        { from: 1, to: 2, label: 'POST /token  code + code_verifier', note: 'A direct back-channel swap, protected by PKCE.' },
        { from: 2, to: 1, label: 'ID token + access token', dashed: true, note: 'The new piece: an **ID token**, a signed JWT saying who logged in.' },
        { at: 1, label: 'verify ID token, start own session', note: 'The app checks signature, `iss`, `aud`, `exp` and `nonce`. It then starts **its own** session for the user. Google is not involved from here on.' }
      ] },

    { kind: 'code', title: 'What an ID token says',
      body: 'It is a JWT, so you already know how to read one. This is the decoded payload. Tap the lines.',
      code: { lang: 'js', src: `
        { "iss": "https://accounts.google.com",
          "sub": "110169484474386276334",
          "aud": "my-app-client-id",
          "exp": 1893456000,
          "iat": 1893452400,
          "nonce": "n-0S6_WzA2Mj",
          "email": "priya@example.com",
          "name": "Priya Shah" }`,
        notes: {
          1: '`iss`: who vouches for this identity. The app only accepts issuers it trusts.',
          2: '`sub`: a stable, unique ID for this user **at this provider**. Use it as the account key.',
          3: '`aud`: the audience is **your app’s client ID**. If it names another app, reject the token.',
          6: '`nonce`: the random value the app sent at the start. If it does not match, the token is a replay.',
          7: 'Email and name are claims too. Emails can change, so do not use them as the permanent key.'
        } } },

    { kind: 'concept', title: 'Userinfo and discovery',
      body: `Two more standard pieces make OIDC pleasant to build against.

        **The userinfo endpoint.** Call it with the access token and it returns more claims about the user (profile details, for example), so the ID token itself can stay small.

        **Discovery.** Every provider publishes a standard JSON file at a fixed address: \`/.well-known/openid-configuration\`. It lists the authorize, token and userinfo addresses and where to find the **public keys** used to verify ID tokens.

        Your app reads that one file and configures itself. This is why libraries can support any compliant provider with just its base address.` },

    { kind: 'compare', title: 'OAuth vs OIDC vs SAML',
      body: 'Three names that get muddled. SAML is covered in the next lesson; here is the quick map.',
      cols: ['OAuth 2.0', 'OpenID Connect', 'SAML'],
      rows: [
        ['Main purpose', 'Authorization: act on my behalf', 'Authentication: sign in with…', 'Authentication: single sign-on'],
        ['Gives the app', 'Access token', 'ID token + access token', 'XML assertion'],
        ['Format', 'Opaque or JWT', 'JWT', 'XML'],
        ['Typical home', 'APIs and integrations', 'Consumer sign-in, modern apps', 'Enterprise workplace apps']
      ] },

    { kind: 'pitfall', title: 'Mistakes to avoid with OIDC',
      body: `- **Using an ID token as an access token.** The ID token is for *your app* to learn who logged in. It is not meant to be sent to an API.
        - **Keying accounts on email.** Emails change and may be reused. Use the pair (\`iss\`, \`sub\`) as the stable identity.
        - **Skipping verification.** The ID token must be verified: signature, \`iss\`, \`aud\`, \`exp\` and \`nonce\`.
        - **Forgetting your own session.** The ID token proves login *once*. After that your app needs its own session or token, as in earlier lessons.

        Use a well-maintained library. It handles all of these.` },

    { kind: 'realworld', title: 'Why "Sign in with" wins, and what it costs',
      body: `For the **user**: no new password, one click, and the provider's own protections (MFA, breach detection) come free.

        For the **developer**: you do not store passwords, which removes a whole category of risk, and you skip building password reset.

        The costs: your sign-in now depends on someone else's service being up, some users distrust the buttons, and **account recovery** becomes tangled (what if they lose access to the Google account?).

        Services like Auth0, Amazon Cognito and Keycloak sit in the middle: they speak OIDC *to your app*, and talk to Google, passwords and company logins behind the scenes.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'What does OpenID Connect add on top of OAuth 2.0?',
      options: ['An ID token saying who the user is', 'A stronger encryption algorithm for the access token', 'A way to avoid HTTPS', 'A replacement for scopes'],
      answer: 0,
      why: [null, 'Encryption is handled by TLS and the token formats; OIDC is about identity.', 'HTTPS is still required.', 'OIDC uses scopes, adding the special `openid` scope.'],
      explain: 'OIDC reuses OAuth’s flow and adds identity: the `openid` scope, an ID token (a JWT about the user), a userinfo endpoint and discovery.' },

    { type: 'tf', after: 4, statement: 'The `sub` claim is a better permanent identifier for a user than their email address.', answer: true,
      explain: '`sub` is a stable, unique ID at the provider. Email addresses can change or be reassigned, which could hand one person’s account to another.' },

    { type: 'match', after: 5, prompt: 'Match each OIDC piece to its job.',
      pairs: [['ID token', 'A signed JWT saying who logged in'], ['`openid` scope', 'Asks for identity as well as access'], ['Userinfo endpoint', 'Returns extra claims about the user'], ['Discovery document', 'A standard JSON file listing endpoints and keys'], ['nonce', 'Random value that ties a token to one login attempt']],
      explain: 'Together these make every compliant provider behave the same way, so one library can talk to Google, Microsoft or your own company login.' },

    { type: 'bucket', prompt: 'Which standard fits each need best?', buckets: ['OAuth 2.0', 'OpenID Connect', 'SAML'],
      items: [['A calendar app wants to read your Google Calendar', 0], ['A blog offers a "Sign in with Google" button', 1], ['A large company logs staff into its expense system with the company login', 2], ['A script needs to call a partner API with limited access', 0], ['A mobile app needs to know the user’s verified email at sign-up', 1], ['A university’s members open many partner portals with one login', 2]],
      explain: 'OAuth is for permission to do things, OIDC for consumer and modern-app sign-in, and SAML for enterprise single sign-on. The lines blur, but this split is a reliable first guess.' },

    { type: 'spot', prompt: 'This sign-in callback has two flaws. Tap a line with one of them.',
      code: { lang: 'js', src: `
        const claims = jwt.decode(idToken);
        const user = db.users.findByEmail(claims.email);
        startSession(user.id);` },
      lines: [1, 2],
      explain: 'Line 1 only decodes the token and does not verify the signature, `iss`, `aud`, `exp` or `nonce`. Line 2 uses email as the key; a stable account link should use `iss` plus `sub`.' },

    { type: 'short', q: 'Which scope, added to an OAuth request, turns it into an OpenID Connect sign-in?', accept: ['openid'], hint: 'It is the name of the standard itself, minus the last word.',
      explain: 'Including `openid` in the scope tells the provider to authenticate the user and return an ID token as well as an access token.' },

    { type: 'scenario', title: 'Adding "Sign in with Google"', intro: 'Your notes app currently stores its own passwords. Users keep forgetting them, so you add a Google sign-in button.',
      meters: { 'security': 50, 'user happiness': 50 },
      steps: [
        { text: 'Your teammate says: "We already use OAuth for the calendar feature, so the access token will tell us who logged in." What do you reply?',
          choices: [
            { label: 'An access token says what the app may do, not who the user is; we need OIDC and its ID token', score: 2, effects: { 'security': 15 }, feedback: 'Exactly. Request the `openid` scope and verify the ID token. That is what OIDC was made for.' },
            { label: 'Fine: call the userinfo URL with it and trust whatever comes back', score: 1, effects: { 'security': 5 }, feedback: 'Userinfo exists in OIDC, but without the openid scope and a verified ID token you are relying on a non-standard shortcut.' },
            { label: 'Ask users to type their Google email in a box and trust it', score: 0, effects: { 'security': -30 }, feedback: 'Anyone could type anyone’s email. Authentication needs proof from the provider.' }
          ] },
        { text: 'An ID token arrives. Which should you do before trusting it?',
          choices: [
            { label: 'Verify the signature against Google’s public keys, then check `iss`, `aud`, `exp` and `nonce`', score: 2, effects: { 'security': 25 }, feedback: 'The keys come from the discovery document, and each check closes a separate attack: wrong issuer, wrong audience, replay.' },
            { label: 'Decode it and read the email', score: 0, effects: { 'security': -30 }, feedback: 'Decoding verifies nothing. Anyone could hand you a doctored token.' },
            { label: 'Check only that it has not expired', score: 1, effects: { 'security': -10 }, feedback: 'Expiry matters, but a forged token can say any date it likes unless the signature is checked.' }
          ] },
        { text: 'The token is valid. How do you link it to an account in your database?',
          choices: [
            { label: 'Store (`iss`, `sub`) with the account and look it up that way', score: 2, effects: { 'security': 15, 'user happiness': 10 }, feedback: 'Stable, unique and not reassignable. Email can still be saved as a contact detail.' },
            { label: 'Match on email address alone', score: 1, effects: { 'security': -10 }, feedback: 'Emails change, and an attacker who can claim a reused address could take over an account.' },
            { label: 'Create a brand-new account on every sign-in', score: 0, effects: { 'user happiness': -25 }, feedback: 'The user would never see their own notes twice.' }
          ] }
      ],
      outro: 'The pattern: **ask for `openid`, verify the ID token, link on `iss` plus `sub`, then start your own session.**' },

    { type: 'explain', prompt: 'A friend says "OAuth is how Sign in with Google works, so OAuth is a login system." Explain what is right and wrong about that.',
      model: 'Sign in with Google does use OAuth’s flow, but OAuth alone is about authorization: it hands the app an access token that says what it may do, not who the user is. OpenID Connect adds the identity layer: the openid scope, an ID token (a signed JWT about the user), and standard endpoints. So the login part is OIDC, built on top of OAuth.',
      keywords: ['authorization', 'authentication', 'ID token', 'OpenID Connect', 'access token', 'identity', 'openid'] }
  ],

  flashcards: [
    { q: 'What is the relationship between OAuth and OpenID Connect?', a: 'OAuth handles authorization. OIDC is an identity layer on top of it that adds an ID token, so apps learn who logged in.' },
    { q: 'What is an ID token?', a: 'A signed JWT issued by the identity provider, stating who the user is. It is meant for the app that requested it.' },
    { q: 'Which claim should identify a user permanently, and why not email?', a: 'The pair `iss` + `sub`: stable and unique. Email can change or be reassigned.' },
    { q: 'What are the userinfo endpoint and the discovery document?', a: 'Userinfo returns extra claims for a token. Discovery is JSON at `/.well-known/openid-configuration` listing endpoints and public-key location.' },
    { q: 'What checks must an app make on an ID token?', a: 'Signature, `iss`, `aud`, `exp` and `nonce`.' }
  ],

  glossary: [
    { term: 'OpenID Connect', def: 'An identity layer on top of OAuth 2.0 that lets an app learn who the user is through a signed ID token.', like: 'Name badges added to the conference.', aka: ['OIDC'] },
    { term: 'ID token', def: 'A JWT issued by the identity provider, containing claims about the user who just logged in.', like: 'The name badge.' },
    { term: 'Relying party', def: 'The app that relies on an identity provider to log its users in.', like: 'A shop that accepts a trusted ID card instead of issuing its own.', aka: ['RP'] },
    { term: 'Nonce', def: 'A random value sent at the start of an OIDC login and returned inside the ID token, to prevent replay.', like: 'A pre-agreed code word.' },
    { term: 'Discovery document', def: 'A JSON file at `/.well-known/openid-configuration` that tells clients a provider’s endpoints and keys.', like: 'The directory board in a building lobby.' }
  ],

  takeaways: [
    '**OAuth = authorization; OIDC = authentication built on OAuth.** "Sign in with…" is OIDC.',
    'Add the `openid` scope and you also get an **ID token**: a signed JWT about the user.',
    'Verify signature, `iss`, `aud`, `exp` and `nonce`; key accounts on `iss` + `sub`, not email.',
    'After login, start your own session. The ID token is not an access token.'
  ],

  links: [
    { label: 'OpenID Connect: How it works', url: 'https://openid.net/developers/how-connect-works/' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('au-saml-sso', {
  eli5: 'Single sign-on means logging in once with your company and then being let into many apps; SAML is an older, XML-based way for the company login to hand each app a signed note saying who you are.',

  cards: [
    { kind: 'concept', title: 'One login, forty apps',
      body: `Picture your first day at a big company. You will use email, the HR system, the expense tool, the wiki, the ticket tracker and a dozen more. If each had its own username and password, you would have forty passwords, forty reset emails, and forty accounts for IT to switch off when you leave.

        **Single sign-on (SSO)** removes all that. You log in **once**, with the company's login. Every other app trusts that login and lets you straight in.

        SSO is a *goal*. There are several ways to reach it: OpenID Connect from the last lesson is one, and **SAML** is the older one you will meet in most big organisations.` },

    { kind: 'metaphor', title: 'The business-park staff pass',
      body: `Imagine a business park where one **security office** checks everyone at the main gate and issues a staff pass. Each firm in the park has its own front door, but none of them check ID themselves. They look at the pass, see that it carries the park's official stamp, and let you in.

        The firms never run their own ID checks. If the security office cancels your pass, every door closes at once.

        Where the metaphor stops: the pass here is a **signed digital note**, handed over by your browser, not a physical card.` },

    { kind: 'concept', title: 'Two roles: identity provider and service provider',
      body: `SAML names the two sides:

        - The **identity provider (IdP)** is the company's login system. It holds the users, checks their passwords and MFA, and vouches for them. Examples: Okta, Microsoft Entra ID, Google Workspace.
        - The **service provider (SP)** is the *application* the user wants: the expense tool, the wiki. It holds no passwords at all.

        Before anything works, the two exchange a **trust relationship** in advance: the IdP learns the SP's address, and the SP learns the IdP's address and **public certificate**, so it can verify signatures. After that they never need to talk to each other directly; your browser carries the messages.` },

    { kind: 'sequence', title: 'SP-initiated login',
      body: 'This is the most common path: you start at the app. Step through it.',
      actors: ['Browser', 'Expense app (SP)', 'Company login (IdP)'],
      steps: [
        { from: 0, to: 1, label: 'GET /expenses', note: 'You open the expense app. It does not know who you are yet.' },
        { from: 1, to: 0, label: 'redirect to IdP + login request', dashed: true, note: 'The app sends your browser to the company login, with a small signed or encoded **authentication request** saying who is asking.' },
        { from: 0, to: 2, label: 'GET /sso?request…', note: 'Your browser delivers it. The app and IdP never speak directly.' },
        { at: 2, label: 'you log in (or already are)', note: 'If you already logged in this morning, the IdP skips the password. **That is the "single" in single sign-on.**' },
        { from: 2, to: 0, label: 'page with a signed assertion', dashed: true, note: 'The IdP replies with a signed XML **assertion** about you, wrapped in a form that the browser submits for you.' },
        { from: 0, to: 1, label: 'POST /saml/acs  (assertion)', note: 'The browser posts the assertion to the app’s **assertion consumer** address.' },
        { at: 1, label: 'verify signature, start a session', note: 'The app checks the signature with the IdP’s public certificate, and checks the conditions inside. Then it starts its own session.' }
      ] },

    { kind: 'code', title: 'What an assertion looks like',
      body: 'It is XML, which is wordier than a JWT but contains the same sort of facts. This is a **simplified** sketch. Tap the lines.',
      code: { lang: 'text', src: `
        <Assertion>
          <Issuer>https://idp.company.example</Issuer>
          <Subject>priya@company.example</Subject>
          <Conditions notOnOrAfter="09:20"
                      audience="expense-app" />
          <Attribute name="role">finance</Attribute>
          <Signature>…</Signature>
        </Assertion>`,
        notes: {
          2: 'The **issuer**: which IdP vouches for this. The SP only accepts the one it was set up to trust.',
          3: 'The **subject**: who the assertion is about.',
          4: 'Conditions: a short validity window and the **audience** (which SP it is for). Same ideas as `exp` and `aud` in a JWT.',
          6: '**Attributes**: extra facts such as role or department. Authorization decisions can use them later.',
          7: 'The **signature**: the IdP signs the assertion. Change anything and verification fails, exactly as with a JWT.'
        } } },

    { kind: 'compare', title: 'SP-initiated vs IdP-initiated',
      body: 'There is a second way to begin. Your company portal shows tiles for each app; clicking a tile starts at the IdP.',
      cols: ['SP-initiated', 'IdP-initiated'],
      rows: [
        ['Starts at', 'The application', 'The company portal or dashboard'],
        ['First message', 'The app sends a login request', 'No request: the IdP just sends an assertion'],
        ['Typical trigger', 'Opening a bookmark or a link', 'Clicking an app tile'],
        ['Security note', 'The app can match the reply to its own request', 'Harder to defend against replayed or forged responses']
      ],
      note: 'Most security guidance prefers SP-initiated. Many apps support both, because users love the portal tiles.' },

    { kind: 'concept', title: 'Why companies love SSO',
      body: `SSO is as much about **control** as convenience:

        - **Joiners and leavers.** New starter: create one account and they reach everything. Leaver: disable one account and *every* app closes to them.
        - **One place for MFA.** Enforce a second factor once, at the IdP, and every app inherits it.
        - **One audit trail.** Who logged in where and when, in one place.
        - **No password sprawl.** Fewer passwords means fewer reuse and phishing opportunities.

        These are the reasons large customers *demand* SSO before they will buy a product.` },

    { kind: 'pitfall', title: 'Where SAML bites',
      body: `SAML is powerful and slightly unforgiving.

        - **Expired certificates.** The IdP's signing certificate is configured in the SP. When it expires or is rotated and nobody updates the other side, **every login fails at once**, often on a Monday morning.
        - **Clock skew.** Assertions are valid for minutes. If the SP's clock is off, valid logins are rejected.
        - **XML signatures are fiddly.** Subtle bugs have let attackers sneak in extra content that still passes verification. Never hand-roll a SAML parser; use a mature library.
        - **Wrong audience or address.** A mismatch of one character fails the login with a vague error.` },

    { kind: 'realworld', title: 'When you will meet SAML',
      body: `As a developer you meet SAML mostly from the **selling** side. You build a product, a bigger customer says *"we need SSO with our Okta"*, and you must add a way for their staff to log in through their company IdP.

        You will also see it in universities and public-sector systems, where one login covers many partner sites, and in older enterprise software that predates OIDC.

        The practical advice: use an authentication provider or library that supports **both** SAML and OIDC. Newer systems usually prefer OIDC, but you will still meet SAML for years, and what you now know about IdPs and signed assertions carries straight across.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'In a company’s SSO, which party holds the users’ passwords and performs the actual login?',
      options: ['The identity provider (IdP)', 'The service provider (SP), such as the expense app', 'The browser', 'The assertion'],
      answer: 0,
      why: [null, 'The SP holds no passwords; it relies on the IdP’s word.', 'The browser only carries messages between the two.', 'An assertion is the signed note the IdP produces after login.'],
      explain: 'The IdP authenticates users. The SP trusts a signed assertion from the IdP, which is how one login unlocks many apps.' },

    { type: 'order', after: 3, prompt: 'Put an SP-initiated SAML login in order.',
      items: ['The user opens the app, which does not know them', 'The app redirects the browser to the IdP', 'The user logs in at the IdP, or is already logged in', 'The IdP returns a signed assertion through the browser', 'The app verifies the signature and starts a session'],
      explain: 'The app and IdP never speak directly. The browser carries the request one way and the signed assertion back, and the app trusts the assertion because of the IdP’s signature.' },

    { type: 'tf', after: 4, statement: 'In IdP-initiated login the app first sends a login request, which lets it match the response to that request.', answer: false,
      explain: 'That describes SP-initiated login. In IdP-initiated login the IdP sends an assertion unprompted, so the app has no request to match it against, which is why security guidance prefers SP-initiated.' },

    { type: 'match', prompt: 'Match each SAML term to its meaning.',
      pairs: [['Identity provider', 'The login system that checks users and vouches for them'], ['Service provider', 'The application the user wants to use'], ['Assertion', 'A signed XML statement about the user'], ['Single sign-on', 'Log in once, access many apps'], ['Trust relationship', 'Certificates and addresses exchanged in advance']],
      explain: 'Roles, message and goal. The trust relationship is the setup step that makes everything else possible, and it is also what breaks when a certificate expires.' },

    { type: 'short', q: 'In SAML, what three-letter abbreviation names the application the user wants to log in to?', accept: ['SP'], hint: 'The first word is "service".',
      explain: 'SP stands for service provider. The company’s login system is the IdP (identity provider).' },

    { type: 'bucket', prompt: 'Which of these are reasons a company adopts SSO, and which are not?', buckets: ['A real benefit of SSO', 'Not a benefit'],
      items: [['Disabling one account locks a leaver out of every app', 0], ['MFA can be enforced once, at the IdP', 0], ['Apps no longer need to store the users’ passwords', 0], ['Assertions never expire, so nobody logs in again', 1], ['A signed assertion hides its contents from the browser', 1], ['A single audit trail shows logins across apps', 0]],
      explain: 'SSO centralises control: accounts, MFA and logs. Assertions are short-lived, and signing does not hide anything; it only prevents tampering.' },

    { type: 'cloze', text: 'The IdP sends a signed {{assertion}} through the user’s {{browser}}, and the SP checks the {{signature}} using the IdP’s public certificate.',
      distractors: ['cookie', 'password', 'database'],
      explain: 'The browser is only the courier. Trust comes from the signature, which the SP can check because it was given the IdP’s certificate during setup.' },

    { type: 'scenario', title: 'The enterprise customer wants SSO', intro: 'Your SaaS product has its own passwords. A large customer says: *"We will sign for 2,000 seats, but our staff must log in through our own company login. Can you do SAML?"*',
      meters: { 'security': 50, 'deal': 50 },
      steps: [
        { text: 'How do you approach the integration?',
          choices: [
            { label: 'Use a maintained library or auth provider that supports SAML, and act as the SP', score: 2, effects: { 'security': 20, 'deal': 15 }, feedback: 'SAML’s XML signatures are easy to get subtly wrong. A mature library handles parsing, signature checking and the conditions properly.' },
            { label: 'Write your own XML parser to read the assertion', score: 0, effects: { 'security': -30, 'deal': -10 }, feedback: 'This is how signature-wrapping bugs get written. Verification must be done by well-tested code.' },
            { label: 'Say no: ask them to use passwords like everyone else', score: 1, effects: { 'deal': -30 }, feedback: 'You keep things simple and lose the deal. SSO is a common hard requirement for large customers.' }
          ] },
        { text: 'The customer’s IT team asks how the two sides will trust each other. What do you exchange?',
          choices: [
            { label: 'Metadata: your SP address, their IdP address and public signing certificate', score: 2, effects: { 'security': 15 }, feedback: 'That is the trust relationship. Your app will only accept assertions signed by the certificate you were given.' },
            { label: 'Their users’ passwords, so you can check them', score: 0, effects: { 'security': -40, 'deal': -20 }, feedback: 'The whole point of SSO is that you never see their passwords.' },
            { label: 'A shared password for the whole company', score: 0, effects: { 'security': -30 }, feedback: 'That is not SSO at all, and nobody could be audited or individually locked out.' }
          ] },
        { text: 'Three months later every one of their logins suddenly fails on a Monday. Nothing in your code changed. Most likely cause?',
          choices: [
            { label: 'Their IdP rotated its signing certificate and your app still has the old one', score: 2, effects: { 'security': 10, 'deal': 10 }, feedback: 'Certificate expiry and rotation is the classic SAML outage. Plan the update, and ideally refresh metadata automatically.' },
            { label: 'The assertions have become unreadable because XML is down', score: 0, effects: { 'deal': -10 }, feedback: 'XML is only a format; a format cannot be "down". Signature failure is far more likely.' },
            { label: 'Their users forgot their passwords', score: 0, effects: { 'deal': -15 }, feedback: 'The passwords live at their IdP, and the failure hit everyone at once. That points to the signature setup.' }
          ] }
      ],
      outro: 'The pattern: **use a library, exchange metadata once, and keep an eye on certificate expiry.**' },

    { type: 'explain', prompt: 'Explain single sign-on and SAML to a new colleague: what are the two parties, and what actually moves between them?',
      model: 'Single sign-on means logging in once with a central system and being let into many apps. In SAML, the identity provider (the company login) authenticates the user, and the service provider (the app) trusts it. The browser carries a signed XML assertion from the IdP to the SP, and the SP verifies the signature using a certificate exchanged in advance, then starts its own session.',
      keywords: ['identity provider', 'service provider', 'assertion', 'signed', 'browser', 'certificate', 'once'] }
  ],

  flashcards: [
    { q: 'What is single sign-on (SSO)?', a: 'Logging in once with a central system and being let into many apps without separate passwords.' },
    { q: 'What are the IdP and the SP in SAML?', a: 'The identity provider authenticates users and vouches for them; the service provider is the app that trusts its assertions.' },
    { q: 'What does a SAML assertion contain?', a: 'A signed XML statement: issuer, subject, validity conditions and audience, plus attributes such as role.' },
    { q: 'SP-initiated vs IdP-initiated login?', a: 'SP-initiated starts at the app, which sends a login request. IdP-initiated starts at the company portal and sends an assertion unprompted; it is harder to defend against replay.' },
    { q: 'What commonly breaks SAML logins suddenly?', a: 'An expired or rotated signing certificate, or clock skew between the systems.' }
  ],

  glossary: [
    { term: 'Single sign-on', def: 'Logging in once to a central system and gaining access to many apps without logging in to each.', like: 'One pass accepted by every door in the business park.', aka: ['SSO'] },
    { term: 'SAML', def: 'Security Assertion Markup Language: an older, XML-based standard for exchanging signed login statements between an IdP and an SP, common in enterprises.', like: 'A stamped staff pass in XML form.' },
    { term: 'Service provider', def: 'In SAML, the application the user wants to use, which relies on the IdP to authenticate them.', like: 'A firm in the business park.', aka: ['SP'] },
    { term: 'Assertion', def: 'The signed XML statement from the IdP saying who the user is and under what conditions it is valid.', like: 'The stamped note on the pass.' },
    { term: 'Metadata', def: 'The configuration file exchanged between IdP and SP: addresses and public certificates.', like: 'Swapping contact cards and ID stamps before you start working together.' }
  ],

  takeaways: [
    '**SSO** = log in once at a central login, and many apps trust it.',
    'SAML roles: **IdP** (does the login) and **SP** (the app). The browser carries a **signed XML assertion** between them.',
    'SP-initiated starts at the app; IdP-initiated starts at the portal and is harder to protect.',
    'You will meet SAML when selling to enterprises. Use a library, and watch for certificate expiry.'
  ],

  links: [
    { label: 'OASIS: SAML 2.0 Technical Overview', url: 'https://www.oasis-open.org/standard/saml/' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('au-mfa', {
  eli5: 'Multi-factor authentication asks for two different kinds of proof, such as a password and a code from your phone, and passkeys go further by replacing the password with a key that cannot be phished.',

  cards: [
    { kind: 'concept', title: 'Passwords leak. Now what?',
      body: `Passwords get guessed, reused on other sites, leaked in breaches, and typed into fake login pages by people in a hurry. However well *you* store them (see *Storing Passwords Safely*), the user's copy of the secret lives in their head, and heads are leaky.

        So we add a **second lock**. **Multi-factor authentication (MFA)** means proving yourself with more than one *kind* of evidence. Steal the password and you still cannot get in, because you do not have the second thing.

        The word "kind" matters: a password plus a security question is **two** things you know, which is really one factor twice.` },

    { kind: 'metaphor', title: 'Safe-deposit box',
      body: `At a bank, opening a safe-deposit box needs **two keys**: the one you hold, and the one the bank holds. Neither opens it alone. A thief who steals yours still needs the bank's.

        MFA is the same idea with different kinds of keys. Your password is a key *in your head*. The code on your phone is a key *in your pocket*. Taking both at once from far away is much harder than taking one.

        Where the metaphor stops: bank keys are physical and both have to be present. Online, a phishing page can trick you into handing *both* over, which is why passkeys exist.` },

    { kind: 'compare', title: 'The three factors',
      body: 'Every credential falls into one of three families. Real MFA combines two of them.',
      cols: ['Know', 'Have', 'Are'],
      rows: [
        ['Examples', 'Password, PIN', 'Phone, security key', 'Fingerprint, face'],
        ['Stolen by', 'Phishing, breaches, guessing', 'Theft, SIM-swap, malware', 'Hard to steal, but a copy is possible'],
        ['If it leaks', 'Change it', 'Revoke the device', 'You cannot change your face'],
        ['Used alone', 'Weak', 'Moderate', 'Convenient, not secret']
      ],
      note: 'Biometrics normally unlock something on your device, such as a key, rather than being sent to the website.' },

    { kind: 'concept', title: 'How TOTP codes work',
      body: `The six-digit code in an authenticator app is a **TOTP**: a *time-based one-time password*. The trick is that **no message is ever sent** to your phone.

        At setup the server creates a **secret** and shows it as a QR code. Your app scans it and stores it. Now both sides hold the same secret.

        To make a code, the app takes the secret and the **current 30-second time step** and runs them through an **HMAC** (a keyed hash, from *Digital Signatures & HMAC*). It trims the result to six digits. The server runs the same calculation, and if the digits match, you hold the secret.

        Because the time step changes, the code changes every 30 seconds.` },

    { kind: 'code', title: 'TOTP in four lines',
      body: 'The whole algorithm, simplified. Tap the lines.',
      code: { lang: 'js', src: `
        const step = Math.floor(Date.now() / 1000 / 30);
        const mac  = hmac(secret, step);        // the keyed hash
        const num  = truncate(mac);             // pick 4 bytes
        const code = String(num % 1000000).padStart(6, '0');`,
        notes: {
          1: 'Unix time divided by 30 gives the **time step**: a counter that goes up by one every 30 seconds. Phone and server just need clocks that roughly agree.',
          2: 'An HMAC of the shared secret and the step. Nobody without the secret can predict it.',
          3: 'A standard way to turn the long hash into a single number.',
          4: 'Keep six digits. The codes look random, yet both sides compute them independently.'
        } },
      note: 'The lab that follows lets you watch a code being built from a secret and the clock.' },

    { kind: 'pitfall', title: 'SMS codes: better than nothing, worse than the rest',
      body: `Texting a code is popular because everyone has a phone. But the code travels over the phone network, and that has weaknesses:

        - **SIM-swapping.** An attacker persuades your mobile provider to move your number to *their* SIM. Now your codes go to them.
        - **Interception**, through weaknesses in the phone network.
        - **Phishing.** A fake login page asks for the code and passes it to the real site in seconds.

        SMS still stops the huge crowd of attackers who only have a leaked password, so turn it on if it is all that is offered. Prefer an authenticator app or, better, a passkey.` },

    { kind: 'concept', title: 'Passkeys: a key pair per site',
      body: `**Passkeys** (built on the standards **WebAuthn** and **FIDO2**) replace the password with **public-key cryptography**, which you met in *Encryption* and *Digital Signatures*.

        When you create a passkey for a site, your device makes a **key pair** just for that site. The **public key** goes to the site. The **private key** stays on your device, unlocked by your fingerprint, face or PIN.

        To log in, the site sends a random challenge, your device **signs** it, and the site checks the signature with the public key. There is **nothing secret on the server to steal**, and nothing for you to type or reuse.` },

    { kind: 'sequence', title: 'Logging in with a passkey',
      body: 'Notice that no secret ever crosses the network.',
      actors: ['Browser', 'Device', 'Website'],
      steps: [
        { from: 0, to: 2, label: 'start login for priya', note: 'You tell the site who you are. No password.' },
        { from: 2, to: 0, label: 'random challenge', dashed: true, note: 'The site sends a fresh random value that is different every time.' },
        { from: 0, to: 1, label: 'sign this challenge for example.com', note: 'The browser passes the challenge to your device, together with the **domain** it is talking to.' },
        { at: 1, label: 'you unlock with face or fingerprint', note: 'The device asks you to prove you are present. The biometric never leaves the device.' },
        { from: 1, to: 0, label: 'signature (made with private key)', dashed: true, note: 'It signs the challenge with the private key for **this site**.' },
        { from: 0, to: 2, label: 'send signature', note: 'The browser forwards it.' },
        { at: 2, label: 'verify with stored public key', note: 'Signature checks out, so you are you. The server only ever held a public key.' }
      ] },

    { kind: 'concept', title: 'Why passkeys resist phishing',
      body: `A phishing page works by looking like the real site. But a passkey is **bound to the website's domain**. Your device will only use the key for \`example.com\`, and the browser tells it the real domain it is on.

        On \`examp1e-login.com\`, the device simply finds no passkey and offers nothing to sign. There is no password to be fooled out of you.

        That is the big leap. Passwords and one-time codes can be *given away*. A passkey cannot be handed over by accident.

        Passkeys can also be synced between your devices by your phone or password manager, and a physical **security key** works the same way.` },

    { kind: 'pitfall', title: 'Account recovery is the weak link',
      body: `You can build a fortress of passkeys and authenticator codes, then add a button: **"Forgot your password? We will email you a link."**

        Now an attacker only needs to break into your *email*, or talk a support agent into resetting things, and all the strong factors are bypassed.

        A system is only as strong as its **easiest way in**. Good recovery is slow, deliberate and has friction: backup codes saved in advance, a second recovery device, delays and notifications, and support staff trained to resist smooth talkers.

        Design recovery as carefully as login, and make sure it is not weaker than the lock it replaces.` },

    { kind: 'layers', title: 'A practical ranking',
      body: 'Roughly strongest at the top. Experts argue over the details, but this order is widely agreed.',
      layers: [
        { label: 'Passkeys / security keys', note: 'Phishing-resistant, nothing secret to steal', tone: 'good', icon: '🔐' },
        { label: 'Authenticator app (TOTP)', note: 'Good, but a code can be phished in real time', tone: 'info', icon: '📱' },
        { label: 'SMS or email codes', note: 'Better than nothing, vulnerable to SIM-swap and interception', tone: 'warn', icon: '💬' },
        { label: 'Password only', note: 'One leak away from takeover', tone: 'bad', icon: '🔑' }
      ] }
  ],

  activities: [
    { type: 'bucket', after: 2, prompt: 'Which factor is each of these?', buckets: ['Know', 'Have', 'Are'],
      items: [['A password', 0], ['A hardware security key', 1], ['A fingerprint', 2], ['A PIN', 0], ['An authenticator app on your phone', 1], ['Your face, scanned by the phone', 2]],
      explain: 'Factors are about the *kind* of evidence. Two passwords would be one factor twice. A password plus an app code is two different kinds, which is true MFA.' },

    { type: 'mcq', after: 4, q: 'How does the server know your six-digit authenticator code is right, without sending anything to your phone?',
      options: ['It shares a secret with the app and computes the same code from the secret and the current 30-second step', 'It texts the code to the phone in advance and compares it', 'It asks the phone for the code over the internet', 'It stores every code the app will ever show'],
      answer: 0,
      why: [null, 'That describes SMS codes, not authenticator apps.', 'The app works offline; it never contacts the server.', 'There would be infinitely many; the server computes them as needed.'],
      explain: 'Both sides hold the same secret and the same clock, so each can run the HMAC independently and get the same digits. That is why it works with no signal at all.' },

    { type: 'tf', after: 5, statement: 'SMS codes are vulnerable to SIM-swapping, where an attacker has your number moved to their SIM.', answer: true,
      explain: 'If the number moves, the codes go to the attacker. SMS is still better than a password alone, but it is the weakest common second factor.' },

    { type: 'order', prompt: 'Put a passkey login in order.',
      items: ['The site sends a random challenge', 'The browser passes it to the device with the site’s domain', 'The user unlocks the device with a fingerprint or PIN', 'The device signs the challenge with the private key', 'The site verifies the signature with the stored public key'],
      explain: 'The challenge is fresh each time, so a recorded signature is useless later. The private key never leaves the device; the site only ever stores the public key.' },

    { type: 'match', prompt: 'Match each term to its meaning.',
      pairs: [['TOTP', 'A code made from a shared secret and the current time step'], ['SIM-swapping', 'Moving a victim’s phone number to the attacker’s SIM'], ['Passkey', 'A per-site key pair, with the private key kept on your device'], ['WebAuthn', 'The browser standard behind passkeys'], ['Recovery flow', 'The "I lost access" route, often the weakest link']],
      explain: 'The first three are the building blocks. The last is the reminder that every strong lock needs an equally strong way back in.' },

    { type: 'short', q: 'Roughly how many seconds does a typical TOTP time step last (so the code changes this often)?', accept: ['30'], hint: 'Half a minute.',
      explain: 'The usual step is 30 seconds. Servers often accept the neighbouring step too, to forgive small clock differences.' },

    { type: 'scenario', title: 'The phished employee', intro: 'A colleague, Sam, entered his password and his SMS code into a very convincing fake login page. The attacker used both within a minute to log into the real site. You are asked to improve things.',
      meters: { 'security': 40, 'convenience': 50 },
      steps: [
        { text: 'Why did the second factor not save Sam?',
          choices: [
            { label: 'The fake page relayed his password and code to the real site in real time, so both were still valid', score: 2, effects: { 'security': 5 }, feedback: 'Exactly. SMS codes and app codes can be phished: they are typed into whatever page asks. That is the weakness of "typed" factors.' },
            { label: 'MFA is useless and should be removed', score: 0, effects: { 'security': -25 }, feedback: 'MFA still blocks the huge majority of attacks that only have a leaked password. It just has limits.' },
            { label: 'His phone must have been stolen', score: 0, effects: { 'security': -5 }, feedback: 'Nothing was stolen. He gave the code away himself, to a page that looked right.' }
          ] },
        { text: 'What is the strongest upgrade you can offer?',
          choices: [
            { label: 'Move staff to passkeys or hardware security keys', score: 2, effects: { 'security': 30, 'convenience': 10 }, feedback: 'A passkey is bound to the real domain. On a fake site the device has nothing to sign, so the phishing attempt fails completely.' },
            { label: 'Make the SMS code six digits longer', score: 0, effects: { 'security': -5 }, feedback: 'Longer codes do not help when the victim types them into the attacker’s page.' },
            { label: 'Send a second SMS code to confirm the first', score: 0, effects: { 'security': -5, 'convenience': -15 }, feedback: 'Two phishable codes are still phishable, and now it is more annoying.' }
          ] },
        { text: 'People will lose phones. How should recovery work for the new setup?',
          choices: [
            { label: 'Backup codes saved at enrolment, a second registered device, and a slow, verified support process', score: 2, effects: { 'security': 20, 'convenience': -5 }, feedback: 'Recovery should have friction, because it is the route an attacker will target. Prepare it in advance.' },
            { label: 'Email a "reset everything" link to anyone who clicks Forgot', score: 0, effects: { 'security': -35, 'convenience': 15 }, feedback: 'Now a stolen mailbox bypasses every strong factor you just deployed.' },
            { label: 'Let support remove MFA if the caller sounds confident', score: 0, effects: { 'security': -40 }, feedback: 'Social engineering is the oldest trick going. Never rely on someone sounding convincing.' }
          ] }
      ],
      outro: 'The pattern: **prefer factors that cannot be typed into a fake page, and protect recovery as much as login.**' },

    { type: 'explain', prompt: 'Explain why a passkey is harder to phish than a password plus a texted code.',
      model: 'A password and a texted code are things the user types, so a fake site can collect them and use them at once on the real site. A passkey is a private key bound to the real website’s domain. The device only signs challenges for that domain, so on a lookalike site there is nothing to sign, and no secret ever leaves the device.',
      keywords: ['phishing', 'domain', 'private key', 'sign', 'challenge', 'type', 'fake site'] }
  ],

  flashcards: [
    { q: 'What are the three authentication factors?', a: 'Something you know, something you have, something you are. MFA combines two or more different kinds.' },
    { q: 'How does TOTP work?', a: 'App and server share a secret at setup; each computes an HMAC of the secret and the current 30-second time step and trims it to six digits.' },
    { q: 'Why are SMS codes weak?', a: 'SIM-swapping, interception on the phone network and real-time phishing. Still better than a password alone.' },
    { q: 'How do passkeys work?', a: 'The device creates a key pair per site. The site stores the public key; the private key stays on the device and signs a fresh challenge at each login.' },
    { q: 'Why is account recovery called the weak link?', a: 'If "forgot password" or support can bypass your strong factors, attackers will simply attack the recovery route.' }
  ],

  glossary: [
    { term: 'Multi-factor authentication', def: 'Proving identity with two or more different kinds of evidence: something you know, have or are.', like: 'A safe-deposit box that needs two keys.', aka: ['MFA', '2FA'] },
    { term: 'TOTP', def: 'Time-based one-time password: a short code derived from a shared secret and the current time step.', like: 'A password that both sides can predict but nobody else can.' },
    { term: 'SIM-swapping', def: 'An attack where someone tricks a mobile provider into moving a victim’s number to a SIM they control.', like: 'Getting the post office to redirect your mail to a stranger.' },
    { term: 'Passkey', def: 'A phishing-resistant credential: a per-site key pair whose private key stays on your device, based on WebAuthn and FIDO2.', like: 'A key that only fits one real door.', aka: ['WebAuthn', 'FIDO2'] },
    { term: 'Security key', def: 'A small physical device that stores passkeys and signs login challenges when you touch it.', like: 'A house key you carry on your keyring.' }
  ],

  takeaways: [
    '**Factors:** something you know, have or are. MFA combines different kinds.',
    '**TOTP** = HMAC(shared secret, 30-second step), trimmed to six digits; no message is sent.',
    '**SMS codes** are weak (SIM-swap, phishing). **Passkeys** use a per-site key pair and resist phishing.',
    'Account recovery is the weak link; design it as carefully as the login.'
  ],

  links: [
    { label: 'passkeys.dev: What are passkeys?', url: 'https://passkeys.dev/' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('au-choosing', {
  eli5: 'Choosing an auth strategy starts with who is calling: sessions for classic websites, an identity provider with PKCE for apps, client credentials for machines, and buying login rather than building it.',

  cards: [
    { kind: 'concept', title: 'The wrong question and the right one',
      body: `A team starts a new project. Someone says: *"Let's use JWTs."* Someone else says: *"Sessions are simpler."* A heated hour follows, and neither side asked the useful question.

        You now know nine pieces: passwords, Basic auth, sessions, tokens, JWTs, OAuth, OIDC, SAML and MFA. The skill is not picking a favourite. It is asking, in order:

        1. **Who or what is calling?** A browser? A phone app? Another service?
        2. **Who already holds their identity?** You, a customer's company, or Google?
        3. **How fast must access be cut off?**

        The answers choose for you.` },

    { kind: 'diagram', title: 'A decision map',
      body: 'Start at the top and follow the caller.',
      nodes: [
        { id: 'q', label: 'Who is calling?', icon: '❓', x: 1, y: 0, tone: 'accent' },
        { id: 'web', label: 'Browser, same site', x: 0, y: 1 },
        { id: 'app', label: 'SPA or mobile app', x: 1, y: 1 },
        { id: 'svc', label: 'Another service', x: 2, y: 1 },
        { id: 'r1', label: 'Server sessions', icon: '🎟️', x: 0, y: 2, tone: 'good' },
        { id: 'r2', label: 'Code + PKCE via an IdP', icon: '🔐', x: 1, y: 2, tone: 'good' },
        { id: 'r3', label: 'Client credentials or API key', icon: '🤖', x: 2, y: 2, tone: 'good' }
      ],
      edges: [
        { from: 'q', to: 'web' }, { from: 'q', to: 'app' }, { from: 'q', to: 'svc' },
        { from: 'web', to: 'r1' }, { from: 'app', to: 'r2' }, { from: 'svc', to: 'r3' }
      ],
      caption: 'A first guess, not a law. Real systems often use more than one of these side by side.' },

    { kind: 'compare', title: 'Sessions vs JWTs for a classic web app',
      body: 'A traditional website, where one server-side app serves pages and handles forms, is the easiest case.',
      cols: ['Server sessions', 'JWT access tokens'],
      rows: [
        ['Revoking a login', 'Delete the record: instant', 'Wait for expiry, or add a denylist'],
        ['Setup', 'Built into every framework', 'More to assemble and get right'],
        ['Scaling', 'Needs a shared store', 'No lookup per request'],
        ['Browser exposure', '`HttpOnly` cookie, invisible to scripts', 'Often placed where scripts can read it'],
        ['Best when', 'One app, one team, one site', 'Many services must verify without a shared database']
      ],
      note: 'For a classic web app, sessions are usually simpler **and** safer. JWTs solve problems you may not have.' },

    { kind: 'concept', title: 'Single-page apps and mobile apps',
      body: `A **single-page app** (SPA) is a JavaScript app running in the browser. A **mobile app** runs on the phone. Neither can keep a secret, since anyone can inspect the code.

        For both, the modern answer is the **authorization code flow with PKCE**, through an **identity provider**, using OIDC for "who is this?". You do not handle passwords at all.

        - **Mobile:** use the system browser for login, not a view embedded in your app, and keep tokens in the phone's secure storage (Keychain or Keystore).
        - **SPA:** the storage dilemma from the tokens lesson applies. A popular safer design puts a small backend between the browser and everything else, shown on the next card.` },

    { kind: 'sequence', title: 'A SPA with a small backend',
      body: 'The backend does the OAuth work and keeps the tokens, so the browser only ever holds a cookie. It is sometimes called the backend-for-frontend pattern.',
      actors: ['Browser', 'Backend', 'Identity provider'],
      steps: [
        { from: 0, to: 1, label: 'GET /login', note: 'The SPA sends the user to its own backend to sign in.' },
        { from: 1, to: 2, label: 'redirect: authorize (code + PKCE)', note: 'The backend starts the OIDC flow with the identity provider. The user logs in there, with MFA or passkeys if the provider offers them.' },
        { from: 2, to: 1, label: 'code, then tokens', dashed: true, note: 'The code comes back to the backend, which swaps it for an ID token and access token. The tokens never reach the browser.' },
        { from: 1, to: 0, label: 'Set-Cookie: sid (HttpOnly, Secure, SameSite)', dashed: true, note: 'The backend starts its **own session**. The browser gets just a cookie, which scripts cannot read.' },
        { from: 0, to: 1, label: 'GET /api/orders  + cookie', note: 'From now on the SPA talks to its backend like a classic web app.' },
        { at: 1, label: 'attach Bearer token, call the API', note: 'The backend adds the access token when it calls other services for the user.' }
      ] },

    { kind: 'concept', title: 'Machine-to-machine',
      body: `When a service calls another service, with no human in the loop, you have two good options:

        - **Client credentials flow**: the calling service proves itself with its own ID and secret and gets a **short-lived access token**, with scopes. Tokens expire, can be limited, and are validated like any others.
        - **API keys**: a long random string identifying the calling application. Simpler to start with and widely supported, but long-lived, so they need careful storage, per-client keys and rotation.

        Pick API keys for simple partner integrations and client credentials when you already run an identity provider or need scoped, expiring access.` },

    { kind: 'compare', title: 'Build vs buy',
      body: 'Passwords, MFA, recovery, social login, SSO, sessions... that is a lot. Three broad routes:',
      cols: ['Build it yourself', 'Hosted provider', 'Self-hosted open source'],
      rows: [
        ['Examples', 'Your own login code', 'Auth0, Amazon Cognito, similar services', 'Keycloak and similar'],
        ['Effort', 'Highest, and for ever', 'Lowest to start', 'Medium: you run it'],
        ['Control', 'Total', 'Limited to what they offer', 'High'],
        ['Risk', 'You own every security bug', 'Shared; vendor dependence', 'You patch and operate it'],
        ['Cost shape', 'Engineers’ time', 'Often per user', 'Servers and people']
      ],
      note: 'Hosted providers typically speak OIDC and SAML, so your app only learns one protocol however people sign in.' },

    { kind: 'pitfall', title: 'Do not build your own login unless you must',
      body: `"It is just a username and a password" is the start of many long projects. A real login system also needs:

        - safe password hashing and secret handling
        - reset and recovery flows (the weak link!)
        - rate limiting and lock-outs against guessing
        - MFA and passkeys, and device management
        - session handling, logout everywhere, and audit logs
        - social login, and SSO for the enterprise customer who is bound to ask

        Each is a place for a subtle bug that a specialist has already fixed. Build your own only when you have a clear reason, such as strict regulatory control or unusual requirements. Otherwise, **buy or adopt**, and spend your time on what makes your product different.` },

    { kind: 'steps', title: 'A decision checklist',
      body: 'Run through these questions the next time you start a project.',
      steps: [
        { title: 'Who is calling?', body: 'Browser on your own site, SPA or mobile app, or another service? This picks the family of solutions.' },
        { title: 'Can a provider do it?', body: 'Default to an identity provider (hosted or self-hosted) unless you have a reason not to.' },
        { title: 'Session or token at the edge?', body: 'Sessions for a classic web app. Short-lived tokens when several services must verify identity independently.' },
        { title: 'How quickly must you revoke?', body: 'Need instant cut-off? Prefer sessions or opaque tokens. Using JWTs? Keep them short-lived and revoke refresh tokens.' },
        { title: 'What is the second factor and recovery story?', body: 'Offer passkeys or an authenticator app, and decide recovery before launch, not after the first lock-out.' },
        { title: 'Check the basics', body: 'HTTPS everywhere, cookie flags set, tokens short-lived, secrets out of source code, and authorization checked on the server. Authorization is the next module.' }
      ] },

    { kind: 'metaphor', title: 'Pick the vehicle for the journey',
      body: `Nobody argues about whether bicycles beat lorries. You pick for the trip.

        - **A small startup with one web app** is a bicycle: framework sessions, with login on a provider's hosted page and "Sign in with Google" through OIDC. Almost no custom security code.
        - **A product sold to businesses** is a bicycle plus a rack: the same, plus SSO, with customers connecting their company login through SAML or OIDC.
        - **A system of many services** is a lorry fleet: users log in once through an identity provider, services verify short-lived tokens with its public keys, and call each other with client credentials.

        All lean on standards, and none writes its own cryptography.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'You are building a traditional server-rendered website used by browsers on one domain, with one back end. What is usually the best default?',
      options: ['Server-side sessions with a secure cookie', 'JWT access tokens kept in localStorage', 'Basic auth on every request', 'An API key per user'],
      answer: 0,
      why: [null, 'It works, but exposes the token to scripts and is harder to revoke. It solves problems this app does not have.', 'Basic auth sends the password every time and has no proper logout.', 'API keys identify applications, not people.'],
      explain: 'Sessions come built into the framework, are easy to revoke and keep the ID in an `HttpOnly` cookie. For a classic web app they are usually both simpler and safer.' },

    { type: 'tf', after: 3, statement: 'A single-page app should store a client secret in its JavaScript so it can call the token endpoint securely.', answer: false,
      explain: 'Anything shipped to the browser can be read by anyone, so a SPA cannot keep a secret. It uses authorization code with PKCE instead, or hands the job to a small backend that can keep secrets.' },

    { type: 'multi', after: 7, q: 'Which are good reasons to buy or adopt an identity provider instead of writing your own login?',
      options: ['Password reset, MFA and rate limiting are easy to get subtly wrong', 'Enterprise customers will ask for SAML or OIDC single sign-on', 'It means you need no HTTPS', 'Specialists have already fixed bugs you have not met yet', 'It makes authorization checks in your code unnecessary'],
      answers: [0, 1, 3],
      explain: 'A provider carries the long tail of security details and standards support. It does not remove the need for HTTPS, nor for deciding in your own code what each user may do.' },

    { type: 'bucket', prompt: 'Pick the best fit for each case.', buckets: ['Server sessions', 'Code + PKCE via an IdP', 'Client credentials or API key'],
      items: [['An internal admin site, rendered on the server', 0], ['A native iOS app that signs users in', 1], ['A nightly job pushing data to a partner’s API', 2], ['A React single-page app where users sign in with Google', 1], ['A small blog with a login for the three authors', 0], ['The billing service calling the invoicing service', 2]],
      explain: 'Match the caller to the credential. People at a browser on your site get sessions; apps that cannot keep secrets use PKCE via an IdP; machines use their own credentials.' },

    { type: 'match', prompt: 'Match each approach to its best use.',
      pairs: [['Server sessions', 'Classic web app on one domain'], ['Authorization code + PKCE', 'SPAs and mobile apps signing users in'], ['Client credentials', 'A service calling another, with scoped short-lived tokens'], ['API key', 'Simple partner or script access identifying an application'], ['Hosted identity provider', 'Avoiding building login, MFA and SSO yourself']],
      explain: 'These are the five tools the previous nine lessons produced. Each is the simplest correct answer to one particular question.' },

    { type: 'scenario', title: 'Three systems, three answers', intro: 'You are the new technical lead at a company with three projects, all needing authentication. Make the call on each.',
      meters: { 'security': 50, 'simplicity': 50 },
      steps: [
        { text: 'Project one: an internal HR portal. A server-rendered site, one back end, 200 staff. How do people log in and stay logged in?',
          choices: [
            { label: 'Company login through OIDC or SAML, then a normal server-side session', score: 2, effects: { 'security': 20, 'simplicity': 15 }, feedback: 'Staff already have a company identity, so the IdP does the login, and a session keeps the site simple and easy to revoke.' },
            { label: 'Build a password database and JWTs from scratch', score: 0, effects: { 'security': -20, 'simplicity': -25 }, feedback: 'You duplicate accounts that already exist and take on every login security detail yourself.' },
            { label: 'Basic auth with a shared team password', score: 0, effects: { 'security': -35 }, feedback: 'A shared password means no audit trail, no individual revocation and no MFA.' }
          ] },
        { text: 'Project two: a mobile app for customers, with a back-end API behind it.',
          choices: [
            { label: 'Authorization code with PKCE through the system browser, tokens in secure storage', score: 2, effects: { 'security': 25 }, feedback: 'Exactly the recommended pattern. The app never touches a password, and tokens sit in the Keychain or Keystore.' },
            { label: 'Embed a client secret in the app so it can authenticate', score: 0, effects: { 'security': -30 }, feedback: 'Anyone can unpack an app and read the secret. Public clients must not rely on one.' },
            { label: 'Ask the user for their password on every API call', score: 0, effects: { 'security': -20, 'simplicity': -15 }, feedback: 'That repeats the problems of Basic auth, and spreads the password around.' }
          ] },
        { text: 'Project three: a reporting service that pulls data from five internal services every night. No humans involved.',
          choices: [
            { label: 'Client credentials: short-lived, scoped tokens from the identity provider', score: 2, effects: { 'security': 20, 'simplicity': 5 }, feedback: 'Each service gets its own identity and narrow scopes, and tokens expire quickly.' },
            { label: 'Use one engineer’s login for the script', score: 0, effects: { 'security': -30 }, feedback: 'When that engineer leaves or changes password, reports break, and the script has all their power.' },
            { label: 'Skip authentication, since it is all internal', score: 0, effects: { 'security': -40 }, feedback: 'One compromised machine could then read everything. Internal does not mean trusted.' }
          ] }
      ],
      outro: 'The pattern: **match the credential to the caller, and lean on an identity provider where you can.**' },

    { type: 'scenario', title: 'Build or buy?', intro: 'A four-person startup is building a project-management tool. The founder wants to "own everything", including login. Sales has already mentioned that a big customer will want SSO.',
      meters: { 'time to launch': 60, 'security': 50 },
      steps: [
        { text: 'The founder asks how you will build login.',
          choices: [
            { label: 'Adopt a hosted identity provider for login, MFA and social sign-in', score: 2, effects: { 'time to launch': 15, 'security': 20 }, feedback: 'Weeks of risky work become an afternoon of configuration, and the team focuses on the product.' },
            { label: 'Write everything in-house: hashing, resets, MFA, sessions, SSO', score: 0, effects: { 'time to launch': -35, 'security': -15 }, feedback: 'The team would spend months on features customers do not see, with plenty of room for subtle mistakes.' },
            { label: 'Use a quick home-made login now and "fix it later"', score: 1, effects: { 'time to launch': 5, 'security': -20 }, feedback: 'Migrating users off a home-made login later is painful, and meanwhile real accounts depend on it.' }
          ] },
        { text: 'Six months later the big customer demands SSO through their company IdP. What does your earlier choice give you?',
          choices: [
            { label: 'Turn on the provider’s SAML or OIDC enterprise connection for that customer', score: 2, effects: { 'time to launch': 10, 'security': 15 }, feedback: 'A provider that supports enterprise connections turns a feature that takes months into a configuration task.' },
            { label: 'Rewrite the login layer from scratch to support SAML', score: 0, effects: { 'time to launch': -30 }, feedback: 'Painful and avoidable. This is the cost of building login yourself.' },
            { label: 'Tell the customer SSO is unsupported', score: 1, effects: { 'time to launch': 5 }, feedback: 'You keep your schedule and lose a big customer. Enterprises commonly treat SSO as non-negotiable.' }
          ] }
      ],
      outro: 'The pattern: **do not build your own login unless you must. Spend the effort where your product is different.**' },

    { type: 'explain', prompt: 'A colleague says: "JWTs are modern, so we should use them for our new traditional website." Respond with a balanced view.',
      model: 'JWTs are useful when many services must verify identity without a shared store, but they are hard to revoke and often end up somewhere scripts can read. For a classic website with one back end, server-side sessions in an HttpOnly cookie are usually simpler and safer, and easy to revoke. Better still, let an identity provider handle the login itself. Choose by who is calling and how fast access must be cut off, not by fashion.',
      keywords: ['sessions', 'revoke', 'simpler', 'safer', 'identity provider', 'cookie', 'who is calling'] }
  ],

  flashcards: [
    { q: 'Which approach suits a classic server-rendered web app?', a: 'Server-side sessions in an `HttpOnly`, `Secure`, `SameSite` cookie. Usually simpler and safer than JWTs.' },
    { q: 'What do SPAs and mobile apps use?', a: 'Authorization code with PKCE through an identity provider (OIDC for identity). They cannot keep a client secret.' },
    { q: 'How should services authenticate to each other?', a: 'Client credentials (short-lived scoped tokens) or API keys for simpler cases.' },
    { q: 'Build or buy login?', a: 'Do not build your own unless you must. Use a provider such as Auth0 or Amazon Cognito, or self-hosted Keycloak.' },
    { q: 'What three questions begin an auth decision?', a: 'Who is calling? Who holds their identity? How fast must access be revoked?' }
  ],

  glossary: [
    { term: 'Single-page app', def: 'A web app whose JavaScript runs in the browser and calls APIs, rather than loading new pages from the server each time.', like: 'A shop where the shelves are rearranged without leaving the room.', aka: ['SPA'] },
    { term: 'Public client', def: 'An app, such as a SPA or mobile app, that cannot keep a secret because its code is inspectable.', like: 'A safe whose combination is printed on it.' },
    { term: 'Backend for frontend', def: 'A small server that sits between a browser app and other services, holding the tokens and giving the browser a session cookie.', like: 'A receptionist who holds your pass.', aka: ['BFF'] },
    { term: 'Hosted identity provider', def: 'A managed service (such as Auth0 or Amazon Cognito) that handles login, MFA and single sign-on for your app.', like: 'Hiring a security firm instead of training your own guards.' },
    { term: 'Keycloak', def: 'An open-source identity provider you run yourself, supporting OIDC, OAuth and SAML.', like: 'Owning the security desk, rather than renting one.' }
  ],

  takeaways: [
    'Ask **who is calling** first: browser on your site, SPA or mobile app, or another service.',
    'Classic web app: **sessions**. SPA or mobile: **code + PKCE via an IdP**. Machines: **client credentials or API keys**.',
    '**Do not build your own login unless you must.** Buy or adopt, and spend effort on your product.',
    'Whatever you choose: HTTPS, short-lived tokens, strong second factors, careful recovery.'
  ],

  links: [
    { label: 'OWASP: Authentication Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Authentication_Cheat_Sheet.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('authn', {
  title: 'The Identity Thief',
  intro: 'A shapeshifter is trying to log in as everyone. Prove you know sessions, tokens, JWTs, OAuth, OIDC, SAML and MFA well enough to stop it.',
  questions: [
    { type: 'mcq', q: 'A user logs in successfully. A moment later they try to open the admin panel and are refused. Which statement is right?',
      options: ['Authentication succeeded; authorization refused the action', 'Authentication failed, so the login should be retried', 'Authorization succeeded; authentication refused the action', 'The session cookie must be missing'],
      answer: 0,
      explain: 'Logging in proved **who** they are (authentication). Being refused the admin panel is a decision about **what** they may do (authorization).' },
    { type: 'tf', statement: 'Basic authentication is safe over plain HTTP because the password is Base64-encoded.', answer: false,
      explain: 'Base64 is an encoding, not encryption: anyone who sees the header can decode it instantly. Basic auth needs HTTPS.' },
    { type: 'match', prompt: 'Match each cookie attribute to what it does.',
      pairs: [['HttpOnly', 'Scripts on the page cannot read the cookie'], ['Secure', 'Only sent over HTTPS'], ['SameSite', 'Limits sending it on cross-site requests'], ['Max-Age', 'How long until the cookie expires']] },
    { type: 'multi', q: 'Which of these are true about a JWT?',
      options: ['Anyone holding it can read the payload', 'The signature lets the server detect tampering', 'The payload is encrypted by default', 'It is hard to revoke before it expires', 'It must always be stored in localStorage'],
      answers: [0, 1, 3],
      explain: 'A standard JWT is **signed, not encrypted**: readable by anyone, tamper-evident thanks to the signature, and valid until `exp` unless you add a deny-list. Where to store it is a trade-off, not a rule.' },
    { type: 'spot', prompt: 'This JWT check has a dangerous flaw. Tap the line.',
      code: { lang: 'js', src: `
        function verify(token, secret) {
          const [h, p, sig] = token.split('.');
          const header = JSON.parse(b64url(h));
          if (header.alg === 'none') return JSON.parse(b64url(p));
          if (sign(h + '.' + p, secret) !== sig) throw new Error('bad signature');
          const claims = JSON.parse(b64url(p));
          if (claims.exp * 1000 < Date.now()) throw new Error('expired');
          return claims;
        }` },
      lines: [4],
      explain: 'Line 4 accepts unsigned tokens: an attacker sets `alg: none`, writes any claims they like and walks in. A verifier must insist on the algorithm it expects.' },
    { type: 'order', prompt: 'Put the OAuth 2.0 authorization-code flow with PKCE in order.',
      items: ['The app redirects you to the authorization server with a code challenge', 'You log in there and approve the requested scopes', 'The authorization server redirects back to the app with a short-lived code', 'The app swaps the code plus its code verifier for tokens', 'The app calls the API with the access token'],
      explain: 'You only ever type your password at the authorization server. The code is useless without the verifier, which is what PKCE adds.' },
    { type: 'bucket', prompt: 'Which standard is it?', buckets: ['OAuth 2.0', 'OpenID Connect', 'SAML'],
      items: [['Lets a printing app read your photos without your password', 0], ['Issues an ID token describing who logged in', 1], ['XML assertions passed from an IdP to a service provider', 2], ['Scopes like `photos.read`', 0], ['Powers most "Sign in with…" buttons', 1], ['Common for corporate single sign-on into older enterprise apps', 2]],
      explain: 'OAuth delegates **access**. OIDC adds **identity** on top of OAuth. SAML is an older XML-based SSO standard still common in enterprises.' },
    { type: 'short', q: 'Which OAuth parameter, sent out and checked on the way back, protects the redirect against CSRF?', accept: ['state'], hint: 'A random value the app remembers.',
      explain: 'The app sends a random `state` value and checks that the same value comes back on the redirect, so an attacker cannot inject their own authorization response.' },
    { type: 'mcq', q: 'Your bank texts you a login code. Why do security teams consider SMS the weakest common second factor?',
      options: ['Attackers can hijack a phone number with a SIM swap', 'SMS codes are always longer than authenticator codes', 'SMS does not work outside the UK', 'Text messages are encrypted end to end'],
      answer: 0,
      explain: 'If an attacker convinces a mobile provider to move your number to their SIM, they receive your codes. Authenticator apps and passkeys are not tied to your phone number.' },
    { type: 'ab', q: 'Which login check is safer?',
      a: { lang: 'js', label: 'Keep the session id', src: `
        app.post('/login', async (req, res) => {
          const user = await checkPassword(req.body);
          req.session.userId = user.id;
          res.redirect('/');
        });` },
      b: { lang: 'js', label: 'Regenerate the session id', src: `
        app.post('/login', async (req, res) => {
          const user = await checkPassword(req.body);
          await req.session.regenerate();
          req.session.userId = user.id;
          res.redirect('/');
        });` },
      answer: 'b',
      explain: 'Issuing a fresh session id at login defeats **session fixation**, where an attacker plants a known session id on the victim before they log in.' },
    { type: 'cloze', text: 'A short-lived {{access}} token is sent on each API call. When it expires, the app uses a longer-lived {{refresh}} token to get a new one, without asking the user to log in {{again}}.',
      distractors: ['session', 'ID', 'never'],
      explain: 'Short access tokens limit the damage if one leaks; the refresh token lets the app renew them quietly, and can be revoked on the server.' },
    { type: 'tf', statement: 'Passkeys resist phishing because the key pair is tied to the real website, so a look-alike site cannot use it.', answer: true,
      explain: 'A passkey only signs challenges for the site it was created for. A fake domain gets nothing useful, even if the user is fooled.' }
  ]
});

KS.sheet('authn', {
  title: 'Authentication cheat sheet',
  sections: [
    { title: 'The basics', md: `- **Authentication**: who are you? **Authorization**: what may you do?
- Factors: something you **know** (password), **have** (phone, key), **are** (fingerprint).
- **Basic auth**: \`Authorization: Basic base64(user:pass)\` on every request. Encoding, not encryption. HTTPS only.
- Hash passwords with a slow, salted algorithm (Argon2id, bcrypt). Never store them in plain text.` },
    { title: 'Sessions vs tokens', md: `| | Server sessions | Self-contained tokens (JWT) |
|---|---|---|
| State lives | on the server | inside the token |
| Revoke | delete the session | wait for expiry or keep a deny-list |
| Many servers | need a shared store | any server can verify |
| Typical fit | classic web apps | APIs, mobile, service-to-service |

Cookies: \`HttpOnly; Secure; SameSite=Lax\`. Regenerate the session id at login.` },
    { title: 'JWT', md: `- \`header.payload.signature\`, each part base64url-encoded.
- **Signed, not encrypted**: never put secrets in the payload.
- Always check: signature, \`exp\`, \`iss\`, \`aud\`. **Reject \`alg: none\`**.
- HS256 = shared secret. RS256 / ES256 = private key signs, public key verifies.
- Keep access tokens short-lived; renew with a refresh token.` },
    { title: 'OAuth 2.0', md: `Delegated **access**, not login. Roles: resource owner (you), client (the app), authorization server, resource server (the API).

| Flow | Use for |
|---|---|
| Authorization code + **PKCE** | web apps, SPAs, mobile |
| Client credentials | machine to machine |
| Implicit, password | deprecated — do not use |

\`state\` stops CSRF on the redirect. **Scopes** limit what the token may do.` },
    { title: 'OIDC and SAML', md: `- **OpenID Connect** = OAuth + identity: an **ID token** (a JWT about the user), a userinfo endpoint and discovery. "Sign in with…" buttons.
- **SAML**: older XML standard for enterprise single sign-on. **IdP** (identity provider) vouches for the user to the **SP** (service provider) with a signed assertion.
- **SSO**: log in once at the IdP, get into many apps.` },
    { title: 'MFA and passkeys', md: `- **TOTP**: HMAC of a shared secret and the current 30-second step → 6 digits.
- **SMS codes**: better than nothing, but SIM swaps defeat them.
- **Passkeys (WebAuthn)**: a key pair per site; phishing-resistant; no shared secret to leak.
- **Recovery flows** are often the weakest link: protect them as well as login.` },
    { title: 'Choosing', md: `| Caller | Good default |
|---|---|
| Server-rendered web app | sessions with secure cookies |
| SPA or mobile app | auth code + PKCE through an identity provider |
| Another service | client credentials or API keys |

**Do not build your own login unless you must**: Auth0, Cognito, Keycloak and similar products do it well.` }
  ]
});
