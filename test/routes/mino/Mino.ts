import { IRouteArgs, Route } from '../../../src/Route';

export default class MinoRoute extends Route {
  constructor() {
    super({
      name: 'mino',
      group: 'mino',
      method: 'get',
      path: 'mino',
      collections: ['mino', 'non_existant'],
    });
  }

  async run(args: IRouteArgs) {
    const { request, response } = args;
    console.log(request.headers);
    return response.send('Mino!');
  }
}
