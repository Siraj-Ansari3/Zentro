import axios from "axios";
import StoreCourierIntegration from "../../models/StoreCourierIntegration.js"; // assume you'll create this

export const testPostExConnection = async (req, res) => {
  try {
    const { storeId, apiKey } = req.body;

    if (!storeId) {
      return res.status(400).json({ message: "storeId is required" });
    }

    if (!apiKey) {
      return res.status(400).json({ message: "apiKey is required" });
    }

    // 1. Get stored credentials for this store
    const integration = await StoreCourierIntegration.findOne({
      storeId,
      courier: "postex",
    });

    if (integration) {
      return res.status(400).json({
        message: "PostEx is already connected for this store",
      });
    }

    // 2. Call PostEx test API
    const response = await axios.get(
      "https://api.postex.pk/services/integration/api/order/v1/get-order-types",
      {
        headers: {
          token: apiKey,
        },
      }
    );

    // 3. Validate response
    if (response.status === 200) {
      return res.status(200).json({
        success: true,
        message: "PostEx connection successful",
        data: response.data,
      });
    }

    return res.status(400).json({
      success: false,
      message: "PostEx connection failed",
    });
  } catch (err) {
    console.error("PostEx test error:", err?.response?.data || err.message);

    return res.status(500).json({
      success: false,
      message: "Failed to test PostEx connection",
      error: err?.response?.data || err.message,
    });
  }
};