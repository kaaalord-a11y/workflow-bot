const TelegramBot = require('node-telegram-bot-api');

// Импортируем модули
const PopularPoints = require('./modules/popularPoints');
const AlphabetManager = require('./modules/alphabetManager');
const SituationsManager = require('./modules/situationsManager');
const StateManager = require('./modules/stateManager');
const SolutionsManager = require('./modules/solutionsManager');

const TOKEN = '8130982213:AAFroFmRqgNxvRZOdEbBB6b7VeNLOxmYFLY';
const bot = new TelegramBot(TOKEN, { polling: true });

// Инициализируем менеджеры
const popularPoints = new PopularPoints();
const alphabetManager = new AlphabetManager();
const situationsManager = new SituationsManager();
const stateManager = new StateManager();
const solutionsManager = new SolutionsManager();

console.log('🤖 YndxITBot запущен...');

// Главное меню
const mainMenu = {
    reply_markup: {
        keyboard: [
            ['🏪 Популярные ТТ', '🏠 Частные ТТ'],
            ['📞 Стандартный прозвон', '❓ Помощь']
        ],
        resize_keyboard: true
    }
};

// Хранение состояния пользователей
const userState = {};

// Обработчики команд
bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    userState[chatId] = { step: 'start' };
    
    const welcomeText = `🤖 *Добро пожаловать в YndxITBot!*\n\n` +
        `Выберите тип торговых точек:\n` +
        `• 🏪 *Популярные ТТ* - часто используемые точки\n` +
        `• 🏠 *Частные ТТ* - алфавитный каталог компаний\n` +
        `• 📞 *Стандартный прозвон* - общая информация\n\n` +
        `*Для специальных точек (Магнит, Лента) доступны дополнительные ситуации*`;
    
    bot.sendMessage(chatId, welcomeText, { 
        parse_mode: 'Markdown',
        reply_markup: mainMenu.reply_markup 
    });
});

// Обработка кнопки популярных точек
bot.onText(/🏪 Популярные ТТ/, (msg) => {
    const chatId = msg.chat.id;
    userState[chatId] = { step: 'selecting_point', pointType: 'popular' };
    bot.sendMessage(chatId, `⭐ *Популярные торговые точки:*`, {
        parse_mode: 'Markdown',
        reply_markup: popularPoints.getKeyboard().reply_markup
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
            reply_markup: alphabetManager.getAlphabetKeyboard().reply_markup
        }
    );
});

// Обработка кнопки стандартного прозвона
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
            // Обработка популярных точек
            const point = popularPoints.getPointByCallback(data);
            
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
                reply_markup: situationsManager.getKeyboard(point).reply_markup
            });
        }
        // ... остальные обработчики callback

        bot.answerCallbackQuery(callbackQuery.id);
    } catch (error) {
        console.error('❌ Ошибка обработки callback:', error);
        bot.answerCallbackQuery(callbackQuery.id, { text: 'Произошла ошибка' });
    }
});

// Обработка помощи
bot.onText(/❓ Помощь/, (msg) => {
    const chatId = msg.chat.id;
    
    const helpText = `📋 *Помощь по YndxITBot*\n\n` +
        `*Процесс работы:*\n` +
        `1. Выберите тип точек (🏪 Популярные или 🏠 Частные)\n` +
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

console.log('✅ YndxITBot готов к работе!');
