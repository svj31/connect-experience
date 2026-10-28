
/** Demo portraits (Unsplash, free licence) for marketing visuals only. */
export const DEMO_FACES = {
  a: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&h=800&fit=crop&q=80",
  b: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&h=800&fit=crop&q=80",
  c: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&h=800&fit=crop&q=80",
  d: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&h=800&fit=crop&q=80",
  e: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&h=800&fit=crop&q=80",
  f: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&h=800&fit=crop&q=80",
};

/** Demo crowd for the landing photo wall and strip (pravatar.cc placeholder portraits). */
export const CROWD: { name: string; age: number; city: string; img: number }[] = [
  { name: "Ananya", age: 26, city: "Mumbai", img: 5 }, { name: "Aarav", age: 28, city: "Pune", img: 3 },
  { name: "Riya", age: 24, city: "Delhi", img: 9 }, { name: "Kunal", age: 29, city: "Bengaluru", img: 8 },
  { name: "Kavya", age: 25, city: "Chennai", img: 16 }, { name: "Rahul", age: 31, city: "Hyderabad", img: 11 },
  { name: "Diya", age: 23, city: "Jaipur", img: 20 }, { name: "Ishaan", age: 27, city: "Goa", img: 12 },
  { name: "Nisha", age: 28, city: "Kolkata", img: 23 }, { name: "Karan", age: 30, city: "Gurugram", img: 13 },
  { name: "Aisha", age: 26, city: "Mumbai", img: 25 }, { name: "Samar", age: 29, city: "Delhi", img: 51 },
  { name: "Sneha", age: 27, city: "Pune", img: 26 }, { name: "Reyansh", age: 28, city: "Kochi", img: 53 },
  { name: "Rhea", age: 24, city: "Bengaluru", img: 28 }, { name: "Farhan", age: 32, city: "Ahmedabad", img: 59 },
];
export const crowdPhoto = (img: number, size = 600) => `https://i.pravatar.cc/${size}?img=${img}`;
