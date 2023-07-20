const { existsSync, mkdirSync, writeFileSync } = require('fs');
const { join } = require('path');

const targetUrlRe = /^(\w+)@([a-zA-Z0-9-.]+)(:(\d+))?:(.*)$/

const validateDir = (dir) => {
  if (!dir) {
    console.warn('⚠️ [DIR] dir is not defined');
    return;
  }
  if (existsSync(dir)) {
    console.log(`✅ [DIR] ${dir} dir exist`);
    return;
  }

  console.log(`[DIR] Creating ${dir} dir in workspace root`);
  mkdirSync(dir);
  console.log('✅ [DIR] dir created.');
};

const handleError = (message, isRequired) => {
  if (isRequired) {
    throw new Error(message);
  }
  console.warn(message);
};

const writeToFile = ({ dir, filename, content, isRequired, mode = '0644' }) => {
  validateDir(dir);
  const filePath = join(dir, filename);

  if (existsSync(filePath)) {
    const message = `⚠️ [FILE] ${filePath} Required file exist.`;
    handleError(message, isRequired);
    return;
  }

  try {
    console.log(`[FILE] writing ${filePath} file ...`, content.length);
    writeFileSync(filePath, content, {
      encoding: 'utf8',
      mode
    });
  } catch (error) {
    const message = `⚠️[FILE] Writing to file error. filePath: ${filePath}, message:  ${error.message}`;
    handleError(message, isRequired);
  }
};

const validateRequiredInputs = (inputs) => {
  const inputKeys = Object.keys(inputs);
  const validInputs = inputKeys.filter((inputKey) => {
    const inputValue = inputs[inputKey];

    if (!inputValue) {
      console.error(`❌ [INPUTS] ${inputKey} is mandatory`);
    }

    return inputValue;
  });

  if (validInputs.length !== inputKeys.length) {
    throw new Error('⚠️ [INPUTS] Inputs not valid, aborting ...');
  }
};

const snakeToCamel = (str) => str.replace(/[^a-zA-Z0-9]+(.)/g, (m, chr) => chr.toUpperCase());

const splitTargets = (targets) => {
  const filteredTargets = targets.split(';').map(item => item.trim()).filter(item => item !== '').map(item => {
    // split target url to parts
    const r = targetUrlRe.exec(item);
    if (r == null) {
      console.error(`❌ [INPUTS] target ${item} is invalid`);
      return null;
    }
    let username = r[1];
    let host = r[2];
    let port = 22;
    let target = r[5];
    if (r[4] !== undefined) {
      port = parseInt(r[4])
    }
    return {
      "user": username,
      "host": host,
      "port": port,
      "target": target
    }
  }).filter(item => item !== null);

  return filteredTargets;
}

module.exports = {
  writeToFile,
  validateRequiredInputs,
  snakeToCamel,
  splitTargets
};
