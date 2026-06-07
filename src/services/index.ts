import { DepartmentService } from "./departmentService";
import { TeamService } from "./teamService";
import { UserService } from "./userService";
import { CustomerService } from "./customerService";
import { AuthService } from "./authService";
import { DealService } from "./dealService";
import { ActivityService } from "./activityService";
import { GoogleService } from "./googleService";
import { SettingsService } from "./settingsService";

export {
  AuthService,
  DepartmentService,
  TeamService,
  UserService,
  CustomerService,
  DealService,
  ActivityService,
  GoogleService,
  SettingsService,
};

export const authService = new AuthService();
export const departmentService = new DepartmentService();
export const teamService = new TeamService();
export const userService = new UserService();
export const customerService = new CustomerService();
export const dealService = new DealService();
export const activityService = new ActivityService();
export const googleService = new GoogleService();
export const settingsService = new SettingsService();
