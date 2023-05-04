import { Injectable, NestMiddleware } from '@nestjs/common';
import { UsersService } from '@src/users/users.service';
import { NextFunction, Request, Response } from 'express';
import { JwtService } from './jwt.service';

@Injectable()
export class JwtMiddleware implements NestMiddleware {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    if ('x-jwt' in req.headers) {
      const token = req.headers['x-jwt'];
      const decoded = this.jwtService.verify(token.toString());

      if (typeof decoded === 'object' && decoded.id) {
        const { ok, user } = await this.usersService.findById(decoded.id);
        if (ok) {
          req['user'] = user;
        }
      }
    }
    next();
  }
}
