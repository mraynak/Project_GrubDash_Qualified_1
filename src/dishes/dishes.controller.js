const path = require("path");

// Use the existing dishes data
const dishes = require(path.resolve("src/data/dishes-data"));

// Use this function to assign ID's when necessary
const nextId = require("../utils/nextId");

// TODO: Implement the /dishes handlers needed to make the tests pass

// Validators

//Does name exists

function nameExists(req, res, next) {
  const { data: {name} = {}} = req.body;
  if(name) {
    res.locals.name = name;
    next()
  }
  next({
    status: 400,
    message: "Dish must include a name"
  })
}

//Is name value valid

function isNameValid(req, res, next) {
  if(
    res.locals.name === null ||
    res.locals.name === "" ||
    res.locals.name === undefined
  ){
    next({
      status: 400, 
      message: "Dish must include a name"
    })
  }
  next()
}

//Does description exists

function descriptionExists(req, res, next) {
  const { data: {description} = {}} = req.body;
  if(description) {
    res.locals.description = description
    next()
  }
  next({
    status: 400,
    message: "Dish must include a description"
  })
}

//Is description valid
function isDescriptionValid(req, res, next) {
  if(
    res.locals.description === null ||
    res.locals.description === "" ||
    res.locals.description === undefined
  ) {
    next({
      status: 400,
      message: "Dish must include a description"
    })
  }
  next()
}

//Does price exists

function priceExists(req, res, next) {
  const { data: {price} = {}} = req.body;
  if(price) {
    res.locals.price = price
    next()
  }
  next({
    status: 400,
    message: "Dish must have a price that is an integer greater than 0"
  })
}

//Is price valid

function isPriceValid(req, res, next) {
  if(
    res.locals.price < 1 ||
    Number.isInteger(res.locals.price) === false
  ) {
    next({
      status: 400,
      message: "Dish must have a price that is an integer greater than 0"
    })
  }
  next()
}

//Does image exist

function imageExists(req, res, next) {
  const { data: {image_url} = {}} = req.body
  if(image_url) {
    res.locals.image_url = image_url
    next()
  }
  next({
    status: 400,
    message: "Dish must include a image_url"
  })
}

//Is image valid

function isImageValid(req, res, next) {
  if(
    res.locals.image_url === "" ||
    res.locals.image_url === undefined
  ) {
    next({
      status: 400,
      message: "Dish must include a image_url"
    })
  }
  next()
}

//Does dish exists

function dishExists(req, res, next) {
  const {dishId} = req.params;
  const foundDish = dishes.find((dish) => dish.id === dishId)
  if(foundDish) {
    res.locals.dish = foundDish
    next()
  }
  next({
    status: 404,
    message: `Dish does not exist: ${dishId}`
  })
}

function idsMatch(req, res, next) {
  const {dishId} = req.params;
  const { data: {id} } = req.body;
  if(id !== null && id !== undefined && id !== "" && dishId !== id) {
    next({
      status: 400,
      message: `Dish id does not match route id. Dish: ${id}, Route: ${dishId}`
    })
  }
  next()
}

// Handlers

function list(req, res) {
  res.json({ data: dishes })
}

function create(req, res, next) {
  const newId = nextId()
  const newDish = {
    id: newId,
    name: res.locals.name,
    description: res.locals.description,
    price: res.locals.price,
    image_url: res.locals.image_url
  }
  dishes.push(newDish)
  res.status(201).json({ data: newDish })
}

function read(req, res, next) {
  res.json({ data: res.locals.dish })
}

function update(req, res, next) {
  const dish = res.locals.dish
  const { data: { id, name, description, image_url, price } = {}} = req.body
  dish.id = id
  dish.name = name
  dish.description = description
  dish.image_url = image_url
  dish.price = price
  res.json({ data: dish })
}

module.exports = {
  list,
  create: [nameExists, isNameValid, descriptionExists, isDescriptionValid, priceExists, isPriceValid, imageExists, isImageValid, create],
  read: [dishExists, read],
  update: [dishExists, idsMatch, nameExists, isNameValid, descriptionExists, isDescriptionValid, priceExists, isPriceValid, imageExists, isImageValid, update]
}