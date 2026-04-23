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


// ─── TASK 3: AI Judgement ──────────────────────────────────────

const AI_POLICY: ScenarioTaskDef = {
  id: "ai-policy",
  shortTitle: "AI Judgement",
  accentColor: "#38bdf8",
  screens: [
    {
      kind: "briefing",
      badge: "Critical Judgment",
      title: "AI",
      titleEmphasis: "Judgement",
      subtitle: "Can you decide when to use AI, when to check it, and when to keep humans in the loop?",
      objective: "Demonstrate sound judgement about AI use in professional contexts.",
      criteria: [
        "Identifies when AI output needs human review",
        "Recognises inappropriate or risky AI use",
        "Considers audience and consequence before acting",
        "Adapts approach when conditions change",
        "Justifies decisions clearly",
      ],
      stakeholder: [
        { title: "Why this task exists", body: "Every employer needs people who use AI sensibly — not people who blindly trust it or reflexively avoid it. This tests judgement, not tool knowledge." },
        { title: "What it replaces", body: "AI literacy quizzes and self-assessment surveys. Those ask 'do you use AI responsibly?' This shows whether you actually can." },
        { title: "How it is scored", body: "Risk identification, human-in-loop reasoning, quality of adaptation, and clarity of justification." },
      ],
    },
    {
      kind: "scenario",
      label: "Situation",
      title: "The scenario",
      body: "You've been asked to respond to a client complaint.\n\nA colleague says just use AI to write it and send it straight away.\n\nWhat do you do — and why?",
      pinAsReference: true,
    },
    {
      kind: "choice",
      label: "First move",
      question: "What do you do first?",
      options: [
        { id: "a", text: "Use AI to draft a response, then review and edit it carefully before sending", quality: "best" },
        { id: "b", text: "Do what your colleague suggested — let AI write it and send immediately", quality: "poor" },
        { id: "c", text: "Refuse to use AI and write the whole response yourself from scratch", quality: "acceptable" },
        { id: "d", text: "Send the AI draft but add a line saying it was written by AI", quality: "poor" },
      ],
      requireJustification: true,
      justificationPrompt: "Explain your reasoning. What risks are you weighing?",
      justificationMax: 80,
    },
    {
      kind: "short-text",
      label: "Your approach",
      question: "Write a short plan for how you would handle this. What will AI do, and what will you check before sending?",
      constraints: [
        "Maximum 100 words",
        "Say what AI does and doesn't do",
        "Name at least one thing you will check",
        "Mention the client or consequence",
      ],
      maxWords: 100,
      scoringHints: [
        "Identifies what only a human can judge (tone, facts, relationship)",
        "Plans to review AI output before sending",
        "Considers the audience — a real client, not an internal note",
        "Acknowledges that complaints are high-stakes",
        "Practical and specific — not just 'I would be careful'",
      ],
    },
    {
      kind: "update",
      label: "Update",
      title: "The complaint is more serious than it first looked.",
      body: "Reading the client's full email, you realise they are threatening to cancel the contract.\n\nYour manager is unavailable until tomorrow morning.\n\nThe colleague repeats: \"Just let AI handle it. It's faster.\"",
    },
    {
      kind: "choice",
      label: "Adapt",
      question: "Does your approach change?",
      options: [
        { id: "a", text: "Yes — write a brief holding reply yourself acknowledging their concerns, then escalate to your manager in the morning", quality: "best" },
        { id: "b", text: "Yes — escalate now and don't send anything until your manager is back", quality: "acceptable" },
        { id: "c", text: "No — AI can still draft it, you'll review it before sending", quality: "acceptable" },
        { id: "d", text: "Send the AI draft immediately — speed matters more than escalation", quality: "poor" },
      ],
      requireJustification: true,
      justificationPrompt: "Why did your thinking shift — or why not?",
      justificationMax: 80,
    },
    {
      kind: "short-text",
      label: "Final justification",
      question: "Explain your final decision to your colleague in 1–2 sentences.",
      constraints: [
        "Maximum 50 words",
        "Clear and direct",
        "Respectful tone",
      ],
      maxWords: 50,
      scoringHints: [
        "States the decision plainly",
        "Gives the main reason (stakes, risk, review needed)",
        "Doesn't lecture or talk down to the colleague",
        "Professional register",
      ],
    },
  ],
  scoringDimensions: [
    { name: "Risk Identification", description: "Spotted what could go wrong if AI output is sent unchecked" },
    { name: "Human-in-Loop Reasoning", description: "Knew when a human judgement was needed — not just an AI draft" },
    { name: "Adaptation Quality", description: "Adjusted approach when the situation changed" },
    { name: "Justification Clarity", description: "Explained decisions with sound, direct reasoning" },
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
      title: "Read both arguments carefully",
      body: "Westbrook University is deciding whether to remove all compulsory lecture attendance. Two staff members disagree.\n\nDr. Osei argues that attendance should remain compulsory because students who attend regularly perform better in assessments, and removing the requirement would disadvantage students who lack self-discipline.\n\nDr. Yıldız argues that attendance should be optional because adult learners should manage their own time, and some students perform better by studying independently from recordings.\n\nEvaluate both arguments. Which is stronger, and why?",
      pinAsReference: true,
    },
    {
      kind: "short-text",
      label: "Claim identification",
      question: "What is the main claim of each argument? Write one sentence for each.",
      constraints: [
        "One sentence per argument",
        "State the claim — not a summary of the whole argument",
      ],
      maxWords: 50,
      scoringHints: [
        "Dr. Osei's claim: attendance should remain compulsory because it improves performance and protects less disciplined students",
        "Dr. Yıldız's claim: attendance should be optional because adult learners should manage their own time and some learn better independently",
        "Captures the core position, not just the topic",
      ],
      dimension: "Task Achievement",
    },
    {
      kind: "choice",
      label: "Evaluation",
      question: "Which argument is stronger?",
      options: [
        { id: "a", text: "Dr. Osei's argument is stronger", quality: "acceptable" },
        { id: "b", text: "Dr. Yıldız's argument is stronger", quality: "acceptable" },
        { id: "c", text: "Both are equally strong", quality: "acceptable" },
      ],
      requireJustification: true,
      justificationPrompt: "Why? What makes one argument more convincing than the other? Your score depends on the quality of your reasoning, not which side you pick.",
      justificationMax: 80,
      dimension: "Critical Thinking",
    },
    {
      kind: "multi-select",
      label: "Weakness detection",
      question: "What weakness can you identify in Dr. Osei's argument? Select the most accurate descriptions.",
      options: [
        { id: "a", text: "Correlation vs causation — students who attend may already be more motivated, so attendance might not be what causes the better performance", correct: true },
        { id: "b", text: "Overgeneralisation — assumes any student who skips lectures 'lacks self-discipline'", correct: true },
        { id: "c", text: "Ignores alternatives — does not address students who genuinely learn better from recordings", correct: true },
        { id: "d", text: "The argument is too short to evaluate", correct: false },
      ],
      minSelect: 1,
      maxSelect: 2,
      requireJustification: true,
      justificationPrompt: "Explain the weakness you selected in your own words.",
      justificationMax: 60,
      dimension: "Critical Thinking",
    },
    {
      kind: "evidence-select",
      label: "Evidence judgment",
      question: "Which piece of evidence would best support a balanced position on compulsory attendance?",
      options: [
        { id: "a", text: "A study comparing assessment outcomes for students under compulsory, optional, and hybrid attendance policies — controlling for prior motivation", quality: "strong" },
        { id: "b", text: "A blog post by a lecturer at another university who prefers compulsory attendance", quality: "weak" },
        { id: "c", text: "Statistics showing overall UK university enrolment has risen in the last decade", quality: "irrelevant" },
        { id: "d", text: "A news headline: 'Students want freedom — compulsory lectures are dead'", quality: "misleading" },
      ],
      requireJustification: true,
      justificationPrompt: "Why is this the best evidence?",
      dimension: "Content Quality",
    },
    {
      kind: "short-text",
      label: "Argument construction",
      question: "Build your own argument about compulsory lecture attendance at Westbrook University. Take a clear position.",
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
      dimension: "Argumentation",
    },
  ],
  scoringDimensions: [
    { name: "Task Achievement", description: "Engaged with the specific arguments as stated — captured each position precisely rather than summarising the topic." },
    { name: "Content Quality", description: "The substance of your evaluation: how accurately you read the reasoning and judged evidence quality." },
    { name: "Argumentation", description: "How clearly you built your own position — claim, reasoning, acknowledgement of the other side." },
    { name: "Critical Thinking", description: "How precisely you identified weaknesses and compared the reasoning quality of competing arguments." },
  ],
  productLine: "academic",
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
      dimension: "Critical Thinking",
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
      dimension: "Critical Thinking",
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
      dimension: "Content Quality",
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
      dimension: "Argumentation",
    },
  ],
  scoringDimensions: [
    { name: "Task Achievement", description: "Engaged with the specific chart and its claims, not drifting into general commentary about statistics." },
    { name: "Content Quality", description: "The depth and accuracy of what you identified about this particular dataset." },
    { name: "Argumentation", description: "How clearly your rewrite and board summary were structured — claim, reasoning, qualification." },
    { name: "Critical Thinking", description: "How rigorously you evaluated the evidence and distinguished correlation from causation." },
  ],
  productLine: "academic",
};


// ─── Academic Task: Interpretation & Evaluation ───────────────
// Self-contained: the candidate is given a fictional academic model,
// re-expresses it in their own words, then evaluates its assumptions
// and scope. Combines Content Quality (comprehension + re-expression)
// with Critical Thinking (evaluation).

const INTERPRETATION_EVAL: ScenarioTaskDef = {
  id: "interpretation-evaluation",
  shortTitle: "Interpretation & Evaluation",
  accentColor: "#f472b6",
  screens: [
    {
      kind: "briefing",
      badge: "FEAT Academic",
      title: "Interpretation",
      titleEmphasis: "& Evaluation",
      subtitle: "Understand an idea precisely, then judge its limits.",
      objective: "Re-express an unfamiliar academic idea accurately in your own words, then evaluate the assumptions, limitations, or scope of the idea.",
      criteria: [
        "Captures the idea precisely — neither distorts nor oversimplifies",
        "Identifies the assumptions the idea depends on",
        "Recognises the scope and limits of the claim",
        "Evaluates rather than merely summarises",
        "Recommends how the idea should (or shouldn't) be used",
      ],
      stakeholder: [
        { title: "Why this task exists", body: "Academic reading is not just comprehension — it's the ability to understand an idea precisely AND judge its limits. Many candidates can do one but not the other. This task measures both." },
        { title: "What it replaces", body: "Reading-comprehension questions that reward summary. This asks for re-expression followed by evaluation — a combined test of understanding and reasoning." },
        { title: "How it is scored", body: "Content Quality (comprehension + re-expression) combined with Critical Thinking (evaluation of assumptions, limits, and scope)." },
      ],
    },
    {
      kind: "scenario",
      label: "The framework",
      title: "Read this carefully",
      body: "The Ziegler Coherence Framework\n\nProposed by the fictional academic Dr. Ziegler, the framework claims that strong academic writing shares three features:\n\n1. A single controlling idea, restated in different forms across the paper\n2. Evidence that \"points inward\" — every piece of evidence links back to the controlling idea\n3. A conclusion that narrows rather than widens — the paper ends more focused than it began\n\nZiegler argues that any paper failing one or more of these three tests is necessarily incoherent, and that coherent papers cannot fail any of them.\n\nThis framework is presented here in full. You are not expected to have encountered it before.",
      pinAsReference: true,
    },
    {
      kind: "short-text",
      label: "Re-express",
      question: "Explain the Ziegler Coherence Framework in your own words. Do not quote the passage — paraphrase.",
      constraints: [
        "Maximum 100 words",
        "Capture all three features",
        "Capture Ziegler's core claim (that failure on any test = incoherence)",
        "Use your own phrasing",
      ],
      maxWords: 100,
      scoringHints: [
        "All three features are named and explained accurately",
        "The logical structure is preserved — three individually necessary features",
        "Ziegler's strong claim is captured ('any paper failing one test is incoherent')",
        "The re-expression is in fresh language, not stitched-together quotations",
        "Nothing is added that Ziegler did not say",
      ],
      dimension: "Content Quality",
    },
    {
      kind: "multi-select",
      label: "Assumptions",
      question: "Which assumptions does the Ziegler framework make? Select all that apply.",
      options: [
        { id: "a", text: "That all strong academic writing shares a single type of structure", correct: true },
        { id: "b", text: "That a \"controlling idea\" can always be identified in coherent writing", correct: true },
        { id: "c", text: "That evidence has a direction and can \"point\" somewhere", correct: true },
        { id: "d", text: "That coherence is a binary property — a paper is coherent or it isn't", correct: true },
        { id: "e", text: "That academic papers are always longer than 5,000 words", correct: false },
      ],
      minSelect: 2,
      maxSelect: 5,
      requireJustification: true,
      justificationPrompt: "Which assumption is the most important to question, and why?",
      justificationMax: 80,
      dimension: "Critical Thinking",
    },
    {
      kind: "short-text",
      label: "Limits",
      question: "Identify two limitations of the Ziegler framework. What kinds of writing, or what situations, does it struggle to describe?",
      constraints: [
        "Maximum 90 words",
        "Two distinct limitations",
        "Each limitation should come with a brief reason",
      ],
      maxWords: 90,
      scoringHints: [
        "Identifies genuine limits — e.g. exploratory essays, multi-threaded arguments, papers that deliberately widen scope",
        "Does not just list disagreements — gives reasons why the framework breaks",
        "Considers edge cases Ziegler's strong claim struggles with (e.g. dialectical papers that hold competing ideas)",
        "Stays within the framework's actual claim — evaluates what it says, not a straw version",
      ],
      dimension: "Critical Thinking",
    },
    {
      kind: "choice",
      label: "Scope",
      question: "Which statement best captures the appropriate scope of the Ziegler framework?",
      options: [
        { id: "a", text: "It is a useful general rule with known exceptions, not a definitive test of coherence", quality: "best" },
        { id: "b", text: "It is correct — papers failing any of the three tests are indeed incoherent", quality: "poor" },
        { id: "c", text: "It is too narrow to be useful and should be rejected", quality: "poor" },
        { id: "d", text: "It describes one of several valid models of coherence; its strong claim overstates what it can test", quality: "best" },
      ],
      requireJustification: true,
      justificationPrompt: "Justify your answer in terms of what the framework actually claims.",
      justificationMax: 70,
      dimension: "Task Achievement",
    },
    {
      kind: "short-text",
      label: "Recommendation",
      question: "Write a short recommendation for a student using this framework. Should they apply it, and if so, how should they use it?",
      constraints: [
        "Maximum 90 words",
        "Take a clear position (apply / apply with caveats / don't apply)",
        "Give at least one reason",
        "Acknowledge the framework's value even if you caveat it",
      ],
      maxWords: 90,
      scoringHints: [
        "Position is clear and defended, not fence-sitting",
        "Reasoning draws on the framework's actual content — not generic writing advice",
        "Balances strengths and limitations — not a one-sided dismissal or endorsement",
        "Practical — tells the student something they could actually do",
        "Academic register appropriate to the audience",
      ],
      dimension: "Argumentation",
    },
  ],
  scoringDimensions: [
    { name: "Task Achievement", description: "Engaged with Ziegler's actual claim — both explaining it AND evaluating it, as the task required." },
    { name: "Content Quality", description: "How accurately you re-expressed the framework and how substantively you evaluated its assumptions and limits." },
    { name: "Argumentation", description: "How clearly you structured your recommendation — position, reasoning, acknowledgement of scope." },
    { name: "Critical Thinking", description: "How perceptively you identified the framework's assumptions, limits, and the scope it over-claims." },
  ],
  productLine: "academic",
};


// ─── Academic Task: Weighing Alternatives ─────────────────────
// Two academics take opposing positions on an internal policy question.
// The candidate compares their reasoning, weighs the trade-offs, and
// reaches a judgement about which position is stronger. Self-contained —
// all arguments provided in-task.

const WEIGHING_ALTERNATIVES: ScenarioTaskDef = {
  id: "weighing-alternatives",
  shortTitle: "Weighing Alternatives",
  accentColor: "#22d3ee",
  screens: [
    {
      kind: "briefing",
      badge: "FEAT Academic",
      title: "Weighing",
      titleEmphasis: "Alternatives",
      subtitle: "Compare perspectives. Weigh the reasoning. Reach a judgement you can defend.",
      objective: "Analyse two positions on an open question, identify where their reasoning is stronger or weaker, and reach a justified judgement about which you find more persuasive.",
      criteria: [
        "Accurately captures each position",
        "Identifies where the positions genuinely disagree (not just surface disagreement)",
        "Weighs the quality of reasoning, not just the stance",
        "Reaches a reasoned judgement — not fence-sitting",
        "Acknowledges the strength in the position not chosen",
      ],
      stakeholder: [
        { title: "Why this task exists", body: "University study is full of debates between competing accounts. The readiness question is whether a candidate can read two positions honestly, weigh their reasoning, and commit to a defensible view." },
        { title: "What it replaces", body: "Compare-and-contrast essays that reward balanced-sounding summary. This pushes further — candidates must judge which reasoning is stronger and defend that judgement." },
        { title: "How it is scored", body: "Quality of comparison, quality of the weighted judgement, and the extent to which reasoning — not stance — is evaluated." },
      ],
    },
    {
      kind: "scenario",
      label: "Two positions",
      title: "Read both positions carefully",
      body: "A faculty committee is deciding whether to allow first-year students to use AI writing assistants for their weekly essays. Two committee members have written short memos.\n\nProf. Aramayo (against):\n\"Writing is thinking. If students offload the process to an AI assistant, they are not practising the cognitive work the essays are designed to develop. The weekly essay is not primarily a test of the final product; it is a structured space for a student to struggle with ideas until they settle into something they actually understand. AI assistants short-circuit that struggle. The result is a student who looks like they can write but hasn't built the thinking muscles a university education is meant to develop.\"\n\nProf. Beaumont (for):\n\"Every generation of students has had tools the previous generation thought were cheating — word processors, spell-checkers, the internet. In each case the panic passed because the tool became part of how thinking gets done, not a replacement for it. AI assistants are the same. What matters is whether we assess the right thing: if we test rote composition, AI makes our assessment obsolete; if we test reasoning, AI becomes a collaborator the student still has to steer. The right response is not to ban the tool but to redesign what we assess.\"",
      pinAsReference: true,
    },
    {
      kind: "short-text",
      label: "Disagreement",
      question: "In one or two sentences, state the core disagreement between Aramayo and Beaumont. Be precise — what do they actually disagree about?",
      constraints: [
        "Maximum 50 words",
        "Identify the deepest point of disagreement",
        "Avoid restating each position separately — name the disagreement itself",
      ],
      maxWords: 50,
      scoringHints: [
        "Frames the disagreement as being about what writing-for-learning is for, or about whether the cognitive process or the output is the object of assessment",
        "Avoids framing it as 'pro vs anti AI' — that's the surface",
        "Uses precise language drawn from the positions themselves",
      ],
      dimension: "Task Achievement",
    },
    {
      kind: "multi-select",
      label: "Reasoning moves",
      question: "Which reasoning moves do the two memos make? Select all that apply.",
      options: [
        { id: "a", text: "Aramayo argues from the purpose of the assessment — that the essay is a learning process, not a product", correct: true },
        { id: "b", text: "Beaumont argues from historical precedent — that other tools have been similarly panicked over and absorbed", correct: true },
        { id: "c", text: "Beaumont argues that the solution lies in redesigning the assessment, not banning the tool", correct: true },
        { id: "d", text: "Aramayo argues that AI writing is factually inaccurate and therefore unreliable", correct: false },
        { id: "e", text: "Both memos appeal to what universities should be for, but disagree about what that implies", correct: true },
      ],
      minSelect: 2,
      maxSelect: 5,
      requireJustification: true,
      justificationPrompt: "Which reasoning move in either memo do you find most persuasive, and why?",
      justificationMax: 80,
      dimension: "Critical Thinking",
    },
    {
      kind: "short-text",
      label: "Trade-offs",
      question: "Identify one real trade-off that both positions must accept — something that isn't free even on their own terms.",
      constraints: [
        "Maximum 70 words",
        "The trade-off must apply to the position you describe, on its own terms",
        "Avoid generic 'pros and cons' — name something specific",
      ],
      maxWords: 70,
      scoringHints: [
        "Names a real cost for the chosen position — e.g. Aramayo's ban denies students a tool that will exist professionally; Beaumont's redesign requires substantial faculty effort and risks unreliable transitional assessment",
        "Does not simply re-state the opposing position — finds a cost internal to the chosen one",
        "Shows the candidate engaged with the reasoning, not just the stance",
      ],
      dimension: "Critical Thinking",
    },
    {
      kind: "short-text",
      label: "Weighted judgement",
      question: "Which memo do you find more persuasive, and why? Weigh the two positions and defend your choice. The score depends on the quality of your weighing — not which memo you pick.",
      constraints: [
        "Maximum 120 words",
        "State your judgement clearly",
        "Give at least one specific reason drawn from the memos",
        "Acknowledge a strength in the position you did not choose",
      ],
      maxWords: 120,
      scoringHints: [
        "Takes a clear position without hedging",
        "Defends the choice with reasoning tied to the specific arguments, not generic intuitions",
        "Acknowledges a real strength in the rejected position",
        "Distinguishes between emotional reaction and reasoned judgement",
        "Logic flows: judgement → strongest supporting reason → honest acknowledgement of the other side",
      ],
      dimension: "Argumentation",
    },
    {
      kind: "choice",
      label: "Framing",
      question: "Which of these describes the most defensible way to decide between Aramayo and Beaumont's positions?",
      options: [
        { id: "a", text: "Whichever position is more popular among faculty should win", quality: "poor" },
        { id: "b", text: "Trial both approaches and see which produces better assessment outcomes", quality: "acceptable" },
        { id: "c", text: "Clarify what the weekly essay is actually for — only then can you judge which position fits", quality: "best" },
        { id: "d", text: "There is no defensible way — it's a matter of taste", quality: "poor" },
      ],
      requireJustification: true,
      justificationPrompt: "Why is this the strongest way to frame the decision?",
      justificationMax: 60,
      dimension: "Content Quality",
    },
  ],
  scoringDimensions: [
    { name: "Task Achievement", description: "Engaged with both positions as given — compared their reasoning rather than drifting into your own unrelated views." },
    { name: "Content Quality", description: "How accurately you read each position and how precisely you identified where they actually diverge." },
    { name: "Argumentation", description: "How clearly you structured your weighted judgement — position, reasoning, acknowledgement of the rejected side." },
    { name: "Critical Thinking", description: "How carefully you weighed the strengths and weaknesses of each perspective — not just which you agreed with." },
  ],
  productLine: "academic",
};


// ─── Academic Task: Justified Judgement ──────────────────────
// The candidate is asked to reach a judgement on an open question,
// anticipate the strongest counter-argument, and defend their position
// against it. Self-contained — all context provided in-task.

const JUSTIFIED_JUDGEMENT: ScenarioTaskDef = {
  id: "justified-judgement",
  shortTitle: "Justified Judgement",
  accentColor: "#c084fc",
  screens: [
    {
      kind: "briefing",
      badge: "FEAT Academic",
      title: "Justified",
      titleEmphasis: "Judgement",
      subtitle: "Take a position on an open question — and defend it against its strongest opposition.",
      objective: "Reach a judgement on an open academic question, anticipate the strongest counter-argument against your position, and defend your position against it.",
      criteria: [
        "Takes a clear position on the actual question, not a safer adjacent one",
        "Supports the position with reasoning drawn from the materials",
        "Anticipates the strongest — not the weakest — counter-argument",
        "Defends the position without dismissing the counter",
        "Acknowledges where the position is limited or conditional",
      ],
      stakeholder: [
        { title: "Why this task exists", body: "The defining skill of a university graduate is the ability to take a position and defend it under serious objection. This task isolates that skill — strong candidates can hold their ground against the best version of the opposing view." },
        { title: "What it replaces", body: "Opinion essays that ask 'what do you think?' and reward any fluent answer. This demands judgement, anticipation, and structured defence." },
        { title: "How it is scored", body: "Quality of the judgement, quality of the anticipated counter-argument (steelmanning, not strawmanning), and the cogency of the defence against it." },
      ],
    },
    {
      kind: "scenario",
      label: "The question",
      title: "An open academic question",
      body: "A university is considering whether to make every undergraduate degree a four-year programme, with the additional year spent on a structured research project instead of optional coursework.\n\nSupporters argue this would raise the intellectual level of undergraduate education and produce graduates more ready for research-intensive careers or postgraduate study. They also argue that a year of structured project work is a better preparation for complex professional life than a year of additional lectures.\n\nOpponents argue that the extra year increases cost, delays the student's entry into the workforce, and assumes all students benefit from research-style work — when many students will go into careers where the project skill is irrelevant.\n\nBoth arguments are presented at their strongest. You are asked to reach your own judgement.",
      pinAsReference: true,
    },
    {
      kind: "multi-select",
      label: "Key considerations",
      question: "Which of these are genuine considerations for a defensible judgement on this question? Select all that apply.",
      options: [
        { id: "a", text: "Who the degree is for — the 20% of students heading into research or the 80% heading elsewhere", correct: true },
        { id: "b", text: "Whether the additional year's cost falls on students, the state, or the institution", correct: true },
        { id: "c", text: "Whether a research project is actually more formative than an extra year of coursework", correct: true },
        { id: "d", text: "Whether the university's current three-year degree is already internationally respected", correct: true },
        { id: "e", text: "Whether the university's buildings are large enough to host four-year students", correct: false },
      ],
      minSelect: 3,
      maxSelect: 5,
      requireJustification: true,
      justificationPrompt: "Which consideration, in your view, should weigh most heavily — and why?",
      justificationMax: 80,
      dimension: "Task Achievement",
    },
    {
      kind: "short-text",
      label: "Your position",
      question: "State your position on the question and your single strongest reason for it.",
      constraints: [
        "Maximum 80 words",
        "Position must be clear — not 'it depends'",
        "Reason must be specific, not generic",
      ],
      maxWords: 80,
      scoringHints: [
        "Position is unambiguous (for, against, or a defensible conditional position)",
        "The reason connects to the materials provided — not just intuition",
        "Specific enough that a reader could disagree with it on those terms",
        "Avoids fence-sitting dressed up as nuance",
      ],
      dimension: "Argumentation",
    },
    {
      kind: "short-text",
      label: "Strongest counter",
      question: "Now state the single strongest objection to your position — the one you would find hardest to answer. Do not weaken it.",
      constraints: [
        "Maximum 80 words",
        "Must genuinely be the strongest objection, not an easy one",
        "Write it as an opponent would — without softening",
      ],
      maxWords: 80,
      scoringHints: [
        "Counter-argument is genuinely strong — not a straw version the candidate can easily knock down",
        "Written with fair-minded phrasing, not dismissive framing",
        "Targets the actual weakness in the candidate's position, not a tangential point",
        "Shows the candidate has thought seriously about what could defeat their view",
      ],
      dimension: "Critical Thinking",
    },
    {
      kind: "short-text",
      label: "Defence",
      question: "Defend your position against the counter-argument you just stated. Do not repeat your original reasoning — respond to the objection.",
      constraints: [
        "Maximum 100 words",
        "Respond to the specific objection — do not pivot",
        "Concede anything that genuinely should be conceded",
        "Show why the objection is real but non-decisive",
      ],
      maxWords: 100,
      scoringHints: [
        "Addresses the objection directly, not a softer variant",
        "Concedes whatever genuinely must be conceded — e.g. extra cost, uneven fit",
        "Shows why the objection, though real, doesn't overturn the position",
        "Avoids restating the original argument as if the objection wasn't made",
        "Uses academic register — disagrees without dismissing",
      ],
      dimension: "Argumentation",
    },
    {
      kind: "choice",
      label: "Scope of your claim",
      question: "Which statement best captures the honest scope of the position you are defending?",
      options: [
        { id: "a", text: "My position is a general principle that should apply to all universities", quality: "poor" },
        { id: "b", text: "My position is strongest under specific conditions — where those conditions fail, it may not hold", quality: "best" },
        { id: "c", text: "My position is a personal preference; I would not press it on others", quality: "poor" },
        { id: "d", text: "My position captures a real trade-off and reaches a defensible judgement within it", quality: "best" },
      ],
      requireJustification: true,
      justificationPrompt: "State the conditions under which your position is strongest — and where it is weakest.",
      justificationMax: 80,
      dimension: "Content Quality",
    },
  ],
  scoringDimensions: [
    { name: "Task Achievement", description: "Engaged with the actual question — took a position on what was asked, not a safer adjacent topic." },
    { name: "Content Quality", description: "How substantively you drew on the materials to support your judgement and honestly scoped its claim." },
    { name: "Argumentation", description: "How well your position, counter-argument, and defence held together as a structured case." },
    { name: "Critical Thinking", description: "How seriously you anticipated the strongest objection and engaged with it on its own terms." },
  ],
  productLine: "academic",
};


// ─── TASK 8: Professional Communication ───────────────────────

const PROF_COMM: ScenarioTaskDef = {
  id: "prof-comm",
  shortTitle: "Professional Communication",
  accentColor: "#fb923c",
  screens: [
    {
      kind: "briefing",
      badge: "Workplace Readiness",
      title: "Professional",
      titleEmphasis: "Communication",
      subtitle: "Write clearly and appropriately — and adapt when the situation changes.",
      objective: "Communicate effectively in writing to different professional audiences.",
      criteria: [
        "Appropriate tone for the audience",
        "Clear main message",
        "Includes relevant detail, excludes irrelevant detail",
        "Maintains professional register throughout",
        "Adapts when the recipient responds",
      ],
      stakeholder: [
        { title: "Why this task exists", body: "Emails, messages, and reports are how work gets done. Tone and clarity matter as much as content — and most assessments never test either." },
        { title: "What it replaces", body: "Essay writing tasks that test language in isolation. This tests real workplace writing with a real purpose and a real reader." },
        { title: "How it is scored", body: "Tone appropriateness, message clarity, register, relevance of detail, and quality of adaptation." },
      ],
    },
    {
      kind: "scenario",
      label: "Situation",
      title: "The scenario",
      body: "Your manager has asked you to contact a client whose project has been delayed by two weeks.\n\nThe client has not yet been told about the delay.\n\nWrite the message.",
      pinAsReference: true,
    },
    {
      kind: "short-text",
      label: "Initial message",
      question: "Write the message you will send the client.",
      constraints: [
        "Maximum 120 words",
        "Acknowledge the delay clearly",
        "Give a new expected timeline",
        "Professional, calm tone",
      ],
      maxWords: 120,
      scoringHints: [
        "Opens appropriately for a client — not too casual, not stiff",
        "States the delay plainly, without burying it",
        "Gives a concrete new timeline or next step",
        "Tone is calm and accountable, not defensive",
        "Respects the client's time — no padding or excuses",
      ],
    },
    {
      kind: "update",
      label: "The client replies",
      title: "The client responds.",
      body: "\"Two weeks? We have a launch booked. Why am I only hearing about this now? What are you actually doing to fix it?\"\n\nThey are frustrated. They want real answers — and they want to know they can trust you.",
    },
    {
      kind: "short-text",
      label: "Follow-up",
      question: "Write your reply.",
      constraints: [
        "Maximum 120 words",
        "Acknowledge their frustration",
        "Answer the question: what are you doing about it?",
        "Stay professional — don't get defensive",
      ],
      maxWords: 120,
      scoringHints: [
        "Acknowledges the frustration directly — doesn't ignore it",
        "Answers the question, doesn't deflect",
        "Names at least one concrete action being taken",
        "Tone shifts to match the moment — warmer, more accountable",
        "Does not over-apologise or escalate emotionally",
      ],
    },
    {
      kind: "choice",
      label: "Register check",
      question: "Which of these closing lines is most appropriate for this client situation?",
      options: [
        { id: "a", text: "\"Sorry again for any inconvenience caused. Please don't hesitate to contact me.\"", quality: "acceptable" },
        { id: "b", text: "\"I'll send a written update by 5pm Friday with the revised plan. You have my direct line if anything changes.\"", quality: "best" },
        { id: "c", text: "\"Thanks for your patience! We'll do our best!\"", quality: "poor" },
        { id: "d", text: "\"Let me know.\"", quality: "poor" },
      ],
      requireJustification: true,
      justificationPrompt: "Why is this the most appropriate close for this situation?",
      justificationMax: 60,
    },
  ],
  scoringDimensions: [
    { name: "Tone Appropriateness", description: "Matched the audience and situation — not too casual, not stiff" },
    { name: "Message Clarity", description: "Main message was immediate and unambiguous" },
    { name: "Relevance of Detail", description: "Included what mattered; left out what didn't" },
    { name: "Register", description: "Maintained professional register throughout" },
    { name: "Adaptation", description: "Responded to the client's reaction rather than restating" },
  ],
};


// ─── TASK 9: Interpersonal Handling ───────────────────────────

const INTERPERSONAL: ScenarioTaskDef = {
  id: "interpersonal",
  shortTitle: "Interpersonal Handling",
  accentColor: "#f472b6",
  screens: [
    {
      kind: "briefing",
      badge: "Workplace Readiness",
      title: "Interpersonal",
      titleEmphasis: "Handling",
      subtitle: "Difficult situations happen. How you respond reveals more than any interview answer.",
      objective: "Respond appropriately and professionally to a challenging workplace interaction.",
      criteria: [
        "Acknowledges the issue directly",
        "Stays calm and professional in tone",
        "Does not escalate or become defensive",
        "Proposes a clear path forward",
        "Maintains appropriate register throughout",
      ],
      stakeholder: [
        { title: "Why this task exists", body: "Complaints, disagreements, and awkward conversations happen in every job. Handling them well is one of the strongest predictors of workplace performance." },
        { title: "What it replaces", body: "Competency interview questions like 'tell me about a time you dealt with conflict' — rehearsed, gameable, and disconnected from real performance." },
        { title: "How it is scored", body: "Tone under pressure, acknowledgement quality, de-escalation, clarity of proposed resolution." },
      ],
    },
    {
      kind: "scenario",
      label: "Message received",
      title: "A colleague has sent you this message",
      body: "\"Your team missed the deadline again and it made me look unprofessional in front of my manager. This keeps happening.\"",
      note: "They are a peer, not your manager. You need to write a reply.",
      pinAsReference: true,
    },
    {
      kind: "choice",
      label: "First move",
      question: "What is the right first move in your reply?",
      options: [
        { id: "a", text: "Defend your team — explain why the deadline was missed", quality: "poor" },
        { id: "b", text: "Acknowledge the impact on them before anything else", quality: "best" },
        { id: "c", text: "Point out that they could have flagged it earlier", quality: "poor" },
        { id: "d", text: "Forward the message to your manager and let them handle it", quality: "poor" },
      ],
      requireJustification: true,
      justificationPrompt: "Why this move? What are you trying to avoid?",
      justificationMax: 60,
    },
    {
      kind: "short-text",
      label: "Your response",
      question: "Write your reply to the colleague.",
      constraints: [
        "Maximum 120 words",
        "Acknowledge the issue directly",
        "Stay professional — no defensiveness",
        "Offer a clear path forward",
      ],
      maxWords: 120,
      scoringHints: [
        "Opens by acknowledging the impact on them — not defending your team",
        "Does not escalate or counter-accuse",
        "Tone is calm and accountable",
        "Proposes a concrete next step (a conversation, a change in process, a follow-up)",
        "Professional register throughout — not stiff, not casual",
      ],
    },
    {
      kind: "update",
      label: "They push back",
      title: "Their reply is sharper.",
      body: "\"I don't want another 'sorry, we'll try to do better' email. I want to know what is actually going to change.\"",
    },
    {
      kind: "short-text",
      label: "Resolution",
      question: "Write your follow-up.",
      constraints: [
        "Maximum 100 words",
        "Name a concrete change",
        "Do not become defensive",
        "Stay level — match the seriousness without matching the sharpness",
      ],
      maxWords: 100,
      scoringHints: [
        "Names a specific change — not vague reassurances",
        "Acknowledges that a general apology isn't enough",
        "Tone is steady — not meek, not sharp back",
        "Proposes either a process change or a way to flag earlier next time",
        "Closes with a clear path forward",
      ],
    },
    {
      kind: "choice",
      label: "Tone check",
      question: "Which closing line best holds the line between acknowledging the issue and protecting your team?",
      options: [
        { id: "a", text: "\"Apologies again — please let me know if there's anything else.\"", quality: "acceptable" },
        { id: "b", text: "\"Thanks for raising this directly. Can we find 15 minutes this week to agree how we'll handle timelines going forward?\"", quality: "best" },
        { id: "c", text: "\"To be fair, we've had a lot on. I'll do my best.\"", quality: "poor" },
        { id: "d", text: "\"Noted.\"", quality: "poor" },
      ],
      requireJustification: true,
      justificationPrompt: "Why this close?",
      justificationMax: 60,
    },
  ],
  scoringDimensions: [
    { name: "Acknowledgement", description: "Named the impact on the other person — not just the facts" },
    { name: "Tone Under Pressure", description: "Stayed calm and professional even when pushed" },
    { name: "De-escalation", description: "Reduced heat rather than adding to it" },
    { name: "Proposed Resolution", description: "Offered a concrete next step, not vague reassurance" },
    { name: "Register", description: "Maintained appropriate professional register throughout" },
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
  "interpretation-evaluation": INTERPRETATION_EVAL,
  "weighing-alternatives": WEIGHING_ALTERNATIVES,
  "justified-judgement": JUSTIFIED_JUDGEMENT,
  "prof-comm": PROF_COMM,
  interpersonal: INTERPERSONAL,
};

export const SCENARIO_TASK_LIST = [OJT, CPD, AI_POLICY, INFO_PRIORITY, ARGUMENT_EVAL];
export const PROFESSIONAL_TASK_LIST = [OJT, AI_POLICY, INFO_PRIORITY, PROF_COMM, INTERPERSONAL];

/** The five FEAT Academic tasks in the construct's intended cognitive order —
 *  receptive evaluation → comparison → interpretation → productive judgement. */
export const ACADEMIC_TASK_LIST = [
  DATA_LITERACY,
  ARGUMENT_EVAL,
  WEIGHING_ALTERNATIVES,
  INTERPRETATION_EVAL,
  JUSTIFIED_JUDGEMENT,
];
