export enum ResponseMsgAndCode {
    // ERROR MSGs
    ERROR_FORBIDDEN = 'forbidden access rights! ## 403',
    ERROR_TOKEN_REQUIRED = 'token is required! ## 400',
    ERROR_EXIST_PRODUCT = 'This Product already exists! ## 409',
    ERROR_NO_PRODUCT_WITH_BARCODE = 'There is no product with this barcode! ## 404',
    ERROR_NO_PRODUCTS_FOUND = 'There is no products found! ## 404',
    ERROR_NO_BARCODE_PROVIDED = 'No barcode provided! ## 400',
    ERROR_INVALID_VERIFICATION_TOKEN = 'invalid or expired verification token, please login again! ## 401',
    ERROR_DELETE_IMAGE = 'error while deleting the image! ## 500',
    ERROR_UPLOAD_IMAGE = 'error while uploading the image! ## 500',
    ERROR_DELETE_PRODUCT_IMAGES = 'error while deleting the product images! ## 500',
    ERROR_GENERATE_IMAGE_URLS = 'error while generating the image urls! ## 500',
    // SUCCESS MSGs
    SUCCESS_REFRESH_TOKEN = 'token refreshed successfully ## 200',
    SUCCESS_CREATE_PRODUCT = 'Product Created Successfully ## 200',
    SUCCESS_FOUND_PRODUCT = 'Product Found Successfully ## 200',
    SUCCESS_FOUND_PRODUCTS = 'Products Found Successfully ## 200',
    SUCCESS_DELETE_PRODUCT = 'Product Deleted Successfully ## 200',
    SUCCESS_UPDATE_PRODUCT = 'Product Updated Successfully ## 200',
    SUCCESS_PRODUCT_CREATED = 'product created successfully! ## 200',
}
