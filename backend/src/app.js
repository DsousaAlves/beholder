const express = require('express');
require('express-async-errors');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const authMiddleware = require('./middlewares/authMiddleware');
const errorMiddleware = require('./middlewares/errorMiddleware');
const {doLogin, doLogout} = require('./controllers/authController');
const settingsRouter = require('./routers/settingsRouter');
const symbolsRouter = require('./routers/symbolsRouter');


const app = express();

app.use(cors({origin: process.env.CORS_ORIGIN}));
app.use(helmet());
app.use(express.json());
app.use(morgan('dev'))

app.post('/login', doLogin);

app.use('/settings', authMiddleware, settingsRouter);

app.use('/symbols', authMiddleware, symbolsRouter);

app.post('/logout', doLogout);

app.use('/', (req, res, next) => {
    res.send('Hello world');
});


app.use(errorMiddleware);

module.exports = app;