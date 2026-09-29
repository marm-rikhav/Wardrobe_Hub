# Postman Testing Guide — Catalog APIs (Phase 3: Admin & Public)

This guide provides end-to-end instructions for testing all **Category**, **Subcategory**, **Product**, **Product Image (Cloudinary)**, and **Public Catalog Search/Filtering** endpoints in Postman.

---

## 1. Prerequisites & Postman Setup

### Start the Backend Server
```bash
cd server
npm run dev
```
The server will start at:
```text
http://localhost:5000
```

### Postman Environment / Collection Variables
Set the following variables in your Postman Environment:
* `baseUrl`: `http://localhost:5000`
* `adminAccessToken`: *(access token of an ADMIN user, e.g. from `/api/auth/login`)*
* `customerAccessToken`: *(access token of a regular CUSTOMER user)*
* `categoryId`: *(captured from Step 1)*
* `subcategoryId`: *(captured from Step 2)*
* `productId`: *(captured from Step 3)*
* `variantId`: *(captured from Step 3)*

> **Important**: All Admin endpoints require the `Authorization` header:  
> `Authorization: Bearer {{adminAccessToken}}`

---

## 2. Overview of Catalog Endpoints

| # | Endpoint | Method | Role | Description |
|---|---|---|---|---|
| 1 | `/api/admin/categories` | `POST` | Admin | Create category |
| 2 | `/api/admin/categories` | `GET` | Admin | List all categories (including inactive) |
| 3 | `/api/admin/categories/:id` | `PUT` | Admin | Update category details / status |
| 4 | `/api/admin/categories/:id` | `DELETE` | Admin | Soft delete category (`isActive = false`) |
| 5 | `/api/categories` | `GET` | Public | List active categories with subcategories |
| 6 | `/api/admin/subcategories` | `POST` | Admin | Create subcategory under parent category |
| 7 | `/api/admin/subcategories` | `GET` | Admin | List subcategories |
| 8 | `/api/admin/subcategories/:id` | `PUT` | Admin | Update subcategory |
| 9 | `/api/admin/subcategories/:id` | `DELETE` | Admin | Soft delete subcategory (`isActive = false`) |
| 10 | `/api/subcategories` | `GET` | Public | List active subcategories (`?category=slugOrId`) |
| 11 | `/api/admin/products` | `POST` | Admin | Create product with multiple variants atomically |
| 12 | `/api/admin/products` | `GET` | Admin | List all products (with filters & pagination) |
| 13 | `/api/admin/products/:id` | `GET` | Admin | Get full product with all variants & images |
| 14 | `/api/admin/products/:id` | `PUT` | Admin | Update product fields and variants |
| 15 | `/api/admin/products/:id` | `DELETE` | Admin | Soft delete product & variants |
| 16 | `/api/admin/products/:productId/variants/:variantId/stock` | `PUT` | Admin | Dedicated variant stock update (`stock >= 0`) |
| 17 | `/api/admin/products/:productId/images` | `POST` | Admin | Upload image to Cloudinary (enforces 2MB / 5 images / 4:5 ratio) |
| 18 | `/api/admin/products/:productId/images/:imageId` | `DELETE` | Admin | Delete product image |
| 19 | `/api/products` | `GET` | Public | Search, multi-filter (category, size, color, price), sort, paginate |
| 20 | `/api/products/:slug` | `GET` | Public | Get public product detail with active variants & images |

---

## 3. Step-by-Step Requests

### 1. Create Category (Admin)
* **Method**: `POST`
* **URL**: `{{baseUrl}}/api/admin/categories`
* **Headers**:
  * `Authorization: Bearer {{adminAccessToken}}`
  * `Content-Type: application/json`
* **Body** (`raw` → `JSON`):
  ```json
  {
    "name": "Men's Apparel",
    "slug": "mens-apparel",
    "imageUrl": "https://example.com/mens-apparel.jpg"
  }
  ```
* **Postman Test Script**:
  ```javascript
  const res = pm.response.json();
  if (res.data && res.data.category) {
    pm.environment.set("categoryId", res.data.category.id);
  }
  ```
* **Expected Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Category created successfully",
    "data": {
      "category": {
        "id": "e8a1f810-749e-4e8c-8f19-33d32840ef91",
        "name": "Men's Apparel",
        "slug": "mens-apparel",
        "imageUrl": "https://example.com/mens-apparel.jpg",
        "isActive": true
      }
    }
  }
  ```

---

### 2. Create Subcategory (Admin)
* **Method**: `POST`
* **URL**: `{{baseUrl}}/api/admin/subcategories`
* **Headers**:
  * `Authorization: Bearer {{adminAccessToken}}`
  * `Content-Type: application/json`
* **Body** (`raw` → `JSON`):
  ```json
  {
    "categoryId": "{{categoryId}}",
    "name": "Shirts",
    "slug": "mens-shirts"
  }
  ```
* **Postman Test Script**:
  ```javascript
  const res = pm.response.json();
  if (res.data && res.data.subcategory) {
    pm.environment.set("subcategoryId", res.data.subcategory.id);
  }
  ```
* **Expected Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Subcategory created successfully",
    "data": {
      "subcategory": {
        "id": "b3c97d62-c07a-42aa-b80c-7b2c0199042b",
        "categoryId": "e8a1f810-749e-4e8c-8f19-33d32840ef91",
        "name": "Shirts",
        "slug": "mens-shirts",
        "isActive": true
      }
    }
  }
  ```

---

### 3. Create Product with Variants (Admin)
* **Method**: `POST`
* **URL**: `{{baseUrl}}/api/admin/products`
* **Headers**:
  * `Authorization: Bearer {{adminAccessToken}}`
  * `Content-Type: application/json`
* **Body** (`raw` → `JSON`):
  ```json
  {
    "subcategoryId": "{{subcategoryId}}",
    "name": "Classic Oxford Cotton Shirt",
    "slug": "classic-oxford-cotton-shirt",
    "description": "100% fine cotton shirt with button-down collar.",
    "brand": "Wardrobe Hub",
    "basePrice": 1499,
    "discountPrice": 1199,
    "variants": [
      {
        "sku": "OXF-WHT-M",
        "size": "M",
        "color": "White",
        "price": 1199,
        "stock": 15
      },
      {
        "sku": "OXF-WHT-L",
        "size": "L",
        "color": "White",
        "price": 1199,
        "stock": 10
      },
      {
        "sku": "OXF-BLU-M",
        "size": "M",
        "color": "Navy Blue",
        "stock": 8
      }
    ]
  }
  ```
* **Postman Test Script**:
  ```javascript
  const res = pm.response.json();
  if (res.data && res.data.product) {
    pm.environment.set("productId", res.data.product.id);
    if (res.data.product.variants && res.data.product.variants.length > 0) {
      pm.environment.set("variantId", res.data.product.variants[0].id);
    }
  }
  ```
* **Expected Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Product and variants created successfully",
    "data": {
      "product": {
        "id": "fbdbd2c4-e05d-4668-9089-71cda7b87583",
        "subcategoryId": "b3c97d62-c07a-42aa-b80c-7b2c0199042b",
        "name": "Classic Oxford Cotton Shirt",
        "slug": "classic-oxford-cotton-shirt",
        "basePrice": 1499,
        "discountPrice": 1199,
        "effectivePrice": 1199,
        "variants": [
          {
            "id": "a1b2c3d4-...",
            "sku": "OXF-WHT-M",
            "size": "M",
            "color": "White",
            "price": 1199,
            "effectivePrice": 1199,
            "stock": 15
          }
        ]
      }
    }
  }
  ```

---

### 4. Update Variant Stock (Admin)
* **Method**: `PUT`
* **URL**: `{{baseUrl}}/api/admin/products/{{productId}}/variants/{{variantId}}/stock`
* **Headers**:
  * `Authorization: Bearer {{adminAccessToken}}`
  * `Content-Type: application/json`
* **Body** (`raw` → `JSON`):
  ```json
  {
    "stock": 25
  }
  ```
* **Expected Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Variant stock updated successfully",
    "data": {
      "variant": {
        "id": "{{variantId}}",
        "stock": 25
      }
    }
  }
  ```

---

## 4. Product Image Uploads & Validation (Admin)

Product image upload endpoint:
`POST {{baseUrl}}/api/admin/products/:productId/images`

The backend strictly enforces:
1. **File Size**: Max 2 MB per image (files > 2 MB are rejected before Cloudinary upload).
2. **Formats**: `JPG`, `JPEG`, `PNG`, `WebP` only.
3. **Dimensions / Aspect Ratio**: Recommended `1200 × 1500 px` with approximately `4:5` aspect ratio (~15% tolerance: 0.68 - 0.92).
4. **Max 5 Images**: A product can have a maximum of 5 images. The 6th image is rejected before Cloudinary upload.
5. **Cloudinary Folder Structure**: Assets are automatically organized under `wardrobe-hub/products/{productId}`.
6. **Database Persistence**: The returned `secure_url` is stored in the `product_images` table with UUID format.

---

### 4.1 Test Case 1: Valid JPG under 2 MB
* **Method**: `POST`
* **URL**: `{{baseUrl}}/api/admin/products/{{productId}}/images`
* **Headers**: `Authorization: Bearer {{adminAccessToken}}`
* **Body** (`form-data`):
  * `image` (File): Select a valid `.jpg` image (e.g. 1200 × 1500 px, < 2 MB)
  * `color` (Text, optional): `White`
* **Expected Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Product image uploaded successfully",
    "data": {
      "image": {
        "id": "c1f7a16e-a342-4f9e-8356-6dd41050bc61",
        "productId": "{{productId}}",
        "imageUrl": "https://res.cloudinary.com/zi5mggbn/image/upload/v.../wardrobe-hub/products/{{productId}}/sample.jpg",
        "color": "White",
        "sortOrder": 0
      }
    }
  }
  ```

---

### 4.2 Test Case 2: Valid JPEG under 2 MB
* **Method**: `POST`
* **URL**: `{{baseUrl}}/api/admin/products/{{productId}}/images`
* **Headers**: `Authorization: Bearer {{adminAccessToken}}`
* **Body** (`form-data`):
  * `image` (File): Select a valid `.jpeg` image (< 2 MB, ~4:5 ratio)
  * `color` (Text, optional): `Navy Blue`
* **Expected Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Product image uploaded successfully",
    "data": {
      "image": {
        "id": "...",
        "productId": "{{productId}}",
        "imageUrl": "https://res.cloudinary.com/zi5mggbn/image/upload/v.../wardrobe-hub/products/{{productId}}/sample.jpg",
        "color": "Navy Blue",
        "sortOrder": 1
      }
    }
  }
  ```

---

### 4.3 Test Case 3: Valid PNG under 2 MB
* **Method**: `POST`
* **URL**: `{{baseUrl}}/api/admin/products/{{productId}}/images`
* **Headers**: `Authorization: Bearer {{adminAccessToken}}`
* **Body** (`form-data`):
  * `image` (File): Select a valid `.png` image (< 2 MB, ~4:5 ratio)
* **Expected Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Product image uploaded successfully",
    "data": {
      "image": {
        "id": "...",
        "productId": "{{productId}}",
        "imageUrl": "https://res.cloudinary.com/zi5mggbn/image/upload/v.../wardrobe-hub/products/{{productId}}/sample.png",
        "color": null,
        "sortOrder": 2
      }
    }
  }
  ```

---

### 4.4 Test Case 4: Valid WebP under 2 MB
* **Method**: `POST`
* **URL**: `{{baseUrl}}/api/admin/products/{{productId}}/images`
* **Headers**: `Authorization: Bearer {{adminAccessToken}}`
* **Body** (`form-data`):
  * `image` (File): Select a valid `.webp` image (< 2 MB, ~4:5 ratio)
* **Expected Response (`201 Created`)**:
  ```json
  {
    "success": true,
    "message": "Product image uploaded successfully",
    "data": {
      "image": {
        "id": "...",
        "productId": "{{productId}}",
        "imageUrl": "https://res.cloudinary.com/zi5mggbn/image/upload/v.../wardrobe-hub/products/{{productId}}/sample.webp",
        "color": null,
        "sortOrder": 3
      }
    }
  }
  ```

---

### 4.5 Test Case 5: Image Larger than 2 MB
* **Method**: `POST`
* **URL**: `{{baseUrl}}/api/admin/products/{{productId}}/images`
* **Headers**: `Authorization: Bearer {{adminAccessToken}}`
* **Body** (`form-data`):
  * `image` (File): Select an image file whose size exceeds 2 MB (e.g. 2.5 MB or larger).
* **Expected Response (`400 Bad Request`)**:
  ```json
  {
    "success": false,
    "message": "Image size exceeds the 2 MB limit. Maximum allowed size is 2 MB."
  }
  ```

---

### 4.6 Test Case 6: Unsupported File Type
* **Method**: `POST`
* **URL**: `{{baseUrl}}/api/admin/products/{{productId}}/images`
* **Headers**: `Authorization: Bearer {{adminAccessToken}}`
* **Body** (`form-data`):
  * `image` (File): Select an unsupported file type such as `.gif`, `.svg`, `.pdf`, or `.txt`.
* **Expected Response (`400 Bad Request`)**:
  ```json
  {
    "success": false,
    "message": "Unsupported file format. Only JPG, JPEG, PNG, and WebP images are allowed."
  }
  ```

---

### 4.7 Test Case 7: Invalid Aspect Ratio
* **Method**: `POST`
* **URL**: `{{baseUrl}}/api/admin/products/{{productId}}/images`
* **Headers**: `Authorization: Bearer {{adminAccessToken}}`
* **Body** (`form-data`):
  * `image` (File): Select an image with a non-4:5 aspect ratio (e.g. 1:1 square like 1000 × 1000 px, or landscape banner like 1920 × 1080 px).
* **Expected Response (`400 Bad Request`)**:
  ```json
  {
    "success": false,
    "message": "Invalid image aspect ratio (1.00:1). Images must have approximately a 4:5 aspect ratio (recommended 1200x1500 px)."
  }
  ```

---

### 4.8 Test Case 8: Uploading the 6th Image (Max 5 Exceeded)
* **Method**: `POST`
* **URL**: `{{baseUrl}}/api/admin/products/{{productId}}/images`
* **Headers**: `Authorization: Bearer {{adminAccessToken}}`
* **Body** (`form-data`):
  * `image` (File): Attempt to upload a 6th image after 5 images have already been uploaded for this product.
* **Expected Response (`400 Bad Request`)**:
  ```json
  {
    "success": false,
    "message": "A product can have a maximum of 5 images."
  }
  ```

---

### 4.9 Test Case 9: Non-Existent Product
* **Method**: `POST`
* **URL**: `{{baseUrl}}/api/admin/products/00000000-0000-0000-0000-000000000000/images`
* **Headers**: `Authorization: Bearer {{adminAccessToken}}`
* **Body** (`form-data`):
  * `image` (File): Select any valid image.
* **Expected Response (`404 Not Found`)**:
  ```json
  {
    "success": false,
    "message": "Product not found"
  }
  ```

---

### 4.10 Test Case 10: Non-Admin User (Forbidden)
* **Method**: `POST`
* **URL**: `{{baseUrl}}/api/admin/products/{{productId}}/images`
* **Headers**:
  * `Authorization: Bearer {{customerAccessToken}}` *(Token of a user with role `CUSTOMER`)*
* **Body** (`form-data`):
  * `image` (File): Select any valid image.
* **Expected Response (`403 Forbidden`)**:
  ```json
  {
    "success": false,
    "message": "Forbidden: Admin privileges required to access this resource"
  }
  ```

---

## 5. Public Product Catalog Requests

### 5.1 Public Product Search, Multi-Filters & Pagination
* **Method**: `GET`
* **URL Examples**:
  * **All active products with pagination**:
    `{{baseUrl}}/api/products?page=1&limit=10`
  * **Search by keyword (name or brand)**:
    `{{baseUrl}}/api/products?search=oxford`
  * **Filter by category**:
    `{{baseUrl}}/api/products?category=mens-apparel`
  * **Filter by variant size & color**:
    `{{baseUrl}}/api/products?size=M&color=White`
  * **Filter by price range**:
    `{{baseUrl}}/api/products?minPrice=1000&maxPrice=1300`
  * **Sort options** (`newest`, `price_asc`, `price_desc`):
    `{{baseUrl}}/api/products?sort=price_asc`
  * **Combined query**:
    `{{baseUrl}}/api/products?category=mens-apparel&size=M&minPrice=1000&maxPrice=1500&sort=price_asc&page=1&limit=10`
* **Expected Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Products fetched successfully",
    "data": {
      "products": [
        {
          "id": "fbdbd2c4-e05d-4668-9089-71cda7b87583",
          "name": "Classic Oxford Cotton Shirt",
          "slug": "classic-oxford-cotton-shirt",
          "basePrice": 1499,
          "discountPrice": 1199,
          "effectivePrice": 1199,
          "brand": "Wardrobe Hub",
          "subcategory": {
            "name": "Shirts",
            "category": { "name": "Men's Apparel" }
          },
          "variants": [ ... ],
          "images": [ ... ]
        }
      ],
      "pagination": {
        "page": 1,
        "limit": 10,
        "total": 1,
        "totalPages": 1,
        "hasNextPage": false,
        "hasPrevPage": false
      }
    }
  }
  ```

---

### 5.2 Public Product Detail by Slug
* **Method**: `GET`
* **URL**: `{{baseUrl}}/api/products/classic-oxford-cotton-shirt`
* **Headers**: None
* **Expected Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Product details fetched successfully",
    "data": {
      "product": {
        "id": "fbdbd2c4-e05d-4668-9089-71cda7b87583",
        "name": "Classic Oxford Cotton Shirt",
        "slug": "classic-oxford-cotton-shirt",
        "basePrice": 1499,
        "discountPrice": 1199,
        "effectivePrice": 1199,
        "subcategory": {
          "id": "b3c97d62-...",
          "name": "Shirts",
          "category": { "id": "e8a1f810-...", "name": "Men's Apparel" }
        },
        "variants": [ ... ],
        "images": [
          {
            "id": "c1f7a16e-...",
            "imageUrl": "https://res.cloudinary.com/zi5mggbn/image/upload/v.../wardrobe-hub/products/fbdbd2c4-e05d-4668-9089-71cda7b87583/sample.jpg",
            "color": "White",
            "sortOrder": 0
          }
        ]
      }
    }
  }
  ```

---

### 5.3 Soft Delete Product (Admin)
* **Method**: `DELETE`
* **URL**: `{{baseUrl}}/api/admin/products/{{productId}}`
* **Headers**:
  * `Authorization: Bearer {{adminAccessToken}}`
* **Expected Response (`200 OK`)**:
  ```json
  {
    "success": true,
    "message": "Product and its variants deactivated successfully"
  }
  ```
* **Verify**: Calling `GET /api/products/classic-oxford-cotton-shirt` now returns `404 Not Found`.
