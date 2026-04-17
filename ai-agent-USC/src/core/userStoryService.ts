import { StoryBoardDocument, UserStory } from "./types";

const DEFAULT_STORY_ID = "story-1";

function createDefaultStory(): UserStory {
  return {
    id: DEFAULT_STORY_ID,
    title: "User Login Authentication",
    statement: {
      asA: "registered user",
      iWantTo: "log in using my email and password",
      soThat: "I can access my personal dashboard and saved settings safely",
    },
    acceptanceCriteria: [
      "Given the user is on the login page\nWhen they enter valid credentials\nThen they are redirected to the dashboard",
      "Given the user enters an invalid password\nWhen they submit the form\nThen an error message is displayed",
    ],
    businessRules: [
      "Implement rate limiting on the login endpoint (max 5 attempts per minute)",
    ],
    status: "In Progress",
    priority: "High",
    storyPoints: 5,
    devNotes: "Needs to integrate with the new Auth0 provider.",
  };
}

export function createDefaultBoard(): StoryBoardDocument {
  const defaultStory = createDefaultStory();

  return {
    selectedStoryId: defaultStory.id,
    stories: [defaultStory],
  };
}

function sanitizeStory(story: Partial<UserStory>, fallbackId: string): UserStory {
  const legacyStory = story as Partial<UserStory> & { technicalCriteria?: unknown };
  const businessRulesSource = Array.isArray(story.businessRules)
    ? story.businessRules
    : Array.isArray(legacyStory.technicalCriteria)
      ? legacyStory.technicalCriteria
      : [];

  return {
    id: story.id ?? fallbackId,
    title: story.title ?? "New User Story",
    statement: {
      asA: story.statement?.asA ?? "",
      iWantTo: story.statement?.iWantTo ?? "",
      soThat: story.statement?.soThat ?? "",
    },
    acceptanceCriteria: Array.isArray(story.acceptanceCriteria)
      ? story.acceptanceCriteria.map(String)
      : [],
    businessRules: businessRulesSource.map(String),
    status:
      story.status === "To Do" ||
      story.status === "In Progress" ||
      story.status === "Done"
        ? story.status
        : "To Do",
    priority:
      story.priority === "Low" ||
      story.priority === "Medium" ||
      story.priority === "High"
        ? story.priority
        : "Medium",
    storyPoints: Number.isFinite(story.storyPoints) ? Number(story.storyPoints) : 0,
    devNotes: story.devNotes ?? "",
  };
}

export function parseBoardDocument(rawText: string): StoryBoardDocument {
  if (!rawText.trim()) {
    return createDefaultBoard();
  }

  try {
    const parsed = JSON.parse(rawText) as Partial<StoryBoardDocument>;

    if (!Array.isArray(parsed.stories) || parsed.stories.length === 0) {
      return createDefaultBoard();
    }

    const stories = parsed.stories.map((story, index) =>
      sanitizeStory(story, `story-${index + 1}`),
    );

    const selectedStoryId = stories.some((story) => story.id === parsed.selectedStoryId)
      ? (parsed.selectedStoryId as string)
      : stories[0].id;

    return {
      selectedStoryId,
      stories,
    };
  } catch {
    return createDefaultBoard();
  }
}

export function stringifyBoardDocument(board: StoryBoardDocument): string {
  return `${JSON.stringify(board, null, 2)}\n`;
}
