import _ from 'lodash';
import * as cheerio from 'cheerio';
import Ved from '../utils/Ved.js';
import Cache from '../utils/Cache.js';

export class Parser {
  constructor(body, opt = {}) {
    this.$ = cheerio.load(body);
    const url = opt.url ? new URL(opt.url) : {};
    this.domain = 'https://' + (url.hostname || this.getDefaultDomain());
    this.ved = new Ved();
    this.cache = new Cache();
  }

  getDefaultDomain() {
    return 'www.google.com';
  }

  parse() {
    return {};
  }

  parseAll() {
    const parsed_object = this.parse(this);
    return this.filterEmpty(parsed_object);
  }

  filterEmpty(obj) {
    if (!obj) return {};
    return _.pickBy(obj, v => _.isNumber(v) ? _.isFinite(v) : _.isBoolean(v) || !_.isEmpty(v));
  }

  toAbsoluteLink(link) {
    return /^\/\//.test(link) ? 'https:' + link : link && link[0] === '/' ? this.domain + link.replace(/ /g, '+') : link || undefined;
  }

  getScripts() {
    return this.cache.memoize('getScripts', () => this.$('script').contents().toArray().filter(c => c.type === 'text'));
  }

  parseVeds() {
    return this.cache.memoize('parseVeds', () => {
      const $ = this.$;
      const veds = [...$('[data-ved]').toArray().map(el => $(el).attr('data-ved')), ...$('a[href*="&ved="]').toArray().map(el => {
        try {
          const url = new URL(this.toAbsoluteLink($(el).attr('href')));
          return url.searchParams.get('ved');
        } catch (e) {
          return null;
        }
      })].filter(Boolean);

      return _.chain(veds)
        .groupBy(ved => this.ved.decode(ved)?.id)
        .omitBy(_.isNil)
        .mapValues(v => new Set(v))
        .value();
    });
  }

  getElementsByVedId(ids, container = this.$) {
    const $ = this.$;
    const containerEl = container === $ ? $.root()[0] : container[0];
    const cacheKey = `vedId:${containerEl.id || 'root'}:${Array.isArray(ids) ? ids.join(',') : ids}`;

    return this.cache.memoize(cacheKey, () => {
      const parsedVeds = this.parseVeds();
      const idArray = Array.isArray(ids) ? ids : [ids];
      const veds = idArray.reduce((acc, id) => [...acc, ...(parsedVeds[id] || [])], []);

      if (!veds.length) {
        return $([]);
      }

      return this.getAllVedElements(Array.from(veds.values()), container);
    });
  }

  getAllVedElements(veds, container = this.$) {
    const $ = this.$;
    const containerEl = container === $ ? $.root()[0] : container[0];
    const cacheKey = `allVedEls:${containerEl.id || 'root'}:${Array.isArray(veds) ? veds.join(',') : veds}`;

    return this.cache.memoize(cacheKey, () => {
      container = container === $ ? $.root() : $(container);
      return container.find('[data-ved], a[href*="&ved="]')
        .filter((index,
          el) => veds.includes($(el).attr('data-ved')) || veds.some(ved => $(el).attr('href')?.includes(`&ved=${ved}`)));
    });
  }

  decodeLiteralEscapes(text) {
    return text && text.replace(/(?<!\\)((\\\\)*)\\x([0-9a-f]{2})/g, (m, backslashes, backslashesInner,
      code) => backslashes + String.fromCharCode(parseInt(code, 16)));
  }

  _collectTextNodes(container) {
    const $ = this.$;
    let results = [];

    $(container).contents().each((_, el) => {
      if (el.type === 'text') {
        const text = $(el).text().replace(/\s+/g, ' ').trim();
        if (text) {
          results.push(text);
        }
      } else if (el.type === 'tag') {
        results = results.concat(this._collectTextNodes(el));
      }
    });

    return results;
  }

  getAllTextNodes(container) {
    return this.cache.memoizeDeep('getAllTextNodes', container, () => this._collectTextNodes(container));
  }
}
