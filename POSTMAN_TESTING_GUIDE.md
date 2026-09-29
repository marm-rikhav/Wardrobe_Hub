# Wardrobe Hub — Postman API Testing Guides

The Postman testing documentation is split into separate, focused guides for each domain:

---

## 1. [Authentication & Core Backend Guide]
* **File**: [`POSTMAN_AUTH_GUIDE.md`]
* **Scope**: Phase 2 Authentication & Authorization
* **Endpoints Covered**:
  * User Registration (`POST /api/auth/register`)
  * Duplicate Email Rejection (409 Conflict)
  * Zod Validation Failure Tests (400 Bad Request)
  * User Login (`POST /api/auth/login`)
  * Invalid Password Handling (401 Unauthorized)
  * Current User Profile (`GET /api/auth/me`)
  * Token Refresh via HTTP-Only Cookie (`POST /api/auth/refresh`)
  * Admin Authorization Guard (`GET /api/auth/admin-check`)
  * User Logout & Cookie Clearing (`POST /api/auth/logout`)

---

## 2. [Catalog Backend Guide (Admin & Public)]
* **File**: [`POSTMAN_CATALOG_GUIDE.md`]
* **Scope**: Phase 3 Catalog (Admin & Public)
* **Endpoints Covered**:
  * **Category CRUD**: `POST`, `GET`, `PUT`, `DELETE` at `/api/admin/categories` and public `GET /api/categories`
  * **Subcategory CRUD**: `POST`, `GET`, `PUT`, `DELETE` at `/api/admin/subcategories` and public `GET /api/subcategories`
  * **Product & Variants CRUD**: Atomic creation (`POST /api/admin/products`), update, soft delete
  * **Dedicated Variant Stock Update**: `PUT /api/admin/products/:productId/variants/:variantId/stock`
  * **Cloudinary Product Image Uploads & 10 Test Cases**:
    1. Valid JPG under 2 MB (1200×1500 px)
    2. Valid JPEG under 2 MB
    3. Valid PNG under 2 MB
    4. Valid WebP under 2 MB
    5. Image larger than 2 MB rejection (400 Bad Request)
    6. Unsupported file type rejection (400 Bad Request)
    7. Invalid aspect ratio rejection (400 Bad Request)
    8. 6th image upload rejection (Max 5 images per product)
    9. Non-existent product rejection (404 Not Found)
    10. Non-admin customer user rejection (403 Forbidden)
  * **Public Product Search & Multi-Filters**: Keyword search, size, color, price range, sorting, pagination
  * **Public Product Detail by Slug**: Full product with category, active variants, and ordered images
