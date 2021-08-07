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
      inputs: {
        query: [
          ['meep1', 'number'],
          {
            name: 'meep2',
            type: 'array',
            arrayType: 'number',
            required: true,
            allowNull: true,
          },
        ],
      },
      handleInputError: (errors, args) => {
        console.error(errors);
        args.response.send(errors);
      },
    });
  }

  async run(args: IRouteArgs) {
    const { request, response } = args;
    const { meep1, meep2 } = args.inputs;
    console.log(meep1, meep2);

    return response.send('Meep!');
  }
}
