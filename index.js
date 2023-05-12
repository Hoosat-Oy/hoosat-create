#!/usr/bin/env node
const download = require('download-git-repo');
const { promisify } = require('util');
const promisifiedDownload = promisify(download);
const readline = require('readline');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const repository = 'github:Hoosat-Oy/hoosat-template';
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

async function run() {
  const destination = await askQuestion('Enter destination project name: ');
  const description = await askQuestion('Enter project description: ');
  const author = await askQuestion('Enter project author: ');
  const license = await askQuestion('Enter project license: ');
  const keywords = await askQuestion('Enter project keywords (comma-separated): ');
  const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k !== '');

  try {
    await promisifiedDownload(repository, destination);
    console.log('Project downloaded successfully');

    // Change directory to the project directory
    process.chdir(destination);

    console.log('Running npm install...');
    const install = spawn('npm', ['install'], { stdio: 'inherit' });
    await new Promise(resolve => install.on('close', resolve));
    console.log('npm install completed');

    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = require(packageJsonPath);
    packageJson.name = destination;
    packageJson.description = description;
    packageJson.author = author;
    packageJson.license = license;
    packageJson.keywords = keywordList;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Project package.json has been modified.');

    // Initialize git repository
    const gitInit = spawn('git', ['init']);
    await new Promise(resolve => gitInit.on('close', resolve));
    console.log('Git repository initialized.');

    const installHoosatUI = await askYesNoQuestion('Do you want to install HoosatUI? [Y/n] ');
    if (installHoosatUI) {
      // Change directory to the client directory
      process.chdir('src/client');

      // Install HoosatUI as a git submodule
      const gitSubmodule = spawn('git', ['submodule', 'add', 'https://github.com/hoosat-oy/HoosatUI']);
      await new Promise(resolve => gitSubmodule.on('close', resolve));
      console.log('HoosatUI installed successfully.');

      // Install necessary dependencies
      const installDeps = spawn('npm', ['install', '--save-dev', '@testing-library/jest-dom', '@testing-library/react']);
      await new Promise(resolve => installDeps.on('close', resolve));
      console.log('npm HoosatUI devDependencies installed successfully.');

      const installMarkdownDeps = spawn('npm', ['install', 'react-markdown', 'rehype-highlight', 'remark-gfm']);
      await new Promise(resolve => installMarkdownDeps.on('close', resolve));
      console.log('npm HoosatUI dependencies installed successfully.');
    }
  } catch (err) {
    console.error(`Failed to download project: ${err}`);
  } finally {
    rl.close();
  }
}

function askQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

function askYesNoQuestion(question) {
  return new Promise(resolve => {
    rl.question(question, answer => {
      const normalizedAnswer = answer.trim().toLowerCase();
      resolve(normalizedAnswer === '' || normalizedAnswer === 'y' || normalizedAnswer === 'yes');
    });
  });
}

run();

// Export the askQuestion function for testing purposes
module.exports = { askQuestion };
