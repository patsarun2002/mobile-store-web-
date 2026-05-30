import prisma from "../utils/prisma";

export const ServiceService = {
  async createService(data: { name: string; price: number; remark: string }) {
    return prisma.service.create({
      data: {
        name: data.name,
        price: data.price,
        remark: data.remark,
        payDate: new Date(),
      },
    });
  },

  async listServices() {
    return prisma.service.findMany({
      orderBy: {
        payDate: "desc",
      },
    });
  },

  async updateService(
    serviceId: string,
    data: {
      name?: string;
      price?: number;
      remark?: string;
    },
  ) {
    return prisma.service.update({
      where: {
        id: serviceId,
      },
      data: {
        name: data.name,
        price: data.price,
        remark: data.remark,
      },
    });
  },

  async removeService(serviceId: string) {
    return prisma.service.delete({
      where: { id: serviceId },
    });
  },
};
