/* Module: websec — Web Security.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs websec */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ws-mindset', {
  eli5: 'Security starts with asking "how would I break this?" before anyone else does: list what is worth protecting, where an attacker could get in, and then put several different locks in the way.',

  cards: [
    { kind: 'story', title: 'The shop with a very good front door',
      body: `A shopkeeper spends a fortune on a steel front door with three locks. She sleeps well.

        A burglar walks round the back, finds a ground-floor window held shut by a hook, and lifts it open with a ruler. He never touches the door.

        The shopkeeper was thinking like a **defender**: "I have secured the entrance." The burglar was thinking like an **attacker**: "Where is the weakest place?" Defenders have to cover *everything*; an attacker only needs *one* gap.

        Web security begins with swapping hats. You cannot defend a system until you have imagined breaking it.` },

    { kind: 'concept', title: 'Assets, threats and attack surface',
      body: `Three words do most of the work in security conversations.

        - An **asset** is anything worth protecting: customer data, passwords, money, the site being up, your reputation.
        - A **threat** is something bad that could happen to an asset: data stolen, data changed, the site knocked offline.
        - The **attack surface** is every place an attacker can *touch* your system: each page, form, API endpoint, open port, admin login and third-party library.

        More doors means more doors to guard. Every new feature you ship adds to the attack surface, so **shrinking it** (switching off what you do not need) is one of the cheapest defences there is.` },

    { kind: 'metaphor', title: 'A castle is a list of questions',
      body: `Picture a medieval castle. The **treasure** in the keep is the asset. The **threats** are thieves, siege engines and a bribed guard. The **attack surface** is the gate, the drawbridge, the postern door, the sewer outlet and the guard rota.

        Nobody designs a castle by saying "make it strong". They ask: what are we protecting, who wants it, and how might they get in? Then they build walls where the answers point.

        Software is the same, except the sewer outlet is a forgotten admin page and the bribed guard is a stolen password. The metaphor stops at one point: your attackers can try a million doors a second from anywhere on Earth.` },

    { kind: 'concept', title: 'Threat modelling: asking before building',
      body: `**Threat modelling** is a structured way to find weak spots *on paper*, before an attacker finds them in production. It is just four questions:

        1. What are we building, and what is it worth? (draw the boxes and arrows)
        2. What can go wrong?
        3. What will we do about each thing?
        4. Did we do a good enough job?

        Question 2 is where people freeze, staring at a blank page. So security folk invented a checklist to prompt the imagination. It is called **STRIDE**, and it fits on one card.`,
      note: 'You do not need a special tool. A whiteboard, a diagram and 30 minutes with two or three teammates is a real threat model.' },

    { kind: 'compare', title: 'STRIDE: six ways things go wrong',
      body: 'Each letter is a kind of threat. Use it as a prompt for every box and arrow in your diagram. The example is a banking app.',
      cols: ['What the attacker does', 'Banking example'],
      rows: [
        ['**S**poofing', 'Pretends to be someone else', 'Logs in with a stolen password'],
        ['**T**ampering', 'Changes data they should not', 'Edits the amount in a transfer request'],
        ['**R**epudiation', 'Does something, then denies it', '"I never sent that payment" (and nothing logged it)'],
        ['**I**nformation disclosure', 'Reads what they should not', 'A bug shows another customer’s statement'],
        ['**D**enial of service', 'Makes it unavailable', 'Floods the login page so nobody gets in'],
        ['**E**levation of privilege', 'Gains powers they were not given', 'An ordinary user reaches the admin panel']
      ] },

    { kind: 'steps', title: 'STRIDE in action: a "reset password" page',
      body: 'Walk the six letters over one feature and watch the questions appear.',
      steps: [
        { title: 'Spoofing', body: 'Can someone request a reset for an account that is not theirs and then receive the link? Is the emailed link guessable?' },
        { title: 'Tampering', body: 'Can the account ID in the reset request be edited to point at another user?' },
        { title: 'Repudiation', body: 'If an account is hijacked through this page, do the logs show who asked, when, and from where?' },
        { title: 'Information disclosure', body: 'Does the page say "no such email" for unknown addresses? That quietly tells an attacker which people have accounts.' },
        { title: 'Denial of service', body: 'Can someone request a thousand resets a minute, flooding a victim’s inbox and your mail server?' },
        { title: 'Elevation of privilege', body: 'Could a reset token for a normal user also work on an admin account?' }
      ] },

    { kind: 'layers', title: 'Defence in depth',
      body: 'No single lock is perfect, so you stack several different ones. If an attacker beats one layer, the next is still there. Think of an onion, or a castle with a moat, a wall and an inner keep.',
      layers: [
        { label: 'Network', note: 'Firewalls and closed ports stop most traffic before it reaches your code.', icon: '🧱', tone: 'info' },
        { label: 'Application', note: 'Input checks, safe queries and output encoding stop bad data being treated as code.', icon: '🧩', tone: 'accent' },
        { label: 'Identity and access', note: 'Strong logins, and an authorisation check on every request.', icon: '🔑', tone: 'warn' },
        { label: 'Data', note: 'Encrypted and backed up, so a breach of the layers above gets the attacker gibberish.', icon: '🗄️', tone: 'good' },
        { label: 'Detection', note: 'Logs and alerts, so you notice when a layer has failed.', icon: '🔔', tone: 'muted' }
      ] },

    { kind: 'pitfall', title: 'Security by obscurity, and the "we are too small" myth',
      body: `Two beliefs sink many small teams.

        **"Nobody knows our URL structure, so nobody will find the admin page."** Hiding something is not the same as protecting it. Attackers use automated tools that try thousands of common paths a minute. Secrets must be secret because of a *key*, not because of an *unlisted address*.

        **"We are too small to be a target."** Most attacks are automated: bots sweep the whole internet looking for one known flaw, and they do not check whether you are famous. Being small does not hide you; being unpatched does the opposite.` },

    { kind: 'tip', title: 'Security is a trade-off, not a switch',
      body: `Perfect security would mean a computer in a locked room with no network. Useless. Every control costs something: **money**, **developer time**, or **convenience for the user**.

        Forcing a password change every week annoys people into writing passwords on sticky notes. Asking for a code on every click makes people give up. The skill is spending effort in proportion to what the asset is worth and how likely the threat is.

        A blog needs different locks from a bank. Say the trade-off out loud in design reviews: "this costs us two days and protects the payment data". Then it is a decision, not a feeling.` }
  ],

  activities: [
    { type: 'match', after: 1, prompt: 'Match each word to what it means in a security conversation.',
      pairs: [['Asset', 'Something worth protecting, like customer data'], ['Threat', 'A bad thing that could happen to an asset'], ['Attack surface', 'Every place an attacker can touch the system'], ['Threat model', 'A structured, on-paper search for what could go wrong']] },

    { type: 'bucket', after: 4, prompt: 'Which STRIDE letter does each threat belong to?', buckets: ['Spoofing', 'Tampering', 'Information disclosure', 'Denial of service'],
      items: [['Sending a stolen session cookie to pose as a user', 0], ['Changing the price in a request before it is sent', 1], ['A bug that lets one user read another’s invoices', 2], ['Hammering the login page until it falls over', 3], ['Forging the "from" address on an email', 0], ['Editing a file on the server without permission', 1], ['An error page that prints the database password', 2]],
      explain: 'Ask what the attacker is doing to the asset: pretending to be someone (S), changing it (T), reading it (I) or stopping it working (D). The same incident can touch several letters, but one is usually the heart of it.' },

    { type: 'tf', statement: 'A small website with no famous users is safe from most attacks, because attackers only target big companies.', answer: false,
      explain: 'Most attacks are automated sweeps for known flaws across the entire internet. Bots do not care who you are, only whether you run something unpatched or misconfigured.' },

    { type: 'mcq', q: 'A team stores customer addresses and puts a firewall, a login and database encryption in front of them. What is this an example of?',
      options: ['Defence in depth: several different layers, so one failure is not fatal', 'Security by obscurity: hiding the data so nobody finds it', 'Reducing the attack surface by removing a feature', 'Repudiation: customers can deny they sent their address'],
      answer: 0,
      why: [null, 'Nothing here relies on secrecy of the design; each layer is a real control.', 'Surface shrinks by removing things. Here controls were added around the data.', 'Repudiation is about denying actions, not about protecting stored data.'],
      explain: 'Defence in depth means layering different controls so that beating one still leaves the attacker facing the next.' },

    { type: 'spot', prompt: 'You are threat-modelling this API. Tap the line that gives an attacker the most free information.',
      code: { lang: 'js', src: `
        app.post('/login', (req, res) => {
          const user = findUser(req.body.email);
          if (!user) {
            return res.status(404).send('No account with that email');
          }
          if (!checkPassword(user, req.body.password)) {
            return res.status(401).send('Wrong password');
          }
          res.send(startSession(user));
        });` },
      lines: [4],
      explain: 'Line 4 confirms which emails have accounts, which is information disclosure. A safer reply is one vague message for both failures, such as "email or password is wrong".' },

    { type: 'order', prompt: 'Put the four threat-modelling questions in order.',
      items: ['What are we building, and what is it worth?', 'What can go wrong?', 'What are we going to do about it?', 'Did we do a good enough job?'],
      explain: 'You cannot list what could go wrong until you have a picture of the system, and you cannot judge your defences until you have chosen them.' },

    { type: 'scenario', title: 'The weekend launch', intro: 'You run a small online shop. Tomorrow you launch a new feature: customers can upload a profile photo. You have two hours for a quick threat model and a tiny budget.',
      meters: { 'risk': 70, 'launch time': 80 },
      steps: [
        { text: 'First move: what do you do with your two hours?',
          choices: [
            { label: 'Sketch the upload flow and ask STRIDE questions at each step', score: 2, effects: { 'risk': -20, 'launch time': -10 }, feedback: 'Exactly right. In ten minutes you notice that an uploaded file could be a script, that anyone could overwrite another user’s photo by guessing an ID, and that nothing is logged.' },
            { label: 'Skip it. The site is small, nobody will bother us', score: 0, effects: { 'risk': 15 }, feedback: 'Bots probe every new upload form they find. You have just added attack surface and thought about none of it.' },
            { label: 'Buy a security product and hope it covers everything', score: 1, effects: { 'risk': -5, 'launch time': -5 }, feedback: 'Tools help, but they do not know your feature. Without asking "what can go wrong here?", you will not know what to configure.' }
          ] },
        { text: 'You discover the upload endpoint accepts any file type and any size. What is the best response?',
          choices: [
            { label: 'Allow only image types, cap the size, and store files away from the code', score: 2, effects: { 'risk': -20, 'launch time': -10 }, feedback: 'You shrank the attack surface (fewer file types), limited denial of service (size cap) and kept uploads from running as code.' },
            { label: 'Trust the file extension the browser sends', score: 0, effects: { 'risk': 10 }, feedback: 'The client controls the filename and can say anything. Never take a user’s word for what their file is.' },
            { label: 'Delay the launch by a month to rebuild everything', score: 1, effects: { 'launch time': -35, 'risk': -10 }, feedback: 'Safer, but out of proportion. A small, targeted fix gets most of the benefit for a fraction of the cost.' }
          ] },
        { text: 'Time is short. One more control fits before launch. Which gives you the best protection for the cost?',
          choices: [
            { label: 'Log every upload with the user and time, so you can investigate problems', score: 2, effects: { 'risk': -15, 'launch time': -5 }, feedback: 'Cheap, quick and it covers repudiation and detection: when something goes wrong you can actually find out what happened.' },
            { label: 'Hide the upload URL so nobody can find it', score: 0, effects: { 'risk': 5 }, feedback: 'That is security by obscurity. Scanners and curious users find hidden paths quickly.' },
            { label: 'Require every user to change their password weekly', score: 1, effects: { 'launch time': -10 }, feedback: 'It costs users a lot of convenience and does nothing about the upload feature you are shipping.' }
          ] }
      ],
      outro: 'The pattern to remember: **draw the feature, ask what could go wrong at each step, and spend your limited effort where the answers point.**' },

    { type: 'explain', prompt: 'A colleague says: "We have a firewall, so we are secure." Explain, in your own words, what is missing from that view.',
      model: 'A firewall is one layer. Security needs defence in depth: if an attacker gets past the firewall (or comes through a page that is allowed through, like the website itself), there must be more controls behind it, such as safe queries, access checks, encryption and logging. We should also threat-model what could go wrong, because the weakest spot, not the strongest, decides the outcome.',
      keywords: ['layers', 'defence in depth', 'one control', 'weakest', 'threat model'] }
  ],

  flashcards: [
    { q: 'What are an asset, a threat and the attack surface?', a: 'An asset is what you protect, a threat is something bad that could happen to it, and the attack surface is every place an attacker can touch the system.' },
    { q: 'What does STRIDE stand for?', a: 'Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege.' },
    { q: 'What is defence in depth?', a: 'Stacking several different controls so that when one fails, another still stands in the attacker’s way.' },
    { q: 'Why is "nobody knows our admin URL" not security?', a: 'Hidden is not protected. Automated tools guess common paths, so real secrecy must come from keys and access checks, not obscurity.' },
    { q: 'Why is security called a trade-off?', a: 'Every control costs money, time or user convenience, so you spend effort in proportion to what the asset is worth and how likely the threat is.' }
  ],

  glossary: [
    { term: 'Asset', def: 'Anything worth protecting: data, money, availability, reputation.', like: 'The treasure in the castle keep.' },
    { term: 'Attack surface', def: 'The sum of all the places an attacker can interact with your system: pages, endpoints, open ports, libraries.', like: 'Every door and window of a building.' },
    { term: 'Threat modelling', def: 'A structured exercise to find what could go wrong in a design, before building or shipping it.', like: 'Walking round your own house as a burglar would.' },
    { term: 'STRIDE', def: 'A checklist of six threat types: Spoofing, Tampering, Repudiation, Information disclosure, Denial of service, Elevation of privilege.', like: 'A checklist of questions a nervous inspector asks at every door.' },
    { term: 'Defence in depth', def: 'Using several independent layers of protection, so no single failure exposes everything.', like: 'A moat, a wall and an inner keep.' },
    { term: 'Security by obscurity', def: 'Relying on something being hidden rather than properly protected. It is fragile, because hidden things get found.', like: 'Hiding a key under the doormat.' }
  ],

  takeaways: [
    'Think like an attacker: they need **one** gap, you must cover them **all**.',
    'List your **assets**, the **threats** to them and your **attack surface**; shrink the surface where you can.',
    '**STRIDE** turns "what could go wrong?" into six concrete questions per feature.',
    'Layer your defences, and spend effort in proportion to the value at stake.'
  ],

  links: [
    { label: 'OWASP: Threat Modeling Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Threat_Modeling_Cheat_Sheet.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ws-owasp', {
  eli5: 'OWASP is a non-profit that publishes a famous list of the ten most common ways websites get hacked, so teams can check their own work against real-world mistakes instead of guessing.',

  cards: [
    { kind: 'concept', title: 'Someone already made the checklist',
      body: `After the last lesson you might be thinking: "I cannot invent every threat from scratch." Good news: you do not have to.

        **OWASP** (the Open Worldwide Application Security Project; the "W" used to stand for "Web") is a non-profit community that publishes free, practical security guidance. Its most famous creation is the **OWASP Top 10**: a ranked list of the ten most critical **categories** of web application risk, built from real data about real breaches.

        It is not a law, a standard you can "pass" or a complete list of every bug. It is a **shared vocabulary** and a very good starting checklist.` },

    { kind: 'metaphor', title: 'The pilot’s pre-flight checklist',
      body: `Pilots are brilliant, and they still read a checklist before every flight. Not because they have forgotten how to fly, but because the same few mistakes have caused the most accidents, and a checklist catches them on a tired Tuesday.

        The OWASP Top 10 is that checklist for web apps. Each item is a mistake that thousands of teams have made, usually while rushing.

        Where the metaphor stops: a pilot ticks every box every time. A web app has a lot more ways to fail than ten, so the list is where you *start*, not where you finish.` },

    { kind: 'compare', title: 'The Top 10 (2021), part one',
      body: 'This lesson uses the 2021 edition. OWASP updates the list every few years, and a 2025 edition has since been published. Each entry is a category, not a single bug.',
      cols: ['In plain English', 'Tiny example'],
      rows: [
        ['**A01** Broken Access Control', 'Users can do things they should not be allowed to', 'Change `/invoice/17` to `/invoice/18` and read someone else’s'],
        ['**A02** Cryptographic Failures', 'Sensitive data is not protected, or badly protected', 'Passwords stored in plain text; a site served over HTTP'],
        ['**A03** Injection', 'Input is treated as code', 'A login box that runs your text as part of a database query'],
        ['**A04** Insecure Design', 'The plan itself was flawed, not just the code', 'Password reset that asks questions anyone can answer'],
        ['**A05** Security Misconfiguration', 'Insecure settings or defaults left in place', 'Default admin password; debug mode on in production']
      ] },

    { kind: 'compare', title: 'The Top 10 (2021), part two',
      body: 'The second half of the list.',
      cols: ['In plain English', 'Tiny example'],
      rows: [
        ['**A06** Vulnerable and Outdated Components', 'Using libraries or software with known holes', 'Never updating a framework with a publicised flaw'],
        ['**A07** Identification and Authentication Failures', 'Logins and sessions that can be broken or guessed', 'No limit on password guesses; sessions that never expire'],
        ['**A08** Software and Data Integrity Failures', 'Trusting code or data without checking it is genuine', 'Installing an update or package from a source nobody verified'],
        ['**A09** Security Logging and Monitoring Failures', 'Attacks happen and nobody notices', 'No logs of failed logins, so a month-long break-in goes unseen'],
        ['**A10** Server-Side Request Forgery', 'Tricking your server into fetching a URL the attacker picks', 'A "fetch image from URL" feature pointed at an internal service']
      ],
      note: 'Do not memorise the numbers. Learn the *ideas*; the names and order change between editions.' },

    { kind: 'diagram', title: 'Where each category bites',
      body: 'The same request touches many places, and the Top 10 lines up with them. Follow the request from the user to the data.',
      nodes: [
        { id: 'user', label: 'Attacker or user', icon: '🧑', x: 1, y: 0 },
        { id: 'app', label: 'Your app code', icon: '🧩', x: 1, y: 1, tone: 'accent' },
        { id: 'lib', label: 'Libraries you use', icon: '📦', x: 0, y: 2, tone: 'warn' },
        { id: 'cfg', label: 'Server settings', icon: '⚙️', x: 2, y: 2, tone: 'warn' },
        { id: 'db', label: 'Data store', icon: '🗄️', x: 1, y: 3, tone: 'good' },
        { id: 'log', label: 'Logs and alerts', icon: '🔔', x: 2, y: 3, tone: 'info' }
      ],
      edges: [
        { from: 'user', to: 'app', label: 'request' },
        { from: 'app', to: 'lib', label: 'uses', dashed: true },
        { from: 'app', to: 'cfg', label: 'runs under', dashed: true },
        { from: 'app', to: 'db', label: 'reads, writes' },
        { from: 'app', to: 'log', label: 'records', dashed: true }
      ],
      caption: 'Access control, injection and authentication live in your code; outdated components, misconfiguration and weak logging live around it.' },

    { kind: 'concept', title: 'Which ones bite most often',
      body: `The list is ranked using data from many real applications and from the security community. In the 2021 edition, **Broken Access Control** was number one: the most common problem found in the apps tested. You studied it in the Authorisation module, and it is worth a reminder that "who can do what" is the place where careless code costs the most.

        **Injection** stayed near the top, and in 2021 absorbed what used to be a separate cross-site scripting category. **Misconfiguration** is boring, frequent and fixable in an afternoon.

        Notice how many entries are not clever hacks at all. They are **defaults left on, updates left undone and checks nobody wrote**. Most breaches are boring.`,
      note: 'OWASP revises the list every few years. Check owasp.org for the current edition rather than trusting this lesson’s numbering forever.' },

    { kind: 'example', title: 'Insecure design: a bug you cannot patch',
      body: `A04 is easy to skip, so here is why it matters. Imagine a bank whose password reset asks: "What was your mother’s maiden name?" The code works perfectly. Every line does exactly what it was written to do. Yet an attacker can often find that answer on a family-tree website.

        No amount of tidy code fixes that. The **design** was the weakness.

        That is why threat modelling (last lesson) comes *before* writing code: the cheapest time to fix a design flaw is while it is still a drawing on a whiteboard.` },

    { kind: 'pitfall', title: 'The list is a starting line, not a finish line',
      body: `Two traps when using the Top 10:

        - **"We checked all ten, so we are secure."** The list is the most *common* problems, not all of them. Your own app has its own risks, which is what threat modelling is for.
        - **"It only applies to web pages."** The same categories hit APIs, mobile backends and internal tools. Anything that takes input from the outside and talks to data is in scope.

        Use the list to review designs, write test cases and train new developers. Just do not treat "ten boxes ticked" as the end of the conversation.` },

    { kind: 'tip', title: 'Using it as a checklist',
      body: `A practical routine for any feature or code review:

        1. Walk down the list and ask one question per item. "Could someone read data that is not theirs?" (A01). "Does any input reach a query or command?" (A03). "Would we notice if this were attacked?" (A09).
        2. Note which items are **not applicable** and why. That is useful evidence later.
        3. Turn each "hmm, maybe" into a ticket.

        Ten minutes per feature catches an astonishing amount. The rest of this module goes deep on the biggest ones: injection, XSS, CSRF, hardening and API checks.` }
  ],

  activities: [
    { type: 'tf', after: 0, statement: 'The OWASP Top 10 lists common categories of risk, so an app can still have serious problems that are not on it.', answer: true,
      explain: 'It is a ranked list of the most common and critical **categories** of risk. It is a great starting checklist, but real applications have problems that are not on it.' },

    { type: 'match', after: 3, prompt: 'Match each OWASP category to the one-line idea.',
      pairs: [['Broken Access Control', 'Users can do what they should not be allowed to do'], ['Injection', 'Untrusted input gets treated as code'], ['Security Misconfiguration', 'Insecure defaults or settings left in place'], ['Security Logging and Monitoring Failures', 'Attacks happen and nobody notices'], ['Server-Side Request Forgery', 'The server is tricked into fetching an attacker’s URL']] },

    { type: 'bucket', prompt: 'Which OWASP category does each problem belong to?', buckets: ['Broken Access Control', 'Injection', 'Misconfiguration', 'Outdated Components'],
      items: [['A normal user opens `/admin/users` by typing the URL', 0], ['A search box whose text is glued into a SQL query', 1], ['The default admin password was never changed', 2], ['Running a web framework with a known, fixed flaw', 3], ['Stack traces shown to visitors in production', 2], ['Changing `?id=5` to `?id=6` shows another person’s order', 0], ['A package pinned to a version from five years ago, with known holes', 3]],
      explain: 'Ask what went wrong: a missing permission check (access control), input mixed into code (injection), a setting left unsafe (misconfiguration), or software that needed updating (outdated components).' },

    { type: 'mcq', q: 'A password reset flow asks "What is your pet’s name?". The code is bug-free, but attackers can find answers on social media. Which category is this?',
      options: ['Insecure Design: the plan itself is flawed', 'Injection: user input reaches a query', 'Security Misconfiguration: a setting was left wrong', 'Server-Side Request Forgery: the server fetches a bad URL'],
      answer: 0,
      why: [null, 'No input is being run as code here.', 'No setting is wrong; the feature does what it was designed to do.', 'Nothing is being fetched on the attacker’s behalf.'],
      explain: 'The code does exactly what it was designed to do, and the design is the weakness. That is why this category exists: you cannot fix a flawed idea with careful typing.' },

    { type: 'multi', q: 'Which of these are sensible ways to use the OWASP Top 10?',
      options: ['Walk through it during a design or code review of a new feature', 'Use its categories as a shared vocabulary with your team', 'Treat ticking all ten as proof the app is secure', 'Turn each category into test cases for your own system', 'Memorise the exact numbering, which never changes'],
      answers: [0, 1, 3],
      explain: 'The list is a prompt and a shared language. It is revised every few years and is not exhaustive, so ticking boxes is not proof of safety and the numbering is not worth memorising.' },

    { type: 'mcq', q: 'A new feature lets users paste a link, and the server fetches that page to show a preview. Which category should you review it against first?',
      options: ['Server-Side Request Forgery', 'Cryptographic Failures', 'Vulnerable and Outdated Components', 'Security Logging and Monitoring Failures'],
      answer: 0,
      why: [null, 'Nothing here is about protecting stored or transmitted data.', 'That is about the libraries you use, not what this feature does.', 'Logging matters everywhere, but the new risk here is the server fetching a URL someone else chose.'],
      explain: 'The server makes a request to a URL the user picks. An attacker could point it at an internal service that the outside world cannot reach.' },

    { type: 'short', q: 'In the 2021 edition, which category sits at number one: "Broken Access ___"?', accept: ['Control', 'Access Control', 'Broken Access Control'], hint: 'You spent a whole lesson on it in the Authorisation module.',
      explain: 'Broken Access Control: users acting outside their permissions. It was the most commonly found category in the data behind the 2021 list.' },

    { type: 'scenario', title: 'The pre-launch review', intro: 'Your team is about to launch a small web shop with a login, a search box and an admin area. You have an hour and the OWASP Top 10 on the wall.',
      meters: { 'confidence': 40, 'launch time': 70 },
      steps: [
        { text: 'You open the admin page while logged in as an ordinary test customer, and it loads. What now?',
          choices: [
            { label: 'Raise it as a blocker: a missing access check on every admin route', score: 2, effects: { 'confidence': 25, 'launch time': -10 }, feedback: 'This is Broken Access Control, the most common category. The check must happen on the server for every request, not just by hiding a menu link.' },
            { label: 'Note it for later; hiding the admin link from customers is enough', score: 0, effects: { 'confidence': -20 }, feedback: 'Anyone can type the URL. A hidden link is obscurity, not access control.' },
            { label: 'Rename the admin URL to something obscure', score: 1, effects: { 'confidence': -5, 'launch time': -3 }, feedback: 'Slightly harder to stumble on, still fully open to anyone who finds it. The server must check who is asking.' }
          ] },
        { text: 'The deployment still uses the framework’s default admin password and has debug mode on, showing full error pages. Which category is that, and what do you do?',
          choices: [
            { label: 'Security Misconfiguration: change the credentials and turn debug off in production', score: 2, effects: { 'confidence': 25, 'launch time': -5 }, feedback: 'Quick, cheap and high value. Attackers try default passwords first, and debug pages leak internals.' },
            { label: 'Injection: add input validation to every form', score: 0, effects: { 'confidence': -10, 'launch time': -15 }, feedback: 'Validation is useful elsewhere, but it does not change a default password or hide an error page.' },
            { label: 'Outdated Components: upgrade everything', score: 1, effects: { 'confidence': 5, 'launch time': -20 }, feedback: 'Keeping software current matters, but it is a different issue and will not remove the default credentials.' }
          ] },
        { text: 'Last item on the wall: **Logging and Monitoring**. The app logs nothing about logins. What is the best small fix before launch?',
          choices: [
            { label: 'Log failed and successful logins with user, time and source, and alert on spikes', score: 2, effects: { 'confidence': 25, 'launch time': -5 }, feedback: 'Cheap to add and it turns a silent break-in into one you can see. Remember never to write passwords into the logs.' },
            { label: 'Skip it. Logs only matter after a breach', score: 0, effects: { 'confidence': -15 }, feedback: 'Without logs you will not know a breach happened, so "after a breach" may be months later.' },
            { label: 'Log every request body in full, forever', score: 1, effects: { 'confidence': -5, 'launch time': -5 }, feedback: 'More is not better. Bodies can contain passwords and personal data, which turns your logs into a new asset to protect.' }
          ] }
      ],
      outro: 'The pattern to remember: **walk the list, ask one question per item, and turn every "hmm" into a ticket.**' },

    { type: 'explain', prompt: 'Your manager asks: "What is the OWASP Top 10 and should we care?" Answer in your own words.',
      model: 'OWASP is a non-profit that publishes a ranked list of the ten most common categories of web application risk, such as broken access control, injection and misconfiguration, based on real breach data. It is a free checklist and shared vocabulary for reviews, not a complete guarantee. It is revised every few years, so we should check the current edition and use it to review our designs and code.',
      keywords: ['OWASP', 'categories', 'checklist', 'common', 'revised', 'review'] }
  ],

  flashcards: [
    { q: 'What is OWASP and what is the Top 10?', a: 'OWASP is a non-profit community for application security. Its Top 10 is a ranked list of the ten most critical categories of web application risk.' },
    { q: 'Name five of the ten 2021 categories.', a: 'Broken Access Control, Cryptographic Failures, Injection, Insecure Design, Security Misconfiguration (also: outdated components, authentication failures, integrity failures, logging failures, SSRF).' },
    { q: 'Which category was number one in 2021?', a: 'Broken Access Control: users acting outside the permissions they should have.' },
    { q: 'What is SSRF in one line?', a: 'Server-Side Request Forgery: an attacker tricks your server into making a request to a URL of their choosing, often an internal one.' },
    { q: 'Why is the Top 10 not "the" security standard?', a: 'It lists the most common categories, not every risk. It is revised every few years, so use it as a starting checklist and check the current edition.' }
  ],

  glossary: [
    { term: 'OWASP', def: 'The Open Worldwide Application Security Project: a non-profit that publishes free guidance, tools and lists such as the Top 10.', like: 'A volunteer safety charity for web developers.' },
    { term: 'OWASP Top 10', def: 'A ranked list of the ten most critical categories of web application security risk, revised every few years.', like: 'A pilot’s pre-flight checklist.' },
    { term: 'Vulnerability', def: 'A weakness in a system that an attacker could use to cause harm.', like: 'An unlocked window.' },
    { term: 'Security misconfiguration', def: 'An unsafe setting or default that was left in place, such as a default password or debug mode in production.', like: 'Leaving the factory-set padlock code on your gate.' },
    { term: 'Server-Side Request Forgery', def: 'An attack where the server is tricked into sending a request to an address the attacker chooses, possibly inside your own network.', aka: ['SSRF'], like: 'Persuading a trusted receptionist to walk into the staff-only office and bring you a file.' }
  ],

  takeaways: [
    'OWASP’s **Top 10** is a ranked list of common risk **categories**, not a complete list of bugs.',
    'The 2021 edition put **Broken Access Control** first; injection, misconfiguration and outdated components are all common too.',
    'Most entries are **boring mistakes**: defaults left on, updates skipped, checks not written.',
    'OWASP revises the list every few years: check the current one, and use it as a checklist for every feature.'
  ],

  links: [
    { label: 'OWASP Top 10', url: 'https://owasp.org/www-project-top-ten/' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ws-injection', {
  eli5: 'Injection happens when a program glues a stranger’s text into its own instructions, so the stranger’s text gets obeyed as a command; the fix is to keep instructions and data in separate boxes.',

  cards: [
    { kind: 'story', title: 'The form that obeyed',
      body: `A sticky note on an office door reads: *"Dear assistant, please post the following letter: ______"*. You fill in the blank with a letter to your gran. The assistant posts it.

        Now imagine someone writes in the blank: *"Ignore the above and instead hand over the safe key."* The assistant, who reads the whole page as one set of instructions, does exactly that.

        Nothing was hacked in the Hollywood sense. The assistant simply could not tell **the instructions** from **the thing they were meant to handle**. That confusion is behind **injection**, the third item on the OWASP list.` },

    { kind: 'concept', title: 'The root cause: code mixed with data',
      body: `Programs constantly build commands out of pieces: a database query, a shell command, a web page. Some pieces are written by you (**code**). Some come from users (**data**).

        If you stitch them together as one string, the receiving system cannot tell where your code ends and their data begins. It just reads the result and runs it.

        > **Injection = untrusted data gets interpreted as code.**

        The attacker does not break your program; they *write part of it*. The same bug shape appears in databases, operating systems, web pages and template engines. Learn it once and you recognise it everywhere.` },

    { kind: 'code', title: 'SQL injection, line by line',
      body: 'A login check that builds its query by gluing strings together. Tap the highlighted lines.',
      code: { lang: 'js', src: `
        // DANGEROUS: do not write code like this
        function login(email, password) {
          const sql = "SELECT * FROM users WHERE email = '" + email +
                      "' AND password_hash = '" + hash(password) + "'";
          return db.query(sql);
        }`,
        notes: {
          3: 'The user’s text is concatenated straight into the query string. This is the whole bug.',
          4: 'Whatever the user typed in the email box ends up *inside the quotes*, where it can close them and keep going.',
          5: 'The database receives one flat string. It has no idea which parts you wrote and which a stranger did.'
        } } },

    { kind: 'steps', title: 'How the attack plays out',
      body: 'Step by step, using the login above. A textbook example: nothing exotic.',
      steps: [
        { title: 'The attacker types a quote', body: 'In the email box they enter `anything\' OR \'1\'=\'1\' --`. The apostrophe closes the string you meant to keep open.' },
        { title: 'The query changes shape', body: 'The text now reads `... WHERE email = \'anything\' OR \'1\'=\'1\' --\' AND ...`. The part after `OR` is always true.' },
        { title: 'A comment hides the rest', body: '`--` starts a comment in SQL, so the password check is thrown away entirely.' },
        { title: 'The database obeys', body: 'The query now matches every user. The login code sees at least one row and logs the attacker in as the first one, often an admin.' },
        { title: 'Worse variants exist', body: 'Similar tricks can read other tables, change data or delete it, depending on the account the app connects with. The login box was just the door.' }
      ] },

    { kind: 'compare', title: 'The fix: parameterised queries',
      body: 'Instead of gluing strings, send the **query shape** and the **values** separately. The database then treats values purely as data.',
      cols: ['String concatenation', 'Parameterised query'],
      rows: [
        ['What the database receives', 'One string mixing code and input', 'The query with placeholders, then the values separately'],
        ['Is input ever run as SQL?', 'Yes, if it contains SQL', 'Never: a value is always just a value'],
        ['Quotes and special characters', 'Must be escaped by hand (easy to miss one)', 'Handled for you by the driver'],
        ['Who is protected', 'Only careful, lucky developers', 'Everyone using it consistently']
      ],
      note: 'Also called **prepared statements**. Nearly every database library supports them, and ORMs use them under the hood for ordinary queries.' },

    { kind: 'code', title: 'The same login, done right',
      body: 'The `?` marks are placeholders. The values travel in a separate list.',
      code: { lang: 'js', src: `
        function login(email, password) {
          const sql = 'SELECT * FROM users WHERE email = ? AND password_hash = ?';
          return db.query(sql, [email, hash(password)]);
        }`,
        notes: {
          2: 'The query text is **fixed**: written by you, never built from input. The database can parse it before any user data arrives.',
          3: 'The values are passed alongside. If the email contains `\' OR 1=1 --`, the database looks for an account literally *named* that, and finds none.'
        } },
      note: 'Placeholder syntax varies (`?`, `$1`, `:name`), but the idea is identical in every language and database.' },

    { kind: 'metaphor', title: 'Two separate envelopes',
      body: `Think of a parameterised query as handing a clerk **two envelopes**. The first holds the form with blanks: *"Find the person named ___"*. The second holds the name, sealed.

        The clerk reads the form, then slides the name into the blank without reading it as instructions. Even if the name says "ignore the form and open the safe", it is just a very odd name.

        String concatenation is writing the name directly onto the form in pen. Now it is part of the form.` },

    { kind: 'concept', title: 'Injection has relatives',
      body: `SQL is just the best-known place this happens. Any time input is spliced into something that gets *interpreted*, the same bug can appear:

        - **Command injection**: input is glued into a shell command, such as \`ping \` + userInput. A value like \`8.8.8.8; rm -rf /\` might run a second command. Fix: avoid the shell, and pass arguments as a list.
        - **Template injection**: input is placed into a *template itself* rather than passed as data into it, so the engine runs the attacker’s expressions.
        - **NoSQL and LDAP injection**: the same idea against other query languages.

        The cure is always the same: **keep instructions and data separate**.` },

    { kind: 'pitfall', title: 'Validation helps; it is not the fix',
      body: `A popular first reaction: "I will just strip out apostrophes and bad words." Please do not rely on that. Attackers are inventive, legitimate input is surprisingly weird (hello, Mr O'Brien), and one missed case reopens the hole.

        - **Input validation** (is this an email? is this number between 1 and 100?) is a useful *extra layer*: it rejects junk early and shrinks the attack surface.
        - **The real fix** is structural: parameterised queries, so input can never become code, however strange it looks.
        - **Output encoding** (next lesson) is the matching defence when the destination is a web page rather than a database.

        Validate input for quality. Separate code from data for safety.` },

    { kind: 'tip', title: 'Least privilege limits the blast radius',
      body: `Even with careful code, assume one query will eventually slip through. So limit what it can do.

        Connect to the database with an account that can only do what the app needs: read and write its own tables, but **not** drop tables, read other databases or touch the operating system. Then a successful injection steals less.

        That is defence in depth again: safe queries stop the injection, validation filters junk, and a restricted account reduces the damage if both fail. In the lab that follows you will break a login with SQL injection, then fix it with a parameterised query.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'What is the single root cause of every injection vulnerability?',
      options: ['Untrusted data gets run as code or commands', 'The server runs out of memory under heavy load', 'Passwords are stored in the database unhashed', 'The website is served over plain HTTP, not HTTPS'],
      answer: 0,
      why: [null, 'Memory has nothing to do with it.', 'Unhashed passwords are a separate problem (cryptographic failures), not injection.', 'HTTPS protects data in transit; injection happens after the data arrives.'],
      explain: 'The receiving system cannot tell which part of the string is the programmer’s instruction and which part is a user’s data, so it obeys all of it.' },

    { type: 'spot', after: 2, prompt: 'This function is vulnerable to SQL injection. Tap the line responsible.',
      code: { lang: 'js', src: `
        function findOrders(customerId) {
          const sql = 'SELECT * FROM orders WHERE customer = ' + customerId;
          return db.query(sql);
        }` },
      lines: [2],
      explain: 'Line 2 builds the query by adding the input directly to the string. Passing `customerId` as a separate parameter fixes it. Note there are no quotes here, yet it is still injectable: a value like `1 OR 1=1` changes the query.' },

    { type: 'ab', q: 'Which version is safe against SQL injection?',
      a: { lang: 'js', label: 'Escape by hand', src: `
        const clean = name.replace("'", "''");
        db.query("SELECT * FROM users WHERE name = '" + clean + "'");` },
      b: { lang: 'js', label: 'Parameter', src: `
        db.query('SELECT * FROM users WHERE name = ?', [name]);` },
      answer: 'b',
      explain: 'Hand-written escaping depends on remembering every special case, every time, in every database. A parameter makes input data by construction, so there is nothing to forget.' },

    { type: 'tf', statement: 'A parameterised query stops SQL injection because the user’s input travels separately from the SQL and is only ever treated as data.', answer: true,
      explain: 'The query and the values arrive in separate envelopes, so however strange the input looks, the database never runs it as code. Stripping characters such as apostrophes is the unreliable alternative.' },

    { type: 'order', prompt: 'Put the stages of the login SQL injection attack in order.',
      items: ['The attacker types a quote and extra SQL in the email box', 'The code glues the text into the query string', 'The query now has an always-true condition', 'The database runs the changed query and returns user rows', 'The app treats the result as a successful login'],
      explain: 'The bug starts with the concatenation. Everything after that follows: the database cannot tell the extra SQL from yours, so it obeys it.' },

    { type: 'multi', q: 'Which of these are good defences against injection, ideally used together?',
      options: ['Parameterised queries or prepared statements', 'Validating input type, length and format', 'A database account with only the permissions the app needs', 'Escaping quotes by hand in every query', 'Hiding the login page URL'],
      answers: [0, 1, 2],
      explain: 'Parameterised queries are the core fix, validation filters junk early, and least privilege limits damage. Hand escaping is fragile, and hiding a URL does nothing to input handling.' },

    { type: 'bucket', prompt: 'Which kind of injection is each of these?', buckets: ['SQL injection', 'Command injection', 'Template injection'],
      items: [['Input glued into `SELECT … WHERE name = \'…\'`', 0], ['A filename glued into a shell `convert` command', 1], ['A visitor’s text becomes part of the template source itself', 2], ['`1 OR 1=1` added to a numeric ID in a query', 0], ['`; cat /etc/passwd` appended to a `ping` argument', 1], ['A `{{ 7*7 }}` style expression in a username gets evaluated', 2]],
      explain: 'The shape is identical: input is spliced into something that gets interpreted. What changes is the interpreter: the database, the shell or the template engine.' },

    { type: 'scenario', title: 'The search box that talked too much', intro: 'You inherit a small shop’s website. A customer reports that typing an apostrophe into the search box produces a raw database error page. Time to act.',
      meters: { 'exposure': 70, 'shipping time': 60 },
      steps: [
        { text: 'The error mentions a syntax problem near your apostrophe. What does it suggest?',
          choices: [
            { label: 'Input is being glued into the SQL string, so injection is likely', score: 2, effects: { 'exposure': -5 }, feedback: 'Exactly. The apostrophe broke the query’s structure, which means user text is reaching the SQL as code.' },
            { label: 'Apostrophes are simply an unsupported character', score: 0, effects: { 'exposure': 10 }, feedback: 'The database is complaining about *its own query* being broken. That is a strong sign an attacker can change that query.' },
            { label: 'The database is probably out of disk space', score: 0, effects: { 'exposure': 10, 'shipping time': -10 }, feedback: 'A syntax error is about the shape of the query, not capacity.' }
          ] },
        { text: 'What is the proper fix?',
          choices: [
            { label: 'Rewrite the query with a parameter placeholder for the search text', score: 2, effects: { 'exposure': -35, 'shipping time': -10 }, feedback: 'The query text is now fixed and the search text is only ever a value. The injection path is closed at the root.' },
            { label: 'Delete apostrophes and semicolons from the search text', score: 1, effects: { 'exposure': -10, 'shipping time': -5 }, feedback: 'It might block this exact attempt, but blacklists miss cases and it breaks searches for "Levi’s". It also leaves other queries untouched.' },
            { label: 'Hide the error message and leave the query as it is', score: 0, effects: { 'exposure': 5 }, feedback: 'Hiding the message is good practice, but the injection hole is still there. Attackers can work blind.' }
          ] },
        { text: 'You also find that the app connects to the database as the owner account with full rights. What do you do?',
          choices: [
            { label: 'Create a limited account for the app and switch the connection to it', score: 2, effects: { 'exposure': -20, 'shipping time': -10 }, feedback: 'Defence in depth: if some other query is ever injectable, the attacker cannot drop tables or read unrelated data.' },
            { label: 'Leave it. The code is fixed now, so permissions do not matter', score: 0, effects: { 'exposure': 10 }, feedback: 'Assume one bug will slip through eventually. Permissions decide how much it costs you.' },
            { label: 'Give the app account even more rights to avoid future errors', score: 0, effects: { 'exposure': 20 }, feedback: 'The opposite of least privilege: you have made the next bug worse before it has happened.' }
          ] }
      ],
      outro: 'The pattern to remember: **parameterise the query, restrict the account, hide the internals.**' },

    { type: 'explain', prompt: 'Explain SQL injection and its proper fix to a teammate who thinks "just escape the quotes" is enough.',
      model: 'SQL injection happens when user input is concatenated into a query string, so the database cannot tell the programmer’s SQL from the user’s data and may run the attacker’s SQL. Escaping by hand is fragile: it is easy to miss a case. The proper fix is parameterised queries (prepared statements), where the query and the values are sent separately so input is always just data. Validation and least-privilege database accounts are useful extra layers.',
      keywords: ['concatenat', 'parameter', 'prepared', 'data', 'code', 'least privilege'] }
  ],

  flashcards: [
    { q: 'What is injection, in one sentence?', a: 'Untrusted input is interpreted as code or commands because it was mixed into something the system executes.' },
    { q: 'What is the real fix for SQL injection?', a: 'Parameterised queries (prepared statements): send the query text and the values separately so input is always treated as data.' },
    { q: 'Is input validation enough to stop injection?', a: 'No. It is a useful extra layer that rejects junk early, but the structural fix is to keep code and data apart.' },
    { q: 'What is command injection and its main defence?', a: 'Input spliced into a shell command can run extra commands. Avoid the shell and pass arguments as a list.' },
    { q: 'How does a limited database account help?', a: 'It is least privilege: if an injection does slip through, the app account cannot drop tables or read data it was never meant to touch.' }
  ],

  glossary: [
    { term: 'Injection', def: 'A class of vulnerability where untrusted input is interpreted as part of a command or query.', like: 'Writing your own sentence into someone else’s sticky-note instructions.' },
    { term: 'SQL injection', def: 'Injection against a SQL database: user input changes the meaning of the query. Often shortened to SQLi.', aka: ['SQLi'] },
    { term: 'Parameterised query', def: 'A query written with placeholders, with the values supplied separately so they can never be run as SQL.', like: 'A form with blanks plus a sealed envelope for the name.', aka: ['prepared statement'] },
    { term: 'Command injection', def: 'Injection where input ends up in an operating-system command, letting the attacker run extra commands.' },
    { term: 'Input validation', def: 'Checking that incoming data has the expected type, length and format before using it. A helpful layer, not a complete defence.', like: 'A bouncer checking tickets: useful, but not the only lock.' }
  ],

  takeaways: [
    'Injection is **data being run as code**. The cause is always mixing the two in one string.',
    'Fix SQL injection with **parameterised queries**, not hand-written escaping.',
    'Validation is a good extra layer; **least-privilege** database accounts cap the damage.',
    'The same bug appears in shells, templates and other query languages: keep instructions and data separate.'
  ],

  links: [
    { label: 'OWASP: SQL Injection Prevention Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ws-xss-csp', {
  eli5: 'Cross-site scripting (XSS) is when an attacker gets their own JavaScript to run inside your web page, so it acts with your user’s powers; you stop it by turning user text into harmless text before it reaches the page.',

  cards: [
    { kind: 'story', title: 'The guestbook that ran its visitors’ code',
      body: `A small site has a comment box. Someone posts a comment that looks like an ordinary line of text, except it contains a hidden bit of JavaScript.

        The site stores it. Every visitor who opens that page afterwards loads the comment as part of the page, and their **browser runs the script**. The browser has no way to know the script came from a stranger: it arrived from *your* website, so it is trusted like your own.

        That is **cross-site scripting**, usually written **XSS**. It is injection again, aimed this time at a browser instead of a database.` },

    { kind: 'concept', title: 'Why it is so powerful: it runs as the victim, on your site',
      body: `A browser decides what a script may do by asking which **site** it came from. A script that appears on \`shop.example\` can do whatever scripts from \`shop.example\` can do: read the page, call the site’s APIs, and use the visitor’s logged-in session.

        So an injected script runs **as the victim**, inside **your origin**. It can:

        - read what is on screen (messages, account details)
        - make requests *as the logged-in user* (change email, send money)
        - show a fake login box on your real page
        - capture keystrokes

        The attacker never needs your user’s password. Their code is already inside the logged-in page.` },

    { kind: 'metaphor', title: 'The forged notice on the shop’s own board',
      body: `A shop has a noticeboard by the till. Customers trust it: if it says "Card machine broken, please pay the manager in cash", people queue up and do exactly that.

        Now a stranger pins up a notice that looks just like the others. Same board, same pins, so customers believe it. They never ask who wrote it.

        XSS is that forged notice. The browser believes anything pinned to *your* page. The metaphor stops at one point: a real notice only fools people who read it, while a script acts for the reader without being asked.` },

    { kind: 'compare', title: 'Three flavours of XSS',
      body: 'The same bug, three different routes into the page. What differs is where the bad text is kept.',
      cols: ['Where the script lives', 'How a victim is hit'],
      rows: [
        ['**Stored**', 'Saved in the site’s database (a comment, a profile)', 'Just visiting the page that shows it. The nastiest kind: it hits everyone.'],
        ['**Reflected**', 'In a link, echoed back in the response (a search page)', 'Clicking a crafted link. The server reflects the payload straight back.'],
        ['**DOM-based**', 'Only in the browser: client-side JavaScript writes it into the page', 'The page’s own script reads the URL or data and inserts it unsafely.']
      ] },

    { kind: 'sequence', title: 'Stored XSS, start to finish',
      body: 'Step through how one comment can reach thousands of people.',
      actors: ['Attacker', 'Website', 'Visitor'],
      steps: [
        { from: 0, to: 1, label: 'post comment with a script', note: 'The attacker submits a "comment" that is really a snippet of JavaScript.' },
        { at: 1, label: 'store it as-is', note: 'The site saves it in its database without treating it specially.' },
        { from: 2, to: 1, label: 'GET /post/7', note: 'Later, an ordinary visitor loads the page, logged in as themselves.' },
        { from: 1, to: 2, label: 'page + the stored comment', dashed: true, note: 'The server builds the page by pasting the comment into the HTML **without encoding it**.' },
        { at: 2, label: 'browser runs the script', note: 'The browser sees a script on a trusted site and runs it with the visitor’s powers.' },
        { from: 2, to: 0, label: 'sends stolen data', note: 'The script can ship the visitor’s data, or actions, to the attacker.' }
      ] },

    { kind: 'code', title: 'The bug, and the fix',
      body: 'Putting user text into the page as HTML is the problem. Putting it in as plain text is the cure. Tap the lines.',
      code: { lang: 'js', src: `
        // BAD: the string is parsed as HTML, so tags become real tags
        box.innerHTML = comment.text;

        // GOOD: the string is shown as text, whatever it contains
        box.textContent = comment.text;

        // Server side: let the template engine escape for you
        // <p>{{ comment.text }}</p>   -> escaped by default`,
        notes: {
          2: '`innerHTML` is a **sink**: a function that turns a string into live page elements. Feeding it untrusted text is how DOM XSS happens.',
          5: '`textContent` treats the string as plain characters. A `<script>` tag would simply appear as the words `<script>`.',
          8: 'Mainstream templating engines **escape by default**. The danger is switching that off or using a "raw" helper on user data.'
        } } },

    { kind: 'concept', title: 'The real fix: context-aware output encoding',
      body: `Where injection’s fix is *parameterised queries*, XSS’s fix is **output encoding**: before putting untrusted text into a page, convert characters that mean something to the browser into harmless equivalents. For example \`<\` becomes \`&lt;\`, so the browser shows a less-than sign instead of starting a tag.

        The word to remember is **context-aware**. The right encoding differs depending on whether you are putting text *inside HTML*, *inside an attribute*, *inside JavaScript* or *inside a URL*. That is why you should lean on a templating engine or framework that knows the difference, rather than writing your own replace rules.

        Rule of thumb: **encode on the way out, not just filter on the way in.**` },

    { kind: 'layers', title: 'Layers of XSS defence',
      body: 'Output encoding is the main fix. The rest are safety nets for when something slips through.',
      layers: [
        { label: 'Content Security Policy', note: 'A header telling the browser which scripts it may run. Blocks many injected scripts.', icon: '📜', tone: 'info' },
        { label: 'HttpOnly cookies', note: 'The session cookie cannot be read by JavaScript, so a stolen script cannot copy it.', icon: '🍪', tone: 'warn' },
        { label: 'Safe templating, no unsafe sinks', note: 'Escape by default; avoid `innerHTML` with untrusted data.', icon: '🧩', tone: 'accent' },
        { label: 'Output encoding', note: 'The core fix: untrusted text becomes harmless text.', icon: '🛡️', tone: 'good' }
      ] },

    { kind: 'code', title: 'Content Security Policy and HttpOnly in action',
      body: 'Two response headers: one tells the browser what scripts may run, the other hides the cookie from scripts.',
      code: { lang: 'http', src: `
        HTTP/1.1 200 OK
        Content-Security-Policy: default-src 'self'; script-src 'self'
        Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Lax`,
        notes: {
          2: '**CSP**: only load scripts from this site’s own origin. An injected inline `<script>` is refused, because it is not from an allowed source.',
          3: '`HttpOnly` stops `document.cookie` from seeing the cookie. `Secure` sends it only over HTTPS. `SameSite` comes up in the next lesson.'
        } },
      note: 'CSP is defence in depth, not a replacement for encoding. A policy that allows `unsafe-inline` scripts gives up most of its protection.' },

    { kind: 'pitfall', title: 'Common traps',
      body: `- **Blocking the word \`<script>\`.** Browsers run script in many other ways (event handlers on images, links, SVG). Filtering by keyword always loses.
        - **Encoding once, in the wrong place.** Text encoded for HTML is not safe inside a JavaScript string or a URL.
        - **\`HttpOnly\` as a cure.** It stops cookie theft, but the injected script can still *act* as the user without ever seeing the cookie.
        - **Trusting your own database.** Stored XSS means data you saved yourself can be hostile.

        In the lab that follows you will inject a script into a comment box, then fix it three ways and watch each defence stop it.` }
  ],

  activities: [
    { type: 'match', after: 3, prompt: 'Match each XSS type to how it works.',
      pairs: [['Stored XSS', 'The script is saved in the database and served to everyone'], ['Reflected XSS', 'The script rides in a crafted link and is echoed back'], ['DOM-based XSS', 'The page’s own JavaScript inserts attacker text unsafely']] },

    { type: 'mcq', after: 1, q: 'Why can an injected script on `shop.example` act as the logged-in visitor?',
      options: ['The browser treats it as the site’s own script, with its session', 'The script first steals the visitor’s password from the keyboard', 'Scripts run with administrator rights on the visitor’s computer', 'The server checks and approves every script before sending it'],
      answer: 0,
      why: [null, 'It does not need the password; it already runs inside the logged-in page.', 'Scripts are confined to the browser and the site’s origin.', 'The server has no idea the stored text is a script; that is the problem.'],
      explain: 'The browser judges scripts by where they came from. A script embedded in your page is treated as yours, and so it can use the visitor’s session.' },

    { type: 'spot', after: 5, prompt: 'Which line creates a DOM-based XSS hole?',
      code: { lang: 'js', src: `
        const params = new URLSearchParams(location.search);
        const name = params.get('name');
        const greeting = document.getElementById('greeting');
        greeting.innerHTML = 'Welcome back, ' + name;` },
      lines: [4],
      explain: 'Line 4 feeds text from the URL into `innerHTML`, so anyone who can craft a link controls what becomes HTML. Using `textContent` would show it as plain text.' },

    { type: 'ab', q: 'Which template line is safer for showing a user’s comment?',
      a: { lang: 'html', label: 'Raw output', src: `
        <p>{{{ comment.text }}}</p>   <!-- raw: no escaping -->` },
      b: { lang: 'html', label: 'Escaped output', src: `
        <p>{{ comment.text }}</p>     <!-- escaped by default -->` },
      answer: 'b',
      explain: 'The default in most templating engines turns `<` into `&lt;`, so text stays text. Triple braces (or a "raw" helper) deliberately turn escaping off, which is only safe for content you fully control.' },

    { type: 'tf', statement: 'With `HttpOnly` set on the session cookie, an injected script cannot read the cookie but can still act as the user from inside the page.', answer: true,
      explain: '`HttpOnly` stops scripts from reading the cookie, so it cannot be copied away. But the injected script still runs in the page and can make requests that carry the cookie automatically. It limits the damage; it does not remove the bug.' },

    { type: 'multi', q: 'Which of these are real defences against XSS?',
      options: ['Escaping untrusted text for the context where it is output', 'Using `textContent` instead of `innerHTML` for user text', 'A Content Security Policy that only allows your own scripts', 'Deleting the word "script" from user input', 'Hiding the comment form from search engines'],
      answers: [0, 1, 2],
      explain: 'Encoding is the core fix, safe DOM methods avoid dangerous sinks, and CSP is a safety net. Keyword filters are easily bypassed and hiding a form changes nothing about how output is handled.' },

    { type: 'cloze', text: 'XSS is fixed mainly by output {{encoding}}, which turns characters like `<` into harmless text. A {{Content Security Policy}} and an {{HttpOnly}} cookie are extra layers.',
      distractors: ['hashing', 'compression', 'caching'],
      explain: 'Encoding stops the browser interpreting text as markup. CSP restricts what scripts may run, and HttpOnly hides the session cookie from JavaScript, so both reduce damage if encoding is ever missed.' },

    { type: 'scenario', title: 'The comment box incident', intro: 'Your blog has a comment box. A reader emails you: "Your page popped up a strange login box asking me to confirm my password." Someone has injected a script into a comment.',
      meters: { 'visitor safety': 40, 'site trust': 60 },
      steps: [
        { text: 'First, stop more people being hit. What do you do?',
          choices: [
            { label: 'Remove the malicious comment and check the database for similar ones', score: 2, effects: { 'visitor safety': 25, 'site trust': 5 }, feedback: 'Stored XSS keeps hitting every visitor until the stored payload is gone. Clearing it and hunting for siblings stops the immediate harm.' },
            { label: 'Tell readers to be careful what they click', score: 0, effects: { 'visitor safety': -10, 'site trust': -10 }, feedback: 'This is stored XSS: visitors need not click anything. Opening the page is enough.' },
            { label: 'Ignore it; it only affected one visitor', score: 0, effects: { 'visitor safety': -15, 'site trust': -15 }, feedback: 'Stored XSS hits everyone who loads the page. One report usually means many unreported hits.' }
          ] },
        { text: 'Now fix the root cause in the code. Which change is the best?',
          choices: [
            { label: 'Encode comments for HTML on output (or use `textContent`), using the framework’s default escaping', score: 2, effects: { 'visitor safety': 35, 'site trust': 10 }, feedback: 'The core fix: user text can no longer become markup, whatever it contains.' },
            { label: 'Block comments containing the word `script`', score: 0, effects: { 'visitor safety': -5, 'site trust': -5 }, feedback: 'Attackers can run script through other tags and attributes. Keyword blocking always loses.' },
            { label: 'Require a longer comment', score: 0, effects: { 'visitor safety': -5 }, feedback: 'Length has nothing to do with whether text is interpreted as markup.' }
          ] },
        { text: 'The root cause is fixed. What defence-in-depth measure is worth adding next?',
          choices: [
            { label: 'Add a Content Security Policy and set the session cookie to HttpOnly', score: 2, effects: { 'visitor safety': 25, 'site trust': 15 }, feedback: 'If another XSS hole appears later, CSP may refuse the injected script and HttpOnly keeps the session cookie out of reach.' },
            { label: 'Nothing: encoding is perfect so extra layers are pointless', score: 1, effects: { 'visitor safety': -5 }, feedback: 'One missed output spot in a large codebase is enough. Layers are insurance for human error.' },
            { label: 'Disable JavaScript for all visitors', score: 0, effects: { 'visitor safety': 5, 'site trust': -20 }, feedback: 'You would break your own site for everyone, and it only works if visitors cooperate.' }
          ] }
      ],
      outro: 'The pattern to remember: **remove the payload, encode on output, then add CSP and HttpOnly as safety nets.**' },

    { type: 'explain', prompt: 'Explain in your own words what XSS is, why it is dangerous, and how you would defend against it.',
      model: 'XSS is when an attacker gets their JavaScript to run inside my web page, for example through a stored comment, a crafted link or unsafe DOM code. Because the browser treats the script as coming from my site, it runs with my origin and the visitor’s logged-in session, so it can read the page and act as them. The main defence is context-aware output encoding (framework templates that escape by default, textContent instead of innerHTML). A Content Security Policy and HttpOnly cookies add defence in depth.',
      keywords: ['script', 'origin', 'encoding', 'escape', 'innerHTML', 'CSP', 'HttpOnly'] }
  ],

  flashcards: [
    { q: 'What is XSS?', a: 'Cross-site scripting: an attacker gets their JavaScript to run in a page of your site, where it acts as the victim inside your origin.' },
    { q: 'Stored vs reflected vs DOM XSS?', a: 'Stored: saved on the server and served to everyone. Reflected: echoed back from a crafted link. DOM-based: the page’s own JavaScript inserts attacker data unsafely.' },
    { q: 'What is the main fix for XSS?', a: 'Context-aware output encoding, usually through a templating engine that escapes by default, plus avoiding `innerHTML`-style sinks with untrusted data.' },
    { q: 'What does a Content Security Policy do?', a: 'A response header telling the browser which sources of scripts and other content it may load, so injected scripts can be refused. It is defence in depth.' },
    { q: 'What does the HttpOnly cookie flag do, and what does it not do?', a: 'It hides the cookie from JavaScript, so XSS cannot copy it. It does not stop an injected script from making requests that carry the cookie.' }
  ],

  glossary: [
    { term: 'Cross-site scripting', def: 'A vulnerability that lets an attacker run their own script in a page on your site, so it acts as the visitor.', aka: ['XSS'], like: 'A forged notice pinned to the shop’s own noticeboard, believed by every customer.' },
    { term: 'Output encoding', def: 'Converting characters that have special meaning in a context (such as `<` in HTML) into harmless equivalents before output.', like: 'Putting a dangerous object in a labelled box before posting it.' },
    { term: 'Content Security Policy', def: 'A response header that tells the browser which sources of scripts and other content are allowed on a page.', aka: ['CSP'], like: 'A guest list at the door: scripts not on the list are not let in.' },
    { term: 'HttpOnly cookie', def: 'A cookie flagged so that JavaScript cannot read it. The browser still sends it with requests.', like: 'A safe-deposit box with a slot: the bank can use it, passers-by cannot see inside.' },
    { term: 'Sink', def: 'A function or property that turns text into live content or code, such as `innerHTML`; dangerous when fed untrusted data.' }
  ],

  takeaways: [
    'XSS runs the attacker’s script **as the victim, in your origin**: stored, reflected or DOM-based.',
    'The core fix is **context-aware output encoding**: escaping templates, `textContent`, no unsafe sinks.',
    '**Content Security Policy** and **HttpOnly** cookies are safety nets, not replacements.',
    'Never rely on blocking words like `<script>`: attackers have many other routes.'
  ],

  links: [
    { label: 'MDN: Cross-site scripting (XSS)', url: 'https://developer.mozilla.org/en-US/docs/Web/Security/Attacks/XSS' },
    { label: 'MDN: Content Security Policy', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ws-csrf-cors', {
  eli5: 'Browsers keep websites in separate boxes (the same-origin policy), but they still attach your login cookie to requests that a sneaky site triggers (CSRF), and CORS is the way a server deliberately lets one box talk to another.',

  cards: [
    { kind: 'story', title: 'The red error everyone meets',
      body: `You build a tiny front-end on \`localhost:3000\`. It calls your API on \`localhost:8000\`. You run it and the console shows a big red message about **CORS policy** and a blocked request.

        The API is fine. \`curl\` gets a perfect answer. Only the browser refuses.

        This confuses nearly everyone at first, because it feels like the server is broken. It is not: the browser is following a rule designed to protect *you*. To understand that rule, and the attack it exists for, we start with one question: **who is allowed to talk to whom?**` },

    { kind: 'concept', title: 'The same-origin policy',
      body: `An **origin** is three things together: **scheme + host + port**. Pages from the *same* origin can freely read each other’s data. Pages from *different* origins are walled off.

        | URL compared with \`https://shop.example\` | Same origin? |
        |---|---|
        | \`https://shop.example/cart\` | Yes (only the path differs) |
        | \`http://shop.example\` | No (scheme) |
        | \`https://api.shop.example\` | No (host) |
        | \`https://shop.example:8443\` | No (port) |

        The **same-origin policy** is the browser’s rule: scripts from one origin may not *read* responses from another. It is why a random website you visit cannot read your open email tab.` },

    { kind: 'metaphor', title: 'Companies on separate floors',
      body: `Picture an office tower where every company has its own floor and key card. Staff on the 5th floor can wander freely around the 5th floor. They cannot walk into the 6th floor and read its documents.

        But they *can* post a letter to the 6th floor, and that letter arrives. Posting is allowed; reading the reply is not.

        Hold on to that detail. The same-origin policy mostly blocks **reading** across origins. It does not stop a browser from **sending** a request, and that gap is where CSRF lives.` },

    { kind: 'sequence', title: 'CSRF: a request you never meant to send',
      body: 'You are logged in to your bank in one tab. In another, you open an innocent-looking page.',
      actors: ['Victim’s browser', 'Evil page', 'Bank'],
      steps: [
        { from: 0, to: 2, label: 'log in', note: 'Earlier, you logged in. The bank set a session **cookie** in your browser.' },
        { from: 0, to: 1, label: 'open evil.example', note: 'Later you visit a page the attacker controls. It looks harmless.' },
        { from: 1, to: 0, label: 'page with a hidden form', dashed: true, note: 'The page contains a form aimed at the bank’s transfer URL, and submits it with a line of script.' },
        { from: 0, to: 2, label: 'POST /transfer + your cookie', note: 'The browser dutifully sends the request. And, because it is going to the bank, it **attaches your bank cookie automatically**.' },
        { at: 2, label: 'looks like a real request', note: 'The bank sees a valid session and a well-formed transfer. It cannot tell *you* clicked it, so it obeys.' },
        { note: 'You never saw a thing. This is **cross-site request forgery**: the attacker forged a request that rides on your login.' }
      ] },

    { kind: 'concept', title: 'Why cookies make CSRF possible',
      body: `The core of the problem is that **browsers attach cookies automatically**, to every request to that site, no matter which page triggered it. The bank cannot tell "the user clicked a button on my site" from "another site made the browser send this".

        Notice what the attacker did *not* do: they did not steal the cookie and they did not read any response. They only needed the browser to *send* something. That is why the same-origin policy, which blocks reading, does not save you.

        So CSRF attacks **state-changing** requests: transfers, password changes, deletions. Mere reads are harmless because the attacker cannot see the result.` },

    { kind: 'steps', title: 'Defending against CSRF',
      body: 'Use these together. Each one closes a different gap.',
      steps: [
        { title: 'Set the SameSite attribute on cookies', body: '`SameSite=Lax` (or `Strict`) tells the browser not to attach the cookie to most cross-site requests. A forged POST from another site then arrives without your session. Chromium-based browsers such as Chrome and Edge now treat cookies without the attribute as Lax, but Firefox and Safari do not by default, so set it explicitly.' },
        { title: 'Add an anti-CSRF token', body: 'Put a random, per-session secret in every form (and API call). The server rejects state-changing requests without the right token. The attacker’s page cannot read your token, so it cannot include it.' },
        { title: 'Never change state on GET', body: 'Links, images and prefetching all make GET requests. If `GET /delete-account` works, any page can trigger it. Use POST, PUT or DELETE for changes.' },
        { title: 'Check Origin on sensitive requests', body: 'Servers can also compare the `Origin` or `Referer` header with their own. A transfer request that claims to come from `evil.example` can be refused.' }
      ] },

    { kind: 'code', title: 'A cookie and a form, both defended',
      body: 'The server sends a protected cookie, and every form carries a hidden token.',
      code: { lang: 'html', src: `
        <!-- Response header:
             Set-Cookie: session=abc123; HttpOnly; Secure; SameSite=Lax -->

        <form method="POST" action="/transfer">
          <input type="hidden" name="csrf_token" value="9f2c7a...random">
          <input name="amount">
          <button>Send</button>
        </form>`,
        notes: {
          2: '`SameSite=Lax`: the browser will not send this cookie on a cross-site form POST or background request. It still sends it when you simply click a link to the site.',
          5: 'A random value tied to *this user’s session*. The server checks it matches before changing anything.',
          4: 'Always POST for changes. Never expose state-changing actions as GET links.'
        } } },

    { kind: 'concept', title: 'CORS: relaxing the rule on purpose',
      body: `Sometimes cross-origin access is exactly what you want: your front-end on \`app.example\` legitimately calls your API on \`api.example\`. Different origins, so the browser blocks the reply.

        **CORS** (Cross-Origin Resource Sharing) is how the **server** says: "I allow this other origin to read my responses." It does that with response headers, such as \`Access-Control-Allow-Origin: https://app.example\`.

        Two facts matter:

        - CORS is a **relaxation** of the same-origin policy, not a security feature in itself.
        - It is enforced by **browsers**. \`curl\`, a script or an attacker’s server ignores it. It does not protect your server from anyone who is not a browser.` },

    { kind: 'sequence', title: 'A preflight request',
      body: 'For requests that could cause side effects (a JSON POST, a PUT, a custom header), the browser asks permission first with an `OPTIONS` request.',
      actors: ['Browser (app.example)', 'API (api.example)'],
      steps: [
        { at: 0, label: 'JS calls fetch(PUT + JSON)', note: 'A script on `app.example` wants to send a `PUT` with a JSON body to another origin. That is a **non-simple** request.' },
        { from: 0, to: 1, label: 'OPTIONS /items/5', note: 'The browser sends a **preflight**: "would you accept a PUT from app.example, with this header?"' },
        { from: 1, to: 0, label: '204 + Allow-Origin, -Methods, -Headers', dashed: true, note: 'The server answers with `Access-Control-Allow-Origin`, `-Allow-Methods` and `-Allow-Headers` describing what it allows.' },
        { from: 0, to: 1, label: 'PUT /items/5', note: 'Permission granted, so the browser sends the real request.' },
        { from: 1, to: 0, label: '200 + Allow-Origin', dashed: true, note: 'The response must carry `Access-Control-Allow-Origin` too, or the script will not be allowed to read it.' }
      ] },

    { kind: 'pitfall', title: 'Misconfigurations and myths',
      body: `- **"CORS blocked it, so the server was never called."** For "simple" requests (a plain form-style POST or a GET), the request still *reaches the server*; the browser only refuses to let the script *read the reply*. Do not rely on CORS to stop a request doing something.
        - **\`Access-Control-Allow-Origin: *\` with credentials.** A wildcard cannot be combined with cookies or other credentials. Browsers refuse it, and for good reason.
        - **Echoing back whatever \`Origin\` the request sends.** That is a wildcard in disguise, and with credentials it lets any site read your users’ data.
        - **Fixing the red error by allowing everything.** Allow the specific origins you trust.

        In the lab that follows you will make cross-origin requests and set the server’s CORS headers until the browser lets them through.` }
  ],

  activities: [
    { type: 'bucket', after: 1, prompt: 'The page is at `https://shop.example`. Is each of these the same origin?', buckets: ['Same origin', 'Different origin'],
      items: [['`https://shop.example/account`', 0], ['`http://shop.example`', 1], ['`https://pay.shop.example`', 1], ['`https://shop.example:8443`', 1], ['`https://shop.example:443/cart`', 0], ['`https://shop.example/a/b?x=1`', 0]],
      explain: 'An origin is scheme + host + port. The path and query never matter. Port 443 is the default for HTTPS, so naming it changes nothing, but a different scheme, host (even a subdomain) or port makes a new origin.' },

    { type: 'mcq', after: 4, q: 'Why does a forged request from `evil.example` to a bank arrive already logged in?',
      options: ['Browsers automatically attach the bank’s cookie to any request sent to the bank', 'The attacker stole the cookie in advance and pasted it in', 'The same-origin policy lets any site act for any other site', 'Banks do not check cookies on POST requests'],
      answer: 0,
      why: [null, 'CSRF does not need the cookie to be stolen; that is what makes it sneaky.', 'The policy mostly stops reading across origins, not sending.', 'Banks do check, but the forged request carries a perfectly valid cookie.'],
      explain: 'The browser attaches cookies by destination, not by who triggered the request. The bank sees a valid session and cannot tell the user did not mean it.' },

    { type: 'multi', after: 5, q: 'Which of these help defend against CSRF?',
      options: ['`SameSite` cookies', 'Anti-CSRF tokens in forms and API calls', 'Never changing state with GET requests', 'Hiding the transfer URL', 'Setting `Access-Control-Allow-Origin: *`'],
      answers: [0, 1, 2],
      explain: 'SameSite keeps the cookie off cross-site requests, tokens prove the request came from your own page, and safe GET semantics remove the easiest triggers. Hiding a URL does nothing, and a wildcard CORS header makes things worse, not better.' },

    { type: 'tf', statement: 'CORS protects a server from non-browser clients such as `curl` or a script on the attacker’s own machine.', answer: false,
      explain: 'CORS is enforced by browsers, to protect users. Any other client ignores it completely, so servers must still authenticate and authorise every request themselves.' },

    { type: 'order', prompt: 'Put a preflighted cross-origin request in order.',
      items: ['A script calls `fetch` with a PUT and JSON body to another origin', 'The browser sends an `OPTIONS` preflight request', 'The server replies with `Access-Control-Allow-*` headers', 'The browser sends the real PUT request', 'The script is allowed to read the response'],
      explain: 'The browser asks permission before sending anything risky. Only when the server’s headers agree does the real request go out and the reply become readable.' },

    { type: 'ab', q: 'Your API serves one front-end at `https://app.example` and uses cookies. Which CORS response is better?',
      a: { lang: 'http', label: 'Specific origin', src: `
        Access-Control-Allow-Origin: https://app.example
        Access-Control-Allow-Credentials: true` },
      b: { lang: 'http', label: 'Wildcard', src: `
        Access-Control-Allow-Origin: *
        Access-Control-Allow-Credentials: true` },
      answer: 'a',
      explain: 'Naming the one trusted origin is what you want. A wildcard cannot be used together with credentials, and browsers reject that combination, so it would not work and is dangerous in spirit.' },

    { type: 'short', q: 'The cookie attribute that stops the browser attaching a cookie to most cross-site requests is called `SameSite`. Which of these values is the strictest: Lax, None or ___?', accept: ['Strict'], hint: 'It is the opposite of relaxed.',
      explain: '`Strict` never sends the cookie on cross-site requests, even when you click a link. `Lax` allows top-level link navigations. `None` allows everything and requires `Secure`.' },

    { type: 'scenario', title: 'The red console error', intro: 'Your front-end at `https://app.example` calls your API at `https://api.example` and gets a CORS error. A teammate suggests a quick fix.',
      meters: { 'security': 70, 'working app': 20 },
      steps: [
        { text: 'The browser console says the response has no `Access-Control-Allow-Origin` header. What is the real cause?',
          choices: [
            { label: 'The API never told the browser that `app.example` may read its responses', score: 2, effects: { 'working app': 15 }, feedback: 'Exactly. Different origins are blocked by default; the server must opt in with CORS headers.' },
            { label: 'The API is down or has a bug', score: 0, effects: { 'security': -5 }, feedback: 'The request probably went through fine. It is the browser withholding the answer from your script.' },
            { label: 'The front-end must be moved onto the API’s server', score: 1, effects: { 'working app': 5 }, feedback: 'That would sidestep the issue, but it is not needed. A correct CORS header solves it without changing your architecture.' }
          ] },
        { text: 'A teammate wants to paste `Access-Control-Allow-Origin: *` on everything so the error goes away. Your API uses session cookies. What do you do?',
          choices: [
            { label: 'Allow only `https://app.example`, and enable credentials explicitly', score: 2, effects: { 'security': 20, 'working app': 40 }, feedback: 'Only your own front-end can read the responses, and credentials work because the origin is named.' },
            { label: 'Echo back whatever Origin the request sends', score: 0, effects: { 'security': -40, 'working app': 40 }, feedback: 'It works, because it is a wildcard in disguise. Any hostile site can now read your logged-in users’ data.' },
            { label: 'Use `*` and leave credentials off', score: 1, effects: { 'security': -5, 'working app': -10 }, feedback: 'Safer than echoing, but a cookie-based API will stop recognising users, and a wildcard is rarely what you want.' }
          ] },
        { text: 'The app sends JSON via PUT, and the browser now sends an OPTIONS request that returns 404. What is missing?',
          choices: [
            { label: 'The server must answer the preflight `OPTIONS` request with the allowed methods and headers', score: 2, effects: { 'working app': 35, 'security': 5 }, feedback: 'The preflight asks permission first. Without a correct answer, the real PUT is never sent.' },
            { label: 'Switch everything to GET so there is no preflight', score: 0, effects: { 'security': -25, 'working app': 10 }, feedback: 'Changing state with GET makes CSRF easier. Keep the correct methods and fix the preflight handling.' },
            { label: 'Disable CORS in the browser during development and in production', score: 0, effects: { 'security': -15 }, feedback: 'You cannot disable it for your users, and turning it off locally teaches you nothing about the real behaviour.' }
          ] }
      ],
      outro: 'The pattern to remember: **name the origins you trust, answer the preflight, and never let CORS stand in for real authentication.**' },

    { type: 'explain', prompt: 'Explain to a friend why a blocked CORS request in the browser does not mean the server is safe from other clients, and what CSRF has to do with the same-origin policy.',
      model: 'CORS is a browser rule: the server uses headers to relax the same-origin policy for certain origins, and the browser enforces it. Tools like curl ignore it, so the server must still authenticate and authorise requests itself. Also, the policy mostly stops scripts reading cross-origin responses, not the browser sending requests, and browsers attach cookies automatically, so a forged request from another site can still change state. That is CSRF, defended with SameSite cookies and anti-CSRF tokens.',
      keywords: ['browser', 'same-origin', 'cookie', 'CSRF', 'token', 'SameSite', 'preflight'] }
  ],

  flashcards: [
    { q: 'What is an origin?', a: 'Scheme + host + port, taken together. Pages with the same origin can read each other’s data; others are walled off.' },
    { q: 'Why is CSRF possible?', a: 'Browsers attach cookies automatically to every request to a site, even one triggered by another site, so a forged request arrives logged in.' },
    { q: 'How do you defend against CSRF?', a: 'SameSite cookies plus anti-CSRF tokens, and never change state on GET. Checking the Origin header helps too.' },
    { q: 'What is CORS, and who enforces it?', a: 'A server-declared relaxation of the same-origin policy using Access-Control-* headers. Browsers enforce it; other clients ignore it.' },
    { q: 'What triggers a preflight request?', a: 'A "non-simple" cross-origin request, such as a PUT or DELETE, a custom header or a JSON content type. The browser first sends an OPTIONS request to ask permission.' }
  ],

  glossary: [
    { term: 'Origin', def: 'The combination of scheme, host and port of a URL. Two URLs are same-origin only if all three match.', like: 'A building’s full address, including the entrance.' },
    { term: 'Same-origin policy', def: 'A browser rule that stops a script from one origin reading data from another origin.', like: 'Companies on separate floors of a tower.', aka: ['SOP'] },
    { term: 'CSRF', def: 'Cross-site request forgery: a hostile site makes your browser send a state-changing request to another site, riding on your logged-in cookie.', like: 'Someone slipping a pre-filled form into your outbox, to be signed with your authorised stamp.' },
    { term: 'SameSite cookie', def: 'A cookie attribute (Strict, Lax or None) that controls whether the cookie is sent on cross-site requests.' },
    { term: 'CORS', def: 'Cross-Origin Resource Sharing: HTTP headers by which a server tells the browser which other origins may read its responses.', like: 'A guest list that the building’s security desk (the browser) checks.' },
    { term: 'Preflight request', def: 'An automatic OPTIONS request the browser sends before a non-simple cross-origin request, to ask the server’s permission.', like: 'Phoning ahead to ask "may I deliver this?" before turning up.' }
  ],

  takeaways: [
    'An **origin** is scheme + host + port; the same-origin policy stops scripts **reading** across origins.',
    '**CSRF** works because browsers attach cookies automatically; defend with **SameSite** cookies, **anti-CSRF tokens** and no state change on GET.',
    '**CORS** is a server-declared relaxation that **browsers** enforce; it does not protect the server from non-browser clients.',
    'Preflight asks first, `*` cannot be used with credentials, and a "blocked" simple request may still have reached the server.'
  ],

  links: [
    { label: 'MDN: Same-origin policy', url: 'https://developer.mozilla.org/en-US/docs/Web/Security/Same-origin_policy' },
    { label: 'MDN: Cross-Origin Resource Sharing (CORS)', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ws-server-security', {
  eli5: 'Hardening a server means making the machine itself hard to break into: keep it updated, install only what you need, give every program the fewest powers possible, close unused doors and never leave secrets lying around.',

  cards: [
    { kind: 'story', title: 'The server nobody remembered',
      body: `A team launches a small app on a rented server. Months later it is all quiet. Nobody has logged in since launch.

        Meanwhile the server is still running the software versions it launched with. It has a database port open to the internet "for testing", a login that accepts passwords, and an old demo tool someone forgot to remove.

        No attacker needs to be clever. Automated scanners find machines like this within hours of them appearing online and try the well-known weaknesses one after another. **Hardening** is the habit of fixing exactly those boring things before anyone tries them.` },

    { kind: 'concept', title: 'Patch promptly, install minimally',
      body: `Two habits do an enormous amount.

        **Patch promptly.** Software has bugs, and some are security holes. When one is found and fixed, the fix is published, and so are the details of the hole. From that moment attackers race to use it against everyone who has not updated. Operating system, web server, language runtime, libraries: all of it.

        **Install minimally.** Every package you install is more code that could contain a hole, and more attack surface. A server that only runs your app does not need a compiler, a mail server or a desktop. Fewer things installed means fewer things to patch and fewer things to attack.` },

    { kind: 'metaphor', title: 'Moving house, then changing the locks',
      body: `Hardening a server is like moving into a flat that previously belonged to strangers.

        You do not just move your sofa in. You **change the locks** (nobody else has a key), **empty the cupboards** of things you did not put there (remove software you do not use), **check which windows open** (close unused ports) and **give spare keys only to people who need them** (least privilege).

        Where the metaphor stops: a flat stays as you leave it, but a server needs *ongoing* care. New holes in software appear all the time, so patching never finishes.` },

    { kind: 'concept', title: 'Least privilege and SSH keys',
      body: `**Least privilege**: every user and program gets only the permissions it needs to do its job, and nothing more. Run your web app as an ordinary account, not as the all-powerful administrator (\`root\`). Then if the app is hacked, the attacker gets that small account, not the whole machine.

        **SSH** is how you log in to a remote server's command line. Passwords can be guessed by bots trying thousands per minute. **SSH keys** are better: a long, random key pair, the private half stays on your computer and the server holds only the public half. Nothing short or guessable travels at all.

        Common setup: turn off password logins and direct root login, and allow key-based logins only.` },

    { kind: 'code', title: 'A locked-down SSH configuration',
      body: 'A few lines in the server’s SSH settings remove the two most-attacked doors. Tap the lines.',
      code: { lang: 'text', src: `
        # /etc/ssh/sshd_config  (excerpt)
        PasswordAuthentication no
        PermitRootLogin no
        PubkeyAuthentication yes`,
        notes: {
          2: 'No passwords. Bots can no longer guess their way in, because there is no password to guess.',
          3: 'Nobody logs in directly as `root`. People log in as themselves and use elevated powers only when needed, which also leaves a record of who did what.',
          4: 'Only holders of an approved private key can log in.'
        } },
      note: 'Guard the private key like a house key: never share it, never commit it to a repository, and protect it with a passphrase.' },

    { kind: 'diagram', title: 'Firewalls and closed ports',
      body: 'Every network service listens on a numbered **port**. A firewall decides which ports the outside world can reach. Open only what the public needs.',
      nodes: [
        { id: 'net', label: 'The internet', icon: '🌍', x: 1, y: 0 },
        { id: 'fw', label: 'Firewall', icon: '🧱', x: 1, y: 1, tone: 'accent' },
        { id: 'web', label: 'Web server :443', icon: '🌐', x: 0, y: 2, tone: 'good' },
        { id: 'ssh', label: 'SSH :22 (your IPs only)', icon: '🔑', x: 1, y: 2, tone: 'warn' },
        { id: 'db', label: 'Database :5432', icon: '🗄️', x: 2, y: 2, tone: 'bad' }
      ],
      edges: [
        { from: 'net', to: 'fw', label: 'all traffic' },
        { from: 'fw', to: 'web', label: 'allowed' },
        { from: 'fw', to: 'ssh', label: 'restricted', dashed: true },
        { from: 'fw', to: 'db', label: 'blocked', dashed: true }
      ],
      caption: 'The database talks only to the app server, never directly to the public internet.' },

    { kind: 'pitfall', title: 'Secrets in the repository',
      body: `A **secret** is any value that grants access: database passwords, API keys, signing keys, SSH private keys. The classic mistake is putting them in the code or a config file and committing that to version control.

        Repositories get copied, shared and sometimes made public. Anything committed stays in the history *even after you delete it*, and automated bots scan public repositories for fresh keys within minutes.

        Keep secrets **out of the repository**. Load them from environment variables or, better, a **secret manager** that stores them encrypted, controls who may read them and can rotate them. If one does leak, treat it as compromised and change it.` },

    { kind: 'compare', title: 'Where should a secret live?',
      body: 'From worst to best.',
      cols: ['Verdict', 'Why'],
      rows: [
        ['Hard-coded in source', 'Never', 'Ends up in version control and every copy of the code'],
        ['A config file in the repository', 'Never', 'Same problem, just in another file'],
        ['An environment variable', 'Acceptable', 'Out of the code; still visible to anything that can read the process'],
        ['A secret manager', 'Best', 'Encrypted, access-controlled, auditable and rotatable']
      ] },

    { kind: 'code', title: 'Security headers that harden every response',
      body: 'Some protection is just a handful of response headers that tell the browser to behave more strictly. Tap the lines.',
      code: { lang: 'http', src: `
        HTTP/1.1 200 OK
        Strict-Transport-Security: max-age=31536000; includeSubDomains
        Content-Security-Policy: default-src 'self'
        X-Content-Type-Options: nosniff`,
        notes: {
          2: '**HSTS**: "for the next year, only talk to me over HTTPS." Stops downgrade to plain HTTP once the browser has seen this header.',
          3: '**CSP**: which sources of scripts and content are allowed. You met it in the XSS lesson.',
          4: '**nosniff**: do not guess a file’s type; trust the declared `Content-Type`. This stops a text file being run as a script.'
        } },
      note: 'Also set TLS properly: serve only modern TLS versions with strong settings, keep certificates valid, and redirect HTTP to HTTPS. Tools such as Mozilla’s SSL configuration generator give sensible, current settings.' },

    { kind: 'tip', title: 'A hardening checklist you can run today',
      body: `1. **Update** the OS and every package; switch on automatic security updates where sensible.
        2. **Remove** software and accounts you do not use.
        3. **Run the app as a limited user**, never as root.
        4. **SSH keys only**: no passwords, no direct root login.
        5. **Firewall**: deny by default, open only what is needed.
        6. **Secrets** in a manager or the environment, never in Git.
        7. **HTTPS everywhere** with HSTS, plus CSP and nosniff headers.
        8. **Log** logins and changes, and look at the logs.

        None of these is glamorous. Together they stop the great majority of attacks that bots try first.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'A critical flaw is found in a web server package and a fix is published. Why should you patch quickly?',
      options: ['The fix reveals the hole, so attackers rush to exploit unpatched servers', 'Security patches always make the server run noticeably faster', 'Unpatched holes close by themselves after about a week or so', 'Patching is only worth doing once you have already been attacked'],
      answer: 0,
      why: [null, 'Some patches do, but speed is not the reason security patches are urgent.', 'Holes do not close on their own.', 'Waiting for an attack means the damage is already done.'],
      explain: 'Publishing a fix also publishes what the weakness was. The gap between "fix available" and "you installed it" is exactly when attackers scan for you.' },

    { type: 'tf', after: 4, statement: 'Turning off SSH password logins in favour of key-based logins stops attackers guessing passwords to get in.', answer: true,
      explain: 'With passwords disabled there is nothing for a bot to guess; the server accepts only holders of an approved private key. Protect those keys, and keep them out of repositories.' },

    { type: 'bucket', after: 5, prompt: 'The server is on the public internet. Should the firewall allow each port from anywhere?', buckets: ['Open to the public', 'Restrict or block'],
      items: [['HTTPS (443) for your website', 0], ['Database port (e.g. 5432)', 1], ['SSH (22) from anyone', 1], ['Redis cache port', 1], ['HTTP (80) that redirects to HTTPS', 0], ['A forgotten admin tool on port 8080', 1]],
      explain: 'The public needs only the website ports. Databases, caches, admin tools and SSH should be reachable only from the app servers or specific trusted addresses, if at all.' },

    { type: 'spot', prompt: 'Tap the line that is a serious security mistake.',
      code: { lang: 'js', src: `
        const express = require('express');
        const db = connect({
          host: 'db.internal',
          user: 'shop_app',
          password: 'Sup3rS3cret!'
        });
        const app = express();` },
      lines: [5],
      explain: 'A password written in the source will be committed to version control and copied everywhere the code goes. Read it from an environment variable or a secret manager instead.' },

    { type: 'ab', q: 'Which is the better way to run the web app on the server?',
      a: { lang: 'sh', label: 'As root', src: `
        sudo su -
        node /srv/app/server.js` },
      b: { lang: 'sh', label: 'As a limited user', src: `
        sudo -u appuser node /srv/app/server.js` },
      answer: 'b',
      explain: 'If the app is compromised, an attacker inherits its privileges. A limited account contains the damage; root hands over the whole machine.' },

    { type: 'order', prompt: 'Put these in order of how good a home they are for a database password, worst first.',
      items: ['Typed directly into the source code', 'In a config file committed to Git', 'In an environment variable on the server', 'In a dedicated secret manager'],
      explain: 'The further a secret is from the code and the repository, and the more access control and rotation around it, the better. A secret manager adds encryption, permissions and audit.' },

    { type: 'match', prompt: 'Match each security header or setting to what it does.',
      pairs: [['Strict-Transport-Security', 'Tells browsers to use only HTTPS for this site'], ['Content-Security-Policy', 'Restricts which sources of scripts and content may load'], ['X-Content-Type-Options: nosniff', 'Stops the browser guessing file types'], ['HttpOnly cookie flag', 'Hides the cookie from JavaScript'], ['SSH key login', 'Replaces guessable passwords with a key pair']] },

    { type: 'scenario', title: 'Inheriting a neglected server', intro: 'You have joined a small team and inherit a single cloud server running their app. Nobody has touched it in a year. You have a morning to make it safer.',
      meters: { 'security': 25, 'uptime': 90 },
      steps: [
        { text: 'You log in and see updates pending for months. What do you do?',
          choices: [
            { label: 'Apply security updates in a quiet window, after taking a backup or snapshot', score: 2, effects: { 'security': 25, 'uptime': -5 }, feedback: 'Exactly right. You close known holes, and the snapshot gives you a way back if an update misbehaves.' },
            { label: 'Leave it alone: it works, and updates might break it', score: 0, effects: { 'security': -10 }, feedback: 'Stability that depends on unpatched software is borrowed time. Known holes are what scanners look for.' },
            { label: 'Update everything in the middle of the busiest hour', score: 1, effects: { 'security': 20, 'uptime': -25 }, feedback: 'The instinct is right but the timing is not. Choose a quiet window and have a rollback ready.' }
          ] },
        { text: 'The firewall review shows the database port open to the whole internet, and SSH accepting passwords. What next?',
          choices: [
            { label: 'Close the database port to the public, restrict SSH, and switch to key-only logins', score: 2, effects: { 'security': 30, 'uptime': -3 }, feedback: 'You removed two of the most attacked doors in one step. Test your key login in a second session before closing the first.' },
            { label: 'Change the database password and leave the port open', score: 1, effects: { 'security': 10 }, feedback: 'Better than nothing, but an exposed database is still attackable in many other ways. Closed is safer than guarded.' },
            { label: 'Leave both as they are and add a longer SSH password', score: 0, effects: { 'security': 0 }, feedback: 'A long password is better than a short one, but bots still hammer it. Keys remove the problem altogether.' }
          ] },
        { text: 'You find a file in the repository called `.env` containing live database and payment-provider keys. What now?',
          choices: [
            { label: 'Rotate every key in it, move them to a secret manager, and remove the file from the repo', score: 2, effects: { 'security': 25 }, feedback: 'Once committed, a secret is in the history. The only safe move is to treat it as leaked and replace it.' },
            { label: 'Delete the file and commit; it is gone from the code', score: 0, effects: { 'security': -5 }, feedback: 'It still lives in earlier commits and in every clone. The keys are still valid until changed.' },
            { label: 'Make the repository private and carry on', score: 1, effects: { 'security': 5 }, feedback: 'Fewer eyes, but the keys have already been shared with everyone who ever had access. Rotate them.' }
          ] }
      ],
      outro: 'The pattern to remember: **patch, shrink, restrict, and keep secrets out of the repository.**' },

    { type: 'explain', prompt: 'A friend has just rented a server for their side project. Explain, in your own words, the four most valuable things they should do to lock it down.',
      model: 'First, keep everything patched and install only what is needed, to shrink the attack surface. Second, use least privilege: run the app as a limited user, and log in over SSH with keys instead of passwords, with root login off. Third, use a firewall so only needed ports like HTTPS are open and databases are not public. Fourth, keep secrets out of the repository, in environment variables or a secret manager, and turn on HTTPS with security headers like HSTS.',
      keywords: ['patch', 'least privilege', 'SSH keys', 'firewall', 'secrets', 'HTTPS', 'HSTS'] }
  ],

  flashcards: [
    { q: 'Why patch promptly?', a: 'When a fix is published, the details of the hole become public too, and attackers race to exploit servers that have not updated.' },
    { q: 'What is least privilege?', a: 'Each user and program gets only the permissions it needs, so a compromise of one gives the attacker as little as possible.' },
    { q: 'Why prefer SSH keys over passwords?', a: 'Bots can guess passwords; a key pair has nothing short or guessable to try, and the private key never crosses the network.' },
    { q: 'Where should secrets live?', a: 'Never in code or the repository. Use environment variables or, better, a secret manager; rotate any secret that leaks.' },
    { q: 'What do HSTS and X-Content-Type-Options do?', a: 'HSTS tells browsers to use only HTTPS for the site. nosniff stops the browser guessing a file’s type and running it as something else.' }
  ],

  glossary: [
    { term: 'Hardening', def: 'Reducing a system’s attack surface and tightening its settings so it is harder to break into.', like: 'Changing the locks and closing the spare windows after moving in.' },
    { term: 'Least privilege', def: 'Giving each user or program only the permissions it needs, and nothing more.', like: 'A spare key that opens only the room you need.' },
    { term: 'SSH key', def: 'A pair of long random keys used to log in to a server: the public half sits on the server, the private half stays with you.', like: 'A lock that only your own unforgeable key fits.' },
    { term: 'Secret manager', def: 'A service that stores secrets encrypted, controls who may read them, and can rotate and audit them.', like: 'A bank’s safe-deposit room with a visitors’ book.' },
    { term: 'HSTS', def: 'A response header that tells browsers to contact the site only over HTTPS for a set period.', aka: ['Strict-Transport-Security'], like: 'A note on your door: "Never accept deliveries from anyone who is not in uniform."' }
  ],

  takeaways: [
    '**Patch fast, install little**: fewer packages means a smaller attack surface.',
    '**Least privilege** and **SSH keys** limit the damage from a mistake or a stolen password.',
    '**Firewall by default-deny**: only the public ports (like 443) are open; databases are not.',
    '**Secrets stay out of the repository**; send **HSTS, CSP and nosniff** headers and use modern TLS.'
  ],

  links: [
    { label: 'OWASP: Secrets Management Cheat Sheet', url: 'https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html' },
    { label: 'MDN: HTTP Strict Transport Security', url: 'https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ws-api-security', {
  eli5: 'Before an API goes live, check the same short list every time: who is asking, are they allowed, is the input sane, is the output minimal, is abuse limited, and would we notice if something went wrong.',

  cards: [
    { kind: 'story', title: 'The API that trusted the app',
      body: `A startup builds a mobile app and an API behind it. The app only ever shows your own orders, so the team assumes users only ever see their own orders.

        A curious user opens the app’s network traffic and sees a request to \`/api/orders/1042\`. They change the number to 1043. The server happily returns someone else’s order. They script it, and download every order the company has ever taken.

        The app was careful. The **API** was not, and attackers talk to the API directly, never through your app. The rule that follows: **the API must defend itself on every single request.**` },

    { kind: 'concept', title: 'Authenticate and authorise every request',
      body: `Two checks, on every request, on the server.

        **Authenticate**: who is this? Verify a session or token each time. Do not assume that because a request came from your own front-end it is trustworthy.

        **Authorise**: is *this* caller allowed to do *this* action on *this* object? That last part matters most. The story above passed the first check and failed the second: the user was logged in, but order 1043 was not theirs.

        You studied this as Broken Access Control, the top item in OWASP’s 2021 list. Hiding buttons in a user interface is decoration. The server decides.` },

    { kind: 'layers', title: 'What happens to a request, top to bottom',
      body: 'A defensive API runs each request through a stack of gates. Skipping one leaves a gap.',
      layers: [
        { label: 'HTTPS only', note: 'Encrypted in transit; plain HTTP is refused or redirected.', icon: '🔒', tone: 'info' },
        { label: 'Rate limit', note: 'Too many requests from one caller get a 429 before any real work.', icon: '🚦', tone: 'warn' },
        { label: 'Authenticate', note: 'A valid token or session, checked every time.', icon: '🪪', tone: 'accent' },
        { label: 'Authorise', note: 'Is this caller allowed this action on this exact object?', icon: '🔑', tone: 'accent' },
        { label: 'Validate input', note: 'Right type, size and shape, or reject with 400.', icon: '🧪', tone: 'good' },
        { label: 'Log and audit', note: 'Record who did what, without secrets, so you can investigate.', icon: '📝', tone: 'muted' }
      ] },

    { kind: 'concept', title: 'Validate input, limit output',
      body: `**Validate input.** Check type, length, range and format of everything that arrives: bodies, query strings, headers, IDs in the URL. Use an allow-list ("status must be one of these three values") rather than a block-list. Reject bad input with a clear 400 response. Remember: validation is a layer; parameterised queries and output encoding remain the real fixes for injection and XSS.

        **Limit output.** Return only what the caller needs. A user lookup should not return the password hash, internal flags or other people’s email addresses just because the database row had them. Build explicit response shapes instead of dumping whole database records.

        Be careful too with bulk updates: accepting a request body and writing every field straight to the database lets a user set \`"role": "admin"\` on themselves.` },

    { kind: 'compare', title: 'Leaky versus careful responses',
      body: 'Same endpoint, two ways to build the answer.',
      cols: ['Dumps the whole record', 'Returns a chosen shape'],
      rows: [
        ['What goes out', 'Every column, including hashes and internal flags', 'Only the fields the client needs'],
        ['A new column is added', 'It leaks automatically', 'Nothing changes until you add it on purpose'],
        ['Errors', 'Stack traces and SQL messages', 'A generic message and a log entry for you'],
        ['Risk if a bug slips in', 'High: extra data goes out', 'Lower: the shape is the limit']
      ] },

    { kind: 'metaphor', title: 'A bouncer, a till and a CCTV camera',
      body: `Picture a busy bar. The **bouncer** checks IDs and caps the queue (authentication and rate limiting). The **barman** serves only what each person is entitled to, and checks the drinks are what was ordered (authorisation and validation). The **CCTV camera** records everything so an incident can be reconstructed afterwards (logging and audit).

        None of them is enough alone. A bar with only a bouncer is a bar where anyone inside can do anything.

        The metaphor stops where the attackers can queue by the million; the API’s bouncer has to be automatic.` },

    { kind: 'code', title: 'An endpoint that does it properly',
      body: 'Every defence from the stack, in a few lines. Tap them.',
      code: { lang: 'js', src: `
        app.get('/api/orders/:id', limiter, authenticate, async (req, res) => {
          const id = Number(req.params.id);
          if (!Number.isInteger(id)) return res.status(400).json({ error: 'bad id' });

          const order = await db.query(
            'SELECT id, status, total FROM orders WHERE id = ? AND user_id = ?',
            [id, req.user.id]);

          if (!order) return res.status(404).json({ error: 'not found' });
          audit('order.read', req.user.id, id);
          res.json(order);
        });`,
        notes: {
          1: '`limiter` caps requests per caller; `authenticate` verifies who is asking. Both run before any real work.',
          3: '**Validate input**: an ID must be a whole number. Anything else gets a 400.',
          5: 'A **parameterised** query: the ID is passed as a value, never glued into the SQL.',
          6: '**Authorise** in the query itself (`user_id = ?`): someone else’s order simply does not match. It also selects only the columns the client needs, so no hashes or internal flags.',
          9: 'A generic 404 whether the order does not exist or belongs to someone else. No internals leak.',
          10: '**Audit**: record who read what, never passwords or tokens.'
        } } },

    { kind: 'concept', title: 'Rate limits, secrets, logs and errors',
      body: `**Rate limiting** caps how many requests one caller can make in a given time and answers the excess with \`429 Too Many Requests\`. It slows password guessing, scraping and floods. Apply tighter limits to expensive or sensitive endpoints such as login.

        **Secrets** stay out of code and logs. API keys and tokens belong in a secret manager or the environment, and a leaked one is rotated at once.

        **Logging and audit** record who did what and when, so you can investigate. Never log passwords, tokens or full card numbers.

        **Errors** should help the client but not the attacker: "something went wrong, reference 8f3a" to them, the full detail to your logs.` },

    { kind: 'pitfall', title: 'Traps that catch real teams',
      body: `- **Trusting the client.** "The app never sends that" is not a defence. Anyone can send anything to your API.
        - **Authorising once, at the front door.** Check the permission on every object and every action, not just at login. Guessable sequential IDs make the gap easy to exploit.
        - **Verbose errors.** A stack trace tells an attacker your framework, your file paths and sometimes your query.
        - **\`CORS: *\` as a fix.** CORS protects users in browsers, not your server from scripts, so it is not an API security control.
        - **No limit on anything.** Page sizes, upload sizes, request rates: an endless list invites abuse.` },

    { kind: 'steps', title: 'The pre-launch checklist',
      body: 'Run this before any endpoint goes live. It is the whole module in eight lines.',
      steps: [
        { title: 'Transport and identity', body: 'HTTPS everywhere. Every request authenticated. No endpoint public by accident.' },
        { title: 'Permissions', body: 'Every action checks that *this* caller may touch *this* object, on the server.' },
        { title: 'Input', body: 'Types, sizes and ranges validated. Queries parameterised. Output encoded where HTML is produced.' },
        { title: 'Output', body: 'Explicit response shapes. No secrets, hashes or internals. Generic error messages.' },
        { title: 'Abuse', body: 'Rate limits and size limits on every endpoint, tighter on login and costly operations.' },
        { title: 'Observability', body: 'Logs of logins, denials and changes with no secrets in them; alerts for odd spikes. Secrets in a manager, not the repo.' }
      ] }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'A logged-in user changes `/api/orders/1042` to `/api/orders/1043` and sees someone else’s order. Which check was missing?',
      options: ['Authorisation: whether this user may access this particular order', 'Authentication: whether the user is logged in at all', 'HTTPS: encryption between client and server', 'Rate limiting on the order endpoint'],
      answer: 0,
      why: [null, 'The user was authenticated; the problem is what they were allowed to do.', 'HTTPS protects data in transit but does not decide who may read an order.', 'A rate limit would slow the scraping but not stop the first leak.'],
      explain: 'The server confirmed who the caller was but never asked whether the order was theirs. Authorisation has to check the caller against each object, on every request.' },

    { type: 'spot', after: 6, prompt: 'Tap the line where the endpoint forgets to check ownership.',
      code: { lang: 'js', src: `
        app.delete('/api/notes/:id', authenticate, async (req, res) => {
          const id = Number(req.params.id);
          if (!Number.isInteger(id)) return res.status(400).end();
          await db.query('DELETE FROM notes WHERE id = ?', [id]);
          res.status(204).end();
        });` },
      lines: [4],
      explain: 'Line 4 deletes any note by ID. It should include `AND user_id = ?` with the caller’s ID, so users can delete only their own notes.' },

    { type: 'tf', statement: 'If your own mobile app never sends a certain field, the API does not need to validate it.', answer: false,
      explain: 'Attackers call the API directly with whatever they like. The server must validate everything it receives, regardless of what the official client does.' },

    { type: 'ab', q: 'Which response is better for a request that hits an unexpected server error?',
      a: { lang: 'http', label: 'Detailed', src: `
        500 Internal Server Error
        {"error": "SQLSTATE[23000]: users.email at /srv/app/db.js:88"}` },
      b: { lang: 'http', label: 'Generic', src: `
        500 Internal Server Error
        {"error": "Something went wrong", "ref": "8f3a21"}` },
      answer: 'b',
      explain: 'The client needs to know something failed and have a reference to quote. The full detail belongs in your own logs, because internals help attackers plan their next move.' },

    { type: 'multi', q: 'Which of these belong on a pre-launch API security checklist?',
      options: ['Authenticate and authorise every request on the server', 'Rate-limit callers, especially on login', 'Return only the fields the client needs', 'Log security events, without secrets in the logs', 'Allow cross-origin access from every site to avoid errors'],
      answers: [0, 1, 2, 3],
      explain: 'Each of the first four closes a real gap. Allowing every origin is not a protection at all and can expose logged-in users’ data.' },

    { type: 'match', prompt: 'Match the HTTP status to when an API should return it.',
      pairs: [['400 Bad Request', 'The input failed validation'], ['401 Unauthorized', 'The caller is not authenticated'], ['403 Forbidden', 'Authenticated, but not allowed to do this'], ['404 Not Found', 'The thing does not exist (or is hidden from you)'], ['429 Too Many Requests', 'The caller hit the rate limit']] },

    { type: 'order', prompt: 'Put the gates a request should pass in a sensible order.',
      items: ['HTTPS connection established', 'Rate limit checked', 'Caller authenticated', 'Caller authorised for this object', 'Input validated and the action performed', 'Event written to the audit log'],
      explain: 'Cheap, broad gates go first so that abusive traffic is dropped before expensive work. Authorisation needs to know who the caller is, and the audit log records the outcome at the end.' },

    { type: 'estimate', q: 'A login endpoint has no rate limit. A bot tries 10 passwords per second against one account. About how many guesses is that in one day?', answer: 864000, unit: 'guesses', tolerance: 2, min: 1000, max: 100000000,
      explain: '10 per second × 60 × 60 × 24 is 864,000 guesses a day from one machine, with no effort. A rate limit (plus lockouts or extra checks) brings that down to a trickle.' },

    { type: 'scenario', title: 'Launch day review', intro: 'Your team is releasing a public API for a notes app tomorrow. You have been asked to give it a final security review. A junior developer built it in a hurry.',
      meters: { 'safety': 35, 'launch time': 80 },
      steps: [
        { text: 'You read the code for `GET /api/notes/:id` and find it fetches the note by ID alone. What do you require?',
          choices: [
            { label: 'Add an ownership check so the note must belong to the caller', score: 2, effects: { 'safety': 25, 'launch time': -5 }, feedback: 'This closes the biggest hole: any logged-in user reading any note by guessing IDs. Authorise per object, every time.' },
            { label: 'Switch to long random IDs and call it done', score: 1, effects: { 'safety': 10 }, feedback: 'Random IDs make guessing harder, which is a nice extra layer. But if one ID leaks, the missing check still lets anyone read the note.' },
            { label: 'Ship it: the app only shows users their own notes', score: 0, effects: { 'safety': -15 }, feedback: 'Attackers bypass the app and call the API directly.' }
          ] },
        { text: 'The note list endpoint returns the full database row for each user mention, including password hashes. How do you fix it?',
          choices: [
            { label: 'Return an explicit shape: just id, display name and avatar', score: 2, effects: { 'safety': 25, 'launch time': -5 }, feedback: 'Limiting output means a future column cannot leak by accident. Hashes should never leave the server.' },
            { label: 'Ask clients to ignore the extra fields', score: 0, effects: { 'safety': -15 }, feedback: 'Attackers read the raw response. Whatever goes over the wire is exposed.' },
            { label: 'Encrypt the response body with a home-made scheme', score: 0, effects: { 'safety': -5, 'launch time': -20 }, feedback: 'HTTPS already encrypts in transit, and home-made cryptography is a famous way to fail. The fix is not sending the data in the first place.' }
          ] },
        { text: 'Last gap: there is no rate limiting and logins are not logged. With limited time, what do you add?',
          choices: [
            { label: 'A rate limit (tighter on login) and logging of logins and denials, with no secrets in the logs', score: 2, effects: { 'safety': 20, 'launch time': -10 }, feedback: 'Slows guessing and scraping, and gives you evidence if something happens. A pre-launch checklist covers both.' },
            { label: 'Only logging, and add limits next quarter', score: 1, effects: { 'safety': 8 }, feedback: 'You will see the abuse, but nothing slows it. Basic limits are quick to add.' },
            { label: 'Log every request body in full to be safe', score: 0, effects: { 'safety': -10 }, feedback: 'Bodies contain passwords and personal data. Your logs would become a new treasure chest for attackers.' }
          ] }
      ],
      outro: 'The pattern to remember: **authorise per object, shape the output, limit abuse, and log what matters without logging secrets.**' },

    { type: 'explain', prompt: 'Explain why "our app only shows users their own data" is not an API security strategy, and name three controls you would add.',
      model: 'Attackers do not use our app; they send requests straight to the API, so the app’s behaviour protects nothing. The server must check on every request who is calling and whether they may touch that specific object. I would add per-object authorisation, input validation with explicit, minimal response shapes, and rate limiting with logging that records events but never secrets. Everything runs over HTTPS and errors stay generic.',
      keywords: ['authoris', 'every request', 'validate', 'rate limit', 'log', 'HTTPS', 'directly'] }
  ],

  flashcards: [
    { q: 'What two checks must an API perform on every request?', a: 'Authentication (who is this?) and authorisation (may they do this action on this object?), both on the server.' },
    { q: 'What does "validate input, limit output" mean?', a: 'Check type, size and shape of everything arriving, and return only the fields the caller needs, never whole database records.' },
    { q: 'What does rate limiting do, and which status code does it use?', a: 'It caps requests per caller per time window and answers the excess with 429 Too Many Requests, slowing guessing, scraping and floods.' },
    { q: 'What should and should not go in logs?', a: 'Log who did what and when, including logins and denials. Never log passwords, tokens or full card numbers.' },
    { q: 'How should errors look to an API client?', a: 'Generic, with a reference code. Detailed errors and stack traces stay in your own logs.' }
  ],

  glossary: [
    { term: 'Rate limiting', def: 'Capping how many requests a caller can make in a time window, replying with 429 when exceeded.', like: 'A bouncer letting people in a few at a time.' },
    { term: 'Allow-list', def: 'A list of the values you accept (everything else is rejected), safer than trying to list everything bad.', like: 'A guest list rather than a list of banned people.', aka: ['whitelist'] },
    { term: 'Audit log', def: 'A record of who did what and when, kept so incidents can be investigated afterwards.', like: 'CCTV for your API.' },
    { term: 'Mass assignment', def: 'A flaw where a request body is written straight onto a record, letting users set fields they should not, such as a role.' },
    { term: 'Pre-launch checklist', def: 'A short list of security checks every endpoint must pass before going live.', like: 'A pilot’s checklist before take-off.' }
  ],

  takeaways: [
    '**Authenticate and authorise every request**, per object, on the server. The client proves nothing.',
    '**Validate** what comes in and **return only** what is needed; keep errors generic.',
    '**Rate-limit**, use HTTPS everywhere, and keep **secrets out of code and logs**.',
    'Run a **pre-launch checklist** on every endpoint: it is the whole module in eight lines.'
  ],

  links: [
    { label: 'OWASP API Security Project', url: 'https://owasp.org/www-project-api-security/' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('websec', {
  title: 'The Hydra of a Thousand Exploits',
  intro: 'Cut off one attack and two more grow in its place, unless you understand the root of each. Eleven questions across threat modelling, OWASP, injection, XSS, CSRF, CORS, hardening and API security.',
  questions: [
    { type: 'mcq', q: 'In STRIDE, an attacker who edits the price field in a checkout request before it reaches the server is doing which threat?',
      options: ['Tampering', 'Spoofing', 'Repudiation', 'Information disclosure'], answer: 0,
      explain: 'Changing data they should not be able to change is Tampering. Spoofing would be pretending to be someone else.' },

    { type: 'tf', statement: 'The OWASP Top 10 lists categories of common risk and is revised every few years, so you should check the current edition.', answer: true,
      explain: 'It is a ranked list of categories based on real data, not a fixed or exhaustive standard. The 2021 edition put Broken Access Control first.' },

    { type: 'spot', prompt: 'Tap the line that makes this search vulnerable to SQL injection.',
      code: { lang: 'js', src: `
        app.get('/search', (req, res) => {
          const term = req.query.q;
          const sql = "SELECT * FROM products WHERE name LIKE '%" + term + "%'";
          db.query(sql, (err, rows) => res.json(rows));
        });` },
      lines: [3],
      explain: 'Line 3 concatenates user input into the SQL text. A parameter placeholder (with the wildcard percent signs added to the value) keeps input as data.' },

    { type: 'ab', q: 'Which is the correct fix for SQL injection?',
      a: { lang: 'js', label: 'Parameters', src: `
        db.query('SELECT * FROM users WHERE id = ?', [id]);` },
      b: { lang: 'js', label: 'Hand escaping', src: `
        db.query("SELECT * FROM users WHERE id = '" + escape(id) + "'");` },
      answer: 'a',
      explain: 'Parameterised queries make input data by construction. Hand escaping relies on never forgetting a case and is the fragile approach.' },

    { type: 'bucket', prompt: 'Which defence belongs to which attack?', buckets: ['SQL injection', 'XSS', 'CSRF'],
      items: [['Parameterised queries', 0], ['Context-aware output encoding', 1], ['SameSite cookies and anti-CSRF tokens', 2], ['Using `textContent` instead of `innerHTML`', 1], ['A least-privilege database account', 0], ['Never changing state with a GET request', 2]],
      explain: 'Injection is fixed by separating code and data in queries, XSS by encoding output for its context, and CSRF by stopping the browser’s automatic cookies being used cross-site and by proving a request came from your own page.' },

    { type: 'multi', q: 'Which URLs have the same origin as `https://app.example/dashboard`?',
      options: ['`https://app.example/settings?tab=2`', '`https://app.example:443/login`', '`http://app.example/dashboard`', '`https://api.app.example/data`', '`https://app.example:8443/dashboard`'],
      answers: [0, 1],
      explain: 'Origin is scheme + host + port. Path and query do not matter, and 443 is the default HTTPS port. A different scheme, host (even a subdomain) or port is a different origin.' },

    { type: 'order', prompt: 'Put a preflighted CORS request in order.',
      items: ['A script on one origin calls fetch with PUT and JSON to another origin', 'The browser sends an OPTIONS preflight', 'The server replies with Access-Control-Allow headers', 'The browser sends the actual PUT', 'The script can read the response'],
      explain: 'The browser asks first for non-simple requests. Only a matching answer lets the real request go out and the response become readable.' },

    { type: 'tf', statement: 'If the browser blocks a simple cross-origin request because of CORS, you can be sure the server never received it.', answer: false,
      explain: 'For simple requests the browser still sends them; it only stops the script reading the response. CORS is not a way to stop a request reaching the server.' },

    { type: 'cloze', text: 'To limit damage from XSS, set session cookies as {{HttpOnly}} so scripts cannot read them, and send a {{Content-Security-Policy}} header to restrict which scripts may run.',
      distractors: ['Access-Control-Allow-Origin', 'SameSite=None', 'Strict-Transport-Security'],
      explain: 'HttpOnly hides the cookie from JavaScript. CSP limits which script sources the browser will run. Both are safety nets behind output encoding.' },

    { type: 'short', q: 'Which response header tells browsers to use only HTTPS for a site for a set period? (Give its four-letter abbreviation or the full header name.)', accept: ['HSTS', 'Strict-Transport-Security'], hint: 'Strict Transport Security.',
      explain: '`Strict-Transport-Security`, abbreviated HSTS, stops downgrade to plain HTTP once the browser has seen it.' },

    { type: 'estimate', q: 'A bot tries 5 password guesses per second against a login with no rate limit. About how many guesses is that in an hour?', answer: 18000, unit: 'guesses', tolerance: 2, min: 100, max: 10000000,
      explain: '5 × 60 × 60 = 18,000 an hour, with no human effort. Rate limiting and lockouts turn that into a trickle.' }
  ]
});

KS.sheet('websec', {
  title: 'Web Security cheat sheet',
  sections: [
    { title: 'Threat modelling and STRIDE', md: `Ask: what are we building, what can go wrong, what will we do, did it work?

| Letter | Threat | Example |
|---|---|---|
| **S**poofing | Pretending to be someone | Stolen password |
| **T**ampering | Changing data | Edited request amount |
| **R**epudiation | Denying an action | No audit log |
| **I**nformation disclosure | Reading what you should not | Another user’s invoice |
| **D**enial of service | Making it unavailable | Flooded login page |
| **E**levation of privilege | Gaining extra powers | User reaches admin |

**Defence in depth**: layer several controls. **Trade-off**: every control costs money, time or convenience.` },

    { title: 'OWASP Top 10 (2021)', md: `| # | Category |
|---|---|
| A01 | Broken Access Control |
| A02 | Cryptographic Failures |
| A03 | Injection |
| A04 | Insecure Design |
| A05 | Security Misconfiguration |
| A06 | Vulnerable and Outdated Components |
| A07 | Identification and Authentication Failures |
| A08 | Software and Data Integrity Failures |
| A09 | Security Logging and Monitoring Failures |
| A10 | Server-Side Request Forgery |

OWASP revises the list every few years. Check owasp.org for the current edition.` },

    { title: 'Injection and XSS', md: `| | Cause | Real fix | Extra layers |
|---|---|---|---|
| **SQL injection** | Input glued into a query | Parameterised queries | Validation, least-privilege DB account |
| **Command injection** | Input in a shell command | Avoid the shell, pass argument lists | Allow-lists |
| **XSS** (stored, reflected, DOM) | Input output as HTML or script | Context-aware output encoding, safe templates, no \`innerHTML\` with untrusted data | CSP, HttpOnly cookies |

Injected script runs **as the victim, in your origin**.` },

    { title: 'Same-origin, CSRF and CORS', md: `- **Origin** = scheme + host + port. Same-origin policy stops scripts *reading* across origins.
- **CSRF**: the browser attaches cookies automatically to cross-site requests. Defend with \`SameSite\` cookies, anti-CSRF tokens, and no state change on GET.
- **CORS**: a server-declared *relaxation*, enforced by *browsers* only.
- Non-simple requests send an \`OPTIONS\` **preflight** first.
- \`Access-Control-Allow-Origin: *\` cannot be used with credentials. Never echo any Origin back.
- A blocked simple request has still reached the server.` },

    { title: 'Server hardening', md: `- **Patch** promptly; **install** only what you need.
- **Least privilege**: run apps as a limited user, never as root.
- **SSH keys**, no passwords, no direct root login.
- **Firewall**: deny by default; open only needed ports (databases never public).
- **Secrets** in a secret manager or environment, never in Git; rotate leaks.
- **Headers**: \`Strict-Transport-Security\`, \`Content-Security-Policy\`, \`X-Content-Type-Options: nosniff\`.
- **TLS**: modern versions, valid certificates, HTTP redirected to HTTPS.` },

    { title: 'API pre-launch checklist', md: `1. HTTPS everywhere.
2. **Authenticate** every request.
3. **Authorise** per action *and* per object, on the server.
4. **Validate** input (type, size, range); parameterise queries.
5. **Limit output**: explicit response shapes; generic errors.
6. **Rate-limit** (429), tighter on login.
7. **Log and audit** security events, with no secrets in logs.
8. **Secrets** out of code; rotate if leaked.

| Status | Use |
|---|---|
| 400 | Bad input |
| 401 | Not authenticated |
| 403 | Authenticated but not allowed |
| 429 | Rate limit hit |` },

    { title: 'Common mistakes', md: `- Hiding a URL or button instead of checking permissions.
- Escaping quotes by hand instead of parameterising.
- Blocking the word \`<script>\` instead of encoding output.
- "CORS blocked it, so we are safe" (it is a browser rule, not a firewall).
- Setting \`CORS: *\` just to silence the red error.
- Changing state with GET.
- Secrets committed to Git (deleting the file does not remove the history).
- Verbose errors and stack traces shown to users.
- "We are too small to be a target."` }
  ]
});

