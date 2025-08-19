import {promises as fs} from 'fs';
import path from 'path';
import yargs from 'yargs/yargs';
import {fileURLToPath} from 'url';
import TextSearchParser from './parsers/TextSearchParser.js';

const run_command_line = async () => {
  const argv = yargs(process.argv.slice(2))
    .usage('Usage: $0 -i <input> [options]')
    .option('input', {
      alias: 'i', type: 'string', description: 'Input file path', requiresArg: true, demandOption: true,
    })
    .option('output', {
      alias: 'o', type: 'string', default: 'parsed.json', description: 'Output file path',
    })
    .parse();

  const options = {
    input: argv.input, output: argv.output,
  };

  const inputPath = path.isAbsolute(options.input) ? options.input : path.resolve(process.cwd(), options.input);

  const fileContent = await fs.readFile(inputPath, 'utf8');
  const parser = new TextSearchParser(fileContent);
  const result = parser.parseAll();

  const outputPath = path.isAbsolute(options.output) ? options.output : path.resolve(process.cwd(), options.output);
  const outputDir = path.dirname(outputPath);
  await fs.mkdir(outputDir, {recursive: true});
  await fs.writeFile(outputPath, JSON.stringify(result, null, 2));

  console.log(`Successfully parsed and saved results to ${path.relative(process.cwd(), outputPath)}`);
};

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  run_command_line();
}
