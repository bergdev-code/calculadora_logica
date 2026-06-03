// ==================== GLOBAL STATE ====================
let currentVarCount = 3;
let currentOutputs = [];
let currentExpression = "";
let currentVariables = [];

// ==================== TRADUÇÕES COM BRANDING FIXO ====================
const translations = {
    pt: {
        appTitle: "SysLogic - Calculadora de Lógica Digital",
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
        standardExpression: "Expressão Padrão:",
        clickToRecalculate: "Clique para calcular novamente",
        pdf5VarsLimit: "A exportação PDF não está disponível para funções com 5 variáveis.",
        essentialPrimeImplicants: "Implicantes Primos Essenciais",
        output: "S",
        language: "Idioma:",
        booleanExpression: "Expressão Booleana",
        or: "ou",
        aboutUs: "Sobre nós: Desenvolvido por Bergson Sales, Pedro Henrique, Pedro Conceição, Yuri Alexandre e Yuri Cortes, estudantes da instituição FPB - Faculdade Internacional da Paraíba 2026©",
        constantSignal: "Sinal constante",
        noGates: "Não requer portas lógicas."
    },
    en: {
        appTitle: "SysLogic - Digital Logic Calculator",
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
        standardExpression: "Standard Expression:",
        clickToRecalculate: "Click to recalculate",
        pdf5VarsLimit: "PDF export is not available for functions with 5 variables.",
        essentialPrimeImplicants: "Essential Prime Implicants",
        output: "Out",
        language: "Language:",
        booleanExpression: "Boolean Expression",
        or: "or",
        aboutUs: "About us: Developed by Bergson Sales, Pedro Henrique, Pedro Conceição, Yuri Alexandre, and Yuri Cortes, students at the institution FPB - Faculdade Internacional da Paraíba 2026©",
        constantSignal: "Constant signal",
        noGates: "No logic gates required.",
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
    renderHistory();

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
    ensureVariables(); // Arruma as letras sem duplicar

    const totalRows = Math.pow(2, currentVarCount);
    currentOutputs = new Array(totalRows).fill(0);

    const input = document.getElementById('expressionInput').value.trim();

    if (input) {
        // Apenas reavalia a tabela COM A NOVA QUANTIDADE, sem resetar as variáveis detectadas!
        for (let i = 0; i < totalRows; i++) {
            const binary = i.toString(2).padStart(currentVarCount, '0').split('').map(Number);
            const result = evaluateExpression(input, binary);
            if (result !== null) currentOutputs[i] = result;
        }
    }

    // Atualiza a interface (rádios) para garantir que o visual acompanha o estado
    document.querySelectorAll('input[name="varCount"]').forEach(rb => {
        if (parseInt(rb.value) === currentVarCount) rb.checked = true;
    });

    renderAll();
}

function translatePage() {
    const lang = translations[currentLang];

    document.getElementById("appTitle").textContent = lang.appTitle;
    document.getElementById("appSubtitle").textContent = lang.appSubtitle;
    // Tradução do Rótulo de Idioma
    const langLabelEl = document.getElementById("languageLabel");
    if (langLabelEl) langLabelEl.textContent = lang.language;

    // Tradução do Rótulo da Expressão Booleana
    const exprLabelEl = document.getElementById("labelExpression");
    if (exprLabelEl) exprLabelEl.textContent = lang.booleanExpression;
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
    // Tradução da seção de Operadores e os "ou"
    const operatorsDiv = document.querySelector('.mt-3.p-3.bg-gray-50');
    if (operatorsDiv) {
        const title = operatorsDiv.querySelector('.text-xs.font-bold');
        if (title) {
            title.textContent = currentLang === 'en' ? 'Operators:' : 'Operadores:';
        }

        const grid = operatorsDiv.querySelector('.grid');
        if (grid) {
            grid.innerHTML = `
                <span><b>.</b> ${lang.or} <b>&amp;</b> : AND</span>
                <span><b>+</b> ${lang.or} <b>|</b> : OR</span>
                <span><b>~</b> ${lang.or} <b>!</b> : NOT</span>
                <span><b>⊕</b> ${lang.or} <b>^</b> : XOR</span>
            `;
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

    const aboutUsEl = document.getElementById("aboutUsText");
    if (aboutUsEl) aboutUsEl.textContent = lang.aboutUs;

    const btnDownloadEl = document.getElementById("btnDownloadText");
    if (btnDownloadEl) btnDownloadEl.textContent = lang.savePDF;

    const pdfDescEl = document.getElementById("pdfDescriptionText");
    if (pdfDescEl) pdfDescEl.textContent = lang.pdfDescription;

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
    if (typeof renderHistory === 'function') renderHistory();

    const diagramTitleEl = document.getElementById("diagramTitleText");
    if (diagramTitleEl) diagramTitleEl.textContent = lang.logicDiagram || "Logic Diagram";

}

function changeLanguage() {
    currentLang = document.getElementById("languageSelect").value;
    translatePage();
}

// ==================== DETECÇÃO DE VARIÁVEIS ====================
function extractVariables(expr) {
    const reserved = ['AND', 'OR', 'NOT', 'XOR', 'OU'];

    const tokens = expr.match(/[A-Za-z]+/g) || [];

    const vars = tokens.filter(token =>
        !reserved.includes(token.toUpperCase())
    );

    return [...new Set(vars.map(v => v.toUpperCase()))].sort();
}

// ==================== AVALIAÇÃO DE EXPRESSÃO ====================
function evaluateExpression(expr, variables) {
    const errorDiv = document.getElementById('expressionError');
    errorDiv.classList.add('hidden');

    // 1. Limpa espaços, padroniza tudo para maiúsculo e arruma os parênteses
    let standardized = expr.toUpperCase().replace(/\s+/g, '')
        .replace(/\[/g, '(').replace(/\]/g, ')')
        .replace(/\{/g, '(').replace(/\}/g, ')');

    // 2. Reduz operadores duplicados para evitar o "efeito bola de neve"
    standardized = standardized
        .replace(/&&/g, '&')
        .replace(/\|\|/g, '|');

    // 3. Traduz os símbolos da sua UI para uma base segura de 1 caractere
    standardized = standardized
        .replace(/\./g, '&')
        .replace(/\+/g, '|')
        .replace(/⊕/g, '!=')
        .replace(/\^/g, '!=')
        .replace(/~/g, '!');

    // 4. Expande para a sintaxe real do JavaScript de forma segura
    standardized = standardized
        .replace(/&/g, '&&')
        .replace(/\|/g, '||');

    // 5. Substitui as variáveis (A, B, C...) pelo valor binário da tabela (0 ou 1)
    currentVariables.forEach((varName, index) => {
        const val = variables[index] !== undefined ? variables[index] : 0;
        // O limite de palavra (\b) garante segurança em qualquer celular/navegador
        const regex = new RegExp('\\b' + varName + '\\b', 'gi');
        standardized = standardized.replace(regex, val);
    });

    try {
        // Tenta calcular a expressão final (ex: "0 || 1")
        const result = new Function(`return ${standardized}`)();
        return result ? 1 : 0;
    } catch (e) {
        // Se o usuário digitou algo estruturalmente quebrado (ex: A ++ B), cai aqui
        errorDiv.textContent = t('expressionError');
        errorDiv.classList.remove('hidden');
        return null;
    }
}

// ==================== CÁLCULO DA EXPRESSÃO ====================
function calculateFromExpression() {
    const input = document.getElementById('expressionInput').value.trim();
    if (!input) return;

    // Corrigido um bugzinho de digitação (tinha uma vírgula no final da linha)
    if (typeof addToHistory === 'function') addToHistory(input);

    currentExpression = input;
    let detectedVars = extractVariables(input);

    if (detectedVars.length === 0) detectedVars = ['A', 'B', 'C', 'D', 'E'];

    // CORREÇÃO: O número de variáveis agora obedece ESTRITAMENTE o que você digitou!
    // (Limitado entre 2 e 5 para encaixar no Mapa de Karnaugh).
    currentVarCount = Math.max(2, Math.min(detectedVars.length, 5));

    currentVariables = detectedVars;
    ensureVariables(); // Arruma e ordena as letras detectadas

    const totalRows = Math.pow(2, currentVarCount);
    currentOutputs = new Array(totalRows).fill(0);

    for (let i = 0; i < totalRows; i++) {
        const binary = i.toString(2).padStart(currentVarCount, '0').split('').map(Number);
        const result = evaluateExpression(input, binary);
        if (result !== null) currentOutputs[i] = result;
    }

    // Atualiza o rádio button visualmente para mostrar a quantidade real detectada
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
    renderLogicDiagram();
}

function renderTruthTable() {
    ensureVariables();
    const table = document.getElementById('truthTable');
    const varNames = currentVariables.slice(0, currentVarCount);

    let html = `
        <thead>
            <tr class="bg-gray-100 border-b-2 border-gray-200 transition-colors duration-200">
                ${varNames.map(v => `<th class="p-2 font-bold">${v}</th>`).join('')}
                <th class="p-2 font-bold text-blue-600">${t('output')}</th>
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

// ==================== CONTROLE DE CLIQUE (SINCRONIZADO) ====================
function toggleOutput(index) {
    // 1. Inverte o valor da célula clicada (se for 0 vira 1, se for 1 vira 0)
    currentOutputs[index] = currentOutputs[index] === 1 ? 0 : 1;

    // 2. Recalcula instantaneamente as tabelas e a expressão simplificada
    renderAll();

    // 3. A MÁGICA: Pega o novo resultado gerado lá embaixo...
    const novaExpressao = document.getElementById('simplifiedExpression').innerText;
    const inputField = document.getElementById('expressionInput');

    // 4. ...e atualiza a barra de texto lá em cima automaticamente!
    if (novaExpressao && novaExpressao !== "0" && novaExpressao !== "1") {
        inputField.value = novaExpressao;
    } else {
        inputField.value = ""; // Limpa a barra se a tabela estiver toda zerada ou toda ligada
    }
}


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

// ==================== SIMPLIFICAÇÃO E MOTOR QUINE-MCCLUSKEY ====================
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

        groups[ones].push({
            bin: bin,
            combined: false,
            source: [m]
        });
    });

    let currentGroups = groups;
    let primeImplicants = [];
    let stage = 1;

    while (Object.keys(currentGroups).length > 0) {

        let nextGroups = {};
        let foundAnyMatch = false;
        let combinations = 0;

        const keys = Object.keys(currentGroups).map(Number).sort((a, b) => a - b);

        for (let i = 0; i < keys.length - 1; i++) {

            // CORREÇÃO MATEMÁTICA: Só podemos comparar grupos se a diferença de '1s' for exatamente 1
            if (keys[i + 1] !== keys[i] + 1) continue;

            const groupA = currentGroups[keys[i]];
            const groupB = currentGroups[keys[i + 1]];

            groupA.forEach(a => {
                groupB.forEach(b => {
                    let diffCount = 0;
                    let diffIndex = -1;

                    for (let j = 0; j < varCount; j++) {
                        if (a.bin[j] !== b.bin[j]) {
                            diffCount++;
                            diffIndex = j;
                        }
                    }

                    if (diffCount === 1) {
                        foundAnyMatch = true;
                        a.combined = true;
                        b.combined = true;

                        const newBin = a.bin.substring(0, diffIndex) + '-' + a.bin.substring(diffIndex + 1);
                        const ones = (newBin.match(/1/g) || []).length;

                        if (!nextGroups[ones]) {
                            nextGroups[ones] = [];
                        }

                        if (!nextGroups[ones].some(x => x.bin === newBin)) {
                            nextGroups[ones].push({
                                bin: newBin,
                                combined: false,
                                source: [...new Set([...a.source, ...b.source])]
                            });
                            combinations++;
                        }
                    }
                });
            });
        }

        // CORREÇÃO CRÍTICA: Substituído o .flat() pelo .reduce para compatibilidade em 100% dos navegadores!
        Object.values(currentGroups).reduce((acc, val) => acc.concat(val), []).forEach(item => {
            if (!item.combined && !primeImplicants.some(pi => pi.bin === item.bin)) {
                primeImplicants.push(item);
            }
        });

        if (foundAnyMatch) {
            steps.push(`${t('stage')} ${stage}: ${t('combinedDoubles')} ${combinations} ${t('doubles')}.`);
            stage++;
        }

        if (!foundAnyMatch) break;
        currentGroups = nextGroups;
    }

    steps.push(`${t('primeImplicantsFound')}: ${primeImplicants.map(pi => pi.bin).join(', ')}`);

    // --- TABELA DE COBERTURA ---
    function coversMinterm(implicant, minterm) {
        const binary = minterm.toString(2).padStart(varCount, '0');
        for (let i = 0; i < implicant.length; i++) {
            if (implicant[i] !== '-' && implicant[i] !== binary[i]) {
                return false;
            }
        }
        return true;
    }

    const coverageTable = {};
    minterms.forEach(minterm => {
        coverageTable[minterm] = [];
        primeImplicants.forEach((pi, index) => {
            if (coversMinterm(pi.bin, minterm)) {
                coverageTable[minterm].push(index);
            }
        });
    });

    const selected = new Set();
    Object.values(coverageTable).forEach(indices => {
        if (indices.length === 1) {
            selected.add(indices[0]);
        }
    });

    const coveredMinterms = new Set();
    selected.forEach(index => {
        minterms.forEach(m => {
            if (coversMinterm(primeImplicants[index].bin, m)) {
                coveredMinterms.add(m);
            }
        });
    });

    while (coveredMinterms.size < minterms.length) {
        let bestPI = -1;
        let bestCoverage = -1;

        primeImplicants.forEach((pi, index) => {
            if (selected.has(index)) return;
            let count = 0;
            minterms.forEach(m => {
                if (!coveredMinterms.has(m) && coversMinterm(pi.bin, m)) {
                    count++;
                }
            });
            if (count > bestCoverage) {
                bestCoverage = count;
                bestPI = index;
            }
        });

        if (bestPI === -1) break;

        selected.add(bestPI);
        minterms.forEach(m => {
            if (coversMinterm(primeImplicants[bestPI].bin, m)) {
                coveredMinterms.add(m);
            }
        });
    }

    const finalImplicants = [...selected].map(i => primeImplicants[i]);
    steps.push(`${t('essentialPrimeImplicants')}: ${finalImplicants.map(pi => pi.bin).join(', ')}`);

    const terms = finalImplicants.map(pi => {
        const parts = [];
        for (let i = 0; i < varCount; i++) {
            if (pi.bin[i] === '1') {
                parts.push(varNames[i]);
            } else if (pi.bin[i] === '0') {
                parts.push('~' + varNames[i]);
            }
        }
        return parts.length ? parts.join(' . ') : '1';
    });

    return {
        expression: terms.join(' + ') || '0',
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
        const sopCard = document.getElementById('sopCard');
        const posCard = document.getElementById('posCard');

        if (currentVariables.length === 4) {

            sopCard.classList.add('pdf-compact');
            posCard.classList.add('pdf-compact');

        }

        html2pdf()
            .set(opt)
            .from(element)
            .save()
            .then(() => {

                sopCard.classList.remove('pdf-compact');
                posCard.classList.remove('pdf-compact');

                const pdfCard = document.getElementById('pdfCard');
                const btnPdf = document.getElementById('btnFullReport');

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
    const btn = document.getElementById('truthTableDownloadBtn');
    const watermark = document.getElementById('watermarkTT');

    if (btn) btn.style.display = 'none';

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

    setTimeout(() => {
        html2pdf()
            .set(opt)
            .from(element)
            .save()
            .then(() => {

                if (btn) btn.style.display = 'flex';

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
    if (btn) btn.classList.add('pdf-hidden');
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
            if (btn) btn.classList.remove('pdf-hidden');
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


// ==================== EXPORTAÇÃO PARA PDF (RELATÓRIO COMPLETO) ====================
function downloadFullReport() {
    if (currentVarCount >= 5) {
        alert(t('pdf5VarsLimit') || "A exportação PDF não está disponível para funções com 5 variáveis.");
        return;
    }

    const element = document.getElementById('fullReportArea');
    const pdfCard = document.getElementById('pdfCard');
    const btnPdf = document.getElementById('btnFullReport');
    const sopCard = document.getElementById('sopCard');
    const posCard = document.getElementById('posCard');
    const diagramCard = document.getElementById('diagramCard');
    const diagramContainer = document.getElementById('diagramContainer');

    const watermarks = element.querySelectorAll('.watermark-logo');
    const innerButtons = element.querySelectorAll('button');
    const sopPosContainer = sopCard ? sopCard.parentElement : null;

    if (pdfCard) pdfCard.style.display = 'none';
    if (btnPdf) btnPdf.style.display = 'none';
    innerButtons.forEach(btn => btn.style.display = 'none');
    watermarks.forEach(w => w.classList.remove('hidden'));

    const originalWidth = element.style.width;
    const originalMaxWidth = element.style.maxWidth;
    element.style.width = '700px';
    element.style.maxWidth = '700px';

    // Quebra de página para SOP e POS: Continua ativa apenas para 3 e 4 variáveis
    if (currentVarCount >= 3 && sopPosContainer) {
        sopPosContainer.style.pageBreakBefore = 'always';
        sopPosContainer.style.breakBefore = 'page';
    }

    // A MÁGICA ATUALIZADA: O diagrama agora SEMPRE ganha uma página nova
    // (Com 2 vars: vai para a pág 2 | Com 3 ou 4 vars: vai para a pág 3 de forma limpa)
    if (diagramCard) {
        diagramCard.style.pageBreakBefore = 'always';
        diagramCard.style.breakBefore = 'page';
        diagramCard.style.pageBreakInside = 'avoid';
        diagramCard.style.breakInside = 'avoid';
    }

    const tableCells = element.querySelectorAll('td, th');
    let originalStyles = [];
    if (currentVarCount === 4) {
        tableCells.forEach((cell, index) => {
            originalStyles[index] = { padding: cell.style.padding, fontSize: cell.style.fontSize };
            cell.style.padding = '4px';
            cell.style.fontSize = '12px';
        });
    }

    // Sua escala perfeita de 600px centralizada no balão
    const svgElement = diagramCard ? diagramCard.querySelector('svg') : null;
    let originalSvgClass = '';

    if (svgElement) {
        originalSvgClass = svgElement.getAttribute('class') || '';
        svgElement.setAttribute('class', originalSvgClass.replace('w-full', ''));

        const viewBox = svgElement.getAttribute('viewBox').split(' ');
        const vbWidth = parseFloat(viewBox[2]);
        const vbHeight = parseFloat(viewBox[3]);

        const targetWidth = 600; // Seus 600px ideais
        const targetHeight = (vbHeight / vbWidth) * targetWidth;

        svgElement.setAttribute('width', targetWidth);
        svgElement.setAttribute('height', targetHeight);

        svgElement.style.display = 'block';
        svgElement.style.margin = '0 auto';
    }

    const opt = {
        margin: 10,
        filename: 'relatorio-logico.pdf',
        image: { type: 'jpeg', quality: 1 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
        pagebreak: { mode: ['css', 'legacy'] }
    };

    setTimeout(() => {
        html2pdf()
            .set(opt)
            .from(element)
            .save()
            .then(() => {
                restaurarTela();
            })
            .catch((err) => {
                console.error("Erro fatal ao gerar PDF:", err);
                restaurarTela();
            });

        function restaurarTela() {
            if (pdfCard) pdfCard.style.display = '';
            if (btnPdf) btnPdf.style.display = '';
            innerButtons.forEach(btn => btn.style.display = '');
            watermarks.forEach(w => w.classList.add('hidden'));

            element.style.width = originalWidth;
            element.style.maxWidth = originalMaxWidth;

            if (currentVarCount >= 3 && sopPosContainer) {
                sopPosContainer.style.pageBreakBefore = '';
                sopPosContainer.style.breakBefore = '';
            }

            if (diagramCard) {
                diagramCard.style.pageBreakBefore = '';
                diagramCard.style.breakBefore = '';
                diagramCard.style.pageBreakInside = '';
                diagramCard.style.breakInside = '';
            }

            if (currentVarCount === 4) {
                tableCells.forEach((cell, index) => {
                    if (originalStyles[index]) {
                        cell.style.padding = originalStyles[index].padding;
                        cell.style.fontSize = originalStyles[index].fontSize;
                    }
                });
            }

            if (svgElement) {
                svgElement.setAttribute('class', originalSvgClass);
                svgElement.removeAttribute('width');
                svgElement.removeAttribute('height');
                svgElement.style.display = '';
                svgElement.style.margin = '';
            }
        }
    }, 100);
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

// ==================== EXPORTAÇÃO PARA PDF (SEÇÕES INDIVIDUAIS) ====================
function downloadSectionPDF(sectionId, filename) {
    if (currentVarCount >= 5) {
        alert(t('pdf5VarsLimit') || "A exportação PDF não está disponível para funções com 5 variáveis.");
        return;
    }

    const element = document.getElementById(sectionId);
    if (!element) return;

    const buttons = element.querySelectorAll('button');
    const watermark = element.querySelector('.watermark-logo');

    buttons.forEach(btn => {
        btn.style.display = 'none';
        btn.setAttribute('data-html2canvas-ignore', 'true');
    });

    if (watermark) watermark.classList.remove('hidden');

    const originalHeight = element.style.height;
    const originalDisplay = element.style.display;
    const originalWidth = element.style.width;
    const originalMaxWidth = element.style.maxWidth;

    element.style.height = 'auto';
    element.style.display = 'block';

    if (sectionId === 'diagramCard') {
        element.style.width = '750px';
        element.style.maxWidth = '750px';
    }

    const wrappers = element.querySelectorAll('.overflow-x-auto');
    wrappers.forEach(w => {
        w.dataset.originalOverflow = w.style.overflow;
        w.style.overflow = 'visible';
    });

    const svgElement = element.querySelector('svg');
    const diagramContainer = element.querySelector('#diagramContainer');
    const flexWrapper = diagramContainer ? diagramContainer.parentElement : null;

    let originalSvgClass = '';

    if (sectionId === 'diagramCard' && svgElement && diagramContainer) {

        originalSvgClass = svgElement.getAttribute('class') || '';

        svgElement.setAttribute(
            'class',
            originalSvgClass.replace('w-full', '')
        );

        const viewBox = svgElement.getAttribute('viewBox')?.split(' ');

        if (viewBox && viewBox.length >= 4) {

            const vbWidth = parseFloat(viewBox[2]);
            const vbHeight = parseFloat(viewBox[3]);

            const targetWidth = 600;
            const targetHeight = (vbHeight / vbWidth) * targetWidth;

            svgElement.setAttribute('width', targetWidth);
            svgElement.setAttribute('height', targetHeight);
        }

        // Guarda estados originais
        if (flexWrapper) {
            flexWrapper.dataset.originalDisplay = flexWrapper.style.display;
            flexWrapper.dataset.originalJustify = flexWrapper.style.justifyContent;
            flexWrapper.dataset.originalAlign = flexWrapper.style.alignItems;
        }

        diagramContainer.dataset.originalDisplay = diagramContainer.style.display;
        diagramContainer.dataset.originalJustify = diagramContainer.style.justifyContent;
        diagramContainer.dataset.originalAlign = diagramContainer.style.alignItems;

        // Centralização real
        if (flexWrapper) {
            flexWrapper.style.display = 'flex';
            flexWrapper.style.justifyContent = 'center';
            flexWrapper.style.alignItems = 'center';
        }

        diagramContainer.style.display = 'flex';
        diagramContainer.style.justifyContent = 'center';
        diagramContainer.style.alignItems = 'center';

        svgElement.style.display = 'block';
        svgElement.style.margin = '0 auto';
    }

    setTimeout(() => {

        html2pdf()
            .set({
                margin: 10,
                filename: filename,
                image: {
                    type: 'jpeg',
                    quality: 1
                },
                html2canvas: {
                    scale: 2,
                    useCORS: true,
                    scrollY: 0,
                    backgroundColor: '#ffffff'
                },
                jsPDF: {
                    unit: 'mm',
                    format: 'a4',
                    orientation: 'portrait'
                }
            })
            .from(element)
            .save()
            .then(() => {
                restaurarSessao();
            })
            .catch((err) => {
                console.error("Erro ao gerar PDF da seção:", err);
                restaurarSessao();
            });

        function restaurarSessao() {

            buttons.forEach(btn => {
                btn.style.display = '';
                btn.removeAttribute('data-html2canvas-ignore');
            });

            if (watermark) {
                watermark.classList.add('hidden');
            }

            element.style.height = originalHeight;
            element.style.display = originalDisplay;
            element.style.width = originalWidth;
            element.style.maxWidth = originalMaxWidth;

            wrappers.forEach(w => {
                w.style.overflow = w.dataset.originalOverflow || '';
            });

            if (sectionId === 'diagramCard' && svgElement && diagramContainer) {

                svgElement.setAttribute('class', originalSvgClass);

                svgElement.removeAttribute('width');
                svgElement.removeAttribute('height');

                svgElement.style.display = '';
                svgElement.style.margin = '';

                diagramContainer.style.display =
                    diagramContainer.dataset.originalDisplay || '';

                diagramContainer.style.justifyContent =
                    diagramContainer.dataset.originalJustify || '';

                diagramContainer.style.alignItems =
                    diagramContainer.dataset.originalAlign || '';

                if (flexWrapper) {
                    flexWrapper.style.display =
                        flexWrapper.dataset.originalDisplay || '';

                    flexWrapper.style.justifyContent =
                        flexWrapper.dataset.originalJustify || '';

                    flexWrapper.style.alignItems =
                        flexWrapper.dataset.originalAlign || '';
                }
            }
        }

    }, 500);
}

// ==================== HISTÓRICO DE EXPRESSÕES ====================

// 1. Variável de segurança
let expressionHistory = [];

// 2. Tenta resgatar a memória com proteção contra erros (impede a tela de travar)
try {
    const savedHistory = localStorage.getItem('syslogic_history');
    if (savedHistory) {
        expressionHistory = JSON.parse(savedHistory);
    }
} catch (e) {
    console.warn("Erro ao ler o histórico ou navegador bloqueou o acesso.", e);
    expressionHistory = [];
}

function addToHistory(expr) {
    if (!expr) return;

    const existingIndex = expressionHistory.indexOf(expr);
    if (existingIndex !== -1) {
        expressionHistory.splice(existingIndex, 1);
    }

    expressionHistory.unshift(expr);

    if (expressionHistory.length > 10) {
        expressionHistory.pop();
    }

    // 3. Tenta salvar na memória (Ignora o erro se estiver em file:///)
    try {
        localStorage.setItem('syslogic_history', JSON.stringify(expressionHistory));
    } catch (e) {
        console.warn("O salvamento local foi bloqueado pelo navegador.");
    }

    renderHistory();
}

function renderHistory() {
    const listDiv = document.getElementById('historyList');
    const countSpan = document.getElementById('historyCount');

    if (!listDiv || !countSpan) return;

    countSpan.textContent = expressionHistory.length;

    if (expressionHistory.length === 0) {
        listDiv.innerHTML = `<p class="text-gray-500 italic text-center py-2 text-xs">${t('historyEmpty')}</p>`;
        return;
    }

    listDiv.innerHTML = expressionHistory.map(expr => `
        <div class="flex justify-between items-center p-2 bg-white dark:bg-[#252526] hover:bg-blue-50 dark:hover:bg-[#2a2d2e] rounded-md cursor-pointer transition-colors border border-gray-100 dark:border-[#3c3c3c] shadow-sm mb-1"
             onclick="loadFromHistory('${expr.replace(/'/g, "\\'")}')" title="${t('clickToRecalculate')}">
            <span class="font-bold text-blue-600 dark:text-[#9cdcfe] truncate max-w-[85%]">${expr}</span>
            <i class="fas fa-play text-xs text-gray-400 hover:text-blue-500 transition-colors"></i>
        </div>
    `).join('');
}

function loadFromHistory(expr) {
    const input = document.getElementById('expressionInput');
    if (input) {
        input.value = expr;
        calculateFromExpression();
    }
}

function clearHistory() {
    expressionHistory = [];
    try {
        localStorage.removeItem('syslogic_history');
    } catch (e) {
        console.warn("Bloqueio ao limpar memória.");
    }
    renderHistory();
}

function toggleHistory() {
    const content = document.getElementById('historyContent');
    const chevron = document.getElementById('historyChevron');

    if (!content || !chevron) return;

    content.classList.toggle('hidden');

    if (content.classList.contains('hidden')) {
        chevron.classList.remove('rotate-180');
    } else {
        chevron.classList.add('rotate-180');
    }
}

// 4. GATILHO AUTOMÁTICO: Força o histórico a aparecer sozinho assim que a página terminar de montar
window.addEventListener('load', renderHistory);

// ==================== MOTOR DE DIAGRAMA LÓGICO (SVG) ====================
function renderLogicDiagram() {
    const container = document.getElementById('diagramContainer');
    if (!container) return;

    const expression = document.getElementById('simplifiedExpression').innerText;

    // Tratamento para resultados constantes
    // Tratamento para resultados constantes
    if (!expression || expression === '0' || expression === '1') {
        // Puxa o idioma atual do seu dicionário
        const lang = translations[currentLang];

        // Pega as traduções (com um fallback seguro para português)
        const textConstant = lang.constantSignal || "Sinal constante";
        const textNoGates = lang.noGates || "Não requer portas lógicas.";

        container.innerHTML = `<div class="text-gray-400 dark:text-gray-500 italic text-center w-full p-4">${textConstant} (${expression}). ${textNoGates}</div>`;
        return;
    }

    const terms = expression.split(' + ');
    const svgHeight = Math.max(300, terms.length * 110); // Aumenta a altura conforme a quantia de portas
    const svgWidth = 800;

    // Configurações de cores baseadas no Tailwind (Dark Mode Suportado)
    const strokeColor = "currentColor";
    const gateFill = "var(--tw-bg-opacity, transparent)"; // Fica transparente por padrão e o CSS cuida
    const textClass = "font-mono font-bold text-sm fill-gray-800 dark:fill-gray-200";
    const pathClass = "stroke-gray-800 dark:stroke-gray-300 stroke-2 fill-white dark:fill-[#252526]";
    const wireClass = "stroke-blue-500 dark:stroke-[#4fc1ff] stroke-2 fill-none";

    let svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${svgWidth} ${svgHeight}" class="w-full h-auto">`;

    const orX = 600;
    const orY = svgHeight / 2;

    // 1. DESENHA A PORTA OR GIGANTE (Se houver mais de um termo)
    if (terms.length > 1) {
        svg += `<path d="M ${orX} ${orY - 40} Q ${orX + 20} ${orY} ${orX} ${orY + 40} C ${orX + 40} ${orY + 40} ${orX + 80} ${orY + 20} ${orX + 80} ${orY} C ${orX + 80} ${orY - 20} ${orX + 40} ${orY - 40} ${orX} ${orY - 40} Z" class="${pathClass}" />`;
        svg += `<path d="M ${orX + 80} ${orY} L ${orX + 130} ${orY}" class="${wireClass}" />`;
        svg += `<text x="${orX + 140}" y="${orY + 5}" class="${textClass} text-lg fill-blue-600 dark:fill-blue-400">S</text>`;
    } else {
        svg += `<path d="M 400 ${orY} L ${orX + 130} ${orY}" class="${wireClass}" />`;
        svg += `<text x="${orX + 140}" y="${orY + 5}" class="${textClass} text-lg fill-blue-600 dark:fill-blue-400">S</text>`;
    }

    // 2. DESENHA AS PORTAS AND (Uma para cada agrupamento do SOP)
    terms.forEach((term, i) => {
        const andX = 350;
        const andY = terms.length === 1 ? svgHeight / 2 : (i * (svgHeight / terms.length)) + (svgHeight / terms.length / 2);

        // Roteamento do fio da porta AND até a porta OR
        if (terms.length > 1) {
            const orInY = orY - 25 + (50 / (terms.length - 1 || 1)) * i;
            svg += `<path d="M ${andX + 60} ${andY} L 500 ${andY} L 500 ${orInY} L ${orX + 10} ${orInY}" class="${wireClass} rounded" />`;
        }

        // Porta AND shape
        svg += `<path d="M ${andX} ${andY - 25} L ${andX + 35} ${andY - 25} A 25 25 0 0 1 ${andX + 35} ${andY + 25} L ${andX} ${andY + 25} Z" class="${pathClass}" />`;

        // 3. DESENHA AS ENTRADAS E PORTAS NOT
        let cleanTerm = term.replace(/[()]/g, '').trim();
        const vars = cleanTerm.split('.').map(v => v.trim());

        vars.forEach((v, j) => {
            const isInverted = v.startsWith('~');
            const varName = v.replace('~', '');

            // Espaçamento vertical dos fios de entrada na porta AND
            let inY = andY;
            if (vars.length > 1) {
                const spacing = 40 / (vars.length - 1);
                inY = andY - 20 + (spacing * j);
            }

            svg += `<text x="50" y="${inY + 4}" class="${textClass}">${varName}</text>`;

            if (isInverted) {
                const notX = 180;
                // Fio até o NOT
                svg += `<path d="M 70 ${inY} L ${notX} ${inY}" class="${wireClass}" />`;
                // Porta NOT (Triângulo)
                svg += `<path d="M ${notX} ${inY - 12} L ${notX + 25} ${inY} L ${notX} ${inY + 12} Z" class="${pathClass}" />`;
                // Bolha de inversão
                svg += `<circle cx="${notX + 29}" cy="${inY}" r="4" class="${pathClass}" />`;
                // Fio do NOT até o AND
                svg += `<path d="M ${notX + 33} ${inY} L ${andX} ${inY}" class="${wireClass}" />`;
            } else {
                // Fio direto para o AND
                svg += `<path d="M 70 ${inY} L ${andX} ${inY}" class="${wireClass}" />`;
            }
        });
    });

    svg += `</svg>`;
    container.innerHTML = svg;
}

// ==================== PWA: SERVICE WORKER ====================
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
      .then(registration => {
        console.log('Service Worker registado com sucesso no escopo:', registration.scope);
      })
      .catch(error => {
        console.log('Falha ao registar o Service Worker:', error);
      });
  });
}