import { axiosClient } from "../api/axiosClient";

export type AdminCategoryItem = {
  id: number;
  name: string;
  description?: string | null;
  createdAt: string;
  updatedAt: string;
  _count: {
    cafes: number;
  };
};

export type TagType = "STYLE" | "COLOR" | "VIEW" | "TIME" | "FEATURE";

export type AdminTagItem = {
  id: number;
  name: string;
  type: TagType;
  createdAt: string;
  updatedAt: string;
  _count: {
    cafeTags: number;
  };
};

type CategoryListResponse = {
  success: boolean;
  count: number;
  data: AdminCategoryItem[];
};

type TagListResponse = {
  success: boolean;
  count: number;
  data: AdminTagItem[];
};

type CategoryResponse = {
  success: boolean;
  message: string;
  data: AdminCategoryItem;
};

type TagResponse = {
  success: boolean;
  message: string;
  data: AdminTagItem;
};

export const adminMetaService = {
  getCategories: async () => {
    const response = await axiosClient.get<CategoryListResponse>(
      "/admin-meta/categories"
    );

    return response.data;
  },

  createCategory: async (data: { name: string; description?: string }) => {
    const response = await axiosClient.post<CategoryResponse>(
      "/admin-meta/categories",
      data
    );

    return response.data;
  },

  updateCategory: async (
    id: number,
    data: { name: string; description?: string }
  ) => {
    const response = await axiosClient.put<CategoryResponse>(
      `/admin-meta/categories/${id}`,
      data
    );

    return response.data;
  },

  deleteCategory: async (id: number) => {
    const response = await axiosClient.delete(`/admin-meta/categories/${id}`);
    return response.data;
  },

  getTags: async () => {
    const response = await axiosClient.get<TagListResponse>("/admin-meta/tags");
    return response.data;
  },

  createTag: async (data: { name: string; type: TagType }) => {
    const response = await axiosClient.post<TagResponse>(
      "/admin-meta/tags",
      data
    );

    return response.data;
  },

  updateTag: async (id: number, data: { name: string; type: TagType }) => {
    const response = await axiosClient.put<TagResponse>(
      `/admin-meta/tags/${id}`,
      data
    );

    return response.data;
  },

  deleteTag: async (id: number) => {
    const response = await axiosClient.delete(`/admin-meta/tags/${id}`);
    return response.data;
  },
};