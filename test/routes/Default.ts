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
    const { request, response } = args;
    console.log('default run', request.headers);
    return response.send('Default!');
  }
}
