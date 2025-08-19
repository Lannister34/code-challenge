import {Parser} from './Parser.js';

class TextSearchParser extends Parser {
  parse() {
    return {
      artworks: this.parseArtworks(),
    };
  }

  parseArtworks() {
    const $ = this.$;
    return this.getElementsByVedId([55222, 29428]).toArray().map(item => {
      item = $(item);
      const [name, ...extensions] = this.getAllTextNodes(item);
      const link = this.toAbsoluteLink(item.attr('href'));
      const imageCnt = item.find('a>img');
      let image = imageCnt.attr('data-src');
      if (!image) {
        const imageId = imageCnt.attr('id');
        if (imageId) {
          const script = this.getScripts()
            .find(s => s.data.includes(imageId))?.data;
          if (script) {
            const imageMatch = script.match(/'(data:image\/[^;]+;base64,[^']+)'/);
            if (imageMatch) {
              image = this.decodeLiteralEscapes(imageMatch[1]);
            }
          }
        }
      }

      return this.filterEmpty({
        name, extensions, link, image,
      });
    });
  }
}

export default TextSearchParser;
