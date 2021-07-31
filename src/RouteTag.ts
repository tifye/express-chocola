import { Route } from './Route';

export type ITagOptions = [string, ((...args: any[]) => void)[]?];

export default class RouteTag {
  public routes: string[];
  public readonly middleware: ((...args: any[]) => void)[];
  public readonly name: string;

  constructor([name, middleware = undefined]: ITagOptions) {
    this.routes = [];
    this.middleware = middleware || [];
    this.name = name;
  }

  public addRoute(routeName: string) {
    this.routes.push(routeName);
    return this;
  }

  public addRoutes(routes: string[]) {
    return routes.forEach((routeName) => this.addRoute(routeName));
  }

  public addMiddleware(middleware: ((...args: any[]) => void)) {
    this.middleware.push(middleware);
  }
}
