import { z } from "zod";
import { UserBookRating } from "./user-books.interfaces";

export const userBookUpdateSchema = z.object({
  // rating: z.union([
  //   z.literal(1), z.literal(2), z.literal(3), z.literal(4), z.literal(5),
  //   z.literal(6), z.literal(7), z.literal(8), z.literal(9), z.literal(10),
  // ]).nullable(),
  rating: z.nativeEnum(UserBookRating).nullable(),
  notes: z.string().nullable()
})