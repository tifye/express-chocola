import {
  isArrayOfType,
  isBoolean,
  isNumber,
  isObject,
  unifyRouteInputDefinition,
} from '../src/helperFunctions';

describe('Helper Functions', () => {
  it('Should return not a Number', () => {
    const input = null;
    const result = isNumber(input);
    expect(result[0]).toBe(false);
    expect(result[1]).toBe(null);
  });
  it('Should return an Object', () => {
    const input = JSON.stringify({ meep: 'meep' });
    const result = isObject(input);
    expect(result[0]).toBe(true);
    expect(result[1]).toEqual({ meep: 'meep' });
  });
  it('Should return a falsy Boolean', () => {
    const input = '0';
    const result = isBoolean(input);
    expect(result[0]).toBe(true);
    expect(result[1]).toBe(false);
  });
  it('Should return a Number Array', () => {
    const input: any[] = [1, 2, '4', 5, 33, '3236123'];
    const result = isArrayOfType(input, 'number');
    expect(result[0]).toBe(true);
    expect(result[1]).toEqual([1, 2, 4, 5, 33, 3236123]);
  });

  it('Should return routeInputs object with properties of common interface', () => {
    const result = unifyRouteInputDefinition({
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
    });

    expect(result.length).toBe(4);
    expect(result[3]).toEqual({
      name: 'paramsNumber',
      type: 'number',
      inputLocation: 'params',
    });
  });
});
