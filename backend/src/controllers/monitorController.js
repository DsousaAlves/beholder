const monitorRepostory = require('../repositories/monitorsRepository');

async function getMonitor(req, res, next) {
    const id = req.params.id;
    const monitor = await monitorRepostory.getMonitor(id);
    res.json(monitor);

}

async function getMonitors(req, res, next) {
    const id = req.query.page;
    const monitors = await monitorRepostory.getMonitors(page);
    res.json(monitors);
}

async function updateMonitor(req, res, next) {
    const id = req.params.id;
    const newMonitor = req.body;

    const currentMonitor = await monitorRepostory.getMonitor(id);
    if (currentMonitor.isSystemMon) {
        return res.sendStatus(403);
    }

    const updatedMonitor =  await monitorRepostory.updateMonitor(id, newMonitor);

    if (updatedMonitor.isActive) {
        // stop monitor start monitor
    } else {
        //stop monitor
    }

    res.json(updatedMonitor);
}

async function insertMonitor(req, res, next) {
    const newMonitor = req.body;
    const savedMonitor = await monitorRepostory.insertMonitor(newMonitor);

    if (savedMonitor.isActive) {
        // start no monitor
    }

    res.status(201).json(savedMonitor.get({plain: true}));
}

function startMonitor(req, res, next) {

}

function stopMonitor(req, res, next) {

}

async function deleteMonitor(req, res, next) {
    const id = req.params.id;

    const currentMonitor = await monitorRepostory.getMonitor(id);
    if (currentMonitor.isSystemMon) {
        return res.sendStatus(403);
    }

    if (currentMonitor.isActive) {
        // stop no monitor
    }

    res.sendStatus(204);
}

async function startMonitor(req, res, next) {
    const id = req.params.id;
    const currentMonitor = await monitorRepostory.getMonitor(id);
    if (currentMonitor.isActive) {
        return res.sendStatus(204);
    }
    if (currentMonitor.isActive) {
        return res.status(403).send(`You can't start or stop the system monitors`);
    }

    //start monitor
    currentMonitor.isActive = true;
    await currentMonitor.save();
    res.json(currentMonitor);
}

async function stopMonitor(req, res, next) {
    const id = req.params.id;
    const currentMonitor = await monitorRepostory.getMonitor(id);
    if (!currentMonitor.isActive) {
        return res.sendStatus(204);
    }
    if (currentMonitor.isActive) {
        return res.status(403).send(`You can't start or stop the system monitors`);
    }

    //stop monitor
    currentMonitor.isActive = false;
    await currentMonitor.save();
    res.json(currentMonitor);
}

module.exports = {
    getMonitor,
    getMonitors,
    updateMonitor,
    insertMonitor,
    startMonitor,
    stopMonitor,
    deleteMonitor
}