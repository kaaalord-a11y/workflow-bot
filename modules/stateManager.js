class StateManager {
    constructor() {
        this.userStates = {};
    }

    setState(chatId, state) {
        if (!this.userStates[chatId]) {
            this.userStates[chatId] = {};
        }
        this.userStates[chatId] = { ...this.userStates[chatId], ...state };
    }

    getState(chatId) {
        return this.userStates[chatId];
    }

    clearState(chatId) {
        delete this.userStates[chatId];
    }
}

module.exports = StateManager;