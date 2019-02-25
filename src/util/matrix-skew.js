/* Created by tommyZZM.OSX on 2019/2/21. */
"use strict";

export function skewMat3(out, a, radPair = []) {
  const [radX = 0, radY = 0] = radPair;
  const sx = Math.tan(+radX);
  const sy = Math.tan(+radY);

  out[0] = a[0];
  out[1] = a[1] + sy;
  out[2] = a[2];
  out[3] = a[3] + sx;
  out[4] = a[4];
  out[5] = a[5];
  return out;
}
