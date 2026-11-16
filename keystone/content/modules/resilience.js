/* Module: resilience — Resilience.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs resilience */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('rs-failure', {
  eli5: 'When you run lots of computers, something is always broken somewhere, so good systems are built to keep working anyway instead of hoping nothing ever fails.',

  cards: [
    { kind: 'concept', title: 'At scale, failure is the weather',
      body: `Your laptop has run for years without a single hardware failure. So it is tempting to think computers are reliable.

        Now buy ten thousand of them. If any one machine fails about once every few years, then across the fleet **something is breaking most days**. Add disks, network cables, power supplies, software releases, expired certificates and the occasional digger cutting a fibre cable, and failure stops being an *event*.

        It becomes **weather**. You do not ask "will it rain?". You carry an umbrella.` },

    { kind: 'metaphor', title: 'The twin-engine plane',
      body: `A passenger jet has more than one engine. Not because engines are bad, but because engines **sometimes fail** and the passengers would like to land anyway.

        Notice what the designers did *not* do: they did not try to build one perfect engine. They accepted that parts fail and arranged things so a single failure is boring.

        Resilient software works the same way. The goal is not "nothing breaks". It is "when something breaks, users barely notice".

        Where the metaphor stops: a plane has two engines. Software can cheaply have two, ten or a hundred.` },

    { kind: 'concept', title: 'Single points of failure',
      body: `A **single point of failure** (SPOF) is any one thing whose death takes the whole system down.

        Obvious ones: one app server, one database. Sneakier ones:

        - the one load balancer in front of your ten app servers
        - the one DNS provider that turns your name into an address
        - the one expired certificate nobody remembered to renew
        - the one engineer who knows the deploy password

        The cure is **redundancy**: have a second (or third) copy that can take over. You met this with load balancers and database replicas already; here we ask a harder question, *"what is still a SPOF?"*` },

    { kind: 'diagram', title: 'Spot the single point of failure',
      body: 'Two app servers and two database copies look safe. Tap through the picture and ask: what happens if each box vanishes?',
      nodes: [
        { id: 'u', label: 'Users', icon: '👥', x: 1, y: 0 },
        { id: 'lb', label: 'One load balancer', icon: '⚖️', x: 1, y: 1, tone: 'bad' },
        { id: 'a1', label: 'App server 1', icon: '🖥️', x: 0, y: 2 },
        { id: 'a2', label: 'App server 2', icon: '🖥️', x: 2, y: 2 },
        { id: 'db', label: 'Primary database', icon: '🗄️', x: 0, y: 3, tone: 'accent' },
        { id: 'rep', label: 'Replica (standby)', icon: '🗄️', x: 2, y: 3, tone: 'good' }
      ],
      edges: [
        { from: 'u', to: 'lb' }, { from: 'lb', to: 'a1' }, { from: 'lb', to: 'a2' },
        { from: 'a1', to: 'db' }, { from: 'a2', to: 'db' },
        { from: 'db', to: 'rep', label: 'copies', dashed: true }
      ],
      caption: 'Two of everything, except the red box. If the load balancer dies, both app servers sit idle and every user sees an error. The fix is a pair of load balancers, and then you hunt for the next SPOF.' },

    { kind: 'compare', title: 'Availability and the “nines”',
      body: '**Availability** is the share of time a system works. People quote it in "nines". Each extra nine cuts the allowed downtime by ten.',
      cols: ['Downtime per year', 'Per month (30 days)'],
      rows: [
        ['99% (two nines)', '3.65 days', '7.2 hours'],
        ['99.9% (three nines)', '8.8 hours', '43 minutes'],
        ['99.99% (four nines)', '53 minutes', '4.3 minutes'],
        ['99.999% (five nines)', '5.3 minutes', '26 seconds']
      ],
      note: 'The arithmetic: a year has about 8,760 hours. 99.9% allows 0.1% of that, which is 8.76 hours. Cost climbs steeply with each nine, so choose the one the business actually needs.' },

    { kind: 'pitfall', title: 'Dependencies multiply, so nines shrink',
      body: `Your app is "99.9% available". But to answer a request it needs the database, the payment provider and the email service, each also 99.9%.

        If all three must work, the chances multiply: 0.999 × 0.999 × 0.999 ≈ **0.997**. That is 99.7%, around **26 hours** of downtime a year, three times worse than any single part.

        The more things in a *chain*, the less available the whole. Redundancy goes the other way: two independent copies, where either will do, only fail together when *both* are down, which is far rarer.

        This is why every extra hard dependency has a cost, even a reliable one.` },

    { kind: 'concept', title: 'Blast radius: how far a failure spreads',
      body: `You cannot prevent every failure, but you can choose **how much it takes with it**. That is the **blast radius**.

        Think of the watertight compartments in a ship's hull. A hole floods one compartment, not the whole ship.

        In software you shrink the radius by splitting things up:

        - run several independent copies (cells) and give each a slice of your customers, so one bad cell hurts 10%, not 100%
        - release a new version to a few users first
        - keep the failure of a minor feature from killing the checkout

        A bug that hits everyone at once is a big blast radius. Aim for small.` },

    { kind: 'steps', title: 'Designing for failure',
      body: 'A habit more than a tool. For every part of a system, walk these four steps.',
      steps: [
        { title: 'Assume it will break', body: 'Not "if the database dies" but "**when** the database dies". Planning for a miracle is not a plan.' },
        { title: 'Ask what the user sees', body: 'An error page? A slower page? Nothing at all? Decide this on purpose, on a calm day.' },
        { title: 'Add redundancy or a fallback', body: 'A second copy, a cached answer, a simpler version of the feature. The rest of this module is a toolbox for this step.' },
        { title: 'Break it deliberately', body: 'Switch the thing off in a test and watch. Netflix made this famous with "Chaos Monkey", a tool that randomly kills servers so engineers learn their system really does survive.' }
      ] },

    { kind: 'realworld', title: 'Nobody is at 100%',
      body: `Look at the status pages and promises of big cloud providers: they promise things like "99.9%" or "99.99%" for a service, never 100%. Even the biggest companies have had outages that made the news.

        Plan around that. Whatever you build on top of other people's services inherits their failures, and your promise to *your* users cannot honestly be better than the chain beneath it, unless you add redundancy of your own.` }
  ],

  activities: [
    { type: 'bucket', after: 3, prompt: 'Which of these is a single point of failure in a typical web app?',
      buckets: ['A single point of failure', 'Safe: has a spare'],
      items: [['The only database server, with no copy', 0], ['One load balancer in front of everything', 0], ['Ten identical app servers behind a load balancer', 1], ['A database with a live replica ready to take over', 1], ['One engineer who holds the only admin password', 0], ['Servers spread across two data centres', 1]],
      explain: 'Ask "if this one thing vanished, does everything stop?" If yes, it is a SPOF. A SPOF is not always a machine: people and expiring certificates count too.' },

    { type: 'estimate', after: 4, q: 'Your service promises 99.9% availability. Roughly how many hours of downtime per year is that allowed?',
      answer: 8.76, unit: 'hours per year', tolerance: 1.6, min: 0.1, max: 1000,
      explain: 'A year is about 8,760 hours. Downtime allowed is 0.1% of that: 8,760 × 0.001 = 8.76 hours. Four nines (99.99%) would be about 53 minutes.' },

    { type: 'mcq', after: 5, q: 'A request needs three services in a row, and each one is available 99.9% of the time. What is the best estimate for the whole chain?',
      options: ['About 99.7%: slightly worse than any single part', 'Still 99.9%: the same as each part', 'About 99.99%: more services means more safety', 'About 97%: it falls off a cliff'],
      answer: 0,
      why: [null, 'Each hard dependency adds its own chance of failing, so the total cannot stay the same.', 'Extra hard dependencies never add safety. Redundant *copies* do, which is a different thing.', 'Three 99.9% parts lose roughly 0.3%, not 3%.'],
      explain: 'Chances multiply: 0.999 × 0.999 × 0.999 ≈ 0.997. Every hard dependency in a chain shaves off a little availability.' },

    { type: 'tf', statement: 'A system built from a chain of very reliable parts can be less reliable than any one of those parts.', answer: true,
      explain: 'Reliability multiplies down a chain. Ten parts at 99.9% each give about 99%. Whole-system reliability comes from redundancy and fallbacks, not just from good parts.' },

    { type: 'match', prompt: 'Match the idea to its meaning.',
      pairs: [['Single point of failure', 'One thing whose death stops everything'], ['Redundancy', 'A spare that can take over'], ['Blast radius', 'How much a failure takes down with it'], ['Availability', 'The share of time the system works'], ['Chaos engineering', 'Breaking things on purpose to test survival']],
      explain: 'These five words are the vocabulary for the rest of the module.' },

    { type: 'spot', prompt: 'This deployment config looks redundant. Tap the line that is still a single point of failure.',
      code: { lang: 'yaml', src: `
        app_servers:
          - 10.0.1.11
          - 10.0.1.12
          - 10.0.1.13
        load_balancer: 10.0.0.5
        database:
          primary: 10.0.2.20
          replica: 10.0.2.21` },
      lines: [5],
      explain: 'Three app servers and a primary with a replica are all redundant. One `load_balancer` address means one box every request passes through. If it dies, the whole site dies.' },

    { type: 'scenario', title: 'The Friday afternoon outage', intro: 'You run the shop site for a small company. At 4pm the one database server crashes. The site shows errors to every customer.',
      meters: { uptime: 50, 'customer trust': 70, cost: 60 },
      steps: [
        { text: 'The site is down and your boss is standing behind you. What do you do first?',
          choices: [
            { label: 'Restore service first, then investigate the cause once it is back', score: 2, effects: { uptime: 30, 'customer trust': 5 }, feedback: 'Right order. Customers care about the site coming back; the post-mortem can wait until the fire is out.' },
            { label: 'Spend an hour reading logs to find the exact root cause first', score: 0, effects: { uptime: -10, 'customer trust': -15 }, feedback: 'Fascinating, and every minute the site stays down costs trust. Stop the bleeding first.' },
            { label: 'Restart every server you own, just in case', score: 1, effects: { uptime: 5, 'customer trust': -5, cost: -5 }, feedback: 'Restarting the app servers does nothing for a dead database, and it adds more moving parts to a bad afternoon.' }
          ] },
        { text: 'You are back up. Your boss asks how to stop this happening again. What is the most valuable fix?',
          choices: [
            { label: 'Add a replica that can take over automatically, and test the switch', score: 2, effects: { uptime: 20, cost: -20 }, feedback: 'This removes the SPOF. Testing the switch matters: an untested failover often fails exactly when you need it.' },
            { label: 'Buy a more expensive "never-fail" database server', score: 1, effects: { uptime: 5, cost: -35 }, feedback: 'Better hardware fails less often but still fails. One big box is still one box.' },
            { label: 'Write a policy that says the database must not crash', score: 0, effects: { 'customer trust': -10 }, feedback: 'Weather does not read policies.' }
          ] },
        { text: 'Now the app servers: you have three behind one load balancer. Where is the next weakest spot?',
          choices: [
            { label: 'The single load balancer. Add a second one and share the address between them', score: 2, effects: { uptime: 15, cost: -10 }, feedback: 'Exactly. After you remove a SPOF, look at what the fix itself depends on. Redundancy is a chain to follow.' },
            { label: 'Add a fourth app server', score: 0, effects: { cost: -10 }, feedback: 'Three servers already survive one failure. The load balancer in front of them is the real single point.' },
            { label: 'Nothing. Three servers is plenty', score: 1, effects: { uptime: -5 }, feedback: 'The servers are fine. But everything still flows through one load balancer.' }
          ] }
      ],
      outro: 'Pattern: **restore first, find the single points of failure, remove them one at a time, test the spare.**' },

    { type: 'explain', prompt: 'Explain to a friend why "make every part more reliable" is not enough, and what resilient systems do instead.',
      model: 'Even very reliable parts eventually fail, and when many parts are chained together their small failure chances add up, so the whole system is less reliable than any part. Resilient systems assume failure will happen: they keep spare copies of important parts so one failure is not noticed, and they limit how far a failure can spread.',
      keywords: ['fail', 'spare', 'redundancy', 'chain', 'blast radius', 'assume'] }
  ],

  flashcards: [
    { q: 'What is a single point of failure?', a: 'Any one component whose failure takes the whole system down. It can be a server, a load balancer, a certificate or even one person.' },
    { q: 'How much downtime per year does 99.9% availability allow?', a: 'About 8.8 hours (0.1% of 8,760 hours). 99.99% allows roughly 53 minutes and 99.999% about 5 minutes.' },
    { q: 'Why does a chain of dependencies hurt availability?', a: 'Availabilities multiply. Three 99.9% services in a row give about 99.7%, so the whole is worse than any part.' },
    { q: 'What is blast radius?', a: 'How much of the system or how many users a single failure affects. Smaller is better; splitting into cells and rolling out gradually shrinks it.' },
    { q: 'What is the mindset of designing for failure?', a: 'Assume every part will break, decide what users should see when it does, add a spare or fallback, then test by breaking it deliberately.' }
  ],

  glossary: [
    { term: 'Single point of failure', def: 'One component whose failure stops the whole system.', like: 'The only bridge into a town.', aka: ['SPOF'] },
    { term: 'Redundancy', def: 'Keeping extra copies of a component so another can take over when one fails.', like: 'A spare tyre in the boot.' },
    { term: 'Availability', def: 'The proportion of time a system is working and usable, often written as a percentage such as 99.9%.', like: 'A shop\'s opening hours kept: how often the door was actually open when it should have been.', aka: ['uptime'] },
    { term: 'Blast radius', def: 'The amount of the system, or the number of users, affected when something goes wrong.', like: 'How far the windows break when a firework goes off.' },
    { term: 'Chaos engineering', def: 'Deliberately causing failures in a controlled way to check that a system really does survive them.', like: 'A fire drill.' }
  ],

  takeaways: [
    'At scale something is always broken: **plan for failure, do not hope against it**.',
    'Hunt single points of failure, including the sneaky ones (load balancers, certificates, people).',
    'Each extra nine allows ten times less downtime. 99.9% is about **8.8 hours a year**.',
    'Chained dependencies multiply downtime; **redundancy and a small blast radius** are the cure.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('rs-timeouts-retries', {
  eli5: 'When something does not answer, give up after a sensible wait, then try again politely: a bit later each time and at slightly random moments, so thousands of retries do not pile up and finish the job of breaking the server.',

  cards: [
    { kind: 'story', title: 'The phone call that never ends',
      body: `Your app needs the weather from another service. It sends the request and waits. And waits. The weather service has frozen, but it has not *said* "error"; it simply never replies.

        Your app has no deadline, so it waits forever. Meanwhile each waiting request is holding a thread, a connection and some memory. Users keep arriving. Soon *your* app has no free threads and stops answering too.

        One quiet, frozen dependency has just taken down a healthy service. This is how most big outages begin: not a bang, but **a wait with no end**.` },

    { kind: 'concept', title: 'Always set a timeout',
      body: `A **timeout** is a deadline: "if no answer in 2 seconds, stop waiting and treat it as a failure".

        Many libraries ship with *no* timeout, or one measured in minutes. Never rely on that. Every call that leaves your process (to a database, an API, a cache) needs an explicit deadline.

        How long? Look at how long it normally takes (you will learn about percentiles soon) and give it comfortable room, not ten times more. A timeout of 30 seconds on a call that normally takes 50 ms keeps 600 times too many requests stuck.

        Also set a **total** deadline for the whole user request, so five calls each waiting "just 3 seconds" do not add up to a wait nobody will sit through.` },

    { kind: 'code', title: 'A timeout in code',
      body: 'Most calls can be wrapped in a deadline. Here is the idea in JavaScript. **Tap the highlighted lines.**',
      code: { lang: 'js', src: `
        async function getWeather(city) {
          const res = await fetch(url + city, {
            signal: AbortSignal.timeout(2000)
          });
          if (!res.ok) throw new Error('HTTP ' + res.status);
          return res.json();
        }`,
        notes: {
          3: '`AbortSignal.timeout(2000)` cancels the request after 2000 ms. Without it, `fetch` could wait far longer than any user would.',
          5: 'A timeout throws an error just like any other failure, so the **caller** decides what happens next: retry, fall back, or show a message.'
        } } },

    { kind: 'metaphor', title: 'Redialling a busy friend',
      body: `You ring a friend. It rings out. What do you do?

        You do **not** hang up and redial 50 times a second. You wait a bit, try again, and if it is still ringing you wait *longer* before the next try. If you both usually call at the same moment, you might also add a little randomness so you stop colliding.

        That is the whole of retry strategy: **try again, wait longer each time, and do not all call at once**.

        Where the metaphor stops: your friend is one person. A server might have a million callers all doing the same thing.` },

    { kind: 'concept', title: 'Retries are for temporary trouble',
      body: `Many failures are brief: a dropped packet, a server restarting, a moment of overload. A retry often just works, and the user never knows.

        But retrying is not free, and not always right:

        - **Retry** timeouts, connection errors and \`503\`. These might be temporary.
        - **Do not retry** \`400\`, \`404\` or \`403\`. The same request will fail the same way.
        - **Cap it**: three or four attempts, then give up and let the caller handle it.
        - **Only retry what is safe to repeat.** A repeated \`GET\` is harmless. A repeated "charge £30" is not.

        That last one is the idempotency idea from HTTP, back again.` },

    { kind: 'sequence', title: 'Exponential backoff, with jitter',
      body: '**Exponential backoff** means doubling the wait after each failure: 1 s, 2 s, 4 s, 8 s. Step through a client that is being sensible.',
      actors: ['Client', 'Service'],
      steps: [
        { from: 0, to: 1, label: 'request (attempt 1)', note: 'The first attempt goes out immediately.' },
        { from: 1, to: 0, label: '503 busy', dashed: true, note: 'The service is overloaded.' },
        { at: 0, label: 'wait ~1 s', note: 'Short wait: maybe it was a blip.' },
        { from: 0, to: 1, label: 'request (attempt 2)', note: 'Second try.' },
        { from: 1, to: 0, label: '503 busy', dashed: true, note: 'Still struggling.' },
        { at: 0, label: 'wait ~2 s', note: 'The wait **doubles**, so a struggling service gets more breathing room each time.' },
        { from: 0, to: 1, label: 'request (attempt 3)', note: 'Third try.' },
        { from: 1, to: 0, label: '200 OK', note: 'It recovered. Done.' },
        { note: '**Jitter** means each client adds a random amount to its wait (say between 0 and the full delay). Without it, ten thousand clients that failed together all retry together, in perfect step.' }
      ] },

    { kind: 'code', title: 'Retry with backoff and jitter',
      body: 'About twelve lines that every backend developer ends up writing at least once.',
      code: { lang: 'js', src: `
        async function withRetry(fn, max = 4) {
          for (let attempt = 0; attempt < max; attempt++) {
            try {
              return await fn();
            } catch (err) {
              if (attempt === max - 1) throw err;
              const cap = Math.min(10000, 500 * 2 ** attempt);
              const wait = Math.random() * cap;
              await new Promise(r => setTimeout(r, wait));
            }
          }
        }`,
        notes: {
          1: 'A **bounded** loop. Never retry forever.',
          6: 'On the last attempt we give up and pass the error up. The caller decides what to do.',
          7: 'Backoff: 500 ms, 1 s, 2 s, 4 s… but never more than 10 s.',
          8: '**Full jitter**: pick a random wait between zero and that cap, so clients spread out instead of marching in step.'
        } } },

    { kind: 'story', title: 'The retry storm',
      body: `A database slows down under load, and some requests time out. Every client has a "helpful" retry rule: try again straight away, up to three times.

        Now each failed request becomes **four**. A service that was struggling at 100% load is suddenly handed 400%. It slows further, more things time out, more retries arrive. The retries have become the attack.

        This is a **retry storm**, and it can keep a service down long after the original problem has gone. Backoff, jitter, attempt limits and a budget ("retries may add at most 10% extra traffic") are the defences. Next lesson's **circuit breaker** is the stronger one.` },

    { kind: 'tip', title: 'Retry in one place only',
      body: `Imagine three layers: the browser retries 3 times, the API retries 3 times, and the service behind it retries 3 times. One user click can become 3 × 3 × 3 = **27** calls to the database.

        Pick one layer to own retries (usually the one closest to the failing call) and keep the others as plain pass-throughs.`,
      note: 'And because retries repeat requests, anything that changes data needs an idempotency key so the second attempt cannot do the work twice.' }
  ],

  activities: [
    { type: 'tf', after: 1, statement: 'If no timeout is set, a call to a hung service can wait for minutes, or even forever.', answer: true,
      explain: 'Many library defaults are very long or infinite. A hung call keeps holding a thread and a connection, and enough of them exhaust your service. Always set a deadline yourself.' },

    { type: 'order', after: 5, prompt: 'Put the retry behaviour in order for one request that keeps failing, using backoff.',
      items: ['Try the request straight away', 'It fails: wait a short random time (about 1 s)', 'Try again; it fails: wait about twice as long', 'Try again; it fails: wait about twice as long again', 'After the last allowed attempt, give up and report the error'],
      explain: 'Each wait grows, so a struggling service gets room to recover, and there is a firm limit so the client does not retry for ever.' },

    { type: 'bucket', prompt: 'Should the client retry this failure?',
      buckets: ['Retry (maybe temporary)', 'Do not retry (it will fail again)'],
      items: [['Connection timed out', 0], ['`503 Service Unavailable`', 0], ['`404 Not Found`', 1], ['`400 Bad Request` (invalid JSON)', 1], ['Connection reset by the other side', 0], ['`403 Forbidden`', 1], ['`POST /payments` timed out, no idempotency key', 1]],
      explain: 'Temporary conditions can clear on their own. Errors that blame the request will repeat forever, and a non-idempotent POST with no key could double-charge, so it is not safe to resend blindly.' },

    { type: 'mcq', q: 'Ten thousand clients all fail at the same instant and all use plain exponential backoff (1 s, 2 s, 4 s) with no jitter. What happens?',
      options: ['They all retry at the same moments, so the service gets synchronised spikes', 'The waits spread them out evenly, so the load is smooth', 'The retries stop because the delays grow', 'Only the first client retries and the others notice'],
      answer: 0,
      why: [null, 'Identical delays keep them lined up. Spreading needs randomness.', 'Delays grow, but the clients still retry. They just all do it together.', 'Clients do not coordinate with each other.'],
      explain: 'Without jitter, same failure time plus same delay means same retry time. Jitter adds randomness so the load arrives as a trickle instead of a wave.' },

    { type: 'ab', q: 'Which retry loop is safer for a service that is struggling?',
      a: { lang: 'js', label: 'Immediate retries', src: `
        for (let i = 0; i < 100; i++) {
          try { return await call(); } catch {}
        }` },
      b: { lang: 'js', label: 'Bounded, backed off', src: `
        for (let i = 0; i < 4; i++) {
          try { return await call(); } catch {}
          await sleep(Math.random() * 500 * 2 ** i);
        }` },
      answer: 'b',
      explain: 'One version hammers a failing service up to a hundred times with no pause, creating a storm. The other tries a few times, waits longer each time and randomises the wait.' },

    { type: 'cloze', text: 'Doubling the wait after each failure is called {{exponential}} backoff. Adding a random amount to the wait is called {{jitter}}. Without a {{timeout}}, a hung call can wait forever.',
      distractors: ['linear', 'throttle', 'cache'],
      explain: 'Backoff gives the service room, jitter spreads clients out, and a timeout makes sure each attempt ends.' },

    { type: 'estimate', q: 'A request takes about 50 ms normally. A bug makes the downstream service hang and your timeout is 30 s. Your app handles 200 requests per second. Roughly how many requests are stuck waiting after 10 seconds?',
      answer: 2000, unit: 'requests', tolerance: 1.5, min: 10, max: 100000,
      explain: '200 per second for 10 seconds is 2,000 requests, and none of them has reached its 30 s deadline yet. A timeout of 200 ms would have freed them almost immediately. This is why timeouts should be near the normal latency, not far above it.' },

    { type: 'scenario', title: 'Retry storm at midnight', intro: 'A nightly job at your company calls an internal pricing service. One night the pricing service slows down, and monitoring shows traffic to it tripled. Customers see errors.',
      meters: { uptime: 40, 'customer trust': 60, 'engineering time': 70 },
      steps: [
        { text: 'You look at the clients and find each one retries failed calls instantly, up to five times. What do you do right now to help the struggling service?',
          choices: [
            { label: 'Turn the retries off or slow them down, and let the service recover', score: 2, effects: { uptime: 30, 'customer trust': 5 }, feedback: 'Reducing the retry traffic takes the pressure off. A service cannot recover while the "helpful" clients keep tripling its load.' },
            { label: 'Add more servers to the pricing service', score: 1, effects: { uptime: 10, 'engineering time': -20 }, feedback: 'More capacity can help, but the extra traffic is coming from retries and takes minutes to arrive. Fix the cause of the flood first.' },
            { label: 'Tell the clients to retry more, to be sure requests get through', score: 0, effects: { uptime: -25, 'customer trust': -15 }, feedback: 'More retries means more load on something already overloaded. That is exactly how a retry storm grows.' }
          ] },
        { text: 'The service is back. How should the clients retry in future?',
          choices: [
            { label: 'Exponential backoff with jitter, a few attempts at most, and a timeout on every call', score: 2, effects: { uptime: 15, 'engineering time': -10 }, feedback: 'The standard combination. Each piece covers a different part of the problem.' },
            { label: 'Fixed one-second delay, unlimited attempts', score: 0, effects: { uptime: -10, 'customer trust': -5 }, feedback: 'Better than instant, but a fixed delay keeps clients synchronised and unlimited attempts mean the load never stops.' },
            { label: 'Exponential backoff but no jitter', score: 1, effects: { uptime: 5 }, feedback: 'Better, but clients that fail together still retry together. Add randomness.' }
          ] },
        { text: 'The nightly job also posts "apply discount" updates to the same service. What must be true before retrying those?',
          choices: [
            { label: 'The update must be idempotent or carry an idempotency key', score: 2, effects: { 'customer trust': 15 }, feedback: 'A repeat should never discount something twice. The key lets the server spot the repeat.' },
            { label: 'Nothing: retries are always safe', score: 0, effects: { 'customer trust': -20 }, feedback: 'Retries repeat the request. A repeated non-idempotent write can apply twice.' },
            { label: 'Never retry writes, only reads', score: 1, effects: { 'customer trust': 0 }, feedback: 'Safe but wasteful. With an idempotency key, writes can be retried safely too.' }
          ] }
      ],
      outro: 'Remember: **retries are a loan from the future.** Borrow carefully, with limits.' },

    { type: 'short', q: 'What do you call a random amount added to each client’s wait so that retries do not line up?', accept: ['jitter', 'random jitter'], hint: 'It sounds like nervousness.',
      explain: '**Jitter** spreads retries over time so a crowd of failed clients does not return in one wave.' }
  ],

  flashcards: [
    { q: 'Why must every outgoing call have a timeout?', a: 'Without one, a hung dependency holds threads and connections forever, and enough stuck requests take down your own healthy service.' },
    { q: 'Which failures are worth retrying?', a: 'Temporary ones: timeouts, connection errors, 503. Not 400, 403 or 404, which fail the same way each time.' },
    { q: 'What are exponential backoff and jitter?', a: 'Backoff doubles the wait after each failure; jitter adds randomness to the wait so many clients do not retry in lockstep.' },
    { q: 'What is a retry storm?', a: 'Retries multiplying traffic to an already struggling service, keeping it down. Prevented by backoff, jitter, attempt limits and retry budgets.' },
    { q: 'What must be true before retrying a write?', a: 'It must be idempotent, or carry an idempotency key, so a repeat does not apply twice.' }
  ],

  glossary: [
    { term: 'Timeout', def: 'A deadline after which a caller stops waiting for a response and treats the call as failed.', like: 'Hanging up after a set number of rings.' },
    { term: 'Exponential backoff', def: 'Increasing the wait between retries, usually doubling it each time.', like: 'Waiting longer before each redial.' },
    { term: 'Jitter', def: 'Randomness added to retry delays so clients do not all retry at the same moment.', like: 'People leaving a stadium at slightly different times instead of in one rush.' },
    { term: 'Retry storm', def: 'A surge of retries that overloads a struggling service and prevents its recovery.', aka: ['retry amplification'] }
  ],

  takeaways: [
    '**Every outgoing call gets a timeout.** Waiting forever is how one slow service takes down another.',
    'Retry only temporary failures and only safe (idempotent) requests, and **cap the attempts**.',
    'Space retries with **exponential backoff plus jitter**.',
    'Uncontrolled retries create **retry storms**: retry in one layer, with a budget.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('rs-circuit-breaker', {
  eli5: 'A circuit breaker notices that a service keeps failing, stops calling it for a while so nothing wastes time waiting, and then carefully tests whether it has recovered.',

  cards: [
    { kind: 'story', title: 'Ringing a number that never picks up',
      body: `Imagine your checkout page asks a recommendations service for "you might also like" items. That service has died. Every call now waits the full 2-second timeout before failing.

        Your site handles 100 requests a second. That is 200 calls stuck waiting at any moment, all holding threads and connections, for a feature that is *nice to have*. Soon the checkout itself slows to a crawl.

        Timeouts stop you waiting **forever**. But waiting 2 seconds, 100 times a second, for something you already *know* is dead is still silly. Surely, after a few failures, you would just stop ringing.` },

    { kind: 'metaphor', title: 'The fuse box',
      body: `In your home, if a faulty kettle draws too much current, a **circuit breaker** in the fuse box flips off. The wiring stops cooking itself and the rest of the house keeps its lights.

        Later you unplug the kettle and flip the switch back. If the fault is still there, it trips again immediately.

        The software version is a small piece of code wrapped around a risky call. When failures pile up, it **trips**: further calls fail instantly without even trying. After a while it lets a test call through to see whether things are fixed.

        Where the metaphor stops: a real breaker is reset by a person. The software one resets itself.` },

    { kind: 'diagram', title: 'Three states',
      body: 'A breaker is a tiny state machine. It is always in exactly one of these states.',
      nodes: [
        { id: 'c', label: 'Closed: calls flow', icon: '🟢', x: 1, y: 0, tone: 'good' },
        { id: 'o', label: 'Open: calls blocked', icon: '🔴', x: 1, y: 2, tone: 'bad' },
        { id: 'h', label: 'Half-open: testing', icon: '🟡', x: 1, y: 4, tone: 'warn' }
      ],
      edges: [
        { from: 'c', to: 'o', label: 'too many failures' },
        { from: 'o', to: 'h', label: 'wait time over' },
        { from: 'h', to: 'c', label: 'test calls succeed' },
        { from: 'h', to: 'o', label: 'a test call fails', dashed: true }
      ],
      caption: '**Closed** is normal: calls go through and failures are counted (a closed circuit lets current flow). **Open** means calls fail instantly. **Half-open** lets a few probe calls through to find out whether the service is back.' },

    { kind: 'sequence', title: 'A breaker trips and recovers',
      body: 'Step through one full cycle.',
      actors: ['App', 'Breaker', 'Service'],
      steps: [
        { from: 0, to: 1, label: 'call', note: 'The app calls through the breaker. State: **closed**.' },
        { from: 1, to: 2, label: 'forward', note: 'The call is passed on.' },
        { from: 2, to: 1, label: 'error / timeout', dashed: true, note: 'It fails. The breaker counts it. After enough failures it **trips open**.' },
        { from: 0, to: 1, label: 'call', note: 'Later, another call arrives.' },
        { from: 1, to: 0, label: 'fail fast', dashed: true, note: 'State: **open**. The breaker answers *immediately* with an error. The dead service is not touched and the app does not wait.' },
        { at: 1, label: '30 s later: half-open', note: 'After a cooling-off period, the breaker lets one trial call through.' },
        { from: 1, to: 2, label: 'trial call', note: 'A single probe, not a flood.' },
        { from: 2, to: 1, label: '200 OK', note: 'It worked. The breaker **closes** and normal traffic resumes.' }
      ] },

    { kind: 'code', title: 'A breaker in twenty lines',
      body: 'Real libraries do more, but this is the whole idea. **Tap the highlighted lines.**',
      code: { lang: 'js', src: `
        class Breaker {
          state = 'closed'; fails = 0; openedAt = 0;
          async call(fn) {
            if (this.state === 'open') {
              if (Date.now() - this.openedAt < 30000) throw new Error('open');
              this.state = 'half-open';
            }
            try {
              const result = await fn();
              this.state = 'closed'; this.fails = 0;
              return result;
            } catch (err) {
              this.fails++;
              if (this.state === 'half-open' || this.fails >= 5) {
                this.state = 'open'; this.openedAt = Date.now();
              }
              throw err;
            }
          }
        }`,
        notes: {
          5: '**Failing fast**: while open and still inside the cooling-off period, throw straight away without calling the service at all.',
          6: 'Cooling-off over: move to half-open and let this call act as the probe.',
          10: 'Any success closes the breaker and wipes the failure count.',
          14: 'Trip when five failures have piled up, or immediately if a half-open probe fails. (Real breakers usually count a *rate* over a recent window, not just a run.)'
        } } },

    { kind: 'concept', title: 'Failing fast, then falling back',
      body: `An open breaker does not magically fix anything. It turns a **slow** failure into a **fast** one. That is already a win: threads are freed and the dead service gets quiet time to recover instead of being hammered.

        The real prize is what the caller does with a fast failure. It can use a **fallback**:

        - recommendations down? Show the popular items from a cache
        - pricing service down? Show the last known price with a note
        - nothing sensible possible? Show a clear, friendly error right away

        A fast, honest "not available right now" beats a spinner that ends in an error. The graceful degradation lesson goes deeper into designing these fallbacks.` },

    { kind: 'compare', title: 'The knobs you tune',
      body: 'Breakers have settings, and the defaults are rarely right for you.',
      cols: ['What it controls', 'Too low…', 'Too high…'],
      rows: [
        ['Failure threshold', 'When to trip, e.g. 50% of recent calls failing', 'Trips on harmless blips', 'Keeps calling a dead service'],
        ['Minimum calls', 'How many calls before the rate counts', '1 failure out of 1 = "100%"', 'Slow to notice real trouble'],
        ['Open duration', 'How long to stay open', 'Probes a dead service too often', 'Stays blocked after it recovered'],
        ['Probe calls', 'How many trial calls in half-open', 'One unlucky call re-trips it', 'A flood hits a fragile service']
      ] },

    { kind: 'pitfall', title: 'Common mistakes',
      body: `- **One breaker for everything.** Give each dependency its own, so a broken recommendations service does not block payments.
        - **Counting the wrong errors.** A \`404\` or a user's invalid input is not the service being sick. Count timeouts, connection errors and \`5xx\`.
        - **No fallback.** A tripped breaker that only throws an error just changes the colour of the failure.
        - **Nobody watching.** A breaker opening is an important signal. Log it and alert on it (the observability module covers how).
        - **Never testing it.** Break a dependency on purpose and watch the breaker do its job.`,
      note: 'Netflix’s Hystrix library made the pattern famous. It is no longer developed, but modern libraries such as Resilience4j and Polly, and service meshes, offer the same idea. In the lab that follows, you will drive a flaky service yourself and watch the breaker go closed, open and half-open.' }
  ],

  activities: [
    { type: 'order', after: 3, prompt: 'Put one full breaker cycle in order.',
      items: ['Calls flow normally while failures are counted', 'Failures cross the threshold and the breaker opens', 'Calls fail instantly without touching the service', 'After a cooling-off period, a few trial calls go through', 'Trials succeed, so the breaker closes again'],
      explain: 'Closed, then open, then half-open, then closed. If the trial calls fail, it goes back to open instead.' },

    { type: 'match', after: 2, prompt: 'Match each breaker state to its behaviour.',
      pairs: [['Closed', 'Calls pass through and failures are counted'], ['Open', 'Calls are rejected straight away'], ['Half-open', 'A few trial calls test whether it recovered'], ['Tripped', 'Moved from closed to open']],
      explain: 'The names come from electrical circuits: closed means current (calls) can flow.' },

    { type: 'mcq', q: 'A service is completely dead and your timeout is 2 seconds. What does an open breaker change for the caller?',
      options: ['Calls fail in a millisecond, not after 2 seconds', 'The service is restarted automatically', 'Failed calls are retried until they finally work', 'Users never see any error'],
      answer: 0,
      why: [null, 'A breaker does not repair anything. It just stops you calling.', 'The opposite: it stops calls instead of repeating them.', 'It fails fast. What users see depends on your fallback.'],
      explain: 'Fast failure frees threads, protects the struggling service from more load, and lets the caller switch to a fallback quickly.' },

    { type: 'tf', statement: 'A circuit breaker should count a `404 Not Found` response from a healthy service as a failure that helps trip the breaker.', answer: false,
      explain: 'A 404 means the service worked and answered correctly. Count only signs that the service itself is sick: timeouts, connection failures and 5xx errors.' },

    { type: 'spot', prompt: 'This breaker configuration will misbehave. Tap the setting that is the problem.',
      code: { lang: 'yaml', src: `
        paymentsBreaker:
          failureRateThreshold: 50
          minimumCalls: 1
          openSeconds: 30
          halfOpenProbes: 3
          timeoutMs: 2000
          fallback: show-friendly-message` },
      lines: [3],
      explain: 'With `minimumCalls: 1`, a single failed call is "100% failure" and trips the breaker. Require a reasonable number of calls (say 20) before the failure rate means anything.' },

    { type: 'cloze', text: 'In the {{closed}} state calls flow. When failures pile up the breaker moves to {{open}}. After a pause it becomes {{half-open}} and lets a few probes through. A good caller also has a {{fallback}} ready.',
      distractors: ['frozen', 'retry', 'cache'],
      explain: 'The loop is closed, open, half-open, closed. The fallback is what the user sees while the breaker is open.' },

    { type: 'estimate', q: 'Your site makes 100 calls per second to a dead service and each waits for a 2-second timeout. Roughly how many calls are stuck waiting at any moment?',
      answer: 200, unit: 'concurrent calls', tolerance: 1.3, min: 1, max: 100000,
      explain: 'Calls arriving per second multiplied by seconds each one waits: 100 × 2 = 200 in flight at once. With an open breaker, each call fails in about a millisecond and almost none are waiting.' },

    { type: 'scenario', title: 'The flaky pricing service', intro: 'Your shop calls a pricing service on every product page. It starts failing about 4 calls in 5, and product pages crawl.',
      meters: { uptime: 45, 'customer trust': 55, cost: 65 },
      steps: [
        { text: 'Product pages are timing out because they wait on pricing. What do you add?',
          choices: [
            { label: 'A circuit breaker around the pricing call, with its own timeout', score: 2, effects: { uptime: 25, 'customer trust': 10 }, feedback: 'The breaker stops the wasted waiting and protects both the shop and the sick service.' },
            { label: 'A much longer timeout, so slow replies still count', score: 0, effects: { uptime: -15, 'customer trust': -10 }, feedback: 'Waiting longer holds more threads for longer, which makes your own site slower.' },
            { label: 'Retry each failed call five times immediately', score: 0, effects: { uptime: -20 }, feedback: 'Five times the load on a service that is already struggling. A retry storm in the making.' }
          ] },
        { text: 'The breaker is open. Pages now load fast but show "Price unavailable". What improves it?',
          choices: [
            { label: 'Fall back to the last known price from a cache, with "price may have changed"', score: 2, effects: { 'customer trust': 20, uptime: 10 }, feedback: 'A slightly stale price is much more useful than none, and the cache gives the pricing service time to recover.' },
            { label: 'Hide every product until pricing returns', score: 0, effects: { 'customer trust': -20 }, feedback: 'You have turned a degraded feature into a full outage.' },
            { label: 'Leave it as it is', score: 1, effects: { 'customer trust': -5 }, feedback: 'Safe, but customers cannot shop. A fallback is cheap and valuable.' }
          ] },
        { text: 'Pricing is fixed, but the breaker is still open. What should happen next on its own?',
          choices: [
            { label: 'After the cooling-off time it goes half-open, tries a few calls and closes on success', score: 2, effects: { uptime: 20 }, feedback: 'That automatic recovery is the point. Nobody has to remember to flip it back.' },
            { label: 'An engineer must flip it back by hand', score: 1, effects: { uptime: 5, cost: -10 }, feedback: 'Manual resets leave a recovered service unused until someone notices.' },
            { label: 'It should close the moment the service is up, with all traffic at once', score: 0, effects: { uptime: -15 }, feedback: 'A just-recovered service can fall over again under a flood. Probe with a trickle first.' }
          ] }
      ],
      outro: 'A breaker gives you **fast failure, a gentle recovery, and a place to plug in a fallback**.' }
  ],

  flashcards: [
    { q: 'What problem does a circuit breaker solve?', a: 'It stops callers wasting time and threads on a service that is clearly failing, and gives that service quiet time to recover.' },
    { q: 'Name the three breaker states.', a: 'Closed (calls flow), open (calls fail instantly), half-open (a few trial calls test recovery).' },
    { q: 'What moves a breaker from open to half-open?', a: 'A cooling-off timer expiring. A successful trial closes it; a failed trial reopens it.' },
    { q: 'Which errors should count towards tripping?', a: 'Signs the service is unhealthy: timeouts, connection errors and 5xx. Not 4xx caused by the caller.' },
    { q: 'Why give each dependency its own breaker?', a: 'So one failing dependency does not block calls to healthy ones.' }
  ],

  glossary: [
    { term: 'Circuit breaker', def: 'A wrapper around a risky call that stops making the call after repeated failures and retests it later.', like: 'The fuse box that trips instead of letting the wiring burn.' },
    { term: 'Fail fast', def: 'Returning an error immediately instead of waiting for a call that is likely to fail.', like: 'A shop sign saying "closed" instead of making you queue to find out.' },
    { term: 'Half-open', def: 'The breaker state where a few trial calls are let through to test whether the service has recovered.' },
    { term: 'Fallback', def: 'A backup behaviour used when the real call fails, such as a cached answer or a simpler default.', like: 'The spare key under the flowerpot.' }
  ],

  takeaways: [
    'A breaker turns a **slow failure into a fast one** and protects both sides.',
    'States: **closed** (normal), **open** (blocked), **half-open** (testing).',
    'Pair it with a **fallback**, give each dependency its own, and count only real signs of sickness.',
    'Tune the threshold, minimum calls and open time to your traffic: defaults are guesses.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('rs-throttling', {
  eli5: 'Rate limiting is a polite bouncer: if one caller sends too many requests too quickly, the service says "slow down" instead of letting everyone suffer.',

  cards: [
    { kind: 'concept', title: 'Why say no on purpose?',
      body: `Every service has a limit to how many requests it can handle. Past that, it does not serve more slowly. It falls over, and *everyone* suffers.

        Where do the surplus requests come from? Often not from villains:

        - a customer's script stuck in a loop
        - a mobile app bug that retries madly
        - one big client that suddenly sends ten times its normal traffic
        - and, sometimes, a real attacker

        **Throttling** (or **rate limiting**) means setting a cap on how many requests a caller may make in a period, and politely refusing the extras. It protects the service, keeps things fair between users, and caps your cloud bill.` },

    { kind: 'metaphor', title: 'The bouncer and the bucket of tokens',
      body: `Picture a nightclub with a bouncer who hands out wristbands. A tub holds up to 10 wristbands, and a new one drops in every second. Each person who enters takes one. Empty tub? You wait.

        This has two lovely properties:

        - A quiet crowd lets the tub fill, so a **sudden group of 10** can walk straight in (a burst).
        - But over a long time, entry cannot exceed **one person per second**, the refill rate.

        That is the **token bucket**, the most popular rate-limiting idea. Two numbers define it: the **capacity** (biggest burst) and the **refill rate** (long-run speed).` },

    { kind: 'code', title: 'A token bucket in code',
      body: 'No timers needed: work out the refill whenever a request arrives. **Tap the highlighted lines.**',
      code: { lang: 'js', src: `
        class TokenBucket {
          constructor(capacity, perSecond) {
            this.capacity = capacity;
            this.perSecond = perSecond;
            this.tokens = capacity;
            this.last = Date.now();
          }
          tryTake() {
            const now = Date.now();
            const gained = (now - this.last) / 1000 * this.perSecond;
            this.tokens = Math.min(this.capacity, this.tokens + gained);
            this.last = now;
            if (this.tokens < 1) return false;
            this.tokens -= 1;
            return true;
          }
        }`,
        notes: {
          5: 'Start full, so a new caller gets an immediate burst.',
          10: 'Work out how many tokens dripped in since the last request. Lazy refill: no background timer for each caller.',
          11: '`Math.min` stops the bucket from overflowing past its capacity.',
          13: 'No whole token left: the answer is "no". The server would send a `429` here.',
          14: 'Spend one token for this request.'
        } } },

    { kind: 'compare', title: 'Four classic algorithms',
      body: 'There is no single best one. They trade simplicity, memory and fairness.',
      cols: ['How it works', 'Good at', 'Weak at'],
      rows: [
        ['Token bucket', 'Tokens refill steadily; a request spends one', 'Allowing bursts with a steady average', 'Slightly more state per caller'],
        ['Leaky bucket', 'Requests join a queue that drains at a fixed rate', 'Smoothing traffic into an even flow', 'Bursts wait or overflow; delays requests'],
        ['Fixed window', 'Count requests per clock minute, reset at :00', 'Dead simple and cheap', 'Edge bursts (see next card)'],
        ['Sliding window', 'Count requests in the last 60 s, rolling', 'Fair, no edge effect', 'More memory and work per check']
      ] },

    { kind: 'pitfall', title: 'The fixed-window edge burst',
      body: `Say the limit is **100 requests per minute**, counted per clock minute.

        A caller sends 100 requests at 12:00:59 (allowed: the 12:00 window has room). One second later the counter resets, and they send 100 more at 12:01:00 (allowed: a fresh window).

        That is **200 requests in two seconds**, double the intended rate, and each window thinks everything is fine.

        A **sliding window** looks at "the last 60 seconds" instead of "this clock minute", so it would have refused the second batch. The price is remembering more (for example, a timestamp per request, or a weighted count of two windows).` },

    { kind: 'concept', title: 'Who is "a caller"? Per user, per key, per IP',
      body: `A limit needs a **key**: the thing being counted.

        - **Per API key or user** is the fairest, once people log in. Paying customers can even get higher limits.
        - **Per IP address** works for anonymous traffic and login pages, but is blunt: an entire office or university can sit behind one shared IP, so one busy person can block their colleagues. Meanwhile an attacker with many IPs slips through.
        - **Per endpoint**: expensive routes (search, login, password reset) deserve stricter limits than cheap ones.
        - **Global**: an overall cap that protects the whole service.

        With many app servers, the counters must be **shared** (typically in a fast store such as Redis, which you met in caching) or each server will allow its own full quota.` },

    { kind: 'sequence', title: '429 and Retry-After',
      body: 'Refusing is not the end of the conversation. Good limiters tell the caller what to do next.',
      actors: ['Client', 'Rate limiter', 'API'],
      steps: [
        { from: 0, to: 1, label: 'GET /search (request 101)', note: 'The client has used up its allowance for this minute.' },
        { at: 1, label: 'bucket empty', note: 'The limiter checks the caller’s counter. No tokens left.' },
        { from: 1, to: 0, label: '429 Too Many Requests', dashed: true, note: 'It answers **429**, the status code for exactly this. The API itself never sees the request.' },
        { note: 'The response also carries `Retry-After: 20`, meaning "come back in 20 seconds". Many APIs add headers showing the limit and what remains.' },
        { at: 0, label: 'wait 20 s (plus jitter)', note: 'A well-behaved client obeys it, which links straight back to backoff and jitter.' },
        { from: 0, to: 1, label: 'GET /search', note: 'Tokens are back.' },
        { from: 1, to: 2, label: 'forward', note: 'Now the request goes through.' },
        { from: 2, to: 0, label: '200 OK', note: 'Everyone is happy.' }
      ] },

    { kind: 'tip', title: 'Where to enforce limits',
      body: `Put limits **as early as possible**, so rejected requests cost almost nothing: at the CDN or the API gateway or the load balancer in front of your app (you met these in the scaling module).

        Then add finer limits inside the app for expensive actions. Always use \`429\` rather than \`503\` or \`500\`: it tells the client "your fault, slow down", not "we are broken", and decent clients know how to react.`,
      note: 'In the lab that follows, you will compare token bucket, fixed window and sliding window by sending bursts until the 429s start.' }
  ],

  activities: [
    { type: 'match', after: 1, prompt: 'Match each part of the bucket picture to its meaning.',
      pairs: [['Bucket capacity', 'The biggest burst allowed at once'], ['Refill rate', 'The long-run average speed allowed'], ['Empty bucket', 'The request is refused until a token drips in'], ['A token', 'One request’s worth of permission']],
      explain: 'Capacity controls burst size; refill rate controls the sustained rate. They are separate dials.' },

    { type: 'estimate', after: 2, q: 'A token bucket holds 10 tokens (starting full) and refills at 5 tokens per second. A client sends as fast as it can for 10 seconds. About how many requests are allowed?',
      answer: 60, unit: 'requests', tolerance: 1.3, min: 1, max: 10000,
      explain: 'The initial burst allows 10, then 5 per second for 10 seconds adds 50: 10 + 50 = 60. Over a long time the average settles at 5 per second.' },

    { type: 'mcq', after: 4, q: 'The limit is 100 requests per fixed clock minute. A client sends 100 at 12:00:59 and 100 at 12:01:00. What happens?',
      options: ['Both batches are allowed: 200 requests in two seconds', 'The second batch is rejected', 'Both batches are rejected', 'The limiter slows the second batch down to fit'],
      answer: 0,
      why: [null, 'A sliding window would reject it, but a fixed window resets at 12:01:00.', 'Each batch fits inside its own window.', 'Fixed windows simply count and reset. They do not smooth anything.'],
      explain: 'Fixed windows reset on the clock, so a burst straddling the boundary gets two full allowances back to back. Sliding windows and token buckets avoid this.' },

    { type: 'bucket', prompt: 'Which key suits each situation best?',
      buckets: ['Per user / API key', 'Per IP address', 'Per endpoint'],
      items: [['Paying customers with different plans', 0], ['An anonymous login page under password-guessing attack', 1], ['The expensive `/search` route that hammers the database', 2], ['A mobile app with a logged-in account that retries wildly', 0], ['Signup form abuse by unknown visitors', 1], ['Password-reset emails (each one costs money)', 2]],
      explain: 'Use the identity you trust most. Logged-in callers have accounts; anonymous ones have only an IP. Costly actions deserve their own tighter limit.' },

    { type: 'tf', statement: 'Rate limiting by IP address is always fair, because every IP address is one person.', answer: false,
      explain: 'A whole office, school or mobile carrier can share one IP, and one attacker can use thousands. IP limits are a blunt tool, best for anonymous traffic.' },

    { type: 'short', q: 'Which HTTP status code means "you are sending too many requests"?', accept: ['429', '429 too many requests'], hint: 'It is in the 4xx family and ends in 9.',
      explain: '`429 Too Many Requests`, usually with a `Retry-After` header saying how long to wait.' },

    { type: 'ab', q: 'A caller exceeds its limit. Which response is better?',
      a: { lang: 'http', label: 'Generic failure', src: `
        HTTP/1.1 500 Internal Server Error
        Content-Length: 0` },
      b: { lang: 'http', label: 'Honest and helpful', src: `
        HTTP/1.1 429 Too Many Requests
        Retry-After: 20` },
      answer: 'b',
      explain: 'A 500 says "we are broken", so clients may retry instantly and make it worse. A 429 with Retry-After blames the rate and tells the caller exactly when to return.' },

    { type: 'scenario', title: 'The enthusiastic customer', intro: 'You run a public weather API. One customer ships a new app version with a bug, and it now sends 3,000 requests per second. Other customers are getting slow responses.',
      meters: { uptime: 40, 'customer trust': 60, cost: 70 },
      steps: [
        { text: 'You need to protect the service right now. What is the best immediate step?',
          choices: [
            { label: 'Limit by API key at the gateway, so only the noisy key gets 429s', score: 2, effects: { uptime: 30, 'customer trust': 10 }, feedback: 'Targeted and fair: the buggy client is slowed, everyone else is untouched.' },
            { label: 'Block that customer’s whole company IP range for good', score: 1, effects: { uptime: 20, 'customer trust': -15 }, feedback: 'It stops the flood, but it is heavy-handed and can lock out their innocent staff too. A limit is gentler than a ban.' },
            { label: 'Buy more servers to absorb the flood', score: 0, effects: { uptime: 5, cost: -40 }, feedback: 'You are paying to serve a bug. A limit is cheaper and protects everyone.' }
          ] },
        { text: 'You choose a token bucket for each key. What does it allow that a hard "no more than 5 per second" rule does not?',
          choices: [
            { label: 'Short legitimate bursts, while keeping the long-run average capped', score: 2, effects: { 'customer trust': 15 }, feedback: 'Real users are bursty: a page may fire a dozen calls at once. The bucket permits that without raising the average.' },
            { label: 'Unlimited traffic after the first hour', score: 0, effects: { uptime: -15 }, feedback: 'The refill rate caps the long-run average always.' },
            { label: 'It lets the server choose which requests to answer', score: 1, effects: {}, feedback: 'It does not prioritise requests; it just tracks how many a caller may make.' }
          ] },
        { text: 'The buggy app now receives 429s. Its developer asks how a good client should behave.',
          choices: [
            { label: 'Read `Retry-After`, wait that long (plus jitter), then try again', score: 2, effects: { 'customer trust': 15, uptime: 10 }, feedback: 'Exactly. The server told them how long to wait, and jitter keeps all their instances from returning in a pack.' },
            { label: 'Retry immediately until it succeeds', score: 0, effects: { uptime: -15 }, feedback: 'That is how they got here. Every instant retry is another refused request.' },
            { label: 'Give up and show an error forever', score: 1, effects: { 'customer trust': -10 }, feedback: 'It protects the server but ruins the app. A pause and retry is what the limit is asking for.' }
          ] }
      ],
      outro: 'Limits are **a conversation**: refuse early, say why, say when to return.' },

    { type: 'cloze', text: 'A {{token}} bucket allows bursts, a {{leaky}} bucket drains at a fixed rate, and a {{sliding}} window avoids the edge burst of a {{fixed}} window.',
      distractors: ['sticky', 'rolling hash'],
      explain: 'Token buckets allow bursts, leaky buckets smooth output, fixed windows have edge bursts, and sliding windows count over the last N seconds.' }
  ],

  flashcards: [
    { q: 'Why rate-limit a service?', a: 'To keep it alive under floods (bugs, abuse or one big client), to keep things fair between users, and to control cost.' },
    { q: 'How does a token bucket work?', a: 'Tokens refill at a steady rate up to a capacity; each request spends one. Capacity sets the burst size and refill rate sets the long-run speed.' },
    { q: 'What is the weakness of a fixed window limit?', a: 'A burst straddling the reset can send double the limit in a short time. Sliding windows fix this at higher cost.' },
    { q: 'What do 429 and Retry-After mean?', a: '429 Too Many Requests: slow down. Retry-After says how many seconds (or until when) to wait before trying again.' },
    { q: 'Why must counters be shared across many servers?', a: 'Otherwise each server enforces its own full quota and the real limit is multiplied by the number of servers. A shared store such as Redis keeps one count.' }
  ],

  glossary: [
    { term: 'Rate limiting', def: 'Capping how many requests a caller may make in a given period and rejecting the excess.', like: 'A bouncer controlling how fast people enter.', aka: ['throttling'] },
    { term: 'Token bucket', def: 'A limiter where tokens refill at a steady rate up to a capacity, and each request spends one token.', like: 'A tub of wristbands that refills every second.' },
    { term: 'Leaky bucket', def: 'A limiter where requests wait in a queue that drains at a fixed rate, smoothing bursts into an even flow.', like: 'A bucket with a small hole in the bottom.' },
    { term: '429 Too Many Requests', def: 'The HTTP status code for "you have been rate limited", often with a Retry-After header.' },
    { term: 'Retry-After', def: 'A response header telling the client how long to wait before sending another request.' }
  ],

  takeaways: [
    'Rate limits protect a service from floods, whether bugs or bad actors, and keep users fair.',
    '**Token bucket** = bursts allowed, steady average. **Fixed window** is simple but has edge bursts; **sliding window** fixes that.',
    'Count per **user or key** when you can, per **IP** when you must, and tighter for **costly endpoints**.',
    'Refuse early with **429 + Retry-After**; clients should wait, with jitter.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('rs-backpressure', {
  eli5: 'Backpressure is the slower part of a system telling the faster part "wait, I am full", so work does not pile up until something breaks.',

  cards: [
    { kind: 'metaphor', title: 'The bath that fills faster than it drains',
      body: `Put the plug in a bath and turn the tap on full. Pull the plug a little: water drains, but slower than it arrives. The level rises. Nothing is "broken", nobody made a mistake, yet in a few minutes you are mopping the bathroom floor.

        Software has taps and drains everywhere. A website **accepts** uploads faster than a disk can store them. A fast service **sends** messages faster than a slower one can handle them. A sensor fleet **emits** readings faster than a database can write.

        When a producer outruns a consumer, something has to give. The only question is **what**, and whether you decided in advance.` },

    { kind: 'diagram', title: 'Producers, a buffer, a consumer',
      body: 'The shape is always the same. The danger lives in the middle.',
      nodes: [
        { id: 'p', label: 'Producers (fast)', icon: '📤', x: 1, y: 0 },
        { id: 'q', label: 'Queue / buffer', icon: '📦', x: 1, y: 1, tone: 'warn' },
        { id: 'c', label: 'Consumer (slower)', icon: '⚙️', x: 1, y: 2 }
      ],
      edges: [
        { from: 'p', to: 'q', label: '1,000 / second' },
        { from: 'q', to: 'c', label: '800 / second' },
        { from: 'c', to: 'p', label: 'backpressure', dashed: true }
      ],
      caption: 'Every second the buffer grows by 200 items. The dashed arrow is the missing ingredient: a way for the consumer (or the buffer) to tell the producer to slow down.' },

    { kind: 'pitfall', title: 'An unbounded queue is a time bomb',
      body: `The lazy fix is "just put a queue in the middle". A queue with **no size limit** feels safe: nothing is refused, nothing fails.

        But the queue keeps growing, quietly, and two bad things happen:

        - **Memory runs out.** The queue lives somewhere (RAM, disk) and eventually the process crashes, taking every queued item with it.
        - **Latency explodes.** If 600,000 items are waiting and you process 200 a second, the newest item waits **50 minutes**. By then the user has given up and gone, but you will still do the work.

        A queue absorbs a **short spike**. It cannot hide a *permanent* mismatch. It just delays the bad news and makes it bigger.` },

    { kind: 'concept', title: 'Three honest options',
      body: `When the buffer is full, you have exactly three choices:

        1. **Push back**: tell the producer to slow down or stop. Slowest but loses nothing.
        2. **Buffer**: hold the extra in a *bounded* queue, for short bursts only.
        3. **Drop**: throw some work away, on purpose, and say so.

        Real systems mix them. A video call drops frames rather than falling behind, because late frames are useless. A payment system pushes back, because dropping a payment is unthinkable. A log shipper might drop debug lines first.

        The decision is about the **business**: what is worse, a delay or a loss?` },

    { kind: 'compare', title: 'Push back, buffer or drop?',
      cols: ['What happens', 'Best when', 'Risk'],
      rows: [
        ['Push back', 'Producer is made to wait or is refused', 'Nothing may be lost (payments, orders)', 'Slows or errors for the caller'],
        ['Buffer (bounded)', 'Extra work waits in a limited queue', 'Spikes are short and the consumer catches up', 'Wait grows; stale work'],
        ['Drop', 'Some work is discarded, often oldest or lowest value first', 'Fresh data matters more than all data (video, metrics)', 'Data loss; must be intentional']
      ] },

    { kind: 'sequence', title: 'Backpressure in a stream',
      body: 'Programming streams have it built in. In Node.js, writing to a stream returns a flag saying "I am getting full". Step through copying a big file to a slow disk.',
      actors: ['Reader', 'Stream buffer', 'Slow disk'],
      steps: [
        { from: 0, to: 1, label: 'write(chunk)', note: 'The reader sends a chunk of the file.' },
        { from: 1, to: 0, label: 'true: send more', dashed: true, note: 'Plenty of room, so the stream says "keep going".' },
        { from: 0, to: 1, label: 'write(chunk)', note: 'More chunks arrive faster than the disk can save them.' },
        { from: 1, to: 0, label: 'false: I am full!', dashed: true, note: '**The backpressure signal.** The buffer has hit its limit.' },
        { at: 0, label: 'pause reading', note: 'A well-written reader stops, instead of ignoring the warning and piling up memory.' },
        { from: 1, to: 2, label: 'flush to disk', note: 'The buffer drains at the disk\'s pace.' },
        { from: 1, to: 0, label: '"drain" event', dashed: true, note: 'Space is free again.' },
        { at: 0, label: 'resume reading', note: 'Memory use stays flat however big the file. This is why piping streams is better than reading a whole file into memory.' }
      ] },

    { kind: 'code', title: 'A bounded queue that says no',
      body: 'A limit turns a hidden time bomb into an honest answer. **Tap the highlighted lines.**',
      code: { lang: 'js', src: `
        class BoundedQueue {
          constructor(max) { this.items = []; this.max = max; }
          offer(job) {
            if (this.items.length >= this.max) return false;
            this.items.push(job);
            return true;
          }
          take() { return this.items.shift(); }
        }

        // in the request handler
        if (!queue.offer(job)) {
          res.status(503).set('Retry-After', '5').end();
        }`,
        notes: {
          4: 'The size check **is** the backpressure. A full queue refuses new work instead of growing.',
          12: 'At the edge of the system the refusal becomes an HTTP answer: `503` (or `429`) plus `Retry-After`. The caller knows to slow down.'
        } } },

    { kind: 'realworld', title: 'Backpressure all around you',
      body: `- **TCP** has it built in: the receiver advertises how much more data it can take (the "window"), and the sender must not exceed it. You met that in networking.
        - **HTTP**: servers push back with \`429\` and \`503\` plus \`Retry-After\`, and cap their own connection and queue sizes.
        - **Message brokers**: RabbitMQ's prefetch limit stops one consumer being sent more than it can hold. Kafka consumers *pull* at their own pace, so a slow one just lags (and you watch the lag).
        - **Reactive streams** libraries (Reactor, RxJava, Akka Streams) formalise "the consumer asks for N items".`,
      note: 'Watch two numbers on any queue: its **depth** (how many are waiting) and its **age** (how long the oldest has waited). A rising age is the early warning. In the lab that follows, you will cause a backlog yourself, then try adding consumers and a limit.' }
  ],

  activities: [
    { type: 'estimate', after: 2, q: 'A queue holds 600,000 jobs and the consumers finish 200 per second. Roughly how many minutes until the newest job in the queue is processed?',
      answer: 50, unit: 'minutes', tolerance: 1.3, min: 1, max: 10000,
      explain: '600,000 ÷ 200 = 3,000 seconds, which is 50 minutes. An unbounded queue turns an overload into a very long wait for everyone behind the backlog.' },

    { type: 'tf', after: 2, statement: 'If the producer is permanently faster than the consumer, an unbounded queue between them only delays the problem.', answer: true,
      explain: 'A queue only absorbs short bursts. If the producer is permanently faster, the queue grows until memory runs out or waits become useless.' },

    { type: 'bucket', after: 4, prompt: 'What is the right response when the system is full?',
      buckets: ['Push back (refuse or slow the sender)', 'Drop some work', 'Buffer briefly'],
      items: [['Bank transfers arriving faster than the ledger can post', 0], ['Live video frames when the network is congested', 1], ['A 5-second burst of image uploads at 9am', 2], ['Debug log lines during an incident', 1], ['Orders from the checkout page', 0], ['A short spike after a push notification goes out', 2]],
      explain: 'Ask what is worse: delay or loss. Money and orders must not vanish, so push back. Stale video and debug logs are worthless late, so dropping is fine. A short spike is exactly what a bounded buffer is for.' },

    { type: 'order', prompt: 'Put the sequence of a stream with backpressure in order.',
      items: ['The reader writes chunks quickly', 'The buffer fills up and signals "full"', 'The reader pauses', 'The slow consumer drains the buffer', 'The buffer signals "drain" and the reader resumes'],
      explain: 'The signal travels backwards, from the slow end to the fast end, which is where the name comes from.' },

    { type: 'spot', prompt: 'This upload handler will eventually crash the server if uploads outpace processing. Tap the line to blame.',
      code: { lang: 'js', src: `
        const jobs = [];
        app.post('/upload', (req, res) => {
          jobs.push(req.body);
          res.send('queued');
        });
        setInterval(processOne, 1000);` },
      lines: [3],
      explain: 'Line 3 pushes onto an array with no limit, while one job is processed per second. If uploads arrive faster, the array grows until memory is gone. Check the length first and answer 503 when it is full.' },

    { type: 'mcq', q: 'A consumer reads messages from a broker and can only process 10 at a time. Which setting best matches "backpressure"?',
      options: ['Limit how many unacknowledged messages the broker will send it at once', 'Add a bigger buffer so the broker never has to wait', 'Make the producer send faster so the queue stays short', 'Delete messages older than a minute without telling anyone'],
      answer: 0,
      why: [null, 'A bigger buffer only delays the problem.', 'More input makes the mismatch worse.', 'Silent loss is dropping without a decision, the opposite of controlled pressure.'],
      explain: 'A prefetch or in-flight limit stops the broker handing over more than the consumer can hold. The producer side then sees the queue fill and can slow down.' },

    { type: 'ab', q: 'Which queue handler is more resilient to an overload?',
      a: { lang: 'js', label: 'Accept everything', src: `
        function enqueue(job) {
          queue.push(job);
          return 'accepted';
        }` },
      b: { lang: 'js', label: 'Bounded and honest', src: `
        function enqueue(job) {
          if (queue.length >= MAX) return 'busy, retry later';
          queue.push(job);
          return 'accepted';
        }` },
      answer: 'b',
      explain: 'Saying "busy" early is far kinder than accepting work you cannot finish and crashing. The caller can back off and retry, and the system stays alive.' },

    { type: 'scenario', title: 'The sensor flood', intro: 'A fleet of 50,000 smart thermostats posts readings to your service every few seconds. After a firmware update they all send faster. Your database cannot keep up and the queue between them is growing by the minute.',
      meters: { uptime: 50, 'data completeness': 80, cost: 65 },
      steps: [
        { text: 'The queue has no limit and memory is at 90%. What first?',
          choices: [
            { label: 'Cap the queue and refuse or drop beyond it, so the service stays up', score: 2, effects: { uptime: 25, 'data completeness': -10 }, feedback: 'Surviving is the priority. A bounded queue turns a crash into a controlled loss of the least valuable data.' },
            { label: 'Increase the server\'s memory and let the queue grow', score: 0, effects: { uptime: -10, cost: -25 }, feedback: 'That buys minutes, not a fix. The mismatch is permanent, so the queue just gets bigger.' },
            { label: 'Restart the queue to empty it', score: 1, effects: { uptime: 5, 'data completeness': -30 }, feedback: 'It clears memory but silently loses everything queued, then fills again.' }
          ] },
        { text: 'Which readings should be dropped first when the queue is full?',
          choices: [
            { label: 'Older readings, and sample or skip repeats from one device', score: 2, effects: { 'data completeness': 10 }, feedback: 'For a temperature feed, fresh data matters and old readings are replaceable. Dropping on purpose beats dropping at random.' },
            { label: 'Alerts from fire sensors', score: 0, effects: { 'data completeness': -20, uptime: -10 }, feedback: 'These are the most valuable messages. Drop by value, not by accident.' },
            { label: 'Whichever arrives next, whatever it is', score: 1, effects: { 'data completeness': -5 }, feedback: 'Simple, but blind. Better to choose which data to give up.' }
          ] },
        { text: 'Now fix the cause. What helps most for the long term?',
          choices: [
            { label: 'Tell devices to slow down (a response header or config), and add consumers or batch writes', score: 2, effects: { uptime: 20, 'data completeness': 15, cost: -10 }, feedback: 'Push back at the source and raise the drain rate. Both ends of the mismatch are addressed.' },
            { label: 'Do nothing now that it has stabilised', score: 0, effects: { uptime: -10 }, feedback: 'The next firmware update will repeat this.' },
            { label: 'Tell devices to retry every time a send is refused', score: 0, effects: { uptime: -20 }, feedback: 'Retrying instantly turns a refusal into more load.' }
          ] }
      ],
      outro: 'The order that works: **keep alive, drop on purpose, fix the mismatch at both ends**.' },

    { type: 'short', q: 'What is the word for a slow part of a system signalling a fast part to slow down?', accept: ['backpressure', 'back pressure'], hint: 'Pressure pushing in the opposite direction to the flow.',
      explain: '**Backpressure** pushes the "slow down" signal back up the pipeline, from the part that is full to the part that is producing.' }
  ],

  flashcards: [
    { q: 'What is backpressure?', a: 'A signal from a slower, fuller part of a pipeline to a faster upstream part telling it to slow down or stop.' },
    { q: 'Why is an unbounded queue dangerous?', a: 'If the producer stays faster, it grows without limit: memory runs out, waits become huge and a crash loses everything queued.' },
    { q: 'What are the three things you can do when a buffer is full?', a: 'Push back (refuse or slow the producer), buffer in a bounded queue for short spikes, or drop work on purpose.' },
    { q: 'What two numbers should you watch on a queue?', a: 'Depth (how many items wait) and age (how long the oldest has waited). Rising age is the early warning.' },
    { q: 'How does HTTP express backpressure?', a: 'Servers answer 429 or 503, usually with Retry-After, and cap their own connections and queues.' }
  ],

  glossary: [
    { term: 'Backpressure', def: 'Resistance that tells a fast producer to slow down because the consumer or buffer is full.', like: 'A full bath: the water has nowhere to go but back.' },
    { term: 'Bounded queue', def: 'A queue with a fixed maximum size that refuses or drops items when full.', like: 'A waiting room with a set number of chairs.' },
    { term: 'Producer / consumer', def: 'The part of a system that creates work, and the part that processes it.', like: 'The tap and the drain.' },
    { term: 'Queue depth', def: 'The number of items currently waiting in a queue.' },
    { term: 'Load shedding', def: 'Deliberately dropping some work to protect the rest. Covered fully in the next lesson.' }
  ],

  takeaways: [
    'When a producer outruns a consumer, **something has to give**. Decide what in advance.',
    'An **unbounded queue** only hides the problem: memory and waiting time grow until it breaks.',
    'Your options: **push back, buffer (bounded), or drop**, chosen by what the business can afford to lose.',
    'Streams, TCP, brokers and HTTP all have built-in backpressure. Use it instead of fighting it.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('rs-loadshifting', {
  eli5: 'If too much work arrives at once, either do some of it later when things are quiet, or, if you truly cannot cope, skip the least important work so the important work still happens.',

  cards: [
    { kind: 'concept', title: 'Peaks cost money',
      body: `Traffic is rarely flat. A food-delivery app is slammed at 7pm. A shop explodes on Black Friday. A payroll system is busy on the last working day of the month.

        If you buy enough servers for the **peak**, they sit idle most of the day. If you buy for the average, the peak knocks you over.

        Two cheaper ideas sit between those extremes:

        - **Load shifting**: some work does not have to happen *now*. Move it to a quieter time.
        - **Load shedding**: when you are overloaded anyway, drop the least important work to protect the rest.

        Both start with the same question: **does this really need to happen right now, for everyone?**` },

    { kind: 'metaphor', title: 'The restaurant and the dishwasher',
      body: `A restaurant takes your order, brings your meal, and moves on. The dirty plates pile up in the kitchen. They get washed after the rush, not between courses.

        Washing is real work, but nobody at table 4 is waiting for it. So it is **shifted** to a quiet moment.

        Now imagine the dinner rush is so intense that the kitchen cannot keep up. The manager takes the desserts and fancy specials off the menu until it calms down. That is **shedding**: fewer things on offer so the main courses still arrive.

        Where the metaphor stops: a restaurant can see its queue. Software must measure its own.` },

    { kind: 'sequence', title: 'Accept now, finish later',
      body: 'The classic shift: answer quickly, and do the slow part in the background. You met queues in the messaging module.',
      actors: ['User', 'Web app', 'Queue', 'Worker'],
      steps: [
        { from: 0, to: 1, label: 'POST /reports (export my data)', note: 'The user asks for a big export that takes minutes to build.' },
        { from: 1, to: 2, label: 'enqueue job', note: 'The app does **not** build it now. It writes a job on a queue.' },
        { from: 1, to: 0, label: '202 Accepted', note: '`202 Accepted` means "got it, working on it". The user is told within milliseconds.' },
        { from: 2, to: 3, label: 'job', note: 'A worker picks up the job whenever it has capacity. At peak it may wait a bit.' },
        { at: 3, label: 'build the report', note: 'Heavy work happens off the request path.' },
        { from: 3, to: 0, label: 'email: your report is ready', note: 'The user is told later, by email or a notification. Nobody sat waiting.' }
      ] },

    { kind: 'compare', title: 'Shifting work in time',
      body: 'Not everything is urgent. Sort your work by how soon someone needs the result.',
      cols: ['Needs it…', 'Typical tools'],
      rows: [
        ['Sending a welcome email', 'In seconds, but not in the request', 'A queue and workers'],
        ['Resizing uploaded photos', 'Soon, someone is waiting', 'A queue, workers that scale up'],
        ['Daily sales report', 'By morning', 'A scheduled job (cron) at 3am'],
        ['Database clean-up, backups, re-indexing', 'Sometime off-peak', 'Scheduled jobs in the quiet window'],
        ['Showing a product page', 'Right now', 'Never shift: it must be in the request']
      ],
      note: 'Pricing can shift load too: some cloud services charge less for spare capacity or batch work, as a reward for flexible timing.' },

    { kind: 'concept', title: 'Load shedding: choosing what to drop',
      body: `Shifting works when work can wait. Sometimes you are simply **overloaded right now** and no amount of waiting helps.

        If you try to do everything, you do everything badly: queues grow, every request slows, timeouts fire, retries pile in, and soon nothing works for anyone.

        **Shedding** means refusing some requests quickly so the rest get good service. It is the same logic as hospital triage: with too many patients, the minor sprain waits so the heart attack gets seen.

        Refusing a request costs almost nothing. Half-doing it and then timing out costs the most. So shed **early and cheaply**, before the expensive work starts.` },

    { kind: 'layers', title: 'Prioritise: what to protect first',
      body: 'Decide the ranking **before** the crisis, with the business. Top is protected longest; the bottom is shed first.',
      layers: [
        { label: 'Payments and checkout', note: 'Money in. Protect at almost any cost.', tone: 'good', icon: '💳' },
        { label: 'Sign-in and account basics', note: 'Without these, nobody gets anywhere.', tone: 'accent', icon: '🔑' },
        { label: 'Browsing and search', note: 'Important, but a slower or simpler version is tolerable.', tone: 'info', icon: '🔍' },
        { label: 'Recommendations and personalisation', note: 'Nice to have. Skip it under pressure.', tone: 'warn', icon: '✨' },
        { label: 'Analytics, reports and bulk exports', note: 'Shed first. Run later.', tone: 'bad', icon: '📊' }
      ] },

    { kind: 'code', title: 'A tiny load shedder',
      body: 'It looks at how busy the server is and refuses the least important requests first. **Tap the highlighted lines.**',
      code: { lang: 'js', src: `
        function shed(req, res, next) {
          const busy = inFlight > 200;
          if (busy && priority(req) === 'low') {
            res.set('Retry-After', '10');
            return res.status(503).end();
          }
          next();
        }`,
        notes: {
          2: 'A simple "am I overloaded?" signal. Real systems use in-flight requests, queue age, CPU or latency, whichever reflects trouble fastest.',
          3: 'Only **low-priority** traffic is refused. Payments carry on. The priority could come from the URL, a header or the type of customer.',
          5: 'Refuse quickly, with `503` and `Retry-After`, so well-behaved clients wait before trying again.'
        } } },

    { kind: 'pitfall', title: 'Shedding done badly',
      body: `- **Shedding at random.** If every request has the same chance of being refused, you refuse payments as readily as page views. Prioritise.
        - **Shedding too late.** Rejecting a request after you did 90% of the work saves nothing. Check load at the front door.
        - **Clients that retry instantly.** If rejected callers hammer straight back, the shed load returns at once. Say \`Retry-After\`, and make clients use backoff.
        - **Shedding forever.** If you are always shedding, you are under-provisioned. It is a safety valve, not a capacity plan.
        - **Not telling anyone.** A silent drop looks like a bug. Count what you shed and show it on a dashboard.` },

    { kind: 'tip', title: 'Shift, shed, or neither?',
      body: `A quick test for any piece of work:

        - Could it happen **later** without anyone minding? **Shift** it.
        - Could it be **skipped** for a while with an acceptable cost? Make it **sheddable**.
        - Does the user need it now, and is it core? **Protect** it and give it capacity first.

        These three buckets, decided in calm, are what you will wish you had during an incident.`,
      note: 'Rate limiting (last lesson) is about one caller sending too much. Shedding is about the whole system having too much, whoever sent it.' }
  ],

  activities: [
    { type: 'bucket', after: 3, prompt: 'Shift it to later, or it must happen now?',
      buckets: ['Shift to later', 'Must happen now'],
      items: [['Generating the monthly invoice PDFs', 0], ['Charging the customer’s card at checkout', 1], ['Sending a "thanks for signing up" email', 0], ['Loading the product page', 1], ['Rebuilding the search index', 0], ['Checking a password at login', 1]],
      explain: 'Ask "is a person waiting on this result right now?" If not, put it on a queue or schedule it for a quiet time.' },

    { type: 'mcq', after: 2, q: 'A user uploads a big video. Which response keeps the app responsive?',
      options: ['Queue a transcoding job and answer `202 Accepted` at once', 'Transcode it inside the request and make the user wait', 'Reject the upload during busy hours', 'Transcode it twice to be safe'],
      answer: 0,
      why: [null, 'That ties up a server thread for minutes per upload and invites timeouts.', 'Rejecting is shedding, which is for real overload. Here the work can simply wait.', 'Doing more work is the opposite of reducing load.'],
      explain: 'The slow, heavy work is moved off the request path onto a queue and workers. The user gets a fast "accepted" and a later notification.' },

    { type: 'estimate', after: 3, q: 'Traffic is 1,000 requests per second for 1 hour a day and 100 per second for the other 23 hours. If you buy capacity for the peak, about how many times more capacity do you own than the daily average needs?',
      answer: 7.3, unit: 'times the average', tolerance: 1.4, min: 0.5, max: 100,
      explain: 'The daily total is 1,000×1 + 100×23 = 3,300 request-hours, so the average is about 137 per second. Peak ÷ average = 1,000 ÷ 137 ≈ 7.3. Shifting some work to quiet hours and shedding the rest shrinks that gap.' },

    { type: 'order', prompt: 'Rank these by how long you would protect them under heavy load (protect longest first).',
      items: ['Payment processing', 'User sign-in', 'Product search', 'Personalised recommendations', 'Bulk analytics export'],
      explain: 'Money first, then access, then core browsing, then extras, then work that can run any time. Agree this ranking with the business before you need it.' },

    { type: 'tf', statement: 'Shedding some load on purpose during a surge can keep a system useful for most of its users.', answer: true,
      explain: 'Shedding is a deliberate safety valve, not a sign the system is broken. Capacity has limits and traffic has surprises. Dropping the least important work on purpose beats failing for everyone.' },

    { type: 'ab', q: 'The server is overloaded. Which shedding rule is better?',
      a: { lang: 'js', label: 'Reject at random', src: `
        if (busy && Math.random() < 0.3) {
          return res.status(503).end();
        }` },
      b: { lang: 'js', label: 'Reject low priority', src: `
        if (busy && priority(req) === 'low') {
          return res.status(503).end();
        }` },
      answer: 'b',
      explain: 'Random rejection throws away payments as readily as page views. Prioritised shedding protects what matters and gives up the cheapest things first.' },

    { type: 'multi', q: 'Which of these make load shedding work well?',
      options: ['Rejecting early, before expensive work starts', 'Sending `Retry-After` so clients wait', 'Deciding priorities before an incident', 'Dropping random requests so it is fair', 'Hiding the drops so nobody panics'],
      answers: [0, 1, 2],
      explain: 'Early rejection is cheap, Retry-After avoids a stampede back, and priorities decide what to give up. Random and hidden drops are the mistakes to avoid.' },

    { type: 'scenario', title: 'Black Friday, 11:58am', intro: 'Your shop is in the middle of its biggest sale. Traffic is four times normal. The servers are at 95% and response times are climbing.',
      meters: { uptime: 55, revenue: 60, 'customer trust': 70 },
      steps: [
        { text: 'You cannot add servers in time. What do you do first?',
          choices: [
            { label: 'Pause non-essential background jobs and stop heavy features like recommendations', score: 2, effects: { uptime: 20, revenue: 10 }, feedback: 'You freed capacity for checkout by shifting and shedding what customers will not miss right now.' },
            { label: 'Let everything run and hope it holds', score: 0, effects: { uptime: -25, revenue: -25, 'customer trust': -15 }, feedback: 'At 95% load, latency spikes, timeouts start and retries make it worse. Hoping is not a strategy.' },
            { label: 'Turn the whole site off for a while', score: 0, effects: { uptime: -30, revenue: -40 }, feedback: 'You have shed 100% of the load, including the most valuable part.' }
          ] },
        { text: 'The checkout queue is still long. How should you refuse excess browsing traffic?',
          choices: [
            { label: 'Return `503` with `Retry-After` for low-priority pages, at the edge', score: 2, effects: { uptime: 15, revenue: 15 }, feedback: 'Cheap, early, and tells well-behaved clients when to return.' },
            { label: 'Let requests in, start rendering them and time out after 30 seconds', score: 0, effects: { uptime: -15 }, feedback: 'Slow failure uses the most resources and gives nothing back.' },
            { label: 'Shed every fifth request regardless of type', score: 1, effects: { uptime: 5, revenue: -10 }, feedback: 'It lowers load but also drops one in five payments.' }
          ] },
        { text: 'The sale ends. Orders created in the rush need confirmation emails and invoices. When?',
          choices: [
            { label: 'Queue them and let workers catch up as traffic falls', score: 2, effects: { 'customer trust': 15, uptime: 5 }, feedback: 'A late email is fine. Shifting it left checkout free for orders.' },
            { label: 'Send them all inline immediately, before taking the next order', score: 0, effects: { uptime: -20 }, feedback: 'Slow email calls would block the checkout path.' },
            { label: 'Skip the emails', score: 1, effects: { 'customer trust': -15 }, feedback: 'Cheaper, but customers wonder if their order worked.' }
          ] }
      ],
      outro: 'Peaks are survived by **protecting the core, shifting what can wait, and shedding what cannot be afforded**.' },

    { type: 'short', q: 'Which status code means "accepted for processing, but not finished yet", used when work is queued for later?', accept: ['202', '202 accepted'], hint: 'It is in the 2xx family, one above 201.',
      explain: '`202 Accepted`: the request was received and will be processed later, so the caller gets a fast reply while the slow work happens elsewhere.' }
  ],

  flashcards: [
    { q: 'What is load shifting?', a: 'Moving work that does not need to happen immediately to a quieter time, using queues, workers and scheduled jobs.' },
    { q: 'What is load shedding?', a: 'Deliberately refusing or dropping the least important work when overloaded, so the important work still succeeds.' },
    { q: 'Why shed early?', a: 'Rejecting at the front door costs almost nothing. Rejecting after doing most of the work wastes everything.' },
    { q: 'What does 202 Accepted mean?', a: 'The request has been accepted and will be processed later. It is used for work moved onto a queue.' },
    { q: 'What decisions should you make before an overload?', a: 'Which traffic is highest priority, which work can wait, and which can be dropped, so the response is automatic.' }
  ],

  glossary: [
    { term: 'Load shifting', def: 'Moving work from a busy time to a quieter one, for example with queues or scheduled jobs.', like: 'Washing the dishes after the dinner rush.' },
    { term: 'Load shedding', def: 'Deliberately dropping low-priority work during overload to protect important work.', like: 'Triage in an emergency room.' },
    { term: 'Scheduled job', def: 'A task that runs automatically at set times, such as every night at 3am.', like: 'A bin lorry on its weekly round.', aka: ['cron job'] },
    { term: '202 Accepted', def: 'An HTTP status meaning the request was received and will be handled later.' }
  ],

  takeaways: [
    'Buying for the peak wastes money; **shift** what can wait and **shed** what cannot be afforded.',
    'Shift with **queues, workers and scheduled jobs**, replying `202 Accepted` quickly.',
    'Shed **early, cheaply and by priority**, with `Retry-After`, never at random.',
    'Decide the **priority ranking in calm**, with the business, before the incident.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('rs-graceful-degradation', {
  eli5: 'When part of a system breaks, a well-built one keeps working in a simpler, slightly worse way instead of falling over completely.',

  cards: [
    { kind: 'story', title: 'The streaming app that kept streaming',
      body: `Picture a streaming app on a Friday night. Behind the scenes, the "recommended for you" service has crashed.

        A fragile app would show a blank screen or an error: the home page needs recommendations, recommendations are dead, so *nothing works*.

        A resilient app notices, shrugs, and shows a generic "Popular right now" row instead. Most viewers do not even notice. They search, press play and carry on with their evening.

        The principle: **a worse experience beats no experience.** The feature that failed was never the reason people came.` },

    { kind: 'metaphor', title: 'Limp-home mode',
      body: `Many modern cars have a "limp-home" mode. If a sensor fails, the engine does not simply stop on the motorway. It cuts power, limits speed and lights a warning, so you can get to a garage.

        The car decided *in advance* what to do when part of it breaks: keep the essential thing (moving) and give up the rest (speed, comfort).

        Software can do the same. Decide which parts are essential, and what the reduced version of everything else looks like. Then build it, and test it, **before** the day it matters.

        Where the metaphor stops: a car has one limp mode. A big system may have many, one per feature.` },

    { kind: 'layers', title: 'The ladder of fallbacks',
      body: 'For one feature, list the answers from best to worst. When one rung fails, step down to the next. Top is best.',
      layers: [
        { label: 'Live, personalised answer', note: 'The real service, with a tight timeout.', tone: 'good', icon: '✅' },
        { label: 'Cached answer', note: 'The last good result for this user (or a similar one). Slightly stale.', tone: 'accent', icon: '🗃️' },
        { label: 'Generic default', note: 'The same safe answer for everyone, like "Popular right now".', tone: 'info', icon: '📋' },
        { label: 'Feature hidden', note: 'Remove the box from the page entirely, without an error.', tone: 'warn', icon: '🙈' },
        { label: 'Clear, honest error', note: 'Only for things that truly cannot be skipped. Say what is wrong and when to try again.', tone: 'bad', icon: '🛑' }
      ] },

    { kind: 'code', title: 'A page that survives its helpers',
      body: 'The product page needs the product. Recommendations are a bonus. **Tap the highlighted lines.**',
      code: { lang: 'js', src: `
        async function productPage(id) {
          const product = await getProduct(id);
          let recs = [];
          if (flags.isOn('recommendations')) {
            try {
              recs = await withTimeout(getRecs(id), 300);
            } catch {
              recs = (await cache.get('popular')) ?? [];
            }
          }
          return render(product, recs);
        }`,
        notes: {
          3: 'The safe default is **an empty list**, so the page can always render even if everything below fails.',
          4: 'A **feature flag** (a switch in config): flip \`recommendations\` off and this whole block is skipped without a deployment.',
          6: 'A short timeout, because a slow bonus feature must never hold up the main content.',
          8: 'The **fallback**: popular items from a cache. If even that is missing, an empty list.'
        } } },

    { kind: 'concept', title: 'Feature flags and kill switches',
      body: `A **feature flag** is an on/off switch in configuration that your code checks at runtime. Flags let you ship code that is turned off, enable it for 5% of users, and turn it off again, all without redeploying.

        A **kill switch** is a flag you add *specifically* for emergencies: a big red button that disables a risky or expensive feature instantly.

        During an incident that is gold. Instead of rushing a code fix at 3am, you flip the switch and the heavy feature steps aside while the core carries on.

        Keep flags tidy: each one is another path to test, and old flags left in the code become clutter and confusion.` },

    { kind: 'diagram', title: 'Bulkheads: separate compartments',
      body: 'On a ship, bulkheads are walls that stop one flooded section sinking the whole vessel. In software, they separate resources so one slow dependency cannot use them all.',
      nodes: [
        { id: 'app', label: 'Product page service', icon: '🖥️', x: 1, y: 0 },
        { id: 'p1', label: 'Pool A: 20 threads', icon: '🧱', x: 0, y: 1, tone: 'good' },
        { id: 'p2', label: 'Pool B: 5 threads', icon: '🧱', x: 2, y: 1, tone: 'warn' },
        { id: 'pay', label: 'Payments service', x: 0, y: 2, tone: 'good' },
        { id: 'rec', label: 'Recommendations (slow!)', x: 2, y: 2, tone: 'bad' }
      ],
      edges: [
        { from: 'app', to: 'p1' }, { from: 'app', to: 'p2' },
        { from: 'p1', to: 'pay' }, { from: 'p2', to: 'rec', label: 'hanging' }
      ],
      caption: 'Recommendations hang and use up all 5 threads in their own pool. Payments still has its 20. With **one shared pool**, the slow service would have soaked up every thread and taken payments down with it.' },

    { kind: 'pitfall', title: 'Fallbacks that fail you',
      body: `- **Untested fallbacks.** Code that only runs during outages is code nobody has run. Test it, and break things on purpose to exercise it.
        - **A fallback heavier than the thing it replaces.** If the cache is down and every request now falls back to a slow database query, you have created the overload you wanted to avoid.
        - **Silent degradation.** If the site is quietly serving stale data, someone needs to know. Count fallbacks and alert on them.
        - **Pretending everything is fine.** Showing yesterday's stock level as live can oversell. Some honesty ("prices may be out of date") is better than a confident lie.
        - **Degrading what must not degrade.** Never fall back to "skip the payment check".` },

    { kind: 'steps', title: 'Designing the degraded mode on purpose',
      body: 'Degradation should be decided in a meeting, not discovered in an outage. For each feature:',
      steps: [
        { title: 'Rank it', body: 'Is it **core** (checkout), **important** (search) or **nice** (recommendations)? Only the core is allowed to take the site down.' },
        { title: 'Choose its fallback', body: 'Cached? Generic? Hidden? Write the fallback ladder down for each feature.' },
        { title: 'Add the guards', body: 'A timeout, a circuit breaker, a separate resource pool and a feature flag around every risky dependency.' },
        { title: 'Make it visible', body: 'Show users what is reduced ("recommendations unavailable") and alert the team that you are in degraded mode.' },
        { title: 'Rehearse', body: 'Switch each dependency off in a test and check that the page still works. Do it regularly, since systems drift.' }
      ] },

    { kind: 'realworld', title: 'You have seen this before',
      body: `- A maps app that keeps your **downloaded map** when the signal drops.
        - A shop that lets you browse and add to a basket but says "checkout is busy, try again soon".
        - A news site that shows **cached** articles when its comment system is down.
        - A video call that drops **video** but keeps the audio.

        In every case a non-essential part gave way so the essential part could stay. Users forgive "reduced", but rarely forgive "gone".` }
  ],

  activities: [
    { type: 'order', after: 2, prompt: 'Put the fallback ladder in order, best experience first.',
      items: ['Live personalised answer', 'Cached answer for this user', 'Generic default for everyone', 'Feature hidden from the page', 'Clear error message'],
      explain: 'Each step down is less good but still better than breaking the page. Only the last step tells the user something is wrong.' },

    { type: 'mcq', after: 5, q: 'Recommendations hang. In a design with **one shared thread pool**, what happens to checkout?',
      options: ['It stalls too: hung calls hold every shared thread', 'Nothing: checkout is a different feature', 'Checkout automatically gets extra threads', 'The slow service is skipped at once'],
      answer: 0,
      why: [null, 'Features that share a pool compete for the same threads, however different they are.', 'Pools do not grow on their own, and extra threads would also hang.', 'A skip needs a timeout or breaker. Without one, calls keep waiting.'],
      explain: 'This is the case for bulkheads: give each dependency its own limited pool so one slow neighbour cannot starve the rest.' },

    { type: 'bucket', prompt: 'Is this feature core (must work) or degradable (can step aside)?',
      buckets: ['Core: protect it', 'Degradable: can fall back or hide'],
      items: [['Taking a payment', 0], ['"Customers also bought" row', 1], ['Logging in', 0], ['Live chat widget', 1], ['Product reviews section', 1], ['Showing the order total in the basket', 0], ['Personalised homepage banner', 1]],
      explain: 'Core is what the user came to do and the business needs to earn. Everything around it should be able to disappear without taking the page down.' },

    { type: 'spot', prompt: 'This page makes recommendations a hard requirement. Tap the line that lets a broken helper take down the whole page.',
      code: { lang: 'js', src: `
        async function productPage(id) {
          const product = await getProduct(id);
          const recs = await getRecs(id);
          return render(product, recs);
        }` },
      lines: [3],
      explain: 'Line 3 waits for recommendations with no timeout and no fallback. If they fail, the whole function throws and the product page fails with them. Wrap the call in a timeout and catch, defaulting to an empty list.' },

    { type: 'tf', statement: 'A fallback that is never exercised in testing is a reliable safety net.', answer: false,
      explain: 'Code that only runs during outages is the least tested code you own. Rehearse your fallbacks by switching dependencies off on purpose.' },

    { type: 'ab', q: 'Recommendations are down. Which behaviour is better for the user?',
      a: { lang: 'js', label: 'Hard fail', src: `
        const recs = await getRecs(id);
        return render(product, recs);` },
      b: { lang: 'js', label: 'Degrade', src: `
        const recs = await getRecs(id).catch(() => popular);
        return render(product, recs);` },
      answer: 'b',
      explain: 'One version turns a missing bonus into a broken page. The other shows a sensible default and the user can still buy things.' },

    { type: 'scenario', title: 'The search box that took the site down', intro: 'Your shop has a search service on its own cluster. During a sale it slows to a crawl, and now the whole homepage is timing out because it waits for search suggestions.',
      meters: { uptime: 40, revenue: 55, 'customer trust': 65 },
      steps: [
        { text: 'The sale is live and the homepage is slow. Quickest safe action?',
          choices: [
            { label: 'Flip the kill switch that turns off search suggestions', score: 2, effects: { uptime: 30, revenue: 15 }, feedback: 'Instantly the page stops waiting for suggestions and loads. The core path is protected while search recovers.' },
            { label: 'Deploy a code change to rewrite the homepage', score: 0, effects: { uptime: -10, revenue: -15 }, feedback: 'A hurried rewrite in the middle of an incident adds risk and takes longer than a switch.' },
            { label: 'Extend the timeout so suggestions have longer to answer', score: 0, effects: { uptime: -20, 'customer trust': -10 }, feedback: 'Waiting longer holds more threads for longer on a service that is already drowning.' }
          ] },
        { text: 'After the sale you want this never to happen again. What is the most valuable change?',
          choices: [
            { label: 'A short timeout, its own thread pool and a cached-suggestions fallback', score: 2, effects: { uptime: 20, 'customer trust': 10 }, feedback: 'Three layers: a deadline, a compartment and something to show. A failing search then costs you a nicety, not the homepage.' },
            { label: 'Make search servers bigger and never let it fail', score: 1, effects: { uptime: 5, revenue: -10 }, feedback: 'It helps, but anything can fail. The homepage should survive when it does.' },
            { label: 'Nothing; it was a one-off', score: 0, effects: { 'customer trust': -10 }, feedback: 'One-off events are how outages repeat.' }
          ] },
        { text: 'Someone proposes: "when search is down, skip the stock check on checkout too, to be safe." Your view?',
          choices: [
            { label: 'No: protect core rules; only truly optional features should degrade', score: 2, effects: { revenue: 10, 'customer trust': 10 }, feedback: 'Selling stock you do not have is far worse than a missing suggestion. Degrade the nice-to-haves, not the safeguards.' },
            { label: 'Yes: keep things simple and fast', score: 0, effects: { revenue: -20, 'customer trust': -20 }, feedback: 'Overselling creates refunds, apologies and angry customers.' },
            { label: 'Yes, but only on Fridays', score: 0, effects: { 'customer trust': -10 }, feedback: 'Weakening a safeguard some of the time is still weakening it.' }
          ] }
      ],
      outro: 'Good degradation is **chosen in advance**: the nice-to-haves bend so the essentials do not break.' },

    { type: 'short', q: 'What is the name for an emergency feature flag that instantly disables a risky feature?', accept: ['kill switch', 'killswitch', 'kill switches'], hint: 'A big red button.',
      explain: 'A **kill switch** lets you turn a feature off in seconds, without a deployment, while an incident is happening.' }
  ],

  flashcards: [
    { q: 'What is graceful degradation?', a: 'When part of a system fails, the rest keeps working in a reduced but still useful way instead of failing completely.' },
    { q: 'What is a fallback ladder?', a: 'A ranked list of answers for a feature: live, cached, generic default, hidden, then an honest error. You step down as each fails.' },
    { q: 'What does a kill switch do?', a: 'It is a feature flag for emergencies that turns a risky or expensive feature off instantly, with no deployment.' },
    { q: 'What is a bulkhead?', a: 'A separate pool of resources (threads, connections) per dependency, so one slow dependency cannot use up everything.' },
    { q: 'What is a common mistake with fallbacks?', a: 'Never testing them. Code that only runs in an outage is the least exercised code you have, so rehearse it.' }
  ],

  glossary: [
    { term: 'Graceful degradation', def: 'Continuing to provide a reduced service when parts of a system fail, rather than failing entirely.', like: 'A car in limp-home mode.' },
    { term: 'Fallback', def: 'A simpler backup response used when the normal one fails or is too slow.', like: 'The spare key under the flowerpot.' },
    { term: 'Feature flag', def: 'A configuration switch that turns a feature on or off at runtime, often for some users only.', like: 'A light switch for a feature.', aka: ['feature toggle'] },
    { term: 'Kill switch', def: 'A feature flag kept ready to switch a risky feature off immediately in an emergency.', like: 'The big red stop button on a machine.' },
    { term: 'Bulkhead', def: 'Isolating resources into separate compartments so a failure in one does not exhaust the others.', like: 'The watertight walls inside a ship.' }
  ],

  takeaways: [
    '**A worse experience beats no experience**: rank features and let the nice-to-haves give way.',
    'Build a **fallback ladder**: live, cached, generic, hidden, honest error. Keep the safe default simple.',
    'Use **feature flags and kill switches** so you can switch things off in seconds.',
    '**Bulkheads** stop one slow dependency using everything. Design, test and watch the degraded mode.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('rs-migration', {
  eli5: 'To replace a part of a live system without switching it off, you build the new part next to the old one, move users across a little at a time, and keep the way back open until you are sure.',

  cards: [
    { kind: 'concept', title: 'You cannot turn it off for the weekend',
      body: `Sooner or later you must change something big while people are using it: replace an old system, move to a new database, or ship a risky release.

        "We will take the site down on Saturday night" worked once, when users were few and patient. Now it means lost money, angry customers, and a huge all-or-nothing gamble: if the new thing fails at 3am, you are stuck in a half-migrated mess.

        The modern answer is to make the change **in small, reversible steps while everything stays up**. Each step should be safe on its own, and *undoable*. The cost is more planning and temporary scaffolding. The prize is calm weekends.` },

    { kind: 'metaphor', title: 'Building the new bridge beside the old one',
      body: `To replace a busy bridge you do not close the road for two years. You build the new bridge **next to** the old one while traffic keeps flowing. Then you open one lane to the new bridge, watch, move more traffic across, and finally demolish the old bridge when nobody uses it.

        If the new bridge has a problem on day one, you switch lanes back. Nobody was ever stranded.

        Every strategy in this lesson is a version of that: **new beside old, move traffic gradually, keep the way back.** Where the metaphor stops: bridges do not have data that must be copied across.` },

    { kind: 'diagram', title: 'The strangler fig',
      body: 'A strangler fig is a plant that grows around a tree until the tree is replaced. The software pattern grows a new system around an old one, one slice at a time.',
      nodes: [
        { id: 'u', label: 'Users', icon: '👥', x: 1, y: 0 },
        { id: 'r', label: 'Router / gateway', icon: '🚦', x: 1, y: 1, tone: 'accent' },
        { id: 'old', label: 'Old system', icon: '🏚️', x: 0, y: 2, tone: 'warn' },
        { id: 'new', label: 'New services', icon: '🌱', x: 2, y: 2, tone: 'good' }
      ],
      edges: [
        { from: 'u', to: 'r' },
        { from: 'r', to: 'old', label: 'most routes' },
        { from: 'r', to: 'new', label: 'migrated routes' }
      ],
      caption: 'Put a router in front. Move one feature at a time, such as "orders", to the new system, and point that route at it. Eventually the old system handles nothing and is switched off. No big bang.' },

    { kind: 'sequence', title: 'Blue/green: two identical environments',
      body: 'Run two full copies of production. **Blue** is live. **Green** is the new version, idle. Step through a release.',
      actors: ['Users', 'Router', 'Blue (v1, live)', 'Green (v2)'],
      steps: [
        { from: 0, to: 1, label: 'requests', note: 'Users hit the router.' },
        { from: 1, to: 2, label: 'all traffic', note: 'All traffic goes to **blue**, running version 1.' },
        { at: 3, label: 'deploy v2, run tests', note: 'Meanwhile version 2 is deployed to **green** and tested. No user is on it.' },
        { at: 1, label: 'flip the switch', note: 'When green looks good, the router sends traffic there. A near-instant cut-over.' },
        { from: 1, to: 3, label: 'all traffic', note: 'Users are now on version 2.' },
        { note: '**Rollback is instant**: point the router back at blue, which is still running. The cost is paying for double the servers for a while, and any shared database has to work with both versions.' }
      ] },

    { kind: 'steps', title: 'Canary: test on a few, then widen',
      body: 'Miners took canaries underground because the small birds showed gas before people felt it. A **canary release** sends a tiny share of real users to the new version first.',
      steps: [
        { title: '1% of traffic', body: 'The new version serves a tiny slice. Watch errors, latency and key business numbers against the old version.' },
        { title: 'Looks healthy: 10%', body: 'Widen slowly. Problems that only show up under more load or variety of users appear here.' },
        { title: 'Still healthy: 50%', body: 'The old version is still running and ready to take everything back.' },
        { title: 'Then 100%', body: 'Finish the rollout and retire the old version later.' },
        { title: 'If anything looks wrong', body: 'Send the canary traffic back to the old version. Only a small share of users ever saw the bug. That is the **blast radius** from the first lesson, kept small.' }
      ] },

    { kind: 'compare', title: 'Which release style?',
      cols: ['Rolling', 'Blue/green', 'Canary'],
      rows: [
        ['How', 'Replace servers a few at a time', 'Switch all traffic between two full copies', 'Send a small share to the new version, then grow'],
        ['Rollback', 'Roll forward or back through the fleet: slow', 'Instant: flip back', 'Fast: drop the canary share'],
        ['Extra cost', 'Little', 'Double the capacity for a while', 'A little extra, plus good metrics'],
        ['Risk if the new version is bad', 'Spreads as it rolls', 'Everyone at the flip (unless tested well)', 'Only the small canary slice']
      ],
      note: 'They combine well: a canary first, then roll out to the rest. In the lab that follows, you will ship a bad release with each strategy and see how much damage each one allows.' },

    { kind: 'concept', title: 'Dual writes and backfills',
      body: `Moving **data** is harder than moving code, because data has history. Suppose you move orders from an old database to a new one.

        A common plan:

        1. **Dual write**: for a while the app writes every new order to *both* databases.
        2. **Backfill**: a background job copies all the *old* orders into the new database, in small batches so it does not choke the live system.
        3. **Compare**: check that the two agree.
        4. **Switch reads** to the new database, gradually.
        5. **Stop writing** to the old one, and retire it.

        At each step you can stop or go back, which is the whole point.` },

    { kind: 'pitfall', title: 'Dual writes can disagree',
      body: `Writing to two places sounds easy. It is not, because there is **no transaction spanning both databases**. If the first write succeeds and the app crashes before the second, the two stores now disagree, and nobody notices for weeks.

        Ways to reduce the pain:

        - make **one** store the *source of truth* and copy from it, rather than trusting two writers
        - use a reliable change feed or an *outbox* (a table of "things to copy") instead of hoping the second write happens
        - run a **comparison job** that reports mismatches before you switch reads
        - make every write **idempotent**, so a retry cannot double-apply

        Dual writing is scaffolding. Keep it short-lived.` },

    { kind: 'code', title: 'Expand and contract: renaming a column safely',
      body: `You want to split \`first_name\` and \`last_name\` into \`full_name\`. A single \`RENAME\` would break the old app version the moment it ran. Instead, **expand** first, **contract** later. **Tap the highlighted lines.**`,
      code: { lang: 'sql', src: `
        -- 1. EXPAND: add the new column (old code ignores it)
        ALTER TABLE users ADD COLUMN full_name text;

        -- 2. BACKFILL in small batches, while the app writes both
        UPDATE users SET full_name = first_name || ' ' || last_name
        WHERE full_name IS NULL AND id BETWEEN 1 AND 10000;

        -- 3. CONTRACT, much later, once nothing reads the old columns
        ALTER TABLE users DROP COLUMN first_name;`,
        notes: {
          2: 'Adding a nullable column is safe: every old and new version of the app keeps working. Deploy code that writes **both** old and new columns next.',
          5: 'Copy existing rows in **small batches**. One giant update can lock the table and hurt live traffic.',
          9: 'Only after every deployed version reads the new column, and you have waited long enough to be sure you will not roll back, do you remove the old one. This step is the point of no return, so do it last.'
        } },
      note: 'The rhythm is always: **expand** (add the new alongside the old), **migrate** (write both, backfill, switch reads), **contract** (remove the old). Each step ships separately and is safe if rolled back.' }
  ],

  activities: [
    { type: 'match', after: 3, prompt: 'Match each strategy to its core idea.',
      pairs: [['Strangler fig', 'Replace an old system one slice at a time'], ['Blue/green', 'Two full copies, flip traffic between them'], ['Canary', 'Try the new version on a small share of users first'], ['Expand and contract', 'Add the new schema, migrate, then remove the old']],
      explain: 'All four share one theme: new beside old, move gradually, keep a way back.' },

    { type: 'mcq', after: 4, q: 'A release has a nasty bug that only appears with real user data. Which approach would have limited the damage most?',
      options: ['A canary release to 1% of users, watched closely', 'Deploying everything at midnight so fewer people are online', 'Testing for two more days in a staging environment', 'Telling users to expect problems'],
      answer: 0,
      why: [null, 'Fewer users does not mean zero, and the bug still hits all of them at once.', 'Staging rarely has real data and traffic variety. It helps but does not replace testing with real users.', 'Warning users does not shrink the problem.'],
      explain: 'A canary exposes a small slice of real users to the new version, so a bug is found with a small blast radius and can be undone quickly.' },

    { type: 'order', prompt: 'Put the data migration steps in a safe order.',
      items: ['Start writing new data to both old and new stores', 'Backfill old data into the new store in small batches', 'Compare the two stores and fix any mismatches', 'Switch reads over to the new store', 'Stop writing to the old store and retire it'],
      explain: 'Writes to both come first so nothing new is missed. Then copy history, verify, move reads, and only then remove the old one.' },

    { type: 'bucket', prompt: 'Which technique fits each situation best?',
      buckets: ['Strangler fig', 'Blue/green', 'Canary', 'Expand and contract'],
      items: [['Replacing a ten-year-old monolith feature by feature', 0], ['You need a one-click rollback for a big release', 1], ['Test a risky change on 2% of real users first', 2], ['Renaming a column while old and new app versions both run', 3], ['Routing "/orders" to a new service but "/billing" to the old one', 0], ['Watching error rates rise on a small slice before widening', 2]],
      explain: 'Strangler is about replacing a system gradually. Blue/green is about instant switching. Canary is about gradual exposure. Expand and contract is about changing a schema without breaking running code.' },

    { type: 'spot', prompt: 'You are deploying a new app version while the old one is still running. Tap the migration line that will break the old version immediately.',
      code: { lang: 'sql', src: `
        ALTER TABLE orders ADD COLUMN currency text;
        UPDATE orders SET currency = 'GBP' WHERE currency IS NULL;
        ALTER TABLE orders RENAME COLUMN total TO total_pence;
        CREATE INDEX idx_orders_user ON orders (user_id);` },
      lines: [3],
      explain: 'Line 3 renames a column the old version still reads. Its queries for `total` start failing the moment this runs. Add `total_pence`, write both, backfill, switch reads, and only then drop `total`.' },

    { type: 'tf', statement: 'Writing to two databases at once is safe, because if one write fails the other is automatically undone.', answer: false,
      explain: 'There is no transaction across two separate databases. One write can succeed and the other fail, leaving them disagreeing. You need a source of truth, an outbox or comparison checks.' },

    { type: 'estimate', q: 'You send 1% of 2,000,000 daily requests to a canary version. Roughly how many requests does the canary serve in a day?',
      answer: 20000, unit: 'requests', tolerance: 1.3, min: 10, max: 10000000,
      explain: '1% of 2,000,000 is 20,000, plenty of real traffic to compare error rates and latency against the old version, while 99% of users never see a problem.' },

    { type: 'scenario', title: 'Retiring the old billing system', intro: 'Your company has a creaky old billing system and a shiny new one. The CEO wants it all switched over "this weekend". You are the engineer asked to make it happen safely.',
      meters: { uptime: 70, 'customer trust': 65, 'engineering time': 60 },
      steps: [
        { text: 'The CEO suggests one big weekend cut-over. What do you propose instead?',
          choices: [
            { label: 'A strangler approach: route one customer segment to the new system at a time, behind a router', score: 2, effects: { uptime: 10, 'customer trust': 10, 'engineering time': -15 }, feedback: 'It takes longer in calendar terms, but each step is small and reversible, and the first problems appear with a few customers, not all.' },
            { label: 'The weekend cut-over, with a very long checklist', score: 0, effects: { uptime: -25, 'customer trust': -25 }, feedback: 'A big bang makes any mistake a full outage, and rollback means re-migrating data you just changed.' },
            { label: 'Run both forever and let customers pick', score: 1, effects: { 'engineering time': -25, 'customer trust': -5 }, feedback: 'Safe but never finishes. Two systems forever is its own ongoing cost.' }
          ] },
        { text: 'The new system needs the customers\' historic invoices. How do you move them?',
          choices: [
            { label: 'Dual write new invoices, backfill old ones in batches, compare, then switch reads', score: 2, effects: { 'customer trust': 15, 'engineering time': -10 }, feedback: 'The standard path. Nothing new is missed, old data arrives without hurting live traffic, and you verify before relying on it.' },
            { label: 'Copy everything in one huge overnight job and switch', score: 0, effects: { uptime: -20, 'customer trust': -15 }, feedback: 'One giant copy can lock tables, run out of time and leaves no verification.' },
            { label: 'Only copy new invoices and tell finance to use the old system for history', score: 1, effects: { 'customer trust': -5, 'engineering time': 10 }, feedback: 'Less work, but now there are two places to look and a permanent loose end.' }
          ] },
        { text: 'The first 5% of customers are on the new system. Their error rate is slightly higher. What now?',
          choices: [
            { label: 'Pause the rollout, route them back if needed, and investigate before widening', score: 2, effects: { uptime: 10, 'customer trust': 10 }, feedback: 'This is what the canary is for. Hold, fix, then continue. A bug found at 5% is a small story.' },
            { label: 'Carry on to 100% so the project finishes on time', score: 0, effects: { uptime: -25, 'customer trust': -20 }, feedback: 'You have just turned a small signal into an outage for everyone.' },
            { label: 'Ignore it: probably just noise', score: 1, effects: { uptime: -5 }, feedback: 'Maybe, but a rising error rate on a canary is exactly the signal you were waiting for.' }
          ] }
      ],
      outro: 'Big changes become safe when they become **small, observable and reversible**.' },

    { type: 'cloze', text: 'A {{canary}} release tests a new version on a small share of users. {{Blue/green}} swaps between two full environments. The {{strangler}} fig replaces an old system piece by piece. In {{expand}} and contract, you add the new schema before removing the old.',
      distractors: ['sticky', 'sharding'],
      explain: 'Four named techniques, one shared habit: change gradually and keep a way back.' }
  ],

  flashcards: [
    { q: 'What is the strangler fig pattern?', a: 'Put a router in front of an old system and move features one by one to a new system, until the old one handles nothing and can be retired.' },
    { q: 'Blue/green vs canary?', a: 'Blue/green flips all traffic between two full environments (instant rollback, double cost). Canary sends a small share to the new version first and widens gradually.' },
    { q: 'What is expand and contract?', a: 'Change a schema in stages: add the new structure beside the old (expand), migrate writes, data and reads, then remove the old (contract), so old and new code both work throughout.' },
    { q: 'Why are dual writes risky?', a: 'No transaction spans two databases, so one write can succeed and the other fail, leaving them out of sync. Use a source of truth, an outbox and comparison checks.' },
    { q: 'What is a backfill?', a: 'Copying existing historical data into a new place or column, usually in small batches so live traffic is not harmed.' }
  ],

  glossary: [
    { term: 'Strangler fig pattern', def: 'Gradually replacing an old system by routing individual features to a new one until the old one is unused.', like: 'Building the new bridge beside the old one.' },
    { term: 'Blue/green deployment', def: 'Running two identical production environments and switching traffic from the current one to the new one at once.', like: 'A stage with two sets, one being dressed while the other is in use.' },
    { term: 'Canary release', def: 'Sending a small share of real traffic to a new version first, to catch problems with a small blast radius.', like: 'The canary in the coal mine.' },
    { term: 'Dual write', def: 'Writing the same data to both an old and a new store during a migration.' },
    { term: 'Expand and contract', def: 'A safe way to change a schema or API: add the new form beside the old, migrate, then remove the old.', aka: ['parallel change'] }
  ],

  takeaways: [
    'Change live systems **in small, reversible steps**: new beside old, move gradually, keep the way back.',
    '**Strangler fig** for replacing systems, **blue/green** for instant switching, **canary** for limited exposure.',
    'Data migrations: **dual write, backfill in batches, compare, switch reads, retire**. Dual writes can disagree, so verify.',
    '**Expand and contract** lets old and new code coexist; the destructive step comes last.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('resilience', {
  title: 'The Chaos Gremlin',
  intro: 'A gremlin lives in your data centre and pulls cables for fun. It has hidden traps in your retries, your queues and your releases. Survive its twelve tricks by knowing exactly how a system should bend without breaking.',
  questions: [
    { type: 'estimate', q: 'Your contract promises 99.99% availability. Roughly how many minutes of downtime per year does that allow?',
      answer: 53, unit: 'minutes per year', tolerance: 1.4, min: 1, max: 100000,
      explain: 'A year is about 525,600 minutes. 0.01% of that is about 53 minutes. Every extra nine divides the allowance by ten.' },

    { type: 'mcq', q: 'Your API depends on three services in a row (all needed for each request), each 99.9% available. What is the best estimate for your own availability, ignoring everything else?',
      options: ['About 99.7%, a little worse than any one of them', 'About 99.9%, the same as each', 'About 99.99%, because there are three', 'Exactly 100% minus the largest single failure'],
      answer: 0,
      why: [null, 'Each hard dependency adds a chance of failure, so the total must be lower.', 'More dependencies in a chain never improve availability. Redundant copies do.', 'Chances multiply; they are not about the single worst part.'],
      explain: '0.999 × 0.999 × 0.999 ≈ 0.997. Hard dependencies in a chain multiply their failure chances together.' },

    { type: 'tf', statement: 'A call to another service without a timeout is safe, because the service will eventually answer or the network will give up.', answer: false,
      explain: 'Defaults are often very long or infinite. A hung call ties up a thread and connection, and enough of them take down the caller too. Always set an explicit timeout.' },

    { type: 'spot', prompt: 'Tap the line that makes this retry loop dangerous for an overloaded server.',
      code: { lang: 'js', src: `
        async function callWithRetry(fn) {
          for (;;) {
            try {
              return await fn();
            } catch (err) {
              // try again straight away
            }
          }
        }` },
      lines: [2],
      explain: 'The loop is unbounded (`for (;;)`) and there is no wait, so a failing service gets hammered forever. Bound the attempts, back off exponentially and add jitter.' },

    { type: 'order', prompt: 'Put one circuit-breaker cycle in order.',
      items: ['Calls succeed while failures are counted', 'The failure threshold is crossed and the breaker opens', 'Calls are rejected immediately', 'After a pause, a few trial calls are allowed', 'The trials succeed and the breaker closes'],
      explain: 'Closed, then open, then half-open, then back to closed. A failed trial would send it back to open.' },

    { type: 'bucket', prompt: 'Which resilience tool answers each problem?',
      buckets: ['Timeout', 'Rate limit', 'Circuit breaker', 'Bulkhead'],
      items: [['A dependency hangs and holds threads forever', 0], ['One customer script sends 3,000 requests a second', 1], ['A service keeps failing and every call wastes 2 seconds', 2], ['A slow recommendations call uses every thread, starving payments', 3], ['A single request must not wait longer than a few seconds', 0], ['Fair use between paying customers on a public API', 1]],
      explain: 'Timeouts bound a wait, rate limits bound how fast callers may go, breakers stop calling something that keeps failing, and bulkheads stop one dependency using every resource.' },

    { type: 'ab', q: 'Which response is better when a caller exceeds its rate limit?',
      a: { lang: 'http', label: 'Tell them when to return', src: `
        HTTP/1.1 429 Too Many Requests
        Retry-After: 30` },
      b: { lang: 'http', label: 'Say nothing useful', src: `
        HTTP/1.1 500 Internal Server Error` },
      answer: 'a',
      explain: '429 says "your rate", not "our bug", and Retry-After tells clients exactly how long to wait. A bare 500 invites instant retries.' },

    { type: 'mcq', q: 'The limit is 100 requests per fixed clock minute. A client sends 100 requests at 12:00:59 and 100 more at 12:01:00. What does a fixed-window counter do?',
      options: ['Allows all 200, so double the limit gets through', 'Rejects the second batch', 'Rejects both batches', 'Slows the second batch to a trickle over the minute'],
      answer: 0,
      why: [null, 'That is what a sliding window would do.', 'Each batch fits within its own window.', 'A fixed window counts and resets. It does not smooth traffic.'],
      explain: 'Fixed windows reset on the clock, so bursts that straddle the boundary get two allowances in a row. Sliding windows and token buckets avoid it.' },

    { type: 'multi', q: 'A queue between your web app and a slow worker keeps growing. Which of these are sensible responses?',
      options: ['Bound the queue and refuse or shed work when it is full', 'Tell producers to slow down (backpressure)', 'Let the queue grow so nothing is ever refused', 'Add consumers or batch the work to drain faster', 'Hide the problem by not monitoring queue depth'],
      answers: [0, 1, 3],
      explain: 'Bound it, push back and raise the drain rate. An unbounded queue only delays the crash and makes waits huge, and unmonitored queues fail by surprise.' },

    { type: 'cloze', text: 'When a system is overloaded, {{load shedding}} drops the least important work, while {{load shifting}} moves work to a quieter time. A {{kill switch}} turns a risky feature off instantly, and a {{bulkhead}} keeps one failing dependency from using every resource.',
      distractors: ['canary', 'jitter', 'idempotency'],
      explain: 'Four tools with one aim: protect what matters most while something else gives way.' },

    { type: 'match', prompt: 'Match each release technique to what it gives you.',
      pairs: [['Blue/green', 'Instant rollback by switching back to the old copy'], ['Canary', 'Real-user testing on a small share of traffic'], ['Strangler fig', 'Replacing an old system one slice at a time'], ['Expand and contract', 'Schema changes that old and new code both survive'], ['Backfill', 'Copying historical data into the new place in batches']],
      explain: 'Each one makes change smaller, observable and reversible.' },

    { type: 'spot', prompt: 'The new app version is rolling out while the old one still runs. Tap the migration line that breaks the old version at once.',
      code: { lang: 'sql', src: `
        ALTER TABLE users ADD COLUMN email_verified boolean;
        UPDATE users SET email_verified = false WHERE email_verified IS NULL;
        ALTER TABLE users DROP COLUMN legacy_login;
        CREATE INDEX idx_users_email ON users (email);` },
      lines: [3],
      explain: 'Dropping a column the old version still reads breaks it immediately. Drop only in the contract phase, after nothing reads it and you are sure you will not roll back.' }
  ]
});

KS.sheet('resilience', {
  title: 'Resilience: cheat sheet',
  sections: [
    { title: 'Availability and failure',
      md: `| Availability | Downtime / year | Per month |
        |---|---|---|
        | 99% | 3.65 days | 7.2 hours |
        | 99.9% | 8.8 hours | 43 min |
        | 99.99% | 53 min | 4.3 min |
        | 99.999% | 5.3 min | 26 s |

        Chained hard dependencies **multiply** (3 × 99.9% ≈ 99.7%). Redundant copies fail only together. Hunt **SPOFs** (load balancers, DNS, certificates, people). Shrink the **blast radius**: cells, gradual rollouts.` },

    { title: 'Timeouts and retries',
      md: `- **Every** outgoing call gets a timeout, plus a total deadline per request.
        - Retry only temporary failures (timeouts, connection errors, 503), never 400/403/404.
        - Retry only **idempotent** requests, or use an idempotency key.
        - **Exponential backoff** (double each time) + **jitter** (random) + **capped attempts**.
        - Retry in one layer only: 3 × 3 × 3 = 27 calls.
        - Retry storms keep services down; use retry budgets.` },

    { title: 'Circuit breaker',
      md: `| State | Behaviour |
        |---|---|
        | Closed | Calls flow; failures counted |
        | Open | Calls fail instantly, no call made |
        | Half-open | A few probes; success closes, failure reopens |

        Tune: failure-rate threshold, minimum calls, open duration, probe count. One breaker **per dependency**. Count timeouts and 5xx, not 4xx. Pair with a **fallback**.` },

    { title: 'Rate limiting',
      md: `| Algorithm | Notes |
        |---|---|
        | Token bucket | Bursts allowed; capacity = burst, refill = average |
        | Leaky bucket | Queue drains at a fixed rate; smooths |
        | Fixed window | Simple; edge burst of 2× limit |
        | Sliding window | Fair; more memory |

        Key by user/API key, IP (blunt: shared IPs) or endpoint. Shared counters (e.g. Redis) across servers. Answer **429** + **Retry-After**.` },

    { title: 'Backpressure, shifting, shedding',
      md: `- **Unbounded queues** hide overload: memory and wait time grow. Bound them.
        - Full buffer: **push back**, **buffer briefly**, or **drop** on purpose. Watch queue depth and age.
        - **Shift** work that can wait: queue + workers (\`202 Accepted\`), scheduled jobs.
        - **Shed** low-priority work early with 503 + Retry-After; never at random.
        - Rank traffic in advance: payments > login > browse > extras > analytics.` },

    { title: 'Degradation and bulkheads',
      md: `Fallback ladder: **live → cached → generic default → hidden → honest error**.

        - **Feature flag**: runtime on/off. **Kill switch**: emergency off.
        - **Bulkhead**: separate pools per dependency.
        - Core features may not degrade; nice-to-haves must.
        - Test fallbacks by breaking things; make degraded mode visible.` },

    { title: 'Migrating a live system',
      md: `| Technique | Idea | Rollback |
        |---|---|---|
        | Strangler fig | Router; move features one by one | Route back |
        | Blue/green | Two copies, flip traffic | Instant |
        | Canary | 1% → 10% → 50% → 100% | Drop the share |
        | Expand/contract | Add new, migrate, remove old | Until contract |

        Data: **dual write → backfill (batches) → compare → switch reads → retire**. Dual writes can diverge: use a source of truth or an outbox.` }
  ]
});

