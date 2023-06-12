/* eslint-disable */
function tableTextValues(el) {
  return [...el.children].map(tr => [...tr.children].map(it => it.textContent));
}

function enumMapper({ name, value, desc }) {
  return `  /** ${desc} */\n  ${name} = ${value},`;
}

function constEnumMapper({ name, value, desc }) {
  return `  /** ${desc} */\n  "${name}": ${value},`;
}

function pascal(str) {
  return upperFirst(
    str.toLowerCase().replace(/_\w/g, _w => _w.slice(1).toUpperCase()),
  );
}

function upperFirst(str) {
  return str[0].toUpperCase() + str.slice(1);
}

function hexBigint(str) {
  const intStr = str.trim().split(/\s+/)[0].replace(/0x0+/, "");
  return parseBigint(intStr, 16).toString() + "n";
}

function parseBigint(value, radix) {
  const factor = BigInt(radix);
  return value
    .split("")
    .reverse()
    .reduce((sum, part, index) => {
      if (part === "0") return sum;
      return sum + BigInt(parseInt(part, radix)) * factor ** BigInt(index);
    }, 0n);
}
