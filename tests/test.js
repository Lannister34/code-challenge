import {describe, it} from 'mocha';
import {strict as assert} from 'assert';
import {readFileSync} from 'fs';
import {fileURLToPath} from 'url';
import {dirname, join} from 'path';
import TextSearchParser from '../parsers/TextSearchParser.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const runParserTest = name => {
  const pathName = name.replace(/\s/g, '_');
  const htmlPath = join(__dirname, 'html', `${pathName}.html`);
  const html = readFileSync(htmlPath, 'utf-8');
  const jsonPath = join(__dirname, 'json', `${pathName}.json`);
  const expected = JSON.parse(readFileSync(jsonPath, 'utf-8'));

  const parser = new TextSearchParser(html);
  const result = parser.parseAll();

  assert.deepStrictEqual(result, expected);
};

const t = name => it(name, () => runParserTest(name));

describe('Text Search Parser', () => {
  t('van gogh paintings');
  t('monet paintings');
  t('manet artwork');
  t('john lennon albums');
});
