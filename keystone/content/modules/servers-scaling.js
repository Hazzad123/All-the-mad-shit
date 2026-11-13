/* Module: servers-scaling — Web Servers & Scaling Out.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs servers-scaling */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('sv-web-servers', {
  eli5: 'A web server is the program that sits at the front door of your backend: it answers visitors, hands out simple files itself, and passes everything else to the code that does the real work.',

  cards: [
    { kind: 'concept', title: 'Somebody has to answer the door',
      body: `You have written a function that builds a page. Lovely. But how does a request from a browser on the other side of the world **reach** that function?

        Something has to sit on a machine, listen for incoming connections, understand the HTTP text arriving (you met that format earlier), and send a reply back. That program is a **web server**.

        It sounds small, but it is the first thing every visitor meets. And it turns out to be good at a surprising number of jobs that your application code would much rather not do: serving files, encrypting traffic, keeping logs and shielding the code behind it.` },

    { kind: 'metaphor', title: 'The hotel receptionist',
      body: `At a hotel, guests do not wander into the kitchen or the accounts office. They go to **reception**.

        - Reception **greets everyone** and understands what they want.
        - For simple things, such as a map or a leaflet, they **hand it over straight away**.
        - For anything specialist, they **ring the right person** ("a table for two at eight? I'll ask the restaurant") and pass the answer back.
        - They check you in properly, and they keep a **visitors' book**.

        The web server is reception. The restaurant, the spa and the accounts team are your **application servers**: busy specialists who should not be dealing with every walk-in.` },

    { kind: 'diagram', title: 'Where it sits',
      body: 'A typical set-up: the web server faces the internet, and everything behind it is hidden from visitors.',
      nodes: [
        { id: 'b', label: 'Browser', icon: '🌐', x: 1, y: 0 },
        { id: 'w', label: 'Web server', icon: '🚪', x: 1, y: 1, tone: 'accent' },
        { id: 'f', label: 'Static files on disk', icon: '🗂️', x: 0, y: 2 },
        { id: 'a', label: 'App server (your code)', icon: '🧠', x: 2, y: 2 },
        { id: 'd', label: 'Database', icon: '🗄️', x: 2, y: 3, tone: 'warn' }
      ],
      edges: [
        { from: 'b', to: 'w', label: 'HTTPS', both: true },
        { from: 'w', to: 'f', label: 'files' },
        { from: 'w', to: 'a', label: 'everything else' },
        { from: 'a', to: 'd' }
      ],
      caption: 'Static things are answered directly. Dynamic things are forwarded.' },

    { kind: 'sequence', title: 'Two requests, two different journeys',
      body: 'One page needs a stylesheet (a file) and some personal data (computed by code). Step through.',
      actors: ['Browser', 'Web server', 'App server'],
      steps: [
        { from: 0, to: 1, label: 'GET /css/site.css', note: 'The browser asks for a stylesheet.' },
        { at: 1, label: 'reads the file from disk', note: 'It is a plain file that never needs code to produce. The web server handles it **entirely itself**.' },
        { from: 1, to: 0, label: '200 + the CSS', dashed: true, note: 'Back it goes. The app server never knew.' },
        { from: 0, to: 1, label: 'GET /api/orders', note: 'Now a request that needs **your code**: whose orders? What is in the database?' },
        { from: 1, to: 2, label: 'forward the request', note: 'The web server acts as a **reverse proxy**: it passes the request on to an app server.' },
        { from: 2, to: 1, label: 'the JSON answer', dashed: true, note: 'Your code runs and replies.' },
        { from: 1, to: 0, label: '200 + the JSON', dashed: true, note: 'The web server relays it. To the browser, it looks like the web server did it all.' }
      ] },

    { kind: 'concept', title: 'Job one: serve static files, fast',
      body: `A lot of what a site sends is **static**: the same bytes every time. Images, stylesheets, JavaScript bundles, fonts, downloadable PDFs.

        Web servers are built for exactly this. They read a file from disk (or memory), add the right headers, and stream it out, all without your language runtime waking up. They also add the \`Cache-Control\` headers from the caching module, so browsers and CDNs can keep the file.

        Your application code could serve files too, but every image request would then use a worker that could have been running your logic. Letting the web server do it is cheaper and faster.` },

    { kind: 'concept', title: 'Job two: reverse-proxying to app servers',
      body: `A **proxy** is a middleman. A normal ("forward") proxy stands in for *users*, as in a company network. A **reverse proxy** stands in for *servers*: visitors talk to it, and it talks to the real servers on their behalf.

        Why bother?

        - **One front door**: visitors see a single address, whatever is behind it.
        - **Safety**: app servers are not exposed directly to the internet.
        - **Freedom**: you can swap, restart or add app servers without visitors noticing.

        The app server underneath may be a Node.js process, a Python app, a Java server. It does not have to be good at the internet's rough edges, because reception deals with them.` },

    { kind: 'code', title: 'What the setup looks like',
      body: 'A configuration, in the style of the Nginx server (the next lesson tours the real ones). **Tap the lines.**',
      code: { lang: 'text', src: `
        server {
          listen 443 ssl;
          server_name shop.example.com;

          location /static/ {
            root /var/www/shop;
          }
          location / {
            proxy_pass http://localhost:3000;
          }
        }`,
        notes: {
          2: 'Listen on port 443, the HTTPS door, and handle encryption right here. This is **TLS termination**: the secure connection ends at the web server.',
          3: 'Answer to this website name. One web server can front many sites.',
          5: 'Anything starting with `/static/` is a **file**. Read it from disk.',
          9: 'Everything else is **forwarded** to the app server listening on port 3000 on the same machine.'
        } } },

    { kind: 'concept', title: 'The quiet jobs: TLS, compression and logs',
      body: `Three more jobs make a web server worth having in front:

        - **TLS termination.** Encrypting and decrypting every connection costs CPU and needs certificates. Doing it once, at the front, means the app servers can talk plain HTTP on a trusted internal network.
        - **Compression.** Text such as HTML, CSS and JSON shrinks a great deal when squashed (for example with gzip), so the web server compresses replies on the way out and pages download faster.
        - **Logging.** Every request is written down: who, what, when, how long, what status. That visitors' book is invaluable when something breaks.` },

    { kind: 'compare', title: 'Web server vs application server',
      body: 'The two words get blurred together, and in small projects one program does both. The jobs are still different.',
      cols: ['Web server', 'Application server'],
      rows: [
        ['Main job', 'Speak HTTP, serve files, route and protect', 'Run your code and build the answer'],
        ['Knows about your business?', 'No', 'Yes: orders, users, prices'],
        ['Examples', 'Nginx, Apache, Caddy, IIS', 'Node.js with Express, Gunicorn for Python, Tomcat for Java'],
        ['Good at', 'Many connections, files, encryption', 'Logic, databases, templates'],
        ['If you add more', 'Rarely needed: they are light', 'Often: this is where the work is']
      ] },

    { kind: 'pitfall', title: 'Putting the app server straight on the internet',
      body: `It is tempting, especially in development, to point the internet at your app server and skip reception. It works, until it doesn't.

        Picture a visitor on a very slow mobile connection, dribbling a request in a few bytes at a time. An app server has a limited number of workers. If each slow visitor ties up one for seconds, a handful of them can use up **all** the workers while your code sits idle.

        A web server in front soaks this up: it collects the full request patiently, hands it over in one quick go, and does the same in reverse for the response. It is also where you want TLS, limits and logs.`,
      note: 'Many frameworks say "do not use the built-in development server in production" for this reason.' }
  ],

  activities: [
    { type: 'mcq', after: 3, q: 'A browser requests `/images/logo.png`, a plain file on disk. What normally happens in a web server plus app server set-up?',
      options: ['The web server reads the file and replies, without involving the app server', 'The request is forwarded to the app server, which reads the file', 'The database is asked for the image', 'The browser fetches it directly from the disk'],
      answer: 0,
      why: [null, 'That would use up a precious app worker for something that needs no code.', 'Plain files are typically on disk, not in the database.', 'Browsers never touch the server’s disk; they only send HTTP requests.'],
      explain: 'Static files need no logic, so the web server answers them itself. The app server is kept free for requests that need your code.' },

    { type: 'bucket', after: 5, prompt: 'Who normally does this job: the web server or the application server?', buckets: ['Web server', 'Application server'],
      items: [['Serve `style.css` from disk', 0], ['Decrypt incoming HTTPS traffic (TLS termination)', 0], ['Write one line per request to the access log', 0], ['Work out which orders belong to this customer', 1], ['Run a database query to build a basket page', 1], ['Apply the business rule "free delivery over £50"', 1]],
      explain: 'The web server handles the plumbing of the internet: files, encryption, compression and logging. The application server holds the logic that is specific to your product.' },

    { type: 'tf', after: 6, statement: 'With TLS termination at the web server, the connection from the browser to the web server is still encrypted.', answer: true,
      explain: 'The secure connection runs from the browser **to** the web server, where it ends (is "terminated"). Behind it, traffic on a trusted internal network may be plain HTTP, which saves the app servers the work.' },

    { type: 'match', prompt: 'Match each term to its meaning.',
      pairs: [['Reverse proxy', 'Takes requests on behalf of servers and passes them on'], ['Static file', 'Same bytes every time; no code needed'], ['TLS termination', 'Ending the encrypted connection at the front door'], ['Compression', 'Squashing text replies so they download faster'], ['Access log', 'A record of every request that came in']] },

    { type: 'order', prompt: 'Put a request for `/api/orders` in order through the stack.',
      items: ['The browser sends the request over HTTPS', 'The web server ends the TLS connection and reads the request', 'The web server forwards it to an app server', 'The app server runs your code and queries the database', 'The response travels back through the web server to the browser'],
      explain: 'The front door comes first, then your code, and the reply retraces the same route. The web server sees both directions, which is why it is the natural place for logging.' },

    { type: 'cloze', text: 'A {{reverse proxy}} sits in front of the servers and passes requests on. Plain files are served by the {{web server}}, and the code that builds personalised answers runs on the {{application server}}.',
      distractors: ['database', 'browser', 'forward proxy'],
      explain: 'Each layer has one job: the web server is the front door, and the application server is where your business logic runs.' },

    { type: 'short', q: 'What do we call a middleman that accepts requests on behalf of servers and forwards them? (Two words.)', accept: ['reverse proxy', 'reverseproxy'], hint: 'The opposite of a proxy that stands in for users.',
      explain: 'A **reverse proxy**. Visitors talk to it, and it talks to the real servers on their behalf.' },

    { type: 'scenario', title: 'The slow site with the bored CPU', intro: 'A small shop runs a single Node.js app that does everything: it serves images and scripts, handles HTTPS, and builds order pages. On sale day it crawls, yet the database is nearly idle.',
      meters: { 'site speed': 30, 'effort': 80 },
      steps: [
        { text: 'The Node process is at 100% CPU and most requests are for images and CSS. What is your first move?',
          choices: [
            { label: 'Put a web server in front and let it serve the static files directly', score: 2, effects: { 'site speed': 40, 'effort': -15 }, feedback: 'Exactly. The app now only sees requests that need code, and the web server handles files far more cheaply.' },
            { label: 'Rewrite the app in a faster language', score: 0, effects: { 'site speed': 5, 'effort': -50 }, feedback: 'A huge effort to solve a problem that was never about the language: it was doing work that did not need code at all.' },
            { label: 'Add a larger database', score: 0, effects: { 'effort': -10 }, feedback: 'The database was idle. A bigger one cannot help a bottleneck that is not there.' }
          ] },
        { text: 'The web server is in place. Customers on mobile complain about slow page loads on poor connections. What helps?',
          choices: [
            { label: 'Switch on compression for HTML, CSS and JSON', score: 2, effects: { 'site speed': 20 }, feedback: 'Text compresses dramatically, so far fewer bytes cross a weak connection. The web server does it with a one-line setting.' },
            { label: 'Compress images by zipping them', score: 1, effects: { 'site speed': 3 }, feedback: 'Images such as JPEG and PNG are already compressed, so zipping them again saves almost nothing.' },
            { label: 'Turn off HTTPS to save time', score: 0, effects: { 'site speed': 2, 'effort': -10 }, feedback: 'Encryption costs little these days and protects your customers. Never trade it away for speed.' }
          ] },
        { text: 'Last: a developer proposes exposing the app server directly again "to remove a hop". Your answer?',
          choices: [
            { label: 'Keep the web server: it handles TLS, slow clients and logging for you', score: 2, effects: { 'site speed': 5 }, feedback: 'The extra hop costs a fraction of a millisecond. The protection and flexibility are worth far more.' },
            { label: 'Fine, since modern servers cope with anything', score: 0, effects: { 'site speed': -25 }, feedback: 'Slow clients can still tie up all the workers. It is the classic way a small attack or a bad mobile signal takes a site down.' },
            { label: 'Only expose it on weekends', score: 0, effects: { 'site speed': -10 }, feedback: 'The risk does not take weekends off.' }
          ] }
      ],
      outro: 'The pattern: **let the front door do the plumbing, and keep your code for the work only it can do.**' },

    { type: 'explain', prompt: 'Explain to a colleague why a production site usually has a web server in front of the application server, and name three jobs it does.',
      model: 'The web server is the front door: it speaks HTTP to the internet, serves static files directly, and forwards everything else to the application servers as a reverse proxy. It also ends the TLS connection, compresses responses, and logs every request. That keeps slow clients and plain file requests away from the app workers, so the code behind it only handles work that needs the application.',
      keywords: ['reverse proxy', 'static', 'TLS', 'compression', 'logging', 'application server', 'forward'] }
  ],

  flashcards: [
    { q: 'What does a web server do?', a: 'It accepts connections, speaks HTTP, serves static files, and forwards other requests to application servers.' },
    { q: 'What is a reverse proxy?', a: 'A middleman that takes requests on behalf of servers and passes them on, so visitors only see one front door.' },
    { q: 'What is TLS termination?', a: 'Ending the encrypted connection at the front-line server, so the servers behind it can speak plain HTTP on an internal network.' },
    { q: 'Web server vs application server?', a: 'The web server handles HTTP, files, encryption and routing. The application server runs your business code and builds the dynamic answers.' },
    { q: 'Why not expose the app server directly to the internet?', a: 'Slow or malicious clients can tie up its limited workers, and it lacks the web server’s TLS, buffering and protection.' }
  ],

  glossary: [
    { term: 'Web server', def: 'Software that accepts HTTP connections, serves static files, and forwards other requests to application code.', like: 'The hotel receptionist.' },
    { term: 'Application server', def: 'The program that runs your own code to build dynamic responses, usually behind a web server.', like: 'The specialist team behind reception.', aka: ['app server'] },
    { term: 'Reverse proxy', def: 'A server that receives requests on behalf of other servers and forwards them, hiding what is behind it.', like: 'Reception passing a call to the right department.' },
    { term: 'TLS termination', def: 'Ending the encrypted TLS connection at one point, usually the web server, so that servers behind it can use plain HTTP.', like: 'Unwrapping the parcel at the front desk.' },
    { term: 'Static file', def: 'A file that is sent exactly as stored, with no code needed, such as an image or a stylesheet.', like: 'A leaflet on the reception desk.' }
  ],

  takeaways: [
    'A **web server** is the front door: it speaks HTTP, serves static files and forwards the rest.',
    'As a **reverse proxy** it hides your app servers behind one address.',
    'It also does the plumbing: **TLS termination, compression and logging**.',
    'The **application server** runs your code; keep slow clients and plain files away from it.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('sv-server-tour', {
  eli5: 'Nginx, Apache, Caddy and IIS all do the same front-door job but with different habits: how they juggle many visitors, how you configure them, and what they do for you automatically.',

  cards: [
    { kind: 'concept', title: 'Four receptionists, one job',
      body: `The last lesson described the web server's job. In practice you pick a real program to do it. Four names come up constantly:

        - **Nginx** (say "engine-x")
        - **Apache** (the Apache HTTP Server)
        - **Caddy**
        - **IIS** (Internet Information Services, from Microsoft)

        All four can serve files, proxy to app servers, terminate TLS and write logs. Choosing between them is rarely about *what they can do*, and more about **how they work, how you configure them and what your team already knows**.

        There is no benchmark chart here, on purpose: speed claims depend heavily on the workload, and any of these will outrun what most sites need.` },

    { kind: 'metaphor', title: 'Waiters: one per table, or one who never waits',
      body: `Two restaurants. In the first, every table gets **its own waiter**, who stands by that table all evening. If a table is slow to order, that waiter simply waits.

        In the second, a **few waiters** each look after many tables. They take an order, hand it to the kitchen, and immediately move on to the next table. They only return when the kitchen rings the bell.

        The second restaurant can serve far more tables with far fewer staff, because nobody is ever standing around waiting. That difference in habit is the heart of the Nginx-versus-classic-Apache story, and it is about **connections**: every visitor is a table that may be quiet for a long while.` },

    { kind: 'steps', title: 'The event loop: one worker, many visitors',
      body: 'Nginx is **event-driven**. Here is the idea in four steps.',
      steps: [
        { title: 'A few workers, each running a loop', body: 'Nginx starts a small number of worker processes, often about one per CPU core. Each worker runs a never-ending loop: "what has happened that I should react to?"' },
        { title: 'Events, not waiting', body: 'A new connection arrives. Data arrives on another. A file finishes loading. Each is an **event**. The worker reacts to it quickly, then goes straight back to the loop.' },
        { title: 'Never block on slow things', body: 'If a visitor is slow to send data, the worker does not sit and wait. It moves on and comes back when data actually arrives.' },
        { title: 'Result: thousands of connections, little memory', body: 'One worker can juggle thousands of mostly-idle connections, because a quiet connection costs almost nothing. That is why Nginx suits being the front door and a reverse proxy.' }
      ] },

    { kind: 'concept', title: 'Apache and its modules',
      body: `Apache is the veteran: it has been serving the web since the mid-1990s, and for a long time it was *the* web server.

        Its signature is **modules**. The core is small; features are plug-ins you load: rewriting URLs, authentication, compression, running PHP, and many more. Some settings can even be placed in a \`.htaccess\` file inside a folder, which is why cheap shared hosting loved it: each customer could tweak their own folder without touching the main config.

        Classically, Apache handled each connection with a dedicated process or thread, like the first restaurant. Modern Apache also has an **event** mode that behaves much more like Nginx. So "Apache is slow" is an old story, not a current fact.` },

    { kind: 'code', title: 'Apache: switch features on with modules',
      body: 'A taste of Apache configuration. **Tap the lines.**',
      code: { lang: 'text', src: `
        LoadModule rewrite_module modules/mod_rewrite.so

        <VirtualHost *:80>
          ServerName shop.example.com
          DocumentRoot /var/www/shop

          RewriteEngine On
          RewriteRule ^/old-page$ /new-page [R=301,L]
        </VirtualHost>`,
        notes: {
          1: '`LoadModule` plugs in a feature. Here, **mod_rewrite**, for changing or redirecting URLs.',
          3: 'A **virtual host** describes one website. One Apache can serve many.',
          5: '`DocumentRoot` is the folder of static files for this site.',
          8: 'A rule that sends visitors from the old URL to the new one with a permanent redirect (`301`). The module makes it possible.'
        } } },

    { kind: 'code', title: 'Caddy: HTTPS without the paperwork',
      body: 'Caddy is the newcomer, loved for its tiny config and one big trick. **Tap the lines.**',
      code: { lang: 'text', src: `
        shop.example.com {
          encode gzip
          reverse_proxy localhost:3000
        }`,
        notes: {
          1: 'You just name the site. Because you gave a real domain name, Caddy **automatically obtains and renews a free TLS certificate** from an automatic certificate service such as Let’s Encrypt, and serves the site over HTTPS. No manual certificates.',
          2: 'Compress responses.',
          3: 'And forward everything to the app on port 3000. Three lines for a secure, compressed reverse proxy.'
        } } },

    { kind: 'concept', title: 'IIS: the Windows one',
      body: `**IIS** (Internet Information Services) is Microsoft's web server. It comes as part of Windows Server and is managed through a graphical tool (IIS Manager) or configuration files.

        It has long been the natural home for **.NET** applications and for organisations built around Windows: it fits with Windows accounts, Windows administration and Microsoft's tooling.

        You will meet IIS mostly in companies that already run on Windows. Outside that world, Nginx, Apache and Caddy are far more common, and modern .NET applications also run happily behind Nginx on Linux. Nothing about IIS is inferior; it is simply the one that fits a particular ecosystem.` },

    { kind: 'compare', title: 'Four habits at a glance',
      body: 'A fair summary of what each is best known for.',
      cols: ['Known for', 'How you configure it'],
      rows: [
        ['Nginx', 'Event-driven; reverse proxy, static files, load balancing', 'Text config files with blocks'],
        ['Apache', 'Veteran with a huge ecosystem of modules', 'Text config, plus per-folder `.htaccess`'],
        ['Caddy', 'Automatic HTTPS, very short config', 'A tiny Caddyfile'],
        ['IIS', 'Windows and .NET shops', 'IIS Manager (GUI) or XML config']
      ] },

    { kind: 'tip', title: 'How to choose',
      body: `Start from your situation, not from the internet's opinions:

        - **A new service on Linux, needing a fast front door:** Nginx is the common default; Caddy if you want HTTPS handled for you.
        - **An old PHP site, or lots of per-folder rules on shared hosting:** Apache and its modules.
        - **A small side project where you hate certificates:** Caddy.
        - **A Windows and .NET estate:** IIS.
        - **Anywhere your team already has expertise:** use that one.

        A web server you can configure *confidently* beats a theoretically faster one you cannot debug at 2am.` },

    { kind: 'realworld', title: 'What you will really see',
      body: `A very common production set-up is **Nginx in front, an application server behind**: Node, Python or Java doing the real work. WordPress and much of the older PHP web runs on **Apache**. Small self-hosted projects often pick **Caddy**. Banks and councils running Windows often use **IIS**.

        And in modern cloud setups you often do not choose at all: a managed load balancer or platform terminates TLS for you, and a web server is built into the container image. The ideas from these two lessons carry over wherever you meet them.`,
      note: 'Experts do argue about favourites. All four are mature, widely used and good enough for almost anyone; pick one and learn it well.' }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'Why can an event-driven server like Nginx handle thousands of mostly idle connections with a few workers?',
      options: ['A worker never sits waiting on one slow connection; it reacts to events and moves on', 'It gives each connection a dedicated high-speed thread', 'It refuses connections that are idle', 'It keeps every response in the cache forever'],
      answer: 0,
      why: [null, 'Dedicated threads per connection is the other model, which costs more memory per visitor.', 'Idle connections are kept; they simply cost almost nothing.', 'Caching is a separate matter.'],
      explain: 'The worker loop reacts to events (data arrived, file ready) and immediately goes on to the next thing. A quiet connection costs almost nothing, so one worker can juggle thousands.' },

    { type: 'tf', after: 4, statement: 'Apache can only handle each connection with a dedicated process, so it cannot behave in an event-driven way.', answer: false,
      explain: 'Classic Apache used a process or thread per connection, but modern Apache has an **event** mode that works much more like Nginx. Old reputations outlive the facts.' },

    { type: 'match', after: 6, prompt: 'Match each server to what it is best known for.',
      pairs: [['Nginx', 'Event loop, reverse proxying and static files'], ['Apache', 'Loadable modules and per-folder .htaccess'], ['Caddy', 'Automatic HTTPS with a tiny config'], ['IIS', 'Microsoft’s server for Windows and .NET']] },

    { type: 'bucket', prompt: 'Which server is the most natural fit?', buckets: ['Nginx', 'Apache', 'Caddy', 'IIS'],
      items: [['A fast reverse proxy in front of several Node.js app servers', 0], ['Serving large amounts of static files and proxying requests on Linux', 0], ['A legacy PHP site relying on `.htaccess` rules in many folders', 1], ['Shared hosting where each customer edits their own folder rules', 1], ['A hobby project that needs HTTPS with no certificate fuss', 2], ['A tiny config that renews its own certificates', 2], ['A company running .NET on Windows Server', 3]],
      explain: 'Match the server to its habit: Nginx for event-driven proxying, Apache for module-rich and per-folder setups, Caddy for effortless HTTPS, IIS for Windows and .NET estates.' },

    { type: 'ab', q: 'A solo developer wants a secure site live in ten minutes, with HTTPS certificates renewed automatically. Which config is closer to that?',
      a: { lang: 'text', label: 'Three lines', src: `
        shop.example.com {
          reverse_proxy localhost:3000
        }` },
      b: { lang: 'text', label: 'Manual certificates', src: `
        server {
          listen 443 ssl;
          ssl_certificate     /etc/ssl/shop.crt;
          ssl_certificate_key /etc/ssl/shop.key;
          location / { proxy_pass http://localhost:3000; }
        }` },
      answer: 'a',
      explain: 'The short version is Caddy-style: naming the domain is enough for it to get and renew a certificate itself. The second needs certificates created, placed and renewed by hand, or by extra tooling. Nginx can do HTTPS well, it just asks you to set it up.' },

    { type: 'order', prompt: 'Put the event loop of an event-driven worker in order.',
      items: ['The worker waits for the next event', 'An event arrives, such as data on a connection', 'The worker handles it quickly without blocking', 'It returns straight back to the loop', 'The next event, from another visitor, is handled'],
      explain: 'The loop is "wait, react briefly, return". Because the worker never blocks on a single slow visitor, thousands can share it.' },

    { type: 'short', q: 'Which of the four web servers is known for obtaining and renewing HTTPS certificates automatically?', accept: ['Caddy'], hint: 'It rhymes with "paddy".',
      explain: '**Caddy**. Give it a real domain name and it sorts out the TLS certificate and its renewal for you.' },

    { type: 'scenario', title: 'Pick a front door', intro: 'Three teams ask you for advice on a web server this week. Each has a different situation.',
      meters: { 'fit': 40, 'team confidence': 50 },
      steps: [
        { text: 'Team 1 is a two-person startup on Linux, running three Node.js app servers. They need a reverse proxy, and they want a very small config that handles HTTPS for them. Your suggestion?',
          choices: [
            { label: 'Caddy in front: tiny config, automatic certificates', score: 2, effects: { 'fit': 25, 'team confidence': 15 }, feedback: 'A great match: they get a secure reverse proxy with almost nothing to maintain. Nginx would also work, with more setup.' },
            { label: 'IIS, because it has a GUI', score: 0, effects: { 'fit': -20 }, feedback: 'IIS suits Windows estates. Moving a Linux team onto it adds friction for no gain.' },
            { label: 'No web server; expose Node directly', score: 0, effects: { 'fit': -15 }, feedback: 'That drops TLS handling, slow-client protection and flexibility. They would rediscover why a front door matters.' }
          ] },
        { text: 'Team 2 maintains a ten-year-old PHP site with hundreds of `.htaccess` rules scattered through its folders. What do you suggest?',
          choices: [
            { label: 'Stay on Apache, which understands those rules natively', score: 2, effects: { 'fit': 25 }, feedback: 'Their rules are written for Apache. Rewriting hundreds for another server is risk with little reward.' },
            { label: 'Move to Nginx immediately because it is "faster"', score: 0, effects: { 'fit': -15, 'team confidence': -20 }, feedback: 'Nginx does not read `.htaccess`. A rushed migration could break redirects the business depends on, for speed they probably do not need.' },
            { label: 'Rewrite the site in a new framework first', score: 1, effects: { 'fit': 5, 'team confidence': -10 }, feedback: 'Possibly worthwhile one day, but nowhere near a "which web server" decision.' }
          ] },
        { text: 'Team 3 is an insurance company running .NET applications on Windows Server with Windows accounts. They ask which to use.',
          choices: [
            { label: 'IIS: it fits their platform and skills', score: 2, effects: { 'fit': 25, 'team confidence': 15 }, feedback: 'It integrates with their administration and tools, and the team already knows it. That counts for a lot.' },
            { label: 'Switch the whole estate to Linux and Nginx first', score: 1, effects: { 'fit': 5, 'team confidence': -25 }, feedback: 'Doable, but a big organisational change. It is a platform decision, not a web-server one.' },
            { label: 'Pick whichever has the highest benchmark number online', score: 0, effects: { 'fit': -10 }, feedback: 'Benchmarks reflect someone else’s workload. Fit and team skills matter much more than a headline number.' }
          ] }
      ],
      outro: 'The pattern: **choose by fit, skills and habits, not by folklore or benchmark charts.**' },

    { type: 'explain', prompt: 'A friend says "Nginx is just better than Apache." Respond with what actually differs between event-driven and classic designs, and how you would really choose.',
      model: 'Nginx uses an event loop where a few workers react to events and never wait on a slow connection, so it handles many idle connections cheaply. Classic Apache dedicated a process or thread per connection, though modern Apache also has an event mode. Apache has a large ecosystem of modules and per-folder .htaccess, and Caddy automates HTTPS. I would choose by fit and team skills: the existing site, the platform and what the team can run confidently, rather than a benchmark.',
      keywords: ['event loop', 'workers', 'idle connections', 'modules', '.htaccess', 'event mode', 'team', 'fit'] }
  ],

  flashcards: [
    { q: 'What makes Nginx "event-driven"?', a: 'A few worker processes each run a loop that reacts to events and never block on one slow connection, so each can handle thousands of connections.' },
    { q: 'What is Apache known for?', a: 'A very mature server with loadable modules and per-folder `.htaccess` configuration. Modern Apache also has an event mode.' },
    { q: 'What is Caddy’s headline feature?', a: 'Automatic HTTPS: it obtains and renews TLS certificates itself, with a very short configuration.' },
    { q: 'Where would you most often meet IIS?', a: 'In Windows Server and .NET environments: it is Microsoft’s web server, managed via IIS Manager.' },
    { q: 'How should you choose a web server?', a: 'By fit: your platform, existing configuration, what the team knows and what you need (such as automatic HTTPS), not by benchmark folklore.' }
  ],

  glossary: [
    { term: 'Event loop', def: 'A loop that waits for events (data arrived, connection opened) and reacts to each quickly, never waiting on any single slow thing.', like: 'The waiter who takes an order and moves straight on to the next table.', aka: ['event-driven'] },
    { term: 'Module', def: 'A plug-in that adds a feature to a server, such as URL rewriting or authentication.', like: 'An attachment that clicks onto a power tool.' },
    { term: 'Virtual host', def: 'A configuration block that lets one web server host several websites, chosen by the requested domain name.', like: 'One reception desk with a separate folder for each hotel brand.' },
    { term: 'Automatic HTTPS', def: 'A server that obtains, installs and renews TLS certificates by itself, so you never handle certificate files by hand.', like: 'A building manager who renews your pass before it expires.' }
  ],

  takeaways: [
    '**Nginx** is event-driven: a few workers juggle thousands of connections without waiting.',
    '**Apache** is the veteran with **modules** and `.htaccess`; modern Apache has an event mode too.',
    '**Caddy** gives you **automatic HTTPS** and tiny config; **IIS** is the Windows and .NET choice.',
    'Choose by **fit and team skills**, not by benchmark folklore.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('sv-scaling-types', {
  eli5: 'When one computer cannot keep up, you can either buy a bigger one or add more of them, and each choice has its own limits and costs.',

  cards: [
    { kind: 'concept', title: 'The queue out of the door',
      body: `Your site launches, a newspaper mentions it, and suddenly requests arrive faster than your server can answer them. Pages slow down, then start to time out.

        You need **more capacity**. There are only two ways to get it:

        - **Scale up (vertical):** replace the machine with a **bigger, stronger one**: more CPU cores, more memory, faster disks.
        - **Scale out (horizontal):** keep the machine, and **add more machines** that share the work.

        "Scaling" simply means *making a system able to handle more load*. This lesson is about which direction to go, and what each one costs you.` },

    { kind: 'metaphor', title: 'The pizza oven versus the food vans',
      body: `A pizza stall has a queue. Two options.

        **Buy a bigger oven.** Pizzas come out faster, and nothing else changes: same stall, same staff. But the biggest oven in the catalogue is as big as it gets, it costs a fortune, and while you swap it, you are closed. And if it breaks, there are no pizzas.

        **Buy more vans.** Each van is ordinary and cheap. Add a van, serve more people. If one van breaks down, the others carry on. But now you need someone sending customers to the right van, and every van must have the same menu.

        Where it stops: software vans have to agree on things like "whose order is this?", which is far harder than pizza.` },

    { kind: 'compare', title: 'Up versus out',
      body: 'Neither is "right". Each is cheap in some ways and expensive in others.',
      cols: ['Vertical (scale up)', 'Horizontal (scale out)'],
      rows: [
        ['What you do', 'Make one machine bigger', 'Add more machines'],
        ['Code changes', 'Usually none', 'Often some: the app must work on many servers'],
        ['Ceiling', 'The biggest machine you can buy', 'Very high: keep adding'],
        ['Cost curve', 'Often climbs steeply at the top end', 'Roughly linear: twice the servers, twice the cost'],
        ['If it fails', 'Everything goes down', 'The others carry on'],
        ['Upgrading', 'Often means downtime', 'Add or swap servers while live'],
        ['Complexity', 'Low: it is still one machine', 'Higher: load balancing, shared data, deployments']
      ] },

    { kind: 'concept', title: 'Scaling up: simple, until it isn’t',
      body: `Going vertical is wonderfully easy: pay more, restart on a bigger machine, and your code is none the wiser. For many projects it is the right first step.

        The limits are real, though:

        - **A ceiling.** There is a largest machine you can rent or buy. Hit it, and you are stuck.
        - **Rising cost.** The very biggest machines usually cost far more per unit of power than mid-range ones.
        - **Downtime.** Moving to a bigger machine often means restarting.
        - **All eggs, one basket.** However large it is, it is still *one* machine. If it dies, you are down.` },

    { kind: 'concept', title: 'Scaling out: cheap parts, more of them',
      body: `Going horizontal means running **several identical copies** of your application, and spreading requests between them.

        The good news:

        - **No hard ceiling**: need more? Add another server.
        - **Kind to your wallet**: ordinary machines are cheap, and you can add them one at a time.
        - **Resilience**: lose one of ten servers and you lose a tenth of your capacity, not everything.

        The catch is that now you have a **distributed system**: a crowd of machines that must be coordinated. Something must **share out the requests** (a load balancer, the next lesson), and the copies must not depend on private, local state.` },

    { kind: 'diagram', title: 'A scaled-out web tier',
      body: 'Three identical app servers behind one front door, all sharing one database.',
      nodes: [
        { id: 'u', label: 'Visitors', icon: '👥', x: 1, y: 0 },
        { id: 'lb', label: 'Load balancer', icon: '🚦', x: 1, y: 1, tone: 'warn' },
        { id: 's1', label: 'App server 1', icon: '🖥️', x: 0, y: 2 },
        { id: 's2', label: 'App server 2', icon: '🖥️', x: 1, y: 2 },
        { id: 's3', label: 'App server 3', icon: '🖥️', x: 2, y: 2 },
        { id: 'db', label: 'Database', icon: '🗄️', x: 1, y: 3, tone: 'warn' }
      ],
      edges: [
        { from: 'u', to: 'lb' }, { from: 'lb', to: 's1' }, { from: 'lb', to: 's2' }, { from: 'lb', to: 's3' },
        { from: 's1', to: 'db' }, { from: 's2', to: 'db' }, { from: 's3', to: 'db' }
      ],
      caption: 'The app servers are interchangeable. The two amber boxes are still single machines.' },

    { kind: 'pitfall', title: 'Single points of failure',
      body: `A **single point of failure** (SPOF) is any one part whose failure takes the whole system down.

        Look at the diagram. The three app servers are fine: lose one, and two carry on. But the **load balancer** is one machine, and so is the **database**. If either dies, the site is down, however many app servers you bought.

        So scaling out the web tier does not magically make a system reliable. You must ask of **every** box, "what if this dies?" and then add a spare, a copy or an automatic replacement. Resilience is the next world's whole subject; for now, learn to *spot* the single points.`,
      note: 'Scaling up has the same problem in its purest form: one giant machine is one giant SPOF.' },

    { kind: 'steps', title: 'What must change before you can scale out?',
      body: 'Running two copies of your app is easy. Making them behave like *one* app is the work. Check each of these.',
      steps: [
        { title: 'Keep no important state in the server', body: 'If a user’s login or basket lives in one server’s memory, their next request on another server finds nothing. State must move out to a shared place. (The next lessons cover this.)' },
        { title: 'Share the files', body: 'A photo uploaded to server 1’s disk is invisible to server 2. Uploads belong in shared storage, not a local folder.' },
        { title: 'Put something in front to share out the requests', body: 'Visitors need one address. A load balancer picks a server for each request and stops sending to dead ones.' },
        { title: 'Make deployments and config repeatable', body: 'Every copy must run the same code and settings. Automate it, rather than logging in to each server.' },
        { title: 'Watch the database', body: 'More app servers means more connections and more queries hitting the one database. It may become the next bottleneck, which is where the Scaling Data module comes back.' }
      ] },

    { kind: 'tip', title: 'Scale up first, design to scale out',
      body: `A sensible, mainstream approach: **keep it simple until it hurts**. A bigger machine is often the cheapest fix in engineer-time, and plenty of sites never need more.

        But build your app so that scaling out is *possible*: no hidden state on the server, shared storage, repeatable deploys. Then when you do hit the ceiling, you can add machines instead of rewriting.

        Experts differ on how early to plan for horizontal scale. Some say it is premature complexity; others say retrofitting costs more than doing it early. A fair middle path: **design stateless from the start, but only add servers when the numbers say so.**` },

    { kind: 'realworld', title: 'Different layers, different answers',
      body: `Real systems mix both ideas.

        - **The web and app tier** is usually stateless, so it **scales out** easily: ten identical servers behind a load balancer.
        - **The database** is the hard part. It holds the shared truth, so it is often **scaled up first** (a bigger machine), then given read copies, and only later sharded. You met those techniques in the Scaling Data module.
        - **Caches and queues** can be scaled either way, depending on the product.

        So the question is rarely "up or out?" and more "which layer, and how far can this one go?"` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'Your single server is at its limits, you have a tiny team, and the app keeps all its state in memory. What is the quickest safe first step?',
      options: ['Move to a bigger machine (scale up)', 'Add five servers behind a load balancer straight away', 'Rewrite the app in another language', 'Buy a second database'],
      answer: 0,
      why: [null, 'With in-memory state, extra servers would each have different data: users would lose their sessions and baskets.', 'Nothing shows that the language is the bottleneck, and it is a huge effort.', 'The question is about the web server running out of room, not the data.'],
      explain: 'Scaling up needs no code change, so it is the fastest fix. Scaling out first would require moving state out of the app, which is real work.' },

    { type: 'bucket', after: 4, prompt: 'Which kind of scaling does each statement describe?', buckets: ['Vertical (scale up)', 'Horizontal (scale out)'],
      items: [['Buy a machine with more CPU and RAM', 0], ['Hits a ceiling: there is a biggest machine', 0], ['Often means downtime while you swap machines', 0], ['Needs something to share requests among machines', 1], ['Losing one machine loses only a fraction of capacity', 1], ['The app must keep no important state on any one server', 1]],
      explain: 'Vertical makes one machine stronger and keeps things simple, but hits a ceiling and one point of failure. Horizontal adds machines, which brings resilience and room to grow, at the cost of coordination.' },

    { type: 'tf', after: 6, statement: 'Putting ten app servers behind a load balancer means the site can no longer go down.', answer: false,
      explain: 'The load balancer and the database may each still be single points of failure. Every component needs the question "what if this dies?" asked of it.' },

    { type: 'estimate', q: 'A server can handle about 500 requests per second flat out, and traffic will peak at 7,000 requests per second. Ignoring headroom for now, roughly how many such servers do you need?',
      answer: 14, unit: 'servers', min: 1, max: 200, tolerance: 1.3,
      explain: '7,000 / 500 = **14** servers. In real life you would add headroom and a spare, so you would plan more; the lesson on capacity does that arithmetic properly.' },

    { type: 'multi', q: 'Which of these would stop two copies of an app behaving like one app, if kept on each server?',
      options: ['Login sessions stored in that server’s memory', 'Uploaded photos saved to that server’s local disk', 'The application code itself', 'A basket kept in a variable inside the process', 'Read-only configuration identical on both servers'],
      answers: [0, 1, 3],
      explain: 'State that is private to one server breaks the illusion: the next request may land elsewhere. Identical code and read-only config are exactly what you want on every copy.' },

    { type: 'match', prompt: 'Match each term to its meaning.',
      pairs: [['Scale up', 'Make one machine bigger or stronger'], ['Scale out', 'Add more machines to share the work'], ['Single point of failure', 'One part whose failure takes everything down'], ['Load balancer', 'Shares incoming requests among servers'], ['Capacity', 'How much load a system can handle']] },

    { type: 'cloze', text: 'A bigger machine is called {{vertical}} scaling, and more machines is {{horizontal}} scaling. A part whose failure stops the whole system is a {{single point of failure}}.',
      distractors: ['diagonal', 'redundant component', 'bottom-up'],
      explain: 'Vertical means up (stronger), horizontal means out (more). A SPOF is the thing you want to find and remove before it finds you.' },

    { type: 'scenario', title: 'Black Friday is in six weeks', intro: 'You run the backend for an online shop on one big server plus one database. Last Black Friday, the server hit 100% and checkout slowed to a crawl. This year, traffic is forecast at three times higher.',
      meters: { 'readiness': 20, 'risk': 70 },
      steps: [
        { text: 'The server is the largest size your host offers. What do you conclude?',
          choices: [
            { label: 'Scaling up has run out of road, so we must scale out', score: 2, effects: { 'readiness': 20, 'risk': -15 }, feedback: 'Right: there is no bigger machine to buy. More capacity now means more machines, and the app has to be ready for that.' },
            { label: 'Buy an even bigger machine from a different provider and hope', score: 1, effects: { 'readiness': 5 }, feedback: 'Occasionally possible, but you are close to the ceiling and still have one machine as a SPOF.' },
            { label: 'Ask customers to shop at quieter times', score: 0, effects: { 'risk': 10 }, feedback: 'It is not a plan, and customers on Black Friday will not oblige.' }
          ] },
        { text: 'You audit the app and find it keeps login sessions in memory and saves product images to the local disk. What do you do before adding servers?',
          choices: [
            { label: 'Move sessions to a shared store and images to shared storage', score: 2, effects: { 'readiness': 30, 'risk': -20 }, feedback: 'Exactly the prerequisites. Once state lives outside the servers, any server can handle any request.' },
            { label: 'Add servers anyway and see what happens', score: 0, effects: { 'readiness': -10, 'risk': 25 }, feedback: 'Half your customers would be logged out at random, and images would vanish depending on which server answered.' },
            { label: 'Turn off logins for the sale', score: 0, effects: { 'readiness': -5, 'risk': 15 }, feedback: 'People cannot check out without an account. You would be solving a problem by breaking the shop.' }
          ] },
        { text: 'With three app servers and a load balancer in place, the team celebrates. What should you check next?',
          choices: [
            { label: 'Whether the database and the load balancer are now single points of failure or bottlenecks', score: 2, effects: { 'readiness': 20, 'risk': -25 }, feedback: 'Three app servers will send three times the queries to the one database. Always ask what the next weakest link is.' },
            { label: 'Nothing: three servers means we are safe', score: 0, effects: { 'risk': 25 }, feedback: 'Scaling one layer just moves the pressure to the next. The database or load balancer may now fail first.' },
            { label: 'Remove a server to save money before the sale', score: 0, effects: { 'readiness': -15, 'risk': 20 }, feedback: 'You would be taking away the capacity you just built.' }
          ] }
      ],
      outro: 'The pattern: **find the ceiling, remove hidden state, then hunt for the next single point of failure.**' },

    { type: 'explain', prompt: 'Explain vertical versus horizontal scaling to a non-technical manager, and say why moving to many servers can be harder than it sounds.',
      model: 'Vertical scaling means buying a bigger machine: simple, no code changes, but there is a biggest machine and one failure takes everything down. Horizontal scaling means adding more machines that share the work: no hard ceiling and better resilience, but the app has to work as many copies, with sessions and files kept in shared places, and something must share out the requests. Other parts, like the database, can still be single points of failure.',
      keywords: ['vertical', 'horizontal', 'ceiling', 'single point of failure', 'state', 'load balancer', 'shared'] }
  ],

  flashcards: [
    { q: 'Vertical vs horizontal scaling?', a: 'Vertical (up) makes one machine bigger. Horizontal (out) adds more machines to share the work.' },
    { q: 'Main limits of scaling up?', a: 'A ceiling (the biggest machine), rising cost at the top end, possible downtime to upgrade, and it is still a single point of failure.' },
    { q: 'Main cost of scaling out?', a: 'Complexity: you need load balancing, shared state and storage, and repeatable deployments.' },
    { q: 'What is a single point of failure?', a: 'One component whose failure takes the whole system down, such as a lone database or load balancer.' },
    { q: 'What must change before you can scale out an app?', a: 'Move state (sessions, uploads, in-memory data) out of individual servers into shared stores, and put a load balancer in front.' }
  ],

  glossary: [
    { term: 'Vertical scaling', def: 'Adding capacity by making one machine more powerful: more CPU, memory or faster disks.', like: 'Buying a bigger oven.', aka: ['scale up'] },
    { term: 'Horizontal scaling', def: 'Adding capacity by running more machines that share the work.', like: 'Buying more food vans.', aka: ['scale out'] },
    { term: 'Single point of failure', def: 'A component with no backup whose failure stops the whole system.', like: 'The one key to the only door.', aka: ['SPOF'] },
    { term: 'Capacity', def: 'How much load a system can handle, usually measured in requests per second.', like: 'How many people a lift can carry per hour.' }
  ],

  takeaways: [
    '**Scale up** = a bigger machine: simple but capped, and it stays one point of failure.',
    '**Scale out** = more machines: room to grow and resilience, but more coordination.',
    'Before scaling out, take **state off the servers** and put a load balancer in front.',
    'Always ask of every box: **what if this dies?** The database is usually the next weak spot.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('sv-load-balancing', {
  eli5: 'A load balancer is one front door that hands each visitor to one of many identical servers, and stops sending anyone to a server that has stopped working.',

  cards: [
    { kind: 'concept', title: 'Many servers, but one address',
      body: `You now have three identical app servers. A visitor types your web address. Which server do they get?

        They cannot be asked to choose. They have one address, and it must lead somewhere sensible every time. And if server 2 has crashed, they must **never** be sent to it.

        The job of sharing visitors out is done by a **load balancer**: a server (or service) that sits at the one public address, receives every request, and forwards each to a healthy server behind it.

        It does three jobs at once: **spread the load**, **hide the servers**, and **dodge the broken ones**.` },

    { kind: 'metaphor', title: 'The host with the clipboard',
      body: `At a busy restaurant, a **host** stands at the door with a clipboard. Guests arrive; the host looks at the tables and says "you're at table 4, you're at table 7".

        A good host does not send everyone to table 1, even though it is closest. They spread people out. They skip tables that are closed for cleaning. They might say "the big party goes to the big table".

        That is a load balancer: the host at your front door, deciding where each request sits. The diners are requests, the tables are servers, and the **algorithm** is the host's rule for choosing.` },

    { kind: 'compare', title: 'How does it choose? Four common rules',
      body: 'These are the **load-balancing algorithms** you will meet most.',
      cols: ['How it picks', 'Good when'],
      rows: [
        ['Round robin', 'Each server in turn: 1, 2, 3, 1, 2, 3…', 'Servers are alike and requests cost about the same'],
        ['Weighted round robin', 'Like round robin, but a bigger server gets a larger share', 'Machines differ in power'],
        ['Least connections', 'Whichever server has the fewest requests in progress right now', 'Requests vary a lot in how long they take'],
        ['Hashing (e.g. by client IP or URL)', 'Hash something about the request to pick a server; the same input always lands on the same server', 'You want the same user or key to keep landing on the same machine']
      ] },

    { kind: 'code', title: 'What it looks like in config',
      body: 'An Nginx-style pool of servers with an algorithm. **Tap the lines.**',
      code: { lang: 'text', src: `
        upstream shop_app {
          least_conn;
          server 10.0.0.11:3000;
          server 10.0.0.12:3000;
          server 10.0.0.13:3000 weight=2;
        }

        server {
          location / { proxy_pass http://shop_app; }
        }`,
        notes: {
          1: 'A named **pool** of servers to share the load across.',
          2: 'The algorithm: **least connections**. Send each request to whichever server is least busy.',
          5: '`weight=2`: this server is twice as strong, so it gets about twice the share.',
          9: 'Anything arriving at the front door is forwarded to the pool, and Nginx picks a member for each request.'
        } } },

    { kind: 'sequence', title: 'Health checks: skipping the dead server',
      body: 'A load balancer must notice trouble itself. Step through a server failing.',
      actors: ['Load balancer', 'Server 1', 'Server 2'],
      steps: [
        { from: 0, to: 1, label: 'health check: GET /health', note: 'Every few seconds, the balancer pings each server with a tiny request. This is an **active health check**.' },
        { from: 1, to: 0, label: '200 OK', dashed: true, note: 'Server 1 says it is fine.' },
        { from: 0, to: 2, label: 'health check: GET /health', note: 'Same test for server 2.' },
        { at: 2, label: 'crashes', note: 'Server 2 runs out of memory and dies.' },
        { from: 0, to: 2, label: 'health check (no reply)', note: 'The next check times out. After a few failures in a row, the balancer marks it **unhealthy**.' },
        { at: 0, label: 'removes server 2', note: 'From now on, every request goes to server 1. Visitors never see the failure.' },
        { from: 0, to: 2, label: 'keeps checking, later', note: 'It keeps testing. When server 2 is back and healthy, it is added to the rotation again.' }
      ] },

    { kind: 'concept', title: 'What does "healthy" really mean?',
      body: `A health check is only as good as its question. The simplest asks "is the process alive?". Better ones ask "can you actually do your job?": connect to the database, reach the cache.

        - **Active checks**: the balancer sends test requests on a schedule.
        - **Passive checks**: the balancer watches **real traffic**. If a server returns errors or times out, it is quietly taken out.

        Be careful in both directions. A check that is too weak keeps a broken server in service. One that is too fussy (say, failing because a *non-essential* dependency is slow) can pull **every** server out at once, and your balancer is left with nobody to send visitors to.` },

    { kind: 'compare', title: 'Layer 4 vs layer 7',
      body: 'Networks work in layers. A load balancer can work low down (layer 4, [[TCP]] and IP addresses) or high up (layer 7, the HTTP messages themselves).',
      cols: ['Layer 4', 'Layer 7'],
      rows: [
        ['Looks at', 'IP addresses and ports only', 'The full HTTP request: path, host, headers, cookies'],
        ['Can route by URL?', 'No', 'Yes: `/api` to one pool, `/images` to another'],
        ['Speed and cost', 'Very fast and light', 'More work per request'],
        ['Understands HTTP?', 'No: any TCP traffic works, even a database protocol', 'Yes, and can add caching, compression, TLS termination'],
        ['Typical use', 'Raw speed, non-HTTP protocols', 'Web apps, smart routing']
      ] },

    { kind: 'concept', title: 'Sticky sessions: "please send me back to the same server"',
      body: `Suppose your app keeps a user's login **in the memory of one server**. If the balancer sends their next request to a different server, they appear logged out.

        A **sticky session** (or session affinity) works around this: the balancer remembers which server a user got, usually via a **cookie** it sets, and keeps sending them there.

        It works, but it costs you:

        - **Uneven load**: a few heavy users can pile onto one server.
        - **Lost sessions**: if that server dies, everyone stuck to it loses their session.
        - **Harder scaling**: you cannot freely remove servers.

        It is a plaster. The cure is stateless servers, which is the next lesson.` },

    { kind: 'pitfall', title: 'The balancer is itself a single point of failure',
      body: `You added the load balancer to remove a single point of failure, and it **became** one. If it dies, nothing reaches any server.

        The fix is to have more than one: two balancers sharing an address so that one takes over if the other fails, or a **managed cloud load balancer** that the provider itself runs as a redundant service.

        It is the same rule as everywhere else in this module: every box on the path needs to survive its own failure.`,
      note: 'In the lab that follows you will spread traffic with different algorithms, kill a server, and watch health checks react.' },

    { kind: 'realworld', title: 'What people actually use',
      body: `**Nginx** and **HAProxy** are widely used software load balancers that you run yourself. Cloud providers sell managed ones: AWS's Application Load Balancer works at layer 7 and its Network Load Balancer at layer 4, and other clouds have equivalents. CDNs such as Cloudflare do a version of this too.

        Smart layer-7 routing is what lets one domain serve many things: \`/api\` goes to one pool of servers, \`/images\` to another, and the checkout service gets its own scaling.` }
  ],

  activities: [
    { type: 'mcq', after: 3, q: 'Requests to your app vary wildly: some take 20 ms, some take 5 seconds. Which algorithm tends to spread work more fairly than plain round robin?',
      options: ['Least connections', 'Round robin with identical weights', 'Hashing on the client’s IP address', 'Always pick the first server'],
      answer: 0,
      why: [null, 'Round robin ignores how busy each server is, so one server can collect several slow requests.', 'Hashing keeps the same client on the same server, which is not about fairness at all.', 'That sends everything to one machine.'],
      explain: 'Least connections looks at how many requests each server is **currently** handling, so a server stuck with slow requests receives fewer new ones.' },

    { type: 'tf', after: 5, statement: 'A health check that is too strict can take every server out of rotation at once.', answer: true,
      explain: 'If every server fails the check, say because a non-essential dependency is slow, the balancer has nowhere healthy to send traffic. A check should test what is truly needed to serve requests.' },

    { type: 'match', prompt: 'Match each load-balancing idea to its description.',
      pairs: [['Round robin', 'Each server in turn'], ['Least connections', 'The server doing the least right now'], ['Hash-based', 'The same key always lands on the same server'], ['Health check', 'A test to decide whether a server should get traffic'], ['Sticky session', 'Keep sending a user to the same server']] },

    { type: 'bucket', prompt: 'Layer 4 or layer 7?', buckets: ['Layer 4 (TCP)', 'Layer 7 (HTTP)'],
      items: [['Sees only IP addresses and ports', 0], ['Works for any TCP protocol, not just web traffic', 0], ['Very fast because it never reads the request', 0], ['Routes `/api/*` to one pool and `/images/*` to another', 1], ['Can read a cookie to set up stickiness', 1], ['Can end TLS and compress responses', 1]],
      explain: 'Layer 4 only sees the envelope (addresses and ports) so it is fast and protocol-agnostic. Layer 7 opens the envelope and reads the HTTP message, which allows smart routing and features.' },

    { type: 'estimate', q: 'Three servers each handle 400 requests per second at their limit. Traffic is 1,000 requests per second, shared evenly, when one server dies. Roughly how many requests per second does each remaining server now receive?',
      answer: 500, unit: 'requests per second', min: 50, max: 5000, tolerance: 1.3,
      explain: '1,000 / 2 = **500** each, which is more than the 400 each can handle. Losing one of three servers can overload the rest, which is why you plan spare capacity (headroom), covered later in this module.' },

    { type: 'cloze', text: 'A load balancer sends traffic only to servers that pass a {{health check}}. A {{layer 7}} balancer can route by URL path, while a {{layer 4}} balancer only sees addresses and ports.',
      distractors: ['sticky session', 'round robin', 'layer 1'],
      explain: 'Health checks decide who is eligible. Layer 7 balancers understand HTTP, layer 4 balancers do not.' },

    { type: 'short', q: 'Which load-balancing algorithm sends each request to the server with the fewest requests currently in progress? (Two words.)', accept: ['least connections', 'leastconnections', 'least connection'], hint: 'It counts how many are open right now.',
      explain: '**Least connections**. It adapts to uneven request times, which round robin cannot.' },

    { type: 'scenario', title: 'Server 3 goes down at lunchtime', intro: 'Your shop runs three app servers behind a load balancer set to round robin with sticky sessions. At 12:30, server 3 crashes. Support starts to hear from customers.',
      meters: { 'uptime': 80, 'customer trust': 70 },
      steps: [
        { text: 'The balancer’s health checks are on. What do visitors who were *not* on server 3 experience?',
          choices: [
            { label: 'Nothing, as the balancer stops sending new requests to server 3 once it fails checks', score: 2, effects: { 'uptime': 5 }, feedback: 'That is what health checks are for: the failure is contained to the one server and its stuck users.' },
            { label: 'Every request now fails', score: 0, effects: {}, feedback: 'Not with health checks on. The other two servers are fine and keep serving.' },
            { label: 'The site becomes slower for everyone for an hour', score: 1, effects: {}, feedback: 'Remaining servers take a bigger share, which might slow them a little, but there is no lasting hour-long penalty.' }
          ] },
        { text: 'A number of customers say they were logged out and their baskets vanished. Why?',
          choices: [
            { label: 'Their sessions lived in server 3’s memory and stuck to it, so they were lost when it died', score: 2, effects: { 'customer trust': -5 }, feedback: 'Exactly the cost of sticky sessions: the load balancer can reroute the user, but their state has gone with the server.' },
            { label: 'The load balancer deleted their accounts', score: 0, effects: { 'customer trust': -5 }, feedback: 'The balancer only forwards requests. It does not touch accounts.' },
            { label: 'Their browsers cleared the cookies', score: 0, effects: {}, feedback: 'Browsers do not clear cookies on a server crash. The state was on the server.' }
          ] },
        { text: 'What is the best long-term fix so this never costs customers their baskets again?',
          choices: [
            { label: 'Store sessions and baskets in a shared store so any server can serve any user', score: 2, effects: { 'uptime': 10, 'customer trust': 25 }, feedback: 'No stickiness needed: any server can pick up any user. That is the next lesson’s topic.' },
            { label: 'Switch the balancer to hashing so users stick harder', score: 1, effects: { 'customer trust': 5 }, feedback: 'Hashing still ties users to a server, so a crash still loses their state.' },
            { label: 'Buy a bigger server so it never crashes', score: 0, effects: { 'customer trust': -5 }, feedback: 'Every machine fails eventually. Design so that a failure is survivable.' }
          ] }
      ],
      outro: 'The pattern: **health checks contain a failure; shared state makes it painless.**' },

    { type: 'explain', prompt: 'Explain what a load balancer does, three ways it can choose a server, and why sticky sessions are called a plaster rather than a cure.',
      model: 'A load balancer sits at one public address and forwards each request to one of several healthy servers, hiding them and sharing the load. It can pick by round robin, least connections, or hashing something such as the client IP. Health checks remove failed servers. Sticky sessions send a user to the same server because their session lives in that server’s memory, but that causes uneven load and loses the session if the server dies, so the real cure is to keep state in a shared place.',
      keywords: ['one address', 'healthy', 'round robin', 'least connections', 'hash', 'health check', 'sticky', 'shared'] }
  ],

  flashcards: [
    { q: 'What does a load balancer do?', a: 'It sits at a single address, forwards each request to one of several healthy servers, shares the load and hides the servers behind it.' },
    { q: 'Name three load-balancing algorithms.', a: 'Round robin (each in turn), least connections (the least busy right now) and hashing (the same key goes to the same server).' },
    { q: 'What is a health check?', a: 'A test, active (pings) or passive (watching real traffic), used to take failing servers out of rotation and put them back when they recover.' },
    { q: 'Layer 4 vs layer 7 load balancing?', a: 'Layer 4 routes on IP and port and is fast and protocol-agnostic. Layer 7 reads HTTP and can route by path, host or cookie.' },
    { q: 'Why are sticky sessions a workaround?', a: 'They keep a user on one server because their state lives there, causing uneven load and lost sessions when that server fails. Shared state removes the need.' }
  ],

  glossary: [
    { term: 'Load balancer', def: 'A server or service that receives requests at one address and spreads them across a pool of servers.', like: 'The restaurant host who seats each guest at a table.' },
    { term: 'Health check', def: 'A regular test, or a watch on real traffic, that decides whether a server is fit to receive requests.', like: 'The host checking whether a table is clean before seating anyone.' },
    { term: 'Round robin', def: 'A load-balancing rule that sends requests to each server in turn.', like: 'Dealing cards around a table.' },
    { term: 'Least connections', def: 'A rule that sends each request to the server with the fewest requests in progress.', like: 'Choosing the supermarket till with the shortest queue.' },
    { term: 'Sticky session', def: 'A setting that keeps a user’s requests on the same server, usually by a cookie.', like: 'Always being seated with the same waiter.', aka: ['session affinity'] }
  ],

  takeaways: [
    'A **load balancer** gives many servers one address, spreads requests and **skips dead servers**.',
    '**Round robin** is simple, **least connections** adapts to uneven work, **hashing** keeps a key on one server.',
    '**Layer 4** is fast and blind to HTTP; **layer 7** can route by URL, cookie and host.',
    '**Sticky sessions** are a workaround for server-held state, and the balancer itself must not be a single point of failure.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('sv-stateless', {
  eli5: 'If a server remembers things about you privately, only that server can serve you. If every server looks things up in a shared place instead, any server will do, and adding more is easy.',

  cards: [
    { kind: 'concept', title: 'The basket that vanished',
      body: `You are shopping online. You add a jumper to your basket, click to the next page, and the basket is **empty**. You add it again, refresh, and now it is back.

        What happened? Behind that shop are two servers. The first one remembered your basket **in its own memory**. Your next request happened to land on the second server, which had never heard of you.

        The servers were not at fault. The *design* was: it kept something important in the one place only one server could see. That something, the memory of what has happened so far, is called **state**, and where you keep it decides how easily you can scale.` },

    { kind: 'metaphor', title: 'The doctor who remembers everything',
      body: `Imagine a clinic where each doctor carries every patient's history **in their head**. You can only ever see *your* doctor. If they are off sick, nobody can treat you properly, and you cannot add a second doctor without teaching them everything.

        Now a clinic with a **shared patient file** in the records room. Any doctor on shift pulls your file, treats you, and writes it back. Doctors are interchangeable. Need more capacity? Hire another doctor; they walk straight in.

        A **stateless** server is the second kind of doctor: it keeps nothing about you between requests, and fetches whatever it needs from the shared file.` },

    { kind: 'sequence', title: 'Logged in on one server, strangers on the next',
      body: 'A load balancer sends consecutive requests to different servers. Watch what happens to a login kept in memory.',
      actors: ['Browser', 'Server A', 'Server B'],
      steps: [
        { from: 0, to: 1, label: 'POST /login', note: 'The balancer sends the login to server A.' },
        { at: 1, label: 'remembers you in memory', note: 'Server A checks the password and stores "this person is Priya" **in its own memory**.' },
        { from: 1, to: 0, label: '200 OK + session cookie', dashed: true, note: 'It replies with a cookie so the browser can say who it is.' },
        { from: 0, to: 2, label: 'GET /account (cookie)', note: 'The next request goes to **server B**, by round robin.' },
        { at: 2, label: 'cookie means nothing here', note: 'Server B looks for that session in its own memory. It is not there.' },
        { from: 2, to: 0, label: '401: please log in', dashed: true, note: 'Priya is logged out, for no reason she can see. Sticky sessions hide this, but do not cure it.' }
      ] },

    { kind: 'concept', title: 'Why server-held state blocks scaling',
      body: `State on one server causes three separate problems, and each gets worse as you add servers:

        1. **Requests must return to the same server.** You are forced into sticky sessions, which give uneven load.
        2. **A crash loses data.** If the server dies, so does everything in its memory, and the people it was holding.
        3. **You cannot add or remove servers freely.** Shutting one down (to deploy, or because traffic dropped) strands its users.

        With stateless servers, none of this applies. Any server can take any request, so the balancer can be as simple as it likes, and servers can **come and go** at will.` },

    { kind: 'diagram', title: 'Moving state to a shared store',
      body: 'The servers become interchangeable, and the memory moves out into one place they all consult.',
      nodes: [
        { id: 'lb', label: 'Load balancer', icon: '🚦', x: 1, y: 0 },
        { id: 's1', label: 'App server 1', icon: '🖥️', x: 0, y: 1 },
        { id: 's2', label: 'App server 2', icon: '🖥️', x: 1, y: 1 },
        { id: 's3', label: 'App server 3', icon: '🖥️', x: 2, y: 1 },
        { id: 'r', label: 'Shared session store', icon: '⚡', x: 0, y: 3, tone: 'accent' },
        { id: 'db', label: 'Database', icon: '🗄️', x: 1, y: 3, tone: 'accent' },
        { id: 'o', label: 'Object storage (files)', icon: '📦', x: 2, y: 3, tone: 'accent' }
      ],
      edges: [
        { from: 'lb', to: 's1' }, { from: 'lb', to: 's2' }, { from: 'lb', to: 's3' },
        { from: 's2', to: 'r', label: 'sessions', dashed: true },
        { from: 's2', to: 'db', label: 'data', dashed: true },
        { from: 's2', to: 'o', label: 'uploads', dashed: true }
      ],
      caption: 'Nothing important lives on an app server. Lose one and no data goes with it.' },

    { kind: 'compare', title: 'Where should each kind of state live?',
      body: 'Rule of thumb: if losing the server would lose it, it does not belong on the server.',
      cols: ['Not on the app server', 'Put it here instead'],
      rows: [
        ['Login sessions', 'Process memory', 'A shared store such as Redis, or a signed token the user carries'],
        ['Shopping basket', 'A variable inside one server', 'The database, or the shared session store'],
        ['Uploaded files', 'The server’s local disk', 'Shared object storage'],
        ['Business data (orders, users)', 'Any local file or memory', 'The database'],
        ['Throwaway scratch work', 'Nowhere else needed', 'Local memory is fine: it can be recomputed']
      ] },

    { kind: 'concept', title: 'Shared-nothing: servers that never need to chat',
      body: `The design goal has a name: **shared-nothing**. Each application server keeps no data the others need, and does not talk to its siblings. Everything they share goes through an **external service**, the database, cache or storage.

        The payoff is almost magical. To handle twice the traffic, start twice as many identical servers. To deploy, replace servers one at a time. To survive a crash, do nothing: the balancer routes around it.

        You are not removing state from your system. You are **moving it to places built to look after it**, and leaving the servers as disposable workers.` },

    { kind: 'code', title: 'Idempotent handlers: any server, any number of times',
      body: 'With many servers and retries, the same request can arrive **twice**, even at different servers. A handler should cope. **Tap the lines.**',
      code: { lang: 'js', src: `
        async function charge(req) {
          const key = req.headers['idempotency-key'];
          const done = await store.get('charge:' + key);
          if (done) return done;              // a repeat: replay the answer

          const result = await payments.charge(req.body);
          await store.set('charge:' + key, result, 86400);
          return result;
        }`,
        notes: {
          2: 'The client sends a unique **idempotency key** with each distinct attempt, the trick from the HTTP lessons.',
          3: 'Look in the **shared** store (not local memory) for an earlier result under that key.',
          4: 'Found one: this is a repeat, perhaps sent to a different server. Return the saved answer and do **not** charge again.',
          7: 'Save the result in the shared store so *any* server can recognise the repeat. A real implementation also guards against two copies arriving at the very same instant, with an atomic "set if absent".'
        } } },

    { kind: 'tip', title: 'Sessions: shared store or signed token?',
      body: `You met both in the authentication lessons, and they suit stateless design differently.

        - **Shared session store** (such as Redis): the server holds only a session ID, and looks everything up. Easy to revoke, because you simply delete the entry. Costs one fast lookup per request.
        - **Signed token** (such as a JWT): all the user's details travel **in the token**, and any server can verify the signature. Needs no lookup, but is harder to revoke before it expires.

        Neither is "the" answer; teams pick based on how important instant logout is, and how heavy the lookups would be.` },

    { kind: 'pitfall', title: 'Hidden state sneaks back in',
      body: `Even teams that "went stateless" often leave state lurking:

        - An **in-memory cache** per server, so servers disagree about the same data.
        - **Local files**: uploads, generated reports, temporary downloads.
        - **In-process counters**, such as rate limits counted per server, which let a user make three times the intended requests across three servers.
        - **Scheduled jobs** that run on every server, so the nightly email goes out three times.
        - **Long-lived connections** such as WebSockets, which pin a user to one server.

        Test it the blunt way: kill a server in the middle of a session and see what breaks.`,
      note: 'The Twelve-Factor App, a well-known guide to building scalable services, makes the same point: run your app as one or more stateless processes.' }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'A user logs in and their session is stored in the memory of server A. Their next request goes to server B. What happens?',
      options: ['Server B cannot find the session, so the user looks logged out', 'Server B automatically fetches the session from server A', 'The browser keeps the session, so nothing is lost', 'The load balancer copies the session to every server'],
      answer: 0,
      why: [null, 'Servers do not share memory or chat to each other unless you build that, and a stateless design avoids needing it.', 'The cookie only holds an ID. The details are on server A.', 'Load balancers forward requests; they do not replicate application memory.'],
      explain: 'The cookie is just a reference. The actual session data lives in server A’s memory, so server B has nothing to match it to, unless sessions are kept in a shared place.' },

    { type: 'bucket', after: 5, prompt: 'Where should each of these live in a stateless design?', buckets: ['A shared store or the database', 'Shared object storage', 'Fine as local scratch'],
      items: [['A logged-in user’s session', 0], ['A customer’s order history', 0], ['A shopping basket', 0], ['Photos uploaded by users', 1], ['PDF invoices that must be downloadable later', 1], ['A temporary list sorted for one request, then discarded', 2]],
      explain: 'Anything that must survive a server loss or be visible from every server belongs outside the servers. Scratch data that is rebuilt for each request is harmless to keep locally.' },

    { type: 'spot', after: 7, prompt: 'This app works on one server but will break with several. Tap the line responsible.',
      code: { lang: 'js', src: `
        const carts = {};

        app.post('/cart/add', (req, res) => {
          const id = req.session.userId;
          carts[id] = carts[id] || [];
          carts[id].push(req.body.item);
          res.json(carts[id]);
        });` },
      lines: [1],
      explain: 'The `carts` object lives in this one process’s memory. With two servers each has its own `carts`, and a restart empties it. Baskets belong in the database or a shared store.' },

    { type: 'tf', statement: 'A stateless application server stores no data at all, anywhere.', answer: false,
      explain: 'Stateless means the **server** keeps nothing between requests that others need. The data still exists, in the database, the shared store and object storage, which are built to hold state safely.' },

    { type: 'ab', q: 'Which session storage lets you add and remove app servers freely?',
      a: { lang: 'js', label: 'In process memory', src: `
        const sessions = new Map();
        sessions.set(id, user);` },
      b: { lang: 'js', label: 'Shared store', src: `
        await redis.set('session:' + id,
          JSON.stringify(user), 'EX', 1800);` },
      answer: 'b',
      explain: 'The shared store is visible to every server and survives any one server being replaced. The in-memory map belongs to one process and disappears when it does.' },

    { type: 'multi', q: 'Which of these are signs of hidden state that will cause trouble when you scale out?',
      options: ['A rate-limit counter kept in each server’s memory', 'A nightly cleanup job scheduled on every server', 'Uploaded files saved under `./uploads` on the server', 'Reading the database connection string from an environment variable', 'Looking sessions up in a shared Redis'],
      answers: [0, 1, 2],
      explain: 'Per-server counters, jobs that run everywhere, and local files all create differences between servers. Configuration read at start-up and shared stores are exactly how stateless apps work.' },

    { type: 'match', prompt: 'Match each stateless-design idea to what it means.',
      pairs: [['Shared-nothing', 'Servers hold no data that other servers need'], ['Idempotent handler', 'Safe to run twice with the same input'], ['Session store', 'A shared place for who is logged in'], ['Sticky session', 'A workaround that pins users to one server'], ['Object storage', 'Shared storage for uploaded files']] },

    { type: 'scenario', title: 'Make the app disposable', intro: 'Your note-taking app runs on one server. Marketing is about to launch, so you must run four servers behind a balancer. You review the code and find it keeps sessions in memory, saves attachments to a local folder, and runs a nightly "send digest emails" job on startup.',
      meters: { 'scale-readiness': 20, 'bugs': 70 },
      steps: [
        { text: 'Sessions first. How do you handle logins across four servers?',
          choices: [
            { label: 'Store sessions in a shared store so any server can read them', score: 2, effects: { 'scale-readiness': 25, 'bugs': -20 }, feedback: 'Servers become interchangeable for logins. Users can bounce between them without noticing.' },
            { label: 'Switch on sticky sessions and leave the code alone', score: 1, effects: { 'scale-readiness': 10, 'bugs': -5 }, feedback: 'It works for now, but a restart or crash logs people out, and load can become uneven.' },
            { label: 'Ask users to log in again whenever they see an error', score: 0, effects: { 'bugs': 15 }, feedback: 'You would be shipping the bug and giving it a user manual.' }
          ] },
        { text: 'Attachments are saved in `./uploads` on whichever server received them. What should change?',
          choices: [
            { label: 'Upload them to shared object storage and save only the link in the database', score: 2, effects: { 'scale-readiness': 25, 'bugs': -25 }, feedback: 'Every server can now serve every attachment, and a server dying loses nothing.' },
            { label: 'Copy the folder between servers once a day', score: 0, effects: { 'scale-readiness': -5, 'bugs': 10 }, feedback: 'For up to a day, an attachment will be missing from the servers that did not receive it.' },
            { label: 'Keep the folder, and use sticky sessions so users return to their server', score: 1, effects: { 'scale-readiness': 5 }, feedback: 'It breaks the moment a user’s server is replaced, and others cannot see shared attachments.' }
          ] },
        { text: 'The digest-email job runs at startup on every server. With four servers, what happens, and what is the fix?',
          choices: [
            { label: 'Everyone gets four emails; run the job in one place, or have servers claim it through a shared lock', score: 2, effects: { 'scale-readiness': 25, 'bugs': -20 }, feedback: 'Scheduled work must be coordinated through something shared, or run on a single dedicated worker.' },
            { label: 'Nothing: the servers will take turns on their own', score: 0, effects: { 'bugs': 20 }, feedback: 'Servers do not know about each other. Each will run the job.' },
            { label: 'Delete the digest feature', score: 0, effects: { 'scale-readiness': 5, 'bugs': -5 }, feedback: 'You do not need to remove a feature to solve a coordination problem.' }
          ] }
      ],
      outro: 'The pattern: **find what each server remembers, and move it somewhere shared.**' },

    { type: 'explain', prompt: 'Explain why stateless servers make scaling easier, using the example of a login session, and say where the state goes instead.',
      model: 'If a server keeps a session in its own memory, only that server can recognise the user, so requests must be pinned to it, and if it crashes the session is lost. If the session is kept in a shared store such as Redis, or in a signed token, any server can handle any request, so the load balancer can be simple and servers can be added, removed or replaced freely. The state still exists, but it lives in the database, shared store and object storage rather than on the application servers.',
      keywords: ['session', 'memory', 'any server', 'shared store', 'Redis', 'load balancer', 'crash', 'database'] }
  ],

  flashcards: [
    { q: 'What is "state" in a web application?', a: 'The memory of what has happened so far: logins, baskets, uploads, counters. Where it lives decides how easily you can scale.' },
    { q: 'Why does server-held state block scaling out?', a: 'Requests must return to the same server, a crash loses the data, and you cannot add or remove servers freely.' },
    { q: 'What does shared-nothing design mean?', a: 'Application servers keep no data that other servers need, and share everything through external services such as the database, cache and storage.' },
    { q: 'What is an idempotent handler, and why does it matter here?', a: 'One that is safe to run more than once with the same input. With retries and many servers, the same request can arrive twice.' },
    { q: 'Shared session store or signed token?', a: 'A shared store (e.g. Redis) is easy to revoke but needs a lookup per request. A signed token needs no lookup but is harder to revoke early.' }
  ],

  glossary: [
    { term: 'State', def: 'Information a system remembers between requests, such as a login, a basket or an uploaded file.', like: 'The notes a doctor keeps about a patient.' },
    { term: 'Stateless service', def: 'A service that keeps nothing between requests, so any instance can handle any request.', like: 'A doctor who reads the shared file each time.' },
    { term: 'Shared-nothing', def: 'A design where each server holds no data others rely on, and anything shared goes through external services.', like: 'Chefs who never share a pan, only the pantry.' },
    { term: 'Session store', def: 'A shared, fast data store (often Redis) that holds login sessions so every server can read them.', like: 'The records room that every doctor can open.' },
    { term: 'Object storage', def: 'A shared service for storing files, such as uploads, that any server can read and write over the network.', like: 'A big warehouse with a label on every box.' }
  ],

  takeaways: [
    '**State on a server** pins users to it, loses data in a crash and stops you adding servers freely.',
    'Move state to **shared places**: the database, a session store, object storage.',
    '**Shared-nothing** servers are disposable workers: add, replace or lose them at will.',
    'Make handlers **idempotent**, and hunt for hidden state: local files, per-server counters, jobs on every server.'
  ],

  links: [
    { label: 'The Twelve-Factor App', url: 'https://12factor.net/' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('sv-capacity', {
  eli5: 'Capacity planning is doing the sums: how many requests will arrive, how many one server can handle, and how many servers that means once you leave some breathing space.',

  cards: [
    { kind: 'concept', title: 'How many servers do we need?',
      body: `Your boss asks the question every engineer gets: "We expect a million users. How many servers do we buy?"

        Guess low, and the site falls over on launch day. Guess high, and you pay for idle machines every month. Neither is a good look.

        The good news: you do not need a crystal ball. You need **a few multiplications and a sensible habit of rounding**. This technique has a name, **back-of-the-envelope estimation**: quick, rough sums that get you to the right order of magnitude (is it 5 servers or 500?) in a couple of minutes.

        The numbers will be rough. That is fine. The goal is to be right to within a factor of two or three, not to the last digit.` },

    { kind: 'metaphor', title: 'A restaurant’s seats and turnover',
      body: `How many customers can a restaurant serve in an evening? Not by guessing, but by sums: **seats × how many times each seat is reused**. Forty seats, and each table turns over in about an hour, over a four-hour evening: about 160 meals.

        A busy Saturday has more diners than a quiet Tuesday, so a sensible owner plans for the **peak**, not the average, and never runs every seat at 100% (there must be room for walk-ins and slow tables).

        A server farm is the same: capacity is **servers × what each can do**, and you plan for the busiest hour with room to spare.` },

    { kind: 'concept', title: 'Step 1: from users to requests per second',
      body: `The unit of load is **requests per second** (RPS). Start from users and work down.

        A handy fact: **a day is about 86,400 seconds, which is close to 100,000 (10⁵)**. Using 10⁵ makes the mental arithmetic easy.

        | Step | Number |
        |---|---|
        | Daily active users | 1,000,000 |
        | Requests per user per day | 20 |
        | Requests per day | 20,000,000 |
        | Divide by about 10⁵ seconds | **≈ 200 RPS** average |
        | (Exact: 20,000,000 / 86,400) | ≈ 230 RPS |

        The shortcut is within about 15% of the exact answer, which is plenty.` },

    { kind: 'concept', title: 'Step 2: plan for the peak, not the average',
      body: `Traffic is not flat. People are asleep at 4am and shopping at 8pm. An average of 230 RPS hides an evening peak that might be **two to five times higher**.

        A reasonable habit is to multiply the average by a **peak factor**, say 3, unless you have real data:

        - Average: ≈ 230 RPS
        - Peak (×3): ≈ **700 RPS**

        Sudden events (a newspaper mention, a sale at noon) can be far above even that. For those you either keep generous headroom or scale automatically, which is the next half of this lesson.` },

    { kind: 'concept', title: 'Concurrency: how many are in flight at once?',
      body: `RPS is how many requests *arrive* each second. **Concurrency** is how many are *being handled at the same moment*.

        The link between them is beautifully simple:

        > **Concurrency = requests per second × time each takes (in seconds)**

        At 700 RPS, if each request takes 0.2 seconds, then 700 × 0.2 = **140 requests are in flight at any moment**. If the database slows down and each takes 2 seconds, it becomes 1,400, ten times as many, even though the number arriving is unchanged.

        This is why slowness snowballs: slower requests mean more of them piled up, which uses more memory and workers, which makes everything slower still.` },

    { kind: 'steps', title: 'Step 3: from peak to number of servers',
      body: 'Say your peak is about 700 RPS. Work through it.',
      steps: [
        { title: 'Measure one server', body: 'Load-test a single server with realistic requests. Suppose it handles **150 RPS flat out** before latency climbs. Never guess this; it varies enormously between apps.' },
        { title: 'Leave headroom', body: 'Do not plan to run at 100%. A common target is **50 to 70%** busy at peak. At 70%, one server is planned for 150 × 0.7 ≈ **105 RPS**.' },
        { title: 'Divide', body: '700 / 105 ≈ 6.7, so **7 servers**.' },
        { title: 'Add a spare (N+1)', body: 'If one server fails or is being updated, you still need 7 working. So plan for **8**.' },
        { title: 'Check the rest of the chain', body: 'Eight app servers also means more database queries. Do the same sums for the database, cache and network, because the web tier is rarely the only limit.' }
      ] },

    { kind: 'sequence', title: 'Autoscaling, and its built-in delay',
      body: 'Autoscaling adds and removes servers automatically as load moves. It is not instant. Step through a spike.',
      actors: ['Load', 'Autoscaler', 'New server'],
      steps: [
        { at: 0, label: 'traffic jumps', note: 'A promotion goes out. Average CPU across the servers climbs from 40% to 85%.' },
        { from: 1, to: 0, label: 'watches CPU and requests', dashed: true, note: 'The autoscaler reads **signals** every minute or so. It waits for the high reading to last a few minutes, so it does not react to a blip.' },
        { from: 1, to: 2, label: 'launch 3 more servers', note: 'Condition met: it asks the platform for more servers.' },
        { at: 2, label: 'boots, starts the app', note: 'The machine starts, the app loads, and caches are empty (cold). This can take **minutes**.' },
        { from: 2, to: 1, label: 'passes health check', dashed: true, note: 'Only now does the load balancer start sending it traffic.' },
        { note: 'Notice the gap: from the spike to relief could be five minutes or more. If your site cannot survive that long, you need **headroom** now, or to scale **before** the spike.' }
      ] },

    { kind: 'concept', title: 'What does an autoscaler watch?',
      body: `An autoscaler needs a **signal**: a number that rises when you need more servers. Common ones:

        - **CPU use**: easy and popular, but only right if your work is CPU-bound.
        - **Requests per server**: closer to what users feel.
        - **Queue length**: how many jobs are waiting. Excellent for background workers.
        - **Latency**: the response times themselves, which show pain directly.

        You also set a **minimum** (never fewer than this), a **maximum** (a cap, to protect your bill) and a **cooldown** (wait a few minutes between changes so it does not flap up and down).

        Some traffic is predictable. A shop that peaks every evening can **schedule** extra servers in advance instead of waiting to react.` },

    { kind: 'pitfall', title: 'Scaling out the wrong thing, and too late',
      body: `Autoscaling the web tier solves web-tier problems. If the real bottleneck is the **database**, adding app servers sends it *more* queries and makes things worse.

        And because new servers take minutes to be useful, a **fast spike** can flatten you before help arrives. Defences:

        - Keep enough **headroom** to ride out the warm-up time.
        - Scale on a **leading signal** (requests rising, queue growing), not only CPU that has already hit the wall.
        - **Pre-warm** ahead of known events.
        - Cap the maximum, or a runaway loop can scale you into a very large bill.`,
      note: 'Cost works both ways: autoscaling saves money in quiet hours, but a high minimum or an uncapped maximum can quietly spend it all back.' },

    { kind: 'realworld', title: 'A rough cost sense',
      body: `Capacity planning is ultimately about money. Rather than prices (which change), think in shapes:

        - A **steady baseline** of servers is cheapest bought for the long term at a discount.
        - The **spiky top** is best handled by autoscaling, paid for only while used.
        - **Over-provisioning** by a lot buys safety but wastes money; **under-provisioning** saves money until the day it costs customers.

        Everything here is an estimate you will test and revise. In the lab that follows, you will walk through exactly these sums: users to RPS to storage to servers.` }
  ],

  activities: [
    { type: 'estimate', after: 2, q: 'A site has 1,000,000 daily active users, each making about 10 requests a day. Roughly how many requests per second is that on average?',
      answer: 115, unit: 'requests per second', min: 1, max: 10000, tolerance: 1.5,
      explain: '1,000,000 × 10 = 10,000,000 requests per day. Divide by about 100,000 seconds in a day: roughly **100 RPS** (86,400 gives about 116). The shortcut of 10⁵ seconds per day is accurate enough for planning.' },

    { type: 'estimate', after: 4, q: 'Requests arrive at 400 per second, and each takes about 0.25 seconds to handle. Roughly how many requests are being handled at the same moment?',
      answer: 100, unit: 'concurrent requests', min: 1, max: 10000, tolerance: 1.5,
      explain: 'Concurrency = rate × time = 400 × 0.25 = **100**. If each request slowed to a full second, it would be 400, a fourfold jump with no extra traffic.' },

    { type: 'mcq', after: 7, q: 'Traffic suddenly triples. The autoscaler waits for a high reading to last a few minutes, then launches servers that take several minutes to start. What does this tell you about preparing?',
      options: ['Keep headroom or scale early, because help arrives minutes after the spike', 'Autoscaling reacts instantly, so no preparation is needed', 'Autoscaling is useless for spikes and should be turned off', 'Only CPU can be used as a signal'],
      answer: 0,
      why: [null, 'There is always a delay: detection, launching and warming up.', 'Autoscaling is valuable. It just has a lag that you must plan for.', 'Requests, queue length and latency are all common signals too.'],
      explain: 'Detection plus boot plus warm-up adds up to minutes. For sharp spikes you need spare capacity already running, or predictive and scheduled scaling.' },

    { type: 'estimate', q: 'Peak traffic is 1,200 requests per second. One server handles 200 RPS flat out, but you plan to run them at 60% at peak. Roughly how many servers do you need (before adding a spare)?',
      answer: 10, unit: 'servers', min: 1, max: 200, tolerance: 1.3,
      explain: 'Planned capacity per server is 200 × 0.6 = 120 RPS. Then 1,200 / 120 = **10** servers. Add one spare (N+1) and you would buy 11.' },

    { type: 'order', prompt: 'Put a back-of-the-envelope server estimate in order.',
      items: ['Estimate daily users and requests per user', 'Convert requests per day into average requests per second', 'Multiply by a peak factor to get peak RPS', 'Divide peak by what one server can safely handle, with headroom', 'Add a spare server and check the database and other layers'],
      explain: 'Work from the business numbers down to the machines. Peak, not average, drives the count, and headroom and a spare come last because they depend on the rest.' },

    { type: 'bucket', prompt: 'Is this a good autoscaling signal for the described workload?', buckets: ['Good signal', 'Poor signal'],
      items: [['Queue length for a pool of background image-resizing workers', 0], ['Average CPU across web servers doing heavy page rendering', 0], ['Requests per second per server on a web tier', 0], ['The time of day on its own, for traffic that is unpredictable', 1], ['The size of the database backup folder', 1], ['CPU of a tier that mostly waits on a slow database', 1]],
      explain: 'A good signal rises when you need more workers and falls when you do not. A CPU reading is meaningless if the tier is just waiting on something else, and unrelated numbers say nothing about load.' },

    { type: 'tf', statement: 'If you size your servers for the average daily traffic, you will be fine at the busiest time of day.', answer: false,
      explain: 'Peak traffic can be several times the average. Plan for the peak, with headroom, or the site slows exactly when the most people are using it.' },

    { type: 'scenario', title: 'Launch-day sums', intro: 'You are planning the servers for a ticket-booking site. The marketing team forecasts 2 million daily active users at launch, each making about 25 requests. A single app server, load-tested, handles 250 requests per second before slowing down.',
      meters: { 'confidence': 30, 'budget': 60 },
      steps: [
        { text: 'Work out the average load. Which is closest?',
          choices: [
            { label: 'About 500 requests per second (50 million per day divided by roughly 10⁵ seconds)', score: 2, effects: { 'confidence': 25 }, feedback: '2,000,000 × 25 = 50,000,000 requests a day. Divided by about 100,000 seconds, around 500 RPS (exact: about 580).' },
            { label: 'About 50 requests per second', score: 0, effects: { 'confidence': -10 }, feedback: 'That is a factor of ten too low. Check the powers of ten: 50 million over a hundred thousand is five hundred.' },
            { label: 'About 5,000 requests per second', score: 0, effects: { 'confidence': -10 }, feedback: 'A factor of ten too high. Spread over a whole day, 50 million requests is about 500 a second on average.' }
          ] },
        { text: 'Tickets for popular shows go on sale at set times, so you expect a peak about four times the average. How many servers, planned at 60% load, before a spare?',
          choices: [
            { label: 'About 13: peak 2,000 RPS / (250 × 0.6 = 150 per server)', score: 2, effects: { 'confidence': 30, 'budget': -10 }, feedback: 'Peak is roughly 500 × 4 = 2,000 RPS, and each server is planned for 150, so 2,000 / 150 ≈ 13. Add one spare to make 14.' },
            { label: '2: 500 RPS divided by 250', score: 0, effects: { 'confidence': -15, 'budget': 20 }, feedback: 'That plans for the average at 100% load. At the on-sale moment the site would collapse.' },
            { label: '100, to be absolutely safe', score: 1, effects: { 'confidence': 5, 'budget': -40 }, feedback: 'It would certainly survive, but you would be paying for roughly seven times what you need.' }
          ] },
        { text: 'The on-sale spike arrives within about one minute, and new servers take around five minutes to be ready. What is your plan?',
          choices: [
            { label: 'Run the peak-sized fleet before the on-sale, scheduled in advance, and use autoscaling for surprises', score: 2, effects: { 'confidence': 25, 'budget': -5 }, feedback: 'Known events call for scheduled capacity. Autoscaling then covers what you did not predict.' },
            { label: 'Rely on CPU-based autoscaling alone', score: 0, effects: { 'confidence': -20 }, feedback: 'By the time new servers are ready, the spike has already queued up and many customers have given up.' },
            { label: 'Run the minimum and hope', score: 0, effects: { 'confidence': -25, 'budget': 15 }, feedback: 'Cheap until launch day. After that, expensive in every other way.' }
          ] }
      ],
      outro: 'The pattern: **estimate, plan for the peak with headroom, and pre-scale for events you can see coming.**' },

    { type: 'explain', prompt: 'A colleague says "just buy as many servers as the average traffic needs". Explain, with the sums, why that goes wrong.',
      model: 'Average traffic hides the peak, which can be several times higher, so servers sized for the average are overloaded at the busiest hours. You work from users to requests per second, multiply by a peak factor, divide by what one server can safely do while running at 50 to 70 percent to leave headroom, then add a spare. Autoscaling helps with surprises, but new servers take minutes to arrive, so you also need spare capacity or scheduled scaling for known events.',
      keywords: ['peak', 'average', 'requests per second', 'headroom', 'spare', 'autoscaling', 'warm-up', 'minutes'] }
  ],

  flashcards: [
    { q: 'How do you turn daily requests into requests per second?', a: 'Divide by the seconds in a day: about 86,400, or roughly 10⁵ for easy mental arithmetic.' },
    { q: 'What is the relationship between concurrency and requests per second?', a: 'Concurrency = requests per second × time each request takes (in seconds).' },
    { q: 'How do you work out how many servers you need?', a: 'Peak RPS divided by what one server can safely handle (at 50 to 70% of its limit), then add a spare (N+1).' },
    { q: 'Why is autoscaling not instant?', a: 'It must detect the rise, launch servers, start the app and pass health checks. That can take minutes, so you need headroom or scheduled scaling.' },
    { q: 'Name three autoscaling signals.', a: 'CPU use, requests per server, queue length and latency are common ones, chosen to match what really limits the tier.' }
  ],

  glossary: [
    { term: 'Requests per second', def: 'How many requests arrive each second; the basic unit of load on a web service.', like: 'Customers arriving at a till each minute.', aka: ['RPS', 'QPS'] },
    { term: 'Headroom', def: 'Spare capacity you deliberately leave unused so that spikes and failures do not tip the system over.', like: 'A lift never loaded to its absolute limit.' },
    { term: 'Peak factor', def: 'The multiple of average traffic you plan for, because busy hours are much busier than the average.', like: 'A restaurant planning for Saturday, not Tuesday.' },
    { term: 'Autoscaling', def: 'Automatically adding or removing servers based on signals such as CPU, requests or queue length.', like: 'A shop that calls in extra tills when the queue grows.' },
    { term: 'Warm-up', def: 'The time a new server needs to boot, load the app and fill its caches before it can carry a full share of traffic.', like: 'A new staff member’s first hour.' }
  ],

  takeaways: [
    'Work **users to RPS** with the shortcut that a **day is about 10⁵ seconds**.',
    'Plan for the **peak**, run servers at **50 to 70%**, and add a spare (**N+1**).',
    '**Concurrency = RPS × seconds per request**: slow requests pile up fast.',
    '**Autoscaling lags by minutes**, so keep headroom, scale on leading signals and pre-scale known events.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('sv-latency', {
  eli5: 'Latency is how long one request takes, throughput is how many you can handle, and to make a system faster you must find the slowest part and fix that, because speeding up anything else barely helps.',

  cards: [
    { kind: 'concept', title: '"It feels slow" is not a number',
      body: `A customer emails: "your checkout is slow". What do you do with that?

        Nothing, yet. "Slow" is a feeling. To fix anything you need **numbers**: how long does a request take, how many can we handle, and where does the time go?

        Two ideas run through all of performance work:

        - **Latency**: how long **one** request takes, from sending to answer.
        - **Throughput**: how many requests the system completes **per second**.

        They are related but different, and mixing them up is the commonest mistake. This lesson gives you the tools to measure both honestly, and to find the one place worth your effort.` },

    { kind: 'metaphor', title: 'The motorway',
      body: `Think of a motorway between two cities.

        **Latency** is your **journey time**: how long one car takes to get there.

        **Throughput** is **cars per hour** passing a point.

        Add lanes and throughput rises, since more cars fit through, but each car's journey takes exactly as long as before. To shorten the journey you need a faster road or a shorter route. Meanwhile, if the motorway is jammed, both get worse: each car crawls, and fewer cars get through.

        Servers behave the same way. More servers raise throughput. They do not make one request faster.` },

    { kind: 'concept', title: 'Numbers worth knowing, roughly',
      body: `Good engineers carry a rough feel for how long basic operations take. These figures are **approximate** and vary with hardware, but the **gaps between them** are what matter. Scaled so that 1 nanosecond becomes 1 second, a human can feel them:

        | Operation | Roughly | At human scale |
        |---|---|---|
        | Read from memory (RAM) | 100 ns | about 2 minutes |
        | Read from an SSD | 100 µs | about 1 day |
        | Round trip inside one data centre | 0.5 ms | about 6 days |
        | Spinning-disk seek | 10 ms | about 4 months |
        | Round trip across the world | 150 ms | about 5 years |

        Memory is **thousands of times** quicker than the network. That gap is why caches work, and why every unnecessary network call is expensive.`,
      note: 'µs means microsecond (a millionth of a second); ns means nanosecond (a billionth). The lab that follows lets you sort these numbers and feel the scale.' },

    { kind: 'compare', title: 'Latency versus throughput',
      body: 'They are measured differently, and improved by different moves.',
      cols: ['Latency', 'Throughput'],
      rows: [
        ['Question', 'How long does one request take?', 'How many requests per second can we complete?'],
        ['Unit', 'Milliseconds or seconds', 'Requests per second'],
        ['Motorway', 'Journey time', 'Cars per hour'],
        ['Improved by', 'Less work per request, nearer data, caching', 'More servers or lanes, batching, parallelism'],
        ['Users feel', 'Directly: the page is fast or slow', 'Indirectly: through queues when you run out']
      ] },

    { kind: 'concept', title: 'Percentiles: why the average lies',
      body: `Suppose 100 requests are timed. Ninety take **100 ms**. Ten are unlucky and take **2 seconds**.

        - The **average** is (90 × 100 + 10 × 2,000) / 100 = **290 ms**, a number nobody actually experienced.
        - The **median**, or **p50**, is **100 ms**: half the requests were faster than this.
        - The **p95** and **p99** are **2,000 ms**: 95% (and 99%) of requests were at or below this.

        A **percentile** answers: "what time were most requests faster than?" So p99 means "99 out of 100 requests were faster than this". Teams track p50 for the typical user, and p95 and p99 for the **slow tail**, which is where the angry emails come from.` },

    { kind: 'pitfall', title: 'The tail gets longer when you add calls',
      body: `You might shrug at "only 1% of calls are slow". But a page rarely makes one call.

        Suppose a page needs **20** independent backend calls, and each has a 1% chance of being slow. The chance that *all twenty* are fast is 0.99 multiplied by itself twenty times, about **0.82**. So roughly **18% of page loads** hit at least one slow call.

        A rare event for one call becomes a common one for the page. This is why big systems obsess about p99 and beyond: with enough calls in the chain, the tail is what most users actually meet.`,
      note: 'The sums here assume the calls are independent. Real systems are messier, but the lesson holds.' },

    { kind: 'concept', title: 'Busy servers get slow, suddenly',
      body: `Here is a surprise. A server at 50% busy answers almost instantly. At 90%, it is far slower. At 99%, it is awful. Latency does not creep up with load: it **explodes** as you approach full.

        The reason is queuing. When a server is nearly always busy, any small clump of requests forms a line that takes ages to clear. A simple queuing model gives a rough rule: time in the system is about **1 / (1 − utilisation)** times the work itself.

        | Busy | Roughly times slower |
        |---|---|
        | 50% | 2× |
        | 90% | 10× |
        | 99% | 100× |

        This is the deeper reason for **headroom**: running at 60% is not waste, it is what keeps latency sane.` },

    { kind: 'steps', title: 'Finding the bottleneck',
      body: 'Never guess where the time goes. Engineers who guess optimise the wrong thing and feel clever about it.',
      steps: [
        { title: 'Measure the whole request', body: 'Record how long requests take at the edge, as percentiles. Is p99 the problem, or p50?' },
        { title: 'Break it into parts', body: 'Use timing, logs or distributed tracing to see how long each stage takes: network, web server, app code, each database call, each external API.' },
        { title: 'Find the biggest slice', body: 'One part usually dominates: say a single slow query is 80% of the time. That is your bottleneck.' },
        { title: 'Fix that one thing', body: 'Add an index, cache the result, batch the calls, move the data closer. Ignore the small slices.' },
        { title: 'Measure again', body: 'Confirm it helped, and see what the next bottleneck is. There is always a next one.' }
      ] },

    { kind: 'concept', title: 'Amdahl’s law in plain English',
      body: `Here is the rule that stops you wasting effort. **If you speed up only part of a job, the whole job can never get faster than the part you left alone.**

        Take a 100 ms request: 20 ms of your code and 80 ms waiting for the database. Make your code **ten times faster**: it now takes 2 ms. The request takes 2 + 80 = **82 ms**, a gain of just 18 ms. Even if your code took *zero* time, the request would still take 80 ms.

        The same holds for adding servers. If **10%** of a job is strictly one-at-a-time, no number of servers can speed it up by more than **10×**. Always ask: **what fraction of the time is this thing I am about to improve?**`,
      note: 'Named after the computer scientist Gene Amdahl. The formula can wait; the habit of asking "how big a slice is this?" is the part that pays.' },

    { kind: 'tip', title: 'Habits that pay off',
      body: `- **Quote percentiles, not averages.** "p95 is 400 ms" tells you something real.
        - **Know your budget.** If a page must feel instant, decide how many milliseconds each stage may spend.
        - **Cut calls before speeding calls.** The fastest network trip is the one you do not make.
        - **Watch p99 after every release.** Tails often move first.
        - **Keep headroom.** It is the cheapest latency improvement there is.

        In the lab that follows, you will put the famous latency numbers in order and see them scaled to human time.` }
  ],

  activities: [
    { type: 'order', after: 2, prompt: 'Order these from fastest to slowest.',
      items: ['Reading a value from RAM', 'Reading from an SSD', 'A round trip inside one data centre', 'A spinning-disk seek', 'A round trip across the world'],
      explain: 'Memory (about 100 ns) beats SSD (about 100 µs), which beats a data-centre round trip (about 0.5 ms), a disk seek (about 10 ms) and a worldwide round trip (about 150 ms). Each step is a big jump, which is why avoiding slower layers is so valuable.' },

    { type: 'mcq', after: 4, q: 'A service reports an average latency of 290 ms, but its p50 is 100 ms and its p99 is 2,000 ms. What does that tell you?',
      options: ['Most users are fast, but a slow tail drags the average up and some users wait much longer', 'Every user waits about 290 ms', 'The service is slower than 2 seconds for half of all users', 'The p99 must be a measuring error'],
      answer: 0,
      why: [null, 'The average hides the spread. Nobody experiences 290 ms in this picture.', 'p50 is 100 ms, so half of users are at or below that.', 'A slow tail like this is real and common.'],
      explain: 'The median shows the typical user is fine, and p99 shows the unlucky ones wait twenty times longer. The average blurs both, which is why percentiles are the honest summary.' },

    { type: 'estimate', after: 5, q: 'A page makes 20 independent backend calls, and each one is slow 1% of the time. Roughly what percentage of page loads include at least one slow call?',
      answer: 18, unit: '% of page loads', min: 1, max: 100, tolerance: 1.5,
      explain: 'The chance all 20 are fast is 0.99²⁰, about 0.82. So about **18%** of page loads meet a slow call. That is why tail latency matters so much when a request fans out across many calls.' },

    { type: 'tf', statement: 'Adding more servers behind a load balancer makes each individual request finish faster.', answer: false,
      explain: 'More servers raise **throughput** (how many requests you can handle). A single request takes the same time unless the old server was overloaded and queuing.' },

    { type: 'match', prompt: 'Match each term to its meaning.',
      pairs: [['Latency', 'How long one request takes'], ['Throughput', 'How many requests complete per second'], ['p99', '99% of requests are faster than this'], ['Bottleneck', 'The slowest slice that limits the whole'], ['Tail latency', 'The slow requests at the top of the distribution']] },

    { type: 'mcq', after: 8, q: 'A request takes 100 ms: 20 ms in your code and 80 ms waiting for the database. You make your code ten times faster. About how long does the request take now?',
      options: ['About 82 ms', 'About 10 ms', 'About 20 ms', 'About 18 ms'],
      answer: 0,
      why: [null, 'That would need the database wait to shrink tenfold too.', 'You have removed 18 ms from the 100, not 80.', '18 ms is how much you **saved**, not how long it takes.'],
      explain: 'Your code now takes 2 ms, but the 80 ms of database waiting is untouched: 2 + 80 = **82 ms**. This is Amdahl’s law: the part you did not improve sets the floor.' },

    { type: 'bucket', prompt: 'Does this mainly improve latency or throughput?', buckets: ['Latency (one request is faster)', 'Throughput (more requests handled)'],
      items: [['Add an index so a slow query returns quicker', 0], ['Serve a repeated answer from a cache in memory', 0], ['Place servers nearer to the users', 0], ['Add three more app servers behind a load balancer', 1], ['Process requests in parallel on more CPU cores', 1], ['Group many small writes into one batch', 1]],
      explain: 'Doing less work per request, or doing it nearer, shortens the journey. Adding lanes, parallelism and batching lets more requests through, without necessarily making each faster.' },

    { type: 'scenario', title: 'The slow checkout', intro: 'Customers complain the checkout is slow. Your dashboard shows an average response time of 450 ms, which looks acceptable. Support insists that some people are waiting many seconds.',
      meters: { 'diagnosis': 20, 'wasted effort': 0 },
      steps: [
        { text: 'The average looks fine but people complain. What do you look at first?',
          choices: [
            { label: 'Percentiles: especially p95 and p99', score: 2, effects: { 'diagnosis': 25 }, feedback: 'The average hides the slow tail. p99 shows 6 seconds, which explains the complaints and tells you the problem is real.' },
            { label: 'Only the average, because it summarises everything', score: 0, effects: { 'wasted effort': 15 }, feedback: 'The average blends fast and slow requests into a number no user has felt. It is the metric most likely to hide this problem.' },
            { label: 'Server uptime', score: 1, effects: { 'diagnosis': 5, 'wasted effort': 5 }, feedback: 'The site is up. The question is how slow the slowest requests are.' }
          ] },
        { text: 'A trace of a slow checkout shows: 30 ms in your code, 40 ms in the web layer, and 5,400 ms in a single query on the orders table. Where do you work?',
          choices: [
            { label: 'On the slow query: add an index or fix it, since it is nearly all the time', score: 2, effects: { 'diagnosis': 30 }, feedback: 'It is the dominant slice, so fixing it is the only change that can matter much. Amdahl’s law in action.' },
            { label: 'Rewrite the code in a faster language', score: 0, effects: { 'wasted effort': 40 }, feedback: 'Your code takes 30 ms out of 5,470. Even making it instant would be invisible.' },
            { label: 'Add more app servers', score: 0, effects: { 'wasted effort': 25 }, feedback: 'More servers raise throughput, not the speed of one request stuck on a slow query, and may send the database more load.' }
          ] },
        { text: 'After the fix, p99 drops to 600 ms. What is the right next step?',
          choices: [
            { label: 'Measure again to see the new biggest slice, and watch p99 after each release', score: 2, effects: { 'diagnosis': 20 }, feedback: 'There is always a next bottleneck, and tails often move first when something regresses.' },
            { label: 'Declare victory and stop measuring', score: 0, effects: { 'diagnosis': -10 }, feedback: 'Performance drifts. Without measurement you will not notice the next slowdown until customers do.' },
            { label: 'Optimise the 30 ms of code, because it is next', score: 1, effects: { 'wasted effort': 10 }, feedback: 'Check the numbers first: a small slice is rarely the next best use of time.' }
          ] }
      ],
      outro: 'The pattern: **measure with percentiles, find the biggest slice, fix that, then measure again.**' },

    { type: 'explain', prompt: 'Explain latency versus throughput, why percentiles beat averages, and what Amdahl’s law tells you about where to spend effort.',
      model: 'Latency is how long one request takes; throughput is how many requests are completed per second. Adding servers raises throughput but does not speed up a single request. Averages hide the slow tail, so p50, p95 and p99 describe what users really experience. Amdahl’s law says that speeding up one part cannot make the whole faster than the parts you left alone, so you should measure, find the biggest slice of the time, and fix that rather than something small.',
      keywords: ['latency', 'throughput', 'percentile', 'p99', 'average', 'bottleneck', 'Amdahl', 'biggest'] }
  ],

  flashcards: [
    { q: 'Latency vs throughput?', a: 'Latency is how long one request takes. Throughput is how many requests complete per second.' },
    { q: 'Roughly order: RAM read, SSD read, data-centre round trip, disk seek, world round trip.', a: 'About 100 ns, 100 µs, 0.5 ms, 10 ms and 150 ms. Each step up is a big jump (rough figures).' },
    { q: 'What do p50, p95 and p99 mean?', a: 'The time that 50%, 95% or 99% of requests were faster than. p50 is the median; p99 shows the slow tail.' },
    { q: 'Why do averages mislead?', a: 'They blend fast and slow requests into a figure nobody experienced, hiding a long tail.' },
    { q: 'What is Amdahl’s law in plain English?', a: 'Speeding up part of a job cannot make the whole faster than the part you left alone, so improve the biggest slice.' }
  ],

  glossary: [
    { term: 'Latency', def: 'The time one request takes from being sent to getting its answer.', like: 'How long one car takes to drive the motorway.' },
    { term: 'Throughput', def: 'How much work a system completes per unit of time, such as requests per second.', like: 'Cars per hour passing a point.' },
    { term: 'Percentile', def: 'A value below which a given share of measurements fall. p99 is the time 99% of requests beat.', like: 'Being faster than 99 out of 100 runners.', aka: ['p50', 'p95', 'p99'] },
    { term: 'Tail latency', def: 'The slowest few percent of requests, which hurt real users and are hidden by averages.', like: 'The unlucky few who get stuck behind a slow lorry.' },
    { term: 'Bottleneck', def: 'The slowest stage in a process, which limits the performance of the whole.', like: 'The single narrow bridge on an otherwise wide road.' },
    { term: 'Amdahl’s law', def: 'The rule that the overall speed-up from improving one part is limited by the fraction of time that part represents.', like: 'Speeding up the toast does little if the kettle takes twenty minutes.' }
  ],

  takeaways: [
    '**Latency** is one request’s time; **throughput** is requests per second. More servers raise only the second.',
    'Learn the **rough gaps**: RAM ≈ 100 ns, SSD ≈ 100 µs, same-data-centre trip ≈ 0.5 ms, disk seek ≈ 10 ms, world trip ≈ 150 ms.',
    'Quote **percentiles**; the slow **tail** gets amplified when a page makes many calls.',
    '**Measure, find the biggest slice, fix it** (Amdahl’s law), and remember busy servers slow down sharply.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('servers-scaling', {
  title: 'The Many-Headed Load',
  intro: 'A great beast of traffic is queuing at your front door, and it grows two heads for every server you cut. Win by choosing the right door, sharing the load, doing the sums and finding the one slow thing.',
  questions: [
    { type: 'mcq', q: 'A browser asks for `/images/logo.png`, a plain file on disk, in a typical web server plus application server set-up. What happens?',
      options: ['The web server reads the file and replies itself', 'The request is forwarded to the app server to read the file', 'The database is queried for the image', 'The load balancer builds the image'],
      answer: 0,
      why: [null, 'That wastes an app worker on something that needs no code.', 'Static files are normally on disk or in object storage, not rows in the database.', 'A load balancer only chooses a server; it does not produce content.'],
      explain: 'Static files need no logic, so the web server answers them directly and the app servers stay free for dynamic work.' },

    { type: 'tf', statement: 'With TLS termination at the web server, the connection between the browser and the web server is unencrypted.', answer: false,
      explain: 'The encrypted connection runs from the browser to the web server, where it ends. Only the hop behind it, on a trusted internal network, may be plain HTTP.' },

    { type: 'match', prompt: 'Match each web server to what it is best known for.',
      pairs: [['Nginx', 'Event loop, reverse proxy and static files'], ['Apache', 'Loadable modules and `.htaccess`'], ['Caddy', 'Automatic HTTPS with a tiny config'], ['IIS', 'Windows and .NET environments']] },

    { type: 'multi', q: 'Which of these would you need to change before running your app on several servers?',
      options: ['Sessions stored in each server’s memory', 'Uploads saved to a local `./uploads` folder', 'A scheduled job that runs at start-up on every server', 'The application’s source code being identical on each server', 'Database credentials read from environment variables'],
      answers: [0, 1, 2],
      explain: 'Per-server state, local files and jobs that run everywhere all create differences between servers. Identical code and configuration read at start-up are what you want.' },

    { type: 'mcq', q: 'Your requests vary a lot: some take 20 ms and some take several seconds. Which balancing rule suits this best?',
      options: ['Least connections', 'Plain round robin', 'Always the first server', 'Hashing on the time of day'],
      answer: 0,
      why: [null, 'Round robin ignores how busy each server is, so one can end up with a pile of slow requests.', 'That would send all load to one machine.', 'Time of day has nothing to do with how busy a server is.'],
      explain: 'Least connections accounts for how many requests each server is handling right now, so servers stuck on slow work receive fewer new ones.' },

    { type: 'spot', prompt: 'A team limits each user to 100 requests a minute, but with four servers users are getting far more. Tap the line responsible.',
      code: { lang: 'js', src: `
        const counts = {};

        app.use((req, res, next) => {
          counts[req.ip] = (counts[req.ip] || 0) + 1;
          if (counts[req.ip] > 100) return res.status(429).end();
          next();
        });` },
      lines: [1],
      explain: 'The counter lives in each server’s own memory, so with four servers each keeps its own count and a user can make about 400 requests. The count should live in a shared store.' },

    { type: 'estimate', q: 'A site has 5 million daily active users, each making about 12 requests a day. Roughly how many requests per second is that on average?',
      answer: 700, unit: 'requests per second', min: 10, max: 100000, tolerance: 1.5,
      explain: '5,000,000 × 12 = 60,000,000 requests per day. Divide by about 100,000 seconds (86,400 exactly): **roughly 600 to 700** per second.' },

    { type: 'estimate', q: 'Peak traffic is 3,000 requests per second. One server handles 300 RPS flat out, and you plan to run them at 60% at peak. Roughly how many servers before adding a spare?',
      answer: 17, unit: 'servers', min: 1, max: 500, tolerance: 1.3,
      explain: 'Per server planned load is 300 × 0.6 = 180 RPS. Then 3,000 / 180 ≈ 16.7, so about **17** servers, and one more as a spare.' },

    { type: 'order', prompt: 'Put this autoscaling event in order.',
      items: ['Traffic rises and average CPU climbs', 'The autoscaler sees the high reading last for a few minutes', 'It launches additional servers', 'The new servers boot, start the app and warm up', 'They pass health checks and the load balancer sends them traffic'],
      explain: 'Detection, launch, boot and health checks all take time before relief arrives, so you need headroom or scheduled scaling for fast spikes.' },

    { type: 'short', q: 'Which percentile means "99% of requests were faster than this time"? (Write it like p50.)', accept: ['p99', '99th', '99th percentile'], hint: 'It starts with p.',
      explain: '**p99**. It describes the slow tail that averages hide and that real users still feel.' },

    { type: 'mcq', q: 'A request takes 100 ms: 20 ms of code and 80 ms of database waiting. Even if your code took no time at all, about how fast could the request be?',
      options: ['80 ms', '20 ms', '0 ms', '50 ms'],
      answer: 0,
      why: [null, '20 ms is the part you would have removed.', 'The database wait is still there.', null],
      explain: 'The untouched 80 ms sets the floor. This is Amdahl’s law: you cannot beat the part you did not improve.' },

    { type: 'bucket', prompt: 'Layer 4 or layer 7 load balancing?', buckets: ['Layer 4', 'Layer 7'],
      items: [['Sees only IP addresses and ports', 0], ['Can route `/api` and `/images` to different pools', 1], ['Works for any TCP protocol, even a database', 0], ['Can read a cookie to apply sticky sessions', 1], ['Very fast because it never reads the HTTP request', 0]],
      explain: 'Layer 4 handles the envelope (address and port) and is protocol-blind. Layer 7 reads the HTTP message itself, which enables path routing, cookies and TLS handling.' }
  ]
});

KS.sheet('servers-scaling', {
  title: 'Web Servers & Scaling Out: cheat sheet',
  sections: [
    { title: 'Web servers',
      md: `The web server is the **front door**: it speaks HTTP, serves **static files**, **reverse-proxies** everything else to **app servers**, and handles **TLS termination, compression and logging**.

        | Server | Known for |
        |---|---|
        | Nginx | Event loop; proxy and static files |
        | Apache | Modules, \`.htaccess\` (has an event mode too) |
        | Caddy | Automatic HTTPS, tiny config |
        | IIS | Windows and .NET |

        Choose by fit and team skills, not benchmarks.` },

    { title: 'Scaling up vs out',
      md: `| | Vertical (up) | Horizontal (out) |
        |---|---|---|
        | What | Bigger machine | More machines |
        | Limit | Biggest machine; steep cost | Coordination |
        | Failure | All or nothing | Partial |

        A **single point of failure** is any component with no backup (the database, the load balancer). Scale up first for simplicity, but **design stateless** so scaling out stays possible.` },

    { title: 'Load balancing',
      md: `- **Round robin**: each in turn. **Weighted**: bigger servers get more.
        - **Least connections**: fewest requests in progress; best for uneven work.
        - **Hashing** (IP or URL): same key, same server.
        - **Health checks**: active (pings) or passive (watching traffic); keep them honest, not fussy.
        - **L4**: IP and port, fast, any protocol. **L7**: reads HTTP; routes by path, host, cookie.
        - **Sticky sessions**: a plaster for server-held state. The balancer itself needs redundancy.` },

    { title: 'Stateless services',
      md: `**State** on a server pins users, loses data in a crash and blocks adding or removing servers.

        | Kind | Home |
        |---|---|
        | Sessions | Shared store (Redis) or signed token |
        | Business data | Database |
        | Uploads | Object storage |
        | Scratch work | Local is fine |

        **Shared-nothing**: servers share only through external services. Make handlers **idempotent** (idempotency keys). Watch for hidden state: per-server caches, counters and jobs.` },

    { title: 'Capacity sums',
      md: `- A day is about **86,400 s ≈ 10⁵ s**.
        - **RPS = daily requests / 10⁵.** Example: 1M users × 20 requests = 20M/day ≈ 200 RPS.
        - Plan for the **peak** (average × 2 to 5).
        - **Concurrency = RPS × seconds per request.**
        - **Servers = peak RPS / (capacity per server × 0.5 to 0.7), plus one spare (N+1).**
        - Check the database and other layers too.
        - Autoscaling signals: CPU, requests per server, queue length, latency. It **lags by minutes**.` },

    { title: 'Latency and percentiles',
      md: `| Operation | Roughly (approximate) |
        |---|---|
        | RAM read | 100 ns |
        | SSD read | 100 µs |
        | Same data-centre round trip | 0.5 ms |
        | Disk seek | 10 ms |
        | Round trip across the world | 150 ms |

        **Latency** = one request's time; **throughput** = requests per second. Quote **p50, p95, p99**, not averages. A page with 20 calls hits a 1%-slow call about **18%** of the time.` },

    { title: 'Finding the bottleneck',
      md: `1. **Measure** end to end, as percentiles.
        2. **Break it down** with timing, logs or tracing.
        3. **Find the biggest slice.**
        4. **Fix that**, not the small stuff.
        5. **Measure again.**

        **Amdahl's law**: speeding up part of a job cannot beat the part you left alone. A 100 ms request with 80 ms of database wait cannot drop below 80 ms by tuning code.

        A busy server slows sharply: roughly 2× at 50% busy, 10× at 90%, 100× at 99% in a simple model. Keep **headroom**.` }
  ]
});
