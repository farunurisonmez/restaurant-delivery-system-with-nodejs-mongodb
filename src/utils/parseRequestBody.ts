const ParseRequestBody = (req:any) => {
    return new Promise((resolve, reject) => {
      let body = '';

      req.on('data', (chunk:any) => {
      body += chunk.toString();
    });
  
      req.on('end', () => {
        try {
          const parsedBody = JSON.parse(body);
          resolve(parsedBody);
        } catch (error) {
          reject(error);
        }
      });
  
      req.on('error', (error:any) => {
        reject(error);
      });
    });
  };

export default ParseRequestBody ;