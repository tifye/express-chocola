import { IRouteArgs, Route } from '../../../src/Route';

export default class MeepRoute extends Route {
  constructor() {
    super({
      name: 'meep',
      group: 'meep',
      method: 'get',
      path: 'meep',
      collections: ['meep'],
    });
  }

  async run(args: IRouteArgs) {
    const { request, response } = args;
    console.log(request.headers);
    return response.send('Meep!');
  }
}
