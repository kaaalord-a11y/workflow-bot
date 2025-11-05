const TelegramBot = require('node-telegram-bot-api');

// Импортируем модули
const PopularPoints = require('./modules/popularPoints');
const AlphabetManager = require('./modules/alphabetManager');
const SituationsManager = require('./modules/situationsManager');
const StateManager = require('./modules/stateManager');
const SolutionsManager = require('./modules/solutionsManager');

const TOKEN = '8130982213:AAFroFmRqgNxvRZOdEbBB6b7VeNLOxmYFLY';
const bot = new TelegramBot(TOKEN, { polling: true });

// Обработка ошибок polling
bot.on('polling_error', (error) => {
    if (error.code === 'ETELEGRAM' && error.message.includes('409')) {
        console.error('⚠️ ВНИМАНИЕ: Другой экземпляр бота уже запущен! Остановите все другие экземпляры.');
    } else {
        console.error('❌ Ошибка polling:', error);
    }
});

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
bot.on('callback_query', async (callbackQuery) => {
    const msg = callbackQuery.message;
    const chatId = msg.chat.id;
    const data = callbackQuery.data;

    try {
        // Обработка популярных точек
        if (data.startsWith('p')) {
            const point = popularPoints.getPointByCallback(data);
            
            console.log(`✅ ПОЛЬЗОВАТЕЛЬ ВЫБРАЛ ТОЧКУ: ${point}`);
            
            // Проверяем, должны ли мы показать только заглушку (без ситуаций)
            const cleanName = point.toLowerCase().trim().replace(/\s/g, '').replace(/\//g, '');
            const showOnlySchedule =
                cleanName.includes('лентаммфтаймбук') ||
                cleanName.includes('ашан') ||
                cleanName.includes('газпромарена') ||
                cleanName.includes('профисервис') ||
                cleanName.includes('кофехауз') ||
                (cleanName.includes('кофе') && cleanName.includes('хауз'));
            
            if (showOnlySchedule) {
                // Показываем заглушку для точек без ситуаций
                let scheduleText;
                if (cleanName.includes('ашан')) {
                    scheduleText =
`📍 *${point}*\n\n` +
`По всем вопросам, которые связаны с исполнителем:\n\n` +
`1. Ставим таск на DUTY\n` +
`2. Призываем в таск @viktoriiya06 и @shdmitrii\n` +
`3. Откладываем таск на 30 минут\n` +
`— Если ответа нет через 30 минут, откладываем на 2 часа, после 20:00 откладываем до 9:00`;
                } else if (cleanName.includes('газпромарена') || cleanName.includes('профисервис')) {
                    scheduleText =
`📍 *Газпром Арена + Профи Сервис*\n\n` +
`Не звоним!\n\n` +
`1) Создаем таск на DUTY с тематикой "Выплаты Профи сервис".\n` +
`— Откладываем тикет на 1 час.\n` +
`— Если в таске через 1 час нет ответа и требуется больше времени, то откладываем на 4 часа, после 19:00 откладываем до 10:00\n\n` +
`2) После ответа в таске идем по логике`;
                } else if (cleanName.includes('лентаммфтаймбук')) {
                    scheduleText =
`📍 *${point}*\n\n` +
`Если в задании обнаружились какие-то несоответствия или нужны корректировки времени задания/выплаты, то обращение нужно передать на 2Л`;
                } else {
                    scheduleText = `📍 *${point}*\n\n📞 *Информация по этой точке находится в разработке.*`;
                }
                const scheduleKeyboard = {
                    inline_keyboard: [
                        [{ text: '↩️ Назад к точкам', callback_data: 'back_points' }]
                    ]
                };
                
                try {
                    await bot.editMessageText(scheduleText, {
                        chat_id: chatId,
                        message_id: msg.message_id,
                        parse_mode: 'Markdown',
                        reply_markup: scheduleKeyboard
                    });
                    userState[chatId] = {
                        step: 'viewing_schedule',
                        selectedPoint: point,
                        pointType: 'popular'
                    };
                } catch (editError) {
                    const errorMessage = editError.message || editError.toString() || '';
                    if (!errorMessage.includes('message is not modified') && 
                        !errorMessage.includes('not modified')) {
                        await bot.sendMessage(chatId, scheduleText, {
                            parse_mode: 'Markdown',
                            reply_markup: scheduleKeyboard
                        });
                        userState[chatId] = {
                            step: 'viewing_schedule',
                            selectedPoint: point,
                            pointType: 'popular'
                        };
                    }
                }
            } else {
                // Обычная логика с ситуациями
                userState[chatId] = {
                    step: 'selecting_situation',
                    selectedPoint: point,
                    pointType: 'popular'
                };
                
                try {
                    await bot.editMessageText(`✅ *Выбрана точка:* ${point}\n\n📋 *Теперь выберите ситуацию:*`, {
                        chat_id: chatId,
                        message_id: msg.message_id,
                        parse_mode: 'Markdown',
                        reply_markup: situationsManager.getKeyboard(point).reply_markup
                    });
                } catch (editError) {
                    const errorMessage = editError.message || editError.toString() || '';
                    if (errorMessage.includes('message is not modified') || 
                        errorMessage.includes('not modified')) {
                        console.log('⚠️ Сообщение не изменилось (дублирующий клик)');
                    } else {
                        // Если не удалось отредактировать, отправляем новое сообщение
                        console.log('⚠️ Не удалось отредактировать сообщение, отправляем новое');
                        await bot.sendMessage(chatId, `✅ *Выбрана точка:* ${point}\n\n📋 *Теперь выберите ситуацию:*`, {
                            parse_mode: 'Markdown',
                            reply_markup: situationsManager.getKeyboard(point).reply_markup
                        });
                    }
                }
            }
        }
        // Заглушки/неактивные нажатия
        else if (data === 'noop_ru' || data === 'noop_en' || data === 'noop_sep') {
            try { await bot.answerCallbackQuery(callbackQuery.id); } catch {}
            return;
        }
        // Обработка ситуаций
        else if (data.startsWith('s')) {
            console.log(`🔍 Обработка callback ситуации: ${data}`);
            const currentState = userState[chatId];
            
            if (!currentState || !currentState.selectedPoint) {
                console.log('❌ Неверное состояние для выбора ситуации');
                await bot.answerCallbackQuery(callbackQuery.id, { text: 'Ошибка: сначала выберите точку' });
                return;
            }
            
            const situation = situationsManager.getSituationByCallback(data, currentState.selectedPoint);
            
            if (situation === 'Ситуация не найдена') {
                console.error(`❌ Ситуация не найдена для callback: ${data}, точка: ${currentState.selectedPoint}`);
                await bot.answerCallbackQuery(callbackQuery.id, { text: 'Ситуация не найдена' });
                return;
            }
            
            userState[chatId].selectedSituation = situation;
            
            console.log(`✅ ВЫБРАНА СИТУАЦИЯ: ${situation} для точки ${currentState.selectedPoint}`);
            
            // Получаем решение
            const solution = solutionsManager.getSolution(currentState.selectedPoint, situation);
            
            let scheduleInfo = '';
            if (currentState.selectedSchedule) {
                scheduleInfo = `\n📅 <b>ГРАФИК ЗВОНКОВ:</b>\n${currentState.selectedSchedule}`;
            }
            
            const solutionText = `🟢 <b>ВЫБРАНО:</b>\n\n` +
                               `📍 <b>ТОРГОВАЯ ТОЧКА:</b>\n${currentState.selectedPoint}\n\n` +
                               `🔴 <b>СИТУАЦИЯ:</b>\n${situation}` +
                               `${scheduleInfo}\n\n` +
                               `${solution}\n\n` +
                               `⬅️ Нажмите "↩️ Назад к точкам" чтобы выбрать другую ситуацию\n` +
                               `🔄 Или "🏪 Выбрать новую точку" для выбора новой точки`;
            
            try {
                await bot.editMessageText(solutionText, {
                    chat_id: chatId,
                    message_id: msg.message_id,
                    parse_mode: 'HTML',
                    reply_markup: situationsManager.getSolutionKeyboard()
                });
            } catch (editError) {
                const errorMessage = editError.message || editError.toString() || '';
                if (errorMessage.includes('message is not modified') || 
                    errorMessage.includes('not modified')) {
                    console.log('⚠️ Сообщение не изменилось (дублирующий клик)');
                } else {
                    // Если не удалось отредактировать, отправляем новое сообщение
                    console.log('⚠️ Не удалось отредактировать сообщение, отправляем новое');
                    await bot.sendMessage(chatId, solutionText, {
                        parse_mode: 'HTML',
                        reply_markup: situationsManager.getSolutionKeyboard()
                    });
                }
            }
        }
        // Обработка выбора буквы алфавита
        else if (data.startsWith('letter_')) {
            const letter = data.replace('letter_', '');
            console.log(`✅ ВЫБРАНА БУКВА: ${letter}`);
            
            try {
                await bot.editMessageText(`📋 *Компании на букву "${letter}":*`, {
                    chat_id: chatId,
                    message_id: msg.message_id,
                    parse_mode: 'Markdown',
                    reply_markup: alphabetManager.getCompaniesKeyboard(letter).reply_markup
                });
            } catch (editError) {
                const errorMessage = editError.message || editError.toString() || '';
                if (!errorMessage.includes('message is not modified') && 
                    !errorMessage.includes('not modified')) {
                    console.error('❌ Ошибка редактирования сообщения:', errorMessage);
                }
            }
        }
        // Обработка выбора компании из алфавита
        else if (data.startsWith('c_')) {
            const company = alphabetManager.getCompanyByCallback(data);
            
            if (!company) {
                console.log(`❌ Компания не найдена для callback: ${data}`);
                await bot.answerCallbackQuery(callbackQuery.id, { text: 'Компания не найдена' });
                return;
            }
            
            const pointName = company.name;
            const schedule = company.schedule || 'Расписание не указано';
            
            console.log(`✅ ВЫБРАНА КОМПАНИЯ: ${pointName}, расписание: ${schedule}`);
            
            const scheduleText = `📍 *${pointName}*\n\n📞 *Время прозвона:*\n${schedule}`;
            
            const scheduleKeyboard = {
                inline_keyboard: [
                    [{ text: '🔙 Назад к алфавиту', callback_data: 'back_to_alphabet' }],
                    [{ text: '↩️ Назад в главное меню', callback_data: 'back_main' }]
                ]
            };
            
            try {
                await bot.editMessageText(scheduleText, {
                    chat_id: chatId,
                    message_id: msg.message_id,
                    parse_mode: 'Markdown',
                    reply_markup: scheduleKeyboard
                });
            } catch (editError) {
                const errorMessage = editError.message || editError.toString() || '';
                if (errorMessage.includes('message is not modified') || 
                    errorMessage.includes('not modified')) {
                    console.log('⚠️ Сообщение не изменилось (дублирующий клик)');
                } else {
                    // Если не удалось отредактировать, отправляем новое сообщение
                    console.log('⚠️ Не удалось отредактировать сообщение, отправляем новое');
                    await bot.sendMessage(chatId, scheduleText, {
                        parse_mode: 'Markdown',
                        reply_markup: scheduleKeyboard
                    });
                }
            }
        }
        // Показать все компании
        else if (data === 'all_companies') {
            console.log(`✅ ПОКАЗАТЬ ВСЕ КОМПАНИИ`);
            
            try {
                await bot.editMessageText(`📋 *Все компании:*`, {
                    chat_id: chatId,
                    message_id: msg.message_id,
                    parse_mode: 'Markdown',
                    reply_markup: alphabetManager.getAllCompaniesKeyboard().reply_markup
                });
            } catch (editError) {
                const errorMessage = editError.message || editError.toString() || '';
                if (!errorMessage.includes('message is not modified') && 
                    !errorMessage.includes('not modified')) {
                    console.error('❌ Ошибка редактирования сообщения:', errorMessage);
                }
            }
        }
        // Вернуться к алфавиту
        else if (data === 'back_to_alphabet') {
            try {
                await bot.editMessageText(
                    `🏠 *Частные торговые точки*\n\n` +
                    `Выберите букву для просмотра компаний:`,
                    {
                        chat_id: chatId,
                        message_id: msg.message_id,
                        parse_mode: 'Markdown',
                        reply_markup: alphabetManager.getAlphabetKeyboard().reply_markup
                    }
                );
            } catch (editError) {
                const errorMessage = editError.message || editError.toString() || '';
                if (!errorMessage.includes('message is not modified') && 
                    !errorMessage.includes('not modified')) {
                    console.error('❌ Ошибка редактирования сообщения:', errorMessage);
                }
            }
        }
        // Вернуться к точкам
        else if (data === 'back_points') {
            const currentState = userState[chatId];
            if (!currentState) {
                await bot.answerCallbackQuery(callbackQuery.id, { text: 'Ошибка: нет состояния' });
                return;
            }
            
            // Если точка выбрана из популярных - возвращаем к списку популярных точек
            if (currentState.pointType === 'popular') {
                try {
                    await bot.editMessageText(`⭐ *Популярные торговые точки:*`, {
                        chat_id: chatId,
                        message_id: msg.message_id,
                        parse_mode: 'Markdown',
                        reply_markup: popularPoints.getKeyboard().reply_markup
                    });
                    // Обновляем состояние
                    userState[chatId] = { step: 'selecting_point', pointType: 'popular' };
                } catch (editError) {
                    const errorMessage = editError.message || editError.toString() || '';
                    if (!errorMessage.includes('message is not modified') && 
                        !errorMessage.includes('not modified')) {
                        console.error('❌ Ошибка редактирования сообщения:', errorMessage);
                        // Если не удалось отредактировать, отправляем новое
                        await bot.sendMessage(chatId, `⭐ *Популярные торговые точки:*`, {
                            parse_mode: 'Markdown',
                            reply_markup: popularPoints.getKeyboard().reply_markup
                        });
                        userState[chatId] = { step: 'selecting_point', pointType: 'popular' };
                    }
                }
            }
            // Если точка выбрана из частных ТТ - возвращаем к списку ситуаций (так как частные ТТ показывают только расписание)
            else if (currentState.pointType === 'private') {
                // Для частных ТТ не должно быть ситуаций, но на всякий случай вернем к алфавиту
                try {
                    await bot.editMessageText(
                        `🏠 *Частные торговые точки*\n\n` +
                        `Выберите букву для просмотра компаний:`,
                        {
                            chat_id: chatId,
                            message_id: msg.message_id,
                            parse_mode: 'Markdown',
                            reply_markup: alphabetManager.getAlphabetKeyboard().reply_markup
                        }
                    );
                    userState[chatId] = { step: 'selecting_other_point' };
                } catch (editError) {
                    const errorMessage = editError.message || editError.toString() || '';
                    if (!errorMessage.includes('message is not modified') && 
                        !errorMessage.includes('not modified')) {
                        console.error('❌ Ошибка редактирования сообщения:', errorMessage);
                    }
                }
            }
            // Если тип точки не определен, но точка выбрана - возвращаем к списку ситуаций
            else if (currentState.selectedPoint) {
                try {
                    await bot.editMessageText(`✅ *Выбрана точка:* ${currentState.selectedPoint}\n\n📋 *Теперь выберите ситуацию:*`, {
                        chat_id: chatId,
                        message_id: msg.message_id,
                        parse_mode: 'Markdown',
                        reply_markup: situationsManager.getKeyboard(currentState.selectedPoint).reply_markup
                    });
                } catch (editError) {
                    const errorMessage = editError.message || editError.toString() || '';
                    if (!errorMessage.includes('message is not modified') && 
                        !errorMessage.includes('not modified')) {
                        console.error('❌ Ошибка редактирования сообщения:', errorMessage);
                    }
                }
            } else {
                await bot.answerCallbackQuery(callbackQuery.id, { text: 'Ошибка: нет выбранной точки' });
            }
        }
        // Вернуться в главное меню
        else if (data === 'back_main') {
            try {
                await bot.editMessageText(
                    `🤖 *Добро пожаловать в YndxITBot!*\n\n` +
                    `Выберите тип торговых точек:\n` +
                    `• 🏪 *Популярные ТТ* - часто используемые точки\n` +
                    `• 🏠 *Частные ТТ* - алфавитный каталог компаний\n` +
                    `• 📞 *Стандартный прозвон* - общая информация\n\n` +
                    `*Для специальных точек (Магнит, Лента) доступны дополнительные ситуации*`,
                    {
                        chat_id: chatId,
                        message_id: msg.message_id,
                        parse_mode: 'Markdown',
                        reply_markup: mainMenu.reply_markup
                    }
                );
            } catch (editError) {
                // Если не удалось отредактировать, отправляем новое сообщение
                bot.sendMessage(chatId,
                    `🤖 *Добро пожаловать в YndxITBot!*\n\n` +
                    `Выберите тип торговых точек:\n` +
                    `• 🏪 *Популярные ТТ* - часто используемые точки\n` +
                    `• 🏠 *Частные ТТ* - алфавитный каталог компаний\n` +
                    `• 📞 *Стандартный прозвон* - общая информация\n\n` +
                    `*Для специальных точек (Магнит, Лента) доступны дополнительные ситуации*`,
                    {
                        parse_mode: 'Markdown',
                        reply_markup: mainMenu.reply_markup
                    }
                );
            }
        }

        await bot.answerCallbackQuery(callbackQuery.id);
    } catch (error) {
        console.error('❌ Ошибка обработки callback:', error.message || error);
        try {
            await bot.answerCallbackQuery(callbackQuery.id, { text: 'Произошла ошибка' });
        } catch (answerError) {
            console.error('❌ Ошибка ответа на callback:', answerError.message);
        }
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
