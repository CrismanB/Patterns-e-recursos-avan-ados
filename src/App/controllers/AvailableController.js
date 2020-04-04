const AvailableService = require("./../services/AvailableService");

class AvailableController {
    async index(req, res) {
        const { date } = req.query;

        if (!date) {
            return res.status(400).json({ error: "Invalid date." });
        }

        const searchDate = Number(date);

        const available = await AvailableService.run({
            date: searchDate,
            searchDate,
            provider_id: req.params.providerId
        });

        return res.json(available);
    }
}

module.exports = new AvailableController();
