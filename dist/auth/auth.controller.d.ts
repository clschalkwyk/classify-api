import { AuthService } from "./auth.service";
import { CreateUserDto } from "./dto/createUser.dto";
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any, res: any): Promise<any>;
    getProfile(req: any): any;
    signup(createUserDto: CreateUserDto, res: any): Promise<any>;
}
