import { Container, ContainerModule, interfaces } from 'inversify';
import { App } from './app';
import { ExeptionFilter } from './errors/exeption.filter';
import { LoggerService } from './logger/logger.service';
import { UserController } from './user/user.controller';
import { ILogger } from './logger/logger.interface';
import { TYPES } from './types';
import { IExeptionFilter } from './errors/exeption.filter.interface';
import { IUserController } from './user/user.interface';
import { IUserServise } from './user/user.servise.interface';
import { UserServise } from './user/user.servise';
import { PrismaServise } from './database/prisma.servise';
import { UsersRepository } from './user/users.repository';

interface IBootstrapReturn {
	appContainer: Container;
	app: App;
}

export const appBilding = new ContainerModule((bind: interfaces.Bind) => {
	bind<ILogger>(TYPES.ILogger).to(LoggerService).inSingletonScope();
	bind<IExeptionFilter>(TYPES.ExeptionFilter).to(ExeptionFilter);
	bind<IUserController>(TYPES.UserController).to(UserController);
	bind<App>(TYPES.Application).to(App);
	bind<IUserServise>(TYPES.UserServise).to(UserServise);
	bind<PrismaServise>(TYPES.PrismaServise).to(PrismaServise).inSingletonScope();
	bind<UsersRepository>(TYPES.UsersRepository).to(UsersRepository).inSingletonScope();
});

function bootstrap(): IBootstrapReturn {
	const appContainer = new Container();
	appContainer.load(appBilding);
	const app = appContainer.get<App>(TYPES.Application);
	app.init();
	return { appContainer, app };
}

export const { appContainer, app } = bootstrap();
