// @ts-check
import express from 'express';
import { PersonalityService } from '../personality/personality-service.js';
import { logger } from '../logger.js';

const router = express.Router();

/**
 * GET /personality/state/:charName
 * Retrieves the internal state of a character.
 */
router.get('/state/:charName', async (request, response) => {
    try {
        const charName = request.params.charName;
        if (!charName) return response.status(400).send({ error: true, message: 'Character name required' });

        const personalityService = new PersonalityService(request.user.directories, charName);
        const state = await personalityService.load();

        return response.send(state);
    } catch (error) {
        logger.error(`[PERSONALITY] Failed to get state: ${error.message}`);
        return response.status(500).send({ error: true, message: error.message });
    }
});

/**
 * POST /personality/state/:charName
 * Updates the internal state of a character.
 */
router.post('/state/:charName', async (request, response) => {
    try {
        const charName = request.params.charName;
        const delta = request.body;

        if (!charName) return response.status(400).send({ error: true, message: 'Character name required' });
        if (!delta) return response.status(400).send({ error: true, message: 'State delta required' });

        const personalityService = new PersonalityService(request.user.directories, charName);
        const newState = await personalityService.update(delta);

        return response.send(newState);
    } catch (error) {
        logger.error(`[PERSONALITY] Failed to update state: ${error.message}`);
        return response.status(500).send({ error: true, message: error.message });
    }
});

export const personalityRouter = router;
