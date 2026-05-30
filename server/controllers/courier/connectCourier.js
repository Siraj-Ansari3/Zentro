import Courier from "../../models/Courier.js";
import StoreCourierIntegration from "../../models/StoreCourierIntegration.js";

export const connectCourier = async (req, res) => {
  try {
    const {
      storeId,
      courier,

      // apiSecret,
      // accountNumber,
      // merchantId,
    } = req.body;

    const { apiKey } = req.body.credentials || {};
    console.log("API Key:", apiKey);
    console.log("Courier to connect:", courier);
    // ─────────────────────────────────────
    // VALIDATION
    // ─────────────────────────────────────

    if (!storeId || !courier || !apiKey) {
      return res.status(400).json({
        success: false,
        message: "storeId, courier and apiKey are required",
      });
    }

    const cleanCourierName = courier.trim();


    // ─────────────────────────────────────
    // CHECK COURIER EXISTS
    // ─────────────────────────────────────
    const existingCourier = await Courier.findOne({ name: cleanCourierName });
    // console.log(existingCourier)

    if (!existingCourier) {
      return res.status(404).json({
        success: false,
        message: "Courier not found",
      });
    }

    // ─────────────────────────────────────
    // UPSERT INTEGRATION
    // ─────────────────────────────────────

    const integration =
      await StoreCourierIntegration.findOneAndUpdate(
        {
          storeId,
          courierId: existingCourier._id,
        },
        {
          active: true,

          connectedAt: new Date(),

          credentials: {
            apiKey,
          },
        },
        {
          new: true,
          upsert: true,
        }
      );

    return res.status(200).json({
      success: true,
      message: `${existingCourier.name} connected successfully`,
      integration,
    });
  } catch (error) {

    return res.status(500).json({
      success: false,
      message: "Failed to connect courier",
      error: error.message,
    });
  }
};