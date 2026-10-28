/* eslint-disable @next/next/no-img-element -- remote demo portraits, decorative */
import { Icon } from "../ui/Icon";

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

/** A phone showing the swipe deck, with the moments that follow floating around it. */
export function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[300px] sm:w-[330px]" aria-hidden="true">
      <div className="absolute -inset-16 rounded-full bg-[radial-gradient(closest-side,rgb(255_46_106/0.45),transparent)] blur-2xl" />
      <div className="relative rounded-[48px] border border-white/10 bg-[#111] p-3 shadow-[0_40px_120px_-30px_rgb(255_46_106/0.55)]">
        <div className="absolute top-5 left-1/2 z-20 h-6 w-28 -translate-x-1/2 rounded-full bg-black" />
        <div className="relative h-[600px] overflow-hidden rounded-[38px] bg-black">
          <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between px-6 pt-12 text-white">
            <span className="font-display text-lg font-extrabold tracking-tight">saath<span className="text-[#ff7a5c]">verse</span></span>
            <Icon name="filter" size={18} />
          </div>
          <div className="absolute inset-x-3 top-24 bottom-24">
            <div className="absolute inset-0 translate-y-3 scale-95 overflow-hidden rounded-[24px] opacity-70">
              <img src={DEMO_FACES.b} alt="" className="h-full w-full object-cover" />
            </div>
            <div className="mock-swipe absolute inset-0 overflow-hidden rounded-[24px]">
              <img src={DEMO_FACES.a} alt="" className="h-full w-full object-cover" />
              <div className="absolute inset-x-3 top-3 flex gap-1"><span className="h-1 flex-1 rounded-full bg-white" /><span className="h-1 flex-1 rounded-full bg-white/40" /><span className="h-1 flex-1 rounded-full bg-white/40" /></div>
              <span className="mock-like absolute top-10 left-5 rotate-[-14deg] rounded-lg border-4 border-[#3ee6a0] px-2 font-display text-2xl font-extrabold text-[#3ee6a0]">LIKE</span>
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/60 to-transparent p-4 pt-20 text-white">
                <p className="font-display text-3xl font-extrabold">Ava <span className="font-semibold text-white/90">27</span></p>
                <p className="mt-1 flex items-center gap-2 text-xs font-semibold text-white/85"><span className="h-2 w-2 rounded-full bg-[#3ee6a0]" />Active now · 3 km away</p>
                <p className="mt-2 inline-flex items-center gap-1 rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold backdrop-blur"><Icon name="sparkle" size={12} /> 92% vibe · You both love music</p>
              </div>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-6 flex items-center justify-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-white/10 text-[#ff4458]"><Icon name="close" size={22} /></span>
            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-[#2b9bff]"><Icon name="star" size={18} /></span>
            <span className="bg-brand flex h-14 w-14 items-center justify-center rounded-full shadow-[0_10px_30px_-8px_rgb(255_46_106/0.8)]"><Icon name="heart" size={26} /></span>
          </div>
        </div>
      </div>

      <div className="animate-float absolute top-24 -left-20 hidden items-center gap-2 rounded-2xl bg-white p-2 pr-4 text-[#111] shadow-2xl sm:flex">
        <span className="flex -space-x-3">
          <img src={DEMO_FACES.a} alt="" className="h-9 w-9 rounded-full border-2 border-white object-cover" />
          <img src={DEMO_FACES.d} alt="" className="h-9 w-9 rounded-full border-2 border-white object-cover" />
        </span>
        <span className="text-sm leading-tight font-extrabold">It&apos;s a Saath!<span className="block text-xs font-semibold text-[#666]">You both liked each other</span></span>
      </div>
      <div className="animate-float absolute -right-16 bottom-40 hidden items-center gap-2 rounded-2xl bg-white p-3 text-[#111] shadow-2xl [animation-delay:1.5s] sm:flex">
        <span className="bg-brand flex h-9 w-9 items-center justify-center rounded-xl"><Icon name="connect4" size={18} /></span>
        <span className="text-sm leading-tight font-extrabold">Connect Four<span className="block text-xs font-semibold text-[#666]">Ava is winning</span></span>
      </div>
      <div className="animate-float absolute -right-10 top-10 hidden rounded-2xl bg-white px-3 py-2 text-sm font-extrabold text-[#111] shadow-2xl [animation-delay:0.8s] sm:block">
        <span className="text-[#e11d5a]">Spark</span> bond unlocked
      </div>
    </div>
  );
}
