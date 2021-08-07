/* eslint-disable no-param-reassign */
/* eslint-disable prefer-destructuring */
/* eslint-disable no-empty-function */
/* eslint-disable no-useless-constructor */
/* eslint-disable no-shadow */
import {
  Response,
  Request,
  NextFunction,
} from 'express';
import {
  isArrayOfType,
  isBoolean,
  isNumber,
  isObject,
  unifyRouteInputDefinition,
} from './helperFunctions';
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

// Route inputs
export type TRouteInput = [string, 'object' | 'string' | 'number' | 'boolean', boolean?];
export interface IRouteInput {
  name: string;
  type: 'object' | 'string' | 'number' | 'boolean' | 'array';
  arrayType?: 'object' | 'string' | 'number';
  required?: boolean;
  allowNull?: boolean;
  inputLocation?: string;
}
export type RouteInput = TRouteInput | IRouteInput;

export interface InputError {
  inputName: string;
  message: string;
}

export interface IRouteInputs {
  query?: RouteInput[];
  body?: RouteInput[];
  params?: RouteInput[];
}

export interface IRouteArgs {
  request: Request;
  response: Response;
  next: NextFunction;
  inputs?: any;
  [id: string]: any;
}

export interface IRouteInfo {
  name: string;
  group?: string;
  tags?: string[];
  description?: string;
  method: string;
  path: string | RouteMethod;
  middleware?: ((...args: any[]) => void)[];
  priority?: IRouteOrderPosition;
  requreAuth?: boolean;
  inputs?: IRouteInputs;
  handleInputError?(errors: InputError[], args: IRouteArgs): void;
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
  public inputs: IRouteInput[];
  private handleInputError?(errors: InputError[], args: IRouteArgs): void;

  constructor(info: IRouteInfo) {
    this.name = info.name;
    this.group = info.group;
    this.tags = info.tags;
    this.description = info.description;
    this.method = info.method;
    this.subPath = info.path;
    this.middleware = info.middleware;
    this.priority = info.priority;
    //
    this.inputs = unifyRouteInputDefinition(info.inputs);
    //
    this.handleInputError = info.handleInputError;
  }

  public async wrappedRun(args: IRouteArgs) {
    try {
      this.activeResponse = args.response;
      const inputResults = this.validateRequestInputs(args.request);
      if (inputResults[0].length > 0) {
        console.error(inputResults[0]);
        if (this.handleInputError) this.handleInputError(inputResults[0], args);
        else {
          this.activeResponse.status(400).send({
            errors: inputResults[0].map((error) => ({
              input: error.inputName,
              message: error.message,
            })),
          });
        }
        return;
      }
      args.inputs = inputResults[1];

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

  get path() {
    const group = (this.group === undefined) ? '' : `/${this.group}`;
    const path = (this.subPath[0] === '/') ? this.subPath.substr(1) : this.subPath;
    return `${group}/${path}`;
  }

  public validateRequestInputs(request: Request | any): [InputError[], any] {
    if (this.inputs === undefined) return [[], null];
    const inputs: any = {};
    const errors: InputError[] = [];

    this.inputs.forEach((routeInput) => {
      let input = (request as any)[routeInput.inputLocation!][routeInput.name];
      if (routeInput.allowNull && input === null) {
        inputs[routeInput.name] = null;
        return;
      }

      if (!routeInput.required && input === undefined) return;

      let wasError = false;

      switch (routeInput.type) {
        case 'string':
          input = String(input);
          break;
        case 'number': {
          const result = isNumber(input);
          if (!result[0]) wasError = true;
          else input = result[1];
          break;
        }
        case 'boolean': {
          const result = isBoolean(input);
          if (!result[0]) wasError = true;
          else input = result[1];
          break;
        }
        case 'object': {
          const result = isObject(input);
          if (!result[0]) wasError = true;
          else input = result[1];
          break;
        }
        case 'array': {
          if (routeInput.arrayType === undefined) {
            throw new Error(`❗ Trying to validate RouteInput: ${routeInput.name} of type array but no element type was provided`);
          }
          const result = isArrayOfType(input, routeInput.arrayType);
          if (!result[0]) wasError = true;
          else input = result[1];
          break;
        }
        default:
          break;
      }

      if (wasError) {
        errors.push({
          inputName: routeInput.name,
          message: `RouteInput: ${routeInput.name} in route ${routeInput.inputLocation} is either missing or of invalid type`,
        });
        return;
      }
      inputs[routeInput.name] = input;
    });

    return [errors, inputs];
  }

  abstract run(args: IRouteArgs): Promise<Response | void>;
}
