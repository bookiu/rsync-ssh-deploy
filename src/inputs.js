const { snakeToCamel, splitTargets } = require('./helpers');

const inputNames = [
  'SSH_PRIVATE_KEY', 'DEPLOY_KEY_NAME',
  'SOURCE', 'TARGETS', 'ARGS', 'SSH_CMD_ARGS', 'EXCLUDE',
  'SCRIPT_BEFORE', 'SCRIPT_AFTER'];

const githubWorkspace = process.env.GITHUB_WORKSPACE;

const defaultInputs = {
  source: '',
  exclude: '',
  args: '-rlgoDzvc -i',
  sshCmdArgs: '-o StrictHostKeyChecking=no',
  deployKeyName: `deploy_key_${Date.now()}`
};

const inputs = {
  githubWorkspace
};

inputNames.forEach((input) => {
  const inputName = snakeToCamel(input.toLowerCase());
  const inputVal = process.env[input] || process.env[`INPUT_${input}`] || defaultInputs[inputName];
  const validVal = inputVal === undefined ? defaultInputs[inputName] : inputVal;
  let extendedVal = validVal;
  // eslint-disable-next-line default-case
  switch (inputName) {
    case 'source':
      extendedVal = validVal.split(' ').map((src) => `${githubWorkspace}/${src}`);
      break;
    case 'targets':
      extendedVal = splitTargets(validVal);
      break;
    case 'args':
      extendedVal = validVal.split(' ');
      break;
    case 'exclude':
    case 'sshCmdArgs':
      extendedVal = validVal.split(',').map((item) => item.trim());
      break;
  }

  inputs[inputName] = extendedVal;
});

module.exports = inputs;
