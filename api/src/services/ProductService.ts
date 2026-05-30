import prisma from "../utils/prisma";
import { Prisma, ProductStatus } from "@prisma/client";

export const ProductService = {
  async createProduct(data: {
    serial: string;
    name: string;
    release: string;
    color: string;
    price: number;
    costPrice: number;
    customerName: string;
    customerPhone: string;
    customerAddress: string;
    remark: string;
    qty: number;
  }) {
    if (data.qty > 10000) {
      throw new Error("Quantity exceeds limit");
    }

    const BATCH_SIZE = 500;
    const batches = Math.ceil(data.qty / BATCH_SIZE);
    type ProductData = {
      serial: string;
      name: string;
      release: string;
      color: string;
      price: number;
      costPrice: number;
      customerName: string;
      customerPhone: string;
      customerAddress: string;
      remark: string;
    };

    const allProducts: ProductData[] = [];

    for (let batch = 0; batch < batches; batch++) {
      const startIdx = batch * BATCH_SIZE;
      const endIdx = Math.min(startIdx + BATCH_SIZE, data.qty);
      const products: ProductData[] = [];

      for (let i = startIdx; i < endIdx; i++) {
        const uniqueSerial = `${data.serial}-${String(i + 1).padStart(4, "0")}`;
        products.push({
          serial: uniqueSerial,
          name: data.name,
          release: data.release,
          color: data.color,
          price: data.price,
          costPrice: data.costPrice || 0,
          customerName: data.customerName,
          customerPhone: data.customerPhone,
          customerAddress: data.customerAddress,
          remark: data.remark ?? "",
        });
      }

      // Use transaction for each batch
      await prisma
        .$transaction(async (tx: any) => {
          await tx.product.createMany({
            data: products,
          });
        })
        .catch((error) => {
          if (
            error instanceof Prisma.PrismaClientKnownRequestError &&
            error.code === "P2002"
          ) {
            const duplicateSerial = products.map((p) => p.serial).join(", ");
            throw new Error(`Serial ซ้ำในระบบ: ${duplicateSerial}`);
          }
          throw error;
        });

      allProducts.push(...products);
    }

    return allProducts;
  },

  async listProducts(filters?: {
    search?: string;
    status?: string;
    color?: string;
    release?: string;
    serial?: string;
  }) {
    const where: Prisma.ProductWhereInput = {
      status: {
        not: "delete" as ProductStatus,
      },
    };

    if (filters?.serial) {
      where.serial = { contains: filters.serial };
    } else if (filters?.search) {
      where.OR = [
        { serial: { contains: filters.search } },
        { name: { contains: filters.search } },
        { customerName: { contains: filters.search } },
        { customerPhone: { contains: filters.search } },
      ];
    }

    if (filters?.status && filters.status !== "all") {
      where.status = filters.status as ProductStatus;
    }

    if (filters?.color && filters.color !== "all") {
      where.color = filters.color;
    }

    if (filters?.release && filters.release !== "all") {
      where.release = filters.release;
    }

    return prisma.product.findMany({
      orderBy: { id: "desc" },
      where,
      select: {
        id: true,
        serial: true,
        name: true,
        release: true,
        color: true,
        price: true,
        costPrice: true,
        status: true,
        customerName: true,
        customerPhone: true,
        customerAddress: true,
        remark: true,
        createdAt: true,
      },
    });
  },

  async updateProduct(
    productId: string,
    data: {
      serial?: string;
      name?: string;
      release?: string;
      color?: string;
      price?: number;
      costPrice?: number;
      customerName?: string;
      customerPhone?: string;
      customerAddress?: string;
      remark?: string;
    },
  ) {
    return prisma.product.update({
      where: { id: productId },
      data: {
        serial: data.serial,
        name: data.name,
        release: data.release,
        color: data.color,
        price: data.price,
        costPrice: data.costPrice !== undefined ? data.costPrice : undefined,
        customerName: data.customerName,
        customerPhone: data.customerPhone,
        customerAddress: data.customerAddress,
        remark: data.remark ?? "",
      },
    });
  },

  async removeProduct(productId: string) {
    // Check if product has pending sells before soft-delete
    const pendingSells = await prisma.sell.count({
      where: {
        productId,
        status: "pending",
      },
    });

    if (pendingSells > 0) {
      throw new Error("Cannot delete product with pending sells");
    }

    return prisma.product.update({
      where: { id: productId },
      data: { status: "delete" },
    });
  },

  async getProductBySerial(serial: string) {
    return prisma.product.findFirst({
      where: {
        serial: serial,
        status: "instock",
      },
    });
  },

  async getLowStockCount(threshold: number = 5) {
    const count = await prisma.product.count({
      where: {
        status: "instock",
      },
    });

    // Since each product is a unique serial, we consider low stock as total count below threshold
    // In a real scenario, you might want to track by product model instead
    return { count, isLow: count < threshold };
  },
};
