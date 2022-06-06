const database = require('./db');
const app = require('./app');
const settingsRepository = require('./repositories/settingsRepository');
const appEm = require('./app-em');
const appWs = require('./app-ws');
const logger = require('./utils/logger');
const beholder = require('./beholder');

(async () => {
    logger('system', `Getting the default settings with ID ${process.env.DEFAULT_SETTINGS_ID}...`);
    const settings = await settingsRepository.getDefaultSettings()
    if (!settings) throw new Error(`There is no settings.`);

    logger('system', 'Initializing the Beholder Brain...');

    // const automations = await automationsRepository.getActiveAutomations();
    beholder.init([]);

    // logger('system', `Starting the Beholder Agenda...`);
    // agenda.init(automations);

    logger('system', `Starting the server apps...`);
    const server = app.listen(process.env.PORT, () => {
        logger('system', 'App is running at ' + process.env.PORT);
    })

    const wss = appWs(server);

    appEm.init(settings, wss, beholder);
})();



