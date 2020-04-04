const User = require("./../models/User");
const Appointment = require("./../models/Appointment");
const dateFns = require("date-fns");

const Queue = require("./../../services/Queue");
const Cache = require("./../../services/Cache");
const CancelationMail = require("./../jobs/CancelantionMail");

class CancelAppointmentService {
    async run({ provider_id, user_id }) {
        const appointment = await Appointment.findByPk(provider_id, {
            include: [
                {
                    model: User,
                    as: "provider",
                    attributes: ["name", "email"],
                },
                {
                    model: User,
                    as: "user",
                    attributes: ["name"],
                },
            ],
        });

        if (appointment.user_id !== user_id) {
            throw new Error(
                "You don't have permission to cancel this appointment"
            );
        }

        const dateWithSub = dateFns.subHours(appointment.date, 2);

        if (dateFns.isBefore(dateWithSub, new Date())) {
            throw new Error(
                "You can only cancel appointments 2 hours in advance."
            );
        }

        appointment.canceled_at = new Date();

        await appointment.save();

        await Queue.add(CancelationMail.key, {
            appointment,
        });

        /**
         *  Invalidate cache
         */

        await Cache.invalidatePrefix(`user:${user_id}:appointments:`);
    }
}

module.exports = new CancelAppointmentService();
