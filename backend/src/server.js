const database = require('./db');
const app = require('./app');
const settingsRepository = require('./repositories/settingsRepository');
const appEm = require('./app-em');
const appWs = require('./app-ws');
// const logger = require('./utils/logger');

(async () => {
    console.log('system', `Getting the default settings with ID ${process.env.DEFAULT_SETTINGS_ID}...`);
    const settings = await settingsRepository.getDefaultSettings()
    if (!settings) throw new Error(`There is no settings.`);

    console.log('system', 'Initializing the Beholder Brain...');

    // const automations = await automationsRepository.getActiveAutomations();
    // beholder.init(automations);

    // console.log('system', `Starting the Beholder Agenda...`);
    // agenda.init(automations);

    console.log('system', `Starting the server apps...`);
    const server = app.listen(process.env.PORT, () => {
        console.log('system', 'App is running at ' + process.env.PORT);
    })

    const wss = appWs(server);

    appEm.init(settings, wss, {});
})();



