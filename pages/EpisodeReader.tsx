import { useState, useEffect, useRef } from 'react';
import { Plot, Episode } from '../types';
import { getPlot } from '../services/storageService';
import { Button, Badge } from '../components/UI';
import { ArrowLeft, ArrowRight, BookText, Sparkles, X } from 'lucide-react';

interface EpisodeReaderProps {
  plotId: string;
  episodeId: string;
  onNavigate: (route: string, params?: any) => void;
}

export default function EpisodeReader({ plotId, episodeId, onNavigate }: EpisodeReaderProps) {
  const [plot, setPlot] = useState<Plot | undefined>(undefined);
  const [episode, setEpisode] = useState<Episode | undefined>(undefined);

  useEffect(() => {
    const p = getPlot(plotId);
    setPlot(p);
    if (p) {
      setEpisode(p.episodes.find(e => e.id === episodeId));
    }
  }, [plotId, episodeId]);

  if (!plot || !episode) return <div>Loading...</div>;

  const getGenreTheme = (genre: string) => {
    const g = genre.toLowerCase();
    if (g.includes('fantasy') || g.includes('myth') || g.includes('folklore') || g.includes('epic')) {
      return {
        accent: '#9af8ff',
        accentSoft: 'rgba(154,248,255,0.2)',
        accentWarm: '#ffd39f',
        panel: 'rgba(9,19,40,0.82)',
      };
    }
    if (g.includes('comedy') || g.includes('satire') || g.includes('slice of life')) {
      return {
        accent: '#8cf7d6',
        accentSoft: 'rgba(140,247,214,0.2)',
        accentWarm: '#ffd57b',
        panel: 'rgba(8,24,35,0.82)',
      };
    }
    if (g.includes('horror') || g.includes('noir') || g.includes('thriller')) {
      return {
        accent: '#9fb6ff',
        accentSoft: 'rgba(159,182,255,0.2)',
        accentWarm: '#ff9f9f',
        panel: 'rgba(11,13,29,0.86)',
      };
    }
    if (g.includes('romance') || g.includes('drama')) {
      return {
        accent: '#ffb5cf',
        accentSoft: 'rgba(255,181,207,0.2)',
        accentWarm: '#ffd9a8',
        panel: 'rgba(25,12,28,0.82)',
      };
    }
    return {
      accent: '#8feeff',
      accentSoft: 'rgba(143,238,255,0.2)',
      accentWarm: '#ffcb97',
      panel: 'rgba(8,18,36,0.82)',
    };
  };

  const theme = getGenreTheme(plot.genre);
  const currentIndex = plot.episodes.findIndex(e => e.id === episode.id);
  const prevEp = plot.episodes[currentIndex - 1];
  const nextEp = plot.episodes[currentIndex + 1];

  return (
    <div
      className="min-h-screen pb-24"
      style={{
        background: `radial-gradient(circle at 14% 14%, ${theme.accentSoft}, transparent 35%), radial-gradient(circle at 86% 12%, rgba(255,170,120,0.12), transparent 32%), linear-gradient(165deg, #030711 8%, #08101f 54%, #040915 100%)`,
      }}
    >
      {/* Navigation Bar */}
      <div className="sticky top-0 z-50 flex items-center justify-between border-b border-white/12 bg-[#030915]/75 p-4 backdrop-blur-xl">
        <Button variant="ghost" onClick={() => onNavigate('detail', { id: plotId })}>
          <X size={20} /> Close
        </Button>
        <div className="text-center">
          <h2 className="text-xs uppercase tracking-[0.24em] text-slate-400">{plot.title}</h2>
          <h1 className="text-sm font-semibold text-slate-200">Episode {episode.episodeNumber}</h1>
        </div>
        <div className="w-24"></div> {/* Spacer */}
      </div>

      {/* Content */}
      <div className="mx-auto max-w-3xl px-4 py-10 md:px-6 md:py-14">
        <div
          className="overflow-hidden rounded-[2rem] border border-white/12 p-6 md:p-8"
          style={{ background: `linear-gradient(155deg, ${theme.panel}, rgba(4,10,22,0.9))` }}
        >
          <div className="mb-6 flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[11px] uppercase tracking-[0.24em] text-slate-300">
              <BookText size={13} />
              Story Reading
            </div>
            <span
              className="rounded-full border px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em]"
              style={{ color: theme.accent, borderColor: theme.accent }}
            >
              {plot.genre}
            </span>
          </div>

          <h1 className="story-reader-title mb-7 text-center text-3xl md:text-5xl" style={{ color: theme.accent }}>
            {episode.title}
          </h1>

          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {episode.charactersUsed.map(c => (
              <Badge key={c} color="blue">{c}</Badge>
            ))}
          </div>

          <div className="story-reader-body whitespace-pre-line text-slate-100">
            {episode.content}
          </div>

          <div className="mt-12 border-t border-white/12 pt-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.2em]" style={{ color: theme.accentWarm }}>
              <Sparkles size={15} />
              Episode Summary
            </h3>
            <ul className="space-y-2 text-sm leading-relaxed text-slate-300">
              {episode.summary.map((s, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="mt-[7px] h-1.5 w-1.5 rounded-full" style={{ backgroundColor: theme.accentWarm }} />
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Nav */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-white/10 bg-[#040b17]/80 p-4 backdrop-blur-xl">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          {prevEp ? (
            <Button variant="secondary" onClick={() => onNavigate('reader', { plotId: plot.id, episodeId: prevEp.id })}>
              <ArrowLeft size={16} /> Prev
            </Button>
          ) : <div />}

          {nextEp ? (
            <Button variant="primary" onClick={() => onNavigate('reader', { plotId: plot.id, episodeId: nextEp.id })}>
              Next Episode <ArrowRight size={16} />
            </Button>
          ) : (
            <span className="text-sm text-slate-400">To be continued...</span>
          )}
        </div>
      </div>
    </div>
  );
}
