// Pooled cross-task language analysis.
// Receives all candidate samples from every completed task, runs a single
// language-rubric analysis across the whole corpus, and returns a FormAnalysis.

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { buildLanguageAnalysisPrompt } from "../../language-rubric";
import { sanitizeText, sanitizeShortString, InvalidChatInputError, MAX_MESSAGES } from "../../_shared/chatValidation";
import { logServerError } from "../../_shared/logger";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type TaskSample = {
  taskId: string;
  taskLabel: string;
  samples: string[];
};

const pooledLanguagePrompt = buildLanguageAnalysisPrompt("pooled");

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!Array.isArray(body.tasks)) {
      throw new InvalidChatInputError("tasks must be an array");
    }
    if (body.tasks.length > 20) {
      throw new InvalidChatInputError("tasks exceeds max of 20");
    }
    const tasks: TaskSample[] = body.tasks.map((t: unknown) => {
      const obj = (t && typeof t === "object" ? t : {}) as Record<string, unknown>;
      const samplesRaw = Array.isArray(obj.samples) ? obj.samples : [];
      if (samplesRaw.length > MAX_MESSAGES) {
        throw new InvalidChatInputError(`task samples exceed max of ${MAX_MESSAGES}`);
      }
      return {
        taskId: sanitizeShortString(obj.taskId),
        taskLabel: sanitizeShortString(obj.taskLabel),
        samples: samplesRaw.map((s: unknown) => sanitizeText(s)),
      };
    });

    if (tasks.length === 0) {
      return NextResponse.json({
        formAnalysis: {
          overallFormLevel: "Insufficient data",
          overallFormSummary: "No writing samples were found. Complete at least one task and try again.",
          dimensions: [],
        },
      });
    }

    // Build the pooled corpus. Each task gets a header the model can see.
    const corpus = tasks
      .map((t) => {
        const joined = (t.samples || [])
          .map((s) => (s || "").trim())
          .filter((s) => s.length > 0)
          .join("\n\n");
        return `--- TASK ${t.taskId} · ${t.taskLabel} ---\n${joined}`;
      })
      .filter((block) => block.trim().length > 0)
      .join("\n\n");

    // Total real-word count, used to decide if there's enough to analyse.
    const wordCount = corpus.replace(/[^\w\s]/g, " ").split(/\s+/).filter((w) => w.length > 1).length;
    const hasEnoughText = wordCount >= 30;

    if (!hasEnoughText) {
      return NextResponse.json({
        formAnalysis: {
          overallFormLevel: "Insufficient data",
          overallFormSummary: "Not enough written text across your tasks to assess overall language quality.",
          dimensions: [],
        },
        meta: { wordCount, taskCount: tasks.length },
      });
    }

    const res = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: pooledLanguagePrompt },
        { role: "user", content: `Candidate's pooled writing across all tasks:\n\n${corpus}` },
      ],
      max_tokens: 2500,
      temperature: 0.1,
    });

    const raw = res.choices[0].message.content || "";
    const cleaned = raw.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();

    let formAnalysis;
    try {
      formAnalysis = JSON.parse(cleaned);
    } catch (parseErr) {
      logServerError("writing-report", parseErr, { stage: "parse-pooled-language" });
      return NextResponse.json(
        { error: "Failed to parse language analysis response." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      formAnalysis,
      meta: { wordCount, taskCount: tasks.length },
    });
  } catch (err) {
    if (err instanceof InvalidChatInputError) {
      return NextResponse.json({ error: err.message }, { status: 400 });
    }
    logServerError("writing-report", err);
    return NextResponse.json({ error: "Server error generating report." }, { status: 500 });
  }
}
