import { adminMetaRepository } from "../repositories/adminMeta.repository";

type TagType = "STYLE" | "COLOR" | "VIEW" | "TIME" | "FEATURE";

export const adminMetaService = {
  getCategories: async () => {
    return adminMetaRepository.findCategories();
  },

  createCategory: async (name: string, description?: string | null) => {
    return adminMetaRepository.createCategory({
      name: name.trim(),
      description: description?.trim() || null,
    });
  },

  updateCategory: async (
    id: number,
    name: string,
    description?: string | null
  ) => {
    const category = await adminMetaRepository.findCategoryById(id);

    if (!category) {
      throw new Error("Category not found");
    }

    return adminMetaRepository.updateCategory(id, {
      name: name.trim(),
      description: description?.trim() || null,
    });
  },

  deleteCategory: async (id: number) => {
    const category = await adminMetaRepository.findCategoryById(id);

    if (!category) {
      throw new Error("Category not found");
    }

    if (category._count.cafes > 0) {
      throw new Error("Cannot delete category because it is being used by cafes");
    }

    return adminMetaRepository.deleteCategory(id);
  },

  getTags: async () => {
    return adminMetaRepository.findTags();
  },

  createTag: async (name: string, type: TagType) => {
    return adminMetaRepository.createTag({
      name: name.trim(),
      type,
    });
  },

  updateTag: async (id: number, name: string, type: TagType) => {
    const tag = await adminMetaRepository.findTagById(id);

    if (!tag) {
      throw new Error("Tag not found");
    }

    return adminMetaRepository.updateTag(id, {
      name: name.trim(),
      type,
    });
  },

  deleteTag: async (id: number) => {
    const tag = await adminMetaRepository.findTagById(id);

    if (!tag) {
      throw new Error("Tag not found");
    }

    if (tag._count.cafeTags > 0) {
      throw new Error("Cannot delete tag because it is being used by cafes");
    }

    return adminMetaRepository.deleteTag(id);
  },
};