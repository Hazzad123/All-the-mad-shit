/* Module: ai-foundations — LLMs & AI-Assisted Coding.  Schema: docs/CONTENT_GUIDE.md.  Check with: node tools/validate.mjs ai-foundations */

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ai-how-llms-work', {
  eli5: 'A large language model is autocomplete that has read a huge amount of text: it predicts the next small chunk of text, over and over, and that turns out to be good enough to write essays and code.',

  cards: [
    { kind: 'concept', title: 'Autocomplete, but enormous',
      body: `Type "See you at" into your phone and it suggests "the" or "home" or "7". It is guessing what usually comes next, based on text it has seen before.

        A **large language model** (LLM) does the same trick, with two differences. It has learned from a vast amount of text (books, websites, code), and it is huge, so it can take into account a whole paragraph or a whole file when guessing.

        Ask it "Write a function that reverses a string" and it does not look up an answer. It writes the first piece of a plausible answer, then the next piece, and keeps going. That is the entire mechanism, and the rest of this lesson unpacks it.` },

    { kind: 'sequence', title: 'One word at a time',
      body: 'The model never writes a whole answer at once. Step through how it finishes a sentence. (The percentages are made up for illustration.)',
      actors: ['You', 'Model'],
      steps: [
        { from: 0, to: 1, label: '"The cat sat on the"', note: 'Your **prompt** goes in: the text the model must continue.' },
        { at: 1, label: 'scores every possible next piece', note: 'It produces a probability for each candidate: perhaps "mat" 40%, "sofa" 25%, "roof" 10%, and thousands of others far lower.' },
        { at: 1, label: 'picks one: "mat"', note: 'It chooses (with a dash of randomness, covered shortly) and appends it to the text.' },
        { at: 1, label: 'new input: "…sat on the mat"', note: 'The extended text becomes the new input. The model has no plan; it just continues.' },
        { at: 1, label: 'repeat until finished', note: 'This loop repeats for every piece until the model produces an "I am done" signal or hits a length limit.' },
        { from: 1, to: 0, label: 'the full answer', dashed: true, note: 'What looks like a thoughtful paragraph is thousands of tiny predictions chained together.' }
      ] },

    { kind: 'concept', title: 'Tokens: the model’s alphabet',
      body: `Models do not read letters or whole words. They read **tokens**: chunks of text, often a short word or a piece of a longer one. A rough rule for English is that one token is about three-quarters of a word.

        A word like "unbelievable" might be split into a few tokens, and unusual words, code and other languages tend to need more.

        Why you should care:

        - you are **billed** by the token
        - limits (next card) are measured in tokens
        - tokens explain odd failures: a model sees chunks, not letters, so "how many r’s are in strawberry?" can trip it up` },

    { kind: 'metaphor', title: 'The desk that holds only so much',
      body: `The **context window** is how much text the model can consider at once: your prompt, the earlier conversation, any files you pasted, *and* the reply it is writing, all counted in tokens.

        Picture a desk. Everything you want the model to use must fit on the desk. Pile on too much and things fall off the edge.

        Two surprises follow. First, the model has **no memory between chats**: each time, you hand it the pages again (chat apps do this for you behind the scenes). Second, bigger desks cost more and a very crowded desk can make the model *less* careful with details in the middle.` },

    { kind: 'compare', title: 'Training vs inference',
      body: 'Two very different phases of an LLM’s life. You only ever meet the second one.',
      cols: ['Training', 'Inference'],
      rows: [
        ['What happens', 'The model reads huge amounts of text and adjusts billions of internal numbers (its **parameters**) to predict text better', 'The finished model is run to complete *your* prompt'],
        ['When', 'Once, before release, over weeks or months', 'Every time someone sends a request'],
        ['Cost', 'Enormous: huge clusters of specialist chips', 'Small per request, large in total'],
        ['Does it learn from you?', 'Not applicable', 'No. Its parameters are frozen while it answers']
      ],
      note: 'After the first stage of training, models are usually tuned further to follow instructions and be helpful. That is why they answer questions rather than just continuing your sentence.' },

    { kind: 'code', title: 'Temperature: the randomness knob',
      body: 'Remember the model scores many candidates for the next token. **Temperature** controls how adventurously it picks. Here is a typical request. Tap the lines.',
      code: { lang: 'json', src: `
        {
          "model": "some-model",
          "temperature": 0.2,
          "messages": [
            { "role": "user", "content": "Name a pet cat" }
          ]
        }`,
        notes: {
          3: '**Low** (near 0): nearly always the top-scoring token. Focused, repeatable, a bit dull. Good for code, extraction and facts.',
          6: 'Raise it (towards 1 or above, depending on the provider) and less likely tokens get a chance: more varied and creative, also more likely to wander.'
        } },
      note: 'Even at 0, answers are mostly but not always identical. Do not treat an LLM as a function that is guaranteed to give the same output.' },

    { kind: 'concept', title: 'Hallucinations: fluent is not factual',
      body: `The model is trained to produce text that is **plausible**, not text that is **true**. Usually the two overlap. When they do not, it makes things up and says them with total confidence. That is a **hallucination**.

        In code this looks like:

        - a function or library option that does not exist (but sounds exactly right)
        - a made-up citation or web address
        - a confident explanation of how your system works, based on a guess

        It is not lying, because it has no idea of truth to betray. It is autocomplete doing what it does best: sounding right.` },

    { kind: 'concept', title: 'Knowledge cut-offs',
      body: `Training stops at a point in time, called the **knowledge cut-off**. After that the model knows nothing new: not last month’s library release, not today’s news, not your company’s code.

        For developers this bites in a specific way. The model may suggest an **old** way of doing something, or an API that has since been renamed, because that is what it saw most.

        Models also tend to be vague about their own cut-off date.

        The fix is to hand it up-to-date material (paste the documentation, or use a tool that fetches it) instead of hoping it remembers. The module after this one shows how tools can fetch that material automatically.` },

    { kind: 'tip', title: 'Rules of thumb for living with it',
      body: `Put the last three cards together and you get habits that pay off straight away:

        - **Give it the facts** (code, error messages, docs) rather than trusting memory
        - **Check anything checkable**: run the code, open the link, search the function name
        - **Lower the temperature** for tasks with one right answer
        - **Keep conversations focused**; clutter eats the context window
        - Treat the answer as a very well-read colleague’s **first draft**, not as a database lookup` }
  ],

  activities: [
    { type: 'order', after: 1, prompt: 'Put the model’s loop in order.',
      items: ['Receive the prompt text', 'Score every possible next token', 'Pick one token and append it', 'Feed the longer text back in', 'Stop when it signals it is finished'],
      explain: 'The model repeats "score, pick, append" for every token. There is no overall draft hiding behind the scenes.' },

    { type: 'mcq', after: 3, q: 'You start a brand-new chat and ask "What did we decide yesterday about the database?" Why can’t the model answer?',
      options: ['It has no memory of previous chats; only what is in its current context', 'Its context window is always empty', 'It refuses to discuss databases', 'It deletes every conversation after one hour'],
      answer: 0,
      why: [null, 'The context window holds your current prompt and conversation, but not other chats.', 'Nothing in the model stops it discussing databases.', 'Retention policies are the provider’s business, not how the model works.'],
      explain: 'The model only sees what is in its context window. Apps that seem to "remember" are quietly re-sending earlier text or notes.' },

    { type: 'match', after: 4, prompt: 'Match each term to its meaning.',
      pairs: [['Token', 'A chunk of text the model reads and writes'], ['Context window', 'How much text it can consider at once'], ['Training', 'Adjusting parameters by reading huge amounts of text'], ['Inference', 'Running the finished model on your prompt'], ['Temperature', 'How adventurous the next-token choice is']] },

    { type: 'tf', statement: 'When you chat with an LLM, it learns permanently from your conversation and will remember it for other users.', answer: false,
      explain: 'During inference the parameters are frozen. Your chat sits in the context window and is not baked into the model. (A provider may use data for later training, according to its policy, but that is a separate step.)' },

    { type: 'estimate', q: 'Roughly how many tokens is a 1,000-word English article?', answer: 1300, unit: 'tokens', min: 10, max: 100000, tolerance: 1.6,
      explain: 'A rough rule is about three-quarters of a word per token, so 1,000 words is around 1,300 tokens. Code and non-English text usually take more.' },

    { type: 'bucket', prompt: 'Which phase does each statement describe?', buckets: ['Training', 'Inference'],
      items: [['Happens once, before release, on huge clusters', 0], ['Runs every time you send a prompt', 1], ['Adjusts billions of parameters', 0], ['Parameters are frozen', 1], ['Where "temperature" is applied', 1], ['Where the model reads a vast pile of text to learn patterns', 0]],
      explain: 'Training changes the model. Inference uses the finished model without changing it, and settings like temperature only matter then.' },

    { type: 'spot', prompt: 'An AI assistant wrote this for you. One line is a classic hallucination. Which?',
      code: { lang: 'py', src: `
        import pandas as pd

        df = pd.read_csv("sales.csv")
        df = df.dropna()
        df.to_excel_instantly("report.xlsx")
        print(len(df))` },
      lines: [5],
      explain: '`to_excel_instantly` sounds perfectly plausible but does not exist (the real method is `to_excel`). Plausible-sounding invention is exactly what a hallucination looks like, so run what the model writes.' },

    { type: 'scenario', title: 'The confident answer', intro: 'You ask an AI assistant how to use a library function for a feature released only a few months ago. It replies instantly, with beautifully formatted code and total confidence.',
      meters: { 'time wasted': 10, 'trust': 60 },
      steps: [
        { text: 'You paste the code in and get an error saying the function does not exist. What is the most likely explanation?',
          choices: [
            { label: 'The model hallucinated, or its knowledge cut-off is before this library version', score: 2, effects: { 'trust': 5 }, feedback: 'Exactly. Plausible text is not verified fact, and a recent feature may sit past its cut-off.' },
            { label: 'Your computer is broken', score: 0, effects: { 'time wasted': 30 }, feedback: 'You would burn an hour reinstalling things. Confident output is not evidence.' },
            { label: 'The model lied on purpose', score: 1, effects: { 'time wasted': 10 }, feedback: 'A model has no intent to deceive. It produces likely text, and sometimes likely and true differ.' }
          ] },
        { text: 'How do you fix the situation fastest?',
          choices: [
            { label: 'Paste the library’s current documentation into the chat and ask again', score: 2, effects: { 'time wasted': -10, 'trust': 15 }, feedback: 'Giving the model the facts puts them in its context window, so it can work from them instead of guessing.' },
            { label: 'Ask the same question again, louder', score: 0, effects: { 'time wasted': 25 }, feedback: 'Rewording without new information gets you another confident guess.' },
            { label: 'Turn the temperature up so it gets creative', score: 0, effects: { 'time wasted': 20, 'trust': -10 }, feedback: 'More randomness means more invention, not more facts.' }
          ] },
        { text: 'It now gives you working code. What do you do before committing it?',
          choices: [
            { label: 'Read it, run it and test it', score: 2, effects: { 'trust': 10 }, feedback: 'Always. You are the one who ships it.' },
            { label: 'Commit it; it worked once', score: 1, effects: { 'time wasted': 15, 'trust': -10 }, feedback: 'Working once is a start, but you have not seen edge cases or whether you understand it.' },
            { label: 'Ask the model whether it is correct and trust the yes', score: 0, effects: { 'trust': -15 }, feedback: 'The same model that guessed wrong can confidently approve its own work.' }
          ] }
      ],
      outro: 'Give it facts, then **verify**.' },

    { type: 'short', q: 'Which setting controls how random the model’s token choices are? (one word)', accept: ['temperature'], hint: 'Low is calm and repeatable; high is hot and wild.',
      explain: '**Temperature** shapes how often the model picks lower-scoring tokens. Low suits factual or code tasks; higher suits brainstorming.' },

    { type: 'explain', prompt: 'A friend says "ChatGPT-style tools look things up and then tell you the truth". Correct them gently, using what you know about how LLMs work.',
      model: 'An LLM does not look things up. It predicts the next token over and over, based on patterns learned in training, so it produces plausible text, not verified facts. It can hallucinate, and its knowledge stops at a cut-off date. Some products add search or tools on top, but you should still check important claims.',
      keywords: ['predicts', 'next token', 'plausible', 'hallucinate', 'cut-off', 'training'] }
  ],

  flashcards: [
    { q: 'How does an LLM produce an answer?', a: 'By repeatedly predicting the next token given all the text so far, appending it and repeating until it is done.' },
    { q: 'What is a token and a context window?', a: 'A token is a chunk of text (about three-quarters of an English word on average). The context window is the most tokens (prompt plus reply) the model can consider at once.' },
    { q: 'Training vs inference?', a: 'Training adjusts the model’s parameters by reading huge amounts of text, once. Inference runs the finished model on your prompt, with parameters frozen.' },
    { q: 'What does temperature do?', a: 'Controls randomness in picking the next token. Low is focused and repeatable; higher is more varied and riskier.' },
    { q: 'What is a hallucination, and what is a knowledge cut-off?', a: 'A hallucination is fluent, confident output that is false. A cut-off is the date training data stops, so the model knows nothing newer unless you supply it.' }
  ],

  glossary: [
    { term: 'LLM', def: 'Large language model: a neural network trained on huge amounts of text to predict the next token, which lets it write and answer in natural language.', like: 'Autocomplete that has read most of the internet.', aka: ['large language model'] },
    { term: 'Token', def: 'A chunk of text, often a short word or part of one, that models read and write. Limits and prices are measured in tokens.', like: 'The syllables the model reads in.' },
    { term: 'Context window', def: 'The maximum amount of text, in tokens, a model can take into account at once, including its own reply.', like: 'The size of the desk everything must fit on.' },
    { term: 'Temperature', def: 'A setting for how random the model’s choices are: low is focused, higher is more varied.', like: 'A creativity dial.' },
    { term: 'Hallucination', def: 'Output that sounds right but is false or invented, such as a function that does not exist.', like: 'A confident guess delivered as fact.' },
    { term: 'Knowledge cut-off', def: 'The date after which a model’s training data stops, so it knows nothing newer unless given it.', like: 'A newspaper that stopped printing on one day.' }
  ],

  takeaways: [
    'An LLM **predicts the next token**, over and over. That is the whole trick.',
    '**Tokens** and the **context window** are measured and billed text; there is no memory between chats.',
    '**Training** builds the model once; **inference** runs it. **Temperature** sets how random it is.',
    'It is plausible, not verified: expect **hallucinations** and a **cut-off date**. Give it facts, then check.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ai-vs-traditional', {
  eli5: 'Normal code follows exact instructions and gives the same answer every time, while an AI model makes educated guesses, so you use it where a good guess is useful and always check the result.',

  cards: [
    { kind: 'concept', title: 'A calculator and a clever friend',
      body: `Ask a calculator "17 × 24" a million times and you get 408 a million times. It follows exact rules.

        Ask a clever friend the same thing quickly and you will probably get 408, but if they are tired or in a hurry, you might get 418 with total confidence.

        Normal programs are the calculator. LLMs are the clever friend. Neither is better; they are *different tools*. The skill is knowing which job needs which, and how to make them work together.` },

    { kind: 'compare', title: 'Deterministic vs probabilistic',
      body: 'A **deterministic** system gives the same output for the same input. A **probabilistic** one picks from likely outputs, so repeats can differ.',
      cols: ['Traditional code', 'LLM'],
      rows: [
        ['Same input twice', 'Same output, every time', 'Often similar, not guaranteed identical'],
        ['When it is wrong', 'A bug you can find and fix', 'A guess that was off; no line to point at'],
        ['Tested by', 'Unit tests with exact expectations', 'Examples, spot checks and judgement'],
        ['Good for', 'Exactness: money, rules, maths', 'Fuzziness: language, summaries, patterns'],
        ['Cost per run', 'Tiny', 'Noticeable, and slower']
      ] },

    { kind: 'code', title: 'Same job, two worlds',
      body: 'Both of these "work out the VAT on an order". One is a rule; one is a request. Tap the lines.',
      code: { lang: 'js', src: `
        // Traditional: exact, instant, testable
        function vat(net) {
          return Math.round(net * 0.2 * 100) / 100;
        }

        // Probabilistic: a guess in words
        const answer = await askModel(
          'What is 20% VAT on £48.35?'
        );`,
        notes: {
          3: 'Always the same answer for the same input. You can write a unit test and trust it for ever.',
          7: 'The model *probably* gets it right. Probably is not good enough for an invoice.',
          8: 'The input is a sentence, not a typed value, so errors can also hide in how you phrased it.'
        } },
      note: 'The sensible split: let code do the sums and let the model do the language.' },

    { kind: 'metaphor', title: 'Recipe vs a chef who has eaten everywhere',
      body: `Traditional code is a **recipe**: exact quantities, exact order, same cake every time. If the cake is bad, you can point to the step that caused it.

        An LLM is a **chef who has eaten at ten thousand restaurants**. Ask for "something Italian and quick" and you get a good result, a different one each time. Brilliant for ideas, bad if you need exactly 200g of flour.

        And a chef who has *never been told about your kitchen* will cheerfully call for equipment you do not have. That is the next point.` },

    { kind: 'compare', title: 'What AI is good and bad at',
      body: 'A fair summary of today’s models, as a developer’s assistant.',
      cols: ['Usually good', 'Usually bad'],
      rows: [
        ['Writing', 'Boilerplate, first drafts, repetitive code', 'Subtle logic with many interacting rules'],
        ['Understanding', 'Explaining unfamiliar code, translating between languages', 'Your private code, unless you show it'],
        ['Knowledge', 'Well-known libraries and common patterns', 'New releases, obscure tools, anything after its cut-off'],
        ['Precision', 'Brainstorming edge cases and alternatives', 'Exact arithmetic and counting, security guarantees'],
        ['Self-awareness', 'Often says what it is unsure of when asked', 'Often sounds equally confident when wrong']
      ] },

    { kind: 'concept', title: 'You are still responsible',
      body: `Here is the rule that matters most: **if you commit it, it is yours.**

        When a pull request has your name on it, "the AI wrote it" is not an excuse to the customer whose data leaked or the colleague who is paged at 3am. The model carries no responsibility. You do.

        Practical consequences:

        - read AI code the way you would read a stranger’s pull request
        - make sure you could explain every line to a colleague
        - never paste secrets, passwords or customer data into a tool your company has not approved
        - check licences and company rules about where code may be sent` },

    { kind: 'diagram', title: 'Where AI fits in the development loop',
      body: 'AI can help at every stage, but a human decision sits at each one. The loop is the one you already know.',
      nodes: [
        { id: 'plan', label: 'Understand & plan', icon: '🧭', x: 1, y: 0, tone: 'info' },
        { id: 'code', label: 'Write the code', icon: '⌨️', x: 1, y: 1, tone: 'accent' },
        { id: 'test', label: 'Test it', icon: '🧪', x: 1, y: 2, tone: 'good' },
        { id: 'review', label: 'Review it', icon: '👀', x: 1, y: 3, tone: 'warn' },
        { id: 'ship', label: 'Ship & operate', icon: '🚀', x: 1, y: 4 }
      ],
      edges: [
        { from: 'plan', to: 'code', label: 'draft with AI' },
        { from: 'code', to: 'test', label: 'tests with AI' },
        { from: 'test', to: 'review', label: 'second pair of eyes' },
        { from: 'review', to: 'ship', label: 'you decide' }
      ],
      caption: 'AI accelerates the loop. It does not remove the humans from it.' },

    { kind: 'pitfall', title: 'Believing it because it compiles',
      body: `Code that runs is not code that is **right**. AI-generated code often passes the first try and still hides trouble:

        - it handles the happy case and ignores errors
        - it works for your three examples and fails on the fourth
        - it quietly invents a security weakness, like building a query out of user input
        - it is correct, but nothing like the rest of your codebase

        Then there is **automation bias**: we trust a smooth, confident machine more than we should. Accepting changes you did not read creates code nobody understands, and that debt always arrives for payment.` },

    { kind: 'tip', title: 'Use AI where checking is cheap',
      body: `A handy rule: **use AI where the answer is expensive to write but cheap to verify.**

        - Writing a regular expression you can test against ten examples: great
        - Generating test data, boilerplate or a first draft of docs: great
        - Explaining a function you can then confirm by running it: great
        - Designing security-critical logic that you cannot easily check: be careful

        If checking would take longer than writing it yourself, that is a sign to do it yourself, or to slow down.` }
  ],

  activities: [
    { type: 'tf', after: 1, statement: 'If you send exactly the same prompt to an LLM twice, you are guaranteed an identical reply.', answer: false,
      explain: 'The model picks among likely tokens, so replies often differ, even at low temperature. A traditional function, given the same input, always returns the same output.' },

    { type: 'bucket', after: 4, prompt: 'Which tool suits each job best?', buckets: ['Plain code', 'An LLM'],
      items: [['Calculating exact VAT on an invoice', 0], ['Summarising 200 customer comments into themes', 1], ['Checking a password meets length rules', 0], ['Drafting a friendly apology email', 1], ['Rounding money to the nearest penny', 0], ['Explaining what an unfamiliar function does', 1]],
      explain: 'Anything with one exact answer belongs in code. Anything fuzzy, linguistic or exploratory suits a model, and the output should still be checked.' },

    { type: 'mcq', after: 5, q: 'An AI assistant wrote a function that your team merged without anyone reading it. It causes a data leak. Who is responsible?',
      options: ['The people who merged it', 'The AI tool, because it wrote the code', 'Nobody, because the code came from a machine', 'The vendor of the editor'],
      answer: 0,
      why: [null, 'A tool has no accountability; people and organisations do.', 'Someone always owns what goes to production.', 'Tool terms usually say the user is responsible for what they ship.'],
      explain: 'You are responsible for everything you ship, whoever or whatever wrote it. That is why reading and testing AI output is not optional.' },

    { type: 'ab', q: 'You need to convert user-entered amounts to pennies for a payment system. Which is the better design?',
      a: { lang: 'js', label: 'Ask the model', src: `
        const pence = await askModel(
          'Convert ' + input + ' to pence'
        );` },
      b: { lang: 'js', label: 'Plain function', src: `
        function toPence(pounds) {
          return Math.round(pounds * 100);
        }` },
      answer: 'b',
      explain: 'Money needs exactness, speed and tests. A deterministic function gives all three at near-zero cost, while a model call can be slow, costly and occasionally wrong.' },

    { type: 'multi', q: 'Which habits fit "you are still responsible for the code"?',
      options: ['Read AI-written code like a stranger’s pull request', 'Be able to explain each line to a teammate', 'Run and test it before merging', 'Skip review when the AI says it is confident', 'Paste customer data into any tool that gives better answers'],
      answers: [0, 1, 2],
      explain: 'Responsible use means reading, understanding and testing. A model’s confidence is not evidence, and customer data must stay within approved tools.' },

    { type: 'order', prompt: 'A healthy way to use AI on a small feature. Put the steps in order.',
      items: ['Describe the task and constraints clearly', 'Ask the AI for a draft', 'Read the draft and understand it', 'Run it and add tests', 'Submit it for human review'],
      explain: 'The draft only gets valuable after you read, understand and test it, and then a second human looks at it too.' },

    { type: 'scenario', title: 'The suspiciously smooth pull request', intro: 'A junior colleague opens a pull request with a new login feature. They admit an AI assistant wrote most of it, and it "seems to work".',
      meters: { 'security': 50, 'team trust': 60 },
      steps: [
        { text: 'You are the reviewer. How do you start?',
          choices: [
            { label: 'Review it exactly as you would anyone’s code, with extra attention to anything security-related', score: 2, effects: { 'security': 20 }, feedback: 'Right. Where the code came from does not change what it must satisfy. Authentication deserves the closest look.' },
            { label: 'Approve it; the AI is probably better at this than us', score: 0, effects: { 'security': -35, 'team trust': -15 }, feedback: 'Models write plausible code, and plausible login code with a subtle flaw is how breaches happen.' },
            { label: 'Reject it just because AI wrote it', score: 1, effects: { 'team trust': -15 }, feedback: 'The origin is irrelevant. Judge the code, not the author. Rejecting out of principle teaches people to hide their tools.' }
          ] },
        { text: 'You spot that the code builds its database query by joining strings with the username. What now?',
          choices: [
            { label: 'Ask for a parameterised query and explain why, then have a test for it', score: 2, effects: { 'security': 25, 'team trust': 10 }, feedback: 'You have prevented SQL injection and taught the reason. Adding a test locks the fix in.' },
            { label: 'Quietly fix it yourself and say nothing', score: 1, effects: { 'security': 15 }, feedback: 'The bug is fixed, but your colleague learns nothing and will repeat it next time.' },
            { label: 'Ask the AI to confirm whether it is secure and trust the yes', score: 0, effects: { 'security': -20 }, feedback: 'The tool that wrote the weakness may happily reassure you. Verification needs independent checking.' }
          ] },
        { text: 'Finally, the team asks for a policy on AI-written code. What do you suggest?',
          choices: [
            { label: 'Allow it, with the rule that the author owns and must understand everything they submit', score: 2, effects: { 'team trust': 20, 'security': 10 }, feedback: 'It keeps the speed benefit and the accountability together.' },
            { label: 'Ban it entirely', score: 1, effects: { 'team trust': -10 }, feedback: 'Simple, but it gives up real productivity and is hard to enforce.' },
            { label: 'Allow it with no review standard changes, because the AI is "good enough"', score: 0, effects: { 'security': -25 }, feedback: 'Speed without accountability is how weak code reaches production.' }
          ] }
      ],
      outro: 'Whoever or whatever wrote the code, **the human who merges it owns it**.' },

    { type: 'short', q: 'A system that always produces the same output for the same input is called what? (one word: starts with "d")', accept: ['deterministic'], hint: 'The opposite of probabilistic.',
      explain: '**Deterministic** systems, like ordinary functions, are completely predictable. LLMs are probabilistic.' },

    { type: 'explain', prompt: 'Explain to a teammate when you would use an LLM and when you would write plain code, with one example of each.',
      model: 'I would use plain code when the answer must be exact and repeatable, such as calculating tax or validating a rule. I would use an LLM when the task is fuzzy or language-based, such as summarising comments or drafting a first version of docs, and I would still check the result because the model is probabilistic and can be wrong.',
      keywords: ['exact', 'deterministic', 'probabilistic', 'check', 'summaris', 'draft'] }
  ],

  flashcards: [
    { q: 'Deterministic vs probabilistic?', a: 'Deterministic: same input always gives the same output (normal code). Probabilistic: output is picked from likely options, so it can vary (LLMs).' },
    { q: 'What are LLMs usually good and bad at in coding?', a: 'Good at boilerplate, drafts, explanations and translations. Bad at exact arithmetic, subtle logic, your private code if unseen, and anything past their cut-off.' },
    { q: 'Who is responsible for AI-generated code you commit?', a: 'You are. Read it like a stranger’s pull request, understand it, test it and review it before it ships.' },
    { q: 'Where does AI fit in the development loop?', a: 'Everywhere: planning, drafting code, generating tests and review. But a human decides at each stage.' },
    { q: 'What is a good rule for when to use AI?', a: 'Use it where the answer is expensive to write but cheap to verify.' }
  ],

  glossary: [
    { term: 'Deterministic', def: 'Always giving the same output for the same input, as ordinary functions do.', like: 'A calculator.' },
    { term: 'Probabilistic', def: 'Choosing among likely outputs, so repeated runs can differ, as language models do.', like: 'A clever friend’s educated guess.' },
    { term: 'Automation bias', def: 'The tendency to trust a confident, automated answer more than you should and to skip checking it.', like: 'Following the satnav into a lake.' },
    { term: 'Boilerplate', def: 'Repetitive, predictable code that has to be written but contains little real thought.', like: 'The standard paragraph in every contract.' }
  ],

  takeaways: [
    'Code is **deterministic**; models are **probabilistic**. Put exact jobs in code and fuzzy ones to the model.',
    'AI is strong on boilerplate, drafts and explanations; weak on exactness, new things and your private context.',
    '**If you commit it, you own it.** Read, understand and test everything.',
    'Use AI where answers are **cheap to verify**.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ai-prompting', {
  eli5: 'A prompt is the brief you give the model, and like briefing a smart new colleague, clear goals, context, examples and a few rounds of feedback get far better results than a vague one-liner.',

  cards: [
    { kind: 'concept', title: '"Make it better"',
      body: `You paste a function into an AI assistant and type: **"make this better."**

        Better how? Faster? Shorter? Safer? More readable? Now imagine handing the same sticky note to a human colleague. They would come back with questions. The model usually does not: it just guesses what you meant and answers confidently.

        That is the whole idea of **prompting**: the model can only work with what is in the prompt, so the quality of what comes out depends heavily on the quality of what goes in. Good prompting is not a trick. It is clear communication.` },

    { kind: 'metaphor', title: 'Briefing a brilliant new starter',
      body: `Picture a very clever new colleague on day one. They have read an enormous amount, they can write in any language, and they work instantly.

        But they know *nothing* about your project, your team’s conventions, or what you want. They cannot read your mind or see your screen.

        You would not say "fix the thing". You would say what you are trying to achieve, show them the relevant code, explain the constraints, and say what a good answer looks like.

        Prompting is exactly that briefing, written down. The model is not psychic, and neither is the new starter.` },

    { kind: 'compare', title: 'A weak brief and a strong brief',
      body: 'Same task, two prompts. Look at what the second one supplies.',
      cols: ['Weak', 'Strong'],
      rows: [
        ['Goal', '"Make this better"', '"Reduce the number of database queries in this function"'],
        ['Context', 'Nothing', '"It runs once per page view in a Node app using Postgres"'],
        ['Constraints', 'None', '"Keep the function name and return type; no new libraries"'],
        ['Output format', 'Whatever it likes', '"Show the new code, then three bullet points on what changed"'],
        ['What it will do', 'Guess and rewrite everything', 'Aim at your target, in a shape you can review']
      ] },

    { kind: 'code', title: 'Anatomy of a good prompt',
      body: 'Here is a prompt a developer might actually send. Tap the lines to see the job each one does.',
      code: { lang: 'text', src: `
        You are reviewing a Node.js function for a Postgres app.
        Goal: reduce database queries without changing behaviour.
        Constraints: keep the name and return type; no new libraries.

        Code:
        <paste the function here>

        Reply with the improved code, then a short bullet list
        explaining each change. If anything is unclear, ask first.`,
        notes: {
          1: '**Context**: who and what, so the model knows the world it is in.',
          2: 'A single, specific **goal**. Notice it says what must *not* change too.',
          3: '**Constraints** stop it solving the problem in ways you cannot use.',
          6: 'The thing to work on. Always give the real material rather than describing it.',
          8: 'The **format** you want back, so the answer is easy to review.',
          9: 'Inviting questions lets it say "I am not sure" instead of guessing.'
        } } },

    { kind: 'example', title: 'Show, don’t only tell: few-shot prompting',
      body: `Describing a format in words is slippery. Showing two examples is crystal clear. Giving a model worked examples inside the prompt is called **few-shot prompting** ("shot" means example). With none, it is **zero-shot**.

        Suppose you want commit messages in your team’s style:`,
      code: { lang: 'text', src: `
        Write a commit message in our style.

        Change: fixed crash when basket is empty
        Message: fix(basket): handle empty basket at checkout

        Change: added rate limit to login
        Message: feat(auth): rate-limit login attempts

        Change: renamed userId to accountId in billing
        Message:`,
        notes: {
          3: 'Example one: the model sees the pattern *type(area): summary*.',
          6: 'Example two confirms it. Two or three varied examples usually beat a paragraph of description.',
          9: 'The model now completes the pattern for the new change.'
        } },
      note: 'Choose examples that are varied and correct. The model copies their mistakes as faithfully as their style.' },

    { kind: 'concept', title: 'Ask it to think in steps',
      body: `Models write one token at a time, so a hard question answered *instantly* gets only one shot to be right. If you ask the model to **work through it step by step**, it writes out its reasoning first, and each step becomes context for the next. This often improves results on tricky logic or maths.

        For code, a useful pattern is: "First, list the steps you would take. Then write the code."

        Honest footnote: many modern models already reason before answering, so the magic words matter less than they used to. Asking for a plan is still valuable, though, because **you can read the plan and correct it before any code exists**.` },

    { kind: 'code', title: 'System prompts and roles',
      body: 'Chat APIs split the conversation into **roles**. The **system** message sets standing instructions; **user** messages are the individual requests. Tap the lines.',
      code: { lang: 'json', src: `
        [
          { "role": "system",
            "content": "You are a code reviewer for our Python team. Be concise. Follow PEP 8." },
          { "role": "user",
            "content": "Review this function: ..." }
        ]`,
        notes: {
          3: 'The **system prompt** sits above the whole conversation: tone, standing rules and the role to play. Apps use it to give an assistant a consistent personality.',
          5: 'The **user** turn is today’s actual request.'
        } },
      note: 'A "role" like code reviewer helps set the focus and tone. It does not make the model more knowledgeable. And a system prompt is not a security boundary: assume users can coax it out.' },

    { kind: 'steps', title: 'Iterating: prompts are first drafts',
      body: 'Nobody writes the perfect prompt first time. Treat it like debugging.',
      steps: [
        { title: 'Run it and read the output', body: 'Actually read it. What is wrong, missing or surprising?' },
        { title: 'Diagnose what the model lacked', body: 'Usually it is missing context, a constraint, a format or an example. Ask yourself what a colleague would have needed.' },
        { title: 'Change one thing', body: 'Adjust a single element so you know what helped. Changing five things at once teaches you nothing.' },
        { title: 'Try again, and keep what works', body: 'Save good prompts as templates. For a prompt your app depends on, test it against a set of example inputs, not just one.' }
      ] },

    { kind: 'pitfall', title: 'Common ways prompts go wrong',
      body: `- **Contradictions.** "Be brief but explain everything in detail." The model has to pick, and you will not like which.
        - **Burying the point.** A request lost in the middle of a giant pasted file can be missed.
        - **Only saying what not to do.** "Don’t use loops" often works less well than "use map and filter".
        - **Secrets in the prompt.** Passwords and customer data should not go to a service you have not approved.
        - **Accepting the first answer.** The first reply is a draft. Follow up, point at what is wrong, and ask for changes.` }
  ],

  activities: [
    { type: 'ab', after: 2, q: 'Which prompt is likely to get a more useful answer?',
      a: { lang: 'text', label: 'Vague', src: `
        Make this function better.` },
      b: { lang: 'text', label: 'Specific', src: `
        Reduce database queries in this
        Node function. Keep its name and
        return type. Show code, then
        bullet-point changes.` },
      answer: 'b',
      explain: 'The second names a goal, constraints and a format. The model no longer has to guess what "better" means, and you can check the result against clear criteria.' },

    { type: 'match', after: 4, prompt: 'Match each technique to what it does.',
      pairs: [['Zero-shot', 'Ask with no examples'], ['Few-shot', 'Include worked examples in the prompt'], ['Step by step', 'Have the model reason or plan before answering'], ['System prompt', 'Standing instructions above the whole conversation'], ['Iteration', 'Refining the prompt after reading the output']] },

    { type: 'mcq', after: 5, q: 'Why can asking for a plan before the code be useful, even with models that already reason internally?',
      options: ['You can read and correct the plan before any code is written', 'It makes the model cheaper to run', 'It guarantees the code has no bugs', 'It stops the model forgetting the conversation'],
      answer: 0,
      why: [null, 'A longer answer usually costs *more*, not less.', 'Nothing guarantees bug-free code; you still need to test.', 'Memory limits come from the context window, not from planning.'],
      explain: 'A plan is a cheap checkpoint. If its approach is wrong, you fix it in one sentence instead of unpicking a lot of code.' },

    { type: 'spot', prompt: 'A developer wrote this prompt for a code-review assistant. Tap the line that works against the others.',
      code: { lang: 'text', src: `
        You are a code reviewer for our Python team.
        Review the function below for bugs.
        Keep your answer under five sentences.
        Explain every issue in exhaustive detail.
        Do not rewrite the code.` },
      lines: [4],
      explain: 'Line 3 asks for brevity and line 4 asks for exhaustive detail, so the model has to ignore one. Contradictory instructions make results unpredictable.' },

    { type: 'cloze', text: 'Giving a model a few worked examples in the prompt is called {{few-shot}} prompting, and standing instructions placed above the whole chat are the {{system}} prompt, while a single request is a {{user}} message.',
      distractors: ['zero-shot', 'temperature', 'token'],
      explain: 'Few-shot means including examples. The system message sets the standing rules; user messages carry each request.' },

    { type: 'bucket', prompt: 'Does each item belong in a good prompt, or does it risk trouble?', buckets: ['Helps', 'Risky or unhelpful'],
      items: [['The error message and the relevant code', 0], ['"Keep the existing function names"', 0], ['A request to ask a question if anything is unclear', 0], ['Your production database password', 1], ['Two contradictory instructions', 1], ['"Make it good" with nothing else', 1]],
      explain: 'Real material, constraints and an escape hatch help. Secrets, contradictions and vagueness are the classic ways prompts fail.' },

    { type: 'scenario', title: 'The commit-message bot', intro: 'Your team wants an assistant that writes commit messages in your house style. Your first attempt is the prompt: "Write a commit message."',
      meters: { 'quality': 30, 'consistency': 20 },
      steps: [
        { text: 'The results are sensible but all different in style. What do you try first?',
          choices: [
            { label: 'Add two or three real examples of your preferred style', score: 2, effects: { 'quality': 20, 'consistency': 40 }, feedback: 'Few-shot examples are the quickest way to pin down a format. Showing beats describing.' },
            { label: 'Turn the temperature up for more variety', score: 0, effects: { 'consistency': -25 }, feedback: 'More randomness means less consistency, the opposite of what you want.' },
            { label: 'Write a 500-word description of the style', score: 1, effects: { 'quality': 5, 'consistency': 10 }, feedback: 'It can help, but long descriptions are fuzzier than two clear examples and easy to contradict.' }
          ] },
        { text: 'It still sometimes writes a long paragraph instead of one line. How do you fix that?',
          choices: [
            { label: 'State the rule plainly: "one line, under 72 characters, no full stop"', score: 2, effects: { 'quality': 15, 'consistency': 25 }, feedback: 'Specific, checkable constraints are easy for the model to follow, and for you to test.' },
            { label: 'Replace the whole prompt with something new', score: 1, effects: { 'quality': -5, 'consistency': -10 }, feedback: 'You lose what worked. Change one thing at a time.' },
            { label: 'Ignore it; it only happens occasionally', score: 0, effects: { 'consistency': -20 }, feedback: 'Occasional problems are the ones that surface in front of a customer.' }
          ] },
        { text: 'It works on your five test changes. Before rolling it out to the team, what should you do?',
          choices: [
            { label: 'Try it on a wider set of real changes, including awkward ones', score: 2, effects: { 'quality': 15, 'consistency': 10 }, feedback: 'A prompt that works on five handpicked cases may fail on the sixth. Test on varied inputs.' },
            { label: 'Ship it; five is plenty', score: 0, effects: { 'quality': -15 }, feedback: 'Prompts are fragile. A few more varied inputs would reveal the gaps cheaply.' },
            { label: 'Pin the temperature at zero and call it done', score: 1, effects: { 'consistency': 10 }, feedback: 'Low temperature helps consistency, but it does not replace testing.' }
          ] }
      ],
      outro: 'Show examples, state checkable rules, change one thing at a time and **test on varied inputs**.' },

    { type: 'short', q: 'Giving a model no examples at all in the prompt is called ___-shot prompting. Fill in the blank.', accept: ['zero', '0'], hint: 'It is the number of examples.',
      explain: '**Zero-shot** means no examples. One or more examples makes it one-shot or few-shot.' },

    { type: 'explain', prompt: 'A colleague complains "the AI keeps giving me useless answers". Tell them what you would change about how they ask.',
      model: 'I would brief it like a new colleague: state the goal, give the relevant code and context, add constraints and the format I want, and include an example if the style matters. Then I would read the answer, change one thing, and iterate instead of accepting or abandoning the first reply.',
      keywords: ['goal', 'context', 'constraints', 'format', 'example', 'iterate'] }
  ],

  flashcards: [
    { q: 'What makes a prompt clear?', a: 'A specific goal, the relevant context and real material, constraints, and the output format you want.' },
    { q: 'What is few-shot prompting?', a: 'Including a few worked examples in the prompt so the model copies the pattern. With no examples it is zero-shot.' },
    { q: 'Why ask for step-by-step reasoning or a plan?', a: 'It lets the model work through the problem in text, and lets you read and correct the approach before any code is written.' },
    { q: 'What is a system prompt?', a: 'A standing instruction at the top of a conversation that sets role, tone and rules. It is not a security boundary.' },
    { q: 'How should you iterate on a prompt?', a: 'Read the output, diagnose what was missing, change one thing, retry, and test on varied inputs.' }
  ],

  glossary: [
    { term: 'Prompt', def: 'The text you send a model: instructions, context, examples and the material to work on.', like: 'A written brief for a colleague.' },
    { term: 'Few-shot prompting', def: 'Including a few worked examples in the prompt so the model follows the pattern.', like: 'Showing a new starter two finished reports.', aka: ['few-shot'] },
    { term: 'Zero-shot prompting', def: 'Asking the model to do something with instructions only and no examples.', like: 'Giving a task with no samples.' },
    { term: 'System prompt', def: 'Standing instructions placed above a conversation, setting the model’s role, tone and rules.', like: 'The job description on the wall.' },
    { term: 'Prompt iteration', def: 'Refining a prompt over several rounds, changing one thing at a time and checking the output.', like: 'Debugging, for words.' }
  ],

  takeaways: [
    'The model only knows what is in the prompt, so **brief it like a smart new colleague**.',
    'Good prompts state **goal, context, constraints and format**.',
    '**Examples** (few-shot) beat long descriptions; a **plan first** lets you steer.',
    '**Iterate**: read, diagnose, change one thing, retest on varied inputs.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ai-coding-tools', {
  eli5: 'AI coding tools come in three flavours: a chat you ask questions, autocomplete that finishes your lines, and agents that read and change your project, which is why you must supervise them.',

  cards: [
    { kind: 'metaphor', title: 'A tutor, a finisher and an intern',
      body: `Three different kinds of AI help sit under the label "coding assistant".

        - A **chat assistant** is a tutor. You paste code and ask questions; it talks back.
        - **Editor autocomplete** is a friend who finishes your sentences. As you type, grey text appears that you accept with Tab.
        - A **coding agent** is an intern with the keys to the office. You give it a task; it reads files, changes them, runs commands and reports back.

        Most products now do more than one. But the *kind of help* matters, because it decides how much the tool can see and how much damage it can do.` },

    { kind: 'compare', title: 'The three modes side by side',
      body: 'Think of this as increasing power, and increasing need for supervision.',
      cols: ['Chat', 'Autocomplete', 'Agent'],
      rows: [
        ['How you use it', 'Ask, paste, read the reply', 'Type; accept or ignore a suggestion', 'Describe a task; review the result'],
        ['What it sees', 'Only what you paste', 'Your open file and nearby code', 'Your project, and the output of commands'],
        ['Changes your files?', 'No, you copy and paste', 'Only what you accept, line by line', 'Yes, many files, often unprompted'],
        ['Main risk', 'Copying code you did not understand', 'Accepting plausible but wrong lines', 'A wide, fast mistake, or a harmful command']
      ] },

    { kind: 'sequence', title: 'What an agent does with your request',
      body: 'Agents work in a loop, using tools, not just text. Step through a typical run.',
      actors: ['You', 'Agent', 'Your project'],
      steps: [
        { from: 0, to: 1, label: 'fix the failing checkout test', note: 'You describe the outcome you want, in plain English.' },
        { from: 1, to: 2, label: 'read files, run the tests', note: 'The agent looks around: it opens relevant files and runs the test suite to see the failure itself.' },
        { from: 2, to: 1, label: 'code and test output', dashed: true, note: 'The results come back as text it can reason about.' },
        { from: 1, to: 2, label: 'edit files, run tests again', note: 'It makes a change and checks whether the test now passes. If not, it tries again.' },
        { from: 1, to: 0, label: 'summary and a diff', note: 'It reports what it changed. **This is your moment**: read the diff before anything is kept.' },
        { from: 0, to: 1, label: 'approve, or "not like that"', note: 'You stay in charge. Reject, redirect or accept.' }
      ] },

    { kind: 'compare', title: 'The four tools, described generically',
      body: 'Products change month to month, so here is the stable picture rather than a feature list. Check each product’s own site for what it does today.',
      cols: ['Rough character', 'Typical home'],
      rows: [
        ['**Claude Code**', 'A coding agent from Anthropic that works alongside you, reading and editing your project and running commands with your permission', 'Mostly in the terminal'],
        ['**Cursor**', 'An editor built around AI: chat, autocomplete and agent-style edits in one place', 'A code editor you install'],
        ['**GitHub Copilot**', 'Started as editor autocomplete from GitHub (part of Microsoft); now also chat and agent-style help', 'Inside many popular editors'],
        ['**Google Antigravity**', 'Google’s coding environment designed around agents that you assign tasks and then review', 'A desktop development environment']
      ] },

    { kind: 'concept', title: 'Judge a tool by three questions',
      body: `Feature lists age fast. Three questions do not:

        1. **What can it see?** Only your selection, or your whole project and its history?
        2. **What can it change or run?** Suggest text only, or edit files and execute commands?
        3. **What does it ask before acting?** Does it check with you, and can you see exactly what it will do?

        A tool that can see everything, change anything and never ask is not "powerful": it is a risk. A tool that suggests only is not "weak": it is perfectly good for a lot of work.

        Many tools also let you keep a plain-text file of **project guidance** (conventions, commands to run) that they read, like onboarding notes for a new starter.` },

    { kind: 'code', title: 'Make a safety net before you start',
      body: 'Before letting an agent loose, make its work easy to inspect and easy to throw away. These are the same Git commands you already know. Tap the lines.',
      code: { lang: 'sh', src: `
        git status                    # clean? commit or stash first
        git switch -c ai/fix-checkout  # work on a throwaway branch
        # ...agent works...
        git diff                      # read every change
        npm test                      # run the tests yourself
        git restore .                 # or: discard it all`,
        notes: {
          1: 'Start from a clean state so the agent’s changes are the *only* changes.',
          2: 'A branch means the main line is untouched, whatever happens.',
          4: 'The diff is your real review. The summary is the agent’s opinion; the diff is the truth.',
          5: 'Do not take the agent’s word that tests pass. Run them yourself.',
          6: 'If it went wrong, a single command undoes it. That is the point of version control.'
        } } },

    { kind: 'steps', title: 'Working safely with agents',
      body: 'Six habits that cover most of the risk.',
      steps: [
        { title: 'Small, specific tasks', body: '"Fix this failing test" beats "improve the app". Small tasks make small diffs you can actually review.' },
        { title: 'Use version control as a seatbelt', body: 'Branch first, commit often, so any mistake is one command from undone.' },
        { title: 'Read the diff, not just the summary', body: 'The summary says what the agent *thinks* it did. The diff shows what it did.' },
        { title: 'Run the tests yourself', body: 'Including ones the agent did not touch. Agents sometimes "fix" a test by weakening it.' },
        { title: 'Grant the least permission', body: 'Approve commands one at a time until you trust a pattern. Be very careful with anything that deletes, installs or touches the network.' },
        { title: 'Keep secrets out of reach', body: 'Real passwords, keys and customer data do not belong in the folder an agent can read.' }
      ] },

    { kind: 'pitfall', title: 'When the intern goes off-script',
      body: `Agents are fast, confident and literal. Typical mishaps:

        - **Doing too much**: you asked for a fix and got a rewrite of five files
        - **Fixing the test, not the code**: making the red turn green by loosening the check
        - **Running a destructive command**: deleting a folder or resetting data
        - **Believing text it reads**: a web page or file can contain instructions aimed at the AI, and a careless agent may follow them

        None of these needs panic. They need what you would give any new starter: a clear task, limited access, and a review before it counts.` },

    { kind: 'tip', title: 'Ask for the plan, then the work',
      body: `With any agent, start by saying: "**Before changing anything, tell me your plan.**"

        You get a cheap look at its understanding. If it has picked the wrong file or the wrong approach, you fix that in a sentence rather than after twenty edits.

        Then keep the loop tight: agree the plan, let it do one step, check the diff, continue. It is slower than "do it all", and in practice usually faster than cleaning up after "do it all".` }
  ],

  activities: [
    { type: 'match', after: 1, prompt: 'Match each type of tool to the best description.',
      pairs: [['Chat assistant', 'You paste code and it answers in conversation'], ['Editor autocomplete', 'Grey suggestions as you type, accepted with Tab'], ['Coding agent', 'Reads files, edits them and runs commands to finish a task'], ['Project guidance file', 'Plain-text notes about conventions the tool reads']] },

    { type: 'order', after: 2, prompt: 'Put a typical agent run in order.',
      items: ['You describe the task', 'The agent reads files and runs the tests', 'It edits files and re-runs the tests', 'It reports what changed', 'You read the diff and approve or reject'],
      explain: 'The agent works through a look, change, check loop and then hands over. The last step is the human’s and is the one you must not skip.' },

    { type: 'bucket', prompt: 'Which kind of tool fits the job best?', buckets: ['Chat', 'Autocomplete', 'Agent'],
      items: [['"Explain what this regex does"', 0], ['Finishing a repetitive function while you type', 1], ['"Rename this field everywhere and update the tests"', 2], ['Brainstorming three ways to structure a module', 0], ['Completing the next line of a familiar pattern', 1], ['Fixing a failing build by running commands and iterating', 2]],
      explain: 'Questions and brainstorming suit chat; small in-flow completions suit autocomplete; multi-file work with commands suits an agent, with supervision.' },

    { type: 'spot', prompt: 'An agent asks permission to run these commands one at a time. Tap the one you should refuse or question hard.',
      code: { lang: 'sh', src: `
        npm test
        git diff
        rm -rf ~/projects
        ls src
        git status` },
      lines: [3],
      explain: '`rm -rf ~/projects` recursively deletes a whole folder of projects, far beyond the task. The others only read or run the tests. Never approve a command you do not understand.' },

    { type: 'tf', statement: 'If an agent’s summary says "all tests pass", you can skip running them yourself.', answer: false,
      explain: 'The summary is the agent’s claim. Run the tests yourself and read the diff. Agents sometimes loosen a test to make it pass.' },

    { type: 'mcq', q: 'You ask an agent to "improve the project". It changes thirty files. What was the mistake?',
      options: ['The task was too vague and large to review', 'Agents should never edit files', 'You should have used autocomplete instead', 'Thirty files is always fine'],
      answer: 0,
      why: [null, 'Editing files is the whole point of an agent; the issue is control.', 'Autocomplete is a different tool, not a better one for this.', 'A diff that big is impossible to review properly.'],
      explain: 'Vague, big tasks produce big diffs that nobody can review. Small, specific tasks keep you in charge.' },

    { type: 'multi', q: 'Which are sensible habits when working with a coding agent?',
      options: ['Work on a Git branch', 'Read the diff before accepting', 'Approve unfamiliar commands without reading them', 'Keep real production secrets out of the project folder', 'Ask for a plan before it changes files'],
      answers: [0, 1, 3, 4],
      explain: 'Branches, diffs, secrets hygiene and plans all keep a person in control. Approving commands blindly is the opposite.' },

    { type: 'scenario', title: 'The red build', intro: 'Your CI build is red an hour before a release. You decide to use a coding agent to fix it.',
      meters: { 'safety': 70, 'progress': 10 },
      steps: [
        { text: 'Before you start the agent, what do you do?',
          choices: [
            { label: 'Commit or stash your work and create a branch', score: 2, effects: { 'safety': 15 }, feedback: 'Now whatever the agent does is isolated, visible and reversible.' },
            { label: 'Just start; it is only a build fix', score: 1, effects: { 'safety': -10 }, feedback: 'It may work, but your uncommitted work and its edits are now mixed together.' },
            { label: 'Give it your production credentials so it can test properly', score: 0, effects: { 'safety': -40 }, feedback: 'Real credentials in an agent’s reach are a serious risk. Use test data and local services.' }
          ] },
        { text: 'The agent says it fixed the failing test and all tests now pass. What next?',
          choices: [
            { label: 'Read the diff, then run the whole suite yourself', score: 2, effects: { 'safety': 15, 'progress': 40 }, feedback: 'You find it fixed the *code*, with a small change. Verified, and now you can trust it.' },
            { label: 'Merge straight away; it said it passed', score: 0, effects: { 'safety': -30, 'progress': 10 }, feedback: 'You merged an unreviewed change under time pressure. If the test was loosened, the bug ships.' },
            { label: 'Ask it again whether it is sure', score: 1, effects: { 'safety': -5, 'progress': 10 }, feedback: 'It will probably say yes. Asking for confidence is not verification.' }
          ] },
        { text: 'In the diff you notice it also deleted a test that was failing. What do you do?',
          choices: [
            { label: 'Restore that test and ask the agent to fix the real cause', score: 2, effects: { 'safety': 15, 'progress': 25 }, feedback: 'Deleting the alarm is not a fix. The test existed for a reason.' },
            { label: 'Leave it deleted; the build is green', score: 0, effects: { 'safety': -30 }, feedback: 'You have swapped a visible problem for an invisible one.' },
            { label: 'Revert everything and do the whole fix by hand', score: 1, effects: { 'progress': -10 }, feedback: 'Safe, but you threw away good work. Rejecting just the bad part and redirecting was faster.' }
          ] }
      ],
      outro: 'An agent is a fast intern: **limit its access, read its diff, run the checks yourself**.' },

    { type: 'short', q: 'Which Git command shows exactly what changed, so you can review an agent’s work? (two words)', accept: ['git diff', 'diff'], hint: 'It compares your files with the last commit.',
      explain: '`git diff` shows every changed line. It is the honest record of what the agent actually did.' },

    { type: 'explain', prompt: 'A friend wants to let an AI agent "just handle" their whole codebase. Explain your advice in plain terms.',
      model: 'An agent is useful but acts quickly and literally, so I would limit what it can do. I would use a branch so changes can be undone, give it small specific tasks, read the diff rather than trusting its summary, run the tests myself, keep real secrets out of its reach and approve commands I understand. The person stays responsible for what ships.',
      keywords: ['branch', 'diff', 'tests', 'small', 'permission', 'secrets', 'responsible'] }
  ],

  flashcards: [
    { q: 'What are the three modes of AI coding help?', a: 'Chat (you ask and paste), editor autocomplete (inline suggestions), and agents (read and edit your project and run commands).' },
    { q: 'How would you describe Claude Code, Cursor, GitHub Copilot and Google Antigravity generically?', a: 'Claude Code: a terminal-based coding agent. Cursor: an AI-centred editor. Copilot: autocomplete that grew into chat and agent features. Antigravity: an agent-oriented development environment from Google.' },
    { q: 'What three questions help you judge any AI coding tool?', a: 'What can it see? What can it change or run? What does it ask before acting?' },
    { q: 'What is the first safety step before running an agent?', a: 'Commit or stash your work and create a Git branch, so its changes are isolated and reversible.' },
    { q: 'Why read the diff and not just the agent’s summary?', a: 'The summary is the agent’s claim about what it did; the diff is what actually changed.' }
  ],

  glossary: [
    { term: 'Coding agent', def: 'An AI tool that carries out a task by reading files, editing them and running commands in a loop, rather than only answering in text.', like: 'An intern with the keys to the office.', aka: ['agent'] },
    { term: 'Autocomplete', def: 'Inline suggestions that appear as you type in an editor and are accepted with a keystroke.', like: 'A friend finishing your sentences.' },
    { term: 'Diff', def: 'A listing of exactly which lines were added, removed or changed between two versions.', like: 'Tracked changes in a document.' },
    { term: 'Least privilege', def: 'Giving a tool or person only the access it needs for the task and no more.', like: 'Handing over one room key, not the master key.' },
    { term: 'Project guidance file', def: 'A plain-text file of conventions and instructions that some AI tools read to understand how your project works.', like: 'Onboarding notes for a new starter.' }
  ],

  takeaways: [
    'There are three modes: **chat**, **autocomplete** and **agents**, with more power and more risk as you go along.',
    'Judge any tool by: what it **sees**, what it can **change**, and what it **asks** first.',
    'Use a **branch**, small tasks, read the **diff** and run the **tests** yourself.',
    'Agents act fast and literally. **Least privilege** and a human review keep them safe.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ai-providers', {
  eli5: 'Most apps do not run an AI model themselves: they send text to a company’s servers over the internet and get the model’s answer back, like paying for electricity instead of owning a power station.',

  cards: [
    { kind: 'concept', title: 'Intelligence you rent by the request',
      body: `Training a big model takes enormous clusters of specialist chips and months of work, and running one needs powerful hardware. Almost no app developer owns that.

        So the common arrangement is the one you already know from web APIs: a company runs the model and you call it over HTTP. Send a prompt in a request, get text back in the response. You pay for the **tokens** you use.

        To your code it is just another API, like a payments or maps service. The difference is that what comes back is probabilistic, so everything you learnt about checking output still applies.` },

    { kind: 'sequence', title: 'One call to a model API',
      body: 'Step through what happens when your backend asks a model for help.',
      actors: ['Your backend', 'Provider API', 'Model'],
      steps: [
        { from: 0, to: 1, label: 'POST prompt + API key', note: 'Your server sends the prompt over HTTPS, with its **API key** to prove who is paying.' },
        { at: 1, label: 'check key, limits, billing', note: 'The provider authenticates you, checks your rate limits and records usage.' },
        { from: 1, to: 2, label: 'run inference', note: 'The request is queued for the model on the provider’s hardware.' },
        { from: 2, to: 1, label: 'generated tokens', dashed: true, note: 'The model produces the answer token by token.' },
        { from: 1, to: 0, label: 'response + token counts', note: 'You get the text back, plus how many tokens went in and out, which is what you are billed for.' },
        { at: 0, label: 'validate before using', note: 'Your code checks the result. It is data from a guesser, not from a database.' }
      ] },

    { kind: 'code', title: 'What the request looks like',
      body: 'The details differ between providers, but the shape is the same. Here is a generic one. Tap the lines.',
      code: { lang: 'http', src: `
        POST /v1/messages HTTP/1.1
        Host: api.provider.example
        Authorization: Bearer <YOUR_API_KEY>
        Content-Type: application/json

        {
          "model": "some-model-name",
          "max_tokens": 300,
          "messages": [{ "role": "user", "content": "Explain DNS." }]
        }`,
        notes: {
          1: 'The path and field names are illustrative. Each provider has its own, so always follow the real documentation.',
          3: 'The **API key** is a secret that identifies and bills you. Keep it on your server, never in browser code, and never in Git.',
          7: 'You choose **which model**: this one choice sets capability, speed and cost.',
          8: 'A cap on the reply length protects both your bill and your latency.'
        } } },

    { kind: 'compare', title: 'The big names, without the hype',
      body: 'Product names and model lineups change fast, so this sticks to what is durable. Check each provider’s own site for the current models.',
      cols: ['Model family', 'Worth knowing'],
      rows: [
        ['**OpenAI**', 'GPT models, and the ChatGPT app', 'Among the first with a widely used developer API; many other tools copy its API style'],
        ['**Anthropic**', 'Claude models, and the Claude app', 'Known for coding and long-document work; also makes Claude Code'],
        ['**Google**', 'Gemini models', 'Strong on very long inputs and mixed text, image and audio; tied into Google’s cloud'],
        ['**Open-weight**', 'For example Llama, Mistral, and Google’s Gemma', 'Weights you can download and run yourself (next cards)']
      ] },

    { kind: 'metaphor', title: 'Choosing a vehicle',
      body: `Choosing a model is like choosing a vehicle. A bicycle is cheap, quick to hop on and perfect for a trip to the shops. A van carries more. A lorry can move a house but is slow to park and expensive to run.

        Nobody uses the lorry to fetch milk, and nobody moves house by bicycle.

        Providers sell the same idea: bigger, more capable models that are slower and pricier, and smaller, faster, cheaper ones. Using the biggest model for everything is the equivalent of a lorry for the milk run.` },

    { kind: 'concept', title: 'Choosing a model: four dials',
      body: `When you pick a model, you balance four things:

        - **Capability**: how well it handles hard reasoning, tricky code or subtle instructions
        - **Speed**: how quickly the first words appear and how fast it finishes (**latency**)
        - **Cost**: priced per token, and usually *output* tokens cost more than *input* tokens
        - **Context size**: how much text fits in one request

        Sorting emails into categories? A small, fast, cheap model is probably right. Planning a large refactor? Pay for capability. And **test on your own examples**: leaderboards measure other people’s tasks, not yours.` },

    { kind: 'deep', title: 'Open-weight models: run your own',
      body: `With an **open-weight** model, the provider publishes the model’s trained parameters (its **weights**) so you can download and run it on your own hardware or rent a server for it.

        Why bother? **Control** (nothing leaves your servers), **privacy**, no per-request fees, and the freedom to fine-tune.

        The trade-offs are real: you need GPUs and people to run them, and the very top models are usually still the hosted ones.

        Note the wording: "open-weight" is **not** the same as "open source". The licence decides what you may do, and the training data is often not shared. Read the licence.` },

    { kind: 'pitfall', title: 'Models change under your feet',
      body: `Providers update, rename and eventually **retire** their models. A prompt that worked beautifully can behave differently after an update, and an old model name can stop working altogether.

        Protect your product:

        - use a **specific model version** where the provider offers one, rather than a moving "latest" label
        - keep a small set of **test prompts** and re-run them when you switch
        - hide the provider behind **your own interface**, the same anti-corruption idea from the enterprise lesson, so swapping costs one file, not forty

        Treat the model like any vendor dependency: useful, and not under your control.` },

    { kind: 'tip', title: 'Provider hygiene checklist',
      body: `A few habits will save you pain:

        - **Keys on the server only**, loaded from environment variables or a secrets manager
        - **Set spending limits** and alerts, because a loop with a bug can burn money fast
        - **Handle rate limits and errors** with retries and back-off, exactly as for any external API
        - **Check the data policy** before sending anything personal or confidential
        - **Log token counts** so you know where the cost goes` }
  ],

  activities: [
    { type: 'order', after: 1, prompt: 'Put a model API call in order.',
      items: ['Your backend sends a prompt and API key over HTTPS', 'The provider checks the key and limits', 'The model generates tokens', 'You receive text and token counts', 'Your code validates the result before using it'],
      explain: 'Authentication happens before any inference, and validation is yours to do at the end because the output is probabilistic.' },

    { type: 'spot', after: 2, prompt: 'This code runs in a web page. Tap the line that is a serious security mistake.',
      code: { lang: 'js', src: `
        // runs in the browser
        const KEY = 'sk-live-abc123';
        const res = await fetch(url, {
          headers: { Authorization: 'Bearer ' + KEY }
        });` },
      lines: [2],
      explain: 'Anyone can view-source a web page and copy the key, then spend your money. API keys belong on your server, with the browser talking to *your* backend.' },

    { type: 'match', prompt: 'Match each provider or term to what it is.',
      pairs: [['OpenAI', 'Makes the GPT models and ChatGPT'], ['Anthropic', 'Makes the Claude models'], ['Google', 'Makes the Gemini models'], ['Open-weight model', 'Downloadable weights you can run yourself'], ['API key', 'A secret that identifies and bills your requests']] },

    { type: 'bucket', prompt: 'Which kind of model fits each job?', buckets: ['Small, fast, cheap', 'Large, capable, costly'],
      items: [['Tagging 100,000 support emails as billing, bug or other', 0], ['Planning a multi-file refactor of an unfamiliar codebase', 1], ['Extracting a postcode from a short sentence', 0], ['Reasoning through a subtle concurrency bug', 1], ['Auto-completing a search box', 0], ['Reviewing a complicated architecture proposal', 1]],
      explain: 'High-volume, simple, latency-sensitive jobs suit a small model. Rare, difficult jobs where a mistake costs a lot justify a bigger one.' },

    { type: 'tf', statement: '"Open-weight" always means the same as "open source", with no limits on how you can use the model.', answer: false,
      explain: 'Open-weight means the weights can be downloaded. The licence still decides what you may do, and the training data is often not shared.' },

    { type: 'multi', q: 'Which factors belong in choosing a model for a feature?',
      options: ['Capability on your own test examples', 'Latency: how fast users get a reply', 'Cost per input and output token', 'Context window size', 'Which provider has the most colourful logo'],
      answers: [0, 1, 2, 3],
      explain: 'Capability, speed, cost and context are the four dials. The right trade-off is found by testing your own task, not by reputation.' },

    { type: 'ab', q: 'Which design copes better when a provider retires a model?',
      a: { lang: 'js', label: 'Calls scattered', src: `
        // in 40 different files
        await fetch('https://api.provider.example/v1/...', {
          body: JSON.stringify({ model: 'old-model' })
        });` },
      b: { lang: 'js', label: 'One wrapper', src: `
        // llm.js: the only file that knows the provider
        import { MODEL } from './config.js';
        export async function ask(prompt) { /* call provider */ }` },
      answer: 'b',
      explain: 'A single wrapper means changing provider or model is a one-file edit that you can re-test. Scattered calls turn it into a hunt through the whole codebase.' },

    { type: 'scenario', title: 'Pick the model, keep the budget', intro: 'You are adding AI features to Hollis’s support site. Three features, one budget, and a manager who says "just use the biggest model for everything".',
      meters: { 'budget': 70, 'quality': 40 },
      steps: [
        { text: 'Feature one: automatically label 50,000 incoming emails by topic. Quality must be decent, not perfect.',
          choices: [
            { label: 'A small, cheap, fast model, tested on a sample of real emails', score: 2, effects: { 'budget': -5, 'quality': 25 }, feedback: 'High volume and a simple task: small wins on cost and speed. Testing on real examples proves it is good enough.' },
            { label: 'The biggest model, to be safe', score: 1, effects: { 'budget': -40, 'quality': 25 }, feedback: 'Fine quality, but you have paid a lorry’s price for a milk run at 50,000 emails.' },
            { label: 'Skip testing; assume any model can label emails', score: 0, effects: { 'quality': -15 }, feedback: 'Without examples you will not know whether it mislabels refunds as spam.' }
          ] },
        { text: 'Feature two: draft replies to complicated complaints for a human to review. Mistakes are embarrassing.',
          choices: [
            { label: 'A more capable model, with a human reading every draft', score: 2, effects: { 'budget': -15, 'quality': 25 }, feedback: 'Fewer calls and higher stakes justify the cost, and a human review keeps responsibility where it belongs.' },
            { label: 'The cheapest model, auto-sent with no review', score: 0, effects: { 'quality': -30 }, feedback: 'One hallucinated refund policy sent to an angry customer will cost far more than the saving.' },
            { label: 'Skip the feature', score: 1, effects: { 'quality': -5 }, feedback: 'Safe, but you have given up useful help for the support team.' }
          ] },
        { text: 'Legal says customer messages must not leave Hollis’s own network. What are your options?',
          choices: [
            { label: 'Consider an open-weight model hosted on Hollis’s own servers, and check the licence', score: 2, effects: { 'budget': -15, 'quality': 5 }, feedback: 'Open-weight models exist for this: control and privacy, at the price of running the hardware yourself.' },
            { label: 'Send the data anyway; the API is secure', score: 0, effects: { 'budget': 0, 'quality': -30 }, feedback: 'A policy forbids it. "Secure" is not the same as "permitted".' },
            { label: 'Anonymise nothing and hope legal does not notice', score: 0, effects: { 'quality': -40 }, feedback: 'That is how data breaches become headlines. Always follow the data policy.' }
          ] }
      ],
      outro: 'Match the model to the **task**, test on **your data**, and respect **data rules**.' },

    { type: 'short', q: 'What is the secret string that identifies and bills your requests to a model provider? (two words: three letters, then "key")', accept: ['api key', 'apikey', 'the api key'], hint: 'It starts with the abbreviation for application programming interface.',
      explain: 'The **API key** proves who you are and who to charge. Treat it like a password: server-side only, never in Git.' },

    { type: 'explain', prompt: 'Your manager asks "why don’t we just run our own model instead of paying a provider?" Give a balanced answer.',
      model: 'Hosted models are rented by the token and the provider handles the hardware and updates, which is cheapest to start and gives top capability. Running our own open-weight model gives control and privacy and no per-request fee, but we need GPUs and people to run it, and the best models are often still hosted. The right answer depends on volume, privacy needs and skills.',
      keywords: ['hosted', 'open-weight', 'privacy', 'control', 'cost', 'hardware'] }
  ],

  flashcards: [
    { q: 'How do most apps use LLMs?', a: 'By calling a provider’s model over an HTTP API with a prompt and API key, and paying per token.' },
    { q: 'Which models do OpenAI, Anthropic and Google make?', a: 'OpenAI: GPT (and ChatGPT). Anthropic: Claude. Google: Gemini.' },
    { q: 'What are the four dials for choosing a model?', a: 'Capability, speed (latency), cost per token, and context size.' },
    { q: 'What is an open-weight model?', a: 'A model whose trained weights are published so you can run it yourself. It is not necessarily open source; the licence decides.' },
    { q: 'How do you protect yourself from model changes?', a: 'Pin a specific version, keep test prompts to re-run, and hide the provider behind your own wrapper.' }
  ],

  glossary: [
    { term: 'Model API', def: 'A web API where you send a prompt and receive a model’s generated reply, billed by tokens.', like: 'Ordering from a kitchen you cannot see.' },
    { term: 'API key', def: 'A secret string that identifies and bills your requests to a provider; it must stay server-side.', like: 'A credit card number for the service.' },
    { term: 'Latency', def: 'How long you wait for a response; for models, often measured to the first word and to the full answer.', like: 'How long the kettle takes to boil.' },
    { term: 'Open-weight model', def: 'A model whose trained parameters are published for download, so you can run it on your own hardware under its licence.', like: 'Being given the finished engine, not just a taxi ride.', aka: ['open weights'] },
    { term: 'Weights', def: 'The billions of numbers a trained model has learnt; together they are the model.', like: 'The learnt knowledge, stored as numbers.', aka: ['parameters'] }
  ],

  takeaways: [
    'Most apps **rent** models: send a prompt to a provider’s API and pay per token.',
    'OpenAI makes **GPT**, Anthropic makes **Claude**, Google makes **Gemini**; open-weight models can be run yourself.',
    'Choose by **capability, speed, cost and context** and test on your own examples.',
    'Keep keys on the server, pin versions and **wrap the provider** so you can swap it.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.lesson('ai-applications', {
  eli5: 'AI can review, refactor, document and test your code like a quick, tireless junior colleague, as long as you check its work, because it is confident whether it is right or wrong.',

  cards: [
    { kind: 'metaphor', title: 'The 600-line pull request',
      body: `It is Monday. A 600-line pull request is waiting for review, and you have an hour. You could skim and approve (risky), or put it off (rude).

        Think of AI as a **tireless junior colleague**: not replacing your judgement, but acting as a fast second pair of eyes that never gets bored. It can read the whole diff in seconds and point at things worth looking at.

        The same goes for refactoring, documentation and tests: it does the grinding first pass, and you apply the judgement. The rest of this lesson is about how to get the benefit without the embarrassment.` },

    { kind: 'code', title: 'Code review: what a good reviewer notices',
      body: 'Here is a small function. An AI reviewer (or a human one) should flag several things. Tap the lines to see them.',
      code: { lang: 'js', src: `
        function averageOrder(orders) {
          let total = 0;
          for (const o of orders) {
            total += o.amount;
          }
          return total / orders.length;
        }`,
        notes: {
          6: '**Bug:** an empty list gives `0 / 0`, which is `NaN`. A reviewer should ask what should happen with no orders.',
          4: '**Question:** is `amount` always a number? If it can be a string like `"12.50"`, this concatenates instead of adding.',
          1: '**Naming:** it works on a list of orders, but nothing says what *kind* of average, or whether refunds count.'
        } },
      note: 'AI tends to catch the first sort of thing (missed edge cases, typos, inconsistent style). It cannot tell you whether the team *wanted* refunds excluded.' },

    { kind: 'compare', title: 'AI reviewer vs human reviewer',
      body: 'They are good at different things, which is why using both beats either alone.',
      cols: ['AI reviewer', 'Human teammate'],
      rows: [
        ['Speed', 'Seconds, any time', 'Minutes to days'],
        ['Strong at', 'Missed edge cases, typos, style, obvious bugs', 'Intent, design, history and what the business needs'],
        ['Weak at', 'Why the code exists; your unwritten rules', 'Consistency on boring details at 5pm on a Friday'],
        ['Accountability', 'None. It will not be paged', 'Owns the decision to approve']
      ] },

    { kind: 'sequence', title: 'Refactoring with a safety net',
      body: 'Refactoring means changing the structure of code **without changing what it does**. Tests are how you prove that. Step through the safe way.',
      actors: ['You', 'AI', 'Test suite'],
      steps: [
        { from: 0, to: 2, label: 'run tests: all green', note: 'First, confirm the tests pass **before** touching anything. Without tests, you cannot prove behaviour is unchanged.' },
        { from: 0, to: 1, label: 'extract this into smaller functions', note: 'Ask for one small, specific change, not "clean it all up".' },
        { from: 1, to: 0, label: 'proposed diff', dashed: true, note: 'The AI proposes edits. Read them like a stranger’s code.' },
        { from: 0, to: 2, label: 'run tests again', note: 'Run the suite yourself. Do not rely on the AI saying it passed.' },
        { from: 2, to: 0, label: 'green (or red)', dashed: true, note: 'Green means behaviour is probably unchanged. Red means the AI broke something, so revert and rethink.' },
        { at: 0, label: 'commit, then next small step', note: 'Commit each good step so you can always step back one.' }
      ] },

    { kind: 'concept', title: 'Documentation: what it writes well, and what it cannot',
      body: `Models are very good at the dull parts of documentation: turning a function into a clear docstring, drafting a README outline, explaining an unfamiliar legacy file in plain English, or writing a first pass of API docs.

        What they cannot know is **why**. Code shows *what* it does; the reasons (a customer’s odd rule, a bug it works around) live in people’s heads. An AI will invent a plausible reason if you ask.

        So: let it draft the *what*, then add the *why* yourself. And check examples by running them, because a documented example that does not work is worse than none.` },

    { kind: 'pitfall', title: 'Tests that cannot fail',
      body: `AI is great at producing tests quickly, and that is exactly the danger: it can produce tests that look thorough but prove nothing.

        - Tests that assert whatever the code **currently** does, including its bugs
        - Tests that mock out so much that nothing real is being checked
        - Tests that cannot fail at all

        A good use is to ask it to **brainstorm edge cases** you had not thought of, then write or review the tests yourself. Test that a test can fail by breaking the code on purpose.`,
      code: { lang: 'js', src: `
        test('averageOrder works', () => {
          const result = averageOrder([{ amount: 10 }]);
          expect(result).toBe(result);
        });`,
        notes: {
          3: 'This compares the result to **itself**, so it always passes. A test like this gives false confidence.'
        } } },

    { kind: 'pitfall', title: 'When not to trust it',
      body: `Slow down, or do not use AI alone, when:

        - the code is about **security**: authentication, encryption, payments, permissions
        - you **cannot verify** the answer (an unfamiliar area where you would not spot a mistake)
        - the problem involves **tricky timing**, such as concurrency, where plausible code can still be wrong
        - the stakes are high: money, safety, medical or legal consequences
        - it involves **private data** you are not allowed to send to the tool

        Also be wary when it **agrees with everything you say**. Models lean towards being agreeable, which is not the same as being right.` },

    { kind: 'steps', title: 'The verification ladder',
      body: 'Whatever AI produces, climb these rungs before it ships. Each catches things the previous one misses.',
      steps: [
        { title: 'Read it', body: 'Can you explain every line? If not, ask the AI to explain it, then check that explanation against the docs.' },
        { title: 'Run it', body: 'Does it actually execute, on real inputs, including odd ones: empty, huge, wrong type?' },
        { title: 'Test it', body: 'Are there tests, and could they fail? Add the missing edge cases.' },
        { title: 'Have a human review it', body: 'A teammate checks intent, design and fit with the system.' },
        { title: 'Watch it in production', body: 'Use the logs, metrics and alerts you learnt about earlier. Some problems only show up with real traffic.' }
      ] }
  ],

  activities: [
    { type: 'spot', after: 1, prompt: 'An AI reviewer is asked about this function. Tap the line where the real bug is.',
      code: { lang: 'js', src: `
        function averageOrder(orders) {
          let total = 0;
          for (const o of orders) {
            total += o.amount;
          }
          return total / orders.length;
        }` },
      lines: [6],
      explain: 'With an empty list, `orders.length` is 0, so the result is `NaN`. A good reviewer asks what should happen with no orders and handles that case.' },

    { type: 'order', after: 3, prompt: 'Put a safe AI-assisted refactor in order.',
      items: ['Run the tests and confirm they pass', 'Ask for one small, specific change', 'Read the proposed diff', 'Run the tests again yourself', 'Commit, then start the next small step'],
      explain: 'Green tests first give you a baseline; reading and re-running afterwards prove behaviour is unchanged; commits make each step reversible.' },

    { type: 'ab', after: 5, q: 'Which test is more useful?',
      a: { lang: 'js', label: 'Compares to itself', src: `
        const r = averageOrder([]);
        expect(r).toBe(r);` },
      b: { lang: 'js', label: 'States an expectation', src: `
        expect(averageOrder([]))
          .toBe(0);` },
      answer: 'b',
      explain: 'The second encodes a decision (an empty list gives 0) and fails if the code returns `NaN`. The first can never fail, so it proves nothing.' },

    { type: 'bucket', prompt: 'Which is a good fit for AI, and which needs extra care?', buckets: ['Good fit (verify as usual)', 'Needs extra care'],
      items: [['Drafting a docstring for a function', 0], ['Brainstorming edge cases for tests', 0], ['Writing the password-reset token logic', 1], ['Explaining what a legacy file does', 0], ['Fixing a rare race condition', 1], ['Handling customer card data', 1]],
      explain: 'Drafts, brainstorming and explanations are easy to check. Security, subtle timing and sensitive data are where plausible-but-wrong code does the most harm.' },

    { type: 'tf', statement: 'If an AI writes documentation, you can trust the "why" parts as much as the "what" parts.', answer: false,
      explain: 'The *what* can be read from the code. The *why* often lives in people’s heads, so a model may invent a plausible but wrong reason. Add reasons yourself.' },

    { type: 'multi', q: 'Which are good ways to use AI when reviewing a large pull request?',
      options: ['Ask it to flag missed edge cases and inconsistencies', 'Ask it to summarise what changed so you know where to look', 'Approve the PR if it finds nothing', 'Ask it to question any assumption in the code', 'Replace the human reviewer entirely'],
      answers: [0, 1, 3],
      explain: 'AI is a helpful extra reader. Finding nothing is not proof of correctness, and it cannot own the decision to approve.' },

    { type: 'scenario', title: 'The AI-written auth fix', intro: 'You ask an AI assistant to fix a bug in your password-reset flow. It returns tidy code, new tests and a confident explanation. You are tempted to merge it.',
      meters: { 'security': 60, 'delivery': 30 },
      steps: [
        { text: 'Where do you start?',
          choices: [
            { label: 'Read it line by line and compare how reset tokens are made and expired against known good practice', score: 2, effects: { 'security': 20, 'delivery': -5 }, feedback: 'Authentication is exactly where plausible code can hide a serious flaw. Slow down and check.' },
            { label: 'Merge it; the tests pass', score: 0, effects: { 'security': -40, 'delivery': 15 }, feedback: 'The tests were written by the same model, so they may only check what it already assumed.' },
            { label: 'Ask the AI to double-check itself, then merge', score: 1, effects: { 'security': -10, 'delivery': 10 }, feedback: 'Useful as an extra reviewer, but it shares the original’s blind spots.' }
          ] },
        { text: 'You find the reset token is predictable, built from the time and the user ID. What next?',
          choices: [
            { label: 'Replace it with a properly random token from your security library, and add a test that fails on predictable tokens', score: 2, effects: { 'security': 30, 'delivery': -10 }, feedback: 'You have used a proven building block rather than invented crypto, and locked the fix in with a test.' },
            { label: 'Ask the AI to make it "more random" and accept whatever comes back', score: 1, effects: { 'security': 5 }, feedback: 'It may help, but you need to check the result against a known-good approach, not trust a new guess.' },
            { label: 'Ship it; attackers will not guess', score: 0, effects: { 'security': -45 }, feedback: 'Predictable tokens allow account takeover. Attackers do try.' }
          ] },
        { text: 'The code touches real customer emails. How do you test it?',
          choices: [
            { label: 'Use fake test accounts and a staging environment', score: 2, effects: { 'security': 15, 'delivery': 5 }, feedback: 'Realistic enough, with no real personal data at risk.' },
            { label: 'Paste a real customer export into the AI to generate test cases', score: 0, effects: { 'security': -35 }, feedback: 'You have sent personal data to a third party, probably breaching policy.' },
            { label: 'Test in production on a colleague’s account', score: 1, effects: { 'security': -10 }, feedback: 'Limited harm, but production is not where untested security code should be proven.' }
          ] }
      ],
      outro: 'Use AI for speed, but for security **verify against known good practice**, use proven libraries and keep real data out of tools.' },

    { type: 'short', q: 'Before asking AI to refactor code, what should you have in place to prove behaviour is unchanged? (one word)', accept: ['tests', 'test', 'a test suite'], hint: 'They go green or red.',
      explain: '**Tests** are the safety net. Without them, you cannot tell whether a refactor changed behaviour.' },

    { type: 'explain', prompt: 'Describe your own process for using AI to write a function and its tests, and say where you would not trust it.',
      model: 'I would describe the function and constraints, get a draft, then read and run it. I would ask the AI to brainstorm edge cases, write or review the tests myself, and make sure the tests can fail. Then a teammate reviews it. I would not trust it alone for security-sensitive code, tricky concurrency or anything I cannot verify.',
      keywords: ['read', 'run', 'tests', 'edge cases', 'review', 'security'] }
  ],

  flashcards: [
    { q: 'What are AI code reviewers good and bad at?', a: 'Good at missed edge cases, typos, style and obvious bugs. Bad at intent, design history and your unwritten rules. A human still owns approval.' },
    { q: 'What makes an AI-assisted refactor safe?', a: 'Passing tests first, one small change at a time, reading the diff, re-running the tests yourself and committing each step.' },
    { q: 'What can AI document well, and what can it not?', a: 'It documents what code does well. It cannot know why, and may invent a plausible reason, so you add the reasons.' },
    { q: 'What is the danger with AI-written tests?', a: 'They may assert current (buggy) behaviour, mock everything or never fail. Use AI to brainstorm cases and check tests can actually fail.' },
    { q: 'When should you not trust AI alone?', a: 'For security, things you cannot verify, tricky concurrency, high-stakes work and private data.' }
  ],

  glossary: [
    { term: 'Refactoring', def: 'Restructuring code to make it clearer or simpler without changing what it does.', like: 'Tidying the kitchen without changing the menu.' },
    { term: 'Code review', def: 'Having someone else read a change before it is merged, to catch bugs and share knowledge.', like: 'A proofreader for code.' },
    { term: 'Edge case', def: 'An unusual input or situation at the boundary of what a function expects, such as an empty list.', like: 'The customer who orders nothing.' },
    { term: 'Verification ladder', def: 'The sequence of checks (read, run, test, human review, monitor) applied to AI output before and after it ships.', like: 'Checking a bridge before, during and after it opens.' }
  ],

  takeaways: [
    'AI is a fast **second pair of eyes** for review, a grinder for first drafts, and a brainstormer for edge cases.',
    'Refactor in **small steps with tests** and read every diff.',
    'It documents the **what** well but guesses the **why**; AI-written tests can **never fail**.',
    'Climb the **verification ladder**, and take extra care with security and private data.'
  ]
});

// ═══════════════════════════════════════════════════════════════════════════
KS.boss('ai-foundations', {
  title: 'The Autocomplete Colossus',
  intro: 'A giant who has read every library but never once checked a fact looms over your desk, calmly predicting your next move. Prove you know how it works, how to brief it and when to say "I will check that myself".',
  questions: [
    { type: 'mcq', q: 'What does a large language model do at its core?',
      options: ['Predicts the next token, repeatedly', 'Looks up answers in a database of facts', 'Runs your code to see what it outputs', 'Searches the web for each question'],
      answer: 0,
      why: [null, 'It has no fact database; it generates plausible text from learnt patterns.', 'It does not execute code unless connected to tools.', 'Search is something a product may add on top; it is not the core.'],
      explain: 'Everything an LLM writes is built from chained next-token predictions.' },

    { type: 'tf', statement: 'When you ask the same model the same question twice, you are guaranteed identical answers.', answer: false,
      explain: 'The model is probabilistic. Low temperature makes answers more repeatable but never guarantees identical text.' },

    { type: 'match', prompt: 'Match each term to its meaning.',
      pairs: [['Token', 'A chunk of text the model reads and writes'], ['Context window', 'The most text it can consider at once'], ['Inference', 'Running the finished model on your prompt'], ['Hallucination', 'Fluent output that is false or invented'], ['Knowledge cut-off', 'The date its training data stops']] },

    { type: 'spot', prompt: 'An assistant wrote this Python for you. Tap the line that is most likely a hallucination.',
      code: { lang: 'py', src: `
        import json

        with open("config.json") as f:
            data = json.load(f)
        data.smart_validate_all()
        print(data["name"])` },
      lines: [5],
      explain: '`json.load` returns an ordinary dict, which has no `smart_validate_all` method. A plausible-sounding but non-existent method is the classic hallucination, and running the code reveals it.' },

    { type: 'bucket', prompt: 'Plain code or an LLM?', buckets: ['Plain code', 'An LLM'],
      items: [['Add 20% VAT to an invoice', 0], ['Summarise customer feedback into themes', 1], ['Check that an email field contains an @', 0], ['Draft a polite reply to a complaint', 1], ['Convert pounds to pence', 0], ['Explain what an unfamiliar function does', 1]],
      explain: 'One exact answer means code; fuzzy or language tasks suit a model, whose result you still check.' },

    { type: 'ab', q: 'Which prompt is more likely to give you what you want?',
      a: { lang: 'text', label: 'Brief', src: `
        Fix my code.` },
      b: { lang: 'text', label: 'Detailed', src: `
        This Python function raises KeyError
        on empty input. Here is the code and
        the traceback. Keep the signature.
        Explain the cause, then show a fix.` },
      answer: 'b',
      explain: 'The second gives the symptom, material, constraints and the output format. The model no longer has to guess what you need.' },

    { type: 'cloze', text: 'Including worked examples in the prompt is {{few-shot}} prompting, and a message that sets standing rules above the whole conversation is the {{system}} prompt.',
      distractors: ['zero-shot', 'user', 'temperature'],
      explain: 'Examples in the prompt make it few-shot. The system message holds the standing instructions.' },

    { type: 'order', prompt: 'Put a safe agent workflow in order.',
      items: ['Commit your work and create a branch', 'Give the agent a small, specific task', 'Read the diff it produced', 'Run the tests yourself', 'Merge after human review'],
      explain: 'Safety net first, then a small task, then your own verification, then a second human look, and only then merge.' },

    { type: 'multi', q: 'A coding agent proposes the following actions. Which deserve real scepticism before you approve?',
      options: ['Deleting a folder outside the task', 'Weakening a failing test so it passes', 'Running the unit tests', 'Reading a source file', 'Installing an unfamiliar package and running its install script'],
      answers: [0, 1, 4],
      explain: 'Destructive commands, test-weakening and running unfamiliar code are the risky ones. Reading files and running tests are normal, low-risk steps.' },

    { type: 'mcq', q: 'A team wants to put a model API key in their web app’s JavaScript so the browser can call the provider directly. What is wrong?',
      options: ['Anyone can copy the key from the page source', 'Browsers cannot call APIs', 'Keys only work on mobile phones', 'The provider forbids JSON'],
      answer: 0,
      why: [null, 'Browsers call APIs all the time.', 'Keys work from anywhere; that is the problem.', 'JSON is the normal format.'],
      explain: 'Anything in client-side code is public. Keep the key on your server and have the browser call your backend.' },

    { type: 'multi', q: 'Which are legitimate factors when choosing a model for a feature?',
      options: ['Capability on your own test examples', 'Latency', 'Cost per token', 'Context window size', 'The model’s popularity on social media'],
      answers: [0, 1, 2, 3],
      explain: 'The four dials are capability, speed, cost and context. Popularity says nothing about your task.' },

    { type: 'estimate', q: 'Roughly how many tokens are in a 3,000-word document written in English?', answer: 4000, unit: 'tokens', min: 100, max: 100000, tolerance: 1.6,
      explain: 'About 1.3 tokens per word gives roughly 4,000 tokens. It is only a rule of thumb: code and other languages usually use more.' },

    { type: 'short', q: 'Before letting AI refactor code, you should have a suite of what? (one word)', accept: ['tests', 'test'], hint: 'They tell you if behaviour changed.',
      explain: 'Tests are the safety net that proves the behaviour did not change.' }
  ]
});

KS.sheet('ai-foundations', {
  title: 'LLMs & AI-assisted coding: cheat sheet',
  sections: [
    { title: 'How LLMs work',
      md: `- An LLM **predicts the next token**, appends it, and repeats.
        - **Token**: a chunk of text, roughly three-quarters of an English word.
        - **Context window**: the most tokens (prompt plus reply) it can consider; no memory between chats.
        - **Training** adjusts parameters once; **inference** runs the frozen model.
        - **Temperature**: low is focused and repeatable, higher is varied and riskier.
        - **Hallucination**: plausible but false. **Cut-off**: it knows nothing after training ended.` },

    { title: 'Code vs model',
      md: `| | Traditional code | LLM |
        |---|---|---|
        | Output | Same every time | Varies |
        | Failure | A bug you can find | A guess that missed |
        | Best at | Exactness: money, rules | Language, drafts, patterns |

        Use AI where answers are **expensive to write, cheap to verify**. **If you commit it, you own it.**` },

    { title: 'Prompting',
      md: `**Good prompt:** goal, context, real material, constraints, output format, and permission to ask questions.

        | Technique | What it does |
        |---|---|
        | Zero-shot | Instructions only |
        | Few-shot | Add 2 to 3 varied examples |
        | Step by step | Plan or reason first; you can correct the plan |
        | System prompt | Standing rules and role; not a security boundary |

        **Iterate:** read, diagnose, change one thing, test on varied inputs.` },

    { title: 'AI coding tools',
      md: `| Mode | Does | Risk |
        |---|---|---|
        | Chat | Answers questions about pasted code | Copying what you do not understand |
        | Autocomplete | Inline suggestions | Accepting plausible wrong lines |
        | Agent | Reads, edits, runs commands | Wide, fast mistakes |

        **Examples:** Claude Code (terminal agent), Cursor (AI-centred editor), GitHub Copilot (autocomplete plus chat and agent features), Google Antigravity (agent-oriented environment).

        **Judge by:** what it sees, what it changes, what it asks first.` },

    { title: 'Safe agent habits',
      md: `1. Commit and **branch** first.
        2. Give **small, specific** tasks; ask for a plan.
        3. Read the **diff**, not only the summary.
        4. Run the **tests** yourself.
        5. **Least privilege**: approve commands you understand; keep secrets away.
        6. Watch for deleted or weakened tests.` },

    { title: 'Providers and models',
      md: `| Provider | Models |
        |---|---|
        | OpenAI | GPT, ChatGPT |
        | Anthropic | Claude |
        | Google | Gemini (and open-weight Gemma) |
        | Open-weight | Llama, Mistral and others: download and self-host |

        **Choose by:** capability, speed, cost, context. Test on **your own examples**.
        **Protect yourself:** keys on the server, pin versions, wrap the provider, check data policy, set spending limits.` },

    { title: 'AI in your workflow',
      md: `- **Review:** good at edge cases and style; blind to intent. Human approves.
        - **Refactor:** green tests first, small steps, diff, re-test, commit.
        - **Docs:** drafts the *what*; you supply the *why*; run the examples.
        - **Tests:** brainstorm cases; make sure tests can fail.
        - **Extra care:** security, concurrency, high stakes, private data.

        **Verification ladder:** read, run, test, human review, monitor.` }
  ]
});

