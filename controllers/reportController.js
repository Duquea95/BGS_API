const Report = require("../models/Report")

const getAnalytics = async (req, res) => {
    try {
        // Attempt to find the most recent report
        let report = await Report.findOne().sort({ createdAt: -1 });

        if (!report) {
            // No report found, create a new one with default values
            console.log('No existing report found, creating a new one.');

            const newReport = await Report.create({
                totalInvestors: 0,
                totalTransactions: 0,
                totalPurchased: 0,
                totalInventory: 0,
                totalSold: 0,
                initialInvestment: 0,
                totalFunding: 0,
                cashInventoryHeld: 0,
                cashOnHand: 0,
                netProfitLoss: 0,
            });

            console.log('New report created:', newReport);

            return res.status(200).json(newReport);
        } else {
            // Existing report found
            console.log('Found existing report:', report);

            return res.status(200).json(report);
        }
    } catch (error) {
        console.error('Error fetching or creating report:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getAnalytics,
}