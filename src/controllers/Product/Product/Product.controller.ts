/** @format */

import { Request, Response } from "express";
import { ParamsDictionary } from "express-serve-static-core";
import { ParsedQs } from "qs";

import { BaseController } from "./../../BaseController";
import { CurrencyType, Product, IUser, IProduct } from "./../../../models";
import {
  fetchSkus,
  FetchSkuReturn,
  generateCode,
  generateStock,
} from "../../../functions";

export class ProductController extends BaseController {
  private static populates =
    "type line brand variants sizes sales price_changes stock.variant stock.sizes";

  public async create(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const validation = [];
    if (req.body._id) validation.push("!_id");
    if (!req.body.title) validation.push("title");
    if (!req.body.description) validation.push("description");
    if (!req.body.type) validation.push("type");
    if (!req.body.line) validation.push("line");
    if (!req.body.brand) validation.push("brand");
    if (!req.body.variants || typeof req.body.variants !== "object")
      validation.push("variants[]");
    if (!req.body.sizes || typeof req.body.variants !== "object")
      validation.push("sizes[]");
    if (!req.body.price) validation.push("price");
    if (
      !req.body.currency ||
      !Object.values(CurrencyType).includes(req.body.currency)
    )
      validation.push("currency");
    if (req.body.stock) validation.push("!stock");
    if (req.body.code) validation.push("!code");

    const _user = (req.user as IUser)._id;
    if (!_user) validation.push("session invalid");

    if (validation.length !== 0)
      return res
        .status(400)
        .send({ error: { validation: validation.toLocaleString() } });

    try {
      const skus: FetchSkuReturn = await fetchSkus({
        brands: [req.body.brand],
        types: [req.body.type],
        lines: [req.body.line],
        variants: req.body.variants,
        sizes: req.body.sizes,
      });

      const code = await generateCode(skus.brands[0]);

      const stock = generateStock(
        req.body.variants,
        req.body.sizes,
        code,
        skus
      );

      let product = await Product.create({
        ...req.body,
        code,
        stock,
        _user,
      });

      product = await Product.findById(product._id).populate(
        ProductController.populates
      );

      return res.status(201).send(product);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
  public async read(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req.params.id;

    try {
      const product = await Product.findById(id).populate(
        ProductController.populates
      );
      return product
        ? res.status(200).send(product)
        : res.status(404).send({ error: "not found" });
    } catch (error) {
      return res.status(400).send(error);
    }
  }
  public async read_all(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const query: Partial<IProduct> = {};

    for (const index in req.query)
      query[index] =
        typeof req.query === "object" // is Array
          ? {
              $in: req.query[index],
            }
          : req.query[index];

    try {
      const products = await Product.find(query).populate(
        ProductController.populates
      );
      return res.status(200).send(products);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
  public async update(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req.params?.id;

    const validation = [];
    if (req.body._id) validation.push("!_id");
    if (req.body.stock) validation.push("!stock");
    if (req.body.code) validation.push("!code");

    if (validation.length !== 0)
      return res
        .status(400)
        .send({ error: { validation: validation.toLocaleString() } });

    try {
      let product = await Product.findById(id);
      for (const record in req.body) product[record] = req.body[record];
      product = await product.save();
      product = await Product.findById(id).populate(
        ProductController.populates
      );
      return res.status(200).send(product);
    } catch (error) {
      return res.status(400).send(error);
    }
  }
  public async delete(
    req: Request<ParamsDictionary, any, any, ParsedQs, Record<string, any>>,
    res: Response<any, Record<string, any>>
  ) {
    const id = req.params?.id;

    try {
      const product = await Product.findById(id);
      product._deleted = false;
      await product.save();
      return res.status(200).send({ message: "success" });
    } catch (error) {
      return res.status(400).send(error);
    }
  }
}

export const productController = new ProductController();
