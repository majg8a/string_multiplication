/*
 *  big.js v6.0.0
 *  A small, fast, easy-to-use library for arbitrary-precision decimal arithmetic.
 *  Copyright (c) 2020 Michael Mclaughlin
 *  https://github.com/MikeMcl/big.js/LICENCE.md
 */

/************************************** EDITABLE DEFAULTS *****************************************/
var DP = 20, // 0 to MAX_DP
  RM = 1, // 0, 1, 2 or 3
  MAX_DP = 1e6, // 0 to 1000000
  MAX_POWER = 1e6, // 1 to 1000000
  NE = -7, // 0 to -1000000
  PE = 21, // 0 to 1000000
  STRICT = false, // true or false
  NAME = "[big.js] ",
  INVALID = NAME + "Invalid ",
  INVALID_DP = INVALID + "decimal places",
  INVALID_RM = INVALID + "rounding mode",
  DIV_BY_ZERO = NAME + "Division by zero",
  P = {},
  UNDEFINED = void 0,
  NUMERIC = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;

function _Big_() {
  function Big(n) {
    var x = this;

    if (!(x instanceof Big)) return n === UNDEFINED ? _Big_() : new Big(n);

    if (n instanceof Big) {
      x.s = n.s;
      x.e = n.e;
      x.c = n.c.slice();
    } else {
      if (typeof n !== "string") {
        if (Big.strict === true) {
          throw TypeError(INVALID + "number");
        }

        n = n === 0 && 1 / n < 0 ? "-0" : String(n);
      }

      parse(x, n);
    }

    x.constructor = Big;
  }

  Big.prototype = P;
  Big.DP = DP;
  Big.RM = RM;
  Big.NE = NE;
  Big.PE = PE;
  Big.strict = STRICT;

  return Big;
}

P.times = P.mul = function (y) {
  var c,
    x = this,
    Big = x.constructor,
    xc = x.c,
    yc = (y = new Big(y)).c,
    a = xc.length,
    b = yc.length,
    i = x.e,
    j = y.e;

  y.s = x.s == y.s ? 1 : -1;

  if (!xc[0] || !yc[0]) return new Big(y.s * 0);

  y.e = i + j;

  if (a < b) {
    c = xc;
    xc = yc;
    yc = c;
    j = a;
    a = b;
    b = j;
  }

  for (c = new Array((j = a + b)); j--; ) c[j] = 0;

  for (i = b; i--; ) {
    b = 0;

    for (j = a + i; j > i; ) {
      b = c[j] + yc[i] * xc[j - i - 1] + b;
      c[j--] = b % 10;
      b = (b / 10) | 0;
    }

    c[j] = b;
  }

  if (b) ++y.e;
  else c.shift();

  for (i = c.length; !c[--i]; ) c.pop();
  y.c = c;

  return y;
};

P.toFixed = function (dp, rm) {
  var x = this,
    n = x.c[0];
  if (dp !== UNDEFINED) {
    if (dp !== ~~dp || dp < 0 || dp > MAX_DP) {
      throw Error(INVALID_DP);
    }
    x = round(new x.constructor(x), dp + x.e + 1, rm);
    for (dp = dp + x.e + 1; x.c.length < dp; ) x.c.push(0);
  }
  return stringify(x, false, !!n);
};

function round(x, sd, rm, more) {
  var xc = x.c;

  if (rm === UNDEFINED) rm = Big.RM;
  if (rm !== 0 && rm !== 1 && rm !== 2 && rm !== 3) {
    throw Error(INVALID_RM);
  }

  if (sd < 1) {
    more =
      (rm === 3 && (more || !!xc[0])) ||
      (sd === 0 &&
        ((rm === 1 && xc[0] >= 5) ||
          (rm === 2 &&
            (xc[0] > 5 || (xc[0] === 5 && (more || xc[1] !== UNDEFINED))))));

    xc.length = 1;

    if (more) {
      x.e = x.e - sd + 1;
      xc[0] = 1;
    } else {
      xc[0] = x.e = 0;
    }
  } else if (sd < xc.length) {
    more =
      (rm === 1 && xc[sd] >= 5) ||
      (rm === 2 &&
        (xc[sd] > 5 ||
          (xc[sd] === 5 &&
            (more || xc[sd + 1] !== UNDEFINED || xc[sd - 1] & 1)))) ||
      (rm === 3 && (more || !!xc[0]));

    xc.length = sd--;

    if (more) {
      for (; ++xc[sd] > 9; ) {
        xc[sd] = 0;
        if (!sd--) {
          ++x.e;
          xc.unshift(1);
        }
      }
    }

    for (sd = xc.length; !xc[--sd]; ) xc.pop();
  }

  return x;
}
