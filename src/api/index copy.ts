import config from "../config";
import _ from "lodash";
import { Book, BookEventsCb, Side } from "../types";

const BOOK: Book = {
  bids: {},
  asks: {},
  mcnt: 0,
  psnap: {
    bids: [],
    asks: [],
  },
};

const pair = "tBTCUSD";

let connected = false;
let connecting = false;

export const connect = (
  cb: ({ type, book, side, prices, price }: BookEventsCb) => void
) => {
  const wss = new WebSocket(config.wssUrl);

  let subscribeMessage = JSON.stringify({
    event: "subscribe",
    channel: "book",
    symbol: "tBTCUSD",
    freq: "F1",
    prec: "P0",
    len: 100,
    pair,
  });

  wss.onopen = () => {
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
    if (parsedMessage.event === "info" || parsedMessage.event === "conf")
      return;
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
      _.each(parsedMessage[1], function (pp: number[]) {
        const prices = { price: pp[0], cnt: pp[1], amount: pp[2] };
        const side = prices.amount >= 0 ? "bids" : "asks";
        prices.amount = Math.abs(prices.amount);
        // BOOK[side][pp.price] = pp;
        cb({ type: "updatePrices", side, prices });
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
            cb({ type: "deletePrice", side: "bids", price: pp.price });
          } else {
            found = false;
          }
        } else if (pp.amount < 0) {
          if (BOOK["asks"][pp.price]) {
            cb({ type: "deletePrice", side: "asks", price: pp.price });
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
        // BOOK[side][pp.price] = pp;
        cb({ type: "updatePrices", side, prices: [pp.price] });
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
      cb({ type: "updatePrices", side, prices });
      // BOOK.psnap[side] = prices;
    });

    BOOK.mcnt++;
    // cb({ ...BOOK });
    cb({ type: "updateBook", book: BOOK });
    debugger;
  };

  wss.onclose = () => {
    console.log("WS close");
    connecting = false;
    connected = false;
  };
};
