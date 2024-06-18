var svg = d3.select("svg"),
    width = window.innerWidth,
    height = window.innerHeight,
    g = svg.append("g");

svg.attr("width", width).attr("height", height);

var projection = d3.geoNaturalEarth1()
    .scale((width / 6.3) * 0.95)
    .translate([width / 2, height / 2]);

var path = d3.geoPath().projection(projection);

var zoom = d3.zoom()
    .scaleExtent([1, 8])
    .translateExtent([[0, 0], [width, height]])
    .on('zoom', function(event) {
        g.attr('transform', event.transform);
    });

svg.call(zoom);

var tooltip = d3.select("body").append("div")
    .attr("class", "tooltip")
    .style("opacity", 0);

var colorScale = d3.scaleSequential(d3.interpolateReds).domain([0, 50000]);  // Adjusted to make colors darker

var world, dataByCountryYear = {};

Promise.all([
    d3.json("World_Map.geojson"),
    d3.csv("Injuries_All.csv")
]).then(function([worldData, data]) {
    world = worldData;

    var years = Array.from(new Set(data.map(d => +d.Year)));
    var minYear = d3.min(years);
    var maxYear = d3.max(years);
    var totalCount = d3.sum(data, d => +d.Value);

    document.getElementById('yearRange').textContent = `${minYear} - ${maxYear}`;
    document.getElementById('totalCount').textContent = totalCount.toLocaleString();

    data.forEach(function(d) {
        var countryISO = d.COU;
        if (!dataByCountryYear[countryISO]) {
            dataByCountryYear[countryISO] = {};
        }
        dataByCountryYear[countryISO][d.Year] = +d.Value;
    });

    g.selectAll("path")
        .data(world.features)
        .join("path")
        .attr("d", path)
        .attr("fill", function(d) {
            var countryData = dataByCountryYear[d.properties.ISO_A3];
            var value = countryData ? d3.mean(Object.values(countryData)) : 0;
            return value ? colorScale(value) : "#ccc";
        })
        .attr("stroke", "#fff")
        .attr("stroke-width", "0.5px")
        .attr("pointer-events", function(d) {
            return dataByCountryYear[d.properties.ISO_A3] ? "all" : "none";
        })
        .on("mouseover", function(event, d) {
            if (dataByCountryYear[d.properties.ISO_A3]) {
                var countryData = dataByCountryYear[d.properties.ISO_A3];
                var value = countryData ? d3.mean(Object.values(countryData)) : 0;
                tooltip.transition().duration(200).style("opacity", .9);
                tooltip.html(d.properties.NAME + "<br/>" + value.toLocaleString())
                    .style("left", (event.pageX) + "px")
                    .style("top", (event.pageY - 28) + "px");
            }
        })
        .on("mouseout", function(d) {
            tooltip.transition().duration(500).style("opacity", 0);
        })
        .on("click", function(event, d) {
            if (dataByCountryYear[d.properties.ISO_A3]) {
                window.localStorage.setItem('selectedCountryISO', d.properties.ISO_A3);
                window.localStorage.setItem('selectedCountryName', d.properties.NAME);
                window.open('injuries_details.html', '_blank');
            }
        });
}).catch(function(error) {
    console.error('Error loading data:', error);
});
var svg = d3.select("svg"),
    width = +svg.style("width").replace("px", ""),
    height = +svg.style("height").replace("px", ""),
    g = svg.append("g");

svg.attr("width", width).attr("height", height);

var projection = d3.geoNaturalEarth1()
    .scale(width / 6.5) // Adjust the scale here
    .translate([width / 2, height / 2 + 50]); // Adjust the centering of the map

var path = d3.geoPath().projection(projection);

var zoom = d3.zoom()
    .scaleExtent([1, 8])
    .translateExtent([[0, 0], [width, height]])
    .on('zoom', function(event) {
        g.attr('transform', event.transform);
    });

svg.call(zoom);
