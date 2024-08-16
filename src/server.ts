import express from "express";
import { PrismaClient } from "@prisma/client";
import swaggerUI from "swagger-ui-express";
import swaggerDocument from "../swagger.json";


const port = 3000;
const app = express();
const prisma = new PrismaClient();

app.use(express.json());

app.use("/api-docs", swaggerUI.serve, swaggerUI.setup(swaggerDocument));
app.get("/movies", async (_, res) => {
    const movies = await prisma.movie.findMany({
        include: {
            genres: true,
            languages: true
        },
        orderBy: {
            title: "asc",
        }
    });
    res.json(movies);
});

app.post("/movies", async (req, res) => {
    const { title, genre_id, language_id, oscar_count, release_date } = req.body;
    try {
        const movieWithSameTitle = await prisma.movie.findFirst({
            where: {
                title: {
                    equals: title,
                    mode: "insensitive"
                }
            }
        });
        if (movieWithSameTitle) {
            return res.status(409).send({ message: "já existe um filme cadastrado com esse título" });
        }

        await prisma.movie.create({
            data: {
                title: title,
                genre_id: genre_id,
                language_id: language_id,
                oscar_count: oscar_count,
                release_date: new Date(release_date)
            }
        });
        res.status(201).send();
    } catch (error) {
        return res.status(500).send({
            message: "Falha ao tentar cadastrar o filme.",
            error: error
        });
    }
});

app.put("/movies/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        const data = { ...req.body };
        data.release_date = data.release_date ? new Date(req.body.release_date) : undefined;

        const movie = await prisma.movie.findUnique({
            where: {
                id: id
            }
        });
        if (!movie) {
            return res.status(404).send({ message: "Filme não encontrado!" });
        }
        await prisma.movie.update({
            where: {
                id: id
            },
            data: data
        });
        res.status(200).send("filme atualizado com sucesso!");
    } catch (error) {
        return res.status(500).send({ message: "Falha ao atualizar o registro do filme", error: `${error}` });
    }
});

app.delete("/movies/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);

        const movie = await prisma.movie.findUnique({
            where: {
                id: id
            }
        });
        if (!movie) {
            return res.status(404).send({ message: "Filme não encontrado!" });
        }
        await prisma.movie.delete({
            where: {
                id: id
            }
        });

        res.status(200).send("Filme deletado com sucesso!");
    } catch (error) {
        return res.status(500).send({ message: "Erro ao tentar deletar o filme.", error: `${error}` });
    }
});

app.get("/movies/:genresName", async (req, res) => {
    try {
        const genres = req.params.genresName;
        const movieFilteredByGenres = await prisma.movie.findMany({
            include: {
                genres: true,
                languages: true
            },
            where: {
                genres: {
                    name: {
                        equals: genres,
                        mode: "insensitive"
                    }
                }
            }
        });
        res.status(200).send(movieFilteredByGenres);
    } catch (error) {
        res.status(500).send({ message: "Erro ao consultar Filmes por gênero" });
    }
})

app.listen(port, () => {
    console.log(`servidor em execução na ${port}`);
});