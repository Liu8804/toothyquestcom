import { QuizQuestion } from './types';

// Quiz questions pulled from existing dental education content
export const quizQuestions: QuizQuestion[] = [
  {
    question: "How many times should you brush your teeth each day?",
    options: ["Once", "Twice", "Three times", "Never"],
    correctAnswer: 1,
    explanation: "Brush twice a day - morning and night!"
  },
  {
    question: "What helps remove food stuck between teeth?",
    options: ["Toothpaste", "Floss", "Water", "Candy"],
    correctAnswer: 1,
    explanation: "Floss is a superhero for cleaning between teeth!"
  },
  {
    question: "How long should you brush your teeth?",
    options: ["10 seconds", "30 seconds", "2 minutes", "5 minutes"],
    correctAnswer: 2,
    explanation: "2 minutes is the magic brushing time!"
  },
  {
    question: "What makes teeth strong and healthy?",
    options: ["Candy", "Soda", "Milk and cheese", "Chips"],
    correctAnswer: 2,
    explanation: "Calcium in milk and cheese builds strong teeth!"
  },
  {
    question: "Who helps take care of your teeth?",
    options: ["Dentist", "Firefighter", "Pilot", "Chef"],
    correctAnswer: 0,
    explanation: "Dentists are tooth superheroes!"
  },
  {
    question: "What should you use to brush your teeth?",
    options: ["A stick", "Your finger", "A toothbrush", "A spoon"],
    correctAnswer: 2,
    explanation: "A toothbrush with soft bristles is perfect!"
  },
  {
    question: "Which snack is best for your teeth?",
    options: ["Lollipop", "Apple", "Chocolate", "Gummy bears"],
    correctAnswer: 1,
    explanation: "Crunchy fruits like apples help clean teeth!"
  },
  {
    question: "What do we call the bad guys that hurt teeth?",
    options: ["Sugar bugs", "Tooth fairies", "Smile stars", "Brush buddies"],
    correctAnswer: 0,
    explanation: "Sugar bugs love candy - brush them away!"
  },
  {
    question: "When should you visit the dentist?",
    options: ["Only when it hurts", "Never", "Every 6 months", "Every 5 years"],
    correctAnswer: 2,
    explanation: "Regular checkups keep your smile bright!"
  },
  {
    question: "What protects your teeth during sports?",
    options: ["Helmet", "Mouthguard", "Sunglasses", "Gloves"],
    correctAnswer: 1,
    explanation: "A mouthguard is armor for your teeth!"
  },
];

// Get a random quiz question
export function getRandomQuiz(excludeIndices: number[] = []): { quiz: QuizQuestion; index: number } {
  const availableIndices = quizQuestions
    .map((_, i) => i)
    .filter(i => !excludeIndices.includes(i));
  
  if (availableIndices.length === 0) {
    // Reset if all questions used
    const randomIndex = Math.floor(Math.random() * quizQuestions.length);
    return { quiz: quizQuestions[randomIndex], index: randomIndex };
  }
  
  const randomIndex = availableIndices[Math.floor(Math.random() * availableIndices.length)];
  return { quiz: quizQuestions[randomIndex], index: randomIndex };
}
