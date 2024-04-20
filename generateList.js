const fs = require('fs').promises;
const path = require('path');

// 修改为异步函数
const walk = async (dir, fileList = []) => {
  try {
    // 使用异步版本的readdir和stat
    const files = await fs.readdir(dir);
    const promises = files.map(async (file) => {
      const filePath = path.join(dir, file);
      const stat = await fs.stat(filePath);
      if (stat.isDirectory()) {
        // 递归调用异步walk函数
        return walk(filePath, fileList);
      } else if (path.extname(file) === '.html') {
        fileList.push({
          title: path.basename(file, '.html'),
          url: './' + filePath.replace(/\\/g, '/')
        });
      }
    });
    // 使用Promise.all来处理并行任务
    await Promise.all(promises);
  } catch (error) {
    console.error(`Error walking directory: ${dir}`, error);
    throw error; // 保留错误传递
  }
  return fileList; // 现在在函数末尾返回fileList
};

// 使用async/await来执行walk
(async () => {
  try {
    const list = await walk('./src');
    // 写入文件 data.js
    await fs.writeFile('./data.js', `export default ${JSON.stringify(list)}`);
    console.log('data.js generated successfully.');
  } catch (error) {
    console.error('Error:', error);
  }
})();