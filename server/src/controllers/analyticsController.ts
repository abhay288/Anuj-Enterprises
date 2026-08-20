import { Request, Response } from 'express';
import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { Salesman } from '../models/Salesman.js';
import { Company } from '../models/Company.js';
import { Category } from '../models/Category.js';

export const getDashboardAnalytics = async (req: Request, res: Response) => {
  try {
    const { timeframe = '30d', startDate, endDate } = req.query;

    const dateFilter: any = {};
    const now = new Date();

    if (timeframe === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter.createdAt = { $gte: startOfDay };
    } else if (timeframe === '7d') {
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(now.getDate() - 7);
      dateFilter.createdAt = { $gte: sevenDaysAgo };
    } else if (timeframe === '30d') {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(now.getDate() - 30);
      dateFilter.createdAt = { $gte: thirtyDaysAgo };
    } else if (timeframe === '90d') {
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(now.getDate() - 90);
      dateFilter.createdAt = { $gte: ninetyDaysAgo };
    } else if (timeframe === 'month') {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      dateFilter.createdAt = { $gte: startOfMonth };
    } else if (startDate && endDate) {
      dateFilter.createdAt = {
        $gte: new Date(String(startDate)),
        $lte: new Date(String(endDate))
      };
    }

    // 1. Executive KPI Metrics (Direct count & state aggregations)
    const [
      totalOrders,
      pendingOrders,
      completedOrders,
      cancelledOrders,
      totalProducts,
      activeSalesmen,
      lowStockProducts,
      outOfStockProducts,
      inStockProducts
    ] = await Promise.all([
      Order.countDocuments(dateFilter),
      Order.countDocuments({ ...dateFilter, status: { $in: ['PENDING', 'PROCESSING', 'Pending', 'Processing'] } }),
      Order.countDocuments({ ...dateFilter, status: { $in: ['CONFIRMED', 'DELIVERED', 'INVOICED', 'Invoiced', 'Confirmed', 'Delivered'] } }),
      Order.countDocuments({ ...dateFilter, status: { $in: ['CANCELLED', 'Cancelled'] } }),
      Product.countDocuments({ status: 'Published' }),
      Salesman.countDocuments({ status: 'Active' }),
      Product.countDocuments({ stock: { $gt: 0, $lte: 20 } }),
      Product.countDocuments({ stock: 0 }),
      Product.countDocuments({ stock: { $gt: 20 } })
    ]);

    // 2. Order Volume Trend Aggregation
    const orderTrend = await Order.aggregate([
      { $match: Object.keys(dateFilter).length > 0 ? dateFilter : { createdAt: { $exists: true } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          ordersCount: { $sum: 1 },
          totalQuantity: { $sum: "$totalQuantity" },
          totalRevenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { _id: 1 } },
      {
        $project: {
          _id: 0,
          date: "$_id",
          ordersCount: 1,
          totalQuantity: 1,
          totalRevenue: 1
        }
      }
    ]);

    // 3. Category Analytics Aggregation
    const categoryAnalytics = await Order.aggregate([
      { $match: Object.keys(dateFilter).length > 0 ? dateFilter : { createdAt: { $exists: true } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.categoryName",
          ordersCount: { $sum: 1 },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.total" }
        }
      },
      { $sort: { totalQuantity: -1 } },
      {
        $project: {
          _id: 0,
          category: { $ifNull: ["$_id", "Food & Beverages"] },
          ordersCount: 1,
          totalQuantity: 1,
          totalRevenue: 1
        }
      }
    ]);

    // 4. Company / Brand Analytics Aggregation
    const companyAnalytics = await Order.aggregate([
      { $match: Object.keys(dateFilter).length > 0 ? dateFilter : { createdAt: { $exists: true } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.companyName",
          ordersCount: { $sum: 1 },
          totalQuantity: { $sum: "$items.quantity" },
          totalRevenue: { $sum: "$items.total" }
        }
      },
      { $sort: { totalQuantity: -1 } },
      {
        $project: {
          _id: 0,
          company: { $ifNull: ["$_id", "Amul"] },
          ordersCount: 1,
          totalQuantity: 1,
          totalRevenue: 1
        }
      }
    ]);

    // 5. Product Performance Aggregation (Top & Moving SKUs)
    const productPerformance = await Order.aggregate([
      { $match: Object.keys(dateFilter).length > 0 ? dateFilter : { createdAt: { $exists: true } } },
      { $unwind: "$items" },
      {
        $group: {
          _id: "$items.sku",
          productName: { $first: "$items.productName" },
          companyName: { $first: "$items.companyName" },
          totalQuantity: { $sum: "$items.quantity" },
          ordersCount: { $sum: 1 },
          totalRevenue: { $sum: "$items.total" }
        }
      },
      { $sort: { totalQuantity: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 0,
          sku: "$_id",
          name: "$productName",
          company: "$companyName",
          totalQuantity: 1,
          ordersCount: 1,
          totalRevenue: 1
        }
      }
    ]);

    // 6. Salesman Analytics Aggregation
    const salesmanAnalytics = await Order.aggregate([
      { $match: Object.keys(dateFilter).length > 0 ? dateFilter : { createdAt: { $exists: true } } },
      {
        $group: {
          _id: "$salesmanId",
          salesmanName: { $first: "$salesmanName" },
          ordersCount: { $sum: 1 },
          totalQuantity: { $sum: "$totalQuantity" },
          totalRevenue: { $sum: "$totalAmount" }
        }
      },
      { $sort: { totalQuantity: -1 } },
      {
        $project: {
          _id: 0,
          salesmanId: "$_id",
          name: "$salesmanName",
          ordersCount: 1,
          totalQuantity: 1,
          totalRevenue: 1
        }
      }
    ]);

    // 7. Critical Stock Risk Items
    const stockRiskProducts = await Product.find({ stock: { $lte: 20 } })
      .select('name sku companyName stock price packSize caseSize')
      .sort({ stock: 1 })
      .limit(10)
      .lean();

    return res.json({
      success: true,
      data: {
        kpis: {
          totalOrders,
          pendingOrders,
          completedOrders,
          cancelledOrders,
          totalProducts,
          activeSalesmen,
          lowStockProducts,
          outOfStockProducts,
          inStockProducts
        },
        orderTrend,
        categoryAnalytics,
        companyAnalytics,
        productPerformance,
        salesmanAnalytics,
        stockRiskProducts,
        timeframe
      },
      message: 'Business intelligence analytics retrieved successfully'
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

export const getInventoryAnalytics = async (req: Request, res: Response) => {
  try {
    const [total, inStock, lowStock, outOfStock, stockRisk] = await Promise.all([
      Product.countDocuments(),
      Product.countDocuments({ stock: { $gt: 20 } }),
      Product.countDocuments({ stock: { $gt: 0, $lte: 20 } }),
      Product.countDocuments({ stock: 0 }),
      Product.find({ stock: { $lte: 20 } }).select('name sku companyName stock price packSize').sort({ stock: 1 }).lean()
    ]);

    return res.json({
      success: true,
      data: { 
        total, 
        inStock, 
        lowStock, 
        outOfStock,
        stockRisk
      }
    });
  } catch (error: any) {
    return res.status(500).json({ success: false, message: error.message });
  }
};
