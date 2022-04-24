/** @format */

module.exports = {
  status: function (code) {
    this.statusCode = code;
    return this;
  },
  sendStatus: function (code) {
    throw new Error("Function not implemented.");
  },
  links: function (links) {
    throw new Error("Function not implemented.");
  },
  send: function (body) {
    this.body = body;
    return this;
  },
  json: function (body) {
    throw new Error("Function not implemented.");
  },
  jsonp: function (body) {
    throw new Error("Function not implemented.");
  },
  sendFile: function (path, fn) {
    throw new Error("Function not implemented.");
  },
  sendfile: function (path) {
    throw new Error("Function not implemented.");
  },
  download: function (path, fn) {
    throw new Error("Function not implemented.");
  },
  contentType: function (type) {
    throw new Error("Function not implemented.");
  },
  type: function (type) {
    throw new Error("Function not implemented.");
  },
  format: function (obj) {
    throw new Error("Function not implemented.");
  },
  attachment: function (filename) {
    throw new Error("Function not implemented.");
  },
  set: function (field) {
    throw new Error("Function not implemented.");
  },
  header: function (field) {
    throw new Error("Function not implemented.");
  },
  headersSent: false,
  get: function (field) {
    throw new Error("Function not implemented.");
  },
  clearCookie: function (name, options) {
    throw new Error("Function not implemented.");
  },
  cookie: function (name, val, options) {
    throw new Error("Function not implemented.");
  },
  location: function (url) {
    throw new Error("Function not implemented.");
  },
  redirect: function (url) {
    throw new Error("Function not implemented.");
  },
  render: function (view, options, callback) {
    throw new Error("Function not implemented.");
  },
  locals: undefined,
  charset: "",
  vary: function (field) {
    throw new Error("Function not implemented.");
  },
  app: undefined,
  append: function (field, value) {
    throw new Error("Function not implemented.");
  },
  req: undefined,
  statusCode: 0,
  statusMessage: "",
  assignSocket: function (socket) {
    throw new Error("Function not implemented.");
  },
  detachSocket: function (socket) {
    throw new Error("Function not implemented.");
  },
  writeContinue: function (callback) {
    throw new Error("Function not implemented.");
  },
  writeHead: function (statusCode, statusMessage, headers) {
    throw new Error("Function not implemented.");
  },
  writeProcessing: function () {
    throw new Error("Function not implemented.");
  },
  chunkedEncoding: false,
  shouldKeepAlive: false,
  useChunkedEncodingByDefault: false,
  sendDate: false,
  finished: false,
  connection: undefined,
  socket: undefined,
  setTimeout: function (msecs, callback) {
    throw new Error("Function not implemented.");
  },
  setHeader: function (name, value) {
    throw new Error("Function not implemented.");
  },
  getHeader: function (name) {
    throw new Error("Function not implemented.");
  },
  getHeaders: function () {
    throw new Error("Function not implemented.");
  },
  getHeaderNames: function () {
    throw new Error("Function not implemented.");
  },
  hasHeader: function (name) {
    throw new Error("Function not implemented.");
  },
  removeHeader: function (name) {
    throw new Error("Function not implemented.");
  },
  addTrailers: function (headers) {
    throw new Error("Function not implemented.");
  },
  flushHeaders: function () {
    throw new Error("Function not implemented.");
  },
  writable: false,
  writableEnded: false,
  writableFinished: false,
  writableHighWaterMark: 0,
  writableLength: 0,
  writableObjectMode: false,
  writableCorked: 0,
  destroyed: false,
  _write: function (chunk, encoding, callback) {
    throw new Error("Function not implemented.");
  },
  _destroy: function (error, callback) {
    throw new Error("Function not implemented.");
  },
  _final: function (callback) {
    throw new Error("Function not implemented.");
  },
  write: function (chunk, callback) {
    throw new Error("Function not implemented.");
  },
  setDefaultEncoding: function (encoding) {
    throw new Error("Function not implemented.");
  },
  end: function (cb) {
    throw new Error("Function not implemented.");
  },
  cork: function () {
    throw new Error("Function not implemented.");
  },
  uncork: function () {
    throw new Error("Function not implemented.");
  },
  destroy: function (error) {
    throw new Error("Function not implemented.");
  },
  addListener: function (event, listener) {
    throw new Error("Function not implemented.");
  },
  emit: function (event) {
    throw new Error("Function not implemented.");
  },
  on: function (event, listener) {
    throw new Error("Function not implemented.");
  },
  once: function (event, listener) {
    throw new Error("Function not implemented.");
  },
  prependListener: function (event, listener) {
    throw new Error("Function not implemented.");
  },
  prependOnceListener: function (event, listener) {
    throw new Error("Function not implemented.");
  },
  removeListener: function (event, listener) {
    throw new Error("Function not implemented.");
  },
  pipe: function (destination, options) {
    throw new Error("Function not implemented.");
  },
  off: function (eventName, listener) {
    throw new Error("Function not implemented.");
  },
  removeAllListeners: function (event) {
    throw new Error("Function not implemented.");
  },
  setMaxListeners: function (n) {
    throw new Error("Function not implemented.");
  },
  getMaxListeners: function () {
    throw new Error("Function not implemented.");
  },
  listeners: function (eventName) {
    throw new Error("Function not implemented.");
  },
  rawListeners: function (eventName) {
    throw new Error("Function not implemented.");
  },
  listenerCount: function (eventName) {
    throw new Error("Function not implemented.");
  },
  eventNames: function () {
    throw new Error("Function not implemented.");
  },
};
