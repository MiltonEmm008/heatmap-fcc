import * as d3 from "d3";
import dataset from "./dataJson.json";

document.addEventListener("DOMContentLoaded", () => {
  const { monthlyVariance, baseTemperature } = dataset;

  const data = monthlyVariance.map(d => ({
    year: d.year,
    month: d.month - 1,
    monthName: getMonthName(d.month),
    temp: baseTemperature + d.variance,
    variance: d.variance
  }));

  function getMonthName(month: number): string {
    const months = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return months[month - 1];
  }

  const margin = { top: 60, right: 20, bottom: 100, left: 80 };
  const width = 800 - margin.left - margin.right;
  const height = 450 - margin.top - margin.bottom;

  const svg = d3.select("#graph")
    .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
    .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

  svg.append("text")
    .attr("id", "title")
    .attr("x", width / 2)
    .attr("y", -20)
    .attr("text-anchor", "middle")
    .style("font-size", "24px")
    .text("Monthly Global Land-Surface Temperature");

  svg.append("text")
    .attr("id", "description")
    .attr("x", width / 2)
    .attr("y", 0)
    .attr("text-anchor", "middle")
    .style("font-size", "14px")
    .style("fill", "grey")
    .text("1753-2015: Base Temperature with Variance");

  const years = Array.from(new Set(data.map(d => d.year))).sort((a, b) => a - b);
  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const xScale = d3.scaleTime()
    .domain([new Date(years[0], 0), new Date(years[years.length - 1] + 1, 0)])
    .range([0, width]);

  const yScale = d3.scaleBand()
    .domain(monthNames)
    .range([0, height])
    .padding(0);

  const xAxis = d3.axisBottom(xScale)
    .tickValues(
      years.filter((_, i) => i % 10 === 0)
           .map(y => new Date(y, 0, 1))
    )
    .tickFormat(d3.timeFormat("%Y") as any);
  
  svg.append("g")
    .attr("id", "x-axis")
    .attr("transform", `translate(0,${height})`)
    .call(xAxis)
    .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");


  const yAxis = d3.axisLeft(yScale as any);
  svg.append("g")
    .attr("id", "y-axis")
    .call(yAxis);

  const colorRange = [
    "#5e4fa2", "#3288bd", "#66c2a5",
    "#abdda4", "#e6f598", "#ffffbf"
  ];
  
  const temps = data.map(d => d.temp);
  const colorScale = d3.scaleQuantile<number, string>()
    .domain(temps)
    .range(colorRange as any);

  const tooltip = d3.select("body")
    .append("div")
      .attr("id", "tooltip")
      .style("opacity", 0)
      .style("position", "absolute")
      .style("background", "rgba(0,0,0,0.7)")
      .style("color", "#fff")
      .style("padding", "6px")
      .style("border-radius", "4px")
      .style("pointer-events", "none");

  const handleMouseOver = (_: MouseEvent, d: any) => {
    tooltip
      .attr("data-year", d.year)
      .style("opacity", 1)
      .html(
        `${d.year} - ${d.monthName}<br/>` +
        `Temp: ${d.temp.toFixed(2)}°C`
      );
  };

  const handleMouseMove = (event: MouseEvent) => {
    tooltip
      .style("left", event.pageX + 10 + "px")
      .style("top", event.pageY - 28 + "px");
  };

  const handleMouseLeave = () => {
    tooltip.style("opacity", 0);
  };

  const cellWidth = width / years.length;
  
  svg.selectAll("rect")
    .data(data)
    .join("rect")
      .attr("class", "cell")
      .attr("data-year", d => d.year)
      .attr("data-month", d => d.month)
      .attr("data-temp", d => d.temp)
      .attr("x", d => xScale(new Date(d.year, 0, 1)))
      .attr("y", d => yScale(d.monthName) || 0)
      .attr("width", cellWidth)
      .attr("height", yScale.bandwidth())
      .style("fill", d => colorScale(d.temp))
      .style("stroke", "white")
      .style("stroke-width", "1px")
      .on("mouseover", handleMouseOver)
      .on("mousemove", handleMouseMove)
      .on("mouseleave", handleMouseLeave);

  const legendWidth = 500;
  const legendHeight = 20;
  const legend = svg.append("g")
    .attr("id", "legend")
    .attr(
      "transform",
      `translate(${(width - legendWidth) / 2}, ${height + 30})`
    );

  const quantiles = colorScale.quantiles();
  const legendData = [d3.min(temps) || 0]
    .concat(quantiles)
    .concat([d3.max(temps) || 0]);

  legend.selectAll("rect")
    .data(legendData.slice(0, -1))
    .join("rect")
      .attr("x", (_, i) => (legendWidth / legendData.length) * i)
      .attr("y", 0)
      .attr("width", legendWidth / legendData.length)
      .attr("height", legendHeight)
      .style("fill", (_d, i) => colorRange[i]);

  const legendScale = d3.scaleLinear()
    .domain([d3.min(temps) || 0, d3.max(temps) || 0])
    .range([0, legendWidth]);

  const legendAxis = d3.axisBottom(legendScale)
    .tickValues(legendData.filter((_, i) => i % 2 === 0))
    .tickFormat(d => Number(d).toFixed(1));

  legend.append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(legendAxis);
});
