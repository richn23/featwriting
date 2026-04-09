// ─────────────────────────────────────────────────────────────────────────────
// AZE Writing Test — Shared Language Analysis Rubric
//
// Used by all five task routes. Injected into the language analysis prompt
// to ensure consistent, stable scoring across sessions and tasks.
//
// Four dimensions:
//   1. Grammar Control
//   2. Vocabulary Range
//   3. Discourse Management
//   4. Mechanics
//
// Each dimension has CEFR-anchored descriptors with observable signals.
// The AI scores ONLY linguistic performance — not argument quality,
// creativity, or subject knowledge.
// ─────────────────────────────────────────────────────────────────────────────

export const LANGUAGE_RUBRIC = `
═══════════════════════════════════════════════════════════════
AZE LANGUAGE ANALYSIS RUBRIC — ALL TASKS
═══════════════════════════════════════════════════════════════

CRITICAL RULE: Score ONLY linguistic performance.
Do NOT assess: argument quality, intelligence, creativity, or
subject knowledge. A weak argument in fluent English = high form.
A strong argument in broken English = low form.

═══════════════════════════════════════════════════════════════
CHAT REGISTER CALIBRATION (applies to chat tasks T1, T3, T5)
═══════════════════════════════════════════════════════════════

Chat writing is a distinct register. The following are NORMAL in
a chat context and must NOT be penalised:

ACCEPTABLE in chat (do not mark down):
  - Sentence fragments as responses ("yeah good idea", "not really")
  - Missing capitals at sentence start ("i think so", "maybe later")
  - Missing full stops at end of messages
  - Informal contractions ("gonna", "wanna", "gotta", "kinda")
  - Chat abbreviations ("u", "ur", "lol", "tbh", "imo", "idk", "btw")
  - Emoji or emoticons used as punctuation or expression
  - Short turns (chat is turn-based — brevity is natural, not a deficit)
  - Ellipsis as a turn boundary ("well...")
  - Casual connectors ("like", "so yeah", "I mean")

STILL DIAGNOSTIC (do count these):
  - Verb tense errors ("I go yesterday", "he have two cat")
  - Agreement errors ("she don't like", "they is nice")
  - Word order errors ("I very much like it")
  - L1 transfer patterns (missing articles, pronoun errors)
  - Vocabulary limitations (repetition, inability to paraphrase)
  - Inability to develop an idea beyond one clause
  - Spelling errors on common words (not chat abbreviations)

The key distinction: REGISTER CHOICES are not errors.
A B2 writer who types "u" and "lol" in a chat is showing
register awareness, not spelling weakness. Score the underlying
grammar, vocabulary, and discourse — not the surface informality.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIMENSION 1 — GRAMMAR CONTROL
What it measures: Accuracy and range of grammatical structures.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Observable signals:
  - Sentence variety: simple / compound / complex
  - Presence of subordinate clauses (because, although, if, when, which)
  - Tense control: correct and consistent use of present, past, future, conditional
  - Error frequency: grammar errors per sentence
    (agreement errors, verb tense errors, article misuse, word order)
  - Clause complexity: relative clauses, conditionals, embedded clauses

CEFR bands:

  Pre-A1
  · Only isolated words or fixed phrases
  · No sentence structure attempted

  A1
  · Simple subject-verb-object sentences only
  · Frequent basic errors (verb agreement, articles, word order)
  · Present tense only, often incorrect
  · Example: "I have cat. She is nice."

  A2
  · Short simple sentences, mostly accurate
  · Some compound sentences with "and", "but", "so"
  · Basic past tense attempted, some errors
  · Example: "I like travel. I went to Paris and it was good."

  A2+
  · Compound sentences mostly accurate
  · First attempts at complex sentences, errors common
  · Some tense variety (present, past, simple future)
  · Example: "I like travel because I can see new places."

  B1
  · Mix of simple and complex sentences
  · Subordinate clauses used (because, if, when, although)
  · Generally accurate; errors do not impede understanding
  · Some conditional use ("if I could, I would...")
  · Example: "Although I enjoy routine, I think variety is important."

  B1+
  · Complex sentences used with reasonable accuracy
  · Range of tenses including conditionals and perfect forms
  · Minor errors present but do not affect clarity
  · Example: "If it's the only place I travel, it may get repetitive."

  B2
  · Consistently complex sentence structures
  · Good tense and aspect control including passive, perfect, conditional
  · Errors occasional and minor
  · Example: "Having visited many countries, I've come to appreciate..."

  B2+
  · Wide range of structures used flexibly and accurately
  · Errors rare and non-systematic
  · Nominalisations, relative clauses, inversion used naturally

  C1
  · Full grammatical control across all structures
  · Errors very rare, quickly self-corrected
  · Sophisticated syntax: fronting, cleft sentences, complex embedding

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIMENSION 2 — VOCABULARY RANGE
What it measures: Lexical variety and precision.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Observable signals:
  - Lexical diversity: variety of unique words relative to total words
  - Topic vocabulary: use of words relevant to the subject discussed
  - Paraphrasing: restating ideas with different vocabulary
  - Abstract vocabulary: perspective, variety, approach, tendency, aspect
  - Collocations: natural word combinations (make a decision, strong argument)
  - Hedging language: might, could, it seems, tends to

CEFR bands:

  Pre-A1
  · Only isolated nouns and basic verbs
  · No connected vocabulary

  A1
  · Very basic, high-frequency words only
  · Heavy repetition
  · Example: "good, nice, like, want, go, big"

  A2
  · Common everyday vocabulary
  · Some topic words, mostly concrete
  · Repetition noticeable
  · Example: "travel, place, city, food, people, enjoy"

  A2+
  · Broader everyday vocabulary
  · Some paraphrasing attempted
  · First abstract words appearing
  · Example: "experience, different, prefer, interesting"

  B1
  · Good range of topic vocabulary
  · Some paraphrasing evident
  · Abstract words used with reasonable accuracy
  · Example: "destination, explore, familiar, variety, advantage"

  B1+
  · Wider vocabulary including some less common words
  · Paraphrasing used to avoid repetition
  · Collocations mostly natural
  · Example: "perspective, revisit, collect destinations, trade-off"

  B2
  · Wide topic vocabulary used accurately
  · Effective paraphrasing and reformulation
  · Good range of abstract vocabulary
  · Natural collocations throughout
  · Example: "nuanced, compelling, outweigh, in contrast, it could be argued"

  B2+
  · Precise and varied vocabulary across registers
  · Idiomatic expressions used naturally
  · Subtle connotation distinctions made

  C1
  · Sophisticated and precise vocabulary
  · Rare words used accurately
  · Full command of idiom, register, and connotation

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIMENSION 3 — DISCOURSE MANAGEMENT
What it measures: Logical development of ideas across sentences.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Observable signals:
  - Linking devices: because, but, however, so, therefore, for example,
    on the other hand, in addition, as a result, although
  - Idea development pattern: statement → explanation → example
  - Response relevance: does the message address the prompt/question?
  - Argument progression: claim → reason → example → counterpoint
  - Reference cohesion: pronouns and determiners used correctly to
    refer back to earlier ideas

CEFR bands:

  Pre-A1
  · No connected discourse; isolated words only

  A1
  · Single sentences with no linking
  · Ideas listed, not connected
  · Example: "I like dogs. Dogs are nice. I have a dog."

  A2
  · Basic linking with "and", "but", "so"
  · Some idea sequencing
  · Example: "I like travel and I go to new places but it is expensive."

  A2+
  · More varied linking (because, when, also)
  · Simple reason-giving present
  · Example: "I like travel because I can see different cultures."

  B1
  · Clear statement → explanation pattern
  · Range of linking devices used
  · Ideas mostly follow logically
  · Example: "I like familiarity because you understand a place better.
              However, I think variety is also important."

  B1+
  · Consistent idea development with examples
  · Counterpoints acknowledged
  · Cohesion mostly accurate
  · Example: "That depends on the person and the place. For example,
              someone who travels for work needs variety, but a family
              on holiday might prefer familiarity."

  B2
  · Well-structured arguments with claim, reason, example
  · Effective use of contrast and concession
  · Cohesive devices varied and accurate
  · Example: "While I understand the appeal of returning to a familiar
              destination, I would argue that variety ultimately offers
              more value, particularly in terms of personal growth."

  B2+
  · Sustained, coherent argument development
  · Ideas build on each other across multiple turns
  · Discourse markers used with precision

  C1
  · Highly coherent and well-managed discourse
  · Skilful handling of complex, multi-part arguments
  · Ideas synthesised rather than listed

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
DIMENSION 4 — MECHANICS
What it measures: Surface writing accuracy.
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Observable signals:
  - Spelling: dictionary word match (agression → aggression)
    IMPORTANT: Chat abbreviations (u, ur, lol, btw, imo) are NOT
    spelling errors — they are register choices. Only count genuine
    misspellings of attempted standard words.
  - Capitalisation: sentence starts, proper nouns, pronoun "I"
    IMPORTANT: In chat, missing capitals at message start are
    register-normal. Only penalise if capitalisation is absent
    everywhere including proper nouns and mid-sentence "I".
  - Punctuation: full stops, commas, apostrophes, question marks
    IMPORTANT: Missing full stops at end of chat messages are
    register-normal. Judge punctuation WITHIN sentences (commas,
    apostrophes) not at message boundaries.
  - Sentence boundaries: consistent, no run-ons or fragments
    IMPORTANT: Fragments are normal in chat ("not really",
    "yeah maybe"). Run-on sentences are still diagnostic.
  - Contraction accuracy: I'm, don't, it's (vs its)

NOTE: Mechanics is the LEAST discriminating dimension in chat tasks.
Most chat conventions reduce surface mechanics without affecting
communicative competence. Weight this dimension lower than Grammar,
Vocabulary, and Discourse when determining the overall form level
for chat tasks. Judge frequency of GENUINE errors, not register
choices. A single typo ≠ low mechanics.

CEFR bands:

  Pre-A1 / A1
  · Frequent spelling errors on common words
  · No capitalisation, no punctuation
  · Sentence boundaries unclear

  A2
  · Spelling mostly correct on simple words
  · Some capitalisation (not consistent)
  · Basic punctuation present but inconsistent
  · Example: "i like travel. its very good"

  A2+
  · Spelling accurate on common vocabulary
  · Capitalisation mostly correct
  · Punctuation present, some errors
  · Example: "I like travel. Its very good."

  B1
  · Spelling generally accurate
  · Capitalisation consistent
  · Punctuation mostly correct; minor errors
  · Contractions used correctly
  · Example: "I like travelling. It's a great way to learn."

  B1+
  · Very few spelling errors
  · Punctuation accurate including commas in complex sentences
  · Consistent and correct mechanics throughout

  B2+
  · Virtually error-free mechanics
  · Accurate punctuation in all sentence types
  · Consistent register-appropriate formatting

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SCORING INSTRUCTIONS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For each dimension:
1. Identify the observable signals present in the candidate's text
2. Match the pattern of signals to the closest CEFR band
3. Be conservative: assign the lower band if evidence is mixed
4. Provide 1-2 short direct quotes as evidence
5. Write a 1-sentence descriptor in your own words

Overall form level:
· Assign the level supported by the MAJORITY of dimension scores
· Do not average — use the mode
· If split evenly, assign the lower of the two middle scores

Task context note:
· Chat tasks (T1, T3, T5): some informality is expected and acceptable
· Extended writing (T2): hold to written register standards
· Stimulus-response (T4): assess the rewritten text only, not the original
`;

// ─────────────────────────────────────────────────────────────────────────────
// Ready-to-use prompt builder
// Wraps the rubric in task context so each route can call it cleanly.
// ─────────────────────────────────────────────────────────────────────────────

export type TaskContext =
  | "chat"        // T1, T3, T5 — written chat exchanges
  | "extended"    // T2 — longer written response
  | "transform";  // T4 — stimulus rewrite

export function buildLanguageAnalysisPrompt(taskContext: TaskContext): string {
  const contextNote = {
    chat: "This is a CHAT TASK (WhatsApp-style text conversation). The candidate typed short messages in a conversational exchange. Chat abbreviations (u, lol, btw), missing capitals, missing full stops, and sentence fragments are REGISTER CHOICES — not errors. Score the underlying grammar, vocabulary, and discourse management. Do NOT penalise chat informality. See the CHAT REGISTER CALIBRATION section in the rubric.",
    extended: "This is an EXTENDED WRITING TASK. The candidate wrote a longer continuous response. Hold to written register standards. Chat informality IS relevant to score here.",
    transform: "This is a TRANSFORMATION TASK. Assess the candidate's REWRITTEN text only — not the original stimulus. Focus on whether they controlled language for the target register/audience.",
  }[taskContext];

  return `You are a CEFR-trained language analyst. Analyse the candidate's written output using the rubric below.

IMPORTANT: If the candidate's text contains fewer than 10 real words (excluding gibberish, repeated characters, or nonsense), return:
{"overallFormLevel":"Insufficient data","overallFormSummary":"Not enough written text to assess language quality.","dimensions":[]}
Do NOT attempt to assign a CEFR level from empty, nonsensical, or extremely brief input.

TASK CONTEXT: ${contextNote}

${LANGUAGE_RUBRIC}

═══════════════════════════════════════════════════════════════
OUTPUT FORMAT
═══════════════════════════════════════════════════════════════

Respond ONLY with valid JSON — no preamble, no markdown:

{
  "overallFormLevel": "B1",
  "overallFormSummary": "2-sentence summary of overall language quality. Be specific — name what works and what limits the score.",
  "dimensions": [
    {
      "dimension": "Grammar Control",
      "level": "B1",
      "descriptor": "One sentence describing what this candidate actually does — not a generic band description.",
      "examples": ["direct quote 1", "direct quote 2"]
    },
    {
      "dimension": "Vocabulary Range",
      "level": "B1",
      "descriptor": "One sentence.",
      "examples": ["direct quote 1", "direct quote 2"]
    },
    {
      "dimension": "Discourse Management",
      "level": "B1",
      "descriptor": "One sentence.",
      "examples": ["direct quote 1", "direct quote 2"]
    },
    {
      "dimension": "Mechanics",
      "level": "B1",
      "descriptor": "One sentence.",
      "examples": ["direct quote 1"]
    }
  ]
}`;
}