import prisma from "../utils/prisma";

export const CompanyService = {
  async createOrUpdateCompany(data: {
    name: string;
    address: string;
    phone: string;
    email: string;
    taxCode: string;
  }) {
    const payload = {
      name: data.name,
      address: data.address,
      phone: data.phone,
      email: data.email ?? "",
      taxCode: data.taxCode,
    };

    const existingCompany = await prisma.company.findFirst();

    if (existingCompany) {
      return prisma.company.update({
        where: { id: existingCompany.id },
        data: payload,
      });
    } else {
      return prisma.company.create({
        data: payload,
      });
    }
  },

  async getCompany() {
    return prisma.company.findFirst();
  },
};
