/* Module: architect-role — The Architect's Job.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs architect-role */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ar-what-is-architecture', {
  eli5: 'Software architecture is the big-picture shape of a system (its main parts and how they connect) together with the reasons behind those choices, and good architecture is the kind that keeps future changes cheap.',

  cards: [
    { kind: 'story', title: 'One feature, two companies',
      body: `Two online shops each get the same request on the same Monday: "Let customers pay with a new wallet app."

        At **Shop A**, a developer finds one place where payments are handled, adds a small adapter, tests it, and ships by Wednesday.

        At **Shop B**, payment calls are scattered through forty files. Prices are calculated in three places. Nobody is sure what else breaks. The change takes three weeks and causes two outages.

        Same request, same-sized teams, same programming language. The difference is not talent. It is that Shop A's code has a **shape** that was chosen on purpose, and Shop B's shape just happened.` },

    { kind: 'concept', title: 'Architecture = structure + the reasons',
      body: `**Software architecture** has two halves.

        **1. Structure.** The main parts of a system (services, modules, databases, queues) and how they connect and talk. This is the part people draw as boxes and arrows.

        **2. The decisions behind it.** *Why* it is split this way. Why a queue here and not a direct call. Why one database and not three. What was traded away.

        The second half is the one people forget, and it is the one that matters when you come back in a year. A diagram without its reasons is a map with no legend: you can see the roads but not why they go there.` },

    { kind: 'metaphor', title: 'Foundations, walls and paint',
      body: `A house has decisions of very different weight. The colour of the bedroom is a Saturday job. Moving a window is a builder and a week. Moving a **load-bearing wall** needs an engineer, a big budget, and a lot of dust. Changing the foundations after the roof is on is barely possible.

        Software is the same. Renaming a variable is paint. Splitting the database in two is a load-bearing wall.

        **Architecture is mostly the load-bearing decisions**: the ones that are expensive to reverse, so they deserve thought up front. Where the metaphor stops: software walls *can* be moved. They are just far more expensive to move the later you leave it.` },

    { kind: 'diagram', title: 'A small shop, and the "why" behind it',
      body: 'Every box and arrow here is the result of a decision somebody made. Imagine the reasons written beside each one.',
      nodes: [
        { id: 'web', label: 'Web app', icon: '💻', x: 1, y: 0 },
        { id: 'orders', label: 'Orders module', icon: '🧾', x: 0, y: 1 },
        { id: 'pay', label: 'Payments module', icon: '💳', x: 2, y: 1, tone: 'accent' },
        { id: 'db', label: 'One database', icon: '🗄️', x: 0, y: 2 },
        { id: 'prov', label: 'Payment provider', icon: '🏦', x: 2, y: 3, tone: 'muted' }
      ],
      edges: [
        { from: 'web', to: 'orders' }, { from: 'web', to: 'pay' }, { from: 'orders', to: 'db' },
        { from: 'pay', to: 'prov', label: 'via one adapter' }
      ],
      caption: '**One database**: simple, easy to keep consistent, good enough for now. **One payments module** behind one adapter: so changing provider touches one place. Those two sentences are the architecture; the picture is just the shape.' },

    { kind: 'compare', title: 'Which decisions are architectural?',
      body: 'There is no sharp line, but a good test is: *how expensive is this to change later, and how many people does it affect?*',
      cols: ['Usually architectural', 'Usually a detail'],
      rows: [
        ['Cost to change', 'High: weeks, many teams', 'Low: minutes, one person'],
        ['Reach', 'Shapes how many parts relate', 'Stays inside one part'],
        ['Example', 'Monolith or separate services; sync calls or messages', 'Name of a variable; which loop style'],
        ['Example', 'Where users are authenticated; one database or many', 'The padding on a button']
      ],
      note: 'Experts argue about exactly where the boundary sits, and it moves with context. "Would it hurt to undo this?" is a good everyday proxy.' },

    { kind: 'concept', title: 'Why it matters more as systems grow',
      body: `A weekend project can have almost any shape and still work: one person holds it all in their head.

        As a system grows, three things change:

        - **More people**, who must work in parallel without stepping on each other.
        - **More code**, which no single person can fully understand.
        - **More time**, so early shortcuts have years to compound.

        At that point, structure is what decides whether ten developers move ten times faster or trip over one another. A good shape lets people work on separate parts, understand a part without reading the whole, and change one thing without breaking five others.

        Bad architecture rarely announces itself. It shows up as everything slowly taking longer.` },

    { kind: 'concept', title: 'Architecture is never finished',
      body: `It is tempting to imagine architecture as a blueprint drawn once at the start and then built. Real systems do not work like that.

        The business changes. Traffic grows ten times. A better tool appears. Something you assumed turns out to be false. So the architecture has to **keep evolving** along with the system.

        That does not mean redesigning every month. It means:

        - treating decisions as **the best we know today**, and writing down what they depended on;
        - noticing when a decision's assumptions have stopped being true;
        - changing course in small steps rather than waiting for a crisis.

        An architecture nobody tends slowly **erodes**: each rushed change bends the shape a little, until the shape is gone.` },

    { kind: 'compare', title: 'Good architecture makes change cheap',
      body: 'Return to the wallet app request. Here is what the same change costs in two shapes.',
      cols: ['Payments behind one adapter', 'Payments scattered'],
      rows: [
        ['Places to change', 'One adapter', 'About forty files'],
        ['Risk of breaking something else', 'Low: the boundary protects the rest', 'High: nobody knows the reach'],
        ['Testing', 'Test the adapter alone', 'Test the whole shop'],
        ['Time', 'Days', 'Weeks']
      ],
      note: 'This is the real test of an architecture: not how elegant the diagram looks, but **how cheaply the next unexpected change can be made**.' },

    { kind: 'pitfall', title: 'Architecture is not boxes, and not a one-off plan',
      body: `Three misunderstandings that waste months:

        - **"Architecture is the diagram."** The diagram is a *picture* of it. The real thing is the decisions and how the code actually behaves. A diagram that no longer matches reality is worse than none.
        - **"We'll design it all up front."** Big-design-up-front guesses about a future you cannot see. Decide the load-bearing things carefully; leave the rest flexible.
        - **"We don't need architecture, we're agile."** Every system has an architecture. If nobody chooses it, it is chosen by accident, usually by whoever was in a hurry.

        The goal is not *more* architecture. It is **enough, on purpose**.` },

    { kind: 'tip', title: 'Write down the why',
      body: `If you remember one habit from this module, make it this. When your team makes a significant decision, write **three lines**: what we chose, why, and what we gave up.

        Six months later, a new colleague asks "why on earth do we do it this way?" Without notes, the answer is a shrug, and someone "fixes" it, unaware of the reason. With notes, they learn the reasoning, and can tell whether it still holds.

        A later lesson shows a neat, lightweight way to do exactly this. For now: **structure is only half of architecture; the reasons are the other half.**` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'A new developer says, "I can see the boxes and arrows, but why is it built this way?" Which half of the architecture is missing?',
      options: ['The decisions and reasons behind the structure', 'The structure, because the boxes are not detailed enough', 'The source code, because it was not included', 'The test suite'],
      answer: 0,
      why: [null, 'The structure is the part they *can* see.', 'Code shows what exists, not why it was chosen.', 'Tests describe behaviour, not the reasoning behind the design.'],
      explain: 'Architecture is structure *plus* the reasons for it. Without the why, people cannot tell a deliberate choice from an accident.' },

    { type: 'tf', after: 4, statement: 'A good test for whether a decision is architectural is how expensive it would be to change later.', answer: true,
      explain: 'Expensive-to-reverse, wide-reaching decisions (the load-bearing walls) are the architectural ones. Cheap, local ones are details.' },

    { type: 'ab', after: 7, q: 'The business may change payment provider next year. Which design makes that change cheaper?',
      a: { lang: 'js', label: 'Behind one boundary', src: `
        // payments.js is the only file that knows the provider
        const receipt = await payments.charge(order.total, card);` },
      b: { lang: 'js', label: 'Called everywhere', src: `
        // in 40 different files:
        const receipt = await acmePay.createCharge({ amt: total, tok: card });` },
      answer: 'a',
      explain: 'Putting the provider behind one boundary means a change of provider touches one place. Calling the vendor directly all over the code makes every call site part of the change.' },

    { type: 'bucket', prompt: 'Which of these are typically architectural decisions, and which are local details?', buckets: ['Architectural', 'Local detail'],
      items: [['Splitting the system into separate services', 0], ['Where users are authenticated', 0], ['Messages between services or direct calls', 0], ['The name of one local variable', 1], ['The colour of a button', 1], ['Which style of loop to use in one function', 1]],
      explain: 'Architectural decisions are costly to reverse and shape how many parts interact. Details stay inside one part and are cheap to change.' },

    { type: 'match', prompt: 'Match each house idea to its software equivalent.',
      pairs: [['Painting a bedroom', 'Renaming a variable'], ['Moving a window', 'Reorganising one module'], ['Moving a load-bearing wall', 'Splitting one database into several'], ['The foundations', 'Core choices that everything else rests on'], ['Years of unrepaired damp', 'Architecture eroding without care']] },

    { type: 'cloze', text: 'Architecture has two halves: the {{structure}} of the system and the {{decisions}} behind it. Good architecture makes {{change}} cheap, and because the world keeps moving, it is never {{finished}}.',
      distractors: ['diagram', 'frozen', 'perfect'],
      explain: 'Structure and reasons together, judged by how cheaply the next change can be made, and always evolving.' },

    { type: 'scenario', title: 'Is architecture a luxury?', intro: 'You are the most experienced engineer at a 12-person startup. The CEO stops you in the kitchen: "We have a launch in six weeks. Do we really need to spend time on *architecture*? Can\'t we just build features?"',
      meters: { 'CEO trust': 55, 'future speed': 50 },
      steps: [
        { text: 'How do you answer?',
          choices: [
            { label: 'Say you will make only the few hard-to-undo decisions carefully, and keep everything else simple', score: 2, effects: { 'CEO trust': 20, 'future speed': 20 }, feedback: 'That is "enough, on purpose". It respects the deadline and still protects against the expensive mistakes.' },
            { label: 'Say yes, you need four weeks of design before any code', score: 0, effects: { 'CEO trust': -25, 'future speed': 5 }, feedback: 'Heavy up-front design guesses at a future you cannot see, and leaves no time to learn from real users.' },
            { label: 'Say no, you will skip it entirely and just move fast', score: 1, effects: { 'CEO trust': 10, 'future speed': -20 }, feedback: 'There will still be an architecture: an accidental one. Fast now, slow in six months.' }
          ] },
        { text: 'The CEO asks, "Fine. Which decisions are those hard-to-undo ones?" What do you pick out?',
          choices: [
            { label: 'How we store customer and payment data, how we split the system, and how users sign in', score: 2, effects: { 'CEO trust': 15, 'future speed': 20 }, feedback: 'Data, major boundaries and identity are costly to change later and touch everything. Worth a few careful hours.' },
            { label: 'Which colour the buttons are and what the folders are called', score: 0, effects: { 'CEO trust': -10, 'future speed': -5 }, feedback: 'Those are paint. Cheap to change at any time, so not worth up-front deliberation.' },
            { label: 'Everything, to be safe', score: 0, effects: { 'CEO trust': -15, 'future speed': -10 }, feedback: 'If everything is "important", nothing gets decided. Spend care only where change would be expensive.' }
          ] },
        { text: 'Three months after launch, the product pivots. What do you do with the earlier decisions?',
          choices: [
            { label: 'Revisit them: check which assumptions stopped being true and adjust in small steps', score: 2, effects: { 'future speed': 20, 'CEO trust': 15 }, feedback: 'Architecture is never finished. Because you wrote down why, you can see exactly which reasons no longer hold.' },
            { label: 'Defend them: they were the plan', score: 0, effects: { 'future speed': -20, 'CEO trust': -10 }, feedback: 'A decision is the best answer *at the time*. When the facts change, the right answer can too.' },
            { label: 'Throw it all away and start again', score: 1, effects: { 'future speed': -5, 'CEO trust': -15 }, feedback: 'Sometimes needed, but usually evolving in steps is cheaper and less risky than a restart.' }
          ] }
      ],
      outro: 'The pattern: **be careful where change is costly, stay light where it is cheap, and keep revisiting as facts change.**' },

    { type: 'explain', prompt: 'In your own words, explain what software architecture is and how you would tell whether a system has good architecture.',
      model: 'Architecture is the structure of a system (its main parts and how they connect) plus the decisions and reasons behind that structure, especially the costly-to-reverse ones. It matters more as systems and teams grow, and it is never finished because the business and technology keep changing. Good architecture is the kind that keeps change cheap: a new request touches few places, carries low risk and is quick to test.',
      keywords: ['structure', 'decisions', 'reasons', 'change', 'cheap', 'grow', 'evolves'] }
  ],

  flashcards: [
    { q: 'What are the two halves of software architecture?', a: 'The structure of the system (parts and connections) and the decisions and reasons behind that structure.' },
    { q: 'How can you tell whether a decision is architectural?', a: 'It is expensive to reverse and shapes how many parts or people interact. Cheap, local choices are details.' },
    { q: 'Why does architecture matter more as a system grows?', a: 'More people, more code and more time mean structure decides whether people can work in parallel and change things safely.' },
    { q: 'Why is architecture never finished?', a: 'The business, traffic and technology change, so decisions must be revisited and the shape adjusted in small steps. Neglect makes it erode.' },
    { q: 'What is the real test of good architecture?', a: 'How cheaply the next unexpected change can be made.' }
  ],

  glossary: [
    { term: 'Software architecture', def: 'The structure of a system (its main parts and connections) together with the significant decisions and reasons behind it.', like: 'The plan of a house and why the load-bearing walls are where they are.' },
    { term: 'Architectural decision', def: 'A choice that is expensive to reverse and affects many parts of a system, such as how it is split up or where data lives.', like: 'Moving a load-bearing wall rather than painting a room.' },
    { term: 'Architecture erosion', def: 'The gradual loss of a system\'s intended shape as rushed changes bend or ignore its design.', like: 'A garden left alone until the paths vanish.', aka: ['architecture drift'] },
    { term: 'Trade-off', def: 'A choice where gaining one quality costs you another, such as speed of delivery against flexibility.', like: 'Choosing a cheaper flat further from work.' }
  ],

  takeaways: [
    'Architecture = **structure + the reasons** behind it.',
    'The **hard-to-undo decisions** are the architectural ones; the rest is detail.',
    'It matters more as **people, code and time** grow, and it is **never finished**.',
    'The test: **how cheap is the next change?** Always write down the why.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ar-what-is-architect', {
  eli5: 'An architect helps a team make the important technical decisions well and makes sure they are understood and followed, which means far more talking, listening and thinking than drawing diagrams.',

  cards: [
    { kind: 'story', title: 'A Tuesday in the life',
      body: `Priya is the architect for a team building an online ticketing platform. Here is her Tuesday.

        | Time | What she is doing |
        |---|---|
        | 09:00 | Stand-up with one of the teams, listening for blocked decisions |
        | 10:00 | Meeting with the product owner: what must the new feature really do? |
        | 11:30 | Reads a design from a developer and asks three questions |
        | 13:30 | Pairs with a developer on a tricky spike to test an idea |
        | 15:00 | Explains to the security team why a design changed |
        | 16:30 | Writes a short note recording today's decision and why |

        Notice what is **missing**: a long stretch alone drawing boxes. Most of the job happens in conversation.` },

    { kind: 'concept', title: 'The role in one sentence',
      body: `Job titles are slippery, but here is a definition most people could accept:

        > An architect helps the team **make the important technical decisions well**, and makes sure those decisions are **understood, recorded and followed**.

        Three parts matter:

        - **Helps**: the architect rarely decides alone, and often does not have the last word.
        - **Important decisions**: not every decision. The costly-to-change ones from the last lesson.
        - **Understood and followed**: a brilliant decision nobody understands might as well not exist.

        The deliverable is not a diagram. It is a team that moves in a good direction on purpose.` },

    { kind: 'metaphor', title: 'The conductor, not the soloist',
      body: `A conductor does not play every instrument, and is not usually the best violinist in the room. Their job is to make sure the **orchestra plays together**: the right tempo, the right balance, everyone starting at the same moment.

        An architect is similar. They are not there to write the most code. They help many talented people, each with their own part, produce one coherent system rather than eight excellent but incompatible ones.

        Where the metaphor stops: an orchestra has a score written in advance. A software team has to *discover* the score as it plays, so the architect has to listen and adjust far more than a conductor ever does.` },

    { kind: 'steps', title: 'What the work actually involves',
      body: 'Five activities fill most of an architect\'s week. The mix varies by company.',
      steps: [
        { title: 'Understand the problem', body: 'Talk to users, the business and the teams. Find out what must be true: how many users, how fast, how secure, how soon, how much money.' },
        { title: 'Make (and record) the key decisions', body: 'Weigh the options with the team, choose, and write down the reasons and the trade-offs.' },
        { title: 'Guide the design', body: 'Review designs, answer questions, set a few clear principles, and keep the parts fitting together.' },
        { title: 'Check it is really built that way', body: 'Look at the actual code and systems. Plans drift, and the architect is the one who notices.' },
        { title: 'Communicate, constantly', body: 'Explain the why to developers, managers and customers, and bring their worries back into the design.' }
      ] },

    { kind: 'compare', title: 'Architect, senior developer, tech lead',
      body: 'These roles overlap heavily, and real people often wear several hats. A rough guide to the *centre of gravity* of each:',
      cols: ['Senior developer', 'Tech lead', 'Architect'],
      rows: [
        ['Main focus', 'Building excellent software in a team', 'Guiding one team\'s delivery and technical direction', 'Decisions across systems or teams'],
        ['Scope', 'Own code and component', 'One team and its product', 'Several teams or the whole system'],
        ['Typical output', 'Working, well-crafted code', 'A team that ships steadily', 'Decisions, principles, clarity'],
        ['Hands on code?', 'Almost entirely', 'Often substantially', 'Some: enough to stay credible']
      ],
      note: 'Companies define these titles differently, and in many teams the architect is a **hat** one senior person wears, not a separate job.' },

    { kind: 'concept', title: 'Titles are messy, the work is not',
      body: `Ask five companies what an "architect" is and you will get six answers. In one, it is a senior developer who also owns the big-picture decisions. In another, it is a full-time role that spans many teams. In a third, it is a rotating responsibility.

        Do not get hung up on the label. A useful question for any role is: **who is responsible for making sure our important decisions are good, shared and followed?** Whoever does that, with or without the title, is doing the architect's job.

        You will meet more specific labels in a moment (application, solution, enterprise architect). Those describe the *scale* someone works at, not a different kind of person.` },

    { kind: 'story', title: 'The ivory tower',
      body: `Dev, a developer, finds a document on the wiki called *Target Architecture v7*. It was written by an architect he has never met, who sits in another building. It says all services must communicate through a message bus. His team's feature needs one quick answer from another service, and a message bus would add a week of complexity.

        He asks the architect. The reply: "It's in the standard."

        He builds it his way. A few months later, an audit finds the team is "non-compliant", and a rewrite is scheduled. Everyone is annoyed. Nobody had been *wrong*, exactly. They had just never talked.

        This is the **ivory tower** anti-pattern: designing from a distance, issuing rules without context, and being disconnected from the code and the people who live with the consequences.` },

    { kind: 'compare', title: 'Ivory tower vs embedded architect',
      body: 'How to tell which kind you are looking at, or being.',
      cols: ['Ivory tower', 'Embedded'],
      rows: [
        ['Where they work', 'Away from the teams', 'With the teams, regularly'],
        ['How decisions appear', 'Handed down as documents', 'Reached together, with reasons explained'],
        ['When challenged', '"It\'s the standard."', '"Good point. Tell me what you are seeing."'],
        ['Knowledge of the code', 'Out of date', 'Current: they have read and sometimes written it'],
        ['Result', 'Quiet workarounds and resentment', 'Understanding, buy-in and fewer surprises']
      ] },

    { kind: 'tip', title: 'How to avoid becoming a tower',
      body: `A few habits keep an architect grounded:

        - **Sit with the teams.** Join stand-ups and design chats as a colleague, not an inspector.
        - **Explain the why** with every decision. A rule with a reason gets followed; a rule without one gets worked around.
        - **Stay near the code.** Read pull requests, try spikes, pair now and then.
        - **Invite disagreement.** If nobody ever pushes back, either you are always right (unlikely) or people have stopped telling you.
        - **Be accountable.** If a decision turns out badly, own it and help fix it.

        The authority of a good architect comes from being **useful and trusted**, not from the title.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'Which description best fits the architect\'s main job?',
      options: ['Helping the team make important technical decisions well, and making sure they are understood and followed', 'Writing the most code on the team', 'Producing the full design that developers then implement exactly', 'Approving or rejecting every pull request'],
      answer: 0,
      why: [null, 'Some coding keeps them credible, but it is not the centre of the job.', 'A design handed over with no conversation is the ivory-tower pattern.', 'Approving everything makes the architect a bottleneck rather than a help.'],
      explain: 'The role is about good decisions made with the team, and shared understanding. The diagram is only a by-product.' },

    { type: 'match', after: 4, prompt: 'Match each role to its centre of gravity.',
      pairs: [['Senior developer', 'Excellent, well-crafted software in a team'], ['Tech lead', 'One team\'s steady delivery and technical direction'], ['Architect', 'Important decisions across systems or teams'], ['Ivory-tower architect', 'Rules issued from a distance, disconnected from the code']] },

    { type: 'tf', after: 6, statement: 'In the ivory-tower anti-pattern, the main problem is that the architect\'s design is always technically wrong.', answer: false,
      explain: 'The design may well be sound. The problem is the disconnection: no conversation, no context, no current knowledge of the code, so people work around it.' },

    { type: 'bucket', prompt: 'Whose job is each of these most naturally, in a typical team?', buckets: ['Senior developer', 'Tech lead', 'Architect'],
      items: [['Crafting a clean, well-tested module', 0], ['Mentoring a junior on code quality', 0], ['Unblocking the team\'s sprint and keeping delivery steady', 1], ['Dividing work among the team for this month', 1], ['Choosing how three teams\' services will talk to one another', 2], ['Recording why the team chose one database technology', 2]],
      explain: 'These roles overlap, but the centres differ: senior developers build, tech leads steer a team, architects steer decisions across several. In small companies one person may do all three.' },

    { type: 'ab', q: 'A developer\'s design contradicts a team principle. Which reply from the architect is better?',
      a: { lang: 'text', label: 'Curious', src: `
        Thanks for the draft. I can see why you chose a direct call.
        The principle is there because of failures we had last year. Could
        we look at your case together this afternoon and see whether it
        still applies here?` },
      b: { lang: 'text', label: 'Rule-bound', src: `
        This violates Standard 4.2. Please redo it using the message bus.
        Resubmit for approval by Friday.` },
      answer: 'a',
      explain: 'The first reply explains the reason, shows respect and opens a conversation, which may reveal that the principle should bend. The second wins compliance and loses trust.' },

    { type: 'order', prompt: 'Put these in a sensible order for how an architect might handle an important decision.',
      items: ['Understand what the problem and constraints really are', 'Lay out the realistic options with their trade-offs', 'Discuss them with the people who will build and run it', 'Decide, and write down the reasons', 'Check later that it is being followed and still fits'],
      explain: 'Understanding comes first, then options, then conversation. The decision is recorded, and the loop closes by checking reality against the plan.' },

    { type: 'short', q: 'What two-word name is given to the anti-pattern of an architect who designs from afar and hands down rules?', accept: ['ivory tower', 'the ivory tower', 'ivorytower'], hint: 'A fairytale-sounding building, far from the real world.',
      explain: 'The ivory tower: disconnected from the code and the teams, so rules arrive without context and are worked around.' },

    { type: 'scenario', title: 'The standard nobody follows', intro: 'You have just been made architect for three teams. You discover the wiki holds a detailed "architecture standard", but when you look at the real code, none of the teams follows it. The head of engineering wants you to "enforce compliance".',
      meters: { 'team trust': 50, 'design quality': 50 },
      steps: [
        { text: 'What is your first move?',
          choices: [
            { label: 'Talk to each team: why do they work this way, and what problems were they solving?', score: 2, effects: { 'team trust': 20, 'design quality': 15 }, feedback: 'Nobody ignores a standard for no reason. Their reasons are the most useful information you can get.' },
            { label: 'Send an email demanding compliance by month-end', score: 0, effects: { 'team trust': -25, 'design quality': -5 }, feedback: 'You have joined the tower. People will comply on paper and keep working around it.' },
            { label: 'Rewrite the standard on your own over a weekend', score: 1, effects: { 'team trust': -5, 'design quality': 5 }, feedback: 'Updating it is a good instinct, but doing it alone repeats the original mistake.' }
          ] },
        { text: 'You learn that one rule makes a common task painfully slow, which is why teams skip it. What do you do?',
          choices: [
            { label: 'Change the rule with the teams, and record the reason for the change', score: 2, effects: { 'team trust': 20, 'design quality': 20 }, feedback: 'A standard that practice has outgrown should change. Writing down the new reason keeps it alive.' },
            { label: 'Keep the rule to be consistent', score: 0, effects: { 'team trust': -15, 'design quality': -10 }, feedback: 'Consistency with a rule everyone ignores is not consistency, just paperwork.' },
            { label: 'Let each team decide on its own for everything', score: 1, effects: { 'team trust': 5, 'design quality': -15 }, feedback: 'Freedom everywhere gives you three incompatible systems. Share the few decisions that truly need to be shared.' }
          ] },
        { text: 'The head of engineering asks how you will know the new approach is working. What do you propose?',
          choices: [
            { label: 'Regular design chats and reading real code to see where practice and plan differ', score: 2, effects: { 'team trust': 15, 'design quality': 20 }, feedback: 'Staying close to reality and to the people is the best early-warning system an architect has.' },
            { label: 'Count the number of documents produced each month', score: 0, effects: { 'team trust': -10, 'design quality': -10 }, feedback: 'Paperwork is not a measure of whether the system is getting better.' },
            { label: 'Ask the teams to report their own compliance score', score: 1, effects: { 'team trust': 0, 'design quality': 0 }, feedback: 'Self-reporting on a rule people dislike mostly measures how well people fill in forms.' }
          ] }
      ],
      outro: 'The pattern: **listen first, change rules with the people who live with them, then stay close enough to see the truth.**' },

    { type: 'explain', prompt: 'Explain the architect\'s role in your own words and say how it differs from a senior developer, and what the ivory tower is.',
      model: 'The architect helps the team make the important technical decisions well, and makes sure they are understood, recorded and followed. A senior developer mainly builds excellent software in a team, while an architect works on decisions across systems or teams, though good ones stay close enough to the code to be credible. The ivory tower is the anti-pattern of designing from a distance and handing down rules without context, so people work around them.',
      keywords: ['decisions', 'team', 'understood', 'senior developer', 'across', 'ivory tower', 'context'] }
  ],

  flashcards: [
    { q: 'What is the architect\'s role in one sentence?', a: 'To help the team make the important technical decisions well, and to make sure they are understood, recorded and followed.' },
    { q: 'What does an architect do day to day?', a: 'Understands the problem, makes and records key decisions with the team, guides design, checks reality against the plan, and communicates constantly.' },
    { q: 'How do architect, tech lead and senior developer differ?', a: 'Senior developer: building in a team. Tech lead: steering one team\'s delivery. Architect: decisions across systems or teams. They overlap heavily.' },
    { q: 'What is the ivory-tower anti-pattern?', a: 'An architect who designs from a distance and hands down rules without context, disconnected from the code and the teams.' },
    { q: 'How does an architect avoid becoming an ivory tower?', a: 'Work alongside teams, explain the reasons, stay close to the code, invite disagreement and stay accountable.' }
  ],

  glossary: [
    { term: 'Architect', def: 'The person (or hat worn by a senior engineer) responsible for helping a team make the important technical decisions well and making sure they are understood and followed.', like: 'The conductor of an orchestra.' },
    { term: 'Tech lead', def: 'A senior engineer who guides one team\'s technical direction and day-to-day delivery.', like: 'A team captain.' },
    { term: 'Ivory tower', def: 'An anti-pattern where designers work far from the teams and the code, handing down rules without context.', like: 'A planner who has never walked the streets they are redesigning.' },
    { term: 'Anti-pattern', def: 'A common response to a problem that looks sensible but reliably makes things worse.', like: 'A short cut that adds an hour to the journey.' }
  ],

  takeaways: [
    'The role: help the team **decide well**, and make sure decisions are **understood and followed**.',
    'Most of the work is **talking, listening and thinking**, not drawing.',
    'Architect, tech lead and senior developer **overlap**; the architect\'s centre is decisions across teams.',
    'Avoid the **ivory tower**: sit with teams, explain the why, stay near the code.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ar-levels', {
  eli5: 'Architecture happens at different zoom levels: inside one application, across the several systems that solve one business problem, and across the whole company\'s landscape of systems, and each level asks different questions.',

  cards: [
    { kind: 'story', title: 'Three people, one complaint',
      body: `A furniture company hears the same complaint again and again: "I have to log in three times to do one thing." Three architects at the company react in three different ways.

        **Maria** works on the web shop. She asks: *"Can I change how this one app handles sessions, so it feels smoother?"*

        **Tom** is building the new customer portal that joins the shop, delivery tracking and returns. He asks: *"How should these three systems share who the customer is?"*

        **Zainab** looks after the whole company. She asks: *"Why do we have five different login systems, and which one should be the future one?"*

        All three are right, and none of them can do the other's job. They are working at **different levels**.` },

    { kind: 'concept', title: 'Application architecture: inside one application',
      body: `**Application architecture** zooms in on **a single application or service**: how it is organised internally.

        The questions are the ones you have been studying in this course: How is the code split into modules and layers? Which patterns fit? How does it talk to its database? How is it tested and deployed? Which framework?

        The people doing this work live closest to the code. They are often a senior developer or a team's tech lead, and their decisions mainly affect **one team** and **one codebase**.

        Everything in the design principles, styles and patterns modules was, mostly, application architecture.` },

    { kind: 'concept', title: 'Solution architecture: one problem, several systems',
      body: `A business problem rarely fits inside one application. "Let customers return an item" might touch the shop, the warehouse system, the payment provider, an email service and a courier's website.

        **Solution architecture** designs the **whole answer to one business problem**, including how those pieces connect: which systems are involved, what each is responsible for, how they exchange data, what to build and what to buy, and how it fits budget and deadline.

        It sits between the business need and the individual applications. The solution architect's decisions reach **several teams** and often several **vendors**, and they shape what each application architect is then asked to build.` },

    { kind: 'concept', title: 'Enterprise architecture: the whole landscape',
      body: `Zoom out once more. A company of any size accumulates systems over the years: some bought, some built, some inherited by acquisition. The question is no longer one solution, but **how the whole landscape fits the business strategy**.

        **Enterprise architecture** (EA) looks across the entire organisation. Which capabilities does the business need? Which systems support them? Where are there duplicates (five login systems) or gaps? Which should be retired, which invested in? Which standards help everyone, and which just get in the way?

        The time horizon is long, years rather than weeks, and the audience is senior: executives, finance, many teams. EA is the most distant from the code, which is both its value and its danger, as the last lesson's ivory tower warned.` },

    { kind: 'metaphor', title: 'Street map, city map, country map',
      body: `Think of a digital map. Zoom in and you see **streets**, doors and one-way signs: perfect for finding the café. Zoom out to a **city map** and you see districts and bus routes: good for deciding where to live. Zoom out again to a **country map** and you see motorways and cities: good for planning a journey across the land.

        None is "the real" map. Each leaves out the detail that would clutter the question it answers.

        - Application architecture = the street map.
        - Solution architecture = the city map.
        - Enterprise architecture = the country map.

        Where the metaphor stops: on a map, the streets stay put while you look at the country. In a company, decisions at the country level change the streets.` },

    { kind: 'layers', title: 'The three levels, top to bottom',
      body: 'Widest scope first. Time horizons and audiences change as you move down.',
      layers: [
        { label: 'Enterprise architecture', note: 'The whole company. Years. Executives and many teams.', tone: 'info', icon: '🌍' },
        { label: 'Solution architecture', note: 'One business problem across several systems. Months. Several teams and vendors.', tone: 'accent', icon: '🧩' },
        { label: 'Application architecture', note: 'One application or service. Weeks to months. One team.', tone: 'good', icon: '🔧' }
      ] },

    { kind: 'diagram', title: 'Who talks to whom',
      body: 'Intent flows down, and reality flows up. Healthy organisations keep both arrows working.',
      nodes: [
        { id: 'biz', label: 'Business strategy', icon: '🎯', x: 1, y: 0, tone: 'muted' },
        { id: 'ea', label: 'Enterprise architect', icon: '🌍', x: 1, y: 1, tone: 'info' },
        { id: 'sa', label: 'Solution architect', icon: '🧩', x: 1, y: 2, tone: 'accent' },
        { id: 'aa', label: 'Application architects, teams', icon: '🔧', x: 1, y: 3, tone: 'good' }
      ],
      edges: [
        { from: 'biz', to: 'ea', label: 'direction' }, { from: 'ea', to: 'sa', label: 'standards, guidance' }, { from: 'sa', to: 'aa', label: 'designs, constraints' },
        { from: 'aa', to: 'sa', dashed: true, label: 'what is feasible' }, { from: 'sa', to: 'ea', dashed: true, label: 'what we learned' }
      ],
      caption: 'The dashed arrows matter most. Plans that never meet the realities of code are fiction; an architect who never hears from the teams becomes a tower.' },

    { kind: 'pitfall', title: 'Levels are scopes, not ranks',
      body: `It is easy to read the three levels as a promotion ladder, with the enterprise architect as the "top". That is a trap.

        - They are different **scopes**, not a chain of command. A great application architect is not "junior" to anyone.
        - Many organisations have only one or two levels, or one person covering all of them.
        - The higher you go, the further from the code, and the easier it is to design something that cannot actually be built.

        The danger at every level is the same: **losing touch with the level below.** Good architects at any scale keep walking down the stairs to see how things really are.` },

    { kind: 'tip', title: 'Zoom in and out',
      body: `A habit that makes any architect better is to **change the zoom on purpose**.

        - Stuck on a detail? **Zoom out.** "What problem is this really solving for the business? Is there a simpler route?"
        - Delighted by a grand plan? **Zoom in.** "What would this look like for the team who has to build it on Monday?"

        When someone proposes something, ask which level it belongs to, and then ask how it looks **one level up and one level down**. Many bad decisions are good ideas made at the wrong zoom.` }
  ],

  activities: [
    { type: 'mcq', after: 3, q: 'A company has five different customer databases from past acquisitions and wants to know which should become the future standard. Which level of architecture is this mainly?',
      options: ['Enterprise architecture: the shape of the whole landscape', 'Application architecture: one codebase', 'Solution architecture: one project\'s design', 'None: it is a purely business question'],
      answer: 0,
      why: [null, 'Application architecture is inside one system, not about choosing among several.', 'Solution architecture covers one business problem, not the long-term landscape.', 'The business question and the technical one are tied together: that is exactly what enterprise architecture handles.'],
      explain: 'Choosing among overlapping systems across the whole organisation, tied to strategy and years ahead, is enterprise architecture.' },

    { type: 'tf', after: 5, statement: 'Enterprise architect is simply the senior rank above solution architect, who is above application architect.', answer: false,
      explain: 'The levels are different scopes, not a chain of command. They often overlap, many organisations lack some of them, and none is "above" the others in importance.' },

    { type: 'ab', after: 7, q: 'A developer asks the team\'s application architect whether to use a new login library. Which answer shows better zooming?',
      a: { lang: 'text', label: 'One level up', src: `
        Check how the rest of the company handles login first. The
        enterprise team is moving everything to one provider, so use
        its library and you avoid migrating again next year.` },
      b: { lang: 'text', label: 'Staying inside', src: `
        Pick whichever library has the nicest API. It is only used in
        this one app, so nothing else needs to be considered.` },
      answer: 'a',
      explain: 'Login is shared across systems, so the right decision depends on guidance from a higher level. Treating it as a purely local choice ignores that.' },

    { type: 'bucket', prompt: 'At which level is each question mostly asked?', buckets: ['Application', 'Solution', 'Enterprise'],
      items: [['Should this service use layers or hexagonal ports?', 0], ['How will this one codebase be tested and deployed?', 0], ['Which of the three systems owns the customer\'s address in the returns process?', 1], ['Build or buy the courier integration for this project?', 1], ['Which of our five login systems is the future one?', 2], ['Which capabilities should the business invest in over the next three years?', 2]],
      explain: 'Application: inside one system. Solution: how several systems cooperate to solve one problem. Enterprise: the portfolio and the strategy across everything.' },

    { type: 'match', prompt: 'Match each level to its map.',
      pairs: [['Application architecture', 'The street map: detail of one system'], ['Solution architecture', 'The city map: how several systems fit together for one problem'], ['Enterprise architecture', 'The country map: the whole landscape and its direction'], ['Zooming in and out', 'Checking a decision one level up and one level down'], ['Feedback upward', 'What teams learn flowing back to higher levels']] },

    { type: 'cloze', text: 'An {{application}} architect works inside one codebase, a {{solution}} architect designs the answer to one business problem across several systems, and an {{enterprise}} architect looks across the whole {{landscape}}.',
      distractors: ['database', 'ranking', 'sprint'],
      explain: 'Three scopes of the same discipline, from one codebase to the entire organisation.' },

    { type: 'scenario', title: 'The returns portal', intro: 'You are the solution architect on a project to let customers return items online. It must connect the web shop, the warehouse system, the payment provider and a courier. Four teams are involved and the launch is in five months.',
      meters: { 'alignment': 50, 'delivery speed': 55 },
      steps: [
        { text: 'Where do you begin?',
          choices: [
            { label: 'Map what each system is responsible for and who owns the customer\'s order data, then agree interfaces with the teams', score: 2, effects: { alignment: 25, 'delivery speed': 10 }, feedback: 'A solution architect\'s core job is clear responsibilities and clean connections between systems, agreed with the people who own them.' },
            { label: 'Dictate the internal design of each team\'s application', score: 0, effects: { alignment: -20, 'delivery speed': -10 }, feedback: 'That is application-level territory. You will annoy teams who know their code better than you, and slow everything.' },
            { label: 'Let each team build its part and hope they fit together', score: 0, effects: { alignment: -25, 'delivery speed': -15 }, feedback: 'The gaps between systems are exactly where solutions fail: nobody owns them unless you do.' }
          ] },
        { text: 'Zainab, the enterprise architect, says the company wants all new payment integrations to go through a shared payments service. Your timeline is tight. What do you do?',
          choices: [
            { label: 'Talk it through with her: use the shared service if it exists in time, or agree a short-term exception with a plan to move later', score: 2, effects: { alignment: 20, 'delivery speed': 10 }, feedback: 'Enterprise guidance exists for reasons you may share. A negotiated exception with a plan respects both the direction and the deadline.' },
            { label: 'Ignore the guidance, since it is not your level', score: 0, effects: { alignment: -25 }, feedback: 'You will create the very duplication enterprise architecture is trying to remove, and lose goodwill upward.' },
            { label: 'Delay the launch until the shared service is perfect', score: 1, effects: { alignment: 10, 'delivery speed': -25 }, feedback: 'Aligned, but at the price of the business deadline. A conversation might have avoided the choice.' }
          ] },
        { text: 'Halfway through, the warehouse team discovers their system cannot expose stock levels in real time. What do you do?',
          choices: [
            { label: 'Take it back up and down: adjust the design, tell the enterprise architect about the constraint, and inform the other teams', score: 2, effects: { alignment: 20, 'delivery speed': 10 }, feedback: 'Reality flows upward too. Sharing the constraint helps the whole landscape, and keeping the teams in the loop avoids nasty surprises.' },
            { label: 'Quietly work around it and say nothing', score: 1, effects: { alignment: -10, 'delivery speed': 5 }, feedback: 'The workaround may be fine, but the next project will hit the same wall because nobody higher up knew.' },
            { label: 'Blame the warehouse team in the status meeting', score: 0, effects: { alignment: -25, 'delivery speed': -10 }, feedback: 'Blame closes the conversation you need. The constraint is information, not an offence.' }
          ] }
      ],
      outro: 'The pattern: **own the connections, respect the levels above and below, and keep information flowing both ways.**' },

    { type: 'explain', prompt: 'Explain the three levels of architecture using the street, city and country map idea, and say who each level talks to.',
      model: 'Application architecture is the street map: the internal design of one application, talking mostly to one team. Solution architecture is the city map: how several systems and vendors fit together to solve one business problem, talking to several teams. Enterprise architecture is the country map: the whole landscape of systems and its direction over years, talking to executives and many teams. They are scopes rather than ranks, and information needs to flow both down as guidance and up as feedback.',
      keywords: ['application', 'solution', 'enterprise', 'scope', 'teams', 'landscape', 'feedback'] }
  ],

  flashcards: [
    { q: 'What is application architecture?', a: 'The internal design of one application or service: modules, layers, patterns, data access, testing and deployment.' },
    { q: 'What is solution architecture?', a: 'The design of the complete answer to one business problem, including how several systems and vendors connect.' },
    { q: 'What is enterprise architecture?', a: 'Looking at the whole organisation\'s landscape of systems and capabilities in relation to strategy, over years.' },
    { q: 'Are the three levels a promotion ladder?', a: 'No. They are different scopes. Each has different questions, audiences and time horizons, and many organisations lack some of them.' },
    { q: 'What is a useful habit across levels?', a: 'Zoom in and out on purpose: check each decision one level up and one level down, and keep feedback flowing both ways.' }
  ],

  glossary: [
    { term: 'Application architecture', def: 'The structure and design decisions inside a single application or service.', like: 'The street map.' },
    { term: 'Solution architecture', def: 'The design of a complete solution to one business problem, spanning the applications, data flows and vendors involved.', like: 'The city map.' },
    { term: 'Enterprise architecture', def: 'The practice of aligning the whole organisation\'s systems, data and processes with its strategy.', like: 'The country map.', aka: ['EA'] },
    { term: 'Landscape', def: 'The full collection of an organisation\'s systems and how they relate.', like: 'Every road and building in a city.' }
  ],

  takeaways: [
    '**Application**, **solution**, **enterprise**: one codebase, one problem across systems, the whole landscape.',
    'Each level asks different questions, has a different **time horizon** and a different audience.',
    'Levels are **scopes, not ranks**.',
    '**Zoom in and out** and keep information flowing both **down and up**.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ar-design-decide', {
  eli5: 'An architect\'s job comes down to three verbs: design (a skill you can practise), decide (often before you know everything), and simplify (taking things away so the system stays understandable).',

  cards: [
    { kind: 'story', title: 'Two months on a database',
      body: `A team of six needs a database for a new product. One developer wants a document store, another a relational database, a third wants "whatever scales to a billion users". The debate runs for two months. There are benchmarks, a comparison spreadsheet, a conference talk shared in Slack.

        Meanwhile no product has shipped. When they finally pick one, the product has fewer than a hundred users, and the decision takes a single afternoon to implement.

        The team was not lazy. They were chasing **certainty that was not available**. Nobody knew how the product would grow, and no amount of research would tell them. The job was never to find the perfect answer. It was to make a *good enough one on time, and say why*.` },

    { kind: 'concept', title: 'Design is a skill you build',
      body: `Many people treat design as a talent: some have "the eye", some do not. It is much closer to a **craft**, and like any craft it improves with deliberate practice:

        - **Study real systems.** Read how others solved the problem, including their post-mortems.
        - **Try it small.** Sketch two or three options for something you know, even a throwaway one.
        - **Have your designs reviewed**, and review other people's.
        - **Think in trade-offs.** No design is best; each is best *for something*. "It depends" is the honest answer, as long as you can finish the sentence: "it depends on whether we need X, because Y".
        - **Learn from your own old decisions**, especially the ones that aged badly.

        Everything in this course has been raw material for design: principles, patterns, styles. Taste comes from using them and seeing the results.` },

    { kind: 'metaphor', title: 'Navigating without GPS',
      body: `Before satellites, sailors used **dead reckoning**: you know your speed, heading and time, so you can estimate where you are, commit to a course, and correct as new landmarks appear.

        Nobody waited for perfect information. They decided with what they had, wrote it in the logbook, and adjusted.

        Architectural decisions are like that. You know the likely traffic, the team, the budget, the deadline. You commit to a heading, record your reasoning, and watch for landmarks (real usage, real problems) that tell you to adjust. Where the metaphor stops: a ship can turn quickly. Some software decisions turn like a tanker, which is why we sort them by how hard they are to reverse.` },

    { kind: 'compare', title: 'Match the care to the reversibility',
      body: 'Not every decision deserves the same effort. Ask: *if we are wrong, how bad and how slow is the fix?*',
      cols: ['Easy to reverse', 'Hard to reverse'],
      rows: [
        ['Example', 'Which logging library; the folder layout', 'Primary database; how the system is split into services; public API shape'],
        ['If wrong', 'Fix within days', 'Months of migration, customers affected'],
        ['How to decide', 'Decide quickly, try it, move on', 'Gather evidence, consult, write down reasoning'],
        ['Mindset', 'Bias to action', 'Bias to understanding, but with a deadline']
      ],
      note: 'A common failure is treating easy decisions as hard (weeks of debate on a logging library) and hard ones as easy (a public API changed on a whim).' },

    { kind: 'concept', title: 'The last responsible moment',
      body: `**The last responsible moment** means: delay a decision until the cost of *not* deciding becomes greater than the risk of deciding. Not a moment later, and, importantly, not a moment earlier.

        Why wait? Because you learn. A team that picks its message broker in week one knows almost nothing. The same team in week twelve has seen the real traffic and the real requirements.

        Waiting is not free, though. Decide too late and people are blocked or build on guesses. So:

        - List what must be decided, and **what each one blocks**.
        - Find the date by which a decision is needed to avoid delay.
        - Until then, **keep the option open**: hide the choice behind a boundary so that either answer can slot in.

        It is not procrastination. It is deciding **on purpose, with as much evidence as the schedule allows**.` },

    { kind: 'code', title: 'An Architecture Decision Record (ADR)',
      body: 'An **ADR** is a short note (usually a text file in the project) that records one significant decision, so its reasons survive. This one is typical. **Tap a line.**',
      code: { lang: 'text', src: `
        # ADR 7: Use PostgreSQL for orders
        Status: Accepted

        Context:
        - Orders and payments must change together (transactions).
        - The team already knows SQL well.
        - Load will be modest for the next year.

        Decision:
        Use PostgreSQL as the single primary database.

        Consequences:
        + Strong consistency and familiar tooling.
        - Scaling writes later will take real effort.
        - Revisit if write load outgrows one server.`,
        notes: {
          1: 'A number and a short title. Numbered records make them easy to refer to ("see ADR 7") and show the history.',
          2: '**Status** says whether this is proposed, accepted, or replaced by a later record. Records are not edited after the fact; a new one *supersedes* the old.',
          4: '**Context**: the facts and constraints at the time. This is the part future readers need most.',
          10: '**Decision**: one clear sentence, in active voice. "We will use...", not "we might consider...".',
          13: '**Consequences**: the honest part. Good ones and bad ones, including what you gave up.',
          15: 'A **trigger for revisiting**. It admits the decision rests on assumptions and says when to check them again.'
        } } },

    { kind: 'steps', title: 'Writing an ADR without it becoming a chore',
      body: 'Keep it light: ten minutes, not two days. A short, honest record beats a perfect one nobody wrote.',
      steps: [
        { title: 'Pick decisions worth recording', body: 'Costly to reverse, affecting several people, or likely to make a newcomer ask "why on earth?". Not every choice needs one.' },
        { title: 'Write the context first', body: 'What problem, what constraints, what options were really considered. This keeps the "why" honest.' },
        { title: 'State the decision plainly, with its consequences', body: 'One sentence for the decision. Then the good and the bad that follow, including what you will watch for.' },
        { title: 'Keep it next to the code', body: 'Store it in the repository as a plain text or markdown file so it is found, reviewed and versioned with the code.' },
        { title: 'Supersede, never rewrite', body: 'When circumstances change, write a new record that replaces the old and links back. History stays visible.' }
      ] },

    { kind: 'concept', title: 'Simplifying is the core job',
      body: `Anyone can make a system more complicated. Each new tool, service and abstraction seems sensible alone, and together they build a thing nobody can hold in their head.

        The architect's quiet, central skill is the opposite: **removing**. Asking:

        - "What happens if we do not build this at all?"
        - "Can an existing part do this job?"
        - "Which of these three queues, caches and layers is actually earning its keep?"
        - "Could a new teammate understand this in an afternoon?"

        Every moving part has a running cost: to learn, to monitor, to secure, to fail at 3am. Add one only when you can name the problem it solves. As a rough rule, a design is finished not when there is nothing more to add, but when there is nothing more to take away.` },

    { kind: 'pitfall', title: 'Three ways to fail at deciding',
      body: `- **Analysis paralysis.** Researching forever because the decision feels big. Fix: set a decision date, and name what evidence would change your mind.
        - **Resume-driven design.** Choosing a technology because it is exciting or looks good on a CV, not because it fits. Fix: ask what problem it solves *for us*, today.
        - **Over-engineering for an imaginary future.** Building for ten million users when you have ten. Fix: design for the scale you can foresee, and keep the shape flexible enough to grow.

        A related trap is deciding in someone's head and never writing it down. Then the reasoning disappears, and the same argument returns, six months later, with no memory of how the last one ended.` }
  ],

  activities: [
    { type: 'mcq', after: 3, q: 'Which decision deserves the most care and consultation before you commit?',
      options: ['The shape of a public API that thousands of customers will build on', 'The folder names in a new repository', 'Which of two similar logging libraries to use', 'The colour of the build status badge'],
      answer: 0,
      why: [null, 'Folders are cheap to rename at any time.', 'Logging libraries can be swapped with modest effort.', 'This is purely cosmetic.'],
      explain: 'A public API is hard to change once other people depend on it. Match the care you spend to how costly and slow a mistake would be to undo.' },

    { type: 'tf', after: 4, statement: 'The "last responsible moment" means putting decisions off for as long as possible, whatever the consequences.', answer: false,
      explain: 'It means delaying only until the cost of not deciding outweighs the risk of deciding. Beyond that point, delay blocks people or forces guesses.' },

    { type: 'spot', after: 5, prompt: 'This ADR has one line that is not a real decision, just a wish. Tap it.',
      code: { lang: 'text', src: `
        Decision:
        We will use PostgreSQL for orders.
        We will make the system fast and scalable.
        Reads of order history go to a replica.` },
      lines: [3],
      explain: '"Fast and scalable" is a goal, not a decision: nothing says what is being done and nobody could tell whether it was followed. The other two lines are concrete and checkable.' },

    { type: 'match', prompt: 'Match each ADR section to what belongs in it.',
      pairs: [['Status', 'Proposed, accepted or superseded'], ['Context', 'The facts, constraints and options at the time'], ['Decision', 'One clear statement of what we will do'], ['Consequences', 'The good and bad that follow, and when to revisit'], ['Superseded', 'Replaced by a newer record, not erased']] },

    { type: 'bucket', prompt: 'Is each decision usually easy or hard to reverse?', buckets: ['Easy to reverse', 'Hard to reverse'],
      items: [['Which linting rules to enable', 0], ['Naming of internal folders', 0], ['Which code formatter to use', 0], ['The primary database engine', 1], ['Splitting the system into separate services', 1], ['A public API that customers have built on', 1]],
      explain: 'Easy ones can be tried and swapped in days. Hard ones involve data, many teams or outside customers, so they deserve evidence and a written reason.' },

    { type: 'ab', q: 'Which proposal shows better architectural judgement for a product with 40 users today?',
      a: { lang: 'text', label: 'Simple, with an exit', src: `
        One database and one deployable app.
        Keep payments behind one module so it can be split out later.
        Revisit if we pass a few thousand active users.` },
      b: { lang: 'text', label: 'Built for the imagined future', src: `
        Twelve microservices, an event bus and a multi-region database,
        in case we reach ten million users.` },
      answer: 'a',
      explain: 'Option one solves today\'s problem, protects the likely future with a boundary, and says when to look again. Option two pays enormous running costs now for a future that may never arrive.' },

    { type: 'cloze', text: 'Architects {{decide}} with incomplete information, wait for the last {{responsible}} moment, record significant choices in an {{ADR}}, and treat {{simplifying}} as the core of the job.',
      distractors: ['guess', 'final', 'diagram'],
      explain: 'Decisions are made on purpose, as late as is responsible, written down, and the design is kept as simple as possible.' },

    { type: 'scenario', title: 'The queue debate', intro: 'You are the architect for a fast-growing marketplace. The team needs background processing for emails and image resizing. Two developers disagree strongly: one wants a full event-streaming platform, the other a basic job queue. The team has six people and two months before a big promotion.',
      meters: { 'team morale': 60, 'delivery risk': 50, 'future flexibility': 50 },
      steps: [
        { text: 'The argument is heating up. How do you move it forward?',
          choices: [
            { label: 'Ask what each option solves *today*, what it costs to run, and how hard it would be to change later', score: 2, effects: { 'team morale': 15, 'delivery risk': -10 }, feedback: 'You have turned a clash of preferences into a comparison of trade-offs and reversibility, which is a conversation people can finish.' },
            { label: 'Pick whoever is more senior', score: 0, effects: { 'team morale': -20 }, feedback: 'Authority settles the argument without answering it, and you lose both the better idea and the buy-in.' },
            { label: 'Schedule three weeks of research and benchmarking', score: 1, effects: { 'delivery risk': 20, 'team morale': -5 }, feedback: 'Research has value, but the promotion is in two months and nobody can predict the future load from a benchmark.' }
          ] },
        { text: 'You conclude that a simple job queue covers every current need. How do you protect the future?',
          choices: [
            { label: 'Hide the queue behind a small interface so it can be swapped, and note when to revisit', score: 2, effects: { 'future flexibility': 25, 'delivery risk': -5 }, feedback: 'A tiny boundary keeps your options open at almost no cost, which is exactly the last responsible moment in practice.' },
            { label: 'Build the full streaming platform anyway, just in case', score: 0, effects: { 'delivery risk': 25, 'team morale': -10, 'future flexibility': 5 }, feedback: 'You have paid the running cost of a big system for needs nobody has yet.' },
            { label: 'Use the simple queue directly all over the code', score: 1, effects: { 'future flexibility': -20 }, feedback: 'Fine for today, but you have made the later swap expensive without even noticing.' }
          ] },
        { text: 'The decision is made. What do you do before moving on?',
          choices: [
            { label: 'Write a short ADR: context, decision, consequences and a trigger to revisit, and store it in the repo', score: 2, effects: { 'future flexibility': 15, 'team morale': 10 }, feedback: 'Ten minutes now stops the same debate resuming in six months, and shows the dissenter their concerns were recorded.' },
            { label: 'Trust that everybody will remember', score: 0, effects: { 'future flexibility': -10, 'team morale': -5 }, feedback: 'Memory fades and people leave. The reasoning will vanish, and so will the chance to know when it stops being true.' },
            { label: 'Write a 30-page design document and circulate it for sign-off', score: 1, effects: { 'team morale': -10, 'delivery risk': 10 }, feedback: 'The instinct is good, but the size will mean nobody reads it. A short, honest record gets read and kept.' }
          ] }
      ],
      outro: 'The pattern: **compare trade-offs, choose the simple option with an exit, and write the reasoning down.**' },

    { type: 'explain', prompt: 'A new architect asks how you decide when you do not have all the information. Explain your approach, mentioning reversibility, the last responsible moment and ADRs.',
      model: 'I match effort to how hard a decision is to reverse: easy ones I make quickly, hard ones get evidence and consultation. I delay a decision until the last responsible moment, when waiting costs more than deciding, and in the meantime keep options open behind a boundary. Once I decide, I write a short ADR with the context, the decision, the consequences and when to revisit, so the reasoning survives. I also try to keep the design simple, because every moving part has a running cost.',
      keywords: ['reverse', 'last responsible moment', 'options', 'ADR', 'context', 'consequences', 'simple'] }
  ],

  flashcards: [
    { q: 'How do you decide when you lack complete information?', a: 'Match the care to how hard the decision is to reverse, decide by a deadline with the best evidence available, record the reasons, and revisit when facts change.' },
    { q: 'What is the last responsible moment?', a: 'The point at which delaying a decision further costs more than the risk of deciding. Not earlier, not later.' },
    { q: 'What is an ADR and what does it contain?', a: 'An Architecture Decision Record: a short note with status, context, the decision, and its consequences, kept next to the code.' },
    { q: 'Why supersede an ADR instead of editing it?', a: 'So the history stays visible: later readers can see what was decided, why, and why it changed.' },
    { q: 'Why is simplifying the core of the job?', a: 'Every moving part costs time to learn, run and secure. Add something only when you can name the problem it solves.' }
  ],

  glossary: [
    { term: 'Architecture Decision Record', def: 'A short document recording one significant architectural decision: its context, the decision and its consequences.', like: 'A ship\'s logbook entry explaining why the course was changed.', aka: ['ADR'] },
    { term: 'Last responsible moment', def: 'The latest point at which a decision can be made without causing harm through delay, chosen to maximise what you have learned.', like: 'Booking the venue once you know the guest count, but before it sells out.' },
    { term: 'Reversibility', def: 'How easily and cheaply a decision can be undone if it turns out to be wrong.', like: 'Painting a room versus pouring a foundation.' },
    { term: 'Over-engineering', def: 'Building more complexity or capacity than the current problem needs, often for an imagined future.', like: 'Buying a lorry to carry your shopping.' },
    { term: 'Analysis paralysis', def: 'Being unable to decide because of endless research and fear of choosing wrongly.', like: 'Standing in front of a menu until the restaurant closes.' }
  ],

  takeaways: [
    '**Design is a craft**: practise it, think in trade-offs, learn from old decisions.',
    'Match care to **reversibility**; decide by a deadline, and delay only to the **last responsible moment**.',
    'Write a short **ADR**: context, decision, consequences, when to revisit.',
    '**Simplify**: every moving part costs something. The best design often removes things.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ar-code-document', {
  eli5: 'Architects stay credible by still writing some code and testing ideas with quick experiments, and they write documentation short, visual and close to the code so that people actually read it.',

  cards: [
    { kind: 'story', title: 'The design that could not be built',
      body: `An architect, brilliant and respected, has not written production code for six years. She designs an elegant system around a particular open-source library that "supports everything we need".

        The team starts building. On day three, a junior developer discovers the library cannot handle the number of simultaneous connections the design requires. It would have taken an hour of experiment to find that out before the design went to six teams.

        Rework costs a month. The architect is mortified. And something quieter happens too: the developers conclude that her designs need checking before anyone trusts them.

        The lesson is not that she was careless. It is that **distance from the code creates blind spots**, and they are expensive.` },

    { kind: 'concept', title: 'Why architects should still code',
      body: `Architects do not need to be the best programmer on the team, or to own critical features. But they should write *some* real code, regularly. Four reasons:

        - **Credibility.** Developers listen to people who have felt the same friction.
        - **Truth.** Code shows what a framework or design is *really* like, beyond its brochure.
        - **Empathy.** If a decision makes the build slow or the tests flaky, you feel it too.
        - **Better decisions.** Detail shapes design. Many "obvious" ideas fall over on contact with real code.

        Sensible ways to stay hands-on: pair with developers, fix a small bug, build prototypes, review pull requests, write tooling for the team. Avoid the **critical path**: a late architect holding up the main feature helps nobody.` },

    { kind: 'metaphor', title: 'Test-drilling before hanging the shelf',
      body: `Before you hang a heavy shelf, you drill a small test hole to check what is behind the wall: brick, plasterboard, or a water pipe. It takes a minute and costs one tiny hole. Skipping it risks a flood.

        Software has the same move: before betting a project on an assumption, **test the assumption** cheaply.

        A **spike** is a short, time-boxed experiment that answers *one specific question*: "Can this library handle 5,000 connections?" "Can we call that legacy system from our language?" The word comes from agile practice: a narrow drive straight through the problem to see what is on the other side.

        A **prototype** is a rough, working version of an idea, built to learn from or to show to others: a clickable screen, a thin slice of the system.

        Both share a rule: **they are usually thrown away.** Their value is the learning, not the code. Treating a spike as the first version of the real thing is how quick hacks become permanent foundations.` },

    { kind: 'steps', title: 'Running a spike',
      body: 'A good spike is small and sharp. Roughly:',
      steps: [
        { title: 'Write down the question', body: 'One question, phrased so it can be answered yes, no or with a number. "Is it fast enough?" is vague; "Can it process 500 messages per second on one small machine?" is not.' },
        { title: 'Set a time box', body: 'Hours or a day or two, never open-ended. When time is up, you stop and report, even if the answer is "unclear".' },
        { title: 'Build the ugliest thing that answers it', body: 'No polish, no tests (unless they are the question), no architecture. Hard-code anything that is not the point.' },
        { title: 'Record the answer and the evidence', body: 'A few lines: what you tried, what you found, what you now recommend. Perhaps an ADR if it settles a decision.' },
        { title: 'Throw the code away', body: 'Or keep it clearly marked as a spike. Rebuild the real thing properly, now knowing what you know.' }
      ] },

    { kind: 'concept', title: 'Documentation that actually gets read',
      body: `Most documentation fails not because it is wrong but because nobody reads it. Eighty pages on a wiki, last edited two years ago, written for no particular reader.

        A few principles make documents earn their keep:

        - **Know the reader.** A new developer needs a map; an auditor needs a different one. Write for one person at a time.
        - **Explain the why.** Code already shows *what*. Docs matter for *why*.
        - **Keep it short and scannable**, with pictures where pictures are faster.
        - **Keep it near the code**, ideally in the same repository, reviewed with changes.
        - **Document less, but keep it true.** A small set of living documents beats a library of fiction.

        The test of a document: *did someone use it this month?*` },

    { kind: 'layers', title: 'The C4 model: four zoom levels',
      body: 'Diagrams often fail by mixing levels: a box that is a company next to a box that is a function. The **C4 model** (created by Simon Brown) fixes this with four levels of zoom, each with its own type of diagram. Widest first.',
      layers: [
        { label: '1. System Context', note: 'Your system as one box, with the people and other systems around it.', tone: 'info', icon: '🌍' },
        { label: '2. Containers', note: 'The separately running parts inside: web app, API, database, queue.', tone: 'accent', icon: '📦' },
        { label: '3. Components', note: 'The main building blocks inside one container.', tone: 'good', icon: '🧩' },
        { label: '4. Code', note: 'Classes and functions. Usually generated or skipped.', tone: 'muted', icon: '💻' }
      ],
      note: 'In C4, a "container" means any separately running part, such as a database or web app. It is not necessarily a Docker container.' },

    { kind: 'diagram', title: 'A C4 "containers" diagram of a small shop',
      body: 'Level 2 is the one most teams find most useful: what runs where, and how the parts talk. Each box says what it is and does.',
      nodes: [
        { id: 'cust', label: 'Customer', icon: '🧑', x: 1, y: 0, tone: 'muted' },
        { id: 'web', label: 'Web app (browser)', icon: '💻', x: 1, y: 1, tone: 'accent' },
        { id: 'api', label: 'Orders API', icon: '⚙️', x: 1, y: 2, tone: 'accent' },
        { id: 'db', label: 'Database', icon: '🗄️', x: 0, y: 3, tone: 'accent' },
        { id: 'mail', label: 'Email service (external)', icon: '✉️', x: 2, y: 3, tone: 'muted' }
      ],
      edges: [
        { from: 'cust', to: 'web', label: 'browses, orders' }, { from: 'web', to: 'api', label: 'JSON over HTTPS' },
        { from: 'api', to: 'db', label: 'reads, writes' }, { from: 'api', to: 'mail', label: 'sends receipts' }
      ],
      caption: 'Labelled arrows say *what* travels and *how*. That is what separates a diagram people can use from decoration.' },

    { kind: 'concept', title: 'arc42: a template so you do not stare at a blank page',
      body: `Where C4 is about *diagrams*, **arc42** is about the *whole document*. It is a free, widely used template for architecture documentation with **twelve sections**, including:

        - introduction and goals, and constraints
        - context and scope, and a solution strategy
        - building blocks, runtime behaviour and deployment
        - cross-cutting concepts (security, logging...)
        - architecture decisions (your ADRs fit here)
        - quality requirements, risks and technical debt, and a glossary

        The key advice from its users: **it is a menu, not a form.** Fill in what helps your readers and skip the rest. A team of five on a small product might use four sections and half a page each. Even so, having the headings saves arguments about what to write.` },

    { kind: 'code', title: 'Diagrams as code',
      body: `A diagram drawn in a picture tool goes stale because nobody wants to open the tool. **Diagrams as code** means writing the diagram in text, stored in the repository, rendered automatically. Tools include Mermaid, PlantUML and Structurizr. This is Mermaid. **Tap a line.**`,
      code: { lang: 'text', src: `
        flowchart LR
          user[Customer] --> web[Web app]
          web --> api[Orders API]
          api --> db[(Database)]`,
        notes: {
          1: 'The first line says "a flowchart, drawn left to right".',
          2: 'A box called Customer, an arrow, and a box called Web app. Plain words, no mouse needed.',
          4: 'The odd brackets make the Database box a cylinder, the usual symbol for storage.'
        } },
      note: 'Because it is text, a change to the diagram shows up in a pull request, gets reviewed, and has history, like everything else in the repo.' },

    { kind: 'pitfall', title: 'Documentation rot',
      body: `A wrong document is worse than none, because people trust it.

        Rot happens when documents are **far from the code** (a wiki nobody opens), **too detailed** (every change makes it false), or **owned by nobody**.

        - Keep docs in the repository and update them in the same pull request as the change.
        - Prefer **high-level** documents that change slowly, and let the code and automated tests describe the detail.
        - Put a date and an owner on each document, and delete what is dead.

        And remember that a short, correct note beats a long, optimistic one every time.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'Your team is unsure whether a library can handle 5,000 simultaneous connections. What is the best way to find out cheaply?',
      options: ['A time-boxed spike that tests exactly that question, then throw the code away', 'Build the full feature and discover it in production', 'Read the library\'s marketing page and trust it', 'Pick another library without testing either'],
      answer: 0,
      why: [null, 'Far too expensive a way to learn, and far too late.', 'Marketing describes the best case; only an experiment shows your case.', 'You are then guessing in the same way about the new one.'],
      explain: 'A spike answers one specific question quickly. Its value is the learning, so the code is normally discarded.' },

    { type: 'match', after: 5, prompt: 'Match each C4 level to what it shows.',
      pairs: [['System Context', 'Your system as one box, among users and other systems'], ['Containers', 'The separately running parts: web app, API, database'], ['Components', 'The main building blocks inside one container'], ['Code', 'Classes and functions, usually generated']] },

    { type: 'tf', after: 8, statement: 'One benefit of writing diagrams as code is that changes to a diagram can be reviewed in a pull request like any other change.', answer: true,
      explain: 'Text files in the repository get version history, review and automatic rendering, which keeps diagrams from silently going stale.' },

    { type: 'order', prompt: 'Put the steps of running a spike in order.',
      items: ['Write down the one question to answer', 'Set a time box', 'Build the ugliest thing that answers it', 'Record the answer and evidence', 'Throw the code away or mark it as a spike'],
      explain: 'The question and time box keep it sharp; the quick build gives the answer; recording preserves it; discarding the code stops a hack becoming a foundation.' },

    { type: 'bucket', prompt: 'Which kind of documentation is likely to stay useful, and which tends to rot?', buckets: ['Stays useful', 'Tends to rot'],
      items: [['A short note on why we chose the database (an ADR)', 0], ['A one-page context and containers diagram, kept in the repo', 0], ['A glossary of business terms the team uses', 0], ['A wiki page listing every function and its parameters', 1], ['An 80-page design last edited two years ago', 1], ['A diagram drawn once in a tool nobody has installed', 1]],
      explain: 'Slow-changing, why-focused, near-the-code documents survive. Detailed, distant or ownerless ones go stale quickly, and code can describe detail better anyway.' },

    { type: 'ab', q: 'Which note is the better record of the outcome of a spike?',
      a: { lang: 'text', label: 'Specific', src: `
        Question: can library X handle 5,000 connections on one small
        machine? Result: no. It stalled at about 800. Library Y reached
        6,000. Recommend Y. Spike code deleted.` },
      b: { lang: 'text', label: 'Vague', src: `
        Looked at some libraries. X seems okay-ish, maybe slow. We
        should probably do more research at some point.` },
      answer: 'a',
      explain: 'It repeats the question, gives evidence, makes a recommendation and says what happened to the code. The vague note leaves the team exactly where it started.' },

    { type: 'short', q: 'In the C4 model, which level shows your system as a single box among the people and systems around it?', accept: ['context', 'system context', 'level 1', '1'], hint: 'It is the first, widest level.',
      explain: 'The System Context diagram is the widest zoom: your system as one box, plus who uses it and what it talks to.' },

    { type: 'scenario', title: 'The stale wiki', intro: 'You have just taken over architecture for a product team. The wiki holds 120 pages of design documents. New joiners tell you they never read it, and last week someone followed an old page and broke a deployment.',
      meters: { 'team trust in docs': 30, 'your time': 70 },
      steps: [
        { text: 'What do you do about the wiki?',
          choices: [
            { label: 'Ask what questions new people actually need answered, and replace most of it with a few short documents', score: 2, effects: { 'team trust in docs': 25, 'your time': -10 }, feedback: 'Start from the readers\' needs. A handful of living documents beats 120 neglected ones.' },
            { label: 'Rewrite all 120 pages to be accurate', score: 0, effects: { 'team trust in docs': 5, 'your time': -40 }, feedback: 'You will spend months, and the new pages will begin rotting the moment the code changes.' },
            { label: 'Leave it and add a warning banner at the top', score: 1, effects: { 'team trust in docs': 5, 'your time': 0 }, feedback: 'Honest, but now there is a big unreliable library and still nothing trustworthy to read.' }
          ] },
        { text: 'You decide the core set will be a context diagram, a containers diagram and a few ADRs. Where do they live?',
          choices: [
            { label: 'In the code repository, diagrams as text, reviewed with the changes', score: 2, effects: { 'team trust in docs': 25 }, feedback: 'Near the code means they get updated together, reviewed, and found by the people who need them.' },
            { label: 'In a separate document system only architects can edit', score: 0, effects: { 'team trust in docs': -15 }, feedback: 'You have recreated the distance that made the wiki rot, and cut developers out of keeping it true.' },
            { label: 'On a poster in your office', score: 0, effects: { 'team trust in docs': -10 }, feedback: 'Pretty, but invisible to remote colleagues and never updated.' }
          ] },
        { text: 'An old claim in a design says the database cannot handle the expected load. You are unsure it is still true. What now?',
          choices: [
            { label: 'Run a quick time-boxed spike to measure it, and record the result', score: 2, effects: { 'team trust in docs': 15, 'your time': -5 }, feedback: 'Evidence beats memory. The result goes in a short note so nobody has to wonder again.' },
            { label: 'Redesign the whole system to avoid the database', score: 0, effects: { 'your time': -25 }, feedback: 'An enormous reaction to a claim you have not tested.' },
            { label: 'Assume the old document was right', score: 1, effects: { 'team trust in docs': -5 }, feedback: 'You may be building around a limit that no longer exists. A quick test is cheap.' }
          ] }
      ],
      outro: 'The pattern: **write for readers, keep it small and near the code, and test claims instead of inheriting them.**' },

    { type: 'explain', prompt: 'Explain why an architect should still write code, how spikes help, and what makes documentation worth reading.',
      model: 'Staying hands-on gives an architect credibility, truth about how tools behave, empathy for the team\'s pain, and better decisions, as long as they stay off the critical path. A spike is a short time-boxed experiment answering one question, usually thrown away, so assumptions are tested before many people build on them. Documentation is worth reading when it is short, written for a specific reader, explains the why, lives near the code and is kept true, for example C4 diagrams, ADRs and diagrams as code.',
      keywords: ['code', 'credibility', 'spike', 'question', 'time box', 'why', 'near the code', 'C4'] }
  ],

  flashcards: [
    { q: 'Why should architects still write code?', a: 'For credibility, to learn how things really behave, to feel the team\'s friction and to make better decisions, while staying off the critical path.' },
    { q: 'What is a spike?', a: 'A short, time-boxed experiment that answers one specific question. The code is usually thrown away.' },
    { q: 'What are the four levels of the C4 model?', a: 'System Context, Containers, Components and Code, from widest to most detailed.' },
    { q: 'What is arc42?', a: 'A free template with twelve sections for architecture documentation. Use what helps your readers and skip the rest.' },
    { q: 'What are "diagrams as code" and why use them?', a: 'Diagrams written as text (such as Mermaid or PlantUML), kept in the repo and rendered automatically, so they are versioned, reviewed and less likely to go stale.' }
  ],

  glossary: [
    { term: 'Spike', def: 'A short, time-boxed experiment that answers one specific technical question before the team commits to a design.', like: 'A test drill into a wall before hanging a heavy shelf.' },
    { term: 'Prototype', def: 'A rough working version of an idea built to learn from or to show to others.', like: 'A clay model before the final sculpture.' },
    { term: 'C4 model', def: 'A way of diagramming software at four zoom levels: system context, containers, components and code.', like: 'Zooming a map from country to street.' },
    { term: 'arc42', def: 'A template for architecture documentation with twelve optional sections.', like: 'A set of chapter headings so you do not face a blank page.' },
    { term: 'Diagrams as code', def: 'Describing diagrams in text files that tools render, so they live in version control.', like: 'A recipe written in words instead of a photo of a plate.' }
  ],

  takeaways: [
    'Keep **coding** a little: credibility, truth and better decisions. Stay off the critical path.',
    'A **spike** answers one question, time-boxed, then gets thrown away.',
    'Documentation: **short, for a reader, the why, near the code**. Use **C4** and **arc42** if they help.',
    '**Diagrams as code** stay current because they are reviewed with the changes.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ar-communicate', {
  eli5: 'A design is only as good as people\'s ability to understand and agree to it, so architects tailor what they say, listen first, guide rather than dictate, and run reviews that improve the work.',

  cards: [
    { kind: 'story', title: 'One decision, three conversations',
      body: `The architect has decided the team should move its data to a new database. Watch her tell three people.

        **To the developers:** "The new one handles our access pattern better, so the slow search queries go away. Here is a migration plan and a spike I ran."

        **To the head of product:** "Search will be quick again, which should cut abandoned baskets. It costs us about two sprints of features, and I will show you the plan so we can pick the least painful window."

        **To the customer:** "Over the next month, search gets faster. You will not need to do anything."

        Same decision, three different messages. None is a lie. Each leaves out what the listener does not need and puts in what *they* care about.` },

    { kind: 'compare', title: 'Know who is listening',
      body: 'Before you speak or write, ask: "What does *this person* want to know, and what will they do with it?"',
      cols: ['Developers', 'Managers', 'Customers'],
      rows: [
        ['Care about', 'How it works, what changes for their code', 'Cost, time, risk, trade-offs', 'What it means for them, and when'],
        ['Language', 'Technical, precise', 'Plain business terms, numbers', 'Everyday words, no jargon'],
        ['Useful form', 'Diagrams, examples, working code', 'Options with costs, one-page summary', 'Short and outcome-focused'],
        ['They need to', 'Build it well', 'Decide, fund, plan', 'Trust, and be informed']
      ],
      note: 'Never "dumb down". Translate: same truth, different vocabulary and level of detail.' },

    { kind: 'metaphor', title: 'Directions for a local, a tourist and a taxi driver',
      body: `Ask three people for the way to the station. To a **local**, you say "past the old cinema, then left at the lights". To a **tourist**, "the big red building with the clock, about ten minutes' walk". To a **taxi driver**, just the street name.

        The destination is identical. The best *directions* depend on what the listener already knows.

        Explaining architecture works the same. Start from what your listener already understands, use their landmarks, and cut anything that does not help them get where they are going. Where the metaphor stops: directions do not need agreement. Architecture does, so you also need to listen.` },

    { kind: 'sequence', title: 'Listening first',
      body: 'A product owner arrives with a request that sounds like a solution. Watch what a good architect does before offering one.',
      actors: ['Product owner', 'Architect'],
      steps: [
        { from: 0, to: 1, label: 'We need a real-time dashboard', note: 'A request, phrased as a solution. Solutions in disguise are common.' },
        { from: 1, to: 0, label: 'What problem are you solving?', note: 'The architect asks a question instead of reaching for tools.' },
        { from: 0, to: 1, label: 'Sales calls us when stock is low', dashed: true, note: 'Now the real need appears: people want to be told about low stock.' },
        { from: 1, to: 0, label: 'How fast must it be?', note: 'Another question, about the real requirement.' },
        { from: 0, to: 1, label: 'Within an hour is fine', dashed: true, note: '"Real-time" turned out to mean "within an hour".' },
        { at: 1, label: 'proposes an hourly email', note: 'A far simpler solution fits. Listening saved weeks of work.' }
      ] },

    { kind: 'concept', title: 'Consulting and coaching, not dictating',
      body: `Developers are intelligent adults who know their own code. If you simply issue instructions, you get two bad results: the right instruction is followed *without understanding*, and the wrong one is followed *without anyone saying so*.

        Two better modes:

        - **Consulting:** you offer expertise, options and recommendations, and the team makes the call with you. "Here are three ways, my pick is the second, because..."
        - **Coaching:** you help someone find the answer themselves, mostly by asking good questions. "What would happen if this service is down? How would you find out?"

        Coaching is slower today and faster over a year, because people learn to make good decisions without you, and an architect who is the only one who can decide is a bottleneck.` },

    { kind: 'compare', title: 'Dictate, consult, coach: when to use each',
      body: 'None is always right. Choose on purpose.',
      cols: ['Use it when', 'Risk'],
      rows: [
        ['**Direct** (tell)', 'Urgent, safety- or security-critical, or the person is brand new and needs a clear steer', 'Teaches nothing; builds dependence'],
        ['**Consult** (advise)', 'The team owns the work but lacks one piece of expertise', 'May be seen as a veto in disguise if you push too hard'],
        ['**Coach** (ask)', 'You want the team to grow its own judgement, and time allows', 'Slow if there is a fire; can feel evasive if you already know the answer']
      ],
      note: 'Being open about which mode you are in ("I am telling you here, because it is a security issue") builds trust.' },

    { kind: 'steps', title: 'Running a design review',
      body: 'A **design review** is a meeting where a team shows its design to colleagues to get it improved *before* it is expensive to change. Done badly, it is a courtroom. Done well:',
      steps: [
        { title: 'Share it beforehand', body: 'Send a short design a day or two ahead. People who have read it give better feedback than people reacting live.' },
        { title: 'Start with the problem and the options', body: 'The author states the goal, the constraints, the alternatives considered and why this one was chosen.' },
        { title: 'Review the design, not the person', body: 'Say "I am worried that this will..." rather than "you forgot...". Ask questions before giving verdicts.' },
        { title: 'Time-box and separate big from small', body: 'Spend the time on the costly-to-reverse concerns. Park small things in comments.' },
        { title: 'Record decisions and actions', body: 'End with who will do what, and what was decided (and why). A short ADR if it is significant.' }
      ] },

    { kind: 'pitfall', title: 'How communication quietly goes wrong',
      body: `- **Jargon as armour.** Using big words to sound sure. If the listener nods but cannot repeat it, you have not communicated.
        - **Death by slides.** Forty slides, no decision. Lead with the decision needed.
        - **Telling instead of checking.** "Any questions?" gets silence. Try "What would worry you about this?"
        - **Silent disagreement.** People who disagree but say nothing will quietly build something else. Make it safe to object, and thank the first person who does.
        - **The last word.** Winning an argument you did not need to win costs goodwill you will need later.

        When a message is important, ask the listener to say it back in their own words. It is the quickest way to find the gap.` },

    { kind: 'tip', title: 'A message that lands',
      body: `A simple shape for explaining anything to anyone:

        1. **Say the point first.** "I recommend we do X."
        2. **Give the reason in one or two sentences**, in their terms.
        3. **Show the trade-off honestly**, including what it costs.
        4. **Say what you need from them.** A decision? A review? Just awareness?

        Use a picture when one would save five sentences, and an example when an idea is abstract. Then stop talking. Silence is where people think, and where the useful objections come from.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'You must explain a database migration to the head of product. Which opening is best?',
      options: ['"Search will be fast again, which should reduce abandoned baskets. It costs about two sprints. Here are the options."', '"We are moving from a relational schema to a document store with eventual consistency."', '"Don\'t worry about it, the engineers have it covered."', '"Let me walk you through the whole technical design."'],
      answer: 0,
      why: [null, 'It is accurate, but it is in your language, not theirs, and says nothing about outcomes or cost.', 'Reassurance without information hides a real cost and removes their chance to decide.', 'Starting with the whole design buries what they actually need.'],
      explain: 'Managers need outcomes, cost, time and options in business terms. Leave the mechanics out unless they ask.' },

    { type: 'tf', after: 3, statement: 'It is often best to answer a stakeholder\'s request immediately with the solution you think is best.', answer: false,
      explain: 'Requests often arrive as solutions in disguise. Asking about the underlying problem and constraints frequently reveals a much simpler answer.' },

    { type: 'ab', after: 5, q: 'A developer\'s design has a weak spot. Which feedback is better?',
      a: { lang: 'text', label: 'Coaching', src: `
        What would happen to orders if the payment service is down for
        ten minutes? How would we find out?` },
      b: { lang: 'text', label: 'Dictating', src: `
        This won't work. Add a retry loop and a circuit breaker
        like I told you. Don't ask again.` },
      answer: 'a',
      explain: 'The questions lead the developer to find the gap and own the fix, and they learn to ask those questions themselves next time. The command wins one fix and teaches nothing.' },

    { type: 'order', prompt: 'Put the stages of a good design review in order.',
      items: ['Share the design beforehand', 'Author states the problem, constraints and options', 'Reviewers ask questions and raise concerns about the design', 'Separate the big concerns from the small and time-box', 'Record decisions and who will do what'],
      explain: 'Preparation, then context, then feedback, then focus, then record. Skipping the first step is why reviews turn into reading sessions.' },

    { type: 'bucket', prompt: 'Which audience is each message best suited to?', buckets: ['Developers', 'Managers', 'Customers'],
      items: [['"Here is the migration plan, and a spike I ran that shows it holds."', 0], ['"The new service uses a queue so retries do not lose orders."', 0], ['"It costs two sprints, and here are three options for timing."', 1], ['"This reduces the risk of an outage during peak season."', 1], ['"Search gets faster next month. You do not need to do anything."', 2], ['"There may be a short pause on Sunday morning; your data is safe."', 2]],
      explain: 'Developers need mechanics and evidence. Managers need cost, risk and choices. Customers need the outcome for them, in everyday words.' },

    { type: 'match', prompt: 'Match each communication mode to what it looks like.',
      pairs: [['Direct', '"This is a security issue, so please do it this way."'], ['Consult', '"Here are three options; I would pick the second. Your call."'], ['Coach', '"What would happen if this were down? How would you know?"'], ['Listening first', '"What problem are you trying to solve?"'], ['Say it back', 'Asking someone to explain the plan in their own words']] },

    { type: 'cloze', text: 'In a design review, share the design {{beforehand}}, review the {{design}} and not the person, spend time on the costly {{concerns}}, and finish by recording {{decisions}} and actions.',
      distractors: ['afterwards', 'author', 'slides'],
      explain: 'Preparation, a focus on the work not the person, attention to what matters most, and a clear record at the end.' },

    { type: 'scenario', title: 'The defensive design review', intro: 'Sam, a talented but sensitive developer, presents a design for a new notification service. You spot a serious flaw: if the message broker restarts, notifications are lost. Ten colleagues are in the room, and Sam looks nervous.',
      meters: { 'Sam\'s confidence': 60, 'design quality': 40, 'team safety': 60 },
      steps: [
        { text: 'You have read the design beforehand. How do you raise the flaw?',
          choices: [
            { label: 'Ask: "What happens to a notification if the broker restarts mid-send?" and let Sam work through it', score: 2, effects: { 'design quality': 25, "Sam's confidence": 10, 'team safety': 10 }, feedback: 'A question lets Sam discover the gap, keeps their dignity, and models the kind of thinking you want the whole team to use.' },
            { label: 'Say bluntly: "This is wrong, you have not thought about failure."', score: 0, effects: { "Sam's confidence": -30, 'team safety': -25, 'design quality': 5 }, feedback: 'The flaw is real, but the room just learned that speaking up is dangerous. Next time people will hide their weak spots.' },
            { label: 'Say nothing and fix it in private later', score: 1, effects: { 'design quality': 10, 'team safety': -5, "Sam's confidence": 0 }, feedback: 'You protect Sam this time, but the review failed at its purpose and the team misses a chance to learn.' }
          ] },
        { text: 'Sam realises the problem and looks mortified. What do you say?',
          choices: [
            { label: 'Thank them for the clear design that made the issue easy to spot, and suggest a few ways to fix it together', score: 2, effects: { "Sam's confidence": 25, 'team safety': 20, 'design quality': 15 }, feedback: 'Finding a flaw in review is the review working. Making that visible makes people willing to bring half-formed designs next time.' },
            { label: 'Move on quickly to avoid embarrassment', score: 1, effects: { "Sam's confidence": -5, 'design quality': -5 }, feedback: 'Kindly meant, but Sam is left unsure whether it was a disaster, and the fix is left unsettled.' },
            { label: 'Use it as an example of what not to do', score: 0, effects: { "Sam's confidence": -30, 'team safety': -30 }, feedback: 'Public shaming ends honest reviews. People will stop showing their work until it is perfect, which is too late.' }
          ] },
        { text: 'The review ends with several ideas, some conflicting. How do you close?',
          choices: [
            { label: 'Summarise what was decided and why, assign owners for the follow-ups, and record it as a short note', score: 2, effects: { 'design quality': 20, 'team safety': 10 }, feedback: 'Without a record, the meeting evaporates and the same debate repeats. A short written outcome makes it count.' },
            { label: 'End with "good discussion, everyone" and go to lunch', score: 0, effects: { 'design quality': -15, 'team safety': -5 }, feedback: 'Nobody knows what was decided, so nothing changes, and the flaw survives.' },
            { label: 'Announce the final design yourself, overruling the discussion', score: 0, effects: { 'team safety': -25, "Sam's confidence": -15, 'design quality': 0 }, feedback: 'You have turned a conversation into a verdict, and wasted everyone\'s input.' }
          ] }
      ],
      outro: 'The pattern: **ask rather than accuse, praise the process, and leave with a written outcome.**' },

    { type: 'explain', prompt: 'Explain how you would present the same technical decision to a developer, a manager and a customer, and why you would ask questions before proposing solutions.',
      model: 'I would tailor each message: developers get the mechanics, evidence and migration plan; managers get outcomes, cost, risk and options in business terms; customers get what it means for them, in plain words. Requests often arrive as solutions in disguise, so I would ask what problem someone is solving and how fast it needs to be before proposing anything, which often leads to a simpler answer. Where I can, I would consult or coach rather than dictate, so the team learns and owns the decision.',
      keywords: ['audience', 'developers', 'managers', 'customers', 'listen', 'questions', 'coach', 'problem'] }
  ],

  flashcards: [
    { q: 'How should you adapt a message for developers, managers and customers?', a: 'Developers: mechanics and evidence. Managers: outcomes, cost, risk and options. Customers: what it means for them, in everyday words.' },
    { q: 'Why listen and ask before proposing a solution?', a: 'Requests often arrive as solutions in disguise. Asking about the problem and constraints often reveals a simpler answer.' },
    { q: 'What is the difference between consulting and coaching?', a: 'Consulting: offer expertise, options and a recommendation. Coaching: ask questions so the person finds the answer themselves.' },
    { q: 'What makes a good design review?', a: 'Share beforehand, start with the problem and options, review the design not the person, time-box and focus on the costly concerns, and record decisions and actions.' },
    { q: 'What is a quick check that a message landed?', a: 'Ask the listener to say it back in their own words.' }
  ],

  glossary: [
    { term: 'Design review', def: 'A meeting where a team shares a design with colleagues to improve it before it becomes expensive to change.', like: 'Having a friend proofread before you hit send.' },
    { term: 'Stakeholder', def: 'Anyone affected by or with an interest in a system or decision: users, managers, customers, other teams.', like: 'Everyone who has a seat at the table, or ought to.' },
    { term: 'Coaching', def: 'Helping someone find an answer for themselves, mostly by asking good questions.', like: 'Teaching someone to fish.' },
    { term: 'Consulting', def: 'Offering expertise, options and a recommendation while the team keeps the final decision.', like: 'A doctor explaining your options and giving advice.' }
  ],

  takeaways: [
    '**Tailor** the message: developers get mechanics, managers get outcomes and costs, customers get plain impact.',
    '**Listen first**: ask what problem someone is solving.',
    '**Consult and coach** rather than dictate, but be open about when you must direct.',
    'Run reviews that **critique the design, not the person**, and **record the outcome**.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ar-estimate-balance', {
  eli5: 'Architects are constantly asked how long and how much, which option to pick and what to compromise on, and the honest answers involve ranges, trade-offs and a clear view of what each shortcut will cost later.',

  cards: [
    { kind: 'story', title: '"About two weeks"',
      body: `In a corridor chat, the head of sales asks Lena, the architect, how long it would take to add single sign-on for a big customer. Lena thinks for a moment and says, "Oh, about two weeks."

        By the afternoon the sales team has promised the customer a date. Then the details emerge: the customer's login system is unusual, the test environment does not exist yet, and one team is on holiday. It takes seven weeks. The customer is annoyed, sales are furious, and Lena is baffled: "I only said *about*."

        The trouble was not the number. It was that a **guess in a corridor** became a **promise in a contract**. Estimating well is mostly about how you say it, and what you say it with.` },

    { kind: 'concept', title: 'An estimate is a range, not a promise',
      body: `An **estimate** is your best judgement of how long or how much, given what you know *today*. Early on, you know very little, so the honest answer is wide.

        - Say a **range** ("three to six weeks"), not a single point.
        - Say your **confidence** and your **assumptions** ("assuming the test environment exists").
        - Name the **biggest unknown** and what would shrink it.
        - Separate an **estimate** (a forecast) from a **commitment** (a promise). Commit only when uncertainty has dropped enough.

        The range narrows as you learn. Spikes and prototypes (from the last lesson but one) are excellent at that: two days of experiment can turn "3 to 12 weeks" into "5 to 6".

        People are usually over-optimistic. Things that go wrong tend to add time; things that go right rarely save as much.` },

    { kind: 'compare', title: 'Two answers to "how long?"',
      body: 'The same knowledge, expressed two ways.',
      cols: ['"About two weeks."', 'A useful answer'],
      rows: [
        ['Form', 'A single number, no context', 'A range with a stated confidence'],
        ['Assumptions', 'Hidden', 'Spoken: test environment, the other team\'s availability'],
        ['Unknowns', 'Not mentioned', 'Named, with a plan to learn more'],
        ['What the listener hears', 'A promise', 'A forecast they can plan around'],
        ['Example', '"Two weeks."', '"Probably four to seven. The unknown is their login system; a two-day spike will tighten it."']
      ] },

    { kind: 'steps', title: 'How to estimate something unfamiliar',
      body: 'No method removes the uncertainty, but this one keeps you honest.',
      steps: [
        { title: 'Break it into pieces', body: 'Smaller parts are easier to judge than one big blob. List the obvious ones, and add a line for "things we have not thought of".' },
        { title: 'Estimate each piece as a range', body: 'Best case and worst case. The width of the range shows where your uncertainty lives.' },
        { title: 'Compare with something similar you have done', body: 'The past is better evidence than optimism. How long did the last integration really take, including the bits nobody planned?' },
        { title: 'Write down assumptions and risks', body: 'These are the things that, if false, break the estimate. They become your list of questions.' },
        { title: 'Re-estimate as you learn', body: 'An estimate is a living thing. Share updates early, especially bad news.' }
      ] },

    { kind: 'concept', title: 'Cost is more than the cloud bill',
      body: `When people ask "how much will it cost?", they often picture the monthly cloud invoice. That is only one slice.

        | Cost | Where it hides |
        |---|---|
        | **Building** | People's time, the largest cost in most projects |
        | **Running** | Cloud bills, licences, monitoring tools |
        | **Operating** | Being on call, patching, support, backups |
        | **Changing** | The ongoing cost of every future change |
        | **Learning** | Training people on an unfamiliar tool |

        A cheap tool nobody understands can cost more than an expensive one everybody does. The cloud part can be estimated with quick arithmetic: usage times unit price. The *people* part is where the surprises live.` },

    { kind: 'compare', title: 'Evaluating options: a simple scorecard',
      body: 'Gut feeling is a fine start but a poor record. A small scorecard makes the trade-offs visible and discussable. Here, three ways to send a million emails a month.',
      cols: ['Build our own', 'Buy a service', 'Open-source tool, self-run'],
      rows: [
        ['Time to launch', 'Slow', 'Fast', 'Medium'],
        ['Running effort', 'High', 'Low', 'Medium'],
        ['Control', 'Total', 'Limited', 'High'],
        ['Fit with team skills', 'Partial', 'Good', 'Partial'],
        ['Lock-in risk', 'None', 'Higher', 'Low'],
        ['Cost per month', 'People time', 'Per-email fee', 'Servers plus people time']
      ],
      note: 'Weigh the rows by what matters *for this project*. A scorecard is a structure for the conversation, not a calculator that produces the answer.' },

    { kind: 'concept', title: 'Build vs buy',
      body: `One of the commonest architectural calls: do we **build** this ourselves, or **buy** (or adopt) something that exists?

        A reliable rule of thumb: **build what makes you different, buy what everybody needs.** A bakery grinds its own signature flour blend; it does not manufacture its own ovens.

        Questions to ask:

        - Is this a **core differentiator**, or a commodity (email sending, payments, login)?
        - What is the **total cost of ownership** over several years, including upgrades and support, not just the first invoice?
        - How well does it **fit**, and how painful would customising it be?
        - What if the vendor **changes price, or disappears**? Is there an exit route?

        Many good answers are in between: buy the commodity, build a thin layer of your own on top, behind a boundary so you could swap it.` },

    { kind: 'metaphor', title: 'Technical debt is a loan',
      body: `Borrowing money gets you something now (a house) in exchange for paying more later (interest). Used wisely, it is a powerful tool. Used carelessly, the repayments swallow your income.

        **Technical debt** is the same bargain made in code: a shortcut that lets you ship sooner, which you pay for later in slower changes and more bugs. The "interest" is the extra effort every future change costs while the shortcut is still there.

        - A **deliberate** loan ("we will skip this polish to hit the launch, and fix it in March") can be sensible.
        - **Unrecorded** debt is dangerous, because nobody knows it exists until the payments hurt.

        Where the metaphor stops: money debt has a visible balance. Technical debt has to be measured by the pain it causes.` },

    { kind: 'concept', title: 'Balancing quality, deadlines and debt',
      body: `Deadlines, features and quality pull against one another, and the architect is often the one saying "it depends". Some principles keep that honest:

        - **Not all quality is equal.** Security, data safety and correctness are rarely worth trading. Polish, convenient internal tooling and a few edge cases often are.
        - **Make debt visible.** When you take a shortcut, record it (a ticket, an ADR) with what it costs and when to repay it.
        - **Pay interest where it hurts.** Repay the debt in the code you change most, not the code nobody touches.
        - **Give the business the choice**, with the real trade-off. "We can ship in March with these gaps, or in May without them."

        **Pragmatism** means choosing the good-enough option that is appropriate for the situation, and being honest about what you are leaving out.` },

    { kind: 'pitfall', title: 'Where estimating and balancing go wrong',
      body: `- **Padding in secret.** Quietly multiplying every estimate by three erodes trust once it is spotted. State your range and reasons instead.
        - **Estimating alone.** People who will do the work see risks you do not. Ask them.
        - **"Yes" under pressure.** Saying yes to impossible dates does not create the time; it moves the pain to the end.
        - **Gold-plating.** Spending days making something perfect that needed to be fine.
        - **Debt without a plan.** "We'll fix it later" with no ticket and no date means never.

        Two phrases serve well: "**Here is the range and what would narrow it**," and "**Here are the options and what each costs.**"` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'Your head of sales asks how long a new integration will take, and you honestly have not seen the customer\'s system. Which reply is best?',
      options: ['"Four to seven weeks; a short spike on their login system would narrow it."', '"Two weeks, give or take a few days."', '"I can\'t possibly say until we have started the work."', '"Whatever date you need, we will make it work somehow."'],
      answer: 0,
      why: [null, 'A single optimistic number will be heard as a promise.', 'Accurate but unhelpful. People still need something to plan with.', 'This turns a forecast into a commitment you cannot know you can meet.'],
      explain: 'A range, with assumptions and a plan to reduce the main unknown, is both honest and useful.' },

    { type: 'tf', after: 3, statement: 'A good estimate stays the same from the first day to the last, because changing it shows you were wrong.', answer: false,
      explain: 'Estimates should be updated as you learn. The range narrows as unknowns resolve, and sharing the changes early (especially bad news) is a mark of professionalism.' },

    { type: 'bucket', after: 6, prompt: 'Does each of these lean towards building it yourself or buying it?', buckets: ['Build', 'Buy'],
      items: [['It is the core feature that sets the product apart', 0], ['It needs very unusual behaviour no product offers', 0], ['You have deep in-house expertise and long-term need', 0], ['It is a commodity such as sending email or taking card payments', 1], ['A good, proven product exists and you need to launch fast', 1], ['Running it yourself would mean learning an unfamiliar, specialised area', 1]],
      explain: 'Build what makes you different; buy what everybody needs. A thin layer behind a boundary often gives you the best of both.' },

    { type: 'estimate', q: 'A service receives 2 million requests a day. Roughly how many requests per second is that on average?', answer: 23, unit: 'requests per second', tolerance: 1.5,
      explain: 'There are about 86,400 seconds in a day, and 2,000,000 ÷ 86,400 is roughly 23. Peaks will be several times higher, but the average gives you a first, quick sizing figure.' },

    { type: 'match', prompt: 'Match each term to its meaning.',
      pairs: [['Estimate', 'A forecast with a range and stated assumptions'], ['Commitment', 'A promise made once uncertainty has dropped'], ['Technical debt', 'A shortcut that speeds delivery now and costs more later'], ['Total cost of ownership', 'Everything it costs over its life, not just the purchase price'], ['Gold-plating', 'Perfecting something that only needed to be good enough']] },

    { type: 'ab', q: 'The team wants to skip a clean-up to hit a launch. Which way of handling it is better?',
      a: { lang: 'text', label: 'Deliberate and recorded', src: `
        We will ship with the quick-and-dirty importer.
        Ticket ENG-212: replace it before the March release.
        Cost of delay: manual fixes, about two hours a week.` },
      b: { lang: 'text', label: 'Silent shortcut', src: `
        // TODO: fix this properly one day
        (no ticket, no owner, no date)` },
      answer: 'a',
      explain: 'Recorded debt has an owner, a cost and a date, so the business can see the loan and choose when to repay it. A bare comment in the code is invisible to planning, so the interest quietly piles up until something breaks.' },

    { type: 'short', q: 'What two-word term describes shortcuts that save time now but make future changes slower?', accept: ['technical debt', 'tech debt'], hint: 'It borrows the language of loans.',
      explain: 'Technical debt: used deliberately and recorded, it is a tool; hidden, it is a trap.' },

    { type: 'scenario', title: 'Can you do it in a month?', intro: 'The VP of Product drops by your desk. A major customer wants a new reporting feature, and she asks: "Can your team do it in a month? I would like to say yes in the meeting at three o\'clock."',
      meters: { 'VP trust': 55, 'team health': 65, 'delivery risk': 50 },
      steps: [
        { text: 'You have a rough idea of the work but real unknowns, including the customer\'s data format. How do you answer?',
          choices: [
            { label: 'Give a range with assumptions: "Probably four to eight weeks. The data format is the unknown; I can tighten it by tomorrow."', score: 2, effects: { 'VP trust': 15, 'delivery risk': -15 }, feedback: 'She gets something she can plan around, knows the main risk, and sees you have a way to reduce it.' },
            { label: '"Sure, a month." You do not want to disappoint her.', score: 0, effects: { 'VP trust': -15, 'team health': -20, 'delivery risk': 25 }, feedback: 'A hope has become a promise. At week five, everybody pays for it.' },
            { label: '"I cannot say anything until we have a full spec."', score: 1, effects: { 'VP trust': -10, 'delivery risk': -5 }, feedback: 'You are right about the uncertainty, but with nothing to offer she will decide in the dark.' }
          ] },
        { text: 'She says a month is the only date that works. What do you do?',
          choices: [
            { label: 'Offer options: a smaller first version in a month, or the full thing later, with what each leaves out', score: 2, effects: { 'VP trust': 15, 'delivery risk': -15, 'team health': 10 }, feedback: 'Scope is the lever you can actually move. Giving her real choices keeps the decision where it belongs.' },
            { label: 'Agree, and quietly plan for evenings and weekends', score: 0, effects: { 'team health': -30, 'delivery risk': 15, 'VP trust': -5 }, feedback: 'You have hidden the cost and burned the team, and the quality will suffer anyway.' },
            { label: 'Refuse to discuss anything shorter than eight weeks', score: 0, effects: { 'VP trust': -20 }, feedback: 'Rigid, and it ends the conversation you needed. A negotiation on scope might have solved her problem.' }
          ] },
        { text: 'The team agrees on a smaller first version that leaves out some polish and one report type. How do you manage that debt?',
          choices: [
            { label: 'Record exactly what was left out, the cost of leaving it, and a rough date to repay', score: 2, effects: { 'delivery risk': -10, 'VP trust': 10, 'team health': 10 }, feedback: 'Deliberate, visible debt is a decision. The business can see the loan and choose when to repay it.' },
            { label: 'Assume everyone will remember', score: 0, effects: { 'delivery risk': 20, 'VP trust': -10 }, feedback: 'Memory fades and people move on. The gap becomes a surprise in six months.' },
            { label: 'Do not mention what was cut, to avoid awkward questions', score: 0, effects: { 'VP trust': -25, 'delivery risk': 15 }, feedback: 'When it comes out, you lose trust. Honesty about trade-offs is the architect\'s main asset.' }
          ] }
      ],
      outro: 'The pattern: **give ranges, offer options on scope, and make every shortcut visible.**' },

    { type: 'explain', prompt: 'Explain how you would answer "how long will this take?" and how you would handle a build-versus-buy decision and technical debt.',
      model: 'I would give a range with my assumptions and the biggest unknown, and say how a spike could narrow it, treating an estimate as a forecast rather than a promise. For build versus buy, I build what makes the product different and buy commodities, comparing total cost of ownership, fit, lock-in and exit options. I treat technical debt as a deliberate loan: record the shortcut, its cost and when to repay it, and let the business choose with the real trade-offs in front of them.',
      keywords: ['range', 'assumptions', 'estimate', 'build', 'buy', 'total cost', 'technical debt', 'trade-off'] }
  ],

  flashcards: [
    { q: 'How should you express an estimate?', a: 'As a range, with your confidence, assumptions and biggest unknown, and with a note on what would narrow it. An estimate is a forecast, not a promise.' },
    { q: 'What are the costs beyond the cloud bill?', a: 'Building (people time), running, operating (on-call, support, patching), changing, and learning.' },
    { q: 'What is the rule of thumb for build versus buy?', a: 'Build what makes you different; buy what everyone needs. Consider total cost of ownership, fit, lock-in and an exit route.' },
    { q: 'What is technical debt?', a: 'A shortcut that saves time now but costs more in future changes. Deliberate, recorded debt is a tool; hidden debt is a trap.' },
    { q: 'What does "pragmatic" mean in architecture?', a: 'Choosing the good-enough option that suits the situation, and being honest about what you are leaving out.' }
  ],

  glossary: [
    { term: 'Estimate', def: 'A forecast of effort, time or cost given what is known today, best given as a range with assumptions.', like: 'A weather forecast: "70% chance of rain", not a promise.' },
    { term: 'Total cost of ownership', def: 'The full cost of a system over its life: purchase, building, running, operating, changing and training.', like: 'The real price of a car, including petrol, insurance and repairs.', aka: ['TCO'] },
    { term: 'Technical debt', def: 'The future cost created by a shortcut taken now, paid as slower changes and more defects.', like: 'A loan, with interest.', aka: ['tech debt'] },
    { term: 'Vendor lock-in', def: 'Being so dependent on one supplier that moving away is costly.', like: 'A printer that only takes one brand of ink.' },
    { term: 'Gold-plating', def: 'Investing effort in polish or features beyond what the need requires.', like: 'Hand-engraving the handle of a spade.' }
  ],

  takeaways: [
    'Estimate in **ranges** with assumptions, and separate a **forecast** from a **commitment**.',
    '**Cost** is people, running, operating and changing, not only the cloud bill.',
    '**Build what makes you different, buy what everyone needs**, and keep an exit.',
    'Take **technical debt** deliberately, record it, and let the business choose with real trade-offs.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ar-marketing', {
  eli5: 'A brilliant design that nobody adopts changes nothing, so architects also have to explain, demonstrate, find allies and earn trust until the right ideas actually get used.',

  cards: [
    { kind: 'story', title: 'The better idea that lost',
      body: `Two years ago, Ola wrote a clear, thoughtful proposal for how the company's services should handle errors. It sat on the wiki. Four people read it. Nobody changed anything.

        Last month a colleague, Raj, suggested a *less* thoughtful approach in a ten-minute demo with a working example and a clear "here is what it saves you". Within weeks three teams had adopted it.

        Ola's idea was better. Raj's was **used**. And in architecture, only the used one changes the system.

        Ola was not wrong to be right. She just stopped one step early: she wrote the idea, but never helped anyone *want* it.` },

    { kind: 'concept', title: 'A good idea nobody adopts is worth nothing',
      body: `An architecture is not what is on the wiki. It is what the **teams actually build**. If your idea does not change what people do, it has had no effect, however sound.

        That is uncomfortable for technical people who feel quality should speak for itself. It does not, because:

        - People are busy, and a new idea is extra work.
        - They have habits, and habits are sticky.
        - They have not yet seen your problem the way you do.

        "Marketing" here does not mean spin. It means the honest work of **helping the right people understand, trust and try** a good idea, so it can do the good it was designed for.` },

    { kind: 'metaphor', title: 'The market stall with free samples',
      body: `A new cheese on a market stall sits there next to forty others. A hand-written sign says it is "excellent". Almost nobody buys it.

        The stallholder cuts a small piece and offers it to a passer-by. Now they *know* what it tastes like. They buy a slice, tell the next stall, and by Saturday it is the best seller.

        People adopt what they have **tasted**, not what they have been told. A demo, a prototype or a small pilot is the free sample. Where the metaphor stops: a cheese is judged on one bite. An architecture is judged over years, so your samples need to be honest about the trade-offs, or the later bill damages your reputation.` },

    { kind: 'concept', title: 'Motivating and convincing',
      body: `People change when they see **what is in it for them**, not what is in it for the architecture.

        - **Start with their pain.** "Did the last release hit those flaky tests?" beats "We should adopt contract testing."
        - **Show the benefit in their terms:** time saved, fewer 3am calls, an easier review.
        - **Use evidence and stories**: a measurement, or "team B tried it and cut incidents".
        - **Be honest about costs and doubts.** Naming the downsides yourself makes you more believable, not less.
        - **Make the first step small.** "Try it on one service for two weeks" is much easier to accept than "rewrite everything".

        Nobody was ever convinced by being told they were wrong. They are convinced when they feel understood, then see a path that works.` },

    { kind: 'compare', title: 'A weak pitch and a strong one',
      body: 'The same idea: introduce contract tests between two services.',
      cols: ['Weak pitch', 'Strong pitch'],
      rows: [
        ['Opening', '"We should adopt consumer-driven contract testing."', '"Remember last week\'s outage, when one team renamed a field? Here is a way to catch that before release."'],
        ['Evidence', 'None', 'A ten-minute demo catching a real bug'],
        ['Honesty', '"It is best practice."', '"It adds a small test to each side and some setup time."'],
        ['Ask', '"Adopt it everywhere."', '"Can we try it on one service for two weeks?"'],
        ['Tone', 'Telling', 'Asking']
      ] },

    { kind: 'concept', title: 'Prototypes and demos: show, do not tell',
      body: `A ten-minute demo of something working beats a thirty-page document describing it, because people can *see* and *touch* it.

        Tips that make demos land:

        - **Solve their problem, not a toy.** Use their real data or a case they recognise.
        - **Keep it short and concrete.** One problem, one before-and-after, one clear ask.
        - **Let them try it.** Hands on a keyboard persuade more than slides.
        - **Say what it is not.** "This is a prototype; here is what is missing." It guards your credibility.

        A quick spike or prototype (from the code and documentation lesson) is often enough. It does not have to be production-ready; it has to be *real enough to believe in*.` },

    { kind: 'diagram', title: 'Ideas spread through people',
      body: 'Adoption rarely spreads from a document. It spreads along relationships, one trusted voice at a time.',
      nodes: [
        { id: 'you', label: 'You and the idea', icon: '💡', x: 1, y: 0, tone: 'accent' },
        { id: 'friend', label: 'A friendly team', icon: '🤝', x: 0, y: 1, tone: 'good' },
        { id: 'senior', label: 'A respected senior dev', icon: '🧑‍💻', x: 2, y: 1, tone: 'good' },
        { id: 'pilot', label: 'A small, visible success', icon: '✅', x: 1, y: 2, tone: 'good' },
        { id: 'wide', label: 'Wider adoption', icon: '🌱', x: 1, y: 3 }
      ],
      edges: [
        { from: 'you', to: 'friend', label: 'pilot with' }, { from: 'you', to: 'senior', label: 'ask for views' },
        { from: 'friend', to: 'pilot' }, { from: 'senior', to: 'pilot', label: 'vouches', dashed: true },
        { from: 'pilot', to: 'wide', label: 'others copy' }
      ],
      caption: 'People copy those they trust. A visible small success and a respected voice are worth more than any amount of announcement.' },

    { kind: 'concept', title: 'Finding allies',
      body: `Few good ideas win on one person's effort. Find the people who will help carry them.

        - **Champions:** people who already see the problem. Start with them: they will improve the idea and spread it.
        - **The undecided:** most people. Win them with evidence and ease.
        - **Sceptics:** *talk to them early.* Their objections are often your best free review, and a sceptic who has been heard becomes a far milder opponent.

        Practical moves: ask a respected developer to try it and give honest feedback; present at a team's regular meeting rather than calling a new one; and **share the credit**, so the idea becomes "ours". An idea that belongs to many people is much harder to ignore.` },

    { kind: 'concept', title: 'Building a reputation',
      body: `Behind every successful idea is a person whose word people trust. That trust is a **reputation**, and it is built slowly from small things:

        - **Do what you said you would do**, including the dull follow-ups.
        - **Be right, and admit when you are wrong.** Quickly, and without drama.
        - **Be useful.** Answer questions, review work, help unblock people. Generosity compounds.
        - **Write and speak** about what you learn: short posts, talks, a good README. Visible thinking lets people know you.
        - **Be consistent and honest about trade-offs**, even when overselling would be easier.

        A reputation takes years to build and one dishonest pitch to dent. It is the most valuable thing an architect owns, because it decides how many of your ideas get a fair hearing.` },

    { kind: 'pitfall', title: 'Persuasion is not manipulation',
      body: `The line between "helping people understand" and "pushing my way through" matters.

        - **Overselling.** Promising results you cannot guarantee spends reputation you cannot easily earn back. State costs and risks yourself.
        - **Going around people.** Lobbying a director behind a team's back wins a battle and loses the war.
        - **Hype and buzzwords.** Impressive vocabulary hides weak reasoning and breeds suspicion.
        - **Treating "no" as an attack.** An objection is information. Ask what is behind it.
        - **Forcing adoption.** A mandated tool that people resent is followed to the letter and undermined in spirit.

        The test: would you be comfortable if the other person saw *exactly* how you were trying to persuade them?` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'Why can a clear, correct architecture proposal sitting on a wiki still have no effect?',
      options: ['Architecture is what teams actually build, so an idea nobody adopts changes nothing', 'Wikis are not allowed to hold technical documents', 'Good ideas are always adopted automatically, so the proposal must be flawed', 'Only code counts, so proposals are never useful'],
      answer: 0,
      why: [null, 'Wikis can hold documents. The problem is that nobody acted on this one.', 'Quality does not spread by itself; people are busy and attached to habits.', 'Proposals matter a great deal when people adopt them.'],
      explain: 'An idea only matters when it changes what people build. That takes explaining, demonstrating and trust, not just being right.' },

    { type: 'tf', after: 5, statement: 'A prototype used in a demo has to be production-ready, or it will damage your credibility.', answer: false,
      explain: 'It has to be real enough to believe in and honest about what is missing. Saying "this is a prototype; here is what it leaves out" actually protects your credibility.' },

    { type: 'ab', after: 4, q: 'Which opening is more likely to win a team\'s interest in a new testing approach?',
      a: { lang: 'text', label: 'Start with their pain', src: `
        Remember the outage when one team renamed a field? Here is a
        ten-minute demo of a test that would have caught it. Could we
        try it on one service for two weeks?` },
      b: { lang: 'text', label: 'Start with the technique', src: `
        We should adopt consumer-driven contract testing everywhere
        because it is best practice.` },
      answer: 'a',
      explain: 'It starts with a pain they remember, shows evidence, and asks for a small, reversible step. "Best practice everywhere" gives people nothing to feel and a lot to resist.' },

    { type: 'order', prompt: 'Put a sensible adoption plan in order.',
      items: ['Understand the real pain people have today', 'Build a small prototype and show it', 'Pilot it with a friendly team', 'Share the honest results, including the costs', 'Offer it to more teams, and let it spread'],
      explain: 'Start from their problem, let people taste a small sample, prove it with a friendly pilot, and let honest results do the persuading.' },

    { type: 'bucket', prompt: 'Do these actions build a reputation or erode it?', buckets: ['Builds', 'Erodes'],
      items: [['Following up on what you promised, even the dull parts', 0], ['Admitting quickly that you were wrong', 0], ['Helping a colleague unblock a design question', 0], ['Overselling a tool and hiding its costs', 1], ['Lobbying a director behind a team\'s back', 1], ['Dismissing objections as people being resistant to change', 1]],
      explain: 'Reputation is built by reliability, honesty and usefulness, and spent by overselling, going around people and ignoring objections.' },

    { type: 'match', prompt: 'Match each persuasion idea to its description.',
      pairs: [['Champion', 'Someone who already sees the problem and helps spread the idea'], ['Sceptic', 'Someone whose objections are your best early review'], ['Pilot', 'A small trial with a friendly team'], ['Demo', 'A short, concrete showing of something working'], ['Sharing credit', 'Making the idea "ours" so more people defend it']] },

    { type: 'short', q: 'What one word describes a person who enthusiastically promotes a new idea inside a team?', accept: ['champion', 'a champion', 'advocate'], hint: 'Think of someone cheering for a team, or fighting for a cause.',
      explain: 'Champions are the allies who carry an idea further than you could alone. Find them first and make them successful.' },

    { type: 'scenario', title: 'Selling the shared logging library', intro: 'You believe every service should use one shared logging library with consistent fields, because tracing incidents across eight services is slow and painful. But the eight teams are busy, each has its own habits, and a wiki proposal got no response. You have a month.',
      meters: { 'adoption': 10, 'goodwill': 55, 'your reputation': 55 },
      steps: [
        { text: 'Where do you start?',
          choices: [
            { label: 'Find two teams who already struggle with tracing incidents, and ask what hurts', score: 2, effects: { adoption: 15, goodwill: 15 }, feedback: 'Champions with a real pain are the best start. You learn what to fix, and they will vouch for the result.' },
            { label: 'Announce a mandate: all services must switch by the end of the quarter', score: 0, effects: { goodwill: -30, 'your reputation': -15, adoption: 5 }, feedback: 'Mandates get compliance without belief. Teams will do the minimum and resent you for it.' },
            { label: 'Write a longer, more detailed proposal', score: 1, effects: { 'your reputation': 0, adoption: 0 }, feedback: 'More detail will not fix a proposal that people did not read in the first place.' }
          ] },
        { text: 'The two friendly teams are willing. How do you make the pilot count?',
          choices: [
            { label: 'Do a small pilot together, measure time-to-find-the-cause on a real incident, and show it in a short demo', score: 2, effects: { adoption: 25, goodwill: 10, 'your reputation': 15 }, feedback: 'A real number from a real incident is evidence nobody can wave away, and the demo lets others taste it.' },
            { label: 'Build it entirely on your own and present the finished product', score: 1, effects: { adoption: 5, goodwill: -5 }, feedback: 'It might be good, but you built it without the people who will use it, and they will feel it was done to them.' },
            { label: 'Let the pilot teams figure it out and hope word spreads', score: 0, effects: { adoption: 0 }, feedback: 'Success that nobody sees does not spread. You have to help people notice it.' }
          ] },
        { text: 'One senior developer, Mo, is openly sceptical: "It will slow every request down." What do you do?',
          choices: [
            { label: 'Take the concern seriously: measure the overhead, share the numbers, and adjust the design if needed', score: 2, effects: { adoption: 20, goodwill: 15, 'your reputation': 20 }, feedback: 'The best objections are free review. Answering with evidence, and changing course if you must, turns a critic into a credible ally.' },
            { label: 'Dismiss it: "He just resists change"', score: 0, effects: { goodwill: -25, 'your reputation': -15, adoption: -10 }, feedback: 'If the concern is real, you have shipped a problem. If not, you have made an enemy for nothing.' },
            { label: 'Go over his head to the CTO to force it through', score: 0, effects: { goodwill: -35, 'your reputation': -25, adoption: 5 }, feedback: 'You may win the vote and lose every future conversation. Going around people is the fastest way to spend trust.' }
          ] }
      ],
      outro: 'The pattern: **start with someone\'s real pain, let them taste a small honest pilot, and treat objections as information.**' },

    { type: 'explain', prompt: 'Explain why a good idea may fail to spread and describe how you would get one adopted across several teams, including how you would handle a sceptic.',
      model: 'An idea only counts when it changes what teams build, and busy people with habits will not adopt something just because it is correct. I would start from a pain people already feel, find champions and pilot with a friendly team, show the result in a short demo with honest costs and limits, and ask for small steps. I would talk to sceptics early, because their objections are free review, answer with evidence and share the credit so the idea belongs to everyone. Trust and reputation, built through honesty and usefulness, make people give the idea a fair hearing.',
      keywords: ['adopt', 'pain', 'champion', 'pilot', 'demo', 'sceptic', 'credit', 'trust'] }
  ],

  flashcards: [
    { q: 'Why is "a good idea nobody adopts worthless"?', a: 'Because architecture is what teams actually build. An idea that does not change behaviour has no effect.' },
    { q: 'How do you motivate people to adopt an idea?', a: 'Start from their pain, show the benefit in their terms, give evidence, be honest about costs and make the first step small.' },
    { q: 'Why are demos and prototypes so persuasive?', a: 'People adopt what they have tasted: a short, concrete demo on a familiar problem beats a long document.' },
    { q: 'Who are the allies to find, and what should you do with sceptics?', a: 'Champions who already see the problem, and respected voices. Talk to sceptics early: their objections are free review.' },
    { q: 'How is a reputation built?', a: 'By doing what you said, admitting mistakes, being useful, sharing your thinking and being honest about trade-offs.' }
  ],

  glossary: [
    { term: 'Champion', def: 'A person inside a team or company who already sees the problem and actively promotes a new idea or practice.', like: 'The regular who tells everyone to try the new cheese.' },
    { term: 'Pilot', def: 'A small, limited trial of an idea with a willing team, used to learn and to build evidence.', like: 'A free sample.' },
    { term: 'Stakeholder buy-in', def: 'The real support of the people affected by a decision, so they help make it work rather than resist it.', like: 'Passengers who want to go where the bus is heading.', aka: ['buy-in'] },
    { term: 'Reputation', def: 'The trust others place in your judgement and reliability, built through consistent behaviour over time.', like: 'A restaurant\'s name earned one meal at a time.' }
  ],

  takeaways: [
    'An idea only matters if it **changes what people build**.',
    'Start from **their pain**, show a **demo**, be honest about costs and ask for a **small step**.',
    'Find **champions**, talk to **sceptics** early, and **share the credit**.',
    '**Reputation** is built slowly through honesty and usefulness. Never oversell.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('architect-role', {
  title: 'The Ivory Tower Keeper',
  intro: 'At the top of a dusty tower sits a keeper who hands down 80-page standards nobody reads. Beat it by spotting the load-bearing decisions, picking the right level, recording the why, and getting good ideas actually adopted.',
  questions: [
    { type: 'mcq', q: 'Two teams argue for a week about which code formatter to use, then agree a public API for partners in a single afternoon. What went wrong?',
      options: ['They spent their care the wrong way round: the API is hard to reverse, the formatter is not', 'Nothing: every decision deserves about the same amount of debate', 'They should have written a full ADR for the formatter as well', 'They decided the API too late, after the last responsible moment'],
      answer: 0,
      why: [null, 'Care should match how costly a mistake would be to undo.', 'A formatter is easy to swap; an ADR for it is rarely worth the time.', 'The problem is how little care the API got, not when it was decided.'],
      explain: 'A public API that outsiders build on is a load-bearing wall; a formatter is paint. Match the effort to the reversibility.' },

    { type: 'tf', statement: 'If a team never consciously designs its system, the system has no architecture.', answer: false,
      explain: 'Every system has an architecture. If nobody chooses it on purpose, it is chosen by accident, usually by whoever was in a hurry.' },

    { type: 'bucket', prompt: 'At which level is each question mainly asked?', buckets: ['Application', 'Solution', 'Enterprise'],
      items: [['How should this service split its code into layers?', 0], ['Which test approach suits this one codebase?', 0], ['How do the shop, warehouse and courier share return data?', 1], ['Build or buy the payment step for this project?', 1], ['Which of our four CRM systems should we retire?', 2], ['Which business capabilities need investment over five years?', 2]],
      explain: 'Application: inside one system. Solution: several systems answering one business problem. Enterprise: the whole landscape and its direction over years.' },

    { type: 'spot', prompt: 'This ADR has one line that breaks the rules for keeping decision records. Tap it.',
      code: { lang: 'text', src: `
        # ADR 12: Use a job queue for emails
        Status: Accepted (edited in March to say we use streaming instead)

        Context:
        - Email volume is modest; the team knows the queue tool.

        Decision:
        Send emails through one job queue behind a small interface.` },
      lines: [2],
      explain: 'Records are not rewritten after the fact. When a decision changes, a new ADR supersedes the old one and links back, so the history and the reasons stay visible.' },

    { type: 'multi', q: 'An architect wants to stay out of the ivory tower. Which habits help?',
      options: ['Joining team design chats as a colleague', 'Reading pull requests and running the odd spike', 'Explaining the reason behind each rule', 'Owning the most critical feature on the roadmap', 'Answering challenges with "It is the standard"'],
      answers: [0, 1, 2],
      explain: 'Sitting with teams, staying near the code and explaining the why keep an architect grounded. Owning the critical path makes them a bottleneck, and citing the standard without a reason is the tower itself.' },

    { type: 'order', prompt: 'A team doubts a library can handle its load. Put a good spike in order.',
      items: ['Phrase one question that can be answered with a number', 'Agree a time box of a day or two', 'Build the roughest thing that answers it', 'Write down the result and the evidence', 'Throw the code away and build properly'],
      explain: 'A sharp question and a time box keep the spike small; a short written result preserves the learning; discarding the code stops a hack becoming a foundation.' },

    { type: 'match', prompt: 'Match each C4 diagram level to the question it answers.',
      pairs: [['System Context', 'Who uses the system, and what does it talk to?'], ['Containers', 'Which separately running parts are there, and how do they talk?'], ['Components', 'What are the main building blocks inside one part?'], ['Code', 'Which classes and functions exist?']] },

    { type: 'ab', q: 'You must tell the finance director about a planned database migration. Which message is better?',
      a: { lang: 'text', label: 'Mechanics', src: `
        We are moving from a relational schema to a document store
        with eventual consistency, sharded by customer ID, via a
        dual-write migration.` },
      b: { lang: 'text', label: 'Outcomes', src: `
        Checkout will stay fast through peak season. It costs about
        two sprints of feature work. I need you to pick one of two
        windows for it.` },
      answer: 'b',
      explain: 'A finance director needs outcome, cost and the decision being asked of them, in business terms. The technical mechanics belong in the conversation with developers.' },

    { type: 'estimate', q: 'A batch job must process 9 million records overnight in a 5-hour window. Roughly how many records per second must it handle?', answer: 500, unit: 'records per second', tolerance: 1.5,
      explain: 'Five hours is 18,000 seconds, and 9,000,000 ÷ 18,000 = 500. A quick sum like this tells you early whether one machine is likely to cope.' },

    { type: 'mcq', q: 'A product owner asks for "a real-time dashboard". What should the architect do first?',
      options: ['Ask what problem it solves and how fresh the data really needs to be', 'Choose a streaming platform that can push updates every second', 'Estimate the cost of a real-time system and send it straight back', 'Coach the product owner to design the dashboard themselves'],
      answer: 0,
      why: [null, 'That jumps to a solution before the need is understood.', 'An estimate for the wrong solution is still the wrong solution.', 'Coaching has its place, but first you need to understand the problem.'],
      explain: 'Requests often arrive as solutions in disguise. "Real-time" may turn out to mean "within an hour", which a far simpler design can meet.' },

    { type: 'cloze', text: 'Build what makes you {{different}} and buy what everybody needs. Judge options on {{total}} cost of ownership, and when you take a shortcut, record the technical {{debt}} with an owner and a date.',
      distractors: ['cheaper', 'monthly', 'budget'],
      explain: 'Commodities are bought, differentiators built; the full lifetime cost matters more than the first invoice; and deliberate, recorded debt is a tool rather than a trap.' },

    { type: 'mcq', q: 'Your excellent proposal for shared error handling has sat unread on the wiki for months. What is the most effective next step?',
      options: ['Pilot it with a team that feels the pain, then show the results in a short demo', 'Ask the CTO to make it mandatory for every team this quarter', 'Rewrite the proposal with more detail and stronger arguments', 'Wait: if the idea is good, teams will find it in time'],
      answer: 0,
      why: [null, 'A mandate gets grudging compliance and spends your reputation.', 'More detail will not help a document nobody opened.', 'Good ideas do not spread on their own; people are busy and have habits.'],
      explain: 'People adopt what they have tasted. A real pilot with a friendly team, shown honestly, persuades far more than a document or a mandate.' }
  ]
});

KS.sheet('architect-role', {
  title: 'The architect\'s job: cheat sheet',
  sections: [
    { title: 'What architecture is',
      md: `**Architecture = structure + the reasons behind it.** Structure is the parts and connections; the reasons are why, and what was traded away.

        | Architectural | Detail |
        |---|---|
        | Costly to reverse, many teams | Cheap, one person |
        | Monolith vs services, where data lives, how users sign in | Variable names, loop style, button colour |

        - Test of good architecture: **how cheap is the next change?**
        - It is **never finished**: revisit when assumptions stop being true. Neglect means **erosion**.
        - Every system has an architecture; the only question is whether it was chosen on purpose.` },

    { title: 'The role and its levels',
      md: `**Role:** help the team make the important decisions well, and make sure they are **understood, recorded and followed**. The conductor, not the soloist.

        | Level | Scope | Horizon | Talks to |
        |---|---|---|---|
        | Application | One app or service | Weeks–months | One team |
        | Solution | One business problem, several systems | Months | Several teams, vendors |
        | Enterprise | Whole landscape vs strategy | Years | Executives, many teams |

        Levels are **scopes, not ranks**. Check decisions one level up and one down.

        **Ivory tower:** rules from afar, no context. Cure: sit with teams, explain the why, stay near the code.` },

    { title: 'Deciding and recording',
      md: `| Easy to reverse | Hard to reverse |
        |---|---|
        | Decide fast, try it | Evidence, consult, write it down |
        | Logging library, folders | Database, service split, public API |

        **Last responsible moment:** decide when waiting costs more than deciding. Until then, hide the choice behind a boundary.

        **ADR:** number + title, **Status** (proposed / accepted / superseded), **Context**, **Decision** (one clear sentence), **Consequences** (good, bad, when to revisit). Kept in the repo. **Supersede, never rewrite.**

        **Simplify:** add a moving part only when you can name the problem it solves.

        Traps: analysis paralysis, resume-driven design, over-engineering.` },

    { title: 'Coding, spikes and documentation',
      md: `**Keep coding** (pairing, bug fixes, prototypes, reviews) for credibility and truth, but stay **off the critical path**.

        **Spike:** one question, time-boxed, ugliest build that answers it, record the result, throw the code away. **Prototype:** rough working version to learn or show.

        **C4 levels:** 1 System Context, 2 Containers (any separately running part), 3 Components, 4 Code. Label every arrow.

        **arc42:** 12-section template; a menu, not a form.

        **Docs that live:** short, for one reader, the why, in the repo, **diagrams as code** (Mermaid, PlantUML, Structurizr). A wrong doc is worse than none.` },

    { title: 'Communicating',
      md: `| Audience | Wants |
        |---|---|
        | Developers | Mechanics, evidence, what changes for their code |
        | Managers | Outcome, cost, time, risk, options |
        | Customers | What it means for them, plain words |

        **Listen first:** "What problem are you solving? How fast must it be?"

        **Modes:** **direct** (urgent, security), **consult** (options + recommendation), **coach** (ask questions). Say which one you are in.

        **Design review:** share beforehand, problem and options first, critique the design not the person, focus on costly concerns, record decisions and owners.

        **Message shape:** point, reason, trade-off, what you need. Then stop talking.` },

    { title: 'Estimating and balancing',
      md: `**Estimate = a range + confidence + assumptions + biggest unknown.** A forecast, not a commitment. Narrow it with spikes; re-estimate and share bad news early.

        **Cost** = building (people) + running + operating + changing + learning.

        **Quick sums:** a day is about **86,400 s**; 1 million per day is roughly 12 per second on average (peaks are higher).

        **Build vs buy:** build what makes you different, buy what everyone needs. Weigh TCO, fit, lock-in and exit route.

        **Technical debt** = a loan. Take it deliberately, record cost and repay date, repay where you change code most. Never trade away security, data safety or correctness.

        Traps: secret padding, "yes" under pressure, gold-plating.` },

    { title: 'Getting ideas adopted',
      md: `An idea counts only when it **changes what teams build**.

        | Weak pitch | Strong pitch |
        |---|---|
        | "Best practice" | Their real pain |
        | A document | A short demo on their problem |
        | Adopt everywhere | Try on one service for two weeks |
        | Hides costs | States costs and limits |

        **Allies:** champions first, win the undecided with evidence, talk to **sceptics early** (free review). Share the credit.

        **Reputation:** keep promises, admit mistakes, be useful, never oversell.

        **Not manipulation:** no going around people, no hype, no forced mandates.` }
  ]
});
