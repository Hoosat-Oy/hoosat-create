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
  const gitInit = await askYesNoQuestion('Do you want to install initialize git repository? [Y/n] ');
  let installHoosatUI = undefined;
  if(gitInit) {
    installHoosatUI = await askYesNoQuestion('Do you want to install HoosatUI? [Y/n] ');
  }
  try {
    // Download git repository.
    await promisifiedDownload(repository, destination);
    console.log('Project downloaded successfully');
    // Change directory to the project directory
    process.chdir(destination);
    // Modify the package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJson = require(packageJsonPath);
    packageJson.name = destination;
    packageJson.description = description;
    packageJson.author = author;
    packageJson.license = license;
    packageJson.keywords = keywordList;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Project package.json has been modified.');
    // Do NPM install for dependancies.
    const install = spawn('npm', ['install'], { stdio: 'inherit' });
    await new Promise(resolve => install.on('close', resolve));
    console.log('npm install completed');
    if (gitInit) {
      // Initialize git repository
      const gitInit = spawn('git', ['init']);
      await new Promise(resolve => gitInit.on('close', resolve));
      console.log('Git repository initialized.');
      if (installHoosatUI) {
        // Change directory to the client directory
        process.chdir('src/client');
        // Install HoosatUI as a git submodule
        const gitSubmodule = spawn('git', ['submodule', 'add', 'https://github.com/hoosat-oy/HoosatUI'], { stdio: 'inherit' });
        await new Promise(resolve => gitSubmodule.on('close', resolve));
        console.log('HoosatUI installed successfully.');
        // Install necessary dev-dependencies
        const installHoosatUIDevDeps = spawn('npm', ['install', '--save-dev', '@testing-library/jest-dom', '@testing-library/react'], { stdio: 'inherit' });
        await new Promise(resolve => installHoosatUIDevDeps.on('close', resolve));
        console.log('npm HoosatUI devDependencies installed successfully.');
        // Install necessary dependancies.
        const installHoosatUIDeps = spawn('npm', ['install', 'react-markdown', 'rehype-highlight', 'remark-gfm'], { stdio: 'inherit' });
        await new Promise(resolve => installHoosatUIDeps.on('close', resolve));
        console.log('npm HoosatUI dependencies installed successfully.');
      }
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
