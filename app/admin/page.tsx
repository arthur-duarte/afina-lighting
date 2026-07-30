'use client';

import { useState } from 'react';
import { FIXTURE_LIBRARY } from '@/lib/fixtures/fixtureLibrary';
import {
  ShieldIcon, PlusCircleIcon, PackageIcon, ZapIcon,
  EditIcon, TrashIcon, SearchIcon, SaveIcon,
} from 'lucide-react';
import type { FixtureDefinition } from '@/lib/fixtures/fixtureLibrary';
import type { FixtureCategory, FixtureType } from '@/lib/types';

// ── ADMIN AUTH GATE ─────────────────────────────────────────
// In production, protect this with NextAuth session check or env var middleware.
const ADMIN_UNLOCKED = process.env.NEXT_PUBLIC_ADMIN_ENABLED === 'true';

// ── METRIC CARD ─────────────────────────────────────────────
function MetricCard({ label, value, sub, color }: {
  label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="bg-[#18181f] border border-[#2a2a38] rounded-xl p-4">
      <div className={`text-2xl font-bold mb-1 ${color}`}>{value}</div>
      <div className="text-sm font-medium text-white/70">{label}</div>
      {sub && <div className="text-xs text-white/30 mt-0.5">{sub}</div>}
    </div>
  );
}

// ── FIXTURE ROW ─────────────────────────────────────────────
function FixtureRow({ fixture, onEdit }: {
  fixture: FixtureDefinition;
  onEdit: (f: FixtureDefinition) => void;
}) {
  return (
    <tr className="border-b border-[#2a2a38] hover:bg-[#1a1a24] transition-colors">
      <td className="px-4 py-3">
        <div
          className="w-3 h-3 rounded-full border border-white/10 inline-block mr-2"
          style={{ backgroundColor: fixture.colorHex }}
        />
        <span className="font-mono text-xs text-white/50">{fixture.type}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-lg">{fixture.icon}</span>
          <div>
            <div className="text-sm font-medium text-white">{fixture.label}</div>
            <div className="text-xs text-white/40">{fixture.description}</div>
          </div>
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${
          fixture.category === 'conventional' ? 'bg-yellow-950 text-yellow-300' :
          fixture.category === 'led' ? 'bg-blue-950 text-blue-300' :
          fixture.category === 'moving' ? 'bg-purple-950 text-purple-300' :
          fixture.category === 'vintage' ? 'bg-orange-950 text-orange-300' :
          fixture.category === 'effect' ? 'bg-green-950 text-green-300' :
          'bg-gray-900 text-gray-400'
        }`}>
          {fixture.category}
        </span>
      </td>
      <td className="px-4 py-3 font-mono text-sm text-yellow-400">{fixture.defaultWattage}W</td>
      <td className="px-4 py-3 font-mono text-sm text-blue-400">{fixture.defaultDmxFootprint} ch</td>
      <td className="px-4 py-3">
        {fixture.shortcut && (
          <span className="font-mono text-[10px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-white/50">
            {fixture.shortcut}
          </span>
        )}
      </td>
      <td className="px-4 py-3">
        <button
          onClick={() => onEdit(fixture)}
          className="p-1.5 rounded text-white/40 hover:text-white hover:bg-white/5 transition-colors"
        >
          <EditIcon size={13} />
        </button>
      </td>
    </tr>
  );
}

// ── NEW FIXTURE FORM ─────────────────────────────────────────
function AddFixtureForm({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({
    type: '',
    label: '',
    category: 'conventional' as FixtureCategory,
    wattage: 1000,
    dmxFootprint: 1,
    colorHex: '#facc15',
    icon: '🔦',
    description: '',
  });

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-[#18181f] border border-[#2a2a38] rounded-2xl p-6 w-full max-w-lg shadow-2xl">
        <h3 className="text-lg font-bold text-white mb-5 flex items-center gap-2">
          <PlusCircleIcon size={18} className="text-purple-400" />
          Novo Equipamento
        </h3>

        <div className="grid grid-cols-2 gap-3 mb-3">
          <div>
            <label className="text-xs text-white/40 mb-1 block">Tipo (ID único)</label>
            <input
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full bg-[#0f0f13] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white font-mono outline-none focus:border-purple-500"
              placeholder="ex: meu_refletor"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Nome de Exibição</label>
            <input
              value={form.label}
              onChange={(e) => setForm({ ...form, label: e.target.value })}
              className="w-full bg-[#0f0f13] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
              placeholder="ex: Meu Refletor Especial"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Categoria</label>
            <select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as FixtureCategory })}
              className="w-full bg-[#0f0f13] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
            >
              {['conventional', 'led', 'moving', 'vintage', 'effect', 'rigging'].map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Ícone (emoji)</label>
            <input
              value={form.icon}
              onChange={(e) => setForm({ ...form, icon: e.target.value })}
              className="w-full bg-[#0f0f13] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
              placeholder="🔦"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Wattagem (W)</label>
            <input
              type="number"
              value={form.wattage}
              onChange={(e) => setForm({ ...form, wattage: Number(e.target.value) })}
              className="w-full bg-[#0f0f13] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white font-mono outline-none focus:border-purple-500"
            />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Canais DMX</label>
            <input
              type="number"
              value={form.dmxFootprint}
              onChange={(e) => setForm({ ...form, dmxFootprint: Number(e.target.value) })}
              className="w-full bg-[#0f0f13] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white font-mono outline-none focus:border-purple-500"
              min={0}
              max={64}
            />
          </div>
          <div>
            <label className="text-xs text-white/40 mb-1 block">Cor no Canvas</label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={form.colorHex}
                onChange={(e) => setForm({ ...form, colorHex: e.target.value })}
                className="w-10 h-9 rounded cursor-pointer bg-transparent border-0"
              />
              <input
                value={form.colorHex}
                onChange={(e) => setForm({ ...form, colorHex: e.target.value })}
                className="flex-1 bg-[#0f0f13] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white font-mono outline-none focus:border-purple-500"
              />
            </div>
          </div>
        </div>

        <div className="mb-4">
          <label className="text-xs text-white/40 mb-1 block">Descrição</label>
          <input
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full bg-[#0f0f13] border border-[#2a2a38] rounded-lg px-3 py-2 text-sm text-white outline-none focus:border-purple-500"
            placeholder="Descrição técnica do equipamento"
          />
        </div>

        <div className="flex gap-3">
          <button
            onClick={() => {
              // In a real app, this would call an API to persist the fixture
              alert(`Fixture "${form.label}" criado! (Integração com API necessária para persistência global)`);
              onClose();
            }}
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-xl font-medium transition-colors"
          >
            <SaveIcon size={14} />
            Criar Equipamento
          </button>
          <button
            onClick={onClose}
            className="px-4 py-2.5 border border-[#2a2a38] text-white/50 hover:text-white rounded-xl text-sm transition-colors"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ADMIN PAGE ───────────────────────────────────────────────
export default function AdminPage() {
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [editingFixture, setEditingFixture] = useState<FixtureDefinition | null>(null);

  // Simple client-side protection
  const [unlocked, setUnlocked] = useState(ADMIN_UNLOCKED);
  const [pw, setPw] = useState('');

  if (!unlocked) {
    return (
      <div className="min-h-screen bg-[#0f0f13] flex items-center justify-center">
        <div className="bg-[#18181f] border border-[#2a2a38] rounded-2xl p-8 w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-2xl bg-purple-900 flex items-center justify-center mx-auto mb-4">
            <ShieldIcon size={28} className="text-purple-400" />
          </div>
          <h2 className="text-xl font-bold text-white mb-2">Área Restrita</h2>
          <p className="text-sm text-white/40 mb-6">Painel SuperAdmin — Afina v2.0</p>
          <input
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && pw === (process.env.NEXT_PUBLIC_ADMIN_KEY || 'afina-admin')) {
                setUnlocked(true);
              }
            }}
            placeholder="Senha de acesso"
            className="w-full bg-[#0f0f13] border border-[#2a2a38] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500 mb-3"
          />
          <button
            onClick={() => {
              if (pw === (process.env.NEXT_PUBLIC_ADMIN_KEY || 'afina-admin')) setUnlocked(true);
              else alert('Senha incorreta.');
            }}
            className="w-full py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-medium transition-colors"
          >
            Entrar
          </button>
        </div>
      </div>
    );
  }

  const filtered = FIXTURE_LIBRARY.filter((f) => {
    const matchSearch = search === '' ||
      f.label.toLowerCase().includes(search.toLowerCase()) ||
      f.type.toLowerCase().includes(search.toLowerCase());
    const matchCat = filterCat === 'all' || f.category === filterCat;
    return matchSearch && matchCat;
  });

  const categories = [...new Set(FIXTURE_LIBRARY.map((f) => f.category))];
  const totalWatts = FIXTURE_LIBRARY.reduce((s, f) => s + f.defaultWattage, 0);

  return (
    <div className="min-h-screen bg-[#0f0f13] text-white">
      {/* Header */}
      <header className="border-b border-[#2a2a38] bg-[#18181f] px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-purple-600 flex items-center justify-center">
            <ShieldIcon size={18} className="text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-white leading-tight">Afina — SuperAdmin</h1>
            <p className="text-xs text-white/40">Gerenciamento da Biblioteca Global de Equipamentos</p>
          </div>
          <div className="ml-auto">
            <a
              href="/editor"
              className="flex items-center gap-2 px-4 py-2 border border-[#2a2a38] text-white/60 hover:text-white rounded-xl text-sm transition-colors"
            >
              ← Voltar ao Editor
            </a>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-8 py-8">
        {/* Metrics */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <MetricCard
            label="Total de Equipamentos"
            value={FIXTURE_LIBRARY.length}
            sub="na biblioteca global"
            color="text-purple-400"
          />
          <MetricCard
            label="Categorias"
            value={categories.length}
            sub="tipos de equipamento"
            color="text-blue-400"
          />
          <MetricCard
            label="Potência Máx. (todos)"
            value={`${(totalWatts / 1000).toFixed(1)} kW`}
            sub="soma de todas as wattagens padrão"
            color="text-yellow-400"
          />
          <MetricCard
            label="Com DMX"
            value={FIXTURE_LIBRARY.filter((f) => f.defaultDmxFootprint > 0).length}
            sub="equipamentos endereçáveis"
            color="text-green-400"
          />
        </div>

        {/* Table controls */}
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-sm">
            <SearchIcon size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Buscar equipamento..."
              className="w-full bg-[#18181f] border border-[#2a2a38] rounded-xl pl-9 pr-4 py-2.5 text-sm text-white outline-none focus:border-purple-500"
            />
          </div>
          <select
            value={filterCat}
            onChange={(e) => setFilterCat(e.target.value)}
            className="bg-[#18181f] border border-[#2a2a38] rounded-xl px-3 py-2.5 text-sm text-white outline-none focus:border-purple-500"
          >
            <option value="all">Todas as categorias</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-500 text-white text-sm rounded-xl font-medium transition-colors ml-auto"
          >
            <PlusCircleIcon size={14} />
            Novo Equipamento
          </button>
        </div>

        {/* Fixture Table */}
        <div className="bg-[#18181f] border border-[#2a2a38] rounded-2xl overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-[#2a2a38] bg-[#13131a]">
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-white/30">ID / Tipo</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-white/30">Equipamento</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-white/30">Categoria</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-white/30">Wattagem</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-white/30">DMX</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-white/30">Atalho</th>
                <th className="px-4 py-3 text-xs font-bold uppercase tracking-wider text-white/30"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((fixture) => (
                <FixtureRow
                  key={fixture.type}
                  fixture={fixture}
                  onEdit={setEditingFixture}
                />
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-white/30 text-sm">
                    Nenhum equipamento encontrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer */}
        <p className="text-center text-xs text-white/20 mt-8">
          Afina v2.0 — Biblioteca Global de Equipamentos Cênicos ·{' '}
          {FIXTURE_LIBRARY.length} equipamentos · USITT / ABNT
        </p>
      </main>

      {/* New Fixture Modal */}
      {showForm && <AddFixtureForm onClose={() => setShowForm(false)} />}
    </div>
  );
}
