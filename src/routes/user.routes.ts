const { parse } = require('url');
import User from '../models/user.model';
import ParseRequestBody from '../utils/parseRequestBody';

const handleRestaurantRoutes = async (req:any, res:any) => {

  const { pathname, query } = parse(req.url, true);

  if (req.method === 'GET' && pathname === '/api/users') {
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify({ message: 'Restaurant list endpoint' }));

  } else if (req.method === 'POST' && pathname === '/api/user') {
    try{
        const requestBody = await ParseRequestBody(req);
        const createdRestaurant = await User.create(requestBody);
        res.statusCode = 201;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify(createdRestaurant));
    }
    catch(error: any) {
        if (error.name === 'ValidationError') {
            res.statusCode = 400;
            res.setHeader('Content-Type', 'application/json');
            
            const errorMessages = Object.values(error.errors).map((error: any) => {
              return {
                path: error.path,
                message: error.message
              };
            });
          
            const formattedErrorMessage = JSON.stringify({ "ValidationErrors": errorMessages });
            
            res.end(formattedErrorMessage);
          } else {
            // Diğer hatalar
            res.statusCode = 500;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
          }
    }

  } else if (req.method === 'GET' && pathname.startsWith('/api/users/')) {
    const userId = pathname.split('/').pop();
    res.end(JSON.stringify({ message: `User details for user ID ${userId}` }));
  } else {
    res.statusCode = 404;
  }
};


module.exports = handleRestaurantRoutes;