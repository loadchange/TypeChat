import assert from "assert";
import dotenv from "dotenv";
import findConfig from "find-config";
import fs from "fs";
import path from "path";
import { createJsonTranslator, createLanguageModel, processRequests } from "typechat";
import { createTypeScriptJsonValidator } from "typechat/ts";
import { SpellCheckResponse } from "./spellCheckSchema";

const dotEnvPath = findConfig(".env");
assert(dotEnvPath, ".env file not found!");
dotenv.config({ path: dotEnvPath });

const model = createLanguageModel(process.env);
const schema = fs.readFileSync(path.join(__dirname, "spellCheckSchema.ts"), "utf8");
const validator = createTypeScriptJsonValidator<SpellCheckResponse>(schema, "SpellCheckResponse");
const translator = createJsonTranslator(model, validator);

const inputFiles: string[] = [];

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
        // console.log(filePath);
        inputFiles.push(`./${filePath}`);
      }
    }
  }
}

let _inputFileDirName = process.argv[2];
console.log(`

_inputFileDirName: ${_inputFileDirName}

`);
traverseDir(_inputFileDirName);

function sleep(ms: number) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function runProcessRequests(_inputFileName: string) {
  console.log(`
    ================ ${_inputFileName} ================
    `);
  // 检查文件是否存在
  if (!fs.existsSync(_inputFileName)) {
    console.error(`File not found: ${_inputFileName}`);
    return;
  }

  // 读取文件行数
  const data = fs.readFileSync(_inputFileName, "utf8");
  const lines = data.split("\n");

  //   console.log({ lines });

  if (lines.length > 1) {
    // 转换为一行
    const requests = lines.join("\\n");
    //     console.log(`Processing requests:
    //    ${requests}
    //    `);
    _inputFileName = `${_inputFileName}.tmp`;
    // 写入临时文件 `${_inputFileName}.tmp`
    fs.writeFileSync(_inputFileName, requests);

    // Process requests interactively or from the input file specified on the command line
    processRequests("😀> ", _inputFileName, async (request) => {
      //       console.log(`
      //  输入:
      //  -----------------------

      //  ${request}

      //  -----------------------
      //      `);

      const _start = async () => {
        const response = await translator.translate(request);
        if (!response.success) {
          console.log(response.message);
          return;
        }
        if (response.data.level !== "none") {
          console.error({ ...response.data, _inputFileName });
        } else {
          console.info({ ...response.data, _inputFileName });
        }
      };

      try {
        await _start();
      } catch (error) {
        try {
          await _start();
        } catch (err) {
          console.log({ error, err });
        }
      }
    });
  }
}

async function start() {
  for (let i = 0; i < inputFiles.length; i++) {
    let _inputFileName = inputFiles[i];

    console.log(`Processing requests from input file: ${_inputFileName}`);

    await sleep(3000);

    if (!_inputFileName) {
      console.error("No input file specified", { _inputFileName });
      return;
    }

    runProcessRequests(_inputFileName);
  }
}

start();
