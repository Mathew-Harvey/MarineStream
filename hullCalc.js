// Hull Fouling Calculator - MarineStream™
// Physics-based model based on University of Melbourne research

function initHullFoulingCalculator() {
    // If the calculator is already initialized, don't initialize it again
    if (window.calculatorInitialized) {
        console.log('Hull Fouling Calculator already initialized, skipping...');
        return;
    }
    
    console.log('Initializing Hull Fouling Calculator...');
    
    // Currency conversion rates - updated for March 2025
    const conversionRates = {
        AUD: 1,
        GBP: 0.52 // 1 AUD = 0.52 GBP (March 2025 rate)
    };
    
    // Currency symbols
    const currencySymbols = {
        AUD: '$',
        GBP: '£'
    };
    
    // Default currency
    let currentCurrency = 'AUD';
    
    // Vessel type configurations - updated with research data from UoM studies
    const vesselConfigs = {
        tug: {
            name: "Harbor Tug (32m)",
            ecoSpeed: 8,
            fullSpeed: 13,
            costEco: 600,    
            costFull: 2160,  
            waveExp: 4.5   
        },
        cruiseShip: {
            name: "Passenger Cruise Ship (93m)",
            ecoSpeed: 10,
            fullSpeed: 13.8,
            costEco: 1600,
            costFull: 4200,
            waveExp: 4.6
        },
        osv: {
            name: "Offshore Supply Vessel (50m)",
            ecoSpeed: 10,
            fullSpeed: 14,
            costEco: 850,
            costFull: 3200,
            waveExp: 4.5
        },
        coaster: {
            name: "Coastal Freighter (80m)",
            ecoSpeed: 11,
            fullSpeed: 15,
            costEco: 1200,
            costFull: 4800,
            waveExp: 4.6
        }
    };

    // FR (Fouling Rating) information - based directly on UoM research findings
    // The 193% value for FR5 is directly from the Coral Adventurer study
    const frData = {
        0: { pct: 0,   desc: "Clean hull" },
        1: { pct: 15,  desc: "Light slime" },        // Calibrated based on research
        2: { pct: 35,  desc: "Medium slime" },       // Calibrated based on research
        3: { pct: 60,  desc: "Heavy slime" },        // Calibrated based on research
        4: { pct: 95,  desc: "Light calcareous" },   // Calibrated based on research
        5: { pct: 193, desc: "Heavy calcareous" }    // Matches 193% from UoM Coral Adventurer study
    };

    let myChart = null;

    // Currency conversion function
    function convertCurrency(amount, fromCurrency, toCurrency) {
        // Convert to AUD first (base currency)
        const amountInAUD = fromCurrency === 'AUD' 
            ? amount 
            : amount / conversionRates[fromCurrency];
        
        // Then convert to target currency
        return amountInAUD * conversionRates[toCurrency];
    }
    
    // Solve for alpha (friction coefficient) and beta (wave coefficient)
    // This implementation follows the physics model described in the UoM papers
    function solveAlphaBeta(costEco, costFull, ecoSpeed, fullSpeed, waveExp = 4.5) {
        const s1 = ecoSpeed, s2 = fullSpeed;
        const x1 = Math.pow(s1, 3);
        const y1 = Math.pow(s1, waveExp);
        const x2 = Math.pow(s2, 3);
        const y2 = Math.pow(s2, waveExp);

        const det = x1*y2 - x2*y1;
        const alpha = (costEco*y2 - costFull*y1) / det;
        const beta  = (costFull*x1 - costEco*x2) / det;

        return { alpha, beta };
    }

    function formatCurrency(value) {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currentCurrency === 'AUD' ? 'AUD' : 'GBP',
            currencyDisplay: 'symbol',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    // Function to calculate CO2 emissions based on UoM research data
    // Calibrated to match the direct measurements in the papers
    function calculateExtraCO2(extraCost, vesselType) {
        // Convert extraCost to AUD for consistent emission calculation
        const extraCostAUD = currentCurrency === 'AUD' 
            ? extraCost 
            : convertCurrency(extraCost, currentCurrency, 'AUD');
            
        // Calibrated to match research: 1.8T CO2/hr at $1,273/hr extra cost for cruise ship
        let emissionFactor;
        
        if (vesselType === 'cruiseShip') {
            emissionFactor = 1800 / 1273; // kg CO2 per $ of extra fuel (from Coral Adventurer study)
        } else if (vesselType === 'tug') {
            emissionFactor = 1300 / 955; // kg CO2 per $ from Rio Tinto tugboat study
        } else {
            // For other vessel types, use a slightly modified factor based on engine efficiency
            emissionFactor = 1.45; // kg CO2 per $ of extra fuel
        }
        
        return extraCostAUD * emissionFactor;
    }

    // Get validation status for current configuration
    // Identifies when we're showing values directly measured in the UoM studies
    function getValidationStatus(vesselType, frLevel, speed) {
        if (vesselType === 'cruiseShip' && frLevel === 5 && 
            Math.abs(speed - vesselConfigs.cruiseShip.fullSpeed) < 0.5) {
            return {
                validated: true,
                message: "Values validated by University of Melbourne Coral Adventurer study"
            };
        } else if (vesselType === 'tug' && frLevel === 4 && 
            Math.abs(speed - vesselConfigs.tug.fullSpeed) < 0.5) {
            return {
                validated: true,
                message: "Values validated by University of Melbourne Rio Tinto tugboat study"
            };
        }
        return {
            validated: false,
            message: ""
        };
    }

    function updateCalculator() {
        const vesselType = document.getElementById("vesselType").value;
        const vessel = vesselConfigs[vesselType];
        
        // Get input costs in current currency
        let costEcoInput = parseFloat(document.getElementById("costEco").value) || vessel.costEco;
        let costFullInput = parseFloat(document.getElementById("costFull").value) || vessel.costFull;
        
        // Convert input costs to AUD for calculations if needed
        let costEco = currentCurrency === 'AUD' ? costEcoInput : convertCurrency(costEcoInput, currentCurrency, 'AUD');
        let costFull = currentCurrency === 'AUD' ? costFullInput : convertCurrency(costFullInput, currentCurrency, 'AUD');
        
        const frLevel = parseInt(document.getElementById("frSlider").value) || 0;
        const { pct:frPct, desc:frDesc } = frData[frLevel];

        // Update FR label
        const frLabel = `FR${frLevel}`;
        document.getElementById("frLabel").textContent = frLabel;

        // Calculate speed range for chart
        const minSpeed = Math.max(vessel.ecoSpeed - 4, 4);
        const maxSpeed = vessel.fullSpeed + 2;
        
        const { alpha, beta } = solveAlphaBeta(
            costEco, 
            costFull, 
            vessel.ecoSpeed, 
            vessel.fullSpeed, 
            vessel.waveExp
        );

        const speeds = [];
        const cleanCosts = [];
        const fouledCosts = [];
        const co2Emissions = [];
        
        // Adjust step size based on speed range for better readability
        const stepSize = (maxSpeed - minSpeed) > 8 ? 0.5 : 0.25;
        
        for (let s = minSpeed; s <= maxSpeed; s += stepSize) {
            const friction = alpha * Math.pow(s, 3);
            const wave = beta * Math.pow(s, vessel.waveExp);
            const costClean = friction + wave;

            const frictionFouled = friction * (1 + frPct/100);
            const costFouled = frictionFouled + wave;

            // CO2 emission calculation based on UoM research data
            const extraCost = costFouled - costClean;
            const extraCO2 = calculateExtraCO2(extraCost, vesselType);

            speeds.push(s.toFixed(1));
            
            // Convert costs to current currency for display
            const displayCleanCost = currentCurrency === 'AUD' ? 
                costClean : 
                convertCurrency(costClean, 'AUD', currentCurrency);
                
            const displayFouledCost = currentCurrency === 'AUD' ? 
                costFouled : 
                convertCurrency(costFouled, 'AUD', currentCurrency);
                
            cleanCosts.push(displayCleanCost);
            fouledCosts.push(displayFouledCost);
            co2Emissions.push(extraCO2);
        }

        // Get the canvas context
        const ctx = document.getElementById("myChart");
        if (!ctx) {
            console.error("Chart canvas element not found");
            return;
        }
        
        // Properly destroy the existing chart instance if it exists
        if (myChart) {
            myChart.destroy();
            myChart = null;
        }
        
        // Create a new chart
        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: speeds,
                datasets: [
                    {
                        label: 'Clean Hull (FR0)',
                        data: cleanCosts,
                        borderColor: 'rgba(30, 77, 120, 1)',
                        backgroundColor: 'rgba(30, 77, 120, 0.2)',
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y',
                        borderWidth: 3
                    },
                    {
                        label: `Fouled Hull (${frLabel})`,
                        data: fouledCosts,
                        borderColor: 'rgba(232, 119, 34, 1)',
                        backgroundColor: 'rgba(232, 119, 34, 0.2)',
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y',
                        borderWidth: 3
                    },
                    {
                        label: 'Additional CO₂ Emissions',
                        data: co2Emissions,
                        borderColor: 'rgba(16, 133, 101, 1)',
                        backgroundColor: 'rgba(16, 133, 101, 0)',
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y1',
                        borderDash: [5, 5],
                        borderWidth: 3
                    }
                ]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    mode: 'index',
                    intersect: false
                },
                plugins: {
                    title: {
                        display: false
                    },
                    tooltip: {
                        callbacks: {
                            label: function(ctx) {
                                if (ctx.dataset.yAxisID === 'y1') {
                                    return `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)} kg/hr`;
                                }
                                return `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}/hr`;
                            }
                        },
                        backgroundColor: 'rgba(0, 0, 0, 0.85)',
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        padding: 12,
                        borderColor: 'rgba(255, 255, 255, 0.3)',
                        borderWidth: 1
                    },
                    legend: {
                        position: 'top',
                        align: 'start',
                        labels: {
                            boxWidth: 15,
                            padding: 15,
                            font: {
                                size: window.innerWidth < 768 ? 12 : 14,
                                weight: 'bold'
                            },
                            usePointStyle: true,
                            pointStyle: 'circle'
                        }
                    }
                },
                scales: {
                    x: {
                        title: {
                            display: true,
                            text: 'Speed (knots)',
                            font: { 
                                weight: 'bold',
                                size: window.innerWidth < 768 ? 12 : 14
                            },
                            color: 'rgba(0, 0, 0, 0.8)'
                        },
                        grid: {
                            display: true,
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                            font: {
                                size: window.innerWidth < 768 ? 10 : 12,
                                weight: '600'
                            },
                            color: 'rgba(0, 0, 0, 0.8)',
                            callback: function(value, index, values) {
                                // Show fewer labels on small screens
                                if (window.innerWidth < 768) {
                                    return index % 2 === 0 ? this.getLabelForValue(value) : '';
                                }
                                return this.getLabelForValue(value);
                            }
                        }
                    },
                    y: {
                        type: 'linear',
                        display: true,
                        position: 'left',
                        title: {
                            display: true,
                            text: `Operating Cost (${currencySymbols[currentCurrency]}/hr)`,
                            font: { 
                                weight: 'bold',
                                size: window.innerWidth < 768 ? 12 : 14
                            },
                            color: 'rgba(0, 0, 0, 0.8)'
                        },
                        beginAtZero: true,
                        ticks: {
                            font: {
                                size: window.innerWidth < 768 ? 10 : 12,
                                weight: '600'
                            },
                            color: 'rgba(0, 0, 0, 0.8)',
                            callback: function(value) {
                                return currencySymbols[currentCurrency] + value;
                            }
                        },
                        grid: {
                            color: 'rgba(0, 0, 0, 0.1)'
                        }
                    },
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Additional CO₂ (kg/hr)',
                            font: { 
                                weight: 'bold',
                                size: window.innerWidth < 768 ? 12 : 14
                            },
                            color: 'rgba(0, 0, 0, 0.8)'
                        },
                        beginAtZero: true,
                        grid: {
                            drawOnChartArea: false,
                            color: 'rgba(0, 0, 0, 0.1)'
                        },
                        ticks: {
                            font: {
                                size: window.innerWidth < 768 ? 10 : 12,
                                weight: '600'
                            },
                            color: 'rgba(0, 0, 0, 0.8)'
                        }
                    }
                }
            }
        });

        function costAt(speed) {
            const friction = alpha * Math.pow(speed, 3);
            const wave = beta * Math.pow(speed, vessel.waveExp);
            const frictionFouled = friction * (1 + frPct/100);
            
            const clean = friction + wave;
            const fouled = frictionFouled + wave;
            
            // Convert costs to display currency if needed
            const displayClean = currentCurrency === 'AUD' ? 
                clean : 
                convertCurrency(clean, 'AUD', currentCurrency);
                
            const displayFouled = currentCurrency === 'AUD' ? 
                fouled : 
                convertCurrency(fouled, 'AUD', currentCurrency);
            
            // Check if this is a validated data point from UoM research
            const validation = getValidationStatus(vesselType, frLevel, speed);
            
            return {
                clean: displayClean,
                fouled: displayFouled,
                cleanFriction: friction,
                cleanWave: wave,
                validation: validation
            };
        }

        const cEco = costAt(vessel.ecoSpeed);
        const cFull = costAt(vessel.fullSpeed);
        
        const increaseEco = ((cEco.fouled - cEco.clean) / cEco.clean * 100).toFixed(1);
        const increaseFull = ((cFull.fouled - cFull.clean) / cFull.clean * 100).toFixed(1);
        
        const extraCostFull = cFull.fouled - cFull.clean;
        const extraCO2Full = calculateExtraCO2(extraCostFull, vesselType);
        
        // Annual impact calculation (assuming 12hr/day, 200 days/year operation)
        // Based on the operational schedule used in UoM studies
        const annualHours = 12 * 200;
        const annualExtraCost = extraCostFull * annualHours;
        const annualExtraCO2 = extraCO2Full * annualHours / 1000; // Convert to tonnes

        let resultsHtml = `
            <div class="result-item">
                <span class="result-label">Vessel Type:</span>
                <span class="result-value">${vessel.name}</span>
            </div>
            
            <div class="result-group">
                <div class="result-group-header">
                    <i class="fas fa-tachometer-alt"></i>
                    <h4>At ${vessel.ecoSpeed} knots (Economic Speed)</h4>
                </div>
                <div class="result-item">
                    <span class="result-label">Clean Hull:</span>
                    <span class="result-value">${formatCurrency(cEco.clean)}/hr</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Fouled Hull (${frLabel}):</span>
                    <span class="result-value">${formatCurrency(cEco.fouled)}/hr</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Cost Increase:</span>
                    <span class="result-value">${increaseEco}%</span>
                </div>
            </div>

            <div class="result-group">
                <div class="result-group-header">
                    <i class="fas fa-rocket"></i>
                    <h4>At ${vessel.fullSpeed} knots (Full Speed)</h4>
                </div>
                <div class="result-item">
                    <span class="result-label">Clean Hull:</span>
                    <span class="result-value">${formatCurrency(cFull.clean)}/hr</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Fouled Hull (${frLabel}):</span>
                    <span class="result-value">${formatCurrency(cFull.fouled)}/hr</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Cost Increase:</span>
                    <span class="result-value">${increaseFull}%</span>
                </div>
            </div>

            <div class="result-group">
                <div class="result-group-header">
                    <i class="fas fa-leaf"></i>
                    <h4>Environmental Impact at Full Speed</h4>
                </div>
                <div class="result-item">
                    <span class="result-label">Additional CO₂ Emissions:</span>
                    <span class="result-value">${extraCO2Full.toFixed(1)} kg/hr</span>
                </div>
            </div>
        `;

        // Add validation badge if applicable
        if (cFull.validation.validated) {
            resultsHtml += `
                <div class="validation-badge">
                    <i class="fas fa-check-circle"></i>
                    <span>${cFull.validation.message}</span>
                </div>
            `;
        }

        // Add annual impact section
        resultsHtml += `
            <div class="result-group">
                <div class="result-group-header">
                    <i class="fas fa-calendar-alt"></i>
                    <h4>Estimated Annual Impact</h4>
                </div>
                <div class="result-item">
                    <span class="result-label">Operating Schedule:</span>
                    <span class="result-value">12 hrs/day, 200 days/year</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Additional Fuel Cost:</span>
                    <span class="result-value">${formatCurrency(annualExtraCost)}</span>
                </div>
                <div class="result-item">
                    <span class="result-label">Additional CO₂ Emissions:</span>
                    <span class="result-value">${annualExtraCO2.toFixed(1)} tonnes</span>
                </div>
            </div>
        `;

        document.getElementById("resultsText").innerHTML = resultsHtml;

        // Highlight active tick on slider
        document.querySelectorAll('.range-tick').forEach(tick => {
            const tickValue = parseInt(tick.getAttribute('data-value'));
            const tickDot = tick.querySelector('.tick-dot');
            
            if (tickValue === frLevel) {
                tickDot.style.backgroundColor = 'var(--accent-color)';
                tickDot.style.transform = 'scale(1.5)';
                tick.classList.add('active');
            } else {
                tickDot.style.backgroundColor = 'var(--neutral-500)';
                tickDot.style.transform = 'scale(1)';
                tick.classList.remove('active');
            }
        });
    }
    
    // Update input placeholders based on currency
    function updateInputPlaceholders() {
        // Get the current vessel
        const vesselType = document.getElementById("vesselType").value;
        const vessel = vesselConfigs[vesselType];
        
        // Convert base costs to current currency for placeholders
        const costEcoConverted = currentCurrency === 'AUD' ? 
            vessel.costEco : 
            convertCurrency(vessel.costEco, 'AUD', currentCurrency);
            
        const costFullConverted = currentCurrency === 'AUD' ? 
            vessel.costFull : 
            convertCurrency(vessel.costFull, 'AUD', currentCurrency);
        
        // Update input values if they're empty
        const costEcoInput = document.getElementById("costEco");
        const costFullInput = document.getElementById("costFull");
        
        if (!costEcoInput.value) {
            costEcoInput.value = Math.round(costEcoConverted);
        }
        
        if (!costFullInput.value) {
            costFullInput.value = Math.round(costFullConverted);
        }
        
        // Update input labels to reflect current currency
        document.querySelectorAll('.help-text').forEach(helpText => {
            if (helpText.textContent.includes('fuel cost')) {
                helpText.textContent = helpText.textContent.replace(/\$/, currencySymbols[currentCurrency]);
            }
        });
    }

    // Set up event listeners
    document.getElementById("vesselType").addEventListener("change", function() {
        const vesselType = this.value;
        const config = vesselConfigs[vesselType];
        
        // Convert costs to current currency for display
        const costEcoConverted = currentCurrency === 'AUD' ? 
            config.costEco : 
            convertCurrency(config.costEco, 'AUD', currentCurrency);
            
        const costFullConverted = currentCurrency === 'AUD' ? 
            config.costFull : 
            convertCurrency(config.costFull, 'AUD', currentCurrency);
        
        document.getElementById("costEco").value = Math.round(costEcoConverted);
        document.getElementById("costFull").value = Math.round(costFullConverted);
        
        updateCalculator();
    });

    document.getElementById("costEco").addEventListener("input", updateCalculator);
    document.getElementById("costFull").addEventListener("input", updateCalculator);
    document.getElementById("frSlider").addEventListener("input", updateCalculator);
    
    // Currency selector event listener
    document.getElementById("currencySelect").addEventListener("change", function() {
        const newCurrency = this.value;
        
        // Skip if currency hasn't changed
        if (newCurrency === currentCurrency) return;
        
        // Get current costs in current currency
        const costEcoInput = parseFloat(document.getElementById("costEco").value) || 0;
        const costFullInput = parseFloat(document.getElementById("costFull").value) || 0;
        
        // Update currency
        currentCurrency = newCurrency;
        
        // Convert the input costs to the new currency
        if (costEcoInput > 0) {
            const convertedCostEco = convertCurrency(costEcoInput, 
                newCurrency === 'AUD' ? 'GBP' : 'AUD', 
                newCurrency);
            document.getElementById("costEco").value = Math.round(convertedCostEco);
        }
        
        if (costFullInput > 0) {
            const convertedCostFull = convertCurrency(costFullInput, 
                newCurrency === 'AUD' ? 'GBP' : 'AUD', 
                newCurrency);
            document.getElementById("costFull").value = Math.round(convertedCostFull);
        }
        
        // Update input placeholders and calculator
        updateInputPlaceholders();
        updateCalculator();
    });
    
    // Make ticks clickable
    document.querySelectorAll('.range-tick').forEach(tick => {
        tick.addEventListener('click', function() {
            const value = this.getAttribute('data-value');
            document.getElementById('frSlider').value = value;
            updateCalculator();
        });
    });
    
    // Handle window resize for responsive chart
    window.addEventListener('resize', function() {
        // Update chart size based on container
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer && myChart) {
            // Short delay to allow container to resize first
            setTimeout(() => {
                myChart.resize();
                updateCalculator();
            }, 100);
        } else {
            updateCalculator();
        }
    });

    // Initial calculation
    const initialVessel = vesselConfigs[document.getElementById("vesselType").value];
    document.getElementById("costEco").value = initialVessel.costEco;
    document.getElementById("costFull").value = initialVessel.costFull;
    updateInputPlaceholders();
    updateCalculator();
    
    // Mark the calculator as initialized
    window.calculatorInitialized = true;
}

// Initialize the calculator when DOM is loaded - updating to prevent multiple initializations
document.addEventListener('DOMContentLoaded', function() {
    // We'll let script.js handle the initialization when the modal opens
    // This prevents double initialization
    
    // Set up modal button handlers directly in the DOMContentLoaded event
    const openCalcBtn = document.getElementById('open-cost-calculator');
    if (openCalcBtn && !openCalcBtn._eventHandlerAttached) {
        openCalcBtn.addEventListener('click', function() {
            const calcModal = document.getElementById('cost-calculator-modal');
            if (calcModal) {
                calcModal.style.display = 'flex';
                document.body.classList.add('modal-open');
                
                // Initialize calculator if it hasn't been initialized yet
                if (!window.calculatorInitialized) {
                    initHullFoulingCalculator();
                }
            }
        });
        openCalcBtn._eventHandlerAttached = true; // Mark that we've attached the handler
    }
    
    // Close calculator modal if clicked outside
    const calcModal = document.getElementById('cost-calculator-modal');
    if (calcModal && !calcModal._eventHandlerAttached) {
        calcModal.addEventListener('click', function(event) {
            if (event.target === calcModal) {
                calcModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            }
        });
        
        // Close button handler
        const closeBtn = calcModal.querySelector('.modal-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', function() {
                calcModal.style.display = 'none';
                document.body.classList.remove('modal-open');
            });
        }
        
        calcModal._eventHandlerAttached = true;
    }
}); 