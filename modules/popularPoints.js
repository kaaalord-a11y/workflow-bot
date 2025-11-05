const fs = require('fs');
const path = require('path');

class PopularPoints {
    constructor() {
        this.pointsFile = path.join(__dirname, '..', 'popular_points.txt');
        this.points = this.loadPoints();
    }

    loadPoints() {
        try {
            return fs.readFileSync(this.pointsFile, 'utf8')
                .split('\n')
                .filter(line => line.trim());
        } catch (error) {
            console.error('❌ Ошибка загрузки популярных точек:', error);
            return [];
        }
    }

    getKeyboard() {
        const buttons = this.points.map((point, index) => [{
            text: point,
            callback_data: `p${index}`
        }]);
        
        buttons.push([{ text: '↩️ Назад', callback_data: 'back_main' }]);
        
        return { reply_markup: { inline_keyboard: buttons } };
    }

    getPointByCallback(callbackData) {
        const pointIndex = parseInt(callbackData.replace('p', ''));
        return this.points[pointIndex];
    }

    getAllPoints() {
        return this.points;
    }
}

module.exports = PopularPoints;