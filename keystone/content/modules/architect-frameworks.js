/* Module: architect-frameworks — Frameworks, Modelling & Process.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs architect-frameworks */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('af-uml', {
  eli5: 'UML is a shared set of boxes and arrows for sketching software, so that two people can look at the same drawing and picture the same system.',

  cards: [
    { kind: 'concept', title: 'Why draw at all?',
      body: `Try explaining to a friend how to get to your house, using words only. "Left at the pub, then the second right, no, the third, past the bakery..." Now grab a napkin and draw it. Thirty seconds, and they have it.

        Software has the same problem, only the "streets" are invisible. Nobody can see which class calls which, or which services talk to which database. A diagram makes the invisible **visible and arguable**: you can point at a box and say "this is the bit I do not trust".

        Drawing is also cheaper than coding. Moving a box costs nothing; moving a service costs a month.` },

    { kind: 'metaphor', title: 'Sheet music for software',
      body: `A violinist in Leeds and a cellist in Lisbon can play the same piece, because sheet music is a **shared alphabet**. Nobody has to explain what a crotchet is.

        **UML** (Unified Modeling Language) is meant to be that alphabet for software: a standard set of shapes, lines and arrow heads, each with an agreed meaning. A box with three compartments is a class. A dashed arrow is a dependency.

        The metaphor stops at one point: music is played from the page, whereas most teams only use UML to *sketch*. Nobody expects the diagram to compile.`,
      note: 'UML is maintained by the Object Management Group (OMG). It defines many diagram types, but a handful do most of the work.' },

    { kind: 'diagram', title: 'A class diagram',
      body: 'A **class diagram** shows the things in a system and how they relate. Here is a tiny shop. The numbers say how many: one customer places zero or more orders.',
      nodes: [
        { id: 'c', label: 'Customer', icon: '🧑', x: 1, y: 0, tone: 'accent' },
        { id: 'o', label: 'Order', icon: '🧾', x: 1, y: 1, tone: 'accent' },
        { id: 'l', label: 'OrderLine', x: 0, y: 2 },
        { id: 'p', label: 'Product', icon: '📦', x: 1, y: 3 },
        { id: 'd', label: 'DiscountPolicy', x: 2, y: 1, tone: 'warn' }
      ],
      edges: [
        { from: 'c', to: 'o', label: '1 places 0..*' },
        { from: 'o', to: 'l', label: 'contains 1..*' },
        { from: 'l', to: 'p', label: 'refers to' },
        { from: 'o', to: 'd', label: 'uses', dashed: true }
      ],
      caption: 'Real class diagrams also list each class’s fields and methods in compartments. This is the zoomed-out view.' },

    { kind: 'compare', title: 'Reading the arrows',
      body: 'Most of UML’s confusion lives in the line ends. These are the ones you will meet again and again.',
      cols: ['Drawn as', 'Means'],
      rows: [
        ['Association', 'Plain line', 'One thing knows about another (Customer … Order)'],
        ['Inheritance', 'Solid line, hollow triangle', '“Is a kind of”; triangle at the parent'],
        ['Realisation', 'Dashed line, hollow triangle', 'A class implements an interface'],
        ['Dependency', 'Dashed line, open arrow', '“Uses”: a weaker, looser link'],
        ['Aggregation', 'Hollow diamond', 'A whole with parts that can live on without it'],
        ['Composition', 'Filled diamond', 'Parts die with the whole (an order and its lines)']
      ],
      note: 'The triangle, or diamond, always sits at the end of the **parent or whole**.' },

    { kind: 'sequence', title: 'A sequence diagram',
      body: 'A **sequence diagram** is about time rather than structure: who sends what to whom, in order. Time runs downwards. This one is “place an order”.',
      actors: ['Browser', 'Shop API', 'Database'],
      steps: [
        { from: 0, to: 1, label: 'POST /orders', note: 'The browser sends the basket to the API.' },
        { from: 1, to: 2, label: 'check stock', note: 'The API asks the database whether the items exist.' },
        { from: 2, to: 1, label: 'in stock', dashed: true, note: 'Dashed arrows are replies.' },
        { at: 1, label: 'work out total', note: 'A box on one actor’s own line: it does something itself.' },
        { from: 1, to: 2, label: 'save order', note: 'Now it writes the order.' },
        { from: 1, to: 0, label: '201 Created', dashed: true, note: 'And the answer goes back to the browser.' }
      ] },

    { kind: 'diagram', title: 'Component and deployment views',
      body: 'A **component diagram** shows the big replaceable pieces and what they offer each other. A **deployment diagram** shows where those pieces physically run. This one mixes the two.',
      nodes: [
        { id: 'app', label: 'Mobile app', icon: '📱', x: 1, y: 0 },
        { id: 'lb', label: 'Load balancer', icon: '🔀', x: 1, y: 1 },
        { id: 'a1', label: 'API container 1', x: 0, y: 2, tone: 'accent' },
        { id: 'a2', label: 'API container 2', x: 2, y: 2, tone: 'accent' },
        { id: 'db', label: 'Orders database', icon: '🗄️', x: 1, y: 3, tone: 'info' }
      ],
      edges: [
        { from: 'app', to: 'lb', label: 'HTTPS' },
        { from: 'lb', to: 'a1' },
        { from: 'lb', to: 'a2' },
        { from: 'a1', to: 'db', label: 'SQL' },
        { from: 'a2', to: 'db' }
      ],
      groups: [{ label: 'Cloud region', x: 0, y: 1, w: 3, h: 3 }],
      caption: 'The dashed box is a deployment node: “this lives in the cloud region”.' },

    { kind: 'layers', title: 'UML versus the C4 model',
      body: `UML is thorough, and that is its weakness: teams drown in it. The **C4 model** (by Simon Brown) takes the opposite view. It uses plain boxes and arrows and zooms like a map, in four levels:`,
      layers: [
        { label: 'Context', note: 'Your system as one box, with the people and other systems around it.', icon: '🌍' },
        { label: 'Containers', note: 'The deployable parts inside: web app, API, database. (Not necessarily Docker.)', icon: '📦' },
        { label: 'Components', note: 'The main building blocks inside one container.', icon: '🧩' },
        { label: 'Code', note: 'Classes and methods. Rarely drawn by hand, often generated.', icon: '🔬', tone: 'muted' }
      ],
      note: 'They are not rivals. Many teams use C4 for the big picture and a UML sequence or class diagram for one tricky corner.' },

    { kind: 'pitfall', title: 'The diagram nobody updates',
      body: `The classic failure: someone spends three days drawing every class in the system in a modelling tool. It is correct on Friday. By the following Friday it is wrong, and by next month it is **actively misleading**, which is worse than no diagram at all.

        Diagrams rot because code changes and drawings do not. Two cures: keep diagrams small and about *why* things are shaped as they are, and prefer ones you can regenerate from code or keep as text next to the code.

        Also beware the diagram that only its author can read.` },

    { kind: 'tip', title: 'Just enough diagramming',
      body: `A working rule: **draw to think, or draw to explain, then stop.**

        - Unsure how a feature flows between services? A quick sequence diagram.
        - Explaining the system to a newcomer? C4 context and containers.
        - Debating a data model? A rough class diagram.

        Use a whiteboard first. Add a legend if you invent notation. Label every arrow, since an unlabelled arrow could mean "calls", "sends data to" or "depends on", and people will read it three different ways.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'What is the main job of a diagram like UML on a real project?',
      options: ['Let people think and talk about the system with a shared picture', 'Generate the finished program automatically', 'Prove to managers that planning was done', 'Replace the need to write any documentation at all'],
      answer: 0,
      why: [null, 'Some tools can generate code from models, but that is not what most teams do with UML, and nobody relies on it.', 'A diagram nobody uses is theatre, not planning.', 'Diagrams support other documentation. They rarely replace it.'],
      explain: 'Diagrams make an invisible system visible so people can discuss it, spot problems early and agree on a picture. Their value is communication.' },

    { type: 'match', after: 3, prompt: 'Match each UML idea to what it means.',
      pairs: [['Solid line, hollow triangle', 'Inheritance: “is a kind of”'], ['Dashed line, hollow triangle', 'A class implementing an interface'], ['Dashed line, open arrow', 'Dependency: one thing uses another'], ['Filled diamond', 'Composition: parts die with the whole'], ['Hollow diamond', 'Aggregation: parts can outlive the whole']],
      explain: 'The triangle says “parent or interface”, the diamond says “whole”, and dashed lines are always the weaker or looser relationship.' },

    { type: 'tf', after: 4, statement: 'In a sequence diagram, the vertical direction shows time passing.', answer: true,
      explain: 'Messages are drawn top to bottom in the order they happen. That is exactly what makes sequence diagrams good for explaining flows.' },

    { type: 'bucket', prompt: 'Which diagram would you reach for?', buckets: ['Class', 'Sequence', 'Component / deployment'],
      items: [['What are the entities in the data model, and how do they relate?', 0], ['What is the order of calls when a payment is authorised?', 1], ['Which servers does the API run on?', 2], ['Does an Order own its OrderLines?', 0], ['Which service waits for which reply?', 1], ['What are the big replaceable parts and what do they offer each other?', 2]],
      explain: 'Class diagrams are about structure and relationships, sequence diagrams about the order of messages over time, and component and deployment diagrams about the big pieces and where they run.' },

    { type: 'cloze', text: 'A {{sequence}} diagram shows messages over time, while a {{class}} diagram shows how the things in a system relate. The C4 model starts zoomed out at the {{context}} level.',
      distractors: ['deployment', 'code', 'inheritance'],
      explain: 'Each diagram answers a different question. C4’s first level shows just your system and its neighbours, before zooming into containers, components and code.' },

    { type: 'order', prompt: 'Put the C4 zoom levels in order, from widest view to closest.', items: ['Context', 'Containers', 'Components', 'Code'],
      explain: 'Like a map: country, region, town, street. Context first, then the deployable containers, then the components inside one, and code last (and only if you must).' },

    { type: 'scenario', title: 'The whiteboard argument', meters: { clarity: 30, effort: 70 },
      intro: 'Two developers disagree about what happens when a customer cancels an order. One says the API refunds first, the other says it notifies the warehouse first. The argument has gone round in circles for ten minutes.',
      steps: [
        { text: 'What do you do?',
          choices: [
            { label: 'Sketch a quick sequence diagram of the cancel flow on the whiteboard', score: 2, effects: { clarity: 40, effort: -10 }, feedback: 'In five minutes you can see the order of messages and where the two views really differ. The argument becomes about a specific arrow.' },
            { label: 'Draw a class diagram of every class in the codebase first', score: 0, effects: { clarity: 5, effort: -30 }, feedback: 'Structure will not settle a question about order. You have spent an hour and the disagreement is still there.' },
            { label: 'Keep talking until someone gives in', score: 1, effects: { clarity: -10 }, feedback: 'The loudest voice wins, not necessarily the right one, and nothing is left behind for the next person.' }
          ] },
        { text: 'The sketch settles it. Someone wants to turn the whole thing into a polished 40-page UML model in a modelling tool. Your view?',
          choices: [
            { label: 'Photograph the whiteboard and attach it to the ticket or design note', score: 2, effects: { clarity: 15, effort: 20 }, feedback: 'The picture did its job. A saved photo or a small text diagram costs almost nothing to keep.' },
            { label: 'Go ahead: more detail is always better', score: 0, effects: { effort: -35 }, feedback: 'Detail costs maintenance. Forty pages will be out of date within weeks and nobody will trust it.' },
            { label: 'Throw it away; it has served its purpose', score: 1, effects: { clarity: -5, effort: 5 }, feedback: 'Fair for a throwaway sketch, but a lasting decision deserves a note on why, so you do not have the same argument next quarter.' }
          ] }
      ],
      outro: 'Draw to think, keep what is cheap to keep, and match the diagram to the question.' },

    { type: 'explain', prompt: 'A colleague says “UML is outdated, we just use C4 now.” Give a balanced answer.',
      model: 'UML is a big standard with many diagram types, and teams often use too much of it. C4 is a lighter way to show a system at four zoom levels: context, containers, components and code. They are not rivals. Many teams use C4 for the big picture and still draw a UML sequence or class diagram for one tricky area. The key is to draw just enough, keep diagrams small, and label the arrows.',
      keywords: ['sequence', 'class', 'C4', 'zoom', 'enough', 'arrows'] }
  ],

  flashcards: [
    { q: 'What is UML?', a: 'The Unified Modeling Language: a standard set of diagram shapes and arrows for describing software.' },
    { q: 'Class diagram vs sequence diagram?', a: 'A class diagram shows structure (things and relationships). A sequence diagram shows behaviour over time (messages in order).' },
    { q: 'What does a dashed arrow with an open head mean in UML?', a: 'A dependency: one element uses another.' },
    { q: 'What are the four levels of the C4 model?', a: 'Context, containers, components and code, zooming in from the whole system down to classes.' },
    { q: 'Why do diagrams rot, and what helps?', a: 'The code changes but the drawing does not. Keep diagrams small, label them, and prefer ones regenerated from code or stored as text.' }
  ],

  glossary: [
    { term: 'UML', def: 'The Unified Modeling Language: a standard notation of boxes, lines and arrows for sketching software structure and behaviour.', like: 'Sheet music for software.' },
    { term: 'Class diagram', def: 'A diagram of the things (classes) in a system and how they relate, such as inheritance and ownership.', like: 'A family tree plus a parts list.' },
    { term: 'Sequence diagram', def: 'A diagram of messages between parties in the order they happen, with time running downwards.', like: 'A script for a play, listing who speaks when.' },
    { term: 'C4 model', def: 'A simple way to draw architecture at four zoom levels: context, containers, components and code.', like: 'A map you can zoom from country to street.', aka: ['C4'] },
    { term: 'Deployment diagram', def: 'A diagram showing which pieces of software run on which machines or environments.', like: 'A seating plan for your software.' }
  ],

  takeaways: [
    'Diagrams make an invisible system visible so people can discuss it.',
    'Class = structure, sequence = order over time, component/deployment = pieces and where they run.',
    'C4 zooms: context, containers, components, code. Use it with UML, not instead of it.',
    'Draw to think or explain, label every arrow, then stop.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('af-togaf', {
  eli5: 'TOGAF is a big, ready-made recipe for describing how a whole company’s processes, data, applications and technology fit together, and for planning how to improve them in steps.',

  cards: [
    { kind: 'concept', title: 'Nobody knows what we have',
      body: `Picture Bramble Insurance. It has merged with two rivals over ten years. It now owns four customer databases, three billing systems, and an app that nobody dares switch off because "something depends on it". Ask who knows what exists, and you get shrugs.

        A bank or insurer is too big for one person to hold in their head. An **enterprise architecture framework** is a ready-made method for describing the organisation as it is today, deciding what it should look like, and planning the journey. It gives you a common vocabulary and a checklist of what to think about, so you do not reinvent it.` },

    { kind: 'metaphor', title: 'The city planner',
      body: `A building architect designs one building. A **city planner** decides where the roads, power lines, homes and factories go, so that all the buildings fit together and the city can grow.

        Enterprise architecture is the city planner's job for a company. And just as a city planner does not draw every window, an enterprise architect works at the level of districts and main roads: *which systems exist, what each is for, how they connect*.

        The metaphor stops where cities are rarely redesigned from a blank map. Companies are always changing a place people already live in.` },

    { kind: 'layers', title: 'Four kinds of architecture',
      body: '**TOGAF** (The Open Group Architecture Framework) splits the enterprise into four layers, each answering a different question. Lower layers support the ones above.',
      layers: [
        { label: 'Business architecture', note: 'What the organisation does: processes, roles, goals, who does what.', icon: '🏢', tone: 'accent' },
        { label: 'Data architecture', note: 'What information matters and where it lives: customers, policies, claims.', icon: '🗂️' },
        { label: 'Application architecture', note: 'Which software systems exist and how they support the business.', icon: '🧩' },
        { label: 'Technology architecture', note: 'The platforms underneath: servers, cloud, networks, tools.', icon: '🏗️', tone: 'muted' }
      ],
      note: 'Data and application are often grouped together as “information systems architecture”.' },

    { kind: 'steps', title: 'The ADM: a loop, not a line',
      body: 'TOGAF’s heart is the **Architecture Development Method** (ADM), a cycle with several phases. Roughly, in five steps:',
      steps: [
        { title: 'Vision', body: 'Agree what you are trying to achieve, for whom, and what is in scope. Get sponsors on board. (A preliminary phase sets up the architecture practice itself.)' },
        { title: 'Describe today and tomorrow', body: 'For business, data, applications and technology, write down the **baseline** (how things are now) and the **target** (how they should be), then the gaps between them.' },
        { title: 'Opportunities and plan', body: 'Turn the gaps into candidate projects, work out dependencies and order them into a roadmap.' },
        { title: 'Govern the build', body: 'While projects deliver, check that what is built actually follows the architecture, or agree sensible exceptions.' },
        { title: 'Manage change', body: 'The world moves. Watch for changes in business or technology, and when needed, start the loop again. Requirements sit at the centre throughout.' }
      ] },

    { kind: 'example', title: 'The ADM at Bramble Insurance',
      body: `Here is how those steps might look, in one pass:

        | Step | Bramble's version |
        |---|---|
        | Vision | Halve the time to settle a simple claim |
        | Today vs target | Four customer databases now, one customer record in future |
        | Opportunities | Merge customer data first; retire two billing systems later |
        | Governance | New claims tools must use the shared customer record |
        | Change | A new regulation arrives, so revisit the plan |

        Notice the output is mostly **decisions and a roadmap**, not diagrams for their own sake.` },

    { kind: 'compare', title: 'When TOGAF helps, and when it is theatre',
      body: 'Even TOGAF’s own documents say you should tailor it. The disagreement is mostly about whether people do.',
      cols: ['It helps when…', 'It is theatre when…'],
      rows: [
        ['Scale', 'Many systems, teams or business units must line up', 'One product team of ten is filling in templates'],
        ['Purpose', 'It answers a real question, like which systems to retire', 'The documents exist to tick a governance box'],
        ['Size', 'You use the parts you need', 'Every phase and artefact is produced “to be safe”'],
        ['People', 'Architects talk to the business and developers', 'A tower of documents nobody reads'],
        ['Pace', 'Plans are revisited as things change', 'A three-year plan is frozen and ignored']
      ] },

    { kind: 'pitfall', title: 'The shelf-ware trap',
      body: `The most common criticism of enterprise architecture frameworks is that they produce **shelf-ware**: beautiful documents that sit on a shelf while teams get on with real work, unaffected.

        It usually happens when the framework becomes the goal. Months go by describing the current state in great detail, while the business changes underneath you. By the time the target is agreed, it is out of date.

        The antidote is to tie every piece of architecture work to a **decision someone needs to make**, deliver in small useful slices, and ask regularly: who would be worse off if we stopped this?` },

    { kind: 'tip', title: 'Borrow the good bits',
      body: `You do not need a certificate to benefit from TOGAF's ideas. Steal these:

        - **Four lenses**: ask what the business needs, what data it uses, which applications support it and which technology underpins them.
        - **Baseline, target, gap**: always say where we are, where we want to be and what is between.
        - **Roadmap in slices**: order the gaps into projects, rather than one big bang.
        - **Governance with a purpose**: check that projects follow the plan, and allow justified exceptions.

        Full TOGAF is optional. Thinking in these terms is not.` }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'What problem does an enterprise architecture framework mainly try to solve?',
      options: ['A large organisation cannot see or plan how all its systems fit together', 'A single app is too slow to run', 'Developers do not know which programming language to use', 'A team needs a daily meeting format'],
      answer: 0,
      why: [null, 'That is a performance problem. Frameworks work at the level of the whole organisation.', 'Language choice is a design decision inside one team, not what EA frameworks target.', 'Meeting formats belong to Scrum, covered later in this module.'],
      explain: 'Enterprise architecture frameworks give a big organisation a shared way to describe what exists, what it should become, and how to get there.' },

    { type: 'bucket', after: 2, prompt: 'Which TOGAF architecture does each item belong to?', buckets: ['Business', 'Data', 'Application', 'Technology'],
      items: [['The claims-handling process', 0], ['The customer record and its fields', 1], ['The billing system', 2], ['A Kubernetes cluster in the cloud', 3], ['Who approves a large payout', 0], ['The policy database schema', 1], ['The mobile app customers use', 2], ['The network between data centres', 3]],
      explain: 'Business is what the organisation does and who does it. Data is the information. Application is the software that supports the work. Technology is the platform underneath.' },

    { type: 'order', after: 3, prompt: 'Put the ADM steps in order, as described in this lesson.', items: ['Agree the vision', 'Describe baseline and target', 'Plan opportunities into a roadmap', 'Govern the implementation', 'Manage change and loop again'],
      explain: 'You start with why, describe the gap, plan the journey, keep delivery on track, and then re-enter the loop as the world changes.' },

    { type: 'tf', statement: 'The ADM is a one-off straight line: finish the last phase and the architecture work is done for ever.', answer: false,
      explain: 'It is a cycle. Change management feeds back into the vision, because businesses and technology keep moving.' },

    { type: 'match', prompt: 'Match each phrase to what it means in TOGAF thinking.',
      pairs: [['Baseline architecture', 'How things are today'], ['Target architecture', 'How things should look at the end'], ['Gap', 'The difference that projects must close'], ['Roadmap', 'The ordered list of projects to get there'], ['Governance', 'Checking delivery follows the architecture']],
      explain: 'Baseline, target and gap is the backbone of most architecture planning, and a roadmap turns the gaps into ordered projects.' },

    { type: 'cloze', text: 'The cycle at the heart of TOGAF is the Architecture {{Development}} Method, or {{ADM}}. Its four architecture domains are business, data, application and {{technology}}.',
      distractors: ['Design', 'security', 'process'],
      explain: 'The ADM is how TOGAF is applied. Business, data, application and technology are the four lenses it uses.' },

    { type: 'scenario', title: 'The 300-page request', meters: { usefulness: 40, goodwill: 60 },
      intro: 'You join a mid-sized company that has just “adopted TOGAF”. The head of IT asks you to produce full baseline and target architectures for the whole company, before any project can start. Delivery teams are already grumbling.',
      steps: [
        { text: 'How do you respond?',
          choices: [
            { label: 'Produce everything the framework lists, phase by phase, to be safe', score: 0, effects: { usefulness: -20, goodwill: -25 }, feedback: 'Six months later you have a heavy pile of documents, and the business has changed. That is shelf-ware.' },
            { label: 'Propose starting with the one question the business needs answered now and tailoring the framework to that', score: 2, effects: { usefulness: 35, goodwill: 15 }, feedback: 'Tailoring is exactly what TOGAF itself recommends. A small, decision-driven slice earns trust.' },
            { label: 'Refuse to touch TOGAF at all', score: 1, effects: { usefulness: -5, goodwill: -15 }, feedback: 'You may be right about the heavy approach, but a flat refusal ignores the useful ideas and makes you an obstacle.' }
          ] },
        { text: 'The first slice is “which of our three billing systems should we retire?”. What is the best next move?',
          choices: [
            { label: 'Describe the current billing systems and who relies on them, sketch a target, and list the gap as projects', score: 2, effects: { usefulness: 30, goodwill: 15 }, feedback: 'That is baseline, target and gap, focused on a real decision. It is the ADM used with purpose.' },
            { label: 'Catalogue every application in the company first', score: 0, effects: { usefulness: -15, goodwill: -15 }, feedback: 'A full catalogue is a project in itself, and it delays the answer the business actually wanted.' },
            { label: 'Pick the cheapest one and announce it', score: 1, effects: { usefulness: -5, goodwill: -10 }, feedback: 'Quick, but without understanding dependencies you may switch off something important.' }
          ] }
      ],
      outro: 'Use frameworks as a toolbox. Tie each piece of work to a decision.' },

    { type: 'explain', prompt: 'Explain to a developer what TOGAF is, and when it is worth using.',
      model: 'TOGAF is a framework for enterprise architecture. It splits an organisation into business, data, application and technology architectures, and gives a cycle, the ADM, for describing today’s baseline, a target and the gap, then planning and governing the change. It is useful for large organisations with many systems to line up, but it becomes theatre if teams produce documents just to tick boxes. Tailor it and tie it to real decisions.',
      keywords: ['business', 'data', 'application', 'technology', 'ADM', 'baseline', 'target', 'tailor'] }
  ],

  flashcards: [
    { q: 'What is an enterprise architecture framework?', a: 'A ready-made method and vocabulary for describing an organisation as it is, deciding what it should become and planning the journey.' },
    { q: 'What are the four architecture domains in TOGAF?', a: 'Business, data, application and technology architecture.' },
    { q: 'What is the ADM?', a: 'The Architecture Development Method: TOGAF’s repeating cycle from vision through describing, planning and governing change, then back round.' },
    { q: 'Baseline, target and gap?', a: 'Baseline is how things are now, target is how they should be, and the gap is the difference that projects must close.' },
    { q: 'What is the usual criticism of heavy architecture frameworks?', a: 'They produce shelf-ware: large documents that do not change what teams actually build.' }
  ],

  glossary: [
    { term: 'Enterprise architecture', def: 'Describing and planning how an organisation’s processes, data, applications and technology fit together as a whole.', like: 'City planning for a company.', aka: ['EA'] },
    { term: 'TOGAF', def: 'The Open Group Architecture Framework: a widely used enterprise architecture framework built around the ADM cycle.', like: 'A big recipe book you are meant to cook selectively from.' },
    { term: 'ADM', def: 'The Architecture Development Method: the repeating cycle of phases at the centre of TOGAF.', like: 'A home renovation loop: survey, design, plan, build, inspect, repeat.', aka: ['Architecture Development Method'] },
    { term: 'Baseline and target', def: 'The baseline is the architecture as it is today. The target is the one you want. The difference is the gap.', like: 'Where you are on a map, and where you are going.' },
    { term: 'Shelf-ware', def: 'Documents or tools produced with great effort that nobody ends up using.', like: 'A gym membership that never gets used.' }
  ],

  takeaways: [
    'An enterprise architecture framework helps a big organisation describe itself and plan change.',
    'TOGAF: four lenses (business, data, application, technology) and the ADM loop.',
    'Always think baseline, target, gap, then a roadmap in slices.',
    'Tailor it and tie it to decisions, or it becomes shelf-ware.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('af-babok-iaf', {
  eli5: 'BABOK is a handbook for working out what people really need before anyone builds it, and IAF is a consulting firm’s framework for turning that into a coherent architecture.',

  cards: [
    { kind: 'concept', title: 'The report that was not a report',
      body: `A manager asks developers for "a report of last month's sales". Six weeks later they receive a beautiful, accurate spreadsheet. The manager frowns. What she actually wanted was to **see, each morning, which stores were behind target** so she could phone them.

        Nobody lied. The *request* just was not the *need*. Plenty of failed projects deliver exactly what was asked for, and it is still wrong.

        **Business analysis** is the craft of closing that gap: finding out what the business truly needs, and writing it down so everyone shares one understanding.` },

    { kind: 'metaphor', title: 'The detective and the translator',
      body: `A business analyst is part **detective** and part **translator**.

        The detective part: people rarely say what they need. They say what they imagine the solution to be ("add a button"), or describe a symptom ("it's slow"). You ask, observe and dig until you find the actual problem.

        The translator part: the business speaks in goals and rules, developers in systems and data. The analyst turns one into the other, and back again.

        The metaphor stops at blame. A good analyst is not hunting for who is wrong, only for what is true.` },

    { kind: 'steps', title: 'BABOK: six areas of the craft',
      body: 'The **BABOK Guide** (Business Analysis Body of Knowledge) is published by the IIBA, the International Institute of Business Analysis. It describes the work as six knowledge areas. They are not strictly stages; analysts move between them.',
      steps: [
        { title: 'Plan and monitor', body: 'Decide how you will do the analysis work, whom you will involve and how you will know it is going well.' },
        { title: 'Elicit and collaborate', body: '**Elicitation** means drawing information out of people: interviews, workshops, observing real work, surveys, reading documents.' },
        { title: 'Manage the requirements life cycle', body: 'Requirements change. Track where each came from, what depends on it and whether it is still wanted.' },
        { title: 'Analyse strategy', body: 'Understand the current situation, the goal and the sensible way to get there, before choosing a solution.' },
        { title: 'Analyse and design requirements', body: 'Model, prioritise and describe the needs clearly enough that people can build and test them.' },
        { title: 'Evaluate the solution', body: 'After release, check that it actually delivers the value it promised.' }
      ] },

    { kind: 'example', title: 'Asking better questions',
      body: `Here is elicitation in action, back to our manager:

        | She says | The analyst asks | Real need |
        |---|---|---|
        | "A sales report" | "What will you do with it?" | Spot struggling stores quickly |
        | "By Friday" | "What happens if it is Monday?" | A weekly meeting needs it |
        | "Same as the old one" | "What do you never use?" | Half the columns are dead weight |

        The trick is repeated **why** questions, and asking about *outcomes* rather than features. Watching someone do their job for an hour often teaches more than any meeting.` },

    { kind: 'compare', title: 'Who matters: stakeholder analysis',
      body: 'A **stakeholder** is anyone affected by, or able to affect, the project. A common way to sort them is by power and interest, which tells you how much attention each needs.',
      cols: ['Low interest', 'High interest'],
      rows: [
        ['High power', 'Keep satisfied: brief them, never surprise them', 'Manage closely: involve them in decisions'],
        ['Low power', 'Monitor: little effort, but check in', 'Keep informed: they will be the real users']
      ],
      note: 'The people with low power and high interest are often the daily users. Ignore them at your peril.' },

    { kind: 'concept', title: 'IAF: another way to organise the thinking',
      body: `You met TOGAF in the last lesson. **IAF**, the Integrated Architecture Framework, is a different framework, created by the consultancy Capgemini and used mainly in its own projects.

        Like TOGAF, it looks at an organisation through several lenses. Roughly, it covers the **business**, the **information** it needs, the **information systems** that handle it, and the **technology infrastructure** underneath. Governance and security run across all of them.

        IAF also moves from abstract to concrete: *why* the business wants something, *what* it needs, *how* it will work, and finally *what it is built from*. That path is its main idea.`,
      note: 'Frameworks differ in detail. If you meet IAF in a real job, read the current official material rather than trusting a summary like this.' },

    { kind: 'compare', title: 'How architects actually use them',
      body: 'No one follows these frameworks like a recipe. They are libraries of ideas and checklists.',
      cols: ['Mostly about', 'An architect borrows…'],
      rows: [
        ['BABOK', 'Finding and managing what the business needs', 'Elicitation techniques, stakeholder analysis, traceability'],
        ['IAF', 'Moving from business need to architecture, in layers', 'The why, what, how path, and the cross-cutting security view'],
        ['TOGAF', 'Planning change across a whole enterprise', 'Baseline, target and gap, plus a roadmap']
      ] },

    { kind: 'pitfall', title: 'Requirements that are secretly solutions',
      body: `Listen out for requirements that are really **solutions in disguise**:

        - "The system must store orders in a NoSQL database."
        - "Add a dropdown with the 50 countries."

        Maybe those are right, maybe not. The real need, such as "orders must be retrievable in under 100 milliseconds", has not been stated, so nobody can judge other options.

        It is also a trap to take the loudest stakeholder's wishes as everyone's. The person who pays and the person who clicks are often different people, and their needs may clash.` },

    { kind: 'tip', title: 'Keep a thread from need to decision',
      body: `A habit worth stealing from BABOK is **traceability**: for every important decision, you can say which need it serves.

        "We chose a message queue because the warehouse must not lose orders during an outage." That one sentence keeps you honest, helps when requirements change, and lets you drop work that serves nothing.

        Cheap ways to do it: a column in your backlog for "why", or a link from each architecture decision record to the requirement behind it.` }
  ],

  activities: [
    { type: 'mcq', after: 0, q: 'The manager asked for “a sales report” but needed to spot struggling stores each morning. What went wrong?',
      options: ['The request described a solution, and nobody explored the underlying need', 'The developers were not skilled enough to build a report', 'The manager should have written a longer specification', 'The report was built using the wrong database'],
      answer: 0,
      why: [null, 'The report was built correctly. It was the wrong thing.', 'A longer document of the wrong thing is still the wrong thing.', 'The technology was never the problem.'],
      explain: 'People often ask for a solution rather than state a need. Business analysis exists to find the need behind the request.' },

    { type: 'match', after: 4, prompt: 'Match each stakeholder to how you would handle them.',
      pairs: [['The CFO, who funds it but is busy', 'High power, low interest: keep satisfied'], ['The sponsor who joins every meeting', 'High power, high interest: manage closely'], ['Warehouse staff who will use it daily', 'Low power, high interest: keep informed'], ['A department only slightly affected', 'Low power, low interest: monitor']],
      explain: 'Power and interest decide how often, and how deeply, you involve someone. The daily users are the group people most often forget.' },

    { type: 'tf', statement: 'The six BABOK knowledge areas are a strict waterfall: you must finish one before starting the next.', answer: false,
      explain: 'Analysts move between them as the work needs. Requirements change, so even managing the requirements life cycle continues alongside elicitation.' },

    { type: 'bucket', prompt: 'Is each of these a need or a solution in disguise?', buckets: ['Real need', 'Solution in disguise'],
      items: [['Customers must be able to pay without creating an account', 0], ['Add a Pay with Fruitpay button', 1], ['Support staff must find any order in under ten seconds', 0], ['Put all orders in a MongoDB collection', 1], ['The report must work on a phone', 0], ['Use a dropdown with 50 countries', 1]],
      explain: 'A need says what must be true. A solution says how someone imagines achieving it. Keeping the need visible lets you choose a better solution later.' },

    { type: 'short', q: 'To get from a requested feature to the real need, ask this one-word question again and again.', accept: ['why'], hint: 'Five times is a famous rule of thumb.',
      explain: 'Repeated “why” questions peel a request back to its purpose. “Why do you need the report?” leads to “so I can phone struggling stores”.' },

    { type: 'order', prompt: 'Put this analyst workflow in a sensible order.', items: ['Identify the stakeholders', 'Elicit needs through interviews and observation', 'Analyse and prioritise the requirements', 'Describe them so they can be built and tested', 'Evaluate the delivered solution'],
      explain: 'You first find out who matters, then draw out what they need, make sense of it, write it down clearly and finally check the result delivered the value.' },

    { type: 'scenario', title: 'Add a button', meters: { understanding: 30, trust: 60 },
      intro: 'A sales director sends you a message: “Please add an Export to Excel button to the dashboard. Urgent.” You are the architect on the project.',
      steps: [
        { text: 'What is your first move?',
          choices: [
            { label: 'Add the button; the director knows what they want', score: 0, effects: { understanding: -5, trust: 5 }, feedback: 'Fast, but you have built a solution without learning the need. Next week there will be a request to change the columns.' },
            { label: 'Ask what they will do with the exported file and how often', score: 2, effects: { understanding: 40, trust: 10 }, feedback: 'You learn the director pastes it into a monthly slide. Maybe a scheduled summary email would serve better.' },
            { label: 'Say no until a full requirements document is written', score: 1, effects: { understanding: 5, trust: -30 }, feedback: 'You are right that you need to know more, but a refusal and a form is a poor way to learn it.' }
          ] },
        { text: 'You learn that three other teams also copy the dashboard into spreadsheets, each differently. What now?',
          choices: [
            { label: 'Talk to those teams too, since they are stakeholders with the same need', score: 2, effects: { understanding: 35, trust: 15 }, feedback: 'A pattern emerges: everyone wants a regular summary by email. One feature serves four teams.' },
            { label: 'Build four separate exports to keep everyone happy', score: 0, effects: { understanding: -5, trust: -5 }, feedback: 'You have multiplied the work and still not asked what anyone really needs.' },
            { label: 'Note it down and just build the first request', score: 1, effects: { understanding: 5 }, feedback: 'Safe, but you spotted a pattern and let it go to waste.' }
          ] }
      ],
      outro: 'Ask about the outcome, widen to every stakeholder who shares it, and then pick the solution.' },

    { type: 'explain', prompt: 'Explain what BABOK and IAF are and how an architect might use them, without treating either as a rulebook.',
      model: 'BABOK is the Business Analysis Body of Knowledge from the IIBA. It describes how to find out what a business really needs, through elicitation, stakeholder analysis, and managing requirements. IAF is Capgemini’s Integrated Architecture Framework, which looks at business, information, information systems and technology and moves from why to what to how. An architect borrows techniques, such as asking why and tracing decisions back to needs, rather than following either as a recipe.',
      keywords: ['BABOK', 'IAF', 'elicitation', 'stakeholder', 'needs', 'traceability', 'borrow'] }
  ],

  flashcards: [
    { q: 'What is BABOK?', a: 'The Business Analysis Body of Knowledge, published by the IIBA: a guide to finding out, analysing and managing what the business needs.' },
    { q: 'What is elicitation?', a: 'Drawing information out of stakeholders through interviews, workshops, observation, surveys and documents.' },
    { q: 'What is a stakeholder?', a: 'Anyone affected by the project or able to influence it, from sponsors to daily users.' },
    { q: 'What is IAF?', a: 'Capgemini’s Integrated Architecture Framework, covering business, information, information systems and technology, from why through to how.' },
    { q: 'Why can a requirement be a solution in disguise?', a: 'It states how someone imagines the answer (a button, a database) instead of what must be true, which hides better options.' }
  ],

  glossary: [
    { term: 'Business analysis', def: 'The practice of working out what a business really needs and describing it clearly so a solution can be built.', like: 'A detective and translator for requirements.' },
    { term: 'BABOK', def: 'The IIBA’s Business Analysis Body of Knowledge, which sets out the techniques and areas of the business analyst’s craft.', like: 'A professional handbook, like a cookbook for analysis.' },
    { term: 'Elicitation', def: 'Actively drawing out needs and facts from stakeholders, rather than waiting for them to volunteer them.', like: 'Coaxing the real story out in an interview.' },
    { term: 'Stakeholder', def: 'Any person or group who is affected by a project or can influence it.', like: 'Everyone with a seat at, or near, the table.' },
    { term: 'IAF', def: 'The Integrated Architecture Framework from Capgemini, which structures architecture work across business, information, information systems and technology.', like: 'A consultancy’s house recipe for architecture.', aka: ['Integrated Architecture Framework'] }
  ],

  takeaways: [
    'A request is not a need. Ask why until you reach the outcome.',
    'BABOK is the business analyst’s handbook: elicit, analyse, manage, evaluate.',
    'Sort stakeholders by power and interest, and never forget the daily users.',
    'IAF and TOGAF are libraries of ideas to borrow from, not recipes to follow.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('af-agile-scrum', {
  eli5: 'Agile means building a little, showing it to real people, learning, and adjusting, over and over, instead of planning everything up front. Scrum is the most popular recipe for doing that in short bursts called sprints.',

  cards: [
    { kind: 'concept', title: 'Eighteen months to build the wrong thing',
      body: `In the old way of running software projects, you wrote a huge specification, signed it off in January, and disappeared for eighteen months. Then you delivered. And the customer said: "Ah. That is not quite what we need now."

        Of course it was not. The world had moved, and nobody had seen the product until the end. All the risk was saved for the final day.

        In 2001, seventeen software people met in Utah and wrote a short statement of what they had learnt works better. It became the **Agile Manifesto**. The core idea: *deliver small, learn quickly, and change course while it is still cheap.*` },

    { kind: 'metaphor', title: 'Sat nav versus printed map',
      body: `Waterfall planning is a **printed map**: study the whole route at home, then drive without looking up. If there is a road closure, you find out when you reach it.

        Agile is a **sat nav**: you know the destination, but it only plans the next few turns, and it recalculates every time something changes.

        The metaphor breaks down in one way. A sat nav knows the destination for certain. In agile projects the destination itself often changes, which is exactly why frequent feedback matters.` },

    { kind: 'compare', title: 'The Manifesto in plain English',
      body: 'The Manifesto has four value statements. It adds that the items on the right still matter; it just prefers the left.',
      cols: ['We value more', 'Over'],
      rows: [
        ['Talk to people', 'Individuals and interactions', 'Processes and tools'],
        ['Show it working', 'Working software', 'Comprehensive documentation'],
        ['Work with the customer', 'Customer collaboration', 'Contract negotiation'],
        ['Adapt', 'Responding to change', 'Following a plan']
      ],
      note: 'It does not say “no documentation” or “no plans”. It says what to favour when you must choose.' },

    { kind: 'diagram', title: 'One sprint, start to finish',
      body: '**Scrum** is a lightweight framework built on these ideas. Work happens in **sprints**: fixed-length bursts, one month or less, often two weeks.',
      nodes: [
        { id: 'pb', label: 'Product Backlog', icon: '📋', x: 1, y: 0, tone: 'accent' },
        { id: 'sp', label: 'Sprint Planning', x: 1, y: 1 },
        { id: 'sb', label: 'Sprint Backlog', x: 1, y: 2 },
        { id: 'ds', label: 'Daily Scrum', icon: '☕', x: 2, y: 2, tone: 'info' },
        { id: 'inc', label: 'Increment', icon: '📦', x: 1, y: 3, tone: 'good' },
        { id: 'rv', label: 'Review + Retro', x: 1, y: 4 }
      ],
      edges: [
        { from: 'pb', to: 'sp', label: 'top items' },
        { from: 'sp', to: 'sb', label: 'sprint goal' },
        { from: 'sb', to: 'ds', label: 'daily', dashed: true, both: true },
        { from: 'sb', to: 'inc', label: 'build' },
        { from: 'inc', to: 'rv' },
        { from: 'rv', to: 'pb', label: 'learn, reorder', dashed: true }
      ],
      caption: 'Each sprint ends with something usable, then the loop restarts with what you learnt.' },

    { kind: 'compare', title: 'Three roles, no boss',
      body: 'Scrum has exactly three accountabilities, all part of one team.',
      cols: ['Product Owner', 'Scrum Master', 'Developers'],
      rows: [
        ['Focus', 'What to build and why', 'How the team works', 'Building a usable increment'],
        ['Owns', 'The product backlog and its order', 'Scrum being understood and used', 'The sprint plan and the quality of the work'],
        ['Common mistake', 'Being a proxy who never talks to users', 'Becoming a meeting-booker or team manager', 'Waiting to be told what to do']
      ],
      note: '“Developers” means everyone who builds: programmers, testers, designers. Not only coders.' },

    { kind: 'concept', title: 'Backlogs, events and the Definition of Done',
      body: `Scrum has three **artefacts** (things you can look at):

        - **Product Backlog**: the ordered to-do list for the whole product, always changing.
        - **Sprint Backlog**: what the team has chosen for this sprint, plus its plan.
        - **Increment**: the usable result, which must meet the **Definition of Done**, the team's shared checklist (tested, reviewed, deployable).

        And five **events**: the Sprint itself, **Sprint Planning**, the 15-minute **Daily Scrum**, the **Sprint Review** (show the work, get feedback) and the **Sprint Retrospective** (improve how you work).` },

    { kind: 'code', title: 'A backlog item: the user story',
      body: 'Backlog items are often written as **user stories**, short and from the user’s point of view. Tap the lines.',
      code: { lang: 'text', src: `
        Story: Reset my password
        As a customer who forgot my password,
        I want to get a reset link by email,
        so that I can get back into my account.

        Acceptance criteria:
        - Link expires after 30 minutes
        - Same message shown whether or not the email exists`,
        notes: {
          2: '**Who** is asking. It keeps the story about a person, not a table.',
          3: '**What** they want, not how to build it.',
          4: '**Why**. The reason lets the team find a better way if one exists.',
          7: 'Acceptance criteria say when the story counts as done. They can become tests.',
          8: 'A security detail written as a testable fact.'
        } } },

    { kind: 'pitfall', title: 'Scrum in name only',
      body: `Teams often follow the ceremonies and miss the point. Look for:

        - **Mini-waterfall**: design in week one, build in week two, test at the end. Nothing is truly finished until late.
        - **The Daily Scrum as a status report** to a manager, rather than a planning chat among the people doing the work.
        - **Sprint goals nobody remembers**, or a backlog that is a graveyard of 400 stale items.
        - **No retrospective actions**: the same complaints every fortnight.

        Scrum is deliberately incomplete. It tells you the loop, not how to build well.` },

    { kind: 'concept', title: 'Where does architecture fit?',
      body: `Some people hear "agile" and conclude "no architecture". That is a misreading. Agile just says **do not decide everything on day one**.

        Architects in agile teams do something like this: choose only the decisions that are expensive to reverse (data store, rough service boundaries, security model), keep the rest open until the [[last responsible moment|last responsible moment]], and check the design against real working software every sprint.

        Architecture becomes a **continuous activity**, in the team, expressed in code and short decision records, not a document handed down from a tower.` },

    { kind: 'tip', title: 'Practical architecture in sprints',
      body: `Three habits that work:

        - **Walking skeleton**: in the first sprint, build the thinnest slice through every layer (screen, API, database, deploy). It proves the shape works.
        - **Spikes**: a short, timed experiment to answer a question ("can this library handle our volume?") before committing.
        - **Make it visible**: put architecture work in the backlog, including paying down technical debt, and explain its value in business terms.

        A fair debate remains about how much upfront design is right. Different teams, and different risks, justify different answers.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'Which statement best matches the Agile Manifesto?',
      options: ['Working software and collaboration are favoured, though documents and plans still have value', 'Documentation and planning should be abandoned entirely', 'Contracts matter more than talking to the customer', 'Processes and tools matter more than the people using them'],
      answer: 0,
      why: [null, 'The Manifesto says the items on the right still have value. It only prefers the left.', 'It values customer collaboration over contract negotiation, not the other way round.', 'It values individuals and interactions over processes and tools.'],
      explain: 'The Manifesto is about preference when you must choose, not about banning plans or documents.' },

    { type: 'order', after: 3, prompt: 'Put these Scrum events in the order they usually appear in a sprint.', items: ['Sprint Planning', 'Daily Scrum', 'Sprint Review', 'Sprint Retrospective'],
      explain: 'You plan, work with a short daily check-in, show the result to stakeholders in the review, and finally reflect on how you worked in the retrospective.' },

    { type: 'match', after: 5, prompt: 'Match each Scrum item to what it is.',
      pairs: [['Product Backlog', 'The ordered list of everything wanted in the product'], ['Sprint Backlog', 'The items chosen for this sprint, plus the plan'], ['Increment', 'The usable result that meets the Definition of Done'], ['Sprint Retrospective', 'The event for improving how the team works'], ['Sprint Review', 'The event for showing the work and gathering feedback']],
      explain: 'Artefacts are lists and results you can inspect. Events are the regular meetings that inspect them and adapt.' },

    { type: 'bucket', prompt: 'Which Scrum role is mainly responsible?', buckets: ['Product Owner', 'Scrum Master', 'Developers'],
      items: [['Ordering the product backlog', 0], ['Helping the team follow Scrum and removing obstacles', 1], ['Building and testing the increment', 2], ['Deciding which problem is most valuable to solve', 0], ['Coaching the team on improving its practice', 1], ['Planning how to deliver the sprint goal', 2]],
      explain: 'The Product Owner owns the what and why. The Scrum Master owns how well the team works. Developers own the how of building it.' },

    { type: 'tf', statement: 'In Scrum, the Daily Scrum is a status meeting where the team reports to the Scrum Master.', answer: false,
      explain: 'It is a short planning conversation by and for the developers, to coordinate the next day’s work towards the sprint goal.' },

    { type: 'spot', prompt: 'This backlog item is not written well. Tap the line that goes wrong.',
      code: { lang: 'text', src: `
        Story: Order history
        As a customer,
        I want a new MongoDB collection called orders_v2,
        so that I can see my past orders.` },
      lines: [3],
      explain: 'A story should say what the user wants, not prescribe the implementation. “I want to see my past orders” leaves the team free to choose the best storage.' },

    { type: 'cloze', text: 'A Scrum {{sprint}} is a fixed-length period of one month or less. At the end, the team shows its work at the Sprint {{Review}} and reflects at the {{Retrospective}}.',
      distractors: ['Planning', 'Backlog', 'Increment'],
      explain: 'Review inspects the product with stakeholders. Retrospective inspects the team’s own way of working.' },

    { type: 'scenario', title: 'No architecture in agile?', meters: { risk: 60, momentum: 40 },
      intro: 'A new team is about to start sprint one on a banking app. A developer says: “We are agile, so no upfront design. We will just start coding.” Another asks you, the architect, for a three-month design document.',
      steps: [
        { text: 'What do you propose?',
          choices: [
            { label: 'Decide only the costly-to-reverse things now, then build a walking skeleton in sprint one', score: 2, effects: { risk: -25, momentum: 25 }, feedback: 'You settle data storage, security and rough boundaries and prove them with the thinnest end-to-end slice. Risk falls and the team keeps moving.' },
            { label: 'Write the full design document first', score: 0, effects: { risk: -5, momentum: -30 }, feedback: 'Three months without feedback. By the time you finish, you will have guessed many things wrong.' },
            { label: 'Start coding and see what happens', score: 1, effects: { risk: 20, momentum: 15 }, feedback: 'Quick start, but expensive decisions get made by accident, and rework can arrive in month four.' }
          ] },
        { text: 'In sprint three, nobody knows whether the chosen search library can handle the expected data volume. What next?',
          choices: [
            { label: 'Time-boxed spike: a two-day experiment with realistic data', score: 2, effects: { risk: -20, momentum: 10 }, feedback: 'A spike answers the question cheaply and gives evidence for the decision.' },
            { label: 'Debate it until the next retrospective', score: 0, effects: { risk: 10, momentum: -20 }, feedback: 'Opinions are not data. The team stalls and the risk stays.' },
            { label: 'Assume it will be fine and carry on', score: 1, effects: { risk: 20, momentum: 10 }, feedback: 'Optimistic. If wrong, you find out when users do.' }
          ] }
      ],
      outro: 'Agile does not remove architecture. It moves it into small, continuous, evidence-led decisions.' },

    { type: 'explain', prompt: 'Explain Scrum to a friend, including how an architect fits into an agile team.',
      model: 'Scrum is a framework based on the Agile Manifesto. A team works in short sprints, choosing items from an ordered product backlog, and ending each sprint with a usable increment that meets the Definition of Done. The roles are Product Owner, Scrum Master and Developers. Events include planning, daily scrum, review and retrospective. Architects stay in the team, decide only costly-to-reverse things early, and test the design with real software, for example with a walking skeleton and spikes.',
      keywords: ['sprint', 'backlog', 'Product Owner', 'Scrum Master', 'increment', 'retrospective', 'walking skeleton'] }
  ],

  flashcards: [
    { q: 'What are the four values of the Agile Manifesto?', a: 'Individuals and interactions, working software, customer collaboration and responding to change, over processes and tools, documentation, contracts and plans.' },
    { q: 'What are the three Scrum roles?', a: 'Product Owner (what and why), Scrum Master (how the team works) and Developers (building the increment).' },
    { q: 'What are the five Scrum events?', a: 'The Sprint, Sprint Planning, Daily Scrum, Sprint Review and Sprint Retrospective.' },
    { q: 'What are the Scrum artefacts?', a: 'The Product Backlog, the Sprint Backlog and the Increment.' },
    { q: 'What is a walking skeleton?', a: 'The thinnest possible slice through every layer of the system, built early to prove the architecture works end to end.' },
    { q: 'What is a spike?', a: 'A short, time-boxed experiment that answers a technical question before the team commits.' }
  ],

  glossary: [
    { term: 'Agile', def: 'An approach to building software in small steps with frequent feedback, so plans can change as you learn.', like: 'A sat nav that keeps recalculating.' },
    { term: 'Sprint', def: 'A fixed-length period, of one month or less, in which a Scrum team builds a usable increment.', like: 'A short race with a clear finish line.' },
    { term: 'Product backlog', def: 'The ordered list of everything that might be needed in the product, owned by the Product Owner.', like: 'A shared to-do list, with the most important at the top.' },
    { term: 'Definition of Done', def: 'The team’s shared checklist for when a piece of work counts as finished, such as tested, reviewed and deployable.', like: 'The oven timer and skewer test for a cake.' },
    { term: 'Retrospective', def: 'A regular team meeting to look at how it works and agree one or two improvements.', like: 'A pit stop between laps.', aka: ['retro'] }
  ],

  takeaways: [
    'Agile: deliver small, get feedback, change course while it is cheap.',
    'Scrum is a loop of sprints with three roles, five events and three artefacts.',
    'A story says what and why, not how.',
    'Architecture in agile is continuous: decide the costly things early, test with working software.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('af-kanban-xp', {
  eli5: 'Kanban means putting all your work on a visible board and refusing to start new things until old ones finish. Extreme Programming means doing good habits like testing and pair-working so often that they become the default.',

  cards: [
    { kind: 'concept', title: 'Thirty orders, nothing on a plate',
      body: `Imagine a busy restaurant kitchen. Orders pour in. The chefs, keen to help, start every dish at once: thirty pans on the go, ten half-made. Nothing is finished, everything is going cold, and the first customers have been waiting forty minutes.

        The fix is not to cook faster. It is to **start less and finish more**: cap the number of dishes being cooked at once, and only start a new one when a plate leaves.

        That is the heart of **Kanban**. The word is Japanese for roughly "signboard" or "card", and the idea was inspired by how Toyota ran its factory floors.` },

    { kind: 'diagram', title: 'A Kanban board',
      body: 'Work is made visible as cards moving left to right through columns. Each busy column has a **limit**, shown here in brackets.',
      nodes: [
        { id: 'todo', label: 'To do', x: 0, y: 0, tone: 'muted' },
        { id: 'doing', label: 'Doing (max 2)', x: 1, y: 0, tone: 'accent' },
        { id: 'review', label: 'Review (max 2)', x: 2, y: 0, tone: 'warn' },
        { id: 'done', label: 'Done', x: 3, y: 0, tone: 'good' },
        { id: 't1', label: 'Fix login bug', x: 1, y: 1 },
        { id: 't2', label: 'Add invoice PDF', x: 1, y: 2 },
        { id: 't3', label: 'Update API docs', x: 2, y: 1 },
        { id: 't4', label: 'Upgrade library', x: 2, y: 2 },
        { id: 't5', label: 'Reset email', x: 3, y: 1 }
      ],
      edges: [
        { from: 'todo', to: 'doing', label: 'pull' },
        { from: 'doing', to: 'review' },
        { from: 'review', to: 'done' }
      ],
      caption: 'Review is full, so nobody can finish a new item in Doing until someone clears a review. The board shows the bottleneck.' },

    { kind: 'metaphor', title: 'The motorway and its traffic lights',
      body: `On a busy motorway, cars cannot go faster by squeezing more of them on. Beyond a certain density everyone slows down, and a single brake light can cause a jam miles back.

        That is why some slip roads have **traffic lights that let on one car at a time**. Fewer cars in, a smoother flow, and a faster journey for everyone.

        A **WIP limit** (work in progress limit) is the traffic light on your team's board. It feels like you are holding people back. In practice, the whole stream of work gets there sooner.

        The metaphor stops at one point: unlike cars, people can help each other past a jam.` },

    { kind: 'concept', title: 'Pull, flow and limits',
      body: `Three ideas make Kanban work:

        - **Visualise**: put every piece of work on a board everyone can see, so hidden queues show up.
        - **Limit WIP**: each column holds a maximum number of cards. Full means *stop starting, start helping*.
        - **Pull**: nobody pushes work onto you. You take the next card when you have room.

        The result is **flow**: work moving steadily from idea to done, instead of piling up in the middle. Unlike Scrum there are no fixed sprints. Cards are finished and released whenever they are ready.` },

    { kind: 'concept', title: 'Lead time, cycle time and Little’s Law',
      body: `Two clocks matter:

        - **Lead time**: from the moment someone asks for something until it is delivered. The customer's clock.
        - **Cycle time**: from the moment you *start* work on it until it is done. The team's clock.

        A pleasing rule called **Little's Law** links them: *average cycle time = work in progress ÷ throughput*.

        If a team has 12 items in progress and finishes 4 a week, an item takes on average 12 ÷ 4 = **3 weeks**. Cut the WIP to 6 and, with the same throughput, it drops to **1.5 weeks**. You get faster without anyone typing quicker.`,
      note: 'Little’s Law holds for stable systems on average, not for any single card.' },

    { kind: 'compare', title: 'Extreme Programming: good habits turned up',
      body: '**Extreme Programming** (XP), created by Kent Beck, asks: if a practice is good, why not do it all the time? Several of these you have met already.',
      cols: ['What you do', 'Why it helps'],
      rows: [
        ['Pair programming', 'Two people, one keyboard, swapping roles', 'Live code review and shared knowledge'],
        ['Test-driven development', 'Write a failing test, then the code', 'Safety net, and a design that is easy to test'],
        ['Continuous integration', 'Merge to the main branch many times a day', 'Conflicts and bugs surface within hours'],
        ['Refactoring', 'Constantly tidy code without changing behaviour', 'The design stays easy to change'],
        ['Small releases', 'Ship tiny increments often', 'Fast feedback and low risk per release']
      ],
      note: 'XP also has simple design, collective code ownership and a sustainable working pace.' },

    { kind: 'concept', title: 'Pairing: two heads, one keyboard',
      body: `Pair programming sounds wasteful: two salaries, one pair of hands. So why do teams do it?

        One person is the **driver** (typing), the other the **navigator** (thinking ahead, spotting typos, asking "what if the list is empty?"). They swap every so often.

        What you get is code reviewed as it is written, knowledge spread so no one is the only person who understands a module, and fewer bugs reaching later stages. Teams also use **mob programming**, where the whole team gathers around one screen.

        Research is mixed on raw speed. Many teams value it most for onboarding and tricky problems.` },

    { kind: 'compare', title: 'Scrum or Kanban?',
      body: 'Neither is better in general. They suit different kinds of work.',
      cols: ['Scrum', 'Kanban'],
      rows: [
        ['Rhythm', 'Fixed-length sprints', 'Continuous flow'],
        ['Roles', 'Product Owner, Scrum Master, Developers', 'None required'],
        ['Limits', 'Sprint scope is the limit', 'WIP limit per column'],
        ['Changes mid-way', 'Usually wait for the next sprint', 'Allowed whenever there is room'],
        ['Fits well', 'Building a product with goals and demos', 'Support, operations, a steady stream of requests']
      ],
      note: 'Many teams blend them. “Scrumban” is Scrum events with a Kanban board and WIP limits.' },

    { kind: 'pitfall', title: 'A board without limits is just a wall of sticky notes',
      body: `The most common failure: a gorgeous board with columns and colours, and **no WIP limits**. Every column swells, cards sit for weeks, and the board becomes a record of chaos rather than a tool for fixing it.

        Another is breaking the limit "just this once". The limit exists to hurt a little. When it hurts, the pain points at the real bottleneck, like slow reviews or a team of one tester.

        And with XP, beware cargo cult: pairing eight hours a day on trivial work can exhaust people. The practices serve the goal of fast, safe change.` },

    { kind: 'tip', title: 'Start from what you do now',
      body: `Moving to Kanban does not need a revolution. A common route:

        1. Draw your *current* process as columns.
        2. Put every item on the board.
        3. Set WIP limits at slightly *below* the current typical load.
        4. Watch where cards pile up, and fix that.

        When choosing between Scrum and Kanban, ask what sort of work you do. Predictable product goals with demos suit Scrum. A stream of unpredictable requests suits Kanban.

        In the lab that follows, you will run a board with and without WIP limits and watch how cycle time changes.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'Why does limiting work in progress usually make a team deliver faster?',
      options: ['Less multitasking and fewer queues mean work flows through sooner', 'People type faster when they have fewer tasks', 'It lets managers see who is working hardest', 'It reduces the total amount of work the business wants'],
      answer: 0,
      why: [null, 'The speed of typing is unchanged. What changes is waiting time and switching.', 'Visualising work is not about ranking people, and WIP limits are not a surveillance tool.', 'The amount of demand stays the same. You are changing how you work through it.'],
      explain: 'Starting less and finishing more cuts waiting time between steps and the cost of context switching, so each item reaches done sooner.' },

    { type: 'estimate', after: 4, q: 'A team has 12 items in progress and finishes about 4 per week. Using Little’s Law, roughly how long does an item take from start to finish, on average?', answer: 3, unit: 'weeks', tolerance: 1.4, min: 0.5, max: 30,
      explain: 'Cycle time = WIP ÷ throughput = 12 ÷ 4 = 3 weeks. Halve the WIP to 6 and, at the same throughput, it falls to 1.5 weeks.' },

    { type: 'match', after: 5, prompt: 'Match each XP practice with its benefit.',
      pairs: [['Pair programming', 'Code reviewed as it is written'], ['Test-driven development', 'A safety net before the code exists'], ['Continuous integration', 'Merge problems found within hours'], ['Refactoring', 'The design stays easy to change'], ['Small releases', 'Quick feedback, low risk per release']],
      explain: 'Each practice shortens a feedback loop: review, testing, integration, design or release.' },

    { type: 'tf', statement: 'Lead time starts when the team begins coding, and cycle time starts when the customer first asks.', answer: false,
      explain: 'It is the other way round. Lead time begins at the request (the customer’s view). Cycle time begins when work starts (the team’s view).' },

    { type: 'bucket', prompt: 'Which approach does each description fit better?', buckets: ['Scrum', 'Kanban'],
      items: [['Fixed two-week iterations with a sprint goal', 0], ['A WIP limit on each column', 1], ['Ideal for a support team with unpredictable requests', 1], ['Roles include Product Owner and Scrum Master', 0], ['New work can enter whenever there is capacity', 1], ['Ends each cycle with a review and retrospective', 0]],
      explain: 'Scrum is built on timeboxed sprints and defined roles. Kanban is about continuous flow limited by WIP.' },

    { type: 'short', q: 'What is the practice of restructuring code to improve its design without changing what it does?', accept: ['refactoring', 'refactor'], hint: 'Starts with “re-”.',
      explain: 'Refactoring keeps behaviour the same while making the code easier to understand and change. Tests make it safe.' },

    { type: 'cloze', text: 'The customer’s clock is the {{lead}} time. The team’s clock is the {{cycle}} time. A column that is full is a signal to {{stop}} starting and help finish.',
      distractors: ['start', 'queue', 'wait'],
      explain: 'Lead time covers waiting plus work. Cycle time covers only the active work. A full column means help move things along rather than pull more in.' },

    { type: 'scenario', title: 'The jammed review column', meters: { flow: 35, morale: 60 },
      intro: 'Your team’s board has a limit of 3 in Review. It is full. Two developers are free, and a manager tells them to “just start something new so people look busy”.',
      steps: [
        { text: 'What should the free developers do?',
          choices: [
            { label: 'Help review the waiting items and clear the jam', score: 2, effects: { flow: 35, morale: 10 }, feedback: 'The bottleneck is at review, so effort there speeds up everything. Cards leave the board.' },
            { label: 'Start new work anyway; being idle is wasteful', score: 0, effects: { flow: -25, morale: -5 }, feedback: 'You now have even more half-finished work and the review queue grows. Everything slows.' },
            { label: 'Raise the Review limit to 6 so work can proceed', score: 1, effects: { flow: -10 }, feedback: 'This hides the bottleneck rather than fixing it. Lead time grows quietly.' }
          ] },
        { text: 'This happens again every week. What is the smart longer-term move?',
          choices: [
            { label: 'Investigate why reviews are slow, for example pairing so code is reviewed as written', score: 2, effects: { flow: 25, morale: 15 }, feedback: 'Pairing is XP’s answer: review becomes continuous rather than a queue at the end.' },
            { label: 'Ask the manager to hire more developers', score: 0, effects: { flow: -5, morale: -5 }, feedback: 'More people feeding a blocked review stage just makes the pile bigger.' },
            { label: 'Remove WIP limits as they keep causing trouble', score: 0, effects: { flow: -25, morale: -10 }, feedback: 'The limits were doing their job, pointing straight at the problem.' }
          ] }
      ],
      outro: 'WIP limits make bottlenecks visible. The answer is to fix the flow, not to hide it.' },

    { type: 'explain', prompt: 'Explain Kanban and XP to a friend, then say how you would choose between Scrum and Kanban for a team.',
      model: 'Kanban makes work visible on a board, limits work in progress and lets team members pull the next item when they have room, which smooths flow and cuts cycle time. Little’s Law links cycle time to WIP divided by throughput. XP turns good practices up: pair programming, TDD, continuous integration, refactoring and small releases. Scrum suits goal-driven product work in sprints. Kanban suits a steady stream of unpredictable requests, such as support. Blends are common.',
      keywords: ['board', 'WIP', 'pull', 'flow', 'cycle time', 'pairing', 'refactoring', 'Scrum'] }
  ],

  flashcards: [
    { q: 'What is a WIP limit and why use one?', a: 'A cap on how many items can be in a column at once. It stops overload, exposes bottlenecks and gets work finished sooner.' },
    { q: 'Lead time vs cycle time?', a: 'Lead time runs from the request until delivery. Cycle time runs from when work starts until it is done.' },
    { q: 'State Little’s Law.', a: 'Average cycle time = work in progress ÷ throughput.' },
    { q: 'Name five Extreme Programming practices.', a: 'Pair programming, test-driven development, continuous integration, refactoring and small releases.' },
    { q: 'When does Kanban suit better than Scrum?', a: 'For a steady stream of unpredictable requests, like support or operations, where continuous flow beats fixed sprints.' }
  ],

  glossary: [
    { term: 'Kanban', def: 'A method that visualises work on a board, limits work in progress and lets people pull new work when they have room.', like: 'A restaurant kitchen that only starts a dish when a plate leaves.' },
    { term: 'WIP limit', def: 'The maximum number of items allowed in a stage of the process at one time.', like: 'Traffic lights on a motorway slip road.', aka: ['work in progress limit'] },
    { term: 'Cycle time', def: 'How long an item takes from the moment work starts on it until it is done.', like: 'The time a dish spends on the stove.' },
    { term: 'Lead time', def: 'How long an item takes from the moment it is requested until it is delivered.', like: 'The time from ordering until the food lands on your table.' },
    { term: 'Extreme Programming', def: 'An agile approach that takes good engineering practices such as pairing, TDD, continuous integration and refactoring to an extreme.', like: 'Turning every good habit up to eleven.', aka: ['XP'] }
  ],

  takeaways: [
    'Start less, finish more: visualise work and limit work in progress.',
    'Cycle time = WIP ÷ throughput, so lower WIP means faster delivery.',
    'XP shortens feedback loops: pairing, TDD, CI, refactoring, small releases.',
    'Pick Scrum or Kanban by the kind of work. Blends are fine.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('af-scaled-agile', {
  eli5: 'When one product needs dozens of teams, they step on each other’s toes. LeSS and SAFe are two different ways of keeping many agile teams pointing the same way.',

  cards: [
    { kind: 'concept', title: 'Six teams, one product',
      body: `A small agile team of seven people can fit round a table. Now picture an online bank with six teams working on one app. Team A changes the payments service. Team B, unaware, changes the customer record it relies on. Team C needs both finished by March for a launch. Who decides which matters most? Who checks that everything works together before release?

        With one team, Scrum answers these questions informally. With **many teams on one product**, the questions become the main problem. **Scaling frameworks** exist to answer them.` },

    { kind: 'metaphor', title: 'One band or a festival?',
      body: `A rock band of five needs no conductor. They look at each other and play.

        An orchestra of eighty needs sheet music, sections, a conductor and a rehearsal schedule, or it sounds like a car park.

        Scaling frameworks are different ideas about how to run the big orchestra. One says: **keep it as close to a band as possible**, with fewer sections and one shared score. The other says: **add structure**, with section leaders, a calendar and a rulebook.

        The metaphor stops at the music. In software, you can also reduce the *number* of players by splitting the piece.` },

    { kind: 'diagram', title: 'Why teams collide',
      body: 'Most scaling pain is about **dependencies**: teams that cannot finish without someone else.',
      nodes: [
        { id: 'a', label: 'Team A: Payments', x: 0, y: 0, tone: 'accent' },
        { id: 'b', label: 'Team B: Accounts', x: 1, y: 0, tone: 'accent' },
        { id: 'c', label: 'Team C: Mobile app', x: 2, y: 0, tone: 'accent' },
        { id: 'db', label: 'Shared customer table', icon: '🗄️', x: 1, y: 1, tone: 'warn' },
        { id: 'rel', label: 'One monthly release', icon: '🚂', x: 1, y: 2, tone: 'bad' }
      ],
      edges: [
        { from: 'a', to: 'db', label: 'changes' },
        { from: 'b', to: 'db', label: 'changes' },
        { from: 'c', to: 'db', label: 'reads', dashed: true },
        { from: 'db', to: 'rel', label: 'must line up' }
      ],
      caption: 'A shared table and a shared release mean three “independent” teams are secretly one team that argues.' },

    { kind: 'concept', title: 'LeSS: Scrum, with as little added as possible',
      body: `**LeSS** (Large-Scale Scrum), created by Craig Larman and Bas Vodde, takes a firm view: do not add layers, remove them.

        - **One Product Backlog** and **one Product Owner** for the whole product, however many teams there are.
        - Every team works in the **same sprint** and delivers into **one shippable increment**.
        - **Joint planning and review** across teams, with representatives from each.
        - Teams are **feature teams**: each can build a whole feature through every layer, rather than being "the database team".

        Its slogan is roughly "more with less". For very large products there is a bigger version, LeSS Huge, which groups teams into requirement areas.` },

    { kind: 'diagram', title: 'LeSS in one picture',
      body: 'Many teams, but one backlog, one priority list and one product.',
      nodes: [
        { id: 'po', label: 'One Product Owner', icon: '🧭', x: 1, y: 0, tone: 'accent' },
        { id: 'pb', label: 'One Product Backlog', x: 1, y: 1, tone: 'accent' },
        { id: 't1', label: 'Team 1', x: 0, y: 2 },
        { id: 't2', label: 'Team 2', x: 1, y: 2 },
        { id: 't3', label: 'Team 3', x: 2, y: 2 },
        { id: 'inc', label: 'One shippable increment', icon: '📦', x: 1, y: 3, tone: 'good' }
      ],
      edges: [
        { from: 'po', to: 'pb' },
        { from: 'pb', to: 't1' }, { from: 'pb', to: 't2' }, { from: 'pb', to: 't3' },
        { from: 't1', to: 'inc' }, { from: 't2', to: 'inc' }, { from: 't3', to: 'inc' }
      ] },

    { kind: 'layers', title: 'SAFe: layers of coordination',
      body: 'The **Scaled Agile Framework** (SAFe) is the most widely adopted scaling framework, especially in large enterprises. It adds layers, roughly like this (names vary between versions):',
      layers: [
        { label: 'Portfolio', note: 'Which big initiatives get funded, and how the money follows strategy.', icon: '🏦', tone: 'accent' },
        { label: 'Large solution', note: 'For huge products built by several release trains, often with suppliers.', icon: '🏗️' },
        { label: 'Essential / programme', note: 'Teams grouped into an **Agile Release Train**, the heartbeat of SAFe.', icon: '🚂', tone: 'good' },
        { label: 'Team', note: 'Ordinary agile teams, using Scrum or Kanban.', icon: '👥' }
      ],
      note: 'SAFe is regularly revised, so check the current official material for exact names.' },

    { kind: 'concept', title: 'The release train and PI planning',
      body: `An **Agile Release Train** is a team of teams, often 50 to 125 people, that plans and ships together on a shared rhythm.

        Every eight to twelve weeks, the whole train gathers for **PI Planning** (a PI is a Program Increment). Everyone, including business owners, agrees the next increment's goals, maps the dependencies between teams and commits together.

        New roles appear: a **Release Train Engineer** who keeps the train running, **Product Management**, and a **System Architect** who guides technical direction. SAFe also talks about an **architectural runway**: enough technical groundwork in place for upcoming features.` },

    { kind: 'compare', title: 'LeSS and SAFe side by side',
      body: 'Both exist because real organisations ask for them. They disagree about what to do.',
      cols: ['LeSS', 'SAFe'],
      rows: [
        ['Instinct', 'Remove complexity, keep to Scrum', 'Add structure to coordinate'],
        ['Size of the rulebook', 'Small', 'Large, with many roles and events'],
        ['Roles', 'Few new roles; teams stay generalist', 'Several new roles and layers'],
        ['What it asks of you', 'Reshape the organisation', 'Fit in with existing structure'],
        ['Common criticism', 'Hard to adopt; needs deep change', 'Heavy, top-down and “waterfall in disguise”']
      ] },

    { kind: 'pitfall', title: 'The criticisms, fairly',
      body: `SAFe's critics say it is **too prescriptive and top-heavy**, a recipe that can recreate command-and-control and plan-driven habits under agile names, and that it feeds a certification industry. Some argue it contradicts the Manifesto's preference for people over process.

        Its defenders reply that large, regulated organisations need coordination, and SAFe gives them a map they can adopt without a revolution.

        LeSS is criticised from the other side: it works best when you are willing to **reorganise around products**, and that is hard.

        Honest answer: both can work, both can be misapplied. Experts disagree.` },

    { kind: 'tip', title: 'Before you scale, shrink the dependency',
      body: `The best scaling move is often not a framework but **fewer dependencies**.

        - Split the product along **boundaries teams can own** end to end. Conway's Law says systems mirror the communication structure of the organisation that builds them, so design the teams and the architecture together.
        - Give each team its own data, and talk through **well-defined interfaces**.
        - Start with one working team before multiplying it.

        When a framework helps, pick the lightest one that solves your actual coordination problem, and adapt it.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'In the diagram, three teams all change or depend on the same table and release together. What is the real problem?',
      options: ['Hidden dependencies make the teams not truly independent', 'The teams are too small', 'The database is too slow', 'They need to hold more meetings'],
      answer: 0,
      why: [null, 'Size is not the issue. The coupling is.', 'Nothing in the picture is about speed.', 'More meetings treat the symptom and add cost.'],
      explain: 'Shared data and a shared release tie the teams together. Scaling frameworks, and good architecture, aim to manage or remove dependencies like this.' },

    { type: 'tf', after: 4, statement: 'In LeSS, each team has its own Product Owner and its own product backlog.', answer: false,
      explain: 'LeSS keeps one Product Owner and one Product Backlog for the whole product, however many teams work on it.' },

    { type: 'match', after: 6, prompt: 'Match each SAFe term to what it means.',
      pairs: [['Agile Release Train', 'A team of teams that plans and ships together'], ['PI Planning', 'The gathering where everyone plans the next increment'], ['Release Train Engineer', 'Keeps the train running smoothly'], ['Architectural runway', 'Technical groundwork ready for upcoming features'], ['Portfolio level', 'Where big initiatives are chosen and funded']],
      explain: 'These terms describe the extra coordination SAFe adds above the single team.' },

    { type: 'bucket', prompt: 'Which framework does each statement describe best?', buckets: ['LeSS', 'SAFe'],
      items: [['One product backlog for all teams', 0], ['Agile Release Trains with PI Planning every 8–12 weeks', 1], ['Slogan: more with less', 0], ['Portfolio, large solution, essential and team levels', 1], ['Feature teams that build across all layers', 0], ['Criticised as heavy and top-down', 1]],
      explain: 'LeSS tries to stay minimal and close to Scrum. SAFe adds layers and roles to coordinate larger organisations.' },

    { type: 'cloze', text: 'LeSS keeps a single {{Product Owner}} for many teams. SAFe groups teams into an Agile {{Release}} {{Train}} that plans together at PI Planning.',
      distractors: ['Scrum Master', 'Portfolio', 'Sprint'],
      explain: 'One owner and backlog are the signature of LeSS, while the release train and its shared planning are the signature of SAFe.' },

    { type: 'multi', q: 'Which of these are criticisms commonly made of SAFe?',
      options: ['It can be too prescriptive and heavy', 'It can recreate top-down, plan-driven habits', 'It feeds a certification industry', 'It forbids teams from using Scrum', 'It has no way to plan across teams'],
      answers: [0, 1, 2],
      explain: 'Critics point to weight, top-down habits and certification. SAFe lets teams use Scrum or Kanban, and cross-team planning is one of its main features.' },

    { type: 'scenario', title: 'Eight teams and a launch date', meters: { alignment: 30, agility: 50 },
      intro: 'You are an architect at a 600-person insurer. Eight teams build one policy platform, and releases keep slipping because teams wait on each other. Leadership asks: “Which scaling framework should we buy?”',
      steps: [
        { text: 'What do you do first?',
          choices: [
            { label: 'Map the dependencies between teams and find where they are blocked', score: 2, effects: { alignment: 30, agility: 15 }, feedback: 'You find three teams share one data model and a manual release. That is the real problem, and no framework would have fixed it alone.' },
            { label: 'Adopt the biggest framework available for safety', score: 0, effects: { alignment: 10, agility: -25 }, feedback: 'You add roles, events and paperwork on top of the same tangled dependencies.' },
            { label: 'Tell each team to “be more agile” and sort it out', score: 1, effects: { alignment: -10, agility: 10 }, feedback: 'Autonomy is good, but without a way to coordinate, the clashes just continue.' }
          ] },
        { text: 'The dependency map shows a clear need for cross-team planning and an agreed rhythm. What is a sensible next step?',
          choices: [
            { label: 'Pilot a joint planning event and one shared backlog on the most entangled teams, then adjust', score: 2, effects: { alignment: 30, agility: 15 }, feedback: 'You borrow from either framework as needed, test it on a small scale and keep what helps.' },
            { label: 'Roll out the full framework to all eight teams at once', score: 1, effects: { alignment: 15, agility: -15 }, feedback: 'Plausible in a big organisation, but a large change with no pilot is a big bet.' },
            { label: 'Do nothing; frameworks are fads', score: 0, effects: { alignment: -15, agility: -5 }, feedback: 'The coordination problem is real. Ignoring it does not make it smaller.' }
          ] }
      ],
      outro: 'Diagnose the dependencies first, choose the lightest structure that helps, and pilot before you roll out.' },

    { type: 'explain', prompt: 'Compare LeSS and SAFe in your own words, and give a fair criticism of each.',
      model: 'Both coordinate many agile teams on one product. LeSS keeps Scrum and adds as little as possible: one product backlog, one Product Owner, shared sprints and feature teams. SAFe adds layers, roles and an Agile Release Train with PI Planning, which suits big organisations needing structure. SAFe is criticised as heavy and top-down. LeSS is criticised as hard to adopt, because it needs deep organisational change.',
      keywords: ['LeSS', 'SAFe', 'one backlog', 'release train', 'PI Planning', 'heavy', 'dependencies'] }
  ],

  flashcards: [
    { q: 'What is the main challenge of scaling agile?', a: 'Coordinating priorities, dependencies and integration when many teams work on one product.' },
    { q: 'What is LeSS?', a: 'Large-Scale Scrum: Scrum for many teams with one product backlog, one Product Owner, shared sprints and as few extras as possible.' },
    { q: 'What is SAFe?', a: 'The Scaled Agile Framework: a structured approach adding layers (team, programme, large solution, portfolio), roles and the Agile Release Train.' },
    { q: 'What is an Agile Release Train?', a: 'A team of teams, often 50 to 125 people, that plans and delivers together on a shared cadence.' },
    { q: 'What is the usual criticism of SAFe, and of LeSS?', a: 'SAFe is called heavy and top-down. LeSS is called hard to adopt because it requires deep organisational change.' },
    { q: 'What does Conway’s Law say?', a: 'Systems tend to mirror the communication structure of the organisation that builds them.' }
  ],

  glossary: [
    { term: 'Scaling framework', def: 'A set of practices for coordinating many agile teams that work on one product or portfolio.', like: 'The rules for running an orchestra rather than a band.' },
    { term: 'LeSS', def: 'Large-Scale Scrum: a framework that scales Scrum with one backlog and one Product Owner across many teams.', like: 'A big band, still reading one score.', aka: ['Large-Scale Scrum'] },
    { term: 'SAFe', def: 'The Scaled Agile Framework: a layered framework with release trains, shared planning and defined roles for large organisations.', like: 'A conductor, section leaders and a calendar.', aka: ['Scaled Agile Framework'] },
    { term: 'Agile Release Train', def: 'In SAFe, a long-lived group of teams that plans, builds and delivers together on a regular rhythm.', like: 'A train timetable that every carriage follows.', aka: ['ART'] },
    { term: 'Feature team', def: 'A team able to build a whole feature across every layer of the system, rather than owning just one layer.', like: 'A kitchen crew that cooks a whole dish, not just the sauce.' }
  ],

  takeaways: [
    'Scaling is mostly about dependencies between teams, not team size.',
    'LeSS: one backlog, one Product Owner, as little extra as possible.',
    'SAFe: layers, release trains and PI Planning. Useful structure, or heavy, depending on who you ask.',
    'First reduce dependencies, then pick the lightest framework that helps.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('af-classic-pm', {
  eli5: 'Big organisations run projects and IT services with long-standing rulebooks, such as PMBOK, PRINCE2, RUP and ITIL. You do not have to love them, but you will have to understand them.',

  cards: [
    { kind: 'concept', title: 'Alphabet soup on your first day',
      body: `You join a large bank as an architect. In your first week you hear: "This is a PRINCE2 project." "Raise it with the change board." "Our project managers are PMP certified." "We follow ITIL for incidents."

        None of it is about code, and all of it affects you. These are the **classic management frameworks**, built for a world where a project costs millions, many suppliers are involved, and someone senior must be able to say *"stop, this is no longer worth it"*.

        Agile methods grew partly as a reaction to them. But the older ideas are far from dead, and you will often meet both in the same company.` },

    { kind: 'metaphor', title: 'Building a bridge',
      body: `Think about building a bridge. You cannot ship the first lane, see how drivers feel, and then redesign the foundations. Plans are signed off, money is released in stages, and an inspector checks each stage before the next begins.

        That is the world these frameworks grew up in: **predictable, planned, controlled**. They shine where changing your mind is very expensive and where rules, audits and contracts matter.

        The metaphor stops at software. Software is cheaper to change than concrete, which is why many teams now blend these ideas with agile approaches.` },

    { kind: 'steps', title: 'PMI and the PMBOK Guide',
      body: 'The **Project Management Institute** (PMI) publishes the **PMBOK Guide** (Project Management Body of Knowledge), and runs the well-known PMP certification. Older editions organise a project into five process groups:',
      steps: [
        { title: 'Initiating', body: 'Define the project at a high level, get authority to start and identify stakeholders.' },
        { title: 'Planning', body: 'Work out scope, schedule, cost, risks and how you will measure progress.' },
        { title: 'Executing', body: 'Do the work, coordinate people and deliver.' },
        { title: 'Monitoring and controlling', body: 'Compare reality against the plan, manage changes and correct course.' },
        { title: 'Closing', body: 'Hand over, confirm acceptance, release the team and capture lessons.' }
      ] },

    { kind: 'concept', title: 'Scope, time, cost: the project’s balancing act',
      body: `PMBOK also lists **knowledge areas** to manage across those groups, such as scope, schedule, cost, quality, risk, communications and stakeholders.

        The classic picture is a triangle: **scope** (what you build), **time** (when) and **cost** (how much). Squeeze one and another gives way. Want more features by the same date? That costs more. Same budget and date? Cut scope.

        As an architect, this is the language your project manager speaks, so translating "we need a message queue" into scope, schedule and risk makes you easier to hear.

        Recent editions of the guide have moved towards principles and tailoring, and acknowledge agile and hybrid approaches.` },

    { kind: 'diagram', title: 'PRINCE2: stages with gates',
      body: '**PRINCE2** (PRojects IN Controlled Environments) began as a UK government standard and is popular across Europe and beyond. Its signature idea is **management by stages**: the project is cut into stages, and at each boundary a senior **Project Board** decides whether to carry on.',
      nodes: [
        { id: 's', label: 'Start up and initiate', icon: '🚦', x: 1, y: 0 },
        { id: 'b1', label: 'Business case ok?', icon: '🔎', x: 1, y: 1, tone: 'warn' },
        { id: 's1', label: 'Stage 1: deliver', x: 1, y: 2, tone: 'accent' },
        { id: 'b2', label: 'Board: continue?', icon: '🔎', x: 1, y: 3, tone: 'warn' },
        { id: 's2', label: 'Stage 2: deliver', x: 1, y: 4, tone: 'accent' },
        { id: 'c', label: 'Close the project', icon: '🏁', x: 1, y: 5, tone: 'good' }
      ],
      edges: [{ from: 's', to: 'b1' }, { from: 'b1', to: 's1', label: 'yes' }, { from: 's1', to: 'b2' }, { from: 'b2', to: 's2', label: 'yes' }, { from: 's2', to: 'c' }],
      caption: 'At every gate the board can also say stop. A project that no longer makes business sense should end.' },

    { kind: 'concept', title: 'What else PRINCE2 insists on',
      body: `PRINCE2 is built from **principles**, **themes** and **processes**. Two principles matter most for an architect:

        - **Continued business justification**: there must always be a valid business case. If the benefits stop outweighing the costs, you stop.
        - **Manage by exception**: the board sets tolerances for time, cost and scope. The project manager only escalates when it looks like they will be breached.

        It also names roles such as the **Project Board** and **Project Manager**, and wants **lessons recorded** as you go. Many organisations tailor it and run agile delivery inside its stages.` },

    { kind: 'steps', title: 'RUP: iterative, with a plan',
      body: 'The **Rational Unified Process** (RUP) came from Rational Software, later part of IBM. It is **iterative**: you cycle through analysis, design, build and test several times. It also has four overall phases, and it is **architecture-centric**, which is why architects like it.',
      steps: [
        { title: 'Inception', body: 'Agree the scope and business case, identify the main risks. A go/no-go moment.' },
        { title: 'Elaboration', body: 'Tackle the riskiest parts and produce a working **architecture baseline** that proves the approach.' },
        { title: 'Construction', body: 'Build out the rest of the system in iterations.' },
        { title: 'Transition', body: 'Hand over to users: beta testing, training, deployment.' }
      ] },

    { kind: 'compare', title: 'ITIL: running IT as a service',
      body: '**ITIL** (formerly the IT Infrastructure Library) is about **IT service management**: running the systems that already exist so that the business gets what it expects. Three of its everyday ideas:',
      cols: ['Incident', 'Problem', 'Change'],
      rows: [
        ['Goal', 'Restore service fast', 'Find and fix the root cause', 'Alter things safely'],
        ['Example', 'The site is down: roll back now', 'Why does it fall over every Friday?', 'Deploy a new version or database'],
        ['Metaphor', 'Mopping the flood', 'Fixing the leaking pipe', 'Planning the new plumbing']
      ],
      note: 'ITIL also covers the service desk, service levels, and many more practices. Newer versions describe them as a “service value system”.' },

    { kind: 'compare', title: 'What an architect needs from each',
      body: 'You rarely follow a framework to the letter. You take what helps you do your job.',
      cols: ['Take this', 'Watch out for'],
      rows: [
        ['PMBOK', 'Scope, schedule, cost and risk language', 'Plans treated as promises'],
        ['PRINCE2', 'Business case and stage gates: ideal moments to raise architecture risks', 'Paperwork replacing decisions'],
        ['RUP', 'Proving the architecture early, in Elaboration', 'Heavyweight tailoring'],
        ['ITIL', 'Operability: incidents, problems and change approval', 'Slow change boards blocking small releases']
      ] },

    { kind: 'pitfall', title: 'Method as religion, and “water-scrum-fall”',
      body: `Two traps:

        **Following the method instead of the goal.** A stage gate that exists to check the business case turns into a form-filling ritual. Ask "what decision does this document support?"

        **Water-scrum-fall.** Management plans and signs off everything up front (waterfall), developers run sprints (Scrum) in the middle, and a separate team does a big-bang release at the end (waterfall again). It gets neither the predictability of the old approach nor the feedback of the new.

        Frameworks are tools. A good architect asks which parts serve this project.` },

    { kind: 'tip', title: 'Speak their language',
      body: `When you meet one of these frameworks, do three things:

        1. **Find the decision points** (stage gates, change boards, phase ends). That is where you raise risk and get decisions.
        2. **Translate** your architecture into business case, scope, cost, risk and operability.
        3. **Ask what is tailored.** Most organisations run a hybrid, such as PRINCE2 governance with agile delivery.

        You do not need certificates in all four. You need to know what each is for and where it touches your work.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'Which is NOT one of the five process groups in older PMBOK editions?',
      options: ['Refactoring', 'Planning', 'Executing', 'Closing'],
      answer: 0,
      why: [null, 'Planning is the second process group.', 'Executing is the third.', 'Closing is the last.'],
      explain: 'The process groups are initiating, planning, executing, monitoring and controlling, and closing. Refactoring is a code practice from XP.' },

    { type: 'bucket', after: 7, prompt: 'Incident, problem or change?', buckets: ['Incident', 'Problem', 'Change'],
      items: [['The checkout is down right now; roll back the release', 0], ['Why does the server run out of memory every Friday?', 1], ['Upgrade the production database to a new version', 2], ['Customers cannot log in; restore service quickly', 0], ['Investigate the root cause of repeated outages', 1], ['Approve and schedule a firewall rule update', 2]],
      explain: 'An incident is about restoring service quickly. A problem is the root cause behind repeated incidents. A change is a deliberate alteration to the live environment.' },

    { type: 'tf', after: 4, statement: 'In PRINCE2, once a project has started, the Project Board never reconsiders whether it is still worthwhile.', answer: false,
      explain: 'At each stage boundary the board decides whether to continue. “Continued business justification” is one of the principles.' },

    { type: 'match', prompt: 'Match each framework to its best-known idea.',
      pairs: [['PMBOK', 'Process groups and knowledge areas for project management'], ['PRINCE2', 'Management by stages with a Project Board'], ['RUP', 'Four phases with an architecture baseline in Elaboration'], ['ITIL', 'Service management: incidents, problems and change'], ['PMP', 'A certification run by PMI']],
      explain: 'PMBOK and PRINCE2 are about managing projects. RUP is a software process. ITIL is about running services once they exist.' },

    { type: 'order', prompt: 'Put the four RUP phases in order.', items: ['Inception', 'Elaboration', 'Construction', 'Transition'],
      explain: 'You agree scope and risks, prove the architecture on the riskiest parts, build the rest, and then hand over to users.' },

    { type: 'cloze', text: 'In PRINCE2 the {{Project Board}} decides at each stage boundary whether to continue. In ITIL, an {{incident}} is about restoring service, while a {{problem}} is about the root cause.',
      distractors: ['change', 'sprint', 'backlog'],
      explain: 'Stage gates give senior people a regular chance to stop or continue. ITIL separates quick restoration from root-cause work.' },

    { type: 'scenario', title: 'The change board says Thursday', meters: { risk: 50, speed: 50, goodwill: 50 },
      intro: 'Your team has a small, well-tested fix. In your company, every production change needs approval from an ITIL-style change board that meets on Thursdays. It is Monday, and the bug costs the business money daily.',
      steps: [
        { text: 'What is your best move?',
          choices: [
            { label: 'Talk to the change manager about a fast route for a low-risk, pre-approved change', score: 2, effects: { risk: -10, speed: 25, goodwill: 15 }, feedback: 'Many ITIL setups have standard or emergency routes. Using them properly respects the process and the urgency.' },
            { label: 'Deploy the fix tonight without telling anyone', score: 0, effects: { risk: 30, speed: 20, goodwill: -35 }, feedback: 'It might work, but you bypassed a control that exists to protect production. Trust is hard to rebuild.' },
            { label: 'Wait until Thursday; rules are rules', score: 1, effects: { risk: 0, speed: -20, goodwill: 5 }, feedback: 'Safe, though it costs three days of damage. You did not even ask whether a faster route exists.' }
          ] },
        { text: 'A month later, small releases keep queueing at that board. What is a sensible long-term step?',
          choices: [
            { label: 'Propose automated checks and pre-approved standard changes for low-risk releases', score: 2, effects: { risk: -10, speed: 25, goodwill: 15 }, feedback: 'You keep the intent of the control, reduce risk through automation, and unblock the team.' },
            { label: 'Argue that ITIL is outdated and should be scrapped', score: 0, effects: { goodwill: -30 }, feedback: 'You will win no allies. The goals of the process are legitimate. The mechanics are the problem.' },
            { label: 'Batch all work into a big release for Thursday', score: 1, effects: { risk: 20, speed: -5 }, feedback: 'Fewer approvals, but larger releases are riskier and harder to roll back.' }
          ] }
      ],
      outro: 'Work with the intent of the process, and improve its mechanics with evidence.' },

    { type: 'explain', prompt: 'You are asked what PMBOK, PRINCE2, RUP and ITIL are, and what an architect should take from them. Answer briefly.',
      model: 'PMBOK is PMI’s body of knowledge for project management, built around process groups and areas like scope, schedule, cost and risk. PRINCE2 manages by stages with a Project Board and a continuing business case. RUP is an iterative software process with an architecture baseline in the Elaboration phase. ITIL is about running IT services, including incidents, problems and change. An architect takes their vocabulary, finds the decision points to raise risks, and works with their intent rather than against it.',
      keywords: ['PMBOK', 'PRINCE2', 'RUP', 'ITIL', 'stages', 'business case', 'incident', 'change'] }
  ],

  flashcards: [
    { q: 'What are PMI and the PMBOK Guide?', a: 'PMI is the Project Management Institute. PMBOK is its body of knowledge for project management, with process groups and knowledge areas.' },
    { q: 'What is PRINCE2’s signature idea?', a: 'Management by stages: a Project Board decides at each boundary whether the project is still worth continuing.' },
    { q: 'What are the four RUP phases?', a: 'Inception, Elaboration, Construction and Transition.' },
    { q: 'Incident vs problem vs change in ITIL?', a: 'Incident: restore service. Problem: find the root cause. Change: alter the live environment in a controlled way.' },
    { q: 'What is “water-scrum-fall”?', a: 'Waterfall planning and release wrapped around agile development in the middle, so the organisation gets the benefits of neither.' }
  ],

  glossary: [
    { term: 'PMBOK', def: 'The Project Management Body of Knowledge, published by PMI, describing project management processes and knowledge areas.', like: 'A big reference handbook for project managers.' },
    { term: 'PRINCE2', def: 'A project management method built on principles, themes and processes, with work divided into stages and a board that approves each stage.', like: 'A bridge build with an inspection before each phase.', aka: ['PRojects IN Controlled Environments'] },
    { term: 'RUP', def: 'The Rational Unified Process: an iterative software development process with four phases and an emphasis on architecture and risk.', like: 'Phased building with a surveyed foundation first.', aka: ['Rational Unified Process'] },
    { term: 'ITIL', def: 'A set of practices for IT service management: running, supporting and changing services that already exist.', like: 'The facilities team keeping the building running.' },
    { term: 'Stage gate', def: 'A decision point where senior people review progress and the business case, then approve, change or stop the project.', like: 'A checkpoint on a long walk: carry on, adjust or turn back.' }
  ],

  takeaways: [
    'PMBOK and PRINCE2 manage projects: scope, time, cost, risk, and decision gates.',
    'RUP is iterative with an architecture-first mindset. ITIL runs live services.',
    'Find the decision points and translate your architecture into business terms.',
    'Take what serves the project. Beware method as ritual and water-scrum-fall.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('af-tools', {
  eli5: 'A team’s tools are its shared memory and its way of talking. Git keeps the code, Slack keeps the conversation, Trello and Jira keep the to-do lists, and Confluence keeps the notes.',

  cards: [
    { kind: 'concept', title: 'Where did we decide that?',
      body: `A new developer joins your team and asks a simple question: "Why do we use a queue between orders and billing?"

        The honest answer: someone said it in a call six months ago; part of it is in a Slack thread; there is an old wiki page; and the main person who knew has left.

        Tools are not magic, but they decide whether a team has **a shared memory** or a lot of people with private ones. For an architect, choosing and using them well is part of the job, because your decisions only help if people can find and trust them.` },

    { kind: 'metaphor', title: 'The shed full of tools',
      body: `Everyone has a shed with a brilliant drill nobody can find, three half-working torches and a bag of screws labelled "misc".

        Team tooling goes the same way. Each tool was a good idea at the time. Ten tools later, nobody knows whether the truth lives in the tracker, the wiki or the chat.

        A tidy workshop has **a place for each kind of thing**, and everyone agrees what that place is. The metaphor stops at storage: a shed does not need to be kept up to date, but a wiki does.` },

    { kind: 'layers', title: 'The toolbox by purpose',
      body: 'Names change, but the jobs stay the same. Most teams need one answer for each:',
      layers: [
        { label: 'Knowledge', note: 'Confluence, a wiki, or Markdown docs in the repo: why things are as they are.', icon: '📚', tone: 'accent' },
        { label: 'Work tracking', note: 'Trello for simple boards, Jira for richer workflows: what is being done, by whom.', icon: '📋' },
        { label: 'Conversation', note: 'Slack or similar: quick questions, announcements, social glue.', icon: '💬' },
        { label: 'Code and history', note: 'Git and GitHub: every change, who made it, and why.', icon: '🌿', tone: 'good' }
      ],
      note: 'Jira and Confluence are both made by Atlassian and link neatly together. Trello is also an Atlassian product.' },

    { kind: 'code', title: 'Everything as code in Git',
      body: 'More and more teams keep not just code but **documents, diagrams and decisions** in the same Git repository. Tap the lines.',
      code: { lang: 'text', src: `
        orders-service/
          src/                  <- the application
          infra/main.tf         <- infrastructure
          docs/adr/0007-use-queue.md
          docs/architecture.md

        # docs/architecture.md (diagram as text)
        flowchart LR
          Web --> API
          API --> Queue
          Queue --> Billing`,
        notes: {
          3: 'Infrastructure written as code (you met this in the delivery module), so changes get reviewed like any other.',
          4: 'A short **decision record** that explains why we use a queue. It travels with the code.',
          5: 'Plain Markdown is diff-able, searchable and easy to review.',
          8: 'A diagram written as text. Many tools can draw it, GitHub among them, and a pull request shows what changed.'
        } } },

    { kind: 'sequence', title: 'A pull request',
      body: 'On GitHub, changes are proposed through a **pull request**. The same flow works for a code change, an ADR or a diagram.',
      actors: ['Developer', 'GitHub', 'Reviewer', 'CI'],
      steps: [
        { from: 0, to: 1, label: 'push branch, open PR', note: 'The change lives on its own branch, so main is untouched.' },
        { from: 1, to: 3, label: 'run checks', note: 'An automated pipeline runs tests and linters.' },
        { from: 3, to: 1, label: 'green / red', dashed: true, note: 'The result is shown right on the pull request.' },
        { from: 2, to: 1, label: 'comments, approve', note: 'A colleague reads the diff and discusses it in the open.' },
        { from: 0, to: 1, label: 'fix, push again', note: 'The discussion stays attached to the change.' },
        { from: 1, to: 1, label: 'merge to main', note: 'Once approved and green, it joins the main branch. The history records who, what and why.' }
      ] },

    { kind: 'concept', title: 'Slack and the art of asynchronous work',
      body: `**Slack** and similar chat tools replaced a lot of email. They work best when you treat them as **asynchronous**: people answer when they can, not instantly.

        Habits that help:

        - Write a **complete message**: not "hi", but "hi, could you check the invoice PR today? It blocks the release."
        - Use **channels** for topics and **threads** for replies, so a conversation stays together.
        - **Do not decide in chat and leave it there.** Copy the decision into the ticket, the ADR or the wiki, because chat is a river and finding something old is painful.

        Async work respects focus, and it helps teams in different time zones.` },

    { kind: 'compare', title: 'Trello versus Jira and Confluence',
      body: 'A simple board and a configurable tracker are both fine. The question is which your team needs.',
      cols: ['Trello', 'Jira + Confluence'],
      rows: [
        ['Feels like', 'A wall of sticky notes', 'A structured work system'],
        ['Strength', 'Easy to start, anyone can use it', 'Workflows, sprints, reports, links between issues'],
        ['Cost of use', 'Very low: little to configure', 'Higher: someone has to set up and maintain it'],
        ['Documents', 'Short notes on cards', 'Confluence pages for longer writing'],
        ['Fits', 'Small teams and simple flows', 'Larger organisations, audits, many teams']
      ] },

    { kind: 'pitfall', title: 'Tool sprawl and ticket theatre',
      body: `Watch for three things:

        - **Sprawl**: the same fact lives in four tools, and each is half right.
        - **Ticket theatre**: Jira turns into a place where people spend more time updating tickets than doing work, usually because workflows were configured for management reports rather than for the team.
        - **Slack as a database**: important decisions buried in a thread that nobody can find by next quarter.

        A tool configured to please everyone ends up pleasing nobody. Configure for the people who must use it daily.` },

    { kind: 'tip', title: 'Choose tools the team will actually use',
      body: `Features rarely decide whether a tool succeeds. **Habit** does. Before adopting or changing a tool, ask:

        - Will the people who use it every day **want** to use it?
        - Can the team **find** things quickly?
        - Does it join up with the tools we already have?
        - Do we have **one home** for each kind of information, written down somewhere?

        Start small, try it with one team, and be willing to simplify. A modest board that is always up to date beats a perfect system that is not.` }
  ],

  activities: [
    { type: 'bucket', after: 2, prompt: 'Which kind of tool would you reach for?', buckets: ['Code & history', 'Conversation', 'Work tracking', 'Knowledge'],
      items: [['Who changed this line, and why?', 0], ['Quick question about a failing test', 1], ['What is in this sprint?', 2], ['Why did we choose a queue between orders and billing?', 3], ['Announce that the deploy is finished', 1], ['A board showing tasks moving from To do to Done', 2], ['Architecture decisions that new joiners should read', 3]],
      explain: 'Git records the history of changes, chat is for fast conversation, trackers show the work, and a wiki or docs folder keeps the reasons that last.' },

    { type: 'order', after: 4, prompt: 'Put the steps of a pull request in order.', items: ['Developer pushes a branch and opens the pull request', 'Automated checks run', 'A reviewer reads the diff and comments', 'Developer fixes and pushes again', 'Change is merged to the main branch'],
      explain: 'The change is proposed on a branch, checked automatically, reviewed by a colleague, improved and then merged. The history keeps the full conversation.' },

    { type: 'tf', after: 5, statement: 'A good habit is to make a decision in a Slack thread and leave it there, since everyone saw it.', answer: false,
      explain: 'Chat is hard to search months later, and not everyone saw it. Copy decisions to a ticket, an ADR or a wiki page.' },

    { type: 'ab', q: 'Which message is better for asynchronous work?',
      a: { lang: 'text', label: 'Message one', src: `
        Hi
        (no further text; waits for a reply)` },
      b: { lang: 'text', label: 'Message two', src: `
        Hi Sam, could you review PR #214 today?
        It adds the invoice export and blocks Friday's release.
        No rush before 3pm. Thanks!` },
      answer: 'b',
      explain: 'The full message can be answered whenever Sam is free, with no back and forth. A lone greeting forces a live conversation and wastes time.' },

    { type: 'mcq', q: 'Your team of six keeps its tasks in a spreadsheet, a chat channel and three people’s heads. What is the most sensible first step?',
      options: ['Agree one place for tasks, start with a simple board, and keep it up to date', 'Buy the most feature-rich tracker and mandate every field', 'Move everything into chat so nothing is lost', 'Ask each person to keep a private list'],
      answer: 0,
      why: [null, 'A heavyweight tool configured before anyone has used it usually becomes ticket theatre.', 'Chat is fast but is poor at showing the state of work, and old items disappear.', 'Private lists are exactly the shared-memory problem to avoid.'],
      explain: 'Start with one shared home for tasks and make it simple enough that everyone uses it. You can add structure later when it is needed.' },

    { type: 'match', prompt: 'Match each tool to its usual job.',
      pairs: [['Git', 'Records every change to the files, with history'], ['GitHub', 'Hosts repositories and runs pull request reviews'], ['Slack', 'Channels and threads for quick conversation'], ['Trello', 'Simple boards with cards in lists'], ['Confluence', 'A wiki for longer, lasting documentation'], ['Jira', 'Issue tracking with workflows, sprints and reports']],
      explain: 'Each tool has a core job. Problems start when one tool is stretched to do everything.' },

    { type: 'scenario', title: 'The tool war', meters: { adoption: 40, clarity: 40 },
      intro: 'Your department of 40 has three trackers, two wikis and four chat channels about the same project. Half the team wants to buy a new all-in-one platform. You are asked to recommend a path.',
      steps: [
        { text: 'What do you do first?',
          choices: [
            { label: 'Ask the daily users what they use and why, and find where information really gets lost', score: 2, effects: { adoption: 25, clarity: 25 }, feedback: 'You learn that the real pain is “where is the current plan?”, not missing features. That points to a smaller fix.' },
            { label: 'Buy the new platform and mandate it for everyone', score: 0, effects: { adoption: -15, clarity: -10 }, feedback: 'Now there are four tools. People keep using their old ones, and the migration eats a quarter.' },
            { label: 'Pick the cheapest option for them', score: 1, effects: { adoption: -5, clarity: 5 }, feedback: 'Cost matters, but nobody asked what the team will actually use.' }
          ] },
        { text: 'You agree to consolidate. How do you roll it out?',
          choices: [
            { label: 'Pilot with one team, document one home for each kind of information, then expand', score: 2, effects: { adoption: 30, clarity: 25 }, feedback: 'A pilot finds the awkward bits cheaply, and a written “where things live” page prevents drift.' },
            { label: 'Switch everyone overnight and delete the old tools', score: 0, effects: { adoption: -20, clarity: -15 }, feedback: 'Old information is lost and people are frustrated on day one.' },
            { label: 'Allow every team to choose its own', score: 1, effects: { adoption: 10, clarity: -20 }, feedback: 'Autonomy is nice, but you are back at sprawl and nobody can see across teams.' }
          ] }
      ],
      outro: 'Tools succeed through habit. Pilot, write down where things live, and keep it simple.' },

    { type: 'explain', prompt: 'A new team lead asks you which tools they need. Explain how you would think about it, using the jobs rather than brand names.',
      model: 'I would think in jobs: Git and a host like GitHub for code and its history, with docs and decision records in the repo too; a chat tool for quick asynchronous conversation, with decisions copied to a lasting home; a tracker, from a simple Trello board to Jira, for the work; and a wiki such as Confluence for longer explanations. Choose what the team will actually use, avoid tool sprawl, and write down where each kind of information lives.',
      keywords: ['Git', 'Slack', 'Trello', 'Jira', 'Confluence', 'async', 'decisions', 'use'] }
  ],

  flashcards: [
    { q: 'What does “everything as code” mean for documents?', a: 'Keeping docs, diagrams and decision records as text files in the same Git repository, so changes are reviewed and versioned like code.' },
    { q: 'What is a pull request?', a: 'A proposal to merge a branch into main, with automated checks, review comments and a recorded discussion.' },
    { q: 'What is asynchronous communication?', a: 'Communication where people reply when they can instead of instantly, which protects focus and suits different time zones.' },
    { q: 'Trello vs Jira in a sentence?', a: 'Trello is a simple, easy board. Jira is a configurable tracker with workflows, sprints and reports, which costs more to maintain.' },
    { q: 'How should you pick team tools?', a: 'By what the daily users will actually use, whether information is findable, and whether there is one clear home for each kind of thing.' }
  ],

  glossary: [
    { term: 'Pull request', def: 'A request to merge changes from one branch into another, where colleagues review and discuss them first.', like: 'Handing in a draft for comments before it is published.', aka: ['PR'] },
    { term: 'Asynchronous communication', def: 'Messaging where the reader answers when convenient, rather than needing an immediate reply.', like: 'Email rather than a phone call.', aka: ['async'] },
    { term: 'Jira', def: 'An Atlassian tool for tracking issues and work through configurable workflows, boards and reports.', like: 'A very organised task office.' },
    { term: 'Confluence', def: 'An Atlassian wiki used to write and share team documentation.', like: 'The team’s shared notebook.' },
    { term: 'Tool sprawl', def: 'The slow growth of overlapping tools until nobody knows where the truth lives.', like: 'A shed full of half-forgotten gadgets.' }
  ],

  takeaways: [
    'Tools are the team’s shared memory. Pick one clear home for each kind of information.',
    'Keep docs, diagrams and decisions in Git so they are reviewed with the code.',
    'Chat asynchronously with complete messages, and copy decisions somewhere lasting.',
    'Choose tools the team will actually use. Start simple and pilot first.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('architect-frameworks', {
  title: 'The Acronym Hydra',
  intro: 'Cut off one framework and two more appear: UML, TOGAF, BABOK, Scrum, SAFe, PRINCE2, ITIL. Show you know what each is for, and when to ignore it.',
  questions: [
    { type: 'mcq', q: 'A teammate draws a diagram showing the order of calls between the browser, API and database for a payment. Which diagram type is it?',
      options: ['Sequence diagram', 'Class diagram', 'Deployment diagram', 'C4 context diagram'],
      answer: 0,
      why: [null, 'A class diagram shows structure and relationships, not order over time.', 'A deployment diagram shows where software runs.', 'A context diagram shows your system as one box with its neighbours.'],
      explain: 'Sequence diagrams show messages in the order they happen, with time running downwards.' },

    { type: 'order', prompt: 'Put the C4 levels in order, widest first.', items: ['Context', 'Containers', 'Components', 'Code'],
      explain: 'C4 zooms like a map: the system and its neighbours, then deployable parts, then building blocks, then code.' },

    { type: 'bucket', prompt: 'Which TOGAF architecture is each item part of?', buckets: ['Business', 'Data', 'Application', 'Technology'],
      items: [['The claims approval process', 0], ['The shape of the customer record', 1], ['The billing system', 2], ['The cloud platform and networks', 3], ['Which roles can sign off a refund', 0], ['The mobile banking app', 2]],
      explain: 'Business is what the organisation does, data is its information, applications are the software, and technology is the platform underneath.' },

    { type: 'tf', statement: 'A request like “add an Export button” is always a clear statement of the underlying need.', answer: false,
      explain: 'Requests are often solutions in disguise. Business analysis asks why until the real need appears, which may be met better another way.' },

    { type: 'ab', q: 'Which backlog item is better written?',
      a: { lang: 'text', label: 'Story one', src: `
        As a customer who forgot my password,
        I want a reset link by email,
        so that I can get back into my account.` },
      b: { lang: 'text', label: 'Story two', src: `
        As a developer,
        I want a password_resets table with a token column,
        so that the schema is ready.` },
      answer: 'a',
      explain: 'A good story says who wants what and why, and leaves the implementation to the team. The other prescribes a solution and never mentions user value.' },

    { type: 'match', prompt: 'Match each Scrum element to its meaning.',
      pairs: [['Product Owner', 'Orders the backlog and owns the what and why'], ['Scrum Master', 'Helps the team use Scrum and improve'], ['Increment', 'The usable result that meets the Definition of Done'], ['Sprint Retrospective', 'Where the team reflects on how it works'], ['Daily Scrum', 'A 15-minute planning chat for the developers']],
      explain: 'Roles own different accountabilities. The increment is the artefact, and the events are how the team inspects and adapts.' },

    { type: 'estimate', q: 'A team has 9 items in progress and finishes about 3 per week. By Little’s Law, roughly how many weeks does an item take from start to finish on average?', answer: 3, unit: 'weeks', tolerance: 1.4, min: 0.5, max: 30,
      explain: 'Cycle time = WIP ÷ throughput = 9 ÷ 3 = 3 weeks. Cutting WIP is the quickest way to shorten it.' },

    { type: 'multi', q: 'Which of these are genuine XP practices?',
      options: ['Pair programming', 'Test-driven development', 'Continuous integration', 'Signing off a 200-page specification before coding', 'A fixed release once every two years'],
      answers: [0, 1, 2],
      explain: 'XP favours pairing, TDD, continuous integration, refactoring and small releases. Giant specifications and rare releases are the opposite of its ethos.' },

    { type: 'bucket', prompt: 'LeSS or SAFe?', buckets: ['LeSS', 'SAFe'],
      items: [['One Product Owner and one backlog for all teams', 0], ['Agile Release Trains with PI Planning', 1], ['Criticised as heavy and top-down', 1], ['Criticised as hard to adopt because it needs deep change', 0], ['Portfolio, large solution, essential and team levels', 1], ['Feature teams and “more with less”', 0]],
      explain: 'LeSS removes layers and keeps close to Scrum. SAFe adds structure, which suits some organisations and annoys others.' },

    { type: 'cloze', text: 'PRINCE2 manages by {{stages}}, where the Project {{Board}} decides at each boundary whether to continue. In RUP the {{Elaboration}} phase proves the architecture.',
      distractors: ['sprints', 'Manager', 'Inception'],
      explain: 'Stage gates give senior people a regular chance to stop or continue. RUP proves the riskiest architectural ideas early in Elaboration.' },

    { type: 'mcq', q: 'Production is down. In ITIL terms, what is the first priority?',
      options: ['Resolve the incident: restore service quickly', 'Open a problem record and wait', 'Schedule a change for next week', 'Write a lessons-learned report'],
      answer: 0,
      why: [null, 'The problem record, the root-cause hunt, comes after service is back.', 'A normal change is not an emergency response.', 'Reports and lessons come once the fire is out.'],
      explain: 'Incidents are about restoring service as quickly as possible. Root causes are the later job of problem management.' },

    { type: 'mcq', q: 'Which is the most useful way for an architect to treat a framework like TOGAF, PRINCE2 or SAFe?',
      options: ['As a toolbox: borrow what serves the decision in front of you and tailor the rest', 'As a rulebook to follow to the letter, to be safe', 'As proof that agile practices are unnecessary', 'As something to avoid entirely because all frameworks are theatre'],
      answer: 0,
      why: [null, 'Following every step by the book is how shelf-ware and ticket theatre appear.', 'The frameworks and agile practices often coexist in the same organisation.', 'Some parts are genuinely useful, such as baseline, target and gap, and stage gates.'],
      explain: 'The frameworks themselves usually encourage tailoring. The skill is knowing which parts help and tying the work to real decisions.' }
  ]
});

KS.sheet('architect-frameworks', {
  title: 'Frameworks, modelling & process cheat sheet',
  sections: [
    { title: 'Diagrams: UML and C4', md: `| Diagram | Answers |
|---|---|
| Class | What are the things, how do they relate? |
| Sequence | Who sends what, in what order? |
| Component | What are the big pieces? |
| Deployment | Where does it run? |

**Arrows:** hollow triangle = inheritance (solid) or implements (dashed); dashed open arrow = dependency; hollow diamond = aggregation; filled diamond = composition.

**C4:** Context, Containers, Components, Code. Keep it small and label every arrow.` },

    { title: 'Enterprise frameworks', md: `- **TOGAF**: four architectures (business, data, application, technology) and the **ADM** loop: vision, describe baseline and target, plan, govern, manage change.
- Think: **baseline, target, gap, roadmap**.
- It helps at scale. It is theatre when documents replace decisions.
- **BABOK** (IIBA): six areas, including elicitation and requirements life cycle.
- **IAF** (Capgemini): business, information, information systems, technology; why, what, how.
- Ask *why* until you find the need. Sort stakeholders by power and interest.` },

    { title: 'Agile and Scrum', md: `**Manifesto values:** people, working software, customer collaboration, responding to change.

| Scrum | Items |
|---|---|
| Roles | Product Owner, Scrum Master, Developers |
| Events | Sprint, Planning, Daily Scrum, Review, Retrospective |
| Artefacts | Product Backlog, Sprint Backlog, Increment |

Definition of Done = shared quality checklist. Architecture: decide costly things early; walking skeleton; spikes.` },

    { title: 'Kanban and XP', md: `- **Kanban**: visualise, limit WIP, pull, optimise flow.
- **Lead time**: request to delivery. **Cycle time**: start to done.
- **Little's Law:** cycle time = WIP ÷ throughput.
- **XP**: pair programming, TDD, continuous integration, refactoring, small releases, simple design.
- **Scrum** suits goal-driven product work. **Kanban** suits a stream of unpredictable requests. **Scrumban** blends them.
- A board with no WIP limits is a to-do wall.` },

    { title: 'Scaling agile', md: `| | LeSS | SAFe |
|---|---|---|
| Idea | Scrum, as little added as possible | Layers and release trains |
| Key bits | One backlog, one Product Owner, feature teams | ART, PI Planning (8–12 weeks), RTE, portfolio |
| Criticism | Hard to adopt, needs deep change | Heavy, top-down |

First reduce **dependencies** between teams. Conway's Law: teams and architecture mirror each other.` },

    { title: 'Classic project and service frameworks', md: `- **PMBOK (PMI)**: five process groups (initiating, planning, executing, monitoring and controlling, closing); scope, time, cost, risk.
- **PRINCE2**: stages, Project Board, business case, manage by exception.
- **RUP**: Inception, Elaboration (architecture baseline), Construction, Transition.
- **ITIL**: incident (restore), problem (root cause), change (alter safely).
- Beware **water-scrum-fall** and method as ritual.` },

    { title: 'Tools and habits', md: `| Job | Typical tool |
|---|---|
| Code and history | Git, GitHub (pull requests) |
| Conversation | Slack (async, threads) |
| Work tracking | Trello (simple), Jira (rich) |
| Knowledge | Confluence, or Markdown in the repo |

Everything as code: docs, diagrams and ADRs in Git. Copy chat decisions to a lasting place. Choose what the team will actually use.` }
  ]
});

