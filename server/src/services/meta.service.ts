import { metaRepository } from "../repositories/meta.repository";

export const metaService = {
  getFilters: async () => {
    return metaRepository.getFilters();
  },
};