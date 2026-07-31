'use client';

import dynamic from 'next/dynamic';
import { TopBar } from '@/components/editor/TopBar';
import { AssetPanel } from '@/components/editor/AssetPanel';
import { PropertyInspector } from '@/components/editor/PropertyInspector';
import { TechnicalSeal } from '@/components/editor/TechnicalSeal';
import { NewMapModal } from '@/components/editor/NewMapModal';
import { useKeyboardShortcuts } from '@/lib/keyboard/useKeyboardShortcuts';

// Dynamic import of canvas (Konva requires browser)
const LightingCanvas = dynamic(() => import('@/components/canvas/LightingCanvas'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center w-full h-full bg-editor-bg">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-afina-500 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-white/30 font-mono">Carregando canvas...</span>
      </div>
    </div>
  ),
});

import { PranchaoModal } from '@/components/editor/PranchaoModal';

export default function EditorPage() {
  useKeyboardShortcuts();

  return (
    <div className="editor-layout">
      <TopBar />
      <AssetPanel />
      <LightingCanvas />
      <PropertyInspector />
      <TechnicalSeal />
      <NewMapModal />
      <PranchaoModal />
    </div>
  );
}
