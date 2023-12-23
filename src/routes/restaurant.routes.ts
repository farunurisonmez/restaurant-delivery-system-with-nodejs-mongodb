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
            console.log(error)
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
          }
    }
  } else if (req.method === 'GET' && pathname.startsWith('/api/restaurants/')) {
    const restaurantId = pathname.split('/').pop();
    res.end(JSON.stringify({ message: `Restaurant details for restaurant ID ${restaurantId}` }));
  } else if (req.method === 'GET' && pathname.startsWith('/api/nearby-restaurants')){
    try{
      const nearbyRestaurants = await Restaurant.aggregate([
        {
          $geoNear: {
            near: { type: "Point", coordinates: [39.93, 32.85] },
            distanceField: 'distance',
            spherical: true,
            key: 'location.coordinates',
          },
        },
        {
          $match: {
            description: /lahmacun/i,
          },
        },
        {
          $sort: {
            distance: 1,
          },
        },
        {
          $limit: 5,
        },
      ]);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      console.log(nearbyRestaurants)
      res.end(JSON.stringify(nearbyRestaurants));
    } catch(error) {
      res.statusCode = 500;
      console.log(error)
      res.end(JSON.stringify({ error:'Internal Server Error' }));
    }
  } else if (req.method === 'GET' && pathname.startsWith('/api/latest-reviews-restaurants')){
    try{
      const usersLastReviews = await Restaurant.aggregate([
        {
          $unwind: '$reviews',
        },
        {
          $lookup: {
            from: 'users',
            localField: 'reviews.userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        {
          $unwind: '$user',
        },
        {
          $match: {
            'user.gender': 'Erkek',
          },
        },
        {
          $sort: {
            'reviews.createdAt': -1,
            'user.age': 1,
          },
        },
        {
          $group: {
            _id: '$user._id',
            userName: { $first: '$user.name' },
            userAge: { $first: '$user.age' },
            reviews: { $push: '$reviews' },
          },
        },
        {
          $sort: {
            userAge: 1,
          },
        },
        {
          $limit: 20,
        },
      ]);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      console.log(usersLastReviews)
      res.end(JSON.stringify(usersLastReviews));
    }catch(error){
      res.statusCode = 500;
      console.log(error)
      res.end(JSON.stringify({ error:'Internal Server Error' }));
    }
  }
  else {
    res.statusCode = 404;
  }
};

module.exports = handleRestaurantRoutes;