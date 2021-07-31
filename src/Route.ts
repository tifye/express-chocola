/* eslint-disable no-empty-function */
/* eslint-disable no-useless-constructor */
/* eslint-disable no-shadow */
import {
  Response,
  Request,
  NextFunction,
  Router,
} from 'express';

export enum IRouteOrderPosition {
  LAST = 'last',
}

export enum RouteMethod {
  GET = 'get',
  PUT = 'put',
  POST = 'post',
  PATCH = 'patch',
  DELETE = 'delete',
  HEAD = 'head',
  CONNECT = 'connect',
  OPTIONS = 'options',
  TRACE = 'trace'
}

export interface IRouteInfo {
  name: string,
  group?: string,
  tags?: string[],
  description?: string,
  method: string;
  path: string | RouteMethod;
  middleware?: ((...args: any[]) => void)[];
  priority?: IRouteOrderPosition;
  requreAuth?: boolean;
}

export interface IRouteArgs {
  request: Request;
  response: Response;
  next: NextFunction;
  [id: string]: any;
}

export abstract class Route {
  private activeResponse: Response | undefined | null;

  constructor(public readonly info: IRouteInfo) {}

  public register(router: Router, extraMiddleware: ((...args: any[]) => void)[] = []) {
    if (this.info.middleware === undefined) this.info.middleware = [];
    (router as any)[this.info.method](`/${this.info.group}/${this.info.path}`, ...extraMiddleware, ...this.info.middleware, async (request: Request, response: Response, next: NextFunction) => {
      await this.wrappedRun({ request, response, next });
    });
  }

  public async wrappedRun(args: IRouteArgs) {
    try {
      this.activeResponse = args.response;
      await this.run(args);
    } catch (error) {
      console.error(this.info, error);
      args.next(error);
    }
  }

  protected respond(status: number, object: any, end: boolean = true) {
    this.activeResponse?.status(status).json(object);
    if (end) this.activeResponse?.end();
  }

  get path() {
    const group = (this.info.group === undefined) ? '' : `/${this.info.group}`;
    const path = (this.info.path[0] === '/') ? this.info.path.substr(1) : this.info.path;
    return `${group}/${path}`;
  }

  abstract run(args: IRouteArgs): Promise<Response | void>;
}
