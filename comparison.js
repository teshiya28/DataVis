document.addEventListener('DOMContentLoaded', function () {
    const countrySelect1 = document.getElementById('countrySelect1');
    const countrySelect2 = document.getElementById('countrySelect2');
    // Adjust the margins to increase the bottom margin



    const countries = {
        'AUS': 'Australia',
        'GBR': 'United Kingdom',
        'USA': 'United States'
    };

    const colors = {
        'AUS': 'blue',
        'GBR': 'purple',
        'USA': 'red'
    };

    function updateCountrySelect2() {
        const selectedCountry1 = countrySelect1.value;
        countrySelect2.innerHTML = '<option value="">--Select Country--</option>';
        for (const [code, name] of Object.entries(countries)) {
            if (code !== selectedCountry1) {
                const option = document.createElement('option');
                option.value = code;
                option.textContent = name;
                countrySelect2.appendChild(option);
            }
        }
        updateChart();
    }

    function filterData(country) {
        return injuriesData.filter(d => d.COU === country);
    }

    function updateChart() {
        const country1 = countrySelect1.value;
        const country2 = countrySelect2.value;

        if (!country1 || !country2) {
            console.log('Selections not complete:', { country1, country2 });
            return; // Do not draw chart if any dropdown is not selected
        }

        const data1 = filterData(country1);
        const data2 = filterData(country2);

        console.log('Filtered data:', { data1, data2 });

        drawChart(data1, data2, country1, country2);
    }

    function drawChart(data1, data2, country1, country2) {
        const svgContainer = d3.select('#line-chart').html('').append('svg')
            .attr('width', '100%')
            .attr('height', '470');
            
        const margin = { top: 20, right: 30, bottom: 150, left: 80 };
        const width = svgContainer.node().getBoundingClientRect().width - margin.left - margin.right;
        const height = svgContainer.attr('height') - margin.top - margin.bottom;

        const svg = svgContainer.append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`);

        const parseDate = d3.timeParse('%Y');
        data1.forEach(d => d.Year = parseDate(d.Year));
        data2.forEach(d => d.Year = parseDate(d.Year));

        data1.sort((a, b) => a.Year - b.Year);
        data2.sort((a, b) => a.Year - b.Year);

        const x = d3.scaleTime().domain(d3.extent([...data1, ...data2], d => d.Year)).range([0, width]);
        const y = d3.scaleLinear().domain([0, d3.max([...data1, ...data2], d => +d.Value)]).range([height, 0]);

        const xAxis = d3.axisBottom(x).ticks(d3.timeYear.every(1)).tickFormat(d3.timeFormat('%Y'));
        const yAxis = d3.axisLeft(y).ticks(10).tickFormat(d3.format("~s"));

        svg.append('g')
            .attr('class', 'axis axis--x')
            .attr('transform', `translate(0,${height})`)
            .call(xAxis);

        svg.append('g')
            .attr('class', 'axis axis--y')
            .call(yAxis);

        const line1 = d3.line().x(d => x(d.Year)).y(d => y(d.Value));
        const line2 = d3.line().x(d => x(d.Year)).y(d => y(d.Value));

        svg.append('path')
            .datum(data1)
            .attr('class', 'line')
            .attr('d', line1)
            .style('stroke', colors[country1])
            .style('fill', 'none')
            .style('stroke-width', '2px');

        svg.append('path')
            .datum(data2)
            .attr('class', 'line')
            .attr('d', line2)
            .style('stroke', colors[country2])
            .style('fill', 'none')
            .style('stroke-width', '2px');

        svg.selectAll('.dot1')
            .data(data1)
            .enter().append('circle')
            .attr('class', 'dot1')
            .attr('cx', d => x(d.Year))
            .attr('cy', d => y(d.Value))
            .attr('r', 3)
            .style('fill', colors[country1]);

        svg.selectAll('.dot2')
            .data(data2)
            .enter().append('circle')
            .attr('class', 'dot2')
            .attr('cx', d => x(d.Year))
            .attr('cy', d => y(d.Value))
            .attr('r', 3)
            .style('fill', colors[country2]);

        // Add legend
        const legend = svg.selectAll('.legend')
            .data([country1, country2])
            .enter().append('g')
            .attr('class', 'legend')
            .attr('transform', (d, i) => `translate(0,${height + 40 + i * 20})`);

        legend.append('rect')
            .attr('x', 10)
            .attr('width', 18)
            .attr('height', 18)
            .style('fill', d => colors[d]);

        legend.append('text')
            .attr('x', 35)
            .attr('y', 9)
            .attr('dy', '.35em')
            .style('text-anchor', 'start')
            .text(d => countries[d]);
    }

    d3.csv("Injuries_3Country.csv").then(function(data) {
        window.injuriesData = data;

        // Populate initial options for both dropdowns
        countrySelect1.innerHTML = '<option value="">--Select Country--</option>';
        for (const [code, name] of Object.entries(countries)) {
            const option1 = document.createElement('option');
            option1.value = code;
            option1.textContent = name;
            countrySelect1.appendChild(option1);
        }
        updateCountrySelect2();

        countrySelect1.addEventListener('change', updateCountrySelect2);
        countrySelect2.addEventListener('change', updateChart);

        // Initial chart update to reflect default selections
        updateChart();
    }).catch(function (error) {
        console.error('Error loading data:', error);
    });
});
