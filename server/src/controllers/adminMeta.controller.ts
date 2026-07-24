import type { Request, Response } from "express";
import { adminMetaService } from "../services/adminMeta.service";

const validTagTypes = ["STYLE", "COLOR", "VIEW", "TIME", "FEATURE"];

export const adminMetaController = {
  getCategories: async (_req: Request, res: Response) => {
    try {
      const categories = await adminMetaService.getCategories();

      res.json({
        success: true,
        count: categories.length,
        data: categories,
      });
    } catch {
      res.status(500).json({
        success: false,
        message: "Failed to get categories",
      });
    }
  },

  createCategory: async (req: Request, res: Response) => {
    try {
      const { name, description } = req.body;

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Category name is required",
        });
      }

      const category = await adminMetaService.createCategory(name, description);

      res.status(201).json({
        success: true,
        message: "Category created successfully",
        data: category,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create category",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  updateCategory: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { name, description } = req.body;

      if (Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category id",
        });
      }

      if (!name) {
        return res.status(400).json({
          success: false,
          message: "Category name is required",
        });
      }

      const category = await adminMetaService.updateCategory(
        id,
        name,
        description
      );

      res.json({
        success: true,
        message: "Category updated successfully",
        data: category,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update category",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  deleteCategory: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid category id",
        });
      }

      await adminMetaService.deleteCategory(id);

      res.json({
        success: true,
        message: "Category deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message:
          error instanceof Error ? error.message : "Failed to delete category",
      });
    }
  },

  getTags: async (_req: Request, res: Response) => {
    try {
      const tags = await adminMetaService.getTags();

      res.json({
        success: true,
        count: tags.length,
        data: tags,
      });
    } catch {
      res.status(500).json({
        success: false,
        message: "Failed to get tags",
      });
    }
  },

  createTag: async (req: Request, res: Response) => {
    try {
      const { name, type } = req.body;

      if (!name || !type) {
        return res.status(400).json({
          success: false,
          message: "Tag name and type are required",
        });
      }

      if (!validTagTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid tag type",
        });
      }

      const tag = await adminMetaService.createTag(name, type);

      res.status(201).json({
        success: true,
        message: "Tag created successfully",
        data: tag,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to create tag",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  updateTag: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);
      const { name, type } = req.body;

      if (Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid tag id",
        });
      }

      if (!name || !type) {
        return res.status(400).json({
          success: false,
          message: "Tag name and type are required",
        });
      }

      if (!validTagTypes.includes(type)) {
        return res.status(400).json({
          success: false,
          message: "Invalid tag type",
        });
      }

      const tag = await adminMetaService.updateTag(id, name, type);

      res.json({
        success: true,
        message: "Tag updated successfully",
        data: tag,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Failed to update tag",
        error: error instanceof Error ? error.message : String(error),
      });
    }
  },

  deleteTag: async (req: Request, res: Response) => {
    try {
      const id = Number(req.params.id);

      if (Number.isNaN(id)) {
        return res.status(400).json({
          success: false,
          message: "Invalid tag id",
        });
      }

      await adminMetaService.deleteTag(id);

      res.json({
        success: true,
        message: "Tag deleted successfully",
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to delete tag",
      });
    }
  },
};