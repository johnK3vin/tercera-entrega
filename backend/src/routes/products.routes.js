import { Router } from "express";
import { passportError, authorization } from "../utils/messageError.js";
import { productController } from "../controllers/product.controller.js";

const productRouter = Router();

productRouter.get('/', passportError('jwt'), authorization(['user','admin']), productController.getProducts)
productRouter.get('/:id', passportError('jwt'), authorization(['user','admin']), productController.getProduct)
productRouter.put('/:code', passportError('jwt'), authorization(['user','admin']), productController.updateProduct)
productRouter.delete('/:id', passportError('jwt'), authorization(['user','admin']), productController.deleteProduct)
productRouter.post('/', passportError('jwt'), authorization(['user','admin']), productController.createProduct)

export default productRouter;