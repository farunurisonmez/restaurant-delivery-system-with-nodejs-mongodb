const { parse } = require('url');
import parseRequestBody from '../utils/parseRequestBody'
import Order from '../models/order.model';
import Restaurant from '../models/restaurant.model';

const handleOrderRoutes = async (req:any, res:any) => {
    const { pathname, query } = parse(req.url, true);
    
    if (req.method === 'POST' && pathname === '/api/place-order') {
        try{
            const requestBody = await parseRequestBody(req);
            const createdOrder = await Order.create(requestBody);
            res.statusCode = 201;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(createdOrder));
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
    }
    else if (req.method === 'GET' && pathname === '/api/user-orders') {
        try{
            const userId = query.userId;
            const userOrders = await Order.find({
                userId,
                isDelivered: false,
                comment: { $exists: false },
            });
            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.end(JSON.stringify(userOrders));
        }
        catch(error) {
            res.statusCode = 500;
            res.end(JSON.stringify({ error: 'Internal Server Error' }));
        }
    }  
    else if (req.method === 'POST' && pathname === '/api/order-evaluation') {
        try{
            const requestBody: unknown = await parseRequestBody(req);

            const orderId = (requestBody as { orderId?: string }).orderId;

            if (!orderId) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'orderId eksik.'}));
            }

            const order = await Order.findById(orderId);

            if (!order || order.comment) {
                res.statusCode = 400;
                res.end(JSON.stringify({ error: 'Geçersiz sipariş ID veya bu siparişe zaten bir yorum yapılmış.'}));
            }
            
            if (!order) {
                res.statusCode = 404;
                return res.end(JSON.stringify({ error: 'Geçersiz sipariş ID veya bu siparişe zaten bir yorum yapılmış.'}));
            }

            // Kullanıcı ID'sini test için body'den alıyorum.
            const userId = query.userId;

            if (order.userId.toString() !== userId) {
                return res.status(403).json({ error: 'Bu işlemi gerçekleştirmek için yetkiniz yok.' });
            }

            const restaurantId = order.restaurantId;
            const restaurant = await Restaurant.findById(restaurantId);
            console.log(restaurant)
            if (!restaurant) {
                res.statusCode = 404;
                return res.end(JSON.stringify({ error: 'Restaurant bulunamadı'}));
            }

            const comment = (requestBody as { comment?: string }).comment;
            const rating = (requestBody as { rating: number }).rating;


            const currentTotalRating = restaurant.totalRating || 0;
            const currentOrderCount = restaurant.orderCount || 0;

            const newTotalRating = currentTotalRating + rating;

            const newOrderCount = currentOrderCount + 1;

            const newAverageRating = newTotalRating / newOrderCount;


            restaurant.totalRating = newTotalRating;
            restaurant.orderCount = newOrderCount;
            restaurant.averageRating = newAverageRating;

            const reviewData = {
                userId: order.userId,
                orderId: order._id,
                comment: comment || '',
                rating: rating,
            };

            restaurant.reviews.push(reviewData);

            order.comment = comment;
            order.rating = rating;

            await order.save();
            await restaurant.save();
           

            res.statusCode = 500;
            res.end(JSON.stringify({ message: 'Değerlendirme yapıldı.' }));
        }catch(error){
            res.statusCode = 500;
            console.log(error)
            res.end(JSON.stringify({ error: 'Internal Server Errorrr' }));
        }
    }
    else{
        res.statusCode = 404;
    }
}

module.exports = handleOrderRoutes;