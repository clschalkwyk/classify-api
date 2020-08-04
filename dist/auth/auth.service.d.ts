import { JwtService } from "@nestjs/jwt";
import { CreateUserDto } from "./dto/createUser.dto";
export declare class AuthService {
    private jwtService;
    constructor(jwtService: JwtService);
    toHash(password: string): Promise<string>;
    compare(storedPassword: string, suppliedPassword: string): Promise<boolean>;
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
    }>;
    userExists(email: string): Promise<boolean>;
    createUser(createUserDto: CreateUserDto): Promise<void>;
}
