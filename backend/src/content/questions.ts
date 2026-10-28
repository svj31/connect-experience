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
  { id: "wyr-21", a: "Slow dance in the kitchen", b: "Learn a dance routine together", topic: "dance" },
  { id: "wyr-22", a: "Bake bread from scratch", b: "Master one perfect curry", topic: "cooking" },
  { id: "wyr-23", a: "Find the best filter coffee in town", b: "Make the best cold brew at home", topic: "coffee" },
  { id: "wyr-24", a: "Binge one long anime series", b: "Watch five short ones", topic: "anime" },
  { id: "wyr-25", a: "Watch a cricket final at the stadium", b: "Watch it at home with friends and snacks", topic: "cricket" },
  { id: "wyr-26", a: "Play a five a side match", b: "Watch a big match at a packed cafe", topic: "football" },
  { id: "wyr-27", a: "Sunrise yoga on a rooftop", b: "Candle lit yoga at night", topic: "yoga" },
  { id: "wyr-28", a: "Write a poem for someone", b: "Have a poem written for you", topic: "poetry" },
  { id: "wyr-29", a: "Start a podcast together", b: "Be guests on your favourite one", topic: "podcasts" },
  { id: "wyr-30", a: "Front row at a play", b: "Backstage tour of the theatre", topic: "theatre" },
  { id: "wyr-31", a: "Stargaze in a desert", b: "Watch the northern lights", topic: "astronomy" },
  { id: "wyr-32", a: "Volunteer at an animal shelter", b: "Teach a weekend class for kids", topic: "volunteering" },
  { id: "wyr-33", a: "Build a startup with your best friend", b: "Join a rocket ship early", topic: "startups" },
  { id: "wyr-34", a: "Win a long strategy board game", b: "Lose a fast chaotic party game", topic: "board games" },
  { id: "wyr-35", a: "Get a handwritten letter", b: "Get a playlist made for you", topic: "writing" },
  { id: "wyr-36", a: "A spontaneous road trip", b: "A perfectly planned getaway", topic: "travel" },
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

/** Deep Talk cards in three rounds of depth. Both answer in secret and reveal together. */
export const DEEP_TALK: { id: string; level: 1 | 2 | 3; text: string }[] = [
  { id: "dt-01", level: 1, text: "What is a small thing that always makes your day better?" },
  { id: "dt-02", level: 1, text: "What were you obsessed with as a kid?" },
  { id: "dt-03", level: 1, text: "Which song would play when you walk into a room?" },
  { id: "dt-04", level: 1, text: "What is the best trip you have taken, and why that one?" },
  { id: "dt-05", level: 1, text: "What is something you are learning right now?" },
  { id: "dt-06", level: 1, text: "What does your ideal lazy day look like?" },
  { id: "dt-07", level: 2, text: "What is a belief you held strongly that you have let go of?" },
  { id: "dt-08", level: 2, text: "Who in your life do you wish you thanked more often?" },
  { id: "dt-09", level: 2, text: "What makes you feel most like yourself?" },
  { id: "dt-10", level: 2, text: "What is a compliment you still remember?" },
  { id: "dt-11", level: 2, text: "When do you feel most at peace?" },
  { id: "dt-12", level: 2, text: "What is one thing people often get wrong about you?" },
  { id: "dt-13", level: 3, text: "What does a relationship need for you to feel safe in it?" },
  { id: "dt-14", level: 3, text: "What is a dream you have not said out loud much?" },
  { id: "dt-15", level: 3, text: "How do you like to be cared for on a hard day?" },
  { id: "dt-16", level: 3, text: "What is something you are proud of that nobody sees?" },
  { id: "dt-17", level: 3, text: "What would you want someone to know before getting close to you?" },
  { id: "dt-18", level: 3, text: "What does home mean to you?" },
];

/** Videos to suggest in Watch Together, tagged by the interests they suit. */
export const WATCH_PICKS: { id: string; title: string; tags: string[]; mood: string }[] = [
  { id: "jfKfPfyJRdk", title: "Lofi beats to chat to", tags: ["music", "books", "writing", "coffee", "podcasts"], mood: "Chill" },
  { id: "450p7goxZqg", title: "John Legend, All of Me", tags: ["music", "dance", "poetry"], mood: "Romantic" },
  { id: "2Vv-BfVoq4g", title: "Ed Sheeran, Perfect", tags: ["music", "dance"], mood: "Romantic" },
  { id: "lp-EO5I60KA", title: "Ed Sheeran, Thinking Out Loud", tags: ["music", "dance", "theatre"], mood: "Romantic" },
  { id: "OPf0YbXqDm0", title: "Uptown Funk", tags: ["music", "dance", "comedy", "fitness"], mood: "Party" },
  { id: "fJ9rUzIMcZQ", title: "Queen, Bohemian Rhapsody", tags: ["music", "films", "theatre"], mood: "Classic" },
  { id: "kJQP7kiw5Fk", title: "Despacito", tags: ["music", "dance", "travel"], mood: "Party" },
  { id: "hT_nvWreIhg", title: "OneRepublic, Counting Stars", tags: ["music", "astronomy"], mood: "Feel good" },
  { id: "iCvmsMzlF7o", title: "Brene Brown on vulnerability (TED)", tags: ["books", "podcasts", "volunteering", "writing"], mood: "Deep talk" },
  { id: "arj7oStGLkU", title: "Inside the mind of a procrastinator (TED)", tags: ["comedy", "tech", "science", "startups", "podcasts"], mood: "Funny" },
  { id: "UF8uR6Z6KLc", title: "Steve Jobs, Stanford speech", tags: ["tech", "startups", "science"], mood: "Inspiring" },
  { id: "jNQXAC9IVRw", title: "The first video ever on YouTube", tags: ["tech", "comedy", "pets"], mood: "Trivia" },
];

/** Draw Together prompts, tagged by interest. */
export const DRAW_PROMPTS: { text: string; tags: string[] }[] = [
  { text: "Draw your dream trip, one landmark each", tags: ["travel", "photography", "outdoors"] },
  { text: "Design a pizza neither of you would order", tags: ["food", "cooking", "comedy"] },
  { text: "A pet you both would adopt", tags: ["pets", "volunteering"] },
  { text: "The cover of an album you would make together", tags: ["music", "art", "dance"] },
  { text: "A planet only the two of you live on", tags: ["astronomy", "science", "anime"] },
  { text: "Your perfect cafe, one table each", tags: ["coffee", "books", "writing"] },
  { text: "A movie poster for your first date", tags: ["films", "theatre", "comedy"] },
  { text: "A game board for a game you just invented", tags: ["gaming", "board games", "tech"] },
  { text: "Your view from a mountain top", tags: ["outdoors", "fitness", "yoga"] },
  { text: "Each draw the other one as a cartoon", tags: [] },
];
