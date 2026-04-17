export type StoryStatus = "To Do" | "In Progress" | "Done";
export type StoryPriority = "Low" | "Medium" | "High";

export interface StoryStatement {
  asA: string;
  iWantTo: string;
  soThat: string;
}

export interface UserStory {
  id: string;
  title: string;
  statement: StoryStatement;
  acceptanceCriteria: string[];
  businessRules: string[];
  status: StoryStatus;
  priority: StoryPriority;
  storyPoints: number;
  devNotes: string;
}

export interface StoryBoardDocument {
  selectedStoryId: string;
  stories: UserStory[];
}

export interface WebviewStateMessage {
  type: "setState";
  payload: StoryBoardDocument;
}

export interface SaveDocumentMessage {
  type: "saveDocument";
  payload: StoryBoardDocument;
}

export type WebviewInboundMessage = SaveDocumentMessage;
