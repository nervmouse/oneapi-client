const mergeDeep = (target, source, isMergingArrays = false) => {
  target = ((obj) => {
  let cloneObj;
  try {
      cloneObj = JSON.parse(JSON.stringify(obj));
  } catch(err) {
      // If the stringify fails due to circular reference, the merge defaults
      //   to a less-safe assignment that may still mutate elements in the target.
      // You can change this part to throw an error for a truly safe deep merge.
      cloneObj = Object.assign({}, obj);
  }
  return cloneObj;
  })(target);

  const isObject = (obj) => obj && typeof obj === "object";

  if (!isObject(target) || !isObject(source))
      return source;

  Object.keys(source).forEach(key => {
      const targetValue = target[key];
      const sourceValue = source[key];

      if (Array.isArray(targetValue) && Array.isArray(sourceValue))
          if (isMergingArrays) {
              target[key] = targetValue.map((x, i) => sourceValue.length <= i
                                                          ? x 
                                                          : mergeDeep(x, sourceValue[i], isMergingArrays));
              if (sourceValue.length > targetValue.length)
                  target[key] = target[key].concat(sourceValue.slice(targetValue.length));
          } else {
              target[key] = targetValue.concat(sourceValue);
          }
      else if (isObject(targetValue) && isObject(sourceValue))
          target[key] = mergeDeep(Object.assign({}, targetValue), sourceValue, isMergingArrays);
      else
          target[key] = sourceValue;
  });

  return target;
}
module.exports={ 
  mergeDeep
}