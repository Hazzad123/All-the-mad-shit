/* Module: realtime — Real-Time Communication.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs realtime */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('rt-why', {
  eli5: 'A web server only ever answers questions; it cannot tap you on the shoulder. Live scores and chat need the server to tell you things first, so developers use a handful of tricks to get round that.',

  cards: [
    { kind: 'concept', title: 'The server cannot speak first',
      body: `You are watching a football match in an app. The score changes from 1–0 to 2–0. Your phone updates a moment later, with nobody tapping anything.

        How? Remember how HTTP works: the browser sends a **request**, the server sends a **response**. That is the whole conversation. The server has no way to start one. Think about what that means: the server knows the score changed, and it is **desperate to tell you**, but it has no way to reach you.

        This lesson is about that problem, and the module is about the tricks that solve it.` },

    { kind: 'metaphor', title: 'The shop that never rings you',
      body: `You ordered a sofa from a small furniture shop. The shop's rule is: **we never phone customers**. You may phone us.

        So the day it arrives, nobody tells you. If you want to know, you have to ring and ask: *"Is it in yet?"* "No." An hour later: *"Is it in yet?"* "No."

        That is an ordinary web server. It waits for you to ask, answers, and goes quiet. A shop that *did* phone you the moment the sofa landed would be better for everyone, but plain HTTP does not allow it.

        Where the metaphor stops: the shop could change its rule tomorrow. Browsers cannot just decide to accept incoming calls, for reasons of security.` },

    { kind: 'sequence', title: 'The score changes while you are not asking',
      body: 'Step through what happens with plain HTTP.',
      actors: ['Phone app', 'Server'],
      steps: [
        { from: 0, to: 1, label: 'GET /match/7/score', note: 'You open the match page. The app asks for the score.' },
        { from: 1, to: 0, label: '200 OK  {"score": "1-0"}', dashed: true, note: 'The server answers with the score right now. The conversation is **over**.' },
        { at: 1, label: 'GOAL! score is now 2-0', note: 'A moment later something happens on the pitch. The server knows. It has **no open line** to your phone.' },
        { at: 0, label: 'still showing 1-0', note: 'Your screen is now out of date, and nobody on either side knows it.' },
        { from: 0, to: 1, label: 'GET /match/7/score', note: 'Only when you refresh, or the app asks again, does the new score travel.' },
        { from: 1, to: 0, label: '200 OK  {"score": "2-0"}', dashed: true, note: 'The fix has to come from the **client** asking again, or from using a different kind of connection.' }
      ] },

    { kind: 'concept', title: 'What “real-time” really means',
      body: `"Real-time" sounds like *instant*. It never is. A signal takes time to cross a network, so what we really mean is **fast enough that a human does not notice the gap**.

        And "fast enough" depends on the job:

        - **Chat message:** under a second or it feels broken.
        - **Live football score:** a few seconds is fine.
        - **Sales dashboard:** every 30 seconds, or even a minute, is plenty.
        - **Online game:** tens of milliseconds, or you are shot before you see the enemy.

        So the first question is never "how do I make this real-time?" It is **"how fresh does this really need to be?"** The answer picks your technique.` },

    { kind: 'concept', title: 'Pull or push',
      body: `There are two ways information can travel.

        **Pull:** the receiver goes and gets it. You check the shop's website for a delivery update. The client keeps asking.

        **Push:** the sender delivers it the moment it exists. The shop texts you. The server starts the message.

        Plain HTTP is **pull** by design. All the real-time techniques are either clever ways to make pull *feel* instant, or ways to give the server a line to **push** down.

        Neither is "better". Pull is simple and works everywhere. Push is fresh but needs a connection that stays open, and open connections cost something.` },

    { kind: 'compare', title: 'The four techniques at a glance',
      body: 'Each gets its own lesson. For now, just meet them.',
      cols: ['The idea', 'Who can speak'],
      rows: [
        ['**Short polling**', 'Ask again every few seconds, whatever the answer', 'Client only'],
        ['**Long polling**', 'Ask, and the server holds the reply until it has news', 'Client asks, server replies late'],
        ['**Server-Sent Events**', 'One HTTP connection stays open; the server streams updates down it', 'Server to client'],
        ['**WebSockets**', 'The connection is upgraded to a two-way channel', 'Both, at any time']
      ],
      note: 'A fifth, **webhooks**, is for one *server* telling another. It comes in the last lesson.' },

    { kind: 'pitfall', title: 'Real-time is not free',
      body: `It is tempting to make everything live. Resist.

        Every technique has a cost. Polling creates a flood of mostly pointless requests. Open connections use memory on the server, and a server holding a hundred thousand of them is a very different beast from one answering and forgetting.

        Live features also fail in new ways: connections drop on trains and lifts, laptops go to sleep, and the client must notice and catch up.

        If a page is read once and nobody would notice a 30-second delay, **a refresh button or a slow poll is the right engineering**. Add push only where freshness changes what the user does.` },

    { kind: 'realworld', title: 'Where you meet each kind of freshness',
      body: `You have used all of these without thinking about it:

        - **Chat and typing indicators:** need the quickest, two-way connection.
        - **Live scores, news tickers, "your order is on its way":** the server talks, you listen.
        - **Notification badges:** the server tells you something happened.
        - **Progress bars for an upload or export:** the server reports how far along it is.
        - **A dashboard that updates every minute:** often just a timer asking again.

        Notice how few of those truly need two-way, millisecond speed. Most are somebody telling you something, and that fact will matter when you choose.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'The server knows a goal has just been scored, but your phone is using plain HTTP and is not asking. What happens?',
      options: ['Nothing is sent until the phone makes a new request', 'The server sends the update to the phone straight away', 'The server queues the update and delivers it when the phone next connects by itself', 'The browser notices and reloads the page automatically'],
      answer: 0,
      why: [null, 'A server can only reply to a request. It has no line to the phone to push down.', 'There is no automatic delivery in plain HTTP. The client has to open the conversation.', 'Browsers do not poll for you unless the page’s code tells them to.'],
      explain: 'In plain HTTP the client always speaks first. The server can answer only when asked, which is exactly the problem the real-time techniques work around.' },

    { type: 'tf', after: 3, statement: 'A system described as “real-time” delivers updates with no delay at all.', answer: false,
      explain: 'Nothing crosses a network instantly. “Real-time” means fast enough that a human would not notice, and that threshold depends on the job: milliseconds for a game, many seconds for a dashboard.' },

    { type: 'match', after: 5, prompt: 'Match each technique to its one-line idea.',
      pairs: [['Short polling', 'Keep asking every few seconds'], ['Long polling', 'Ask, and the server answers only when it has news'], ['Server-Sent Events', 'One open connection, server streams down it'], ['WebSockets', 'An upgraded, two-way channel']] },

    { type: 'bucket', prompt: 'Pull or push? Sort how each update reaches you.', buckets: ['Pull (you ask)', 'Push (they tell you)'],
      items: [['Refreshing your inbox by hand', 0], ['A text saying “your parcel is outside”', 1], ['Calling the shop to ask if the sofa is in', 0], ['A phone alert the moment a message arrives', 1], ['A page that re-checks the score every 10 seconds', 0], ['A server streaming each goal down an open connection', 1]],
      explain: 'Pull means the receiver initiates, even if a timer does it for them. Push means the sender initiates the moment there is news. A page that re-asks on a timer is still pull.' },

    { type: 'estimate', q: 'A live-score page has 10,000 people watching. Each browser asks the server for the score once every 2 seconds. Roughly how many requests per second reach the server?',
      answer: 5000, unit: 'requests per second', tolerance: 2,
      explain: '10,000 people × one request every 2 seconds = **5,000 requests per second**, all day, even when the score has not changed. That waste is the main weakness of polling.' },

    { type: 'cloze', text: 'In plain HTTP the {{client}} always speaks first. When the server starts the message, that is called {{push}}; when the client keeps asking, that is {{pull}}.',
      distractors: ['broker', 'cache', 'proxy'],
      explain: 'Plain HTTP is pull by design. Real-time techniques either imitate push on top of it, or give the server a connection to push down.' },

    { type: 'short', q: 'Which style of communication is plain HTTP: push or pull?', accept: ['pull'], hint: 'The client has to go and get it.',
      explain: 'HTTP is **pull**: nothing arrives unless the client asked for it.' },

    { type: 'explain', prompt: 'A friend says: “Why can’t the server just send the new score to my phone when it changes? Why all these tricks?” Explain what is actually going on.',
      model: 'Plain HTTP only works as request and response. The client has to ask first, and the server can only answer, so it has no line open to push a new score down. Real-time techniques either have the client keep asking (polling), or keep a connection open so the server can send things whenever it likes (SSE, WebSockets). How fresh the data needs to be decides which one to use.',
      keywords: ['request', 'client', 'ask', 'push', 'open connection', 'polling', 'fresh'] }
  ],

  flashcards: [
    { q: 'Why can a plain HTTP server not tell the client about new data by itself?', a: 'HTTP is request and response: the client must speak first, and the server can only reply. It has no open line to push down.' },
    { q: 'What does “real-time” actually mean?', a: 'Fast enough that a human does not notice the delay. It is never instant, and the target ranges from milliseconds (games) to a minute (dashboards).' },
    { q: 'What is the difference between push and pull?', a: 'Pull: the receiver asks for data. Push: the sender delivers it the moment it exists. Plain HTTP is pull.' },
    { q: 'Name the four techniques for live data between a browser and a server.', a: 'Short polling, long polling, Server-Sent Events and WebSockets. (Webhooks are for server-to-server.)' },
    { q: 'Why is “make everything real-time” a bad default?', a: 'Open connections and constant requests cost server resources and add new failure modes. Use push only where freshness changes what the user does.' }
  ],

  glossary: [
    { term: 'Real-time', def: 'Updates that arrive fast enough that a person does not notice the delay. How fast that must be depends on the application.', like: 'A conversation, not a postcard.' },
    { term: 'Push', def: 'The sender delivers information the moment it is available, without being asked.', like: 'A shop texting you that your parcel has arrived.' },
    { term: 'Pull', def: 'The receiver asks for information whenever it wants it. Ordinary HTTP works this way.', like: 'Phoning the shop to ask if your sofa is in.' },
    { term: 'Polling', def: 'Asking the server for updates again and again on a timer, whether or not anything has changed.', like: 'Checking the oven every minute instead of setting a timer.' },
    { term: 'Latency', def: 'The delay between something happening and the other side learning about it.', like: 'The gap between a lightning flash and the thunder.' }
  ],

  takeaways: [
    'Plain HTTP is **pull**: the client speaks first and the server can only answer.',
    '“Real-time” means **fast enough for a human**, and “fast enough” depends on the job.',
    'Four techniques: **short polling, long polling, SSE, WebSockets**. Webhooks are for server to server.',
    'Always ask “how fresh does this need to be?” before reaching for push.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('rt-polling', {
  eli5: 'Short polling is a child asking “are we there yet?” every minute. Long polling is asking once and the driver only answering when you arrive. Both use ordinary HTTP, so they work almost everywhere.',

  cards: [
    { kind: 'metaphor', title: 'Are we there yet?',
      body: `Every family car journey has the same child in the back seat.

        **Short polling** is that child. *"Are we there yet?"* "No." Two minutes later: *"Are we there yet?"* "No." The child gets there eventually, but the driver has been interrupted forty times, and the news "we have arrived" is only noticed at the next question.

        **Long polling** is the cleverer child, who asks once: *"Tell me when we get there."* The driver says nothing for an hour, then: "Now." One question, one answer, perfect timing.

        Both children only ever speak first. That is why both still work on plain HTTP.` },

    { kind: 'code', title: 'Short polling in a few lines',
      body: 'This is the whole technique. A timer asks, the server answers straight away, and the page updates. **Tap the lines.**',
      code: { lang: 'js', src: `
        setInterval(async () => {
          const res = await fetch('/api/score');
          const data = await res.json();
          showScore(data.score);
        }, 5000);`,
        notes: {
          1: '\`setInterval\` runs the function again and again, here every 5000 milliseconds. Nothing smart: a plain repeating timer.',
          2: 'An ordinary HTTP request. The server replies **immediately** with whatever the score is right now, changed or not.',
          3: 'Turn the reply into data the page can use.',
          4: 'Redraw the screen. Even if the score is the same as last time, we still do this work.',
          5: 'The **interval** is the whole trade-off: shorter means fresher but busier, longer means calmer but staler.'
        } } },

    { kind: 'sequence', title: 'Short polling: wasted asks and a late answer',
      body: 'Step through five seconds of a polling page. The poll interval is 5 seconds.',
      actors: ['Browser', 'Server'],
      steps: [
        { from: 0, to: 1, label: 'GET /api/score', note: 'Poll number one.' },
        { from: 1, to: 0, label: '1-0', dashed: true, note: 'The answer comes back at once. Nothing has changed since last time, so this request was **wasted**.' },
        { at: 1, label: 'goal! now 2-0', note: 'One second later a goal goes in. The server knows. The browser is waiting for its timer.' },
        { note: 'Four more seconds of silence. The screen shows the old score.' },
        { from: 0, to: 1, label: 'GET /api/score', note: 'Poll number two finally fires.' },
        { from: 1, to: 0, label: '2-0', dashed: true, note: 'The news arrives, **four seconds late**. On average a change waits about half an interval to be noticed; at worst, a whole one.' }
      ] },

    { kind: 'concept', title: 'The two costs of short polling',
      body: `Short polling has exactly two problems, and they pull in opposite directions.

        **Delay.** A change is only noticed at the next poll. Poll every 5 seconds and an update takes between 0 and 5 seconds to show up, about 2.5 on average.

        **Waste.** Most polls find nothing new, yet each is a full HTTP request: a connection, headers, a database lookup, a response. Multiply by every user.

        Poll faster to cut the delay and the waste **grows**. Poll slower to cut the waste and the delay **grows**. You can only trade one for the other. That is exactly what pushes people to look for something better.` },

    { kind: 'sequence', title: 'Long polling: ask once, answer when ready',
      body: 'Same goal, different shape. Notice that the server is the one who waits.',
      actors: ['Browser', 'Server'],
      steps: [
        { from: 0, to: 1, label: 'GET /updates?since=41', note: 'The browser asks: "anything after event 41?" This looks like a normal request.' },
        { at: 1, label: 'nothing yet… holds the line', note: 'Instead of answering "no", the server **leaves the request open** and waits for news.' },
        { at: 1, label: 'goal! event 42 happens', note: 'Some time later, something happens.' },
        { from: 1, to: 0, label: '200 OK  event 42', dashed: true, note: 'The server answers **immediately**, so the browser learns within moments, not at the next tick of a timer.' },
        { from: 0, to: 1, label: 'GET /updates?since=42', note: 'The browser instantly asks again. It is always keeping one question open. This repeat is the "loop" in long polling.' }
      ],
      note: 'The cost: the server must keep one waiting request per user. That is much cheaper than constant asking, but not free.' },

    { kind: 'code', title: 'A long-polling client',
      body: 'The loop never rests: ask, wait, show, ask again. **Tap the lines.**',
      code: { lang: 'js', src: `
        async function listen(since) {
          while (true) {
            try {
              const res = await fetch('/updates?since=' + since);
              if (res.status === 200) {
                const data = await res.json();
                show(data.events);
                since = data.last;
              }
            } catch (err) {
              await sleep(2000);
            }
          }
        }`,
        notes: {
          1: '\`since\` is a **bookmark**: the id of the last event we saw. It lets the server send only what we missed.',
          4: 'The request can sit here for many seconds. The \`await\` just pauses this loop; the page stays responsive.',
          5: 'A 200 means news. A **204** (no content) would mean "I waited and nothing happened", so we skip straight round to ask again.',
          8: 'Move the bookmark forward so the next question starts after what we have seen. Without it we would miss events that happen between requests, or see them twice.',
          11: 'If the network drops or the server is down, **wait a little** before trying again. Without a pause this loop would hammer a struggling server.'
        } } },

    { kind: 'pitfall', title: 'Timeouts, reconnects and the gap',
      body: `A request that waits for ages meets a hostile world. Browsers, load balancers and proxies between you and the server often **cut connections that stay silent too long**, commonly after somewhere between 30 and 120 seconds, depending on the setup.

        So a good long-poll server **answers anyway** after a limit (say 25 seconds) with "nothing new" and the client reconnects at once. This is normal, not an error.

        The dangerous moment is the gap between one request ending and the next starting. An event in that gap is missed unless the client sends its **bookmark** (\`since=42\`) and the server remembers recent events. And on real errors, wait before retrying, and wait longer each time, so a downed server is not flattened by a stampede of eager clients.` },

    { kind: 'tip', title: 'When polling is good enough',
      body: `Polling feels old-fashioned, but it is often the right answer.

        - **Slow-changing data.** A dashboard that refreshes every 30 seconds does not need a persistent connection.
        - **Job status.** "Is my export ready?" Poll every few seconds until done, then stop.
        - **Few users.** At small scale the waste is trivial and the simplicity is priceless.
        - **Awkward networks.** Polling is ordinary HTTP, so it passes through nearly every firewall and proxy.

        It is easy to build, easy to debug in the browser, and needs no special servers. Start here, and move to something fancier only when you can name the problem it would solve.`,
      note: 'Rule of thumb: if you would be happy with a 10-second delay, poll. If you cannot be, keep reading.' }
  ],

  activities: [
    { type: 'mcq', after: 3, q: 'A page polls every 10 seconds. Roughly how long will an update wait before the user sees it, on average?',
      options: ['About 5 seconds', 'About 10 seconds', 'Almost no time', 'About 20 seconds'],
      answer: 0,
      why: [null, 'That is the worst case: the change landed just after a poll.', 'That would need the server to push, which short polling cannot do.', 'The wait can never be longer than one full interval.'],
      explain: 'An update lands at a random moment between two polls, so it waits half an interval on average (5 s) and a full interval (10 s) at worst.' },

    { type: 'tf', after: 5, statement: 'With long polling, the server answers every request straight away, just like short polling, but more often.', answer: false,
      explain: 'In long polling the server **holds the request open** until it has something to send (or a time limit passes). That wait is the whole trick: the answer arrives the instant there is news.' },

    { type: 'order', prompt: 'Put one round of long polling in order.',
      items: ['The browser asks for updates after the last event it saw', 'The server has nothing yet, so it holds the request open', 'An event happens on the server', 'The server replies with the event, ending the request', 'The browser immediately sends a new request'],
      explain: 'The server waits *inside* the request until there is news. As soon as the reply arrives, the browser opens the next question so there is always one waiting.' },

    { type: 'estimate', q: 'A site has 1,000 users, each polling every 5 seconds all day. Roughly how many requests does the server handle in one hour?',
      answer: 720000, unit: 'requests per hour', tolerance: 2,
      explain: 'Each user makes 12 requests a minute, 720 an hour. 1,000 × 720 = **720,000 requests an hour**, and if the data changes only a few times, nearly all of them are wasted.' },

    { type: 'spot', prompt: 'This long-polling loop works until the server goes down. Tap the line that makes it behave badly then.',
      code: { lang: 'js', src: `
        async function listen() {
          while (true) {
            try {
              const res = await fetch('/updates');
              show(await res.json());
            } catch (err) {
              // server down? try again immediately
            }
          }
        }` },
      lines: [7],
      explain: 'On an error the loop retries instantly, thousands of times a second, and every client does the same to a server that is already struggling. A pause (and a growing pause) is needed. It also has no bookmark, so events could be missed between requests.' },

    { type: 'ab', q: 'Which client handles a dropped connection better?',
      a: { lang: 'js', label: 'Pause, then retry', src: `
        } catch (err) {
          await sleep(delay);
          delay = Math.min(delay * 2, 30000);
        }` },
      b: { lang: 'js', label: 'Retry straight away', src: `
        } catch (err) {
          continue;
        }` },
      answer: 'a',
      explain: 'Waiting a little, and a little longer each failure (with a cap), gives a struggling server room to recover. Instant retries from thousands of clients can keep it down.' },

    { type: 'cloze', text: 'In {{long polling}} the server holds the request until there is news, while in {{short polling}} the client asks again on a {{timer}}. A {{bookmark}} such as `since=42` stops events being missed between requests.',
      distractors: ['push', 'cookie'],
      explain: 'The names tell you the shape: short polling means short requests that answer at once; long polling means a long wait inside the request. The bookmark is what makes reconnecting safe.' },

    { type: 'scenario', title: 'The order-status page', intro: 'You work on a food-delivery app. Customers watch a page that says "preparing", "on its way" or "delivered". Today it only changes when they refresh. Your team lead wants it live.',
      meters: { 'server load': 20, 'customer happiness': 40 },
      steps: [
        { text: 'You are a small startup with a few hundred customers at dinner time. What do you build first?',
          choices: [
            { label: 'Poll the status endpoint every 10 seconds', score: 2, effects: { 'customer happiness': 30, 'server load': 5 }, feedback: 'Simple, quick to build, works on every phone and network. A few hundred users polling every 10 seconds is only a few dozen requests a second. This is the right first step.' },
            { label: 'Design a custom real-time system with its own cluster of connection servers', score: 0, effects: { 'customer happiness': 5, 'server load': 15 }, feedback: 'Months of work to solve a problem you do not have yet. Meanwhile customers still refresh by hand.' },
            { label: 'Leave it as it is and add a bigger “Refresh” button', score: 1, effects: { 'customer happiness': 10 }, feedback: 'Cheap, and not dishonest, but it asks every customer to do the polling by hand.' }
          ] },
        { text: 'Six months on you have 50,000 people watching during peak. The servers are sweating, and your logs show most polls return “no change”. What now?',
          choices: [
            { label: 'Switch to long polling: requests only return when the status changes', score: 2, effects: { 'server load': -20, 'customer happiness': 15 }, feedback: 'The waste disappears: one waiting request per user, and updates arrive the moment they happen. Customers also notice it feels faster.' },
            { label: 'Poll every 2 seconds so it feels fresher', score: 0, effects: { 'server load': 40, 'customer happiness': -10 }, feedback: 'Five times the requests, nearly all pointless. The servers fall over at dinner time.' },
            { label: 'Double the number of servers', score: 1, effects: { 'server load': -10, 'customer happiness': 5 }, feedback: 'It buys time, but you are paying to answer the same pointless question twice as often.' }
          ] },
        { text: 'Customers on trains complain that the page “freezes”. You find that long-poll requests are failing as signal comes and goes. What should the client do?',
          choices: [
            { label: 'Wait briefly, retry with a growing delay, and send the last event id', score: 2, effects: { 'customer happiness': 20, 'server load': -5 }, feedback: 'Patient, polite and safe: the delay protects the server and the bookmark means nothing is missed during the outage.' },
            { label: 'Retry instantly in a loop until it works', score: 0, effects: { 'server load': 25, 'customer happiness': -5 }, feedback: 'When a mast comes back online, thousands of phones hammer the server at the same moment.' },
            { label: 'Stop and show an error until the user taps Reload', score: 1, effects: { 'customer happiness': -5 }, feedback: 'Safe but annoying. Customers on trains would tap Reload all the way home.' }
          ] }
      ],
      outro: 'The pattern: **start simple, measure the waste, and move on only when a real problem appears.**' }
  ],

  flashcards: [
    { q: 'What is short polling?', a: 'The client asks for updates on a repeating timer. The server always answers at once, even if nothing has changed.' },
    { q: 'What are the two costs of short polling?', a: 'Delay (a change waits up to one interval, half on average) and waste (most requests find nothing new). Shortening the interval fixes one and worsens the other.' },
    { q: 'How does long polling differ from short polling?', a: 'The server holds each request open until it has news (or a time limit), then answers. The client immediately asks again.' },
    { q: 'Why does a long-poll client send a bookmark like since=42?', a: 'So events between one request ending and the next starting are not missed or repeated. The server sends only what came after that id.' },
    { q: 'When is polling good enough?', a: 'For slow-changing data, job status, small user counts and restrictive networks. It is simple and works everywhere.' }
  ],

  glossary: [
    { term: 'Short polling', def: 'Asking the server for fresh data on a repeating timer. Every request gets an immediate answer, whether or not anything changed.', like: 'A child asking “are we there yet?” every two minutes.', aka: ['polling'] },
    { term: 'Long polling', def: 'A request the server deliberately leaves open until it has something to send, after which the client asks again straight away.', like: 'Asking once, “tell me when we arrive”.' },
    { term: 'Polling interval', def: 'The time between one poll and the next. It sets the trade-off between freshness and load.', like: 'How often you check the oven.' },
    { term: 'Exponential backoff', def: 'Waiting longer after each failure before retrying, usually doubling the delay up to a cap.', like: 'Knocking on a door, then waiting longer each time before knocking again.', aka: ['backoff'] }
  ],

  takeaways: [
    '**Short polling** asks on a timer: simple, but delayed and wasteful.',
    '**Long polling** holds the request open until there is news, then the client asks again.',
    'Use a **bookmark** (\`since=42\`) and **back off** on errors so nothing is missed and servers survive.',
    'Polling is plain HTTP, so it works everywhere. Often that is good enough.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('rt-sse', {
  eli5: 'Server-Sent Events turn one ordinary web request into a never-ending reply, like a news ticker. The server keeps writing lines to it, the browser shows each as it arrives, and if the line drops the browser reconnects by itself.',

  cards: [
    { kind: 'concept', title: 'A reply that never finishes',
      body: `Normally a response has an end. The server writes some text, finishes, and the conversation is over.

        Now imagine the server simply **never finishes**. It sends the headers, then a line of text, then goes quiet. A minute later it sends another line. The browser keeps the connection open and handles each line as it lands.

        That is **Server-Sent Events** (SSE). It is not a new protocol. It is **plain HTTP** with one agreement: "this response is a stream, and I will keep adding to it."

        It is **one-way**: the server talks, the browser listens. If the browser needs to say something, it makes an ordinary request on the side.` },

    { kind: 'metaphor', title: 'The radio station',
      body: `A radio station broadcasts. You tune in, and from then on news, music and traffic reports just **arrive**, the moment the presenter says them. You never phone to ask "any news?".

        You cannot talk back over the same airwaves. If you want to request a song, you ring the station separately.

        SSE is the same shape: tune in once (open the connection), the server broadcasts to you whenever it likes, and anything you want to say goes on a separate, ordinary request.

        Where the metaphor stops: a radio station has one broadcast for everyone. A server keeps a **separate stream open for each listener**, and can say different things to each.` },

    { kind: 'code', title: 'What the stream looks like on the wire',
      body: 'The format is deliberately simple: lines of text, with a **blank line** ending each event. **Tap the lines.**',
      code: { lang: 'http', src: `
        HTTP/1.1 200 OK
        Content-Type: text/event-stream
        Cache-Control: no-cache

        id: 41
        data: Goal! 1-0

        id: 42
        event: goal
        data: {"score": "2-0"}
        `,
        notes: {
          2: '\`text/event-stream\` is the agreement. It tells the browser "keep reading, this will not end soon, and it is made of events".',
          3: 'Do not let proxies or the browser keep a stored copy. Every event is fresh.',
          5: 'An optional **id** for this event. The browser remembers the latest one, which is what lets it catch up after a drop.',
          6: 'The **data** is the message itself. Any text; JSON is common. (More than one \`data:\` line in one event are joined together.)',
          7: 'A **blank line** ends the event. Until it arrives, the browser keeps collecting lines. Forget it and nothing is delivered.',
          9: 'An optional **event** name. It lets the page react to different kinds of event differently. Without it the type is the default, \`message\`.'
        } } },

    { kind: 'code', title: 'Listening with EventSource',
      body: 'Browsers have this built in: an object called **EventSource**. No library needed. **Tap the lines.**',
      code: { lang: 'js', src: `
        const source = new EventSource('/events');
        source.onmessage = (e) => {
          showScore(JSON.parse(e.data));
        };
        source.addEventListener('goal', (e) => {
          flash('GOAL!');
        });
        source.onerror = () => {
          showBanner('Reconnecting…');
        };`,
        notes: {
          1: 'Opens a normal GET request to \`/events\` and keeps reading. That is the whole setup.',
          2: 'Runs for each event **without** a name. \`e.data\` is the text after \`data:\`.',
          5: 'Named events, such as \`event: goal\` on the server, need \`addEventListener\` with that name.',
          8: 'Runs when the connection drops. You do **not** have to reconnect: the browser does that for you. This is just a chance to show a banner.',
          10: 'To stop listening for good, call \`source.close()\`.'
        } } },

    { kind: 'sequence', title: 'A drop, and catching up',
      body: 'Watch the reconnection. Nobody wrote any retry code here.',
      actors: ['Browser', 'Server'],
      steps: [
        { from: 0, to: 1, label: 'GET /events', note: 'The page creates an \`EventSource\`.' },
        { from: 1, to: 0, label: 'id: 41  Goal! 1-0', dashed: true, note: 'The stream is open and the first event arrives. The browser stores the id, **41**.' },
        { from: 1, to: 0, label: 'id: 42  2-0', dashed: true, note: 'Another event. The stored id is now **42**.' },
        { note: 'The train goes into a tunnel. The connection dies. Event 43 happens while the phone is offline.' },
        { from: 0, to: 1, label: 'GET /events + Last-Event-ID: 42', note: 'After a short pause the browser reconnects **by itself**, adding a header that says the last id it saw.' },
        { from: 1, to: 0, label: 'id: 43  3-0', dashed: true, note: 'The server reads that header and replays what was missed. The user sees nothing unusual.' }
      ] },

    { kind: 'concept', title: 'Reconnection comes free',
      body: `This is the quiet superpower of SSE. When the connection drops, the browser:

        1. waits a few seconds (the server can change the wait with a \`retry:\` line, in milliseconds)
        2. opens a new request
        3. sends a **\`Last-Event-ID\`** header with the last \`id\` it saw

        Your job on the server is to **give each event an id** and, if missing events matter, to **remember recent events** so you can replay them.

        If missing a message does not matter (a live temperature), you can ignore the header and carry on from now. Compare this with long polling, where you built the bookmark and the reconnect loop **yourself**.` },

    { kind: 'pitfall', title: 'What SSE cannot do',
      body: `SSE is simple because it does less. Know the limits:

        - **One way only.** The browser cannot send messages down the same stream. For a chat box you would send with a normal POST and listen with SSE, which works, but it is two channels.
        - **Text only.** Binary data has to be encoded as text first.
        - **No custom headers** from the browser's \`EventSource\`, so you cannot add an \`Authorization\` header. Cookies are sent as usual, which is how most apps authenticate it.
        - **Connection limits.** Over HTTP/1.1 a browser allows only about six connections to one site, shared across tabs, so six open tabs can starve each other. HTTP/2 largely removes this.` },

    { kind: 'realworld', title: 'Where SSE shines',
      body: `SSE is ideal wherever **the server is the only one with news**:

        - **Live feeds and tickers:** scores, prices, headlines, status pages.
        - **Notifications:** "someone replied to your comment".
        - **Progress reports:** "export 40% done, 70% done…".
        - **Streaming text:** many AI chat tools stream their reply word by word to the browser this way.

        It also plays nicely with the rest of the web: it is ordinary HTTP, so it works with existing logging, authentication and load balancers, with the one wrinkle that those connections stay open for a long time.` },

    { kind: 'diagram', title: 'Example: a progress bar',
      body: 'A user clicks "Export my data". Starting the job is a normal request. Watching it is an event stream.',
      nodes: [
        { id: 'b', label: 'Browser', icon: '🖥️', x: 0, y: 0 },
        { id: 'api', label: 'Export API', icon: '🧩', x: 1, y: 0, tone: 'accent' },
        { id: 'w', label: 'Export worker', icon: '⚙️', x: 1, y: 2 }
      ],
      edges: [
        { from: 'b', to: 'api', label: 'POST /exports' },
        { from: 'api', to: 'w', label: 'start job' },
        { from: 'w', to: 'api', label: 'progress 40%', dashed: true },
        { from: 'api', to: 'b', label: 'SSE: progress', dashed: true }
      ],
      caption: 'One-way is enough here: the browser asks once, then only listens.' }
  ],

  activities: [
    { type: 'match', after: 2, prompt: 'Match each line of an SSE message to what it does.',
      pairs: [['data:', 'The message itself'], ['id:', 'Lets the browser say where it got up to'], ['event:', 'Names the kind of event'], ['retry:', 'How long to wait before reconnecting'], ['A blank line', 'Ends the event']] },

    { type: 'order', after: 4, prompt: 'Put the reconnection in order.',
      items: ['The connection drops while the user is offline', 'The browser waits a short while', 'It reconnects with a Last-Event-ID header', 'The server replays the events the user missed', 'The stream carries on as normal'],
      explain: 'The browser handles the first three steps for you. The server’s only job is to read the header and replay from that point.' },

    { type: 'tf', after: 5, statement: 'With SSE you must write your own code to reconnect after a dropped connection.', answer: false,
      explain: 'Reconnection is built into \`EventSource\`. The browser retries after a short wait and sends \`Last-Event-ID\`. You only need to give events ids if you want a replay.' },

    { type: 'bucket', prompt: 'Which of these suits SSE well, and which needs something else?', buckets: ['Good fit for SSE', 'Needs two-way or something else'],
      items: [['A live scoreboard', 0], ['A progress bar for a video export', 0], ['A “3 new notifications” badge', 0], ['A multiplayer game sending moves 30 times a second', 1], ['Streaming raw audio from a microphone to the server', 1], ['A collaborative document where everyone types at once', 1]],
      explain: 'SSE is one-way, from server to browser, and carries text. When the browser has a constant stream of its own to send, or sends binary data, you want a two-way channel instead.' },

    { type: 'spot', prompt: 'A developer says: “my page opens the stream but never shows any events.” Tap the line most likely to be wrong.',
      code: { lang: 'http', src: `
        HTTP/1.1 200 OK
        Content-Type: text/html
        Cache-Control: no-cache

        data: Goal! 1-0
        ` },
      lines: [2],
      explain: 'The browser only accepts the stream if the type is `text/event-stream`. With `text/html` the `EventSource` connection is refused. (The data line also needs a blank line after it to end the event.)' },

    { type: 'short', q: 'What is the name of the built-in browser object used to listen to Server-Sent Events?', accept: ['EventSource', 'Event Source'], hint: 'It is the source of events.',
      explain: '`new EventSource(url)` opens the stream. It reconnects by itself and gives you the events as they arrive.' },

    { type: 'mcq', q: 'You are building a chat room. Which description of SSE is most accurate?',
      options: ['Good for receiving messages, but sending needs a separate request', 'Fully two-way, so one connection handles both directions', 'Only works for text chat if the server polls underneath', 'Cannot reconnect, so chat would break on mobile'],
      answer: 0,
      why: [null, 'SSE is one-way: server to browser.', 'There is no polling inside; the server writes to the open response.', 'It reconnects automatically and can replay missed events with ids.'],
      explain: 'Messages can arrive over SSE and be sent with normal POSTs. It works, but a chat with typing indicators and heavy traffic often leans towards WebSockets, which the next lesson covers.' },

    { type: 'explain', prompt: 'Explain to a friend how SSE lets a server push to a browser without any new protocol, and what the browser does when the connection is lost.',
      model: 'The browser makes an ordinary HTTP request, and the server answers with content type text/event-stream and never finishes. It keeps writing events down that open response and the browser handles each as it arrives. It is one-way. If the connection drops, the browser reconnects by itself and sends the last event id it saw so the server can replay what was missed.',
      keywords: ['HTTP', 'open', 'stream', 'one-way', 'EventSource', 'reconnect', 'id'] }
  ],

  flashcards: [
    { q: 'What are Server-Sent Events?', a: 'A one-way stream from server to browser over a single long-lived HTTP response with content type text/event-stream.' },
    { q: 'What browser API listens to SSE, and what does it do for free?', a: 'EventSource. It reconnects automatically and sends a Last-Event-ID header so the server can replay missed events.' },
    { q: 'What ends one event in the SSE format?', a: 'A blank line. Lines such as data:, id:, event: and retry: before it make up the event.' },
    { q: 'Name three limits of SSE.', a: 'One-way only, text only, and no custom headers from EventSource (plus about six connections per site over HTTP/1.1).' },
    { q: 'When is SSE the ideal choice?', a: 'When only the server has news: feeds, notifications, progress bars and streamed text.' }
  ],

  glossary: [
    { term: 'Server-Sent Events', def: 'A way for a server to stream messages to a browser over one long-lived HTTP response. Communication is one-way.', like: 'A radio broadcast you tune into.', aka: ['SSE'] },
    { term: 'EventSource', def: 'The browser’s built-in object for opening an SSE stream and receiving its events, with automatic reconnection.', like: 'The radio dial.' },
    { term: 'Last-Event-ID', def: 'A header the browser sends when it reconnects, holding the id of the last event it saw, so the server can resume from there.', like: 'A bookmark in a book you put down.' },
    { term: 'Event stream', def: 'The text format of an SSE response: lines such as data: and id:, with a blank line after each event.', like: 'A news ticker made of lines of text.' }
  ],

  takeaways: [
    '**SSE** = one never-ending HTTP response; the server writes events, the browser listens.',
    'It is **one-way** and text-only, but simple, and works with normal HTTP infrastructure.',
    '\`EventSource\` **reconnects for free** and sends \`Last-Event-ID\` so you can replay what was missed.',
    'Perfect for **feeds, notifications and progress**; not for chatty two-way traffic.'
  ],

  links: [
    { label: 'MDN: Using server-sent events', url: 'https://developer.mozilla.org/en-US/docs/Web/API/Server-sent_events/Using_server-sent_events' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('rt-websockets', {
  eli5: 'A WebSocket starts as a normal web request, then both sides agree to keep the line open and talk freely in either direction, like turning an exchange of letters into a phone call.',

  cards: [
    { kind: 'concept', title: 'When both sides need to talk',
      body: `Polling and SSE share a limit: the browser asks, or the server talks, but neither gives you a **chat**. In a chat room, an online game or a shared whiteboard, both sides send small messages, often, at unpredictable moments. Making a fresh HTTP request for each one wastes time on headers and handshakes.

        What you want is a connection that stays open and lets **either side speak whenever it likes**. That is a **WebSocket**.

        It is the heavy-duty option. It is also the one that most changes how your servers behave, because the connection now has a *lifetime*.` },

    { kind: 'metaphor', title: 'A phone call instead of letters',
      body: `HTTP is **exchanging letters**. Every message needs an envelope with an address and a return address, and you wait for the reply before you know where things stand.

        A WebSocket is a **phone call**. The first moment is a bit formal: you dial, they pick up, you agree to talk. After that you simply speak, and so do they, even at the same time. No envelopes.

        Where the metaphor stops: a phone line is quiet when nobody speaks and nobody minds. Network equipment *does* mind, and may hang up a silent line, which is why WebSockets need little "are you still there?" messages.` },

    { kind: 'sequence', title: 'From HTTP request to open channel',
      body: 'A WebSocket always begins life as an ordinary HTTP request. Step through it.',
      actors: ['Browser', 'Server'],
      steps: [
        { from: 0, to: 1, label: 'GET /chat  Upgrade: websocket', note: 'A normal GET, with an extra request: "can we switch to the WebSocket protocol?"' },
        { from: 1, to: 0, label: '101 Switching Protocols', dashed: true, note: 'The server agrees. **101** means "yes, we are changing the rules of this connection".' },
        { note: 'From this moment it is no longer HTTP. The same underlying connection now carries WebSocket messages.' },
        { from: 0, to: 1, label: '“hi, I am Sam”', note: 'The browser can send whenever it likes.' },
        { from: 1, to: 0, label: '“welcome Sam”', dashed: true, note: 'And so can the server, with **no request** needed.' },
        { from: 1, to: 0, label: '“Priya: hello!”', dashed: true, note: 'Someone else said something. The server passes it on at once.' }
      ] },

    { kind: 'code', title: 'The handshake, line by line',
      body: 'Here is the actual text. Because it starts as HTTP, it passes through proxies and load balancers that understand HTTP. **Tap the lines.**',
      code: { lang: 'http', src: `
        GET /chat HTTP/1.1
        Host: chat.example.com
        Upgrade: websocket
        Connection: Upgrade
        Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
        Sec-WebSocket-Version: 13

        HTTP/1.1 101 Switching Protocols
        Upgrade: websocket
        Connection: Upgrade
        Sec-WebSocket-Accept: s3pPLMBiTxaQ9kYGzzhZRbK+xOo=`,
        notes: {
          1: 'An ordinary \`GET\`. The path is just a name your server code listens on.',
          3: 'The key line: "please **upgrade** this connection to the WebSocket protocol".',
          5: 'A random value from the browser. The server must transform it in a fixed way and send the result back, which proves it really understands WebSockets and is not an old server echoing garbage.',
          8: '**101** is the only reply that matters. Anything else (such as a 403) means no WebSocket.',
          11: 'The transformed key. The browser checks it. If it matches, the channel is open. Secure sites use \`wss://\`, which is WebSocket over TLS, just as \`https\` is HTTP over TLS.'
        } } },

    { kind: 'code', title: 'Using it from the browser',
      body: 'Like SSE, browsers have this built in. Unlike SSE, it can send. **Tap the lines.**',
      code: { lang: 'js', src: `
        const ws = new WebSocket('wss://chat.example.com/chat');
        ws.onopen = () => {
          ws.send(JSON.stringify({ type: 'hello' }));
        };
        ws.onmessage = (e) => {
          show(JSON.parse(e.data));
        };
        ws.onclose = () => {
          reconnectLater();
        };`,
        notes: {
          1: 'Does the handshake from the previous card for you.',
          3: '\`send\` goes straight down the open channel, any time after it opens. No request, no response, no headers.',
          5: 'Runs every time the server sends something, however often.',
          8: 'The connection ended. Unlike \`EventSource\`, the browser **does not reconnect for you**. Deciding when to retry (with a growing delay), and what to re-send, is your job. Libraries usually handle this.'
        } } },

    { kind: 'concept', title: 'Frames, pings and pongs',
      body: `Once open, data flows in small packages called **frames**. A frame carries either text or binary data, so WebSockets can send things like images or game state that SSE cannot.

        There are also small **control frames**:

        - **ping:** "are you still there?"
        - **pong:** "yes, I am."
        - **close:** "I am hanging up, here is why."

        Why bother? An idle connection may be quietly dropped by a router, a firewall or a load balancer that has not seen traffic for a minute or so. Regular pings **keep the line looking alive**, and a missing pong tells you the other end is gone so you can clean up instead of holding a dead connection forever.` },

    { kind: 'diagram', title: 'The scaling problem: who is on which server?',
      body: 'One server remembers its own open connections. With two servers, Alice and Bob are on different ones. How does Alice’s message reach Bob?',
      nodes: [
        { id: 'a', label: 'Alice', icon: '👩', x: 0, y: 0 },
        { id: 'b', label: 'Bob', icon: '👨', x: 2, y: 0 },
        { id: 's1', label: 'Server 1', icon: '🖥️', x: 0, y: 1 },
        { id: 's2', label: 'Server 2', icon: '🖥️', x: 2, y: 1 },
        { id: 'p', label: 'Pub/sub backplane', icon: '📣', x: 1, y: 3, tone: 'accent' }
      ],
      edges: [
        { from: 'a', to: 's1', label: 'sends', both: true },
        { from: 'b', to: 's2', label: 'connected', both: true },
        { from: 's1', to: 'p', label: 'publish' },
        { from: 'p', to: 's2', label: 'deliver', dashed: true }
      ],
      caption: 'Server 1 only knows Alice. It publishes the message to a shared channel; every server hears it, and the one holding Bob forwards it.',
      note: 'The shared channel is usually a pub/sub system such as Redis, or a message broker, which the next module covers properly.' },

    { kind: 'realworld', title: 'Webhooks: when a server calls a server',
      body: `Everything so far was a **browser** and a server. What if one *server* needs to tell another? Your shop uses a card-payment company. A customer pays. How does your server find out?

        You could poll their API all day. Or you leave them a **phone number**: a URL on your server. When the payment succeeds, **they send an HTTP POST to it**. That is a **webhook**.

        It is a request in reverse: the other service calls you. Payment providers and code hosts such as GitHub work this way.

        Three habits matter. **Verify** the sender (providers sign each request; check the signature). **Answer fast** with a 2xx and do slow work afterwards. And expect **repeats**: a delivery that times out gets retried, so handle the same event twice safely.` },

    { kind: 'compare', title: 'Choosing a technique',
      body: 'The decision in one table.',
      cols: ['Direction', 'Best for'],
      rows: [
        ['**Short polling**', 'Client asks', 'Slow data, job status, small apps'],
        ['**Long polling**', 'Client asks, server holds', 'Near-live updates on awkward networks'],
        ['**SSE**', 'Server to client', 'Feeds, notifications, progress, streamed text'],
        ['**WebSockets**', 'Both ways', 'Chat, games, collaboration'],
        ['**Webhooks**', 'Server to server', 'Telling another system an event happened']
      ],
      note: 'The usual advice: use the simplest one that meets the freshness you need. Engineers disagree about where that line sits, but few regret starting simple.' },

    { kind: 'steps', title: 'Choosing in four questions',
      body: 'Ask in this order and stop at the first yes.',
      steps: [
        { title: 'Is it one server telling another?', body: 'Use a **webhook**. A browser cannot receive one, because it has no stable address to call.' },
        { title: 'Do both sides send often and quickly?', body: 'Use **WebSockets**: chat, multiplayer, shared editing. Accept the extra work of reconnecting and scaling.' },
        { title: 'Does only the server have news, and should it be fresh?', body: 'Use **SSE**. You get reconnection and replay for free and stay on plain HTTP.' },
        { title: 'Is a few seconds of delay fine?', body: 'Just **poll**. Use long polling if you need fresher data on awkward networks.' }
      ] }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'In a WebSocket handshake, which status code means the server has agreed to switch protocols?',
      options: ['101', '200', '301', '426'],
      answer: 0,
      why: [null, '200 would be an ordinary reply and no upgrade would happen.', '301 is a redirect to another address.', '426 means the server insists you must upgrade, which is the opposite of accepting.'],
      explain: '**101 Switching Protocols** is the server saying yes. From then on the connection carries WebSocket frames instead of HTTP messages.' },

    { type: 'tf', after: 4, statement: 'Just like EventSource, the browser’s WebSocket object automatically reconnects when the connection drops.', answer: false,
      explain: 'Only `EventSource` reconnects for free. With a `WebSocket` you handle `onclose` yourself, usually with a growing delay, and decide what to re-send. Many libraries do this for you.' },

    { type: 'match', after: 8, prompt: 'Match each need to the best technique.',
      pairs: [['A payment company tells your server a payment succeeded', 'Webhook'], ['A multiplayer game sending moves constantly', 'WebSockets'], ['A live scoreboard the user only watches', 'Server-Sent Events'], ['Checking whether a nightly report is ready', 'Short polling']] },

    { type: 'order', prompt: 'Put a WebSocket connection’s life in order.',
      items: ['The browser sends an HTTP GET asking to upgrade', 'The server replies 101 Switching Protocols', 'Both sides send frames whenever they like', 'Pings and pongs check the line is still alive', 'One side sends a close frame and the connection ends'],
      explain: 'It starts as HTTP, switches protocol, runs as a two-way channel kept alive with pings and pongs, and ends with a close. The first two steps are the only HTTP part.' },

    { type: 'short', q: 'Which kind of control frame asks the other side “are you still there?”', accept: ['ping'], hint: 'Pong is the reply.',
      explain: 'A **ping** frame asks; the other side answers with a **pong**. A missing pong tells you the connection is probably dead.' },

    { type: 'cloze', text: 'A {{webhook}} is when one server sends an HTTP {{POST}} to a URL on another server. Because deliveries are retried, the receiver should be ready to see the same event {{twice}}.',
      distractors: ['GET', 'once', 'polling'],
      explain: 'A webhook is a request in reverse. At-least-once retries mean duplicates will happen, so handle them safely, for instance by remembering event ids.' },

    { type: 'bucket', prompt: 'Which technique would you pick for each feature?', buckets: ['Polling', 'SSE', 'WebSockets', 'Webhook'],
      items: [['A dashboard that refreshes every minute', 0], ['“Is my video finished converting?” checked every few seconds', 0], ['Live notification badge (“3 new replies”)', 1], ['Streaming a long answer word by word to the page', 1], ['A shared drawing board with many people drawing', 2], ['An online chess game with a clock', 2], ['A code host telling your build server a commit arrived', 3], ['A bank telling your shop that a transfer cleared', 3]],
      explain: 'Slow or occasional checks suit polling. One-way server news suits SSE. Constant two-way traffic from the browser suits WebSockets. Server-to-server events suit webhooks.' },

    { type: 'scenario', title: 'The live auction', intro: 'You are building an online auction. Bidders watch the price climb and place bids, and a payment company handles the money. Bids must feel instant, and nobody should ever lose an auction because of lag.',
      meters: { 'bidder experience': 40, 'reliability': 50 },
      steps: [
        { text: 'How should the browser exchange bids and price updates with your server?',
          choices: [
            { label: 'A WebSocket: bids go up, price updates come down, instantly', score: 2, effects: { 'bidder experience': 30, 'reliability': 5 }, feedback: 'Bids are frequent, small and two-way, and every millisecond matters. This is the textbook case for WebSockets.' },
            { label: 'SSE for price updates, plus a normal POST to place a bid', score: 1, effects: { 'bidder experience': 20 }, feedback: 'A reasonable and simpler design that would work well. With heavy bidding traffic, a single WebSocket usually feels tighter and avoids managing two channels.' },
            { label: 'Poll every 30 seconds', score: 0, effects: { 'bidder experience': -20 }, feedback: 'Prices would jump in front of people’s eyes. Bidders would lose auctions in the gap.' }
          ] },
        { text: 'The payment company charges the winner. How does your server learn that the payment worked?',
          choices: [
            { label: 'Expose a webhook URL; verify the signature, reply 2xx and handle repeats safely', score: 2, effects: { 'reliability': 25 }, feedback: 'The provider calls you the moment it knows, and retries if you are down. Signature checks stop anyone faking a “paid” message.' },
            { label: 'Have the winner’s browser report “I paid” to your server', score: 0, effects: { 'reliability': -30 }, feedback: 'A browser can lie, or close before reporting. Never trust the client for money. Learn it from the provider directly.' },
            { label: 'Poll the provider’s API every second for every unpaid auction', score: 1, effects: { 'reliability': 5 }, feedback: 'It works, but it is wasteful and may hit the provider’s rate limits. A webhook says the same thing for free.' }
          ] },
        { text: 'Success: you now run three app servers behind a load balancer. Bidders on server 1 do not see bids placed by people connected to server 2. What do you do?',
          choices: [
            { label: 'Add a pub/sub backplane: every server publishes bids and forwards what it hears', score: 2, effects: { 'bidder experience': 20, 'reliability': 15 }, feedback: 'Each server only knows its own connections, so they share events through a common channel. This is the standard fix.' },
            { label: 'Force every bidder onto one server', score: 1, effects: { 'bidder experience': 5, 'reliability': -20 }, feedback: 'It works until that one server is full or restarts, then every connection drops at once. You have also thrown away your scaling.' },
            { label: 'Tell people to refresh to see other bids', score: 0, effects: { 'bidder experience': -30 }, feedback: 'The whole point was to feel live. Bidders will go and use a competitor.' }
          ] }
      ],
      outro: 'The pattern: **match the technique to the direction and urgency of the data, and remember that stateful connections need a way to share events between servers.**' },

    { type: 'explain', prompt: 'A colleague wants WebSockets for a page that shows a live count of items in stock, updated every few seconds. Explain what you would suggest instead, and why.',
      model: 'Only the server has news here and the browser never needs to send anything quickly, so the data is one-way. Server-Sent Events fit: they stay on plain HTTP, reconnect automatically and are simpler to run than WebSockets. If a delay of a few seconds is fine, even polling could be enough. WebSockets add the cost of stateful connections and scaling for no benefit.',
      keywords: ['one-way', 'SSE', 'simpler', 'reconnect', 'polling', 'stateful', 'scaling'] }
  ],

  flashcards: [
    { q: 'How does a WebSocket connection begin?', a: 'As a normal HTTP GET with Upgrade: websocket. If the server replies 101 Switching Protocols, the connection becomes a two-way WebSocket channel.' },
    { q: 'What are ping and pong frames for?', a: 'Ping asks “are you there?” and pong answers. They keep idle connections from being dropped by networks and reveal dead connections.' },
    { q: 'Why are WebSocket servers harder to scale than plain HTTP ones?', a: 'Each server holds its own open connections, so users on different servers cannot reach each other without a shared pub/sub backplane, and deploys drop connections.' },
    { q: 'What is a webhook, and what three habits should receivers have?', a: 'One server POSTing to a URL on another when an event happens. Verify the signature, reply 2xx quickly, and handle duplicate deliveries.' },
    { q: 'Give the rule of thumb for choosing a real-time technique.', a: 'Webhook for server to server; WebSockets for frequent two-way; SSE for server-only news; polling when a delay is fine. Use the simplest that fits.' }
  ],

  glossary: [
    { term: 'WebSocket', def: 'A protocol that upgrades an HTTP connection into a long-lived channel where both sides can send messages at any time.', like: 'A phone call, after the dialling.' },
    { term: 'Frame', def: 'A small packet of data on a WebSocket connection: text, binary, or a control message such as ping, pong or close.', like: 'A single sentence in a phone call.' },
    { term: 'Heartbeat', def: 'A regular ping and pong between the two ends to show the connection is still alive.', like: 'Saying “still there?” on a quiet phone call.', aka: ['ping/pong'] },
    { term: 'Pub/sub backplane', def: 'A shared message channel between servers, so an event received by one can be delivered to users connected to another.', like: 'An office tannoy every team can hear.' },
    { term: 'Webhook', def: 'An HTTP request that one server sends to a URL on another server when something happens, so the second need not poll.', like: 'Leaving your phone number so the shop calls you.' }
  ],

  takeaways: [
    'A **WebSocket** starts as HTTP, gets a **101**, then becomes a two-way channel.',
    '**Ping/pong** keeps the line alive; reconnecting is **your** job, unlike SSE.',
    'Open connections are **stateful**: scaling needs a **pub/sub backplane** between servers.',
    '**Webhooks** are for server to server. Pick the simplest technique that meets the freshness you need.'
  ],

  links: [
    { label: 'MDN: The WebSocket API', url: 'https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('realtime', {
  title: 'The Hall of Echoes',
  intro: 'A ghostly hall repeats everything you say, but only when you speak first. Choose the right way to make it talk back, and spot the traps that make a live system fall over.',
  questions: [
    { type: 'mcq', q: 'Why can a plain HTTP server not push a new score to a browser by itself?',
      options: ['HTTP is request and response: the client must speak first', 'Browsers block all incoming data until the user clicks', 'Servers are not allowed to keep any data about the score', 'HTTP connections close after exactly one second'],
      answer: 0,
      why: [null, 'Browsers receive data happily; they just need to have asked for it.', 'Servers can hold any data they like. They just cannot start the conversation.', 'There is no fixed one-second limit. The issue is who is allowed to speak first.'],
      explain: 'Plain HTTP is pull: the server can only answer a request. Every real-time technique is a way round that.' },

    { type: 'estimate', q: 'A page has 20,000 viewers, each polling once every 4 seconds. Roughly how many requests per second does the server receive?',
      answer: 5000, unit: 'requests per second', tolerance: 2,
      explain: '20,000 ÷ 4 = **5,000 requests per second**, and most return “nothing new”. This is the waste that long polling, SSE and WebSockets avoid.' },

    { type: 'tf', statement: 'In long polling, the server replies to each request immediately, exactly as in short polling.', answer: false,
      explain: 'The server deliberately holds the request until it has news (or a timeout), which is why the reply arrives the moment there is something to say.' },

    { type: 'order', prompt: 'Put an SSE reconnection in order.',
      items: ['The connection drops', 'The browser waits briefly', 'It reconnects, sending Last-Event-ID', 'The server replays the events it missed', 'Live events flow again'],
      explain: '`EventSource` handles the first three steps itself; the server only has to read the header and replay from that point.' },

    { type: 'spot', prompt: 'This browser code opens a WebSocket. Tap the line where a real app would be missing something important.',
      code: { lang: 'js', src: `
        const ws = new WebSocket('wss://game.example.com/play');
        ws.onopen = () => ws.send('{"type":"join"}');
        ws.onmessage = (e) => update(JSON.parse(e.data));
        ws.onclose = () => {
          console.log('closed');
        };` },
      lines: [4, 5],
      explain: 'Unlike `EventSource`, a `WebSocket` does not reconnect by itself. Logging “closed” and doing nothing leaves the player stranded after any network blip. It should retry with a growing delay and re-join.' },

    { type: 'mcq', q: 'You deploy a chat app with WebSockets on three servers. Alice and Bob are in the same room but connected to different servers, and cannot see each other’s messages. What is the standard fix?',
      options: ['A shared pub/sub channel between the servers', 'Make the browsers poll as well', 'Use HTTP/3 instead', 'Increase the ping interval'],
      answer: 0,
      why: [null, 'Polling alongside a WebSocket would add load without fixing the cause: servers do not share events.', 'The HTTP version does not change which server holds which connection.', 'Pings keep connections alive; they do not move messages between servers.'],
      explain: 'Each server knows only its own connections. A pub/sub backplane lets one server publish an event and every other server forward it to its users.' },

    { type: 'bucket', prompt: 'Sort each need by the best-fit technique.', buckets: ['Polling', 'SSE', 'WebSockets', 'Webhook'],
      items: [['A report page that checks if a job is done', 0], ['A news ticker on a website', 1], ['A live progress bar for an upload scan', 1], ['A multiplayer drawing app', 2], ['A video-call chat sidebar with typing indicators', 2], ['A payment provider confirming a charge to your backend', 3]],
      explain: 'Match direction and urgency: occasional checks poll, one-way server news streams, constant two-way traffic needs WebSockets, and server-to-server events use webhooks.' },

    { type: 'cloze', text: 'A WebSocket begins as an HTTP request containing an {{Upgrade}} header, and the server agrees by replying with status {{101}}. After that, regular {{pings}} stop idle connections being dropped.',
      distractors: ['Accept-Language', '301', 'cookies'],
      explain: 'The handshake uses `Upgrade` and `101 Switching Protocols`; ping and pong frames keep the line alive and expose dead connections.' },

    { type: 'multi', q: 'Which of these are genuine limits of Server-Sent Events?',
      options: ['Communication only goes from server to browser', 'It carries text, not raw binary', 'It cannot reconnect after a dropped connection', 'The browser’s EventSource cannot set custom request headers', 'It needs a special non-HTTP port'],
      answers: [0, 1, 3],
      explain: 'SSE is one-way, text-based, and `EventSource` cannot add headers such as `Authorization`. It does reconnect automatically, and it runs on ordinary HTTP.' },

    { type: 'ab', q: 'A webhook handler receives a payment event. Which handler is better?',
      a: { lang: 'js', label: 'Verify, record, reply fast', src: `
        app.post('/hooks/pay', (req, res) => {
          if (!validSignature(req)) return res.sendStatus(400);
          if (!seen(req.body.id)) queueForProcessing(req.body);
          res.sendStatus(200);
        });` },
      b: { lang: 'js', label: 'Do everything inline', src: `
        app.post('/hooks/pay', async (req, res) => {
          await shipOrder(req.body);
          await sendEmail(req.body);
          res.sendStatus(200);
        });` },
      answer: 'a',
      explain: 'Checking the signature stops forged events. Remembering ids makes repeated deliveries harmless, and replying quickly stops the sender timing out and retrying. Doing slow work inline risks duplicates and timeouts, and trusts anyone who calls.' },

    { type: 'short', q: 'Which technique lets a payment company tell your server that a payment succeeded, by calling a URL you gave them?', accept: ['webhook', 'webhooks'], hint: 'A reverse API call.',
      explain: 'A **webhook** is one server sending an HTTP request to another when an event happens, so the receiver does not have to poll.' },

    { type: 'match', prompt: 'Match each idea to its description.',
      pairs: [['Short polling', 'Ask on a timer; always answered at once'], ['Long polling', 'Request held open until there is news'], ['Last-Event-ID', 'Lets SSE resume after a drop'], ['101 Switching Protocols', 'The WebSocket handshake is accepted'], ['Pub/sub backplane', 'Shares events between servers']] }
  ]
});

KS.sheet('realtime', {
  title: 'Real-time communication cheat sheet',
  sections: [
    { title: 'The problem', md: `HTTP is **pull**: the client speaks first, the server only answers.

- **Real-time** = fast enough that a human does not notice. Games: milliseconds. Dashboards: tens of seconds.
- **Push** = server starts the message. **Pull** = client asks.
- First question: *how fresh does this need to be?*
- Real-time has costs: open connections, retries, reconnection logic.` },

    { title: 'The five techniques', md: `| Technique | Direction | Notes |
|---|---|---|
| Short polling | Client asks | Simple; delay + waste |
| Long polling | Client asks, server holds | Fresher; one open request per user |
| SSE | Server to client | One-way, text, auto-reconnect |
| WebSockets | Both ways | Frames, ping/pong, stateful |
| Webhooks | Server to server | Provider POSTs to your URL |` },

    { title: 'Polling', md: `- Short polling: a repeating timer. Average delay is **half the interval**; worst case a whole interval.
- Waste: users × requests per user, mostly "nothing new".
- Long polling: server holds the request, then answers; the client asks again at once.
- Keep a **bookmark** (\`since=42\`), set server **timeouts** (about 25 s), and **back off** after errors.
- Good enough for slow data, job status, small apps.` },

    { title: 'Server-Sent Events', md: `\`\`\`http
Content-Type: text/event-stream

id: 42
event: goal
data: {"score": "2-0"}
\`\`\`
- A **blank line** ends each event.
- Browser: \`new EventSource(url)\`; it reconnects and sends \`Last-Event-ID\`.
- Limits: one-way, text only, no custom headers, about 6 connections per site on HTTP/1.1.` },

    { title: 'WebSockets', md: `- Starts as HTTP \`GET\` with \`Upgrade: websocket\`; server answers **101 Switching Protocols**.
- \`wss://\` = WebSocket over TLS.
- **Frames:** text, binary, ping, pong, close.
- Reconnecting is **your** job (use backoff).
- Scaling: connections are stateful, so servers need a **pub/sub backplane**; deploys drop connections.` },

    { title: 'Webhooks', md: `- The other service sends an HTTP **POST** to your URL when an event happens.
- **Verify** the signature.
- **Reply 2xx fast**, do slow work afterwards.
- **Expect duplicates**: handle each event id safely twice.
- Browsers cannot receive webhooks; they are server to server.` },

    { title: 'Choosing', md: `1. Server telling a server? **Webhook**.
2. Both sides chatty and quick? **WebSockets**.
3. Only the server has news? **SSE**.
4. Delay is fine? **Polling**.

Common mistakes: polling too fast, no backoff on reconnect, forgetting a bookmark or event id, WebSockets for one-way data.` }
  ]
});

