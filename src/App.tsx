import React, { useEffect } from "react";
import "./api";
import "./App.css";
import _ from "lodash";
import { Book, BookEventsCb, Side } from "./types";
import Chart from "./components/Chart";
import {
  updateBook,
  updatePrices,
  deletePrice,
  updatePrice,
  updateMcnt,
} from "./redux/features/bookslice";
import { useAppDispatch, useAppSelector } from "./redux/hooks";
import config from "./config";

let subscribeMessage = JSON.stringify({
  event: "subscribe",
  channel: "book",
  symbol: "tBTCUSD",
  freq: "F1",
  prec: "P0",
  len: 100,
  pair: "tBTCUSD",
});

function App() {
  const dispatch = useAppDispatch();
  const BOOK = useAppSelector((state) => state.bookReducer);

  useEffect(() => {
    const connect = () => {
      const wss = new WebSocket(config.wssUrl);
      wss.onopen = () => {
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
          return;
        } else if (parsedMessage[1] === "cs") {
          return;
        }
        if (BOOK.mcnt === 0) {
          _.each(parsedMessage[1], function (pp: any) {
            if (typeof pp !== "number") {
              pp = { price: pp[0], cnt: pp[1], amount: pp[2] };
              if (pp.length < 3) {
                return;
              } else {
                console.log("es mayot");
              }
              const side = pp.amount >= 0 ? "bids" : "asks";
              pp.amount = Math.abs(pp.amount);
              dispatch(updatePrice({ side, price: pp }));
              if (!pp.price) {
              }
            }
          });
        } else {
          parsedMessage = parsedMessage[1];

          let pp = {
            price: parsedMessage[0],
            cnt: parsedMessage[1],
            amount: parsedMessage[2],
          };
          if (!pp.cnt) {
            if (pp.amount > 0) {
              if (BOOK["bids"][pp.price]) {
                dispatch(deletePrice({ side: "bids", price: pp.price }));
              }
            } else if (pp.amount < 0) {
              if (BOOK["asks"][pp.price]) {
                dispatch(deletePrice({ side: "asks", price: pp.price }));
              }
            }
          } else {
            let side: Side = pp.amount >= 0 ? "bids" : "asks";
            pp.amount = Math.abs(pp.amount);
            dispatch(updatePrice({ side, price: pp }));
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
          dispatch(updatePrices({ side, prices }));
        });
        // BOOK.mcnt++;
        dispatch(updateMcnt());
      };

      wss.onclose = () => {
        console.log("WS close");
      };
    };
    connect();
  }, []);

  return (
    <div className="App">
      <div>
        <Chart />
      </div>
    </div>
  );
}

export default App;
