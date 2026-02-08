import { v4 as uuidv4 } from 'uuid';
import type { APIResponse, Topic, SubTopic, Question } from '@/types/sheet';

export function transformAPIData(data: APIResponse): { sheetName: string; banner: string; description: string; link: string; topics: Topic[] } {
    const sheetName = data.data.sheet.name;
    const topicOrder = data.data.sheet.config.topicOrder;
    const questions = data.data.questions;
    const banner = data.data.sheet.banner || '';
    const description = data.data.sheet.description || '';
    const link = data.data.sheet.link || '';

    const topicMap = new Map<string, Map<string, Question[]>>();

    for (const q of questions) {
        const topicName = q.topic;
        const subTopicName = q.subTopic ?? 'General';

        if (!topicMap.has(topicName)) {
            topicMap.set(topicName, new Map());
        }

        const subTopicMap = topicMap.get(topicName)!;
        if (!subTopicMap.has(subTopicName)) {
            subTopicMap.set(subTopicName, []);
        }

        const difficulty = normalizeDifficulty(q.questionId?.difficulty);

        const question: Question = {
            id: q._id || uuidv4(),
            title: q.title || q.questionId?.name || 'Untitled',
            difficulty,
            isFavorite: false,
            tags: q.questionId?.topics?.slice(0, 3) || [],
            timeSpent: 0,
            isTimerRunning: false,
            timerStartedAt: null,
            platformUrl: q.questionId?.problemUrl,
        };

        subTopicMap.get(subTopicName)!.push(question);
    }

    const orderedTopics: Topic[] = [];
    const processedTopics = new Set<string>();

    for (const topicName of topicOrder) {
        if (topicMap.has(topicName)) {
            orderedTopics.push(buildTopic(topicName, topicMap.get(topicName)!));
            processedTopics.add(topicName);
        }
    }

    for (const [topicName, subMap] of topicMap) {
        if (!processedTopics.has(topicName)) {
            orderedTopics.push(buildTopic(topicName, subMap));
        }
    }

    return { sheetName, banner, description, link, topics: orderedTopics };
}

function buildTopic(name: string, subTopicMap: Map<string, Question[]>): Topic {
    const subTopics: SubTopic[] = [];

    for (const [stName, questions] of subTopicMap) {
        subTopics.push({
            id: uuidv4(),
            title: stName,
            questions,
            isCollapsed: true,
        });
    }

    return {
        id: uuidv4(),
        title: name,
        subTopics,
        isCollapsed: false,
    };
}

function normalizeDifficulty(d?: string): Question['difficulty'] {
    if (!d) return 'Medium';
    const lower = d.toLowerCase();
    if (lower === 'easy' || lower === 'basic') return 'Easy';
    if (lower === 'medium') return 'Medium';
    if (lower === 'hard') return 'Hard';
    return 'Medium';
}
