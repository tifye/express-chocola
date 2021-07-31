import { IRouteArgs, Route } from '../../../src/Route';
import RouteRegistry from '../../../src/RouteRegistry';

export default class MinoRoute extends Route {
  constructor(registry: RouteRegistry) {
    super(registry, {
      name: 'mino',
      group: 'mino',
      method: 'get',
      path: 'mino',
      tags: ['mino', 'non_existant', 'authProtected'],
    });
  }

  async run(args: IRouteArgs) {
    const { request, response } = args;
    console.log('mino run', request.headers);
    return response.send('Mino!');
  }
}
