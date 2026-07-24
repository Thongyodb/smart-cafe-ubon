import { useEffect, useMemo, useState } from "react";
import {
  FaEdit,
  FaLayerGroup,
  FaPlus,
  FaSave,
  FaSearch,
  FaTags,
  FaTrash,
  FaTimes,
} from "react-icons/fa";
import {
  adminMetaService,
  type AdminCategoryItem,
  type AdminTagItem,
  type TagType,
} from "../../services/adminMetaService";

const tagTypes: TagType[] = ["STYLE", "COLOR", "VIEW", "TIME", "FEATURE"];

type CategoryForm = {
  id?: number;
  name: string;
  description: string;
};

type TagForm = {
  id?: number;
  name: string;
  type: TagType;
};

const emptyCategoryForm: CategoryForm = {
  name: "",
  description: "",
};

const emptyTagForm: TagForm = {
  name: "",
  type: "STYLE",
};

function AdminMetaPage() {
  const [categories, setCategories] = useState<AdminCategoryItem[]>([]);
  const [tags, setTags] = useState<AdminTagItem[]>([]);
  const [categorySearch, setCategorySearch] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const [categoryForm, setCategoryForm] =
    useState<CategoryForm>(emptyCategoryForm);
  const [tagForm, setTagForm] = useState<TagForm>(emptyTagForm);
  const [savingCategory, setSavingCategory] = useState(false);
  const [savingTag, setSavingTag] = useState(false);

  useEffect(() => {
    let isMounted = true;

    Promise.all([adminMetaService.getCategories(), adminMetaService.getTags()])
      .then(([categoryResult, tagResult]) => {
        if (isMounted) {
          setCategories(categoryResult.data);
          setTags(tagResult.data);
        }
      })
      .catch(() => {
        if (isMounted) {
          alert("โหลดข้อมูลหมวดหมู่/แท็กไม่สำเร็จ");
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const filteredCategories = useMemo(() => {
    const keyword = categorySearch.toLowerCase();

    return categories.filter((category) => {
      return (
        category.name.toLowerCase().includes(keyword) ||
        category.description?.toLowerCase().includes(keyword)
      );
    });
  }, [categories, categorySearch]);

  const filteredTags = useMemo(() => {
    const keyword = tagSearch.toLowerCase();

    return tags.filter((tag) => {
      return (
        tag.name.toLowerCase().includes(keyword) ||
        tag.type.toLowerCase().includes(keyword)
      );
    });
  }, [tags, tagSearch]);

  const resetCategoryForm = () => {
    setCategoryForm(emptyCategoryForm);
  };

  const resetTagForm = () => {
    setTagForm(emptyTagForm);
  };

  const handleSubmitCategory = async () => {
    if (!categoryForm.name.trim()) {
      alert("กรุณากรอกชื่อหมวดหมู่");
      return;
    }

    try {
      setSavingCategory(true);

      if (categoryForm.id) {
        const result = await adminMetaService.updateCategory(categoryForm.id, {
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim(),
        });

        setCategories((current) =>
          current.map((category) =>
            category.id === categoryForm.id ? result.data : category
          )
        );

        alert("แก้ไขหมวดหมู่สำเร็จ");
      } else {
        const result = await adminMetaService.createCategory({
          name: categoryForm.name.trim(),
          description: categoryForm.description.trim(),
        });

        setCategories((current) => [result.data, ...current]);

        alert("เพิ่มหมวดหมู่สำเร็จ");
      }

      resetCategoryForm();
    } catch {
      alert("บันทึกหมวดหมู่ไม่สำเร็จ อาจมีชื่อซ้ำหรือข้อมูลไม่ถูกต้อง");
    } finally {
      setSavingCategory(false);
    }
  };

  const handleEditCategory = (category: AdminCategoryItem) => {
    setCategoryForm({
      id: category.id,
      name: category.name,
      description: category.description ?? "",
    });
  };

  const handleDeleteCategory = async (category: AdminCategoryItem) => {
    if (category._count.cafes > 0) {
      alert("ไม่สามารถลบหมวดหมู่นี้ได้ เพราะมีคาเฟ่ใช้งานอยู่");
      return;
    }

    const confirmed = confirm(`ต้องการลบหมวดหมู่ "${category.name}" ใช่ไหม?`);

    if (!confirmed) {
      return;
    }

    try {
      await adminMetaService.deleteCategory(category.id);

      setCategories((current) =>
        current.filter((item) => item.id !== category.id)
      );

      alert("ลบหมวดหมู่สำเร็จ");
    } catch {
      alert("ลบหมวดหมู่ไม่สำเร็จ");
    }
  };

  const handleSubmitTag = async () => {
    if (!tagForm.name.trim()) {
      alert("กรุณากรอกชื่อแท็ก");
      return;
    }

    try {
      setSavingTag(true);

      if (tagForm.id) {
        const result = await adminMetaService.updateTag(tagForm.id, {
          name: tagForm.name.trim(),
          type: tagForm.type,
        });

        setTags((current) =>
          current.map((tag) => (tag.id === tagForm.id ? result.data : tag))
        );

        alert("แก้ไขแท็กสำเร็จ");
      } else {
        const result = await adminMetaService.createTag({
          name: tagForm.name.trim(),
          type: tagForm.type,
        });

        setTags((current) => [result.data, ...current]);

        alert("เพิ่มแท็กสำเร็จ");
      }

      resetTagForm();
    } catch {
      alert("บันทึกแท็กไม่สำเร็จ อาจมีชื่อซ้ำหรือข้อมูลไม่ถูกต้อง");
    } finally {
      setSavingTag(false);
    }
  };

  const handleEditTag = (tag: AdminTagItem) => {
    setTagForm({
      id: tag.id,
      name: tag.name,
      type: tag.type,
    });
  };

  const handleDeleteTag = async (tag: AdminTagItem) => {
    if (tag._count.cafeTags > 0) {
      alert("ไม่สามารถลบแท็กนี้ได้ เพราะมีคาเฟ่ใช้งานอยู่");
      return;
    }

    const confirmed = confirm(`ต้องการลบแท็ก "${tag.name}" ใช่ไหม?`);

    if (!confirmed) {
      return;
    }

    try {
      await adminMetaService.deleteTag(tag.id);

      setTags((current) => current.filter((item) => item.id !== tag.id));

      alert("ลบแท็กสำเร็จ");
    } catch {
      alert("ลบแท็กไม่สำเร็จ");
    }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header admin-page-header-row">
        <div>
          <span className="admin-eyebrow">Category & Tag Management</span>
          <h1>หมวดหมู่/แท็ก</h1>
          <p>จัดการหมวดหมู่คาเฟ่และแท็กที่ใช้สำหรับค้นหาและกรองข้อมูล</p>
        </div>

        <div className="admin-meta-summary">
          <div>
            <FaLayerGroup />
            <strong>{categories.length}</strong>
            <span>หมวดหมู่</span>
          </div>

          <div>
            <FaTags />
            <strong>{tags.length}</strong>
            <span>แท็ก</span>
          </div>
        </div>
      </div>

      <div className="admin-meta-grid">
        <section className="admin-section-card">
          <div className="admin-form-title">
            <div>
              <h2>{categoryForm.id ? "แก้ไขหมวดหมู่" : "เพิ่มหมวดหมู่"}</h2>
              <p>เช่น Cafe, Dessert</p>
            </div>

            {categoryForm.id && (
              <button
                className="admin-secondary-btn"
                type="button"
                onClick={resetCategoryForm}
              >
                <FaTimes />
                ยกเลิก
              </button>
            )}
          </div>

          <div className="admin-form-grid admin-form-grid-one">
            <label>
              ชื่อหมวดหมู่
              <input
                value={categoryForm.name}
                onChange={(event) =>
                  setCategoryForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="เช่น Cafe"
              />
            </label>

            <label>
              รายละเอียด
              <textarea
                value={categoryForm.description}
                onChange={(event) =>
                  setCategoryForm((current) => ({
                    ...current,
                    description: event.target.value,
                  }))
                }
                placeholder="รายละเอียดหมวดหมู่"
                rows={4}
              />
            </label>
          </div>

          <div className="admin-form-actions">
            <button
              className="admin-primary-btn"
              type="button"
              onClick={handleSubmitCategory}
              disabled={savingCategory}
            >
              {categoryForm.id ? <FaSave /> : <FaPlus />}
              {savingCategory
                ? "กำลังบันทึก..."
                : categoryForm.id
                ? "บันทึกหมวดหมู่"
                : "เพิ่มหมวดหมู่"}
            </button>
          </div>
        </section>

        <section className="admin-section-card">
          <div className="admin-form-title">
            <div>
              <h2>{tagForm.id ? "แก้ไขแท็ก" : "เพิ่มแท็ก"}</h2>
              <p>เช่น Minimal, Vintage, Garden, Morning</p>
            </div>

            {tagForm.id && (
              <button
                className="admin-secondary-btn"
                type="button"
                onClick={resetTagForm}
              >
                <FaTimes />
                ยกเลิก
              </button>
            )}
          </div>

          <div className="admin-form-grid admin-form-grid-one">
            <label>
              ชื่อแท็ก
              <input
                value={tagForm.name}
                onChange={(event) =>
                  setTagForm((current) => ({
                    ...current,
                    name: event.target.value,
                  }))
                }
                placeholder="เช่น Minimal"
              />
            </label>

            <label>
              ประเภทแท็ก
              <select
                value={tagForm.type}
                onChange={(event) =>
                  setTagForm((current) => ({
                    ...current,
                    type: event.target.value as TagType,
                  }))
                }
              >
                {tagTypes.map((type) => (
                  <option value={type} key={type}>
                    {type}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <div className="admin-form-actions">
            <button
              className="admin-primary-btn"
              type="button"
              onClick={handleSubmitTag}
              disabled={savingTag}
            >
              {tagForm.id ? <FaSave /> : <FaPlus />}
              {savingTag
                ? "กำลังบันทึก..."
                : tagForm.id
                ? "บันทึกแท็ก"
                : "เพิ่มแท็ก"}
            </button>
          </div>
        </section>
      </div>

      <div className="admin-meta-grid">
        <section className="admin-section-card">
          <div className="admin-table-toolbar">
            <div className="admin-search-box">
              <FaSearch />
              <input
                value={categorySearch}
                onChange={(event) => setCategorySearch(event.target.value)}
                placeholder="ค้นหาหมวดหมู่..."
              />
            </div>

            <span>{filteredCategories.length} รายการ</span>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>หมวดหมู่</th>
                  <th>คาเฟ่ที่ใช้</th>
                  <th>จัดการ</th>
                </tr>
              </thead>

              <tbody>
                {filteredCategories.map((category) => (
                  <tr key={category.id}>
                    <td>
                      <strong>{category.name}</strong>
                      <small className="admin-muted-block">
                        {category.description ?? "ไม่มีรายละเอียด"}
                      </small>
                    </td>

                    <td>{category._count.cafes}</td>

                    <td>
                      <div className="admin-action-group">
                        <button
                          className="admin-icon-btn"
                          type="button"
                          onClick={() => handleEditCategory(category)}
                        >
                          <FaEdit />
                        </button>

                        <button
                          className="admin-icon-btn danger"
                          type="button"
                          onClick={() => handleDeleteCategory(category)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredCategories.length === 0 && (
                  <tr>
                    <td colSpan={3}>
                      <div className="admin-empty-row">ไม่พบหมวดหมู่</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="admin-section-card">
          <div className="admin-table-toolbar">
            <div className="admin-search-box">
              <FaSearch />
              <input
                value={tagSearch}
                onChange={(event) => setTagSearch(event.target.value)}
                placeholder="ค้นหาแท็ก..."
              />
            </div>

            <span>{filteredTags.length} รายการ</span>
          </div>

          <div className="admin-table-wrapper">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>แท็ก</th>
                  <th>ประเภท</th>
                  <th>คาเฟ่ที่ใช้</th>
                  <th>จัดการ</th>
                </tr>
              </thead>

              <tbody>
                {filteredTags.map((tag) => (
                  <tr key={tag.id}>
                    <td>
                      <strong>{tag.name}</strong>
                    </td>

                    <td>
                      <span className="provider-pill">{tag.type}</span>
                    </td>

                    <td>{tag._count.cafeTags}</td>

                    <td>
                      <div className="admin-action-group">
                        <button
                          className="admin-icon-btn"
                          type="button"
                          onClick={() => handleEditTag(tag)}
                        >
                          <FaEdit />
                        </button>

                        <button
                          className="admin-icon-btn danger"
                          type="button"
                          onClick={() => handleDeleteTag(tag)}
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredTags.length === 0 && (
                  <tr>
                    <td colSpan={4}>
                      <div className="admin-empty-row">ไม่พบแท็ก</div>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}

export default AdminMetaPage;