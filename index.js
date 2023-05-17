const { spawn } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const repository = 'https://github.com/Hoosat-Oy/hoosat-template.git';
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
  const gitInit = await askYesNoQuestion('Do you want to initialize a git repository? [Y/n] ');
  let installHoosatUI = undefined;
  if (gitInit) {
    installHoosatUI = await askYesNoQuestion('Do you want to install HoosatUI? [Y/n] ');
  }
  try {
    // Clone git repository.
    const clone = spawn('git', ['clone', repository, destination]);
    await new Promise((resolve, reject) => {
      clone.on('close', code => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error('Failed to clone project.'));
        }
      });
    });
    console.log('Project cloned successfully');
    // Change directory to the project directory
    process.chdir(destination);
    // Modify the package.json
    const packageJsonPath = path.join(process.cwd(), 'package.json');
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf8');
    const packageJson = JSON.parse(packageJsonContent);
    packageJson.name = destination;
    packageJson.description = description;
    packageJson.author = author;
    packageJson.license = license;
    packageJson.keywords = keywordList;
    fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2));
    console.log('Project package.json has been modified.');
    // Do NPM install for dependencies.
    const install = spawn('npm', ['install'], { stdio: 'inherit' });
    await new Promise((resolve, reject) => {
      install.on('close', code => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error('Failed to install project dependencies.'));
        }
      });
    });
    console.log('npm install completed');
    if (gitInit) {
      // Initialize git repository
      const gitInit = spawn('git', ['init']);
      await new Promise((resolve, reject) => {
        gitInit.on('close', code => {
          if (code === 0) {
            resolve();
          } else {
            reject(new Error('Failed to initialize git repository.'));
          }
        });
      });
      console.log('Git repository initialized.');
      if (installHoosatUI) {
        // Change directory to the client directory
        process.chdir('src/client');
        // Clone HoosatUI repository
        const hoosatUIClone = spawn('git', ['clone', 'https://github.com/hoosat-oy/HoosatUI']);
        await new Promise((resolve, reject) => {
          hoosatUIClone.on('close', code => {
            if (code === 0) {
              resolve();
            } else {
              reject(new Error('Failed to clone HoosatUI.'));
            }
          });
        });
        console.log('HoosatUI cloned successfully.');
        // Install necessary dev-dependencies
        const installHoosatUIDevDeps = spawn('npm', ['install', '--save-dev', '@testing-library/jest-dom', '@testing-library/react'], { stdio: 'inherit' });
        await new Promise((resolve, reject) => {
          installHoosatUIDevDeps.on('close', code => {
            if (code === 0) {
              resolve();
            } else {
              reject(new Error('Failed to install HoosatUI devDependencies.'));
            }
          });
        });
        console.log('npm HoosatUI devDependencies installed successfully.');
        // Install necessary dependencies.
        const installHoosatUIDeps = spawn('npm', ['install', 'react-markdown', 'rehype-highlight', 'remark-gfm'], { stdio: 'inherit' });
        await new Promise((resolve, reject) => {
          installHoosatUIDeps.on('close', code => {
            if (code === 0) {
              resolve();
            } else {
              reject(new Error('Failed to install HoosatUI dependencies.'));
            }
          });
        });
        console.log('npm HoosatUI dependencies installed successfully.');
      }
    }
  } catch (err) {
    console.error(`Failed to clone project: ${err}`);
  } finally {
    rl.close();
  }
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
module.exports = { askQuestion };
