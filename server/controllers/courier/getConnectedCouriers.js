import StoreCourierIntegration from "../../models/StoreCourierIntegration.js";

export const getConnectedCouriers = async (req, res) => {
  try {
    const storeId = req.storeId;
    // return res.status(200).json({ storeId: storeId });

    const connectedCouriers = await StoreCourierIntegration.find({
      storeId,
      active: true,
    }).populate({
      path: 'courierId',
      select: 'name',
    });

    res.json(connectedCouriers);
  } catch (error) {
    console.error('Error fetching connected couriers:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};