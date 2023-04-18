export enum ResponseMsgAndCode {
    // ERROR MSGs
    ERROR_EXIST_PRODUCT = 'This Product already exists! ## 409',
    ERROR_PRODUCT_BARCODE_EXIST_ALREADY = "There's already a product with the entered barcode! ## 409",
    ERROR_NO_PRODUCT_WITH_BARCODE = 'There is no product with this barcode! ## 404',
    ERROR_NO_PRODUCT_WITH_ID = "there's no product with the entered id! ## 404",
    ERROR_NO_PRODUCTS_FOUND = 'There is no products found! ## 404',
    ERROR_NO_BARCODE_PROVIDED = 'No barcode provided! ## 400',
    ERROR_NO_ENOUGH_IMAGES_TO_DELETE = "There's no enough images to delete, product should have at least one image! ## 400",
    ERROR_NO_ENOUGH_PHARMACY_PRODUCT_AMOUNT = "there's no enough amount for a selected product! ## 409",
    ERROR_PHARMACY_HAS_ENOUGH_PRODUCT_AMOUNT_ALREADY = 'this pharmacy already has enough amount of the product that you want to be notified when it becomes available ## 400',
    ERROR_PHARMACIES_HAVE_ENOUGH_PRODUCT_AMOUNT_ALREADY = "there're already some pharmacies have enough amount of the product that you want to be notified when it becomes available ## 400",

    // SUCCESS MSGs
    SUCCESS_CREATE_PRODUCT = 'Product Created Successfully ## 200',
    SUCCESS_FOUND_PRODUCT = 'Product Found Successfully ## 200',
    SUCCESS_FOUND_PRODUCTS = 'Products Found Successfully ## 200',
    SUCCESS_DELETE_PRODUCT = 'Product Deleted Successfully ## 200',
    SUCCESS_UPDATE_PRODUCT = 'Product Updated Successfully ## 200',
    SUCCESS_PRODUCT_CREATED = 'product created successfully! ## 200',
    SUCCESS_PHARMACY_PRODUCTS_DELETION = 'pharmacy products deleted successfully! ## 200',
    SUCCESS_PHARMACY_PRODUCTS_FETCHED = 'products fetched successfully! ## 200',
    SUCCESS_FOUND_CATEGORIES = 'categories found successfully! ## 200',
    SUCCESS_PRODUCTS_PHARMACIES_FETCHED = 'the pharmacies of the products fetched successfully! ## 200',
    SUCCESS_PHARMACY_PRODUCTS_AMOUNT_REDUCED = 'products amount reduced successfully! ## 200',
    SUCCESS_NOTIFY_WHEN_AVAILABLE_CREATION = 'notify when available request created successfully! ## 200',
}
