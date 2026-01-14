import React, { useState, useMemo, useEffect, useCallback } from 'react';

// ============== DATA ==============
const schedule = [
  { id: 0, date: "Jan 16", dateObj: new Date(2026, 0, 16), game: "Kansas", away: true, site: "Away", win: 22.7, conf: true, quad: 1, oppRank: 4, oppRecord: "14-2", kenpom: 3, tv: "ESPN", time: "8:00 PM" },
  { id: 1, date: "Jan 20", dateObj: new Date(2026, 0, 20), game: "Texas Tech", away: false, site: "Home", win: 51.8, conf: true, quad: 2, oppRank: 28, oppRecord: "12-4", kenpom: 25, tv: "ESPN2", time: "7:00 PM" },
  { id: 2, date: "Jan 24", dateObj: new Date(2026, 0, 24), game: "TCU", away: false, site: "Home", win: 72.5, conf: true, quad: 3, oppRank: 67, oppRecord: "10-6", kenpom: 62, tv: "ESPN+", time: "2:00 PM" },
  { id: 3, date: "Jan 28", dateObj: new Date(2026, 0, 28), game: "Cincinnati", away: true, site: "Away", win: 47.1, conf: true, quad: 2, oppRank: 35, oppRecord: "11-5", kenpom: 31, tv: "ESPN2", time: "9:00 PM" },
  { id: 4, date: "Jan 31", dateObj: new Date(2026, 0, 31), game: "West Virginia", away: true, site: "Away", win: 40.5, conf: true, quad: 2, oppRank: 42, oppRecord: "10-6", kenpom: 38, tv: "CBS", time: "12:00 PM" },
  { id: 5, date: "Feb 4", dateObj: new Date(2026, 1, 4), game: "Colorado", away: false, site: "Home", win: 84.2, conf: true, quad: 3, oppRank: 78, oppRecord: "9-7", kenpom: 72, tv: "ESPN+", time: "7:00 PM" },
  { id: 6, date: "Feb 7", dateObj: new Date(2026, 1, 7), game: "Iowa State", away: true, site: "Away", win: 14.0, conf: true, quad: 1, oppRank: 2, oppRecord: "15-1", kenpom: 1, tv: "FOX", time: "4:00 PM" },
  { id: 7, date: "Feb 10", dateObj: new Date(2026, 1, 10), game: "BYU", away: false, site: "Home", win: 38.0, conf: true, quad: 2, oppRank: 22, oppRecord: "13-4", kenpom: 19, tv: "ESPN", time: "8:00 PM" },
  { id: 8, date: "Feb 14", dateObj: new Date(2026, 1, 14), game: "Louisville", away: false, site: "Neutral", win: 22.7, conf: false, quad: 1, oppRank: 18, oppRecord: "13-4", kenpom: 15, tv: "CBS", time: "3:30 PM" },
  { id: 9, date: "Feb 17", dateObj: new Date(2026, 1, 17), game: "Kansas State", away: true, site: "Away", win: 52.8, conf: true, quad: 2, oppRank: 32, oppRecord: "11-5", kenpom: 29, tv: "ESPN2", time: "7:00 PM" },
  { id: 10, date: "Feb 21", dateObj: new Date(2026, 1, 21), game: "Arizona State", away: false, site: "Home", win: 87.2, conf: true, quad: 4, oppRank: 95, oppRecord: "8-8", kenpom: 88, tv: "ESPN+", time: "1:00 PM" },
  { id: 11, date: "Feb 24", dateObj: new Date(2026, 1, 24), game: "Arizona", away: false, site: "Home", win: 24.4, conf: true, quad: 1, oppRank: 12, oppRecord: "13-4", kenpom: 10, tv: "ESPN", time: "9:00 PM" },
  { id: 12, date: "Feb 28", dateObj: new Date(2026, 1, 28), game: "UCF", away: true, site: "Away", win: 48.4, conf: true, quad: 2, oppRank: 38, oppRecord: "11-5", kenpom: 35, tv: "CBS", time: "12:00 PM" },
  { id: 13, date: "Mar 4", dateObj: new Date(2026, 2, 4), game: "Houston", away: true, site: "Away", win: 11.1, conf: true, quad: 1, oppRank: 1, oppRecord: "16-1", kenpom: 2, tv: "ESPN", time: "8:00 PM" },
  { id: 14, date: "Mar 7", dateObj: new Date(2026, 2, 7), game: "Utah", away: false, site: "Home", win: 87.8, conf: true, quad: 4, oppRank: 102, oppRecord: "7-9", kenpom: 96, tv: "ESPN+", time: "2:00 PM" },
];

const bidChances = [2, 2, 2, 2, 2, 2, 18, 62.8, 79.5, 93, 98, 98, 98, 98, 98, 98];
const seedMapping = [
  { minWins: 26, seed: 1 }, { minWins: 24, seed: 2 }, { minWins: 22, seed: 3 },
  { minWins: 21, seed: 4 }, { minWins: 20, seed: 5 }, { minWins: 19, seed: 6 },
  { minWins: 18, seed: 7 }, { minWins: 17, seed: 8 }, { minWins: 16, seed: 10 },
  { minWins: 15, seed: 11 }, { minWins: 14, seed: 12 }, { minWins: 0, seed: null },
];

const scenarioPresets = {
  realistic: {},
  optimistic: { 0: 1, 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 9: 1, 10: 1, 12: 1, 14: 1 },
  pessimistic: { 0: 0, 6: 0, 7: 0, 8: 0, 11: 0, 13: 0 },
  sweepHome: { 1: 1, 2: 1, 5: 1, 7: 1, 10: 1, 11: 1, 14: 1 },
  roadWarrior: { 0: 1, 3: 1, 4: 1, 6: 1, 9: 1, 12: 1, 13: 1 },
  chaos: { 0: 1, 6: 1, 8: 1, 11: 1, 13: 1, 2: 0, 5: 0, 10: 0, 14: 0 },
};

// ============== UTILITIES ==============
function calculateDistribution(games, overrides) {
  let dist = [1];
  games.forEach((g, i) => {
    const p = overrides[i] !== undefined ? overrides[i] : g.win / 100;
    const newDist = new Array(dist.length + 1).fill(0);
    dist.forEach((prob, wins) => {
      newDist[wins] += prob * (1 - p);
      newDist[wins + 1] += prob * p;
    });
    dist = newDist;
  });
  return dist;
}

function runMonteCarloSimulation(games, overrides, iterations = 10000) {
  const results = new Array(16).fill(0);
  for (let i = 0; i < iterations; i++) {
    let wins = 0;
    games.forEach((g, idx) => {
      const p = overrides[idx] !== undefined ? overrides[idx] : g.win / 100;
      if (Math.random() < p) wins++;
    });
    results[wins]++;
  }
  return results.map(r => r / iterations);
}

function getSeed(totalWins) {
  for (const { minWins, seed } of seedMapping) {
    if (totalWins >= minWins) return seed;
  }
  return null;
}

function findPathToTournament(games, overrides, targetWins = 8) {
  const unlockedGames = games.filter((_, i) => overrides[i] === undefined);
  const lockedWins = Object.values(overrides).filter(v => v === 1).length;
  const neededWins = targetWins - lockedWins;
  
  if (neededWins <= 0) return { achieved: true, path: [] };
  if (neededWins > unlockedGames.length) return { achieved: false, path: [] };
  
  const sortedByProb = [...unlockedGames].sort((a, b) => b.win - a.win);
  const path = sortedByProb.slice(0, neededWins);
  const probability = path.reduce((p, g) => p * (g.win / 100), 1);
  
  return { achieved: true, path, probability, neededWins };
}

// ============== COMPONENTS ==============

// Animated Number
function AnimatedNumber({ value, decimals = 1, suffix = '', className = '' }) {
  const [display, setDisplay] = useState(value);
  
  useEffect(() => {
    const diff = value - display;
    if (Math.abs(diff) < 0.01) {
      setDisplay(value);
      return;
    }
    const timer = setTimeout(() => {
      setDisplay(prev => prev + diff * 0.2);
    }, 16);
    return () => clearTimeout(timer);
  }, [value, display]);
  
  return <span className={className}>{display.toFixed(decimals)}{suffix}</span>;
}

// Confetti
function Confetti({ active }) {
  if (!active) return null;
  return (
    <div className="fixed inset-0 pointer-events-none z-50 overflow-hidden">
      {[...Array(60)].map((_, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: `${Math.random() * 100}%`,
            top: '-20px',
            width: `${8 + Math.random() * 8}px`,
            height: `${8 + Math.random() * 8}px`,
            backgroundColor: ['#22c55e', '#eab308', '#3b82f6', '#ec4899', '#8b5cf6', '#06b6d4'][Math.floor(Math.random() * 6)],
            borderRadius: Math.random() > 0.5 ? '50%' : '2px',
            animation: `confetti ${2.5 + Math.random() * 2}s ease-out forwards`,
            animationDelay: `${Math.random() * 1.5}s`,
          }}
        />
      ))}
      <style>{`
        @keyframes confetti {
          0% { transform: translateY(0) rotate(0deg) scale(1); opacity: 1; }
          100% { transform: translateY(100vh) rotate(${360 + Math.random() * 360}deg) scale(0.5); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// Tournament Gauge with Seed
function TournamentGauge({ probability, expectedWins }) {
  const angle = (probability / 100) * 180 - 90;
  const totalWins = 11 + expectedWins;
  const projectedSeed = getSeed(Math.round(totalWins));
  
  const getColor = (p) => {
    if (p >= 70) return '#22c55e';
    if (p >= 50) return '#eab308';
    if (p >= 30) return '#f97316';
    return '#ef4444';
  };
  
  return (
    <div className="flex flex-col items-center">
      <svg viewBox="0 0 200 130" className="w-64 h-36">
        <defs>
          <linearGradient id="gaugeGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="33%" stopColor="#f97316" />
            <stop offset="66%" stopColor="#eab308" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="4" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="shadow">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.5"/>
          </filter>
        </defs>
        
        {/* Background arc */}
        <path d="M 20 105 A 80 80 0 0 1 180 105" fill="none" stroke="#1e293b" strokeWidth="20" strokeLinecap="round"/>
        
        {/* Colored arc */}
        <path d="M 20 105 A 80 80 0 0 1 180 105" fill="none" stroke="url(#gaugeGrad)" strokeWidth="14" strokeLinecap="round" filter="url(#shadow)"/>
        
        {/* Tick marks and labels */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const tickAngle = (tick / 100) * 180 - 90;
          const x1 = 100 + 66 * Math.cos((tickAngle * Math.PI) / 180);
          const y1 = 105 + 66 * Math.sin((tickAngle * Math.PI) / 180);
          const x2 = 100 + 74 * Math.cos((tickAngle * Math.PI) / 180);
          const y2 = 105 + 74 * Math.sin((tickAngle * Math.PI) / 180);
          const labelX = 100 + 58 * Math.cos((tickAngle * Math.PI) / 180);
          const labelY = 105 + 58 * Math.sin((tickAngle * Math.PI) / 180);
          return (
            <g key={tick}>
              <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#64748b" strokeWidth="2"/>
              <text x={labelX} y={labelY} textAnchor="middle" dominantBaseline="middle" fill="#64748b" fontSize="8">{tick}</text>
            </g>
          );
        })}
        
        {/* Needle */}
        <g filter="url(#glow)" style={{ transition: 'transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)', transformOrigin: '100px 105px', transform: `rotate(${angle}deg)` }}>
          <polygon points="100,50 96,105 104,105" fill={getColor(probability)}/>
        </g>
        
        {/* Center circle */}
        <circle cx="100" cy="105" r="12" fill={getColor(probability)} filter="url(#shadow)"/>
        <circle cx="100" cy="105" r="6" fill="#0f172a"/>
      </svg>
      
      <div className="text-5xl font-bold mt-1" style={{ color: getColor(probability) }}>
        <AnimatedNumber value={probability} suffix="%" />
      </div>
      <div className="text-slate-400 text-sm">Tournament Probability</div>
      
      {projectedSeed && (
        <div className="mt-3 flex items-center gap-2">
          <span className="text-slate-500 text-sm">Projected Seed:</span>
          <span className={`px-3 py-1 rounded-full font-bold text-lg
            ${projectedSeed <= 4 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
              projectedSeed <= 8 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/40' :
              'bg-amber-500/20 text-amber-400 border border-amber-500/40'}`}>
            #{projectedSeed}
          </span>
        </div>
      )}
    </div>
  );
}

// Win Distribution with Monte Carlo overlay
function WinDistributionChart({ distribution, monteCarloData }) {
  const maxProb = Math.max(...distribution, ...monteCarloData);
  
  return (
    <div className="relative">
      <div className="flex items-end justify-center gap-1 h-40 px-2">
        {distribution.map((prob, wins) => {
          const height = maxProb > 0 ? (prob / maxProb) * 100 : 0;
          const mcHeight = maxProb > 0 ? (monteCarloData[wins] / maxProb) * 100 : 0;
          const finalRecord = `${11 + wins}-${20 - wins}`;
          const color = wins < 6 ? '#ef4444' : wins < 8 ? '#f97316' : wins < 10 ? '#eab308' : '#22c55e';
          
          return (
            <div key={wins} className="flex flex-col items-center group relative">
              <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-all duration-200 text-xs font-medium whitespace-nowrap z-20 bg-slate-900/95 backdrop-blur px-2 py-1.5 rounded-lg border border-slate-600 shadow-xl">
                <div className="font-bold">{finalRecord}</div>
                <div className="text-slate-400">Exact: {(prob * 100).toFixed(2)}%</div>
                <div className="text-slate-400">MC: {(monteCarloData[wins] * 100).toFixed(2)}%</div>
              </div>
              <div className="relative w-5">
                {/* Monte Carlo bar (behind) */}
                <div
                  className="absolute bottom-0 w-full rounded-t opacity-30"
                  style={{ height: `${Math.max(mcHeight, 2)}%`, backgroundColor: color }}
                />
                {/* Exact probability bar */}
                <div
                  className="relative w-full rounded-t transition-all duration-500 cursor-pointer hover:brightness-110"
                  style={{
                    height: `${Math.max(height, 2)}%`,
                    backgroundColor: color,
                    boxShadow: prob === Math.max(...distribution) ? `0 0 15px ${color}80` : 'none',
                  }}
                />
              </div>
              <div className="text-xs text-slate-500 mt-1.5 font-mono">{wins}</div>
            </div>
          );
        })}
      </div>
      <div className="flex justify-center gap-4 mt-3 text-xs">
        <span className="flex items-center gap-1.5 text-slate-400">
          <span className="w-3 h-3 rounded bg-slate-400"/> Exact
        </span>
        <span className="flex items-center gap-1.5 text-slate-500">
          <span className="w-3 h-3 rounded bg-slate-400 opacity-30"/> Monte Carlo
        </span>
      </div>
    </div>
  );
}

// Seed Projection Chart
function SeedProjectionChart({ distribution }) {
  const seedProbs = {};
  distribution.forEach((prob, wins) => {
    const totalWins = 11 + wins;
    const seed = getSeed(totalWins);
    if (seed) {
      seedProbs[seed] = (seedProbs[seed] || 0) + prob;
    }
  });
  
  const seeds = Object.entries(seedProbs).sort((a, b) => Number(a[0]) - Number(b[0]));
  const maxProb = Math.max(...Object.values(seedProbs));
  
  return (
    <div className="space-y-2">
      {seeds.map(([seed, prob]) => (
        <div key={seed} className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-sm shrink-0
            ${Number(seed) <= 4 ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
              Number(seed) <= 8 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
              'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
            #{seed}
          </div>
          <div className="flex-1">
            <div className="h-6 bg-slate-700/50 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-700 flex items-center justify-end pr-2
                  ${Number(seed) <= 4 ? 'bg-gradient-to-r from-emerald-600 to-emerald-500' :
                    Number(seed) <= 8 ? 'bg-gradient-to-r from-blue-600 to-blue-500' :
                    'bg-gradient-to-r from-amber-600 to-amber-500'}`}
                style={{ width: `${Math.max((prob / maxProb) * 100, 15)}%` }}
              >
                <span className="text-xs font-bold text-white drop-shadow">{(prob * 100).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Path to Tournament
function PathToTournament({ games, overrides }) {
  const pathTo8 = findPathToTournament(games, overrides, 8);
  const pathTo9 = findPathToTournament(games, overrides, 9);
  
  const renderPath = (path, targetWins, label) => {
    if (path.achieved && path.path.length === 0) {
      return (
        <div className="p-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30">
          <div className="flex items-center gap-2">
            <span className="text-emerald-400 text-lg">✓</span>
            <span className="text-emerald-400 font-medium">{label} already achieved!</span>
          </div>
        </div>
      );
    }
    
    if (!path.achieved) {
      return (
        <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30">
          <div className="flex items-center gap-2">
            <span className="text-red-400 text-lg">✗</span>
            <span className="text-red-400 font-medium">{label} impossible with current locks</span>
          </div>
        </div>
      );
    }
    
    return (
      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50">
        <div className="flex items-center justify-between mb-2">
          <span className="font-medium">{label}</span>
          <span className="text-xs text-slate-400">Win {path.neededWins} of {games.filter((_, i) => overrides[i] === undefined).length} unlocked</span>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {path.path.map((g, i) => (
            <span key={i} className="px-2 py-1 rounded bg-slate-700 text-xs">
              {g.away ? '@' : 'vs'} {g.game} <span className="text-emerald-400">({g.win}%)</span>
            </span>
          ))}
        </div>
        <div className="mt-2 text-xs text-slate-400">
          Combined probability: <span className="text-white font-mono">{(path.probability * 100).toFixed(2)}%</span>
        </div>
      </div>
    );
  };
  
  return (
    <div className="space-y-3">
      {renderPath(pathTo9, 9, "20 wins (safe bid)")}
      {renderPath(pathTo8, 8, "19 wins (likely bid)")}
    </div>
  );
}

// Strength of Schedule
function StrengthOfSchedule({ games }) {
  const avgKenpom = games.reduce((sum, g) => sum + g.kenpom, 0) / games.length;
  const avgRank = games.reduce((sum, g) => sum + g.oppRank, 0) / games.length;
  const q1Count = games.filter(g => g.quad === 1).length;
  const homeGames = games.filter(g => !g.away && g.site !== 'Neutral').length;
  const awayGames = games.filter(g => g.away).length;
  
  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
        <div className="text-2xl font-bold text-blue-400">{avgKenpom.toFixed(0)}</div>
        <div className="text-xs text-slate-400">Avg KenPom</div>
      </div>
      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
        <div className="text-2xl font-bold text-purple-400">#{avgRank.toFixed(0)}</div>
        <div className="text-xs text-slate-400">Avg NET Rank</div>
      </div>
      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
        <div className="text-2xl font-bold text-amber-400">{q1Count}</div>
        <div className="text-xs text-slate-400">Q1 Games</div>
      </div>
      <div className="p-3 rounded-lg bg-slate-800/50 border border-slate-700/50 text-center">
        <div className="text-2xl font-bold">
          <span className="text-emerald-400">{homeGames}</span>
          <span className="text-slate-500">/</span>
          <span className="text-red-400">{awayGames}</span>
        </div>
        <div className="text-xs text-slate-400">Home/Away</div>
      </div>
    </div>
  );
}

// Scenario Comparison
function ScenarioComparison({ baseOverrides, compareOverrides, games }) {
  const baseDist = calculateDistribution(games, baseOverrides);
  const compareDist = calculateDistribution(games, compareOverrides);
  
  const baseExpected = baseDist.reduce((sum, p, i) => sum + p * i, 0);
  const compareExpected = compareDist.reduce((sum, p, i) => sum + p * i, 0);
  
  const baseTournament = baseDist.reduce((sum, p, i) => sum + p * bidChances[i], 0);
  const compareTournament = compareDist.reduce((sum, p, i) => sum + p * bidChances[i], 0);
  
  const diff = compareTournament - baseTournament;
  
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-3 gap-2 text-center text-sm">
        <div className="p-2 rounded bg-slate-800/50">
          <div className="text-slate-400 text-xs mb-1">Base</div>
          <div className="font-bold text-lg">{baseTournament.toFixed(1)}%</div>
          <div className="text-slate-500 text-xs">{baseExpected.toFixed(1)} exp wins</div>
        </div>
        <div className="p-2 rounded bg-slate-700/50 flex items-center justify-center">
          <span className={`text-2xl font-bold ${diff > 0 ? 'text-emerald-400' : diff < 0 ? 'text-red-400' : 'text-slate-400'}`}>
            {diff > 0 ? '+' : ''}{diff.toFixed(1)}%
          </span>
        </div>
        <div className="p-2 rounded bg-slate-800/50">
          <div className="text-slate-400 text-xs mb-1">Compare</div>
          <div className="font-bold text-lg">{compareTournament.toFixed(1)}%</div>
          <div className="text-slate-500 text-xs">{compareExpected.toFixed(1)} exp wins</div>
        </div>
      </div>
    </div>
  );
}

// Timeline View
function TimelineView({ games, overrides, onToggle }) {
  const today = new Date(2026, 0, 14);
  
  return (
    <div className="relative">
      {/* Timeline line */}
      <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-slate-600 via-slate-700 to-slate-800"/>
      
      <div className="space-y-3">
        {games.map((game, idx) => {
          const override = overrides[idx];
          const isPast = game.dateObj < today;
          const isToday = game.dateObj.toDateString() === today.toDateString();
          const bucket = game.win >= 70 ? 'emerald' : game.win >= 40 ? 'yellow' : 'red';
          
          return (
            <div key={idx} className={`relative flex items-start gap-4 pl-4 ${isPast ? 'opacity-50' : ''}`}>
              {/* Timeline dot */}
              <div className={`absolute left-4 w-5 h-5 rounded-full border-2 z-10 flex items-center justify-center
                ${override === 1 ? 'bg-emerald-500 border-emerald-400' :
                  override === 0 ? 'bg-red-500 border-red-400' :
                  isToday ? 'bg-blue-500 border-blue-400 animate-pulse' :
                  'bg-slate-700 border-slate-600'}`}>
                {override === 1 && <span className="text-xs">✓</span>}
                {override === 0 && <span className="text-xs">✗</span>}
              </div>
              
              {/* Content */}
              <div className={`flex-1 ml-6 p-3 rounded-xl border transition-all
                ${override !== undefined ? 
                  override === 1 ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-red-500/10 border-red-500/30' :
                  'bg-slate-800/50 border-slate-700/50 hover:border-slate-600'}`}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-slate-400 text-xs font-mono">{game.date}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400 text-xs">{game.time}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-500 text-xs">{game.tv}</span>
                    </div>
                    <div className="font-semibold mt-1">
                      {game.away ? '@ ' : 'vs '}{game.game}
                      <span className="text-slate-500 text-sm ml-2">#{game.oppRank}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      {game.quad === 1 && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30">Q1</span>
                      )}
                      {game.conf && (
                        <span className="text-xs px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">BIG 12</span>
                      )}
                      <span className={`text-xs px-1.5 py-0.5 rounded border
                        ${bucket === 'emerald' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                          bucket === 'yellow' ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30' :
                          'bg-red-500/10 text-red-400 border-red-500/30'}`}>
                        {game.win}%
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex gap-1" onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => onToggle(idx, override === 1 ? undefined : 1)}
                      className={`w-9 h-9 rounded-lg font-bold transition-all
                        ${override === 1 ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-slate-700 text-slate-400 hover:bg-emerald-500/30 hover:text-emerald-400'}`}
                    >
                      W
                    </button>
                    <button
                      onClick={() => onToggle(idx, override === 0 ? undefined : 0)}
                      className={`w-9 h-9 rounded-lg font-bold transition-all
                        ${override === 0 ? 'bg-red-500 text-white shadow-lg shadow-red-500/30' : 'bg-slate-700 text-slate-400 hover:bg-red-500/30 hover:text-red-400'}`}
                    >
                      L
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Game Card for Calendar
function GameCard({ game, override, onToggle, index }) {
  const bucket = game.win >= 70 ? 'emerald' : game.win >= 40 ? 'yellow' : 'red';
  
  return (
    <div
      onClick={() => {
        if (override === undefined) onToggle(index, 1);
        else if (override === 1) onToggle(index, 0);
        else onToggle(index, undefined);
      }}
      className={`relative p-3 rounded-xl cursor-pointer transition-all hover:scale-102 border group
        ${override !== undefined 
          ? override === 1 
            ? 'bg-emerald-500/15 border-emerald-500/40 shadow-lg shadow-emerald-500/10' 
            : 'bg-red-500/15 border-red-500/40 shadow-lg shadow-red-500/10'
          : 'bg-slate-800/50 border-slate-700/50 hover:border-slate-600 hover:bg-slate-800'}`}
    >
      <div className="flex items-start justify-between">
        <div className="text-xs text-slate-400 font-mono">{game.date.split(' ')[1]}</div>
        {override !== undefined && (
          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold
            ${override === 1 ? 'bg-emerald-500' : 'bg-red-500'}`}>
            {override === 1 ? 'W' : 'L'}
          </div>
        )}
      </div>
      
      <div className="mt-1 font-semibold truncate" title={game.game}>
        {game.away ? '@' : 'vs'} {game.game}
      </div>
      
      <div className="flex items-center gap-1.5 mt-2 flex-wrap">
        <span className={`text-xs font-mono px-1.5 py-0.5 rounded
          ${bucket === 'emerald' ? 'bg-emerald-500/20 text-emerald-400' :
            bucket === 'yellow' ? 'bg-yellow-500/20 text-yellow-400' :
            'bg-red-500/20 text-red-400'}`}>
          {game.win}%
        </span>
        {game.quad === 1 && (
          <span className="text-xs px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">Q1</span>
        )}
      </div>
      
      <div className="text-xs text-slate-500 mt-2">
        {game.tv} • {game.time}
      </div>
    </div>
  );
}

// Calendar Grid
function CalendarGrid({ games, overrides, onToggle }) {
  const months = [
    { name: 'January 2026', games: games.filter(g => g.date.startsWith('Jan')) },
    { name: 'February 2026', games: games.filter(g => g.date.startsWith('Feb')) },
    { name: 'March 2026', games: games.filter(g => g.date.startsWith('Mar')) },
  ];
  
  return (
    <div className="space-y-6">
      {months.map(month => (
        <div key={month.name}>
          <h3 className="text-lg font-semibold mb-3 text-slate-300">{month.name}</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {month.games.map((game) => (
              <GameCard
                key={game.id}
                game={game}
                override={overrides[game.id]}
                onToggle={onToggle}
                index={game.id}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// Quick Stats Bar
function QuickStatsBar({ distribution, expectedWins, overrides }) {
  const tournamentProb = distribution.reduce((sum, p, i) => sum + p * bidChances[i], 0);
  const lockedWins = Object.values(overrides).filter(v => v === 1).length;
  const lockedLosses = Object.values(overrides).filter(v => v === 0).length;
  
  return (
    <div className="flex items-center gap-4 p-3 bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-x-auto">
      <div className="flex items-center gap-2 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-emerald-500/20 flex items-center justify-center">
          <span className="text-emerald-400 text-sm">📊</span>
        </div>
        <div>
          <div className="text-xs text-slate-400">Tournament</div>
          <div className="font-bold text-emerald-400"><AnimatedNumber value={tournamentProb} suffix="%" /></div>
        </div>
      </div>
      
      <div className="w-px h-8 bg-slate-700 shrink-0"/>
      
      <div className="flex items-center gap-2 shrink-0">
        <div>
          <div className="text-xs text-slate-400">Expected</div>
          <div className="font-bold">{(11 + expectedWins).toFixed(0)}-{(20 - expectedWins).toFixed(0)}</div>
        </div>
      </div>
      
      <div className="w-px h-8 bg-slate-700 shrink-0"/>
      
      <div className="flex items-center gap-2 shrink-0">
        <div>
          <div className="text-xs text-slate-400">Scenario</div>
          <div className="font-bold">
            <span className="text-emerald-400">{lockedWins}W</span>
            <span className="text-slate-500">-</span>
            <span className="text-red-400">{lockedLosses}L</span>
          </div>
        </div>
      </div>
      
      <div className="w-px h-8 bg-slate-700 shrink-0"/>
      
      <div className="flex items-center gap-2 shrink-0">
        <div>
          <div className="text-xs text-slate-400">Unlocked</div>
          <div className="font-bold text-slate-300">{15 - lockedWins - lockedLosses} games</div>
        </div>
      </div>
    </div>
  );
}

// ============== MAIN DASHBOARD ==============
export default function BaylorDashboard() {
  const [overrides, setOverrides] = useState({});
  const [compareOverrides, setCompareOverrides] = useState(null);
  const [activeTab, setActiveTab] = useState('timeline');
  const [showConfetti, setShowConfetti] = useState(false);
  const [search, setSearch] = useState('');
  
  const handleToggle = useCallback((index, value) => {
    setOverrides(prev => {
      const next = { ...prev };
      if (value === undefined) delete next[index];
      else next[index] = value;
      return next;
    });
  }, []);
  
  const applyPreset = (presetName) => {
    setOverrides(scenarioPresets[presetName] || {});
  };
  
  const distribution = useMemo(() => calculateDistribution(schedule, overrides), [overrides]);
  const monteCarloData = useMemo(() => runMonteCarloSimulation(schedule, overrides, 10000), [overrides]);
  
  const expectedWins = useMemo(() => distribution.reduce((sum, p, i) => sum + p * i, 0), [distribution]);
  const tournamentProb = useMemo(() => distribution.reduce((sum, p, i) => sum + p * bidChances[i], 0), [distribution]);
  
  // Confetti trigger
  useEffect(() => {
    if (tournamentProb >= 90) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 4000);
      return () => clearTimeout(timer);
    }
  }, [tournamentProb >= 90]);
  
  const filteredSchedule = schedule.filter(g => 
    !search || (g.date + g.game + g.site + g.tv).toLowerCase().includes(search.toLowerCase())
  );
  
  const tabs = [
    { id: 'timeline', label: 'Timeline', icon: '📅' },
    { id: 'calendar', label: 'Calendar', icon: '🗓️' },
    { id: 'analytics', label: 'Analytics', icon: '📊' },
    { id: 'paths', label: 'Paths', icon: '🎯' },
  ];

  return (
    <div className="min-h-screen bg-[#0a0e14] text-slate-100">
      <Confetti active={showConfetti} />
      
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-emerald-950/20 via-transparent to-blue-950/20 pointer-events-none"/>
      
      <div className="relative max-w-7xl mx-auto p-4 md:p-6">
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 via-green-600 to-yellow-500 flex items-center justify-center font-black text-2xl shadow-2xl shadow-green-500/30 border border-green-400/30">
              BU
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-green-400 via-emerald-400 to-yellow-400 bg-clip-text text-transparent">
                Baylor Bears
              </h1>
              <p className="text-slate-400">2025-26 NCAA Tournament Projections</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3 flex-wrap">
            <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-sm">
              <span className="text-slate-400">Record:</span> <span className="font-bold">11-5</span>
            </div>
            <div className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-sm">
              <span className="text-slate-400">ESPN:</span> <span className="font-mono text-xs">Jan 14, 2026</span>
            </div>
          </div>
        </div>
        
        {/* Quick Stats Bar */}
        <QuickStatsBar distribution={distribution} expectedWins={expectedWins} overrides={overrides} />
        
        {/* Scenario Presets */}
        <div className="flex flex-wrap items-center gap-2 mt-4 mb-4">
          <span className="text-slate-500 text-sm">Scenarios:</span>
          {[
            { id: 'realistic', label: 'Reset', emoji: '↺' },
            { id: 'optimistic', label: 'Best Case', emoji: '🔥' },
            { id: 'pessimistic', label: 'Worst Case', emoji: '😰' },
            { id: 'sweepHome', label: 'Home Sweep', emoji: '🏠' },
            { id: 'roadWarrior', label: 'Road Warrior', emoji: '🚗' },
            { id: 'chaos', label: 'Chaos', emoji: '🎲' },
          ].map(preset => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset.id)}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 text-sm transition-all hover:scale-105 active:scale-95"
            >
              {preset.emoji} {preset.label}
            </button>
          ))}
          
          <div className="ml-auto">
            <input
              type="search"
              placeholder="Search games..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700 text-sm w-40 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50"
            />
          </div>
        </div>
        
        {/* Tabs */}
        <div className="flex gap-1 mb-4 bg-slate-800/50 p-1 rounded-xl w-fit border border-slate-700/50">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all
                ${activeTab === tab.id 
                  ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg shadow-emerald-500/30' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>
        
        {/* Main Grid */}
        <div className="grid lg:grid-cols-3 gap-4">
          {/* Left Panel - Main Content */}
          <div className="lg:col-span-2 space-y-4">
            {activeTab === 'timeline' && (
              <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-4 backdrop-blur">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Season Timeline</h2>
                  <span className="text-xs text-slate-400">Click W/L to simulate</span>
                </div>
                <div className="max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                  <TimelineView games={filteredSchedule} overrides={overrides} onToggle={handleToggle} />
                </div>
              </div>
            )}
            
            {activeTab === 'calendar' && (
              <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-4 backdrop-blur">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-xl font-bold">Calendar View</h2>
                  <span className="text-xs text-slate-400">Click to cycle: → W → L → reset</span>
                </div>
                <CalendarGrid games={filteredSchedule} overrides={overrides} onToggle={handleToggle} />
              </div>
            )}
            
            {activeTab === 'analytics' && (
              <div className="space-y-4">
                <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-4 backdrop-blur">
                  <h2 className="text-xl font-bold mb-4">Win Distribution</h2>
                  <p className="text-slate-400 text-sm mb-4">Exact calculation vs Monte Carlo simulation (10,000 iterations)</p>
                  <WinDistributionChart distribution={distribution} monteCarloData={monteCarloData} />
                </div>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-4 backdrop-blur">
                    <h2 className="text-lg font-bold mb-4">Seed Projections</h2>
                    <SeedProjectionChart distribution={distribution} />
                  </div>
                  
                  <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-4 backdrop-blur">
                    <h2 className="text-lg font-bold mb-4">Strength of Schedule</h2>
                    <StrengthOfSchedule games={schedule} />
                  </div>
                </div>
                
                {compareOverrides && (
                  <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-4 backdrop-blur">
                    <h2 className="text-lg font-bold mb-4">Scenario Comparison</h2>
                    <ScenarioComparison baseOverrides={overrides} compareOverrides={compareOverrides} games={schedule} />
                  </div>
                )}
              </div>
            )}
            
            {activeTab === 'paths' && (
              <div className="space-y-4">
                <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-4 backdrop-blur">
                  <h2 className="text-xl font-bold mb-2">Path to the Tournament</h2>
                  <p className="text-slate-400 text-sm mb-4">Optimal remaining games to secure a bid</p>
                  <PathToTournament games={schedule} overrides={overrides} />
                </div>
                
                <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-4 backdrop-blur">
                  <h2 className="text-lg font-bold mb-4">Outcome Probabilities</h2>
                  <div className="space-y-4">
                    {[
                      { label: '≥21 wins (Lock)', range: [10, 16], color: 'emerald' },
                      { label: '19-20 wins (Likely)', range: [8, 10], color: 'blue' },
                      { label: '17-18 wins (Bubble)', range: [6, 8], color: 'yellow' },
                      { label: '≤16 wins (Miss)', range: [0, 6], color: 'red' },
                    ].map(({ label, range, color }) => {
                      const prob = distribution.slice(range[0], range[1]).reduce((a, b) => a + b, 0);
                      return (
                        <div key={label}>
                          <div className="flex justify-between mb-1.5">
                            <span className={`text-${color}-400 font-medium`}>{label}</span>
                            <span className="font-mono">{(prob * 100).toFixed(1)}%</span>
                          </div>
                          <div className="h-3 bg-slate-700/50 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full transition-all duration-700 bg-gradient-to-r 
                                ${color === 'emerald' ? 'from-emerald-600 to-emerald-400' :
                                  color === 'blue' ? 'from-blue-600 to-blue-400' :
                                  color === 'yellow' ? 'from-yellow-600 to-yellow-400' :
                                  'from-red-600 to-red-400'}`}
                              style={{ width: `${prob * 100}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                
                <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-4 backdrop-blur">
                  <h2 className="text-lg font-bold mb-4">Key Games Impact</h2>
                  <div className="space-y-2">
                    {schedule
                      .filter(g => g.quad === 1)
                      .map(game => {
                        const withWin = { ...overrides, [game.id]: 1 };
                        const withLoss = { ...overrides, [game.id]: 0 };
                        const winDist = calculateDistribution(schedule, withWin);
                        const lossDist = calculateDistribution(schedule, withLoss);
                        const winProb = winDist.reduce((s, p, i) => s + p * bidChances[i], 0);
                        const lossProb = lossDist.reduce((s, p, i) => s + p * bidChances[i], 0);
                        const swing = winProb - lossProb;
                        
                        return (
                          <div key={game.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/50">
                            <div>
                              <span className="font-medium">{game.away ? '@' : 'vs'} {game.game}</span>
                              <span className="text-slate-500 text-xs ml-2">#{game.oppRank}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                              <span className="text-emerald-400">W: {winProb.toFixed(0)}%</span>
                              <span className="text-red-400">L: {lossProb.toFixed(0)}%</span>
                              <span className={`font-bold ${swing > 15 ? 'text-amber-400' : 'text-slate-400'}`}>
                                Δ{swing.toFixed(0)}%
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Tournament Gauge */}
            <div className="bg-gradient-to-br from-slate-900/80 to-slate-800/50 rounded-2xl border border-slate-700/50 p-5 backdrop-blur">
              <h2 className="font-bold text-center mb-2 text-lg">NCAA Tournament</h2>
              <TournamentGauge probability={tournamentProb} expectedWins={expectedWins} />
            </div>
            
            {/* Mini Distribution */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-4 backdrop-blur">
              <h2 className="font-bold mb-3">Win Distribution</h2>
              <div className="flex items-end justify-center gap-0.5 h-20">
                {distribution.map((prob, wins) => {
                  const maxP = Math.max(...distribution);
                  const height = maxP > 0 ? (prob / maxP) * 100 : 0;
                  const color = wins < 6 ? '#ef4444' : wins < 8 ? '#f97316' : wins < 10 ? '#eab308' : '#22c55e';
                  return (
                    <div
                      key={wins}
                      className="w-3 rounded-t transition-all duration-300"
                      style={{ height: `${Math.max(height, 3)}%`, backgroundColor: color }}
                      title={`${wins} wins: ${(prob * 100).toFixed(1)}%`}
                    />
                  );
                })}
              </div>
              <div className="flex justify-between text-xs text-slate-500 mt-1">
                <span>0</span>
                <span>15</span>
              </div>
            </div>
            
            {/* Toughest Remaining */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-4 backdrop-blur">
              <h2 className="font-bold mb-3">Toughest Games</h2>
              <div className="space-y-2">
                {schedule
                  .filter(g => overrides[g.id] === undefined)
                  .sort((a, b) => a.win - b.win)
                  .slice(0, 5)
                  .map(game => (
                    <div key={game.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30 text-sm">
                      <div>
                        <span>{game.away ? '@' : 'vs'} {game.game}</span>
                        <span className="text-slate-500 text-xs ml-1">#{game.oppRank}</span>
                      </div>
                      <span className="font-mono text-red-400">{game.win}%</span>
                    </div>
                  ))}
              </div>
            </div>
            
            {/* Best Opportunities */}
            <div className="bg-slate-900/50 rounded-2xl border border-slate-700/50 p-4 backdrop-blur">
              <h2 className="font-bold mb-3">Best Opportunities</h2>
              <div className="space-y-2">
                {schedule
                  .filter(g => overrides[g.id] === undefined)
                  .sort((a, b) => b.win - a.win)
                  .slice(0, 5)
                  .map(game => (
                    <div key={game.id} className="flex items-center justify-between p-2 rounded-lg bg-slate-800/30 text-sm">
                      <div>
                        <span>{game.away ? '@' : 'vs'} {game.game}</span>
                      </div>
                      <span className="font-mono text-emerald-400">{game.win}%</span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="mt-8 text-center text-slate-500 text-xs pb-6">
          <p>Data: ESPN Matchup Predictor (Jan 14, 2026) | Seed projections are estimates based on historical patterns</p>
          <p className="mt-1">Monte Carlo simulation: 10,000 iterations | Not affiliated with Baylor University</p>
        </div>
      </div>
      
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #475569; }
      `}</style>
    </div>
  );
}
