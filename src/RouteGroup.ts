export type IRouteGroupOptions = [string, ((...args: any[]) => void)[]?] | string;

export default class RouteGroup {
  public routes: string[];
  public readonly middleware: ((...args: any[]) => void)[];
  public readonly name: string;

  constructor(options: IRouteGroupOptions) {
    this.routes = [];
    if (typeof options === 'string') {
      this.name = options;
      this.middleware = [];
    } else {
      const [name, middleware = []] = options;
      this.middleware = middleware;
      this.name = name;
    }
  }

  public addRoute(routeName: string) {
    this.routes.push(routeName);
    return this;
  }

  public addRoutes(routes: string[]) {
    return routes.forEach((routeName) => this.addRoute(routeName));
  }
}
