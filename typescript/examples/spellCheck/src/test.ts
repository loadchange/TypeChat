import fs from "fs";
import path from "path";

function traverseDir(dir: string) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      traverseDir(filePath);
    } else {
      // 输出文件路径 必须是.md 会在 .rs 结尾的文件
      if (filePath.endsWith(".md") || filePath.endsWith(".rs")) {
        console.log(filePath);
      }
    }
  }
}

let _inputFileName = process.argv[2];
console.log(`

inputFileName: ${_inputFileName}

`);
traverseDir(_inputFileName);
