import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import usersRouter from "./users";
import tutorsRouter from "./tutors";
import availabilityRouter from "./availability";
import bookingsRouter from "./bookings";
import dashboardRouter from "./dashboard";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(usersRouter);
router.use(tutorsRouter);
router.use(availabilityRouter);
router.use(bookingsRouter);
router.use(dashboardRouter);

export default router;
