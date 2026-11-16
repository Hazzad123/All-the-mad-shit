/* Module: delivery — CI/CD, Cloud & Infrastructure.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs delivery */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('dl-ci', {
  eli5: 'Continuous integration means everyone merges their small changes into the shared code many times a day, and a robot builds and tests every merge straight away so problems show up in minutes, not weeks.',

  cards: [
    { kind: 'story', title: 'The Friday merge from hell',
      body: `Two developers, Asha and Ben, each start a big feature on Monday. Each works on their own copy of the code (a [[branch]]) and plans to combine them at the end of the sprint.

        On Friday afternoon they try. Asha renamed a function that Ben's code calls 40 times. Ben reorganised a folder Asha's code lives in. Both changed the same checkout file. The merge produces 63 conflicts, and when the dust settles, nothing starts.

        Nobody did anything *wrong*. They just went three weeks without comparing notes. The longer two copies of code drift apart, the more painful and risky the reunion becomes.`,
      note: 'The numbers in this story are made up, but the pattern is one every team has lived through. People call it "integration hell".' },

    { kind: 'metaphor', title: 'Washing up as you go',
      body: `A shared flat has two ways to deal with dishes. Option one: everyone leaves theirs until Sunday, then four people attack a mountain of crusty plates. Option two: you wash your mug straight after your tea.

        The total washing is the same. But a mug takes 30 seconds, nobody is blocked, and you never find a mystery bowl nobody will own up to.

        **Continuous integration** (CI) is washing up as you go: merge your small change into the shared code *now*, while it is fresh and tiny, rather than saving it up. Where the metaphor stops: the dishes do not get checked by a robot afterwards. Your code does, and that is the other half of CI.` },

    { kind: 'compare', title: 'Big-bang merge vs small and often',
      body: 'Same work, two habits. Notice how the cost of each problem changes.',
      cols: ['Merge at the end', 'Merge small, often'],
      rows: [
        ['Size of a change', 'Weeks of work, thousands of lines', 'Hours of work, a few dozen lines'],
        ['Conflicts', 'Many, tangled, hard to untangle', 'Few and small, fixed in minutes'],
        ['When a bug appears', 'Somewhere in 3 weeks of changes', 'In the last small change you made'],
        ['Reviewing', 'Too big to read properly', 'Quick to read, easy to question'],
        ['Risk', 'High: one giant leap', 'Low: many tiny steps']
      ] },

    { kind: 'diagram', title: 'The pipeline: a conveyor belt of checks',
      body: 'Every time someone pushes a change, a robot runs the same series of stages. That robot-run series is the **pipeline**. If any stage fails, the belt stops and the author is told.',
      nodes: [
        { id: 'push', label: 'Push a change', icon: '👩‍💻', x: 1, y: 0 },
        { id: 'build', label: 'Build', icon: '🔨', x: 1, y: 1 },
        { id: 'lint', label: 'Lint', icon: '🧹', x: 1, y: 2 },
        { id: 'test', label: 'Test', icon: '🧪', x: 1, y: 3 },
        { id: 'art', label: 'Package artefact', icon: '📦', x: 1, y: 4, tone: 'good' },
        { id: 'fail', label: 'Tell the author', icon: '🔔', x: 3, y: 2, tone: 'bad' }
      ],
      edges: [
        { from: 'push', to: 'build' }, { from: 'build', to: 'lint' }, { from: 'lint', to: 'test' }, { from: 'test', to: 'art', label: 'all green' },
        { from: 'build', to: 'fail', dashed: true }, { from: 'lint', to: 'fail', dashed: true, label: 'any failure' }, { from: 'test', to: 'fail', dashed: true }
      ],
      caption: '**Build** turns source into something runnable. **Lint** checks style and obvious mistakes without running the code. **Test** runs the automated tests you met in the testing module.' },

    { kind: 'code', title: 'A pipeline is just a file in your repo',
      body: 'Pipelines are written as configuration files that live next to your code. This one is in the style of GitHub Actions; other tools look similar. **Tap a line.**',
      code: { lang: 'yaml', src: `
        name: CI
        on:
          pull_request:
          push:
            branches: [main]
        jobs:
          check:
            runs-on: ubuntu-latest
            steps:
              - uses: actions/checkout@v4
              - uses: actions/setup-node@v4
                with: { node-version: 20 }
              - run: npm ci
              - run: npm run lint
              - run: npm test
              - run: npm run build`,
        notes: {
          2: '`on` says **when** to run. Here: on every pull request, and on every push to `main`. The robot starts without anyone asking.',
          8: 'The job runs on a fresh, clean machine (here a Linux one) that the CI service lends for a few minutes. Nothing from your laptop comes along.',
          10: 'The first step downloads your code onto that clean machine.',
          13: '`npm ci` installs the exact dependencies from the lock file. A fresh install every time is the point: it proves the project works from scratch, not just on your laptop.',
          14: 'Lint: cheap and quick, so it runs early.',
          15: 'Run the automated tests. A failing test makes this command exit with an error, which fails the whole pipeline.',
          16: 'Finally, build the real thing. If it will not build, nobody should merge it.'
        } } },

    { kind: 'concept', title: 'Fast feedback is the whole game',
      body: `A pipeline is only useful if people *wait for it and trust it*. That means it has to be quick: ideally a few minutes, and certainly not an afternoon.

        Two habits keep it fast:

        - **Cheap checks first.** Lint takes seconds, so run it before the ten-minute test suite. No point waiting for tests to tell you about a typo.
        - **Run things side by side.** Independent jobs (say, unit tests and a security scan) can run at the same time.

        The reason is human. If feedback arrives in five minutes, you are still thinking about that code and the fix is easy. If it arrives tomorrow, you have moved on and have to rebuild the whole picture in your head.` },

    { kind: 'concept', title: 'Build once, keep the artefact',
      body: `The result of a successful build is an **artefact**: a ready-to-run package. It might be a Docker image (you met those in the containers module), a zip file or a compiled program.

        The golden rule: **build it once, then promote that same artefact** towards production. Do not rebuild it for each stage.

        Why? Think of baking a cake. If you test one cake and then bake a *second* one to serve, you have not really tested the cake you serve. Slightly different ingredients or a different oven could change it. The artefact that passed your tests must be the exact thing that ships.

        Artefacts are stored in a registry or artefact store, usually tagged with the commit they came from, so you can always trace a running version back to its code.` },

    { kind: 'pitfall', title: 'A red build that everybody ignores',
      body: `The most valuable rule in CI: **keep the main branch green.** "Green" means the pipeline passes. Main should always be in a state you could release.

        The classic decay goes like this: one test fails randomly. People shrug and click "re-run". Then a real failure arrives and gets the same shrug. Soon red is normal, and the pipeline has become decoration.

        - A broken main is **everyone's emergency**: fix it or revert the change that broke it, straight away.
        - A *flaky* test (one that sometimes fails for no reason) should be fixed or removed, not tolerated.

        A trusted pipeline is worth more than a thorough one that nobody believes.` },

    { kind: 'tip', title: 'Make the robot enforce the rules',
      body: `Good intentions fade on a busy Thursday. So teams make the system itself hold the line.

        - **Branch protection:** main cannot be changed directly. A change must go through a pull request, and the pipeline must pass before the merge button works.
        - **Small pull requests:** if a change is too big to review in 20 minutes, split it.
        - **Unfinished work can still merge** if it is hidden from users (a trick called a feature flag, coming in the next lesson). That is how you merge daily on a feature that takes a month.

        In the lab that follows you will arrange pipeline stages and push commits with different bugs to see which stage catches each one.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'Why is merging small changes often safer than merging one big change at the end of a sprint?',
      options: ['Each merge has few conflicts, and a bug is easy to trace', 'Small merges skip code review, so they reach main faster', 'Git refuses to merge anything larger than a few lines', 'Fewer total lines of code get written that way'],
      answer: 0,
      why: [null, 'Small changes are reviewed too; they are just quick to review.', 'Git has no such limit. It is a habit, not a tool restriction.', 'The amount of code written is the same. Only the size of each merge changes.'],
      explain: 'Drift is what hurts. Frequent small merges keep everyone close to the shared code, so conflicts stay tiny and the cause of a failure is obvious.' },

    { type: 'tf', after: 4, statement: 'A pipeline step that runs `npm test` can fail the whole pipeline if a test fails.', answer: true,
      explain: 'A command that exits with an error stops the stage, and a stopped stage fails the pipeline. That is how the robot refuses a bad change.' },

    { type: 'cloze', after: 6, text: 'The package a successful build produces is called an {{artefact}}. You should {{build}} it once and promote that same one through every stage, rather than {{rebuilding}} it for each environment.',
      distractors: ['branch', 'deleting', 'linting'],
      explain: 'Promoting the very artefact that passed the tests means what you ship is what you tested.' },

    { type: 'order', prompt: 'Put a typical pipeline in the order it should run, cheap and fast checks first.',
      items: ['Check out the code on a clean machine', 'Install dependencies', 'Lint', 'Run the tests', 'Build and store the artefact'],
      explain: 'Start from a clean slate, then run the quickest checks before the slow ones, and only package something that passed everything.' },

    { type: 'bucket', prompt: 'Which stage would most likely catch each problem first?', buckets: ['Build', 'Lint', 'Test'],
      items: [['A missing closing bracket stops the code compiling', 0], ['A dependency that cannot be downloaded', 0], ['A variable declared but never used', 1], ['Inconsistent indentation against the team style', 1], ['A discount function returns the wrong total', 2], ['A login that now rejects correct passwords', 2]],
      explain: 'Build catches "this cannot even become a program". Lint catches style and suspicious code without running it. Tests catch code that runs but behaves wrongly.' },

    { type: 'ab', q: 'Which pipeline order gives developers the fastest useful feedback?',
      a: { lang: 'yaml', label: 'Version one', src: `
        steps:
          - run: npm run test:slow   # 12 minutes
          - run: npm run lint        # 10 seconds` },
      b: { lang: 'yaml', label: 'Version two', src: `
        steps:
          - run: npm run lint        # 10 seconds
          - run: npm run test:slow   # 12 minutes` },
      answer: 'b',
      explain: 'A typo caught by lint is reported after ten seconds, instead of after twelve minutes of tests that were going to be thrown away anyway. Cheap checks go first.' },

    { type: 'spot', prompt: 'Tap the line that makes this pipeline dangerous.',
      code: { lang: 'yaml', src: `
        steps:
          - run: npm ci
          - run: npm run build
          - run: ./deploy.sh production
          - run: npm test` },
      lines: [4],
      explain: 'The code goes live *before* the tests run. If a test then fails, customers already have the broken version. Checks must come before anything that ships.' },

    { type: 'scenario', title: 'Main is red at 4pm', intro: 'Your team has a CI pipeline and a rule: main should always be green. At 4pm the board turns red after Jo merged a change. Three people are about to start new work on top of main.',
      meters: { 'team flow': 70, 'main health': 40 },
      steps: [
        { text: 'The failing test is in Jo\'s change, and Jo has gone to a dentist appointment. What does the team do first?',
          choices: [
            { label: 'Revert Jo\'s merge so main is green again, then fix it properly later', score: 2, effects: { 'main health': 40, 'team flow': 10 }, feedback: 'Fast and calm. A revert restores a known-good main in minutes, and Jo can fix the real problem tomorrow with no pressure.' },
            { label: 'Tell everyone to carry on and ignore the red for now', score: 0, effects: { 'main health': -20, 'team flow': -15 }, feedback: 'Now three more changes pile onto a broken base, and nobody can tell which failures belong to whom. Red becomes normal.' },
            { label: 'Hand-fix it in the production branch settings to turn the light green', score: 0, effects: { 'main health': -30 }, feedback: 'Silencing the check is not fixing the problem. The bug is still in main, and now nothing warns you about it.' }
          ] },
        { text: 'Afterwards, Jo finds the test failed only because it depends on the current time and sometimes fails at midnight. What should happen to it?',
          choices: [
            { label: 'Fix the test so it no longer depends on the real clock', score: 2, effects: { 'main health': 20, 'team flow': 15 }, feedback: 'A flaky test teaches people to ignore red. Making it deterministic keeps the pipeline trustworthy.' },
            { label: 'Add an automatic re-run so it passes the second time', score: 1, effects: { 'main health': 5 }, feedback: 'Re-runs hide the flakiness rather than curing it, and they slow every build. Better than nothing, worse than fixing it.' },
            { label: 'Delete the whole test file', score: 0, effects: { 'main health': -15 }, feedback: 'The test was protecting a real behaviour. Deleting it trades a nuisance for a blind spot.' }
          ] },
        { text: 'The team wants to stop this happening again. Which change helps most?',
          choices: [
            { label: 'Turn on branch protection so a merge needs a green pipeline first', score: 2, effects: { 'main health': 25, 'team flow': 10 }, feedback: 'Now a failing change cannot reach main at all. The robot enforces the rule instead of relying on everyone remembering.' },
            { label: 'Send a stern email reminding everyone to run the tests first', score: 1, effects: { 'team flow': -5 }, feedback: 'People mean well, but a reminder fades by next week. A rule the system enforces does not.' },
            { label: 'Merge only once a week so there is time to check carefully', score: 0, effects: { 'main health': -10, 'team flow': -20 }, feedback: 'Bigger, rarer merges are exactly what CI is trying to avoid. You get the Friday merge from hell, only weekly.' }
          ] }
      ],
      outro: 'The pattern: **restore green first, find the root cause second, then make the system prevent a repeat.**' },

    { type: 'explain', prompt: 'A teammate says "CI is just running tests on a server." Explain what continuous integration really asks of a team, and why speed matters.',
      model: 'CI is a habit: everyone merges small changes into the shared main branch often, and a pipeline automatically builds, lints and tests every change on a clean machine. It keeps branches from drifting apart, so conflicts stay small and a bug is easy to trace. The pipeline has to be fast so the developer gets feedback while the change is still fresh in their mind, and main has to stay green so everyone can trust it.',
      keywords: ['merge', 'small', 'often', 'pipeline', 'automatic', 'fast', 'feedback', 'green'] }
  ],

  flashcards: [
    { q: 'What is continuous integration?', a: 'Merging small changes into the shared branch frequently, with an automatic pipeline that builds and tests every change.' },
    { q: 'What are the usual stages of a CI pipeline?', a: 'Check out the code, install dependencies, build, lint, test, then package an artefact.' },
    { q: 'Why run cheap checks such as lint before slow tests?', a: 'To fail fast: an easy mistake is reported in seconds rather than after the long test run.' },
    { q: 'What is a build artefact and what is the golden rule about it?', a: 'A ready-to-run package from a build (such as a Docker image). Build it once and promote that same artefact through every environment.' },
    { q: 'What does "keep main green" mean?', a: 'The main branch should always pass the pipeline and be releasable. When it breaks, fixing or reverting becomes the team\'s top priority.' }
  ],

  glossary: [
    { term: 'Continuous integration', def: 'The practice of merging small changes into the shared code frequently, with automatic builds and tests on every change.', like: 'Washing your mug straight after your tea.', aka: ['CI'] },
    { term: 'Pipeline', def: 'The automated series of stages (build, lint, test and so on) that every change passes through.', like: 'A conveyor belt of inspections that stops at the first fault.' },
    { term: 'Lint', def: 'An automatic check of code style and suspicious patterns that does not run the code.', like: 'A proofreader who spots typos without reading for meaning.', aka: ['linter'] },
    { term: 'Artefact', def: 'The packaged output of a build that can be deployed, such as an image, a zip or a compiled program.', like: 'The sealed box that leaves the factory.' },
    { term: 'Flaky test', def: 'A test that sometimes passes and sometimes fails without any change to the code.', like: 'A smoke alarm that goes off when you make toast.' }
  ],

  takeaways: [
    'Merge **small and often**: drift between copies of the code is what hurts.',
    'A **pipeline** builds, lints and tests every change on a clean machine, cheapest checks first.',
    '**Build once**, then promote the same artefact through every stage.',
    '**Keep main green**: a red build is everyone\'s emergency, and a flaky test is a bug.'
  ],

  links: [
    { label: 'Martin Fowler: Continuous Integration', url: 'https://martinfowler.com/articles/continuousIntegration.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('dl-cd', {
  eli5: 'Continuous delivery keeps every checked change ready to go live at the press of a button; deployment presses it for you, and tricks like canaries and flags limit the damage if something is wrong.',

  cards: [
    { kind: 'story', title: 'Release night, 2am',
      body: `In the old days, a "release" was an event. Once a quarter, the whole team stayed late. Someone followed a 40-line checklist, copied files onto servers by hand, ran database changes and held their breath. Pizza was ordered. Something always went wrong.

        Why so scary? Because each release bundled *months* of changes together, done rarely and by hand. Rare things are never practised, and big things are hard to debug.

        The modern answer is the same one as in the last lesson, applied to shipping: **do it small, do it often, and automate it until it is boring.** A release should feel like posting a letter, not launching a rocket.` },

    { kind: 'compare', title: 'Delivery vs deployment',
      body: 'The two terms are one letter apart in the acronym (CD) and are easily mixed up. The only real difference is one human decision.',
      cols: ['Continuous delivery', 'Continuous deployment'],
      rows: [
        ['Every passing change is...', 'Ready to release at any moment', 'Released automatically'],
        ['Who presses the button?', 'A human, when the business is ready', 'Nobody: the pipeline does it'],
        ['Needs', 'A solid automated pipeline', 'The same, plus strong tests and monitoring'],
        ['Good fit', 'Regulated or high-stakes products, timed launches', 'Web services with fast, trusted feedback']
      ],
      note: 'Plenty of teams do delivery and are perfectly happy. Deployment is not a "higher level" you must reach.' },

    { kind: 'metaphor', title: 'Dress rehearsal before opening night',
      body: `A theatre does not put a new play in front of paying guests on the very first run. It rehearses in a rehearsal room, then does a full **dress rehearsal** on the real stage with costumes, and only then opens.

        Software uses the same ladder. Each rung is an **environment**: a complete copy of the system where the code runs. Early rungs are cheap and chaotic; the last one is the real show.

        Where the metaphor stops: a theatre cannot easily open the play to 5% of the audience first. Software can, and that is the clever part of the next few cards.` },

    { kind: 'diagram', title: 'Environments and promotion',
      body: 'One artefact travels up the ladder. Moving it up a rung is called **promotion**.',
      nodes: [
        { id: 'art', label: 'Artefact from CI', icon: '📦', x: 1, y: 0 },
        { id: 'dev', label: 'Dev / test', icon: '🛠️', x: 1, y: 1, tone: 'info' },
        { id: 'stg', label: 'Staging', icon: '🎭', x: 1, y: 2, tone: 'warn' },
        { id: 'prod', label: 'Production', icon: '🌍', x: 1, y: 3, tone: 'good' },
        { id: 'gate', label: 'Approval (optional)', icon: '✋', x: 3, y: 2, tone: 'accent' }
      ],
      edges: [
        { from: 'art', to: 'dev', label: 'auto' }, { from: 'dev', to: 'stg', label: 'tests pass' }, { from: 'stg', to: 'prod', label: 'promote' },
        { from: 'gate', to: 'stg', dashed: true }
      ],
      caption: '**Staging** is meant to mirror production as closely as is affordable. The closer the copy, the fewer "but it worked in staging!" surprises. The approval gate is where delivery waits for a human and deployment does not.' },

    { kind: 'compare', title: 'Three ways to roll out a new version',
      body: 'Replacing the version that thousands of people are using without anyone noticing is the real trick. Three standard moves:',
      cols: ['How it works', 'Watch out for'],
      rows: [
        ['**Rolling**', 'Replace servers a few at a time; old and new run side by side briefly', 'Two versions live at once, so they must work together'],
        ['**Blue/green**', 'Build a full second copy ("green"), test it, then switch all traffic over in one go', 'Needs double the capacity for a while'],
        ['**Canary**', 'Send a small slice (say 5%) of real traffic to the new version, watch, then widen', 'Needs good monitoring to judge the slice']
      ],
      note: 'The name "canary" comes from the canaries coal miners once carried to warn them of bad air: a small early warning before the whole group is at risk.' },

    { kind: 'sequence', title: 'A canary release',
      body: 'Step through a careful rollout. The new version meets real users, but only a few.',
      actors: ['Router', 'Version 1', 'Version 2', 'Monitoring'],
      steps: [
        { note: 'Version 1 serves everyone. Version 2 has been deployed next to it, but gets no traffic yet.' },
        { from: 0, to: 2, label: '5% of requests', note: 'The router sends a small slice of real users to the new version.' },
        { from: 0, to: 1, label: '95% of requests', note: 'Everyone else is untouched.' },
        { from: 2, to: 3, label: 'error rate, speed', dashed: true, note: 'Version 2 reports how it is doing: errors, response times.' },
        { at: 3, label: 'compare with Version 1', note: 'Monitoring compares the two. If they look the same, it is safe to widen.' },
        { from: 0, to: 2, label: '25%, 50%, then 100%', note: 'Traffic grows step by step, checking as it goes.' },
        { from: 3, to: 0, label: 'errors up? send 0%', dashed: true, note: 'If the numbers go wrong at any step, the router shifts the traffic back. Only a few users ever saw the problem.' }
      ] },

    { kind: 'code', title: 'Feature flags: ship it dark',
      body: `A **feature flag** is an on/off switch in the code that is controlled from outside. It separates two things people often confuse: **deploying** (the code is on the servers) and **releasing** (users can see it). **Tap a line.**`,
      code: { lang: 'js', src: `
        function checkout(cart, user) {
          if (flags.isOn('new-checkout', user)) {
            return newCheckout(cart);   // shipped, but dark
          }
          return oldCheckout(cart);     // everyone else
        }`,
        notes: {
          2: 'The flag service answers "is this feature on for this user?". The answer can depend on the user, a percentage, or a team, and you can change it without deploying.',
          3: 'The new code is already in production, but only visible when the flag says so. Unfinished work can merge safely.',
          5: 'Everyone else keeps the old behaviour. If the new checkout misbehaves, you flip the flag off in seconds: no rebuild, no redeploy.'
        } },
      note: 'Flags pile up. Once a feature is fully released, delete the flag and the old code path, or the code fills with dead branches.' },

    { kind: 'concept', title: 'Rollback: the undo button',
      body: `Even with every precaution, some releases go wrong. The question is how quickly you can get back.

        A **rollback** means returning to the previous known-good version. If you keep old artefacts (remember: build once, store it), rolling back is just "deploy the old one again", and with blue/green it is even simpler: point traffic back at the old copy that is still running.

        Three habits make rollbacks real rather than hopeful:

        - **Practise them.** An undo button you have never pressed is a rumour.
        - **Decide the trigger in advance:** for example "error rate above 2% for five minutes". Arguing at 3am wastes the minutes that matter.
        - **Often, flipping a flag is faster** than rolling back the whole release.` },

    { kind: 'pitfall', title: 'Code rolls back; data does not',
      body: `Your code is a set of files: easy to swap back. Your **database** is not. Suppose version 2 renames a column and runs a change that rewrites rows. Roll back to version 1 and its code looks for a column that no longer exists.

        The safe habit is to change data in **small, compatible steps** so that the old and the new version can both work at the same time:

        1. Add the new column (the old code ignores it).
        2. Deploy code that writes to both.
        3. Move over, later remove the old column.

        It is slower, but it means any code deploy can be undone without losing or breaking data.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'A team\'s pipeline builds, tests and deploys to staging automatically. A product manager then clicks a button to push to production when the launch is announced. What is this?',
      options: ['Continuous delivery: always releasable, with a human choosing when', 'Continuous deployment, because the pipeline is automatic', 'Neither, because a human is involved', 'A rolling release'],
      answer: 0,
      why: [null, 'Deployment would mean no human click: every passing change goes live on its own.', 'Humans choosing the moment is exactly what delivery means. The automation is in making every build releasable.', 'Rolling describes *how* servers are replaced, not who decides when.'],
      explain: 'Delivery keeps every change ready to ship and leaves the "when" to a person. Deployment removes that final click.' },

    { type: 'match', after: 4, prompt: 'Match each rollout strategy to its defining idea.',
      pairs: [['Rolling', 'Replace servers a few at a time'], ['Blue/green', 'Switch all traffic to a full second copy at once'], ['Canary', 'Try the new version on a small slice of real users first'], ['Feature flag', 'Ship the code but switch it on separately']],
      },

    { type: 'tf', after: 6, statement: 'With a feature flag, deploying code and releasing the feature to users are two separate steps.', answer: true,
      explain: 'The code can sit in production switched off. Flipping the flag releases it, and flipping it back withdraws it, with no new deployment either way.' },

    { type: 'order', prompt: 'Put a cautious canary rollout in order.',
      items: ['Deploy the new version alongside the old one with no traffic', 'Send a small slice of real traffic to it', 'Compare its errors and speed with the old version', 'Widen the slice step by step', 'Retire the old version'],
      explain: 'You only widen once the comparison looks healthy, and you only retire the old version when nobody needs it as a fallback.' },

    { type: 'ab', q: 'Your team wants to merge an unfinished feature to main without exposing it to customers. Which approach is safer?',
      a: { lang: 'js', label: 'Hide behind a flag', src: `
        if (flags.isOn('new-search', user)) {
          return newSearch(query);
        }
        return oldSearch(query);` },
      b: { lang: 'js', label: 'Replace the old code', src: `
        // oldSearch is deleted
        return newSearch(query);` },
      answer: 'a',
      explain: 'The flag keeps the old behaviour as the default and gives you an instant off-switch. Replacing the old path outright means any bug reaches every user immediately.' },

    { type: 'bucket', prompt: 'Which rollout approach fits each situation best?', buckets: ['Blue/green', 'Canary', 'Feature flag'],
      items: [['You want a full copy tested, then an instant switch, and an instant switch back', 0], ['You can afford to run two full environments for a while', 0], ['You want real users to find problems before most users do', 1], ['You have strong monitoring and can compare error rates', 1], ['Marketing wants the feature visible only on launch day, though the code is already live', 2], ['You want to turn one feature off in seconds without redeploying', 2]],
      explain: 'Blue/green is about a clean all-at-once switch. Canary is about learning from a small slice. Flags separate the moment of release from the moment of deployment.' },

    { type: 'short', q: 'What do you call returning to the previous known-good version after a bad release?', accept: ['rollback', 'roll back', 'a rollback', 'rolling back', 'roll it back'], hint: 'Two words squashed together; the undo button of releases.',
      explain: 'A rollback redeploys the last good version (or points traffic back at the old copy). It is only trustworthy if you have practised it.' },

    { type: 'scenario', title: 'The Tuesday release', intro: 'Your team ships a redesigned search page. The pipeline is green and the team is nervous, because last time a bad release hit everyone for 40 minutes.',
      meters: { 'customer happiness': 70, 'confidence': 50 },
      steps: [
        { text: 'How do you roll out the new search page?',
          choices: [
            { label: 'Canary it: 5% of users first, watching errors and search speed', score: 2, effects: { 'customer happiness': 5, confidence: 20 }, feedback: 'Good call. A problem now hurts a handful of people, and you have real numbers to judge it by.' },
            { label: 'Switch everyone over at once so nothing is inconsistent', score: 0, effects: { 'customer happiness': -10, confidence: -10 }, feedback: 'If it is broken, every user finds out at the same moment. That is exactly what hurt last time.' },
            { label: 'Send it to a second environment and just wait a week', score: 1, effects: { confidence: 5 }, feedback: 'Waiting feels safe, but staging has no real users and real data volumes. You learn less than a small slice of production would teach you.' }
          ] },
        { text: 'At 5%, error rates on the new page are three times the old one. What now?',
          choices: [
            { label: 'Send the canary traffic back to the old version and investigate', score: 2, effects: { 'customer happiness': 10, confidence: 15 }, feedback: 'That is what the canary is for. A few users saw a problem for a few minutes, and you now have evidence to debug with.' },
            { label: 'Carry on to 100% because the numbers might settle down', score: 0, effects: { 'customer happiness': -25, confidence: -20 }, feedback: 'Hope is not a strategy. A tripled error rate rarely fixes itself.' },
            { label: 'Roll everything back and cancel the project', score: 1, effects: { 'customer happiness': 5, confidence: -5 }, feedback: 'Pulling back was right, but cancelling is an overreaction. One failed canary is information, not a verdict.' }
          ] },
        { text: 'You fix the bug. Marketing wants the new search visible exactly at 9am on Thursday. How do you handle it?',
          choices: [
            { label: 'Deploy the fixed version early, behind a flag, and switch it on at 9am', score: 2, effects: { 'customer happiness': 15, confidence: 15 }, feedback: 'Deploying and releasing are separate. The risky part (the deploy) happens calmly on Wednesday, and the launch is just a flag flip.' },
            { label: 'Deploy it at 8:59am on Thursday and hope', score: 0, effects: { 'customer happiness': -10, confidence: -10 }, feedback: 'You have tied a risky deploy to a hard deadline, so any hiccup becomes a public failure.' },
            { label: 'Ask marketing to move the launch to whenever it happens to be ready', score: 1, effects: { confidence: 5 }, feedback: 'Flexible, but it throws away a better option: you can meet the date *and* ship safely.' }
          ] }
      ],
      outro: 'The pattern: **limit who is affected, watch real numbers, keep an instant way back.**' },

    { type: 'explain', prompt: 'Explain to a colleague why teams roll out with a canary or blue/green instead of replacing everything at once, and what a feature flag adds.',
      model: 'Replacing every server at once means a bug reaches all users immediately. A canary sends the new version to a small slice of real traffic first, so problems are caught while few people are affected, and blue/green keeps the old copy running so you can switch back instantly. Either way you need monitoring and a rollback plan. A feature flag adds a separate switch so code can be deployed without being released, and turned off in seconds if needed.',
      keywords: ['canary', 'small', 'slice', 'blue/green', 'rollback', 'flag', 'monitoring', 'deploy'] }
  ],

  flashcards: [
    { q: 'What is the difference between continuous delivery and continuous deployment?', a: 'Delivery keeps every passing change ready to release, with a human choosing when. Deployment releases every passing change automatically.' },
    { q: 'What is an environment, and what does "promotion" mean?', a: 'An environment is a complete copy of the system (dev, staging, production). Promotion is moving the same artefact up to the next one.' },
    { q: 'Compare rolling, blue/green and canary releases in a line each.', a: 'Rolling replaces servers a few at a time; blue/green switches all traffic to a full second copy; canary sends a small slice of real traffic to the new version first.' },
    { q: 'What does a feature flag do?', a: 'It lets code be deployed but hidden, so releasing (and withdrawing) a feature is a switch rather than a deployment.' },
    { q: 'Why can a database make rollbacks hard?', a: 'Code swaps back easily, but data changes (renamed columns, rewritten rows) do not. Make data changes in small, backward-compatible steps.' }
  ],

  glossary: [
    { term: 'Continuous delivery', def: 'Keeping every change that passes the pipeline ready to release, with a person deciding when to ship it.', like: 'A finished parcel on the doorstep, waiting for you to say "send".' },
    { term: 'Continuous deployment', def: 'Releasing every change that passes the pipeline to production automatically, with no manual step.', like: 'A conveyor that posts each parcel itself.' },
    { term: 'Environment', def: 'A complete copy of the system where code runs, such as test, staging or production.', like: 'Rehearsal room, dress rehearsal and opening night.' },
    { term: 'Canary release', def: 'Sending a small share of real traffic to a new version first, and widening only if it looks healthy.', like: 'The canary in the coal mine: an early warning.' },
    { term: 'Blue/green deployment', def: 'Running two full copies of a system and switching all traffic from the old (blue) to the new (green) at once.', like: 'Swapping a whole stage set between scenes.' },
    { term: 'Feature flag', def: 'A switch in code, controlled from outside, that turns a feature on or off without a deployment.', like: 'A light switch wired to code already installed.' }
  ],

  takeaways: [
    '**Delivery** = always releasable, human decides. **Deployment** = released automatically.',
    'Promote **one artefact** up the environments; staging should mirror production.',
    'Limit the blast radius: **rolling**, **blue/green** or **canary**, with real monitoring.',
    '**Flags** separate deploy from release. Practise **rollbacks**, and change data in compatible steps.'
  ],

  links: [
    { label: 'Martin Fowler: Feature Toggles', url: 'https://martinfowler.com/articles/feature-toggles.html' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('dl-iac', {
  eli5: 'Infrastructure as code means describing your servers, networks and databases in text files instead of clicking around in a console, so they can be reviewed, versioned and rebuilt exactly, like any other code.',

  cards: [
    { kind: 'story', title: 'The server nobody dares touch',
      body: `Every company has one. It was set up three years ago by someone who has since left. It runs something important. Nobody knows exactly which settings were changed, which packages were installed by hand, or why a certain file in \`/etc\` has a strange comment.

        People call this a **snowflake server**: unique, delicate, impossible to copy. If it dies, rebuilding it means weeks of detective work. If you want a second one for testing, you cannot have it.

        The problem is not the server. It is that its setup lives in *someone's memory and fingertips* instead of somewhere written down.` },

    { kind: 'concept', title: 'Describe it in a file',
      body: `**Infrastructure as code** (IaC) means writing down your servers, networks, databases and permissions in text files, and letting a tool create them from those files.

        Once setup is a file, you get everything you already love about code:

        - **Version control:** every change is a commit, with an author and a reason.
        - **Review:** a teammate reads the pull request *before* a server changes.
        - **Repeatability:** run it twice, get the same result. Need a copy for testing? Run it again with a different name.
        - **Recovery:** if the whole thing is lost, the files rebuild it.

        Doing this by clicking in a web console is quick the first time and a nightmare the fiftieth.` },

    { kind: 'metaphor', title: 'A recipe versus "I just cooked it"',
      body: `A restaurant that relies on one chef who "just knows" how the signature dish is made has a problem the day that chef is ill. A restaurant with a **written recipe** can have any cook produce the same dish, in any kitchen, and a new cook can read the recipe to learn *why* it tastes that way.

        Clicking around in a console is cooking from instinct. A file describing the infrastructure is the recipe. Better still, the oven reads the recipe and cooks the dish itself. Where the metaphor stops: a real recipe is vague ("season to taste"). Infrastructure files must be exact, because a machine reads them.` },

    { kind: 'code', title: 'What it looks like: Terraform',
      body: 'This is **Terraform**, a popular tool whose files use a language called HCL. It describes three small web servers on a cloud provider. **Tap a line.**',
      code: { lang: 'tf', src: `
        resource "aws_instance" "web" {
          ami           = "ami-0abc123"
          instance_type = "t3.small"
          count         = 3

          tags = {
            Name = "web"
          }
        }`,
        notes: {
          1: 'A **resource** is one thing you want to exist: here, a virtual server, which this cloud provider calls an "instance". `"web"` is just our own name for it.',
          2: 'Which disk image to start from. This value is a placeholder: real ones are long IDs from the provider.',
          3: 'How big a machine. Bigger sizes cost more.',
          4: 'How many we want. Change `3` to `5` and run Terraform again: it works out that it needs to add **two more**, and touches nothing else.',
          7: 'A label attached to each server so humans can find them in the console.'
        } },
      note: 'Cloud providers (AWS, Azure, Google Cloud) get their own lesson very soon. For now read "instance" as "a rented virtual machine".' },

    { kind: 'compare', title: 'Declarative vs imperative',
      body: 'There are two ways to tell a tool what you want. Think of ordering a taxi versus giving someone driving directions.',
      cols: ['Declarative', 'Imperative'],
      rows: [
        ['You write', 'The **end state** you want: "three servers"', 'The **steps** to take: "create a server, then create another"'],
        ['Run it twice', 'Nothing changes the second time: already three', 'Might create three more, unless you check first'],
        ['Tool must', 'Compare reality with the description and work out the difference', 'Do exactly what it is told, in order'],
        ['Strength', 'Safe to re-run; easy to read what exists', 'Full control over order and unusual logic'],
        ['Example', 'Terraform, CloudFormation', 'A shell script of cloud commands']
      ],
      note: 'The word for "run it many times and the result is the same" is **idempotent**, which you met with HTTP methods. Declarative tools aim for it.' },

    { kind: 'compare', title: 'Terraform, CloudFormation, Ansible',
      body: 'Three names you will hear constantly. They overlap, but each has a home turf.',
      cols: ['What it is', 'Typical job'],
      rows: [
        ['**Terraform**', 'Declarative; works with many clouds through plugins', 'Creating the infrastructure: networks, servers, databases'],
        ['**CloudFormation**', 'Declarative; AWS\'s own tool, only for AWS', 'The same, if you are all-in on AWS'],
        ['**Ansible**', 'Describes steps to run on machines, usually over SSH, with no agent installed; written to be repeatable', 'Configuring what is *on* the servers: packages, files, services']
      ],
      note: 'A common split: Terraform builds the servers, Ansible configures them. Many teams skip the second step by using containers, as the next card explains.' },

    { kind: 'concept', title: 'Immutable infrastructure: replace, do not repair',
      body: `Suppose you need to update software on a running server. The traditional way: log in and patch it. Do that for two years and every server is slightly different, and you have grown your own snowflakes again.

        **Immutable infrastructure** takes a stricter view: once a server is running, you **never change it**. To update, you build a *new* image with the change, start new servers from it, and throw the old ones away.

        If something is wrong, you do not debug the one-off server; you redeploy from the known-good image. Containers (from the last module) are immutable in exactly this way, which is why the idea feels so natural there.

        The trade-off: you need a fast, reliable way to build images, and anything that must survive (like data) has to live somewhere other than the server.` },

    { kind: 'sequence', title: 'GitOps: Git is the control panel',
      body: '**GitOps** applies IaC with a twist: the files in Git are the single source of truth, and a robot makes the real world match them. Step through a change.',
      actors: ['Developer', 'Git repo', 'Agent', 'Live system'],
      steps: [
        { from: 0, to: 1, label: 'pull request: replicas 3 → 5', note: 'To scale up, you do not touch any server. You change the file and open a pull request.' },
        { at: 1, label: 'review and merge', note: 'A teammate reviews it. Once merged, the repo says "five".' },
        { from: 2, to: 1, label: 'what should exist?', note: 'An agent running next to the system keeps comparing the repo with reality.' },
        { from: 2, to: 3, label: 'apply the difference', note: 'It sees five wanted, three running, and adds two.' },
        { from: 3, to: 2, label: 'now matches', dashed: true, note: 'And if someone changes the live system by hand, the agent changes it back. Git wins.' }
      ] },

    { kind: 'pitfall', title: 'Drift, and secrets in files',
      body: `Two classic traps.

        **Drift:** someone makes a "quick fix" in the web console, outside the files. Now reality and the code disagree. The next run of the tool may undo the fix, or fail confusingly. The rule: if it matters, change it **in the files**. Many tools can report drift so you notice.

        **Secrets in code:** IaC files live in Git, so a password pasted into one is now in the history for everyone and forever. Keep passwords and keys in a proper secrets store and reference them (the operations lesson covers this).

        Also remember that the tool keeps a record of what it has built (Terraform calls it *state*). Losing or corrupting that record is painful, so teams store it carefully, not on one laptop.` }
  ],

  activities: [
    { type: 'mcq', after: 4, q: 'A Terraform file says `count = 3`. Someone runs it twice in a row. How many servers exist afterwards?',
      options: ['Three: the second run sees the goal is already met', 'Six: each run creates three', 'Zero: the second run deletes the first batch', 'It depends on how fast the second run starts'],
      answer: 0,
      why: [null, 'That would be imperative behaviour ("create three"). A declarative file describes the goal, not the action.', 'Nothing in the file asks for deletion; reality already matches the description.', 'Speed is irrelevant: the tool compares reality with the file each time.'],
      explain: 'Declarative tools compare the described end state with what exists and change only the difference. Running it again with nothing to change does nothing.' },

    { type: 'match', after: 5, prompt: 'Match each tool or idea to its description.',
      pairs: [['Terraform', 'Declarative, multi-cloud tool for creating infrastructure'], ['CloudFormation', 'AWS\'s own declarative infrastructure tool'], ['Ansible', 'Repeatable steps run on machines to configure them'], ['Immutable infrastructure', 'Replace servers with new ones instead of patching them'], ['GitOps', 'Git is the source of truth and an agent makes reality match it']],
      },

    { type: 'tf', after: 6, statement: 'With immutable infrastructure, the usual way to update a server is to log in and patch it carefully.', answer: false,
      explain: 'The opposite: you never change a running server. You build a new image with the update, start fresh servers from it and retire the old ones.' },

    { type: 'bucket', prompt: 'Sort each statement: is it describing a declarative or imperative approach?', buckets: ['Declarative', 'Imperative'],
      items: [['"There should be three web servers."', 0], ['The tool works out what to add or remove', 0], ['Safe to re-run with no change', 0], ['"Create a server. Wait. Attach a disk. Create another."', 1], ['Re-running might create duplicates unless you add checks', 1], ['The author controls every step and its order', 1]],
      explain: 'Declarative describes *what*; imperative describes *how*. Most IaC leans declarative because it is safer to repeat.' },

    { type: 'order', prompt: 'Put a GitOps change in order.',
      items: ['A developer edits the infrastructure file and opens a pull request', 'A teammate reviews and merges it', 'The agent notices the repo and the live system differ', 'The agent applies the difference', 'The live system matches the repo again'],
      explain: 'Humans change the files and review them; the agent does the rest. Nobody logs into a server.' },

    { type: 'spot', prompt: 'Tap the line that should never be written in an infrastructure file that lives in Git.',
      code: { lang: 'tf', src: `
        resource "aws_db_instance" "main" {
          engine         = "postgres"
          instance_class = "db.t3.small"
          username       = "admin"
          password       = "hunter2-prod"
        }` },
      lines: [5],
      explain: 'A real password in a file means it lives in the Git history for everyone with access, forever. Reference it from a secrets store instead.' },

    { type: 'short', q: 'What one word describes a server that is never modified after it starts, only replaced?', accept: ['immutable', 'immutable server', 'immutable infrastructure'], hint: 'The opposite of "mutable", meaning changeable.',
      explain: 'Immutable infrastructure: build a new image, start new servers, throw the old ones away.' },

    { type: 'scenario', title: 'The console hotfix', intro: 'Your team manages its infrastructure with Terraform files in Git. At 5pm on Friday the site is slow. A colleague, Priya, quietly bumps one server\'s size in the cloud web console, and it helps. On Monday you open the repo.',
      meters: { 'infrastructure trust': 60, 'weekend peace': 70 },
      steps: [
        { text: 'Your Monday plan shows Terraform wants to shrink that server back to its old size. What does it tell you?',
          choices: [
            { label: 'The live system has drifted from the files, so someone changed it by hand', score: 2, effects: { 'infrastructure trust': 15 }, feedback: 'Exactly. The files say "small", reality says "large". The plan output is your drift detector.' },
            { label: 'Terraform is buggy and should be ignored', score: 0, effects: { 'infrastructure trust': -20 }, feedback: 'Terraform is doing its job: the files are the truth. Ignoring it makes the problem worse.' },
            { label: 'Nothing, since the change worked', score: 1, effects: { 'infrastructure trust': -5 }, feedback: 'It worked, but only until the next apply puts it back, and then the site is slow again.' }
          ] },
        { text: 'The bigger size really is needed. How do you make it stick?',
          choices: [
            { label: 'Change the instance size in the file, open a pull request, and apply after review', score: 2, effects: { 'infrastructure trust': 25, 'weekend peace': 10 }, feedback: 'Now the code, the review history and reality all agree, and the reason is written down.' },
            { label: 'Tell everyone never to run Terraform again', score: 0, effects: { 'infrastructure trust': -30, 'weekend peace': -15 }, feedback: 'You have given up the entire benefit of IaC and recreated the snowflake problem.' },
            { label: 'Keep fixing it by hand every time it resets', score: 0, effects: { 'infrastructure trust': -20, 'weekend peace': -15 }, feedback: 'You have signed up for a weekly chore, and the next person will not know to do it.' }
          ] },
        { text: 'How do you stop console edits sneaking in again?',
          choices: [
            { label: 'Limit console write access, and have the pipeline report drift automatically', score: 2, effects: { 'infrastructure trust': 20, 'weekend peace': 10 }, feedback: 'Fewer hands on the console, and an alarm when reality differs. Add an emergency process for real incidents, then write the change back into the files.' },
            { label: 'Send an email telling people to be good', score: 1, effects: { 'infrastructure trust': 0 }, feedback: 'Kind, but unenforced rules fade. Make the system do the nagging.' },
            { label: 'Remove access for everyone including yourself, permanently', score: 0, effects: { 'infrastructure trust': -10, 'weekend peace': -20 }, feedback: 'The next real emergency will need someone to act fast. Restrict, but keep a controlled way in.' }
          ] }
      ],
      outro: 'The pattern: **the files are the truth. If you must act in a hurry, write the change back afterwards.**' },

    { type: 'explain', prompt: 'Explain to a new colleague why a team would describe its servers in files and replace them instead of patching them.',
      model: 'Describing infrastructure as code means it is versioned, reviewed and repeatable, so a lost environment can be rebuilt and nobody depends on one person\'s memory. Declarative tools like Terraform say what should exist and work out the difference. Immutable infrastructure goes further: servers are never changed after they start, only replaced from a new image, which avoids snowflake servers that drift apart. GitOps keeps Git as the source of truth with an agent that makes the live system match it.',
      keywords: ['files', 'version', 'review', 'declarative', 'immutable', 'replace', 'drift', 'Git'] }
  ],

  flashcards: [
    { q: 'What is infrastructure as code?', a: 'Describing servers, networks and databases in text files that a tool turns into real resources, so they can be versioned, reviewed and rebuilt.' },
    { q: 'Declarative vs imperative: what is the difference?', a: 'Declarative describes the end state you want and lets the tool work out the changes. Imperative lists the steps to run, in order.' },
    { q: 'What do Terraform, CloudFormation and Ansible mainly do?', a: 'Terraform and CloudFormation (AWS only) create infrastructure declaratively. Ansible configures what is on machines, using repeatable steps.' },
    { q: 'What is immutable infrastructure?', a: 'Servers are never changed once running. To update, build a new image, start new servers and discard the old ones.' },
    { q: 'What is GitOps?', a: 'Using Git as the single source of truth for the desired state, with an agent that keeps the live system matching it.' }
  ],

  glossary: [
    { term: 'Infrastructure as code', def: 'Defining servers, networks and other infrastructure in files that tools read to create and update them.', like: 'A written recipe the oven can follow itself.', aka: ['IaC'] },
    { term: 'Declarative', def: 'Describing the result you want rather than the steps to get there; the tool works out the steps.', like: 'Ordering a taxi to an address.' },
    { term: 'Imperative', def: 'Describing the exact steps to perform, in order.', like: 'Giving turn-by-turn directions.' },
    { term: 'Snowflake server', def: 'A server whose setup is unique and undocumented because it was changed by hand over time.', like: 'A hand-knitted jumper: lovely, and impossible to reorder.' },
    { term: 'Drift', def: 'When the real infrastructure no longer matches what the code says, usually after manual changes.', like: 'A house that no longer matches its blueprints after a few "quick" DIY jobs.' },
    { term: 'GitOps', def: 'A way of running systems where Git holds the desired state and an automatic agent keeps reality in step with it.', like: 'A thermostat set from a shared document.' }
  ],

  takeaways: [
    'Put infrastructure in **files**: versioned, reviewed, repeatable.',
    '**Declarative** says what; **imperative** says how. Terraform and CloudFormation build, Ansible configures.',
    '**Immutable**: replace servers rather than patching them.',
    '**GitOps**: Git is the truth. Avoid **drift** and never commit secrets.'
  ],

  links: [
    { label: 'Terraform documentation', url: 'https://developer.hashicorp.com/terraform/docs' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('dl-cloud', {
  eli5: 'The cloud means renting other people\'s computers and services over the internet, paying only for what you use, instead of buying and housing your own machines.',

  cards: [
    { kind: 'concept', title: 'Renting computers by the second',
      body: `Imagine your shop is about to be mentioned on national television. You will need 50 servers by lunchtime, and by Friday you will need two again.

        In the old world you would have to *buy* servers, wait weeks for delivery, find room in a data centre and then be stuck with 48 idle machines. In the **cloud**, you press a button, 50 virtual servers appear within minutes, and on Friday you switch 48 off and stop paying for them.

        The cloud is simply **computing sold like electricity**: on demand, metered, and managed by a specialist company in enormous data centres you never visit. Everything in this module so far (pipelines, containers, infrastructure files) mostly ends up running there.` },

    { kind: 'metaphor', title: 'Houses, flats and hotels',
      body: `How much of a home do you want to look after yourself?

        - **Build your own house** (on-premises): total control, total responsibility. You fix the roof.
        - **Rent an empty flat** (IaaS): the building and the plumbing are someone else's job. You bring and arrange the furniture.
        - **Rent a furnished flat** (PaaS): you only bring your clothes, meaning your code.
        - **Book a hotel room** (SaaS): you just turn up and use it.
        - **Take a taxi** (FaaS): you do not even keep the vehicle; you pay per journey.

        The further down the list, the less you manage, the less you can customise, and the more you rely on the provider.` },

    { kind: 'compare', title: 'The service models, side by side',
      body: 'These "as a service" labels describe **how much the provider looks after for you**.',
      cols: ['You manage', 'Example'],
      rows: [
        ['**IaaS** (infrastructure)', 'The operating system, runtime, your app and data. The provider supplies virtual machines, disks and networks', 'A rented virtual server'],
        ['**PaaS** (platform)', 'Just your app and its data. The provider runs the servers, OS and scaling', 'A host where you push code and it runs'],
        ['**FaaS** (functions)', 'A single function. The provider runs it only when called, and bills per run', 'A function triggered by an upload or a request'],
        ['**SaaS** (software)', 'Nothing but your own settings and content. The whole application is theirs', 'Online email, a hosted spreadsheet or chat tool']
      ],
      note: 'FaaS is also called "serverless": there are servers, you just never see or manage them. The edges between these labels are blurry, and vendors stretch them.' },

    { kind: 'compare', title: 'The three big general-purpose clouds',
      body: 'Three providers offer broadly the same building blocks under different names. No ranking here: all three are mature and widely used.',
      cols: ['Run by', 'Worth knowing'],
      rows: [
        ['**AWS** (Amazon Web Services)', 'Amazon', 'One of the first cloud services to sell servers and storage by the hour, from the mid-2000s'],
        ['**Azure**', 'Microsoft', 'Strong links with Microsoft\'s business software and developer tools'],
        ['**Google Cloud**', 'Google', 'Strong in data and analytics, and home to ideas such as Kubernetes that came out of Google']
      ],
      note: 'Each calls things by its own names ("virtual machine" is an EC2 instance on AWS), but a server, a database and a queue mean the same on all of them. Learn the idea once, then the vocabulary.' },

    { kind: 'diagram', title: 'Regions and availability zones',
      body: 'A **region** is a geographic area (for example "western Europe") with several data centres. An **availability zone** is one or more separate data centres inside a region, with their own power and network.',
      nodes: [
        { id: 'lb', label: 'Load balancer', icon: '⚖️', x: 1, y: 0 },
        { id: 'za', label: 'Zone A: servers', icon: '🏢', x: 0, y: 1 },
        { id: 'zb', label: 'Zone B: servers', icon: '🏢', x: 1, y: 1 },
        { id: 'zc', label: 'Zone C: servers', icon: '🏢', x: 2, y: 1 },
        { id: 'r2', label: 'Other region: backup', icon: '🌍', x: 1, y: 3, tone: 'muted' }
      ],
      edges: [
        { from: 'lb', to: 'za' }, { from: 'lb', to: 'zb' }, { from: 'lb', to: 'zc' },
        { from: 'zb', to: 'r2', label: 'copies', dashed: true }
      ],
      groups: [{ label: 'One region', x: 0, y: 1, w: 3, h: 1 }],
      caption: 'Spread across zones and one data centre failing takes out a third of you, not all of you. Spread across regions and even a regional disaster is survivable. Regions are also how you put data near users, or keep it in a particular country.' },

    { kind: 'layers', title: 'Shared responsibility: who secures what?',
      body: 'Using a cloud does not hand all the worry to the provider. The split depends on the service model. For a virtual server (IaaS) it looks like this, top layer first.',
      layers: [
        { label: 'Your data and who can access it', note: 'Always yours. Permissions, encryption choices, backups.', tone: 'accent', icon: '🔑' },
        { label: 'Your application code', note: 'Bugs and vulnerabilities are yours.', tone: 'accent', icon: '💻' },
        { label: 'Operating system and patches', note: 'Yours with IaaS; the provider\'s with PaaS and SaaS.', tone: 'warn', icon: '🧰' },
        { label: 'Virtualisation and hardware', note: 'The provider\'s.', tone: 'good', icon: '🖥️' },
        { label: 'Physical data centre', note: 'The provider\'s: locks, power, cooling, guards.', tone: 'good', icon: '🏢' }
      ] },

    { kind: 'concept', title: 'Managed service or run it yourself?',
      body: `You need a database. You can rent a virtual server and install one yourself, or use a **managed database** where the provider handles installation, patching, backups and failover.

        Managed services buy you *time*. Your team does not have to be database administrators, and the boring, risky chores are done by people who do it all day. The price: a higher bill per unit, less control over fine settings, and some **lock-in**, because the more of a provider's own services you use, the harder it is to move.

        A sensible default: use managed services for things that are not your competitive edge (databases, queues, email sending), and spend your own effort on what makes your product special. Teams disagree on how far to take this, and it depends on size, skills and budget.` },

    { kind: 'pitfall', title: 'The cloud is not magically reliable (or private, or cheap)',
      body: `Three myths that cost real money:

        - **"It never goes down."** Zones and regions do fail occasionally. Reliability comes from *how you use them*: one server in one zone is still a single point of failure.
        - **"The provider handles security."** Only their part. A storage bucket set to "public" is the customer's mistake, and it has leaked a great deal of data.
        - **"It is cheaper."** It is cheaper *for spiky or uncertain demand*. Leave things running that nobody uses, and the meter keeps ticking.

        Most cloud problems are not the cloud's fault. They are settings nobody checked.` },

    { kind: 'tip', title: 'Pick the highest level that fits',
      body: `A useful rule of thumb: start at the **most managed** service that does the job, and drop lower only when you hit a real limit.

        - A static website or a simple app? A PaaS or similar can host it without you ever touching a server.
        - Occasional small jobs (resize an image when uploaded)? A function.
        - Needs a special operating system setting, or a specific piece of software? Then a virtual server.

        Each step down gives you more control, and also more to patch, monitor and pay for in time. Choose control only when you can say what you need it for.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'Your team pushes application code to a host. The host builds it, runs it on servers you never see, and adds more copies when traffic grows. Which service model is this?',
      options: ['PaaS: you bring the code, they run everything underneath', 'IaaS: you manage the operating system yourself', 'SaaS: you use finished software someone else wrote', 'On-premises: you own the hardware'],
      answer: 0,
      why: [null, 'With IaaS you would choose and patch the operating system yourself.', 'SaaS means you only use a finished product. Here you are running your *own* code.', 'On-premises means your own machines in your own building.'],
      explain: 'A platform runs your code and handles the servers, OS and scaling. IaaS hands you raw virtual machines; SaaS hands you a finished application.' },

    { type: 'tf', after: 4, statement: 'Running all your servers in one availability zone protects you if that zone\'s data centre loses power.', answer: false,
      explain: 'A zone is the unit that can fail together. Spreading servers across several zones keeps you running when one is lost.' },

    { type: 'bucket', after: 5, prompt: 'On a rented virtual server (IaaS), who is responsible for each of these?', buckets: ['The provider', 'You'],
      items: [['Power and cooling in the data centre', 0], ['The physical servers and network cables', 0], ['Installing operating-system security patches', 1], ['Who is allowed to read your customer data', 1], ['Fixing a vulnerability in your own code', 1], ['Physical guards on the building', 0]],
      explain: 'The provider secures "the cloud itself": buildings and hardware. You secure what you put *in* it: the OS (on IaaS), the code, the data and the access rules.' },

    { type: 'match', prompt: 'Match each label to the best description.',
      pairs: [['IaaS', 'Rent virtual machines and disks; you manage the OS up'], ['PaaS', 'Hand over code; the provider runs the servers'], ['FaaS', 'Single functions run on demand and are billed per run'], ['SaaS', 'A finished application used through the internet'], ['Region', 'A geographic area containing several zones']] },

    { type: 'order', prompt: 'Order these from the most you manage yourself to the least.',
      items: ['Your own data centre', 'IaaS: rented virtual machines', 'PaaS: a platform for your code', 'FaaS: individual functions', 'SaaS: finished software'],
      explain: 'Each step hands another layer to the provider: first the building, then the machines, then the OS and runtime, then the whole server, finally the entire application.' },

    { type: 'estimate', q: 'A virtual server costs £0.05 per hour (a made-up price). Someone forgets to switch it off. Roughly how much is that per month of 30 days?', answer: 36, unit: '£ per month', tolerance: 2,
      explain: '£0.05 × 24 hours × 30 days = £36. One forgotten small server is no disaster; fifty forgotten test servers are a surprise bill. Pay-per-use needs someone paying attention.' },

    { type: 'scenario', title: 'The launch-week bill', intro: 'You run the tech for a small online ticket seller. A big concert goes on sale in six weeks. Demand will spike for an hour, then drop. Your budget is tight and nobody on the team is a database specialist.',
      meters: { reliability: 50, budget: 60, 'team time': 60 },
      steps: [
        { text: 'Where does the ticket database live?',
          choices: [
            { label: 'A managed database service with automatic backups and failover', score: 2, effects: { reliability: 20, 'team time': 15, budget: -10 }, feedback: 'You pay a little more per hour, but a specialist handles patching, backups and failover, and your small team stays on the product.' },
            { label: 'A database installed by hand on a rented virtual server', score: 1, effects: { reliability: -5, 'team time': -20, budget: 5 }, feedback: 'Cheaper on paper and fully controllable, but the patching, backups and 3am failure are now your team\'s problem.' },
            { label: 'A single database on one server in one zone, to keep it simple', score: 0, effects: { reliability: -25, 'team time': -5 }, feedback: 'One server in one zone is one power cut away from no sales during the biggest hour of the year.' }
          ] },
        { text: 'How do you prepare the application servers for a spike that lasts an hour?',
          choices: [
            { label: 'Spread across several zones and scale the count up for launch, back down after', score: 2, effects: { reliability: 25, budget: 10 }, feedback: 'Exactly what renting by the second is for: pay for the peak only while it lasts, and survive losing a zone.' },
            { label: 'Buy enough fixed capacity to handle the peak, all year round', score: 0, effects: { reliability: 10, budget: -30 }, feedback: 'It will survive, but you will pay for the peak every hour of the year. That is the old model wearing a new logo.' },
            { label: 'Stay on the current setup and hope the spike is smaller than expected', score: 0, effects: { reliability: -30, budget: 5 }, feedback: 'Hope is not capacity. Spikes are exactly when the system is most visible.' }
          ] },
        { text: 'The team also wants to run its own ticket-confirmation emailing system on spare servers. What do you advise?',
          choices: [
            { label: 'Use a managed email-sending service: it is not what makes the product special', score: 2, effects: { 'team time': 20, reliability: 10 }, feedback: 'Email delivery has deep gotchas. Spend your effort on the product, not on running mail servers.' },
            { label: 'Build it: more control is always better', score: 0, effects: { 'team time': -25, reliability: -10 }, feedback: 'Control is only worth paying for when you need it. Here the work is a chore, not an advantage.' },
            { label: 'Ask each team member to hand-send the confirmations at launch', score: 0, effects: { 'team time': -30, reliability: -20 }, feedback: 'This does not scale to one hour of thousands of buyers. Automation exists for exactly this.' }
          ] }
      ],
      outro: 'The pattern: **pay for peaks only while they last, spread across zones, and let specialists run what is not your edge.**' },

    { type: 'explain', prompt: 'Explain to a non-technical friend what "the cloud" is, and name one thing the provider does for you and one thing it does not.',
      model: 'The cloud is renting computing from a provider by the hour or second instead of buying your own machines. You can add or remove servers in minutes and pay only for what you use. The provider looks after the buildings, power and hardware, and with managed services also the patching and backups. It does not look after your own data, your access rules or the bugs in your code: that is the shared responsibility model.',
      keywords: ['rent', 'pay', 'servers', 'provider', 'data', 'security', 'shared', 'responsibility'] }
  ],

  flashcards: [
    { q: 'What is the difference between IaaS, PaaS, SaaS and FaaS?', a: 'How much the provider manages. IaaS: virtual machines. PaaS: a platform for your code. SaaS: a finished app. FaaS: individual functions run on demand.' },
    { q: 'What is a region and what is an availability zone?', a: 'A region is a geographic area. An availability zone is one or more separate data centres inside a region, with independent power and network.' },
    { q: 'Why spread servers across several availability zones?', a: 'So the loss of one data centre only removes part of your capacity instead of all of it.' },
    { q: 'What is the shared responsibility model?', a: 'The provider secures the cloud itself (buildings, hardware); you secure what you put in it (data, access, your code, and the OS on IaaS).' },
    { q: 'When is a managed service a good choice?', a: 'For things that are not your competitive edge, such as databases or email sending: you trade some control and money for time and fewer chores.' }
  ],

  glossary: [
    { term: 'Cloud', def: 'Computing resources rented on demand over the internet and billed by use, instead of owned.', like: 'Electricity from the grid instead of your own generator.' },
    { term: 'IaaS', def: 'Infrastructure as a service: you rent virtual machines, storage and networks and manage everything above them.', like: 'Renting an empty flat.' },
    { term: 'PaaS', def: 'Platform as a service: you supply your code and the provider runs the servers, OS and scaling.', like: 'Renting a furnished flat.' },
    { term: 'Serverless', def: 'A style, usually functions as a service, where you run code without managing servers and pay per run.', like: 'Taking a taxi instead of owning a car.', aka: ['FaaS'] },
    { term: 'Availability zone', def: 'An isolated data centre, or group of them, inside a region with its own power and network.', like: 'One separate building on a campus.' },
    { term: 'Vendor lock-in', def: 'Becoming so dependent on one provider\'s own services that switching away is costly.', like: 'A phone plan that only works with one brand of phone.' }
  ],

  takeaways: [
    'The cloud is **computing rented on demand**: pay for what you use, scale in minutes.',
    '**IaaS, PaaS, FaaS, SaaS** = how much the provider looks after, from a bare machine to a finished app.',
    'Spread across **availability zones** for resilience and **regions** for disasters and location.',
    '**Shared responsibility**: they secure the cloud, you secure what you put in it. Prefer managed services for non-core work.'
  ],

  links: [
    { label: 'AWS: What is cloud computing?', url: 'https://aws.amazon.com/what-is-cloud-computing/' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('dl-cloud-patterns', {
  eli5: 'Cloud design patterns are tried-and-tested solutions to problems that keep turning up when software runs across many machines, each with a short name so teams can talk about it quickly.',

  cards: [
    { kind: 'concept', title: 'A catalogue of solutions that keep turning up',
      body: `Once you run software across many machines, the same problems arrive again and again. A call to another service fails. A mobile app makes ten requests to draw one screen. A huge old application needs replacing without a big bang.

        Experienced engineers noticed they kept solving each one the same way, gave each solution a **name**, and wrote them down. That list is a **catalogue of cloud design patterns**.

        You already know the idea from the design patterns modules: a pattern is a proven recipe, not a library you install. These ones work at the scale of *whole services* rather than classes. Some you have met in earlier modules (resilience, architectural patterns), so treat this lesson as the map that puts them side by side.` },

    { kind: 'diagram', title: 'Sidecar and ambassador: a helper next to your app',
      body: 'A **sidecar** is a helper process deployed *right beside* your application, sharing its fate, like the sidecar on a motorbike. It adds a chore (logging, security, config) without changing your code. An **ambassador** is a sidecar that speaks to the outside world *on your app\'s behalf*.',
      nodes: [
        { id: 'app', label: 'Your app', icon: '💻', x: 0, y: 1 },
        { id: 'side', label: 'Helper (sidecar)', icon: '🛵', x: 1, y: 1, tone: 'accent' },
        { id: 'remote', label: 'Remote service', icon: '☁️', x: 3, y: 1 }
      ],
      edges: [
        { from: 'app', to: 'side', both: true, label: 'plain local call' },
        { from: 'side', to: 'remote', label: 'retries, TLS, routing' }
      ],
      groups: [{ label: 'Deployed together', x: 0, y: 1, w: 2, h: 1 }],
      caption: 'Your app makes a simple local call. The helper handles retries, encryption and finding the right address. In Kubernetes, the helper is just another container in the same pod, which is why this pattern is so common there.' },

    { kind: 'metaphor', title: 'The hotel concierge',
      body: `You are at a hotel and want a taxi, a restaurant table and theatre tickets. You *could* ring three different companies. Or you could ask the **concierge**, who rings all three and hands you a neat itinerary.

        That is the idea behind a gateway in front of many services. Your phone does not want to talk to ten different services in the kitchen; it wants one friendly person at the desk.

        Where the metaphor stops: a good concierge works for every guest alike. The next cards show why some systems end up with a different concierge for each kind of guest.` },

    { kind: 'sequence', title: 'Gateway aggregation',
      body: 'One screen of the phone app needs the order, and the customer\'s name. Without a gateway, the phone makes two slow trips across the internet. With one, it makes a single call.',
      actors: ['Phone', 'Gateway', 'Orders', 'Profiles'],
      steps: [
        { from: 0, to: 1, label: 'GET /home-screen', note: 'The phone makes **one** request over the slow mobile connection.' },
        { from: 1, to: 2, label: 'latest order?', note: 'Inside the data centre, calls are quick and cheap. The gateway asks Orders...' },
        { from: 1, to: 3, label: 'customer name?', note: '...and Profiles, at the same time.' },
        { from: 2, to: 1, label: 'order 42', dashed: true, note: 'Orders replies with the latest order.' },
        { from: 3, to: 1, label: 'Sam', dashed: true, note: 'Profiles replies with the customer\'s name.' },
        { from: 1, to: 0, label: 'one combined reply', dashed: true, note: 'The gateway stitches the two answers together. The phone did one round trip instead of two (or ten).' }
      ] },

    { kind: 'concept', title: 'Backends for frontends (BFF)',
      body: `A phone, a website and a smartwatch need very different things from the same data. The watch wants three fields. The website wants a rich, detailed page. One shared API ends up awkwardly serving everyone, and every change has to please all of them.

        The **backend for frontend** pattern gives **each kind of client its own small backend**, owned by the team that builds that client. The phone's BFF shapes and combines data exactly as the phone needs. The web's BFF does the same for the web.

        | Pattern | One thing it does |
        |---|---|
        | Gateway aggregation | Combines several calls into one |
        | BFF | Gives each client type its own tailored gateway |

        The trade-off: more services to run, and some logic repeated between them.` },

    { kind: 'compare', title: 'Retry, circuit breaker, bulkhead',
      body: 'Three resilience patterns you met in the Resilience module. Here they are side by side, as a refresher.',
      cols: ['Idea', 'Use it when'],
      rows: [
        ['**Retry**', 'Try again, waiting longer each time (backoff) and adding a little randomness', 'A failure is likely brief: a blip in the network'],
        ['**Circuit breaker**', 'After repeated failures, stop calling for a while and fail fast', 'A dependency is down and retrying only makes it worse'],
        ['**Bulkhead**', 'Give each dependency its own pool of resources, like watertight compartments in a ship', 'One slow dependency must not use up everything']
      ],
      note: 'They work as a team: retry for the small hiccups, breaker for the long outages, bulkhead so that whatever goes wrong stays in its own compartment. Retries are only safe on idempotent operations.' },

    { kind: 'steps', title: 'The strangler fig: replacing a system a slice at a time',
      body: 'Rewriting a big old application in one go is famously risky. The **strangler fig** pattern is named after a vine that grows around a tree until it replaces it. The steps:',
      steps: [
        { title: 'Put a front door in front of the old system', body: 'A proxy or gateway receives all requests and, at first, just passes everything to the old application.' },
        { title: 'Pick one slice and rebuild it', body: 'Say, product search. Build the new version as a separate service, and test it while the old one still works.' },
        { title: 'Redirect that slice', body: 'Tell the front door to send search traffic to the new service. Everything else still goes to the old system. If it goes badly, switch the route back.' },
        { title: 'Repeat, slice by slice', body: 'Each slice moves over. The old system shrinks. Every step is small, shippable and reversible.' },
        { title: 'Switch off what is left', body: 'When nothing routes to the old application any more, retire it. Nobody ever had to bet the company on a big-bang cutover.' }
      ] },

    { kind: 'concept', title: 'CQRS: reads and writes get different models',
      body: `Many systems read far more than they write, and the two jobs want different things. Writing needs strict rules and consistency. Reading wants speed and a shape convenient for the screen.

        **CQRS** (Command Query Responsibility Segregation) splits them. **Commands** (change things) go through one model; **queries** (ask things) use another, often a separate, read-optimised copy of the data that is kept up to date behind the scenes.

        The payoff is that each side can be scaled and tuned independently. The cost is real: two models to maintain and, usually, a short delay before a write shows up in the read copy. You saw this with event sourcing in the architectural patterns module. For a plain CRUD app, it is often more machinery than you need.` },

    { kind: 'diagram', title: 'Competing consumers',
      body: 'Messages pile up in a queue faster than one worker can handle. Rather than make one worker faster, run **several identical workers that all take from the same queue**. Each message goes to just one of them.',
      nodes: [
        { id: 'p', label: 'Producer', icon: '📤', x: 1, y: 0 },
        { id: 'q', label: 'Queue', icon: '📬', x: 1, y: 1, tone: 'accent' },
        { id: 'w1', label: 'Worker 1', icon: '⚙️', x: 0, y: 2 },
        { id: 'w2', label: 'Worker 2', icon: '⚙️', x: 1, y: 2 },
        { id: 'w3', label: 'Worker 3', icon: '⚙️', x: 2, y: 2 }
      ],
      edges: [
        { from: 'p', to: 'q' }, { from: 'q', to: 'w1' }, { from: 'q', to: 'w2' }, { from: 'q', to: 'w3' }
      ],
      caption: 'Backlog growing? Add a worker. Worker crashed? Its message goes back to the queue for another to pick up. Work can arrive in any order, so the tasks should not depend on each other. You saw queues in the messaging module.' },

    { kind: 'pitfall', title: 'Pattern soup',
      body: `A catalogue is a menu, not a shopping list. The temptation, once you know the names, is to use all of them.

        - A small app with three users does not need CQRS, a BFF per client *and* a service mesh.
        - Every pattern adds moving parts: more things to run, monitor and understand at 3am.
        - The right question is not "which pattern can I use?" but "**what problem am I actually having?**"

        Reach for a pattern when you can name the pain it relieves. Until then, the plain version is usually a fine answer.` }
  ],

  activities: [
    { type: 'mcq', after: 1, q: 'Which problem is a sidecar best suited to?',
      options: ['Adding logging or retries beside an app without editing it', 'Combining five service calls into one reply for a phone app', 'Slowly replacing a legacy system', 'Splitting reads and writes into two data models'],
      answer: 0,
      why: [null, 'That is gateway aggregation.', 'That is the strangler fig.', 'That is CQRS.'],
      explain: 'A sidecar is a helper deployed next to your application that takes over cross-cutting chores, so the application itself stays simple.' },

    { type: 'tf', after: 3, statement: 'Gateway aggregation helps most because calls inside the data centre are cheap and calls from a phone over a mobile connection are slow.', answer: true,
      explain: 'The phone makes one round trip over the slow link; the gateway makes the several quick internal calls and combines the answers.' },

    { type: 'order', after: 6, prompt: 'Put the strangler fig migration in order.',
      items: ['Put a proxy in front of the old system', 'Rebuild one slice as a new service', 'Route that slice\'s traffic to the new service', 'Repeat for the next slice', 'Retire the old system'],
      explain: 'The front door has to exist before anything can be redirected, and the old system is only retired once nothing depends on it. Every step is small and reversible.' },

    { type: 'match', prompt: 'Match each pattern to the problem it solves.',
      pairs: [['Sidecar', 'A helper alongside the app handles a chore for it'], ['Gateway aggregation', 'One request instead of many from a slow client'], ['Circuit breaker', 'Stop hammering a dependency that is clearly down'], ['Bulkhead', 'One slow dependency must not exhaust everything'], ['Competing consumers', 'Several workers share one queue to clear a backlog'], ['CQRS', 'Separate models for changing data and for reading it']] },

    { type: 'bucket', prompt: 'Sort each situation by the kind of pattern that fits.', buckets: ['Resilience', 'Migration', 'Shaping requests'],
      items: [['A payment provider is down and your servers keep waiting for it', 0], ['One slow report query uses up every database connection', 0], ['A flaky network drops one call in fifty', 0], ['You want to replace a 15-year-old application without a freeze', 1], ['A legacy feature should move to a new service, and be switchable back', 1], ['The mobile app needs three different services for a single screen', 2], ['The smartwatch needs a much smaller reply than the website', 2]],
      explain: 'Retry, breaker and bulkhead protect you from failure. The strangler fig migrates gradually. Aggregation and BFF tailor what the client receives.' },

    { type: 'ab', q: 'A call to another service sometimes fails for a moment. Which retry is the better one?',
      a: { lang: 'js', label: 'Retry hard', src: `
        while (true) {
          try { return await getPrice(); }
          catch (e) { /* try again */ }
        }` },
      b: { lang: 'js', label: 'Retry politely', src: `
        for (let i = 0; i < 4; i++) {
          try { return await getPrice(); }
          catch (e) { await sleep(2 ** i * 200 + jitter()); }
        }
        throw new Error('gave up');` },
      answer: 'b',
      explain: 'A limit stops infinite loops, growing delays (backoff) give the other side room to recover, and jitter stops all clients retrying at the same instant. The endless instant loop would hammer a struggling service even harder.' },

    { type: 'scenario', title: 'Shop modernisation', intro: 'You lead the tech for an online shop with one huge, ageing application. Three problems land on your desk in the same week.',
      meters: { 'customer experience': 50, 'delivery risk': 70 },
      steps: [
        { text: 'The mobile app takes six seconds to draw its home screen because it calls five different services. What do you propose?',
          choices: [
            { label: 'A gateway (or a BFF for mobile) that makes the calls and returns one combined reply', score: 2, effects: { 'customer experience': 25 }, feedback: 'The phone makes one request over the slow link and the gateway does the quick internal work. A BFF also lets the mobile team shape the reply as it likes.' },
            { label: 'Make the phone fire all five requests faster', score: 0, effects: { 'customer experience': -5 }, feedback: 'The slow part is the mobile link and the number of round trips. Firing them faster does not remove either.' },
            { label: 'Combine the five services back into one big service', score: 1, effects: { 'customer experience': 10, 'delivery risk': 10 }, feedback: 'It might help, but it undoes work you chose to do and is a large change for a screen-speed problem.' }
          ] },
        { text: 'The product-search code is the oldest, slowest part of the application. The board wants it replaced but cannot accept a long freeze. What do you do?',
          choices: [
            { label: 'Strangler fig: front the old app with a proxy and move search to a new service in a slice', score: 2, effects: { 'delivery risk': -30, 'customer experience': 10 }, feedback: 'Search moves on its own, with a route you can flip back. The rest of the shop carries on and ships features as usual.' },
            { label: 'Freeze all features for nine months and rewrite everything at once', score: 0, effects: { 'delivery risk': 25, 'customer experience': -15 }, feedback: 'A big-bang rewrite delays all value and bets everything on one cutover day. This is the classic way these projects fail.' },
            { label: 'Leave it as it is forever', score: 1, effects: { 'customer experience': -10, 'delivery risk': 5 }, feedback: 'No risk today, but the problem only grows. A gradual migration costs little at any single step.' }
          ] },
        { text: 'The payment provider has outages of a few minutes. Each time, your checkout servers pile up waiting and the whole site slows. What now?',
          choices: [
            { label: 'Timeouts with sensible retries, a circuit breaker and a bulkhead for payment calls', score: 2, effects: { 'customer experience': 25, 'delivery risk': -15 }, feedback: 'Short blips are retried, long outages fail fast with a friendly message, and the slow payment calls cannot starve the rest of the site.' },
            { label: 'Retry forever until the provider comes back', score: 0, effects: { 'customer experience': -25 }, feedback: 'Every waiting request holds resources, so one outage becomes a total outage for the shop.' },
            { label: 'Add a second payment provider straight away', score: 1, effects: { 'customer experience': 10, 'delivery risk': 10 }, feedback: 'A useful long-term option, but it does not stop the pile-up; without a breaker you will still wait on a failing one.' }
          ] }
      ],
      outro: 'The pattern: **name the pain first, then pick the smallest pattern that relieves it.**' },

    { type: 'explain', prompt: 'A junior colleague wants to add CQRS, a BFF and a circuit breaker to a tiny internal tool "because they are best practice". How would you respond?',
      model: 'Patterns are proven solutions to specific problems, not boxes to tick. CQRS helps when reads and writes need separate models and scales, a BFF helps when different clients need different shapes of data, and a circuit breaker helps when a dependency fails and drags the caller down. A small internal tool probably has none of those problems, and each pattern adds moving parts to run and understand. Start simple and adopt a pattern when you can name the pain it solves.',
      keywords: ['problem', 'pattern', 'CQRS', 'BFF', 'circuit breaker', 'simple', 'complexity'] }
  ],

  flashcards: [
    { q: 'What is a sidecar, and how does an ambassador differ?', a: 'A sidecar is a helper deployed beside your app to handle a chore such as logging or security. An ambassador is a sidecar that talks to outside services on the app\'s behalf.' },
    { q: 'What problem do gateway aggregation and BFF solve?', a: 'A client making many calls. Aggregation combines them into one; a BFF gives each client type its own tailored backend.' },
    { q: 'What do retry, circuit breaker and bulkhead each protect against?', a: 'Retry: brief failures. Circuit breaker: a dependency that is down. Bulkhead: one slow dependency using up all shared resources.' },
    { q: 'How does the strangler fig pattern work?', a: 'Put a proxy in front of the old system, rebuild one slice at a time as new services, redirect traffic slice by slice, then retire the old system.' },
    { q: 'What are CQRS and competing consumers?', a: 'CQRS separates the model for changing data from the model for reading it. Competing consumers are several identical workers taking from one queue to share the load.' }
  ],

  glossary: [
    { term: 'Sidecar', def: 'A helper process deployed alongside an application, adding a capability such as logging or security without changing the app.', like: 'The sidecar on a motorbike.' },
    { term: 'API gateway', def: 'A single entry point in front of many services that routes requests and can combine or shape their answers.', like: 'A hotel concierge.' },
    { term: 'BFF', def: 'Backend for frontend: a separate small backend built for one kind of client, such as mobile or web.', like: 'A personal assistant per department rather than one for everybody.', aka: ['backend for frontend'] },
    { term: 'Strangler fig', def: 'A migration approach that replaces a legacy system gradually, slice by slice, behind a routing layer.', like: 'A vine growing round a tree until it can stand alone.' },
    { term: 'CQRS', def: 'Command Query Responsibility Segregation: using separate models for changing data and for reading it.', like: 'A shop with one counter for orders and a separate display shelf for browsing.' },
    { term: 'Competing consumers', def: 'Several identical workers reading from one queue so that each message is handled by exactly one of them.', like: 'Several tills serving one queue of customers.' }
  ],

  takeaways: [
    'A pattern is a **named, proven solution**; start from the problem, not the pattern.',
    '**Sidecar/ambassador** add chores beside an app; **gateway aggregation/BFF** shape what clients receive.',
    '**Retry, circuit breaker, bulkhead** keep failures small; **strangler fig** replaces systems safely.',
    '**CQRS** splits reading from writing; **competing consumers** share a queue among workers.'
  ],

  links: [
    { label: 'Microsoft Azure Architecture Center: Cloud design patterns', url: 'https://learn.microsoft.com/en-us/azure/architecture/patterns/' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('dl-operations', {
  eli5: 'Operations is everything that keeps software healthy once it is live: keeping settings and passwords out of the code, having backups you can really restore, watching the bill, and being the team that gets the call when it breaks.',

  cards: [
    { kind: 'story', title: 'The test that wiped the shop',
      body: `A developer, running the test suite on her laptop, sees it start deleting orders. Horrified, she realises why: months ago, to get something working quickly, someone pasted the **production** database address into the code. Her "harmless" tests were wiping real customer data.

        Nobody was careless on purpose. The mistake was structural: the code *itself* knew where production lived, so every copy of the code could reach it.

        Operations is largely the craft of making that kind of accident hard: keeping each **environment** apart, and keeping the things that *differ* between environments out of the code.` },

    { kind: 'concept', title: 'Environments and configuration',
      body: `You met environments (dev, staging, production) in the delivery lesson. They run the **same code** but behave differently: different database, different email service, different log detail.

        The trick is to keep those differences out of the code and in **configuration** that is supplied from outside when the app starts. The same artefact can then run anywhere: promote it, and only the config changes.

        The most common vehicle is **environment variables**: named values the operating system hands to the program. Many teams follow this rule of thumb (popularised by a guide called *The Twelve-Factor App*): **strict separation of config from code**.

        Good test: could you open-source your code today without exposing anything private? If not, config has leaked into the code.` },

    { kind: 'code', title: 'Config read from outside',
      body: 'The code asks for its settings; it never contains them. **Tap a line.**',
      code: { lang: 'js', src: `
        const config = {
          dbUrl: process.env.DATABASE_URL,
          paymentKey: process.env.PAYMENT_API_KEY,
          logLevel: process.env.LOG_LEVEL || 'info',
        };
        if (!config.dbUrl) {
          throw new Error('DATABASE_URL is not set');
        }`,
        notes: {
          2: 'Read from the environment. In staging this points at the staging database; in production, the production one. The same code runs in both.',
          3: 'A **secret**. It is still read from outside, but it needs extra care in how it is delivered (next cards).',
          4: 'A harmless setting with a sensible default. Not everything needs to be set explicitly.',
          6: 'Check for essential settings at **start-up** and stop straight away if one is missing. A loud failure on launch beats a mysterious one at midnight.'
        } } },

    { kind: 'concept', title: 'Secrets: the config that must stay secret',
      body: `A **secret** is configuration that gives *power* to whoever holds it: database passwords, API keys, signing keys. Leaked, it lets a stranger act as your system.

        The rules are few and strict:

        - **Never in Git.** History is forever; deleting a file later does not remove it from old commits. A secret that has been committed should be treated as leaked and replaced.
        - **Keep them in a secrets manager** (cloud providers offer them, as do open-source tools): encrypted, access-controlled, audited.
        - **Hand them to the app at runtime**, and give each app only the secrets it needs (least privilege, from the authorization module).
        - **Rotate them.** Change secrets regularly, and immediately when someone with access leaves.` },

    { kind: 'compare', title: 'Where could a secret live?',
      body: 'Ranked roughly from worst to best.',
      cols: ['Verdict', 'Why'],
      rows: [
        ['Hard-coded in the source', 'Never', 'Copied into Git, every laptop, every backup'],
        ['A config file committed to the repo', 'Never', 'Same problem, only less obvious'],
        ['An environment variable on the server', 'Acceptable', 'Out of the code, but visible to anything on the machine and easy to leak into logs'],
        ['A secrets manager, fetched at start-up', 'Best', 'Encrypted, audited, rotatable, per-app permissions']
      ],
      note: 'Environment variables are the common delivery route even for good setups: the platform reads the secret from the manager and injects it. What matters is where the secret is *kept*.' },

    { kind: 'metaphor', title: 'Spare keys and fire drills',
      body: `You keep a spare house key with a neighbour. That is a **backup**: a copy, kept somewhere else, for the day the original is lost.

        But suppose you never checked: the spare was cut wrongly years ago and does not turn. You find out when you are locked out at midnight.

        A backup you have never **restored from** is the same: a hope. And **disaster recovery** is the fire drill. It is not the copy; it is the *rehearsed plan* for getting everything running again, including who does what, in what order.

        Where the metaphor stops: a lost house key does not usually take the neighbour's key with it. Keep copies in a *different place* from the thing they protect, such as another zone or region.` },

    { kind: 'concept', title: 'How much loss, how much downtime?',
      body: `Two numbers turn "we have backups" into a real plan. Ask the business, not just the engineers.

        | Term | Question it answers |
        |---|---|
        | **RPO** (recovery point objective) | How much recent data can we afford to lose? |
        | **RTO** (recovery time objective) | How long can we afford to be down? |

        A nightly backup means that, at worst, you lose up to a day of data: an RPO of about 24 hours. If that is unacceptable, back up more often, or replicate data continuously. A tight RTO needs a standby ready to go, which costs money.

        A sensible habit is the **3-2-1 rule**: three copies, on two kinds of storage, with one kept off-site. And **test restores on a schedule**.` },

    { kind: 'concept', title: 'Cost is a feature you operate',
      body: `In the cloud, every decision has a price tag that updates every second. Cost awareness is a skill for builders, not just for finance.

        - **Tag resources** with who owns them and what for, so the bill can be read.
        - **Set budgets and alerts**, so a runaway job is a notification rather than a surprise.
        - **Switch off what is idle:** test environments overnight, forgotten experiments.
        - **Right-size:** a server that is never above 10% busy is probably too big.
        - **Watch data leaving the cloud.** Moving data *out* to the internet or between regions is usually charged, and often overlooked.

        None of this means "always the cheapest". It means every cost has an owner who knows why it exists.` },

    { kind: 'concept', title: 'You build it, you run it',
      body: `In many old organisations, developers wrote the code and threw it over a wall to a separate operations team, who ran it and got woken up when it broke. The developers never felt the consequences of their own design.

        **"You build it, you run it"** closes the loop. The team that builds a service is also on call for it. The effect is practical: people write better logging, add health checks, and think twice about risky releases, because it is *their* 3am.

        Supporting it:

        - **Runbooks:** short guides for known problems ("if the queue is backing up, do this").
        - **Blameless post-mortems:** after an incident, find what in the *system* allowed the error, not who to blame.
        - **Sustainable on-call:** shared rota, fair rest, alerts worth waking up for.` },

    { kind: 'pitfall', title: 'The backup nobody ever restored',
      body: `The classic operational horror story is not "we had no backups". It is "we had backups, and when we needed them they were empty, corrupt, or incomplete".

        Typical causes:

        - The backup job quietly failed for months and nobody was alerted.
        - It saved the database but not the uploaded files.
        - The backup lived in the **same place** as the original, so the same accident destroyed both.
        - Nobody knew *how* to restore, or how long it would take.

        The fix is dull and effective: **alert when a backup fails, keep copies elsewhere, and rehearse a real restore** on a regular schedule. A restore you have timed gives you an honest RTO.` }
  ],

  activities: [
    { type: 'mcq', after: 2, q: 'Why is it better for an app to read its database address from an environment variable than to have it written in the code?',
      options: ['One build runs in every environment; only the config changes', 'Environment variables are read faster than values in code', 'It stops anyone from ever finding the address', 'The code no longer needs a database'],
      answer: 0,
      why: [null, 'Speed is not affected. This is about flexibility and safety.', 'Environment variables are not a hiding place; it is about keeping environment details out of the code.', 'The app still needs the database; it just learns where it is at start-up.'],
      explain: 'Separating config from code lets you build once and promote the same artefact through dev, staging and production, and stops the code itself knowing where production lives.' },

    { type: 'bucket', after: 4, prompt: 'Sort each item: is it a secret, ordinary config, or something that stays in code?', buckets: ['Secret', 'Ordinary config', 'Stays in code'],
      items: [['The database password', 0], ['A payment provider\'s API key', 0], ['The private key used to sign tokens', 0], ['The log level (info or debug)', 1], ['The staging email service\'s web address', 1], ['The algorithm that calculates delivery fees', 2]],
      explain: 'Secrets give power and need a secrets manager. Ordinary config differs by environment but is harmless to read. Business logic is the code itself and does not vary by environment.' },

    { type: 'tf', after: 6, statement: 'If your backup job runs every night without errors, you can be confident you could restore from it.', answer: false,
      explain: 'A job that runs is not a restore that works. Backups can be empty, incomplete or unreadable. Only a rehearsed restore proves it, and it also tells you how long recovery really takes.' },

    { type: 'spot', prompt: 'Tap the line that should never be committed to Git.',
      code: { lang: 'js', src: `
        const db = connect({
          host: process.env.DB_HOST,
          user: 'app',
          password: 'S3cret-prod-2024',
        });` },
      lines: [4],
      explain: 'A literal password in source ends up in the Git history and every copy of the repo. Read it from the secrets manager (via an environment variable) instead, and replace this one: it should be treated as leaked.' },

    { type: 'match', prompt: 'Match each operations term to its meaning.',
      pairs: [['RPO', 'How much recent data you can afford to lose'], ['RTO', 'How long you can afford to be down'], ['Runbook', 'A short guide for dealing with a known problem'], ['Blameless post-mortem', 'Finding what in the system allowed an incident'], ['Secret rotation', 'Regularly replacing passwords and keys']] },

    { type: 'estimate', q: 'A shop backs up its database once a night, at 2am. A disaster strikes just before the next backup. Roughly how many hours of orders could be lost in the worst case?', answer: 24, unit: 'hours', tolerance: 1.5,
      explain: 'Everything since the last backup is gone, so the worst case is almost a full 24 hours. That is the RPO. To shrink it, back up more often or replicate continuously.' },

    { type: 'short', q: 'What one word describes regularly changing a password or key so a leaked one stops working?', accept: ['rotate', 'rotation', 'rotating', 'rotated'], hint: 'Like crops, or tyres.',
      explain: 'Rotation limits how long a leaked secret is useful, and it should happen straight away when someone with access leaves.' },

    { type: 'scenario', title: 'The bill, the leak and the Sunday outage', intro: 'You have just taken over operations for a growing app. In your first week three things go wrong, one after another.',
      meters: { 'customer trust': 60, 'money': 60, 'sleep': 70 },
      steps: [
        { text: 'A contractor reports that a live API key is visible in the public repository. What is the first thing you do?',
          choices: [
            { label: 'Rotate the key now, then remove it and audit the logs for misuse', score: 2, effects: { 'customer trust': 15, sleep: -5 }, feedback: 'Assume anything committed is leaked: replace it first. Deleting the file alone would leave the old key in the history, still working.' },
            { label: 'Delete the file and carry on', score: 0, effects: { 'customer trust': -25 }, feedback: 'The key still lives in the Git history and anyone who copied the repository has it. It must be changed.' },
            { label: 'Do nothing, since nobody has complained', score: 0, effects: { 'customer trust': -30 }, feedback: 'Silence is not safety. Bots scan public repositories for keys within minutes.' }
          ] },
        { text: 'The monthly bill is double the forecast. Where do you look?',
          choices: [
            { label: 'Tagged cost reports for idle test environments, oversized servers and data leaving the cloud', score: 2, effects: { money: 25 }, feedback: 'Idle environments, over-large machines and data-transfer charges are the usual culprits, and tags tell you who owns each cost.' },
            { label: 'Switch off every server to be safe', score: 0, effects: { money: 10, 'customer trust': -30 }, feedback: 'You have saved money by taking the product down. Cost work means understanding spend, not burning the house to stop the heating bill.' },
            { label: 'Ask finance to explain it', score: 1, effects: { money: 0 }, feedback: 'Finance can see the total, not the cause. Engineers who own the resources are the ones who can find it.' }
          ] },
        { text: 'On Sunday the database server disk fails. You find the nightly backups, but nobody has ever restored one. What happens?',
          choices: [
            { label: 'Restore from the backup, time how long it takes, and then schedule regular restore drills', score: 2, effects: { 'customer trust': 10, sleep: 10, money: -5 }, feedback: 'You recover, learn the real RTO, and turn the scare into a routine so the next one is boring.' },
            { label: 'Hope the backup works and say nothing about the risk', score: 1, effects: { 'customer trust': -10, sleep: -20 }, feedback: 'It might work, but you are still blind to the next failure, and trust drops further if it does not.' },
            { label: 'Rebuild the data by hand from memory', score: 0, effects: { 'customer trust': -35, sleep: -30 }, feedback: 'There is no memory of 80,000 orders. This is exactly why a tested restore matters.' }
          ] }
      ],
      outro: 'The pattern: **assume leaks, own your costs, and rehearse the bad day before it arrives.**' },

    { type: 'explain', prompt: 'Describe what "you build it, you run it" changes for a development team, and name two practical habits that support it.',
      model: 'The team that writes a service is also on call for it, so developers feel the consequences of their own design and tend to build better logging, health checks and safer releases. Supporting habits include runbooks for known problems, blameless post-mortems that look for system causes instead of people to blame, and a fair on-call rota with alerts that are worth waking up for.',
      keywords: ['team', 'on call', 'consequences', 'runbook', 'post-mortem', 'blameless', 'logging'] }
  ],

  flashcards: [
    { q: 'Why keep configuration out of the code?', a: 'So the same artefact can run in every environment with only the config changing, and the code does not know where production lives.' },
    { q: 'What are the rules for secrets?', a: 'Never in Git, keep them in a secrets manager, hand them over at runtime with least privilege, and rotate them, especially after a leak.' },
    { q: 'What do RPO and RTO mean?', a: 'RPO: how much recent data you can afford to lose. RTO: how long you can afford to be down.' },
    { q: 'What is the 3-2-1 backup rule, and what is the crucial extra step?', a: 'Three copies, on two kinds of storage, one off-site. The extra step is to test restores regularly.' },
    { q: 'What does "you build it, you run it" mean?', a: 'The team that builds a service also operates it and is on call for it, so it feels the consequences of its own decisions.' }
  ],

  glossary: [
    { term: 'Configuration', def: 'Settings that differ between environments, supplied to the application from outside its code.', like: 'The dials on a washing machine: same machine, different wash.' },
    { term: 'Secret', def: 'A piece of configuration that gives power to whoever holds it, such as a password or API key.', like: 'The keys to the building.' },
    { term: 'Secrets manager', def: 'A service that stores secrets encrypted, controls who can read them and records every access.', like: 'A key safe with a visitors\' book.' },
    { term: 'RPO', def: 'Recovery point objective: the most recent data you are prepared to lose in a disaster, measured in time.', like: 'How much of your work the autosave might miss.' },
    { term: 'RTO', def: 'Recovery time objective: how long you can accept being down before service is restored.', like: 'How long the shop can stay shut after a flood.' },
    { term: 'Runbook', def: 'A short written procedure for diagnosing and fixing a known operational problem.', like: 'The laminated card by the fuse box.' }
  ],

  takeaways: [
    'Keep **config out of the code**; the same artefact runs everywhere.',
    '**Secrets** never go in Git: use a secrets manager, least privilege, and rotate.',
    'A backup is only real once you have **restored from it**. Know your RPO and RTO.',
    'Own your **costs**, and **you build it, you run it**: runbooks, blameless post-mortems, fair on-call.'
  ],

  links: [
    { label: 'The Twelve-Factor App: Config', url: 'https://12factor.net/config' }
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('delivery', {
  title: 'The Release Hydra',
  intro: 'Cut off one bad release and two more grow in its place. Show that you can keep main green, ship safely, describe infrastructure in files, choose cloud services wisely and run what you build.',
  questions: [
    { type: 'mcq', q: 'A team merges once a month and every merge is a nightmare. What does continuous integration change?',
      options: ['Small changes merge many times a day, each built and tested', 'Merges are done by a robot with no human review', 'The team stops using branches entirely, whatever happens', 'Tests run only on the night before a release'],
      answer: 0,
      why: [null, 'Review still happens. The robot checks build and tests; people still read changes.', 'Short-lived branches are fine. What matters is that they are merged quickly.', 'CI runs checks on every change, not just before a release.'],
      explain: 'Small, frequent merges keep copies of the code from drifting, and the automatic pipeline gives fast feedback on every one.' },

    { type: 'order', prompt: 'Put this pipeline in a sensible order.',
      items: ['Check out the code on a clean machine', 'Lint (seconds)', 'Run the tests (minutes)', 'Store the artefact', 'Promote the same artefact to staging'],
      explain: 'Fast checks first, slow checks next, and only a change that passed everything produces an artefact that is then promoted unchanged.' },

    { type: 'tf', statement: 'In continuous deployment, every change that passes the pipeline reaches production without a person clicking a button.', answer: true,
      explain: 'That is the difference from continuous delivery, where a person still chooses when to release.' },

    { type: 'bucket', prompt: 'Which release technique does each situation call for?', buckets: ['Canary', 'Blue/green', 'Feature flag'],
      items: [['Try a new version on 5% of real users and compare error rates', 0], ['Widen exposure step by step as the numbers stay healthy', 0], ['Run a full second copy and flip all traffic over at once', 1], ['Keep the old environment ready for an instant switch back', 1], ['Deploy code on Wednesday, reveal it to users on Thursday at 9am', 2], ['Turn off one misbehaving feature in seconds with no deployment', 2]],
      explain: 'Canary is gradual exposure; blue/green is a clean swap between two full copies; a flag separates deploying from releasing.' },

    { type: 'mcq', q: 'Version 2 of an app renames a database column and rewrites existing rows. It goes wrong and you roll back the code to version 1. What is the most likely problem?',
      options: ['Version 1 expects the old column, but data does not roll back', 'Version 1 refuses to start on a newer database', 'The load balancer forgets the old version', 'The rollback deletes the new column and its data automatically'],
      answer: 0,
      why: [null, 'It is not about the app refusing; it fails when it queries the missing column.', 'Load balancers are not the issue here.', 'Rollbacks of code do not touch the database.'],
      explain: 'Code is files and swaps back easily. Data changes need small, compatible steps so old and new versions can both work.' },

    { type: 'ab', q: 'Which infrastructure file is better practice?',
      a: { lang: 'tf', label: 'Password inline', src: `
        resource "aws_db_instance" "main" {
          engine   = "postgres"
          password = "hunter2-prod"
        }` },
      b: { lang: 'tf', label: 'Password referenced', src: `
        resource "aws_db_instance" "main" {
          engine   = "postgres"
          password = var.db_password   # supplied from a secrets store
        }` },
      answer: 'b',
      explain: 'The files live in Git, so an inline secret is exposed to everyone and stays in the history. Reference it from outside.' },

    { type: 'match', prompt: 'Match each tool or term to what it is.',
      pairs: [['Terraform', 'Declarative, multi-cloud infrastructure creation'], ['CloudFormation', 'AWS\'s own declarative infrastructure tool'], ['Ansible', 'Repeatable configuration of machines'], ['GitOps', 'Git as the source of truth, with an agent keeping reality matching it'], ['Immutable infrastructure', 'Replace servers instead of patching them']] },

    { type: 'multi', q: 'Which of these are the CUSTOMER\'s responsibility under the shared responsibility model on a rented virtual machine?',
      options: ['Who is allowed to read the stored data', 'Security patches for the operating system', 'The physical locks on the data centre', 'Fixing vulnerabilities in their own application code'],
      answers: [0, 1, 3],
      explain: 'The provider secures the buildings and hardware. On IaaS, the OS, your application and your data and access rules are yours.' },

    { type: 'cloze', text: 'With {{IaaS}} you manage the operating system and everything above it; with {{PaaS}} you only supply your code; with {{FaaS}} you supply a single function and pay per run; and with {{SaaS}} you use a finished application.',
      distractors: ['DaaS', 'CaaS', 'BaaS'],
      explain: 'Each step hands another layer of work to the provider, in exchange for less control.' },

    { type: 'mcq', q: 'Your service runs on three servers, all in one availability zone. What is the weakness?',
      options: ['One zone can fail as a unit, taking out all three at once', 'Availability zones cannot host more than two servers each', 'Servers in one zone cannot talk to each other', 'Three servers is too few for any cloud'],
      answer: 0,
      why: [null, 'There is no such limit.', 'Servers in a zone communicate normally.', 'The count is not the problem; the shared location is.'],
      explain: 'Spreading across zones means the loss of one data centre removes part of your capacity, not all of it.' },

    { type: 'bucket', prompt: 'Which cloud design pattern fits each problem?', buckets: ['Strangler fig', 'Gateway or BFF', 'Resilience pattern'],
      items: [['Replace a 15-year-old application one slice at a time', 0], ['Route a feature to a new service, with an easy route back', 0], ['A phone app needs five services for one screen', 1], ['A smartwatch needs a much smaller reply than the website', 1], ['A failing dependency is dragging your servers down', 2], ['One slow query starves every other feature of connections', 2]],
      explain: 'The strangler fig migrates gradually. Gateways and BFFs shape what clients receive. Retry, breaker and bulkhead contain failures.' },

    { type: 'estimate', q: 'A database is backed up once every 6 hours. A disaster hits just before the next backup. Roughly how many hours of data could be lost at worst?', answer: 6, unit: 'hours', tolerance: 1.5,
      explain: 'Everything since the last backup is lost, so the worst case is about one full backup interval. That is the RPO.' },

    { type: 'spot', prompt: 'Tap the line that makes this CI configuration unsafe.',
      code: { lang: 'yaml', src: `
        steps:
          - run: npm ci
          - run: npm run lint
          - run: ./deploy.sh production
          - run: npm test` },
      lines: [4],
      explain: 'Deploying before the tests run means a failing test cannot stop the release. Every check has to come before anything that ships.' }
  ]
});

KS.sheet('delivery', {
  title: 'CI/CD, Cloud & Infrastructure: cheat sheet',
  sections: [
    { title: 'Continuous integration',
      md: `- Merge **small and often**; keep **main green**.
        - Pipeline: checkout → install → **lint** → **test** → **build** → store **artefact**.
        - **Cheap checks first** for fast feedback; run independent jobs side by side.
        - **Build once**, promote the same artefact everywhere.
        - Flaky test = bug. Broken main = fix or revert now.
        - Branch protection: no merge without a green pipeline.` },

    { title: 'Delivery and release strategies',
      md: `| Term | Meaning |
        |---|---|
        | Delivery | Always releasable; a human picks the moment |
        | Deployment | Every passing change ships automatically |
        | Rolling | Replace servers a few at a time |
        | Blue/green | Two full copies; flip traffic at once |
        | Canary | Small slice of real traffic first, then widen |
        | Feature flag | Deploy now, release later; instant off-switch |

        Practise **rollbacks**. Change data in small, compatible steps.` },

    { title: 'Infrastructure as code',
      md: `| Idea | Note |
        |---|---|
        | Declarative | Describe the end state; tool works out the diff |
        | Imperative | List the steps to run |
        | Terraform | Declarative, many clouds, creates infrastructure |
        | CloudFormation | Declarative, AWS only |
        | Ansible | Repeatable steps to configure machines |
        | Immutable | Replace servers, never patch them |
        | GitOps | Git is the truth; agent matches reality to it |

        Beware **drift** and secrets in files.` },

    { title: 'Cloud basics',
      md: `| Model | You manage |
        |---|---|
        | IaaS | OS, runtime, app, data |
        | PaaS | App and data |
        | FaaS | One function |
        | SaaS | Only your settings |

        - **Region** = geographic area; **zone** = isolated data centre inside it. Spread across zones.
        - **Shared responsibility:** they secure the cloud, you secure what is in it.
        - Managed services trade money and control for time. Watch for lock-in.` },

    { title: 'Cloud design patterns',
      md: `| Pattern | One line |
        |---|---|
        | Sidecar / ambassador | Helper beside the app / for outside calls |
        | Gateway aggregation | Many calls become one |
        | BFF | One tailored backend per client type |
        | Retry | Backoff plus jitter, only if idempotent |
        | Circuit breaker | Stop calling a failing dependency |
        | Bulkhead | Separate resource pools |
        | Strangler fig | Replace a legacy system slice by slice |
        | CQRS | Separate read and write models |
        | Competing consumers | Many workers, one queue |

        Name the **pain** before choosing the pattern.` },

    { title: 'Operations',
      md: `- **Config out of code**; the same artefact runs everywhere.
        - **Secrets:** never in Git, use a secrets manager, least privilege, **rotate**; treat committed secrets as leaked.
        - **RPO** = data you can lose; **RTO** = downtime you can accept.
        - **3-2-1 backups**; **test restores**.
        - Cost: tag, budget alerts, switch off idle, right-size, watch data egress.
        - **You build it, you run it:** runbooks, blameless post-mortems, fair on-call.` }
  ]
});

