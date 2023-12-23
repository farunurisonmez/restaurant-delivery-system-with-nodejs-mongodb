const { parse } = require('url');
import parseRequestBody from '../utils/parseRequestBody'
import Restaurant from '../models/restaurant.model';

const handleRestaurantRoutes = async (req:any, res:any) => {

  const { pathname, query } = parse(req.url, true);

  if (req.method === 'GET' && pathname === '/api/restaurants') {
    const { page = 1, pageSize = 2 } = query;
    const skip = (Number(page) - 1) * Number(pageSize);

try {
  // Restoranları puan ortalamasına göre sırala ve sayfalama ile getir
  const sortedRestaurants = await Restaurant.aggregate([
    {
      $addFields: {
        averageRating: { $avg: '$ratings' }, // 'ratings' alanını kullanmanız gerekiyor
      },
    },
    { $sort: { averageRating: -1 } },
    { $skip: skip },
    { $limit: Number(pageSize) },
  ]);

  const totalRestaurants = await Restaurant.countDocuments();
  const totalPages = Math.ceil(totalRestaurants / Number(pageSize));

  const nextPage = page < totalPages ? `/api/restaurants?page=${Number(page) + 1}&pageSize=${pageSize}` : null;

  const response = {
    page: Number(page),
    pageSize: Number(pageSize),
    totalPages,
    restaurants: sortedRestaurants,
    nextPage,
  };

  res.writeHead(200, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(response));

} catch (error) {
  console.error(error);
  res.writeHead(500, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Internal Server Error' }));
}
  } else if (req.method === 'POST' && pathname === '/api/restaurants') {
    try{
        const requestBody = await parseRequestBody(req);
        const createdRestaurant = await Restaurant.create(requestBody);
        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(createdRestaurant));
    }
    catch(error: any) {
        if (error.name === 'ValidationError') {
            res.statusCode = 400;            
            const errorMessages = Object.values(error.errors).map((error: any) => {
              return {
                path: error.path,
                message: error.message
              };
            });
            res.end(JSON.stringify(errorMessages));
          } else {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
          }
    }
  } else if (req.method === 'GET' && pathname.startsWith('/api/restaurants/')) {

    const restaurantId = pathname.split('/').pop();
    res.end(JSON.stringify({ message: `Restaurant details for restaurant ID ${restaurantId}` }));
  } else {
    res.statusCode = 404;
  }
};

module.exports = handleRestaurantRoutes;