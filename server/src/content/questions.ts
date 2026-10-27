export interface ChoiceQuestion {
  id: string;
  a: string;
  b: string;
  /** Interest this question says something about, used for Common Ground topics. */
  topic: string;
}

export interface GuessQuestion {
  id: string;
  prompt: string;
  options: [string, string, string, string];
}

export const WOULD_YOU_RATHER: ChoiceQuestion[] = [
  { id: "wyr-01", a: "Spend a weekend in a mountain cabin", b: "Spend a weekend in a city you have never visited", topic: "travel" },
  { id: "wyr-02", a: "Cook dinner together at home", b: "Try a restaurant neither of you knows", topic: "food" },
  { id: "wyr-03", a: "Watch a film you both love again", b: "Gamble on a film with no reviews", topic: "films" },
  { id: "wyr-04", a: "Go to a small live gig", b: "Go to a huge festival", topic: "music" },
  { id: "wyr-05", a: "Read the book first", b: "Watch the adaptation first", topic: "books" },
  { id: "wyr-06", a: "Sunrise hike", b: "Late night walk", topic: "outdoors" },
  { id: "wyr-07", a: "Learn to paint", b: "Learn to play an instrument", topic: "art" },
  { id: "wyr-08", a: "Play a board game", b: "Play a video game", topic: "gaming" },
  { id: "wyr-09", a: "Have a dog that never stops being excited", b: "Have a cat that judges you quietly", topic: "pets" },
  { id: "wyr-10", a: "Plan every detail of a trip", b: "Book the ticket and figure out the rest there", topic: "travel" },
  { id: "wyr-11", a: "Visit a science museum", b: "Visit an art gallery", topic: "science" },
  { id: "wyr-12", a: "Write a letter by hand", b: "Record a voice note", topic: "writing" },
  { id: "wyr-13", a: "Take photos of everything", b: "Keep your phone in your pocket all day", topic: "photography" },
  { id: "wyr-14", a: "Go to a comedy show", b: "Go to a theatre play", topic: "comedy" },
  { id: "wyr-15", a: "Morning workout", b: "Evening workout", topic: "fitness" },
  { id: "wyr-16", a: "Thrift shopping", b: "Buy one thing you really love new", topic: "fashion" },
  { id: "wyr-17", a: "Build a gadget", b: "Fix an old one", topic: "tech" },
  { id: "wyr-18", a: "Street food tour", b: "Long slow dinner", topic: "food" },
  { id: "wyr-19", a: "Know the ending of every film", b: "Never be able to rewatch anything", topic: "films" },
  { id: "wyr-20", a: "Have a playlist for every mood", b: "Put one album on repeat for a month", topic: "music" },
];

export const IN_SYNC: GuessQuestion[] = [
  { id: "sync-01", prompt: "Ideal Sunday morning", options: ["Sleeping in", "A long breakfast", "A run or workout", "Errands and done by noon"] },
  { id: "sync-02", prompt: "Go to snack", options: ["Something salty", "Something sweet", "Fruit", "Whatever is closest"] },
  { id: "sync-03", prompt: "Superpower you would pick", options: ["Teleporting", "Reading minds", "Pausing time", "Talking to animals"] },
  { id: "sync-04", prompt: "How you recharge", options: ["Alone with a book or show", "With a few close friends", "Outside, moving", "Making something"] },
  { id: "sync-05", prompt: "First thing you notice in a new city", options: ["The food", "The architecture", "The people", "The noise or the quiet"] },
  { id: "sync-06", prompt: "Your role in a group trip", options: ["The planner", "The navigator", "The photographer", "The one who finds snacks"] },
  { id: "sync-07", prompt: "Favourite kind of weather", options: ["Bright and hot", "Cool and cloudy", "Rain on the window", "First snow"] },
  { id: "sync-08", prompt: "A perfect night in", options: ["Film marathon", "Cooking something new", "Games", "Long conversation"] },
  { id: "sync-09", prompt: "You are most likely to be late because", options: ["Overslept", "Changed outfits", "Got distracted talking", "I am never late"] },
  { id: "sync-10", prompt: "Dream small luxury", options: ["Fresh flowers every week", "A great coffee machine", "A really good mattress", "Weekly massage"] },
];

export const ICEBREAKERS: string[] = [
  "What is something small that made your week better?",
  "Which place do you always recommend to friends?",
  "What are you weirdly good at?",
  "What song do you never skip?",
  "What did you want to be when you were ten?",
  "What is a hobby you would pick up if time was free?",
  "What is the best meal you have had this year?",
  "Which fictional world would you move to?",
  "What is something you changed your mind about recently?",
  "What does a good day look like for you?",
];
