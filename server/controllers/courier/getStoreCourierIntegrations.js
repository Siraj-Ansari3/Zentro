import StoreCourierIntegration from "../../models/StoreCourierIntegration.js";

export const getStoreCourierIntegrations = async (req, res) => {
    try {
        const { storeId } = req.query;
        console.log("Fetching courier integrations for storeId:", storeId);

        const integrations = await StoreCourierIntegration.find({
            storeId,
            active: true,
        })
            .populate("courierId", "name");

        return res.status(200).json({
            success: true,
            integrations,
        });

    } catch (error) {
        console.log("Error fetching courier integrations:", error);
        return res.status(500).json({
            success: false,
            message: "Failed to fetch integrations",
        });
    }
};