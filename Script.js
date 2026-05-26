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
        sectionExamples: "Exemplos Rápidos",
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
        expressionError: "Expressão inválida. Verifique os operadores e variáveis."
    },
    en: {
        appTitle: "Digital Logic Calculator",
        appSubtitle: "Truth Table, Karnaugh Map and Simplification",
        sectionInput: "Function Input",
        sectionVars: "Variables",
        sectionExamples: "Quick Examples",
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
        expressionError: "Invalid expression. Check operators and variables."
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
        if(themeIcon) {
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
    document.getElementById("sectionExamples").innerHTML = `<i class="fas fa-lightbulb text-blue-500"></i> ${lang.sectionExamples}`;
    
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

    currentExpression = input;
    currentVariables = extractVariables(input);
    
    if (currentVariables.length === 0) currentVariables = ['A','B','C'];
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
    if(varsListEl) varsListEl.textContent = currentVariables.join(', ');

    renderAll();
}

// ==================== RENDERIZAÇÃO ====================
function renderAll() {
    renderTruthTable();
    renderKMap();
    updateSimplifiedExpression();
}

function renderTruthTable() {
    const table = document.getElementById('truthTable');
    const varNames = currentVariables.length ? currentVariables : ['A','B','C','D'].slice(0, currentVarCount);
    
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
function renderKMap() {
    const container = document.getElementById('kmapContainer');
    const varCount = currentVarCount;
    
    if (varCount > 4) {
        container.innerHTML = `<p class="text-amber-600 font-medium">Mapa de Karnaugh disponível apenas para até 4 variáveis.</p>`;
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

    html += `<div class="relative mx-auto mt-4">`;
    html += `<div class="absolute -top-6 left-1/2 transform -translate-x-1/2 text-sm font-bold text-blue-600">${colLabel}</div>`;
    html += `<div class="absolute top-1/2 -left-10 transform -translate-y-1/2 -rotate-90 text-sm font-bold text-blue-600">${rowLabel}</div>`;

    html += `<div class="grid" style="grid-template-columns: repeat(${cols.length + 1}, auto);">`;
    html += `<div class="w-12 h-12"></div>`; 

    cols.forEach(c => {
        html += `<div class="w-14 h-12 flex items-center justify-center font-mono text-sm text-gray-500 dark:text-gray-400">${c}</div>`;
    });

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
    const varNames = currentVariables.length ? currentVariables : ['A','B','C','D'].slice(0, varCount);
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
                                source: [...new Set([...m1.source, ...m2.source])].sort((a,b)=>a-b)
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