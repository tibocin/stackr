import { Router, Request, Response, NextFunction } from 'express';

export function healthRouter() {
  const r = Router();
  let start = Date.now();
  let reqCount = 0;

  r.use((_req: Request, _res: Response, next: NextFunction) => { reqCount++; next(); });

  r.get('/healthz', (_req: Request, res: Response) => {
    res.json({ status: 'ok', service: 'stackr', ts: new Date().toISOString() });
  });

  r.get('/readyz', (_req: Request, res: Response) => {
    // later: check DB + config
    res.json({ ready: true });
  });

  r.get('/metrics', (_req: Request, res: Response) => {
    const uptime = Math.floor((Date.now() - start) / 1000);
    res.type('text/plain').send([
      `stackr_uptime_seconds ${uptime}`,
      `stackr_requests_total ${reqCount}`,
    ].join('\n'));
  });

  return r;
}
