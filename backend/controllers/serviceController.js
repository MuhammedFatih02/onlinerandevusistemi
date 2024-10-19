import Service from '../models/Service.js';
import Doctor from '../models/Doctor.js';

export const createService = async (req, res) => {
    try {
        const newService = new Service({
            ...req.body,
            createdBy: req.user.userId
        });
        const savedService = await newService.save();
        res.status(201).json(savedService);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const getAllServices = async (req, res) => {
    try {
        const { search, category, minPrice, maxPrice, doctorId } = req.query;
        let query = { isActive: true };

        if (search) {
            query.$text = { $search: search };
        }

        if (category) {
            query.category = category;
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        if (doctorId) {
            query.doctors = doctorId;
        }

        const services = await Service.find(query)
            .populate('createdBy', 'name role')
            .populate('doctors', 'user specialization');
        res.status(200).json(services);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const getServiceById = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id)
            .populate('createdBy', 'name role')
            .populate('doctors', 'user specialization');
        if (!service) return res.status(404).json({ message: 'Hizmet bulunamadı' });
        res.status(200).json(service);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const updateService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ message: 'Hizmet bulunamadı' });

        if (req.user.role !== 'admin' && service.createdBy.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Bu hizmeti güncelleme yetkiniz yok' });
        }

        const updatedService = await Service.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.status(200).json(updatedService);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

export const deleteService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        if (!service) return res.status(404).json({ message: 'Hizmet bulunamadı' });

        if (req.user.role !== 'admin' && service.createdBy.toString() !== req.user.userId) {
            return res.status(403).json({ message: 'Bu hizmeti silme yetkiniz yok' });
        }

        await Service.findByIdAndUpdate(req.params.id, { isActive: false });
        res.status(200).json({ message: 'Hizmet başarıyla silindi' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Yeni eklenen fonksiyon
export const addDoctorToService = async (req, res) => {
    try {
        const service = await Service.findById(req.params.id);
        const doctor = await Doctor.findById(req.body.doctorId);

        if (!service || !doctor) {
            return res.status(404).json({ message: 'Hizmet veya doktor bulunamadı' });
        }

        if (!service.doctors.includes(doctor._id)) {
            service.doctors.push(doctor._id);
            await service.save();
        }

        if (!doctor.services.includes(service._id)) {
            doctor.services.push(service._id);
            await doctor.save();
        }

        res.json(service);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};