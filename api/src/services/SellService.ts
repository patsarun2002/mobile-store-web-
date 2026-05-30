import prisma from "../utils/prisma";

export const SellService = {
  async createSell(
    serial: string,
    price: number,
    paymentMethod: string = "cash",
    customerInfo?: { name?: string; phone?: string; address?: string },
  ) {
    return prisma.$transaction(async (tx: any) => {
      const product = await tx.product.findFirst({
        where: {
          serial: serial,
          status: "instock",
        },
      });

      if (!product) {
        throw new Error("Product not found");
      }

      // Update product status immediately to prevent race condition
      await tx.product.update({
        where: { id: product.id },
        data: { status: "reserved" },
      });

      return tx.sell.create({
        data: {
          productId: product.id,
          price: price,
          status: "pending",
          paymentMethod: paymentMethod as
            | "cash"
            | "transfer"
            | "credit_card"
            | "installment",
          customerName: customerInfo?.name,
          customerPhone: customerInfo?.phone,
          customerAddress: customerInfo?.address,
        },
      });
    });
  },

  async listSells() {
    const sells = await prisma.sell.findMany({
      where: {
        status: "pending",
        product: {
          status: {
            not: "delete",
          },
        },
      },
      orderBy: {
        id: "desc",
      },
      select: {
        product: {
          select: {
            serial: true,
            name: true,
          },
        },
        id: true,
        price: true,
        customerName: true,
        customerPhone: true,
      },
    });
    return sells;
  },

  async removeSell(sellId: string) {
    return prisma.$transaction(async (tx: any) => {
      const sell = await tx.sell.findUnique({
        where: { id: sellId },
        include: { product: true },
      });

      if (!sell) {
        throw new Error("Sell not found");
      }

      // Revert product status if it's still pending
      if (sell.status === "pending" && sell.product.status === "reserved") {
        await tx.product.update({
          where: { id: sell.productId },
          data: { status: "instock" },
        });
      }

      return tx.sell.delete({
        where: { id: sellId },
      });
    });
  },

  async confirmSells() {
    return prisma.$transaction(async (tx: any) => {
      const sells = await tx.sell.findMany({
        where: {
          status: "pending",
          product: {
            status: { not: "delete" }, // Filter out deleted products
          },
        },
        select: {
          id: true,
          productId: true,
          customerName: true,
          customerPhone: true,
          customerAddress: true,
        },
      });

      const sellIds = sells.map((s: any) => s.id);

      // Update each product with customer info and status
      for (const sell of sells) {
        await tx.product.update({
          where: { id: sell.productId },
          data: {
            status: "sold",
            customerName: sell.customerName || "",
            customerPhone: sell.customerPhone || "",
            customerAddress: sell.customerAddress || "",
          },
        });
      }

      // Update sells to paid status
      await tx.sell.updateMany({
        where: { id: { in: sellIds } },
        data: { status: "paid", payDate: new Date() },
      });

      return { confirmedSells: sells, failedSells: [] };
    });
  },

  async getDashboardStats() {
    const [
      paidIncome,
      pendingIncome,
      countRepair,
      countPaidSell,
      countPendingSell,
      soldProductsWithCost,
    ] = await Promise.all([
      prisma.sell.aggregate({
        _sum: {
          price: true,
        },
        where: {
          status: "paid",
        },
      }),
      prisma.sell.aggregate({
        _sum: {
          price: true,
        },
        where: {
          status: "pending",
        },
      }),
      prisma.service.count(),
      prisma.sell.count({
        where: {
          status: "paid",
        },
      }),
      prisma.sell.count({
        where: {
          status: "pending",
        },
      }),
      prisma.sell.findMany({
        where: {
          status: "paid",
        },
        include: {
          product: {
            select: {
              costPrice: true,
            },
          },
        },
      }),
    ]);

    // Calculate total cost and profit
    const totalCost = soldProductsWithCost.reduce(
      (sum, sell) => sum + (sell.product.costPrice || 0),
      0,
    );
    const totalIncome = paidIncome._sum.price || 0;
    const totalProfit = totalIncome - totalCost;
    const profitMargin = totalCost > 0 ? (totalProfit / totalCost) * 100 : 0;

    return {
      totalIncome,
      pendingIncome: pendingIncome._sum.price || 0,
      totalRepair: countRepair,
      totalSale: countPaidSell,
      pendingSale: countPendingSell,
      totalCost,
      totalProfit,
      profitMargin,
      // Add combined metric for clarity
      totalProjectedIncome: totalIncome + (pendingIncome._sum.price || 0),
      totalAllSales: countPaidSell + countPendingSell,
    };
  },

  async getRevenueByMonth() {
    const sells = await prisma.sell.findMany({
      where: {
        status: "paid",
        payDate: {
          not: null,
        },
      },
      select: {
        price: true,
        payDate: true,
      },
    });

    const monthlyRevenue: { [key: string]: number } = {};

    sells.forEach((sell: any) => {
      if (sell.payDate) {
        const date = new Date(sell.payDate);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
        monthlyRevenue[monthKey] = (monthlyRevenue[monthKey] || 0) + sell.price;
      }
    });

    const months = [
      "มกราคม",
      "กุมภาพันธ์",
      "มีนาคม",
      "เมษายน",
      "พฤษภาคม",
      "มิถุนายน",
      "กรกฎาคม",
      "สิงหาคม",
      "กันยายน",
      "ตุลาคม",
      "พฤศจิกายน",
      "ธันวาคม",
    ];
    const currentYear = new Date().getFullYear();

    return months.map((month, index) => {
      const monthKey = `${currentYear}-${String(index + 1).padStart(2, "0")}`;
      return {
        month: month,
        income: monthlyRevenue[monthKey] || 0,
      };
    });
  },

  async getTodaySales() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const [todayIncome, todayCount] = await Promise.all([
      prisma.sell.aggregate({
        _sum: {
          price: true,
        },
        where: {
          status: "paid",
          payDate: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
      prisma.sell.count({
        where: {
          status: "paid",
          payDate: {
            gte: today,
            lt: tomorrow,
          },
        },
      }),
    ]);

    return {
      income: todayIncome._sum.price || 0,
      count: todayCount,
    };
  },
};
