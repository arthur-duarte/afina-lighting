'use client';

import { useState, useEffect } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { STAGE_PRESETS } from '@/lib/stages/stagePresets';
import { SymbolIcon } from './SymbolIcon';
import {
  SparklesIcon, XIcon, CheckIcon,
} from 'lucide-react';

export function NewMapModal() {
  const { elements, showNewMapModal, setShowNewMapModal, clearCanvas, updateSeal, addElement, selectElement } = useEditorStore();

  useEffect(() => {
    // If canvas is empty on initial load, auto-open setup wizard
    if (elements.length === 0) {
      setShowNewMapModal(true);
    }
  }, []);

  const [show, setShow] = useState('Novo Espetáculo');
  const [designer, setDesigner] = useState('Arthur Duarte');
  const [operator, setOperator] = useState('');
  const [venue, setVenue] = useState('Teatro Principal');
  const [clientCompany, setClientCompany] = useState('');
  const [stageType, setStageType] = useState<'preset' | 'custom'>('preset');
  const [selectedPresetId, setSelectedPresetId] = useState('italian');
  const [customWidth, setCustomWidth] = useState(10);
  const [customDepth, setCustomDepth] = useState(7);
  const [customVaranda, setCustomVaranda] = useState(2);

  if (!showNewMapModal) return null;

  const handleCreateNewMap = () => {
    // 1. Clear current canvas
    clearCanvas();

    // 2. Update Technical Seal metadata
    updateSeal({
      show,
      designer,
      operator: operator || designer,
      venue,
      clientCompany: clientCompany || 'Produção',
      date: new Date().toLocaleDateString('pt-BR'),
      version: 'v1.0',
    });

    // 3. Add initial stage geometry
    if (stageType === 'preset') {
      const preset = STAGE_PRESETS.find((p) => p.id === selectedPresetId) ?? STAGE_PRESETS[0];
      preset.elements.forEach((el) => {
        addElement({ ...el });
      });
    } else {
      const widthPx = customWidth * 50;
      const depthPx = customDepth * 50;
      const varandaPx = customVaranda * 50;

      const id = addElement({
        type: 'custom_stage',
        category: 'architecture',
        layerId: 'layer_architecture',
        x: 0,
        y: 0,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        label: `Palco ${customWidth}m x ${customDepth}m`,
        color: '#0f172a',
        gelatin: 'NC',
        wattage: 0,
        phase: 'unassigned',
        locked: false,
        visible: true,
        customProps: { width: widthPx, height: depthPx, varanda: varandaPx },
      });
      selectElement(id);
    }

    // 4. Fit stage to screen dimensions with side margins
    setTimeout(() => {
      useEditorStore.getState().fitStageToScreen();
    }, 50);

    // 5. Close modal
    setShowNewMapModal(false);
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white border border-slate-300 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-afina-500 flex items-center justify-center shadow-md shadow-afina-500/20">
              <SparklesIcon size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 leading-tight">Novo Mapa de Luz</h2>
              <p className="text-xs text-slate-500">Configure as informações do espetáculo e selecione o formato do palco</p>
            </div>
          </div>
          <button
            onClick={() => setShowNewMapModal(false)}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <XIcon size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Informações Gerais */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-afina-600 mb-3">Informações do Projeto</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Nome do Espetáculo / Projeto *</label>
                <input
                  value={show}
                  onChange={(e) => setShow(e.target.value)}
                  placeholder="ex: Hamlet - Turnê 2026"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Iluminador / Designer de Luz *</label>
                <input
                  value={designer}
                  onChange={(e) => setDesigner(e.target.value)}
                  placeholder="ex: Arthur Duarte"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Teatro / Local da Montagem</label>
                <input
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="ex: Teatro Castro Alves"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Operador / Assistente de Luz</label>
                <input
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  placeholder="ex: Mariana Souza"
                  className="input-field"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-semibold text-slate-700 mb-1 block">Companhia / Produção</label>
                <input
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  placeholder="ex: Cia de Teatro Dionísio"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-slate-200" />

          {/* Escolha do Palco Inicial */}
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-afina-600 mb-3">Formato do Palco e Espaço</div>
            
            <div className="flex gap-2 mb-4 p-1 bg-slate-100 rounded-xl border border-slate-200">
              <button
                type="button"
                onClick={() => setStageType('preset')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  stageType === 'preset'
                    ? 'bg-white text-slate-900 shadow border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Palco Predefinido (Preset)
              </button>
              <button
                type="button"
                onClick={() => setStageType('custom')}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold transition-all ${
                  stageType === 'custom'
                    ? 'bg-white text-slate-900 shadow border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dimensões Personalizadas + Varanda
              </button>
            </div>

            {stageType === 'preset' ? (
              <div className="grid grid-cols-2 gap-2.5">
                {STAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedPresetId(preset.id)}
                    className={`flex items-start gap-3 p-3 rounded-xl border text-left transition-all ${
                      selectedPresetId === preset.id
                        ? 'bg-afina-50/80 border-afina-500 shadow-sm ring-1 ring-afina-500'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-9 h-9 flex items-center justify-center flex-shrink-0 rounded-lg border ${
                      selectedPresetId === preset.id
                        ? 'bg-afina-100 border-afina-300'
                        : 'bg-slate-100 border-slate-200'
                    }`}>
                      <SymbolIcon type={preset.icon} colorHex={selectedPresetId === preset.id ? '#ef4732' : '#0f172a'} size={20} />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-900">{preset.name}</div>
                      <div className="text-[10px] text-slate-500 leading-normal mt-0.5">{preset.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Largura (m)</label>
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(Math.max(1, Number(e.target.value)))}
                      className="input-field font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Profundidade (m)</label>
                    <input
                      type="number"
                      value={customDepth}
                      onChange={(e) => setCustomDepth(Math.max(1, Number(e.target.value)))}
                      className="input-field font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-slate-700 mb-1 block">Varanda (m)</label>
                    <input
                      type="number"
                      value={customVaranda}
                      onChange={(e) => setCustomVaranda(Math.max(0, Number(e.target.value)))}
                      className="input-field font-mono"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-slate-500">
                  Será gerado um palco de {customWidth}m x {customDepth}m com varanda/proscênio estendido de {customVaranda}m para posicionamento fora da boca de cena.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowNewMapModal(false)}
            className="btn-secondary px-4 py-2"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleCreateNewMap}
            className="btn-primary px-5 py-2 flex items-center gap-2 font-bold shadow-md shadow-afina-500/20"
          >
            <CheckIcon size={16} />
            Criar Mapa de Luz
          </button>
        </div>
      </div>
    </div>
  );
}
