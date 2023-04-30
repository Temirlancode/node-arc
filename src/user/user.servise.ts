import { TYPES } from '../types';
import { UserLoginDto } from './dto/user-login.dto';
import { UserRegisterDto } from './dto/user-register.dto';
import { User } from './user.entity';
import { IUserServise } from './user.servise.interface';
import { injectable, inject } from 'inversify';
import { UsersRepository } from './users.repository';
import { UserModel } from '.prisma/client';
import { compare } from 'bcryptjs';

@injectable()
export class UserServise implements IUserServise {
	constructor(@inject(TYPES.UsersRepository) private usersRepository: UsersRepository) {}
	async createUser({ email, name, password }: UserRegisterDto): Promise<UserModel | null> {
		const isExisted = await this.usersRepository.find(email);
		if (isExisted) {
			return null;
		}
		const newUser = new User(email, name);
		await newUser.hashPassword(password);
		return this.usersRepository.create(newUser);
	}

	async validateUser({ email, password }: UserLoginDto): Promise<boolean> {
		const isExisted = await this.usersRepository.find(email);
		if (!isExisted) {
			return false;
		}
		return compare(password, isExisted.password);
	}

	async getUser(email: string): Promise<UserModel | null> {
		return await this.usersRepository.find(email);
	}
}
