// See mit-license.txt for license info

const identity = x => x;

export default function detach(model, inTemplate) {
  const outTemplate = {};
  for (const prop of Object.keys(inTemplate)) {
    const path = inTemplate[prop];
    Object.defineProperty(outTemplate, prop, {
      enumerable: true,
      get() {
        return model.getValueSync(path);
      },
      set(value) {
        model.set({ path, value }).then(identity);
      }
    });
  }
  return outTemplate;
}
