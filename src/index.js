#!/usr/bin/env node
const { sshDeploy } = require('./rsyncCli');
const { remoteCmdBefore, remoteCmdAfter } = require('./remoteCmd');
const { addSshKey, getPrivateKeyPath, updateKnownHosts } = require('./sshKey');
const { validateRequiredInputs } = require('./helpers');
const inputs = require('./inputs');

const run = async () => {
  const {
    source, targets,
    deployKeyName, sshPrivateKey,
    args, exclude, sshCmdArgs,
    scriptBefore, scriptAfter
  } = inputs;
  // Validate required inputs
  validateRequiredInputs({ sshPrivateKey });
  // Add SSH key
  addSshKey(sshPrivateKey, deployKeyName);
  const { path: privateKeyPath } = getPrivateKeyPath(deployKeyName);
  // Update known hosts if ssh command is present to avoid prompt
  if (scriptBefore || scriptAfter) {
    targets.forEach(({ host: remoteHost, port: remotePort }) => {
      updateKnownHosts(remoteHost, remotePort);
    });
  }
  // Check Script before
  if (scriptBefore) {
    await remoteCmdBefore(scriptBefore, privateKeyPath);
  }
  /* eslint-disable object-property-newline */
  const tasks = targets.map((item) => {
    const { user, host, target, port: remotePort } = item;
    const rsyncServer = `${user}@${host}:${target}`;

    console.log(`[SSH] Start deploying ${source} to ${rsyncServer}`);
    return sshDeploy({
      source, rsyncServer, exclude, remotePort, privateKeyPath, args, sshCmdArgs
    });
  });
  await Promise.all(tasks);

  // Check script after
  if (scriptAfter) {
    await remoteCmdAfter(scriptAfter, privateKeyPath);
  }
};

run()
  .then((data = '') => {
    console.log('✅ [DONE]', data);
  })
  .catch((error) => {
    console.error('❌ [ERROR]', error.message);
    process.exit(1);
  });
