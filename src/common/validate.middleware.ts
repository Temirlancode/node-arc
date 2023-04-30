import { ClassConstructor, plainToClass } from 'class-transformer';
import { IMiddleware } from './middleware.interface';
import { NextFunction, Request, Response } from 'express';
import { validate } from 'class-validator';

export class ValidateMiddleware implements IMiddleware {
	constructor(private classToValidate: ClassConstructor<object>) {}

	execute({ body }: Request, res: Response, next: NextFunction): void {
		const intance = plainToClass(this.classToValidate, body);
		validate(intance).then((errors) => {
			if (errors.length > 0) {
				res.status(422).send(errors);
			} else {
				next();
			}
		});
	}
}