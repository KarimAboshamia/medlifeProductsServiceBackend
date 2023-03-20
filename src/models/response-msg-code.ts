export enum ResponseMsgAndCode {
    // ERROR MSGs
    ERROR_EXIST_PRODUCT = 'This Product already exists! ## 409',
    ERROR_PRODUCT_BARCODE_EXIST_ALREADY = "There's already a product with the entered barcode! ## 409",
    ERROR_NO_PRODUCT_WITH_BARCODE = 'There is no product with this barcode! ## 404',
    ERROR_NO_PRODUCTS_FOUND = 'There is no products found! ## 404',
    ERROR_NO_BARCODE_PROVIDED = 'No barcode provided! ## 400',
    ERROR_NO_ENOUGH_IMAGES_TO_DELETE = "There's no enough images to delete, product should have at least one image! ## 400",

    // SUCCESS MSGs
    SUCCESS_CREATE_PRODUCT = 'Product Created Successfully ## 200',
    SUCCESS_FOUND_PRODUCT = 'Product Found Successfully ## 200',
    SUCCESS_FOUND_PRODUCTS = 'Products Found Successfully ## 200',
    SUCCESS_DELETE_PRODUCT = 'Product Deleted Successfully ## 200',
    SUCCESS_UPDATE_PRODUCT = 'Product Updated Successfully ## 200',
    SUCCESS_PRODUCT_CREATED = 'product created successfully! ## 200',
    SUCCESS_PHARMACY_PRODUCTS_DELETION = 'pharmacy products deleted successfully! ## 200',
    SUCCESS_FOUND_CATEGORIES = 'categories found successfully! ## 200',
}
