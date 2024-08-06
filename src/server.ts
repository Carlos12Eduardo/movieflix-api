import express from "express";
import { PrismaClient } from "@prisma/client";

const port = 3000;
const app = express();
const prisma = new PrismaClient();


app.get("/movies", async (_, res) =>{
    const movies = await prisma.movie.findMany({
        include:{
            genres: true,
            languages: true
        },
        orderBy:{
            title: "asc",
        }
    });
    res.json(movies);
});

app.listen(port, () => {
    console.log(`servidor em execução na ${port}`);
});