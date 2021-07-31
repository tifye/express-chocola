import { Route } from './Route';

export type ICollectionOptions = [string, ((...args: any[]) => void)[]?];

export default class Collection {
  public routes: Route[];
  public readonly middleware: ((...args: any[]) => void)[];
  public readonly name: string;

  constructor([name, middleware = undefined]: ICollectionOptions) {
    this.routes = [];
    this.middleware = middleware || [];
    this.name = name;
  }

  public addRoute(route: Route) {
    this.routes.push(route);
  }
}
