import { Decimal as DecimalJS } from 'decimal.js';

export function sum(to: number | DecimalJS | string, ...add: (number | DecimalJS | string)[]): number {
  // prepare decimal js entry
  let res = new DecimalJS(to);

  // add all entries
  add.forEach(ammount => res = res.add(ammount));

  // return as number
  return res.toNumber();
}

export function reduce(from: number | DecimalJS | string, reduce: (number | DecimalJS | string)[]): number {
  // prepare decimal js entry
  let res = new DecimalJS(from);

  // reduce all entries
  reduce.forEach(ammount => res = res.add(ammount));

  // return as number
  return res.toNumber();
}