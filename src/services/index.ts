import { DepartmentService } from "./departmentService";
import { TeamService } from "./teamService";
import { UserService } from "./userService";
import { CustomerService } from "./customerService";
import { AuthService } from "./authService";
import { DealService } from "./dealService";

export { AuthService, DepartmentService, TeamService, UserService, CustomerService, DealService };

export const authService = new AuthService();
export const departmentService = new DepartmentService();
export const teamService = new TeamService();
export const userService = new UserService();
export const customerService = new CustomerService();
export const dealService = new DealService();
