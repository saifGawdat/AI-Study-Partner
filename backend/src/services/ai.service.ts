import { GoogleGenerativeAI } from "@google/generative-ai";

export interface ExtractedSubject {
  name: string;
  description: string;
  chapters: {
    name: string;
    topics: {
      name: string;
    }[];
  }[];
}

type GeminiModelInfo = {
  name?: string; // e.g. "models/gemini-1.5-flash-latest"
  supportedGenerationMethods?: string[]; // e.g. ["generateContent", ...]
};

type GeminiListModelsResponse = {
  models?: GeminiModelInfo[];
};

export class AIService {
  // Round-robin counter for load balancing between API keys
  private static apiKeyIndex = 0;

  /**
   * Get the next API key using round-robin load balancing
   */
  private static getNextApiKey(): string {
    const keys = [
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY1,
    ].filter(Boolean); // Remove undefined/null keys

    if (keys.length === 0) {
      throw new Error(
        "No GEMINI_API_KEY found in environment variables. Please set GEMINI_API_KEY or GEMINI_API_KEY1.",
      );
    }

    // Round-robin: pick the next key and increment counter
    const selectedKey = keys[this.apiKeyIndex % keys.length];
    this.apiKeyIndex++;

    console.log(
      `Using API key ${(this.apiKeyIndex % keys.length) + 1} of ${keys.length}`,
    );

    return selectedKey!;
  }

  private static async listModels(apiKey: string): Promise<GeminiModelInfo[]> {
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    const res = await fetch(url);

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(
        `ListModels failed: ${res.status} ${res.statusText} ${text}`,
      );
    }

    const data = (await res.json()) as GeminiListModelsResponse;
    return data.models ?? [];
  }

  private static async pickBestModelId(apiKey: string): Promise<string> {
    const models = await this.listModels(apiKey);

    // Only models that support generateContent
    const usable = models.filter((m) =>
      (m.supportedGenerationMethods ?? []).includes("generateContent"),
    );

    if (!usable.length) {
      throw new Error(
        "No available model supports generateContent for this API key/project",
      );
    }

    // Prefer: flash-latest -> flash -> pro-latest -> pro -> anything else
    const score = (name: string) => {
      const n = name.toLowerCase();
      if (n.includes("flash") && n.includes("latest")) return 100;
      if (n.includes("flash")) return 90;
      if (n.includes("pro") && n.includes("latest")) return 80;
      if (n.includes("pro")) return 70;
      return 10;
    };

    usable.sort((a, b) => score(b.name ?? "") - score(a.name ?? ""));

    const picked = usable[0].name;
    if (!picked) throw new Error("Model entry is missing name");

    // SDK usually wants without "models/"
    return picked.replace(/^models\//, "");
  }

  private static cleanToJson(text: string): string {
    let t = (text ?? "").trim();

    // Remove Markdown code fences if any
    if (t.includes("```")) {
      t = t
        .replace(/```json\s*/gi, "")
        .replace(/```/g, "")
        .trim();
    }

    // Try to find the outermost [ ] or { }
    const firstBrace = t.indexOf("{");
    const lastBrace = t.lastIndexOf("}");
    const firstBracket = t.indexOf("[");
    const lastBracket = t.lastIndexOf("]");

    // Identify which pair is the outermost
    const hasBraces =
      firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace;
    const hasBrackets =
      firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket;

    if (hasBraces && hasBrackets) {
      if (firstBracket < firstBrace && lastBracket > lastBrace) {
        // It's an array containing objects
        return t.slice(firstBracket, lastBracket + 1).trim();
      } else {
        // It's an object containing arrays
        return t.slice(firstBrace, lastBrace + 1).trim();
      }
    } else if (hasBrackets) {
      return t.slice(firstBracket, lastBracket + 1).trim();
    } else if (hasBraces) {
      return t.slice(firstBrace, lastBrace + 1).trim();
    }

    return t;
  }

  private static validateExtracted(extracted: any): ExtractedSubject {
    if (!extracted || typeof extracted !== "object") {
      throw new Error("Invalid JSON (not an object)");
    }

    if (!extracted.name || typeof extracted.name !== "string") {
      throw new Error("Invalid structure: missing subject name");
    }

    if (!Array.isArray(extracted.chapters)) {
      throw new Error("Invalid structure: chapters must be an array");
    }

    // Normalize + validate chapters/topics
    const normalized: ExtractedSubject = {
      name: extracted.name,
      description:
        typeof extracted.description === "string" ? extracted.description : "",
      chapters: extracted.chapters.map((ch: any) => ({
        name: typeof ch?.name === "string" ? ch.name : "Chapter",
        topics: Array.isArray(ch?.topics)
          ? ch.topics
              .map((tp: any) => ({
                name: typeof tp?.name === "string" ? tp.name : "",
              }))
              .filter((tp: any) => tp.name.trim().length > 0)
          : [],
      })),
    };

    // Optional: ensure at least 1 chapter
    if (normalized.chapters.length === 0) {
      throw new Error("Invalid structure: no chapters extracted");
    }

    return normalized;
  }

  static async extractBookStructure(
    fileBuffer: Buffer,
    mimeType: string,
  ): Promise<ExtractedSubject> {
    try {
      const apiKey = this.getNextApiKey();

      const genAI = new GoogleGenerativeAI(apiKey);

      // Pick a valid model dynamically (avoids 404 model not found)
      const modelId = await this.pickBestModelId(apiKey);

      const filePart = {
        inlineData: {
          data: fileBuffer.toString("base64"),
          mimeType,
        },
      };

      const prompt = `Analyze this textbook/document and extract its structure in JSON.

Return ONLY valid JSON with this exact structure (no markdown, no code blocks):
{
  "name": "Subject name",
  "description": "Brief 1-2 sentence description of what this subject covers",
  "chapters": [
    {
      "name": "Chapter name",
      "topics": [
        {"name": "Topic name"},
        {"name": "Another topic"}
      ]
    }
  ]
}

Guidelines:
- Prefer table of contents if present
- Otherwise infer chapters from top-level headings
- Topics should be section/subsection headings
- 3-8 topics per chapter
- Keep names concise (max 60 chars)
- If unclear, create logical groupings
- Output must be pure JSON only`;

      console.log(`Attempting extraction with model: ${modelId}`);

      const model = genAI.getGenerativeModel({ model: modelId });

      // Use explicit "parts" objects (more predictable than mixing raw strings)
      const result = await model.generateContent([{ text: prompt }, filePart]);

      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error("Empty response from AI");
      }

      const jsonText = this.cleanToJson(text);
      const extracted = JSON.parse(jsonText);
      return this.validateExtracted(extracted);
    } catch (error: any) {
      console.error("AI extraction error:", error);
      throw new Error(
        `Failed to extract book structure: ${error?.message || "Unknown error"}`,
      );
    }
  }

  /**
   * Generate an optimized study schedule using AI
   * Considers: user availability, subject/topic difficulty, and study priorities
   */
  static async generateSchedule(
    userId: string,
    subjects: any[],
    availability: any[],
    startDate: Date,
    endDate: Date,
  ): Promise<any[]> {
    try {
      const apiKey = this.getNextApiKey();

      const genAI = new GoogleGenerativeAI(apiKey);
      const modelId = await this.pickBestModelId(apiKey);
      const model = genAI.getGenerativeModel({ model: modelId });

      // Prepare data for AI
      const subjectsData = subjects.map((s) => ({
        id: s._id,
        name: s.name,
        chapters: s.chapters
          .filter((ch: any) => !ch.finished)
          .map((ch: any) => ({
            id: ch._id,
            name: ch.name,
            topics: ch.topics
              .filter((t: any) => !t.finished)
              .map((t: any) => ({
                id: t._id,
                name: t.name,
                description: t.description || "",
              })),
          })),
      }));

      const availabilityData = availability.map((a) => ({
        dayOfWeek: a.dayOfWeek,
        timeSlots: a.timeSlots,
      }));

      const prompt = `You are a study schedule optimizer. Create an optimized study schedule based on the following data:

**Subjects to study:**
${JSON.stringify(subjectsData, null, 2)}

**Weekly Availability (0=Sunday, 6=Saturday):**
${JSON.stringify(availabilityData, null, 2)}

**Schedule Period:**
Start: ${startDate.toISOString().split("T")[0]}
End: ${endDate.toISOString().split("T")[0]}

**Requirements:**
1. Distribute study sessions across available time slots
2. Analyze the difficulty of each topic yourself based on its name and subject context.
3. Hard topics should get longer time slots (60-90 min)
4. Medium topics should get 45-60 min
5. Easy topics should get 30-45 min
6. Include breaks between sessions
7. Balance subjects throughout the week
8. Prioritize topics that seem more foundational or complex

Return ONLY valid JSON array with this structure:
[
  {
    "title": "Study: [Topic Name]",
    "description": "Chapter: [Chapter Name] - [Subject Name]",
    "date": "YYYY-MM-DD",
    "startTime": "HH:mm",
    "endTime": "HH:mm",
    "subjectId": "subject_id",
    "chapterId": "chapter_id",
    "topicId": "topic_id"
  }
]

Important:
- Only schedule during available time slots
- Ensure startTime < endTime
- Don't overlap sessions on the same day
- Return pure JSON only (no markdown, no explanations)`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error("Empty response from AI");
      }

      const jsonText = this.cleanToJson(text);
      const schedule = JSON.parse(jsonText);

      if (!Array.isArray(schedule)) {
        throw new Error("AI response is not an array");
      }

      return schedule;
    } catch (error: any) {
      console.error("AI schedule generation error:", error);
      throw new Error(
        `Failed to generate schedule: ${error?.message || "Unknown error"}`,
      );
    }
  }
}
