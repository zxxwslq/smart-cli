/**
 * @author zhaoxiangxiang
 * @description 日志输出
 */

const chalk = require('chalk');

module.exports = {
  error(msg) {
    console.log(chalk.red(msg));
    process.exit(1);
  },
  success(msg) {
    console.log(chalk.green(msg));
  },
  tip(msg = '') {
    console.log(msg);
  }
};