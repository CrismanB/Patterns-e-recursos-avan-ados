const Appointment = require("./../models/Appointment");
const dateFns = require("date-fns");
const { Op } = require("sequelize");

class AvailableService {
    async run({ provider_id, date }) {
        const appointments = await Appointment.findAll({
            where: {
                provider_id,
                canceled_at: null,
                date: {
                    [Op.between]: [
                        dateFns.startOfDay(date),
                        dateFns.endOfDay(date)
                    ]
                }
            }
        });

        const schedule = [
            "08:00",
            "09:00",
            "10:00",
            "11:00",
            "12:00",
            "13:00",
            "14:00",
            "15:00",
            "16:00",
            "17:00",
            "18:00",
            "19:00"
        ];

        const available = schedule.map(time => {
            const [hour, minute] = time.split(":");
            const value = dateFns.setSeconds(
                dateFns.setMinutes(dateFns.setHours(date, hour), 0),
                0
            );
            return {
                time,
                value: dateFns.format(value, "yyyy-MM-dd'T'HH:mm:ssxxx"),
                available:
                    dateFns.isAfter(value, new Date()) &&
                    !appointments.find(
                        a => dateFns.format(a.date, "HH:mm") === time
                    )
            };
        });

        return available;
    }
}

module.exports = new AvailableService();
