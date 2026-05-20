import { AuthService } from "./authService";
import { DepartmentService } from "./departmentService";
import { TeamService } from "./teamService";
import { UserService } from "./userService";

export { AuthService } from "./authService";
export { DepartmentService } from "./departmentService";
export { TeamService } from "./teamService";
export { UserService } from "./userService";


export const departmentService = new DepartmentService();
export const teamService = new TeamService();
export const userService = new UserService();
