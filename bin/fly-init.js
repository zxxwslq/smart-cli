#!/usr/bin/env node

const program = require('commander');
const chalk = require('chalk');
const inquirer = require('inquirer');
const path = require('path');
const rm = require('rimraf').sync;
const uuidV1 = require('uuid/v1');
const ora = require('ora');
const os = require('os');
const download = require('download-git-repo');
const shell = require('shelljs');

const log = require('../lib/log');
const checkRepos = require('../lib/check-repos');
const generate = require('../lib/generate');
const utils = require('../lib/utils');
const checkVersion = require('../lib/check-version');

/**
 * Usage.
 */

program
  .usage('<template-name> [project-name]')
  .option('-c, --clone', 'use git clone')
  .option('-o, --origin', 'set git remote origin')

/**
 * Help.
 */

program.on('--help', () => {
  log.tip('  Examples:')
  log.tip()
  log.tip(chalk.gray('    # create a new project with an template'))
  log.tip('    $ fly init xxx')
  log.tip()
  log.tip(chalk.gray('    # create a new project straight from a github template'))
  log.tip('    $ fly init xxx -o https://github.com/zxxwslq/smart-templates.git')
  log.tip()
})

function help() {
  program.parse(process.argv)
  if(program.args.length < 1) return program.help()
}
help()

/**
 * Padding.
 */

log.tip()
process.on('exit', () => {
  log.tip()
})

/**
 * Settings.
 */

let template = program.args[0];

let projectDirName = program.args[1];

if(!projectDirName || /^\w:\/?$/.test(projectDirName)) {
  projectDirName = '.'
}

let origin = program.args[2];
let projectName = projectDirName === '.' ? path.relative('../', process.cwd()) : projectDirName;
let projectDirPath = path.resolve(projectDirName || '.');
let clone = program.clone || false;
let hasSlash = template.indexOf('/') > -1;
let preProjectName = projectName;

if(!hasSlash) {
  return program.help();
}

function setOrigin() {
  // set origin
  try {
    shell.cd(projectDirPath);
    shell.exec(`git init`, {
      async: false
    });
    shell.exec(`git remote add origin ${origin}`, {
      async: false
    });
    log.success(`${projectName} is related to remote repo: ${origin}`);
  } catch(e) {
    log.error(`set git remote origin faild: ${e.message}`)
  }
}

if(utils.isExist(projectDirPath)) {
  inquirer.prompt([{
    type: 'confirm',
    message: projectDirName === '.' ?
      'Generate project in current directory?' :
      'Target directory exists. Continue?',
    name: 'ok'
  }]).then((answers) => {
    if(answers.ok) {
      log.tip();
      runTask();
    }
  });
} else {
  // convert projectName(eg: xxx/, xxx/sss, /xxx/sss, c:/xxx/sss) to xxx
  let normalizeName = '';
  let index = projectName.indexOf('/');

  if(projectDirName.startsWith('/') || /^\w:/.test(projectDirName)) {
    normalizeName = projectName.substr(index).split('/')[0] || projectName.substr(index).split('/')[1];
    normalizeName = normalizeName ? normalizeName : 'demo';
  } else if(index >= 0) {
    normalizeName = projectName.split('/')[0];
  }

  if(normalizeName && normalizeName !== projectName) {
    inquirer.prompt([{
      type: 'confirm',
      message: `Your project's name will be created as ${normalizeName}`,
      name: 'ok'
    }]).then((answers) => {
      if(answers.ok) {
        log.tip();
        projectName = normalizeName;
        runTask();
      }
      return;
    });
  } else {
    runTask();
  }
}

function runTask() {
  let isLocalTemplate = utils.isLocalTemplate(template);

  if(isLocalTemplate) {
    let templatePath = template.startsWith('/') || /^\w:/.test(template) ?
      template : path.normalize(path.join(process.cwd(), template));

    if(utils.isExist(templatePath)) {
      log.success(`Template is from ${templatePath}`);
      log.tip();

      generate(projectName, templatePath, projectDirPath, (err, msg = "") => {
        if(err) {
          log.error(`Generated error: ${err.message.trim()}`);
        }

        if(origin && /\.git$/.test(origin)) {
          setOrigin();
        }

        if(msg) {
          let re = /{{[^{}]+}}/g;
          log.tip('\n' + msg.replace(re, projectName).split(/\r?\n/g).map(function(line) {
            return '   ' + line
          }).join('\n'));
        }
      });
    } else {
      log.tip();
      log.error(`Local template ${template} not found.`);
    }
  } else {
    let arr = template.split(path.sep);

    if(arr.length < 2 || !arr[0] || !arr[1]) {
      return program.help();
    }

    log.tip();
    log.error(`Local template ${template} not found. Will check it from github.`);
    log.tip();

    // convert template path to xxx/xxx
    template = template.split(path.sep).slice(0, 2).join('/');
    // check repo from github.com
    checkVersion(() => {
      checkRepos(template, downloadAndGenerate);
    });
  }
}

/**
 * Download a generate from a template repo.
 *
 * @param {String} template
 */

function downloadAndGenerate(template) {
  let tmp = os.tmpdir() + '/smart-template-' + uuidV1();
  let spinner = ora({
    text: `start downloading template: ${template}`,
    color: "blue"
  }).start();

  download(template, tmp, {
    clone: clone
  }, (err) => {
    process.on('exit', () => rm(tmp));

    if(err) {
      //err.code/err.message;
      spinner.text = chalk.red(`Failed to download template ${template}: ${err.message.trim()}`);
      spinner.fail();
      process.exit(1);
    }
    spinner.text = chalk.green(`${template} downloaded success`);
    spinner.succeed();
    log.tip();

    generate(projectName, tmp, projectDirPath, (err, msg = "") => {
      if(err) {
        log.error(`Generated error: ${err.message.trim()}`);
      }

      if(origin && /\.git$/.test(origin)) {
        setOrigin();
      }

      if(msg) {
        let re = /{{[^{}]+}}/g;
        log.tip('\n' + msg.replace(re, preProjectName).split(/\r?\n/g).map(function(line) {
          return '   ' + line
        }).join('\n'));
      }
    });
  });
}