class ExchangeRatesApp {
    constructor() {
        this.apiUrl = 'https://localhost:7065/ExchangeRates'; // Adjust port if needed
        this.exchangeRatesChart = null;
        this.changeChart = null;
        this.init();
    }

    init() {
        this.fetchAndDisplayData();
    }

    async fetchExchangeRates() {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
                mode: 'cors'
            });

            if (!response.ok) {
                console.log(`fetchExchangeRates HTTP error! status: ${response.status}`);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();
            console.log('Fetched exchange rates:', data);
            return data;
        } catch (error) {
            console.error('Error fetching exchange rates:', error);
            throw error;
        }
    }

    showLoading() {
        document.getElementById('loading').style.display = 'block';
        document.getElementById('error').style.display = 'none';
        document.getElementById('info').style.display = 'none';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showError(message) {
        const errorDiv = document.getElementById('error');
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        this.hideLoading();
    }

    showInfo(message) {
        const infoDiv = document.getElementById('info');
        infoDiv.textContent = message;
        infoDiv.style.display = 'block';
    }

//     //for debugging purposes
//     checkIfAllHaveKeys(data) {
//     const allHaveKeys = data.every(item => item.hasOwnProperty('Key') && item.Key);
//     console.log('Do all items have the "Key" property?', allHaveKeys);
//     return allHaveKeys;
// }

    processExchangeRateData(data) {
        // Sort data by currency key for better visualization
        console.log('processExchangeRateData(): Raw data:', data);
        const sortedData = data.sort((a, b) => a.Key.localeCompare(b.Key));
        console.log('processExchangeRateData(): Sorted data:', sortedData);

        const labels = sortedData.map(item => item.Key);
        const rates = sortedData.map(item => item.currentExchangeRate);
        const changes = sortedData.map(item => item.currentChange);
        const lastUpdate = sortedData.length > 0 ? new Date(sortedData[0].lastUpdate).toLocaleString() : 'Unknown';

        return { labels, rates, changes, lastUpdate };
    }

    generateColors(count) {
        const colors = [];
        for (let i = 0; i < count; i++) {
            const hue = (i * 360 / count) % 360;
            colors.push(`hsl(${hue}, 70%, 60%)`);
        }
        return colors;
    }

    createExchangeRatesChart(labels, rates) {
        const ctx = document.getElementById('exchangeRatesChart').getContext('2d');
        
        if (this.exchangeRatesChart) {
            this.exchangeRatesChart.destroy();
        }

        const colors = this.generateColors(labels.length);

        this.exchangeRatesChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Exchange Rate (ILS)',
                    data: rates,
                    backgroundColor: colors,
                    borderColor: colors.map(color => color.replace('60%', '40%')),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Current Exchange Rates (in ILS)'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: false,
                        title: {
                            display: true,
                            text: 'Rate (ILS)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Currency'
                        }
                    }
                }
            }
        });
    }

    createChangeChart(labels, changes) {
        const ctx = document.getElementById('changeChart').getContext('2d');
        
        if (this.changeChart) {
            this.changeChart.destroy();
        }

        // Color code: green for positive, red for negative
        const backgroundColors = changes.map(change => 
            change >= 0 ? 'rgba(75, 192, 192, 0.6)' : 'rgba(255, 99, 132, 0.6)'
        );
        const borderColors = changes.map(change => 
            change >= 0 ? 'rgba(75, 192, 192, 1)' : 'rgba(255, 99, 132, 1)'
        );

        this.changeChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Change (%)',
                    data: changes,
                    backgroundColor: backgroundColors,
                    borderColor: borderColors,
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Currency Change (%)'
                    },
                    legend: {
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: 'Change (%)'
                        }
                    },
                    x: {
                        title: {
                            display: true,
                            text: 'Currency'
                        }
                    }
                }
            }
        });
    }

    async fetchAndDisplayData() {
        this.showLoading();
        
        try {
            const data = await this.fetchExchangeRates();
            console.log('fetchAndDisplayData(): Data received:', data);
            if (!data || data.length === 0) {
                this.showError('No exchange rate data available');
                return;
            }

            const { labels, rates, changes, lastUpdate } = this.processExchangeRateData(data);
            
            this.createExchangeRatesChart(labels, rates);
            this.createChangeChart(labels, changes);
            
            this.showInfo(`Data last updated: ${lastUpdate}`);
            this.hideLoading();
            
        } catch (error) {
            this.showError(`Failed to load exchange rates: ${error.message}`);
        }
    }
}

// Initialize the app when the page loads
document.addEventListener('DOMContentLoaded', function() {
    window.exchangeRatesApp = new ExchangeRatesApp();
});

// Global function for the refresh button
function fetchAndDisplayData() {
    if (window.exchangeRatesApp) {
        window.exchangeRatesApp.fetchAndDisplayData();
    }
}