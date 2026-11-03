import { ChatThread } from "@nannier/canvas";

export const Messages = () => (
  <ChatThread
    messages={[
      { id: "q", role: "user", content: "Help me plan the release." },
      { id: "a", role: "assistant", author: "Planner", provider: "OpenAI", content: "Start with **scope** and a release checklist.\n\n1. Confirm acceptance criteria\n2. Run the affected checks" },
    ]}
  />
);

export const WithActions = () => (
  <ChatThread
    messages={[
      {
        id: "checkpoint",
        role: "assistant",
        content: "Your answers are saved. What would you like to do next?",
        actions: [
          { id: "draft", label: "Draft plan", primary: true },
          { id: "continue", label: "Continue with questions" },
        ],
      },
    ]}
    onAction={() => {}}
  />
);

export const Questions = () => (
  <ChatThread
    messages={[
      {
        id: "planning-questions",
        role: "assistant",
        content: "Which release approach should we plan?",
        questions: [
          {
            id: "scope",
            title: "What should the first release include?",
            options: [
              { id: "focused", label: "A focused first release", description: "Ship the essential workflow, then expand from feedback." },
              { id: "complete", label: "The complete workflow", description: "Include reporting, collaboration, and administration." },
            ],
          },
        ],
        questionAnswers: [],
        questionIndex: 0,
        questionsSubmitted: false,
      },
    ]}
    onQuestionAnswerChange={() => {}}
    onQuestionIndexChange={() => {}}
    onSubmitQuestionAnswers={() => {}}
  />
);
