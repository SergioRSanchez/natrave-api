import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()


export const create = async ctx => {
  if (!ctx.headers.authorization) {
    ctx.status = 401
    return
  }
  const [type, token] = ctx.headers.authorization.split(" ")

  try {
    const data = jwt.verify(token, process.env.JWT_SECRET)

    if (!ctx.request.body.homeTeamScore < 0 && !ctx.request.body.awayTeamScore < 0) {
      ctx.status = 400
      return
    }

    const userId = data.sub
    const { gameId } = ctx.request.body
    const homeTeamScore = parseInt(ctx.request.body.homeTeamScore)

    //  Tentando fazer aparecer o zero
    // let homeTeamScore
    // if (ctx.request.body.homeTeamScore != 0) {
    //   homeTeamScore = parseInt(ctx.request.body.homeTeamScore)
    //   console.log(homeTeamScore)
    // } else {
    //   homeTeamScore = 0
    //   console.log(homeTeamScore)
    // }

    //  Tentando fazer aparecer o zero
    // const homeTeamScore = (ctx.request.body.homeTeamScore).map(x => x == 0 ? 0 : (parseInt(x) || x))

    const awayTeamScore = parseInt(ctx.request.body.awayTeamScore)

    try {
      const [hunch] = await prisma.hunch.findMany({
        where: { userId, gameId },
      })

      ctx.body = hunch
        ? await prisma.hunch.update({
          where: {
            id: hunch.id
          },
          data: {
            homeTeamScore,
            awayTeamScore
          }
        })
        : await prisma.hunch.create({
          data: {
            userId,
            gameId,
            homeTeamScore,
            awayTeamScore
          }
        })

    } catch (error) {
      console.log(error)
      ctx.body = error
      ctx.status = 500
    }
  } catch (error) {
    ctx.status = 401
    return
  }
}