import { bisector } from "d3-array";

// accessors
export const getX = data => new Date(data.date);
export const getY = data => data.value;

// bisector
export const bisectDate = bisector(d => new Date(d.date)).left;

// Initialize some variables
export const axisColor = "currentColor";

export const axisBottomTickLabelProps = {
  textAnchor: "middle",
  fontFamily: "inherit",
  fontSize: 10,
  fill: axisColor,
};
export const axisLeftTickLabelProps = {
  dx: "-0.25em",
  dy: "0.25em",
  fontFamily: "inherit",
  fontSize: 10,
  textAnchor: "end",
  fill: axisColor,
};

const d = new Date();
const m = d.getMonth();
d.setMonth(d.getMonth() - 1);

if (d.getMonth() == m) d.setDate(0);
d.setHours(0, 0, 0, 0);
const d1 = new Date();
d1.setMonth(d1.getMonth() - 12);

d1.setHours(0, 0, 0, 0);

export const defaultAreaArray = [
  {
    date: Date.now(),
    value: 9999999,
  },
  {
    date: d,
    value: 9999999,
  },
  {
    date: d1,
    value: 9999999,
  },
];
