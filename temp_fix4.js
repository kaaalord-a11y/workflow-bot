const fs = require('fs');
let content = fs.readFileSync('modules/situationsManager.js', 'utf8');

// Добавляем загрузку lentammftaymbuk.txt
content = content.replace(
    'this.lentaSituations = this.loadSituationsFile(\\'lenta.txt\\');',
    'this.lentaSituations = this.loadSituationsFile(\\'lenta.txt\\');\\n        this.lentammftaymbukSituations = this.loadSituationsFile(\\'lentammftaymbuk.txt\\');'
);

// Добавляем вывод в лог
content = content.replace(
    'console.log(`🛒 Lenta: ${this.lentaSituations.length} ситуаций`);',
    'console.log(`🛒 Lenta: ${this.lentaSituations.length} ситуаций`);\\n            console.log(`🕒 Lenta MMФ таймбук: ${this.lentammftaymbukSituations.length} ситуаций`);'
);

fs.writeFileSync('modules/situationsManager.js', content, 'utf8');
console.log('✅ Добавлена загрузка lentammftaymbuk.txt!');
