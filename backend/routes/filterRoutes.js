import express from 'express';
import FilterController from '../controllers/FilterController.js';

const router = express.Router();

router.get('/doctors', FilterController.filterDoctors);
router.get('/services', FilterController.filterServices);
router.get('/city/:city', FilterController.searchByCity);

export default router;