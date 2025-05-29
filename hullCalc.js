// Hull Fouling Calculator - MarineStream™
// Enhanced physics-based model with custom vessel support

function initHullFoulingCalculator() {
    if (window.calculatorInitialized) {
        console.log('Hull Fouling Calculator already initialized, skipping...');
        return;
    }

    console.log('Initializing Hull Fouling Calculator...');

    // Currency conversion rates (relative to AUD)
    const conversionRates = {
        AUD: 1,
        GBP: 0.495,  // 1 AUD = 0.495 GBP (current rate ~0.495)
        USD: 0.644   // 1 AUD = 0.644 USD (current rate ~0.644)
    };

    const currencySymbols = {
        AUD: '$',
        GBP: '£',
        USD: '$'
    };

    // Physical constants
    const KNOTS_TO_MPS = 0.514444;
    const MPS_TO_KNOTS = 1.94384;
    const NU_WATER = 1.19e-6; // Kinematic viscosity (m²/s)
    const RHO_WATER = 1025;   // Density of seawater (kg/m³)
    const GRAVITY = 9.81;     // Gravity (m/s²)

    // Fuel properties
    const FUEL_CO2_FACTOR = 3.16; // kg CO2 per kg fuel
    const FUEL_ENERGY_DENSITY = 42.7; // MJ/kg
    const FUEL_DENSITY = 0.85; // kg/L
    const FUEL_PRICE_PER_LITER = 1.92; // $/L

    // Engine and propulsion constants
    const propEfficiency = 0.65; // Propulsive efficiency
    const sfoc = 200; // Specific fuel oil consumption (g/kWh)
    const fuelCostPerKg = FUEL_PRICE_PER_LITER / FUEL_DENSITY;
    const co2PerKgFuel = FUEL_CO2_FACTOR;

    let currentCurrency = 'AUD';

    // Enhanced vessel configurations
    const vesselConfigs = {
        tug: {
            name: "Harbor Tug (32m)",
            length: 32,
            beam: 10,
            draft: 4.5,
            cb: 0.65,
            ecoSpeed: 8,
            fullSpeed: 13,
            costEco: 600,    
            costFull: 2160,  
            waveExp: 4.5,
            category: 'workboat'
        },
        cruiseShip: {
            name: "Passenger Cruise Ship (93m)",
            length: 93,
            beam: 16,
            draft: 5.2,
            cb: 0.62,
            ecoSpeed: 10,
            fullSpeed: 13.8,
            costEco: 1600,
            costFull: 4200,
            waveExp: 4.6,
            category: 'cruise'
        },
        custom: {
            name: "Custom Vessel",
            // Will be populated dynamically
        }
    };

    // Enhanced FR to ks mapping - calibrated for simplified model
    const frKsMapping = [
        0,         // FR0: Smooth (0% increase)
        0.00003,   // FR1: Light slime (10-20% increase)
        0.00010,   // FR2: Medium slime (20-40% increase)
        0.00030,   // FR3: Heavy slime (40-80% increase)
        0.00080,   // FR4: Light calcareous (80-140% increase)
        0.00200    // FR5: Heavy calcareous (140-200% increase)
    ];

    let myChart = null;

    // Helper functions
    function interpolate(x, x1, x2, y1, y2) {
        if (x <= x1) return y1;
        if (x >= x2) return y2;
        return y1 + (y2 - y1) * (x - x1) / (x2 - x1);
    }

    function knotsToMps(knots) {
        return knots * KNOTS_TO_MPS;
    }

    function mpsToKnots(mps) {
        return mps * MPS_TO_KNOTS;
    }

    // Add missing physics functions
    function calculateReynolds(speedMs, length) {
        return speedMs * length / NU_WATER;
    }

    function calculateWettedSurface(L, B, T, Cb) {
        // Holtrop & Mennen approximation for wetted surface area
        const displacement = L * B * T * Cb * RHO_WATER / 1000;
        const S = L * (2 * T + B) * Math.sqrt(Cb) * (0.453 + 0.4425 * Cb - 0.2862 * Cb * Cb + 0.003467 * B / T + 0.3696 * 0.65);
        return S;
    }

    function calculateWaveResistance(vessel, speedMs) {
        // Simplified wave resistance calculation - smooth and predictable
        const Fr = speedMs / Math.sqrt(GRAVITY * vessel.length);
        
        // Simple smooth wave resistance coefficient
        // Increases gradually with speed, no humps or discontinuities
        let Cw = 0;
        if (Fr > 0.05) {
            // Smooth polynomial increase - no humps
            Cw = 0.00008 * Math.pow(Fr, 4); // Simple 4th power law
        }
        
        const wettedSurface = calculateWettedSurface(vessel.length, vessel.beam, vessel.draft, vessel.cb);
        return 0.5 * RHO_WATER * wettedSurface * Cw * speedMs * speedMs;
    }

    function estimateFuelCost(vessel, speed, wettedSurface) {
        const speedMs = speed * KNOTS_TO_MPS;
        const Re = calculateReynolds(speedMs, vessel.length);
        const cf = calculateCf(Re, 0);
        
        const frictionResistance = 0.5 * RHO_WATER * wettedSurface * cf * speedMs * speedMs;
        const waveResistance = calculateWaveResistance(vessel, speedMs);
        const totalResistance = frictionResistance + waveResistance;
        
        const power = totalResistance * speedMs / 1000 / propEfficiency; // kW
        const fuelConsumption = power * sfoc / 1000; // kg/hr
        const cost = fuelConsumption * fuelCostPerKg;
        
        return cost;
    }

    // Enhanced physics functions
    function calculateReL(speedMps, L, nu) {
        return speedMps * L / nu;
    }

    function calculateCfs(ReL) {
        if (ReL <= 0) return 0;
        return 0.075 / Math.pow(Math.log10(ReL) - 2, 2);
    }

    // Improved rough skin friction coefficient calculation
    function calculateCf(ReL, ks, L) {
        const Cfs = calculateCfs(ReL);
        if (ks <= 0 || !ks) return Cfs;

        // For simplified calculation when L is not provided
        if (!L) {
            L = 50; // Default vessel length
        }

        // Simplified approach - smooth transition from smooth to rough
        // Avoid complex transitional regime calculations
        const roughnessRatio = ks / L;
        
        // Simple interpolation based on roughness
        // This gives a smooth increase in Cf with roughness
        const roughnessFactor = 1 + 100 * roughnessRatio; // Linear increase with roughness
        
        // Blend between smooth and rough based on roughness level
        const CfRough = Cfs * roughnessFactor;
        
        // Ensure reasonable bounds
        return Math.min(CfRough, Cfs * 3); // Cap at 3x smooth friction
    }

    // Calculate form factor K
    function calculateFormFactor(vessel) {
        const L = vessel.length;
        const B = vessel.beam || L / 5;
        const T = vessel.draft || B / 2.5;
        const Cb = vessel.cb || 0.65;

        const LR = L / Math.pow(vessel.displacement || (L * B * T * Cb * RHO_WATER / 1000), 1 / 3);

        // Simplified Holtrop & Mennen correlation
        const c14 = 1 + 0.011 * Cb;
        const K = c14 - 0.001 * LR;

        return Math.max(0, K);
    }

    // Get speed-dependent CA
    function getCA(speed, vessel) {
        if (vessel.CA_eco && vessel.CA_full) {
            return interpolate(speed, vessel.ecoSpeed, vessel.fullSpeed,
                vessel.CA_eco, vessel.CA_full);
        }
        return vessel.CA || 0.0005;
    }

    // Get speed-dependent CR/Cf ratio
    function getCrCfRatio(speed, vessel) {
        const Fr = speed * KNOTS_TO_MPS / Math.sqrt(GRAVITY * vessel.length);

        if (Fr < 0.15) {
            return vessel.CrCfRatio_eco || 0.5;
        } else if (Fr > 0.25) {
            return vessel.CrCfRatio_full || 2.0;
        } else {
            // Quadratic interpolation in transition zone
            const t = (Fr - 0.15) / 0.10;
            const eco = vessel.CrCfRatio_eco || 0.5;
            const full = vessel.CrCfRatio_full || 2.0;
            return eco + t * t * (full - eco);
        }
    }

    // Calculate total resistance increase
    function calculateDeltaRT(deltaCf, Cfs, CrCfRatio, CA, K) {
        if (Cfs <= 0) return 0;
        const Cv_smooth = Cfs * (1 + K);
        const denominator = Cv_smooth * (1 + CrCfRatio) + CA;
        if (denominator <= 0) return 0;
        return (deltaCf * (1 + K) / denominator) * 100;
    }

    // Estimate vessel parameters for custom vessels
    function estimateVesselParameters(L, B, T, Cb, category) {
        const displacement = L * B * T * Cb * RHO_WATER / 1000; // tonnes

        // Estimate speeds based on vessel category and size
        let speedFactor = 1.0;
        let efficiencyBase = 0.35;

        switch (category) {
            case 'cargo':
                speedFactor = 0.8;
                efficiencyBase = 0.40;
                break;
            case 'container':
                speedFactor = 1.2;
                efficiencyBase = 0.42;
                break;
            case 'cruise':
                speedFactor = 1.1;
                efficiencyBase = 0.43;
                break;
            case 'naval':
                speedFactor = 1.4;
                efficiencyBase = 0.38;
                break;
            case 'workboat':
                speedFactor = 0.9;
                efficiencyBase = 0.35;
                break;
            case 'yacht':
                speedFactor = 1.3;
                efficiencyBase = 0.37;
                break;
        }

        // Estimate speeds using Froude number relationships
        const ecoFr = 0.18 * speedFactor;
        const fullFr = 0.25 * speedFactor;
        const ecoSpeed = ecoFr * Math.sqrt(GRAVITY * L) * MPS_TO_KNOTS;
        const fullSpeed = fullFr * Math.sqrt(GRAVITY * L) * MPS_TO_KNOTS;

        // Estimate costs based on displacement and speed
        const powerEco = displacement * Math.pow(ecoSpeed, 2.5) * 0.015;
        const powerFull = displacement * Math.pow(fullSpeed, 2.5) * 0.015;

        const costEco = powerEco * FUEL_PRICE_PER_LITER / (efficiencyBase * FUEL_ENERGY_DENSITY * 3.6);
        const costFull = powerFull * FUEL_PRICE_PER_LITER / ((efficiencyBase + 0.05) * FUEL_ENERGY_DENSITY * 3.6);

        return {
            length: L,
            beam: B,
            draft: T,
            cb: Cb,
            displacement: displacement,
            ecoSpeed: Math.round(ecoSpeed * 2) / 2,
            fullSpeed: Math.round(fullSpeed * 2) / 2,
            costEco: Math.round(costEco / 50) * 50,
            costFull: Math.round(costFull / 50) * 50,
            waveExp: 4.5 + (Cb - 0.65) * 2,
            CA_eco: 0.0005 + (Cb - 0.65) * 0.001,
            CA_full: 0.0004 + (Cb - 0.65) * 0.0008,
            CrCfRatio_eco: 0.5 + (Cb - 0.65) * 2,
            CrCfRatio_full: 1.5 + (Cb - 0.65) * 3,
            eff_eco: efficiencyBase,
            eff_full: efficiencyBase + 0.05
        };
    }

    // Update custom vessel calculations
    function updateCustomVesselCalculations() {
        const L = parseFloat(document.getElementById('customLength').value) || 50;
        const B = parseFloat(document.getElementById('customBeam').value) || 10;
        const T = parseFloat(document.getElementById('customDraft').value) || 4;
        const Cb = parseFloat(document.getElementById('customCb').value) || 0.65;

        const displacement = L * B * T * Cb * RHO_WATER / 1000;
        document.getElementById('customDisplacement').value = Math.round(displacement);
    }

    function convertCurrency(amount, fromCurrency, toCurrency) {
        const amountInAUD = fromCurrency === 'AUD'
            ? amount
            : amount / conversionRates[fromCurrency];
        return amountInAUD * conversionRates[toCurrency];
    }

    function solveAlphaBeta(costEco, costFull, ecoSpeed, fullSpeed, waveExp = 4.5) {
        const s1 = ecoSpeed, s2 = fullSpeed;
        const x1 = Math.pow(s1, 3);
        const y1 = Math.pow(s1, waveExp);
        const x2 = Math.pow(s2, 3);
        const y2 = Math.pow(s2, waveExp);

        const det = x1 * y2 - x2 * y1;
        const alpha = (costEco * y2 - costFull * y1) / det;
        const beta = (costFull * x1 - costEco * x2) / det;

        return { alpha, beta };
    }

    function formatCurrency(value) {
        // Determine the correct currency code for Intl.NumberFormat
        let currencyCode = currentCurrency;
        
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currencyCode,
            currencyDisplay: 'symbol',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0
        }).format(value);
    }

    // Physics-based CO2 calculation
    function calculateCO2FromPower(powerKW, efficiency) {
        const fuelConsumption = powerKW / (efficiency * FUEL_ENERGY_DENSITY * 1000 / 3600);
        return fuelConsumption * FUEL_CO2_FACTOR;
    }

    function calculateExtraCO2(extraCost, vessel, speed) {
        const efficiency = interpolate(speed, vessel.ecoSpeed, vessel.fullSpeed,
            vessel.eff_eco, vessel.eff_full);
        const fuelPricePerKg = FUEL_PRICE_PER_LITER / FUEL_DENSITY;
        const extraFuelKgHr = extraCost / fuelPricePerKg;
        return extraFuelKgHr * FUEL_CO2_FACTOR;
    }

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
        return { validated: false, message: "" };
    }

    function updateCalculator() {
        const vesselType = document.getElementById("vesselType").value;
        let vessel;
        
        if (vesselType === 'custom') {
            // Show custom vessel parameters
            document.getElementById('customVesselParams').style.display = 'block';
            
            // Get custom vessel parameters
            vessel = {
                name: "Custom Vessel",
                length: parseFloat(document.getElementById("customLength").value) || 50,
                beam: parseFloat(document.getElementById("customBeam").value) || 10,
                draft: parseFloat(document.getElementById("customDraft").value) || 4,
                cb: parseFloat(document.getElementById("customCb").value) || 0.65,
                ecoSpeed: parseFloat(document.getElementById("customEcoSpeed").value) || 10,
                fullSpeed: parseFloat(document.getElementById("customFullSpeed").value) || 15,
                category: document.getElementById("vesselCategory").value || 'cargo'
            };
            
            // Calculate displacement
            const displacement = vessel.length * vessel.beam * vessel.draft * vessel.cb * 1.025;
            document.getElementById("customDisplacement").value = displacement.toFixed(0);
            
            // Calculate wetted surface area
            const wettedSurface = calculateWettedSurface(vessel.length, vessel.beam, vessel.draft, vessel.cb);
            
            // If costs aren't manually entered, estimate them
            if (!document.getElementById("costEco").value) {
                vessel.costEco = estimateFuelCost(vessel, vessel.ecoSpeed, wettedSurface);
                document.getElementById("costEco").value = Math.round(vessel.costEco);
            }
            if (!document.getElementById("costFull").value) {
                vessel.costFull = estimateFuelCost(vessel, vessel.fullSpeed, wettedSurface);
                document.getElementById("costFull").value = Math.round(vessel.costFull);
            }
        } else {
            // Hide custom vessel parameters
            document.getElementById('customVesselParams').style.display = 'none';
            vessel = vesselConfigs[vesselType];
            
            // Only update cost inputs if they're empty or if switching from custom
            const costEcoInput = document.getElementById("costEco");
            const costFullInput = document.getElementById("costFull");
            
            const previousType = document.getElementById("vesselType").getAttribute('data-previous') || '';
            
            // Check if we should update the values
            const shouldUpdate = !costEcoInput.hasAttribute('data-user-edited') || previousType === 'custom';
            
            if (shouldUpdate) {
                const costEcoConverted = currentCurrency === 'AUD' ?
                    vessel.costEco :
                    convertCurrency(vessel.costEco, 'AUD', currentCurrency);
                const costFullConverted = currentCurrency === 'AUD' ?
                    vessel.costFull :
                    convertCurrency(vessel.costFull, 'AUD', currentCurrency);

                costEcoInput.value = Math.round(costEcoConverted);
                costFullInput.value = Math.round(costFullConverted);
                
                // Remove the user-edited flag since we're setting defaults
                costEcoInput.removeAttribute('data-user-edited');
                costFullInput.removeAttribute('data-user-edited');
            }
        }
        
        // Store the current type as previous for next change
        document.getElementById("vesselType").setAttribute('data-previous', vesselType);
        
        // Get input costs in current currency
        let costEcoInput = parseFloat(document.getElementById("costEco").value);
        let costFullInput = parseFloat(document.getElementById("costFull").value);
        
        // If no user input, use vessel defaults converted to current currency
        if (!costEcoInput || isNaN(costEcoInput)) {
            costEcoInput = currentCurrency === 'AUD' ? 
                vessel.costEco : 
                convertCurrency(vessel.costEco, 'AUD', currentCurrency);
        }
        if (!costFullInput || isNaN(costFullInput)) {
            costFullInput = currentCurrency === 'AUD' ? 
                vessel.costFull : 
                convertCurrency(vessel.costFull, 'AUD', currentCurrency);
        }
        
        // Convert input costs to AUD for calculations if needed
        let costEco = currentCurrency === 'AUD' ? costEcoInput : convertCurrency(costEcoInput, currentCurrency, 'AUD');
        let costFull = currentCurrency === 'AUD' ? costFullInput : convertCurrency(costFullInput, currentCurrency, 'AUD');
        
        const frLevel = parseInt(document.getElementById("frSlider").value) || 0;
        const roughness = frKsMapping[frLevel] !== undefined ? frKsMapping[frLevel] : 0;
        
        // Update FR label
        const frLabel = `FR${frLevel}`;
        document.getElementById("frLabel").textContent = frLabel;
        
        // Calculate speed range for chart
        const minSpeed = Math.max(vessel.ecoSpeed - 4, 4);
        const maxSpeed = vessel.fullSpeed + 2;
        
        // Calculate wetted surface area
        const wettedSurface = calculateWettedSurface(vessel.length, vessel.beam, vessel.draft, vessel.cb);
        
        // Prepare data for chart
        const speeds = [];
        const cleanCosts = [];
        const fouledCosts = [];
        const fouledCostsLower = [];
        const fouledCostsUpper = [];
        const co2Emissions = [];
        
        // Adjust step size based on speed range for better readability
        const stepSize = (maxSpeed - minSpeed) > 8 ? 0.5 : 0.25;
        
        for (let s = minSpeed; s <= maxSpeed; s += stepSize) {
            const speedKnots = s;
            
            // Use the alpha-beta model for base costs (respecting user inputs)
            const { alpha, beta } = solveAlphaBeta(costEco, costFull, vessel.ecoSpeed, vessel.fullSpeed, 4.5);
            const baseCleanCost = alpha * Math.pow(speedKnots, 3) + beta * Math.pow(speedKnots, 4.5);
            
            // Simple empirical fouling model
            // FR0: 0%, FR1: 15%, FR2: 35%, FR3: 60%, FR4: 95%, FR5: 193%
            const foulingIncreases = [0, 0.15, 0.35, 0.60, 0.95, 1.93];
            const baseFoulingIncrease = foulingIncreases[frLevel] || 0;
            
            // Speed-dependent reduction factor
            // At low speeds (Fr < 0.15), full fouling impact
            // At high speeds (Fr > 0.35), fouling impact is reduced
            const Fr = speedKnots * 0.514444 / Math.sqrt(9.81 * vessel.length);
            let speedReduction = 1.0;
            if (Fr > 0.15) {
                // Linear reduction from Fr 0.15 to 0.35
                speedReduction = Math.max(0.3, 1.0 - 2.0 * (Fr - 0.15));
            }
            
            // Apply fouling increase with speed reduction
            const effectiveFoulingIncrease = baseFoulingIncrease * speedReduction;
            const costFouledHr = baseCleanCost * (1 + effectiveFoulingIncrease);
            
            // Calculate confidence intervals (±15% for fouling impact)
            const confidenceInterval = 0.15;
            const costFouledLower = baseCleanCost * (1 + effectiveFoulingIncrease * (1 - confidenceInterval));
            const costFouledUpper = baseCleanCost * (1 + effectiveFoulingIncrease * (1 + confidenceInterval));
            
            // CO2 emissions based on extra fuel - always calculate in base currency (AUD)
            const extraCost = costFouledHr - baseCleanCost;
            const extraFuel = extraCost / fuelCostPerKg;
            const co2Extra = extraFuel * co2PerKgFuel;
            
            speeds.push(s.toFixed(1));
            
            // Convert costs to current currency for display
            const displayCleanCost = currentCurrency === 'AUD' ? 
                baseCleanCost : 
                convertCurrency(baseCleanCost, 'AUD', currentCurrency);
                
            const displayFouledCost = currentCurrency === 'AUD' ? 
                costFouledHr : 
                convertCurrency(costFouledHr, 'AUD', currentCurrency);
                
            const displayFouledLower = currentCurrency === 'AUD' ? 
                costFouledLower : 
                convertCurrency(costFouledLower, 'AUD', currentCurrency);
                
            const displayFouledUpper = currentCurrency === 'AUD' ? 
                costFouledUpper : 
                convertCurrency(costFouledUpper, 'AUD', currentCurrency);
            
            cleanCosts.push(displayCleanCost);
            fouledCosts.push(displayFouledCost);
            fouledCostsLower.push(displayFouledLower);
            fouledCostsUpper.push(displayFouledUpper);
            co2Emissions.push(co2Extra);
        }
        
        // Update chart
        const ctx = document.getElementById("myChart");
        if (!ctx) {
            console.error("Chart canvas element not found");
            return;
        }

        if (myChart) {
            myChart.destroy();
            myChart = null;
        }

        myChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: speeds,
                datasets: [
                    {
                        label: 'Clean Hull (FR0)',
                        data: cleanCosts,
                        borderColor: 'rgba(30, 77, 120, 1)',
                        backgroundColor: 'rgba(30, 77, 120, 0.1)',
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y',
                        borderWidth: 2
                    },
                    {
                        label: `Fouled Hull (${frLabel})`,
                        data: fouledCosts,
                        borderColor: 'rgba(232, 119, 34, 1)',
                        backgroundColor: 'rgba(232, 119, 34, 0.1)',
                        fill: true,
                        tension: 0.4,
                        yAxisID: 'y',
                        borderWidth: 2
                    },
                    {
                        label: 'Confidence Interval',
                        data: fouledCostsUpper,
                        borderColor: 'rgba(232, 119, 34, 0.3)',
                        backgroundColor: 'rgba(232, 119, 34, 0.05)',
                        fill: '+1',
                        tension: 0.4,
                        yAxisID: 'y',
                        borderWidth: 0,
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        showLine: true
                    },
                    {
                        label: 'Confidence Lower',
                        data: fouledCostsLower,
                        borderColor: 'rgba(232, 119, 34, 0.3)',
                        backgroundColor: 'rgba(232, 119, 34, 0.05)',
                        fill: false,
                        tension: 0.4,
                        yAxisID: 'y',
                        borderWidth: 0,
                        pointRadius: 0,
                        pointHoverRadius: 0,
                        showLine: true
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
                        borderWidth: 2
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
                                // Hide confidence interval datasets from tooltip
                                if (ctx.dataset.label === 'Confidence Interval' || 
                                    ctx.dataset.label === 'Confidence Lower') {
                                    return null;
                                }
                                if (ctx.dataset.yAxisID === 'y1') {
                                    return `${ctx.dataset.label}: ${ctx.parsed.y.toFixed(1)} kg/hr`;
                                }
                                return `${ctx.dataset.label}: ${formatCurrency(ctx.parsed.y)}/hr`;
                            }
                        },
                        filter: function(tooltipItem) {
                            // Filter out confidence interval datasets
                            return tooltipItem.dataset.label !== 'Confidence Interval' && 
                                   tooltipItem.dataset.label !== 'Confidence Lower';
                        },
                        backgroundColor: 'rgba(26, 32, 44, 0.9)',
                        titleFont: {
                            size: 14,
                            weight: 'bold'
                        },
                        bodyFont: {
                            size: 13
                        },
                        padding: 12,
                        borderColor: 'rgba(203, 213, 224, 0.3)',
                        borderWidth: 1
                    },
                    legend: {
                        position: 'top',
                        align: 'start',
                        labels: {
                            boxWidth: 12,
                            padding: 15,
                            font: {
                                size: window.innerWidth < 768 ? 10 : 12
                            },
                            usePointStyle: true,
                            pointStyle: 'circle',
                            filter: function(legendItem) {
                                // Hide confidence interval datasets from legend
                                return legendItem.text !== 'Confidence Interval' && 
                                       legendItem.text !== 'Confidence Lower';
                            }
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
                                size: window.innerWidth < 768 ? 10 : 12
                            },
                            color: 'rgba(74, 85, 104, 1)'
                        },
                        grid: {
                            display: true,
                            color: 'rgba(226, 232, 240, 0.6)'
                        },
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                            font: {
                                size: window.innerWidth < 768 ? 8 : 10
                            },
                            color: 'rgba(74, 85, 104, 0.8)',
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
                                size: window.innerWidth < 768 ? 10 : 12
                            },
                            color: 'rgba(74, 85, 104, 1)'
                        },
                        beginAtZero: true,
                        ticks: {
                            font: {
                                size: window.innerWidth < 768 ? 8 : 10
                            },
                            color: 'rgba(74, 85, 104, 0.8)',
                            callback: function(value) {
                                return currencySymbols[currentCurrency] + value;
                            }
                        },
                        grid: {
                            color: 'rgba(226, 232, 240, 0.6)'
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
                                size: window.innerWidth < 768 ? 10 : 12
                            },
                            color: 'rgba(74, 85, 104, 1)'
                        },
                        beginAtZero: true,
                        grid: {
                            drawOnChartArea: false,
                            color: 'rgba(226, 232, 240, 0.6)'
                        },
                        ticks: {
                            font: {
                                size: window.innerWidth < 768 ? 8 : 10
                            },
                            color: 'rgba(74, 85, 104, 0.8)'
                        }
                    }
                }
            }
        });
        
        // Calculate results for display
        function calculateCostAt(speed) {
            // Use the alpha-beta model for base costs
            const { alpha, beta } = solveAlphaBeta(costEco, costFull, vessel.ecoSpeed, vessel.fullSpeed, 4.5);
            const baseCleanCost = alpha * Math.pow(speed, 3) + beta * Math.pow(speed, 4.5);
            
            // Simple empirical fouling model
            const foulingIncreases = [0, 0.15, 0.35, 0.60, 0.95, 1.93];
            const baseFoulingIncrease = foulingIncreases[frLevel] || 0;
            
            // Speed-dependent reduction factor
            // At low speeds (Fr < 0.15), full fouling impact
            // At high speeds (Fr > 0.35), fouling impact is reduced
            const Fr = speed * 0.514444 / Math.sqrt(9.81 * vessel.length);
            let speedReduction = 1.0;
            if (Fr > 0.15) {
                // Linear reduction from Fr 0.15 to 0.35
                speedReduction = Math.max(0.3, 1.0 - 2.0 * (Fr - 0.15));
            }
            
            // Apply fouling increase with speed reduction
            const effectiveFoulingIncrease = baseFoulingIncrease * speedReduction;
            const costFouledHr = baseCleanCost * (1 + effectiveFoulingIncrease);
            
            // Calculate fuel consumption for emissions - in base currency
            const fuelClean = baseCleanCost / fuelCostPerKg;
            const fuelFouled = costFouledHr / fuelCostPerKg;
            const extraFuel = fuelFouled - fuelClean;
            const extraCO2 = extraFuel * co2PerKgFuel;
            
            // Convert costs to display currency if needed
            const displayClean = currentCurrency === 'AUD' ? 
                baseCleanCost : 
                convertCurrency(baseCleanCost, 'AUD', currentCurrency);
                
            const displayFouled = currentCurrency === 'AUD' ? 
                costFouledHr : 
                convertCurrency(costFouledHr, 'AUD', currentCurrency);
            
            return {
                clean: displayClean,
                fouled: displayFouled,
                fuelClean: fuelClean,
                fuelFouled: fuelFouled,
                extraFuel: extraFuel,
                extraCO2: extraCO2,
                frictionIncrease: (effectiveFoulingIncrease * 100)
            };
        }
        
        const cEco = calculateCostAt(vessel.ecoSpeed);
        const cFull = calculateCostAt(vessel.fullSpeed);
        
        const increaseEco = ((cEco.fouled - cEco.clean) / cEco.clean * 100).toFixed(1);
        const increaseFull = ((cFull.fouled - cFull.clean) / cFull.clean * 100).toFixed(1);
        
        const extraCostFull = cFull.fouled - cFull.clean;
        const extraFuelFull = cFull.extraFuel;
        const extraCO2Full = cFull.extraCO2;
        
        // Annual impact calculation (assuming 12hr/day, 200 days/year operation)
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
        `;
        
        // Add validation badge if applicable
        if (vesselType === 'cruiseShip' && frLevel === 5) {
            resultsHtml += `
                <div class="validation-badge">
                    <i class="fas fa-check-circle"></i>
                    <span>FR5 impact validated by University of Melbourne Coral Adventurer study</span>
                </div>
            `;
        } else if (vesselType === 'tug' && frLevel === 4) {
            resultsHtml += `
                <div class="validation-badge">
                    <i class="fas fa-check-circle"></i>
                    <span>Fouling impact calibrated with University of Melbourne tugboat study</span>
                </div>
            `;
        }
        
        resultsHtml += `
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
                tickDot.style.backgroundColor = 'var(--primary)';
                tickDot.style.transform = 'scale(1.5)';
            } else {
                tickDot.style.backgroundColor = 'var(--neutral-500)';
                tickDot.style.transform = 'scale(1)';
            }
        });
    }

    function updateInputPlaceholders() {
        const vesselType = document.getElementById("vesselType").value;
        let vessel = vesselConfigs[vesselType];

        if (vesselType === 'custom') {
            // Generate default values for custom vessel
            const L = parseFloat(document.getElementById('customLength').value) || 50;
            const B = parseFloat(document.getElementById('customBeam').value) || 10;
            const T = parseFloat(document.getElementById('customDraft').value) || 4;
            const Cb = parseFloat(document.getElementById('customCb').value) || 0.65;
            const category = document.getElementById('vesselCategory').value;

            vessel = estimateVesselParameters(L, B, T, Cb, category);
        }

        const costEcoConverted = currentCurrency === 'AUD' ?
            vessel.costEco :
            convertCurrency(vessel.costEco, 'AUD', currentCurrency);

        const costFullConverted = currentCurrency === 'AUD' ?
            vessel.costFull :
            convertCurrency(vessel.costFull, 'AUD', currentCurrency);

        const costEcoInput = document.getElementById("costEco");
        const costFullInput = document.getElementById("costFull");

        if (!costEcoInput.value || vesselType === 'custom') {
            costEcoInput.value = Math.round(costEcoConverted);
        }

        if (!costFullInput.value || vesselType === 'custom') {
            costFullInput.value = Math.round(costFullConverted);
        }

        document.querySelectorAll('.help-text').forEach(helpText => {
            if (helpText.textContent.includes('fuel cost')) {
                helpText.textContent = helpText.textContent.replace(/[\$£]/g, currencySymbols[currentCurrency]);
            }
        });
    }

    // Event listeners
    document.getElementById("vesselType").addEventListener("change", function () {
        const vesselType = this.value;
        const customParams = document.getElementById('customVesselParams');
        const previousType = this.getAttribute('data-previous') || '';

        if (vesselType === 'custom') {
            customParams.style.display = 'block';
            updateCustomVesselCalculations();
        } else {
            customParams.style.display = 'none';
            const config = vesselConfigs[vesselType];
            
            // Only update costs if user hasn't manually edited them
            const costEcoInput = document.getElementById("costEco");
            const costFullInput = document.getElementById("costFull");
            
            // Check if we should update the values
            const shouldUpdate = !costEcoInput.hasAttribute('data-user-edited') || previousType === 'custom';
            
            if (shouldUpdate) {
                const costEcoConverted = currentCurrency === 'AUD' ?
                    config.costEco :
                    convertCurrency(config.costEco, 'AUD', currentCurrency);
                const costFullConverted = currentCurrency === 'AUD' ?
                    config.costFull :
                    convertCurrency(config.costFull, 'AUD', currentCurrency);

                costEcoInput.value = Math.round(costEcoConverted);
                costFullInput.value = Math.round(costFullConverted);
                
                // Remove the user-edited flag since we're setting defaults
                costEcoInput.removeAttribute('data-user-edited');
                costFullInput.removeAttribute('data-user-edited');
            }
        }
        
        // Store the current type as previous for next change
        this.setAttribute('data-previous', vesselType);

        updateCalculator();
    });

    // Custom vessel input listeners
    document.getElementById('customLength').addEventListener('input', function () {
        updateCustomVesselCalculations();
        updateInputPlaceholders();
        updateCalculator();
    });

    document.getElementById('customBeam').addEventListener('input', function () {
        updateCustomVesselCalculations();
        updateInputPlaceholders();
        updateCalculator();
    });

    document.getElementById('customDraft').addEventListener('input', function () {
        updateCustomVesselCalculations();
        updateInputPlaceholders();
        updateCalculator();
    });

    document.getElementById('customCb').addEventListener('input', function () {
        updateCustomVesselCalculations();
        updateInputPlaceholders();
        updateCalculator();
    });

    document.getElementById('vesselCategory').addEventListener('change', function () {
        updateInputPlaceholders();
        updateCalculator();
    });

    document.getElementById('customEcoSpeed').addEventListener("input", updateCalculator);
    document.getElementById('customFullSpeed').addEventListener("input", updateCalculator);

    document.getElementById("costEco").addEventListener("input", function() {
        this.setAttribute('data-user-edited', 'true');
        updateCalculator();
    });
    
    document.getElementById("costFull").addEventListener("input", function() {
        this.setAttribute('data-user-edited', 'true');
        updateCalculator();
    });

    document.getElementById("frSlider").addEventListener("input", updateCalculator);

    document.getElementById("currencySelect").addEventListener("change", function () {
        const newCurrency = this.value;
        const oldCurrency = currentCurrency;

        if (newCurrency === oldCurrency) return;

        const costEcoInput = parseFloat(document.getElementById("costEco").value) || 0;
        const costFullInput = parseFloat(document.getElementById("costFull").value) || 0;

        currentCurrency = newCurrency;

        if (costEcoInput > 0) {
            const convertedCostEco = convertCurrency(costEcoInput, oldCurrency, newCurrency);
            document.getElementById("costEco").value = Math.round(convertedCostEco);
        }

        if (costFullInput > 0) {
            const convertedCostFull = convertCurrency(costFullInput, oldCurrency, newCurrency);
            document.getElementById("costFull").value = Math.round(convertedCostFull);
        }

        updateInputPlaceholders();
        updateCalculator();
    });

    document.querySelectorAll('.range-tick').forEach(tick => {
        tick.addEventListener('click', function () {
            const value = this.getAttribute('data-value');
            document.getElementById('frSlider').value = value;
            updateCalculator();
        });
    });

    window.addEventListener('resize', function () {
        const chartContainer = document.querySelector('.chart-container');
        if (chartContainer && myChart) {
            setTimeout(() => {
                myChart.resize();
                updateCalculator();
            }, 100);
        } else {
            updateCalculator();
        }
    });

    // Initialize
    const initialVessel = vesselConfigs[document.getElementById("vesselType").value];
    document.getElementById("costEco").value = initialVessel.costEco;
    document.getElementById("costFull").value = initialVessel.costFull;
    updateInputPlaceholders();
    updateCalculator();

    window.calculatorInitialized = true;
}


// Handle messages from parent window
window.addEventListener('message', function (event) {
    if (event.data === 'showModal') {
        const modal = document.getElementById('cost-calculator-modal');
        if (modal) {
            modal.style.display = 'flex';
            if (!window.calculatorInitialized) {
                initHullFoulingCalculator();
            }
        }
    }
});

// Update close handlers to communicate with parent
function closeCalculatorModal() {
    const modal = document.getElementById('cost-calculator-modal');
    if (modal) {
        modal.style.display = 'none';
    }
    // Tell parent window to hide iframe
    if (window.parent !== window) {
        window.parent.postMessage('closeModal', '*');
    }
}