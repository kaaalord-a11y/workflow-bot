const fs = require('fs');
const path = require('path');

class AlphabetManager {
    constructor() {
        this.companiesFile = path.join(__dirname, '..', 'companies_data.json');
        this.companiesData = this.loadCompaniesData();
        this.groupedCompanies = this.groupCompaniesByLetter();
    }

    loadCompaniesData() {
        try {
            return JSON.parse(fs.readFileSync(this.companiesFile, 'utf8'));
        } catch (error) {
            console.error('❌ Ошибка загрузки данных компаний:', error);
            return {};
        }
    }

    getAllCompanies() {
        const allCompanies = [];
        Object.values(this.companiesData).forEach(companies => {
            companies.forEach(company => {
                allCompanies.push(company);
            });
        });
        return allCompanies;
    }

    groupCompaniesByLetter() {
        const companies = this.getAllCompanies();
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

    sortLetters(letters) {
        const russianLetters = letters.filter(letter => /[А-Я]/.test(letter)).sort();
        const englishLetters = letters.filter(letter => /[A-Z]/.test(letter)).sort();
        return [...russianLetters, ...englishLetters];
    }

    getAlphabetKeyboard() {
        const allLetters = Object.keys(this.groupedCompanies);
        const russianLetters = allLetters.filter(letter => /[А-Я]/.test(letter)).sort();
        const englishLetters = allLetters.filter(letter => /[A-Z]/.test(letter)).sort();
        
        const buttons = [];
        
        // Заголовок для русских букв
        if (russianLetters.length > 0) {
            buttons.push([{ text: '🇷🇺 Русский алфавит', callback_data: 'noop_ru' }]);
            let row = [];
            russianLetters.forEach(letter => {
                row.push({ text: letter, callback_data: `letter_${letter}` });
                if (row.length === 8) {
                    buttons.push(row);
                    row = [];
                }
            });
            if (row.length > 0) buttons.push(row);
        }
        
        // Разделитель
        if (russianLetters.length > 0 && englishLetters.length > 0) {
            buttons.push([{ text: '──────────', callback_data: 'noop_sep' }]);
        }
        
        // Заголовок для английских букв
        if (englishLetters.length > 0) {
            buttons.push([{ text: '🇬🇧 Latin alphabet', callback_data: 'noop_en' }]);
            let row = [];
            englishLetters.forEach(letter => {
                row.push({ text: letter, callback_data: `letter_${letter}` });
                if (row.length === 8) {
                    buttons.push(row);
                    row = [];
                }
            });
            if (row.length > 0) buttons.push(row);
        }
        
        // Служебные кнопки
        buttons.push([{ text: '🔍 Все компании', callback_data: 'all_companies' }]);
        buttons.push([{ text: '↩️ Назад', callback_data: 'back_main' }]);
        
        return { reply_markup: { inline_keyboard: buttons } };
    }

    getCompaniesKeyboard(letter) {
        const companies = this.groupedCompanies[letter] || [];
        const buttons = companies.map((company, index) => [{
            text: company.name,
            callback_data: `c_${letter}_${index}`
        }]);
        
        buttons.push([{ text: '🔙 Назад к алфавиту', callback_data: 'back_to_alphabet' }]);
        
        return { reply_markup: { inline_keyboard: buttons } };
    }

    getAllCompaniesKeyboard() {
        const companies = this.getAllCompanies();
        const buttons = companies.map((company, index) => [{
            text: company.name,
            callback_data: `c_all_${index}`
        }]);
        
        buttons.push([{ text: '🔙 Назад к алфавиту', callback_data: 'back_to_alphabet' }]);
        
        return { reply_markup: { inline_keyboard: buttons } };
    }

    getCompanyByCallback(callbackData) {
        const parts = callbackData.split('_');
        
        if (parts[1] === 'all') {
            // Обработка для "все компании" - используем индекс
            const index = parseInt(parts[2]);
            const allCompanies = this.getAllCompanies();
            if (index >= 0 && index < allCompanies.length) {
                return allCompanies[index];
            }
            return null;
        } else {
            // Обычный выбор по букве - используем индекс
            const letter = parts[1];
            const index = parseInt(parts[2]);
            const companies = this.groupedCompanies[letter] || [];
            if (index >= 0 && index < companies.length) {
                return companies[index];
            }
            return null;
        }
    }
}

module.exports = AlphabetManager;