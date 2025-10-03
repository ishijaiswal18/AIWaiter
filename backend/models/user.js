let userFavorites = {}; // { userId: ['m1', 'm3'] }

const getFavorites = (userId) => userFavorites[userId] || [];

const addFavorite = (userId, itemId) => {
    if (!userFavorites[userId]) {
        userFavorites[userId] = [];
    }
    if (!userFavorites[userId].includes(itemId)) {
        userFavorites[userId].push(itemId);
        return true;
    }
    return false; // Item already favorited
};

const removeFavorite = (userId, itemId) => {
    if (!userFavorites[userId]) {
        return false;
    }
    const initialLength = userFavorites[userId].length;
    userFavorites[userId] = userFavorites[userId].filter(id => id !== itemId);
    return userFavorites[userId].length < initialLength; // True if an item was removed
};

module.exports = {
    getFavorites,
    addFavorite,
    removeFavorite,
};