import { Type, Schema } from "@google/genai";
import { Character, Plot, PlotDraft } from "../types.js";
import type { AIAdapter } from "./adapters/types.js";
import { geminiAdapter, CREATIVE_MODEL, FAST_MODEL } from "./adapters/geminiAdapter.js";
import { openrouterAdapter } from "./adapters/openrouterAdapter.js";

// --- Adapter selection (extend by adding new adapters and env check) ---
const PROVIDER = (process.env.AI_PROVIDER ?? process.env.VITE_AI_PROVIDER ?? "gemini").toLowerCase();
const adapters: Record<string, AIAdapter> = {
  gemini: geminiAdapter,
  openrouter: openrouterAdapter,
};
const adapter: AIAdapter = adapters[PROVIDER] ?? geminiAdapter;

// --- Shared prompts & schemas (Gemini Schema format; OpenRouter uses JSON instruction in prompt) ---
export const WRITING_STYLES = [
  "Novel",
  "Plain English",
  "Casual",
  "Literary",
  "South Indian English",
  "North Indian English",
];

const plotDetailsSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    genre: { type: Type.STRING },
    writingStyle: { type: Type.STRING, enum: WRITING_STYLES },
    setting: { type: Type.STRING },
    plot: { type: Type.STRING, description: "2–4 sentence story summary / refined plot" },
    rules: { type: Type.STRING },
    objective: { type: Type.STRING },
    episodeLength: { type: Type.INTEGER },
  },
  required: ["title", "genre", "writingStyle", "setting", "plot", "rules", "objective", "episodeLength"],
};

const characterSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    characters: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          name: { type: Type.STRING, description: "Character's full name" },
          role: { type: Type.STRING, description: "Archetype or role (e.g. Hero, Villain, Mentor, or custom)" },
          traits: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "List of 3-5 distinct personality traits (e.g. Brave, Cunning, Loyal)"
          },
          speakingStyle: { type: Type.STRING, description: "How they speak (e.g. Formal, Slang, Stutter, Poetic)" },
          secret: { type: Type.STRING, description: "A hidden secret or motivation" },
          relationships: { type: Type.STRING, description: "Key relationships with other characters" },
          characterization: {
            type: Type.STRING,
            description: "A detailed paragraph describing their personality, background, and goals. MUST NOT BE EMPTY."
          },
        },
        required: ["name", "role", "traits", "speakingStyle", "characterization"],
      },
    },
  },
};

const episodeSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    episodeTitle: { type: Type.STRING },
    episodeText: { type: Type.STRING },
    episodeSummary: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "5 distinct bullet points summarizing events",
    },
    storyMemory: {
      type: Type.STRING,
      description: "Updated running summary of the entire plot so far.",
    },
    charactersUsed: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: "List of names of characters who appeared",
    },
  },
  required: ["episodeTitle", "episodeText", "episodeSummary", "storyMemory", "charactersUsed"],
};

// --- Plot details ---
export const generatePlotDetails = async (input: string): Promise<Partial<PlotDraft>> => {
  const prompt = `
    You are a master storyteller.
    Analyze the following user input, which might be a specific Genre OR a raw Story Concept:
    "${input}"

    Based on this, create a unique, complete story foundation.
    
    1. If the input is a description (e.g., "cowboys vs aliens"), infer the best fitting Genre.
    2. Fill in the following details:
    - Title: Catchy title.
    - Genre: The specific genre string.
    - writingStyle: One of [${WRITING_STYLES.join(", ")}] — complexity and style of language (e.g. Novel = rich prose, Plain English = clear and simple, South Indian English = Indian English with South Indian flavour).
    - Setting: Vivid time and place.
    - plot: A 2–4 sentence story summary / refined plot (the main story in brief).
    - Rules of the World: 1-2 unique laws/mechanics.
    - Story Objective: Ultimate goal.
    - Episode Length: EXACTLY one of: 300, 600, 900, 1000, 1200.

    Be original and as much creative as possible.
  `;

  try {
    const opts: Parameters<AIAdapter["generateContent"]>[1] = { jsonSchema: plotDetailsSchema };
    if (adapter.name === "gemini") opts.model = FAST_MODEL;
    const { text } = await adapter.generateContent(prompt, opts);
    const raw = JSON.parse(text || "{}");
    // Normalize keys from OpenRouter/other providers (e.g. Title, Setting, "Rules of the World")
    return {
      title: raw.title ?? raw.Title ?? "",
      genre: raw.genre ?? raw.Genre ?? "",
      writingStyle: raw.writingStyle ?? raw.WritingStyle ?? "",
      setting: raw.setting ?? raw.Setting ?? "",
      plot: raw.plot ?? raw.Plot ?? "",
      rules: raw.rules ?? raw["Rules of the World"] ?? "",
      objective: raw.objective ?? raw["Story Objective"] ?? "",
      episodeLength: raw.episodeLength ?? raw["Episode Length"] ?? 600,
    };
  } catch (error) {
    console.error("Error generating plot details:", error);
    return {};
  }
};

/** Refine a raw plot/concept into a short story summary (2–4 sentences). */
export const refinePlot = async (rawInput: string): Promise<string> => {
  if (!rawInput?.trim()) return "";
  const prompt = `
    Turn this raw story idea or concept into a clear, 2–4 sentence plot summary.
    Keep the same idea and tone; just make it a concise "what this story is about" description.
    Reply with ONLY the plot summary, no labels or extra text.

    Input: "${rawInput.trim()}"
  `;
  try {
    const opts = adapter.name === "gemini" ? { model: FAST_MODEL } : undefined;
    const { text } = await adapter.generateContent(prompt, opts);
    return (text || "").trim();
  } catch (error) {
    console.error("Error refining plot:", error);
    return rawInput;
  }
};

// --- Characters ---
export const generateDefaultCharacters = async (draft: PlotDraft): Promise<Partial<Character>[]> => {
  const prompt = `
    Create 3 compelling characters for:
    Title: ${draft.title}
    Genre: ${draft.genre}
    Writing style: ${draft.writingStyle}
    Setting: ${draft.setting}
    Plot: ${draft.plot}
    Objective: ${draft.objective}

    Roles: Suggest fitting archetypes (e.g. Hero, Villain, Mentor, Sidekick, Rival, Antihero, Trickster, Narrator, or creative custom roles).
    
    IMPORTANT: 
    - You MUST provide a list of 3-5 specific 'traits' for each character.
    - You MUST provide a detailed 'characterization' paragraph describing their personality and goals.
    - Do NOT leave these fields empty.
  `;

  try {
    const opts: Parameters<AIAdapter["generateContent"]>[1] = { jsonSchema: characterSchema };
    if (adapter.name === "gemini") opts.model = FAST_MODEL;
    const { text } = await adapter.generateContent(prompt, opts);
    const json = JSON.parse(text || "{}");
    return (json.characters ?? []).map((c: any) => ({
      ...c,
      submittedBy: "Director (AI)",
      isDefault: true,
      traits: c.traits ?? [],
    }));
  } catch (error) {
    console.error("Error generating characters:", error);
    return [];
  }
};

// --- Episode ---
export const generateNextEpisode = async (
  plot: Plot
): Promise<{
  title: string;
  text: string;
  summary: string[];
  memory: string;
  charactersUsed: string[];
}> => {
  const episodeNum = plot.episodes.length + 1;
  const recentEpisodes = plot.episodes.slice(-2);
  const recentSummary = recentEpisodes
    .map((e) => `Episode ${e.episodeNumber} (${e.title}):\n${e.summary.join("\n")}`)
    .join("\n\n");
  const charDescriptions = plot.characters
    .map(
      (c) => `
    Name: ${c.name} (${c.role})
    Traits: ${Array.isArray(c.traits) ? c.traits.join(", ") : c.traits}
    Speaking Style: ${c.speakingStyle}
    Context: ${c.characterization}
    ${c.secret ? `Secret: ${c.secret}` : ""}
  `
    )
    .join("\n---\n");
  const newChars = plot.characters
    .filter((c) => c.joinedAtEpisode === episodeNum)
    .map((c) => c.name)
    .join(", ");
  const isFirstEpisode = episodeNum === 1;

  const promptText = `
    You are the Director AI for "StoryVerse". Write Episode ${episodeNum}.

    METADATA:
    Title: ${plot.title}
    Genre: ${plot.genre}
    Writing style (language complexity/tone): ${plot.writingStyle}
    Setting: ${plot.setting}
    Plot: ${plot.plot}
    Rules: ${plot.rules}
    Objective: ${plot.objective}
    Length: ${plot.episodeLength} words.

    CHARACTERS:
    ${charDescriptions}

    ${!isFirstEpisode && newChars ? `NEW CHARACTERS: ${newChars} (Introduce them)` : ""}

    PREVIOUS MEMORY:
    ${plot.storyMemory || "None"}
    
    RECENT EVENTS:
    ${recentSummary || "None"}

    INSTRUCTIONS:
    1. Write a compelling narrative.
    2. Focus on interaction.
    3. Advance the plot.
    4. If Ep 1, establish world.
    5. Update Story Memory.
    6. Output MUST be valid JSON only (no markdown, no code fences, no extra text).
    7. Output MUST strictly follow this shape and key names:
    {
      "episodeTitle": "string",
      "episodeText": "string",
      "episodeSummary": ["string", "string", "string", "string", "string"],
      "storyMemory": "string",
      "charactersUsed": ["Character Name 1", "Character Name 2"]
    }
    8. Keep "episodeSummary" as exactly 5 concise bullet-style strings.
    9. "charactersUsed" must only contain character names that appear in this episode.
    10. Do not include any keys other than: episodeTitle, episodeText, episodeSummary, storyMemory, charactersUsed.
  `;

  const parseEpisode = (raw: string) => {
    const knownCharacterNames = new Set(plot.characters.map((c) => c.name));

    const extractJsonCandidate = (input: string): string => {
      const trimmed = (input || "").trim();
      if (!trimmed) return "{}";

      const fenceMatch = trimmed.match(/```(?:json)?\s*([\s\S]*?)\s*```/i);
      if (fenceMatch?.[1]) return fenceMatch[1].trim();

      const start = trimmed.indexOf("{");
      const end = trimmed.lastIndexOf("}");
      if (start >= 0 && end > start) return trimmed.slice(start, end + 1).trim();

      return trimmed;
    };

    const normalizeString = (value: unknown): string =>
      typeof value === "string" ? value.trim() : "";

    const normalizeSummary = (value: unknown): string[] => {
      if (Array.isArray(value)) {
        return value
          .filter((item): item is string => typeof item === "string")
          .map((item) => item.trim())
          .filter(Boolean);
      }
      if (typeof value === "string") {
        return value
          .split("\n")
          .map((line) => line.replace(/^\s*[-*•]\s*/, "").trim())
          .filter(Boolean);
      }
      return [];
    };

    const normalizeCharactersUsed = (value: unknown, episodeText: string): string[] => {
      if (Array.isArray(value)) {
        const names = value
          .map((item) => {
            if (typeof item === "string") return item.trim();
            if (item && typeof item === "object" && "name" in item && typeof (item as any).name === "string") {
              return (item as any).name.trim();
            }
            return "";
          })
          .filter(Boolean);
        return Array.from(new Set(names.filter((name) => knownCharacterNames.has(name))));
      }

      // Last-resort inference from episode text if model omitted the field.
      if (episodeText) {
        return Array.from(knownCharacterNames).filter((name) => episodeText.includes(name));
      }
      return [];
    };

    let parsed: any = {};
    try {
      parsed = JSON.parse(extractJsonCandidate(raw));
    } catch (error) {
      console.warn("Episode response was not valid JSON. Returning empty defaults.", error);
      return { title: "", text: "", summary: [], memory: "", charactersUsed: [] };
    }

    const source = parsed?.result && typeof parsed.result === "object" ? parsed.result : parsed;
    const strictTitle = normalizeString(source.episodeTitle);
    const strictText = normalizeString(source.episodeText);
    const strictSummary = normalizeSummary(source.episodeSummary);
    const strictMemory = normalizeString(source.storyMemory);
    const strictCharacters = normalizeCharactersUsed(source.charactersUsed, strictText);

    const hasStrictPayload =
      strictTitle.length > 0 &&
      strictText.length > 0 &&
      strictSummary.length > 0 &&
      strictMemory.length > 0;

    if (hasStrictPayload) {
      return {
        title: strictTitle,
        text: strictText,
        summary: strictSummary,
        memory: strictMemory,
        charactersUsed: strictCharacters,
      };
    }

    // Narrow fallback for older payload formats.
    const fallbackTitle = strictTitle || normalizeString(source.title) || normalizeString(parsed.title);
    const fallbackText =
      strictText ||
      normalizeString(source.narrative) ||
      normalizeString(source.content) ||
      normalizeString(source.text) ||
      normalizeString(source.story);
    const fallbackSummary =
      strictSummary.length > 0
        ? strictSummary
        : normalizeSummary(source.summary ?? source.recent_events ?? parsed.episodeSummary);
    const fallbackMemory =
      strictMemory ||
      normalizeString(source.story_memory) ||
      normalizeString(source.memory) ||
      normalizeString(parsed.storyMemory) ||
      normalizeString(parsed.memory);
    const fallbackCharacters = normalizeCharactersUsed(
      source.charactersUsed ?? source.characters ?? parsed.charactersUsed,
      fallbackText
    );

    return {
      title: fallbackTitle,
      text: fallbackText,
      summary: fallbackSummary,
      memory: fallbackMemory,
      charactersUsed: fallbackCharacters,
    };
  };

  try {
    if (adapter.name === "gemini") {
      try {
        const { text } = await adapter.generateContent(promptText, {
          jsonSchema: episodeSchema,
          model: CREATIVE_MODEL,
          extra: { thinkingConfig: { thinkingBudget: 1024 } },
        } as any);
        return parseEpisode(text);
      } catch (creativeErr) {
        console.warn("Creative model failed, falling back to fast model.", creativeErr);
      }
    }
    const episodeOpts: Parameters<AIAdapter["generateContent"]>[1] = { jsonSchema: episodeSchema };
    if (adapter.name === "gemini") episodeOpts.model = FAST_MODEL;
    const { text } = await adapter.generateContent(promptText, episodeOpts);
    return parseEpisode(text);
  } catch (error) {
    console.error("Failed to generate episode:", error);
    throw new Error("Failed to generate episode. Quota exceeded or AI error.");
  }
};
