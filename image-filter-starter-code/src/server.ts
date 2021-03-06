import express from 'express';
import { Request, Response } from 'express';
import { NextFunction } from 'connect';
import bodyParser from 'body-parser';
import {filterImageFromURL, deleteLocalFiles, authenticate} from './util/util';

(async () => {

  // Init the Express application
  const app = express();

  // Set the network port
  const port = process.env.PORT || 8082;
  
  // Use the body parser middleware for post requests
  app.use(bodyParser.json());

  // CORS restriction
  app.use((req: Request, res: Response, next: NextFunction) => {
    res.header("Access-Control-Allow-Headers", "Content-Type, Authorization");
    next();
  })

  // @TODO1 IMPLEMENT A RESTFUL ENDPOINT
  // GET /filteredimage?image_url={{URL}} endpoint to filter an image from a public url.

  app.get("/filteredimage", /* authenticate,*/async (req: Request, res: Response) => {
    try {
      //1. validate the image_url query
      const query: string = req.query.image_url;
      if (query == "") {
        return res.status(400).send({ error: "image url is required" });
      }
      const validator = /(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g;
      if (!query.match(validator)) {
        return res.status(400).send({ error: "Invalid image url" });
      }

      //2. call filterImageFromURL(image_url) to filter the image
      const imagePath: string = await filterImageFromURL(query);

      //3. send the resulting file in the response
      res.status(200).sendFile(imagePath);

      //4. deletes any files on the server on finish of the response
      res.on('finish', () => {
        deleteLocalFiles([imagePath]);
      });
    } catch (error) {
      res.status(422).send({ error: "Error while processing image" });
      console.log(error);
    }
  });

  /**************************************************************************** */

  app.get( "/", async ( req, res ) => {
    res.send("try GET /filteredimage?image_url={{url}}")
  } );
  

  // Start the Server
  app.listen( port, () => {
      console.log( `server running http://localhost:${ port }` );
      console.log( `press CTRL+C to stop server` );
  } );
})();