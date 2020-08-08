export declare function toHash(password: string): Promise<string>;
export declare function compare(storedPassword: string, suppliedPassword: string): Promise<boolean>;
