import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest();
    
    // Skip logging if not in HTTP context
    if (!req || !req.method || !req.url) {
      return next.handle();
    }

    const { method, url } = req;
    const start = Date.now();
    
    return next.handle().pipe(
      tap(() => {
        const ms = Date.now() - start;
        console.log(`[NOTIFY] ${method} ${url} - ${ms}ms`);
      }),
    );
  }
}