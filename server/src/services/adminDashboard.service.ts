import { adminDashboardRepository } from "../repositories/adminDashboard.repository";

export const adminDashboardService = {
  getDashboardStats: async () => {
    return adminDashboardRepository.getStats();
  },
};