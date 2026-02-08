import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, BookOpen, Play, Plus, Sparkles, Users } from 'lucide-react';
import { Badge } from '../components/UI';
import { getPlots } from '../services/storageService';
import { Plot } from '../types';

interface HomeProps {
  onNavigate: (route: string, params?: any) => void;
}

const NAVIGATOR_FLOW = [
  {
    title: 'Director Creates The Plot',
    description: 'You are the Director. Start the story by creating the plot, world, tone, and rules.',
  },
  {
    title: 'Anyone Adds Characters',
    description: 'Anyone can add characters to any story, including yours. You can add to theirs too.',
  },
  {
    title: 'Episodes Evolve Daily',
    description: 'Episodes evolve day by day as new characters enter, while memory keeps the story coherent.',
  },
];

const formatDate = (isoDate: string) =>
  new Date(isoDate).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

export default function Home({ onNavigate }: HomeProps) {
  const [plots, setPlots] = useState<Plot[]>([]);

  useEffect(() => {
    setPlots(getPlots());
  }, []);

  const totals = useMemo(() => {
    return plots.reduce(
      (acc, plot) => {
        acc.characters += plot.characters.length;
        acc.episodes += plot.episodes.length;
        return acc;
      },
      { characters: 0, episodes: 0 }
    );
  }, [plots]);

  const scrollToStories = () => {
    const section = document.getElementById('story-archives');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      return;
    }
    onNavigate('home');
  };

  return (
    <div className="relative z-10 overflow-hidden">
      <section className="relative mx-auto max-w-7xl px-4 pb-20 pt-10 md:pb-24 md:pt-14">
        <div className="pointer-events-none absolute left-[-6rem] top-16 h-60 w-60 rounded-full bg-story-accent/20 blur-[90px]" />
        <div className="pointer-events-none absolute right-[-8rem] top-24 h-72 w-72 rounded-full bg-orange-400/20 blur-[110px]" />
        <div className="pointer-events-none absolute inset-x-4 top-4 h-[520px] rounded-[2.2rem] border border-white/10 bg-white/[0.03]" />

        <div className="relative grid items-start gap-7 lg:grid-cols-[1.08fr_0.92fr]">
          <div className="story-reveal space-y-8 px-2 py-6 md:px-6 md:py-10">
            <Badge color="green">Collaborative AI Storytelling</Badge>
            <h1 className="font-verse-display text-4xl leading-tight text-white md:text-6xl">
              <span className="block">Build a world.</span>
              <span className="block">Add characters.</span>
              <span className="block">Stories unfold.</span>
            </h1>
            <p className="max-w-2xl text-lg text-slate-200/90">
              A collaborative, episodic story platform where anyone can add AI characters to a living plot.
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => onNavigate('create')}
                className="inline-flex items-center gap-2 rounded-full border border-story-accent/50 bg-story-accent/20 px-6 py-3 text-sm font-semibold tracking-wide text-white transition duration-300 hover:-translate-y-0.5 hover:bg-story-accent/30 hover:shadow-[0_12px_30px_rgba(76,247,255,0.2)]"
              >
                <Plus size={16} />
                Create a Plot
              </button>
              <button
                onClick={scrollToStories}
                className="inline-flex items-center gap-2 rounded-full border border-white/25 bg-black/25 px-6 py-3 text-sm font-semibold tracking-wide text-slate-100 transition duration-300 hover:-translate-y-0.5 hover:border-story-accent/60 hover:text-story-accent"
              >
                Explore Stories
                <ArrowRight size={16} />
              </button>
            </div>

            <div className="grid gap-3 pt-2 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Universes</p>
                <p className="mt-1 text-2xl font-bold text-white">{plots.length}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Characters</p>
                <p className="mt-1 text-2xl font-bold text-white">{totals.characters}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 backdrop-blur">
                <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Episodes</p>
                <p className="mt-1 text-2xl font-bold text-white">{totals.episodes}</p>
              </div>
            </div>
          </div>

          <aside className="story-reveal story-reveal-delay relative px-2 lg:px-0">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/15 bg-[linear-gradient(150deg,rgba(9,18,35,0.9),rgba(4,8,18,0.9))] p-7 backdrop-blur-xl md:p-8">
              <div className="pointer-events-none absolute -right-12 top-[-2.5rem] h-40 w-40 rounded-full bg-story-accent/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-14 left-[-1.5rem] h-44 w-44 rounded-full bg-orange-300/20 blur-3xl" />

              <p className="text-xs uppercase tracking-[0.26em] text-story-accent/90">StoryVerse Navigator</p>
              <h2 className="font-verse-display mt-4 text-3xl leading-tight text-white">
                A living world engine for episodic stories
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-slate-300">
                Be the Director: create the world first, invite characters from anyone, and watch episodes evolve every day.
              </p>

              <div className="mt-7 space-y-3">
                {NAVIGATOR_FLOW.map((step, index) => (
                  <div
                    key={step.title}
                    className="relative rounded-2xl border border-white/12 bg-black/24 px-4 py-3"
                  >
                    <div className="mb-1 inline-flex items-center gap-2 text-xs uppercase tracking-[0.2em] text-story-accent">
                      <span className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-story-accent/50 bg-story-accent/15 text-[10px]">
                        {index + 1}
                      </span>
                      {step.title}
                    </div>
                    <p className="text-sm leading-relaxed text-slate-200/90">{step.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </section>

      <section id="story-archives" className="mx-auto max-w-7xl space-y-8 px-4 pb-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">Archive</p>
            <h2 className="font-verse-display text-3xl text-white md:text-4xl">
              Recent Stories
            </h2>
            <p className="mt-1 text-slate-300">Explore universes created by the community</p>
          </div>
          <button
            onClick={() => onNavigate('create')}
            className="inline-flex items-center gap-2 rounded-full border border-story-accent/55 bg-story-accent/20 px-5 py-2.5 text-sm font-semibold tracking-wide text-white transition duration-300 hover:-translate-y-0.5 hover:bg-story-accent/32 hover:shadow-[0_12px_28px_rgba(76,247,255,0.2)]"
          >
            <Plus size={18} />
            Create New Plot
          </button>
        </div>

        {plots.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-white/20 bg-black/25 py-20 text-center">
            <Sparkles className="mx-auto mb-4 text-story-accent" size={48} />
            <h2 className="text-xl font-semibold text-white">No Stories Yet</h2>
            <p className="mt-2 text-slate-400">Be the first Director to launch a universe.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
            {plots.map((plot, index) => (
              <article
                key={plot.id}
                className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-white/12 bg-[linear-gradient(155deg,rgba(14,28,53,0.8),rgba(5,10,22,0.9))] p-5 backdrop-blur-md transition duration-300 hover:-translate-y-1 hover:border-story-accent/65 hover:shadow-[0_22px_58px_rgba(76,247,255,0.18)]"
                style={{ animationDelay: `${0.08 * index}s` }}
              >
                <div className="pointer-events-none absolute -right-8 top-[-2.5rem] h-32 w-32 rounded-full bg-story-accent/18 blur-3xl opacity-60 transition-opacity duration-500 group-hover:opacity-100" />
                <button
                  onClick={() => onNavigate('detail', { id: plot.id })}
                  className="flex flex-1 flex-col text-left"
                >
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <Badge color="purple">{plot.genre}</Badge>
                    <span className="text-xs text-slate-400">{formatDate(plot.createdAt)}</span>
                  </div>
                  <h3 className="text-xl font-bold text-white transition-colors group-hover:text-story-accent">
                    {plot.title}
                  </h3>
                  <p className="mb-4 mt-3 text-sm leading-relaxed text-slate-300 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3] overflow-hidden">
                    {plot.objective}
                  </p>
                </button>

                <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-4">
                  <div className="flex items-center gap-4 text-sm text-slate-300">
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{plot.characters.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen size={14} />
                      <span>{plot.episodes.length} Eps</span>
                    </div>
                  </div>
                  <button
                    onClick={() => onNavigate('detail', { id: plot.id })}
                    className="inline-flex items-center gap-1 rounded-full border border-white/20 bg-black/25 px-3 py-1.5 text-xs font-semibold uppercase tracking-widest text-slate-100 transition duration-300 hover:border-story-accent/60 hover:text-story-accent"
                  >
                    Read
                    <Play size={12} />
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
