import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export type JwtUser = {
  userId: string;   // from JwtStrategy.validate()
  email: string;
};

/**
 * Injects the authenticated user's JWT payload (as set by JwtStrategy.validate)
 * Usage: handler(@CurrentUser() user: JwtUser) { ... }
 */
export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): JwtUser | undefined => {
    const request = ctx.switchToHttp().getRequest();
    console.log("REQUEST: ",request);
    return request?.user as JwtUser | undefined;
  },
);

/**
 * Convenience decorator to inject only the authenticated user's id
 * Usage: handler(@CurrentUserId() userId: string) { ... }
 */
export const CurrentUserId = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): string | undefined => {
    const request = ctx.switchToHttp().getRequest();
    return (request?.user as JwtUser | undefined)?.userId;
  },
);
