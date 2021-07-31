import { IRouteArgs, Route } from '../../src/Route';

export default class Default extends Route {
  constructor() {
    super({
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
