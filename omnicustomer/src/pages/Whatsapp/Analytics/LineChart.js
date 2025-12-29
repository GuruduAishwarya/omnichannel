import React, { useEffect, useState } from 'react'
import ReactApexChart from 'react-apexcharts';

export default function LineChart({ type, data }) {
    const formatDate = (date) => {
        if (date == null) return ''; // Return a default value or handle the case

        if (typeof date === 'string' && !isNaN(Date.parse(date))) {
            return new Date(date).toISOString();
        } else if (typeof date === 'string') {
            const monthMap = {
                'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
                'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
            };
            const [month] = date.split(' ');
            const year = new Date().getFullYear();
            return `${year}-${monthMap[month]}-01T00:00:00.000Z`;
        }
        return ''; // Return a default value or handle the case
    };

    // Define all chart options and series
    const chartData = {
        template_chart: {
            options: {
                chart: {
                    height: 350,
                    type: 'line',
                    stacked: false
                },
                dataLabels: {
                    enabled: false
                },
                stroke: {
                    width: [1, 1, 4]
                },
                title: {
                    text: 'Template Details',
                    align: 'left',
                    offsetX: 110
                },
                xaxis: {
                    type: "datetime",
                    categories: data?.dates?.map(formatDate) || [],
                },
                yaxis: [{
                    title: {
                        text: 'Template Counts'
                    }
                },
                ],
                tooltip: {
                    fixed: {
                        enabled: true,
                        position: 'topLeft',
                        offsetY: 30,
                        offsetX: 60
                    },
                },
                legend: {
                    horizontalAlign: 'left',
                    offsetX: 40
                }
            },
            series: [{
                name: 'Authentication',
                type: 'line',
                data: (data?.authentication || []).map((count, index) => ({
                    x: formatDate(data.dates[index]),
                    y: count
                }))
            }, {
                name: 'Marketing',
                type: 'line',
                data: (data?.marketing || []).map((count, index) => ({
                    x: formatDate(data.dates[index]),
                    y: count
                }))
            }, {
                name: 'Utility',
                type: 'line',
                data: (data?.utility || []).map((count, index) => ({
                    x: formatDate(data.dates[index]),
                    y: count
                }))
            }],


        },
        total_chart: {
            options: {
                chart: {
                    type: 'line',
                    height: 350,
                    zoom: {
                        enabled: false
                    }
                },
                title: {
                    text: ' ',
                    align: 'center',
                    style: {
                        fontSize: '16px',
                        color: '#789'
                    }
                },
                stroke: {
                    width: 1,
                    curve: 'smooth' // (smooth , straight , stepline)
                },
                fill: {
                    opacity: 0.35,
                    type: 'solid' // (solid, gradient, pattern, image)
                },
                xaxis: {
                    type: 'datetime',
                    categories: data?.dates?.length ? data.dates.map(formatDate) : [] // Format dates correctly
                },


            },
            series: [
                {
                    name: 'Business Initiated',
                    type: 'area',
                    data: data?.business_initiated?.length
                        ? data.business_initiated.map((count, index) => ({
                            x: formatDate(data.dates[index]),
                            y: count
                        }))
                        : []
                },
                {
                    name: 'User Initiated',
                    type: 'line',
                    data: data?.user_initiated?.length
                        ? data.user_initiated.map((count, index) => ({
                            x: formatDate(data.dates[index]),
                            y: count
                        }))
                        : []
                }
            ]
        },

        delivery_chart: {
            options: {
                chart: {
                    height: 380,
                    type: 'bar', // Use 'bar' for column charts
                },
                stroke: {
                    width: [0, 0, 0, 0], // No stroke
                },
                title: {
                    text: " "
                },
                xaxis: {
                    type: "datetime",
                    categories: data?.dates?.length ? data.dates.map(formatDate) : [] // Format dates correctly
                },
                yaxis: [{
                    title: {
                        text: "Counts"
                    }
                },
                {
                    opposite: true,
                    title: {
                        text: "Counts"
                    }
                }
                ],
                tooltip: {
                    x: {
                        format: 'dd MMM yyyy'
                    }
                },
                colors: ['#00E396', '#FF4560', '#008FFB', '#775DD0'], // Set custom colors
            },
            series: [
                {
                    name: "Messages Delivered",
                    type: "bar", // Use 'bar' for column charts
                    data: data?.delivered?.length ? data.delivered.map((count, index) => ({ x: formatDate(data.dates[index]), y: count })) : []
                },
                {
                    name: "Messages Failed",
                    type: "bar", // Use 'bar' for column charts
                    data: data?.failed?.length ? data.failed.map((count, index) => ({ x: formatDate(data.dates[index]), y: count })) : []
                },
                {
                    name: "Messages Read",
                    type: "bar", // Use 'bar' for column charts
                    data: data?.read?.length ? data.read.map((count, index) => ({ x: formatDate(data.dates[index]), y: count })) : []
                },
                {
                    name: "Messages Sent",
                    type: "bar", // Use 'bar' for column charts
                    data: data?.sent?.length ? data.sent.map((count, index) => ({ x: formatDate(data.dates[index]), y: count })) : []
                }
            ],
        },

    };


    // State to hold the current options and series
    const [chartOptions, setChartOptions] = useState(chartData[type]);

    // Effect to update chart based on type prop
    // Effect to update chart based on type prop
    useEffect(() => {

        setChartOptions(chartData[type]);
        // console.log("first", type)
    }, [type, data]);


    return (
        <div>
            <div id="chart">
                <ReactApexChart options={chartOptions.options} series={chartOptions.series} type="line" height={chartOptions.options?.chart?.height} />
            </div>
            <div id="html-dist"></div>
        </div>
    )
}
