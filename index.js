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
    console.log('Running npm install...');
    const install = spawn('npm', ['install'], { cwd: destination, stdio: 'inherit' });
    await new Promise(resolve => install.on('close', resolve));
    console.log('npm install completed');
    const destinationPath = path.resolve("./" + destination);
    const packageJsonPath = path.join(destinationPath, 'package.json');
    const packageJson = require(packageJsonPath);
    packageJson.name = destination;
    packageJson.description = description;
    packageJson.author = author;
    packageJson.license = license;
    packageJson.keywords = keywordList;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log(`Project's package name updated to ${destination}`);
    console.log(`Project's description updated to ${description}`);
    console.log(`Project's author updated to ${author}`);
    console.log(`Project's license updated to ${license}`);
    console.log(`Project's keywords updated to ${keywordList.join(', ')}`);
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

run();
