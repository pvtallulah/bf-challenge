export type Side = "bids" | "asks";

export type BookItem = {
  price: number;
  cnt: number;
  amount: number;
};

export type Book = {
  bids: Record<string, BookItem>;
  asks: Record<string, BookItem>;
  mcnt: number;
  psnap: {
    bids: string[];
    asks: string[];
  };
};

export type BookEventsCb = {
  type: "updateBook" | "updatePrices" | "deletePrice";
  book?: Book;
  side?: Side;
  prices?: any;
  price?: number;
};
