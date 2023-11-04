import { cartModel } from "../dao/models/carts.models.js";
import { prodModel } from "../dao/models/product.models.js";

export const getCarts = async (res, req) => {
  const { limit } = req.query;
  try {
    const cart = await cartModel.find().limit(limit);
    res.status(200).send({ respuesta: "ok", mensaje: cart });
  } catch (error) {
    res.status(400).send({ respues: "Error", mensaje: error });
  }
};

export const getCart = async (req, res) => {
  const { id } = req.params;
  console.log("id", id);
  try {
    const cart = await cartModel.findById(id);
    if (cart) res.status(200).send({ respuesta: "ok", mensaje: cart });
    else
      res.status(404).send({ respuesta: "Error", mensaje: "Cart not found" });
  } catch (error) {
    res.status(400).send({ respuesta: "Error", mensaje: error });
  }
};

export const createCartLogic = async () => {
  try {
    console.log("Creating cart");
    const cart = await cartModel.create({});
    console.log("Cart created: ", cart);
    return cart;
  } catch (error) {
    console.log("error created", error);
    throw error;
  }
};

export const createCart = async (req, res) => {
  try {
    const cart = await createCartLogic();
    return res.status(201).send({ respuesta: "ok", mensaje: cart });
  } catch (error) {
    console.log("error created", error);
    res.status(400).send({ respuesta: "Error", mensaje: error });
  }
};

export const cleanCart = async (req, res) => {
  const { id } = req.params;
  try {
    const cart = await cartModel.findById(id);
    if (cart) {
      cart.products = [];
      await cart.save();
      res.status(200).send({ respuesta: "ok", mensaje: cart });
    } else
      res.status(404).send({ respuesta: "Error", mensaje: "Cart not found" });
  } catch (error) {
    res.status(400).send({ respuesta: "Error", mensaje: error });
  }
};

export const addOrUpdateProductInCart = async (req, res) => {
  const { cid, pid } = req.params;
  const { quantity } = req.body;

  try {
    const cart = await cartModel.findById(cid);
    if (cart) {
      const product = await prodModel.findById(pid);
      if (product) {
        const index = cart.products.findIndex(
          (prod) => prod.id_prod._id.toString() === pid
        );
        if (index !== -1) {
          cart.products[index].quantity = quantity;
        } else {
          cart.products.push({ id_prod: pid, quantity: quantity });
        }
        await cart.save();
        res.status(200).send({ respuesta: "ok", mensaje: cart });
      } else
        res
          .status(404)
          .send({ respuesta: "Error", mensaje: "Product not found" });
    } else
      res.status(404).send({ respuesta: "Error", mensaje: "Cart not found" });
  } catch (error) {
    res
      .status(error.message.includes("not found") ? 404 : 400)
      .send({ respuesta: "Error", mensaje: error.message });
  }
};

export const removeProductbyId = async (req, res) => {
  const { cid, pid } = req.params;
  try {
    const cart = await cartModel.findById(cid);
    if (cart) {
      const product = await prodModel.findById(pid);
      if (product) {
        const index = cart.products.findIndex(
          (prod) => prod.id_prod._id.toString() === pid
        );
        if (index !== -1) {
          cart.products.splice(index, 1);
          await cart.save();
          res.status(200).send({ respuesta: "ok", mensaje: cart });
        } else {
          res
            .status(404)
            .send({
              respuesta: "Error",
              mensaje: `Product ${pid} not found in the cart ${cid}`,
            });
        }
      } else
        res
          .status(404)
          .send({ respuesta: "Error", mensaje: "Product not found" });
    } else
      res.status(404).send({ respuesta: "Error", mensaje: "Cart not found" });
  } catch (error) {
    res.status(400).send({ respuesta: "Error", mensaje: error });
  }
};

export const updateCartWithProducts = async (req, res) => {
  const { cid } = req.params;
  const { products } = req.body;
  try {
    const cart = await cartModel.findById(cid);
    if (!cart) {
      throw new Error("Cart not found");
    }
    for (let prod of products) {
      // Verifica si el producto ya existe en el carrito
      const index = cart.products.findIndex(
        (cartProduct) => cartProduct.id_prod._id.toString() === prod.id_prod
      );
      if (index !== -1) {
        // Si ya existe, actualizamos la cantidad
        cart.products[index].quantity = prod.quantity;
      } else {
        // Si no existe, primero validamos que el producto exista en la base de datos
        const exists = await prodModel.findById(prod.id_prod);
        if (!exists) {
          throw new Error(`Product with ID ${prod.id_prod} not found`);
        }
        // Añade el producto al carrito
        cart.products.push(prod);
      }
    }
    await cart.save();
    res
      .status(200)
      .send({ respuesta: "OK", mensaje: "Cart updated successfully" });
  } catch (error) {
    res.status(400).send({ respuesta: "Error", mensaje: error });
  }
};

export const cartController = {
  getCarts,
  getCart,
  createCart,
  cleanCart,
  addOrUpdateProductInCart,
  removeProductbyId,
  updateCartWithProducts,
};
