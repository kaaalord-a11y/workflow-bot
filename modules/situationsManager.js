const fs = require('fs');
const path = require('path');

class SituationsManager {
    constructor() {
        this.situationsDir = path.join(__dirname, '..', 'situations');
        this.loadAllSituations();
    }

    loadAllSituations() {
        try {
            // Загружаем все файлы ситуаций
            this.defaultSituations = this.loadSituationsFile('default.txt');
            this.magnetSituations = this.loadSituationsFile('magnet.txt');
            this.lentaSituations = this.loadSituationsFile('lentammfvinagarofline.txt');
            this.lentaonlineSituations = this.loadSituationsFile('lentaonline.txt');
            this.lentammftaymbukSituations = this.loadSituationsFile('lentammftaymbuk.txt');
            this.kofehauzSituations = this.loadSituationsFile('kofehauz.txt');
            
            console.log('✅ Ситуации загружены:');
            console.log(`📋 Default: ${this.defaultSituations.length} ситуаций`);
            console.log(`💰 Magnet: ${this.magnetSituations.length} ситуаций`);
            console.log(`🛒 Lenta ММФ/Вингараж/Офлайн: ${this.lentaSituations.length} ситуаций`);
            console.log(`🌐 Lenta Онлайн: ${this.lentaonlineSituations.length} ситуаций`);
            console.log(`🕒 Lenta ММФ таймбук: ${this.lentammftaymbukSituations.length} ситуаций`);
            console.log(`☕ Кофе Хауз: ${this.kofehauzSituations.length} ситуаций`);
            
        } catch (error) {
            console.error('❌ Ошибка загрузки ситуаций:', error);
        }
    }

    loadSituationsFile(filename) {
        try {
            const filePath = path.join(this.situationsDir, filename);
            if (fs.existsSync(filePath)) {
                const content = fs.readFileSync(filePath, 'utf8');
                const situations = content.split('\n')
                    .filter(line => line.trim())
                    .filter(line => line.length > 0);
                
                console.log(`📁 Загружен файл ${filename}: ${situations.length} ситуаций`);
                return situations;
            }
            console.log(`⚠️ Файл ${filename} не найден`);
            return [];
        } catch (error) {
            console.error(`❌ Ошибка загрузки файла ${filename}:`, error);
            return [];
        }
    }

    getSituationsForPoint(pointName) {
        console.log('🔍 Определяем ситуации для точки: "' + pointName + '"');
        
        // Универсальное сравнение как для Магнита
        const cleanName = pointName.toLowerCase().trim().replace(/\s/g, '').replace(/\//g, '');
        console.log('🔍 Очищенное имя для сравнения: "' + cleanName + '"');
        
        // Для Магнита
        if (cleanName.includes('магнит')) {
            console.log('💰 Используем ситуации для Магнита: ' + this.magnetSituations.length + ' шт');
            return this.magnetSituations;
        }
        
        // Для Ленты ММФ таймбук (проверяем раньше, чтобы не перехватить другими проверками)
        if (cleanName.includes('лентаммфтаймбук') || (cleanName.includes('лентаммф') && cleanName.includes('таймбук'))) {
            console.log('🕒 Используем ситуации для Ленты ММФ таймбук: ' + this.lentammftaymbukSituations.length + ' шт');
            return this.lentammftaymbukSituations;
        }
        
        // Для Ленты ММФ/Вингараж/Офлайн
        if (cleanName.includes('лентаммф') && (cleanName.includes('вингараж') || cleanName.includes('офлайн'))) {
            console.log('🛒 Используем ситуации для Ленты ММФ/Вингараж/Офлайн: ' + this.lentaSituations.length + ' шт');
            return this.lentaSituations;
        }
        
        // Для Ленты Онлайн
        if (cleanName.includes('лентаонлайн')) {
            console.log('🌐 Используем ситуации для Ленты Онлайн: ' + this.lentaonlineSituations.length + ' шт');
            return this.lentaonlineSituations;
        }
        
        // Для Кофе Хауз
        if (cleanName.includes('кофехауз') || (cleanName.includes('кофе') && cleanName.includes('хауз'))) {
            console.log('☕ Используем ситуации для Кофе Хауз: ' + this.kofehauzSituations.length + ' шт');
            return this.kofehauzSituations;
        }
        
        // Для всех остальных - обычные ситуации
        console.log('📋 Используем обычные ситуации: ' + this.defaultSituations.length + ' шт');
        return this.defaultSituations;
    }

    getKeyboard(selectedPoint = '') {
        const situationsToShow = this.getSituationsForPoint(selectedPoint);
        
        console.log(`🎯 ФИНАЛЬНО для точки "${selectedPoint}": ${situationsToShow.length} ситуаций`);
        
        // Отладочная информация - покажем первые 3 ситуации
        if (situationsToShow.length > 0) {
            console.log(`📝 Примеры ситуаций: ${situationsToShow.slice(0, 3).join(', ')}...`);
        }
        
        const buttons = situationsToShow.map((situation, index) => [{
            text: situation,
            callback_data: `s${index}_${selectedPoint}`
        }]);
        
        buttons.push([{ text: '↩️ Назад к точкам', callback_data: 'back_points' }]);
        
        return { reply_markup: { inline_keyboard: buttons } };
    }

    getSituationByCallback(callbackData, selectedPoint = '') {
        // Парсим callback_data в формате "s{index}_{pointName}"
        // Используем регулярное выражение для извлечения индекса
        const match = callbackData.match(/^s(\d+)_/);
        if (!match) {
            console.error(`❌ Неверный формат callback_data: ${callbackData}`);
            return 'Ситуация не найдена';
        }
        
        const situationIndex = parseInt(match[1]);
        const situationsToUse = this.getSituationsForPoint(selectedPoint);
        
        console.log(`📞 Получение ситуации: индекс=${situationIndex}, точка="${selectedPoint}", всего=${situationsToUse.length}`);
        
        if (situationIndex >= 0 && situationIndex < situationsToUse.length) {
            return situationsToUse[situationIndex];
        }
        return 'Ситуация не найдена';
    }

    getSolutionText(userState, situation) {
        let scheduleInfo = '';
        if (userState.selectedSchedule) {
            scheduleInfo = `\n📅 <b>ГРАФИК ЗВОНКОВ:</b>\n${userState.selectedSchedule}`;
        }
        
        return `🟢 <b>ВЫБРАНО:</b>\n\n` +
               `📍 <b>ТОРГОВАЯ ТОЧКА:</b>\n${userState.selectedPoint}\n\n` +
               `🔴 <b>СИТУАЦИЯ:</b>\n${situation}` +
               `${scheduleInfo}\n\n` +
               `🚀 <b>ДЕЙСТВИЯ ПО РЕШЕНИЮ:</b>\n` +
               `1. Проверить детали ситуации\n` +
               `2. Связаться с ответственным\n` +
               `3. Зафиксировать решение\n` +
               `4. Сообщить клиенту\n\n` +
               `⬅️ Нажмите "↩️ Назад к точкам" чтобы выбрать другую ситуацию\n` +
               `🔄 Или "🏪 Выбрать новую точку" для выбора новой точки`;
    }

    getSolutionKeyboard() {
        return {
            inline_keyboard: [
                [{ text: '↩️ Назад к точкам', callback_data: 'back_points' }],
                [{ text: '🏪 Выбрать новую точку', callback_data: 'back_main' }]
            ]
        };
    }
}

module.exports = SituationsManager;