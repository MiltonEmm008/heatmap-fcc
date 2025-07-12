import rawData from "./dataJson.json";

type MontlyVariance = {
  year: number;
  month: number | string;
  variance: number;
};

type Dataset = {
  baseTemperature: number;
  monthlyVariance: MontlyVariance[];
};

const dataset = rawData as Dataset;

export default dataset;