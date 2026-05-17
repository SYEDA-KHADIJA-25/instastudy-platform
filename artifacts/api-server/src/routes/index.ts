import { Router, type IRouter } from "express";
import healthRouter from "./health";

// MySQL routes (JS)
const usersRouter      = require("./users.js");
const tutorsRouter     = require("./tutors.js");
const availRouter      = require("./availability.js");
const bookingsRouter   = require("./bookings.js");
const materialsRouter  = require("./materials.js");
const adminRouter      = require("./admin.js");

const router: IRouter = Router();

router.use(healthRouter);
router.use("/users",        usersRouter);
router.use("/tutors",       tutorsRouter);
router.use("/availability", availRouter);
router.use("/bookings",     bookingsRouter);
router.use("/materials",    materialsRouter);
router.use("/admin",        adminRouter);

export default router;
