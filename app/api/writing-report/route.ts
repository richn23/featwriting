// Pooled cross-task language analysis.
// Receives all candidate samples from every completed task, runs a single
// language-rubric analysis across the whole corpus, and returns a FormAnalysis.

import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { buildLanguageAnalysisPrompt } from "../../writing/language-rubric";

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
    const tasks: TaskSample[] = Array.isArray(body.tasks) ? body.tasks : [];

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
    } catch {
      console.error("Pooled language analysis parse failed:", cleaned);
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
    console.error("writing-report error:", err);
    return NextResponse.json({ error: "Server error generating report." }, { status: 500 });
  }
}
