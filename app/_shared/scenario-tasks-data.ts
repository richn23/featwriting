/* ═══════════════════════════════════════════════════════════════
   Scenario Task Data — All five workplace readiness tasks
   ═══════════════════════════════════════════════════════════════ */

import type { ScenarioTaskDef } from "./scenario-types";

// ─── TASK 1: Operational Judgment ───────────────────────────────

const OJT: ScenarioTaskDef = {
  id: "ojt",
  shortTitle: "Operational Judgment",
  accentColor: "#f59e0b",
  screens: [
    {
      kind: "briefing",
      badge: "Workplace Readiness",
      title: "Operational",
      titleEmphasis: "Judgment",
      subtitle: "Make decisions, justify them, and adapt as the situation evolves.",
      objective: "Resolve a workplace problem effectively while balancing urgency, communication, and decision-making.",
      criteria: [
        "Identifies the core problem correctly",
        "Prioritises actions appropriately",
        "Communicates clearly and professionally",
        "Knows when to escalate",
        "Considers consequences and trade-offs",
      ],
      stakeholder: [
        { title: "Why this task exists", body: "It tests operational decision-making — not writing ability. Can someone handle pressure, weigh trade-offs, and act at the right time?" },
        { title: "What it replaces", body: "Traditional situational judgement tests use static MCQs. This uses dynamic scenarios with evolving conditions — decisions have consequences." },
        { title: "How it is scored", body: "Decision quality (best/acceptable/poor), justification logic, escalation timing, and communication under pressure." },
      ],
    },
    {
      kind: "scenario",
      label: "Situation",
      title: "The scenario",
      body: "You are working as a training coordinator. A scheduled training session for 30 employees is about to begin.\n\nThe trainer has not arrived, and participants are already waiting in the room.\n\nYou receive a message that the trainer may be delayed by 45 minutes.\n\nSome participants are senior staff with limited availability.",
    },
    {
      kind: "choice",
      label: "Decision 1",
      question: "What do you do first?",
      options: [
        { id: "a", text: "Wait for the trainer to confirm arrival", quality: "poor" },
        { id: "b", text: "Inform participants of the delay and ask them to wait", quality: "acceptable" },
        { id: "c", text: "Escalate immediately to your manager", quality: "poor" },
        { id: "d", text: "Attempt to find a replacement trainer while informing participants", quality: "best" },
      ],
      requireJustification: true,
      justificationPrompt: "Why did you choose this action? What factors did you consider?",
      justificationMax: 80,
    },
    {
      kind: "update",
      label: "Update",
      title: "15 minutes later…",
      body: "Participants are becoming frustrated. One senior manager says they will leave in 10 minutes if nothing starts.\n\nThe trainer has still not confirmed their arrival time.",
    },
    {
      kind: "choice",
      label: "Decision 2",
      question: "What is your next action?",
      options: [
        { id: "a", text: "Ask the senior manager to be patient — the trainer should arrive soon", quality: "poor" },
        { id: "b", text: "Start an informal discussion activity to keep participants engaged while you resolve the situation", quality: "best" },
        { id: "c", text: "Cancel the session and reschedule", quality: "poor" },
        { id: "d", text: "Contact the trainer again and wait for a response", quality: "acceptable" },
      ],
      requireJustification: true,
      justificationPrompt: "Explain your reasoning. What are you trying to achieve?",
      justificationMax: 80,
    },
    {
      kind: "update",
      label: "Escalation trigger",
      title: "The trainer confirms they will not arrive.",
      body: "You now know the session cannot run as planned. The participants are still waiting.",
    },
    {
      kind: "choice",
      label: "Decision 3",
      question: "Do you escalate?",
      options: [
        { id: "a", text: "Yes — escalate to your manager immediately", quality: "best" },
        { id: "b", text: "No — handle it yourself by rescheduling", quality: "acceptable" },
        { id: "c", text: "Yes — escalate to HR and the trainer's department", quality: "poor" },
        { id: "d", text: "No — wait to see if another trainer becomes available", quality: "poor" },
      ],
      requireJustification: true,
      justificationPrompt: "Who would you contact and why? What outcome are you looking for?",
      justificationMax: 80,
    },
    {
      kind: "short-text",
      label: "Communication",
      question: "Write a message to the participants explaining the situation.",
      constraints: [
        "Maximum 80 words",
        "Acknowledge the issue",
        "Give a clear next step",
        "Maintain professional tone",
      ],
      maxWords: 80,
      scoringHints: [
        "Acknowledges the inconvenience",
        "Explains what happened (without blame)",
        "States a clear next action",
        "Professional and calm tone",
      ],
    },
  ],
  scoringDimensions: [
    { name: "Decision Quality", description: "Were the choices logical and effective?" },
    { name: "Justification Logic", description: "Did reasoning mention urgency, stakeholders, and consequences?" },
    { name: "Escalation Judgment", description: "Was escalation timed appropriately — not too early, not too late?" },
    { name: "Communication Quality", description: "Was the message clear, professional, and complete?" },
  ],
};


// ─── TASK 2: Applied CPD Assessment ────────────────────────────

const CPD: ScenarioTaskDef = {
  id: "cpd",
  shortTitle: "Applied CPD",
  accentColor: "#34d399",
  screens: [
    {
      kind: "briefing",
      badge: "Professional Development",
      title: "Applied CPD",
      titleEmphasis: "Assessment",
      subtitle: "Show how you would apply training in your classroom — not what you remember.",
      objective: "Apply strategies to manage a class with varying student ability levels.",
      criteria: [
        "Identifies causes of mixed ability accurately",
        "Recognises impact on learning and engagement",
        "Connects ideas to real teaching experience",
        "Proposes practical and effective strategies",
        "Demonstrates awareness of trade-offs",
      ],
      stakeholder: [
        { title: "Why this task exists", body: "Traditional CPD checks recall — 'what did you learn?' This checks application — 'can you use it in your classroom?'" },
        { title: "What it replaces", body: "Post-training MCQs and reflective journals. This forces structured thinking: diagnose, strategise, prioritise under constraints." },
        { title: "How it is scored", body: "Problem diagnosis quality, impact awareness, strategy practicality, pedagogical understanding, and decision quality under constraints." },
      ],
    },
    {
      kind: "scenario",
      label: "Classroom scenario",
      title: "The situation",
      body: "You are teaching a class of 18 ESL students. During a speaking activity, you notice:\n\n• 5 students dominate the discussion\n• 8 students participate minimally\n• 5 students do not speak at all\n\nAfter class, one weaker student says the lesson was \"too difficult,\" while a stronger student says it was \"too easy.\"",
    },
    {
      kind: "multi-select",
      label: "Diagnosis",
      question: "Why is this happening? Select the 2–3 most likely causes.",
      options: [
        { id: "a", text: "Lack of task differentiation", correct: true },
        { id: "b", text: "Mixed proficiency levels in the group", correct: true },
        { id: "c", text: "Unclear instructions from the teacher", correct: false },
        { id: "d", text: "Student motivation differences", correct: true },
        { id: "e", text: "Task not aligned to any level", correct: false },
      ],
      minSelect: 2,
      maxSelect: 3,
      requireJustification: true,
      justificationPrompt: "Explain briefly why these are the main causes.",
      justificationMax: 80,
    },
    {
      kind: "multi-select",
      label: "Impact analysis",
      question: "What problems does this create? Select all that apply.",
      options: [
        { id: "a", text: "Disengagement from weaker students", correct: true },
        { id: "b", text: "Reduced participation overall", correct: true },
        { id: "c", text: "Frustration at both ends of the ability range", correct: true },
        { id: "d", text: "Unequal learning outcomes", correct: true },
        { id: "e", text: "Students will leave the course", correct: false },
      ],
      requireJustification: true,
      justificationPrompt: "Which of these concerns you most, and why?",
      justificationMax: 60,
    },
    {
      kind: "short-text",
      label: "Reflection",
      question: "Have you seen this before? Describe a brief example from your experience.",
      constraints: [
        "Maximum 60 words",
        "What happened?",
        "What did you do?",
      ],
      maxWords: 60,
      scoringHints: [
        "Describes a specific situation (not generic)",
        "Mentions what they actually did",
        "Shows awareness of the problem",
      ],
    },
    {
      kind: "short-text",
      label: "Strategy design",
      question: "What would you do in the next lesson? Describe 2–3 strategies. For each, say what you would do and why it helps.",
      constraints: [
        "Maximum 120 words",
        "2–3 strategies",
        "Each must include: what you do + why it helps",
      ],
      maxWords: 120,
      scoringHints: [
        "Strategies are practical and specific (not just 'group work')",
        "Includes differentiation or scaffolding",
        "Explains why each strategy addresses the problem",
        "Actionable in a real classroom",
      ],
    },
    {
      kind: "update",
      label: "Constraint",
      title: "But there's a catch.",
      body: "You only have:\n\n• 50 minutes\n• No extra materials\n• Mixed motivation levels in the group",
    },
    {
      kind: "choice",
      label: "Prioritisation",
      question: "Which ONE strategy is your priority — given the constraints?",
      options: [
        { id: "a", text: "Tiered tasks with different output expectations for each level", quality: "best" },
        { id: "b", text: "Mixed-ability pair work with structured roles", quality: "acceptable" },
        { id: "c", text: "Whole-class discussion with teacher support", quality: "poor" },
        { id: "d", text: "Let students choose their own activity level", quality: "poor" },
      ],
      requireJustification: true,
      justificationPrompt: "Why this one? What makes it work under these constraints?",
      justificationMax: 80,
    },
  ],
  scoringDimensions: [
    { name: "Problem Diagnosis", description: "Accurately identified causes — not superficial" },
    { name: "Impact Awareness", description: "Specific consequences, not vague ('students struggle')" },
    { name: "Strategy Practicality", description: "Actionable ideas, not generic ('group work')" },
    { name: "Pedagogical Awareness", description: "Shows understanding of differentiation, scaffolding, task design" },
    { name: "Decision Quality", description: "Chose the best strategy under real constraints" },
  ],
};


// ─── TASK 3: AI Use & Policy ───────────────────────────────────

const AI_POLICY: ScenarioTaskDef = {
  id: "ai-policy",
  shortTitle: "AI Use & Policy",
  accentColor: "#38bdf8",
  screens: [
    {
      kind: "briefing",
      badge: "Critical Judgment",
      title: "AI Use &",
      titleEmphasis: "Policy",
      subtitle: "Can you recognise when AI output is appropriate, risky, or needs modification?",
      objective: "Evaluate and adapt AI-generated content for professional use.",
      criteria: [
        "Identifies risks in AI output",
        "Recognises inappropriate use",
        "Edits content for accuracy and tone",
        "Applies organisational policy",
        "Justifies decisions clearly",
      ],
      stakeholder: [
        { title: "Why this task exists", body: "Everyone uses AI. Very few can evaluate it critically. This tests judgment — not whether you can prompt." },
        { title: "What it replaces", body: "Self-assessment surveys ('Do you use AI responsibly?'). This shows whether you actually can." },
        { title: "How it is scored", body: "Risk detection accuracy, policy alignment, quality of adaptation, and clarity of reasoning." },
      ],
    },
    {
      kind: "scenario",
      label: "AI output",
      title: "You receive this AI-generated lesson plan",
      body: "Topic: Teaching Vocabulary to Intermediate ESL Students\n\nObjective: Students will learn 50 new vocabulary words through memorisation and repetition drills.\n\nActivities:\n1. Teacher reads the word list aloud. Students repeat.\n2. Students copy words into notebooks.\n3. Teacher corrects all mistakes immediately to ensure accuracy.\n4. Students take a written test at the end of class.\n\nExpected outcome: All students will memorise all 50 words by end of session.",
      note: "This was generated by an AI tool. You need to decide whether it is suitable for use.",
      pinAsReference: true,
    },
    {
      kind: "multi-select",
      label: "Evaluation",
      question: "What are the issues with this lesson plan? Select all that apply.",
      options: [
        { id: "a", text: "Pedagogically inappropriate — memorisation alone is ineffective for vocabulary acquisition", correct: true },
        { id: "b", text: "Unrealistic expectations — 50 words in one session is too many", correct: true },
        { id: "c", text: "No student engagement — entirely teacher-led with no interaction", correct: true },
        { id: "d", text: "Immediate error correction discourages risk-taking", correct: true },
        { id: "e", text: "No issues — this is a standard vocabulary lesson", correct: false },
      ],
      requireJustification: true,
      justificationPrompt: "Which issue is most serious, and why?",
      justificationMax: 80,
    },
    {
      kind: "scenario",
      label: "Policy",
      title: "Your organisation's AI policy",
      body: "Your school has the following policy on AI-assisted planning:\n\n• AI can assist planning but all output must be reviewed and adapted\n• Activities must be level-appropriate and evidence-based\n• Student engagement and interaction are priorities\n• Teachers are responsible for all content used in class",
      pinAsReference: true,
    },
    {
      kind: "choice",
      label: "Policy check",
      question: "Is this lesson plan acceptable as-is under the policy?",
      options: [
        { id: "a", text: "Yes — it covers vocabulary teaching effectively", quality: "poor" },
        { id: "b", text: "No — it violates multiple policy requirements", quality: "best" },
        { id: "c", text: "Partially — it needs minor adjustments", quality: "acceptable" },
        { id: "d", text: "The policy doesn't apply to lesson plans", quality: "poor" },
      ],
      requireJustification: true,
      justificationPrompt: "Which policy points does it fail to meet?",
      justificationMax: 80,
    },
    {
      kind: "short-text",
      label: "Adaptation",
      question: "Rewrite the lesson plan to fix the problems. Keep the vocabulary topic but make it effective.",
      constraints: [
        "Maximum 100 words",
        "Fix the pedagogy",
        "Adjust expectations to a realistic number",
        "Include student engagement and interaction",
      ],
      maxWords: 100,
      scoringHints: [
        "Reduces word count to realistic number (8–15 words)",
        "Includes interactive activities (not just repetition)",
        "Adds context or communicative use of vocabulary",
        "Removes or modifies immediate correction approach",
        "Aligns with the organisation's policy",
      ],
    },
    {
      kind: "choice",
      label: "Risk judgment",
      question: "What is the biggest risk if the original plan is used without changes?",
      options: [
        { id: "a", text: "Student disengagement — passive learning leads to switching off", quality: "best" },
        { id: "b", text: "Ineffective learning — memorisation without context doesn't stick", quality: "acceptable" },
        { id: "c", text: "Reputational risk — the school could be seen as using AI irresponsibly", quality: "acceptable" },
        { id: "d", text: "No real risk — the plan would work fine", quality: "poor" },
      ],
      requireJustification: true,
      justificationPrompt: "Why is this the biggest risk?",
      justificationMax: 60,
    },
  ],
  scoringDimensions: [
    { name: "Risk Detection", description: "Identified the real problems — not surface issues" },
    { name: "Policy Alignment", description: "Connected issues to specific policy requirements" },
    { name: "Adaptation Quality", description: "Rewrote effectively — not just cosmetic changes" },
    { name: "Reasoning Clarity", description: "Justified decisions with clear logic" },
  ],
};


// ─── TASK 4: Information Prioritisation ────────────────────────

const INFO_PRIORITY: ScenarioTaskDef = {
  id: "info-priority",
  shortTitle: "Info Prioritisation",
  accentColor: "#a78bfa",
  screens: [
    {
      kind: "briefing",
      badge: "Operational Thinking",
      title: "Information",
      titleEmphasis: "Prioritisation",
      subtitle: "Filter, prioritise, and act under information overload.",
      objective: "Identify key information and prioritise actions effectively under time pressure.",
      criteria: [
        "Identifies relevant vs irrelevant information",
        "Recognises urgency correctly",
        "Prioritises logically",
        "Justifies decisions clearly",
        "Adapts when the situation changes",
      ],
      stakeholder: [
        { title: "Why this task exists", body: "Real work means information overload. This tests whether someone can separate signal from noise and act on what matters." },
        { title: "What it replaces", body: "Reading comprehension tests that ask 'what did the text say?' This asks 'what would you do about it?'" },
        { title: "How it is scored", body: "Prioritisation accuracy, logical reasoning, adaptability when conditions change, and clarity of planned action." },
      ],
    },
    {
      kind: "scenario",
      label: "Inbox",
      title: "You arrive at work and find these messages",
      body: "📧 Email (8:47am): \"Training session starts at 10am. Room not yet confirmed.\"\n\n💬 WhatsApp (8:52am): \"Trainer is stuck in traffic — might be 20 mins late.\"\n\n📧 Email (8:55am): \"CEO may attend the first 15 minutes of the session.\"\n\n💬 Message (9:01am): \"Projector not working in Room A.\"\n\n📧 Email (9:05am): \"Three participants asking if the session is cancelled.\"",
      pinAsReference: true,
    },
    {
      kind: "rank",
      label: "Prioritise",
      question: "Rank these actions in order of priority (most urgent first).",
      items: [
        { id: "room", text: "Confirm the room and fix the projector" },
        { id: "trainer", text: "Contact the trainer to confirm arrival time" },
        { id: "participants", text: "Inform participants the session is happening" },
        { id: "backup", text: "Prepare a backup plan in case the trainer is very late" },
        { id: "ceo", text: "Brief the CEO's office on the delay" },
      ],
      idealOrder: ["participants", "room", "trainer", "backup", "ceo"],
      requireJustification: true,
      justificationPrompt: "Why did you put your top priority first?",
      justificationMax: 60,
    },
    {
      kind: "short-text",
      label: "First action",
      question: "What is the very first thing you do? Be specific.",
      constraints: [
        "Maximum 50 words",
        "One concrete action",
      ],
      maxWords: 50,
      scoringHints: [
        "Addresses the most urgent issue (participant uncertainty or room)",
        "Is specific and actionable (not 'handle the situation')",
        "Shows awareness of time pressure",
      ],
    },
    {
      kind: "update",
      label: "Twist",
      title: "Things just got worse.",
      body: "The trainer messages again: they will be 60 minutes late — not 20.\n\nThe CEO's assistant calls to confirm they are on their way.\n\nTwo more participants ask if they should come.",
    },
    {
      kind: "rank",
      label: "Re-prioritise",
      question: "Given the update, re-rank your priorities.",
      items: [
        { id: "cancel-reschedule", text: "Consider cancelling or rescheduling the session" },
        { id: "participants-update", text: "Send an update to all participants immediately" },
        { id: "ceo-update", text: "Contact the CEO's office about the delay" },
        { id: "backup-activity", text: "Prepare a 30-minute bridging activity" },
        { id: "escalate-manager", text: "Escalate to your manager for a decision" },
      ],
      idealOrder: ["participants-update", "ceo-update", "escalate-manager", "backup-activity", "cancel-reschedule"],
      requireJustification: true,
      justificationPrompt: "What changed in your thinking? Why did your priorities shift?",
      justificationMax: 80,
    },
    {
      kind: "short-text",
      label: "Adaptation",
      question: "Write a short message to participants explaining the updated situation.",
      constraints: [
        "Maximum 60 words",
        "Acknowledge the problem",
        "State what is happening now",
        "Give a clear next step",
      ],
      maxWords: 60,
      scoringHints: [
        "Honest about the delay (doesn't hide it)",
        "Gives a concrete plan (not just 'we'll let you know')",
        "Professional and reassuring tone",
        "Respects participants' time",
      ],
    },
  ],
  scoringDimensions: [
    { name: "Prioritisation Accuracy", description: "Ranked urgent items correctly" },
    { name: "Logical Reasoning", description: "Explained priorities with clear logic" },
    { name: "Adaptability", description: "Changed approach appropriately when conditions changed" },
    { name: "Communication Clarity", description: "Written messages were clear and actionable" },
  ],
};


// ─── TASK 5: Argument Evaluation ───────────────────────────────

const ARGUMENT_EVAL: ScenarioTaskDef = {
  id: "argument",
  shortTitle: "Argument Evaluation",
  accentColor: "#fb7185",
  screens: [
    {
      kind: "briefing",
      badge: "Critical Thinking",
      title: "Argument",
      titleEmphasis: "Evaluation",
      subtitle: "Break down arguments, judge them, and build a better one.",
      objective: "Analyse and evaluate arguments, then construct a clear and logical position.",
      criteria: [
        "Identifies main claims accurately",
        "Distinguishes strong vs weak reasoning",
        "Recognises assumptions or gaps",
        "Constructs a clear, supported argument",
        "Prioritises relevant evidence",
      ],
      stakeholder: [
        { title: "Why this task exists", body: "Essays test writing length. This tests reasoning quality — modular, scorable, and isolated from language proficiency." },
        { title: "What it replaces", body: "Timed essays with subjective marking. This breaks argumentation into distinct, measurable components." },
        { title: "How it is scored", body: "Claim identification accuracy, evaluation quality, weakness detection, evidence judgment, and argument construction." },
      ],
    },
    {
      kind: "scenario",
      label: "Two viewpoints",
      title: "Read both texts carefully",
      body: "Text A:\n\"Online learning increases accessibility and allows students to learn at their own pace. Research shows that flexible scheduling leads to better outcomes for most learners, particularly working adults. This makes online learning the clear future of education.\"\n\nText B:\n\"Online learning reduces interaction and accountability. Studies indicate that many students become disengaged without face-to-face contact, and dropout rates for online courses are significantly higher. The lack of social learning means important skills are not developed.\"",
      pinAsReference: true,
    },
    {
      kind: "short-text",
      label: "Claim identification",
      question: "What is the main claim of each text? Write one sentence for each.",
      constraints: [
        "One sentence per text",
        "State the claim — not a summary of the whole text",
      ],
      maxWords: 50,
      scoringHints: [
        "Text A claim: online learning is better because of flexibility/accessibility",
        "Text B claim: online learning is worse because of reduced interaction/engagement",
        "Captures the core argument, not just the topic",
      ],
    },
    {
      kind: "choice",
      label: "Evaluation",
      question: "Which argument is stronger?",
      options: [
        { id: "a", text: "Text A is stronger", quality: "acceptable" },
        { id: "b", text: "Text B is stronger", quality: "best" },
        { id: "c", text: "Both are equally strong", quality: "acceptable" },
      ],
      requireJustification: true,
      justificationPrompt: "Why? What makes one argument more convincing than the other?",
      justificationMax: 80,
    },
    {
      kind: "multi-select",
      label: "Weakness detection",
      question: "What weakness can you identify in Text A? Select the most accurate description.",
      options: [
        { id: "a", text: "Overgeneralisation — claims online learning works for 'most learners' without sufficient evidence", correct: true },
        { id: "b", text: "Ignores alternative perspectives — does not address any downsides", correct: true },
        { id: "c", text: "Unclear reasoning — the connection between flexibility and outcomes is assumed, not proven", correct: true },
        { id: "d", text: "The text is too short to evaluate", correct: false },
      ],
      minSelect: 1,
      maxSelect: 2,
      requireJustification: true,
      justificationPrompt: "Explain the weakness you selected in your own words.",
      justificationMax: 60,
    },
    {
      kind: "evidence-select",
      label: "Evidence judgment",
      question: "Which piece of evidence would best support a balanced position on online learning?",
      options: [
        { id: "a", text: "A study showing that blended learning (online + face-to-face) produces the best outcomes across age groups", quality: "strong" },
        { id: "b", text: "A blog post by a university professor who prefers online teaching", quality: "weak" },
        { id: "c", text: "Statistics showing that internet usage has increased globally", quality: "irrelevant" },
        { id: "d", text: "A news headline: 'Online learning is the future — traditional classrooms are dead'", quality: "misleading" },
      ],
      requireJustification: true,
      justificationPrompt: "Why is this the best evidence?",
    },
    {
      kind: "short-text",
      label: "Argument construction",
      question: "Build your own argument about online learning. Take a clear position.",
      constraints: [
        "Maximum 100 words",
        "Include a clear position",
        "Support it with one reason",
        "Include one piece of evidence or example",
      ],
      maxWords: 100,
      scoringHints: [
        "Takes a clear, stated position (not fence-sitting)",
        "Gives a specific reason (not just 'I think…')",
        "Includes evidence or a concrete example",
        "Logic flows: position → reason → evidence",
        "Acknowledges the other side (bonus)",
      ],
    },
  ],
  scoringDimensions: [
    { name: "Claim Identification", description: "Accurately captured each text's main argument" },
    { name: "Evaluation Quality", description: "Analytical, not just 'I agree' — compared reasoning quality" },
    { name: "Weakness Detection", description: "Correctly identified logical flaws" },
    { name: "Evidence Judgment", description: "Selected the strongest, most relevant evidence" },
    { name: "Argument Construction", description: "Built a clear, logical, supported position" },
  ],
};


// ─── TASK 6: Data Literacy ────────────────────────────────────

const DATA_LITERACY: ScenarioTaskDef = {
  id: "data-literacy",
  shortTitle: "Data Literacy",
  accentColor: "#818cf8",
  screens: [
    {
      kind: "briefing",
      badge: "Academic Assessment",
      title: "Data",
      titleEmphasis: "Literacy",
      subtitle: "Can you read data critically — not just accurately?",
      objective: "Evaluate data presentations, identify misleading elements, and communicate what data actually shows.",
      criteria: [
        "Identifies misleading elements in data visualisation",
        "Distinguishes correlation from causation",
        "Recognises missing context or cherry-picked data",
        "Communicates findings clearly to a non-technical audience",
        "Makes evidence-based recommendations",
      ],
      stakeholder: [
        { title: "Why this task exists", body: "Everyone encounters charts and statistics. Very few can evaluate them critically. This tests whether someone can spot problems in data presentation and explain what the data actually means." },
        { title: "What it replaces", body: "Statistics quizzes that test calculation, not interpretation. This tests judgment: can you see what's wrong, and can you explain it?" },
        { title: "How it is scored", body: "Problem identification accuracy, reasoning quality, ability to reinterpret data honestly, and communication clarity." },
      ],
    },
    {
      kind: "scenario",
      label: "The chart",
      title: "Your manager shares this data in a meeting",
      body: "A bar chart is presented with the title: \"Customer Satisfaction Up 45% Since New Training Programme\"\n\nThe chart shows:\n• January: 62% satisfaction\n• June: 90% satisfaction\n\nThe y-axis starts at 55% (not zero).\nThe sample was 12 customers in January, 47 in June.\nThe new training programme started in March.\nA competitor closed down in April, sending their customers to your company.\nThe survey question changed from \"Are you satisfied?\" to \"Would you recommend us?\"",
      pinAsReference: true,
    },
    {
      kind: "multi-select",
      label: "Problem identification",
      question: "What problems can you identify with this data presentation? Select all that apply.",
      options: [
        { id: "a", text: "Truncated y-axis exaggerates the visual difference between January and June", correct: true },
        { id: "b", text: "Different sample sizes (12 vs 47) make the comparison unreliable", correct: true },
        { id: "c", text: "The survey question changed — the two numbers measure different things", correct: true },
        { id: "d", text: "A competitor closing could explain the increase, not the training", correct: true },
        { id: "e", text: "The colours used in the chart are misleading", correct: false },
      ],
      minSelect: 2,
      maxSelect: 5,
      requireJustification: true,
      justificationPrompt: "Which problem is the most serious, and why?",
      justificationMax: 80,
    },
    {
      kind: "choice",
      label: "Causation check",
      question: "Can you conclude that the training programme caused the improvement?",
      options: [
        { id: "a", text: "Yes — the timing matches and satisfaction went up", quality: "poor" },
        { id: "b", text: "No — there are too many confounding variables to make a causal claim", quality: "best" },
        { id: "c", text: "Probably — the training likely contributed even if other factors were involved", quality: "acceptable" },
        { id: "d", text: "We need more data before drawing any conclusion", quality: "acceptable" },
      ],
      requireJustification: true,
      justificationPrompt: "Explain your reasoning. What would you need to establish causation?",
      justificationMax: 80,
    },
    {
      kind: "short-text",
      label: "Honest summary",
      question: "Rewrite the chart title to honestly reflect what the data shows. Then write 1–2 sentences explaining what we can and cannot conclude.",
      constraints: [
        "Maximum 60 words",
        "New title must be accurate",
        "State what the data shows AND what it doesn't prove",
      ],
      maxWords: 60,
      scoringHints: [
        "Title avoids causal language ('up 45% since…')",
        "Acknowledges the different measures or sample sizes",
        "Separates what the data shows from what it doesn't prove",
        "Doesn't dismiss the data entirely — notes what is useful",
      ],
    },
    {
      kind: "update",
      label: "New request",
      title: "Your manager wants to present this to the board.",
      body: "They ask you to write a short summary for the board pack. They want it to be positive but accurate.\n\n\"We can't show them a chart with problems. Help me present this honestly but constructively.\"",
    },
    {
      kind: "short-text",
      label: "Board summary",
      question: "Write a 2–3 sentence summary for the board that is honest about the data but constructive about next steps.",
      constraints: [
        "Maximum 80 words",
        "Acknowledge what the data shows",
        "Be honest about limitations",
        "Suggest what to measure next",
      ],
      maxWords: 80,
      scoringHints: [
        "Doesn't overstate the positive trend",
        "Mentions limitations without being dismissive",
        "Suggests a concrete next step (e.g., standardise the survey, control for the competitor effect)",
        "Professional tone appropriate for a board audience",
        "Constructive — frames limitations as opportunities to improve measurement",
      ],
    },
  ],
  scoringDimensions: [
    { name: "Problem Detection", description: "Spotted the real issues — not surface-level observations" },
    { name: "Causal Reasoning", description: "Distinguished correlation from causation correctly" },
    { name: "Data Reinterpretation", description: "Rewrote honestly without distorting or dismissing" },
    { name: "Communication Clarity", description: "Explained findings clearly for a non-technical audience" },
  ],
};


// ─── TASK 7: Explain Simply ──────────────────────────────────

const EXPLAIN_SIMPLY: ScenarioTaskDef = {
  id: "explain-simply",
  shortTitle: "Explain Simply",
  accentColor: "#f472b6",
  screens: [
    {
      kind: "briefing",
      badge: "Academic Assessment",
      title: "Explain",
      titleEmphasis: "Simply",
      subtitle: "If you can't explain it simply, you don't understand it well enough.",
      objective: "Take a complex concept and explain it clearly to someone with no background knowledge.",
      criteria: [
        "Identifies the core idea accurately",
        "Removes unnecessary jargon",
        "Uses effective analogies or examples",
        "Adapts when the audience shows confusion",
        "Maintains accuracy while simplifying",
      ],
      stakeholder: [
        { title: "Why this task exists", body: "Explaining a complex idea simply is the hardest test of understanding. If someone can only explain it using technical language, they may be reciting — not understanding." },
        { title: "What it replaces", body: "Written exams that reward technical vocabulary. This rewards clarity, accuracy, and the ability to make an idea accessible." },
        { title: "How it is scored", body: "Accuracy of the core explanation, absence of unnecessary jargon, quality of analogies, and ability to adapt when the audience is confused." },
      ],
    },
    {
      kind: "scenario",
      label: "The concept",
      title: "You need to explain this concept",
      body: "Compound interest\n\nA colleague who has never studied finance asks you: \"My bank keeps talking about compound interest. What actually is it? Why does everyone say it matters?\"\n\nThey are intelligent but have no financial background. They need to understand the concept well enough to make a decision about a savings account.",
      pinAsReference: true,
    },
    {
      kind: "choice",
      label: "Approach",
      question: "Which explanation approach would work best for this person?",
      options: [
        { id: "a", text: "Define it technically: 'Compound interest is interest calculated on the initial principal and accumulated interest from previous periods'", quality: "poor" },
        { id: "b", text: "Use a simple analogy: compare it to something they already understand, like a snowball rolling downhill", quality: "best" },
        { id: "c", text: "Give them a formula and work through an example with numbers", quality: "acceptable" },
        { id: "d", text: "Tell them it doesn't matter — just pick the account with the highest rate", quality: "poor" },
      ],
      requireJustification: true,
      justificationPrompt: "Why is this the best approach for this particular person?",
      justificationMax: 60,
    },
    {
      kind: "short-text",
      label: "Your explanation",
      question: "Write your explanation of compound interest for this person. Remember: they're intelligent but have zero financial background.",
      constraints: [
        "Maximum 100 words",
        "No jargon or technical terms",
        "Must be accurate — don't oversimplify to the point of being wrong",
        "Include why it matters, not just what it is",
      ],
      maxWords: 100,
      scoringHints: [
        "Core concept is correct (interest on interest, not just on the original amount)",
        "No unexplained jargon (principal, APR, etc.)",
        "Uses a concrete example, analogy, or comparison",
        "Explains why it matters (money grows faster over time)",
        "Accessible tone — sounds like talking to a person, not reading a textbook",
      ],
    },
    {
      kind: "multi-select",
      label: "Spot the problems",
      question: "A trainee wrote these explanations. Which ones have problems?",
      options: [
        { id: "a", text: "\"Compound interest is when your interest earns interest. So your money grows faster the longer you leave it.\"", correct: false },
        { id: "b", text: "\"It's basically exponential growth applied to financial instruments with a fixed or variable rate of return.\"", correct: true },
        { id: "c", text: "\"Think of it like a snowball. It starts small, but as it rolls, it picks up more snow. Your money does the same — the bigger it gets, the faster it grows.\"", correct: false },
        { id: "d", text: "\"Compound interest means you get free money from the bank. The longer you wait, the more free money you get.\"", correct: true },
      ],
      minSelect: 1,
      maxSelect: 3,
      requireJustification: true,
      justificationPrompt: "What's wrong with the ones you selected?",
      justificationMax: 80,
    },
    {
      kind: "update",
      label: "Confusion",
      title: "They're confused.",
      body: "Your colleague responds:\n\n\"OK, I think I get it — so it's just the same as normal interest but more? Why does everyone make such a big deal about it?\"\n\nThey've understood the surface but missed the key insight — the compounding effect over time.",
    },
    {
      kind: "short-text",
      label: "Clarify",
      question: "They've missed the point. Write a follow-up that clarifies the key insight — why compound interest is fundamentally different from simple interest — without making them feel stupid.",
      constraints: [
        "Maximum 80 words",
        "Address their specific misunderstanding",
        "Use a concrete example with numbers if it helps",
        "Encouraging tone",
      ],
      maxWords: 80,
      scoringHints: [
        "Identifies their gap: they think it's just 'more interest' not 'accelerating interest'",
        "Uses a concrete example (e.g., £1000 over 10 years vs 30 years)",
        "Shows the acceleration — not just that it's more, but that the growth speeds up",
        "Doesn't patronise — builds on what they already understood",
        "Tone is encouraging, not corrective",
      ],
    },
    {
      kind: "choice",
      label: "Analogy check",
      question: "Which analogy best captures the KEY insight of compound interest (that growth accelerates over time)?",
      options: [
        { id: "a", text: "A snowball rolling downhill — it picks up more snow the bigger it gets", quality: "best" },
        { id: "b", text: "A ladder — each rung takes you a step higher", quality: "poor" },
        { id: "c", text: "A tree growing — it takes years but eventually it's huge", quality: "acceptable" },
        { id: "d", text: "Filling a bucket — the more you add, the fuller it gets", quality: "poor" },
      ],
      requireJustification: true,
      justificationPrompt: "Why does this analogy work better than the others?",
      justificationMax: 60,
    },
  ],
  scoringDimensions: [
    { name: "Core Accuracy", description: "The explanation was correct — not oversimplified to the point of being wrong" },
    { name: "Jargon Removal", description: "Technical terms removed or explained — accessible language throughout" },
    { name: "Analogy Quality", description: "Used effective comparisons that illuminate rather than obscure" },
    { name: "Adaptation", description: "Responded to confusion by clarifying the specific gap — not just repeating" },
    { name: "Tone & Accessibility", description: "Warm, encouraging, and respectful — not patronising or academic" },
  ],
};


// ─── Export all tasks ──────────────────────────────────────────

export const SCENARIO_TASKS: Record<string, ScenarioTaskDef> = {
  ojt: OJT,
  cpd: CPD,
  "ai-policy": AI_POLICY,
  "info-priority": INFO_PRIORITY,
  argument: ARGUMENT_EVAL,
  "data-literacy": DATA_LITERACY,
  "explain-simply": EXPLAIN_SIMPLY,
};

export const SCENARIO_TASK_LIST = [OJT, CPD, AI_POLICY, INFO_PRIORITY, ARGUMENT_EVAL];
export const ACADEMIC_TASK_LIST = [DATA_LITERACY, EXPLAIN_SIMPLY];
