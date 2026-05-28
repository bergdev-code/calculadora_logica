// ==================== GLOBAL STATE ====================
let currentVarCount = 3;
let currentOutputs = [];
let currentExpression = "";
let currentVariables = [];

// ==================== TRADUÇÕES ====================
const translations = {
    pt: {
        appTitle: "Calculadora de Lógica Digital",
        appSubtitle: "Tabela Verdade, Mapa de Karnaugh e Simplificação",
        sectionInput: "Entrada de Função",
        sectionVars: "Variáveis",
        sectionExamples: "Identidades Visuais",
        sectionHistory: "Histórico",
        expressionPlaceholder: "Ex: X.Y + ~Z + A.B",
        calculate: "Calcular",
        clear: "Limpar",
        detectedVars: "Variáveis detectadas:",
        truthTableTitle: "Tabela Verdade",
        kmapTitle: "Mapa de Karnaugh",
        simplifiedTitle: "Expressão Simplificada:",
        stepsTitle: "Passos do Cálculo:",
        noMinterms: "Nenhum mintermo selecionado (saída é sempre 0).",
        allMinterms: "Todos os mintermos selecionados (saída é sempre 1).",
        footerText: "Desenvolvido para auxílio nos estudos da UC: Matemática Computacional Aplicada - Ânima",

        mintermsIdentified: "Mintermos identificados",
        stage: "Estágio",
        combinedDoubles: "Combinadas",
        doubles: "duplas",
        primeImplicantsFound: "Implicantes Primos encontrados",
        expressionError: "Expressão inválida. Verifique os operadores e variáveis.",
        kmapLimit: "Mapa de Karnaugh disponível apenas para até 4 variáveis.",
        noMintermsFound: "Nenhum mintermo (S=1) encontrado.",
        noMaxtermsFound: "Nenhum maxtermo (S=0) encontrado.",
        historyEmpty: "Nenhuma expressão calculada ainda.",
        clearHistory: "Limpar Histórico",
        processing: "Processando...",
        savePDF: "Baixar PDF",
        pdfDescription: "Salve um documento PDF com todas as tabelas, mapas e expressões simplificadas.",
        sopTitle: "Soma de Produtos (SOP)",
        posTitle: "Produto de Somas (POS)",
        standardExpression: "Expressão Padrão:"
    },
    en: {
        appTitle: "Digital Logic Calculator",
        appSubtitle: "Truth Table, Karnaugh Map and Simplification",
        sectionInput: "Function Input",
        sectionVars: "Variables",
        sectionExamples: "Visual Identities",
        sectionHistory: "History",
        expressionPlaceholder: "Ex: X.Y + ~Z + A.B",
        calculate: "Calculate",
        clear: "Clear",
        detectedVars: "Detected variables:",
        truthTableTitle: "Truth Table",
        kmapTitle: "Karnaugh Map",
        simplifiedTitle: "Simplified Expression:",
        stepsTitle: "Calculation Steps:",
        noMinterms: "No minterms selected (output is always 0).",
        allMinterms: "All minterms selected (output is always 1).",
        footerText: "Developed to assist studies in Applied Computational Mathematics - Ânima",

        mintermsIdentified: "Identified minterms",
        stage: "Stage",
        combinedDoubles: "Combined",
        doubles: "pairs",
        primeImplicantsFound: "Prime implicants found",
        expressionError: "Invalid expression. Check operators and variables.",
        kmapLimit: "Karnaugh Map is only available for up to 4 variables.",
        noMintermsFound: "No minterms (S=1) found.",
        noMaxtermsFound: "No maxterms (S=0) found.",
        historyEmpty: "No expression calculated yet.",
        clearHistory: "Clear History",
        processing: "Processing...",
        savePDF: "Download PDF",
        pdfDescription: "Save a PDF document with all tables, maps, and simplified expressions.",
        sopTitle: "Sum of Products (SOP)",
        posTitle: "Product of Sums (POS)",
        standardExpression: "Standard Expression:"
    }
};

let currentLang = "pt";

function t(key) {
    return translations[currentLang][key] || key;
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    updateVarCount(3);
    initExamples();
    translatePage();

    // TEMA ESCURO: Inicialização
    const savedTheme = localStorage.getItem("theme");
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    if (savedTheme === "dark" || (!savedTheme && prefersDark)) {
        document.documentElement.classList.add("dark");
        const themeIcon = document.getElementById("themeIcon");
        if (themeIcon) {
            themeIcon.classList.remove("fa-moon");
            themeIcon.classList.add("fa-sun");
        }
    }
});

// ==================== TEMA ESCURO (TOGGLE) ====================
function toggleTheme() {
    const htmlElement = document.documentElement;
    const themeIcon = document.getElementById("themeIcon");

    htmlElement.classList.toggle("dark");

    if (htmlElement.classList.contains("dark")) {
        themeIcon.classList.remove("fa-moon");
        themeIcon.classList.add("fa-sun");
        localStorage.setItem("theme", "dark");
    } else {
        themeIcon.classList.remove("fa-sun");
        themeIcon.classList.add("fa-moon");
        localStorage.setItem("theme", "light");
    }
}

// ==================== VARIÁVEIS E TRADUÇÃO ====================
function ensureVariables() {
    const defaultVars = ['A', 'B', 'C', 'D', 'E'];
    if (currentVariables.length < currentVarCount) {
        for (let i = currentVariables.length; i < currentVarCount; i++) {
            currentVariables.push(defaultVars[i]);
        }
    }
}

function updateVarCount(count) {
    currentVarCount = parseInt(count);
    const totalRows = Math.pow(2, currentVarCount);
    currentOutputs = new Array(totalRows).fill(0);

    const input = document.getElementById('expressionInput').value.trim();
    if (input) calculateFromExpression();
    else renderAll();
}

function translatePage() {
    const lang = translations[currentLang];

    document.getElementById("appTitle").textContent = lang.appTitle;
    document.getElementById("appSubtitle").textContent = lang.appSubtitle;
    document.getElementById("sectionInput").innerHTML = `<i class="fas fa-keyboard text-blue-500"></i> ${lang.sectionInput}`;
    document.getElementById("sectionVars").innerHTML = `<i class="fas fa-list-ol text-blue-500"></i> ${lang.sectionVars}`;

    const sectionExamplesEl = document.getElementById("sectionExamples");
    if (sectionExamplesEl) {
        sectionExamplesEl.innerHTML = `<i class="fas fa-layer-group text-blue-500"></i> ${lang.sectionExamples}`;
    }

    const historyTitleEl = document.getElementById("historyTitle");
    if (historyTitleEl) {
        historyTitleEl.innerHTML = `<i class="fas fa-history text-blue-500"></i> ${lang.sectionHistory}`;
    }

    // Translate SOP and POS titles
    const sopTitleEl = document.getElementById("sopTitle");
    if (sopTitleEl) {
        sopTitleEl.innerHTML = `<i class="fas fa-plus text-green-500"></i> ${lang.sopTitle}`;
    }

    const posTitleEl = document.getElementById("posTitle");
    if (posTitleEl) {
        posTitleEl.innerHTML = `<i class="fas fa-times text-red-500"></i> ${lang.posTitle}`;
    }

    const sopStandardTitleEl = document.getElementById("sopStandardExprTitle");
    if (sopStandardTitleEl) {
        sopStandardTitleEl.textContent = lang.standardExpression;
    }

    const posStandardTitleEl = document.getElementById("posStandardExprTitle");
    if (posStandardTitleEl) {
        posStandardTitleEl.textContent = lang.standardExpression;
    }

    // Translate example labels
    const exampleLabels = {
        pt: ["Lei da Absorção", "Teorema de De Morgan", "Adjacência Lógica", "Teorema do Consenso", "Padrão de Paridade"],
        en: ["Absorption Law", "De Morgan's Theorem", "Logical Adjacency", "Consensus Theorem", "Parity Pattern"]
    };

    const labels = exampleLabels[currentLang];
    for (let i = 1; i <= 5; i++) {
        const el = document.getElementById(`example${i}Label`);
        if (el && labels[i - 1]) {
            el.textContent = labels[i - 1];
        }
    }

    // Translate expression error message
    const expressionError = document.getElementById('expressionError');
    if (expressionError) {
        expressionError.textContent = lang.expressionError;
    }

    // Translate operators section
    const operatorsDiv = document.querySelector('.mt-3.p-3.bg-gray-50');
    if (operatorsDiv) {
        const title = operatorsDiv.querySelector('.text-xs.font-bold');
        if (title) {
            title.textContent = currentLang === 'en' ? 'Operators:' : 'Operadores:';
        }
    }

    document.getElementById("expressionInput").placeholder = lang.expressionPlaceholder;
    if (document.getElementById("detectedText"))
        document.getElementById("detectedText").textContent = lang.detectedVars;

    document.getElementById("truthTableTitle").innerHTML = `<i class="fas fa-table text-blue-500"></i> ${lang.truthTableTitle}`;
    document.getElementById("kmapTitle").innerHTML = `<i class="fas fa-th text-blue-500"></i> ${lang.kmapTitle}`;
    document.getElementById("simplifiedTitle").textContent = lang.simplifiedTitle;
    document.getElementById("stepsTitle").textContent = lang.stepsTitle;
    document.getElementById("footerText").textContent = lang.footerText;

    const btnCalc = document.getElementById("btnCalculate");
    const btnClr = document.getElementById("btnClear");
    if (btnCalc) btnCalc.textContent = lang.calculate;
    if (btnClr) btnClr.textContent = lang.clear;

    // Translate clear history button
    const clearHistoryBtn = document.querySelector('button[onclick="clearHistory()"]');
    if (clearHistoryBtn) {
        clearHistoryBtn.innerHTML = `<i class="fas fa-trash-alt"></i> ${lang.clearHistory}`;
    }

    // Translate PDF button and description
    const btnFullReport = document.getElementById("btnFullReport");
    if (btnFullReport) {
        btnFullReport.innerHTML = `<i class="fas fa-file-pdf"></i> ${lang.savePDF}`;
    }

    const pdfDescription = document.querySelector('p.text-xs.text-gray-500');
    if (pdfDescription) {
        pdfDescription.textContent = lang.pdfDescription;
    }

    renderAll();
}

function changeLanguage() {
    currentLang = document.getElementById("languageSelect").value;
    translatePage();
}

// ==================== DETECÇÃO DE VARIÁVEIS ====================
function extractVariables(expr) {
    const varSet = new Set();
    const matches = expr.match(/[a-zA-Z]/g) || [];

    matches.forEach(letter => {
        const upper = letter.toUpperCase();
        const forbidden = ['AND', 'OR', 'NOT', 'XOR', 'V', 'E', 'OU'];

        if (!forbidden.includes(upper)) {
            varSet.add(upper);
        }
    });

    return Array.from(varSet).sort();
}

// ==================== AVALIAÇÃO DE EXPRESSÃO ====================
function evaluateExpression(expr, variables) {
    const errorDiv = document.getElementById('expressionError');
    errorDiv.classList.add('hidden');

    let standardized = expr
        .replace(/\s+/g, '')
        .replace(/\[/g, '(').replace(/\]/g, ')')
        .replace(/\{/g, '(').replace(/\}/g, ')')
        .replace(/<->/g, '===')
        .replace(/->/g, '<=')
        .replace(/v/g, '||').replace(/V/g, '||')
        .replace(/ou/g, '||').replace(/OU/g, '||')
        .replace(/\^/g, '&&')
        .replace(/\./g, '&&')
        .replace(/\+/g, '||')
        .replace(/~/g, '!')
        .replace(/⊕/g, '^')
        .replace(/&/g, '&&')
        .replace(/\|/g, '||')
        .replace(/!/g, '!');

    currentVariables.forEach((varName, index) => {
        const val = variables[index] !== undefined ? variables[index] : 0;
        const regex = new RegExp(`(?<![a-zA-Z])${varName}(?![a-zA-Z])`, 'gi');
        standardized = standardized.replace(regex, val);
    });

    try {
        const result = new Function(`return ${standardized}`)();
        return result ? 1 : 0;
    } catch (e) {
        errorDiv.textContent = t('expressionError');
        errorDiv.classList.remove('hidden');
        return null;
    }
}

// ==================== CÁLCULO DA EXPRESSÃO ====================
function calculateFromExpression() {
    const input = document.getElementById('expressionInput').value.trim();
    if (!input) return;
    addToHistory(input);

    currentExpression = input;
    currentVariables = extractVariables(input);

    if (currentVariables.length === 0) currentVariables = ['A', 'B', 'C'];
    currentVarCount = Math.min(currentVariables.length, 6);

    const totalRows = Math.pow(2, currentVarCount);
    currentOutputs = new Array(totalRows).fill(0);

    for (let i = 0; i < totalRows; i++) {
        const binary = i.toString(2).padStart(currentVarCount, '0').split('').map(Number);
        const result = evaluateExpression(input, binary);
        if (result !== null) currentOutputs[i] = result;
    }

    // Atualiza rádio buttons visuais de acordo com o detectado
    document.querySelectorAll('input[name="varCount"]').forEach(rb => {
        if (parseInt(rb.value) === currentVarCount) rb.checked = true;
    });

    const varsListEl = document.getElementById('varsList');
    if (varsListEl) varsListEl.textContent = currentVariables.join(', ');

    renderAll();
}

// ==================== RENDERIZAÇÃO ====================
function renderAll() {
    renderTruthTable();
    renderKMap();
    updateSimplifiedExpression();
    renderSOP();
    renderPOS();
}

function renderTruthTable() {
    ensureVariables();
    const table = document.getElementById('truthTable');
    const varNames = currentVariables.slice(0, currentVarCount);

    let html = `
        <thead>
            <tr class="bg-gray-100 border-b-2 border-gray-200 transition-colors duration-200">
                ${varNames.map(v => `<th class="p-2 font-bold">${v}</th>`).join('')}
                <th class="p-2 font-bold text-blue-600">S</th>
            </tr>
        </thead>
        <tbody>
    `;

    const totalRows = Math.pow(2, currentVarCount);
    for (let i = 0; i < totalRows; i++) {
        const binary = i.toString(2).padStart(currentVarCount, '0').split('').map(Number);
        html += `
            <tr class="truth-table-row border-b border-gray-100 transition-colors duration-200">
                ${binary.map(b => `<td class="p-2">${b}</td>`).join('')}
                <td class="p-2 cursor-pointer font-bold hover:bg-blue-50 transition" onclick="toggleOutput(${i})">
                    <span class="${currentOutputs[i] ? 'text-blue-600' : 'text-gray-400 dark:text-gray-600'}">${currentOutputs[i]}</span>
                </td>
            </tr>
        `;
    }
    html += '</tbody>';
    table.innerHTML = html;
}

function toggleOutput(index) {
    currentOutputs[index] = currentOutputs[index] === 1 ? 0 : 1;
    renderAll();
}

// ==================== MAPA DE KARNAUGH ====================
// ==================== MAPA DE KARNAUGH ====================
function renderKMap() {
    const container = document.getElementById('kmapContainer');
    const varCount = currentVarCount;

    ensureVariables();

    if (varCount > 4) {
        container.innerHTML = `<p class="text-amber-600 font-medium">${t('kmapLimit')}</p>`;
        return;
    }

    const grayCode2 = ['0', '1'];
    const grayCode4 = ['00', '01', '11', '10'];

    let html = '';
    let rows = [], cols = [];
    let rowLabel = '', colLabel = '';

    if (varCount === 2) {
        rowLabel = currentVariables[0] || 'A';
        colLabel = currentVariables[1] || 'B';
        rows = grayCode2;
        cols = grayCode2;
    } else if (varCount === 3) {
        rowLabel = currentVariables[0] || 'A';
        colLabel = (currentVariables[1] || 'B') + (currentVariables[2] || 'C');
        rows = grayCode2;
        cols = grayCode4;
    } else if (varCount === 4) {
        rowLabel = (currentVariables[0] || 'A') + (currentVariables[1] || 'B');
        colLabel = (currentVariables[2] || 'C') + (currentVariables[3] || 'D');
        rows = grayCode4;
        cols = grayCode4;
    }

    html += `<div class="relative mx-auto mt-2">`;
    html += `<div class="grid" style="grid-template-columns: repeat(${cols.length + 1}, auto);">`;

    // --- Célula do Canto: Com Linha Diagonal Perfeita em CSS ---
    html += `
        <div class="relative w-12 h-12 border-r border-b border-gray-300 dark:border-gray-600 overflow-hidden">
            
            <div class="absolute top-0 left-0 w-[142%] h-[1px] bg-gray-300 dark:bg-gray-600 origin-top-left rotate-45"></div>
            
            <div class="absolute top-0.5 right-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                ${colLabel}
            </div>
            
            <div class="absolute bottom-0 left-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                ${rowLabel}
            </div>
            
        </div>
    `;

    // Cabeçalho das colunas
    cols.forEach(c => {
        html += `<div class="w-14 h-12 flex items-center justify-center font-mono text-sm text-gray-500 dark:text-gray-400">${c}</div>`;
    });

    // Linhas do mapa
    rows.forEach((r) => {
        html += `<div class="w-12 h-14 flex items-center justify-center font-mono text-sm text-gray-500 dark:text-gray-400">${r}</div>`;

        cols.forEach((c) => {
            const binary = r + c;
            const index = parseInt(binary, 2);
            const isActive = currentOutputs[index] === 1;

            html += `
                <div class="kmap-cell w-14 h-14 ${isActive ? 'active' : ''}" 
                     onclick="toggleOutput(${index})">
                    ${currentOutputs[index]}
                </div>`;
        });
    });

    html += `</div></div>`;
    container.innerHTML = html;
}

// ==================== SIMPLIFICAÇÃO ====================
function updateSimplifiedExpression() {
    const resultSection = document.getElementById('resultSection');
    const simplifiedDiv = document.getElementById('simplifiedExpression');
    const stepsUl = document.getElementById('calculationSteps');

    const minterms = currentOutputs
        .map((val, i) => val === 1 ? i : null)
        .filter(v => v !== null);

    if (minterms.length === 0) {
        simplifiedDiv.innerText = "0";
        stepsUl.innerHTML = `<li>${t('noMinterms')}</li>`;
        resultSection.classList.remove('hidden');
        return;
    }
    if (minterms.length === Math.pow(2, currentVarCount)) {
        simplifiedDiv.innerText = "1";
        stepsUl.innerHTML = `<li>${t('allMinterms')}</li>`;
        resultSection.classList.remove('hidden');
        return;
    }

    const resultData = simplifyWithSteps(minterms, currentVarCount);
    simplifiedDiv.innerText = resultData.expression || "0";
    stepsUl.innerHTML = resultData.steps.map(s => `<li>${s}</li>`).join('');
    resultSection.classList.remove('hidden');
}

function simplifyWithSteps(minterms, varCount) {
    ensureVariables();
    const varNames = currentVariables.slice(0, varCount);
    let steps = [];

    steps.push(`${t('mintermsIdentified')}: ${minterms.join(', ')}`);

    let groups = {};
    minterms.forEach(m => {
        const bin = m.toString(2).padStart(varCount, '0');
        const ones = (bin.match(/1/g) || []).length;
        if (!groups[ones]) groups[ones] = [];
        groups[ones].push({ bin, combined: false, source: [m] });
    });

    let primeImplicants = [];
    let currentGroups = groups;
    let stage = 1;

    while (Object.keys(currentGroups).length > 0) {
        let nextGroups = {};
        let foundAnyMatch = false;
        let matchesInThisStage = 0;

        const keys = Object.keys(currentGroups).sort((a, b) => a - b);

        for (let i = 0; i < keys.length - 1; i++) {
            const group1 = currentGroups[keys[i]];
            const group2 = currentGroups[keys[i + 1]];

            group1.forEach(m1 => {
                group2.forEach(m2 => {
                    let diffIndex = -1, diffCount = 0;
                    for (let j = 0; j < varCount; j++) {
                        if (m1.bin[j] !== m2.bin[j]) {
                            diffCount++;
                            diffIndex = j;
                        }
                    }
                    if (diffCount === 1) {
                        foundAnyMatch = true;
                        m1.combined = m2.combined = true;
                        const newBin = m1.bin.substring(0, diffIndex) + '-' + m1.bin.substring(diffIndex + 1);
                        const ones = (newBin.replace(/-/g, '').match(/1/g) || []).length;

                        if (!nextGroups[ones]) nextGroups[ones] = [];
                        if (!nextGroups[ones].some(g => g.bin === newBin)) {
                            nextGroups[ones].push({
                                bin: newBin,
                                combined: false,
                                source: [...new Set([...m1.source, ...m2.source])].sort((a, b) => a - b)
                            });
                            matchesInThisStage++;
                        }
                    }
                });
            });
        }

        Object.values(currentGroups).flat().forEach(m => {
            if (!m.combined && !primeImplicants.some(p => p.bin === m.bin)) {
                primeImplicants.push(m);
            }
        });

        if (foundAnyMatch) {
            steps.push(`${t('stage')} ${stage}: ${t('combinedDoubles')} ${matchesInThisStage} ${t('doubles')}.`);
            stage++;
        }
        if (!foundAnyMatch) break;
        currentGroups = nextGroups;
    }

    steps.push(`${t('primeImplicantsFound')}: ${primeImplicants.map(pi => pi.bin).join(', ')}`);

    const terms = primeImplicants.map(pi => {
        let parts = [];
        for (let i = 0; i < varCount; i++) {
            if (pi.bin[i] === '1') parts.push(varNames[i]);
            else if (pi.bin[i] === '0') parts.push('~' + varNames[i]);
        }
        return parts.length ? parts.join(' . ') : "1";
    });

    return {
        expression: terms.join(' + ') || "0",
        steps: steps
    };
}

// ==================== UTILITIES ====================
function clearAll() {
    document.getElementById('expressionInput').value = "";
    currentOutputs.fill(0);
    renderAll();
}

function initExamples() {
    const container = document.getElementById('examplesContainer');
    const examples = [
        { name: "Tabela 1 (2 vars) - Imagem 3", type: 'table', data: [0, 1, 1, 1], vars: 2 },
        { name: "Tabela 2 (3 vars) - Imagem 3", type: 'table', data: [1, 1, 0, 1, 0, 1, 0, 1], vars: 3 },
        { name: "Tabela 3 (4 vars) - Imagem 3", type: 'table', data: [0, 1, 1, 1, 0, 0, 0, 0, 1, 1, 0, 0, 1, 0, 1, 1], vars: 4 },
        { name: "Exercício 19 - ~A + A.B + A.~C + A.~B.~C", type: 'expr', expr: "~A + A . B + A . ~C + A . ~B . ~C", vars: 3 },
        { name: "Exercício 13 - A.B + A.~B + ~A.~B", type: 'expr', expr: "A . B + A . ~B + ~A . ~B", vars: 2 },
        { name: "Exercício 29 - ~(~X.~Y.~Z).(X+Y+~Z)", type: 'expr', expr: "~(!A . !B . !C) . (A + B + !C)", vars: 3 },
        { name: "Fluxo Automatizado (Imagem 2) - Ex 4", type: 'expr', expr: "(P ^ Q) -> R", vars: 3 },
        { name: "Ambiente Alta Disp (Imagem 2) - Ex 5", type: 'expr', expr: "P -> (Q v R v S)", vars: 4 },
        { name: "Ex 33 (Imagem 1) - Extr. Avançado", type: 'expr', expr: "(W + X + Y) . (W + ~X + Y) . (~Y + Z) . (W + Z)", vars: 4 },
        { name: "Ex 26 (Imagem 1) - Muito Avançado", type: 'expr', expr: "[(A + B) . C] + [D . (C + ~B)]", vars: 4 }
    ];

    container.innerHTML = examples.map((ex, idx) => `
        <button onclick="loadExample(${idx})" class="text-left p-2 text-sm hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-lg transition dark:hover:bg-gray-700">
            <i class="fas fa-file-code text-blue-400 mr-2"></i> ${ex.name}
        </button>
    `).join('');

    window.allExamples = examples;
}

function loadExample(idx) {
    const ex = window.allExamples[idx];
    updateVarCount(ex.vars);

    document.querySelectorAll('input[name="varCount"]').forEach(rb => {
        if (parseInt(rb.value) === ex.vars) rb.checked = true;
    });

    if (ex.type === 'expr') {
        document.getElementById('expressionInput').value = ex.expr;
        calculateFromExpression();
    } else {
        document.getElementById('expressionInput').value = "";
        currentOutputs = [...ex.data];
        renderAll();
    }
}

// ==================== EXPORTAÇÃO PARA PDF (DOWNLOAD DIRETO CORRIGIDO) ====================
function downloadPDF() {
    const element = document.getElementById('kmapCard');
    const btn = element.querySelector('button[onclick="downloadPDF()"]');
    const watermark = document.getElementById('watermark');

    // 1. Esconde o botão para não sair no PDF
    if (btn) btn.style.display = 'none';

    // 2. Revela a marca de água removendo o hidden e forçando a exibição
    if (watermark) {
        watermark.classList.remove('hidden');
        watermark.style.setProperty('display', 'block', 'important');
    }

    const opt = {
        margin: 10,
        filename: 'Mapa_Karnaugh.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // 3. O SEGREDO: Aguarda 100ms para o navegador processar o HTML antes de gerar o PDF
    setTimeout(() => {
        html2pdf().set(opt).from(element).save().then(() => {
            // Torna a colocar o botão no ecrã
            if (btn) btn.style.display = 'flex';

            // Oculta a marca de água novamente
            if (watermark) {
                watermark.classList.add('hidden');
                watermark.style.removeProperty('display');
            }
        });
    }, 100); // 100 milissegundos são suficientes para o motor gráfico atualizar
}

// ==================== EXPORTAÇÃO PARA PDF (TABELA VERDADE) ====================
function downloadTruthTablePDF() {
    const element = document.getElementById('truthTableCard');
    const btn = element.querySelector('button[onclick="downloadTruthTablePDF()"]');
    const watermark = document.getElementById('watermarkTT');

    // 1. Esconde o botão para não sair no PDF
    if (btn) btn.style.display = 'none';

    // 2. Revela a marca de água 
    if (watermark) {
        watermark.classList.remove('hidden');
        watermark.style.setProperty('display', 'block', 'important');
    }

    const opt = {
        margin: 10,
        filename: 'Tabela_Verdade.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // 3. Aguarda 100ms para o navegador renderizar a marca-d'água e tira a "foto"
    setTimeout(() => {
        html2pdf().set(opt).from(element).save().then(() => {
            // Devolve o botão à tela
            if (btn) btn.style.display = 'flex';

            // Oculta a marca de água novamente
            if (watermark) {
                watermark.classList.add('hidden');
                watermark.style.removeProperty('display');
            }
        });
    }, 100);
}

// ==================== MENU EXPANSÍVEL (EXEMPLOS RÁPIDOS) ====================
function toggleExamples() {
    const content = document.getElementById('examplesContent');
    const chevron = document.getElementById('examplesChevron');

    // Mostra/esconde o seu conteúdo original
    content.classList.toggle('hidden');

    // Gira a setinha
    if (content.classList.contains('hidden')) {
        chevron.classList.remove('rotate-180');
    } else {
        chevron.classList.add('rotate-180');
    }
}

// ==================== EXPORTAÇÃO PARA PDF (SOP E POS) ====================

function downloadSOPPDF() {
    const element = document.getElementById('sopCard');
    if (!element) return;

    const btn = element.querySelector('button');
    const watermark = document.getElementById('watermarkSOP');

    // Procura a div que envolve a tabela e cria a barra de rolagem
    const tableContainer = element.querySelector('.overflow-x-auto');

    // 1. PREPARAR O TERRENO (Remover limites e botões)
    if (btn) btn.style.display = 'none';
    if (watermark) {
        watermark.classList.remove('hidden');
        watermark.style.setProperty('display', 'block', 'important');
    }

    // O SEGREDO DA CORREÇÃO: Forçar o card e a tabela a mostrarem 100% do conteúdo
    element.classList.remove('overflow-hidden', 'h-full');
    element.style.height = 'max-content';
    if (tableContainer) {
        tableContainer.classList.remove('overflow-x-auto');
        tableContainer.style.overflow = 'visible';
    }

    const opt = {
        margin: 10,
        filename: 'Soma_de_Produtos_SOP.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 }, // scrollY: 0 ajuda a alinhar o print
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // 2. TIRAR A "FOTO" E DEVOLVER TUDO AO NORMAL
    setTimeout(() => {
        html2pdf().set(opt).from(element).save().then(() => {
            // Devolve o botão e esconde a marca d'água
            if (btn) btn.style.display = 'flex';
            if (watermark) {
                watermark.classList.add('hidden');
                watermark.style.removeProperty('display');
            }

            // Devolve as restrições de tamanho da tela original
            element.classList.add('overflow-hidden', 'h-full');
            element.style.height = '';
            if (tableContainer) {
                tableContainer.classList.add('overflow-x-auto');
                tableContainer.style.overflow = '';
            }
        });
    }, 150); // 150ms dá o tempo exato para o navegador expandir a tabela antes do print
}

function downloadPOSPDF() {
    const element = document.getElementById('posCard');
    if (!element) return;

    const btn = element.querySelector('button');
    const watermark = document.getElementById('watermarkPOS');
    const tableContainer = element.querySelector('.overflow-x-auto');

    // 1. PREPARAR O TERRENO
    if (btn) btn.style.display = 'none';
    if (watermark) {
        watermark.classList.remove('hidden');
        watermark.style.setProperty('display', 'block', 'important');
    }

    // Forçar expansão total
    element.classList.remove('overflow-hidden', 'h-full');
    element.style.height = 'max-content';
    if (tableContainer) {
        tableContainer.classList.remove('overflow-x-auto');
        tableContainer.style.overflow = 'visible';
    }

    const opt = {
        margin: 10,
        filename: 'Produto_de_Somas_POS.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };

    // 2. TIRAR A "FOTO" E DEVOLVER TUDO AO NORMAL
    setTimeout(() => {
        html2pdf().set(opt).from(element).save().then(() => {
            if (btn) btn.style.display = 'flex';
            if (watermark) {
                watermark.classList.add('hidden');
                watermark.style.removeProperty('display');
            }

            element.classList.add('overflow-hidden', 'h-full');
            element.style.height = '';
            if (tableContainer) {
                tableContainer.classList.add('overflow-x-auto');
                tableContainer.style.overflow = '';
            }
        });
    }, 150);
}

// ==================== CÁLCULO DE SOP (Mintermos) ====================
function renderSOP() {
    ensureVariables();
    const table = document.getElementById('sopTable');
    const exprDiv = document.getElementById('sopExpression');
    const defaultVars = ['A', 'B', 'C', 'D', 'E']; // Nossa rede de segurança

    const productTermLabel = currentLang === 'en' ? 'Product Term' : 'Termo Produto';

    // Cabeçalho
    let html = `<thead><tr class="bg-gray-100 dark:bg-[#1e1e1e] text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-[#3c3c3c]">
                    <th class="p-2">m(i)</th>`;

    // Puxa as variáveis de forma segura
    for (let j = 0; j < currentVarCount; j++) {
        let varName = currentVariables[j] || defaultVars[j];
        html += `<th class="p-2">${varName}</th>`;
    }
    html += `<th class="p-2 text-green-600 dark:text-green-400">${productTermLabel}</th></tr></thead><tbody>`;

    let terms = [];
    let hasMinterms = false;

    currentOutputs.forEach((out, i) => {
        if (out === 1) {
            hasMinterms = true;
            let binaryStr = i.toString(2).padStart(currentVarCount, '0');
            let term = '';

            let rowHtml = `<tr class="border-b border-gray-100 dark:border-[#3c3c3c] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors"><td class="p-2 font-mono text-gray-500">m${i}</td>`;

            for (let j = 0; j < currentVarCount; j++) {
                let bit = binaryStr[j];
                rowHtml += `<td class="p-2">${bit}</td>`;

                // Variável segura
                let varName = currentVariables[j] || defaultVars[j];
                term += (bit === '1') ? varName : `~${varName}`;
                if (j < currentVarCount - 1) term += '.';
            }

            rowHtml += `<td class="p-2 font-bold text-green-600 dark:text-green-400 font-mono">${term}</td></tr>`;
            html += rowHtml;
            terms.push(term);
        }
    });

    html += '</tbody>';
    table.innerHTML = hasMinterms ? html : `<tr><td colspan="${currentVarCount + 2}" class="p-4 text-gray-500 text-sm">${t('noMintermsFound')}</td></tr>`;
    exprDiv.innerHTML = hasMinterms ? terms.join(' + ') : '0';
}

// ==================== CÁLCULO DE POS (Maxtermos) ====================
function renderPOS() {
    ensureVariables();
    const table = document.getElementById('posTable');
    const exprDiv = document.getElementById('posExpression');
    const defaultVars = ['A', 'B', 'C', 'D', 'E']; // Nossa rede de segurança

    const sumTermLabel = currentLang === 'en' ? 'Sum Term' : 'Termo Soma';

    // Cabeçalho
    let html = `<thead><tr class="bg-gray-100 dark:bg-[#1e1e1e] text-gray-600 dark:text-gray-400 border-b border-gray-200 dark:border-[#3c3c3c]">
                    <th class="p-2">M(i)</th>`;

    // Puxa as variáveis de forma segura
    for (let j = 0; j < currentVarCount; j++) {
        let varName = currentVariables[j] || defaultVars[j];
        html += `<th class="p-2">${varName}</th>`;
    }
    html += `<th class="p-2 text-red-600 dark:text-red-400">${sumTermLabel}</th></tr></thead><tbody>`;

    let terms = [];
    let hasMaxterms = false;

    currentOutputs.forEach((out, i) => {
        if (out === 0) {
            hasMaxterms = true;
            let binaryStr = i.toString(2).padStart(currentVarCount, '0');
            let term = '(';

            let rowHtml = `<tr class="border-b border-gray-100 dark:border-[#3c3c3c] hover:bg-gray-50 dark:hover:bg-[#2a2a2a] transition-colors"><td class="p-2 font-mono text-gray-500">M${i}</td>`;

            for (let j = 0; j < currentVarCount; j++) {
                let bit = binaryStr[j];
                rowHtml += `<td class="p-2">${bit}</td>`;

                // Variável segura
                let varName = currentVariables[j] || defaultVars[j];
                term += (bit === '0') ? varName : `~${varName}`;
                if (j < currentVarCount - 1) term += ' + ';
            }
            term += ')';

            rowHtml += `<td class="p-2 font-bold text-red-600 dark:text-red-400 font-mono">${term}</td></tr>`;
            html += rowHtml;
            terms.push(term);
        }
    });

    html += '</tbody>';
    table.innerHTML = hasMaxterms ? html : `<tr><td colspan="${currentVarCount + 2}" class="p-4 text-gray-500 text-sm">${t('noMaxtermsFound')}</td></tr>`;
    exprDiv.innerHTML = hasMaxterms ? terms.join(' . ') : '1';
}

// ==================== EXPORTAÇÃO PARA PDF (DEFINITIVA - PÁGINA NA MEMÓRIA) ====================

function downloadFullReport() {

    const element = document.getElementById('fullReportArea');
    const pdfSection = document.querySelector('.md\\:w-64');

    // ESCONDE O BALÃO COMPLETO
    if (pdfSection) {
    pdfSection.style.visibility = 'hidden';
}

    const opt = {
        margin: 0.3,
        filename: 'relatorio-logica.pdf',
        image: { type: 'jpeg', quality: 1 },

        html2canvas: {
            scale: 2,
            useCORS: true,
            backgroundColor: null,
            scrollX: 0,
            scrollY: 0
        },

        jsPDF: {
            unit: 'in',
            format: 'a4',
            orientation: 'portrait'
        },

        pagebreak: {
            mode: ['avoid-all', 'css', 'legacy']
        }
    };

    // Cards que vão receber assinatura
const cards = [
    document.getElementById('truthTableCard'),
    document.getElementById('kmapCard'),
    document.getElementById('sopCard'),
    document.getElementById('posCard')
];

// Adiciona assinatura temporária
cards.forEach(card => {

    const assinatura = document.createElement('div');

    assinatura.className = 'temp-pdf-signature';

    assinatura.innerText = 'Gerado por calculadora digital.com';

    assinatura.style.marginTop = '20px';
    assinatura.style.paddingTop = '8px';
    assinatura.style.borderTop = '1px solid #ddd';
    assinatura.style.textAlign = 'center';
    assinatura.style.fontSize = '10px';
    assinatura.style.color = 'rgba(120,120,120,0.45)';
    assinatura.style.fontStyle = 'italic';

    card.appendChild(assinatura);
});

    setTimeout(() => {

    html2pdf()
        .set(opt)
        .from(element)
        .save();

}, 100);


// Remove assinaturas depois do download iniciar
setTimeout(() => {

    document.querySelectorAll('.temp-pdf-signature')
        .forEach(el => el.remove());

}, 1000);
}

// ==================== TECLADO VIRTUAL DE SÍMBOLOS ====================
function insertSymbol(symbol) {
    const input = document.getElementById('expressionInput');
    if (!input) return;

    // Apanha a posição exata onde o cursor do rato está a piscar
    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;

    // Corta o texto em dois e insere o símbolo no meio
    input.value = text.slice(0, start) + symbol + text.slice(end);

    // Empurra o cursor para a frente do símbolo que acabou de ser digitado
    input.selectionStart = input.selectionEnd = start + symbol.length;

    // Devolve o foco à caixa de texto para a pessoa continuar a escrever
    input.focus();
}
// ==================== TECLADO VIRTUAL DE SÍMBOLOS ====================

function insertSymbol(symbol) {
    const input = document.getElementById('expressionInput');
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;

    input.value = text.slice(0, start) + symbol + text.slice(end);
    input.selectionStart = input.selectionEnd = start + symbol.length;
    input.focus();
}

function backspaceSymbol() {
    const input = document.getElementById('expressionInput');
    if (!input) return;

    const start = input.selectionStart;
    const end = input.selectionEnd;
    const text = input.value;

    // Se houver texto selecionado (ex: o usuário selecionou "A+B" para apagar tudo)
    if (start !== end) {
        input.value = text.slice(0, start) + text.slice(end);
        input.selectionStart = input.selectionEnd = start;
    }
    // Se não houver seleção e o cursor não estiver no comecinho (posição 0)
    else if (start > 0) {
        input.value = text.slice(0, start - 1) + text.slice(end);
        input.selectionStart = input.selectionEnd = start - 1;
    }

    input.focus();
}