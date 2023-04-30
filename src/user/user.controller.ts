import { BaseController } from '../common/base.controller';
import { HTTPError } from '../errors/http.error';
import { ILogger } from '../logger/logger.interface';
import { NextFunction, Request, Response } from 'express';
import { inject, injectable } from 'inversify';
import { TYPES } from '../types';
import 'reflect-metadata';
import { IUserController } from './user.interface';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { UserServise } from './user.servise';
import { ValidateMiddleware } from '../common/validate.middleware';
import { sign } from 'jsonwebtoken';
import { IUserServise } from './user.servise.interface';
import { GuardMiddleware } from '../common/guard.middleware';
import { UsersRepository } from './users.repository';

@injectable()
export class UserController extends BaseController implements IUserController {
	constructor(
		@inject(TYPES.ILogger) private loggerServise: ILogger,
		@inject(TYPES.UserServise) private userServise: IUserServise,
		@inject(TYPES.UsersRepository) private usersRepository: UsersRepository,
	) {
		super(loggerServise);
		this.bindRoute([
			{
				path: '/register',
				method: 'post',
				func: this.register,
				middleware: [new ValidateMiddleware(UserRegisterDto)],
			},
			{
				path: '/login',
				method: 'post',
				func: this.login,
				middleware: [new ValidateMiddleware(UserLoginDto)],
			},
			{
				path: '/info',
				method: 'get',
				func: this.info,
				middleware: [new GuardMiddleware()],
			},
		]);
	}
	async login(
		{ body }: Request<{}, {}, UserLoginDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const result = await this.userServise.validateUser(body);
		if (result) {
			const jwt = await this.signJWT(body.email, process.env.SECRET as string);
			this.ok(res, {
				message: 'Welcome',
				jwt: jwt,
			});
		} else {
			res.end('Неправильный логин или пароль');
		}
	}

	async register(
		{ body }: Request<{}, {}, UserRegisterDto>,
		res: Response,
		next: NextFunction,
	): Promise<void> {
		const result = await this.userServise.createUser(body);
		if (!result) {
			res.end('Пользователь уже существует');
		} else {
			this.ok(res, { id: result.id, email: result.email, name: result.name });
		}
	}

	async info({ user }: Request, res: Response, next: NextFunction): Promise<void> {
		const currUser = await this.userServise.getUser(user);
		this.ok(res, { email: currUser?.email, id: currUser?.id });
	}

	private signJWT(email: string, secret: string): Promise<string> {
		return new Promise<string>((resolve, reject) => {
			sign(
				{
					email,
					iat: Math.floor(Date.now() / 1000),
				},
				secret,
				{
					algorithm: 'HS256',
				},
				(err, token) => {
					if (err) {
						reject(err);
					}
					resolve(token as string);
				},
			);
		});
	}
}
