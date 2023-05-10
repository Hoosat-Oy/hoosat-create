#!/usr/bin/env node
const download = require('download-git-repo');
const { promisify } = require('util');
const promisifiedDownload = promisify(download);
const readline = require('readline');
const { spawn } = require('child_process');

const repository = 'github:Hoosat-Oy/react-express-typescript-ssr';
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter destination project name: ', (destination) => {
  promisifiedDownload(repository, destination)
    .then(() => {
      console.log('Project downloaded successfully');
      console.log('Running npm install...');
      const install = spawn('npm', ['install'], { cwd: destination, stdio: 'inherit' });
      install.on('close', () => {
        console.log('npm install completed');
      });
    })
    .catch(err => console.error(`Failed to download project: ${err}`))
    .finally(() => rl.close());
});
