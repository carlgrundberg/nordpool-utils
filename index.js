import dayjs from "dayjs";
import dayjsPluginUtc from "dayjs/plugin/utc.js";
import dayjsPluginTimezone from "dayjs/plugin/timezone.js";
import {nordpool} from "nordpool";

dayjs.extend(dayjsPluginUtc); // Used by timezone
dayjs.extend(dayjsPluginTimezone); // Used to convert from one timezone to another

const prices = new nordpool.Prices();

const defaultOpts = {
  area: "SE4", // See http://www.nordpoolspot.com/maps/
  currency: "SEK", // can also be 'DKK', 'EUR', 'NOK'
};

const sum = (values) => values.reduce((acc, value) => acc + value, 0);
const avg = (values) => sum(values) / values.length;

export async function getPrices(opts = {}) {
  let results = [];
  try {
    results = await prices.hourly({
      ...defaultOpts,
      ...opts,
    });
  } catch (error) {
    console.error(error);
  }
  return results;
}

export function getTodaysPrices(opts) {
  return getPrices(opts);
}

export function getTomorrowsPrices(opts) {
  return getPrices({
    date: dayjs().add(1, "day").format(),
    ...opts,
  });
}

export function getTodaysAndTomorrowsPrices(opts) {
  return getPrices({
    from: dayjs().format(),
    to: dayjs().add(1, "day").format(),
    ...opts,
  });
}

export async function getPriceNow(prices) {
  if(!prices) {
    prices = await getPrices();
  }
  const now = new Date();
  let current;
  for (const item of prices) {
    if (!current || new Date(item.date) < now) {
      current = item;
    }
  }
  return current?.value;
}

export function getAveragePrice(prices) {
  const values = prices.map((item) => item.value);
  return avg(values);
}
