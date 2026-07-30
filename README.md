# Afina v2.0 — Lighting Plot Designer

> Software profissional para criação de Mapas de Luz 2D, Tabela de Patch DMX e Dimensionamento Elétrico para iluminação cênico-teatral.

## 🚀 Instalação Rápida

Abra o terminal neste diretório e execute:

```bash
npm install
npm run dev
```

Acesse em: **http://localhost:3000**

---

## 📁 Estrutura do Projeto

```
afina/
├── app/
│   ├── layout.tsx          # Layout raiz (fontes, dark theme)
│   ├── page.tsx            # Redireciona para /editor
│   ├── globals.css         # Design system completo
│   └── editor/
│       └── page.tsx        # Página principal do editor
│
├── components/
│   ├── editor/
│   │   ├── TopBar.tsx            # Barra superior (logo, menus, kW/A)
│   │   ├── AssetPanel.tsx        # Painel esquerdo (biblioteca + camadas)
│   │   ├── PropertyInspector.tsx # Painel direito (propriedades DMX)
│   │   └── TechnicalSeal.tsx     # Rodapé técnico editável ← NOVO
│   └── canvas/
│       └── LightingCanvas.tsx    # Engine Konva (canvas principal)
│
└── lib/
    ├── types.ts                     # Tipos TypeScript globais
    ├── utils.ts                     # Utilitários (cn, formatWatts)
    ├── store/
    │   └── useEditorStore.ts        # Store Zustand (estado + undo/redo)
    ├── fixtures/
    │   └── fixtureLibrary.ts        # Catálogo de equipamentos + gelatinas
    ├── stages/
    │   └── stagePresets.ts          # Presets de palco (Italiano, Arena...)
    ├── keyboard/
    │   └── useKeyboardShortcuts.ts  # Atalhos de teclado
    └── dmx/
        └── patchEngine.ts           # Motor DMX + calculador elétrico
```

---

## ⌨️ Atalhos de Teclado

| Tecla | Ação |
|-------|------|
| `V` | Seleção |
| `H` / Espaço | Pan (mover canvas) |
| `E` | Inserir Elipsoidal |
| `F` | Inserir Fresnel |
| `P` | Inserir PAR 64 |
| `M` | Inserir Moving Light |
| `W` | Inserir Vara de Luz |
| `R` | Rotacionar +15° (`Shift+R` = +45°) |
| `G` | Ligar/desligar Grid |
| `L` | Painel de Camadas |
| `B` / `F11` | Modo Backstage (vermelho noturno) |
| `C` | Cobertura de Foco |
| `Ctrl+Z` | Desfazer |
| `Ctrl+Y` | Refazer |
| `Ctrl+D` | Duplicar |
| `Ctrl+A` | Selecionar tudo |
| `Delete` | Remover selecionado |
| `Ctrl+0` | Resetar view |

---

## 🎭 Selo Técnico

Clique no rodapé do editor para abrir o editor completo do Selo Técnico com:

- **Espetáculo:** Nome, subtítulo, diretor(a)
- **Designer de Luz:** Nome, e-mail, telefone, empresa
- **Equipe:** Operador, técnico, assistente
- **Espaço:** Teatro, cidade, estado
- **Produção:** Companhia, temporada
- **Documento:** Data, versão, escala, revisão, notas
- **Identidade:** Logo (upload) + copyright

---

## 🗺️ Roadmap

- ✅ **Fase 1:** Setup + Layout completo
- ✅ **Fase 2:** Canvas Konva + Atalhos + Zustand
- 🔜 **Fase 3:** Biblioteca completa + Drag-and-drop avançado
- 🔜 **Fase 4:** Motor DMX + Calculador elétrico completo
- 🔜 **Fase 5:** Exportação PNG/PDF/CSV
- 🔜 **Fase 6:** Supabase + Auth.js
- 🔜 **Fase 7:** Painel Admin
