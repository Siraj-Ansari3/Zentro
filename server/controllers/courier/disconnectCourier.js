import Courier from "../../models/Courier.js";
import StoreCourierIntegration from "../../models/StoreCourierIntegration.js";

export const disconnectCourier = async (req, res) => {
  try {
    const { storeId, courier } = req.body;
   
    if (!storeId || !courier) {
      return res.status(400).json({
        success: false,
        message: "storeId and courier are required",
      });
    }

    const courierDoc = await Courier.findOne({
      name: courier,
    });

    await StoreCourierIntegration.findOneAndUpdate(
      {
        storeId,
        courierId: courierDoc._id,
      },
      {
        active: false,
      }
    );

    res.status(200).json({
      success: true,
      message: "Courier disconnected",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Failed to disconnect courier",
    });
  }
};