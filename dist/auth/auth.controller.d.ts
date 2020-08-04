import { AuthService } from "./auth.service";
import { CreateUserDto } from "./dto/createUser.dto";
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(req: any): Promise<{
        access_token: string;
    }>;
    getProfile(req: any): any;
    signup(createUserDto: CreateUserDto, res: any): Promise<any>;
}
