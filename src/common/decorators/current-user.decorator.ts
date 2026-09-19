import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Pemakaian di controller:
 *   findMine(@CurrentUser() user: CurrentUserPayload)
 * Hasilnya = object yang di-return dari JwtStrategy.validate()
 */
export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext) => {
  const request = ctx.switchToHttp().getRequest();
  return request.user;
});
