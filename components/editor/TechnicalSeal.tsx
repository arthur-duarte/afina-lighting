'use client';

import { useState, useRef } from 'react';
import { useEditorStore } from '@/lib/store/useEditorStore';
import type { TechnicalSeal } from '@/lib/types';
import {
  EditIcon, XIcon, UserIcon, MailIcon, PhoneIcon,
  BuildingIcon, MapPinIcon, CalendarIcon, TagIcon,
  FileTextIcon, ScalingIcon, ZapIcon, SaveIcon,
  UploadIcon, StarIcon, ClipboardIcon, UsersIcon,
} from 'lucide-react';

// ── FIELD TYPES ───────────────────────────────────────────
interface ModalFieldProps {
  label: string;
  icon?: React.ReactNode;
  value: string;
  field: keyof TechnicalSeal;
  placeholder?: string;
  type?: 'text' | 'email' | 'tel' | 'url';
  onChange: (field: keyof TechnicalSeal, value: string) => void;
}

function ModalField({ label, icon, value, field, placeholder, type = 'text', onChange }: ModalFieldProps) {
  return (
    <div>
      <label className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1">
        {icon && <span className="text-white/30">{icon}</span>}
        {label}
      </label>
      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(field, e.target.value)}
        className="input-field text-sm"
      />
    </div>
  );
}

// ── SECTION HEADER ────────────────────────────────────────
function SectionHeader({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex items-center gap-2 mb-3 pb-2 border-b border-editor-border">
      <span className="text-afina-400">{icon}</span>
      <h3 className="text-xs font-bold uppercase tracking-widest text-white/60">{title}</h3>
    </div>
  );
}

// ── SEAL EDITOR MODAL ─────────────────────────────────────
function SealEditorModal({ onClose }: { onClose: () => void }) {
  const { technicalSeal, updateSeal } = useEditorStore();
  const [local, setLocal] = useState<TechnicalSeal>({ ...technicalSeal });
  const fileRef = useRef<HTMLInputElement>(null);

  const update = (field: keyof TechnicalSeal, value: string) => {
    setLocal((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateSeal(local);
    onClose();
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      update('logoUrl', ev.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center">
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-3xl mx-4 bg-editor-surface border border-editor-border rounded-xl shadow-panel max-h-[90vh] flex flex-col animate-fade-in">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-editor-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-afina-600 flex items-center justify-center">
              <FileTextIcon size={15} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-white text-sm">Selo Técnico</h2>
              <p className="text-[11px] text-white/40">Metadados do mapa de luz</p>
            </div>
          </div>
          <button onClick={onClose} className="icon-btn">
            <XIcon size={16} />
          </button>
        </div>

        {/* Body (2-col grid) */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">

            {/* ── ESPETÁCULO ─────────────────────────── */}
            <div className="md:col-span-2">
              <SectionHeader icon={<StarIcon size={14} />} title="Espetáculo" />
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="md:col-span-2">
                  <ModalField label="Nome do Espetáculo" field="show" value={local.show}
                    placeholder="Ex: Hamlet" icon={<StarIcon size={11} />} onChange={update} />
                </div>
                <ModalField label="Subtítulo / Temporada" field="subtitle" value={local.subtitle}
                  placeholder="Ex: Temporada 2025" onChange={update} />
                <ModalField label="Diretor(a)" field="director" value={local.director}
                  placeholder="Nome do(a) diretor(a)" icon={<UserIcon size={11} />} onChange={update} />
                <ModalField label="Companhia / Produtora" field="clientCompany" value={local.clientCompany}
                  placeholder="Ex: Companhia Teatro Livre" icon={<BuildingIcon size={11} />} onChange={update} />
                <ModalField label="Temporada" field="season" value={local.season}
                  placeholder="Ex: Jan–Mar 2026" icon={<CalendarIcon size={11} />} onChange={update} />
              </div>
            </div>

            {/* ── DESIGNER DE LUZ ────────────────────── */}
            <div>
              <SectionHeader icon={<ZapIcon size={14} />} title="Designer de Luz (Autoria)" />
              <div className="space-y-3">
                <ModalField label="Nome completo" field="designer" value={local.designer}
                  placeholder="Seu nome" icon={<UserIcon size={11} />} onChange={update} />
                <ModalField label="E-mail profissional" field="designerEmail" value={local.designerEmail}
                  placeholder="email@dominio.com" type="email" icon={<MailIcon size={11} />} onChange={update} />
                <ModalField label="Telefone / WhatsApp" field="designerPhone" value={local.designerPhone}
                  placeholder="+55 (11) 99999-9999" type="tel" icon={<PhoneIcon size={11} />} onChange={update} />
                <ModalField label="Empresa / Escritório" field="designerCompany" value={local.designerCompany}
                  placeholder="Nome da empresa ou 'Freelancer'" icon={<BuildingIcon size={11} />} onChange={update} />
              </div>
            </div>

            {/* ── EQUIPE TÉCNICA ──────────────────────── */}
            <div>
              <SectionHeader icon={<UsersIcon size={14} />} title="Equipe Técnica" />
              <div className="space-y-3">
                <ModalField label="Operador(a) de Luz" field="operator" value={local.operator}
                  placeholder="Nome do operador" icon={<UserIcon size={11} />} onChange={update} />
                <ModalField label="Técnico(a) Responsável" field="technician" value={local.technician}
                  placeholder="Técnico de iluminação" icon={<UserIcon size={11} />} onChange={update} />
                <ModalField label="Assistente de Iluminação" field="assistantDesigner" value={local.assistantDesigner}
                  placeholder="Assistente do designer" icon={<UserIcon size={11} />} onChange={update} />
              </div>
            </div>

            {/* ── ESPAÇO CÊNICO ───────────────────────── */}
            <div>
              <SectionHeader icon={<MapPinIcon size={14} />} title="Espaço Cênico" />
              <div className="space-y-3">
                <ModalField label="Teatro / Venue" field="venue" value={local.venue}
                  placeholder="Ex: Teatro Municipal" icon={<BuildingIcon size={11} />} onChange={update} />
                <div className="grid grid-cols-2 gap-3">
                  <ModalField label="Cidade" field="city" value={local.city}
                    placeholder="São Paulo" icon={<MapPinIcon size={11} />} onChange={update} />
                  <ModalField label="Estado (UF)" field="state" value={local.state}
                    placeholder="SP" onChange={update} />
                </div>
              </div>
            </div>

            {/* ── DOCUMENTO ───────────────────────────── */}
            <div>
              <SectionHeader icon={<ClipboardIcon size={14} />} title="Dados do Documento" />
              <div className="space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <ModalField label="Data" field="date" value={local.date}
                    placeholder={new Date().toLocaleDateString('pt-BR')} icon={<CalendarIcon size={11} />} onChange={update} />
                  <ModalField label="Versão" field="version" value={local.version}
                    placeholder="1.0" icon={<TagIcon size={11} />} onChange={update} />
                  <ModalField label="Escala" field="scale" value={local.scale}
                    placeholder="1:50" icon={<ScalingIcon size={11} />} onChange={update} />
                </div>
                <ModalField label="Descrição da Revisão" field="revision" value={local.revision}
                  placeholder="Ex: Ajuste das varas laterais" onChange={update} />
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1 block">
                    Observações Gerais
                  </label>
                  <textarea
                    value={local.notes}
                    onChange={(e) => update('notes', e.target.value)}
                    rows={3}
                    placeholder="Informações adicionais, avisos técnicos, etc."
                    className="input-field text-sm resize-none"
                  />
                </div>
              </div>
            </div>

            {/* ── IDENTIDADE VISUAL ───────────────────── */}
            <div className="md:col-span-2">
              <SectionHeader icon={<UploadIcon size={14} />} title="Identidade Visual" />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold uppercase tracking-wider text-white/40 mb-1 block">
                    Logo (PNG/SVG)
                  </label>
                  <div className="flex items-center gap-3">
                    {local.logoUrl && (
                      <img src={local.logoUrl} alt="Logo" className="h-12 w-auto rounded border border-editor-border object-contain bg-white/5 p-1" />
                    )}
                    <button
                      onClick={() => fileRef.current?.click()}
                      className="flex items-center gap-2 px-3 py-2 border border-dashed border-editor-border rounded-lg text-xs text-white/50 hover:text-white/80 hover:border-afina-500 transition-colors"
                    >
                      <UploadIcon size={13} />
                      {local.logoUrl ? 'Trocar logo' : 'Enviar logo'}
                    </button>
                    {local.logoUrl && (
                      <button onClick={() => update('logoUrl', '')} className="icon-btn text-red-400">
                        <XIcon size={13} />
                      </button>
                    )}
                    <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleLogoUpload} />
                  </div>
                </div>
                <ModalField label="Texto de Copyright / Crédito" field="copyright" value={local.copyright}
                  placeholder={`© ${new Date().getFullYear()} — Todos os direitos reservados`} onChange={update} />
              </div>
            </div>

          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-editor-border flex-shrink-0 bg-editor-raised rounded-b-xl">
          <p className="text-[11px] text-white/30">
            Essas informações aparecem no rodapé do mapa e na exportação PDF
          </p>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-4 py-2 text-xs text-white/60 hover:text-white transition-colors">
              Cancelar
            </button>
            <button
              onClick={handleSave}
              className="flex items-center gap-2 px-5 py-2 bg-afina-600 hover:bg-afina-500 text-white text-xs font-semibold rounded-lg transition-colors active:scale-95"
            >
              <SaveIcon size={13} /> Salvar Selo
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── COMPACT FOOTER SEAL ───────────────────────────────────
export function TechnicalSeal() {
  const { technicalSeal: seal } = useEditorStore();
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <>
      <footer
        className="editor-seal flex items-center justify-between px-4 bg-editor-surface border-t border-editor-border cursor-pointer hover:bg-editor-hover transition-colors group"
        onClick={() => setModalOpen(true)}
        title="Clique para editar o Selo Técnico"
      >
        {/* Left: show info */}
        <div className="flex items-center gap-3 min-w-0">
          {seal.logoUrl && (
            <img src={seal.logoUrl} alt="Logo" className="h-5 w-auto object-contain opacity-70" />
          )}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-bold text-white/80 truncate max-w-48">
              {seal.show || 'Sem Título'}
            </span>
            {seal.subtitle && (
              <span className="text-[10px] text-white/30 truncate max-w-32">— {seal.subtitle}</span>
            )}
          </div>
        </div>

        {/* Center: authorship */}
        <div className="flex items-center gap-4 text-[10px] text-white/40 font-mono">
          {seal.designer && (
            <span className="flex items-center gap-1">
              <UserIcon size={10} />
              {seal.designer}
              {seal.designerEmail && (
                <span className="text-white/25 hidden md:inline">〈{seal.designerEmail}〉</span>
              )}
            </span>
          )}
          {seal.venue && (
            <span className="hidden md:flex items-center gap-1">
              <MapPinIcon size={10} />
              {seal.venue}{seal.city ? `, ${seal.city}` : ''}{seal.state ? `/${seal.state}` : ''}
            </span>
          )}
          {seal.operator && (
            <span className="hidden lg:flex items-center gap-1">
              Op: {seal.operator}
            </span>
          )}
        </div>

        {/* Right: doc info + edit button */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex items-center gap-3 text-[10px] text-white/35 font-mono">
            <span>Escala: {seal.scale}</span>
            <span>v{seal.version}</span>
            <span>{seal.date}</span>
          </div>
          <button
            className="icon-btn opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 px-2 py-1 text-[10px]"
            onClick={(e) => { e.stopPropagation(); setModalOpen(true); }}
          >
            <EditIcon size={11} />
            Editar Selo
          </button>
        </div>
      </footer>

      {modalOpen && <SealEditorModal onClose={() => setModalOpen(false)} />}
    </>
  );
}
