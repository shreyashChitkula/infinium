const Insurance = require('../models/Insurance');
const { v4: uuidv4 } = require('uuid');

const samplePlans = [
    {
        id: uuidv4(),
        name: 'Basic Health Coverage',
        type: 'BASIC',
        premium: 200.00,
        coverage: 100000.00,
        features: {
            medicalCoverage: true,
            emergencyServices: true,
            prescriptionDrugs: true,
            annualCheckup: true
        },
        maxDiscount: 15
    },
    {
        id: uuidv4(),
        name: 'Premium Health Plan',
        type: 'PREMIUM',
        premium: 350.00,
        coverage: 250000.00,
        features: {
            medicalCoverage: true,
            emergencyServices: true,
            prescriptionDrugs: true,
            annualCheckup: true,
            specialistConsultations: true,
            mentalHealth: true,
            preventiveCare: true,
            wellnessPrograms: true
        },
        maxDiscount: 25
    },
    {
        id: uuidv4(),
        name: 'Family Coverage',
        type: 'FAMILY',
        premium: 500.00,
        coverage: 500000.00,
        features: {
            medicalCoverage: true,
            emergencyServices: true,
            prescriptionDrugs: true,
            annualCheckup: true,
            specialistConsultations: true,
            mentalHealth: true,
            preventiveCare: true,
            wellnessPrograms: true,
            maternityBenefits: true,
            dentalAndVision: true,
            familyCheckups: true
        },
        maxDiscount: 30
    }
];

async function initializeInsurancePlans() {
    try {
        // Initialize tables
        await Insurance.initialize();
        
        // Add sample plans
        for (const plan of samplePlans) {
            await Insurance.createPlan(plan);
        }
        
        console.log('Insurance plans initialized successfully');
    } catch (error) {
        console.error('Error initializing insurance plans:', error);
    }
}

module.exports = { initializeInsurancePlans };