
export type RouteHandler = (req: Request, path: string) => Promise<Response>;
