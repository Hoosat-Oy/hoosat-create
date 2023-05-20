#!/usr/bin/env node
import fs from 'fs';
import { spawn } from 'child_process';
import { createInterface } from 'readline';
import { readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

const repository = 'https://github.com/Hoosat-Oy/hoosat-template.git';
const rl = createInterface({
  input: process.stdin,
  output: process.stdout
});

async function run() {
  const command = process.argv[2];

  if (command === 'submodule') {
    console.log('Creating a submodule for project.');
    const rootDirectory = process.cwd();
    //const name = getValueFromArgument('name') || (await askQuestion('Enter name for new submodule: '));
    const destination = getValueFromArgument('destination') || (await askQuestion('Enter relative destination for new submodule: '));
    try {
      await runCommand(`git rev-parse --is-inside-work-tree`, "Current working directory is not git repository.");
    } catch (error) {
      console.error(error.message);
      throw error;
    }
    // mkdir submodule-destination
    try {
      await fs.promises.mkdir(destination, { recursive: true });
      console.log("Created submodule folder.");
    } catch (error) {
      console.error(error.message);
    }
    // cd submodule-destination
    // git init
    // cd back to root of project
    // git commit -m 'Added empty submodule'
    process.chdir(destination);
    try {
      await runCommand(`git init`, 'Failed to initialize git for submodule.');
      console.log("Initialized git repository.");
    } catch (error) {
      console.error(error, error.message);
    }
    try {
      await runCommand(`touch ./README.md`, 'Failed to create README.md file');
      console.log("CreatedREADME.md file for commit.");
    } catch (error) {
      console.error(error.message);
    }
    try {
      await runCommand(`git add ./README.md`, 'Failed to stage README.md.');
      console.log("Staged README.md");
    } catch (error) {
      console.error(error.message);
    }
    try {
      await runCommand(`git commit -m 'Add readme.'`, 'Failed to commit.');
      console.log("Committed readme.");
    } catch (error) {
      console.error(error.message);
    }
    // Change back to the root of the project
    process.chdir(rootDirectory);
    // git submodule add ./submodule-destination submodule-name
    try {
      await runCommand(`git submodule add ./${destination}`, 'Failed to add the new local repository as git submodule');
      console.log("Added local repository as git submodule to parent git repository.");
    } catch (error) {
      console.error(error, error.message);
    }
    // git commit -m 'Added empty submodule'
    // try {
    //   await runCommand(`git commit -m 'Added ${name} submodule into ${destination}'`, 'Failed to commit changes, do it manually');
    //   console.log("Committed changes in parent repository.");
    // } catch (error) {
    //   console.error(error, error.message);
    // }
    console.log("Now commit your changes to git.");
    rl.close();
  } else {
    console.log('Creating a new project from Hoosat React SSR Template.');
    const destination = getValueFromArgument('destination') || (await askQuestion('Enter destination project name: '));
    const description = getValueFromArgument('description') || (await askQuestion('Enter project description: '));
    const author = getValueFromArgument('author') || (await askQuestion('Enter project author: '));
    const license = getValueFromArgument('license') || (await askQuestion('Enter project license: '));
    const keywords = getValueFromArgument('keywords') || (await askQuestion('Enter project keywords (comma-separated): '));
    const keywordList = keywords.split(',').map(k => k.trim()).filter(k => k !== '');
    const gitInit = getValueFromArgument('gitInit') || (await askYesNoQuestion('Do you want to initialize a git repository? [Y/n] '));
    let installHoosatUI = undefined;
    if (gitInit) {
      installHoosatUI = getValueFromArgument('hoosatui') || await askYesNoQuestion('Do you want to install HoosatUI? [Y/n] ');
    }
    try {
      // Clone git repository.
      try { 
        await runCommand(`git clone --recursive ${repository} ${destination}`, 'Failed to clone project.', { stdio: 'inherit' });
        console.log('Project cloned successfully.');
      } catch (error) {
        console.error(error.message);
      }
      // Change directory to the project directory
      process.chdir(destination);
      // Modify the package.json
      const packageJsonPath = join(process.cwd(), 'package.json');
      const packageJsonContent = readFileSync(packageJsonPath, 'utf8');
      const packageJson = JSON.parse(packageJsonContent);
      packageJson.name = destination;
      packageJson.description = description;
      packageJson.author = author;
      packageJson.license = license;
      packageJson.keywords = keywordList;
      writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
      console.log('Project package.json has been modified.');
      // Do NPM install for dependencies.
      try { 
        await runCommand('npm install', 'Failed to install project template dependencies.', { stdio: 'inherit' });
        console.log('Project template dependancies installed with npm.');
      } catch (error) {
        console.error(error.message);
      }
      if (gitInit) {
        // Initialize git repository
        try { 
          await runCommand('git init', 'Failed to initialize git repository.', { stdio: 'inherit' });
          console.log('Git has been initialized.');
        } catch (error) {
          console.error(error.message);
        }
        console.log('Git repository initialized.');
        if (installHoosatUI) {
          // Change directory to the client directory
          process.chdir('src/client');
          // Clone HoosatUI repository
          try { 
            await runCommand('git submodule add https://github.com/hoosat-oy/HoosatUI', 'Failed to add submodule HoosatUI.', { stdio: 'inherit' });
            console.log('HoosatUI cloned successfully as submodule in src/client/HoosatUI.');
          } catch (error) {
            console.error(error.message);
          }
          // Install necessary dev-dependencies
          try { 
            await runCommand('npm install --save-dev @testing-library/jest-dom @testing-library/react', 'Failed to install HoosatUI devDependancies.', { stdio: 'inherit' });
            console.log('npm HoosatUI devDependencies installed successfully.');
          } catch (error) {
            console.error(error.message);
          }
          // Install necessary dependencies.
          try {
            await runCommand('npm install react-markdown rehype-highlight remark-gfm', 'Failed to install HoosatUI dependencies.', { stdio: 'inherit' });
            console.log('npm HoosatUI dependencies installed successfully.');
          } catch (error) {
            console.error(error.message);
          }
        }
      }
    } catch (err) {
      console.error(`Failed to clone project: ${err}`);
    } finally {
      rl.close();
    }
  }
}

async function runCommand(commandString, errorMessage, spawnOptions) {
  return new Promise((resolve, reject) => {
    const commandProcess = spawn(commandString, [], { shell: true, ...spawnOptions });
    commandProcess.on('close', code => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(commandString + "\r\n" + errorMessage));
      }
    });
  });
}


function getValueFromArgument(argName) {
  const argIndex = process.argv.findIndex(arg => arg === `--${argName}`);
  if (argIndex !== -1 && argIndex + 1 < process.argv.length) {
    return process.argv[argIndex + 1];
  }
  return undefined;
}

function askQuestion(question) {
  return new Promise((resolve, reject) => {
    rl.question(question, answer => {
      if (!containsInvalidCharacters(answer)) {
        resolve(answer);
      } else {
        reject(new Error('Invalid input. The answer contains invalid characters.'));
      }
    });
  });
}

function askYesNoQuestion(question) {
  return new Promise((resolve, reject) => {
    rl.question(question, answer => {
      const normalizedAnswer = answer.trim().toLowerCase();
      if (normalizedAnswer === '' || normalizedAnswer === 'y' || normalizedAnswer === 'yes') {
        resolve(true);
      } else if (normalizedAnswer === 'n' || normalizedAnswer === 'no') {
        resolve(false);
      } else {
        reject(new Error('Invalid input. Please provide a valid yes/no answer (Y/n).'));
      }
    });
  });
}

function containsInvalidCharacters(input) {
  // Define the list of invalid characters or commands
  const invalidCharacters = [';', '|', '&&', '>', '<', '`', '$(', '$()'];
  // Check if the input contains any invalid characters or commands
  return invalidCharacters.some(character => input.includes(character));
}

run();

// Export the askQuestion function for testing purposes
export default { askQuestion };
