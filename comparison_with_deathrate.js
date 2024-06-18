document.addEventListener('DOMContentLoaded', function () {
    const countrySelect = document.getElementById('countrySelect');
    let combinedData = [];

    const countries = {};

    function filterDataByCountry(country, data) {
        return data.filter(d => d.Code === country);
    }

    function updateChart() {
        const selectedCountry = countrySelect.value;

        if (!selectedCountry) {
            console.log('Selection not complete:', { selectedCountry });
            return; // Do not draw chart if the dropdown is not selected
        }

        const filteredData = filterDataByCountry(selectedCountry, combinedData);
        drawChart(filteredData);
    }

    function drawChart(data) {
        const svgContainer = d3.select('#bar-chart').html('').append('svg')
            .attr('width', '1200') // Increased width for a larger graph
            .attr('height', '800'); // Increased height for a larger graph

        const margin = { top: 50, right: 50, bottom: 150, left: 100 }; // Adjusted margins for better layout
        const width = svgContainer.attr('width') - margin.left - margin.right;
        const height = svgContainer.attr('height') - margin.top - margin.bottom;

        const svg = svgContainer.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const x = d3.scaleBand()
            .domain(data.map(d => d.Year))
            .range([0, width])
            .padding(0.1);

        const y = d3.scaleLinear()
            .domain([0, d3.max(data, d => +d.Total)])
            .nice()
            .range([height, 0]);

        const xAxis = d3.axisBottom(x).tickFormat(d3.format("d"));
        const yAxis = d3.axisLeft(y).ticks(10).tickFormat(d3.format("~s"));

        svg.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis)
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .attr('text-anchor', 'end');

        svg.append('g')
            .attr('class', 'axis axis--y')
            .call(yAxis);

        svg.selectAll('.bar')
            .data(data)
            .enter().append('rect')
            .attr('class', 'bar')
            .attr('x', d => x(d.Year))
            .attr('y', d => y(d.Total))
            .attr('width', x.bandwidth())
            .attr('height', d => height - y(d.Total))
            .attr('fill', 'steelblue');
    }

    d3.csv("DeathRate.csv").then(function(data) {
        combinedData = data;

        // Map country codes to names
        combinedData.forEach(d => {
            if (!countries[d.Code]) {
                countries[d.Code] = d.Entity;
            }
        });

        // Populate the country dropdown
        countrySelect.innerHTML = '<option value="">--Select Country--</option>';
        Object.keys(countries).forEach(code => {
            const option = document.createElement('option');
            option.value = code;
            option.textContent = countries[code];
            countrySelect.appendChild(option);
        });

        countrySelect.addEventListener('change', updateChart);

        // Initial chart update to reflect default selections
        updateChart();
    }).catch(function (error) {
        console.error('Error loading DeathRate.csv:', error);
    });
});
