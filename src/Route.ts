/* eslint-disable no-empty-function */
/* eslint-disable no-useless-constructor */
/* eslint-disable no-shadow */
import {
  Response,
  Request,
  NextFunction,
  Router,
} from 'express';
import RouteRegistry from './RouteRegistry';

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
  /**
   * @typedef {Object} RouteInfo
   * @property {string} name - The name of the route
   * @property {string} group - The name of the group that this command belongs to. Groups always prepend the Routes path.
   * If no Group is specificed and the user has registered the default Group then the Route will be part of the default Group.
   *
   */
  private activeResponse: Response | undefined | null;

  public name: string;
  public group?: string;
  public tags?: string[];
  public description?: string;
  public method: string;
  public subPath: string | RouteMethod;
  public middleware?: ((...args: any[]) => void)[];
  public priority?: IRouteOrderPosition;

  constructor(private readonly registry: RouteRegistry, info: IRouteInfo) {
    this.name = info.name;
    this.group = info.group;
    this.tags = info.tags;
    this.description = info.description;
    this.method = info.method;
    this.subPath = info.path;
    this.middleware = info.middleware;
    this.priority = info.priority;
  }

  public async wrappedRun(args: IRouteArgs) {
    try {
      this.activeResponse = args.response;
      await this.run(args);
    } catch (error) {
      console.error(this, error);
      args.next(error);
    }
  }

  protected respond(status: number, object: any, end: boolean = true) {
    this.activeResponse?.status(status).json(object);
    if (end) this.activeResponse?.end();
  }

  public reload() {
    // TODO: delete require cache of this command
    this.registry.reregisterRoute(this, this);
  }

  get path() {
    const group = (this.group === undefined) ? '' : `/${this.group}`;
    const path = (this.subPath[0] === '/') ? this.subPath.substr(1) : this.subPath;
    return `${group}/${path}`;
  }

  abstract run(args: IRouteArgs): Promise<Response | void>;
}
