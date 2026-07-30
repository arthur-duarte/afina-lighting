'use client';

import { useState } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';
import { STAGE_PRESETS } from '@/lib/stages/stagePresets';
import {
  SparklesIcon, FileTextIcon, UserIcon, MapPinIcon,
  CalendarIcon, Grid3x3Icon, XIcon, CheckIcon, ZapIcon,
} from 'lucide-react';

export function NewMapModal() {
  const { showNewMapModal, setShowNewMapModal, clearCanvas, updateSeal, addElement, selectElement } = useEditorStore();

  const [show, setShow] = useState('Novo Espetáculo');
  const [designer, setDesigner] = useState('Arthur Duarte');
  const [operator, setOperator] = useState('');
  const [venue, setVenue] = useState('Teatro Principal');
  const [clientCompany, setClientCompany] = useState('');
  const [stageType, setStageType] = useState<'preset' | 'custom'>('preset');
  const [selectedPresetId, setSelectedPresetId] = useState('italiano');
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
      preset.elements.forEach((el) => addElement({ ...el }));
    } else {
      const widthPx = customWidth * 50;
      const depthPx = customDepth * 50;
      const varandaPx = customVaranda * 50;

      const id = addElement({
        type: 'custom_stage',
        category: 'architecture',
        layerId: 'layer_architecture',
        x: 400,
        y: 250,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
        label: `Palco ${customWidth}m x ${customDepth}m`,
        color: '#38bdf8',
        gelatin: 'NC',
        wattage: 0,
        phase: 'unassigned',
        locked: false,
        visible: true,
        customProps: { width: widthPx, height: depthPx, varanda: varandaPx },
      });
      selectElement(id);
    }

    // 4. Close modal
    setShowNewMapModal(false);
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-[#14141a] border border-[#2a2a38] rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#2a2a38] flex items-center justify-between bg-[#181822]">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-afina-500 flex items-center justify-center shadow-lg shadow-afina-500/20">
              <SparklesIcon size={18} className="text-white" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white leading-tight">Novo Mapa de Luz</h2>
              <p className="text-xs text-white/40">Configure as informações do espetáculo e do palco inicial</p>
            </div>
          </div>
          <button
            onClick={() => setShowNewMapModal(false)}
            className="w-7 h-7 rounded-lg flex items-center justify-center text-white/40 hover:text-white hover:bg-white/5 transition-colors"
          >
            <XIcon size={16} />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {/* Informações Gerais */}
          <div>
            <div className="panel-label mb-3 text-afina-400">Informações do Projeto</div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-medium text-white/60 mb-1 block">Nome do Espetáculo / Projeto *</label>
                <input
                  value={show}
                  onChange={(e) => setShow(e.target.value)}
                  placeholder="ex: Hamlet - Turnê 2026"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-white/60 mb-1 block">Iluminador / Lighting Designer *</label>
                <input
                  value={designer}
                  onChange={(e) => setDesigner(e.target.value)}
                  placeholder="ex: Arthur Duarte"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-white/60 mb-1 block">Teatro / Local da Montagem</label>
                <input
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  placeholder="ex: Teatro Castro Alves"
                  className="input-field"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-white/60 mb-1 block">Operador / Assistente de Luz</label>
                <input
                  value={operator}
                  onChange={(e) => setOperator(e.target.value)}
                  placeholder="ex: Mariana Souza"
                  className="input-field"
                />
              </div>
              <div className="col-span-2">
                <label className="text-xs font-medium text-white/60 mb-1 block">Companhia / Produção</label>
                <input
                  value={clientCompany}
                  onChange={(e) => setClientCompany(e.target.value)}
                  placeholder="ex: Cia de Teatro Dionísio"
                  className="input-field"
                />
              </div>
            </div>
          </div>

          <div className="h-px bg-[#2a2a38]" />

          {/* Escolha do Palco Inicial */}
          <div>
            <div className="panel-label mb-3 text-afina-400">Palco e Espaço Inicial</div>
            
            <div className="flex gap-3 mb-3">
              <button
                type="button"
                onClick={() => setStageType('preset')}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  stageType === 'preset'
                    ? 'bg-afina-950 border-afina-500 text-white'
                    : 'bg-[#181822] border-[#2a2a38] text-white/50 hover:text-white'
                }`}
              >
                Palco Predefinido (Preset)
              </button>
              <button
                type="button"
                onClick={() => setStageType('custom')}
                className={`flex-1 py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                  stageType === 'custom'
                    ? 'bg-afina-950 border-afina-500 text-white'
                    : 'bg-[#181822] border-[#2a2a38] text-white/50 hover:text-white'
                }`}
              >
                Dimensões Personalizadas + Varanda
              </button>
            </div>

            {stageType === 'preset' ? (
              <div className="grid grid-cols-2 gap-2">
                {STAGE_PRESETS.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => setSelectedPresetId(preset.id)}
                    className={`flex items-center gap-3 p-3 rounded-xl border text-left transition-all ${
                      selectedPresetId === preset.id
                        ? 'bg-afina-950/60 border-afina-500 text-white'
                        : 'bg-[#181822] border-[#2a2a38] text-white/60 hover:text-white hover:border-[#3a3a4c]'
                    }`}
                  >
                    <span className="text-2xl">{preset.icon}</span>
                    <div>
                      <div className="text-xs font-bold text-white">{preset.name}</div>
                      <div className="text-[10px] text-white/40">{preset.description}</div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="bg-[#181822] border border-[#2a2a38] rounded-xl p-4 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">Largura (m)</label>
                    <input
                      type="number"
                      value={customWidth}
                      onChange={(e) => setCustomWidth(Math.max(1, Number(e.target.value)))}
                      className="input-field font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">Profundidade (m)</label>
                    <input
                      type="number"
                      value={customDepth}
                      onChange={(e) => setCustomDepth(Math.max(1, Number(e.target.value)))}
                      className="input-field font-mono"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-white/60 mb-1 block">Varanda / Proscênio (m)</label>
                    <input
                      type="number"
                      value={customVaranda}
                      onChange={(e) => setCustomVaranda(Math.max(0, Number(e.target.value)))}
                      className="input-field font-mono"
                    />
                  </div>
                </div>
                <p className="text-[11px] text-white/35">
                  Será criado um palco de {customWidth}m x {customDepth}m com varanda estendida de {customVaranda}m para colocação de luzes fora da boca de cena.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-[#2a2a38] bg-[#181822] flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => setShowNewMapModal(false)}
            className="btn-secondary"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={handleCreateNewMap}
            className="btn-primary flex items-center gap-2"
          >
            <CheckIcon size={14} />
            Criar Mapa de Luz
          </button>
        </div>
      </div>
    </div>
  );
}
