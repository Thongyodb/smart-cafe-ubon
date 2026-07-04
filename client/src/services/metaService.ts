import { axiosClient } from "../api/axiosClient";
import type { Category, District, Tag } from "../types/cafe";

export type FilterData = {
  categories: Category[];
  districts: District[];
  tags: Tag[];
};

export type FilterResponse = {
  success: boolean;
  data: FilterData;
};

export const metaService = {
  getFilters: async () => {
    const response = await axiosClient.get<FilterResponse>("/meta/filters");
    return response.data;
  },
};