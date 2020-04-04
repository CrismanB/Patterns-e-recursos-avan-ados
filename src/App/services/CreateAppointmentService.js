const User = require("./../models/User");
const Appointment = require("./../models/Appointment");
const dateFns = require("date-fns");
const pt = require("date-fns/locale/pt");

const Cache = require("./../../services/Cache");

const Notification = require("./../schemas/Notification");

class CreateAppointmentService {
    async run({ provider_id, user_id, date }) {
        //Check if provider_id is a provider
        const isProvider = await User.findOne({
            where: {
                id: provider_id,
                provider: true,
            },
        });

        if (!isProvider) {
            console.log(isProvider);
            throw new Error("You can only create appointments with providers.");
        }

        const hourStart = dateFns.startOfHour(dateFns.parseISO(date));

        /**
         * Check for past dates
         */
        if (dateFns.isBefore(hourStart, new Date())) {
            throw new Error("Past dates are not permitted.");
        }

        /**
         *  Check date availability
         */

        const checkAvailability = await Appointment.findOne({
            where: { provider_id, canceled_at: null, date: hourStart },
        });

        if (checkAvailability) {
            throw new Error("Appointment date is not available.");
        }

        /**
         * Check if provider is trying make an appointment
         */
        if (user_id === provider_id) {
            throw new Error("User cannot make an appointment as a provider");
        }

        const appointment = await Appointment.create({
            user_id,
            provider_id,
            date,
        });

        /**
         * Notify provider
         */
        const user = await User.findByPk(user_id);

        const formatDate = dateFns.format(
            hourStart,
            "'dia' dd 'de' MMMM', ás' H:mm'h'",
            {
                locale: pt,
            }
        );
        await Notification.create({
            content: `Novo agendamento de ${user.name} para o ${formatDate}`,
            user: provider_id,
        });

        /**
         *  Invalidate cache
         */

        await Cache.invalidatePrefix(`user:${user.id}:appointments:`);

        return appointment;
    }
}

module.exports = new CreateAppointmentService();
