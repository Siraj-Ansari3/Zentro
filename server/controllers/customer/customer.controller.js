import Customer from "../../models/Customer.js";

export const getCustomers = async (req, res) => {
  try {
    const storeId = req.storeId;

    // 1. Extract optional query parameters
    const {
      page = 1,
      limit = 20,
      search = "",
      riskLevel,
      isBlacklisted,
      sortBy = "createdAt",
      sortOrder = "desc" // 'asc' or 'desc'
    } = req.query;

    // 2. Build the MongoDB Query Object
    const query = { storeId };

    // Search by Name, Phone, or Email (Case-insensitive)
    if (search) {
      query.$or = [
        { fullName: { $regex: search, $options: "i" } },
        { phone: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } }
      ];
    }

    // Filter by Risk Level (low, medium, high)
    if (riskLevel) {
      query.riskLevel = riskLevel;
    }

    // Filter by Blacklist status
    if (isBlacklisted !== undefined) {
      query.isBlacklisted = isBlacklisted === "true"; 
    }

    // 3. Setup Pagination & Sorting
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const sortOptions = { [sortBy]: sortOrder === "desc" ? -1 : 1 };

    // 4. Execute Queries in Parallel for Maximum Speed
    // .lean() strips heavy Mongoose wrapper objects, making read operations significantly faster
    const [customers, totalCustomers] = await Promise.all([
      Customer.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(parseInt(limit))
        .lean(), 
      Customer.countDocuments(query)
    ]);

    // 5. Send Response
    return res.status(200).json({
      success: true,
      data: {
        customers,
        pagination: {
          total: totalCustomers,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(totalCustomers / parseInt(limit)),
        }
      }
    });

  } catch (error) {
    console.error("Fetch Customers Error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching customers",
      error: error.message
    });
  }
};