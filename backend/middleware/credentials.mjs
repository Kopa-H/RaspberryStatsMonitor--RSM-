/* Used to set the Access-Control-Allow-Origin header
to the origin of the request if it is in the allowedOrigins array */

import allowedOrigins from "../config/allowedOrigins.mjs";

const credentials = (req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', true);
    }
    next();
}

export default credentials;