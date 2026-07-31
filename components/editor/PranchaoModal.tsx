'use client';

import { useEditorStore } from '@/lib/store/useEditorStore';
import { getFixtureDef } from '@/lib/fixtures/fixtureLibrary';
import { SymbolIcon } from './SymbolIcon';
import { XIcon, SunIcon, MoonIcon, ZapIcon } from 'lucide-react';
import { useState } from 'react';

export function PranchaoModal() {
  const { pranchaoMode, togglePranchaoMode, elements, technicalSeal, getTotalWattage } = useEditorStore();
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  if (!pranchaoMode) return null;

  const totalWatts = getTotalWattage();
  const activeFixtures = elements.filter(
    (el) => el.category !== 'architecture' && el.category !== 'annotation' && el.visible
  );

  // Group by fixture type
  const fixtureGroups = new Map<string, typeof activeFixtures>();
  activeFixtures.forEach((el) => {
    const list = fixtureGroups.get(el.type) || [];
    list.push(el);
    fixtureGroups.set(el.type, list);
  });

  return (
    <div
      className={`fixed inset-0 z-50 overflow-y-auto p-4 md:p-8 flex flex-col transition-colors ${
        theme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-700/50">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-black tracking-tight">{technicalSeal.show || 'Sem Título'}</h1>
            <span className="px-2.5 py-1 text-xs font-bold bg-afina-600 text-white rounded-full">
              Modo Pranchão (Tablet)
            </span>
          </div>
          <p className="text-xs opacity-60 mt-1">
            {technicalSeal.venue || 'Teatro / Espaço'} · {technicalSeal.designer || 'Iluminador'} · Data: {technicalSeal.date}
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Theme switcher */}
          <div className="flex bg-slate-800 p-1 rounded-xl border border-slate-700">
            <button
              onClick={() => setTheme('dark')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                theme === 'dark' ? 'bg-slate-700 text-white shadow' : 'text-slate-400'
              }`}
            >
              <MoonIcon size={14} /> Escuro
            </button>
            <button
              onClick={() => setTheme('light')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors ${
                theme === 'light' ? 'bg-white text-slate-900 shadow' : 'text-slate-400'
              }`}
            >
              <SunIcon size={14} /> Claro
            </button>
          </div>

          <button
            onClick={togglePranchaoMode}
            className="p-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 border border-red-500/30 text-xs font-bold flex items-center gap-1.5 transition-colors"
          >
            <XIcon size={16} /> Sair do Pranchão
          </button>
        </div>
      </div>

      {/* Summary Bar */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-afina-500/20 text-afina-400 flex items-center justify-center font-bold text-xl">
            {activeFixtures.length}
          </div>
          <div>
            <div className="text-xs opacity-50 uppercase tracking-wider font-semibold">Total de Refletores</div>
            <div className="text-lg font-extrabold">{activeFixtures.length} equipamentos no mapa</div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
            <ZapIcon size={24} />
          </div>
          <div>
            <div className="text-xs opacity-50 uppercase tracking-wider font-semibold">Carga Elétrica Total</div>
            <div className="text-lg font-extrabold font-mono text-amber-400">
              {totalWatts}W · {(totalWatts / 220).toFixed(1)}A @ 220V
            </div>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-xl">
            {fixtureGroups.size}
          </div>
          <div>
            <div className="text-xs opacity-50 uppercase tracking-wider font-semibold">Tipos de Equipamentos</div>
            <div className="text-lg font-extrabold">{fixtureGroups.size} tipos cadastrados</div>
          </div>
        </div>
      </div>

      {/* Equipment List Grid */}
      <div className="space-y-6 flex-1">
        {[...fixtureGroups.entries()].map(([type, list]) => {
          const def = getFixtureDef(type as any);
          const totalW = list.reduce((s, e) => s + (e.wattage || 0), 0);

          return (
            <div
              key={type}
              className="p-5 rounded-2xl border bg-slate-900/40 border-slate-800 space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <SymbolIcon type={type as any} colorHex={def?.colorHex || '#facc15'} size={24} />
                  <div>
                    <h2 className="text-lg font-bold">{def?.description || type}</h2>
                    <p className="text-xs opacity-50 font-mono">{def?.defaultWattage || 0}W por unidade</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="px-3 py-1 bg-afina-500/20 text-afina-300 font-mono font-bold rounded-lg text-sm border border-afina-500/30">
                    ×{list.length} unidades
                  </span>
                  <span className="font-mono text-xs opacity-60">{totalW}W total</span>
                </div>
              </div>

              {/* Items grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                {list.map((el, idx) => (
                  <div
                    key={el.id}
                    className="p-3 rounded-xl bg-slate-800/80 border border-slate-700/80 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs font-bold text-afina-400">#{idx + 1}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-700 text-slate-300 font-mono">
                        {el.gelatin || 'NC'}
                      </span>
                    </div>
                    <div className="text-sm font-bold truncate mb-1" title={el.label || el.customName}>
                      {el.customName || el.label || `Canal ${idx + 1}`}
                    </div>
                    {el.dmx && (
                      <div className="text-xs font-mono opacity-60">
                        U{el.dmx.universe} : Addr {el.dmx.address}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
