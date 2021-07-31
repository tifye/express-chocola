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
