let orders = []; // { orderId: 'o1', userId: 'u1', items: [{itemId: 'm1', quantity: 1}], status: 'pending' }

const create = (userId, items) => {
    const orderId = `o${orders.length + 1}`;
    const newOrder = { orderId, userId, items, status: 'pending', createdAt: new Date() };
    orders.push(newOrder);
    return newOrder;
};

const update = (orderId, newItems) => {
    const orderIndex = orders.findIndex(order => order.orderId === orderId);
    if (orderIndex === -1) return null;

    orders[orderIndex].items = newItems;
    orders[orderIndex].status = 'updated';
    return orders[orderIndex];
};

const cancel = (orderId) => {
    const initialLength = orders.length;
    orders = orders.filter(order => order.orderId !== orderId);
    return orders.length < initialLength; // True if an order was removed
};

const getStatus = (orderId) => {
    const order = orders.find(order => order.orderId === orderId);
    return order ? { orderId: order.orderId, status: order.status } : null;
};

const getAll = () => {
    return orders;
};

module.exports = {
    create,
    update,
    cancel,
    getStatus,
    getAll,
};