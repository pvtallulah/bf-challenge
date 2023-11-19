import { createSlice } from "@reduxjs/toolkit";

import { Book, Side } from "../../types";

const initialState: Book = {
  bids: {},
  asks: {},
  mcnt: 0,
  psnap: {
    bids: [],
    asks: [],
  },
};

export const bookSlice = createSlice({
  name: "book",
  initialState,
  reducers: {
    updateBook: (state, action) => {
      const { bids, asks, mcnt, psnap } = action.payload;
      state.bids = bids;
      state.asks = asks;
      state.mcnt = mcnt;
      state.psnap = psnap;
    },
    deletePrice: (state, action) => {
      const { side, price } = action.payload;
      delete state[side as Side][price];
    },
    //@ts-ignore
    updatePrices: (state, action) => {
      const { prices, side } = action.payload;
      // BOOK[side][pp.price] = pp;
      // BOOK.psnap[side] = prices;
      state.psnap[side as Side] = prices;
    },
    updatePrice: (state, action) => {
      const { price, side } = action.payload;
      state[side as Side][price.price] = price;
      return state;
      // return {
      //   ...state,
      //   [side]: {
      //     [price.price]: price,
      //   },
      // };
    },
    updateMcnt: (state) => {
      const newState = {
        ...state,
        mcnt: state.mcnt + 1,
      };
      return newState;
    },
  },
});

export const {
  updateBook,
  updatePrices,
  updatePrice,
  updateMcnt,
  deletePrice,
} = bookSlice.actions;

export default bookSlice.reducer;
