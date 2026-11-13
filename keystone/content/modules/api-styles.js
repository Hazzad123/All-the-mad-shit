/* Module: api-styles — Beyond REST.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs api-styles */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('api-soap', {
  eli5: 'SOAP is an older, very formal way for programs to talk: every message goes in a standard envelope, and a strict contract file spells out every operation, which big organisations still value.',

  cards: [
    { kind: 'concept', title: 'Before REST was the default',
      body: `Picture a bank in the early 2000s, linking its loans system to a credit-check company's system. Two giant organisations, different languages, different teams, lawyers in the middle. Nobody is going to say "just send some JSON and we will work it out".

        They need something **formal**: a precise written contract, a standard message layout, built-in security rules, and tools that check everything.

        That is **SOAP** (originally "Simple Object Access Protocol", though it is no longer expanded). It sends **XML** messages, usually over HTTP, and it was the mainstream way to build web services before REST took over the public web.` },

    { kind: 'metaphor', title: 'Registered post with a customs form',
      body: `Sending a parcel abroad properly means a **standard envelope**, a **declaration form** with fixed boxes, a signature on delivery, and rules about what may go inside.

        - The **envelope** has an address section (the header) and the contents (the body).
        - The **form** has boxes you must fill in exactly, or customs rejects it.
        - **Registered delivery** guarantees you know it arrived.

        SOAP is the registered-post way of calling an API: heavy on paperwork, but everyone knows exactly what is allowed and what happens when something goes wrong. A REST call is more like handing over a note at the door.` },

    { kind: 'code', title: 'A SOAP message: the envelope',
      body: 'Every SOAP message has the same outer shape. This one asks a bank for an account balance. **Tap the highlighted lines.**',
      code: { lang: 'html', src: `
        <soap:Envelope xmlns:soap="http://www.w3.org/2003/05/soap-envelope">
          <soap:Header>
            <Token>abc123</Token>
          </soap:Header>
          <soap:Body>
            <GetBalance>
              <AccountId>12345678</AccountId>
            </GetBalance>
          </soap:Body>
        </soap:Envelope>`,
        notes: {
          1: 'The **Envelope** wraps everything. The attribute names the exact version of the SOAP standard in use.',
          2: 'The **Header** carries information *about* the message: credentials, transaction details, routing. Extensions plug in here.',
          5: 'The **Body** holds the actual request.',
          6: 'The **operation** is named in the body, like a function call. Typically every call goes to one URL as a `POST`: unlike REST, the address does not name the thing.'
        } } },

    { kind: 'code', title: 'WSDL: the contract in a file',
      body: `The strict contract is a file called a **WSDL** (Web Services Description Language, said "wizz-dull"). It lists every operation, what it takes and returns, and where the service lives. Shortened here. **Tap the highlighted lines.**`,
      code: { lang: 'html', src: `
        <definitions name="BankService">
          <types> ...XML Schema: what a GetBalance message contains... </types>
          <portType name="BankPort">
            <operation name="GetBalance">
              <input message="GetBalanceRequest"/>
              <output message="GetBalanceResponse"/>
            </operation>
          </portType>
          <service name="BankService"> ...the URL to call... </service>
        </definitions>`,
        notes: {
          2: 'The **types** are described with a schema. Every field has an exact type, so a bad message is rejected before any code runs.',
          4: 'Each **operation** is listed with its input and output, like a function signature.',
          10: 'And where to find the service. (Real files add a *binding* section describing the protocol details.)'
        } },
      note: 'WSDL plays the role that an OpenAPI file plays for REST, except that SOAP has always required it.' },

    { kind: 'sequence', title: 'From contract to working call',
      body: 'The WSDL is not just documentation. Tools read it and write code for you.',
      actors: ['Developer', 'Code generator', 'SOAP service'],
      steps: [
        { from: 0, to: 2, label: 'fetch the WSDL', note: 'The developer downloads the contract from the provider.' },
        { from: 0, to: 1, label: 'feed it the WSDL', note: 'A tool reads the contract.' },
        { from: 1, to: 0, label: 'client code with getBalance()', dashed: true, note: 'It generates **real classes and methods** in Java, C# or whichever language you use.' },
        { at: 0, label: 'client.getBalance("1234")', note: 'To the developer, the remote call is an ordinary function call.' },
        { from: 0, to: 2, label: 'POST <Envelope>…', note: 'Behind the scenes, the generated code builds and sends the XML envelope.' },
        { from: 2, to: 0, label: '<Envelope> balance', dashed: true, note: 'And turns the reply back into a typed value. No hand-written parsing anywhere.' }
      ] },

    { kind: 'layers', title: 'The WS-* family',
      body: 'SOAP\'s header is a plug-in socket. Over the years, standards bodies defined a family of add-ons that all start with **WS-**. A few of them:',
      layers: [
        { label: 'WS-AtomicTransaction', note: 'Several services commit together or not at all.', tone: 'info', icon: '⚛️' },
        { label: 'WS-ReliableMessaging', note: 'Guaranteed delivery, in order, even over flaky links.', tone: 'info', icon: '📮' },
        { label: 'WS-Security', note: 'Signing and encrypting parts of a message, and attaching identity tokens.', tone: 'warn', icon: '🔐' },
        { label: 'WS-Addressing', note: 'Says where a reply should go and how messages relate.', tone: 'muted', icon: '🏷️' },
        { label: 'SOAP envelope', note: 'The common message format all of the above build on.', tone: 'accent', icon: '✉️' },
        { label: 'HTTP (or another transport)', note: 'The carrier. SOAP can also travel over queues and other protocols.', tone: 'muted', icon: '🚚' }
      ] },

    { kind: 'compare', title: 'SOAP vs REST',
      body: 'Neither is "right". They were built for different worlds.',
      cols: ['SOAP', 'REST'],
      rows: [
        ['Message format', 'XML only, in an envelope', 'Usually JSON, but any format'],
        ['Contract', 'WSDL, required and strict', 'Optional (OpenAPI)'],
        ['Addresses', 'Often one URL; the operation is in the body', 'One URL per resource'],
        ['Built-in extras', 'Security, transactions, reliability (WS-*)', 'Use HTTP, plus whatever you add'],
        ['Weight', 'Heavy: verbose messages and tooling', 'Light and easy to try by hand'],
        ['Caching', 'Hard: nearly everything is a POST', 'Natural: GET responses are cacheable'],
        ['Home turf', 'Enterprise and regulated systems', 'The public web and mobile apps']
      ] },

    { kind: 'realworld', title: 'Why enterprises still run it',
      body: `If SOAP is so heavy, why does it live on? Banks, insurers, telecoms, governments and big software suites (ERPs, covered later) built thousands of integrations on it. Reasons it persists:

        - **It works** and has done for twenty years, often with audits and certifications attached.
        - **Strict contracts** suit regulated industries where a vague message is a compliance problem.
        - **WS-Security** and friends are built in, and some partners still require them.
        - **Rewriting** a stable integration is risky, costly and rarely a priority. "If it ain't broke" wins.

        New public APIs almost never start as SOAP today. But you will very probably meet one at work, so it pays to recognise an envelope when you see one.` },

    { kind: 'pitfall', title: 'The things people dislike about it',
      body: `The same properties that make SOAP safe make it awkward:

        - **Verbose.** A short question becomes a screenful of XML. More bytes, more parsing.
        - **Everything is a POST to one URL.** Browser caches, proxies and the plain-HTTP tricks you learnt in the REST lessons do not help.
        - **Tooling-dependent.** Hand-writing a request is painful; you really want the generated client.
        - **Fragile across vendors.** Different toolkits sometimes interpret the WS-* standards slightly differently.
        - **Errors** arrive as a structured *fault* in the body, not as the neat status codes of REST.

        None of that is fatal. It just explains why developers building new things chose something lighter.` }
  ],

  activities: [
    { type: 'match', after: 3, prompt: 'Match each SOAP term to what it is.',
      pairs: [['Envelope', 'The outer wrapper of every SOAP message'], ['Header', 'Information about the message, such as credentials'], ['Body', 'The actual request or response content'], ['WSDL', 'The strict contract file listing every operation'], ['WS-Security', 'A standard for signing and encrypting SOAP messages']] },

    { type: 'tf', after: 4, statement: 'With a WSDL file, a developer can usually generate client code and call a SOAP service like an ordinary function.', answer: true,
      explain: 'The WSDL is machine-readable, so tools build typed methods from it. The generated code creates and parses the XML envelopes so the developer never has to.' },

    { type: 'bucket', prompt: 'Does this describe SOAP or REST?', buckets: ['SOAP', 'REST'],
      items: [['A WSDL contract is required', 0], ['One URL per resource, such as `/orders/9`', 1], ['Built-in standards for message signing', 0], ['GET responses are easily cached', 1], ['Messages are always XML in an envelope', 0], ['Easy to try with a browser or a one-line command', 1]],
      explain: 'SOAP is formal and standardised (contracts, envelopes, WS-*). REST leans on plain HTTP: addresses, methods and caching, and keeps everything else optional.' },

    { type: 'order', prompt: 'Put the steps of using a SOAP service in order.',
      items: ['Download the provider\'s WSDL', 'Run a tool that generates client code from it', 'Call a generated method such as `getBalance()`', 'The generated code sends an XML envelope', 'The reply is turned back into a typed result'],
      explain: 'The contract comes first because everything else is generated from it. After that, a normal-looking function call becomes an envelope on the wire.' },

    { type: 'short', q: 'What is the name of the file that describes a SOAP service\'s operations, inputs and outputs?', accept: ['WSDL', 'a WSDL', 'WSDL file'], hint: 'Four letters: Web Services Description Language.',
      explain: 'The **WSDL** is the formal contract. It is the SOAP world\'s counterpart to an OpenAPI file, though SOAP has always required it.' },

    { type: 'mcq', q: 'A bank must connect to a partner that requires signed, encrypted messages and a strict contract, and the integration already works. What is the most sensible choice?',
      options: ['Keep using SOAP: it provides what is required and a rewrite adds risk for little gain', 'Rewrite it in REST immediately, since REST is newer', 'Remove the contract so that changes are easier', 'Switch to sending plain text files by email'],
      answer: 0,
      why: [null, 'Newer is not a business reason. A working, compliant integration is valuable.', 'The contract is exactly what the partner requires.', 'That drops security and structure, going backwards.'],
      explain: 'Engineering choices serve needs. If the requirements are formal and the system is stable, SOAP is a defensible answer. Rewrites should have a reason beyond fashion.' },

    { type: 'scenario', title: 'The legacy partner', intro: 'Your company, a small online insurer, has to pull policy data from a large partner. Their only API is SOAP, and their documentation is a WSDL file and nothing else.',
      meters: { 'delivery speed': 50, 'code quality': 50 },
      steps: [
        { text: 'You have never used SOAP. Where do you start?',
          choices: [
            { label: 'Feed the WSDL to a code generator for your language and call the generated methods', score: 2, effects: { 'delivery speed': 25, 'code quality': 15 }, feedback: 'This is what the contract is for. The generated code handles envelopes and types, leaving you with ordinary-looking calls.' },
            { label: 'Hand-write the XML envelopes and parse the replies yourself', score: 0, effects: { 'delivery speed': -25, 'code quality': -15 }, feedback: 'Possible, but painful and error-prone: namespaces, types and faults are exactly what generators handle.' },
            { label: 'Ask the partner to rebuild their API as REST', score: 1, effects: { 'delivery speed': -15 }, feedback: 'Reasonable to ask, but a large partner is unlikely to change a working system for one customer.' }
          ] },
        { text: 'The rest of your system uses JSON and REST. How do you stop SOAP leaking through your code?',
          choices: [
            { label: 'Wrap the SOAP client in one small adapter that returns your own plain objects', score: 2, effects: { 'code quality': 25, 'delivery speed': -5 }, feedback: 'An adapter keeps XML-shaped quirks in one place. If the partner changes style later, only the adapter changes.' },
            { label: 'Let generated SOAP types spread through all your code', score: 0, effects: { 'code quality': -25, 'delivery speed': 10 }, feedback: 'Quick today, but now every file depends on the partner\'s data model.' },
            { label: 'Convert every internal API to SOAP to be consistent', score: 0, effects: { 'code quality': -15, 'delivery speed': -20 }, feedback: 'Consistency is not worth dragging the whole system to match one partner.' }
          ] }
      ],
      outro: 'The pattern to remember: **let the contract generate the plumbing, then fence the old style in behind an adapter.**' },

    { type: 'explain', prompt: 'A junior developer asks why anyone still uses SOAP when REST exists. Give them a fair answer.',
      model: 'SOAP offers a strict contract (WSDL), a standard message format and built-in standards for security, reliability and transactions, which suit big regulated organisations. Many such systems already run on it and work, so rewriting them is costly and risky. REST is lighter and better for public and mobile APIs, but it does not make a working SOAP integration worthless.',
      keywords: ['contract', 'WSDL', 'security', 'enterprise', 'existing', 'rewrite', 'lighter'] }
  ],

  flashcards: [
    { q: 'What is a SOAP message made of?', a: 'An XML envelope containing an optional header (information about the message) and a body (the actual request or response).' },
    { q: 'What is a WSDL?', a: 'A machine-readable XML contract listing a SOAP service\'s operations, message types and location, from which client code can be generated.' },
    { q: 'What are the WS-* standards?', a: 'Add-on standards for SOAP, such as WS-Security, WS-ReliableMessaging and WS-AtomicTransaction.' },
    { q: 'SOAP vs REST in one line each?', a: 'SOAP: formal, XML, strict contract, built-in enterprise features, heavy. REST: lightweight, resource addresses, plain HTTP, usually JSON.' },
    { q: 'Why do enterprises still run SOAP?', a: 'It works, suits regulated industries with strict contracts and built-in security, and rewriting stable integrations is risky.' }
  ],

  glossary: [
    { term: 'SOAP', def: 'A protocol for web services that sends XML messages in a standard envelope, usually over HTTP.', like: 'Registered post with a customs form.' },
    { term: 'XML', def: 'A text format that marks up data with opening and closing tags, such as `<AccountId>1234</AccountId>`.', like: 'A form where every box has a label on both sides.' },
    { term: 'SOAP envelope', def: 'The outer wrapper of a SOAP message, holding a header and a body.', like: 'The envelope around a formal letter.' },
    { term: 'WSDL', def: 'Web Services Description Language: an XML file describing exactly what a SOAP service offers, so tools can generate client code.', like: 'A very precise menu with every field specified.' },
    { term: 'WS-*', def: 'A family of standards (WS-Security, WS-ReliableMessaging and others) that extend SOAP.', aka: ['WS-Star'], like: 'Optional extra services you can add to the postage.' }
  ],

  takeaways: [
    'SOAP wraps every message in an **XML envelope** and describes the service in a strict **WSDL** contract.',
    'Tools turn the WSDL into **generated client code**, so remote calls look like local functions.',
    '**WS-*** adds security, reliability and transactions, which is why regulated enterprises keep it.',
    'It is heavy next to REST, and rarely chosen for new public APIs, but you will meet it at work.'
  ],

  links: [
    { label: 'W3C: SOAP Version 1.2 Part 0 (Primer)', url: 'https://www.w3.org/TR/soap12-part0/' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('api-grpc', {
  eli5: 'gRPC lets one program call a function that lives on another machine as if it were a local function, using a compact binary format and a contract file from which the code is generated.',

  cards: [
    { kind: 'concept', title: 'What if calling another server felt like calling a function?',
      body: `In a REST API you build URLs, choose methods, assemble JSON, send it, read the status and parse the reply. That is a lot of ceremony when your own team owns **both ends** and just wants to ask the orders service for order 918.

        What you would love to write is this:

        \`\`\`js
        const order = await orders.getOrder({ id: 918 });
        \`\`\`

        That is the idea behind a **Remote Procedure Call (RPC)**: a call that *looks* local but runs on another machine. The network stuff is hidden.

        **gRPC** is Google's open-source, modern take on RPC. It is popular for services that talk to each other inside a company.` },

    { kind: 'metaphor', title: 'The internal phone directory',
      body: `In a large office you do not write letters to colleagues. You pick up the phone, dial an extension and say a short, agreed phrase: "Accounts? Run the month-end report."

        There is a **shared directory** listing every department, what each can do and what you must tell them. Everybody uses the same directory, so calls are short and unambiguous.

        gRPC works the same way. The **directory** is a contract file listing each service and its functions. Short calls fly across, in a compact format both sides already understand.

        The metaphor skips one thing: in an office the line almost never drops. Across a network it does, which matters later in this lesson.` },

    { kind: 'code', title: 'The contract: a .proto file',
      body: 'A gRPC service is defined in a **Protocol Buffers** file. It describes the functions and the shapes of their data. **Tap the highlighted lines.**',
      code: { lang: 'proto', src: `
        syntax = "proto3";

        service OrderService {
          rpc GetOrder (GetOrderRequest) returns (Order);
        }

        message GetOrderRequest {
          int64 id = 1;
        }

        message Order {
          int64 id = 1;
          string status = 2;
          int32 total_pence = 3;
        }`,
        notes: {
          3: 'A **service** is a group of callable functions, like a class or an API.',
          4: 'An **rpc** is one function: its name, what goes in, and what comes out.',
          8: 'A **message** defines a data shape. Each field has a type, a name and a **number**.',
          13: 'Those numbers (1, 2, 3) are what actually travel on the wire instead of field names. That is a big part of why the messages are so small.'
        } },
      note: 'Rule: **never reuse or change a field number** once it is in use. Adding new fields with new numbers is safe, and old code simply ignores them. That is how protobuf contracts evolve without breaking callers.' },

    { kind: 'steps', title: 'From .proto file to working call',
      body: 'The contract is not decoration. Code is generated from it, in as many languages as you like.',
      steps: [
        { title: 'Write the .proto file', body: 'Define the service, its functions and the messages. This is the one source of truth, usually kept in a shared repository.' },
        { title: 'Run the generator', body: 'A tool (`protoc` or a plugin) reads the file and writes code for each language you use: Go, Java, Python, C#, JavaScript and more.' },
        { title: 'Implement the server', body: 'In the generated skeleton, fill in what `GetOrder` actually does.' },
        { title: 'Call it from any client', body: 'Each client gets a generated **stub**: an object with a `getOrder` method that hides the networking.' },
        { title: 'Change safely', body: 'Edit the contract, regenerate, and the compiler points at everything affected. Compatible edits (new fields) keep old clients working.' }
      ] },

    { kind: 'code', title: 'Using the generated client',
      body: 'This is roughly what calling the service looks like. (Simplified: real libraries differ in detail.) **Tap the highlighted line.**',
      code: { lang: 'js', src: `
        const client = new OrderServiceClient('orders:50051');

        const order = await client.getOrder({ id: 918 });
        console.log(order.status);   // "PAID"`,
        notes: {
          3: 'It reads like a local function, yet this travels over the network. The typed request and reply come from the generated code, and no JSON or URL building is in sight.'
        } },
      note: 'A function call over a network is **not** the same as a local one: it can be slow, fail, or time out. Good gRPC clients always set a **deadline** for each call, for the same reasons as the timeout rule in the previous module.' },

    { kind: 'compare', title: 'gRPC vs a typical REST API',
      body: 'Same job, different trade-offs.',
      cols: ['REST + JSON', 'gRPC + Protobuf'],
      rows: [
        ['Message format', 'Text (JSON)', 'Compact binary'],
        ['Contract', 'Optional (OpenAPI)', 'Required (.proto), code generated from it'],
        ['Shape of the call', 'Resource + method', 'Named function'],
        ['Runs over', 'HTTP/1.1 or HTTP/2', 'HTTP/2 only'],
        ['Streaming', 'Awkward', 'Built in, four modes'],
        ['Debugging by hand', 'Easy: read it in a terminal or browser', 'Harder: binary needs tools'],
        ['Browser support', 'Native', 'Needs a bridge (gRPC-Web)']
      ] },

    { kind: 'compare', title: 'Four kinds of call: HTTP/2 streaming',
      body: 'gRPC runs on **HTTP/2**, which can carry many independent streams of messages over one connection (you met multiplexing in the HTTP module). That lets a call be more than one request and one reply.',
      cols: ['Client sends', 'Server sends'],
      rows: [
        ['**Unary**: ordinary call, such as `GetOrder`', 'One message', 'One message'],
        ['**Server streaming**: a live price feed', 'One message', 'Many, over time'],
        ['**Client streaming**: uploading sensor readings', 'Many, over time', 'One message at the end'],
        ['**Bidirectional**: a chat or collaboration session', 'Many, over time', 'Many, over time']
      ],
      note: 'In bidirectional mode both sides can talk at once, in any order. The two streams are independent.' },

    { kind: 'sequence', title: 'Server streaming in action',
      body: 'A dashboard asks for live order updates once, then keeps receiving them.',
      actors: ['Dashboard', 'Orders service'],
      steps: [
        { from: 0, to: 1, label: 'WatchOrders(shop=12)', note: 'One request opens the stream.' },
        { from: 1, to: 0, label: 'order 918 placed', dashed: true, note: 'The server sends a message as soon as something happens.' },
        { from: 1, to: 0, label: 'order 919 placed', dashed: true, note: 'And another. No new request, no polling.' },
        { from: 1, to: 0, label: 'order 918 paid', dashed: true, note: 'The same stream carries updates for as long as it stays open.' },
        { from: 0, to: 1, label: 'cancel', note: 'The client can end the stream whenever it likes.' },
        { note: 'Compare with REST, where this would mean polling or a separate technique entirely. The real-time module covers those options.' }
      ] },

    { kind: 'realworld', title: 'Where gRPC shines, and where it does not',
      body: `**Shines: service-to-service traffic.** Hundreds of internal calls per user request add up, so smaller messages and generated, typed code pay off. A company with services in several languages gets one contract that all of them share. Streaming is built in.

        **Struggles in the browser.** A browser's built-in web tools do not give the control gRPC needs over HTTP/2. The usual answer is **gRPC-Web**, a slightly cut-down version, plus a proxy that translates. It works, with limits (some streaming modes are restricted).

        **Struggles with outsiders.** Partners may expect plain HTTP and JSON, and cannot test a binary API from a browser address bar.

        Common pattern: gRPC *inside* the building, REST or GraphQL at the front door.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'In a .proto file, what do the numbers in `string status = 2;` do?',
      options: ['They identify the field on the wire, replacing its name in each message', 'They limit the length of the string to two characters', 'They give the order in which the server must process fields', 'They are version numbers for the whole service'],
      answer: 0,
      why: [null, 'Numbers are field identifiers, not sizes.', 'Order of processing is not part of the contract.', 'A service version is not tracked this way.'],
      explain: 'Field numbers are the real identity of each field in the binary message. That keeps messages small, and it is why numbers must never be reused or changed.' },

    { type: 'spot', after: 2, prompt: 'This message definition has a mistake that would corrupt data. Tap the offending line.',
      code: { lang: 'proto', src: `
        message User {
          int64 id = 1;
          string name = 2;
          string email = 2;
        }` },
      lines: [4],
      explain: 'Two fields share the number 2. On the wire the numbers are the identity, so the receiver could not tell name from email. (The compiler normally rejects it. The same disaster happens silently if you *reuse* a retired number.)' },

    { type: 'match', after: 6, prompt: 'Match each gRPC call type to an example.',
      pairs: [['Unary', 'Fetch one order by ID'], ['Server streaming', 'A live feed of price updates'], ['Client streaming', 'Uploading a long series of sensor readings'], ['Bidirectional streaming', 'A chat session where both sides send freely']] },

    { type: 'tf', statement: 'A gRPC call across a network is as reliable as an ordinary function call, so deadlines are unnecessary.', answer: false,
      explain: 'The call looks local, but it crosses a network: it can be slow, fail or never answer. Setting a deadline on every call is just as important as setting a timeout for REST.' },

    { type: 'bucket', prompt: 'Would gRPC or a REST/JSON API be the more natural fit?', buckets: ['gRPC', 'REST + JSON'],
      items: [['Hundreds of calls between your own back-end services per request', 0], ['A public API for third-party developers', 1], ['A live telemetry stream from devices to a server', 0], ['An API you want to explore by typing a URL in a browser', 1], ['Services in four languages sharing one strict contract', 0], ['A website\'s JavaScript calling your server directly', 1]],
      explain: 'gRPC shines inside your own system: efficient, typed, streaming. REST and JSON are friendlier to outsiders and browsers, which can call them with no special bridge.' },

    { type: 'short', q: 'Which version of HTTP does gRPC run on?', accept: ['HTTP/2', 'HTTP2', 'HTTP 2', '2'], hint: 'It supports many streams over one connection.',
      explain: 'gRPC is built on **HTTP/2**, whose multiplexed streams make its four calling modes possible.' },

    { type: 'scenario', title: 'Slow checkout', intro: 'Your checkout page calls eleven internal services per order, all over REST and JSON, and the platform team says the call overhead is a real cost. Mobile and web teams call the same services too.',
      meters: { 'latency': 40, 'team friction': 60 },
      steps: [
        { text: 'The eleven internal calls between back-end services are slow. What do you consider?',
          choices: [
            { label: 'Move the internal service-to-service calls to gRPC with a shared .proto contract', score: 2, effects: { latency: 30, 'team friction': -5 }, feedback: 'Compact binary messages, generated typed clients and HTTP/2 suit exactly this kind of traffic. The contract also prevents arguments about field names.' },
            { label: 'Add more servers and change nothing else', score: 1, effects: { latency: 5, 'team friction': 0 }, feedback: 'More capacity helps throughput but does not reduce per-call overhead or the number of hops.' },
            { label: 'Replace everything with SOAP for stricter contracts', score: 0, effects: { latency: -25, 'team friction': 10 }, feedback: 'Strict, yes, but heavier XML would make the overhead worse.' }
          ] },
        { text: 'The website\'s JavaScript also needs this data. What do you do about browsers?',
          choices: [
            { label: 'Keep a REST (or GraphQL) front door for the browser; use gRPC only behind it', score: 2, effects: { latency: 10, 'team friction': 20 }, feedback: 'Browsers speak HTTP and JSON natively. A front door that translates keeps the internal gain without browser limits.' },
            { label: 'Make browsers call gRPC directly, no matter what', score: 1, effects: { latency: 0, 'team friction': -15 }, feedback: 'Possible with gRPC-Web and a proxy, but you take on restrictions and extra moving parts without much gain.' },
            { label: 'Force every browser to install a plugin', score: 0, effects: { 'team friction': -30 }, feedback: 'Nobody will install it, and this is the opposite of a good developer experience.' }
          ] },
        { text: 'Six months later you need to add a `currency` field to the Order message. What is the safe way?',
          choices: [
            { label: 'Add `string currency = 4;` using a brand-new field number', score: 2, effects: { 'team friction': 15 }, feedback: 'New numbers are ignored by old clients and understood by new ones. That is how contracts evolve safely.' },
            { label: 'Reuse field number 3 since `total_pence` is not used much', score: 0, effects: { 'team friction': -30 }, feedback: 'Old clients would decode the new data as if it were the old field, silently producing wrong values.' },
            { label: 'Renumber all fields so they stay tidy', score: 0, effects: { 'team friction': -30 }, feedback: 'Numbers are the wire identity. Renumbering breaks every existing caller at once.' }
          ] }
      ],
      outro: 'The pattern to remember: **gRPC inside, friendly formats outside, and never touch an existing field number.**' },

    { type: 'explain', prompt: 'Explain how a .proto file and generated code make gRPC calls feel like local function calls.',
      model: 'The .proto file defines the services, their functions and the message shapes. A generator turns it into code for each language: a client stub with real methods and a server skeleton. So the developer calls client.getOrder() with typed data, and the generated code handles serialising to compact binary, sending over HTTP/2 and decoding the reply.',
      keywords: ['proto', 'generated', 'stub', 'binary', 'HTTP/2', 'contract', 'typed'] }
  ],

  flashcards: [
    { q: 'What is an RPC?', a: 'A Remote Procedure Call: calling a function that actually runs on another machine, written as if it were local.' },
    { q: 'What does a .proto file define?', a: 'The services, their rpc functions and the message types, from which code is generated in many languages.' },
    { q: 'What are the four gRPC call types?', a: 'Unary (one request, one reply), server streaming, client streaming and bidirectional streaming.' },
    { q: 'What must you never do to a protobuf field number?', a: 'Reuse or change it once it is in use. Add new fields with new numbers instead.' },
    { q: 'Where does gRPC shine, and where does it struggle?', a: 'Shines for efficient service-to-service calls and streaming. Struggles in browsers (needs gRPC-Web and a proxy) and with outside partners who expect plain HTTP and JSON.' }
  ],

  glossary: [
    { term: 'RPC', def: 'Remote Procedure Call: invoking a function on another machine as if it were a local call.', like: 'Dialling an extension and asking a colleague to run a task.', aka: ['Remote Procedure Call'] },
    { term: 'gRPC', def: 'An open-source RPC framework from Google that uses Protocol Buffers and HTTP/2.', like: 'A fast internal phone network with a shared directory.' },
    { term: 'Protocol Buffers', def: 'A compact binary format whose message shapes are defined in .proto files; used by gRPC.', aka: ['protobuf'], like: 'Shorthand both sides memorised in advance.' },
    { term: 'Stub', def: 'Generated client code whose methods look local but make the remote call underneath.', like: 'The receptionist who forwards your call.' },
    { term: 'Streaming (gRPC)', def: 'A call in which one or both sides send many messages over time on a single HTTP/2 stream.', like: 'A phone call, as opposed to a single text message.' },
    { term: 'gRPC-Web', def: 'A variant of gRPC that works within browser limits, usually through a translating proxy.', like: 'A phrasebook for a visitor who cannot speak the local language.' }
  ],

  takeaways: [
    'gRPC makes a remote call look like a **local function**, via a **.proto contract** and generated code.',
    'Protobuf messages are **compact binary**; field **numbers** identify fields, so never reuse them.',
    'HTTP/2 gives four modes: **unary, server, client and bidirectional streaming**.',
    'Best **between your own services**; browsers and outsiders usually get REST or GraphQL instead.'
  ],

  links: [
    { label: 'gRPC: Introduction', url: 'https://grpc.io/docs/what-is-grpc/introduction/' },
    { label: 'Protocol Buffers documentation', url: 'https://protobuf.dev/' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('api-graphql', {
  eli5: 'GraphQL gives an API one single address where the caller writes down exactly which fields it wants, and gets back precisely that shape, no more and no less.',

  cards: [
    { kind: 'concept', title: 'One screen, four calls, and too much data',
      body: `A phone app has a profile screen: the user's name, their last two orders, and the total of each. With a REST API, that is likely **three calls**:

        1. \`GET /users/7\`
        2. \`GET /users/7/orders?limit=2\`
        3. (maybe more calls for details)

        And each response is stuffed with fields the screen never shows: addresses, phone numbers, internal flags.

        Two problems with names. **Under-fetching**: one call does not give you enough, so you make more. **Over-fetching**: a call gives you far more than you need, wasting data on a slow mobile connection.

        Facebook hit exactly this on its mobile apps and built **GraphQL** (released publicly in 2015).` },

    { kind: 'metaphor', title: 'A set meal vs a tick-box order form',
      body: `A REST endpoint is like a **set meal**. \`/users/7\` always arrives as the same plate: starter, main and pudding, whether you wanted the pudding or not. If you want a side dish from the other menu, you place a second order.

        GraphQL is a **tick-box order form** for one kitchen. You tick precisely the items you want, from different parts of the menu, and a single tray comes back with exactly those.

        The metaphor stops at one point: the kitchen still has to cook everything you ticked, and a form with every box ticked could be very expensive. That is why servers need limits, which we come to.` },

    { kind: 'compare', title: 'Over-fetching and under-fetching',
      body: 'Same profile screen, two approaches.',
      cols: ['REST (typical)', 'GraphQL'],
      rows: [
        ['Endpoints used', 'Several, one per resource', 'One, e.g. `/graphql`'],
        ['Round trips', '2 or more, one after another', '1'],
        ['Fields returned', 'Everything the endpoint has', 'Only those the query lists'],
        ['Who decides the shape', 'The server', 'The caller'],
        ['Changing what a screen needs', 'New endpoint or extra call', 'Edit the query, no server change']
      ],
      note: 'In the lab that follows, you will tick fields to build a query and compare it with the REST round trips.' },

    { kind: 'code', title: 'The schema: a typed map of the data',
      body: 'A GraphQL server publishes a **schema**: every type, every field and how they connect. It is the contract. **Tap the highlighted lines.**',
      code: { lang: 'graphql', src: `
        type User {
          id: ID!
          name: String!
          orders(last: Int): [Order!]!
        }

        type Order {
          id: ID!
          total: Int!
          items: [String!]!
        }

        type Query {
          user(id: ID!): User
        }`,
        notes: {
          2: 'The `!` means **non-null**: this field will always have a value. Without it, the field may be null.',
          4: 'Fields can take **arguments**. Here, `orders(last: 2)` asks for just the last two. The brackets `[ ]` mean a list.',
          10: 'Fields can be lists of simple values or of other types. The graph is how types link to each other.',
          13: '`Query` lists the **entry points**: where any question has to begin.'
        } } },

    { kind: 'code', title: 'A query: ask for exactly what you need',
      body: `The caller sends a **query** that mirrors the shape of the answer it wants. **Tap the highlighted lines.**

        The server replies with JSON in precisely that shape:

        \`\`\`json
        { "data": { "user": { "name": "Ada",
            "orders": [ {"total": 1999}, {"total": 850} ] } } }
        \`\`\``,
      code: { lang: 'graphql', src: `
        query {
          user(id: "7") {
            name
            orders(last: 2) {
              total
            }
          }
        }`,
        notes: {
          2: 'Start at an entry point from the schema, passing its argument.',
          3: 'List only the fields you want. `email`, `address` and the rest are never sent.',
          4: 'Cross into a related type in the same query. This one call replaces what took several REST calls.'
        } } },

    { kind: 'code', title: 'A mutation: changing data',
      body: 'Reading is a **query**. Writing is a **mutation**, a separate kind of operation, so it is clear that something will change. **Tap the highlighted lines.**',
      code: { lang: 'graphql', src: `
        mutation {
          addToCart(productId: "55", qty: 1) {
            id
            itemCount
          }
        }`,
        notes: {
          1: 'The word `mutation` declares that this changes data. Like POST in REST, it must not be treated as safe to repeat blindly.',
          2: 'The mutation is named in the schema and takes arguments, much like a function.',
          3: 'And you still choose which fields come back, so the screen updates from the reply without a second call.'
        } } },

    { kind: 'code', title: 'Resolvers: who fetches each field?',
      body: 'The schema says what *can* be asked. **Resolvers** are the functions that actually fetch each field. **Tap the highlighted line.**',
      code: { lang: 'js', src: `
        const resolvers = {
          Query: {
            user: (_, { id }) => db.users.find(id)
          },
          User: {
            orders: (user, { last }) => db.orders.forUser(user.id, last)
          }
        };`,
        notes: {
          4: 'The `user` entry point returns one user from the database.',
          7: 'Each field has its own resolver, called **only if the query asked for that field**. Nobody asks for orders? This code never runs. Each resolver can use a database, another API, anything.'
        } },
      note: 'That separation is why GraphQL can sit in front of many back ends: a gateway for databases, REST services and gRPC services alike.' },

    { kind: 'sequence', title: 'The N+1 trap',
      body: 'Resolvers run once per item. Watch what happens when a query asks for a **list** of users and the orders of each.',
      actors: ['GraphQL server', 'Database'],
      steps: [
        { from: 0, to: 1, label: 'SELECT * FROM users LIMIT 3', note: 'One query for the list of three users. That is the **1**.' },
        { from: 0, to: 1, label: 'orders WHERE user_id = 1', note: 'Now the `orders` resolver runs for the first user…' },
        { from: 0, to: 1, label: 'orders WHERE user_id = 2', note: '…and again for the second…' },
        { from: 0, to: 1, label: 'orders WHERE user_id = 3', note: '…and for the third. That is the **N**.' },
        { note: 'For 3 users that is 4 queries. For 100 users it is **101**. A query that looks harmless to the caller hammers the database. This is the **N+1 problem**, and it is not unique to GraphQL; it is just very easy to fall into.' }
      ] },

    { kind: 'code', title: 'The fix: batching with DataLoader',
      body: 'The usual cure is a small helper called **DataLoader**. It collects every ID asked for during one moment, then makes **one** batched query. **Tap the highlighted lines.**',
      code: { lang: 'js', src: `
        const orderLoader = new DataLoader(async (userIds) => {
          const rows = await db.query(
            'SELECT * FROM orders WHERE user_id = ANY($1)', [userIds]);
          return userIds.map(id => rows.filter(r => r.user_id === id));
        });

        // in the resolver:
        orders: (user) => orderLoader.load(user.id)`,
        notes: {
          1: 'DataLoader hands your function **all the IDs together**: `[1, 2, 3]`.',
          3: 'One query fetches orders for all of them: `WHERE user_id IN (1, 2, 3)`. That turns N+1 into 2 queries.',
          8: 'Each resolver just says `load(id)`. DataLoader does the gathering, and also caches within a request so the same ID is not fetched twice.'
        } } },

    { kind: 'realworld', title: 'Clients, caching and keeping costs in check',
      body: `Writing queries by hand gets tedious, so there are client libraries:

        - **Apollo** (Client and Server) is the most widely used toolkit. It caches results by type and ID, and keeps screens in sync.
        - **Relay** is Meta's own client. It is stricter: components declare the data they need, and Relay assembles them into queries.

        Honest trade-offs:

        - **Caching is harder.** Nearly everything goes to one URL, so simple HTTP caching of GET responses does not apply. The client caches data itself instead.
        - **Costly queries.** Callers can ask for deeply nested or huge results. Servers limit query **depth and cost**, and often allow only known queries in production.
        - **Error handling** differs: a query can partly succeed, with errors listed alongside the data.` }
  ],

  activities: [
    { type: 'match', after: 2, prompt: 'Match each GraphQL word to its meaning.',
      pairs: [['Schema', 'The typed contract of all types and fields'], ['Query', 'A read operation where you list the fields you want'], ['Mutation', 'An operation that changes data'], ['Resolver', 'The function that fetches one field'], ['Over-fetching', 'Receiving far more data than the screen uses']] },

    { type: 'mcq', after: 3, q: 'In a schema, what does `name: String!` mean?',
      options: ['The field always has a value and will never be null', 'The field must be changed by a mutation', 'The name must be at most one string long', 'The field is hidden from callers'],
      answer: 0,
      why: [null, 'The exclamation mark is about null, not about mutations.', '`String` is a type, not a length.', 'It is part of the public schema. Hidden fields are simply left out.'],
      explain: '`!` marks a field **non-null**. Without it the field may come back as null. Clients can rely on non-null fields being present.' },

    { type: 'estimate', after: 7, q: 'A query asks for 50 users and, for each, their orders. The server uses a naive resolver per user and no DataLoader. About how many database queries does it run?',
      answer: 51, unit: 'queries', tolerance: 1.2,
      explain: 'One query for the list of users, plus one orders query per user: 1 + 50 = 51. With DataLoader batching it would be about 2.' },

    { type: 'spot', prompt: 'This resolver causes the N+1 problem when a query lists many users. Tap the line that runs once per user.',
      code: { lang: 'js', src: `
        const resolvers = {
          User: {
            orders: async (user) => {
              return db.query('SELECT * FROM orders WHERE user_id = ?', [user.id]);
            }
          }
        };` },
      lines: [4],
      explain: 'This query is inside a resolver that GraphQL calls once for every user in the list. Batching the IDs with a DataLoader would turn many queries into one.' },

    { type: 'bucket', prompt: 'Is each situation over-fetching, under-fetching, or neither?', buckets: ['Over-fetching', 'Under-fetching', 'Neither'],
      items: [['A list screen only shows names, but the endpoint returns full profiles', 0], ['One screen needs three sequential calls to gather its data', 1], ['A query asks for just `name` and gets just `name`', 2], ['The mobile app downloads an entire user object to show an avatar', 0], ['You need a user\'s orders, but the user endpoint has no order data', 1]],
      explain: 'Over-fetching means more than you need in one response. Under-fetching means too little, so you need more calls. GraphQL lets the caller choose the shape, which tackles both.' },

    { type: 'tf', statement: 'GraphQL replaces the database: the server stores and indexes your data itself.', answer: false,
      explain: 'GraphQL is only a query language and runtime for an API. Resolvers fetch data from databases, REST services or anything else. The storage lives behind it, unchanged.' },

    { type: 'scenario', title: 'The slow dashboard', intro: 'Your team added GraphQL for a new analytics dashboard. In production, loading the page makes the database crawl, and one partner keeps sending enormous nested queries.',
      meters: { 'database health': 40, 'developer happiness': 60 },
      steps: [
        { text: 'The logs show hundreds of tiny, near-identical SQL queries for each dashboard load. What is going on, and what do you do?',
          choices: [
            { label: 'It is N+1: batch lookups per request with DataLoader', score: 2, effects: { 'database health': 35, 'developer happiness': 5 }, feedback: 'Exactly. Resolvers run once per list item. Batching gathers the IDs and fires one query, with per-request caching as a bonus.' },
            { label: 'Increase the database size until it copes', score: 1, effects: { 'database health': 10 }, feedback: 'It buys time but the query count still grows with every list item, so the problem returns.' },
            { label: 'Drop GraphQL and rebuild as REST', score: 0, effects: { 'database health': 5, 'developer happiness': -30 }, feedback: 'A REST endpoint with a loop in it would have exactly the same N+1 problem. The cause is how data is fetched, not the API style.' }
          ] },
        { text: 'A partner sends deeply nested queries that touch millions of rows. How do you protect the server?',
          choices: [
            { label: 'Limit query depth and cost, and consider allowing only pre-approved queries in production', score: 2, effects: { 'database health': 30, 'developer happiness': -5 }, feedback: 'Callers choose the shape, so the server must set the limits. Depth and cost limits stop single requests from becoming denial-of-service attacks.' },
            { label: 'Trust partners to write sensible queries', score: 0, effects: { 'database health': -30 }, feedback: 'One mistake or one bad actor is enough to flatten the database.' },
            { label: 'Turn the endpoint off for this partner', score: 1, effects: { 'database health': 15, 'developer happiness': -10 }, feedback: 'It solves today\'s problem but ends the integration. Limits are a more lasting fix.' }
          ] }
      ],
      outro: 'The pattern to remember: **flexibility for the caller means responsibility for the server.** Batch the fetches, limit the queries.' },

    { type: 'explain', prompt: 'Explain over-fetching and under-fetching, and how GraphQL addresses them.',
      model: 'Over-fetching is when an endpoint returns far more fields than a screen needs; under-fetching is when one call gives too little so the client must make several. In GraphQL there is one endpoint and the client writes a query listing exactly the fields it wants across related types, so it gets one reply with just that data. The cost is that the server must watch for expensive queries and the N+1 problem.',
      keywords: ['over-fetching', 'under-fetching', 'one endpoint', 'fields', 'query', 'round trip', 'N+1'] }
  ],

  flashcards: [
    { q: 'What problems was GraphQL designed to solve?', a: 'Over-fetching (too much data per call) and under-fetching (too little, needing several calls), especially for mobile apps.' },
    { q: 'Query vs mutation?', a: 'A query reads data; a mutation changes it. In both, the caller lists the fields it wants back.' },
    { q: 'What is a resolver?', a: 'A function that fetches the value of one field in the schema, called only when a query asks for that field.' },
    { q: 'What is the N+1 problem and its usual fix?', a: 'One query for a list plus one extra query per item. Fix it by batching lookups, for example with DataLoader.' },
    { q: 'What are Apollo and Relay?', a: 'GraphQL client toolkits. Apollo is the most widely used and caches by type and ID. Relay is Meta\'s stricter client where components declare their data needs.' }
  ],

  glossary: [
    { term: 'GraphQL', def: 'A query language and runtime for APIs in which the caller specifies exactly which fields it wants from a single endpoint.', like: 'A tick-box order form instead of a set meal.' },
    { term: 'Schema (GraphQL)', def: 'The typed description of every type, field and entry point a GraphQL API offers.', like: 'The menu and its ingredients, with exact rules.' },
    { term: 'Resolver', def: 'The function behind a schema field that fetches its data.', like: 'The cook responsible for one dish on the form.' },
    { term: 'Over-fetching', def: 'Receiving more data than you need, such as a whole profile to show a name.', like: 'Ordering a coffee and being handed a three-course meal.' },
    { term: 'Under-fetching', def: 'Receiving too little data, so that you must make extra calls to complete a screen.', like: 'A tray that arrives without a fork, so you queue again.' },
    { term: 'N+1 problem', def: 'One query to get a list plus a further query for each item, causing many unnecessary database calls.', like: 'Phoning each guest separately instead of sending one group message.' },
    { term: 'DataLoader', def: 'A helper that batches and caches lookups within a request, to avoid the N+1 problem.', like: 'A waiter who gathers the whole table\'s orders before going to the kitchen.' }
  ],

  takeaways: [
    'GraphQL: **one endpoint**, and the caller lists exactly the **fields** it wants, which cures over- and under-fetching.',
    'The **schema** is a typed contract; **queries** read, **mutations** write, **resolvers** fetch each field.',
    'Per-item resolvers cause the **N+1 trap**: batch with **DataLoader**.',
    'Callers choose the shape, so servers need **depth and cost limits**, and caching moves to the client (Apollo, Relay).'
  ],

  links: [
    { label: 'GraphQL: Introduction to GraphQL', url: 'https://graphql.org/learn/' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('api-esb-bpm', {
  eli5: 'Big companies once wired their many systems together through one central switchboard (an enterprise service bus), and used workflow engines to run business processes across them; some of that survives, some was dropped.',

  cards: [
    { kind: 'concept', title: 'Forty systems, one big tangle',
      body: `A large company has dozens of systems: billing, stock, HR, a customer database, a web shop, an old mainframe nobody dares touch. Many of them need to talk to many of the others.

        If you connect each pair directly (**point-to-point**), the count explodes. For \`n\` systems the number of possible links is \`n × (n − 1) ÷ 2\`. With 10 systems that is 45. With **40 systems it is 780**.

        Each link has its own format, its own quirks, its own owner. Change one system and a dozen links break. People call the result **spaghetti**, and in the 2000s the industry's favourite fix was to put something in the middle.` },

    { kind: 'metaphor', title: 'The telephone switchboard',
      body: `Before direct dialling, a company had a **switchboard operator**. Nobody needed everyone else's number: you told the operator who you wanted, and they connected you. They might even translate: "that department only takes calls in French".

        An **Enterprise Service Bus (ESB)** is that operator for software. Each system connects **once**, to the bus. The bus knows where everything is, and passes messages between systems, converting formats along the way.

        Where it stops being true: a human operator handles one call at a time and has no business rules. A real bus can contain a great deal of logic, and that turned out to be the problem.` },

    { kind: 'diagram', title: 'Spaghetti becomes a hub',
      body: 'Instead of every system wired to every other, each one plugs into the bus.',
      nodes: [
        { id: 'bill', label: 'Billing', x: 0, y: 0 },
        { id: 'stock', label: 'Stock', x: 2, y: 0 },
        { id: 'esb', label: 'Enterprise service bus', icon: '🚌', x: 1, y: 1, tone: 'accent' },
        { id: 'hr', label: 'HR', x: 0, y: 2 },
        { id: 'crm', label: 'Customer system', x: 1, y: 2 },
        { id: 'main', label: 'Old mainframe', x: 2, y: 2, tone: 'muted' }
      ],
      edges: [
        { from: 'bill', to: 'esb', both: true }, { from: 'stock', to: 'esb', both: true }, { from: 'hr', to: 'esb', both: true },
        { from: 'crm', to: 'esb', both: true }, { from: 'main', to: 'esb', both: true }
      ],
      caption: 'N systems now need N connections, not N × (N − 1) ÷ 2.' },

    { kind: 'layers', title: 'What an ESB actually does',
      body: 'An ESB is a product (from vendors such as IBM, Oracle or open-source projects) that bundles several jobs in the middle.',
      layers: [
        { label: 'Orchestration', note: 'Chains several calls into one business step: "check stock, then charge, then book courier".', tone: 'accent', icon: '🎼' },
        { label: 'Routing', note: 'Sends each message to the right system based on its content.', tone: 'info', icon: '🧭' },
        { label: 'Transformation', note: 'Converts formats: XML to CSV, one field layout to another.', tone: 'info', icon: '🔄' },
        { label: 'Protocol mediation', note: 'Bridges different ways of connecting: SOAP, files, queues, databases.', tone: 'info', icon: '🌉' },
        { label: 'Security and monitoring', note: 'One place for authentication, logging and tracking messages.', tone: 'good', icon: '🛡️' }
      ] },

    { kind: 'compare', title: 'Smart pipes vs smart endpoints',
      body: 'The big debate: where does the **intelligence** live, in the middle or at the edges?',
      cols: ['Smart pipes (classic ESB)', 'Smart endpoints, dumb pipes'],
      rows: [
        ['Where logic lives', 'In the bus: routing rules, transformations, flows', 'In the services themselves'],
        ['The "pipe"', 'Product with a lot of features', 'Plain HTTP or a simple message queue'],
        ['Who changes it', 'A central integration team', 'The team that owns the service'],
        ['Risk', 'Bottleneck, single point of failure, hidden logic', 'Each service must handle its own errors and retries'],
        ['Typical era', '2000s enterprise SOA', 'Microservices and modern APIs']
      ],
      note: '"Smart endpoints and dumb pipes" is the phrase popularised in writing about microservices. Many large firms run a mixture of both.' },

    { kind: 'pitfall', title: 'How the ESB went wrong',
      body: `The idea was tidy. In practice, putting all the intelligence in one box created new problems:

        - **A central bottleneck.** Every change went through the integration team, so everyone queued behind them.
        - **A single point of failure.** If the bus stopped, *everything* stopped.
        - **Hidden business logic.** Rules buried in routing configuration, visible to nobody and tested by nobody.
        - **Vendor lock-in.** Flows built in a product's own tools can't easily be taken elsewhere.

        The lesson the industry drew: **keep the middle thin.** A switchboard that makes decisions becomes the most important and most fragile part of the company.` },

    { kind: 'concept', title: 'BPM: business processes as running diagrams',
      body: `Companies do things in **processes**: "approve a loan", "onboard a new employee", "handle a refund". Each is a series of steps, some done by software and some by people, with decisions along the way.

        **Business Process Management (BPM)** is the practice of drawing these processes explicitly, and often **running** the drawing: a workflow engine follows the diagram, calls the right systems, hands tasks to people ("manager approval needed"), and records what happened.

        The standard way to draw one is **BPMN** (Business Process Model and Notation): boxes for tasks, diamonds for decisions, arrows for flow. The attraction is that business people can read the diagram, while the engine can execute it.` },

    { kind: 'code', title: 'BPEL: a process written as XML',
      body: `**BPEL** (Business Process Execution Language) was the SOAP-era way to write such a process as code, orchestrating web services. Simplified. **Tap the highlighted lines.**`,
      code: { lang: 'html', src: `
        <process name="OrderFulfilment">
          <sequence>
            <receive operation="placeOrder"/>
            <invoke operation="chargeCard"/>
            <invoke operation="reserveStock"/>
            <reply operation="placeOrder"/>
          </sequence>
        </process>`,
        notes: {
          2: 'A **sequence**: do these steps one after another. BPEL also has loops, branches and parallel flows.',
          3: 'The process starts when a message arrives.',
          4: 'Each `invoke` calls another web service, in order. The engine keeps track of progress, even if the whole thing takes days.'
        } },
      note: 'BPEL is largely a historical technology now. The ideas live on, in other forms.' },

    { kind: 'sequence', title: 'An orchestration engine at work',
      body: 'One central conductor tells each service what to do, in order, and handles failure. This is **orchestration**.',
      actors: ['Process engine', 'Payment', 'Stock'],
      steps: [
        { from: 0, to: 1, label: 'charge £30', note: 'Step one of the order process: take payment.' },
        { from: 1, to: 0, label: 'paid', dashed: true, note: 'The engine records that step one is done.' },
        { from: 0, to: 2, label: 'reserve 1 × Dune', note: 'Step two: reserve the stock.' },
        { from: 2, to: 0, label: 'out of stock', dashed: true, note: 'It failed. The process now takes its failure path.' },
        { from: 0, to: 1, label: 'refund £30', note: 'The engine **compensates**: it undoes step one. The process definition says what to undo, so each service need not know about the others.' },
        { note: 'The conductor knows the whole story. Services stay simple, at the cost of one powerful central piece. The alternative, services reacting to each other\'s events with no conductor, is called choreography and comes in the architecture modules.' }
      ] },

    { kind: 'realworld', title: 'What the industry kept and what it dropped',
      body: `**Dropped, or heavily reduced:**

        - Heavyweight, XML-centred ESBs with business logic buried inside.
        - BPEL and the wider SOAP-era orchestration stack.
        - The idea that one product should sit in the middle of everything.

        **Kept, in new clothes:**

        - **API gateways** for authentication, limits and routing, with the thin middle the ESB lacked.
        - **Message brokers** for reliable, decoupled delivery (a later world).
        - **Workflow engines** for long-running processes, such as Camunda, Temporal and AWS Step Functions. BPMN diagrams still run in some of them.
        - **Integration platforms** (iPaaS) offering ready-made connectors as a service.

        The need is the same as ever. The lesson learnt is *how little* should sit in the middle.` }
  ],

  activities: [
    { type: 'estimate', after: 0, q: 'A company wants every one of its 10 systems directly connected to every other one. About how many separate connections is that? (n × (n − 1) ÷ 2)',
      answer: 45, unit: 'connections', tolerance: 1.2,
      explain: '10 × 9 ÷ 2 = 45. With a bus in the middle you need only 10. At 40 systems the direct approach needs 780 links, which is why point-to-point integration turns into spaghetti.' },

    { type: 'match', after: 3, prompt: 'Match each job to the part of an ESB that does it.',
      pairs: [['Convert XML into CSV', 'Transformation'], ['Send a message to the right system by its content', 'Routing'], ['Bridge SOAP, files and queues', 'Protocol mediation'], ['Chain "charge, then reserve stock"', 'Orchestration'], ['Log and authenticate everything in one place', 'Security and monitoring']] },

    { type: 'bucket', after: 4, prompt: 'Does this describe smart pipes or smart endpoints?', buckets: ['Smart pipes', 'Smart endpoints'],
      items: [['Routing rules and data conversion live in the central bus', 0], ['Each service handles its own retries and errors', 1], ['A central integration team owns every flow', 0], ['The transport is just HTTP or a simple queue', 1], ['If the middle fails, everything stops', 0], ['The team that owns a service owns its integration logic', 1]],
      explain: 'Smart pipes put the intelligence in the middle: powerful, but central and risky. Smart endpoints keep the middle simple and give each service responsibility for itself.' },

    { type: 'tf', statement: 'Putting all integration logic in a central ESB removed the bottleneck of everyone needing to coordinate.', answer: false,
      explain: 'It created a new one: every change had to go through the central integration team and the bus itself, which became both a bottleneck and a single point of failure.' },

    { type: 'mcq', q: 'What does a BPM workflow engine do that a plain message bus does not?',
      options: ['Follows a defined process, tracks its progress and can hand steps to people', 'Stores all of a company\'s data in one table', 'Replaces every API with SOAP', 'Makes networks faster'],
      answer: 0,
      why: [null, 'Storage is a database\'s job.', 'It does not mandate any one protocol.', 'It has no effect on network speed.'],
      explain: 'A workflow engine runs a process definition: it remembers where each case is, calls systems, waits for human tasks and records the history. A bus just moves messages.' },

    { type: 'order', prompt: 'Put this orchestrated order process in order, including the failure path.',
      items: ['The engine asks Payment to charge the card', 'Payment confirms and the engine records the step', 'The engine asks Stock to reserve the item', 'Stock reports that the item is out of stock', 'The engine tells Payment to refund the charge'],
      explain: 'The engine follows its steps in order. When one fails, it runs a compensating step (the refund) to undo earlier work, so the system ends in a consistent state.' },

    { type: 'scenario', title: 'Rescuing the integration team', intro: 'You have joined a bank where a single ESB sits between 60 systems. Every change takes a quarter, the integration team is exhausted, and an ESB outage last month stopped everything.',
      meters: { 'delivery speed': 30, 'risk': 70 },
      steps: [
        { text: 'Leadership asks what to do about the bus. What do you propose?',
          choices: [
            { label: 'Gradually move business logic out to the owning teams\' services, leaving a thinner routing layer', score: 2, effects: { 'delivery speed': 30, risk: -25 }, feedback: 'Keeping the middle thin removes the bottleneck and the hidden logic. It is slow, careful work, but it is the lasting fix.' },
            { label: 'Buy a bigger, more powerful ESB product', score: 0, effects: { 'delivery speed': -5, risk: 10 }, feedback: 'More power in the middle makes the central point even more critical, and so the same problems return at greater scale.' },
            { label: 'Scrap it all and rewire all 60 systems directly', score: 0, effects: { 'delivery speed': -20, risk: 25 }, feedback: 'Back to spaghetti, with an enormous migration in between. The need for a hub did not go away.' }
          ] },
        { text: 'A long process, "open a customer account", spans six systems and a human approval, and takes days. How should it run?',
          choices: [
            { label: 'A workflow engine that tracks each case, calls the systems in turn and undoes steps on failure', score: 2, effects: { 'delivery speed': 20, risk: -20 }, feedback: 'Long-running processes need remembered state, human tasks and compensation, which is exactly what workflow engines provide.' },
            { label: 'One huge script that holds the whole thing in memory until it finishes', score: 0, effects: { risk: 20 }, feedback: 'If that process dies on day two, the case is lost and nobody knows how far it got.' },
            { label: 'Let staff track the cases in a spreadsheet', score: 1, effects: { 'delivery speed': -10, risk: 5 }, feedback: 'It works at tiny scale, but the process can neither retry nor audit itself.' }
          ] }
      ],
      outro: 'The pattern to remember: **a thin middle, owned edges, and a workflow engine for processes that outlive a single request.**' },

    { type: 'explain', prompt: 'Explain what an ESB was meant to solve, and why many companies came to regret putting so much logic in it.',
      model: 'An ESB replaced a tangle of point-to-point links with one central hub that routes messages, converts formats and bridges protocols, so each system connects once. But as business logic piled up inside the bus, it became a central bottleneck, a single point of failure, a place for hidden rules and a source of vendor lock-in. The lesson was to keep the middle thin and put intelligence in the services.',
      keywords: ['point-to-point', 'hub', 'routing', 'transformation', 'bottleneck', 'single point of failure', 'smart endpoints', 'thin'] }
  ],

  flashcards: [
    { q: 'What problem does an ESB solve?', a: 'Point-to-point spaghetti. Each system connects once to a central bus, which routes, transforms and mediates between them.' },
    { q: 'Smart pipes vs smart endpoints?', a: 'Smart pipes: logic lives in the central bus. Smart endpoints, dumb pipes: logic lives in the services and the transport stays simple.' },
    { q: 'What went wrong with ESBs?', a: 'They became bottlenecks and single points of failure, hid business logic in configuration, and locked companies into vendors.' },
    { q: 'What are BPM, BPMN and BPEL?', a: 'BPM: managing business processes explicitly. BPMN: the diagram notation for them. BPEL: an XML language for orchestrating web services, now largely historical.' },
    { q: 'What did the industry keep from the ESB era?', a: 'API gateways, message brokers, workflow engines and integration platforms, with much less logic in the middle.' }
  ],

  glossary: [
    { term: 'Point-to-point integration', def: 'Connecting each pair of systems directly, which grows as n × (n − 1) ÷ 2 and becomes tangled.', like: 'Everyone in a company having a private phone line to everyone else.', aka: ['spaghetti integration'] },
    { term: 'Enterprise Service Bus', def: 'A central integration layer that routes messages between systems and converts formats and protocols.', like: 'A telephone switchboard operator.', aka: ['ESB'] },
    { term: 'Orchestration', def: 'One central controller that calls services in order and manages failure and compensation.', like: 'A conductor telling each musician when to play.' },
    { term: 'BPM', def: 'Business Process Management: modelling business processes explicitly, often running them in a workflow engine.', like: 'A flowchart that actually runs.', aka: ['Business Process Management'] },
    { term: 'BPMN', def: 'Business Process Model and Notation: the standard diagram style (tasks, decisions, arrows) for business processes.', like: 'Flowchart symbols that both managers and engines understand.' },
    { term: 'BPEL', def: 'Business Process Execution Language: an XML language for describing a process that orchestrates web services.', like: 'A written recipe for a conductor.' }
  ],

  takeaways: [
    'An **ESB** swaps spaghetti links for one hub that routes, converts and bridges systems.',
    'Too much logic in the middle made it a **bottleneck** and single point of failure: keep the middle thin.',
    '**BPM** runs business processes as diagrams (**BPMN**); **BPEL** was the XML way, now mostly history.',
    'Kept: gateways, brokers, workflow engines. Dropped: heavyweight XML-centric buses.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('api-choosing', {
  eli5: 'There is no single best way for programs to talk: you pick REST, gRPC, GraphQL or SOAP by asking who is calling, what data they need and what rules you must follow, and big systems often use several.',

  cards: [
    { kind: 'concept', title: 'Four people, four favourite answers',
      body: `A food-delivery start-up is planning its API. The meeting goes like this:

        - The mobile developer wants **GraphQL**: "every screen needs different bits of data".
        - The platform engineer wants **gRPC**: "our services call each other thousands of times a second".
        - The partnerships lead wants **REST**: "restaurants' developers must be able to try it in five minutes".
        - The finance lead mentions that the payment provider only offers **SOAP**.

        Here is the twist: **all four are right**, about different parts of the system. The useful question is never "which style is best?" but "best *for which caller*?". This lesson gives you a way to answer it.` },

    { kind: 'metaphor', title: 'Buses, taxis, internal post and armoured vans',
      body: `A city moves people and goods in different ways, each suited to a job:

        - **REST is the bus network.** Fixed routes everyone understands, cheap, works for anyone with a ticket. Popular stops (cached responses) are easy.
        - **GraphQL is a taxi.** It takes you exactly where you asked in one trip, but the driver (the server) works harder for each ride.
        - **gRPC is the pneumatic tube inside an office building.** Very fast and efficient, but only between rooms fitted with tubes.
        - **SOAP is the armoured van.** Paperwork, signatures, guaranteed delivery. Slow to arrange, trusted by banks.

        Nobody argues that a city should only have buses. Systems are the same.` },

    { kind: 'compare', title: 'The four styles on one page',
      body: 'Everything from this module and the last, squeezed into one table.',
      cols: ['Strengths', 'Weak spots', 'Natural home'],
      rows: [
        ['**REST**', 'Simple, universal, HTTP caching, easy to try', 'Over- and under-fetching; contract optional', 'Public APIs, partners, most web back ends'],
        ['**gRPC**', 'Compact binary, generated typed code, streaming', 'Needs a proxy in browsers; hard to read by hand', 'Calls between your own services'],
        ['**GraphQL**', 'Caller picks fields; one round trip', 'Harder caching; N+1 and costly queries', 'Apps with many varied screens'],
        ['**SOAP**', 'Strict contract, WS-* security and reliability', 'Verbose, heavy tooling, POST-only', 'Existing enterprise and regulated links']
      ],
      note: 'All four can work for almost anything. The table shows where each one is *least effort* for the benefit you get.' },

    { kind: 'diagram', title: 'One system, several styles',
      body: 'Real systems mix styles: each connection uses whatever suits the two parties at its ends.',
      nodes: [
        { id: 'app', label: 'Mobile app', icon: '📱', x: 0, y: 0 },
        { id: 'partner', label: 'Restaurant partners', icon: '🍕', x: 2, y: 0 },
        { id: 'gql', label: 'GraphQL for apps', icon: '🧩', x: 0, y: 1, tone: 'accent' },
        { id: 'rest', label: 'Public REST API', icon: '🚌', x: 2, y: 1, tone: 'accent' },
        { id: 'orders', label: 'Orders service', x: 0, y: 3 },
        { id: 'menus', label: 'Menus service', x: 1, y: 3 },
        { id: 'pay', label: 'Payments adapter', x: 2, y: 3, tone: 'warn' },
        { id: 'bank', label: 'Payment provider (SOAP)', icon: '🏦', x: 2, y: 4, tone: 'muted' }
      ],
      edges: [
        { from: 'app', to: 'gql', label: 'GraphQL' },
        { from: 'partner', to: 'rest', label: 'REST + JSON' },
        { from: 'gql', to: 'orders', label: 'gRPC' },
        { from: 'gql', to: 'menus', label: 'gRPC' },
        { from: 'rest', to: 'menus', label: 'gRPC' },
        { from: 'orders', to: 'pay', label: 'gRPC' },
        { from: 'pay', to: 'bank', label: 'SOAP' }
      ],
      caption: 'Friendly styles at the edges, an efficient one inside, and the old style fenced in behind one adapter.' },

    { kind: 'example', title: 'Public APIs: start with REST',
      body: `A **public API** is called by developers you will never meet. They use every language under the sun, they test by pasting a URL into a terminal, and they will leave if the first attempt is confusing.

        That is why REST with JSON (plus an OpenAPI description) remains the default for public APIs:

        - Every language and tool can already speak HTTP and JSON.
        - Plain GET responses can be cached by browsers, proxies and CDNs.
        - It is easy to document, version and rate-limit, as the previous module showed.

        Some companies **also** offer GraphQL publicly: GitHub, for example, has both a REST API and a GraphQL API. That is an addition for power users, not a replacement for the simple door.` },

    { kind: 'example', title: 'Internal calls: gRPC, or honestly just REST',
      body: `Between your **own services**, you control both ends. Nobody outside needs to read the messages, so the friendliness of JSON matters less, and efficiency and strict contracts matter more.

        This is gRPC's home: generated clients in every language your teams use, small binary messages, deadlines and streaming built in.

        But be honest about scale. A small team with five services and modest traffic can happily use **REST internally too**. One style everywhere is simpler to learn, debug and monitor. gRPC pays off when call volume is high, when several languages share contracts, or when you need streaming. Experienced engineers genuinely disagree about where that line sits.` },

    { kind: 'example', title: 'Mobile apps: shape the data for the screen',
      body: `A phone app has a slow, patchy connection and dozens of screens, each wanting a different slice of data. Every extra round trip is felt by the user.

        Two common answers:

        - **GraphQL**: each screen writes a query for exactly its fields, and gets them in one trip.
        - **A [[Backend for Frontend]]** with plain REST: a small server gathers and trims data for one kind of client.

        Both solve over- and under-fetching. GraphQL is attractive when many teams and screens keep changing their needs; a BFF is simpler when there are a few, stable screens. Either way, the app talks to a friendly front door, and gRPC or REST runs behind it.` },

    { kind: 'pitfall', title: 'Choosing by fashion',
      body: `The commonest mistake is choosing a style because it is new, exciting or good for a CV:

        - **"GraphQL will make it fast."** It cuts round trips; it does nothing for a slow database or a bad query.
        - **"gRPC everywhere."** Then your public partners cannot try the API, and browsers need a proxy.
        - **"Rewrite the SOAP link in REST."** A working, compliant integration rarely deserves a risky rewrite. Wrap it in an adapter instead.
        - **One style for everything, forever.** Consistency is good inside a group of similar callers, not across very different ones.

        Every style adds tooling, skills and monitoring. Add a second or third only when it solves a real problem you can name.` },

    { kind: 'steps', title: 'The decision checklist',
      body: 'Run through these questions for **each** API, not once for the whole company.',
      steps: [
        { title: '1. Who calls it?', body: 'Strangers on the internet, partners, your own mobile app, or your own services? Outsiders push you towards REST; your own services free you to pick gRPC.' },
        { title: '2. Is something already fixed?', body: 'If a partner only offers SOAP, or an industry standard demands a format, the choice is made. Wrap it and move on.' },
        { title: '3. How varied is the data each caller needs?', body: 'Many screens with shifting needs favour GraphQL or a BFF. A few predictable resources suit REST.' },
        { title: '4. What about speed, volume and streaming?', body: 'Heavy internal traffic or long-lived streams favour gRPC. For pushing live updates to browsers, see the next module.' },
        { title: '5. What can your team run well?', body: 'Skills, tooling, monitoring and caching matter. A style nobody can debug at 3 a.m. is the wrong style.' }
      ] },

    { kind: 'realworld', title: 'In the wild: several doors to one house',
      body: `Large providers often expose the **same** underlying service in more than one style:

        - **GitHub** offers a REST API and a GraphQL API side by side, over the same data.
        - Many **Google Cloud** APIs can be called over gRPC or over REST with JSON. The internal services are defined with protobuf, and a translation layer produces the JSON version.

        Tools exist to do this translation for you: you write one .proto contract and get a JSON-over-HTTP front door generated from it. The lesson is that the style is an **interface choice at a boundary**, not a property of the whole company. Keep the core logic in one place, and put whichever doors suit your callers in front of it.` }
  ],

  activities: [
    { type: 'match', after: 2, prompt: 'Match each API style to the place it usually fits best.',
      pairs: [['REST + JSON', 'A public API for unknown developers'], ['gRPC', 'Heavy traffic between your own services'], ['GraphQL', 'A mobile app with many screens of varying needs'], ['SOAP', 'An existing link to a regulated partner']] },

    { type: 'tf', after: 3, statement: 'A well-designed system should choose one API style and use it for every connection.', answer: false,
      explain: 'Different callers have different needs. Mixing is normal: friendly styles at the edges, efficient ones inside, and legacy styles kept behind an adapter. What matters is consistency *within* each boundary.' },

    { type: 'mcq', after: 5, q: 'A team of four runs six internal services with light traffic, all in one language, all using REST. Someone proposes switching the internal calls to gRPC. What is the most sensible response?',
      options: ['Probably not yet: REST works, and gRPC pays off mainly at high volume or across many languages', 'Yes, immediately: gRPC is always faster, so it is always the right choice', 'Yes, and switch the public API to gRPC as well for consistency', 'No: gRPC can only be used by very large companies'],
      answer: 0,
      why: [null, 'Faster on the wire, yes, but the switch costs time, tooling and learning for little gain at this size.', 'That would shut out partners and browsers who expect HTTP and JSON.', 'Anyone can use it; the question is whether the benefit outweighs the cost here.'],
      explain: 'A change of style should solve a problem you can name. At small scale with one language, REST\'s simplicity usually wins. Revisit when traffic, languages or streaming needs grow.' },

    { type: 'bucket', prompt: 'Which style is the most natural fit for each situation?', buckets: ['REST', 'gRPC', 'GraphQL', 'SOAP'],
      items: [['A weather API that any developer can try with one command', 0], ['Streaming sensor readings between two of your back-end services', 1], ['A social app whose feed, profile and search screens all need different fields', 2], ['Connecting to a bank whose only interface is a WSDL', 3], ['A public list of products that browsers and CDNs should cache', 0], ['Services in Go, Java and Python sharing one strict contract', 1], ['A dashboard that combines users, orders and reviews in a single round trip', 2]],
      explain: 'Outsiders and caching suggest REST. Internal, high-volume or streaming calls suggest gRPC. Varied, nested data needs per screen suggest GraphQL. An existing WSDL contract means SOAP, kept behind an adapter.' },

    { type: 'multi', q: 'Which of these are good reasons to add GraphQL to a system?', options: ['Many app screens need different combinations of related data', 'Mobile users suffer from several round trips per screen', 'The database queries behind the API are slow', 'It is the newest style and would look good on the team\'s CVs', 'Front-end teams keep waiting for new endpoints for each screen change'],
      answers: [0, 1, 4],
      explain: 'GraphQL helps when callers need flexible, nested data in one trip and front-end teams want to change queries without server changes. It does nothing for slow database queries, and fashion is not a reason.' },

    { type: 'ab', q: 'A food-delivery company needs APIs for restaurant partners and for its own services. Which plan is better?',
      a: { lang: 'text', label: 'One style everywhere', src: `
        Partners:          gRPC (send them the .proto file)
        Internal services: gRPC
        Mobile app:        gRPC-Web through a proxy` },
      b: { lang: 'text', label: 'A style per boundary', src: `
        Partners:          REST + JSON with OpenAPI docs
        Internal services: gRPC
        Mobile app:        GraphQL (or a BFF)` },
      answer: 'b',
      explain: 'Partners can try a REST API in minutes with tools they already have, while gRPC suits the internal traffic and GraphQL or a BFF suits varied app screens. Forcing gRPC on outsiders and browsers adds proxies and friction for no real gain.' },

    { type: 'cloze', text: 'Ask the checklist questions for {{each API}}, not once for the whole company. Start with {{who calls it}}, then check whether anything is {{already fixed}} by a partner or standard.',
      distractors: ['the newest style', 'the whole system', 'what is popular', 'the database'],
      explain: 'Different boundaries have different callers, so each gets its own decision. The caller is the biggest factor, and an existing partner contract can settle the matter before any debate starts.' },

    { type: 'scenario', title: 'The delivery start-up', intro: 'You are the first architect at a food-delivery start-up. You have an app, a handful of back-end services, a payment provider and soon hundreds of restaurant partners.',
      meters: { 'partner happiness': 50, 'app speed': 50, 'team sanity': 60 },
      steps: [
        { text: 'Restaurants\' developers need to publish menus and receive orders. How do you expose that?',
          choices: [
            { label: 'A REST API with JSON, an OpenAPI description and clear docs', score: 2, effects: { 'partner happiness': 30, 'team sanity': 5 }, feedback: 'Every partner\'s tools already speak HTTP and JSON. They can try it in minutes and generate a client from the OpenAPI file if they like.' },
            { label: 'gRPC, because it is faster', score: 0, effects: { 'partner happiness': -25 }, feedback: 'Small restaurants\' developers now need protobuf tooling just to say hello. Speed on the wire is not their problem.' },
            { label: 'GraphQL only', score: 1, effects: { 'partner happiness': 5, 'team sanity': -10 }, feedback: 'Workable, and some big platforms do offer it, but simple menu uploads do not need its flexibility, and you take on query-cost limits from day one.' }
          ] },
        { text: 'The app\'s home screen makes five calls and feels sluggish on mobile data. What do you try?',
          choices: [
            { label: 'Give the app one front door shaped for its screens: GraphQL or a Backend for Frontend', score: 2, effects: { 'app speed': 30, 'team sanity': -5 }, feedback: 'One round trip with exactly the needed fields suits a slow connection. Pick GraphQL if screens change often, a BFF if they are few and stable.' },
            { label: 'Make every REST endpoint return everything, so one call is enough', score: 0, effects: { 'app speed': -15 }, feedback: 'That swaps under-fetching for heavy over-fetching: bigger downloads on exactly the slow connections you worried about.' },
            { label: 'Leave it and add a loading spinner', score: 1, effects: { 'app speed': -5 }, feedback: 'Honest about the wait, but it does not shorten it.' }
          ] },
        { text: 'The payment provider only offers a SOAP interface. How do you handle it?',
          choices: [
            { label: 'One small payments adapter that talks SOAP and gives the rest of the system plain calls', score: 2, effects: { 'team sanity': 25 }, feedback: 'The old style is fenced in. If you change provider later, only the adapter changes.' },
            { label: 'Let every service call the SOAP API directly', score: 0, effects: { 'team sanity': -25 }, feedback: 'Now XML envelopes and generated types leak everywhere, and a provider change touches every service.' },
            { label: 'Refuse to integrate until the provider offers REST', score: 0, effects: { 'team sanity': -10, 'partner happiness': -15 }, feedback: 'You cannot take payments while you wait, and they may never change.' }
          ] }
      ],
      outro: 'The pattern to remember: **pick a style per boundary, by who is calling.** REST for strangers, GraphQL or a BFF for your apps, gRPC inside, and legacy styles behind an adapter.' },

    { type: 'explain', prompt: 'A manager asks: "Which API style should we standardise on?" Give them a fair, short answer.',
      model: 'There is no single best style; it depends on who calls each API. Public and partner APIs usually suit REST with JSON because anyone can use them and responses can be cached. Calls between our own services can use gRPC when volume, several languages or streaming make it worthwhile. Apps with many varied screens can benefit from GraphQL or a Backend for Frontend. Existing SOAP partners should be wrapped in an adapter rather than rewritten. Standardise within each boundary, and add a new style only for a real problem.',
      keywords: ['caller', 'public', 'REST', 'internal', 'gRPC', 'GraphQL', 'adapter', 'boundary'] }
  ],

  flashcards: [
    { q: 'What is the first question to ask when choosing an API style?', a: 'Who calls it: strangers, partners, your own apps or your own services? The caller shapes everything else.' },
    { q: 'Default style for a public API, and why?', a: 'REST with JSON (plus OpenAPI): every tool speaks it, it is easy to try and document, and GET responses can be cached.' },
    { q: 'When does gRPC pay off internally?', a: 'At high call volume, when services in several languages share contracts, or when streaming is needed. Small, simple systems can stay with REST.' },
    { q: 'GraphQL or a Backend for Frontend for a mobile app?', a: 'Both cut round trips. GraphQL suits many screens with changing needs; a BFF is simpler for a few stable screens.' },
    { q: 'What do you do with a partner who only offers SOAP?', a: 'Integrate through one adapter that speaks SOAP and gives the rest of your system plain calls, rather than rewriting or spreading SOAP everywhere.' }
  ],

  glossary: [
    { term: 'API style', def: 'The overall way an API is shaped and called, such as REST, gRPC, GraphQL or SOAP.', like: 'Bus, taxi, internal post or armoured van: different ways to make the same trip.' },
    { term: 'Public API', def: 'An API offered to outside developers you do not know, who call it from their own software.', like: 'A shop window open to anyone passing.', aka: ['open API'] },
    { term: 'Partner API', def: 'An API offered to a known set of outside organisations, usually under an agreement.', like: 'The trade entrance, open only to approved suppliers.' },
    { term: 'Internal API', def: 'An API called only by your own services and apps, where you control both ends.', like: 'The internal post between floors of one office.', aka: ['private API'] }
  ],

  takeaways: [
    'No style is best everywhere: choose **per boundary**, starting with **who calls it**.',
    '**REST** for strangers and partners, **gRPC** inside at scale, **GraphQL or a BFF** for varied app screens, **SOAP** behind an adapter when a partner demands it.',
    'Mixing styles is normal; each extra style must solve a problem you can **name**.',
    'Keep core logic in one place and put the right **doors** in front of it.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('api-styles', {
  title: 'The Protocol Hydra',
  intro: 'Four heads, four ways of talking: an XML head, a binary head, a head that asks for exactly what it wants, and an old switchboard head that will not die. Beat it by knowing what each style is for and which one to pick.',
  questions: [
    { type: 'mcq', q: 'Why is it hard to use ordinary HTTP caching in front of a SOAP service?',
      options: ['Nearly every call is a POST to one URL, with the operation named inside the body', 'XML cannot be stored on disk by a cache', 'SOAP messages are encrypted, so caches cannot see them', 'WSDL files forbid caching'],
      answer: 0,
      why: [null, 'XML is plain text and can be stored like anything else.', 'Encryption is optional (WS-Security). The real issue is the method and URL.', 'The WSDL describes operations; it says nothing that forbids caching.'],
      explain: 'HTTP caches work on GET responses keyed by URL. SOAP sends POSTs to a single address, so a cache cannot tell one request from another.' },

    { type: 'spot', prompt: 'This .proto file was edited last week. Tap the line that will corrupt data for older clients.',
      code: { lang: 'proto', src: `
        message Order {
          int64 id = 1;
          string status = 2;
          int32 total_pence = 3;
          // removed: string coupon_code = 4;
          string currency = 4;
        }` },
      lines: [6],
      explain: 'Number 4 used to mean `coupon_code`. Old clients still decode field 4 as a coupon, so they will read the currency as a coupon code. Retired numbers must never be reused; use 5 instead.' },

    { type: 'multi', q: 'Which of these are true of gRPC?', options: ['The contract is a .proto file from which code is generated', 'It runs over HTTP/2', 'It supports streaming in either or both directions', 'Browsers can call it directly with no bridge or proxy', 'Messages are human-readable JSON by default'],
      answers: [0, 1, 2],
      explain: 'gRPC uses protobuf contracts, HTTP/2 and four call modes including streaming. Browsers need gRPC-Web plus a proxy, and messages are compact binary, not JSON.' },

    { type: 'cloze', text: 'In GraphQL, reading data is a {{query}}, changing it is a {{mutation}}, and the function that fetches each field is a {{resolver}}.',
      distractors: ['stub', 'envelope', 'endpoint', 'WSDL'],
      explain: 'Queries read and mutations write; in both the caller lists the fields it wants. Resolvers sit behind each field and are called only when a query asks for it.' },

    { type: 'estimate', q: 'A query lists 200 blog posts and the author of each. The author resolver makes one database query per post, with no batching. About how many database queries is that in total?',
      answer: 201, unit: 'queries', tolerance: 1.2,
      explain: 'One query for the list, then one per post: 1 + 200 = 201. That is the N+1 problem. DataLoader would batch the author lookups into one query, so about 2 in total.' },

    { type: 'tf', statement: '"Smart endpoints and dumb pipes" means keeping business logic in the services and keeping the transport between them simple.', answer: true,
      explain: 'It is the opposite of the classic ESB, where routing rules, transformations and flows lived in the bus. Keeping the middle thin avoids a central bottleneck and hidden logic.' },

    { type: 'estimate', q: 'A company wants to connect 20 systems, each directly to every other one. About how many point-to-point connections is that? (n × (n − 1) ÷ 2)',
      answer: 190, unit: 'connections', tolerance: 1.2,
      explain: '20 × 19 ÷ 2 = 190. Through a central hub it would be 20. That growth is why the ESB looked so attractive, before its own problems appeared.' },

    { type: 'bucket', prompt: 'Which technology does each item belong to?', buckets: ['SOAP', 'gRPC', 'GraphQL', 'ESB / BPM'],
      items: [['WSDL contract', 0], ['WS-Security', 0], ['Field numbers on the wire', 1], ['Bidirectional streaming', 1], ['DataLoader', 2], ['Non-null fields marked with `!`', 2], ['Routing and transformation in the middle', 3], ['BPEL process definitions', 3]],
      explain: 'SOAP brings WSDL and WS-*. gRPC brings protobuf and streaming. GraphQL brings schemas, resolvers and batching helpers. ESBs route and transform, and BPM engines run processes such as BPEL definitions.' },

    { type: 'order', prompt: 'Put the steps of building and calling a gRPC service in order.',
      items: ['Write the service and messages in a .proto file', 'Run the generator for each language you use', 'Fill in the server logic in the generated skeleton', 'Call the method on a generated client stub, with a deadline', 'The stub sends compact binary over HTTP/2 and decodes the reply'],
      explain: 'Everything flows from the contract: write it, generate code, implement the server, then call it through the stub, which hides the networking (but not the network\'s failures, hence the deadline).' },

    { type: 'match', prompt: 'Match each item to what it describes.',
      pairs: [['WSDL', 'The strict XML contract of a SOAP service'], ['.proto file', 'The contract from which gRPC code is generated'], ['GraphQL schema', 'The typed map of types, fields and entry points'], ['BPMN', 'A diagram notation for business processes'], ['gRPC-Web', 'A browser-friendly variant of gRPC, used via a proxy']] },

    { type: 'ab', q: 'An insurer must connect to a regulator\'s SOAP service. Which integration is better?',
      a: { lang: 'text', label: 'Spread it around', src: `
        Every service that needs regulator data
        imports the generated SOAP classes and
        calls the regulator directly.` },
      b: { lang: 'text', label: 'Fence it in', src: `
        One RegulatorAdapter calls the SOAP service
        and returns plain objects; other services
        call the adapter through the internal API.` },
      answer: 'b',
      explain: 'A single adapter keeps XML and generated types in one place. If the regulator changes its interface, one component changes instead of every service.' },

    { type: 'mcq', q: 'A start-up is about to open its API to thousands of outside developers. Its own services already talk gRPC. Which choice for the public API is most sensible?',
      options: ['A REST + JSON front door with OpenAPI docs, translating to the internal gRPC services', 'Publish the .proto files and require every developer to use gRPC', 'SOAP with a WSDL, because outside developers need a strict contract', 'No API: let partners read the database directly'],
      answer: 0,
      why: [null, 'Possible, but many developers will struggle to even try it, and browsers need a proxy.', 'Heavy tooling and verbose XML put off the developers you want to attract.', 'That couples outsiders to your storage and is a security risk.'],
      explain: 'Outsiders favour what every tool already speaks. Keep gRPC inside and put a friendly REST door in front, possibly generated from the same contract.' }
  ]
});

KS.sheet('api-styles', {
  title: 'Beyond REST: cheat sheet',
  sections: [
    { title: 'SOAP and XML web services',
      md: `- **Envelope** (XML) = optional **Header** (credentials, routing) + **Body** (the operation and data).
        - **WSDL** = strict, required contract listing operations, types and location. Tools **generate client code** from it.
        - Usually one URL, everything a **POST**; errors arrive as a **fault** in the body.
        - **WS-*** add-ons: WS-Security (sign/encrypt), WS-ReliableMessaging, WS-AtomicTransaction, WS-Addressing.
        - **Still used** by banks, insurers, telecoms and government: it works, suits regulation, rewrites are risky.
        - **Weak spots:** verbose, tool-dependent, hard to cache.` },

    { title: 'gRPC and Protocol Buffers',
      md: `- **RPC:** call a remote function as if it were local. Always set a **deadline**.
        - Contract: \`.proto\` file with \`service\`, \`rpc\` and \`message\`. Generate **stubs** for every language.
        - Field **numbers** travel on the wire: never reuse or change one; add new fields with new numbers.

        | Mode | Client sends | Server sends |
        |---|---|---|
        | Unary | 1 | 1 |
        | Server streaming | 1 | many |
        | Client streaming | many | 1 |
        | Bidirectional | many | many |

        Runs on **HTTP/2**. Browsers need **gRPC-Web** plus a proxy.` },

    { title: 'GraphQL',
      md: `- **One endpoint**; the caller lists exactly the fields it wants. Cures **over-fetching** (too much) and **under-fetching** (too many calls).
        - **Schema** = typed contract. \`!\` = non-null, \`[T]\` = list, \`Query\` = entry points.
        - **Query** reads, **mutation** writes. **Resolvers** fetch each field, only when asked for.
        - **N+1 trap:** one query for a list + one per item. Fix: **DataLoader** batching.
        - Clients: **Apollo** (most used), **Relay** (Meta, stricter).
        - Costs: harder HTTP caching, partial errors, so **limit depth and cost**.` },

    { title: 'ESB, BPM and BPEL',
      md: `- **Point-to-point** links: n × (n − 1) ÷ 2. 40 systems = 780 links.
        - **ESB** = central hub: routing, transformation, protocol mediation, orchestration, monitoring.
        - **Smart pipes** (logic in the bus) vs **smart endpoints, dumb pipes** (logic in services).
        - ESB problems: bottleneck, single point of failure, hidden logic, vendor lock-in.
        - **BPM** runs processes; **BPMN** draws them; **BPEL** was the XML orchestration language (now mostly history).
        - **Orchestration** = a conductor calls each step and compensates on failure.
        - **Kept:** API gateways, message brokers, workflow engines, iPaaS. **Lesson:** keep the middle thin.` },

    { title: 'Choosing a style',
      md: `| Caller | Usual choice |
        |---|---|
        | Strangers / public | REST + JSON + OpenAPI |
        | Known partners | REST (SOAP if they insist) |
        | Your mobile / web app | GraphQL or a BFF |
        | Your own services | gRPC at scale, REST when small |
        | Legacy SOAP partner | One adapter, never spread it |

        **Checklist, per API:** who calls it? Is anything already fixed? How varied is the data? Speed, volume, streaming? What can the team run well?` },

    { title: 'Common mistakes',
      md: `- Choosing a style for fashion or CVs instead of a named problem.
        - Expecting GraphQL to fix a slow database.
        - Forcing gRPC on outside developers and browsers.
        - Rewriting a working SOAP integration for no business reason.
        - Letting generated SOAP or protobuf types leak through the whole codebase.
        - Reusing a retired protobuf field number.
        - Per-item resolvers with no batching (N+1).
        - No depth or cost limits on a public GraphQL API.
        - Putting business logic in the middle (the ESB trap).` }
  ]
});
