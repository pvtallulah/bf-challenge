import { createSlice } from "@reduxjs/toolkit";

import { Book } from "../../types";

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
  },
});

export const { updateBook } = bookSlice.actions;

export default bookSlice.reducer;
