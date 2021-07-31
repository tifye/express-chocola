import { IRouteArgs, Route } from '../../../src/Route';

export default class MinoRoute extends Route {
  constructor() {
    super({
      name: 'mino',
      group: 'mino',
      method: 'get',
      path: 'mino',
      collections: ['mino', 'non_existant'],
      middleware: [
        (req, res, next) => {
          console.log('mino middleware', req.headers);
          next();
        },
      ],
    });
  }

  async run(args: IRouteArgs) {
    const { request, response } = args;
    console.log('mino run', request.headers);
    return response.send('Mino!');
  }
}
