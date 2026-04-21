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
      body: "A Zorbit filter is a two-stage process used in water treatment. In the first stage, suspended particles are trapped by a mesh of compressed ceramic fibres. In the second stage, dissolved chemical residues are absorbed by a layer of activated Zorbit compound, a porous synthetic material. The result is water that meets Grade 2 clarity standards.\n\nYour task: Explain what a Zorbit filter does to someone with no science background. The AI will respond as that person — adapt if they don't understand.",
      pinAsReference: true,
    },
    {
      kind: "choice",
      label: "Approach",
      question: "Which explanation approach would work best for a listener with no science background?",
      options: [
        { id: "a", text: "Define it technically: 'A two-stage filtration process using a ceramic fibre matrix and an activated synthetic absorbent medium'", quality: "poor" },
        { id: "b", text: "Use a simple analogy: compare each stage to something they already know, like a sieve and then a sponge", quality: "best" },
        { id: "c", text: "Walk them through each stage step by step using plain language", quality: "acceptable" },
        { id: "d", text: "Just say 'it cleans water' and move on", quality: "poor" },
      ],
      requireJustification: true,
      justificationPrompt: "Why is this the best approach for this particular person?",
      justificationMax: 60,
    },
    {
      kind: "short-text",
      label: "Your explanation",
      question: "Write your explanation of a Zorbit filter for a person with no science background. They're intelligent — they just have no technical background here.",
      constraints: [
        "Maximum 100 words",
        "No jargon or technical terms (or explain them if you use them)",
        "Must be accurate — don't oversimplify to the point of being wrong",
        "Capture that there are two stages doing two different jobs",
      ],
      maxWords: 100,
      scoringHints: [
        "Core concept is correct: two stages, one for solid particles and one for dissolved chemicals",
        "No unexplained jargon (ceramic fibres, activated compound, porous, etc.)",
        "Uses a concrete example, analogy, or comparison",
        "Doesn't merge the two stages into one generic 'filter'",
        "Accessible tone — sounds like talking to a person, not reading a spec sheet",
      ],
    },
    {
      kind: "multi-select",
      label: "Spot the problems",
      question: "A trainee wrote these explanations. Which ones have problems?",
      options: [
        { id: "a", text: "\"A Zorbit filter cleans water in two stages — first it catches solid bits with a fine mesh, then a special material soaks up dissolved chemicals that are too small to see.\"", correct: false },
        { id: "b", text: "\"It's a dual-phase purification system utilising a ceramic fibre matrix for particulate sequestration and an activated absorbent medium for dissolved contaminants.\"", correct: true },
        { id: "c", text: "\"Imagine a coffee filter that catches the grounds, then a sponge underneath that soaks up anything tiny that slipped through. A Zorbit filter does both jobs in one unit.\"", correct: false },
        { id: "d", text: "\"It's basically a really good filter that gets all the dirt out of water.\"", correct: true },
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
      body: "Your listener responds:\n\n\"OK so… it's basically a mesh that catches stuff? Like a sieve?\"\n\nThey've understood stage one but missed stage two entirely — they don't realise the filter also absorbs dissolved chemicals that a mesh couldn't catch.",
    },
    {
      kind: "short-text",
      label: "Clarify",
      question: "They've missed half of it. Write a follow-up that clarifies the key insight — that there are two different stages doing two different jobs — without making them feel stupid.",
      constraints: [
        "Maximum 80 words",
        "Address their specific misunderstanding",
        "Use a concrete comparison if it helps",
        "Encouraging tone",
      ],
      maxWords: 80,
      scoringHints: [
        "Identifies their gap: they only see stage one (the mesh), not stage two (the absorbing layer)",
        "Explains the difference between catching solid bits and soaking up dissolved chemicals",
        "Uses a concrete comparison (e.g., a sieve AND a sponge, or coffee filter AND charcoal)",
        "Doesn't patronise — builds on what they already understood",
        "Tone is encouraging, not corrective",
      ],
    },
    {
      kind: "choice",
      label: "Analogy check",
      question: "Which analogy best captures the KEY insight of a Zorbit filter (two stages doing two different jobs — catching solid bits and absorbing dissolved chemicals)?",
      options: [
        { id: "a", text: "A water jug filter with a paper screen on top and a charcoal layer below — the screen catches the bits, the charcoal soaks up what's dissolved", quality: "best" },
        { id: "b", text: "A sieve catching lumps out of flour", quality: "poor" },
        { id: "c", text: "A magnet pulling iron filings out of sand", quality: "poor" },
        { id: "d", text: "A coffee machine — the paper filter catches grounds, and the water that comes through is clean", quality: "acceptable" },
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
  "explain-simply": EXPLAIN_SIMPLY,
  "prof-comm": PROF_COMM,
  interpersonal: INTERPERSONAL,
};

export const SCENARIO_TASK_LIST = [OJT, CPD, AI_POLICY, INFO_PRIORITY, ARGUMENT_EVAL];
export const PROFESSIONAL_TASK_LIST = [OJT, AI_POLICY, INFO_PRIORITY, PROF_COMM, INTERPERSONAL];
export const ACADEMIC_TASK_LIST = [DATA_LITERACY, EXPLAIN_SIMPLY, ARGUMENT_EVAL];
