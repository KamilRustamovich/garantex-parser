import { Request } from "express";
import { UserEntity } from "src/database/entities/user.entity";

export interface ExpressRequestInterface extends Request {
	user?: UserEntity
}