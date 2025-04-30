const svg = d3.select("#choropleth");
const tooltip = d3.select("#tooltip");
const width = 960;
const height = 600;

const educationURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/for_user_education.json";
const countiesURL = "https://cdn.freecodecamp.org/testable-projects-fcc/data/choropleth_map/counties.json";

Promise.all([
  d3.json(countiesURL),
  d3.json(educationURL)
]).then(([us, education]) => {
  const educationData = new Map(education.map(d => [d.fips, d]));

  const colorScale = d3.scaleThreshold()
    .domain([10, 20, 30, 40, 50, 60])
    .range(d3.schemeBlues[7]);

  const path = d3.geoPath();

  svg.append("g")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .join("path")
    .attr("class", "county")
    .attr("d", path)
    .attr("fill", d => {
      const ed = educationData.get(d.id);
      return ed ? colorScale(ed.bachelorsOrHigher) : "#ccc";
    })
    .attr("data-fips", d => d.id)
    .attr("data-education", d => {
      const ed = educationData.get(d.id);
      return ed ? ed.bachelorsOrHigher : 0;
    })
    .on("mouseover", (event, d) => {
      const ed = educationData.get(d.id);
      tooltip
        .style("visibility", "visible")
        .html(`${ed.area_name}, ${ed.state}: ${ed.bachelorsOrHigher}%`)
        .attr("data-education", ed.bachelorsOrHigher)
        .style("left", event.pageX + 10 + "px")
        .style("top", event.pageY - 20 + "px");
    })
    .on("mouseout", () => {
      tooltip.style("visibility", "hidden");
    });

  // Leyenda
  const legendWidth = 300;
  const legendHeight = 10;
  const legendColors = colorScale.range();
  const legendScale = d3.scaleLinear()
    .domain([d3.min(colorScale.domain()), d3.max(colorScale.domain())])
    .range([0, legendWidth]);

  const legendSvg = d3.select("#legend")
    .append("svg")
    .attr("width", legendWidth)
    .attr("height", 50);

  const legendX = d3.axisBottom(legendScale)
    .tickValues(colorScale.domain())
    .tickFormat(d => `${d}%`);

  legendSvg.selectAll("rect")
    .data(colorScale.range().map((color, i) => {
      const d = colorScale.invertExtent(color);
      return {
        x0: d[0],
        x1: d[1],
        color: color
      };
    }))
    .enter()
    .append("rect")
    .attr("x", d => legendScale(d.x0))
    .attr("y", 0)
    .attr("width", d => legendScale(d.x1) - legendScale(d.x0))
    .attr("height", legendHeight)
    .attr("fill", d => d.color);

  legendSvg.append("g")
    .attr("transform", `translate(0, ${legendHeight})`)
    .call(legendX);
});
