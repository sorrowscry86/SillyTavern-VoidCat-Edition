import { getRealIpFromHeader } from '../express-common.js';
import { getConfigValue } from '../util.js';
import { logger } from '../logger.js';

const enableAccessLog = getConfigValue('logging.enableAccessLog', true, 'boolean');

const knownIPs = new Set();

/**
 * Creates middleware for logging access and new connections
 * @returns {import('express').RequestHandler}
 */
export default function accessLoggerMiddleware() {
    return function (req, res, next) {
        if (!enableAccessLog) {
            return next();
        }

        const clientIp = getRealIpFromHeader(req);
        const userAgent = req.headers['user-agent'];

        if (!knownIPs.has(clientIp)) {
            knownIPs.add(clientIp);
            logger.access(`New connection from ${clientIp}; User Agent: ${userAgent}`);
        }

        next();
    };
}
