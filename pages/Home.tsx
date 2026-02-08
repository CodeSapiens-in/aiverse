import React, { useEffect, useRef, useState } from 'react';
import { Plot } from '../types';
import { getPlots } from '../services/storageService';
import { Card, Button, Badge } from '../components/UI';
import { BookOpen, Users, Play, Plus, Sparkles, Globe2, Theater } from 'lucide-react';

interface HomeProps {
  onNavigate: (route: string, params?: any) => void;
}

export default function Home({ onNavigate }: HomeProps) {
  const [plots, setPlots] = useState<Plot[]>([]);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    setPlots(getPlots());
  }, []);

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    if (!context) return;

    const stars = Array.from({ length: 140 }, () => ({
      x: Math.random(),
      y: Math.random(),
      radius: Math.random() * 1.4 + 0.4,
      speed: Math.random() * 0.15 + 0.05,
      alpha: Math.random() * 0.4 + 0.3,
    }));

    const resize = () => {
      if (!canvasRef.current) return;
      const { clientWidth, clientHeight } = canvasRef.current.parentElement || {
        clientWidth: window.innerWidth,
        clientHeight: window.innerHeight,
      };
      const ratio = window.devicePixelRatio || 1;
      canvas.width = clientWidth * ratio;
      canvas.height = clientHeight * ratio;
      canvas.style.width = `${clientWidth}px`;
      canvas.style.height = `${clientHeight}px`;
      context.setTransform(ratio, 0, 0, ratio, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    let frameId = 0;
    const animate = () => {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      context.clearRect(0, 0, width, height);

      stars.forEach(star => {
        star.y -= star.speed / 200;
        if (star.y < 0) {
          star.y = 1;
          star.x = Math.random();
        }
        const x = star.x * width;
        const y = star.y * height;
        context.beginPath();
        context.fillStyle = `rgba(159, 122, 234, ${star.alpha})`;
        context.arc(x, y, star.radius, 0, Math.PI * 2);
        context.fill();
      });
      frameId = requestAnimationFrame(animate);
    };
    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-10 space-y-20">
      <section className="space-y-6">
        <Badge color="green">Collaborative AI Storytelling</Badge>
        <h1 className="text-4xl md:text-6xl font-bold leading-tight text-white">
          <span className="block">Build a world.</span>
          <span className="block">Add characters.</span>
          <span className="block">Stories unfold.</span>
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl">
          A collaborative, episodic story platform where anyone can add AI characters to a living plot.
        </p>
        <div className="flex flex-wrap gap-4">
          <Button onClick={() => onNavigate('create')}>
            👉 Create a Plot
          </Button>
          <Button variant="outline" onClick={() => onNavigate('home')}>
            Explore Stories
          </Button>
        </div>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <Card className="space-y-4">
          <div className="flex items-center gap-3 text-white">
            <Globe2 className="text-story-accent" size={22} />
            <h3 className="text-xl font-semibold">🧠 Step 1 — Create a Plot</h3>
          </div>
          <ul className="text-gray-300 text-sm space-y-2">
            <li>Choose a genre and setting</li>
            <li>Define the rules of the world</li>
            <li>Start with a few characters</li>
          </ul>
          <p className="text-sm text-gray-400">📌 You set the universe. The AI brings it to life.</p>
        </Card>
        <Card className="space-y-4">
          <div className="flex items-center gap-3 text-white">
            <Theater className="text-story-accent" size={22} />
            <h3 className="text-xl font-semibold">🎭 Step 2 — Add Characters</h3>
          </div>
          <ul className="text-gray-300 text-sm space-y-2">
            <li>Add your own AI character</li>
            <li>Define personality, goals, and secrets</li>
            <li>Characters enter the story and start interacting</li>
          </ul>
          <p className="text-sm text-gray-400">📌 Every character has a mind of its own.</p>
        </Card>
        <Card className="space-y-4">
          <div className="flex items-center gap-3 text-white">
            <BookOpen className="text-story-accent" size={22} />
            <h3 className="text-xl font-semibold">📖 Step 3 — Episodes Unfold</h3>
          </div>
          <ul className="text-gray-300 text-sm space-y-2">
            <li>AI generates episodes using all characters</li>
            <li>New characters change the plot</li>
            <li>The story grows day by day</li>
          </ul>
          <p className="text-sm text-gray-400">📌 No two stories are ever the same.</p>
        </Card>
      </section>

      <section className="text-center">
        <Card className="inline-block px-8 py-6">
          <p className="text-lg md:text-xl text-white">
            “What happens when 10 AI characters with hidden agendas share the same world?”
          </p>
        </Card>
      </section>

      <section className="space-y-8">
        <div className="flex flex-wrap justify-between items-center gap-4">
          <div>
            <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              Recent Stories
            </h2>
            <p className="text-gray-400 mt-1">Explore universes created by the community</p>
          </div>
          <Button onClick={() => onNavigate('create')}>
            <Plus size={18} />
            Create New Plot
          </Button>
        </div>

        {plots.length === 0 ? (
          <div className="text-center py-20 bg-story-800/30 rounded-2xl border border-story-700 border-dashed">
            <Sparkles className="mx-auto text-story-accent mb-4" size={48} />
            <h2 className="text-xl font-semibold mb-2">No Stories Yet</h2>
            <p className="text-gray-400">Be the first Director to launch a universe.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {plots.map(plot => (
              <Card key={plot.id} className="hover:border-story-accent transition-colors group cursor-pointer h-full flex flex-col">
                <div onClick={() => onNavigate('detail', { id: plot.id })} className="flex-1">
                  <div className="flex justify-between items-start mb-4">
                    <Badge color="purple">{plot.genre}</Badge>
                    <span className="text-xs text-gray-500">{new Date(plot.createdAt).toLocaleDateString()}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2 group-hover:text-story-accent transition-colors">{plot.title}</h3>
                  <p className="text-gray-400 text-sm line-clamp-3 mb-4">{plot.objective}</p>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-story-700 mt-auto">
                  <div className="flex items-center gap-4 text-sm text-gray-400">
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{plot.characters.length}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen size={14} />
                      <span>{plot.episodes.length} Eps</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="!px-2 !py-1"
                    onClick={(e: any) => {
                      e.stopPropagation();
                      onNavigate('detail', { id: plot.id });
                    }}
                  >
                    Read <Play size={14} className="ml-1" />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
