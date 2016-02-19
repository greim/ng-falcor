// See mit-license.txt for license info

export default function detach(model, inTemplate) {
  const outTemplate = {};
  const ops = [];
  for (const prop of Object.keys(inTemplate)) {
    const path = inTemplate[prop];
    ops.push(model.getValue(path)
    .then(val => outTemplate[prop] = val));
  }
  return Promise.all(ops).then(() => {
    Object.defineProperty(outTemplate, '_save', {
      enumerable: false,
      value: function() {
        const pathVals = [];
        for (const prop of Object.keys(inTemplate)) {
          const path = inTemplate[prop];
          const value = outTemplate[prop];
          pathVals.push({ path, value });
        }
        return model.set.apply(model, pathVals);
      }
    });
    return outTemplate;
  });
}
