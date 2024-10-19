import Doctor from '../models/Doctor.js';
import Service from '../models/Service.js';

class FilterController {
    // Mevcut doktor filtreleme metodu
    async filterDoctors(req, res) {
        try {
            const { specialization, city, service } = req.query;
            const query = {};

            if (specialization) {
                query.specialization = specialization;
            }

            if (city) {
                query.city = city;
            }

            if (service) {
                // Hizmete göre doktorları filtrelemek için
                const serviceDocs = await Service.findOne({ name: service });
                if (serviceDocs) {
                    query.services = serviceDocs._id; // İlgili hizmete sahip doktorları bulur
                }
            }

            // Doktorları bul ve user içindeki firstName ve lastName bilgilerini ekle
            const doctors = await Doctor.find(query)
                .populate({
                    path: 'user',
                    select: 'firstName lastName' // Sadece firstName ve lastName alanlarını al
                })
                .populate('services'); // Hizmet bilgilerini de ekle

            res.json(doctors);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }


    // Hizmetleri değil, hizmetlere sahip doktorları filtreleme
    async filterServices(req, res) {
        try {
            const { name, minPrice, maxPrice } = req.query;
            const query = {};

            if (name) {
                query.name = { $regex: name, $options: 'i' }; // İsimle eşleşen hizmetler
            }

            if (minPrice || maxPrice) {
                query.price = {};
                if (minPrice) query.price.$gte = Number(minPrice);
                if (maxPrice) query.price.$lte = Number(maxPrice);
            }

            // İlgili hizmetleri filtrele ve bu hizmetlere sahip doktorları bul
            const services = await Service.find(query);
            const serviceIds = services.map(service => service._id);

            // Bu hizmetlere sahip doktorları döndür
            const doctors = await Doctor.find({ services: { $in: serviceIds } }).populate('services');
            res.json(doctors);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }

    // Şehir bazlı doktor arama
    async searchByCity(req, res) {
        try {
            const { city } = req.params;
            const doctors = await Doctor.find({ city }).populate('services');
            res.json(doctors);
        } catch (error) {
            res.status(500).json({ message: error.message });
        }
    }
}

export default new FilterController();
