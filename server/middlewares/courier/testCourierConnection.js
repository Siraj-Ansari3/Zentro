import axios from "axios";
import StoreCourierIntegration from "../../models/StoreCourierIntegration.js"; // assume you'll create this

export const testCourierConnection = async (req, res, next) => {
  try {
    const { storeId, courier } = req.body;
    const { apiKey } = req.body.credentials || {};
    //input validation
    if (!storeId) {
      return res.status(400).json({ message: "storeId is required" });
    }

    if (!apiKey) {
      return res.status(400).json({ message: "apiKey is required" });
    }
    if (!courier) {
      return res.status(400).json({ message: "courier is required" });
    }



    // 2. Track validity state outside the switch
    let isValid = false;

    // 2. test apiKey if it is correct or not
    switch (courier.toLowerCase()) {
      case "postex":

        try {
          const postexRes = await axios.get(
            "https://api.postex.pk/services/integration/api/order/v1/get-order-types",
            {
              headers: { token: apiKey },
            }
          );

          // PostEx returns statusCode as a string in the body [cite: 56]
          if (postexRes.status === 200 && postexRes.data.statusCode === "200") {
            isValid = true;
          }
        } catch (postexErr) {
          // Axios throws on 4xx/5xx responses. 
          // We catch it here so it doesn't trigger the outer catch block.
          console.warn("PostEx Auth Rejected:", postexErr?.response?.data || postexErr.message);
          isValid = false;
        }
        break;

      case "trax":
        // Handle Trax connection test
        break;

      case "leopard":
        // Handle Leopard connection test
        break;

      default:
        return res.status(400).json({
          message: `${courier} is an Unsupported courier for connection`,
        });
    }


    // 3. Validate response
    if (isValid) {
      return next();
    }

    return res.status(400).json({
      success: false,
      message: `Courier connection failed for ${courier}`,
    });

  } catch (err) {
   // 4. Cleaned up generic error messages
    console.error(`Generic test connection error for ${req.body.courier}:`, err.message);

    return res.status(500).json({
      success: false,
      message: "Internal server error while testing courier connection",
      error: err.message,
    });
  }
};