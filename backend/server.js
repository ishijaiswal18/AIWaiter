const app = require('./app');
const config = require('./utils/config');
const { log } = require('./utils/logger');

app.listen(config.port, () => {
    log(`Server is running on port: ${config.port}`);
});