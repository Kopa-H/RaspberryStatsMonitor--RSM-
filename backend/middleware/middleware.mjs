// middleware.js

import express from 'express';
import cors from 'cors';
import { urlencoded } from 'express';
import credentials from './credentials.mjs';
import corsOptions from '../config/corsOptions.mjs';

const app = express();

// Middleware para habilitar CORS
app.use(credentials);
app.use(cors(corsOptions));

app.use(urlencoded({ extended: false }));

export default app;
