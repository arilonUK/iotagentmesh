
import { publicRoutes } from "./publicRoutes";
import { dashboardRoutes } from "./dashboardRoutes";
import { settingsRoutes } from "./settingsRoutes";

export { publicRoutes, dashboardRoutes, settingsRoutes };

export const allRoutes = [
  ...publicRoutes,
  ...dashboardRoutes,
  ...settingsRoutes,
];
