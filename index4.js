/*
 *  big.js v6.0.0
 *  A small, fast, easy-to-use library for arbitrary-precision decimal arithmetic.
 *  Copyright (c) 2020 Michael Mclaughlin
 *  https://github.com/MikeMcl/big.js/LICENCE.md
 */

/************************************** EDITABLE DEFAULTS *****************************************/

class _Big_ {
  DP = 20; // 0 to MAX_DP
  RM = 1; // 0, 1, 2 or 3
  MAX_DP = 1e6; // 0 to 1000000
  MAX_POWER = 1e6; // 1 to 1000000
  NE = -7; // 0 to -1000000
  PE = 21; // 0 to 1000000
  STRICT = false; // true or false
  NAME = "[big.js] ";
  INVALID = NAME + "Invalid ";
  INVALID_DP = INVALID + "decimal places";
  INVALID_RM = INVALID + "rounding mode";
  DIV_BY_ZERO = NAME + "Division by zero";
  P = {};
  UNDEFINED = void 0;
  NUMERIC = /^-?(\d+(\.\d*)?|\.\d+)(e[+-]?\d+)?$/i;
  constructor(n) {
    this.prototype = P;
    this.DP = DP;
    this.RM = RM;
    this.NE = NE;
    this.PE = PE;
    this.strict = STRICT;
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

    x.constructor = this;
  }
  times = function (y) {
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

function stringify(x, doExponential, isNonzero) {
  var e = x.e,
    s = x.c.join(""),
    n = s.length;

  // Exponential notation?
  if (doExponential) {
    s =
      s.charAt(0) + (n > 1 ? "." + s.slice(1) : "") + (e < 0 ? "e" : "e+") + e;

    // Normal notation.
  } else if (e < 0) {
    for (; ++e; ) s = "0" + s;
    s = "0." + s;
  } else if (e > 0) {
    if (++e > n) {
      for (e -= n; e--; ) s += "0";
    } else if (e < n) {
      s = s.slice(0, e) + "." + s.slice(e);
    }
  } else if (n > 1) {
    s = s.charAt(0) + "." + s.slice(1);
  }

  return x.s < 0 && isNonzero ? "-" + s : s;
}

function parse(x, n) {
  var e, i, nl;

  if (!NUMERIC.test(n)) {
    throw Error(INVALID + "number");
  }

  // Determine sign.
  x.s = n.charAt(0) == "-" ? ((n = n.slice(1)), -1) : 1;

  // Decimal point?
  if ((e = n.indexOf(".")) > -1) n = n.replace(".", "");

  // Exponential form?
  if ((i = n.search(/e/i)) > 0) {
    // Determine exponent.
    if (e < 0) e = i;
    e += +n.slice(i + 1);
    n = n.substring(0, i);
  } else if (e < 0) {
    // Integer.
    e = n.length;
  }

  nl = n.length;

  // Determine leading zeros.
  for (i = 0; i < nl && n.charAt(i) == "0"; ) ++i;

  if (i == nl) {
    // Zero.
    x.c = [(x.e = 0)];
  } else {
    // Determine trailing zeros.
    for (; nl > 0 && n.charAt(--nl) == "0"; );
    x.e = e - i - 1;
    x.c = [];

    // Convert string to array of digits without leading/trailing zeros.
    for (e = 0; i <= nl; ) x.c[e++] = +n.charAt(i++);
  }

  return x;
}

module.exports = new _Big_();

function getCleanNumber(x = "0") {
  let sign = x[0] === "-" ? "-" : "";
  const xSplit = x.split(".");
  let xInt = xSplit[0].replace(/0/g, " ").concat(".");
  xInt = xInt[0] === "-" ? xInt.slice(1) : xInt;
  xInt = xInt.trim().replace(/ /g, "0").replace(".", "");
  xInt = xInt.length === 0 ? "" : xInt;

  let xDec = xSplit[1];

  xDec = "."
    .concat(xSplit[1])
    .replace(/0/g, " ")
    .trim()
    .replace(/ /g, "0")
    .replace(/\./g, "");

  xDec = xDec === "" || xDec === "undefined" ? "" : "." + xDec;
  sign = xInt === "" ? "0" : sign;

  return sign + xInt + xDec;
}

function getDecLength(x) {
  const xSplit = x.split(".");
  const dec = xSplit[1];
  const decLength = dec !== "undefined" && x !== xSplit[0] ? dec.length : 0;
  return decLength;
}

function multiply(n, o) {
  const newN = getCleanNumber(n);
  const nDecL = getDecLength(newN);

  const newO = getCleanNumber(o);
  const oDecL = getDecLength(newO);

  obviouslyBigjs();
  res = Big(n)
    .times(o)
    .tofixed(nDecL + oDecL);

  return res;
}

multiply(
  "-6609384489637528847111902877988879251990047900714057985145037",
  "-2739720780992942410992390008913829925293817433341522914.55748949182446456300417957141316443171804666458201705125"
);
