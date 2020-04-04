const User = require("./../models/User");
const File = require("./../models/File");

const Cache = require("./../../services/Cache");

class ProviderController {
    async index(req, res) {
        const cached = await Cache.get("providers");

        if (cached) {
            return res.json(cached);
        }

        const provider = await User.findAll({
            where: { provider: true },
            attributes: ["id", "name", "email", "avatar_id"],
            include: [
                {
                    model: File,
                    as: "avatar",
                    attributes: ["name", "path", "url"],
                },
            ],
        });

        await Cache.set("providers", provider);

        return res.json(provider);
    }
}

module.exports = new ProviderController();
