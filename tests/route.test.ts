import { IRouteArgs, Route, RouteMethod } from '../src/Route';
import RouteRegistry from '../src/RouteRegistry';

class TestRoute extends Route {
  constructor(registry: RouteRegistry) {
    super({
      name: 'meep',
      method: RouteMethod.POST,
      path: '/test',
      inputs: {
        query: [['queryString', 'string']],
        body: [
          {
            name: 'bodyNumArray',
            type: 'array',
            arrayType: 'number',
            required: true,
            allowNull: true,
          },
        ],
        params: [
          ['paramsObject', 'object'],
          ['paramsNumber', 'number'],
        ],
      },
    });
  }

  // eslint-disable-next-line no-empty-function
  async run(args: IRouteArgs) {}
}

describe('Route class', () => {
  let registry: RouteRegistry;
  let route: Route;

  beforeEach(() => {
    registry = new RouteRegistry();
    route = new TestRoute(registry);
    registry.registerRoute(route);
  });

  it('Shouuld return the correctly formatted path', () => {
    expect(route.path).toEqual('/test');
  });

  it('Should validate inputs with no error and pass through correct types', () => {
    const result = route.validateRequestInputs({
      query: {
        queryString: 'undefined',
      },
      body: {
        bodyNumArray: [1, 2, 3, 4, '5'],
      },
      params: {
        paramsObject: { property: 'property' },
        paramsNumber: '2',
      },
    });

    expect(result[0]).toEqual([]);
    expect(result[1]).toHaveProperty('bodyNumArray');
    expect(Object.keys(result[1]).length).toBe(4);
  });

  it('Should send back route input errors', () => {
    const result = route.validateRequestInputs({
      query: {},
      body: {},
      params: {
        paramsObject: '{meep:"meep"}',
        paramsNumber: '2s',
      },
    });

    expect(result[0].length).toBe(3);
    expect(result[0][0]?.inputName).toEqual('bodyNumArray');
  });

  it('Should be able to register an array of already instantiated Routes', () => {
    const routes = [route];
    registry.registerRoutes(routes);
    expect(registry.routes.has(route.name)).toBe(true);
  });
});
