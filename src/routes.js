const { Router } = require("express");
const multer = require("multer");
const multerConfig = require("./config/multer");

const UserController = require("./App/controllers/UserController");
const SessionController = require("./App/controllers/SessionController");
const FileController = require("./App/controllers/FileController");
const ProviderController = require("./App/controllers/ProviderController");
const AppointmentController = require("./App/controllers/AppointmentController");
const ScheduleController = require("./App/controllers/ScheduleController");
const NotificationsController = require("./App/controllers/NotificationsController");
const AvailableController = require("./App/controllers/AvailableController");

const validateUserStore = require("./App/validators/UserStore");
const validateUserUpdate = require("./App/validators/UserUpdate");
const validateSessionStore = require("./App/validators/SessionStore");
const validateAppointmentStore = require("./App/validators/AppointmentStore");

const routes = new Router();
const upload = multer(multerConfig);
const authMiddleware = require("./App/middlewares/auth");

routes.post("/users", validateUserStore, UserController.store);
routes.post("/session", validateSessionStore, SessionController.store);

routes.use(authMiddleware);

routes.put("/users", validateUserUpdate, UserController.update);

routes.get("/providers", ProviderController.index);
routes.get("/providers/:providerId/available", AvailableController.index);

routes.post(
    "/appointment",
    validateAppointmentStore,
    AppointmentController.store
);
routes.get("/appointment", AppointmentController.index);
routes.delete("/appointment/:id", AppointmentController.destroy);

routes.get("/schedule", ScheduleController.index);

routes.get("/notifications", NotificationsController.index);
routes.put("/notifications/:id", NotificationsController.update);

routes.post("/files", upload.single("file"), FileController.store);
module.exports = routes;
