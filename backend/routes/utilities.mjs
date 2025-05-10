import { Router } from 'express';
import { getPerformanceData } from '../database/databaseController.mjs';  // Cambiado al nombre correcto

const router = Router();

// RUTA PARA OBTENER TODOS LOS DATOS DE RENDIMIENTO INICIALES
router.get('/performance', async (req, res) => {
    try {
        const data = await getPerformanceData();
        res.json(data);  // Envía los datos como respuesta
    } catch (error) {
        console.error('Error al obtener datos de rendimiento:', error);
        res.status(500).json({ error: 'Error al obtener datos de rendimiento' });
    }
});

export default router;