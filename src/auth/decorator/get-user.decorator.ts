import {
    createParamDecorator,
    ExecutionContext,
} from '@nestjs/common';
import { User } from '@prisma/client';

export const GetUser = createParamDecorator(
    (key: keyof User | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();

        if (key) {
            return request.user[key];
        }

        return request.user;
    },
);