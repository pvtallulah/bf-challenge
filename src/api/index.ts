import config from "../config";
import _ from "lodash";

const BOOK: Book = {
  bids: {},
  asks: {},
  mcnt: 0,
  psnap: {
    bids: [],
    asks: [],
  },
};

type Side = "bids" | "asks";
type BookItem = {
  price: number;
  cnt: number;
  amount: number;
};

type Book = {
  bids: Record<string, BookItem>;
  asks: Record<string, BookItem>;
  mcnt: number;
  psnap: {
    bids: string[];
    asks: string[];
  };
};

type ChannelSuscribe = {
  chanId: number;
  channel: string;
  event: string;
  freq: string;
  len: string;
  pair: string;
  prec: string;
  symbol: string;
};

const pair = "tBTCUSD";
let connected = false;
let connecting = false;

const wss = new WebSocket(config.wssUrl);

const initBook = (msg: ChannelSuscribe) => {
  // pair = msg.pair;
};

let subscribeMessage = JSON.stringify({
  event: "subscribe",
  channel: "book",
  symbol: "tBTCUSD",
  freq: "F1",
  prec: "P0",
  len: 100,
});

wss.onopen = () => {
  console.log("WS open");
  connecting = false;
  connected = true;
  BOOK.bids = {};
  BOOK.asks = {};
  BOOK.psnap = { bids: [], asks: [] };
  BOOK.mcnt = 0;
  wss.send(JSON.stringify({ event: "conf", flags: 131072 }));
  wss.send(subscribeMessage);
};

wss.onmessage = (msg) => {
  let parsedMessage = JSON.parse(msg.data);
  if (parsedMessage.event === "info" || parsedMessage.event === "conf") return;
  if (
    parsedMessage.event === "subscribed" &&
    parsedMessage.channel === "book"
  ) {
    return;
  }
  if (parsedMessage[1] === "hb") {
    console.log("hb return!");
    return;
  } else if (parsedMessage[1] === "cs") {
    console.log("checksum return!");
    return;
  }
  if (BOOK.mcnt === 0) {
    _.each(parsedMessage[1], function (pp: any) {
      pp = { price: pp[0], cnt: pp[1], amount: pp[2] };
      const side = pp.amount >= 0 ? "bids" : "asks";
      pp.amount = Math.abs(pp.amount);
      BOOK[side][pp.price] = pp;
    });
  } else {
    parsedMessage = parsedMessage[1];

    let pp = {
      price: parsedMessage[0],
      cnt: parsedMessage[1],
      amount: parsedMessage[2],
    };

    if (!pp.cnt) {
      let found = true;
      if (pp.amount > 0) {
        if (BOOK["bids"][pp.price]) {
          delete BOOK["bids"][pp.price];
        } else {
          found = false;
        }
      } else if (pp.amount < 0) {
        if (BOOK["asks"][pp.price]) {
          delete BOOK["asks"][pp.price];
        } else {
          found = false;
        }
      }
      if (!found) {
        console.error("Book delete failed. Price point not found");
      }
    } else {
      let side: Side = pp.amount >= 0 ? "bids" : "asks";
      pp.amount = Math.abs(pp.amount);
      BOOK[side][pp.price] = pp;
    }
  }
  _.each(["bids", "asks"], function (side: Side) {
    let sbook = BOOK[side];
    let bprices = Object.keys(sbook);

    let prices = bprices.sort(function (a, b) {
      if (side === "bids") {
        return +a >= +b ? -1 : 1;
      } else {
        return +a <= +b ? -1 : 1;
      }
    });

    BOOK.psnap[side] = prices;
  });

  BOOK.mcnt++;
};

wss.onclose = () => {
  console.log("WS close");
  connecting = false;
  connected = false;
};

setInterval(function () {
  if (connected) return;
  wss.close();
}, 3500);

const incrementPrecision = (price: number, precision: number) => {};
const decrementPrecision = (price: number, precision: number) => {};
export default wss;
