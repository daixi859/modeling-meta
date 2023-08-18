export function attr2Array(obj: Object, ...attrs: string[]) {
  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i];

    if (i == attrs.length - 1) {
      // @ts-ignore
      if (Array.isArray(obj[attr])) {
        // @ts-ignore
        return obj[attr];
      } else {
        // @ts-ignore
        if (obj[attr]) {
          // @ts-ignore
          return [obj[attr]];
        } else {
          return [];
        }
      }
    } else {
      // @ts-ignore
      if (obj[attr]) {
        // @ts-ignore
        obj = obj[attr];
      } else {
        return [];
      }
    }
  }
}
