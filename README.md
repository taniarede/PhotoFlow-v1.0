# PhotoFlow

PhotoFlow is a local-first photography workflow application for selecting photographs, preparing exports, adding metadata and watermarks, and optionally analysing photographs with Ollama + Qwen2.5-VL.

PhotoFlow runs locally: the browser talks to the PhotoFlow Node.js backend, and the backend talks to a local Ollama instance. The application does not require a cloud AI service for its AI-analysis workflow.

---

# English

## Features

- Select photographs from your computer or drag and drop them into the application.
- Process photographs using the available export presets.
- Add a text or image watermark.
- When the watermark is text, choose its font from the built-in font list.
- Preview the watermark before processing.
- Add photographer/author information to metadata.
- Optionally analyse photographs with Ollama and Qwen2.5-VL.
- Write AI-generated themes, tags and descriptions into processed-image metadata when analysis results are available.
- Export the processed photographs as a ZIP archive.
- Toggle between light and dark themes; the chosen theme is stored in a browser cookie and restored on the next visit.
- Keep the workflow stepper visible near the top of the page while scrolling.
- Use a retro-photography visual background with a subtle scroll-parallax effect. Reduced-motion settings are respected.

## Requirements

- Node.js 18 or newer (Node.js 20+ is recommended).
- npm (included with Node.js).
- Ollama is only required for the optional AI-analysis feature.
- For AI analysis, install the `qwen2.5vl:3b` model.

## Installation

### Windows

1. Install Node.js from the official website: https://nodejs.org/
2. Open **PowerShell** in the PhotoFlow project folder.
3. Install the project dependencies:

```powershell
npm install
npm run install:all
```

4. For AI analysis, install Ollama from: https://ollama.com/download/windows
5. Pull the Qwen model:

```powershell
ollama pull qwen2.5vl:3b
```

6. Start the application:

```powershell
npm run dev
```

Open http://localhost:5173 in your browser.

### macOS

1. Install Node.js from https://nodejs.org/ or with your preferred package manager.
2. Open **Terminal** in the PhotoFlow project folder.
3. Install the project dependencies:

```bash
npm install
npm run install:all
```

4. Install Ollama from https://ollama.com/download/mac if you want AI analysis.
5. Pull the model:

```bash
ollama pull qwen2.5vl:3b
```

6. Start the application:

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

### Linux

1. Install Node.js 18+ using your distribution's package manager or from https://nodejs.org/.
2. Open a terminal in the PhotoFlow project folder.
3. Install the project dependencies:

```bash
npm install
npm run install:all
```

4. Install Ollama from https://ollama.com/download/linux if you want AI analysis.
5. Pull the model:

```bash
ollama pull qwen2.5vl:3b
```

6. Start the application:

```bash
npm run dev
```

Open http://localhost:5173 in your browser.

## Running the application

The root command starts both development servers:

```bash
npm run dev
```

Default addresses:

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Ollama: http://127.0.0.1:11434

To run the services separately:

```bash
npm run dev --prefix frontend
npm run dev --prefix backend
```

## Ollama / Qwen2.5-VL configuration

AI analysis is optional. The backend uses these defaults:

```text
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5vl:3b
OLLAMA_NUM_CTX=4096
OLLAMA_MAX_CTX=16384
OLLAMA_TIMEOUT_MS=180000
```

The source photograph is sent to Qwen without an application-level resize, pixel limit, or JPEG recompression. PhotoFlow therefore preserves the original uploaded image when preparing the vision request.

The backend starts with the configured context and automatically retries once with a larger context when Ollama explicitly reports a context-size error, up to `OLLAMA_MAX_CTX`.

Example:

```bash
OLLAMA_MODEL=qwen2.5vl:3b OLLAMA_NUM_CTX=4096 OLLAMA_MAX_CTX=16384 npm run dev --prefix backend
```

On Windows PowerShell:

```powershell
$env:OLLAMA_NUM_CTX="4096"
$env:OLLAMA_MAX_CTX="16384"
npm run dev --prefix backend
```

If a vision request takes too long, the backend stops waiting after `OLLAMA_TIMEOUT_MS` milliseconds and reports the error instead of leaving the UI waiting indefinitely.

## Watermark fonts

Text watermarks support these selectable fonts:

- Arial
- Helvetica
- Verdana
- Trebuchet MS
- Georgia
- Times New Roman
- Courier New
- Impact

The selected font is used in both the browser preview and the processed output. If a particular font is not installed on the operating system, the image-processing stack may fall back to a system sans-serif font.

## Theme and background

The light/dark theme switch is stored in the browser cookie `photoflow-theme` for one year. The next page load uses the previously selected theme.

The retro-photography background is stored at:

```text
frontend/public/retro-graphic-bg.svg
frontend/public/retro-graphic-bg-light.svg
```

The page applies a subtle scroll-based parallax transform. Browsers configured with `prefers-reduced-motion: reduce` disable the animated movement.

## File limits

PhotoFlow does not impose an application-level photograph count or file-size limit in the upload middleware. Actual limits can still come from the operating system, filesystem, browser, available RAM/disk space, reverse proxies, or other infrastructure you place in front of the application.

## Troubleshooting

### Ollama is not available

Check that Ollama is installed and that the API is reachable:

```bash
ollama list
```

You can also check the backend health endpoint:

```text
http://localhost:3001/api/analyze/health
```

Make sure `qwen2.5vl:3b` appears in `ollama list`.

### Context-size error

PhotoFlow starts with `OLLAMA_NUM_CTX=4096` and automatically retries a larger context when the Ollama response explicitly identifies a context-size problem. You can increase the maximum with `OLLAMA_MAX_CTX` if your hardware has enough memory.

### AI analysis stays on "Analysing"

The backend now has a request timeout. Check the backend terminal for the reported Ollama error. Also verify the model is loaded and that the machine has enough available memory.

### Export works without AI

AI analysis is optional. You can process/export the photographs without running Qwen2.5-VL.

## Project structure

```text
photoflow/
├── backend/
│   └── src/
│       ├── routes/
│       └── services/
├── frontend/
│   ├── public/
│   │   └── retro-graphic-bg.svg
│   └── src/
│       ├── components/
│       ├── hooks/
│       └── utils/
├── docs/
├── README.md
└── package.json
```

---

# Português

## Funcionalidades

- Selecionar fotografias a partir do computador ou arrastá-las para a aplicação.
- Processar fotografias através dos presets de exportação disponíveis.
- Adicionar uma marca de água de texto ou de imagem.
- Quando a marca de água é de texto, escolher o tipo de fonte através de um seletor.
- Pré-visualizar a marca de água antes do processamento.
- Adicionar o nome do fotógrafo/autor aos metadados.
- Analisar opcionalmente as fotografias com Ollama e Qwen2.5-VL.
- Escrever temas, tags e descrições gerados pela IA nos metadados das imagens processadas quando existem resultados de análise.
- Exportar as fotografias processadas num ficheiro ZIP.
- Alternar entre tema claro e escuro; a escolha fica guardada num cookie e é restaurada na próxima visita.
- Manter o Stepper visível junto ao topo enquanto a página é percorrida.
- Usar um fundo gráfico alusivo à fotografia retro com um efeito subtil de parallax durante o scroll. As definições de redução de movimento do sistema são respeitadas.

## Requisitos

- Node.js 18 ou superior (Node.js 20+ é recomendado).
- npm, incluído com o Node.js.
- Ollama apenas é necessário para a funcionalidade opcional de análise com IA.
- Para análise com IA, instalar o modelo `qwen2.5vl:3b`.

## Instalação

### Windows

1. Instala o Node.js a partir de https://nodejs.org/.
2. Abre o **PowerShell** na pasta do projeto PhotoFlow.
3. Instala as dependências do projeto:

```powershell
npm install
npm run install:all
```

4. Para análise com IA, instala o Ollama a partir de https://ollama.com/download/windows.
5. Instala o modelo Qwen:

```powershell
ollama pull qwen2.5vl:3b
```

6. Inicia a aplicação:

```powershell
npm run dev
```

Abre http://localhost:5173 no browser.

### macOS

1. Instala o Node.js a partir de https://nodejs.org/ ou através do gestor de pacotes que preferires.
2. Abre o **Terminal** na pasta do projeto PhotoFlow.
3. Instala as dependências:

```bash
npm install
npm run install:all
```

4. Para análise com IA, instala o Ollama a partir de https://ollama.com/download/mac.
5. Instala o modelo:

```bash
ollama pull qwen2.5vl:3b
```

6. Inicia a aplicação:

```bash
npm run dev
```

Abre http://localhost:5173 no browser.

### Linux

1. Instala o Node.js 18+ através do gestor de pacotes da distribuição ou em https://nodejs.org/.
2. Abre um terminal na pasta do projeto.
3. Instala as dependências:

```bash
npm install
npm run install:all
```

4. Para análise com IA, instala o Ollama a partir de https://ollama.com/download/linux.
5. Instala o modelo:

```bash
ollama pull qwen2.5vl:3b
```

6. Inicia a aplicação:

```bash
npm run dev
```

Abre http://localhost:5173 no browser.

## Executar a aplicação

O comando na raiz inicia os dois servidores de desenvolvimento:

```bash
npm run dev
```

Endereços predefinidos:

- Frontend: http://localhost:5173
- Backend: http://localhost:3001
- Ollama: http://127.0.0.1:11434

É possível iniciar os serviços separadamente:

```bash
npm run dev --prefix frontend
npm run dev --prefix backend
```

## Configuração do Ollama / Qwen2.5-VL

A análise com IA é opcional. O backend usa por defeito:

```text
OLLAMA_URL=http://127.0.0.1:11434
OLLAMA_MODEL=qwen2.5vl:3b
OLLAMA_NUM_CTX=4096
OLLAMA_MAX_CTX=16384
OLLAMA_TIMEOUT_MS=180000
```

A fotografia original é enviada para o Qwen sem resize aplicado pela aplicação, sem limite artificial de pixels e sem recompressão JPEG. Desta forma, o PhotoFlow preserva a imagem original quando prepara o pedido de visão.

O backend começa pelo contexto configurado e tenta novamente com um contexto maior quando o Ollama devolve explicitamente um erro de tamanho de contexto, até ao máximo definido por `OLLAMA_MAX_CTX`.

Exemplo:

```bash
OLLAMA_MODEL=qwen2.5vl:3b OLLAMA_NUM_CTX=4096 OLLAMA_MAX_CTX=16384 npm run dev --prefix backend
```

No PowerShell do Windows:

```powershell
$env:OLLAMA_NUM_CTX="4096"
$env:OLLAMA_MAX_CTX="16384"
npm run dev --prefix backend
```

Se um pedido de análise demorar demasiado, o backend deixa de esperar ao fim de `OLLAMA_TIMEOUT_MS` milissegundos e apresenta um erro em vez de deixar a interface bloqueada indefinidamente.

## Fontes da marca de água

As marcas de água de texto suportam estas fontes:

- Arial
- Helvetica
- Verdana
- Trebuchet MS
- Georgia
- Times New Roman
- Courier New
- Impact

A fonte selecionada é usada tanto no preview do browser como na imagem processada. Se uma fonte específica não estiver instalada no sistema operativo, o sistema de processamento da imagem poderá recorrer a uma fonte sans-serif disponível no sistema.

## Tema e fundo

A escolha entre tema claro e escuro é guardada no cookie `photoflow-theme` durante um ano. Na próxima abertura da página, a escolha anterior é restaurada.

A imagem de fundo retro encontra-se em:

```text
frontend/public/retro-graphic-bg.svg
frontend/public/retro-graphic-bg-light.svg
```

A página aplica um movimento subtil de parallax baseado no scroll. Quando o sistema está configurado com `prefers-reduced-motion: reduce`, o movimento é desativado.

## Limites de ficheiros

O PhotoFlow não impõe um limite de aplicação para a quantidade de fotografias nem para o tamanho dos ficheiros no middleware de upload. Podem, no entanto, existir limites provenientes do sistema operativo, sistema de ficheiros, browser, memória/disco disponível, reverse proxies ou outra infraestrutura colocada à frente da aplicação.

## Resolução de problemas

### Ollama não está disponível

Confirma que o Ollama está instalado e que o modelo está disponível:

```bash
ollama list
```

Também podes verificar o endpoint de saúde do backend:

```text
http://localhost:3001/api/analyze/health
```

Confirma que `qwen2.5vl:3b` aparece no `ollama list`.

### Erro de tamanho de contexto

O PhotoFlow começa com `OLLAMA_NUM_CTX=4096` e repete automaticamente o pedido com um contexto maior quando a resposta do Ollama identifica explicitamente um problema de tamanho de contexto. Podes aumentar `OLLAMA_MAX_CTX` se o teu hardware tiver memória suficiente.

### A análise fica em "A analisar"

O backend tem agora um timeout para os pedidos ao Ollama. Verifica o terminal do backend para o erro devolvido pelo Ollama. Confirma também que o modelo está carregado e que existe memória disponível suficiente.

### É possível exportar sem usar a IA

A análise com IA é opcional. Podes processar e exportar as fotografias sem executar o Qwen2.5-VL.

## Estrutura do projeto

```text
photoflow/
├── backend/
│   └── src/
│       ├── routes/
│       └── services/
├── frontend/
│   ├── public/
│   │   └── retro-graphic-bg.svg
│   └── src/
│       ├── components/
│       ├── hooks/
│       └── utils/
├── docs/
├── README.md
└── package.json
```

---

## Credits / Créditos

The retro-photography background is a non-photographic graphic asset created specifically for the PhotoFlow project, using retro camera, film, print and geometric motifs.

## Accessibility

PhotoFlow is designed toward **WCAG 2.2 Level AA**. The interface includes keyboard-visible focus states, semantic headings and controls, accessible labels for interactive elements, live status announcements, reduced-motion support, responsive controls, and sufficient pointer target sizing.

This is an implementation goal, not a formal conformance claim. A complete WCAG assessment still requires testing the running application with keyboard-only navigation, screen readers, zoom/reflow, contrast analysis, and representative assistive technologies.


Accessibility details and manual WCAG 2.2 AA verification guidance are documented in `docs/ACCESSIBILITY.md`.
