const express = require('express');
require('express-async-errors');
const cors = require('cors');
const helmet = require('helmet');

const authMiddleware = require('./middlewares/authMiddleware');
const errorMiddleware = require('./middlewares/errorMiddleware');
const {doLogin, doLogout} = require('./controllers/authController');
const settingsController = require('./controllers/settingsControllers');


const app = express();

app.use(cors());
app.use(helmet());
app.use(express.json());

app.post('/login', doLogin);

app.get('/settings', authMiddleware, settingsController.getSettings);

app.patch('/settings', authMiddleware, settingsController.updateSettings);

app.post('/logout', doLogout);

app.use('/', (req, res, next) => {
    res.send('Hello world');
});


app.use(errorMiddleware);

module.exports = app;