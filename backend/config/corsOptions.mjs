/* Configuration of CORS middleware to allow specific origins */

import allowedOrigins from './allowedOrigins.mjs';

const corsOptions = {
    origin: function(origin, callback) {
        // Check if the origin is allowed
        if (allowedOrigins.indexOf(origin) !== -1 || !origin) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

export default corsOptions;