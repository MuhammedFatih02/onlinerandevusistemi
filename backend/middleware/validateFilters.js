const validateFilters = (req, res, next) => {
    const { specialization, city, service, name, minPrice, maxPrice } = req.query;

    if (minPrice && isNaN(minPrice)) {
        return res.status(400).json({ message: 'minPrice must be a number' });
    }

    if (maxPrice && isNaN(maxPrice)) {
        return res.status(400).json({ message: 'maxPrice must be a number' });
    }

    if (minPrice && maxPrice && Number(minPrice) > Number(maxPrice)) {
        return res.status(400).json({ message: 'minPrice cannot be greater than maxPrice' });
    }

    next();
};

export default validateFilters;