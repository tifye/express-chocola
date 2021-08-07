import { IRouteArgs, Route } from '../../src/Route';
import RouteRegistry from '../../src/RouteRegistry';

export default class Default extends Route {
  constructor(registry: RouteRegistry) {
    super(registry, {
      name: 'default',
      method: 'get',
      path: '',
    });
  }

  async run(args: IRouteArgs) {
    const { response } = args;
    return response.sendFile('D:\\Projects\\express-chocola\\test\\public\\blank.html');
  }
}
