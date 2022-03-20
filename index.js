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

function getScaledByDecimals(x, dec) {
  return BigInt(Math.round(x * Math.pow(10, dec)));
}

function multiply(n, o) {

  const newN = getCleanNumber(n);
  const nNum = Number(n);
  const nInt = nNum | 0;
  const nDecL = getDecLength(newN);
  const nScale = getScaledByDecimals(nNum, nDecL);

  const newO = getCleanNumber(o);
  const oNum = Number(o);
  const oInt = oNum | 0;
  const oDecL = getDecLength(newO);
  const oScale = getScaledByDecimals(oNum, oDecL);
  
  const totalDecL = nDecL + oDecL;
  const multiRes = BigInt(oScale * nScale);
  //const mult = multiRes / Math.pow(10, totalDecL);

  console.log("o ", o, "new ", newO, "scale ", oScale, "decL ", oDecL);
  console.log("n ", n, "new ", newN, "scale ", nScale, "decL ", nDecL);
  //console.log(multiRes, " ", mult);
  const resStr = multiRes.toString();
  console.log("resStr", resStr, "delc", totalDecL);
  let formatInt =
    resStr.length - totalDecL > 0
      ? resStr.substring(0, resStr.length - totalDecL)
      : "0";

  let formatDec = resStr.substring(resStr.length - totalDecL);
  formatDec =
    totalDecL - resStr.length > 0
      ? [...Array(totalDecL - resStr.length)]
          .map(() => "0")
          .join("")
          .concat(formatDec)
      : formatDec;
  const multFormat =
    // (Number(multiRes) / Math.pow(10, totalDecL)).toFixed(
    //   totalDecL
    // );
    formatInt + (!Number(formatDec) ? "" : ".".concat(formatDec));

  return multiRes ? multFormat : "0";
}
