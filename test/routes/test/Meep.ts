import { IRouteArgs, Route, RouteMethod } from '../../../src/Route';
import RouteRegistry from '../../../src/RouteRegistry';

export default class MeepRoute extends Route {
  constructor(registry: RouteRegistry) {
    super(registry, {
      name: 'meep',
      group: 'meep',
      method: RouteMethod.GET,
      path: 'meep',
      tags: ['meep'],
    });
  }

  async run(args: IRouteArgs) {
    const { request, response } = args;
    console.log(request.headers);
    return response.send('Meep!');
  }
}
