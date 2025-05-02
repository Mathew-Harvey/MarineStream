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
    
    // Physical constants (using typical values for seawater at ~15°C)
    const KNOTS_TO_MPS = 0.514444;
    const MPS_TO_KNOTS = 1.94384;
    const NU_WATER = 1.19e-6; // Kinematic viscosity (m²/s)
    const RHO_WATER = 1025;   // Density of seawater (kg/m³)
    // Fuel properties (typical for Marine Diesel Oil)
    const FUEL_CO2_FACTOR = 3.16; // kg CO2 per kg fuel
    const FUEL_ENERGY_DENSITY = 42.7; // MJ/kg
    const FUEL_DENSITY = 0.85; // kg/L

    // Default currency
    let currentCurrency = 'AUD';
    
    // Vessel type configurations - extended with physical parameters
    const vesselConfigs = {
        tug: {
            name: "Harbor Tug (32m)",
            L: 32,           // Length (m) - from paper Table 1
            ecoSpeed: 8,     // knots
            fullSpeed: 13,   // knots - from paper Table 3
            costEco: 600,    // User input default (AUD/hr)
            costFull: 2160,  // User input default (AUD/hr) - approx from paper ($955 extra cost on baseline = 2160)
            waveExp: 4.5,    // Speed exponent for wave drag cost component
            // Physics parameters derived/estimated from paper (Table 3 & 4)
            CA: 0.0006,      // Correlation allowance at 13kn
            CrCfRatio_eco: 0.63, // Residuary/Friction ratio at 6.5kn (estimated for 8kn)
            CrCfRatio_full: 1.83, // Residuary/Friction ratio at 13kn
            eff_eco: 0.35,      // Estimated engine efficiency at eco speed
            eff_full: 0.40      // Engine efficiency at full speed (from paper Table 4)
        },
        cruiseShip: {
            name: "Passenger Cruise Ship (93m)",
            L: 93,           // Length (m) - typical assumption
            ecoSpeed: 10,    // knots
            fullSpeed: 13.8, // knots
            costEco: 1600,   // User input default (AUD/hr)
            costFull: 4200,  // User input default (AUD/hr)
            waveExp: 4.6,
            // Physics parameters (Estimates - replace with real data if available)
            CA: 0.0004,      // Correlation allowance (estimated)
            CrCfRatio_eco: 1.0,  // Residuary/Friction ratio (estimated)
            CrCfRatio_full: 2.0, // Residuary/Friction ratio (estimated)
            eff_eco: 0.40,       // Estimated engine efficiency
            eff_full: 0.45       // Estimated engine efficiency
        }
        // Add other vessels with their physical parameters here...
    };

    // FR (Fouling Rating) to ks (equivalent sandgrain roughness in meters) mapping
    // Calibrated: FR4 = 2.8mm (0.0028m) from Rio Tinto tug study paper (Table 2)
    // Values for other levels are interpolated/extrapolated estimates.
    const frKsMapping = [
        0,         // FR0: Smooth
        0.00015,   // FR1: Light slime (~150 microns)
        0.00050,   // FR2: Medium slime (~500 microns)
        0.00120,   // FR3: Heavy slime (~1.2 mm)
        0.00280,   // FR4: Light calcareous (matches paper 2.8mm)
        0.00600    // FR5: Heavy calcareous (~6 mm) - Adjusted from previous direct %
        // Add FR6-FR10 if needed, mapping to higher ks values
    ];
    
    // Old frData (based on cost percentage) - No longer used for main calculation
    // const frData = { ... }; // Keep commented out for reference if needed

    let myChart = null;

    // Helper function: Linear Interpolation
    function interpolate(x, x1, x2, y1, y2) {
        if (x <= x1) return y1;
        if (x >= x2) return y2;
        return y1 + (y2 - y1) * (x - x1) / (x2 - x1);
    }

    // Helper function: Knots to m/s
    function knotsToMps(knots) {
        return knots * KNOTS_TO_MPS;
    }

    // Helper function: m/s to Knots
    function mpsToKnots(mps) {
        return mps * MPS_TO_KNOTS;
    }

    // Physics function: Calculate Reynolds Number
    function calculateReL(speedMps, L, nu) {
        return speedMps * L / nu;
    }

    // Physics function: Calculate Smooth Skin Friction Coefficient (ITTC 1957)
    function calculateCfs(ReL) {
        if (ReL <= 0) return 0;
        return 0.075 / Math.pow(Math.log10(ReL) - 2, 2);
    }

    // Physics function: Calculate Rough Skin Friction Coefficient Cf
    // Uses a simplified approach blending smooth and fully rough laws
    // Based on concepts similar to Grigson, incorporating ks influence
    function calculateCf(ReL, ks, L) {
        const Cfs = calculateCfs(ReL);
        if (ks <= 0) {
            return Cfs; // Hydrodynamically smooth
        }

        // Estimate fully rough friction coefficient (Prandtl-Schlichting type)
        // Note: This is one of many possible correlations. Adjust if better model is available.
        const Cf_rough_fully = Math.pow(1.89 + 1.62 * Math.log10(L / ks), -2.5);

        // Simple blending: Transition based on roughness Reynolds number (approx)
        // This is a heuristic blend, more sophisticated methods exist
        const roughnessRey = ReL * (ks / L);
        const transitionStart = 100; // Approximate Re_k where roughness starts to matter
        const transitionEnd = 1000;  // Approximate Re_k where flow is fully rough

        if (roughnessRey < transitionStart) {
            return Cfs; // Still effectively smooth
        } else if (roughnessRey > transitionEnd) {
            return Cf_rough_fully; // Fully rough
        } else {
            // Linear blend in the transition region
            const weight = (roughnessRey - transitionStart) / (transitionEnd - transitionStart);
            return Cfs * (1 - weight) + Cf_rough_fully * weight;
        }
         // Alternative simple addition (e.g., Bowden & Davison - needs careful coefficient check)
        // const deltaCf_rough = 0.044 * (Math.pow(ks/L, 1/3) - 10 * Math.pow(ReL, -1/3)) + 0.00125; // Check formula/coeffs
        // return Cfs + Math.max(0, deltaCf_rough); // Ensure deltaCf is not negative
    }

    // Physics function: Calculate % Increase in Total Resistance (from paper Eq 4.2)
    function calculateDeltaRT(deltaCf, Cfs, CrCfRatio, CA) {
        if (Cfs <= 0) return 0; // Avoid division by zero for stationary vessel
        const denominator = Cfs * (1 + CrCfRatio) + CA;
        if (denominator <= 0) return 0; // Avoid division by zero or negative resistance base
        // Note: deltaCf = Cf_rough - Cfs
        return (deltaCf / denominator) * 100; // Returns percentage
    }

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
        
        // Get vessel-specific physical parameters
        const L = vessel.L;
        const nu = NU_WATER; // Assuming constant water properties
        const CA = vessel.CA; // Using the full speed CA as approximation for now

        // Get input costs in current currency
        let costEcoInput = parseFloat(document.getElementById("costEco").value) || vessel.costEco;
        let costFullInput = parseFloat(document.getElementById("costFull").value) || vessel.costFull;
        
        // Convert input costs to AUD for internal calculations
        let costEco = currentCurrency === 'AUD' ? costEcoInput : convertCurrency(costEcoInput, currentCurrency, 'AUD');
        let costFull = currentCurrency === 'AUD' ? costFullInput : convertCurrency(costFullInput, currentCurrency, 'AUD');
        
        const frLevel = parseInt(document.getElementById("frSlider").value) || 0;
        // Get ks value from the mapping
        const ks = frKsMapping[frLevel] !== undefined ? frKsMapping[frLevel] : 0;
        // Get description for label (modify if frData structure changes)
        // For now, create a simple description
        const frDesc = `FR${frLevel}` + (ks > 0 ? ` (ks=${(ks * 1000).toFixed(1)}mm)` : ' (Smooth)');

        // Update FR label
        const frLabel = `FR${frLevel}`;
        document.getElementById("frLabel").textContent = frLabel; // Keep simple label for UI

        // Calculate speed range for chart
        const minSpeed = Math.max(vessel.ecoSpeed - 4, 4);
        const maxSpeed = vessel.fullSpeed + 2;
        
        // Solve for alpha and beta of the CLEAN HULL COST curve based on user inputs
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
            // 1. Calculate Clean Hull Cost (using user-calibrated alpha/beta)
            const costCleanAUD = alpha * Math.pow(s, 3) + beta * Math.pow(s, vessel.waveExp);

            // 2. Calculate Physics-Based Fouling Impact (DeltaRT)
            const speedMps = knotsToMps(s);
            let DeltaRT = 0; // Default to 0% increase for smooth hull or errors

            if (ks > 0 && speedMps > 0) {
                const ReL = calculateReL(speedMps, L, nu);
                const Cfs = calculateCfs(ReL);
                const Cf_rough = calculateCf(ReL, ks, L);
                const deltaCf = Math.max(0, Cf_rough - Cfs); // Ensure non-negative delta

                // Interpolate CrCfRatio based on current speed 's'
                const CrCfRatio = interpolate(s, vessel.ecoSpeed, vessel.fullSpeed, vessel.CrCfRatio_eco, vessel.CrCfRatio_full);

                DeltaRT = calculateDeltaRT(deltaCf, Cfs, CrCfRatio, CA);
            }
            
            // Ensure DeltaRT is non-negative
            DeltaRT = Math.max(0, DeltaRT);

            // 3. Calculate Fouled Hull Cost
            const costFouledAUD = costCleanAUD * (1 + DeltaRT / 100);

            // 4. Calculate Extra CO2 (using existing calibrated function based on extra cost)
            const extraCostAUD = costFouledAUD - costCleanAUD;
            const extraCO2 = calculateExtraCO2(extraCostAUD, vesselType); // Pass AUD cost

            // 5. Store results for chart (converting back to display currency)
            speeds.push(s.toFixed(1));
            
            const displayCleanCost = currentCurrency === 'AUD' ?
                costCleanAUD :
                convertCurrency(costCleanAUD, 'AUD', currentCurrency);
                
            const displayFouledCost = currentCurrency === 'AUD' ?
                costFouledAUD :
                convertCurrency(costFouledAUD, 'AUD', currentCurrency);
                
            cleanCosts.push(displayCleanCost);
            fouledCosts.push(displayFouledCost);
            co2Emissions.push(extraCO2); // CO2 is already in kg/hr
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
            // Get vessel config and alpha/beta (recalculating alpha/beta ensures consistency if user changed inputs)
             const vesselType = document.getElementById("vesselType").value;
             const vessel = vesselConfigs[vesselType];
             let costEcoInput = parseFloat(document.getElementById("costEco").value) || vessel.costEco;
             let costFullInput = parseFloat(document.getElementById("costFull").value) || vessel.costFull;
             let costEco = currentCurrency === 'AUD' ? costEcoInput : convertCurrency(costEcoInput, currentCurrency, 'AUD');
             let costFull = currentCurrency === 'AUD' ? costFullInput : convertCurrency(costFullInput, currentCurrency, 'AUD');
             const { alpha, beta } = solveAlphaBeta(costEco, costFull, vessel.ecoSpeed, vessel.fullSpeed, vessel.waveExp);
             const frLevel = parseInt(document.getElementById("frSlider").value) || 0;
             const ks = frKsMapping[frLevel] !== undefined ? frKsMapping[frLevel] : 0;

            // Calculate clean cost (AUD)
            const cleanAUD = alpha * Math.pow(speed, 3) + beta * Math.pow(speed, vessel.waveExp);

            // Calculate DeltaRT at this specific speed
            const speedMps = knotsToMps(speed);
            let DeltaRT = 0;
             if (ks > 0 && speedMps > 0) {
                 const L = vessel.L;
                 const nu = NU_WATER;
                 const CA = vessel.CA; // Approximation
                 const ReL = calculateReL(speedMps, L, nu);
                 const Cfs = calculateCfs(ReL);
                 const Cf_rough = calculateCf(ReL, ks, L);
                 const deltaCf = Math.max(0, Cf_rough - Cfs);
                 const CrCfRatio = interpolate(speed, vessel.ecoSpeed, vessel.fullSpeed, vessel.CrCfRatio_eco, vessel.CrCfRatio_full);
                 DeltaRT = calculateDeltaRT(deltaCf, Cfs, CrCfRatio, CA);
             }
             DeltaRT = Math.max(0, DeltaRT);

            // Calculate fouled cost (AUD)
            const fouledAUD = cleanAUD * (1 + DeltaRT / 100);

            // Convert costs to display currency
            const displayClean = currentCurrency === 'AUD' ?
                cleanAUD :
                convertCurrency(cleanAUD, 'AUD', currentCurrency);

            const displayFouled = currentCurrency === 'AUD' ?
                fouledAUD :
                convertCurrency(fouledAUD, 'AUD', currentCurrency);

            // Get validation status (remains the same)
            const validation = getValidationStatus(vesselType, frLevel, speed);

            return {
                clean: displayClean,
                fouled: displayFouled,
                validation: validation
            };
        }

        const cEco = costAt(vessel.ecoSpeed);
        const cFull = costAt(vessel.fullSpeed);
        
        const increaseEco = cEco.clean > 0 ? ((cEco.fouled - cEco.clean) / cEco.clean * 100).toFixed(1) : 'N/A';
        const increaseFull = cFull.clean > 0 ? ((cFull.fouled - cFull.clean) / cFull.clean * 100).toFixed(1) : 'N/A';
        
        // Calculate extra cost/CO2 at full speed using costs in AUD for consistency with calculateExtraCO2
        const costFullCleanAUD = currentCurrency === 'AUD' ? cFull.clean : convertCurrency(cFull.clean, currentCurrency, 'AUD');
        const costFullFouledAUD = currentCurrency === 'AUD' ? cFull.fouled : convertCurrency(cFull.fouled, currentCurrency, 'AUD');
        const extraCostFullAUD = costFullFouledAUD - costFullCleanAUD;
        const extraCO2Full = calculateExtraCO2(extraCostFullAUD, vesselType);

        // Annual impact calculation (using AUD costs for consistency)
        // Based on the operational schedule used in UoM studies
        const annualHours = 12 * 200;
        const annualExtraCost = extraCostFullAUD * annualHours;
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