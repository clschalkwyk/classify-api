import { UserService } from "./user.service";
import { UserUpdateDto } from "./dto/updateUser.dto";
export declare class UserController {
    private userService;
    constructor(userService: UserService);
    updateProfile(updateUser: UserUpdateDto, req: any, res: any): Promise<any>;
    fetchProfile(req: any, res: any): Promise<any>;
}
