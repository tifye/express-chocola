import { IRouteInput, IRouteInputs, RouteInput } from './Route';

// eslint-disable-next-line import/prefer-default-export
export const flatten = (object: any): any[] => {
  const array: any[] = [];
  // eslint-disable-next-line no-underscore-dangle
  const _flatten = (_object: any) => {
    Object.keys(_object).forEach((key) => {
      if (typeof _object[key] === 'object') _flatten(_object[key]);
      else array.push(_object[key]);
    });
  };

  _flatten(object);
  return array;
};

// Type checking
type ReturnTypeCheck<T> = [boolean, T | null];
// Boolean
export const isBoolean = (input: any): ReturnTypeCheck<boolean> => {
  const thruthy = [true, 'true', '1', 1];
  const falsy = [false, 'false', '0', 0];
  if (thruthy.includes(input)) return [true, true];
  if (falsy.includes(input)) return [true, false];
  return [false, null];
};
// Number
export const isNumber = (input: any): ReturnTypeCheck<Number> => {
  if (input === null) return [false, null];
  const output = Number(input);
  if (Number.isNaN(output)) return [false, null];
  return [true, output];
};
// Object
export const isObject = (input: any): ReturnTypeCheck<Object> => {
  let output: any;
  if (typeof input === 'object') return [true, input];
  if (typeof input === 'string') {
    try {
      output = JSON.parse(input);
    } catch (error: any) {
      return [false, null];
    }
  }
  return [true, output];
};
// Array of type
export const isArrayOfType = (input: any, type: 'number' | 'string' | 'object'): ReturnTypeCheck<any[]> => {
  if (!Array.isArray(input)) return [false, null];
  const output: any[] = [];
  const allOfType = input.every((element) => {
    switch (type) {
      case 'number': {
        const result = isNumber(element);
        output.push(result[1]);
        return result[0];
      }
      case 'string': {
        output.push(String(element));
        return true;
      }
      case 'object': {
        const result = isObject(element);
        output.push(result[1]);
        return result[0];
      }
      default:
        return false;
    }
  });

  if (!allOfType) return [false, null];
  return [true, output];
};

export const unifyRouteInputDefinition = (routeInputs: IRouteInputs | undefined): IRouteInput[] => {
  if (routeInputs === undefined) return [];
  const inputs: IRouteInput[] = [];
  Object.keys(routeInputs).forEach((inputLocation) => {
    (routeInputs[inputLocation] as RouteInput[]).forEach((routeInput) => {
      if (Array.isArray(routeInput)) {
        inputs.push({
          name: routeInput[0],
          type: routeInput[1],
          required: routeInput[2] || undefined,
          inputLocation,
        });
      } else {
        inputs.push({
          ...routeInput,
          inputLocation,
        });
      }
    });
  });

  return inputs;
};
