export interface Question {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | 'Basic';
  isFavorite: boolean;
  tags: string[];
  timeSpent: number;
  isTimerRunning: boolean;
  timerStartedAt: number | null;
  platformUrl?: string;
}

export interface SubTopic {
  id: string;
  title: string;
  questions: Question[];
  isCollapsed: boolean; 
}

export interface Topic {
  id: string;
  title: string;
  subTopics: SubTopic[];
  isCollapsed: boolean;
}

export interface APIQuestion {
  _id: string;
  topic: string;
  title: string;
  subTopic: string | null;
  questionId: {
    _id: string;
    name: string;
    difficulty: string;
    topics?: string[];
    problemUrl?: string;
    platform?: string;
    slug?: string;
  };
}

export interface APIResponse {
  status: {
    code: number;
    success: boolean;
  };
  data: {
    sheet: {
      name: string;
      banner?: string;
      description: string;
      link?: string;
      config: {
        topicOrder: string[];
        subTopicOrder: Record<string, string[]>;
        questionOrder: string[];
      };
    };
    questions: APIQuestion[];
  };
}
