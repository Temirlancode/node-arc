import express, { Express } from 'express';
import { Server } from 'http';
import { UserController } from './user/user.controller';
import { IExeptionFilter } from './errors/exeption.filter.interface';
import { ILogger } from './logger/logger.interface';
import { inject, injectable } from 'inversify';
import { TYPES } from './types';
import { json } from 'body-parser';
import dotenv from 'dotenv';
import { PrismaServise } from './database/prisma.servise';
import { AuthMiddleware } from './common/auth.middleware';
dotenv.config();

@injectable()
export class App {
	port: number;
	server: Server;
	app: Express;

	constructor(
		@inject(TYPES.ILogger) private logger: ILogger,
		@inject(TYPES.UserController) private userController: UserController,
		@inject(TYPES.ExeptionFilter) private exeptionFilter: IExeptionFilter,
		@inject(TYPES.PrismaServise) private prismaServise: PrismaServise,
	) {
		this.app = express();
		this.port = 5000;
	}

	useRoutes(): void {
		this.app.use('/users', this.userController.router);
	}

	useMiddleware(): void {
		this.app.use(json());
		const authMiddleware = new AuthMiddleware(process.env.SECRET as string);
		this.app.use(authMiddleware.execute.bind(authMiddleware));
	}

	useExeptionFilter(): void {
		this.app.use(this.exeptionFilter.catch.bind(this.exeptionFilter));
	}

	public async init(): Promise<void> {
		this.useMiddleware();
		this.useRoutes();
		this.useExeptionFilter();
		await this.prismaServise.connect();
		this.server = this.app.listen(this.port);
		this.logger.log('server is working on port ' + process.env.PORT);
	}
}
