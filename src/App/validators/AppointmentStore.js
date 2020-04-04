let Yup = require("yup");

module.exports = async (req, res, next) => {
    try {
        const schema = Yup.object().shape({
            date: Yup.date().required(),
            provider_id: Yup.number().required()
        });

        await schema.validate(req.body, { abortEarly: false });

        return next();
    } catch (error) {
        return res
            .status(400)
            .json({ error: "validations fails", messages: error.inner });
    }
};
