import { Suspense, lazy, useState } from 'react';
import Home from './pages/Home';
import CreatePlot from './pages/CreatePlot';
import PlotDetail from './pages/PlotDetail';
import EpisodeReader from './pages/EpisodeReader';
import { Book } from 'lucide-react';

type Route = 'home' | 'create' | 'detail' | 'reader';
const AnimatedBackground = lazy(() => import('./components/AnimatedBackground'));

export default function App() {
  const [route, setRoute] = useState<Route>('home');
  const [params, setParams] = useState<any>({});
  const isHomeRoute = route === 'home';

  const navigate = (newRoute: string, newParams?: any) => {
    window.scrollTo(0, 0);
    setRoute(newRoute as Route);
    if (newParams) setParams(newParams);
  };

  const renderPage = () => {
    switch (route) {
      case 'home':
        return <Home onNavigate={navigate} />;
      case 'create':
        return <CreatePlot onNavigate={navigate} />;
      case 'detail':
        return <PlotDetail id={params.id} onNavigate={navigate} />;
      case 'reader':
        return <EpisodeReader plotId={params.plotId} episodeId={params.episodeId} onNavigate={navigate} />;
      default:
        return <Home onNavigate={navigate} />;
    }
  };

  return (
    <div className="min-h-screen text-slate-100 selection:bg-story-accent selection:text-slate-950">
      {isHomeRoute ? (
        <Suspense
          fallback={
            <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_16%,rgba(76,247,255,0.16),transparent_46%),radial-gradient(circle_at_85%_12%,rgba(255,159,95,0.12),transparent_40%),linear-gradient(160deg,#030711_8%,#08101f_55%,#040915_100%)]" />
          }
        >
          <AnimatedBackground />
        </Suspense>
      ) : (
        <div className="pointer-events-none fixed inset-0 -z-10 bg-[radial-gradient(circle_at_15%_16%,rgba(76,247,255,0.08),transparent_44%),radial-gradient(circle_at_85%_12%,rgba(255,159,95,0.08),transparent_35%),linear-gradient(160deg,#030711_8%,#08101f_55%,#040915_100%)]" />
      )}
      {route !== 'reader' && (
        <header className="neon-divider sticky top-0 z-40 border-b border-white/10 bg-[#040912]/65 backdrop-blur-xl">
          <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
            <div
              className="group flex cursor-pointer items-center gap-3 text-xl font-bold transition-colors hover:text-story-accent"
              onClick={() => navigate('home')}
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-story-accent/50 bg-story-accent/20 shadow-[0_8px_24px_rgba(76,247,255,0.24)] transition group-hover:scale-105">
                <Book size={18} className="text-white" />
              </div>
              <span className="font-verse-display text-lg tracking-[0.08em]">StoryVerse</span>
            </div>

            <div className="hidden text-xs uppercase tracking-[0.22em] text-slate-400 md:block">Collaborative AI Worldbuilding</div>
          </div>
        </header>
      )}

      <main className="relative z-10">
        {renderPage()}
      </main>

      {route !== 'reader' && (
        <footer className="relative z-10 mt-16 border-t border-white/10 bg-[#030711]/50 py-7 text-center text-xs tracking-wide text-slate-400">
          <p>© {new Date().getFullYear()} StoryVerse. Copyrighted by Codesapiens.</p>
        </footer>
      )}
    </div>
  );
}
