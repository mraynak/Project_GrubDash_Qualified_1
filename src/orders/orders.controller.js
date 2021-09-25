const path = require("path");

// Use the existing order data
const orders = require(path.resolve("src/data/orders-data"));

// Use this function to assigh ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /orders handlers needed to make the tests pass

//Validators

function deliverToExists(req, res, next) {
  const {data: {deliverTo} ={}} = req.body
  if(deliverTo) {
    res.locals.deliverTo = deliverTo
    next()
  }
  next({
    status: 400,
    message: "Order must include a deliverTo"
  })
}

function deliverToIsValid(req, res, next) {
  if(
    res.locals.deliverTo === "" ||
    res.locals.deliverTo === null ||
    res.locals.deliverTo === undefined
  ) {
    next({
      status: 400,
      message: "Order must include a deliverTo"
    })
  }
  next()
}

function mobileNumExists(req, res, next) {
  const { data: {mobileNumber} = {}} = req.body;
  if(mobileNumber) {
    res.locals.mobileNumber = mobileNumber
    next()
  }
  next({
    status: 400,
    message: "Order must include a mobileNumber"
  })
}

function mobileNumIsValid(req, res, next) {
  if(
    res.locals.mobileNumber === null ||
    res.locals.mobileNumber === "" ||
    res.locals.mobileNumber === undefined
  ) {
    next({
      status: 400,
      message: "Order must include a mobileNumber"
    })
  }
  next()
}

function dishesExists(req, res, next) {
  const { data: {dishes} = {}} = req.body;
  if(dishes) {
    res.locals.dishes = dishes
    next()
  }
  next({
    status: 400,
    message: "Order must include a dish"
  })
}

function dishesIsValid(req, res, next) {
  if(
    res.locals.dishes.length === 0 ||
    Array.isArray(res.locals.dishes) === false
  ) {
    next({
      status: 400,
      message: "Order must include at least one dish"
    })
  }
  next()
}

function quantityExists(req, res, next) {
  const dishes = res.locals.dishes
  dishes.map((dish, index) => {
    if (
      !dish.quantity ||
      !Number.isInteger(dish.quantity) ||
      !dish.quantity > 0
    ) {
      return next({
        status: 400,
        message: `Dish ${index} must have a quantity that is an integer greater than 0.`,
      });
    }
  })
  next()
}

function orderExists(req, res, next) {
  const { orderId } = req.params;
  const foundOrder = orders.find((order) => order.id === orderId)
  if(foundOrder) {
    res.locals.order = foundOrder
    next()
  }
  next({
    status: 404, 
    message: `Order id not found: ${orderId}`
  })
}

function idsMatch(req, res, next) {
  const {orderId} = req.params;
  const { data: {id} } = req.body;
  if(id !== null && id !== undefined && id !== "" && orderId !== id) {
    next({
      status: 400,
      message: `Order id does not match route id. Order: ${id}, Route: ${orderId}`
    })
  }
  next()
}

function statusExists(req, res, next) {
  const { data: {status} ={}} = req.body
  if(status && status !== "" && (status === "pending" || status === "preparing" || status === "out-for-delivery")) {
    res.locals.status = status
    next()
  }
  next({
    status: 400,
    message: "Order must have a status of pending, preparing, out-for-delivery, delivered"
  })
}

function deliveryStatus(req, res, next) {
  if(
  res.locals.status == "delivered"
  ) {
    next({
      status: 400,
      message: "A delivered order cannot be changed"
    })
  }
  next()
}

function pendingStatus(req, res, next) {
  const foundOrder = res.locals.order
  if(foundOrder.status == "pending") {
    next()
  }
    next({
    status: 400,
    message: "An order cannot be deleted unless it is pending"
  })
}
//Handlers

function list(req, res) {
  res.json({ data: orders})
}

function create(req, res, next) {
  const { data: {status, dishes} ={}} = req.body
  const newId = nextId()
  const newOrder = {
    id: newId,
    deliverTo: res.locals.deliverTo,
    mobileNumber: res.locals.mobileNumber,
    status: status,
    dishes: dishes
  }
  orders.push(newOrder)
  res.status(201).json({ data: newOrder })
}

function read(req, res, next) {
  res.json({ data: res.locals.order})
}

function update(req, res, next) {
  const order = res.locals.order
  const { data: { deliverTo, mobileNumber, status, dishes } = {}} = req.body
  order.deliverTo = deliverTo
  order.mobileNumber = mobileNumber
  order.status = status
  order.dishes = dishes
  res.json({ data: order })
}

function destroy(req, res) {
  const { orderId } = req.params;
  const index = orders.findIndex((order) => order.id === orderId)
  orders.splice(index, 1)
  res.sendStatus(204)
}

module.exports = {
  list,
  create: [deliverToExists, deliverToIsValid, mobileNumExists, mobileNumIsValid, dishesExists, dishesIsValid, quantityExists, create],
  read: [orderExists, read],
  update: [orderExists, idsMatch, deliverToExists, deliverToIsValid, mobileNumExists, mobileNumIsValid, deliveryStatus, statusExists, dishesExists, dishesIsValid, quantityExists, update],
  delete: [orderExists, pendingStatus, destroy]
}

