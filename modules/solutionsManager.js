const fs = require('fs');
const path = require('path');

class SolutionsManager {
    constructor() {
        this.solutionsDir = path.join(__dirname, '..', 'solutions');
        this.createDefaultStructure();
    }

    createDefaultStructure() {
        const folders = ['default', 'spar', 'magnet', 'lenta', 'ashan', 'pyaterochka'];
        
        folders.forEach(folder => {
            const folderPath = path.join(this.solutionsDir, folder);
            if (!fs.existsSync(folderPath)) {
                fs.mkdirSync(folderPath, { recursive: true });
                console.log(`📁 Создана папка: solutions/${folder}`);
            }
        });
    }

    getSolution(pointName, situation) {
        try {
            // Очищаем названия для файловой системы
            const cleanPoint = this.cleanFileName(pointName);
            const cleanSituation = this.cleanFileName(situation);
            
            console.log(`🔍 Поиск решения для: ${pointName} -> ${situation}`);
            console.log(`🔍 Очищенные имена: ${cleanPoint} -> ${cleanSituation}`);

            // 1. Пробуем найти решение для конкретной точки
            const pointSolutionPath = path.join(this.solutionsDir, cleanPoint, `${cleanSituation}.txt`);
            console.log(`🔍 Путь к решению: ${pointSolutionPath}`);
            
            if (fs.existsSync(pointSolutionPath)) {
                const solution = fs.readFileSync(pointSolutionPath, 'utf8');
                console.log(`✅ Найдено индивидуальное решение для ${pointName}`);
                return solution;
            }
            
            // 2. Если нет индивидуального, ищем общее решение
            const defaultSolutionPath = path.join(this.solutionsDir, 'default', `${cleanSituation}.txt`);
            console.log(`🔍 Путь к общему решению: ${defaultSolutionPath}`);
            
            if (fs.existsSync(defaultSolutionPath)) {
                const solution = fs.readFileSync(defaultSolutionPath, 'utf8');
                console.log(`📋 Используем общее решение`);
                return solution;
            }
            
            // 3. Если решения нет вообще
            console.log(`⚠️ Решение не найдено, используем шаблон`);
            return this.getDefaultSolution();
            
        } catch (error) {
            console.log('❌ Ошибка загрузки решения:', error.message);
            return this.getDefaultSolution();
        }
    }

    cleanFileName(name) {
        return name.toLowerCase()
            .replace(/[^\wа-яё]/g, '')  // Убираем все кроме букв и цифр
            .replace(/\s+/g, '')        // Убираем пробелы
            .trim();
    }

    getDefaultSolution() {
        return `🚀 *ДЕЙСТВИЯ ПО РЕШЕНИЮ:*\n` +
               `1. Проверить детали ситуации\n` +
               `2. Связаться с ответственным\n` +
               `3. Зафиксировать решение\n` +
               `4. Сообщить клиенту`;
    }
}

module.exports = SolutionsManager;
