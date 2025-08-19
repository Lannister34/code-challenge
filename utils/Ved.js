import protobuf from 'protocol-buffers';

class Ved {
  static PROTO = protobuf(`
    message Ved {
        optional int32 id = 2;
    }`);

  decode(ved) {
    try {
      return Ved.PROTO.Ved.decode(Buffer.from(ved.substring(1), 'base64'));
    } catch (e) {
      return null;
    }
  }
}

export default Ved;
