const TelegramBot = require('node-telegram-bot-api');

const TOKEN = '8130982213:AAFroFmRqgNxvRZOdEbBB6b7VeNLOxmYFLY';
const bot = new TelegramBot(TOKEN, { polling: true });

const SolutionsManager = require('./modules/solutionsManager');
console.log('🤖 YndxITBot запущен...');
const fs = require('fs');
const path = require('path');

console.log('🔍 ТЕСТ ЗАГРУЗКИ ФАЙЛОВ:');
console.log('Текущая директория:', __dirname);

try {
  const magnetPath = path.join(__dirname, 'situations', 'magnet.txt');
const solutionsManager = new SolutionsManager();
global.solutionsManager = solutionsManager;
  console.log('Путь к magnet.txt:', magnetPath);
  console.log('Файл существует:', fs.existsSync(magnetPath));
  
  const content = fs.readFileSync(magnetPath, 'utf8');
  const lines = content.split('\n').filter(line => line.trim());
  console.log('Содержимое magnet.txt:', lines.length, 'строк');
  console.log('Первые 3 строки:', lines.slice(0, 3));
} catch (error) {
  console.log('❌ Ошибка загрузки magnet.txt:', error.message);
}

// Главное меню
const mainMenu = {
    reply_markup: {
        keyboard: [
            ['🏪 Популярные ТТ', '🏠 Частные ТТ'],  // ← ИЗМЕНИЛ ЗДЕСЬ
            ['📞 Стандартный прозвон', '❓ Помощь']
        ],
        resize_keyboard: true
    }
};
// Хранение состояния пользователей
const userState = {};

// Загрузка популярных точек
const popularPoints = require('fs').readFileSync('popular_points.txt', 'utf8')
    .split('\n')
    .filter(line => line.trim());

// Загрузка компаний
const companiesData = JSON.parse(require('fs').readFileSync('companies_data.json', 'utf8'));

// Функция для получения всех компаний
function getAllCompanies() {
    const allCompanies = [];
    Object.values(companiesData).forEach(companies => {
        companies.forEach(company => {
            allCompanies.push(company);
        });
    });
    return allCompanies;
}

// Группируем компании по буквам
function groupCompaniesByFirstLetter() {
    const companies = getAllCompanies();
    const grouped = {};
    
    companies.forEach(company => {
        const firstLetter = company.name.charAt(0).toUpperCase();
        if (!grouped[firstLetter]) {
            grouped[firstLetter] = [];
        }
        grouped[firstLetter].push({
            ...company,
            letter: firstLetter
        });
    });
    
    return grouped;
}

const groupedCompanies = groupCompaniesByFirstLetter();

// Сортируем буквы
function sortLetters(letters) {
    const russianLetters = letters.filter(letter => /[А-Я]/.test(letter)).sort();
    const englishLetters = letters.filter(letter => /[A-Z]/.test(letter)).sort();
    return [...russianLetters, ...englishLetters];
}

// Функции для клавиатур
function getAlphabetKeyboard() {
    const letters = sortLetters(Object.keys(groupedCompanies));
    const buttons = [];
    let row = [];
    
    letters.forEach(letter => {
        row.push({
            text: letter,
            callback_data: `letter_${letter}`
        });
        
        if (row.length === 6) {
            buttons.push(row);
            row = [];
        }
    });
    
    if (row.length > 0) {
        buttons.push(row);
    }
    
    buttons.push([{ text: '🔍 Все компании', callback_data: 'all_companies' }]);
    buttons.push([{ text: '↩️ Назад', callback_data: 'back_main' }]);
    
    return { reply_markup: { inline_keyboard: buttons } };
}

function getCompaniesKeyboard(letter) {
    const companies = groupedCompanies[letter] || [];
    const buttons = companies.map(company => [{
        text: company.name,
        callback_data: `company_${letter}_${company.name}`
    }]);
    
    buttons.push([{ text: '🔙 Назад к алфавиту', callback_data: 'back_to_alphabet' }]);
    
    return { reply_markup: { inline_keyboard: buttons } };
}

function getAllCompaniesKeyboard() {
    const companies = getAllCompanies();
    const buttons = companies.map(company => [{
        text: company.name,
        callback_data: `company_all_${company.name}`
    }]);
    
    buttons.push([{ text: '🔙 Назад к алфавиту', callback_data: 'back_to_alphabet' }]);
    
    return { reply_markup: { inline_keyboard: buttons } };
}

function getPointsKeyboard() {
    const buttons = popularPoints.map((point, index) => [{
        text: point,
        callback_data: `p${index}`
    }]);
    buttons.push([{ text: '↩️ Назад', callback_data: 'back_main' }]);
    
    return { reply_markup: { inline_keyboard: buttons } };
}

            const magnetSituations = content.split('\n')
                .map(line => line.replace(/\r/g, '').trim())
                .filter(line => line.length > 0);
            
            console.log(`✅ ЗАГРУЖЕНЫ СПЕЦИАЛЬНЫЕ СИТУАЦИИ ДЛЯ МАГНИТА: ${magnetSituations.length} шт`);
            return magnetSituations;
        } catch (error) {
            console.log('❌ Ошибка загрузки magnet.txt, используем default');
        }
    }
    
    // Для остальных - обычные ситуации
    try {
        const defaultPath = require('path').join(__dirname, 'situations', 'default.txt');
        const content = require('fs').readFileSync(defaultPath, 'utf8');
        
        const defaultSituations = content.split('\n')
            .map(line => line.replace(/\r/g, '').trim())
            .filter(line => line.length > 0);
            
        console.log(`📋 Используем обычные ситуации: ${defaultSituations.length} шт`);
        return defaultSituations;
    } catch (error) {
        console.log('❌ Ошибка загрузки default.txt');
        return ['Ситуации не найдены'];
    }
}

function getSituationsKeyboard(selectedPoint = '') {
    console.log(`🎯 Создаем клавиатуру для точки: "${selectedPoint}"`);
    
    const situationsToShow = situationsManager.getSituationsForPoint(selectedPoint);
    console.log(`📝 Будет показано ситуаций: ${situationsToShow.length}`);
    
    const buttons = situationsToShow.map((situation, index) => [{
        text: situation,
        callback_data: `s${index}_${selectedPoint}`
    }]);
    
    buttons.push([{ text: '↩️ Назад к точкам', callback_data: 'back_points' }]);
    
    return { reply_markup: { inline_keyboard: buttons } };
}

function getSituationByIndex(index, selectedPoint = '') {
    const situations = situationsManager.getSituationsForPoint(selectedPoint);
    return situations[index] || 'Ситуация не найдена';
}

// Обработчики команд
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    userState[chatId] = { step: 'start' };
    
    const welcomeText = `🤖 *Добро пожаловать в YndxITBot!*\n\n` +
        `Выберите тип торговых точек:\n` +
        `• 🏪 *Популярные ТТ* - часто используемые точки\n` +
        `• 🏠 *Частные ТТ* - алфавитный каталог компаний\n` +  // ← ИЗМЕНИЛ ЗДЕСЬ
        `• 📞 *Стандартный прозвон* - общая информация\n\n` +
        `*Для специальных точек (Магнит, Лента) доступны дополнительные ситуации*`;

    bot.sendMessage(chatId, welcomeText, { 
        parse_mode: 'Markdown',
        reply_markup: mainMenu.reply_markup 
    });
});

bot.onText(/🏪 Популярные ТТ/, (msg) => {
    const chatId = msg.chat.id;
    userState[chatId] = { step: 'selecting_point', pointType: 'popular' };
    bot.sendMessage(chatId, `⭐ *Популярные торговые точки:*`, {
        parse_mode: 'Markdown',
        reply_markup: getPointsKeyboard().reply_markup
    });
});

// Обработка кнопки частных точек
bot.onText(/🏠 Частные ТТ/, (msg) => {
    const chatId = msg.chat.id;
    userState[chatId] = { step: 'selecting_other_point' };
    
    bot.sendMessage(chatId,
        `🏠 *Частные торговые точки*\n\n` + 
        `Выберите букву для просмотра компаний:`,
        {
            parse_mode: 'Markdown',
            reply_markup: getAlphabetKeyboard().reply_markup
        }
    );
});

bot.onText(/📞 Стандартный прозвон/, (msg) => {
    const chatId = msg.chat.id;
    
    const standardCallText = `📞 *СТАНДАРТНЫЙ ПРОЗВОН*\n\n` +
        `*В остальные компании звонить с __________ по __________*\n\n` +
        `*Процедура стандартного прозвона:*\n` +
        `1. Позвонить в рабочее время компании\n` +
        `2. Представиться и уточнить детали\n` +
        `3. Зафиксировать результат звонка\n` +
        `4. При необходимости оставить заметку\n\n` +
        `*Примечание:* Время звонков будет уточнено дополнительно`;
    
    bot.sendMessage(chatId, standardCallText, {
        parse_mode: 'Markdown',
        reply_markup: mainMenu.reply_markup
    });
});

// Обработка инлайн-кнопок
bot.on('callback_query', (callbackQuery) => {
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;
    const data = callbackQuery.data;

    try {
        if (data.startsWith('p')) {
            const pointIndex = parseInt(data.replace('p', ''));
            const point = popularPoints[pointIndex];
            
            userState[chatId] = {
                step: 'selecting_situation',
                selectedPoint: point,
                pointType: 'popular'
            };
            
            console.log(`✅ ПОЛЬЗОВАТЕЛЬ ВЫБРАЛ ТОЧКУ: ${point}`);
            
            bot.editMessageText(`✅ *Выбрана точка:* ${point}\n\n📋 *Теперь выберите ситуацию:*`, {
                chat_id: chatId,
                message_id: msg.message_id,
                parse_mode: 'Markdown',
                reply_markup: getSituationsKeyboard(point).reply_markup
            });
        }
        else if (data.startsWith('letter_')) {
            const letter = data.replace('letter_', '');
            
            bot.editMessageText(
                `🔤 *Компании на букву \"${letter}\"*\n\n` +
                `Выберите компанию:`,
                {
                    chat_id: chatId,
                    message_id: msg.message_id,
                    parse_mode: 'Markdown',
                    reply_markup: getCompaniesKeyboard(letter).reply_markup
                }
            );
        }
        else if (data === 'all_companies') {
            bot.editMessageText(
                `📋 *Все компании*\n\n` +
                `Выберите компанию:`,
                {
                    chat_id: chatId,
                    message_id: msg.message_id,
                    parse_mode: 'Markdown',
                    reply_markup: getAllCompaniesKeyboard().reply_markup
                }
            );
        }
        else if (data.startsWith('company_')) {
            const parts = data.split('_');
            const letter = parts[1];
            const companyName = parts.slice(2).join('_');
            
            const companies = groupedCompanies[letter] || [];
            const company = companies.find(c => c.name === companyName);
            
            if (company) {
                userState[chatId] = {
                    step: 'selecting_situation',
                    selectedPoint: company.name,
                    selectedSchedule: company.schedule,
                    pointType: 'other',
                    selectedLetter: letter
                };
                
                bot.editMessageText(
                    `✅ *Выбрана точка:* ${company.name}\n\n` +
                    `📋 *Теперь выберите ситуацию:*`,
                    {
                        chat_id: chatId,
                        message_id: msg.message_id,
                        parse_mode: 'Markdown',
                        reply_markup: getSituationsKeyboard(company.name).reply_markup
                    }
                );
            }
        }
        
        else if (data.startsWith('s')) {
    const parts = data.split('_');
    const situationIndex = parseInt(parts[0].replace('s', ''));
    const selectedPoint = parts[1] || '';
    
    const currentState = userState[chatId];
    
    // ПРОВЕРКА НА СУЩЕСТВОВАНИЕ
    if (!currentState || currentState.step !== 'selecting_situation') {
        console.log('❌ Неверное состояние для выбора ситуации');
        bot.answerCallbackQuery(callbackQuery.id, { text: 'Ошибка состояния' });
        return;
    }
    
    const situation = getSituationByIndex(situationIndex, selectedPoint);
    userState[chatId].selectedSituation = situation;
    
console.log('🔍 ДО ВЫЗОВА solutionsManager.getSolution:');
console.log('Точка:', currentState.selectedPoint);
console.log('Ситуация:', situation);

    console.log('🔍 ДО ВЫЗОВА solutionsManager.getSolution:');
    console.log('Точка:', currentState.selectedPoint);
    console.log('Ситуация:', situation);
const specificSolution = solutionsManager.getSolution(currentState.selectedPoint, situation);

    console.log('🔍 ПОСЛЕ ВЫЗОВА solutionsManager.getSolution:');
    console.log('Решение:', specificSolution);
console.log('🔍 ПОСЛЕ ВЫЗОВА solutionsManager.getSolution:');
console.log('Решение:', specificSolution);
    
    let scheduleInfo = '';
    if (currentState.selectedSchedule) {
        scheduleInfo = `\n📅 <b>ГРАФИК ЗВОНКОВ:</b>\n${currentState.selectedSchedule}`;
    }
    
    const solutionText = `🟢 <b>ВЫБРАНО:</b>\n\n` +
                       `📍 <b>ТОРГОВАЯ ТОЧКА:</b>\n${currentState.selectedPoint}\n\n` +
                       `🔴 <b>СИТУАЦИЯ:</b>\n${situation}` +
                       `${scheduleInfo}\n\n` +
                       `${specificSolution}\n\n` +
                       `⬅️ Нажмите "↩️ Назад к точкам" чтобы выбрать другую ситуацию\n` +
                       `🔄 Или "🏪 Выбрать новую точку" для выбора новой точки`;
    
    bot.editMessageText(solutionText, {
        chat_id: chatId,
        message_id: msg.message_id,
        parse_mode: 'HTML',
        reply_markup: {
            inline_keyboard: [
                [{ text: '↩️ Назад к точкам', callback_data: 'back_points' }],
                [{ text: '🏪 Выбрать новую точку', callback_data: 'back_main' }]
            ]
        }
    });
}
        else if (data === 'back_points') {
    // Назад к точкам - ДОБАВЛЯЕМ ПРОВЕРКУ НА СУЩЕСТВОВАНИЕ userState
    const currentState = userState[chatId];
    
    if (!currentState) {
        console.log('❌ userState не определен для chatId:', chatId);
        bot.answerCallbackQuery(callbackQuery.id, { text: 'Ошибка состояния' });
        return;
    }
    
    if (currentState.pointType === 'popular') {
        bot.editMessageText(`⭐ *Популярные торговые точки:*`, {
            chat_id: chatId,
            message_id: msg.message_id,
            parse_mode: 'Markdown',
            reply_markup: getPointsKeyboard().reply_markup
        });
    } else if (currentState.selectedLetter) {
        const letter = currentState.selectedLetter;
        bot.editMessageText(
            `🔤 *Компании на букву \"${letter}\"*\n\n` +
            `Выберите компанию:`,
            {
                chat_id: chatId,
                message_id: msg.message_id,
                parse_mode: 'Markdown',
                reply_markup: getCompaniesKeyboard(letter).reply_markup
            }
        );
    } else {
        bot.editMessageText(`🏠 *Частные торговые точки*`, {
            chat_id: chatId,
            message_id: msg.message_id,
            parse_mode: 'Markdown',
            reply_markup: getAlphabetKeyboard().reply_markup
        });
    }
}
        else if (data === 'back_to_alphabet') {
            bot.editMessageText(`🏠 *Частные торговые точки*`, {  // ← ИЗМЕНИЛ ЗДЕСЬ
            chat_id: chatId,
            message_id: msg.message_id,
            parse_mode: 'Markdown',
            reply_markup: getAlphabetKeyboard().reply_markup
            });
        }
        else if (data === 'back_main') {
            bot.deleteMessage(chatId, msg.message_id);
            bot.sendMessage(chatId, '🔙 *Возврат в главное меню:*', {
                parse_mode: 'Markdown',
                reply_markup: mainMenu.reply_markup
            });
        }

        bot.answerCallbackQuery(callbackQuery.id);
    } catch (error) {
        console.error('❌ Ошибка обработки callback:', error);
        bot.answerCallbackQuery(callbackQuery.id, { text: 'Произошла ошибка' });
    }
});

bot.onText(/❓ Помощь/, (msg) => {
    const chatId = msg.chat.id;
    
    const helpText = `📋 *Помощь по YndxITBot*\n\n` +
        `*Процесс работы:*\n` +
        `1. Выберите тип точек (🏪 Популярные или 🏠 Частные)\n` +  // ← ИЗМЕНИЛ ЗДЕСЬ
        `2. Выберите торговую точку из списка\n` +
        `3. Выберите ситуацию из списка\n` +
        `4. Получите инструкции по решению\n\n` +
        `*Дополнительные функции:*\n` +
        `• 📞 Стандартный прозвон - общая информация о звонках\n` +
        `• Для специальных точек (Магнит, Лента) доступны дополнительные ситуации`;
    
    bot.sendMessage(chatId, helpText, {
        parse_mode: 'Markdown',
        reply_markup: mainMenu.reply_markup
    });
});

bot.on('message', (msg) => {
    const chatId = msg.chat.id;
    const text = msg.text;
    
    if (!userState[chatId]) {
        userState[chatId] = { step: 'start' };
    }
    
    if (!text.startsWith('/') && 
    text !== '🏪 Популярные ТТ' && 
    text !== '🏠 Частные ТТ' &&  // ← ИЗМЕНИЛ ЗДЕСЬ
    text !== '📞 Стандартный прозвон' && 
    text !== '❓ Помощь') {
        
        bot.sendMessage(chatId, '🔘 *Используйте кнопки для навигации:*', {
            parse_mode: 'Markdown',
            reply_markup: mainMenu.reply_markup
        });
    }
});

console.log('✅ YndxITBot готов к работе!');
console.log('📊 Популярных точек:', popularPoints.length);
console.log('🏢 Компаний в каталоге:', getAllCompanies().length);